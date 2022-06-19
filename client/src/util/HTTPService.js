
import { isString } from "./index.js";

export default class HTTPService {
  constructor(handler, editor) {
    this.editor = editor;
    this.handler = handler;
    this.cookie = 0;
    this.callbacks = {};
    this.cmds = {};
    this.fileChangeVersion = String((new Date).getTime());
    const host = tpeditor.config.host || window.location.hostname,
      port = tpeditor.config.port || window.location.port,
      url = this.url = window.location.protocol + "//" + host + ":" + port + '/api';

    setTimeout(() => {
      handler({ type: "connected", message: url })
    }, 1);
    const { checkForFileChanges, checkForFileChangesInterval } = tpeditor.config;
    if (checkForFileChanges && checkForFileChangesInterval) {
      this.fileChangedEvent();
    }
  }

  request(cmd, data, callback) {
    const index = ++this.cookie;
    this.callbacks[index] = callback
    this.cmds[index] = cmd;
    const sid = this.editor.sid;
    this[cmd](index, data, sid || null, callback);
    let message = cmd;
    if (data) {
      if (isString(data)) {
        message = cmd + ": " + data
      } else if (data.path) {
        message = cmd + ": " + data.path
      }
    }
    this.handler({
      type: "request",
      message,
      cmd,
      data: data
    })
  }

  fileChangedEvent() {
    let path = this.url + "/fileVersion";
    path += "/" + this.fileChangeVersion;
    path += "?sid=" + this.editor.sid;
    this.send("GET", path, null, e => {
      this.fileChangeVersion = String((new Date).getTime());
      let res = e.target.response;
      if (res) {
        res = JSON.parse(res);
        Object.keys(res).forEach(path => {
          this.handler({ type: "fileChanged", path })
        })
      }
    });
    setTimeout(() => {
      this.fileChangedEvent();
    }, tpeditor.config.checkForFileChangesInterval);
  }

  export(index, dir, sid) {
    const req = new ht.Request,
      params = {},
      fd = new FormData,
      url = this.url + "/export?sid=" + sid;
    fd.append("dir", dir);
    params.url = encodeURI(url);
    params.method = "POST";
    params.data = fd;
    req.setResponseType("blob");
    req.onload = e => {
      const target = e.target;
      if ([200, 0].includes(target.status)) {
        const res = target.response,
          headers = target.getResponseHeader("Content-Disposition").split(";"),
          uri = headers[1].split("=")[1],
          blob = new Blob([res], { type: "application/zip" }),
          a = document.createElement("a");
        a.href = window.URL.createObjectURL(blob);
        a.download = decodeURI(uri);
        a.click();
        this.handleRespone(index, true);
      }
    };
    req.send(params);
  }

  mkdir(index, path, sid) {
    const req = new ht.Request,
      params = {},
      fd = new FormData,
      url = this.url + "/mkdir?sid=" + sid;
    if (tpeditor.config.vision) {
      fd.append("path", path.dir);
      fd.append("parent_uuid", path.parent_uuid)
    } else {
      fd.append("path", path)
    }
    params.url = encodeURI(url);
    params.method = "POST";
    params.data = fd;
    req.onload = e => {
      const target = e.target;
      if ([200, 0].includes(target.status)) {
        const data = target.response || target.responseText;
        this.handleRespone(index, data === "true");
        this.handler({ type: "fileChanged", path });
      }
    };
    req.send(params);
  }

  explore(index, path, sid) {
    const req = new ht.Request,
      params = {};
    let url = this.url + "/explore";
    url += path;
    url += "?sid=" + sid;
    params.url = encodeURI(url);
    req.onload = e => {
      const target = e.target;
      if ([200, 0].includes(target.status)) {
        const data = target.response || target.responseText;
        this.handleRespone(index, JSON.parse(data))
      }
    };
    req.send(params);
  }

