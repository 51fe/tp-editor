import { getString, getter, setter } from "../util/index.js";
import Inspector from "./index.js";

export default class HTDataInspector extends Inspector {
  constructor(editor, name) {
    super(editor, name, "data")
  }

  isTitleVisible(row) {
    if (this.inspectorFilter.isDataTitleVisible(this.editor, this.data, row.title)) {
      return super.isTitleVisible(row);
    }
    return false;
  }

  isPropertyVisible(row) {
    const { accessType, name } = row?.keys ?? {};
    if (this.inspectorFilter.isDataPropertyVisible(this.editor, this.data, accessType, name)) {
      return super.isPropertyVisible(row);
    }
    return false;
  }
  addDBInput(accessType, label, name, valueType, step) {
    const items = [];
    this.addLabelInput(items, label,
      getter(accessType, name), setter(accessType, name), valueType, step);
    return this.addDBRow(items, accessType, name);
  }

  addDBLabel(accessType, label, name) {
    const items = [];
    this.addLabelLabel(items, label,
      getter(accessType, name), setter(accessType, name));
    return this.addDBRow(items, accessType, name)
  }

  addDBCheckBox(accessType, label, name) {
    const items = [];
    this.addLabelCheckBox(items, label, getter(accessType, name), setter(accessType, name));
    return this.addDBRow(items, accessType, name);
  }

  addDBImage(accessType, label, name) {
    const items = [];
    this.addLabelImage(items, label, getter(accessType, name), setter(accessType, name));
    return this.addDBRow(items, accessType, name);
  }

  addDBColor(accessType, label, name) {
    const items = [],
      handler = function (node, vlaue) {
        if (name === "shape.background") {
          node.s("shape.gradient.pack") && node.s("shape.gradient.pack", undefined);
        }
        setter(accessType, name)(node, vlaue);
      };
    this.addLabelColor(items, label, getter(accessType, name), handler);
    return this.addDBRow(items, accessType, name);
  }

  addDBFont(accessType, label, name) {
    const items = [];
    this.addLabelFont(items, label, getter(accessType, name),
      setter(accessType, name));
    return this.addDBRow(items, accessType, name);
  }

  addDBPattern(accessType, label, name) {
    const items = [];
    this.addLabelInput(items, label, getter(accessType, name),
      setter(accessType, name), "pattern");
    return this.addDBRow(items, accessType, name)
  }

  addDBRotation(accessType, label, name) {
    const items = [];
    this.addLabelRotation(items, label, getter(accessType, name),
      setter(accessType, name));
    return this.addDBRow(items, accessType, name);
  }

  addDBAlign(accessType, label, name) {
    const items = [];
    this.addLabelAlign(items, label, getter(accessType, name),
      setter(accessType, name));
    return this.addDBRow(items, accessType, name)
  }

  addDBVAlign(accessType, label, name) {
    const items = [];
    this.addLabelVAlign(items, label, getter(accessType, name),
      setter(accessType, name));
    return this.addDBRow(items, accessType, name);
  }

  addDBOrientation(accessType, label, name) {
    const items = [];
    this.addLabelOrientation(items, label, getter(accessType, name),
      setter(accessType, name));
    return this.addDBRow(items, accessType, name);
  }

  addDBComboBox(accessType, label, name, values, lables, icons) {
    const items = [];
    this.addLabelComboBox(items, label, getter(accessType, name),
      setter(accessType, name), values, lables, icons);
    return this.addDBRow(items, accessType, name);
  }

  addDBStretch(accessType, r, name) {
    const items = [];
    this.addLabelStretch(items, r, getter(accessType, name),
      setter(accessType, name));
    return this.addDBRow(items, accessType, name)
  }

  addDBZeroToOne(accessType, label, name) {
    const items = [];
    return this.addLabelRange(items, label, getter(accessType, name),
      setter(accessType, name), 0, 1, .01, "number"),
      this.addDBRow(items, accessType, name)
  }

  addDBPosition(accessType, label, name) {
    const items = [];
    return this.addLabelPosition(items, label, getter(accessType, name),
      setter(accessType, name)),
      this.addDBRow(items, accessType, name)
  }

  addDBRange(accessType, lable, name, min, max, step, valueType) {
    const items = [];
    this.addLabelRange(items, lable, getter(accessType, name),
      setter(accessType, name), min, max, step, valueType);
    return this.addDBRow(items, accessType, name);
  }

