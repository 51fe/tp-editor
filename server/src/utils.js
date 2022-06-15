const path = require('path'),
  fs = require('fs'),
  archiver = require("archiver"),
  zip = require('zip-local'),
  rimraf = require('rimraf');

const imgFormat = "png|jpg|gif|jpeg|bmp|svg",
  fileFormat = imgFormat + "|json|html|obj|mtl";

function isHtml(value) {
  return /.*\.html$/.test(value)
}

function isMtl(value) {
  return /.*\.mtl$/.test(value)
}

function isJson(value) {
  return /.*\.json$/.test(value)
}

function isObj(value) {
  return /.*\.obj$/i.test(value)
}

function paste(storageDir, file, dirName) {
  const src = file ? path.join(storageDir, file) : storageDir;
  if (!isPredefined(src)) {
    var stats = fs.statSync(src);
    if (stats.isFile()) {
      var dest = autoRename(dirName, path.basename(src));
      fs.copyFileSync(src, dest)
    } else if (stats.isDirectory()) {
      (function pasteDir(storageDir, file, dirName) {
        if (file) {
          storageDir = path.join(storageDir, file);
        }
        if (isPredefined(storageDir)) return;
        const length = file.length,
          baseName = file.substring(file.lastIndexOf("/"), length),
          _path = autoRename(dirName, baseName);
        ensureDirSync(_path);
        fs.readdirSync(storageDir).forEach(function (file) {
          if (!isHidden(file)) {
            try {
              const _path = path.join(storageDir, file);
              if (fs.statSync(_path).isDirectory()) {
                pasteDir(storageDir, file, dirName);
              } else {
                paste(storageDir, file, dirName);
              }
            } catch (err) {
            }
          }
        })
      })(storageDir, file, dirName);
    }
  }
}

function autoRename(dirName, baseName, count) {
  const _baseName = baseName;
  if (count) {
    var extName = path.extname(baseName);
    baseName = [path.basename(baseName, extName), count, extName].join("")
  } else {
    count = 1;
  }
  let p = path.join(dirName, baseName);
  if (fs.existsSync(p)) {
    p = autoRename(dirName, _baseName, ++count);
  }
  return p;
}

