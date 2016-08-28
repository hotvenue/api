'use strict';

const fs = require('fs');
const EpilogueError = require('epilogue').Errors.EpilogueError;

const log = require('./log');
const cloud = require('./cloud');

module.exports = {
  /**
   * Upload a file to the cloud
   *
   * @param {string} what - What I'm trying to upload: 'location frame image', 'video'
   * @param {boolean} when - A boolean indicating if I can upload the file
   * @param {string} oldPath - The path where the file is right now
   * @param {string} newPathLocal - The path where the file must be moved during tests
   * @param {string} newPathCloud - The path (URI) where the file must be uploaded
   *
   * @return {Promise}
   */
  uploadFile({ what, when, oldPath, newPathLocal, newPathCloud }) {
    if (!when) {
      throw new EpilogueError(409, `the ${what} you are trying to upload is not valid`);
    }

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
      });
  },
};
