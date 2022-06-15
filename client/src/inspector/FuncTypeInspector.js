import { getString } from "../util/index.js";
import BaseInspector from "./BaseInspector.js";

export default class FuncTypeInspector extends BaseInspector {
  constructor(editor, name) {
    super(editor, name);
  }

  addStyleType() {
    const items = [];
    this.addLabelInput(items, getString("editor.type"), function () {
      return "function";
    });
    this.addFuncRow(items, "type");
  }
}
