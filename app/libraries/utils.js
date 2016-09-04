'use strict';

const fs = require('fs');
const crypto = require('crypto');
const EpilogueError = require('epilogue').Errors.EpilogueError;

const log = require('./log');
const cloud = require('./cloud');

module.exports = {
  /**
   * Upload a file to the cloud
   *
   * @param {string} what - What I'm trying to upload: 'location frame image', 'video'
   * @param {string} oldPath - The path where the file is right now
   * @param {string} newPathLocal - The path where the file must be moved during tests
   * @param {string} newPathCloud - The path (URI) where the file must be uploaded
   *
   * @return {Promise}
   */
  uploadFile({ what, oldPath, newPathLocal, newPathCloud }) {
    if (process.env.NODE_ENV === 'test') {
      try {
        fs.renameSync(oldPath, newPathLocal);
      } catch (err) {
        log.debug(`Error while renaming ${what}`);
        log.error(err);

        throw new EpilogueError(500);
      }

      return Promise.resolve(true);
    }

    return cloud.upload(oldPath, newPathCloud)
      .then(() => {
        fs.unlinkSync(oldPath);
      })
      .catch((err) => {
        log.debug(`Error while uploading ${what}`);
        log.error(err);

        throw new EpilogueError(500);
      });
  },

  hashFile(path, algorithm = 'sha512') {
    const shasum = crypto.createHash(algorithm);

    return new Promise((resolve, reject) => {
      const stream = fs.createReadStream(path);

      stream.on('data', (data) => {
        shasum.update(data);
      });

      stream.on('end', () => {
        resolve(shasum.digest('hex'));
      });

      stream.on('error', (err) => {
        reject(err);
      });
    });
  },
};
