import { MAP } from "../constants.js";
import Basic from "../type/Basic.js";
import Shape from "../type/Shape.js";
import Clip from "../type/Clip.js";
import Image from "../type/Image.js";
import Restore from "../type/Restore.js";
import { clone, getString } from "./index.js";

export function toJson(node) {
  if (!(node instanceof ht.Node)) return null;
  if (node instanceof ht.Group || node instanceof ht.Grid || node instanceof ht.Block) return null;
  let prop = undefined;
  if (node instanceof Clip) {
    prop = {
      type: "clip",
      points: clone(node.getPoints()),
      segments: clone(node.getSegments()),
      closePath: node.isClosePath()
    };
  } else if (node instanceof Restore) {
    prop = { type: "restore" };
  } else if (node instanceof ht.Shape) {
    prop = {
      type: "shape",
      points: clone(node.getPoints()),
      segments: clone(node.getSegments()),
      closePath: node.isClosePath()
    };
  } else if (node instanceof ht.Text) {
    prop = {
      type: "text",
      text: node.s("text"),
      align: node.s("text.align"),
      vAlign: node.s("text.vAlign"),
      color: node.s("text.color"),
      gradientPack: node.s("text.gradient.pack"),
      font: node.s("text.font"),
      shadow: node.s("text.shadow"),
      shadowColor: node.s("text.shadow.color"),
      shadowBlur: node.s("text.shadow.blur"),
      shadowOffsetX: node.s("text.shadow.offset.x"),
      shadowOffsetY: node.s("text.shadow.offset.y")
    };
  } else if (node instanceof ht.Node) {
    const shape = node.s("shape");
    if (shape) {
      prop = {
        type: "node_shape",
        shape: node.s("shape")
      };
      if (shape === "rect") {
        prop.depth = node.s("shape.depth")
      } else if (shape === "roundRect") {
        prop.polygonSide = node.s("shape.corner.radius")
      } else if (shape === "polygon") {
        prop.polygonSide = node.s("shape.polygon.side")
      } else if (shape === "arc") {
        prop.arcFrom = node.s("shape.arc.from");
        prop.arcTo = node.s("shape.arc.to");
        prop.arcClose = node.s("shape.arc.close");
        prop.arcOval = node.s("shape.arc.oval");
      }
    } else if (node.getImage()) {
      prop = {
        type: "node_image",
        image: node.getImage(),
        stretch: node.s("image.stretch"),
        color: node.s("body.color")
      }
    }
  }
  if (prop) {
    prop.visible = node.s("2d.visible");
    prop.displayName = node.getDisplayName();
    prop.x = node.getPosition().x;
    prop.y = node.getPosition().y;
    prop.anchorX = node.getAnchor().x;
    prop.anchorY = node.getAnchor().y;
    prop.scaleX = node.getScale().x;
    prop.scaleY = node.getScale().y;
    prop.rotation = node.getRotation();
    prop.width = node._width;
    prop.height = node._height;
    prop.opacity = node.s("opacity");
    if (["shape", "node_shape"].includes(prop.type)) {
      prop.background = node.s("shape.background");
      prop.repeatImage = node.s("shape.repeat.image");
      prop.borderWidth = node.s("shape.border.width");
      prop.borderColor = node.s("shape.border.color");
      prop.border3d = node.s("shape.border.3d");
      prop.border3dColor = node.s("shape.border.3d.color");
      prop.border3dAccuracy = node.s("shape.border.3d.accuracy");
      prop.borderCap = node.s("shape.border.cap");
      prop.borderJoin = node.s("shape.border.join");
      prop.borderPattern = node.s("shape.border.pattern");
      prop.gradient = node.s("shape.gradient");
      prop.gradientColor = node.s("shape.gradient.color");
      prop.dash = node.s("shape.dash");
      prop.dashPattern = node.s("shape.dash.pattern");
      prop.dashOffset = node.s("shape.dash.offset");
      prop.dashColor = node.s("shape.dash.color");
      prop.dashWidth = node.s("shape.dash.width");
      prop.dash3d = node.s("shape.dash.3d");
      prop.dash3dColor = node.s("shape.dash.3d.color");
      prop.dash3dAccuracy = node.s("shape.dash.3d.accuracy");
      prop.fillRule = node.s("shape.fill.rule");
      prop.fillClipDirection = node.s("shape.fill.clip.direction");
      prop.fillClipPercentage = node.s("shape.fill.clip.percentage");
      prop.gradientPack = clone(node.s("shape.gradient.pack"))
      prop.borderWidthAbsolute = node.s("shape.border.width.absolute")
    }
  }
  return prop;
}

