'use strict';

module.exports = {
  help(ctx) {
    return ctx.reply(`
Commands:
- /video - retrieves some video stats

- /locations - retrieves the list of the locations, with some stats
- /location - more in deepth stats of a single location

- /devices - retrieves the list of devices, with some stats
- /device - more in depth stats of a single device`);
  },
};
