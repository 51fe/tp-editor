import { getString } from "../util/index.js";
import HTNodeInspector from "./HTNodeInspector.js";

export default class HTShapeInspector extends HTNodeInspector {
  constructor(editor, name) {
    super(editor, name);
  }

  initForm() {
    this.addEditingPointProperties();
    this.addCustomProperties();
    this.addControlProperties();
    this.addLayoutProperties();
    this.addBasicProperties();
    this.addShapeProperties();
    this.addLabelProperties();
    this.addNoteProperties();
    this.addSelectProperties()
  }

  isTitleVisible(row) {
    if (row.title !== "TitleEditingPoint" || this.editor.pointsEditingMode) {
      return super.isTitleVisible(row);
    }
    return false;
  }

  addOutlineProperties() {
    this.addDBCheckBox("p", getString("editor.closed"), "closePath");
    this.addDBColor("s", getString("editor.outlinecolor"), "border.color");
    this.addDBInput("s", getString("editor.outlinewidth"), "border.width", "number", 1);
  }

  addShapeBackgroundProperties() {
    super.addShapeBackgroundProperties();
    this.addDBComboBox("s", getString("editor.fillrule"),
      "shape.fill.rule", tpeditor.consts.fillRules, tpeditor.consts.fillRuleLabels)
  }

  addSelectProperties() {
    this.addTitle("TitleSelect");
    this.addDBColor("s", getString("editor.color"), "select.color");
    this.addDBInput("s", getString("editor.width"), "select.width", "number", 1);
    const items = [];
    this.addLabelCheckBox(items, getString("editor.shadow"),
      function (node) {
        return node.s("select.type") === "shadow";
      },
      function (node, value) {
        node.s("select.type", value ? "shadow" : null);
      });
    this.addDBRow(items, "s", "select.type");
    this.addDBInput("s", getString("editor.shadowblur"), "shadow.blur", "number", 1);
    this.addDBInput("s", getString("editor.shadowoffsetx"), "shadow.offset.x", "number", 1);
    this.addDBInput("s", getString("editor.shadowoffsety"), "shadow.offset.y", "number", 1)
  }
}
