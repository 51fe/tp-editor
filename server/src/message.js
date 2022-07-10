const { getString } = require('./i18n');
const logger = require('./logger');
const sid = require('./sid');
const commands = require('./commands');

const map = {},
  handler = function (socket, eventName) {
    socket.on(eventName, function (count, dir, data) {
      executeCommand(socket, eventName, count, dir, data)
    })
  },
  executeCommand = function (...rest) {
    let [socket, key, count, dir, data] = rest;
    if (typeof socket !== "string") {
      if (global.globalConfig && global.globalConfig.auth) {
        if (typeof data !== "object" || !sid.authSID(data.sid)) {
          sendMessage(socket, "operationDone", count, "Unauthorized agent")
        }
      }
    }
    const command = commands[key];
    try {
      map[key] || logger.trace("----- {0} ----", getString(key));
      const getData = command.call(command, socket, count, dir, data => {
        if (count >= 0 && socket && data) {
          sendMessage(socket, "operationDone", count, data);
        }
      });
      if (count >= 0 && socket && getData) {
        sendMessage(socket, "operationDone", count, getData);
      }
    } catch (err) {
      logger.error("cmd : {0}, exception : {1}", key, err)
    }
  },

  sendMessage = function (socket, eventName, count, data) {
    if (socket) {
      socket.emit(eventName, count, data)
    }
  };

module.exports = {
  registerCommand: function (socket) {
    for (const cmd in commands) {
      handler(socket, cmd)
    }
  },
  executeCommand,
  sendMessage,
  enableTrace: function (key, enabled) {
    if (enabled) {
      delete map[key];
    } else {
      map[key] = true;
    }
  }
}