function seek(config, baseSrc, src, jsonUrl) {
  const storageDir = config.storageDir,
    customDir = config.customDir,
    modelsDir = path.join(storageDir, "models");
  let data, icon, preview,
    _path = path.join(storageDir, baseSrc),
    exportWithJS = global.globalConfig.exportWithJS;
  if (exportWithJS === undefined) {
    exportWithJS = false;
  }
  if (isHtml(baseSrc)) {
    _path = path.join(customDir, "previews", baseSrc);
    (preview = {}).path = _path;
    preview.fileName = path.basename(jsonUrl, ".json") + ".html";
    preview.graph = jsonUrl.substring(storageDir.length + 1);
    if (src.indexOf(preview) > -1) return;
  } else {
    _path = path.join(storageDir, baseSrc);
    if (src.indexOf(_path) > -1) return;
  }
  try {
    data = fs.readFileSync(_path);
  } catch (err) {
  }
  if (!data) {
    return;
  }
  if (preview) {
    src.push(preview);
  } else {
    src.push(_path);
    if (isJson(baseSrc)) {
      icon = _path.substring(0, _path.lastIndexOf(".")) + ".png";
      src.push(icon);
    }
    if (new RegExp(`.*\\.(${imgFormat})`, "i").test(config)) return;
    if (isObj(baseSrc)) return;
  }
  data = data.toString().trim();
  let urls = [];
  if (isMtl(baseSrc)) {
    urls = function (text) {
      const arr = [],
        reg = new RegExp(`\\s.*\\.(${imgFormat})`, "ig"),
        result = text.match(reg);
      if (Array.isArray(result)) {
        result.forEach(function (item) {
          item = item.substring(item.lastIndexOf(" "));
          arr.push(item.trim())
        });
      }
      return arr;
    }(data);
  } else {
    urls = function getUrls(text) {
      let arr = [];
      text.split(",").forEach(function (item) {
        const result = item.match(new RegExp(`(\"|').*\\.(${fileFormat}|js)`, "ig"));
        if (Array.isArray(result)) {
          result.forEach(function (str) {
            const formats = str.split(/('|")/);
            if (formats.length === 1) {
              arr.push(formats);
            } else {
              formats.forEach(function (format) {
                arr = arr.concat(getUrls(format))
              })
            }
          });
        } else {
          let str = item;
          if (item.length > 100) {
            str = item.substring(item.length - 20, item.length)
          }
          if (new RegExp(`.*\\.(${fileFormat}|js)$`, "ig").test(str)) {
            arr.push(item)
          }
        }
      });
      return arr;
    }(data);
  }
  if (isHtml(baseSrc)) {
    urls.forEach(function (url) {
      try {
        if (new RegExp(".*\\.(" + fileFormat + ")", "i").test(url)) {
          url = url.replace(/\.\//g, "")
          if (["previews/symbol.json", "previews/display.json"].indexOf(url) === -1) {
            seek(config, url, src)
          }
        } else if (exportWithJS) {
          if (/.*\.js$/i.test(url) && src.indexOf(url) === -1) {
            src.push(url);
          }
        }
      } catch (err) {
      }
    })
  } else {
    let prefix, data = {};
    if (isJson(_path) && _path.indexOf(modelsDir) > -1) {
      try {
        data = JSON.parse(data);
      } catch (err) {
      }
      prefix = data.prefix || ""
    }
    urls.forEach(function (url) {
      if (isMtl(url)) {
        url = path.join(prefix, url)
      }
      seek(config, url, src, _path)
    });
  }
}

function toUnixPath(p) {
  let result = p.replace(/\\/g, "/");
  return result;
}

function toAbsolute(p, rootDir) {
  if (!path.isAbsolute(p)) {
    return path.join(rootDir, "/", p);
  }
  return "";
}

function getFullPath(socket, p) {
  const storageDir = socket.server.config.storageDir;
  if (p) {
    return path.join(storageDir, p);
  }
  return storageDir;
}

function isHidden(p) {
  const reg = /(__$|^\.|\.swap$|\.out$|\.svn$|^\~\$|\~$)/;
  if (reg.test(path.basename(p.toLowerCase()))) {
    return true;
  }
  return false;
}

function explore(p) {
  const result = {};
  try {
    fs.readdirSync(p).forEach(function (file) {
      if (!isHidden(file)) {
        const _path = path.join(p, file);
        if (fs.statSync(_path).isDirectory()) {
          result[file] = explore(_path);
        } else {
          result[file] = true;
        }
      }
    });
  } catch (err) {
  }
  return result;
}

function exportSource(config, src) {
  const paths = [],
    customDir = config.customDir,
    storageDir = config.storageDir;
  let zipFileName,
    length = 0;
  if (Array.isArray(src)) {
    length = src.length;
    zipFileName = path.basename(src[0], ".json")
  } else {
    zipFileName = src;
  }
  src = function getSource(storageDir, dirs, dirName = "") {
    let arr = [];
    if (typeof dirs === "string") {
      dirs = [dirs];
    }
    dirs.forEach(function (file) {
      const _path = path.join(dirName, file),
        p = path.join(storageDir, dirName, file),
        stats = fs.statSync(p);
      if (stats.isDirectory()) {
        fs.readdirSync(p).forEach(function (files) {
          const o = path.join(p, files),
            stats = fs.statSync(o);
          if (stats.isFile() && isJson(files) || stats.isDirectory()) {
            arr = arr.concat(getSource(storageDir, files, _path));
          }
        });
      } else if (stats.isFile()) {
        arr.push(_path)
      }
    });
    return arr;
  }(storageDir, src);
  let num = 0;
  src.forEach(function (jsonUrl) {
    path.basename(jsonUrl, ".json").replace(/%/g, "");
    let preview, arr = [];
    if (path.extname(jsonUrl) !== "") {
      seek(config, jsonUrl, arr);
      arr.forEach(function (item) {
        if (typeof item === "object") {
          preview = item;
        } else if (item !== undefined) {
          paths.indexOf(item) > -1 || paths.push(item);
        }
      });
      if (!/^(displays|symbols)[\/|\\\\].*/.test(jsonUrl)) return;
      let baseHtml = ''
      if (/^displays[\/|\\\\].*/.test(jsonUrl)) {
        baseHtml = "display-export.html";
      } else if (/^symbols[\/|\\\\].*/.test(jsonUrl)) {
        baseHtml = "symbol-export.html";
      }
      if (!preview) {
        var htmlSrc = [];
        if (num === 0) {
          seek(config, baseHtml, htmlSrc, jsonUrl);
          htmlSrc.forEach(function (item) {
            if (typeof item === "object") {
              preview = item;
              preview.graph = jsonUrl;
            } else if (item !== undefined) {
              paths.indexOf(item) > -1 || paths.push(item);
            }
          });
          num++
        } else {
          (preview = {}).path = path.join(customDir, "previews", baseHtml);
          preview.fileName = path.basename(jsonUrl, ".json") + ".html";
          preview.graph = jsonUrl;
        }
      }
      if(preview) {
        paths.indexOf(preview) > -1 || paths.push(preview);
      }
    }
  });
  length > 1 && (zipFileName += "(+" + length + ")");
  return { zipFileName, paths };
}

function getPaths(storageDir, customDir, tempDir) {
  const storageBaseName = path.basename(storageDir),
    files = function getFiles(storageDir, customDir, tempDir, predefined, dir) {
      let arr = [];
      fs.readdirSync(tempDir).forEach(function (item) {
        if (isPredefined(item)) {
          predefined = true;
          dir = path.join(tempDir, item)
        }
        try {
          var p = path.join(tempDir, item);
          if (fs.statSync(p).isDirectory()) {
            arr = arr.concat(getFiles(storageDir, customDir, p, predefined, dir));
          } else if (predefined) {
            const src = p.substring(dir.lastIndexOf(storageBaseName) + 7);
            arr.push(path.join(storageDir, src))
          }
        } catch (e) {
        }
      });
      return arr;
    }(storageDir, customDir, tempDir);
  if (files.length > 0) {
    const arr = [];
    files.forEach((function (item) {
      if (fs.existsSync(item)) {
        arr.push(item);
      }
    }))
    return arr;
  }
}

function importZip(config, zipFile, buffer) {
  const storageDir = config.storageDir,
    customDir = config.customDir,
    tempName = String((new Date).getTime()),
    tempDir = path.join(storageDir, "/temp/", tempName),
    memory = zip.sync.unzip(buffer).memory();
  memory.contents().forEach(function (item) {
    var data = memory.read(item, "buffer"),
      _path = path.join(tempDir, item),
      dirName = path.dirname(_path);
    if (!fs.existsSync(dirName)) {
      ensureDirSync(dirName);
    }
    fs.writeFileSync(_path, data);
  });
  rimraf.sync(path.join(storageDir, "/temp/", path.basename(zipFile)));
  const paths = getPaths(storageDir, customDir, tempDir);
  if (paths) {
    if (paths.length !== 0) return { tempName, paths };
    moveSourceFile(storageDir, customDir, tempDir);
    rimraf.sync(tempDir);
  }
  return null;
}

function moveSourceFile(storageDir, customDir, tempDir, predefined, dir) {
  const storageBaseName = path.basename(storageDir);
  fs.readdirSync(tempDir).forEach(function (file) {
    if (isPredefined(file)) {
      predefined = true;
      dir = path.join(tempDir, file);
    }
    try {
      var p = path.join(tempDir, file);
      if (fs.statSync(p).isDirectory()) {
        moveSourceFile(storageDir, customDir, p, predefined, dir);
      } else if (predefined && !isHtml(file)) {
        let src = p.substring(dir.lastIndexOf(storageBaseName) + 7);
        src = path.join(storageDir, src);
        const dirName = path.dirname(src);
        if (!fs.existsSync(dirName)) {
          ensureDirSync(dirName);
        }
        fs.writeFileSync(src, fs.readFileSync(p))
      }
    } catch (err) {
    }
  });
}

function createZip(config, paths, output) {
  const storageDir = path.normalize(config.storageDir),
    storageBaseName = path.basename(storageDir),
    clientDir = config.clientDir,
    customDir = config.customDir,
    customPath = path.dirname(customDir),
    stream = archiver("zip", { zlib: { level: 9 } });
  stream.pipe(output);

  if (paths.length > 0) {
    paths.forEach(function (p) {
      let _path, graph;
      if (typeof p === "object") {
        const fileName = p.fileName;
        graph = toUnixPath(p.graph);
        p = p.path;
        _path = path.join(storageBaseName, fileName);
      } else if (/.*\.js$/.test(p)) {
        _path = p;
        p = path.join(clientDir, p)
        if (/custom\/.*\/.*/.test(p)) {
          p = path.join(customPath, p);
        }
      } else {
        _path = p.replace(storageDir, "");
        _path = path.join(storageBaseName, _path);
      };
      try {
        let content = fs.readFileSync(p);
        if (isHtml(p)) {
          content = content.toString();
          content = content.replace(/src="/g, "src='")
            .replace(/\.js">/g, ".js'>")
            .replace(/'custom\//g, "'../custom/")
            .replace(/'libs\//g, "'../libs/")
            .replace("GetQueryString('tag')", "'" + graph + "'")
            .replace("previews/display.json", graph)
            .replace("previews/symbol.json", graph)
        }
        if (isObj(p) || isMtl(p)) {
          content = content.toString()
          const result = content.match(/#.*/g);
          Array.isArray(result) && result.forEach(function (item) {
            content = content.replace(item, "")
          });
        }
        stream.append(content, { name: _path });
      } catch (err) { }
    });
  }
  stream.finalize();
}

function pasteFile(storageDir, files, destDir) {
  const dir = destDir ? path.join(storageDir, destDir) : storageDir;
  if (Array.isArray(files)) {
    files.forEach(function (file) {
      paste(storageDir, file, dir)
    })
  }
}

function ensureDirSync(dirName, dir = null) {
  const _path = path.resolve(dirName);
  try {
    if (!fs.existsSync(_path)) {
      fs.mkdirSync(_path);
    }
    if (!dir) {
      dir = _path;
    }
  } catch (err) {
    switch (err.code) {
      case "ENOENT":
        dir = ensureDirSync(path.dirname(_path), dir);
        ensureDirSync(_path, dir);
        break;
      default:
        let stats = null;
        try {
          stats = fs.statSync(_path);
        } catch (err) {
          throw err;
        }
        if (!stats.isDirectory()) throw err;
    }
  }
  return dir;
}

function isPredefined(dir) {
  dir = toUnixPath(dir).replace(/(^\/*|\/*$)/g, "")
  const dirs = ["displays", "symbols", "assets", "scenes", "models", "previews", "components"];
  return dirs.indexOf(dir) !== -1;
}

function getVersion() {
  if (global.globalConfig && global.globalConfig.version) {
    return global.globalConfig.version;
  }
  const url = path.resolve("../package.json")
  let config,
    content = fs.readFileSync(url, "utf-8");
  try {
    config = JSON.parse(content);
  } catch (err) {
    config = {}
  }
  return config.version || "1.0.0"
}

module.exports = {
  toUnixPath,
  toAbsolute,
  getFullPath,
  isHidden,
  explore,
  exportSource,
  importZip,
  moveSourceFile,
  createZip,
  pasteFile,
  ensureDirSync,
  isPredefined,
  getVersion
}
