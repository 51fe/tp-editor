import { getString } from "../util/index.js";
import { renderUI, updateBaseProperty } from "../util/type.js";

export default class FuncType extends ht.Node {
  constructor(prop, w, h) {
    super();
    this.setIcon("editor.func");
    this.setImage("editor.func");
    this.parse(prop, w, h);
  }

  getClass() {
    return FuncType;
  }

  toLabel() {
    return this.getDisplayName() || getString("editor.comptype.func");
  }

  parse(prop, w, h) {
    if (prop) {
      this.a("type", prop.type);
      renderUI(this, prop, w, h);
    }
  }

  toJSON() {
    const prop = {};
    prop.type = this.a("type");
    updateBaseProperty(this, prop);
    return prop;
  }

  get compType() {
    return "function";
  }
}
