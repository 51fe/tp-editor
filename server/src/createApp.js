const fs = require('fs');
const path = require('path');
const rimraf = require('rimraf');
const multipartMiddleware = require("connect-multiparty")();
const { explore, importZip, ensureDirSync, isPredefined, exportSource,
  moveSourceFile, pasteFile, createZip } = require('./utils');
const execFile = require('./execFile');
const logger = require('./logger');
const instance = require('./instance');
const base64Reg = /^\s*data:([a-z]+\/[a-z0-9-+.]+(;[a-z-]+=[a-z0-9-]+)?)?(;base64)?,/i,
  zipReg = /\.zip$/i;

function createApp(app, config) {
  const storageDir = config.storageDir;
  app.get("/api/explore/:dir", function (req, res) {
    const dir = req.params.dir;
    let p = storageDir
    try {
      if (dir) {
        p = path.join(storageDir, dir)
      }
      const value = explore(p);
      res.end(JSON.stringify(value));
    } catch (err) {
      res.end();
    }
  });

  app.post("/api/export", multipartMiddleware, function (req, res) {
    const body = req.body;
    if (body) {
      const src = body.dir.split(","),
        u = exportSource(config, src),
        storageDir1 = storageDir,
        tempName = String((new Date).getTime()),
        p = path.join(storageDir1, "/temp/", tempName),
        fileName = u.zipFileName || "package";
      if (!fs.existsSync(p)) {
        ensureDirSync(p);
      }
      res.attachment(encodeURI(fileName) + ".zip");
      createZip(config, u.paths, res)
    }
  });

  app.post("/api/import", multipartMiddleware, function (req, res) {
    const body = req.body;
    if (body) {
      const storageDir = storageDir,
        customDir = config.customDir,
        p = path.join(storageDir, "/temp/", body.path);
      if (body.move) {
        moveSourceFile(storageDir, customDir, p);
      }
      rimraf.sync(p);
    }
    res.send(true);
  });
  app.get("/api/locate", function (req, res) {
    const dir = req.query.dir;
    if (dir) {
      const p = path.join(storageDir, dir);
      execFile(p);
    }
    res.end();
  });
  app.post("/api/mkdir", multipartMiddleware, function (req, res) {
    const body = req.body;
    if (body && body.path) {
      const p = path.join(storageDir, body.path);
      ensureDirSync(p);
      res.send(true);
      return;
    }
    res.send(false);
  });
  app.get("/api/open", function (req, res) {
    const url = req.query.url;
    if (url) {
      const url = path.join(storageDir, url);
      execFile(url);
    }
    res.end();
  });

  app.post("/api/paste", multipartMiddleware, function (req, res) {
    const body = req.body,
      fileList = body.fileList;
    if (Array.isArray(fileList)) {
      pasteFile(storageDir, fileList.split(","), body.destDir);
      res.send(true);
    } else {
      res.send(false);
    }
  });

  app.post("/api/remove", multipartMiddleware, function (req, res) {
    const body = req.body;
    if (body) {
      const p = path.join(storageDir, body.path);
      if (!fs.existsSync(p)) {
        res.send(true);
        return;
      }
      if (isPredefined(body.path)) {
        res.send(false);
        return;
      }
      rimraf.sync(p);
    }
    res.send(true);
  });

  app.post("/api/rename", multipartMiddleware, function (req, res) {
    const body = req.body;
    if (body) {
      const oldPath = path.join(storageDir, body.oldPath),
        newPath = path.join(storageDir, body.newPath),
        createError = function (err) {
          logger.trace(err);
          res.send(false);
        };
      if (!(fs.existsSync(oldPath))) {
        return createError(oldPath + " does not exist");
      }
      if (isPredefined(body.oldPath)) {
        return createError("Source is predefined, cannot be renamed");
      }
      if (isPredefined(body.newPath)) {
        return createError("Target is predefined, cannot be renamed");
      }
      try {
        fs.renameSync(oldPath, newPath);
      } catch (e) {
        return createError("Rename failed, detail: " + e)
      }
      res.send(true);
    } else {
      res.send(false);
    }
  });

  app.post("/api/source", multipartMiddleware, (function (req, res) {
    const body = req.body;
    let str = "";
    if (body) {
      let data = null;
      const url = body.url,
        p = path.join(storageDir, url);
      try {
        data = fs.readFileSync(p)
      } catch (e) {
      }
      if (data) {
        if (body.encoding) {
          str = Buffer.from(data).toString(body.encoding);
        } else if (/\.(png|jpg|gif|jpeg|bmp)$/i.test(p)) {
          str = Buffer.from(data).toString("base64");
        } else {
          str = Buffer.from(data).toString();
        }
      }
      if (body.prefix) {
        str = body.prefix + str;
      }
    }
    res.end(str);
  }));

  app.post("/api/upload", multipartMiddleware, function (req, res) {
    const body = req.body;
    if (body) {
      let content = body.content;
      const zipFile = path.join(storageDir, body.path);
      if (base64Reg.test(content)) {
        content = content.replace(base64Reg, "");
        content = Buffer.from(content, "base64");
      }
      if (zipReg.test(zipFile)) {
        var data = importZip(config, zipFile, content);
        if (data) {
          res.send(data);
          return;
        }
      } else {
        ensureDirSync(path.dirname(zipFile));
      }
      fs.writeFileSync(zipFile, content)
    }
    res.end();
  });

  app.get("/api/fileVersion/:version", function (req, res) {
    let version = req.params.version,
      values = {};
    if (version) {
      version = parseInt(version);
      const fileVersion = global.fileVersion || {};
      Object.keys(fileVersion).forEach(function (i) {
        const value = parseInt(fileVersion[i]);
        version < value && (values[i] = value)
      });
    }
    res.end(JSON.stringify(values))
  });

  app.get("/api/getInstance", function (req, res) {
    var sections = global.sections || {},
      value = [];
    Object.keys(sections).forEach((function (name) {
      const section = sections[name];
      section.name = name;
      value.push(section)
    }));
    res.end(JSON.stringify(value))
  });

  app.post("/api/createInstance", multipartMiddleware, function (req, res) {
    var body = req.body;
    if (body) {
      var name = body.name;
      if (global[name]) {
        res.send({ code: -1, message: "实例已存在" });
        return;
      } else {
        instance.create(body);
        res.send({ code: 0 });
        return;
      }
    }
    res.send(false);
  });

  app.get("/api/delete/:name", function (req, res) {
    const name = req.params.name;
    instance.delete(name);
    res.end(JSON.stringify({ code: 0 }))
  });
}

module.exports = createApp;
