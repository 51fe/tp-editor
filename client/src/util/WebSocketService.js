import { isString } from "./index.js";

export default class WebSocketService {
  constructor(handler, editor) {
    this.editor = editor;
    this.handler = handler;
    this.cookie = 0;
    this.callbacks = {};
    this.cmds = {};
    const host = tpeditor.config.host || window.location.hostname,
      port = tpeditor.config.port || window.location.port,
      url = this.url = window.location.protocol + "//" + host + ":" + port;
    this.socket = io.connect(url);
    this.initEventListener();
  }

  request(cmd, data, callback) {
    let index = ++this.cookie;
    this.callbacks[index] = callback;
    this.cmds[index] = cmd;
    const sid = this.editor.sid;
    this.socket.emit(cmd, index, data, sid ? { sid } : null);
    let message = cmd;
    if (data) {
      if (isString(data)) {
        message = cmd + ": " + data;
      } else if (data.path) {
        message = cmd + ": " + data.path;
      }
    }
    this.handler({
      type: "request",
      message,
      cmd,
      data
    })
  }

  handleRespone(index, data) {
    const callback = this.callbacks[index],
      cmd = this.cmds[index];
    delete this.callbacks[index];
    delete this.cmds[index];
    callback && callback(data);
    this.handler({
      type: "response",
      message: cmd,
      cmd,
      data
    });
  }

  initEventListener() {
    this.socket.on("connect", () => {
      this.handler({ type: "connected", message: this.url })
    });
    this.socket.on("disconnect", () => {
      this.handler({ type: "disconnected", message: this.url })
    });
    this.socket.on("fileChanged", file => {
      this.handler({ type: "fileChanged", path: file.path, event: file.event })
    });
    this.socket.on("operationDone", (index, data) => {
      this.handleRespone(index, data);
    });
    this.socket.on("download", path => {
      this.handler({ type: "download", path })
    });
    this.socket.on("confirm", (path, datas) => {
      this.handler({ type: "confirm", path, datas })
    });
  }
}