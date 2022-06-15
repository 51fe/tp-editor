import config from "../config.js";
import { beginEdit, clone, compareEqual, getDataBindingMap, getString, isJSON, isObject, isString, removeItem } from "../util/index.js";
import Inspector from "./index.js";
import TablePane from "../pane/TablePane.js";
import { BINDING } from "../constants.js";

export default class SymbolInspector extends Inspector {
  constructor(editor, name) {
    super(editor, name, "symbol", true)
  }

  initForm() {
    this.addCustomProperties();
    this.addControlProperties();
    this.addFormProperties();
    this.addHighlightProperties();
    this.addGridsGuidesProperties();
    this.addDataBindingProperties();
  }

  isTitleVisible(row) {
    return !!this.inspectorFilter.isSymbolTitleVisible(this.editor, row.title) && super.isTitleVisible(row)
  }

  isPropertyVisible(row) {
    return !!this.inspectorFilter.isSymbolPropertyVisible(this.editor, row?.keys?.name) && super.isPropertyVisible(row)
  }

  addFormProperties() {
    const indent = this.indent;
    this.addTitle("TitleBasic");
    let items = [];
    this.addLabelInput(items, getString("editor.previewurl"), function (dm) {
      return dm.a("previewURL");
    }, function (dm, value) {
      dm.a("previewURL", value);
    });
    this.addLabelImage(items, getString("editor.snapshoturl"), function (dm) {
      return dm.a("snapshotURL");
    }, function (dm, value) {
      dm.a("snapshotURL", value);
    });
    this.addNameRow(items, "previewURL.snapshotURL",
      undefined, undefined, [indent, this.w20, indent, .1, 20]);
    items = [];
    this.addLabelColor(items, getString("editor.background"), function (dm) {
      return dm.getBackground();
    }, function (dm, value) {
      dm.setBackground(value);
    });
    this.addLabelComboBox(items, getString("editor.connectactiontype"), function (dm) {
      return dm.a("connectActionType");
    }, function (dm, value) {
      dm.a("connectActionType", value);
    }, tpeditor.consts.symbolConnectActionTypes, tpeditor.consts.symbolConnectActionTypeLabels);
    this.addNameRow(items, "background.connectActionType", undefined, undefined, this.w1w1);
    items = [];
    this.addLabelInput(items, getString("editor.width"), function (dm) {
      return dm.a("width");
    }, function (dm, value) {
      dm.a("width", value);
    }, "number", 1);
    this.addFuncRow(items, "width");
    items = [];
    this.addLabelInput(items, getString("editor.height"), function (dm) {
      return dm.a("height");
    }, function (dm, value) {
      dm.a("height", value);
    }, "number", 1);
    this.addFuncRow(items, "height");
    items = [];
    this.addLabelInput(items, getString("editor.boundextend"), function (dm) {
      return dm.a("boundExtend");
    }, function (dm, value) {
      dm.a("boundExtend", value);
    }, "number", 1);
    this.addFuncRow(items, "boundExtend");
    this.addStateProperty();
    this.addAttachPointsProperties();
    items = [];
    this.addLabelComboBox(items, getString("editor.blendmode"), function (dm) {
      return dm.a("blendMode")
    }, function (dm, value) {
      dm.a("blendMode", value)
    }, ["multiply", "override", "override_rgb", "override_a"], [
      getString("editor.blendmode.multiply"),
      getString("editor.blendmode.override"),
      getString("editor.blendmode.override_rgb"),
      getString("editor.blendmode.override_a")
    ]);
    this.addFuncRow(items, "blendMode");
  }

  addEventsAndRenderHTMLProperties() {
    const items = [];
    this.addEventProperties(items);
    const setter = () => {
      this.editor.functionView.open(this.dataModel.a("renderHTML"), value => {
        this.dataModel.a("renderHTML", value)
      }, getString("editor.renderhtml"), ["data", "gv", "cache"])
    },
      btn = this.addButton(items, getString("editor.renderhtml"),
        null, null, setter, true);
    this.updateHandlers.push(() => {
      if (!items.hidden) {
        const selected = this.dataModel.a("renderHTML");
        btn.setLabelColor(selected ? config.color_select : ht.Default.labelColor)
      }
    });
    this.addNameRow(items, "eventHandlers.renderhtml",
      undefined, undefined, [this.indent, .1, .1])
  }

