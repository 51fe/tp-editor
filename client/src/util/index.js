import { BINDING, EMPTY_COMPS, PREFIX } from "../constants.js";
import config from "../config.js";

export function toFunction(value) {
  if (value) {
    return new Function("return " + value.trim())()
  }
}

export function getQueryString(key) {
  const reg = new RegExp("(^|&)" + key + "=([^&]*)(&|$)"),
    result = window.location.search.substring(1).match(reg);
  return result !== null ? decodeURIComponent(result[2]) : null
}

export function clone(value) {
  return ht.Default.clone(value)
}

export function toNumber(value) {
  return parseFloat(value.toFixed(ht.Default.numberDigits))
}

export function getString(key, value) {
  if (null != key) return value || !config.traceMissingI18n || tpeditor.customStrings[key] || tpeditor.strings[key] || console.log("i18n missing:[" + key + "]"), value ? tpeditor.customStrings[key] || tpeditor.strings[key] : tpeditor.customStrings[key] || tpeditor.strings[key] || key
}

export function useI18Param(str = "", ...rest) {
  for (let i = 0; i < rest.length; i++) {
    str = str.replace("{" + i + "}", rest[i]);
  }
  return str;
}

export function getRowHeight(value, valueType) {
  if (value && value.rowHeight) {
    return value.rowHeight;
  } else if (valueType && valueType.rowHeight) {
    return valueType.rowHeight;
  }
  return undefined;
}

export function getWidths(value, valueType) {
  if (value && value.widths) {
    return value.widths
  } else if (valueType && valueType.widths) {
    return valueType.widths;
  }
  return undefined;
}

export function getStrings(labels, i18nLabels) {
  return i18nLabels ? i18nLabels.map(label => {
    return getString(label)
  }) : labels
}

export function removeItem(items, item) {
  const index = items.indexOf(item);
  index >= 0 && items.splice(index, 1);
}

export function isEmptyObject(value) {
  return ht.Default.isEmptyObject(value);
}

export function stringifyFunction(json) {
  return json ? isString(json) ? json : json.__ht__ || json.toString() : ""
}

export function parseString(json) {
  let str = stringifyFunction(json);
  const start = str.indexOf("{") + 1,
    end = str.lastIndexOf("}");
  for (str = str.substring(start, end); str.startsWith("\n");) {
    str = str.substr(1);
  }
  for (; str.endsWith("\n");) {
    str = str.substring(0, str.length - 1);
  }
  return str;
}

export function parseFunction(json) {
  const index = json.indexOf("function");
  if (json && !(index < 0)) {
    let func = undefined,
      start1 = json.indexOf("{") + 1,
      end1 = json.lastIndexOf("}"),
      start2 = json.indexOf("(") + 1,
      end2 = json.indexOf(")");
    if (start1 && end1 && start2 && end2) {
      func = new Function(json.substring(start2, end2), json.substring(start1, end1));
      func.__ht__ = json.substr(index);
    }
    return func;
  }
}

export function getter(accessType, name, value) {
  if (value) return value;
  if (accessType === "s") return data => {
    return data.s(name);
  };
  if (accessType === "a") return data => {
    return data.a(name);
  };
  if (accessType === "p") {
    const key = ht.Default.getter(name);
    return data => {
      if (data[key]) return data[key]();
    }
  }
}

export function setter(accessType, name, defaultValue) {
  if (defaultValue !== undefined) return defaultValue;
  if (accessType === "s") return (data, value) => {
    return data.s(name, value);
  };
  if (accessType === "a") return (data, value) => {
    return data.a(name, value);
  };
  if (accessType === "p") {
    const key = ht.Default.setter(name);
    return (data, value) => {
      if (data[key]) return data[key](value);
    }
  }
}

export function isEnter(e) {
  return e.keyCode === 13;
}

export function isEsc(e) {
  return e.keyCode === 27;
}

export function isDelete(e) {
  return ht.Default.isDelete(e)
}

