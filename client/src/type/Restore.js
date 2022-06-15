import { getString } from "../util/index.js";
import { setProperty, updateProperty } from "../util/type.js";

export default class Restore extends ht.Node {
  constructor(prop, w, h) {
    super();
    this.parse(prop, w, h);
  }

  getClass() {
    return Restore;
  }

  toLabel() {
    return this.getDisplayName() || getString("editor.comptype.restore");
  }

  parse(prop) {
    if (prop) {
      setProperty(this, "type", prop.type, "restore");
    }
  }

  toJSON() {
    const prop = {};
    updateProperty(this, prop, "type", "type", undefined);
    return prop;
  }

  get compType() {
    return this.s("type");
  }
}
