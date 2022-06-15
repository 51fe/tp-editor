import { getString, isString } from "../util/index.js";
import BaseInspector from "./BaseInspector.js";

export default class ImageInspector extends BaseInspector {
  constructor(editor, name) {
    super(editor, name);
  }

  initForm() {
    super.initForm();
    this.addTitle("TitleImage");
    const items = [];
    this.addLabelImage(items, getString("editor.name"),
      (node) => {
        return node.s("image")
      },
      (node, value) => {
        if (!(isString(value) && value.endsWith("[...]"))) {
          node.s("image", value)
        }
      });
    this.addButton(items, null, getString("editor.resetsize"),
      "editor.resetsize.state",
      function (node) {
        node.setSize?.(-2, -1);
      });
    this.addFuncRow(items, "image", "name");
    this.addStyleColor(getString("editor.color"), "body.color", "color");
    this.addStyleStretch(getString("editor.stretch"), "image.stretch", "stretch");
  }
}
