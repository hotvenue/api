'use strict';

const HotVenueTelegramBaseController = require('./_base');

const models = require('../../models');

class DeviceController extends HotVenueTelegramBaseController {
  get routes() {
    return {
      [/^\/device$/]: 'deviceHandler',
      [/^\/devices$/]: 'devicesHandler',
    };
  }

  deviceHandler($) {
    models.device
      .findAll()
      .then((devices) => Promise.all(devices.map((device) => {
        const callbackData = `device ${device.id}`;

        $.waitForCallbackQuery(callbackData, () => {
          let deviceMsg = `${device.name || device.identifierForVendor}`;

          Promise.resolve()
            .then(() => device.getLocation())
            .then((location) => {
              deviceMsg += `\n- location: ${location.name}`;
            })
            .then(() => device.getVideos())
            .then((videos) => {
              deviceMsg += `\n- videos: ${videos.length}`;
            })
            .then(() => {
              $.sendMessage(deviceMsg);
            });
        });

        return {
          device,
          callback_data: callbackData,
        };
      })))
      .then((deviceObjs) => {
        const keyboard = deviceObjs.map((deviceObj) => [{
          text: deviceObj.device.name || deviceObj.device.identifierForVendor,
          callback_data: deviceObj.callback_data,
        }]);

        $.sendMessage('Choose a device:', {
          reply_markup: JSON.stringify({
            inline_keyboard: keyboard,
          }),
        });
      });
  }

  devicesHandler($) {
    let msg = 'HotVenue devices:';

    models.device
      .findAll()
      .then((devices) => Promise.all(devices.map((device) => {
        const deviceMsg = `- ${device.name || device.identifierForVendor}`;

        return device.getLocation()
          .then((location) => `${deviceMsg} @ ${location ? location.name : 'no location'}`);
      })))
      .then((deviceMsgs) => {
        msg = `${msg}\n${deviceMsgs.join('\n')}`;

        $.sendMessage(msg);
      });
  }
}

module.exports = DeviceController;
