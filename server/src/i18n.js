const i18n = {
  exitRepl: { en: "(To exit, press ^C again or type .exit)", zh: "（如果要退出，请再次按 ^C 或者执行 .exit）" },
  preInit: { en: "Pre-initialization", zh: "开始初始化" },
  postInit: { en: "Post-initialization", zh: "结束初始化" },
  startServer: { en: "Start server", zh: "启动服务" },
  stopServer: { en: "Stop server", zh: "停止服务" },
  startNetService: { en: "Start network service", zh: "启动网络服务" },
  newConnection: { en: "New connection", zh: "新连接" },
  disconnect: { en: "Disconnect", zh: "断开连接" },
  PING: { en: "PING: Test connection", zh: "PING: 测试链路" },
  EXPLORE: { en: "EXPLORE: Fetch directories and files", zh: "EXPLORE: 获取目录和文件" },
  MKDIR: { en: "MKDIR: Create a directory", zh: "MKDIR: 创建目录" },
  UPLOAD: { en: "UPLOAD: Upload to save file", zh: "UPLOAD: 上传保存文件" },
  RENAME: { en: "RENAME: Rename a directory or file", zh: "RENAME: 重命名目录或文件" },
  REMOVE: { en: "REMOVE: Remove a directory or file", zh: "REMOVE: 删除目录或文件" },
  OPEN: { en: "OPEN: Open file", zh: "OPEN: 打开文件" },
  LOCATE: { en: "LOCATE: Locate a directory or file", zh: "LOCATE: 定位目录或文件" },
  SAVE_IMAGE: { en: "SAVE_IMAGE: Save image file", zh: "SAVE_IMAGE: 保存图片文件" },
  SOURCE: { en: "SOURCE: Fetch the content of a file", zh: "SOURCE: 获取文件内容" }
}

let lang = "en";
function getString(key) {
  return i18n[key] && i18n[key][lang] || key;
}

function setLanguage(defaultLang) {
  lang = defaultLang;
}

module.exports = {
  getString,
  setLanguage
}