export function isLeftButton(e) {
  return ht.Default.isLeftButton(e)
}

export function isDoubleClick(e) {
  return ht.Default.isDoubleClick(e)
}

export function startDragging(interactor, e) {
  ht.Default.startDragging(interactor, e);
}

export function getClientPoint(e) {
  return ht.Default.getClientPoint(e);
}

export function getTargetElement(e) {
  return ht.Default.getTargetElement(e);
}

export function getPagePoint(e) {
  return ht.Default.getPagePoint(e);
}

export function getWindowInfo() {
  return ht.Default.getWindowInfo();
}

export function getDistance() {
  return ht.Default.getDistance(...arguments);
}

export function unionPoint() {
  return ht.Default.unionPoint(...arguments);
}

export function removeCache(index) {
  if (ht.Default.getImageMap()[index]) {
    delete ht.Default.getImageMap()[index], true
  } else if (ht.Default.getCompTypeMap()[index]) {
    delete ht.Default.getCompTypeMap()[index], true
  } else {
    delete ht.Default.getShape3dModelMap()[index], true
  }
}

export function getPosition(x, y, z) {
  return ht.Default.getPosition(x, y, z)
}

export function stringify(obj, replacer, space = config.encodeJSON) {
  return ht.Default.stringify(obj, replacer, space)
}

export function parse(json, reviver) {
  return ht.Default.parse(json, reviver)
}

export function trimExtension(filename) {
  if (!filename) return "";
  const index = filename.lastIndexOf(".");
  return index === -1 ? filename : filename.substr(0, index)
}

export function fileNameToDisplayName(filename) {
  return filename = filename.replace(/^.*[\\/]/, ""), trimExtension(filename)
}

export function getFileExt(filename) {
  if (!filename) return "";
  const index = filename.lastIndexOf(".");
  return index === -1 ? "" : filename.substr(index, filename.length)
}

export function layout(el, x, y, w, h) {
  ht.Default.layout(el, x, y, w, h);
}

export function setCanvas(el, w, h) {
  ht.Default.setCanvas(el, w, h);
}

export function removeHTML(el) {
  ht.Default.removeHTML(el);
}

export function xhrLoad(urls, callback, option) {
  ht.Default.xhrLoad(urls, callback, option);
}

export function isShiftDown(e) {
  return ht.Default.isShiftDown(e);
}

export function isCtrlDown(e) {
  return ht.Default.isCtrlDown(e);
}

export function createCanvas() {
  return ht.Default.createCanvas();
}

export function createDiv() {
  return ht.Default.createDiv();
}

export function unionRect(rect1, rect2) {
  return ht.Default.unionRect(rect1, rect2)
}

export function drawText(g, value, font, color, x, y, width, height, align, vAlign) {
  return ht.Default.drawText(g, value, font, color, x, y, width, height, align, vAlign)
}

export function drawStretchImage(g, img, stretch, x, y, w, h, data, view, color) {
  ht.Default.drawStretchImage(g, img, stretch, x, y, w, h, data, view, color)
}

export function drawBorder(g, borderColor, x, y, w, h, borderWidth) {
  ht.Default.drawBorder(g, borderColor, x, y, w, h, borderWidth)
}

export function initContext(canvas, x = 0, y = 0, scale = 1,
  rect, ratio = ht.Default.devicePixelRatio) {
  const ctx = canvas.getContext("2d");
  ctx.save();
  ctx.translate(x * ratio, y * ratio);
  scale *= ratio;
  if (scale !== 1) {
    ctx.scale(scale, scale);
  }
  if (rect) {
    ctx.beginPath();
    ctx.rect(rect.x, rect.y, rect.width, rect.height);
    ctx.clip();
    ctx.clearRect(rect.x, rect.y, rect.width, rect.height);
  }
  return ctx;
}

export function msClass(clazz, prop) {
  ht.Default.extendClass(clazz, prop)
}

export function copy(src, target) {
  target[src._id] = src;
  src.eachChild(function (child) {
    target[child._id] = child;
    copy(child, target);
  })
}

