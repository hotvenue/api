'use strict';

const fs = require('fs');
const path = require('path');

const dataFolder = path.join(__dirname, '..', 'data');
const uploadFolder = path.join(dataFolder, 'upload');
const logFolder = path.join(dataFolder, 'log');
const tmpFolder = path.join(dataFolder, 'tmp');

function checkAndCreate(folder) {
  if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder);
  }
}

/**
 * Create the data directories if they don't exist
 */
checkAndCreate(dataFolder);
checkAndCreate(uploadFolder);
checkAndCreate(logFolder);
checkAndCreate(tmpFolder);

const config = {
  app: {
    url: 'http://api.hotvenueapp.com',

    extension: {
      video: '.mp4',
      preview: '.jpg',
      watermark: '.png',
      frame: '.png',
    },

    video: {
      maxLength: 10,
      size: [360, 360],
    },

    location: {
      frame: {
        isValid: /^image\//,
        sizes: {
          '1x': [768, 1024],
          '2x': [1536, 2048],
          pro: [2048, 2732],
        },
      },

      watermark: {
        isValid: '^image/{EXT}$', // Defined dynamically below
        sizes: {
          '1x': [768, 1024],
          '2x': [1536, 2048],
          pro: [2048, 2732],
          video1: [360, 360],
        },
      },

      checkboxes: {
        privateEvents: [{
          mandatory: true,
          name: 'save',
          text: 'We can save your video?',
        }, {
          mandatory: false,
          name: 'publish',
          text: 'We can publish your video?',
        }],

        publicEvents: [{
          mandatory: true,
          name: 'save',
          text: 'We can save your video?',
        }, {
          mandatory: false,
          name: 'publish',
          text: 'We can publish your video?',
        }],
      },
    },
  },

  folder: {
    data: dataFolder,
    upload: uploadFolder,
    log: logFolder,
    tmp: tmpFolder,
  },

  aws: {
    region: 'eu-west-1',

    s3: {
      bucket: 'hotvenue',
      link: 'https://s3-eu-west-1.amazonaws.com',

      folder: {
        video: {
          tmp: 'app/video/tmp-original',
          original: 'app/video/original',
          preview: 'app/video/preview',
          editedA: 'app/video/edited-A',
        },

        location: {
          frame: 'app/location/frame',
          tmpFrame: 'app/location/tmp-frame',
          watermark: 'app/location/watermark',
          tmpWatermark: 'app/location/tmp-watermark',
        },
      },
    },
  },

  log: {},

  redis: {
    prefix: 'hv:',
  },

  job: {
    kue: {
      redis: {
        prefix: 'q',
      },
    },

    app: {
      port: 3333,
    },
  },

  jobs: {
    autostart: false,

    maid: {
      delay: 60000,
    },
  },

  email: {
    from: ['HotVenue Video Booth <video@hotvenueapp.com>'],
    toName: 'Party people',

    events: 'events@hotvenueapp.com',
  },

  telegram: {
    enable: false,
    polling: true,
  },
};

config.app.location.watermark.isValid = new RegExp(
  config.app.location.watermark.isValid.replace('{EXT}',
    config.app.extension.watermark.replace('.', '')));

config.job.kue.redis.prefix = `${config.redis.prefix}${config.job.kue.redis.prefix}`;

module.exports = config;
