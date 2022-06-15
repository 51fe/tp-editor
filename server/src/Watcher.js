const fs = require('fs');
const path = require('path');
const chokidar = require('chokidar');
const utils = require('./utils');

class Watcher {
  constructor(server, config) {
    this.server = server;
    this.rootPath = config.storageDir
  }

  start() {
    const isWin32 = process.platform === "win32";
    if (isWin32 || "darwin" === process.platform) {
      fs.watch(this.rootPath, {
        persistent: true,
        recursive: true
      }, (eventType, filename) => {
        if (isWin32) {
          if (!filename) {
            filename = "displays";
          }
          filename = filename.replace(/\\/g, "/")
        }
        this.handleFileEvent(filename, eventType);
      })
    } else {
      chokidar.watch(this.rootPath, {
        usePolling: false,
        ignoreInitial: true
      }).on("all", (event, p) => {
        p = path.relative(this.rootPath, p);
        this.handleFileEvent(p, event);
      });
    }
  }

  handleFileEvent(p, event) {
    if (!utils.isHidden(p)) {
      utils.toUnixPath(p);
      this.server.emit("fileChanged", p, event);
      global.fileVersion || (global.fileVersion = []);
      global.fileVersion[path.dirname(p)] = String(Date.now())
    }
  }

  stop() {
  }
}
module.exports = Watcher;