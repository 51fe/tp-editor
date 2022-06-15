import { getString, getter, setter } from "../util";
import DataInspector from "./DataInspector.js";

export default class BlockInspector extends DataInspector {
  constructor(editor) {
    super(editor, "Block");
  }

  addShadowProperties() { }

  addFormProperties() {
    this.addTitle("TitleBasic");
    this.addEventProperties();
    let items = [];
    this.addLabelInput(items,
      getString("editor.name"),
      getter("p", "displayName"),
      setter("p", "displayName"));
    this.addLabelInput(items,
      getString("editor.tag"),
      getter("p", "tag"),
      setter("p", "tag"));
    this.addRow(items, [this.indent, .1, this.indent2, .1]);
    items = [];
    this.addLabelInput(items, getString("editor.tooltip"),
      getter("p", "toolTip"), setter("p", "toolTip"));
    this.addRow(items, [this.indent, .1]);
    items = [];
    this.addLabelCheckBox(items,
      getString("editor.selectable"),
      shape => {
        return shape.s("3d.selectable")
      },
      (shape, selectable) => {
        shape.s("2d.selectable", selectable);
        shape.s("3d.selectable", selectable);
      });
    this.addLabelCheckBox(items,
      getString("editor.movable"),
      shape => {
        return shape.s("3d.movable");
      },
      (shape, movable) => {
        shape.s("2d.movable", movable);
        shape.s("3d.movable", movable);
      });
    this.addRow(items, [this.indent, .1, this.indent2, .1]);
    items = [];
    this.addLabelCheckBox(items,
      getString("editor.editable"),
      shape => {
        return shape.s("3d.editable");
      },
      (shape, editable) => {
        shape.s("2d.editable", editable);
        shape.s("3d.editable", editable);
      });
    this.addLabelCheckBox(items,
      getString("editor.visible"),
      shape => {
        return shape.s("3d.visible");
      },
      (shape, visible) => {
        shape.s("2d.visible", visible);
        shape.s("3d.visible", visible);
      });
    this.addRow(items, [this.indent, .1, this.indent2, .1]);
    items = [];
    this.addLabelCheckBox(items,
      getString("editor.clickthroughenabled"),
      shape => {
        return shape.isClickThroughEnabled();
      },
      (shape, enabled) => {
        return shape.setClickThroughEnabled(enabled);
      });
    this.addLabelCheckBox(items,
      getString("editor.syncsize"),
      shape => {
        return shape.isSyncSize();
      },
      (shape, size) => {
        return shape.setSyncSize(size);
      });
    this.addRow(items, [this.indent, .1, this.indent2, .1]);
  }
}
