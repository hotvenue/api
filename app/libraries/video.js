'use strict';

const config = require('config').get('ffmpeg');
const Ffmpeg = require('fluent-ffmpeg');

Ffmpeg.setFfmpegPath(config.path.ffmpeg);
Ffmpeg.setFfprobePath(config.path.ffprobe);

/* FFPROBE output:

{
  streams: [{
    index: 0,
    codec_name: 'h264',
    codec_long_name: 'H.264 / AVC / MPEG-4 AVC / MPEG-4 part 10',
    profile: 'Main',
    codec_type: 'video',
    codec_time_base: '1/50',
    codec_tag_string: 'avc1',
    codec_tag: '0x31637661',
    width: 1280,
    height: 720,
    coded_width: 1280,
    coded_height: 720,
    has_b_frames: 0,
    sample_aspect_ratio: '1:1',
    display_aspect_ratio: '16:9',
    pix_fmt: 'yuv420p',
    level: 31,
    color_range: 'N/A',
    color_space: 'unknown',
    color_transfer: 'unknown',
    color_primaries: 'unknown',
    chroma_location: 'left',
    timecode: 'N/A',
    refs: 1,
    is_avc: 'true',
    nal_length_size: 4,
    id: 'N/A',
    r_frame_rate: '25/1',
    avg_frame_rate: '25/1',
    time_base: '1/12800',
    start_pts: 0,
    start_time: 0,
    duration_ts: 67584,
    duration: 5.28,
    bit_rate: 1205959,
    max_bit_rate: 'N/A',
    bits_per_raw_sample: 8,
    nb_frames: 132,
    nb_read_frames: 'N/A',
    nb_read_packets: 'N/A',
    tags: [Object],
    disposition: [Object]
  }, {
    index: 1,
    codec_name: 'aac',
    codec_long_name: 'AAC (Advanced Audio Coding)',
    profile: 'LC',
    codec_type: 'audio',
    codec_time_base: '1/48000',
    codec_tag_string: 'mp4a',
    codec_tag: '0x6134706d',
    sample_fmt: 'fltp',
    sample_rate: 48000,
    channels: 6,
    channel_layout: 5.1,
    bits_per_sample: 0,
    id: 'N/A',
    r_frame_rate: '0/0',
    avg_frame_rate: '0/0',
    time_base: '1/48000',
    start_pts: 0,
    start_time: 0,
    duration_ts: 254976,
    duration: 5.312,
    bit_rate: 384828,
    max_bit_rate: 'N/A',
    bits_per_raw_sample: 'N/A',
    nb_frames: 249,
    nb_read_frames: 'N/A',
    nb_read_packets: 'N/A',
    tags: [Object],
    disposition: [Object]
  }],
  format: {
    filename: 'C:\\Users\\niccolo.olivieri\\.........\\sample-video.mp4',
    nb_streams: 2,
    nb_programs: 0,
    format_name: 'mov,mp4,m4a,3gp,3g2,mj2',
    format_long_name: 'QuickTime / MOV',
    start_time: 0,
    duration: 5.312,
    size: 1055736,
    bit_rate: 1589963,
    probe_score: 100,
    tags: {
      major_brand: 'isom',
      minor_version: '512',
      compatible_brands: 'isomiso2avc1mp41',
      creation_time: '1970-01-01 00:00:00',
      encoder: 'Lavf53.24.2'
    }
  },
  chapters: []
}

 'overlay=5:H-h-5:format=rgb,format=yuv420p',

 */

module.exports = {
  loop(videoInput, videoOutput, times, done) {
    const videoCmd = new Ffmpeg();

    for (let i = 0; i < times; ++i) {
      videoCmd.input(videoInput);
    }

    videoCmd
      .complexFilter([
        `concat=n=${times}:v=1:a=1`,
      ])
      .output(videoOutput)
      .on('start', (command) => {
        console.log(command);
      })
      .on('error', done)
      .on('end', done)
      .run();
  },
};
