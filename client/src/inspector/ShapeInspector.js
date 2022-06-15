import { getString } from "../util/index.js";
import BasicInspector from "./BasicInspector.js";

export default class ShapeInspector extends BasicInspector {
  constructor(editor, name) {
    super(editor, name)
  }

  initForm() {
    this.addEditingPointProperties();
    super.initForm()
  }

  isTitleVisible(p) {
    return !("TitleEditingPoint" === p.title && !this.editor.pointsEditingMode) && super.isTitleVisible(p)
  }

  addStyleType() {
    const items = [];
    this.addLabelInput(items, getString("editor.type"), node => {
      return node.compType;
    });
    this.addRow(items, this.w1).keys = { name: "type" };
  }

  addStyleBackground() {
    super.addStyleBackground();
    this.addStyleComboBox(getString("editor.fillrule"), "shape.fill.rule", tpeditor.consts.fillRules, tpeditor.consts.fillRuleLabels, null, "fillRule")
  }

  addStyleBorder() {
    super.addStyleBorder();
    const items = [];
    this.addLabelCheckBox(items, getString("editor.closed"),
      node => {
        return node.isClosePath();
      },
      (node, value) => {
        node instanceof ht.Shape && node.setClosePath(value);
      });
    this.addFuncRow(items, "name");
  }
}