  addControlProperties() {
    this.addTitle("TitleControl");
    this.addEventsAndRenderHTMLProperties();
    let items = [];
    this.addLabelCheckBox(items, getString("editor.visible"), node => {
      return node.a("visible");
    }, (node, value) => {
      node.a("visible", value);
    });
    this.addFuncRow(items, "visible");
    items = [];
    this.addLabelCheckBox(items, getString("editor.clip"), node => {
      return node.a("clip")
    }, (node, value) => {
      node.a("clip", value);
    }).onValueChanged = (e, value) => {
      this?.dataModel.a?.("clip", value);
    };
    this.addFuncRow(items, "clip");
    items = [];
    this.addLabelCheckBox(items, getString("editor.scrollable"), node => {
      return node.a("scrollable");
    }, (node, value) => {
      node.a("scrollable", value)
    });
    this.addFuncRow(items, "scrollable");
    items = [];
    this.addLabelCheckBox(items, getString("editor.interactive"), node => {
      return node.a("interactive");
    }, (node, value) => {
      node.a("interactive", value)
    });
    this.addFuncRow(items, "interactive");
    items = [];
    this.addLabelCheckBox(items, getString("editor.disableselectedborder"), node => {
      return node.a("disableSelectedBorder");
    }, (node, value) => {
      node.a("disableSelectedBorder", value);
    });
    this.addFuncRow(items, "disableSelectedBorder");
    items = [];
    this.addLabelCheckBox(items, getString("editor.pixelperfect"), node => {
      return node.a("pixelPerfect");
    }, (node, value) => {
      node.a("pixelPerfect", value);
    });
    this.addFuncRow(items, "pixelPerfect");
    items = [];
    this.addLabelCheckBox(items, getString("editor.cacherule"), node => {
      return node.a("cacheRule");
    }, (node, value) => {
      node.a("cacheRule", value);
    });
    this.addFuncRow(items, "cacheRule");
    items = [];
    this.addLabelCheckBox(items, getString("editor.texturecache"), node => {
      return node.a("textureCache");
    }, (node, value) => {
      node.a("textureCache", value);
    });
    this.addFuncRow(items, "textureCache");
    items = [];
    this.addLabelCheckBox(items, getString("editor.fitsize"), node => {
      return node.a("fitSize");
    }, (node, value) => {
      node.a("fitSize", value);
    });
    this.addFuncRow(items, "fitSize");
    if (tpeditor.SceneView) {
      items = [];
      const setter = () => {
        this.editor.symbolLayoutView.open(this.dataModel.a("layoutAttach"),
          this.dataModel.a("layoutProperties"), r => {
            this.beginTransaction();
            this.dataModel.a("layoutAttach", r.func);
            this.dataModel.a("layoutProperties", r.properties);
            this.beginTransaction();
          })
      };
      this.addLabel(items, getString("editor.layout"));
      const btn = this.addButton(items, getString("editor.layoutattach"), null, null, setter, true);
      this.addRow(items, this.w1);
      this.updateHandlers.push(() => {
        if (!items.hidden) {
          const selected = this.dataModel.a("layoutAttach");
          btn.setLabelColor(selected ? config.color_select : ht.Default.labelColor);
        }
      })
    }
  }

  addDataBindingProperties() {
    this.addTitle("TitleDataBinding");
    this.addPane();
    this.addContextMenu();
  }

  getColumn(name, displayName, width, _enum, valueType) {
    return {
      name,
      tag: name,
      width,
      displayName,
      align: "center",
      enum: _enum,
      editable: true,
      valueType,
      getValue: data => {
        let vlaue = data.dataBinding[name];
        if (name === "bindable" && vlaue === undefined) {
          vlaue = true;
        }
        return vlaue;
      },
      setValue: (data, column, value) => {
        if (data.dataBinding[name] !== value) {
          this.modifyDataBindings(() => {
            if (name === "valueType") {
              delete data.dataBinding.defaultValue;
            }
            data.dataBinding[name] = value
          })
        }
      }
    }
  }