export function preventDefault(e) {
  ht.Default.preventDefault(e)
}

export function isDisplay(value) {
  return /^displays/.test(value)
}

export function isSymbol(value) {
  return /^symbols/.test(value)
}

export function isComponent(value) {
  return /^components/.test(value)
}

export function isScene(value) {
  return /^scenes/.test(value)
}

export function isModel(value) {
  return /^models/.test(value)
}

export function isUI(value) {
  return /^uis/.test(value)
}

export function isAsset(value) {
  return /^assets/.test(value)
}

export function isImage(value) {
  return /\.(png|jpg|gif|jpeg|bmp|svg)$/i.test(value)
}

export function isJSON(value) {
  return /\.json$/i.test(value)
}

export function isAudio(value) {
  return /\.mp3$/i.test(value)
}

export function isVideo(value) {
  return /\.mp4$/i.test(value)
}

export function isSVG(value) {
  return /\.svg$/i.test(value)
}

export function isDXF(value) {
  return /\.dxf$/i.test(value)
}

export function isOBJ(value) {
  return /\.obj$/i.test(value)
}

export function isMTL(value) {
  return /\.mtl$/i.test(value)
}

export function isTTF(value) {
  return /\.ttf$/i.test(value)
}

export function isOTF(value) {
  return /\.otf$/i.test(value)
}

export function isJS(value) {
  return /\.js$/i.test(value)
}

export function jsonToPNG(url) {
  return url.substring(0, url.length - 5) + ".png";
}

export function isString(value) {
  return typeof value === "string" || value instanceof String;
}

export function isNumber(value) {
  return typeof value === "number";
}

export function isObject(value) {
  return value && typeof value === "object"
}

export function isFunction(value) {
  return "function" == typeof value
}

export function compareEqual(src, target) {
  if (Array.isArray(src) && Array.isArray(target)) {
    if (src.length === target.length) {
      for (let i = 0; i < src.length; i++) {
        if (!compareEqual(src[i], target[i])) return false;
      }
      return true
    }
    return false
  }
  if (isObject(src) && isObject(target)) {
    const keys = Object.keys(src);
    if (keys.length === Object.keys(target).length) {
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        if (!compareEqual(src[key], target[key])) return false
      }
      return true
    }
    return false
  }
  return src === target
}

export function serializeDM(value) {
  if (value instanceof ht.DataModel) {
    return PREFIX + value.serialize(0);
  }
  return value;
}

export function updateValue(prop, name, func, src, target) {
  const equal = compareEqual(src, target);
  if (func) {
    const dataBinding = prop[name] = { func };
    if (!equal) {
      dataBinding.value = serializeDM(src);
    }
  } else if (!equal && src !== undefined) {
    prop[name] = serializeDM(src);
  }
}

export function parseValue(value, defaultValue = undefined) {
  let val = undefined;
  if (isObject(value) && value.func) {
    val = value.value;
  } else {
    val = value;
  }
  if (val === undefined) {
    val = defaultValue;
  }
  return val;
}

export function getFunc(value) {
  if (isObject(value) && value.func) return value.func
}

export function drawSnapshot(gv) {
  return {
    width: 16,
    height: 16,
    comps: [{
      type: function (g, rect, comp, data, view) {
        let image = ht.Default.getImage(gv.graphView.getImage(data));
        if (image && image.snapshotURL) {
          image = ht.Default.getImage(image.snapshotURL);
          drawStretchImage(g, image, "uniform", rect.x, rect.y,
            rect.width, rect.height, data, view);
        } else {
          let bounds = gv.graphView.getDataUIBounds(data);
          if (image && image.boundExtend) {
            bounds = data.getRect();
          }
          if (bounds && bounds.width && bounds.height) {
            g.save();
            const ratio = Math.min(1, 16 / Math.max(bounds.width, bounds.height));
            g.translate(-bounds.x * ratio + (16 - bounds.width * ratio) / 2,
              -bounds.y * ratio + (16 - bounds.height * ratio) / 2);
            g.scale(ratio, ratio);
            gv.graphView.drawData(g, data);
            g.restore();
          }
        }
      }
    }]
  }
}

