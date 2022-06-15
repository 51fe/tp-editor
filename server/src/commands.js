const path = require('path');
const fs = require('fs');
const rimraf = require('rimraf');
const { explore, getFullPath, importZip, ensureDirSync, isPredefined,
  exportSource, moveSourceFile, pasteFile, createZip } = require('./utils');
const execFile = require('./execFile');

module.exports = {
  ping: function (socket, count, dir) {
    return dir
  },
  explore: function (socket, count, dir) {
    const fullPath = getFullPath(socket, dir);
    return explore(fullPath);
  },
  mkdir: function (socket, count, dir) {
    const p = dir.trim();
    if (p) {
      const fullPath = getFullPath(socket, p);
      return ensureDirSync(fullPath) === "string"
    }
  },
  upload: function (socket, count, data) {
    let content = data.content;
    const base64Reg = /^\s*data:([a-z]+\/[a-z0-9-+.]+(;[a-z-]+=[a-z0-9-]+)?)?(;base64)?,/i,
      zipReg = /\.zip$/i,
      zipFile = getFullPath(socket, data.path);
    if (base64Reg.test(content)) {
      content = content.replace(base64Reg, "");
      content = Buffer.from(content, "base64");
    }
    if (zipReg.test(zipFile)) {
      const zip = importZip(socket.server.config, zipFile, content);
      if (zip) {
        socket.emit("confirm", zip.tempName, zip.paths);
      }
    } else {
      ensureDirSync(path.dirname(zipFile));
      fs.writeFileSync(zipFile, content);
    }
    return true;
  },
  rename: function (socket, count, data) {
    const oldPath = getFullPath(socket, data.old),
      newPath = getFullPath(socket, data.new),
      createError = function (err) {
        logger.trace(err);
        return false;
      };
    if (!fs.existsSync(oldPath)) return createError(oldPath + " does not exist");
    if (isPredefined(data.old)) return createError("Source is predefined, cannot be renamed");
    if (isPredefined(data.new)) return createError("Target is predefined, cannot be renamed");
    try {
      fs.renameSync(oldPath, newPath)
    } catch (err) {
      return createError("Rename failed, detail: " + err)
    }
    return true;
  },
  remove: function (socket, count, dir) {
    var fullPath = getFullPath(socket, dir);
    if (!fs.existsSync(fullPath) || !isPredefined(dir)) {
      rimraf.sync(fullPath)
      return true;
    }
  },
  open: function (socket, count, dir) {
    const fullPath = getFullPath(socket, dir);
    execFile("file:" + fullPath);
    return fullPath
  },
  locate: function (socket, count, dir) {
    const fullPath = getFullPath(socket, dir);
    execFile(fullPath);
    return true
  },
  source: function (socket, count, data) {
    let content = undefined,
      str = "";
    const url = data.url || data,
      fullPath = getFullPath(socket, url);
    try {
      content = fs.readFileSync(fullPath)
    } catch (err) { }
    if (content) {
      str = content;
    } else if (data.encoding) {
      str = Buffer.from(content).toString(data.encoding);
    } else if (/\.(png|jpg|gif|jpeg|bmp)$/i.test(fullPath)) {
      str = Buffer.from(content).toString("base64");
    } else {
      str = Buffer.from(content).toString();
    }
    if (data.prefix) {
      str = data.prefix + str;
    }
    return str;
  },
  auth: function (socket, count, dir) {
    return !!sid.authSID(dir)
  },
  refreshSID: function () {
    return sid.genSID()
  },
  export: function (socket, count, src) {
    const config = socket.server.config,
      source = exportSource(config, src),
      storageDir = config.storageDir,
      now = String((new Date).getTime()),
      tempDir = path.join(storageDir, "/temp/", now),
      fileName = source.zipFileName || "package";
    if (!fs.existsSync(tempDir)) {
      ensureDirSync(tempDir);
    }
    const writeStream = fs.createWriteStream(tempDir + "/" + fileName + ".zip");
    createZip(config, source.paths, writeStream);
    writeStream.on("close", function () {
      const url = "/temp/" + now + "/" + fileName + ".zip";
      socket.emit("download", url)
    });
    return true;
  },
  import: function (socket, count, data) {
    const storageDir = socket.server.config.storageDir,
      customDir = socket.server.config.customDir,
      tempDir = path.join(storageDir, "/temp/", data.path);
    if (data.move) {
      moveSourceFile(storageDir, customDir, tempDir);
    }
    rimraf.sync(tempDir);
    return true;
  },
  paste: function (socket, count, data) {
    const storageDir = socket.server.config.storageDir;
    try {
      pasteFile(storageDir, data.fileList, data.destDir)
    } catch (err) {
      const message = "Paste failed, detail: " + err;
      logger.trace(message);
      return false;
    }
    return true;
  },
  uploadModel: function (socket, count, data) {
    var task = data.task,
      path = data.path,
      content = data.content,
      _task = global[task];
    if (!!_task) {
      task[path] = content;
      return true
    }
    return false;
  }
}
