import { getString } from "../util/index.js";
import { renderUI, setProperty, updateBaseProperty, updateProperty } from "../util/type.js";

export default class Basic extends ht.Node {
  constructor(prop, w, h) {
    super();
    this.parse(prop, w, h)
  }

  getClass() {
    return Basic;
  }

  toLabel() {
    return this.getDisplayName() || getString("editor.comptype." + this.s("shape").toLowerCase());
  }

  parse(prop, w, h) {
    if (prop) {
      setProperty(this, "shape", prop.type, "rect");
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
      setProperty(this, "shape.border.width.absolute", prop.borderWidthAbsolute);
      setProperty(this, "shape.fill.clip.direction", prop.fillClipDirection);
      setProperty(this, "shape.fill.clip.percentage", prop.fillClipPercentage)
      if (this.compType == "rect") setProperty(this, "shape.depth", prop.depth);
      if (this.compType === "roundRect") setProperty(this, "shape.corner.radius", prop.cornerRadius);
      if (this.compType === "polygon") setProperty(this, "shape.polygon.side", prop.polygonSide);
      if (this.compType === "arc") {
        setProperty(this, "shape.arc.from", prop.arcFrom);
        setProperty(this, "shape.arc.to", prop.arcTo);
        setProperty(this, "shape.arc.close", prop.arcClose);
        setProperty(this, "shape.arc.oval", prop.arcOval);
      }
      renderUI(this, prop, w, h);
    }
  }

  toJSON() {
    const prop = {};
    updateProperty(this, prop, "shape", "type", undefined);
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
    updateProperty(this, prop, "shape.border.width.absolute", "borderWidthAbsolute");
    updateProperty(this, prop, "shape.fill.clip.direction", "fillClipDirection");
    updateProperty(this, prop, "shape.fill.clip.percentage", "fillClipPercentage");
    if (this.compType === "rect") updateProperty(this, prop, "shape.depth", "depth");
    if (this.compType === "roundRect") updateProperty(this, prop, "shape.corner.radius", "cornerRadius");
    if (this.compType === "polygon") updateProperty(this, prop, "shape.polygon.side", "polygonSide");
    if (this.compType === "arc") {
      updateProperty(this, prop, "shape.arc.from", "arcFrom");
      updateProperty(this, prop, "shape.arc.to", "arcTo");
      updateProperty(this, prop, "shape.arc.close", "arcClose");
      updateProperty(this, prop, "shape.arc.oval", "arcOval");
    }
    updateBaseProperty(this, prop);
    return prop;
  }

  get compType() {
    return this.s("shape");
  }
}