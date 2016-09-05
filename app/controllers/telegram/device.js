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
    Promise.all([
      models.location.findAll(),
      models.device.findAll(),
    ])
      .then(([locations, devices]) => {
        const keyboardDevices = devices.map((device) => {
          const callbackData = `device ${device.id}`;

          $.waitForCallbackQuery(callbackData, () => {
            let deviceMsg = `${device.name || device.identifierForVendor}`;
            const keyboardUpdate = locations.map((location) => {
              const deviceIdShort = device.id.split('-'[0]);
              const locationIdShort = location.id.split('-')[0];
              const callbackDataUpdate = `update device ${deviceIdShort} ${locationIdShort}`;

              $.waitForCallbackQuery(callbackDataUpdate, () => {
                device.locationId = location.id; // eslint-disable-line no-param-reassign

                return device.save()
                  .then(() => $.sendMessage('Location Changed!'));
              });

              return [{
                text: location.name,
                callback_data: callbackDataUpdate,
              }];
            });

            const callbackDataUpdateLocation = `update device ${device.id}`;

            $.waitForCallbackQuery(callbackDataUpdateLocation, () => {
              $.sendMessage('Choose the new location:', {
                reply_markup: JSON.stringify({
                  inline_keyboard: keyboardUpdate,
                }),
              });
            });

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
                $.sendMessage(deviceMsg, {
                  reply_markup: JSON.stringify({
                    inline_keyboard: [[{
                      text: 'Update device\'s location',
                      callback_data: callbackDataUpdateLocation,
                    }]],
                  }),
                });
              });
          });

          return [{
            text: device.name || device.identifierForVendor,
            callback_data: callbackData,
          }];
        });

        $.sendMessage('Choose a device:', {
          reply_markup: JSON.stringify({
            inline_keyboard: keyboardDevices,
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
