'use strict';

module.exports = {
  startHandler(bot) {
    return (msg, match) => {
      const chatId = msg.chat.id;
      const password = match[1];

      if (typeof password === 'undefined') {
        bot.sendMessage(chatId, 'You need to specity a password!');

        return;
      }

      if (password !== 'HotVenue#2016') {
        bot.sendMessage(chatId, 'Ops, wrong password');

        return;
      }

      bot.sendMessage(chatId, 'Yeee, right password!!');
    };
  },
};
