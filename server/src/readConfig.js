const fs = require('fs');

function parseConfig(text = "") {
  let str = text.trim();
  if (str.charAt(0) && str.slice(-1) === '"' || str.charAt(0) === "'" && str.slice(-1) === "'") {
    str = str.substring(1, str.length - 2);
  }
  try {
    str = JSON.parse(text)
  } catch (e) {
  }
  return str
}

module.exports = function (path) {
  let sectionKey = undefined,
    config = undefined;
  const re = /^\[([^\]]*)\]$|^([^=]+)(=(.*))?$/i,
    result = { global: {} },
    lines = fs.readFileSync(path, "utf-8").split(/[\r\n]+/g);
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line && !line.match(/^\s*[;#]/)) {
      var matched = line.match(re);
      if (Array.isArray(matched)) {
        if (matched[1] === undefined) {
          const key = parseConfig(matched[2]);
          let value = !matched[3] || parseConfig(matched[4]);
          if (value === "true") {
            value = true;
          } else if (value === "false") {
            value = false;
          } else if (value === "null") {
            value = null;
          }
          config[key] = value;
        } else {
          config = result[sectionKey = parseConfig(matched[1])] = result[sectionKey] || {};
        }
      }
    }
  }
  return result
}