export function drawIcon(shape) {
  const rect = unionPoint(shape.getPoints());
  if (rect && (rect.width || rect.height)) {
    const w = Math.max(1, Math.max(rect.width, rect.height) / 16),
      points = [],
      x = (16 - rect.width / w) / 2,
      y = (16 - rect.height / w) / 2;
    shape.getPoints().each(function (item) {
      points.push((item.x - rect.x) / w + x, (item.y - rect.y) / w + y)
    });
    let segments = null;
    if (shape.getSegments()) {
      segments = shape.getSegments().toArray()
    }
    return {
      width: 16,
      height: 16,
      comps: [{
        type: "shape",
        points,
        segments,
        rotation: shape.getRotation(),
        background: shape.s("shape.background"),
        repeatImage: shape.s("shape.repeat.image"),
        borderWidth: shape.s("shape.border.width") ? 1 : 0,
        borderColor: shape.s("shape.border.color"),
        borderCap: shape.s("shape.border.cap"),
        borderJoin: shape.s("shape.border.join"),
        gradient: shape.s("shape.gradient"),
        gradientColor: shape.s("shape.gradient.color"),
        closePath: shape.isClosePath()
      }]
    }
  }
  return EMPTY_COMPS;
}

export function isInput(target) {
  return ht.Default.isInput(target)
}

export function createItem(id, toolTip, name, callback) {
  const item = { unfocusable: true, id, toolTip },
    image = ht.Default.getImage(name),
    w = image ? image.width : 16,
    h = image ? image.height : 16;
  item.icon = {
    width: w + 8,
    height: h + 8,
    fitSize: !!image && image.fitSize,
    comps: [{
      type: "rect",
      background: {
        func: function (e, toolbar) {
          return toolbar.getCurrentItem() === item ? config.color_hover : null;
        }
      }, rect: [0, 0, w + 8, h + 8]
    }, {
      type: "image",
      name,
      color: {
        func: function () {
          return callback && callback() ? config.color_select : config.color_dark;
        }
      },
      rect: [4, 4, w, h]
    }]
  };
  return item;
}

export function createLabel(innerHTML, textAlign, font = ht.Default.labelFont) {
  const el = ht.Default.createDiv(true);
  el.style.font = font;
  el.style.color = ht.Default.labelColor;
  el.style.paddingLeft = "4px";
  el.style.whiteSpace = "nowrap";
  el.style.verticalAlign = "middle";
  el.innerHTML = innerHTML;
  textAlign && (el.style.textAlign = textAlign);
  el.onLayouted = function (x, y, w, h) {
    el.style.lineHeight = h + "px";
  };
  return el;
}

export function createButton(label, toolTip, icon, onClicked) {
  const btn = new ht.widget.Button;
  btn.setLabel(label);
  btn.setLabelColor(ht.Default.labelColor);
  btn.setLabelSelectColor(config.color_select);
  btn.setIcon(icon);
  btn.setBackground(null);
  btn.setBorderColor(null);
  if (onClicked) {
    btn.onClicked = onClicked
  }
  if (toolTip) {
    btn.setToolTip(toolTip);
    btn.enableToolTip();
  }
  btn.getCurrentBackground = function () {
    return this._hover || this.isPressed() ? config.color_hover : null;
  };
  btn.getCurrentBorderColor = function () {
    return this.isSelected() ? config.color_select : null;
  };
  btn.getView().addEventListener("mouseenter", function () {
    if (!btn.isDisabled()) {
      btn._hover = true;
      btn.iv();
    }
  }, false);
  btn.getView().addEventListener("mouseleave", function () {
    if (!btn.isDisabled()) {
      btn._hover = false;
      btn.iv();
    }
  }, false);
  return btn;
}