  initColumn() {
    const column = this.tableView.getColumnModel().getDataByTag("defaultValue"),
      valueTypes = config.valueTypes;
    column.getValue = data => {
      let defaultValue = data.dataBinding.defaultValue;
      if (data.dataBinding.valueType === "Angle") {
        defaultValue && (defaultValue = defaultValue / Math.PI * 180)
      }
      return defaultValue
    };
    column.setValue = (data, column, value) => {
      this.modifyDataBindings(function () {
        if (data.dataBinding.valueType === "Angle") {
          value = value * Math.PI / 180
        }
        data.dataBinding.defaultValue = value
      })
    };
    column.getEnumValues = data => {
      const valueType = data ? valueTypes[data.dataBinding.valueType] : null;
      return valueType?.type === "enum" ? valueType.values : null
    };
    column.getEnumLabels = data => {
      const valueType = data ? valueTypes[data.dataBinding.valueType] : null;
      return valueType?.type === "enum" ? valueType.labels : null
    };
    column.getEnumIcons = data => {
      const valueType = data ? valueTypes[data.dataBinding.valueType] : null;
      return valueType?.type === "enum" ? valueType.icons : null
    };
    column.getEnumDropDownWidth = data => {
      const valueType = data ? valueTypes[data.dataBinding.valueType] : null;
      return valueType?.type === "enum" ? valueType.dropDownWidth : null
    };
    column.getValueType = data => {
      const valueType = data ? valueTypes[data.dataBinding.valueType] : null;
      return valueType ? valueType.type : null
    };
    column.isCellEditable = data => {
      const valueType = valueTypes[data.dataBinding.valueType],
        type = valueType ? valueType.type : null,
        extraInfo = data.dataBinding.extraInfo,
        handler = config.handleDefaultVauleColumnEdit,
        setter = value => {
          this.modifyDataBindings(() => {
            data.dataBinding.defaultValue = value;
            this.tableView.redraw();
          })
        },
        defaultValue = data.dataBinding.defaultValue;
      if (handler?.(setter, valueType, type, extraInfo)) return false;
      if (type === "function") {
        const title = getString("editor.function") + " " + (data.dataBinding.attr || "");
        this.editor.functionView.open(defaultValue, setter, title, extraInfo?.arguments);
        return false;
      }
      if (type === "multiline") {
        this.editor.textView.open(defaultValue, setter, data.dataBinding.attr || "&nbsp;");
        return false;
      }
      if (type === "font") {
        this.editor.fontView.open(defaultValue, setter, data.dataBinding.attr || "&nbsp;");
        return false;
      }
      if (["object", "stringArray", "custom", "objectArray", "numberArray", "colorArray"].includes(type)) {
        const title = getString("editor.object") + " " + (data.dataBinding.attr || "");
        this.editor.objectView.open(defaultValue, setter, title);
        return false;
      }
      if (type === "dataModel") {
        this.editor.dataModelView.open(defaultValue, setter, this.editor.editable, extraInfo);
        return false;
      }
      return true;
    }
  }

  initExtraInfoColumn() {
    this.tableView.getColumnModel().getDataByTag("extraInfo").isCellEditable = data => {
      const title = getString("editor.object") + " " + (data.dataBinding.attr || "");
      this.editor.objectView.open(data.dataBinding.extraInfo, info => {
        this.modifyDataBindings(() => {
          data.dataBinding.extraInfo = info;
          this.tableView.redraw();
        })
      }, title);
      return false;
    }
  }

