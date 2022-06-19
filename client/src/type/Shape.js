import { getString, parseValue, updateValue, getFunc } from "../util/index.js";

import {
  renderUI, setProperty, updateBaseProperty,
  toPoints, toPointList, updateProperty
} from "../util/type.js";

export default class Shape extends ht.Shape {
  constructor(prop, w, h) {
    super()
    this.parse(prop, w, h);
  }

  getClass() {
    return Shape;
  }

  toLabel() {
    return this.getDisplayName() || getString("editor.comptype.shape");
  }

  parse(prop, w, h) {
    if (prop) {
      setProperty(this, "type", prop.type, "shape");
      setProperty(this, "shape.background", prop.background, null);
      setProperty(this, "shape.repeat.image", prop.repeatImage);
      setProperty(this, "shape.border.width", prop.borderWidth);
      setProperty(this, "shape.border.color", prop.borderColor, null);
      setProperty(this, "shape.border.3d", prop.border3d);
      setProperty(this, "shape.border.3d.color", prop.border3dColor);
      setProperty(this, "shape.border.3d.accuracy", prop.border3dAccuracy);
      setProperty(this, "shape.border.cap", prop.borderCap);
      setProperty(this, "shape.border.join", prop.borderJoin);
      setProperty(this, "shape.border.pattern", prop.borderPattern);
      setProperty(this, "shape.gradient", prop.gradient);
      setProperty(this, "shape.gradient.color", prop.gradientColor);
      setProperty(this, "shape.dash", prop.dash);
      setProperty(this, "shape.dash.pattern", prop.dashPattern);
      setProperty(this, "shape.dash.offset", prop.dashOffset);
      setProperty(this, "shape.dash.color", prop.dashColor);
      setProperty(this, "shape.dash.width", prop.dashWidth);
      setProperty(this, "shape.dash.3d", prop.dash3d);
      setProperty(this, "shape.dash.3d.color", prop.dash3dColor);
      setProperty(this, "shape.dash.3d.accuracy", prop.dash3dAccuracy);
      setProperty(this, "shape.fill.rule", prop.fillRule);
      setProperty(this, "shape.fill.clip.direction", prop.fillClipDirection);
      setProperty(this, "shape.fill.clip.percentage", prop.fillClipPercentage);
      setProperty(this, "shape.gradient.pack", prop.gradientPack);
      setProperty(this, "shape.border.width.absolute", prop.borderWidthAbsolute);
      renderUI(this, prop, w, h);
      this.setClosePath(parseValue(prop.closePath, false));
      this.a("closePath", getFunc(prop.closePath));
      this.setPoints(toPointList(parseValue(prop.points)));
      this.setSegments(parseValue(prop.segments));
    }
  }

  toJSON() {
    const prop = {};
    updateProperty(this, prop, "type", "type", undefined);
    updateProperty(this, prop, "shape.background", "background", null);
    updateProperty(this, prop, "shape.repeat.image", "repeatImage");
    updateProperty(this, prop, "shape.border.width", "borderWidth");
    updateProperty(this, prop, "shape.border.color", "borderColor", null);
    updateProperty(this, prop, "shape.border.3d", "border3d");
    updateProperty(this, prop, "shape.border.3d.color", "border3dColor");
    updateProperty(this, prop, "shape.border.3d.accuracy", "border3dAccuracy");
    updateProperty(this, prop, "shape.border.cap", "borderCap");
    updateProperty(this, prop, "shape.border.join", "borderJoin");
    updateProperty(this, prop, "shape.border.pattern", "borderPattern");
    updateProperty(this, prop, "shape.gradient", "gradient");
    updateProperty(this, prop, "shape.gradient.color", "gradientColor");
    updateProperty(this, prop, "shape.dash", "dash");
    updateProperty(this, prop, "shape.dash.pattern", "dashPattern");
    updateProperty(this, prop, "shape.dash.offset", "dashOffset");
    updateProperty(this, prop, "shape.dash.color", "dashColor");
    updateProperty(this, prop, "shape.dash.width", "dashWidth");
    updateProperty(this, prop, "shape.dash.3d", "dash3d");
    updateProperty(this, prop, "shape.dash.3d.color", "dash3dColor");
    updateProperty(this, prop, "shape.dash.3d.accuracy", "dash3dAccuracy");
    updateProperty(this, prop, "shape.fill.rule", "fillRule");
    updateProperty(this, prop, "shape.fill.clip.direction", "fillClipDirection");
    updateProperty(this, prop, "shape.fill.clip.percentage", "fillClipPercentage");
    updateProperty(this, prop, "shape.gradient.pack", "gradientPack");
    updateProperty(this, prop, "shape.border.width.absolute", "borderWidthAbsolute");
    updateBaseProperty(this, prop);
    updateValue(prop, "closePath", this.a("closePath"), this.isClosePath(), false);
    updateValue(prop, "points", this.a("points"), toPoints(this.getPoints()));
    if (this.getSegments()) {
      const segments = this.getSegments().toArray();
      if (segments.length) {
        let hasSegment = segments[0] === 1;
        if (hasSegment) {
          for (let i = 1; i < segments.length; i++)
            if (segments[i] !== 2) {
              hasSegment = false;
              break;
            }
        }
        hasSegment || updateValue(prop, "segments", this.a("segments"), segments);
      }
    }
    return prop;
  }

  get compType() {
    return this.s("type");
  }
}
