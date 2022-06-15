const { EventEmitter } = require('events');
const { getString } = require('./i18n');
const Net = require('./Net');
const Watcher = require('./Watcher');
const logger = require('./logger');
const execFile = require('./execFile');
const sid = require('./sid');

class Server extends EventEmitter {
  constructor(config) {
    super(config)
    this.init(config);
  }

  init(config) {
    const prefix = this.name = config.name + " >> " + config.port;
    this.config = config;
    EventEmitter.call(this);
    logger.trace("[{0}] " + getString("preInit"), prefix);
    this.emit(this.state = "preInit");
    let urlPrefix = config.urlPrefix;
    if (urlPrefix) {
      urlPrefix = urlPrefix.replace(/(^\s*\/*|\/*\s*$)/g, "");
      urlPrefix = config.urlPrefix = urlPrefix.length ? urlPrefix + "/" : ""
    } else {
      urlPrefix = config.urlPrefix = "";
    }
    this.net = new Net(this, config.port, {
      customDir: config.customDir,
      clientDir: config.clientDir,
      storageDir: config.storageDir,
      storagePrefix: config.storagePrefix,
      urlPrefix: config.urlPrefix
    });
    this.watcher = new Watcher(this, config),
      logger.trace("[{0}] " + getString("postInit"), prefix);
    this.emit(this.state = "postInit");
  }

  start() {
    logger.trace("[{0}] " + getString("startServer"), this.name);
    this.net.start();
    this.watcher.start();
    this.emit(this.state = "booted");
    if (this.config.autoOpen && !process.versions.electron) {
      const protocol = global.globalConfig.enableHttps ? "https" : "http";
      let url = protocol + "://localhost:" + this.config.port + "/" + this.config.urlPrefix;
      if (global.globalConfig && global.globalConfig.auth) {
        url += "index.html?sid=" + sid.genSID();
      } else if (this.config.is3D) {
        url += "index3d.html";
      }
      execFile(url);
    }
  }

  stop() {
    logger.trace("[{0}] " + getString("stopServer"), this.name);
    this.emit(this.state = "preDestruct");
    this.net.stop();
    this.watcher.stop();
    this.emit(this.state = "postDestruct");
  }
}

module.exports = Server;