  addPane() {
    const dm = this.tableModel = new ht.DataModel,
      pane = this.tablePane = new TablePane(dm),
      tv = this.tableView = pane.getTableView();
    tv.setEditable(true);
    tv.isEditable = () => {
      return this.editor.editable;
    };
    pane.getView().style.border = config.color_line + " solid 1px";
    pane.addColumns([
      this.getColumn("attr", getString("editor.attr"), 90),
      this.getColumn("valueType", getString("editor.valuetype"), 80, {
        values: tpeditor.consts.valueTypes,
        labels: tpeditor.consts.valueTypeLabels
      }),
      this.getColumn("defaultValue", getString("editor.defaultvalue"), 90),
      this.getColumn("name", getString("editor.name"), 80),
      this.getColumn("group", getString("editor.group"), 80),
      this.getColumn("bindable", getString("editor.bindable"), 50, undefined, "boolean"),
      this.getColumn("description", getString("editor.description"), 120),
      this.getColumn("extraInfo", getString("editor.extrainfo"), 100)
    ]);
    this.initColumn();
    this.initExtraInfoColumn();
    const items = [pane];
    this.addRow(items, [.1], "120+0.1");
    let dataBindings = null;
    this.updateHandlers.push(() => {
      if (!items.hidden && this.dataModel.dataBindings !== dataBindings) {
        dataBindings = this.dataModel.dataBindings;
        const selection = dm.sm().toSelection().toArray();
        dm.clear();
        if (dataBindings) {
          let _data = undefined;
          dataBindings.forEach((dataBinding, index) => {
            const data = new ht.Data;
            data.dataBinding = dataBinding;
            dm.add(data);
            if (index === this.newDataBindingIndex) {
              this.tableView.sm().ss(data);
              _data = data;
              delete this.newDataBindingIndex;
              delete this.addingDataBindingByButton;
            }
            for (let i = 0; i < selection.length; i++) {
              if (compareEqual(selection[i].dataBinding, dataBinding)) {
                removeItem(selection, selection[i]);
                dm.sm().as(data);
                break;
              }
            }
          });
          setTimeout(() => {
            if (_data) {
              this.tableView.tx(0);
              beginEdit(this.tableView, _data, this.tableView.getColumnModel().getDataByTag("attr"))
            }
          }, 100)
        }
      }
    })
  }

  modifyDataBindings(callback) {
    const oldValue = clone(this.dataModel.dataBindings);
    callback();
    const newValue = clone(this.dataModel.dataBindings);
    this.dataModel.dataBindings = newValue;
    this.dataModel.fp("f:dataBindings", oldValue, newValue)
  }

  addDataBinding(key, valueType, defaultValue, name, description, extraInfo) {
    const data = new ht.Data;
    data.dataBinding = {
      attr: key || "",
      valueType: valueType || "String",
      defaultValue,
      name,
      description,
      extraInfo
    };
    const params = {
      symbolView: this.editor.symbolView,
      dataBinding: data.dataBinding
    };
    this.editor.fireEvent("dataBindingAdding", params);
    if (params.preventDefault) return false;
    data.dataBinding = params.dataBinding;
    if (!this.dataModel.dataBindings) {
      this.dataModel.dataBindings = []
    }
    const ld = this.tableModel.sm().ld();
    let index = undefined;
    if (ld) {
      const i = this.tableModel.getRoots().indexOf(ld);
      this.dataModel.dataBindings.splice(i + 1, 0, data.dataBinding);
      index = i + 1;
    } else {
      this.dataModel.dataBindings.push(data.dataBinding);
      index = this.tableModel.size();
    }
    if (this.addingDataBindingByButton) {
      this.newDataBindingIndex = index;
    }
  }

  add() {
    this.modifyDataBindings(() => {
      this.addingDataBindingByButton = true;
      this.addDataBinding();
    })
  }

  delete() {
    this.tableView.sm().ld() && this.modifyDataBindings(() => {
      this.tableView.sm().each(data => {
        removeItem(this.dataModel.dataBindings, data.dataBinding)
      })
    })
  }

  reorder() {
    this.dataModel.dataBindings = [];
    this.tableModel.getRoots().each(data => {
      this.dataModel.dataBindings.push(data.dataBinding)
    })
  }

  import() {
    this.modifyDataBindings(() => {
      if (config.clearDataBindingsBeforeImporting) {
        this.dataModel.dataBindings = [];
      }
      const content = this.editor.symbolView.content,
        target = {};
      this.prefixStack = [];
      content?.dataBindings?.forEach?.(dataBinding => {
        target[dataBinding.attr] = true
      });
      this.addCompDataBinding(content, target);
      this.prefixStack = [];
    })
  }

