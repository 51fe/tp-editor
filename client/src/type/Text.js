import { getString } from "../util/index.js";
import { renderUI, setProperty, updateBaseProperty, updateProperty } from "../util/type.js";

export default class Text extends ht.Node {
  constructor(prop, w, h) {
    super();
    this.parse(prop, w, h)
  }

  getClass() {
    return Text;
  }

  toLabel() {
    return this.getDisplayName() || this.s("text") || getString("editor.comptype.text");
  }

  parse(prop, w, h) {
    if (prop) {
      setProperty(this, "type", prop.type, "text");
      setProperty(this, "text", prop.text);
      setProperty(this, "text.align", prop.align);
      setProperty(this, "text.vAlign", prop.vAlign);
      setProperty(this, "text.color", prop.color);
      setProperty(this, "text.gradient.pack", prop.gradientPack);
      setProperty(this, "text.font", prop.font);
      setProperty(this, "text.shadow", prop.shadow);
      setProperty(this, "text.shadow.color", prop.shadowColor);
      setProperty(this, "text.shadow.blur", prop.shadowBlur);
      setProperty(this, "text.shadow.offset.x", prop.shadowOffsetX);
      setProperty(this, "text.shadow.offset.y", prop.shadowOffsetY);
      renderUI(this, prop, w, h);
    }
  }

  toJSON() {
    const prop = {};
    updateProperty(this, prop, "type", "type", undefined);
    updateProperty(this, prop, "text", "text");
    updateProperty(this, prop, "text.align", "align");
    updateProperty(this, prop, "text.vAlign", "vAlign");
    updateProperty(this, prop, "text.color", "color");
    updateProperty(this, prop, "text.gradient.pack", "gradientPack");
    updateProperty(this, prop, "text.font", "font");
    updateProperty(this, prop, "text.shadow", "shadow");
    updateProperty(this, prop, "text.shadow.color", "shadowColor");
    updateProperty(this, prop, "text.shadow.blur", "shadowBlur");
    updateProperty(this, prop, "text.shadow.offset.x", "shadowOffsetX");
    updateProperty(this, prop, "text.shadow.offset.y", "shadowOffsetY");
    updateBaseProperty(this, prop);
    return prop;
  }

  get compType() {
    return this.s("type")
  }
}