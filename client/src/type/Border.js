import config from "../config.js";
import { getString } from "../util/index.js";
import { renderUI, setProperty, updateBaseProperty, updateProperty } from "../util/type.js";

export default class Border extends ht.Node {
  constructor(prop, w, h) {
    super();
    this.s({ border_color: config.color_dark, border_width: 1 });
    this.setImage("border_image");
    this.parse(prop, w, h);
  }

  getClass() {
    return Border;
  }

  toLabel() {
    return this.getDisplayName() || getString("editor.comptype.border");
  }

  parse(prop, w, h) {
    if (prop) {
      setProperty(this, "type", prop.type, "border");
      setProperty(this, "border_color", prop.color, config.color_dark);
      setProperty(this, "border_width", prop.width, 1);
      renderUI(this, prop, w, h);
    }
  }

  toJSON() {
    const prop = {};
    updateProperty(this, prop, "type", "type", undefined);
    updateProperty(this, prop, "border_color", "color", undefined);
    updateProperty(this, prop, "border_width", "width", undefined);
    updateBaseProperty(this, prop);
    return prop;
  }

  get compType() {
    return this.s("shape");
  }
}
