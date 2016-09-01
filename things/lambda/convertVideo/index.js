'use strict';

process.env.PATH += `:${process.env.LAMBDA_TASK_ROOT}`;

const fs = require('fs');
const os = require('os');
const aws = require('aws-sdk');
const path = require('path');
const sharp = require('sharp'); // eslint-disable-line import/no-unresolved
const config = require('config');
const childProcess = require('child_process');

const tmpDir = process.env.TEMP || os.tmpdir();

const configApp = config.get('app');
const configAws = config.get('aws');

const ffprobe = process.env.NODE_ENV === 'test' ?
  'C:\\Program Files\\ffmpeg\\bin\\ffprobe.exe' : 'ffprobe';
const ffmpeg = process.env.NODE_ENV === 'test' ?
  'C:\\Program Files\\ffmpeg\\bin\\ffmpeg.exe' : 'ffmpeg';

let s3;

const uuidRegex = '[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}';

function validateVideoFile(source) {
  const filenameRegex = new RegExp(`${uuidRegex}_${uuidRegex}\.[a-z]+`);
  const filename = path.basename(source.Key);

  if (!filename.match(filenameRegex)) {
    throw new Error('Invalid filename');
  }

  return true;
}

function validateImageFile(source, ext) {
  const filenameRegex = new RegExp(`${uuidRegex}(-thanks)?\\${ext}`);
  const filename = path.basename(source.Key);

  if (!filename.match(filenameRegex)) {
    throw new Error('Invalid filename');
  }

  return true;
}

function getVideoId(source) {
  return path.basename(source.Key).split('.')[0].split('_')[0];
}

function getLocationIdFromVideo(source) {
  return path.basename(source.Key).split('.')[0].split('_')[1];
}

function getLocationIdFromImage(source) {
  return path.basename(source.Key).split('.')[0];
}

function download(source, destination) {
  return s3
    .getObject(source)
    .promise()
    .then((data) => {
      if (destination) {
        fs.writeFileSync(destination, data.Body);
      }

      return data.Body;
    });
}

function upload(source, destination) {
  let body = source;

  if (typeof body === 'string') {
    body = fs.readFileSync(source);
  }

  return s3
    .putObject({
      Body: body,
      Key: destination,
    })
    .promise();
}

function deleteFile(source) {
  return s3
    .deleteObject(source)
    .promise();
}

function doFfprobe(filename) {
  const args = [
    '-v', 'quiet',
    '-print_format', 'json',
    '-show_format',
    // '-show_streams',
    '-i', filename,
  ];

  const options = {
    cwd: tmpDir,
  };

  return new Promise((resolve, reject) => {
    childProcess
      .execFile(ffprobe, args, options, (err, stdout) => {
        if (err) {
          reject(err);

          return;
        }

        console.log('FFProbe done!');

        resolve(JSON.parse(stdout));
      })
      .on('error', reject);
  });
}

function doFfmpegA(original, watermark, video) {
  const ext = path.extname(original);
  const tmpVideo1 = path.join(tmpDir, `video-tmp-1${ext}`);

  const args1 = [
    '-i', original,
    '-i', original,
    '-i', original,
    '-filter_complex', 'concat=n=3:v=1:a=1',
    '-y', tmpVideo1,
  ];

  const args2 = [
    '-i', tmpVideo1,
    '-i', watermark,
    '-filter_complex', 'overlay=0:H-h-0',
    '-an',
    '-y', video,
  ];

  const options = {
    cwd: tmpDir,
  };

  return Promise.resolve()
    .then(() => { console.log('First step'); })
    .then(() => new Promise((resolve, reject) => {
      childProcess
        .execFile(ffmpeg, args1, options, (err, stdout, stderr) => {
          if (err) {
            reject(err);

            return;
          }

          console.log(stdout);
          console.log(stderr);

          resolve();
        });
    }))
    .then(() => { console.log('Second step'); })
    .then(() => new Promise((resolve, reject) => {
      childProcess
        .execFile(ffmpeg, args2, options, (err, stdout, stderr) => {
          if (err) {
            reject(err);

            return;
          }

          console.log(stdout);
          console.log(stderr);

          resolve();
        });
    }));
}

function doThumbnail(video, thumbnail) {
  const args = [
    '-ss', '0',
    '-i', video,
    '-filter_complex', 'split=1[screen0]',
    '-vframes', '1',
    '-map', '[screen0]',
    '-y', thumbnail,
  ];

  const options = {
    cwd: tmpDir,
  };

  return new Promise((resolve, reject) => {
    childProcess
      .execFile(ffmpeg, args, options)
      .on('message', (msg) => { console.log(msg); })
      .on('error', reject)
      .on('close', resolve);
  });
}

function resizeImage(source, destination, size) {
  const sizeWidth = size[0];
  const sizeHeight = size[1];
  const sizeRatio = sizeWidth / sizeHeight;

  const image = sharp(source);

  return image
    .metadata()
    .then((metadata) => {
      const ratio = metadata.width / metadata.height;

      let resize;

      if (ratio > sizeRatio) {
        resize = image.resize(sizeWidth);
      } else {
        resize = image.resize(null, sizeHeight);
      }

      return resize.toFile(destination);
    });
}

function validateVideoDuration(metadata) {
  const duration = parseFloat(metadata.format.duration);

  if (duration > configApp.video.maxLength) {
    throw new Error('Video too long');
  }

  return true;
}