export function createIconButton(name, onSelect) {
  const image = ht.Default.getImage(name);
  if (!image) throw name;
  const prop = {
    width: image.width,
    height: image.height,
    fitSize: image.fitSize,
    comps: [{
      type: "image",
      name: name,
      color: {
        func: function () {
          if (onSelect && onSelect()) {
            return config.color_select;
          }
          return config.color_dark;
        }
      }
    }]
  },
    stateName = name + ".state";
  ht.Default.setImage(stateName, prop);
  return stateName;
}

export function readLocalFile(blob, callback, asURL) {
  const reader = new FileReader;
  reader.onloadend = function (e) {
    callback(e.target.result);
  };
  asURL ? reader.readAsDataURL(blob) : reader.readAsText(blob);
}

export function layoutMainView(pane, body) {
  if (body) {
    if (body === document.body) {
      document.title = getString("editor.title");
      document.body.style.overflow = "hidden";
    }
    body.appendChild(pane.getView());
    const style = pane.getView().style;
    style.left = "0px";
    style.top = "0px";
    setInterval(function () {
      if (pane.getView() !== (document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement || document.msFullscreenElement)) {
        let width = undefined,
          height = undefined;
        if (body === document.body) {
          width = document.documentElement.clientWidth;
          if (window.innerWidth && window.innerWidth < width) {
            width = window.innerWidth;
          }
          height = document.documentElement.clientHeight;
          if (window.innerHeight && window.innerHeight < height) {
            height = window.innerHeight
          }
        } else {
          width = body.clientWidth;
          height = body.clientHeight
        }
        if (width !== pane._oldWidth || height !== pane._oldHeight) {
          pane._oldWidth = width;
          pane._oldHeight = height;
          style.width = width + "px";
          style.height = height + "px";
          pane.iv();
        }
      }
    }, 500)
  }
}

export function snapshot(view) {
  if (view instanceof ht.graph.GraphView) {
    const rect = view.getContentRect(),
      max = Math.max(rect.width, rect.height),
      min = Math.min(rect.width, rect.height),
      zoom = Math.max(1 / min, config.imageSize / max);
    return view.toDataURL(undefined, undefined, zoom)
  }
  if (view instanceof ht.graph3d.Graph3dView) {
    let w = view.getWidth(),
      h = view.getHeight(),
      max = Math.max(w, h),
      min = Math.min(1, config.imageSize / max);
    max < 3 && (min = config.imageSize / max);
    w = Math.floor(w * min);
    h = Math.floor(h * min);
    return view.toCanvas(view.dm().getBackground(), w, h).toDataURL("image/png", 1)
  }
  if (ht.ui && view instanceof ht.ui.View) {
    const width = view.getWidth(),
      height = view.getHeight(),
      max = Math.max(width, height);
    let min = Math.min(1, config.imageSize / max);
    max < 3 && (min = config.imageSize / max);
    const w = Math.floor(width * min),
      h = Math.floor(height * min);
    const root = view.getRootCanvas(),
      rect1 = (root || view.getView()).getBoundingClientRect(),
      canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d"),
      handler = function (list) {
        for (let i = 0; i < list.size(); i++) {
          const item = list.get(i);
          if (item === view) {
            root && ctx.drawImage(root, 0, 0, i, height, 0, 0, w, h);
          } else {
            const root = item.getRootCanvas();
            if (root) {
              const rect2 = root.getBoundingClientRect();
              ctx.drawImage(root, 0, 0, root.width, root.height, (rect2.left - rect1.left) / i * w,
                (rect2.top - rect1.top) / height * h, root.width / i * w, root.height / height * h)
            }
          }
          if (item instanceof ht.ui.UIGraphView || item instanceof ht.ui.UIGraph3dView) {
            const view = item.getContent(),
              convas = view.toCanvas();
            if (convas) {
              const rect2 = view._canvas.getBoundingClientRect();
              ctx.drawImage(convas, 0, 0, convas.width, convas.height, (rect2.left - rect1.left) / i * w,
                (rect2.top - rect1.top) / height * h, convas.width / i * w, convas.height / height * h)
            }
          }
          item.getChildren && item.getChildren().size() > 0 && handler(item.getChildren())
        }
      },
      list = new ht.List;
    list.add(view);
    handler(list);
    return canvas.toDataURL("image/png", 1)
  }
  const img = ht.Default.getImage(view),
    _max = Math.max(img.width, img.height),
    _min = Math.min(1, config.imageSize / _max);
  return ht.Default.toCanvas(view, img.width * _min, img.height * _min).toDataURL("image/png", 1)
}

