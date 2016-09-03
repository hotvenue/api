'use strict';

const HotVenueTelegramBaseController = require('./_base');

const models = require('../../models');

class LocationController extends HotVenueTelegramBaseController {
  get routes() {
    return {
      [/^\/location$/]: 'locationHandler',
      [/^\/locations$/]: 'locationsHandler',
    };
  }

  locationHandler($) {
    models.location
      .findAll()
      .then((locations) => Promise.all(locations.map((location) => {
        const callbackData = `location ${location.id}`;

        $.waitForCallbackQuery(callbackData, () => {
          location
            .getVideos()
            .then((videos) => {
              $.sendMessage(`
${location.name}
- hashtag: ${location.hashtag}
- email: ${location.email}
- videos: ${videos.length}`);
            });
        });

        return {
          location,
          callback_data: callbackData,
        };
      })))
      .then((locationObjs) => {
        const keyboard = locationObjs.map((locationObj) => [{
          text: locationObj.location.name,
          callback_data: locationObj.callback_data,
        }]);

        $.sendMessage('Choose a location:', {
          reply_markup: JSON.stringify({
            inline_keyboard: keyboard,
          }),
        });
      });
  }

  locationsHandler($) {
    let msg = 'HotVenue locations:';

    models.location
      .findAll()
      .then((locations) => Promise.all(locations.map((location) => {
        const locationMsg = `- ${location.name}`;

        return location.getVideos()
          .then((videos) => `${locationMsg} (${videos.length})`);
      })))
      .then((locationMsgs) => {
        msg = `${msg}\n${locationMsgs.join('\n')}`;

        $.sendMessage(msg);
      });
  }
}

module.exports = LocationController;
