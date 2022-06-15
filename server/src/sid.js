const v4 = require('uuid').v4;

const config = {};
let time = 0;

function genSID() {
  genKey();
  var key = v4();
  config[key] = { time: Date.now() };
  return key;
}

function authSID(key) {
  const value = config[key];
  if (!value) return false;
  const time = value.time,
    now = Date.now();

  if (now - time > (global.globalConfig.sessionExpireTime || 600000)) {
    delete config[key];
    return false;
  } else {
    value.time = now;
    return true;
  }
}

function genKey() {
  const now = Date.now();
  if (now - time >= 30000) {
    time = now;
    const keys = Object.keys(config),
      length = keys.length;
    for (let i = 0; i < length; i++) {
      const key = keys[i];
      now - config[key].time > 600000 && delete config[key]
    }
  }
}

function createError(res) {
  res.status(404).send("Not Found.")
}

function handler(req, res) {
  const baseUrl = req.baseUrl,
    service = global.globalConfig ? global.globalConfig.SIDRequestService : null;
  if (baseUrl === service || baseUrl === "/" + service) {
    (function (ip) {
      if ("::1" === ip) return true;
      const result = ip.match(/\d+\.\d+\.\d+\.\d+/);
      if (!result) return false;
      if ("127.0.0.1" === (ip = result[0])) return true;
      const config = global.globalConfig;
      if (!config) return false;
      const whiteList = config.SIDServiceWhiteList;
      if (!whiteList) return false;
      let parsed = config.SIDServiceWhiteListParsed;
      if (!parsed) {
        let str = "AWESOME"
        const list = whiteList.split(","),
          arr = [];
        let length = list.length;
        for (let i = 0; i < length; i++) {
          const item = list[i].trim();
          if (item) {
            arr.push(item.replace(/\./g, "\\.")
              .replace(/\*/g, "[\\d\\.]*"));
          }
        }
        length = arr.length;
        if (length) {
          if (length === 1) {
            str = arr[0]
          } else {
            str = "(" + arr.join("|") + ")"
          }
        }
        parsed = config.SIDServiceWhiteListParsed = new RegExp("^" + str + "$")
      }
      return parsed.test(ip);
    }(req.ip)) ? createError(res) : res.send(genSID())
  }
  return true
}

global.SID = global.sid = genSID;

module.exports = {
  genSID,
  authSID,
  routine: function (app) {
    if (global.globalConfig && global.globalConfig.auth) {
      app.use("*", function (req, res, next) {
        if (/(^\/vs\/.*)/.test(req.baseUrl)) {
          next(req);
        } else if (!handler(req, res)) {
          function useAuth(req) {
            if (req.baseUrl.endsWith(".js")) return true;
            const query = req.query;
            if (!query) return false;
            const sid = query.sid;
            return !!sid && authSID(sid);
          }

          if (useAuth(req)) {
            createError(res);
          } else {
            next();
          }
        }
      });
    }
  }
}