export function getDataBindingMap(items, map, binding) {
  const length = items.length;
  if (items instanceof Array) {
    for (let i = 0; i < length; i++) {
      getDataBindingMap(items[i], map, binding);
    }
  } else if (isObject(items) && !(items instanceof ht.DataModel)) {
    for (const key in items) {
      const item = items[key];
      if (!isObject(item)) continue;
      if (isString(item.func) && BINDING.test(item.func)) {
        const name = item.func.slice(5);
        map?.[name] === undefined && (map[name] = key);
        binding?.[name] === undefined && (binding[name] = item.value);
      } else {
        getDataBindingMap(item, map, binding);
      }
    }
  }
}

export function beginEdit(view, data, column, value) {
  const index = view.getRowIndex(data),
    tx = view.tx(),
    ty = view.ty(),
    height = view.getRowHeight(),
    editorRect = { x: tx, y: height * index + ty, width: column.getWidth(), height };
  view.beginEditing({ column, data, view, editorRect, value });
}

export function initImageIcon(image, editor) {
  image.vectorDataBindingDisabled = true;
  image.enableToolTip();
  image.getToolTip = function () {
    const icon = ht.Default.getImage(this.getIcon()),
      w = ht.Default.getInternal().getImageWidth(icon),
      h = ht.Default.getInternal().getImageHeight(icon);
    return w && h ? w + ", " + h : undefined
  };
  image.setExtraInfo = function (info) {
    const name = info?.url || info;
    image.actionURL = info?.actionURL || info;
    image.setIconColor(info?.iconColor || undefined);
    const img = ht.Default.getImage(name);
    if (img?.snapshotURL) {
      image.setIcon(img.snapshotURL);
    } else {
      image.setIcon(name);
    }
  };
  const el = image.getView();
  el.style.cursor = "pointer";
  const handler = function (e) {
    e.preventDefault();
    if (isDoubleClick(e)) {
      editor.open(image.actionURL)
    } else {
      editor.selectFileNode(image.actionURL);
    }
  };
  el.addEventListener("mousedown", handler, false);
  el.addEventListener("touchstart", handler, false);
}

export function initInputDND(input, isDroppable, callback) {
  let el = input;
  if (input.getElement) {
    el = input.getElement();
  } else if (input.getView) {
    input.getView();
  }
  let border = undefined;
  input.isDroppable = isDroppable;
  input.handleCrossDrag = (e, state, info) => {
    if (state === "enter") {
      border = el.style.border;
      el.style.border = "solid " + config.color_select_dark + " 2px";
    } else if (["exit", "cancel"].includes(state)) {
      el.style.border = border;
    } else if (["over", "drop"].includes(state)) {
      callback(info.view.draggingData);
      el.style.border = border;
      input.setFocus && input.setFocus();
    }
  }
}

export function getTip(view) {
  let tip = "";
  const data = view.draggingData;
  if (data) {
    tip = view.getLabel(data);
    if (view.isSelected(data)) {
      const size = view.sm().size();
      tip += size > 1 ? " (+" + size + ") " : ""
    }
  }
  return tip;
}

export function positionImg(e, dragImage) {
  if (dragImage) {
    const size = config.dragImageSize,
      point = getPagePoint(e);
    dragImage.style.left = point.x - size / 2 + "px";
    dragImage.style.top = point.y - size / 2 + "px";
  }
}

export const isFF = /firefox/.test(window.navigator.userAgent.toLowerCase());
