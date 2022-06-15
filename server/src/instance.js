const path = require('path');
const { toAbsolute } = require('./utils');
const Main = require('./Server');

const rootDir = path.join(path.normalize(__dirname), "/");

module.exports = {
  create: function (config) {
    var name = config.name,
      main = new Main({
        port: config.port,
        autoOpen: "true" === config.autoOpen,
        is3D: "true" === config.is3D,
        name: name,
        customDir: toAbsolute(config.customDir, rootDir),
        clientDir: toAbsolute(config.clientDir, rootDir),
        storageDir: toAbsolute(config.storageDir, rootDir),
        storagePrefix: config.storagePrefix,
        urlPrefix: config.urlPrefix
      });
    main.start();
    var sections = global.sections;
    global[name] = main;
    sections[name] = config;
    global.sections = sections;
  },
  delete: function (name) {
    var instance = global[name];
    if (instance && typeof instance.stop === "function") {
      const sections = global.sections;
      delete sections[name];
      global.sections = sections;
      instance.stop();
    }
  }
}
