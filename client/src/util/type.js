import { EVENTS, PREFIX } from "../constants.js";
import { clone, isString, getFunc, parseValue, updateValue, getPosition, parse } from "./index.js";

export function renderUI(data, prop, w, h) {
  function updateDisplayName(node, prop) {
    node.setDisplayName(parseValue(prop.displayName), undefined);
    node.a("displayName", getFunc(prop.displayName));
  }

  function updateRotation(node, prop) {
    node.setRotation(parseValue(prop.rotation, 0));
    node.a("rotation", getFunc(prop.rotation))
  }

  function updateAnchor(node, prop) {
    let anchorX = parseValue(prop.anchorX, .5),
      anchorY = parseValue(prop.anchorY, .5);
    anchorX === .5 && anchorY === .5 || node.setAnchor(anchorX, anchorY);
    node.a("anchorX", getFunc(prop.anchorX));
    node.a("anchorY", getFunc(prop.anchorY));
  }

  function updateScale(node, prop) {
    let scaleX = parseValue(prop.scaleX, 1),
      scaleY = parseValue(prop.scaleY, 1);
    node.setScale(scaleX, scaleY);
    node.a("scaleX", getFunc(prop.scaleX));
    node.a("scaleY", getFunc(prop.scaleY));
  }

  function updateLayout(data, prop, w, h) {
    let rect = parseValue(prop.rect),
      relative = parseValue(prop.relative);
    if (!rect) {
      rect = [0, 0, w, h];
      relative = false;
    }
    const len = rect.length;
    if (len === 4) {
      rect = {
        x: rect[0],
        y: rect[1],
        width: rect[2],
        height: rect[3]
      };
      if (relative) {
        rect.x *= w;
        rect.y *= h;
        rect.width *= w;
        rect.height *= h;
      }
    } else if (len === 3) {
      let point = rect[0];
      rect = {
        width: rect[1],
        height: rect[2]
      };
      if (relative) {
        rect.width *= w;
        rect.height *= h;
      }
      if (typeof point === "object") {
        if (point.length) {
          point = {
            x: point[0],
            y: point[1]
          };
        } else {
          point = getPosition(point, {
            x: 0,
            y: 0,
            width: w,
            height: h
          }, rect);
        }
      }
      rect.x = point.x - rect.width * data.getAnchor().x;
      rect.y = point.y - rect.height * data.getAnchor().y;
    }
    let value = parseValue(prop.offsetX);
    value && (rect.x += value);
    value = parseValue(prop.offsetY);
    value && (rect.y += value);
    if (rect.width < 0 || rect.height < 0) {
      data.p(rect.x, rect.y)
    } else {
      data.setRect(rect);
    }
    data.a("rect", getFunc(prop.rect));
  }

  setProperty(data, "2d.visible", prop.visible);
  setProperty(data, "2d.selectable", prop.selectable);
  setProperty(data, "2d.movable", prop.movable);
  setProperty(data, "2d.editable", prop.editable);
  setProperty(data, "pixelPerfect", prop.pixelPerfect, false);
  setProperty(data, "opacity", prop.opacity, 1);
  setProperty(data, "clip.percentage", prop.clipPercentage, 1);
  setProperty(data, "clip.direction", prop.clipDirection, "top");
  setProperty(data, "layout.h", prop.layoutH);
  setProperty(data, "layout.v", prop.layoutV);
  setProperty(data, "prefix", prop.prefix);
  setProperty(data, "state", prop.state);
  if (!(data instanceof ht.Text)) {
    setProperty(data, "shadow", prop.shadow, false);
    setProperty(data, "select.color", prop.shadowColor, ht.Color.highlight);
    setProperty(data, "shadow.blur", prop.shadowBlur, 60);
    setProperty(data, "shadow.offset.x", prop.shadowOffsetX, 3);
    setProperty(data, "shadow.offset.y", prop.shadowOffsetY, 3)
  }
  updateDisplayName(data, prop);
  updateAnchor(data, prop);
  updateScale(data, prop);
  updateRotation(data, prop);
  if (!(data instanceof ht.Shape) || prop.rect) {
    updateLayout(data, prop, w, h);
  }
  const comp = tpeditor.config.customProperties.comp;
  Array.isArray(comp) && comp.forEach(function (item) {
    setProperty(data, item.property, prop[item.property], item.defaultValue);
  });
  EVENTS.forEach(function (item) {
    data.a(item, prop[item]);
  });
  data.a("renderHTML", prop.renderHTML);
}

