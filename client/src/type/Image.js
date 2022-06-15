import { getString } from "../util/index.js";
import { renderUI, setProperty, updateBaseProperty, updateProperty } from "../util/type.js";

export default class Image extends ht.Node {
  constructor(prop, w, h) {
    super();
    this.parse(prop, w, h);
  }

  getClass() {
    return Image;
  }

  toLabel() {
    const displayName = this.getDisplayName(),
      style = this.s("image");
    if (displayName) return displayName;
    return style && style.length < 100 ? style : getString("editor.comptype.image");
  }

  onStyleChanged(name, oldValue, newValue) {
    super.onStyleChanged(name, oldValue, newValue);
    name === "image" && this.setImage(newValue)
  }

  parse(prop, w, h) {
    if (prop) {
      setProperty(this, "type", prop.type, "image");
      setProperty(this, "body.color", prop.color);
      setProperty(this, "image.stretch", prop.stretch);
      setProperty(this, "image", prop.name, "node_image");
      renderUI(this, prop, w, h);
    }
  }

  toJSON() {
    const prop = {};
    updateProperty(this, prop, "type", "type", undefined);
    updateProperty(this, prop, "body.color", "color");
    updateProperty(this, prop, "image.stretch", "stretch");
    updateProperty(this, prop, "image", "name");
    updateBaseProperty(this, prop);
    return prop;
  }

  get compType() {
    return this.s("type");
  }
}