export function toNode(prop, popup) {
  let node = null;
  if (prop.type === "clip") {
    if (popup) {
      node = new Clip;
      node.s("type", "clip");
      node.setPoints(prop.points);
      node.setSegments(prop.segments);
    }
  } else if (prop.type === "restore") {
    if (popup) {
      node = new Restore;
      node.s("type", "restore")
    }
  } else if (prop.type === "shape") {
    if (popup) {
      node = new Shape;
    } else {
      node = new ht.Shape;
    }
    node.s("type", "shape");
    node.setPoints(prop.points);
    node.setSegments(prop.segments);
    node.setClosePath(prop.closePath);
  } else if (prop.type === "node_shape") {
    if (popup) {
      node = new Basic
    } else {
      node = new ht.Node;
    }
    const shape = prop.shape;
    node.s("shape", shape);
    if (shape === "rect") {
      node.s("shape.depth", prop.depth)
    } else if (node === "roundRect") {
      node.s("shape.corner.radius", prop.polygonSide)
    } else if (node === "polygon") {
      node.s("shape.polygon.side", prop.polygonSide)
    } else if (node === "arc") {
      node.s("shape.arc.from", prop.arcFrom);
      node.s("shape.arc.to", prop.arcTo);
      node.s("shape.arc.close", prop.arcClose);
      node.s("shape.arc.oval", prop.arcOval);
    }
  } else if (prop.type === "node_image") {
    if (popup) {
      node = new Image;
      node.s("type", "image");
      node.s("image", prop.image);
    } else {
      node = new ht.Node;
      node.setImage(prop.image);
    }
    node.s("body.color", prop.color)
  } else if (prop.type === "text") {
    if (popup) {
      node = new Text;
    }
    node = new ht.Text;
    node.s("type", "text");
    node.s("text", prop.text);
    node.s("text.align", prop.align);
    node.s("text.vAlign", prop.vAlign);
    node.s("text.color", prop.color);
    node.s("text.gradient.pack", prop.gradientPack);
    node.s("text.font", prop.font);
    node.s("text.shadow", prop.shadow);
    node.s("text.shadow.color", prop.shadowColor);
    node.s("text.shadow.blur", prop.shadowBlur);
    node.s("text.shadow.offset.x", prop.shadowOffsetX);
    node.s("text.shadow.offset.y", prop.shadowOffsetY);
  }
  node.s("2d.visible", prop.visible);
  node.setDisplayName(prop.displayName);
  node.setPosition(prop.x, prop.y);
  if (!(prop.anchorX === .5 && prop.anchorY === .5)) {
    node.setAnchor(prop.anchorX, prop.anchorY);
  }
  node.setScale(prop.scaleX, prop.scaleY);
  node.setRotation(prop.rotation);
  node.setSize(prop.width, prop.height);
  node.s("opacity", prop.opacity);
  if (["shape", "node_shape"].includes(prop.type)) {
    node.s("shape.background", prop.background);
    node.s("shape.repeat.image", prop.repeatImage);
    node.s("shape.border.width", prop.borderWidth);
    node.s("shape.border.color", prop.borderColor);
    node.s("shape.border.3d", prop.border3d);
    node.s("shape.border.3d.color", prop.border3dColor);
    node.s("shape.border.3d.accuracy", prop.border3dAccuracy);
    node.s("shape.border.cap", prop.borderCap);
    node.s("shape.border.join", prop.borderJoin);
    node.s("shape.border.pattern", prop.borderPattern);
    node.s("shape.gradient", prop.gradient);
    node.s("shape.gradient.color", prop.gradientColor);
    node.s("shape.dash", prop.dash);
    node.s("shape.dash.pattern", prop.dashPattern);
    node.s("shape.dash.offset", prop.dashOffset);
    node.s("shape.dash.color", prop.dashColor);
    node.s("shape.dash.width", prop.dashWidth);
    node.s("shape.dash.3d", prop.dash3d);
    node.s("shape.dash.3d.color", prop.dash3dColor);
    node.s("shape.dash.3d.accuracy", prop.dash3dAccuracy);
    node.s("shape.fill.rule", prop.fillRule);
    node.s("shape.fill.clip.direction", prop.fillClipDirection);
    node.s("shape.fill.clip.percentage", prop.fillClipPercentage);
    node.s("shape.gradient.pack", clone(prop.gradientPack));
    node.s("shape.border.width.absolute", prop.borderWidthAbsolute);
  }
  return node;
}

