const path = require('path');
const fs = require('fs');
const http = require('http');
const https = require('https');
const socket = require('socket.io');
const express = require('express');
const compression = require('compression');
const cors = require('cors');
const rimraf = require('rimraf');
const { getString } = require('./i18n');
const { explore } = require('./utils');
const logger = require('./logger');
const message = require('./message');
const sid = require('./sid');
const createApp = require('./createApp');

class Net {
  constructor(server, port, conf) {
    this.server = server;
    this.port = port;
    this.conf = conf;
  }
  start(callback, args) {
    const app = express(),
      conf = this.conf,
      sslKey = global.globalConfig.sslKey,
      sslCert = global.globalConfig.sslCert,
      sslPfx = global.globalConfig.sslPfx,
      sslPassphrase = global.globalConfig.sslPassphrase;
    let options = null;
    if (sslKey && sslCert) {
      options = {
        key: fs.readFileSync(sslKey),
        cert: fs.readFileSync(sslCert),
        passphrase: sslPassphrase
      };
    } else if (sslPfx) {
      options = {
        pfx: fs.readFileSync(sslPfx),
        passphrase: sslPassphrase
      };
    }
    let server = null;
    if (global.globalConfig.enableHttps && options !== null) {
      server = https.createServer(options, app);
    } else {
      server = http.createServer(app);
      global.globalConfig.enableHttps = false;
    }
    const io = socket(server);
    logger.trace("[{0}] " + getString("startNetService"), this.server.name);
    app.use(compression({
      filter: function () {
        return true;
      }
    }));
    app.use(cors());
    app.get(/^\/.*\.zip$/, function (req, res, next) {
      const p = path.join(conf.storageDir, decodeURI(req.path));
      res.attachment(encodeURI(path.basename(p)));
      const stream = fs.createReadStream(p);
      stream.pipe(res);
      stream.on("close", function () {
        // 递归删除⽬录所有⽂件
        rimraf.sync(path.dirname(p))
      })
    });
    sid.routine(app);
    app.use(express.urlencoded({ extended: false }));
    createApp(app, conf);
    const baseUrl = "/" + conf.urlPrefix;
    app.use(baseUrl, express.static(conf.clientDir));
    app.use(baseUrl + "custom", express.static(conf.customDir));
    app.use(baseUrl, express.static(path.join(conf.customDir, "previews")));
    app.use(baseUrl + conf.storagePrefix, express.static(conf.storageDir));
    app.use(/\/explore($|\/.*)/, function (req, res) {
      const result = req.baseUrl.match(reg);
      let storageDir = conf.storageDir;
      if (result[1]) {
        storageDir = path.join(storageDir, result[1])
      }
      try {
        const value = explore(storageDir);
        res.send(JSON.stringify(value))
      } catch (err) {
        res.send("Failed")
      }
    });
    server.listen(this.port, () => {
      callback && callback(args);
      this.server.emit("serviceOn", { server: this })
    });
    io.on("connection", socket => {
      logger.trace("[{0}] " + getString("newConnection"), this.server.name);
      socket.on("disconnect", () => {
        logger.trace("[{0}] " + getString("disconnect"), this.server.name)
      });
      message.registerCommand(socket);
      socket.server = this.server;
      this.server.emit("newConnection", socket);
    });
    this.server.on("fileChanged", (path, event) => {
      this.broadcast("fileChanged", { path, event })
    });
    this.http = server;
    this.io = io;
  }
  stop(callback, args) {
    this.http.close(function () {
      callback && callback(args)
    })
  }

  broadcast(eventName, args) {
    this.io.emit(eventName, args)
  }
}
module.exports = Net;
