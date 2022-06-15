const childProcess = require("child_process");
const isWin32 = process.platform === "win32";

module.exports = function (args, options, callback) {
  let file = 'xdg-open'
  if (isWin32) {
    file = "cmd";
  } else if (process.platform === "darwin") {
    file = "open";
  }
  if (typeof args === "string") {
    args = [args];
  }
  if (typeof options === "function") {
    callback = options;
    options = {};
  }
  if (typeof options === "object" && options.command) {
    if (isWin32) {
      args = [options.command].concat(args)
    } else {
      file = options.command;
    }
  }
  if (isWin32) {
    args = args.map(function (arg) {
      return arg.replace(/&/g, "^&")
    })
    args = ["/c", "start", '""'].concat(args);
  }
  return childProcess.execFile(file, args, options, callback)
}