export function initConsts() {
  const consts = tpeditor.consts = {};
  consts.edgeTypes = tpeditor.config.edgeTypes;
  consts.edgeTypeLabels = tpeditor.config.edgeTypes.map(item => {
    const str = getString("edgeType." + item, true);
    return str || item
  });
  consts.aligns = ["left", "center", "right"];
  consts.alignLabels = [getString("editor.align.left"), getString("editor.align.center"), getString("editor.align.right")];
  consts.vAligns = ["top", "middle", "bottom"];
  consts.vAlignLabels = [getString("editor.valign.top"), getString("editor.valign.middle"), getString("editor.valign.bottom")];
  consts.stretchs = ["fill", "uniform", "centerUniform"];
  consts.stretchLabels = [getString("editor.stretch.fill"), getString("editor.stretch.uniform"), getString("editor.stretch.centeruniform")];
  consts.fillRules = ["nonzero", "evenodd"];
  consts.fillRuleLabels = [getString("editor.nonzero"), getString("editor.evenodd")];
  consts.clipDirections = ["top", "bottom", "left", "right"];
  consts.clipDirectionLabels = [
    getString("editor.clipdirection.top"), getString("editor.clipdirection.bottom"),
    getString("editor.clipdirection.left"), getString("editor.clipdirection.right")
  ];
  consts.caps = ["butt", "round", "square"];
  consts.capLabels = [getString("editor.cap.butt"), getString("editor.cap.round"), getString("editor.cap.square")];
  consts.joins = ["bevel", "round", "miter"];
  consts.joinLabels = [getString("editor.join.bevel"), getString("editor.join.round"), getString("editor.join.miter")];
  consts.directions = ["h", "v"];
  consts.directionLabels = [getString("editor.direction.h"), getString("editor.direction.v")];
  consts.orientations = ["top", "right", "bottom", "left"];
  consts.orientationLabels = [
    getString("editor.orientation.top"), getString("editor.orientation.right"),
    getString("editor.orientation.bottom"), getString("editor.orientation.left")
  ];
  consts.columnChartTypes = ["columnChart", "stackedColumnChart", "percentageColumnChart"];
  consts.columnChartTypeLabels = [
    getString("editor.columncharttype.columnchart"), getString("editor.columncharttype.stackedcolumnchart"),
    getString("editor.columncharttype.percentagecolumnchart")
  ];
  consts.gradients = tpeditor.config.gradients;
  consts.shapes = [undefined, "rect", "circle", "oval", "roundRect", "star", "pentagram", "triangle",
    "hexagon", "pentagon", "diamond", "rightTriangle", "parallelogram", "trapezoid", "polygon", "arc"];
  consts.shapeLabels = [];
  consts.shapeIcons = [];
  consts.shapes.forEach(function (type) {
    if (type) {
      consts.shapeLabels.push(getString("editor.comptype." + type.toLowerCase())), consts.shapeIcons.push({
        width: 16,
        height: 16,
        comps: [{ type, rect: [2, 4, 12, 8], borderWidth: 1, borderColor: tpeditor.config.color_dark }]
      });
    } else {
      consts.shapeLabels.push("");
      consts.shapeIcons.push({
        width: 16,
        height: 16,
        comps: []
      })
    }
  });
  consts.selectTypes = ["shadow", "rect", "circle", "oval", "roundRect"];
  consts.selectTypeLabels = [];
  consts.selectTypeIcons = [];
  consts.selectTypes.forEach(item => {
    if (item === "shadow") {
      consts.selectTypeLabels.push(getString("editor.shadow"));
      consts.selectTypeIcons.push({
        width: 16,
        height: 16,
        comps: []
      })
    } else {
      consts.selectTypeLabels.push(getString("editor.comptype." + item.toLowerCase()));
      consts.selectTypeIcons.push({
        width: 16,
        height: 16,
        comps: [{ type: item, rect: [2, 4, 12, 8], borderWidth: 1, borderColor: tpeditor.config.color_dark }]
      })
    }
  });
  consts.displayConnectActionTypes = tpeditor.config.displayConnectActionTypes;
  consts.displayConnectActionTypeLabels = [];
  consts.displayConnectActionTypes.forEach(function (type) {
    const postfix = type ? type.toLowerCase() : "none";
    consts.displayConnectActionTypeLabels.push(getString("editor.connectactiontype." + postfix, true) || getString(type))
  });
  consts.symbolConnectActionTypes = tpeditor.config.symbolConnectActionTypes;
  consts.symbolConnectActionTypeLabels = [];
  consts.symbolConnectActionTypes.forEach(function (type) {
    const postfix = type ? type.toLowerCase() : "none";
    consts.symbolConnectActionTypeLabels.push(getString("editor.connectactiontype." + postfix, true) || getString(type))
  });
  consts.vLayoutValues = [undefined, "top", "bottom", "topbottom", "center", "scale"];
  consts.vLayoutLabels = [
    getString("editor.layout.none"),
    getString("editor.layout.top"),
    getString("editor.layout.bottom"),
    getString("editor.layout.topbottom"),
    getString("editor.layout.center"),
    getString("editor.layout.scale")
  ];
  consts.hLayoutValues = [undefined, "left", "right", "leftright", "center", "scale"];
  consts.hLayoutLabels = [
    getString("editor.layout.none"),
    getString("editor.layout.left"),
    getString("editor.layout.right"),
    getString("editor.layout.leftright"),
    getString("editor.layout.center"),
    getString("editor.layout.scale")
  ];
  consts.fullscreenValues = [undefined, "fill", "uniform"];
  consts.fullscreenLabels = [
    getString("editor.layout.none"),
    getString("editor.stretch.fill"),
    getString("editor.stretch.uniform")
  ];
  consts.fullscreenLockValues = [false, "h", "v"];
  consts.fullscreenLockLabels = [
    getString("editor.layout.none"),
    getString("editor.direction.h"),
    getString("editor.direction.v")
  ];
}