  addCompDataBinding(content, binded, key) {
    let img = undefined;
    for (const key in content) {
      if (key !== "comps") {
        const value = content[key];
        isObject(value) && this.addPropertyDataBinding(null, key, value, binded)
      }
    }
    key && content?.dataBindings?.forEach(dataBinding => {
      const { valueType, defaultValue, name, description, extraInfo } = dataBinding,
        attr = this.currentPrefix + dataBinding.attr;
      if (!binded[attr]) {
        this.addDataBinding(attr, valueType, defaultValue, name, description, extraInfo);
        binded[attr] = true
      }
    });
    content.comps && content.comps.forEach(comp => {
      const prefix = comp.prefix;
      if (prefix) {
        this.prefixStack.push(prefix);
      }
      for (const key in comp) {
        const value = comp[key];
        if (isObject(value)) {
          this.addPropertyDataBinding(comp, key, value, binded)
        }
      }
      if (comp.type === "image") {
        img = ht.Default.getImage(comp.name);
        this.addCompDataBinding(img, binded, true)
      }
      if (prefix) {
        this.prefixStack.pop();
      }
    })
  }

  addPropertyDataBinding(comp, key, value, binded) {
    const compTypes = {
      visible: "Boolean",
      selectable: "Boolean",
      movable: "Boolean",
      editable: "Boolean",
      opacity: "Opacity",
      clipPercentage: "Percentage",
      clipDirection: "ClipDirection",
      shadow: "Boolean",
      shadowColor: "Color",
      shadowBlur: "PositiveNumber",
      shadowOffsetX: "PositiveNumber",
      shadowOffsetY: "PositiveNumber",
      type: "String",
      background: "Color",
      repeatImage: "String",
      borderWidth: "PositiveNumber",
      borderColor: "Color",
      border3d: "Boolean",
      border3dColor: "Color",
      border3dAccuracy: "PositiveNumber",
      borderCap: "CapStyle",
      borderJoin: "JoinStyle",
      gradient: "Gradient",
      gradientColor: "Color",
      dash: "Boolean",
      dashOffset: "Number",
      dashColor: "Color",
      dashWidth: "PositiveNumber",
      dash3d: "Boolean",
      dash3dColor: "Color",
      dash3dAccuracy: "PositiveNumber",
      borderWidthAbsolute: "Boolean",
      fillClipPercentage: "Percentage",
      fillClipDirection: "ClipDirection",
      depth: "Number",
      cornerRadius: "PositiveNumber",
      polygonSide: "Int",
      arcFrom: "Number",
      arcTo: "Number",
      arcClose: "Boolean",
      arcOval: "Boolean",
      displayName: "String",
      scaleX: "Number",
      scaleY: "Number",
      anchorX: "Number",
      anchorY: "Number",
      rotation: "Number",
      color: "Color",
      width: "PositiveNumber",
      label: "Boolean",
      labelColor: "Color",
      labelFont: "String",
      minValue: "Number",
      maxValue: "Number",
      linePoint: "Boolean",
      lineWidth: "PositiveNumber",
      line3d: "Boolean",
      text: "String",
      align: "Align",
      vAlign: "VAlign",
      closePath: "Boolean",
      fillRule: "FillRule",
      name: "Image",
      stretch: "Stretch",
      values: "NumberArray",
      colors: "ColorArray",
      hollow: "Boolean",
      layoutV: "String",
      layoutH: "String"
    };
    if (isString(value.func) && BINDING.test(value.func)) {
      const _key = this.currentPrefix + value.func.slice(5);
      if (!binded[_key]) {
        let { valueType, name, description, extraInfo } = {};
        if (comp && isJSON(comp.type)) {
          const compType = ht.Default.getCompType(compType.type);
          if (compType) {
            const prop = compType.properties[key];
            if (prop) {
              valueType = prop.valueType;
              name = prop.name;
              description = prop.description;
              extraInfo = prop.extraInfo;
            } else {
              valueType = compTypes[key];
            }
          }
        } else {
          valueType = compTypes[key];
        }
        this.addDataBinding(_key, valueType, undefined, name, description, extraInfo);
        binded[_key] = true;
      }
    } else {
      const bindingMap = {};
      getDataBindingMap(value, bindingMap);
      for (const key in bindingMap) {
        if (!binded[key]) {
          this.addDataBinding(key, compTypes[bindingMap[key]]);
        }
      }
    }
  }