export function setProperty(node, name, value, defaultValue = ht.Style[name]) {
  let val = parseValue(value, defaultValue);
  if (isString(val)) {
    const prefix = val.substring(0, 15);
    if (prefix === PREFIX) {
      const dm = new ht.DataModel;
      dm.deserialize(parse(prefix));
      val = dm;
    }
  }
  node.s(name, clone(val));
  node.a(name, getFunc(value));
}

export function updateBaseProperty(data, prop) {
  function resetRect(node, prop) {
    const x = node.getPosition().x,
      y = node.getPosition().y,
      w = node.getWidth(),
      h = node.getHeight(),
      rec = [x - w * node.getAnchor().x, y - h * node.getAnchor().y, w, h];
    updateValue(prop, "rect", node.a("rect"), rec, undefined)
  }

  function resetRotation(node, prop) {
    const rotation = node.getRotation();
    updateValue(prop, "rotation", node.a("rotation"), rotation, 0)
  }

  function resetAnchor(node, prop) {
    const x = node.getAnchor().x,
      anchorX = node.a("anchorX");
    updateValue(prop, "anchorX", anchorX, x, .5);
    const y = node.getAnchor().y,
      anchorY = node.a("anchorY");
    updateValue(prop, "anchorY", anchorY, y, .5)
  }

  function resetScaleX(node, prop) {
    const x = node.getScale().x,
      scaleX = node.a("scaleX");
    updateValue(prop, "scaleX", scaleX, x, 1);
    const y = node.getScale().y,
      scaleY = node.a("scaleY");
    updateValue(prop, "scaleY", scaleY, y, 1);
  }

  function resetDisplayName(data, prop) {
    const name = data.getDisplayName();
    updateValue(prop, "displayName", data.a("displayName"), name, undefined)
  }

  updateProperty(data, prop, "2d.visible", "visible");
  updateProperty(data, prop, "2d.selectable", "selectable");
  updateProperty(data, prop, "2d.movable", "movable");
  updateProperty(data, prop, "2d.editable", "editable");
  updateProperty(data, prop, "pixelPerfect", "pixelPerfect", false);
  updateProperty(data, prop, "opacity", "opacity", 1);
  updateProperty(data, prop, "clip.percentage", "clipPercentage", 1);
  updateProperty(data, prop, "clip.direction", "clipDirection", "top");
  updateProperty(data, prop, "layout.h", "layoutH");
  updateProperty(data, prop, "layout.v", "layoutV");
  updateProperty(data, prop, "prefix", "prefix");
  updateProperty(data, prop, "state", "state");

  if (!(data instanceof ht.Text)) {
    updateProperty(data, prop, "shadow", "shadow", false);
    updateProperty(data, prop, "select.color", "shadowColor", ht.Color.highlight);
    updateProperty(data, prop, "shadow.blur", "shadowBlur", 6);
    updateProperty(data, prop, "shadow.offset.x", "shadowOffsetX", 3);
    updateProperty(data, prop, "shadow.offset.y", "shadowOffsetY", 3)
  }
  resetDisplayName(data, prop);
  resetAnchor(data, prop);
  resetScaleX(data, prop);
  resetRotation(data, prop);
  if (!(data instanceof ht.Shape) || data.a("rect")) {
    resetRect(data, prop);
  }
  const comp = tpeditor.config.customProperties.comp,
    hasDefaultValue = !!tpeditor.config.saveCompCustomPropertyDefaultValue;
  Array.isArray(comp) && comp.forEach(function (item) {
    if (hasDefaultValue) {
      updateProperty(data, prop, item.property, item.property);
    } else {
      updateProperty(data, prop, item.property, item.property, item.defaultValue);
    }
  });
  EVENTS.forEach(function (item) {
    if (data.a(item)) {
      prop[item] = data.a(item);
    }
  });
  data.a("renderHTML") && (prop.renderHTML = data.a("renderHTML"));
}

export function updateProperty(data, prop, styleName, attrName, defaultValue = ht.Style[styleName]) {
  const value = clone(data.s(styleName));
  updateValue(prop, attrName, data.a(styleName), value, defaultValue)
}

export function toPointList(array) {
  if (Array.isArray(array)) {
    const list = new ht.List,
      count = array.length;
    for (let i = 0; i < count; i += 2) {
      list.add({ x: array[i], y: array[i + 1] });
    }
    array = list;
  }
  return array;
}

export function toPoints(data) {
  if (data instanceof ht.List) {
    data = data.toArray();
    if (Array.isArray(data)) {
      const arr = [];
      for (let i = 0; i < data.length; i++) {
        const point = data[i];
        arr.push(point.x, point.y);
      }
      data = arr;
    }
  }
  return data;
}