export function initValueTypes() {
  const config = tpeditor.config,
    consts = tpeditor.consts,
    setValueType = function (key, value) {
      if (config.valueTypes[key] === undefined) {
        value.name = "editor.valuetype." + key.toLowerCase();
        config.valueTypes[key] = value;
      }
    };

  setValueType("String", { type: "string" });
  setValueType("Image", { type: "image" });
  setValueType("URL", { type: "url" });
  setValueType("Multiline", { type: "multiline" });
  setValueType("Font", { type: "font" });
  setValueType("Angle", {
    type: "number",
    angle: true
  });
  setValueType("Int", { type: "int", step: 1 });
  setValueType("PositiveNumber", {
    type: "number",
    step: 1,
    min: 0
  });
  setValueType("Number", {
    type: "number",
    step: 1
  });
  setValueType("Color", { type: "color" });
  setValueType("Boolean", { type: "boolean" });
  setValueType("Function", { type: "function" });
  setValueType("Object", { type: "object" }), setValueType("ObjectArray", {
    type: "objectArray",
    rowHeight: 60
  });
  setValueType("StringArray", { type: "stringArray", rowHeight: 60 }),
    setValueType("NumberArray", {
      type: "numberArray",
      rowHeight: 60
    });
  setValueType("ColorArray", { type: "colorArray", rowHeight: 60 });
  setValueType("Opacity", {
    type: "number",
    min: 0,
    max: 1,
    step: .01
  });
  setValueType("Percentage", { type: "number", min: 0, max: 1, step: .01 });
  setValueType("Gradient", {
    type: "enum",
    values: config.gradients,
    icons: config.gradientIcons,
    dropDownWidth: 140
  });
  setValueType("FillRule", { type: "enum", values: consts.fillRules, labels: consts.fillRuleLabels });
  setValueType("ClipDirection", {
    type: "enum",
    values: consts.clipDirections,
    labels: consts.clipDirectionLabels
  });
  setValueType("CapStyle", { type: "enum", values: consts.caps, labels: consts.capLabels });
  setValueType("JoinStyle", {
    type: "enum",
    values: consts.joins,
    labels: consts.joinLabels
  });
  setValueType("Align", { type: "enum", values: consts.aligns, labels: consts.alignLabels }),
    setValueType("VAlign", {
      type: "enum",
      values: consts.vAligns,
      labels: consts.vAlignLabels
    });
  setValueType("Stretch", { type: "enum", values: consts.stretchs, labels: consts.stretchLabels }),
    setValueType("Direction", {
      type: "enum",
      values: consts.directions,
      labels: consts.directionLabels
    });
  setValueType("Orientation", {
    type: "enum",
    values: consts.orientations,
    labels: consts.orientationLabels
  });
  setValueType("ColumnChart", {
    type: "enum",
    values: consts.columnChartTypes,
    labels: consts.columnChartTypeLabels
  });
  setValueType("DataModel", { type: "dataModel" });
  consts.valueTypes = [];
  consts.valueTypeLabels = [];
  for (const key in tpeditor.config.valueTypes) {
    const valueType = tpeditor.config.valueTypes[key];
    if (valueType.type) {
      consts.valueTypes.push(key);
      consts.valueTypeLabels.push(getString(valueType.name) || getString(key));
      if (valueType.type === "enum" && valueType.i18nLabels && !valueType.labels) {
        valueType.labels = [];
        valueType.i18nLabels.forEach(item => {
          valueType.labels.push(getString(item))
        })
      }
    }
  }
}

export function initCustomProperties() {
  const display = tpeditor.config.customProperties.display;
  display?.forEach?.(function (keys) {
    const key = (keys.accessType || "a") + ":" + keys.property;
    MAP.display[key] = true;
  });
  const data = tpeditor.config.customProperties.data;
  data?.forEach?.(function (keys) {
    const key = (keys.accessType || "a") + ":" + keys.property;
    MAP.data[key] = true;
  });
  const symbol = tpeditor.config.customProperties.symbol;
  symbol?.forEach?.(function (keys) {
    MAP.symbol[keys.property] = true;
  });

  const comp = tpeditor.config.customProperties.comp;
  comp?.forEach?.(function (keys) {
    MAP.comp[keys.property] = true;
  });
  const scene = tpeditor.config.customProperties.scene;
  scene?.forEach?.(function (keys) {
    const key = (keys.accessType || "a") + ":" + keys.property;
    MAP.scene[key] = true;
  });

  const data3d = tpeditor.config.customProperties.data3d;
  data3d?.forEach?.(function (keys) {
    const key = (keys.accessType || "a") + ":" + keys.property;
    MAP.data3d[key] = true;
  });
}
