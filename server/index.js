const path = require('path');
const readConfig = require('./src/readConfig')
const repl = require('./src/repl');
const { setLanguage } = require('./src/i18n');
const { toAbsolute } = require('./src/utils');
const logger = require('./src/logger');
const Server = require('./src/Server');

const rootDir = path.join(path.normalize(__dirname), "./"),
  config = readConfig(path.join(rootDir, "config.ini"));
global.globalConfig = config.global;
config.global && config.global.locale && setLanguage(config.global.locale);

process.on("uncaughtException", function (error) {
  if (!["ECONNRESET", "EPIPE"].includes(error.code)) {
    logger.error("Caught exception: ", error);
  }
});
const sections = {};
for (const key in config) {
  if (key !== "global") {
    const value = config[key];
    const server = new Server({
      port: value.port,
      autoOpen: value.autoOpen,
      is3D: value.is3D,
      name: key,
      customDir: toAbsolute(value.customDir, rootDir),
      clientDir: toAbsolute(value.clientDir, rootDir),
      storageDir: toAbsolute(value.storageDir, rootDir),
      storagePrefix: value.storagePrefix,
      urlPrefix: value.urlPrefix
    });
    server.start();
    global[key] = server;
    sections[key] = value;
  }
}

global.sections = sections;
if (config.global.repl) {
  config.global.repl && repl.on();
}
