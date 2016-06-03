'use strict';

const fs = require('fs');
const path = require('path');
const Ffmpeg = require('fluent-ffmpeg');

const common = require('../common');
const video = require('../../app/libraries/video');

describe('Ffmpeg', () => {
  it('should loop the video', (done) => {
    const inputVideoPath = path.join(__dirname, '../assets/sample-video.mp4');
    const outputVideoPath = inputVideoPath.replace('sample', 'sample2');
    const times = 4;

    video.repeat(inputVideoPath, outputVideoPath, times, () => {
      Ffmpeg.ffprobe(inputVideoPath, (errIn, metadataIn) => {
        if (errIn) {
          done(errIn);

          return;
        }

        const inputDuration = metadataIn.format.duration;

        Ffmpeg.ffprobe(outputVideoPath, (errOut, metadataOut) => {
          if (errOut) {
            done(errOut);

            return;
          }

          const outputDuration = metadataOut.format.duration;

          common.expect(Math.round(outputDuration)).to.equal(Math.round(inputDuration * times));

          fs.unlink(outputVideoPath, done);
        });
      });
    });
  });
});