  addDBGradient(label, name, bgKey, gradientKey) {
    const items = [];
    this.addLabelGradient(items, label, name, bgKey, gradientKey);
    return this.addDBRow(items, "s", name);
  }

  addDBBodyColorProperty() {
    this.addDBColor("s", getString("editor.bodycolor"), "body.color");
  }

  addDBOpacityProperty() {
    this.addDBZeroToOne("s", getString("editor.opacity"), "opacity");
  }

  addDBIconsProperty() {
    const items = [];
    this.addLabelIcons(items);
    return this.addDBRow(items, "s", "icons");
  }

  addDBData(accessType, label, name, handler) {
    const items = [];
    this.addLabelData(items, label, getter(accessType, name), handler || setter(accessType, name));
    return this.addDBRow(items, accessType, name);
  }

  addDBMultiline(accessType, label, name) {
    const items = [];
    this.addLabelMultiline(items, label, getter(accessType, name), setter(accessType, name));
    return this.addDBRow(items, accessType, name);
  }

  addBasicProperties() {
    this.addTitle("TitleBasic");
    const items = [];
    this.addLabelInput(items, getString("editor.classname"), function (node) {
      return node.getClassName();
    });
    this.addRow(items, this.w1).keys = {
      accessType: "p",
      name: "className"
    }
    this.addDBInput("p", getString("editor.name"), "displayName");
    this.addDBInput("p", getString("editor.tag"), "tag");
    this.addDBImage("p", getString("editor.icon"), "icon");
    this.addDBData("p", getString("editor.parent"), "parent");
  }

  addLabelProperties() {
    this.addTitle("TitleLabel");
    this.addDBMultiline("s", getString("editor.content"), "label");
    this.addDBFont("s", getString("editor.font"), "label.font");
    this.addDBColor("s", getString("editor.color"), "label.color");
    this.addDBColor("s", getString("editor.background"), "label.background");
    this.addDBPosition("s", getString("editor.position"), "label.position");
    this.addDBInput("s", getString("editor.offsetx"), "label.offset.x", "number", 1);
    this.addDBInput("s", getString("editor.offsety"), "label.offset.y", "number", 1);
    this.addDBInput("s", getString("editor.maxlength"), "label.max", "number", 1);
    this.addDBRotation("s", getString("editor.rotation"), "label.rotation");
    this.addDBZeroToOne("s", getString("editor.opacity"), "label.opacity");
    this.addDBRange("s", getString("editor.scale"), "label.scale", .01, 100, .1, "number");
    this.addDBAlign("s", getString("editor.align"), "label.align");
    this.addDBCheckBox("s", getString("editor.fixed"), "label.position.fixed")
  }

  addNoteProperties() {
    this.addTitle("TitleNote");
    this.addDBMultiline("s", getString("editor.content"), "note");
    this.addDBFont("s", getString("editor.font"), "note.font");
    this.addDBColor("s", getString("editor.color"), "note.color");
    this.addDBColor("s", getString("editor.background"), "note.background");
    this.addDBInput("s", getString("editor.borderwidth"), "note.border.width", "number", 1);
    this.addDBColor("s", getString("editor.bordercolor"), "note.border.color");
    this.addDBPosition("s", getString("editor.position"), "note.position");
    this.addDBInput("s", getString("editor.offsetx"), "note.offset.x", "number", 1);
    this.addDBInput("s", getString("editor.offsety"), "note.offset.y", "number", 1);
    this.addDBZeroToOne("s", getString("editor.opacity"), "note.opacity");
    this.addDBRange("s", getString("editor.scale"), "note.scale", .01, 100, .1, "number");
    this.addDBInput("s", getString("editor.maxlength"), "note.max", "number", 1);
    this.addDBAlign("s", getString("editor.align"), "note.align");
    this.addDBCheckBox("s", getString("editor.toggleable"), "note.toggleable");
    this.addDBCheckBox("s", getString("editor.expanded"), "note.expanded")
  }

  addDBLayer() {
    const items = [];
    this.addLabelLayer(items);
    const row = this.addDBRow(items, "p", "layer");
    row.items.tag = "layer";
    return row;
  }

  addDBGray() {
    this.addDBCheckBox("s", getString("editor.gray"), "2d.gray");
  }
}
