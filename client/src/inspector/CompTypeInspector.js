import { FILE_TYPE_COMPONENT } from "../constants.js";
import config from "../config.js";
import { jsonToPNG, getRowHeight, getString, getStrings, getWidths, isDoubleClick } from "../util/index.js";
import BaseInspector from "./BaseInspector.js";

export default class CompTypeInspector extends BaseInspector {
  constructor(editor, name) {
    super(editor, name)
  }

  initForm() {
    super.initForm();
    this.addComponent();
  }

  addStyleType() {
  }

  addComponent() {
    this.addTitle("TitleComponent");
    const items = [];
    items.forceToUpdate = true;
    const getDroppable = (e, info) => {
      if (info.view.draggingData) {
        return info.view.draggingData.fileType === FILE_TYPE_COMPONENT;
      }
      return false;
    };
    this.addLabelURL(items, getString("editor.type"), data => {
      const type = data.s("type");
      this.invalidateComponent(data.properties);
      return type;
    }, (data, value) => {
      data.s("type", value)
    }, getDroppable);
    const img = new ht.widget.Image;
    img.vectorDataBindingDisabled = true;
    this.updateHandlers.push(() => {
      if (!items.hidden) {
        const type = this.data ? this.data.s("type") : null;
        this.invalidateComponent(this.data.properties);
        img.setIcon(type ? jsonToPNG(type) : null);
        img.compType = type;
      }
    });
    const el = img.getView();
    el.style.cursor = "pointer";
    const handler = e => {
      e.preventDefault();
      isDoubleClick(e) ? this.editor.open(img.compType) :
        this.editor.selectFileNode(img.compType);
    };
    el.addEventListener("mousedown", handler, false);
    el.addEventListener("touchstart", handler, false);
    items.push(img);
    this.addFuncRow(items, "type");
  }

  invalidateComponent(prop) {
    if (this.properties !== prop) {
      this.pendingProperties = prop;
      if (!this._updateComponentLater) {
        this._updateComponentLater = true;
        requestAnimationFrame(() => {
          this.updateComponent();
        })
      }
    }
  }

  updateComponent() {
    this._updateComponentLater = false;
    if (this.properties === this.pendingProperties) {
      this.pendingProperties = null;
      return false;
    }
    this._rows = this.rows;
    this.removeRows(this.compRows);
    this?.propertiesHandlers?.forEach(this.removeUpdateHandler, this);
    this.compRows = [];
    this.properties = this.pendingProperties;
    if (this.properties) {
      const length = this.updateHandlers.length;
      let group = undefined;
      for (let name in this.properties) {
        const prop = this.properties[name];
        if (prop.group && group !== prop.group) {
          group = prop.group;
          const row = this.addTitle(group);
          this.compRows.push(row)
        }
        this.addProperty(name, prop)
      }
      this.propertiesHandlers = this.updateHandlers.slice(length)
    }
    this.rows = this._rows;
    this.filterProperties();
  }

  addProperty(name, prop) {
    const valueType = config.valueTypes[prop.valueType];
    if (!valueType) {
      this.editor.fireEvent("error", { message: "Wrong value type:" + prop.valueType });
      return false;
    }
    const extraInfo = prop?.extraInfo;
    let label = getString(prop.name) || name,
      values = undefined,
      labels = undefined,
      icons = undefined;
    if (extraInfo?.enum) {
      values = extraInfo.enum.values;
      labels = getStrings(extraInfo.enum.labels, extraInfo.enum.i18nLabels);
      icons = extraInfo.enum.icons;
    }
    let row = undefined;
    if (extraInfo?.buildUI) {
      const _getter = node => {
        return node.s(name);
      }, _setter = (node, value) => {
        node.s(name, value)
      }, items = [],
        row = extraInfo.buildUI(this, items, label, _getter, _setter, extraInfo);
      this.addFuncRow(items, name, name, getRowHeight(row, valueType), getWidths(row, valueType));
    } else if (values) {
      this.addStyleComboBox(label, name, values, labels, icons, name);
    } else if (["int", "number"].includes(valueType.type)) {
      const _getter = (valueType.max, valueType.min, node => {
        return node.s(name);
      }), _setter = (node, value) => {
        node.s(name, value);
      }, items = [];
      if (valueType.angle) {
        this.addLabelRotation(items, label, _getter, _setter, valueType.min, valueType.max, valueType.step);
      } else {
        this.addLabelRange(items, label, _getter, _setter, valueType.min, valueType.max, valueType.step, valueType.type);
      }
      this.addFuncRow(items, name, name, getRowHeight(row, valueType));
    } else if (valueType.type === "color") {
      this.addStyleColor(label, name, name, getRowHeight(row, valueType));
    } else if (valueType.type === "boolean") {
      this.addStyleCheckBox(label, name, name, getRowHeight(row, valueType));
    } else if (valueType.type === "enum") {
      this.addStyleComboBox(label, name, valueType.values, valueType.labels, valueType.icons, name);
    } else if (valueType.type === "multiline") {
      this.addStyleMultiline(label, name, name, getRowHeight(row, valueType));
    } else if (valueType.type === "font") {
      this.addStyleFont(label, name, name, getRowHeight(row, valueType));
    } else if (valueType.type === "image") {
      this.addStyleImage(label, name, name, getRowHeight(row, valueType));
    } else if (valueType.type === "url") {
      this.addStyleURL(label, name, name, getRowHeight(row, valueType));
    } else if (valueType.type === "colorArray") {
      this.addStyleArray(label, name, name, "color", getRowHeight(row, valueType));
    } else if (valueType.type === "numberArray") {
      this.addStyleArray(label, name, name, "number", getRowHeight(row, valueType));
    } else if (valueType.type === "stringArray") {
      this.addStyleArray(label, name, name, "string", getRowHeight(row, valueType));
    } else if (valueType.type === "objectArray") {
      this.addStyleArray(label, name, name, "object", getRowHeight(row, valueType));
    } else if (valueType.type === "function") {
      let args = undefined;
      extraInfo?.arguments && (args = extraInfo.arguments);
      this.addStyleFunction(label, name, name, args, getRowHeight(row, valueType));
    } else if (valueType.type === "dataModel") {
      this.addStyleDataModel(label, name, name, extraInfo, getRowHeight(row, valueType));
    } else if (valueType.type === "custom") {
      const _getter = node => {
        return node.s(name);
      }, _setter = (node, value) => {
        node.s(name, value);
      }, items = [],
        row = valueType.buildUI(this, items, label, _getter, _setter, extraInfo);
      this.addFuncRow(items, name, name, getRowHeight(row, valueType), getWidths(row, valueType));
    } else if (valueType.type === "object") {
      this.addStyleObject(label, name, name, getRowHeight(row, valueType))
    } else {
      this.addStyleInput(label, name, null, null, name, getRowHeight(row, valueType));
    }
    this.compRows.push(this._rows[this._rows.length - 1]);
    return true;
  }
}
