const { format } = require('util');
const log4js = require("log4js");

log4js.configure({
  appenders: [{
    type: "console",
    category: "console",
    layout: { type: "messagePassThrough" }
  }]
});
const greens = ["\u001b[32m", "\n"],
  reds = ["\u001b[31m", "\n"],
  convert = function (args) {
    const prefix = args[0];
    if (args.length === 1) {
      return format(prefix);
    }
    return prefix.replace(/\{(\d+)\}/g, function (str, radix) {
      return format(args[parseInt(radix) + 1]);
    });
  };
module.exports = {
  enableTrace: true,
  enableDebug: false,
  trace: function (...rest) {
    const msg = convert(rest),
      logger = log4js.getLogger("console");
    logger.info(msg)
  },
  important: function (...rest) {
    const msg = convert(rest),
      logger = log4js.getLogger("console");
    logger.info(greens[0] + msg + greens[1])
  },
  error: function (...rest) {
    const msg = convert(rest),
      logger = log4js.getLogger("console");
    logger.error(reds[0] + msg + reds[1]);
    for (let i = 1; i < arguments.length; i++) {
      arguments[i] && arguments[i].stack && logger.error(arguments[i].stack)
    }
  },
  debug: function () {
  }
}