  upload(index, file, sid) {
    const fd = new FormData,
      path = file.path;
    let url = this.url + "/upload";
    url += "?sid=" + sid;
    fd.append("path", file.path);
    fd.append("content", file.content);
    this.send("POST", url, fd, e => {
      const target = e.target;
      if ([200, 0].includes(target.status)) {
        const res = target.response;
        if (this.handleRespone(index, true), res) {
          const data = JSON.parse(res);
          this.handler({ type: "confirm", path: data.tempName, datas: data.paths })
        } else {
          this.handler({ type: "fileChanged", path })
        }
      }
    });
  }

  rename(index, path, sid) {
    const fd = new FormData,
      newPath = path.new,
      oldPath = path.old;
    let url = this.url + "/rename";
    url += "?sid=" + sid;
    fd.append("newPath", newPath);
    fd.append("oldPath", oldPath);
    this.send("POST", url, fd, e => {
      const target = e.target;
      if ([200, 0].includes(target.status)) {
        const res = target.response || target.responseText;
        this.handleRespone(index, res === "true");
        if (res === "true") {
          this.handler({
            type: "fileChanged",
            path: newPath
          });
          this.handler({ type: "fileChanged", path: oldPath });
        }
      }
    });
  }

  remove(index, path, sid) {
    const fd = new FormData;
    let url = this.url + "/remove";
    url += "?sid=" + sid;
    fd.append("path", path);
    this.send("POST", url, fd, e => {
      const target = e.target;
      if ([200, 0].includes(target.status)) {
        const res = target.response || target.responseText;
        this.handleRespone(index, res === "true");
        if (res === "true") {
          this.handler({ type: "fileChanged", path: path });
        }
      }
    });
  }

  locate(index, dir, sid) {
    let url = this.url + "/locate";
    url += "?dir=" + dir;
    url += "&sid=" + sid;
    this.send("GET", url, null, e => {
      const target = e.target;
      if ([200, 0].includes(target.status)) {
        this.handleRespone(index, true)
      }
    });
  }

  open(index, url, sid) {
    let uri = this.url + "/open";
    uri += "?url=" + url;
    uri += "&sid=" + sid;
    this.send("GET", uri, null, e => {
      const target = e.target;
      if ([200, 0].includes(target.status)) {
        this.handleRespone(index, true)
      }
    })
  }

  source(index, params, sid) {
    const fd = new FormData;
    let url = this.url + "/source";
    url += "?sid=" + sid;
    fd.append("url", params.url);
    fd.append("encoding", params.encoding);
    fd.append("prefix", params.prefix);
    this.send("POST", url, fd, e => {
      const target = e.target;
      if ([200, 0].includes(target.status)) {
        const data = target.response || target.responseText;
        this.handleRespone(index, data)
      }
    });
  }

  import(index, params, sid) {
    const fd = new FormData;
    let url = this.url + "/import";
    url += "?sid=" + sid;
    fd.append("path", params.path);
    fd.append("move", params.move);
    this.send("POST", url, fd, r => {
      const target = r.target;
      if ([200, 0].includes(target.status)) {
        this.handleRespone(index, true)
      }
    })
  }

  paste(index, file, sid) {
    const fd = new FormData;
    let url = this.url + "/paste";
    url += "?sid=" + sid;
    fd.append("destDir", file.destDir);
    fd.append("fileList", file.fileList);
    this.send("POST", url, fd, e => {
      const target = e.target;
      if ([200, 0].includes(target.status)) {
        const data = target.response || target.responseText;
        this.handleRespone(index, data);
      }
    })
  }

  send(method, url, data, callback) {
    const request = new ht.Request,
      xhr = {};
    xhr.url = encodeURI(url);
    xhr.method = method;
    xhr.data = data;
    callback && (request.onload = callback)
    request.send(xhr);
  }

  handleRespone(index, data) {
    const callback = this.callbacks[index],
      cmd = this.cmds[index];
    delete this.callbacks[index];
    delete this.cmds[index];
    this.handler({
      type: "response",
      message: cmd,
      cmd,
      data
    })
    callback && callback(data);
  }
}