function handlerVideo(event, context, done) {
  const record = event.Records[0];
  const s3Event = record.s3;
  const source = {
    Bucket: s3Event.bucket.name,
    Key: s3Event.object.key,
  };

  const videoId = getVideoId(source);
  const locationId = getLocationIdFromVideo(source);

  const ext = path.extname(source.Key);

  const ext2beVideo = configApp.extension.video;
  const extWatermark = configApp.extension.watermark;
  const ext2beImage = configApp.extension.preview;

  const tmpOriginal = path.join(tmpDir, `original${ext}`);
  const tmpWatermark = path.join(tmpDir, `watermark${extWatermark}`);
  const tmpVideo = path.join(tmpDir, `video${ext2beVideo}`);
  const tmpThumbnail = path.join(tmpDir, `thumbnail${ext2beImage}`);

  return Promise.resolve()
    .then(() => validateVideoFile(source))
    .then(() => { console.log('File is valid!'); })
    .then(() => download(source, tmpOriginal))
    .then(() => { console.log('Video downloaded!'); })
    .then(() => doFfprobe(tmpOriginal))
    .then((metadata) => validateVideoDuration(metadata))
    .then(() => { console.log('File has a valid duration!'); })
    .then(() => upload(tmpOriginal,
      `${configAws.s3.folder.video.original}/${videoId}${ext2beVideo}`))
    .then(() => { console.log('Original video uploaded!'); })
    .then(() => download({
      Bucket: s3Event.bucket.name,
      Key: `${configAws.s3.folder.location.watermark}/${locationId}${extWatermark}`,
    }, tmpWatermark))
    .then(() => { console.log('Watermark downloaded!'); })
    .then(() => doFfmpegA(tmpOriginal, tmpWatermark, tmpVideo))
    .then(() => { console.log('Video "A" created!'); })
    .then(() => doThumbnail(tmpVideo, tmpThumbnail))
    .then(() => { console.log('Thumbnail created!'); })
    .then(() => upload(tmpVideo,
      `${configAws.s3.folder.video.editedA}/${videoId}${ext2beVideo}`))
    .then(() => { console.log('Video uploaded!'); })
    .then(() => upload(tmpThumbnail,
      `${configAws.s3.folder.video.preview}/${videoId}${ext2beImage}`))
    .then(() => { console.log('Thumbnail uploaded!'); })
    .then(() => deleteFile(source))
    .then(() => { console.log('Original video deleted!'); })
    .then(() => done())
    .catch((err) => { console.error(err); });
}

function handlerImage(what, event, context, done) {
  const record = event.Records[0];
  const s3Event = record.s3;
  const source = {
    Bucket: s3Event.bucket.name,
    Key: s3Event.object.key,
  };

  const id = getLocationIdFromImage(source);
  const ext = path.extname(source.Key);
  const ext2be = configApp.extension[what];

  const sizes = configApp.location[what].sizes;
  const sizeKeys = Object.keys(sizes);

  const tmpOriginal = path.join(tmpDir, `original${ext}`);
  const tmpImage = {};
  sizeKeys.forEach((sizeKey) => {
    tmpImage[sizeKey] = path.join(tmpDir, `image${sizeKey}${ext2be}`);
  });

  return Promise.resolve()
    .then(() => validateImageFile(source, ext))
    .then(() => { console.log('File is valid!'); })
    .then(() => download(source, tmpOriginal))
    .then(() => { console.log('Image downloaded!'); })
    .then(() => Promise.all(sizeKeys.map((sizeKey) =>
      resizeImage(tmpOriginal, tmpImage[sizeKey], sizes[sizeKey]))))
    .then(() => { console.log('Image resized!'); })
    .then(() => Promise.all(sizeKeys.map((sizeKey) =>
      upload(tmpImage[sizeKey],
        `${configAws.s3.folder.location[what]}/${id}@${sizeKey}${ext2be}`))))
    .then(() => { console.log('Images uploaded!'); })
    .then(() => upload(tmpOriginal, `${configAws.s3.folder.location[what]}/${id}${ext}`))
    .then(() => { console.log('Original image uploaded!'); })
    .then(() => deleteFile(source))
    .then(() => { console.log('Original image deleted!'); })
    .then(() => done())
    .catch((err) => { console.error(err); });
}

function handlerFrame(event, context, done) {
  return handlerImage('frame', event, context, done);
}

function handlerWatermark(event, context, done) {
  return handlerImage('watermark', event, context, done);
}

exports.handler = (event, context, done) => {
  const record = event.Records[0];
  const s3Event = record.s3;
  const key = s3Event.object.key;

  const folder = path.dirname(key);
  const handlerSwitch = {};

  handlerSwitch[configAws.s3.folder.video.tmp] = handlerVideo;
  handlerSwitch[configAws.s3.folder.location.tmpFrame] = handlerFrame;
  handlerSwitch[configAws.s3.folder.location.tmpWatermark] = handlerWatermark;

  s3 = new aws.S3({
    params: {
      region: record.awsRegion,
      Bucket: s3Event.bucket.name,
    },

    signatureVersion: 'v4',
  });

  if (typeof handlerSwitch[folder] === 'undefined') {
    return;
  }

  console.log(`Starting ${handlerSwitch[folder].name}`);
  handlerSwitch[folder](event, context, done);
};