  addContextMenu() {
    let btnConfig = null;
    if (config.importDataBindingsButtonVisible) {
      btnConfig = {
        button: {
          icon: "editor.import",
          toolTip: getString("editor.import"),
          onClicked: () => {
            this.editor.editable && this.import()
          }
        }
      }
    }
    this.addRow([{
      button: {
        icon: "editor.add", toolTip: getString("editor.add"),
        onClicked: () => {
          this.editor.editable && this.add();
        }
      }
    }, {
      button: {
        icon: "editor.delete", toolTip: getString("editor.delete"),
        onClicked: () => {
          this.editor.editable && this.delete();
        }
      }
    }, btnConfig, null, {
      button: {
        icon: "editor.top", toolTip: getString("editor.bringtofront"),
        onClicked: () => {
          if (this.editor.editable && this.tableView.sm().size()) {
            this.modifyDataBindings(() => {
              this.tableModel.moveSelectionToTop();
              this.reorder();
            })
          }
        }
      }
    }, {
      button: {
        icon: "editor.up", toolTip: getString("editor.bringforward"),
        onClicked: () => {
          this.editor.editable && this.tableView.sm().size() && this.modifyDataBindings(function () {
            this.tableModel.moveSelectionUp(), this.reorder()
          })
        }
      }
    }, {
      button: {
        icon: "editor.down", toolTip: getString("editor.sendbackward"),
        onClicked: () => {
          this.editor.editable && this.tableView.sm().size() && this.modifyDataBindings(function () {
            this.tableModel.moveSelectionDown(), this.reorder()
          })
        }
      }
    }, {
      button: {
        icon: "editor.bottom", toolTip: getString("editor.sendtoback"),
        onClicked: () => {
          if (this.editor.editable && this.tableView.sm().size()) {
            this.modifyDataBindings(() => {
              this.tableModel.moveSelectionToBottom();
              this.reorder();
            })
          }
        }
      }
    }], [20, 20, 20, .1, 20, 20, 20, 20])
  }

  addAttachPointsProperties() {
    let items = [];
    const setter = () => {
      this.editor.attachPointsView.show(this.editor.symbolView.content)
    };
    this.addLabel(items, getString("editor.attach.points"));
    const btn = this.addButton(items, getString("editor.attach.edit"), null, null, setter, true);
    this.addFuncRow(items, "attachPoints");
    this.updateHandlers.push(() => {
      if (!items.hidden) {
        const attachPoints = this.dataModel.a("attachPoints");
        btn.setLabelColor(attachPoints?.length ? config.color_select : ht.Default.labelColor);
      }
    });
    items = [];
    this.addLabelComboBox(items, getString("editor.attach.style"), node => {
      return node.a("attachStyle") || "close"
    }, (node, value) => {
      node.a("attachStyle", value);
    }, ["close", "strict"], [getString("editor.attach.close"),
    getString("editor.attach.strict")]);
    this.addFuncRow(items, "attachStyle");
  }

  addStateProperty() {
    if (tpeditor.SceneView) {
      const items = [];
      this.addLabel(items, getString("editor.state"));
      const cb = new ht.widget.ComboBox;
      cb.onValueChanged = () => {
        this.editor.dm.a("state", cb.getValue())
      };
      this.updateHandlers.push(() => {
        if (!items.hidden) {
          const state = this.editor.dm.a("state"),
            stateEnum = this.editor.dm.a("stateEnum"),
            values = stateEnum?.map?.(item => {
              return item.value;
            }),
            labels = stateEnum.map(item => {
              return item.label || item.value;
            });
          values.unshift(undefined);
          labels.unshift("");
          cb.setValues(values);
          cb.setLabels(labels);
          cb.getValue() !== state && cb.setValue(state)
        }
      });
      items.push(cb);
      this.addFuncRow(items, "state");
    }
  }

  get currentPrefix() {
    const prefixStack = this.prefixStack;
    let str = "";
    if (prefixStack?.length) {
      str = prefixStack.join(".") + "."
    }
    return str
  }
}
