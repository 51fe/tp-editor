import config from "../config.js";
import {
  clone,
  getRowHeight,
  getString,
  getStrings,
  getWidths,
  isString,
  isNumber,
  isFunction,
  removeItem,
  stringifyFunction,
  createLabel,
  toNumber,
  createButton,
  initInputDND,
  initImageIcon,
  getter,
  setter,
  drawStretchImage,
  isEnter,
  getClientPoint,
  stringify,
  isDelete
} from "../util";
import { normalizeArray, nullToZero, raceColor } from "../util/inspector.js";
import { EVENTS, FILE_TYPE_ASSET, FILE_TYPE_SYMBOL, MAP } from "../constants.js";
import InspectorFilter from "./InspectorFilter.js";
import FormPane from "../pane/FormPane.js";
import TablePane from "../pane/TablePane.js";
import BaseDropDown from "../view/BaseDropDown.js";

export default class Inspector extends FormPane {
  constructor(editor, name, type, global = false) {
    super();
    this.setHPadding(8);
    this.setVPadding(0);
    const indent = config.indent,
      hGap = this.getHGap();
    this.indent = indent;
    this.indent2 = config.indent2;
    this.w1 = [indent, .1];
    this.w1w1 = [indent, .1, indent, .1];
    this.wcc = [indent, 40 + 2 * hGap + "+0.1", indent, 20, .1, 20];
    this.w2 = [indent - 20 - hGap, 20, .1, indent, .1];
    this.w3 = [indent - 20 - hGap, 20, .1, 20, .1, 20, .1];
    this.w20 = 20 + hGap + "+0.1";
    this.global = global;
    this.editor = editor;
    this.name = name;
    this.type = type;
    this.inspectorFilter = new InspectorFilter(editor, this);
    this.updateHandlers = [];
    this.propertyChangeHandlers = [];
    this.editor.fireEvent("inspectorInitializing", { inspector: this });
    this.initForm();
    this.editor.fireEvent("inspectorInitialized", { inspector: this });
    this.editor.fireEvent("inspectorCreated", { inspector: this });
    this.rows = this._rows;
  }

  initForm() {
  }

  beginTransaction() {
    this.dataModel && this.dataModel.beginTransaction();
  }

  endTransaction() {
    this.dataModel && this.dataModel.endTransaction();
  }

  addUpdateHandler(h) {
    this.updateHandlers.push(h);
  }

  removeUpdateHandler(h) {
    removeItem(this.updateHandlers, h);
  }

  addPropertyChangeHandler(h) {
    this.propertyChangeHandlers.push(h);
  }

  removePropertyChangeHandler(h) {
    removeItem(this.propertyChangeHandlers, h);
  }

  isTitleVisible(row) {
    return row.visible !== false && (!isFunction(row.visible) || row.visible(this) !== false)
  }

  isPropertyVisible(row) {
    if (row.visible === false) return false;
    if (isFunction(row.visible) && !row.visible(this)) return false;
    let filter = this.editor.inspectorInputFilter;
    if (filter) {
      if (!row.keys) return false;
      filter = filter.toLowerCase();
      const name = row.keys.name;
      if (name && name.toLowerCase().indexOf(filter) >= 0) return true;
      const displayName = row.keys.displayName;
      return !!(displayName && displayName.toLowerCase().indexOf(filter) >= 0)
    }
    return true
  }

  makeItemsHidden(items) {
    items.hidden = true;
    items.forEach(item => {
      const view = this.getItemView(item);
      view && (view.style.display = "none");
    })
  }

  makeItemsVisible(items) {
    items.hidden = false;
    items.forEach(item => {
      const view = this.getItemView(item);
      view && (view.style.display = "block");
    })
  }

  filterPropertiesLater() {
    if (!this._filterPropertiesLater) {
      this._filterPropertiesLater = true;
      requestAnimationFrame(() => {
        this.filterProperties();
      })
    }
  }

  isTitleExpanded(title) {
    return !(title && !this.editor.inspectorInputFilter) || config.expandedTitles[title];
  }

  filterProperties() {
    this._filterPropertiesLater = false;
    const props = [];
    this._currentTitle = null;
    let expanded = false;
    const hideAll = () => {
      if (!expanded && this._currentTitle !== "$$AWESOME$$" &&
        props.length && props[props.length - 1].title) {
        this.makeItemsHidden(props.pop().items)
      }
    }
    this.rows.forEach(row => {
      const items = row.items;
      if (row.title) {
        hideAll();
        if (this.isTitleVisible(row)) {
          this._currentTitle = row.title;
          row.button.setIcon(this.isTitleExpanded(this._currentTitle) ? "expandIcon" : "collapseIcon");
          props.push(row);
          this.makeItemsVisible(items)
        } else {
          this._currentTitle = "$$AWESOME$$";
          this.makeItemsHidden(items)
        }
        expanded = false
      } else if (this._currentTitle === "$$AWESOME$$") {
        this.makeItemsHidden(items);
      } else if (this.isTitleExpanded(this._currentTitle) && this.isPropertyVisible(row)) {
        props.push(row);
        this.makeItemsVisible(items);
      } else {
        this.makeItemsHidden(items);
      }
      if (!expanded && this.isPropertyVisible(row)) {
        expanded = true;
      }
    });
    hideAll();
    this._currentTitle = null;
    this._rows = props;
    this.updateProperties();
    this.iv()
  }

  addTitle(key, params = {}) {
    const oldKey = this._oldKey;
    this.editor.fireEvent("titleCreating", { oldTitle: oldKey, title: key, inspector: this });
    const initTitle = () => {
      config.expandedTitles[key] = !config.expandedTitles[key];
      this.filterProperties()
    },
      items = [],
      btn = this.addButton(items, null, null, null, initTitle, true);
    btn.setBorderColor(null);
    if (params.icon) {
      this.addImage(items, () => {
        return params.icon
      });
    }
    this.addTitleItem(items, key, params);
    params.title = key;
    if (!params.background) {
      params.background = config.inspectorTitleBackground || config.color_pane_dark
    }
    params.button = btn;
    let _widths = [20, .1];
    if (params.icon) {
      _widths = [20, 20, .1];
    }
    const btns = params.buttons;
    if (btns) {
      let items = undefined,
        widths = undefined;
      if (Array.isArray(btns)) {
        items = btns;
      } else {
        items = btns.items;
        widths = btns.widths;
      }
      if (!widths) {
        widths = [];
        const count = items.length;
        for (let i = 0; i < count; i++) {
          widths.push(20);
        }
      }
      items.push(items);
      _widths.push(widths);
    }
    const row = this.addRow(items, _widths, config.inspectorTitleHeight || null, params);
    this._oldKey = key;
    this.editor.fireEvent("titleCreated", { oldTitle: oldKey, title: key, inspector: this });
    return row;
  }

  addTitleItem(items, key) {
    const element = getString("editor." + key.toLowerCase(), true) || getString(key);
    items.push({ element, font: config.boldFont });
  }

  invalidateProperties(e) {
    if (e) {
      this.propertyChangeHandlers.forEach(setter => {
        setter(e, this);
      });
      this.rows.forEach(row => {
        row.onPropertyChanged && row.onPropertyChanged(e, this)
      })
    }
    if (!this._updatePropertiesLater) {
      this._updatePropertiesLater = true;
      requestAnimationFrame(() => {
        this.updateProperties();
      })
    }
  }

  updateProperties() {
    this._updating = true;
    this.updateHandlers.forEach(handler => {
      handler();
    });
    this.editor.fireEvent("propertiesUpdated", { inspector: this });
    this._updating = false;
    this._updatePropertiesLater = false;
  }

  eachSelection(setter) {
    if (this.dataModel) {
      this.beginTransaction();
      this.dataModel.sm().each(data => {
        setter(data)
      });
      this.endTransaction()
    }
  }

  getPropertyValue(name, type) {
    type = this.fixAccessType(type);
    const handler = getter(type, name);
    return this.getValue(handler)
  }

  setPropertyValue(name, value, type, once) {
    type = this.fixAccessType(type);
    const handler = setter(type, name);
    handler.once = once;
    this.setValue(handler, value)
  }

  getValue(getter) {
    if (this.dataModel) {
      if (this.global) {
        return getter(this.dataModel);
      } else if (this.data) {
        return getter(this.data);
      }
      return undefined;
    }
  }

  setValue(setter, value, getter) {
    if (!this._updating && this.dataModel && this.editor.editable) {
      this.beginTransaction();
      if (this.global) {
        setter(this.dataModel, getter ? getter() : value)
      } else if (setter?.once) {
        this.data && setter(this.data);
      } else {
        this.dataModel.sm().each(data => {
          setter(data, getter ? getter() : value)
        })
      }
      this.endTransaction();
    }
  }

  addLabelArray(items, label, getter, setter, valueType, keys) {
    this.addLabel(items, label, getter, setter, undefined, keys);
    return this.addArray(items, getter, setter, valueType);
  }

  addLabelTextArea(items, label, getter, setter, multiple) {
    this.addLabel(items, label, getter, setter, undefined, multiple);
    return this.addTextArea(items, getter, setter);
  }

  addLabelMultiline(items, label, getter, setter, keys) {
    const input = this.addLabelInput(items, label, getter, setter, undefined, undefined, undefined, keys);
    this.addButton(items, "...", null, null, () => {
      const _setValue = value => {
        this.setValue(setter, value)
      };
      this.editor.textView.open(this.getValue(getter), _setValue, label)
    }, true);
    return input;
  }

  addLabelInput(items, label, getter, setter, valueType, step, editable, keys) {
    this.addLabel(items, label, getter, setter, step, keys);
    return this.addInput(items, getter, setter, valueType, editable, step);
  }

  addLabelRange(items, label, getter, setter, min, max, step, valueType, keys) {
    const getValue = data => getter(data) ?? max;
    return this.addLabelInput(items, label, getValue, setter ? (data, value) => {
      if (max !== undefined && value > max) {
        value = max;
      }
      if (min !== undefined && value < min) {
        value = min
      }
      const newValue = getValue(data);
      setter(data, value);
      if (newValue === value && (newValue === max || newValue === min)) {
        this.updateProperties();
      }
    } : null, valueType, step, undefined, keys)
  }

  addLabelPosition(items, label, getter, setter, keys) {
    const labelGetter = data => getter(data) ?? 1,
      labelSetter = (data, value) => {
        value > 55 && (value = 55);
        value < 1 && (value = 1);
        setter(data, value);
      };
    this.addLabel(items, label, labelGetter, labelSetter, 1, keys);
    const mcb = new ht.widget.MultiComboBox;
    mcb.setEditable(true);
    mcb.setDropDownComponent(BaseDropDown);
    mcb.onValueChanged = (oldValue, newValue) => {
      this.setValue(setter, newValue)
    };
    items.push(mcb);
    this.updateHandlers.push(() => {
      const value = this.getValue(labelGetter);
      mcb.setValue(value)
    })
    return mcb;
  }

  addLabelColor(items, label, getter, setter, keys) {
    this.addLabel(items, label, getter, setter, undefined, keys);
    return this.addColor(items, getter, setter);
  }

  addLabelCheckBox(items, label, getter, setter, keys) {
    this.addLabel(items, label, getter, setter, undefined, keys);
    return this.addCheckBox(items, getter, setter);
  }

  addLabelFunction(items, label, getter, setter, btnLabel, args, keys) {
    this.addLabel(items, label, getter, setter, undefined, keys);
    return this.addFunction(items, getter, setter, btnLabel, args);
  }

  addLabelDataModel(items, label, getter, setter, btnLabel, extraInfo, keys) {
    this.addLabel(items, label, getter, setter, undefined, keys);
    return this.addDataModel(items, getter, setter, btnLabel, extraInfo)
  }

  addLabelObject(items, label, getter, setter, O, keys) {
    this.addLabel(items, label, getter, setter, undefined, keys);
    return this.addObject(items, getter, setter, O)
  }

  addLabelComboBox(items, label, getter, setter, valus, labels, icons, keys) {
    this.addLabel(items, label, getter, setter, undefined, keys);
    return this.addComboBox(items, getter, setter, valus, labels, icons);
  }

  addLabelComboBoxURL(items, label, getter, setter, values, labels, icons, getDroppable, keys) {
    this.addLabel(items, label, getter, setter, undefined, keys);
    const cb = this.addComboBox(items, getter, setter, values, labels, icons);
    if (setter) {
      cb.setEditable(true);
      initInputDND(cb, getDroppable || ((e, info) => {
        return !!info.view.draggingData;
      }), fileNode => {
        const value = cb.getView().value = fileNode.getFileUUID();
        this.setValue(setter, value);
      })
    }
    return cb;
  }

  addLabelURL(items, label, getter, setter, getDroppable, keys) {
    const input = this.addLabelInput(items, label, getter, setter, null, null, false, keys);
    if (setter) {
      initInputDND(input, getDroppable || ((e, info) => {
        return !!info.view.draggingData;
      }), fileNode => {
        input.getElement().value = fileNode.getFileUUID();
        input.handleChange();
      });
    }
    return input;
  }

  addLabelImage(items, label, getter, setter, keys) {
    const handler = (e, info) => {
      if (!info.view.draggingData) return false;
      const fileType = info.view.draggingData.fileType;
      return [FILE_TYPE_ASSET, FILE_TYPE_SYMBOL].includes(fileType);
    };
    this.addLabelURL(items, label, getter, setter, handler, keys);
    return this.addImage(items, getter, setter);
  }

  addLabelData(items, label, getter, setter, keys) {
    const input = this.addLabelInput(items, label, data => {
      const value = getter(data);
      return value ? value.toLabel() || value.getClassName() : ""
    }, undefined, undefined, undefined, undefined, keys);
    if (setter) {
      initInputDND(input, (e, info) => {
        const draggingData = info.view.draggingData;
        if (draggingData) {
          return this.dataModel === draggingData.getDataModel();
        }
        return false;
      }, value => {
        this.setValue(setter, value);
      });
      input.getElement().onkeydown = e => {
        isDelete(e) && this.setValue(setter, null);
      }
    }
    const image = new ht.widget.Image;
    image.drawImage = (g, name, x, y, w, h) => {
      const data = image.data,
        view = this.editor.list;
      if (data && view && view.dm().contains(data) && (name = view.getIcon(data))) {
        drawStretchImage(g, ht.Default.getImage(name), "centerUniform", x, y, w, h, data, view)
      }
    };
    this.updateHandlers.push(() => {
      if (!items.hidden) {
        const oldValue = image.data;
        image.data = this.getValue(getter);
        image.fp("data", oldValue, image.data)
      }
    });
    items.push(image);
    return input;
  }

  addLabelGradient(items, label, name, bgKey, gradientKey, keys) {
    const icons = [],
      gradientColorFunc = () => {
        return this.data && this.data.s(gradientKey) || config.color_light;
      },
      backgroundFunc = () => {
        return this.data && this.data.s(bgKey) || config.color_select;
      };
    tpeditor.consts.gradients.forEach(gradient => {
      gradient ? icons.push({
        width: 20,
        height: 14,
        comps: [{
          type: "rect",
          rect: [0, 0, 20, 14],
          gradient,
          gradientColor: { func: gradientColorFunc },
          background: { func: backgroundFunc }
        }]
      }) : icons.push({
        width: 20,
        height: 14,
        comps: []
      })
    });
    const cb = this.addLabelComboBox(items, label, node => {
      return node.s(name);
    }, (node, value) => {
      node.s(name, value);
    }, tpeditor.consts.gradients, null, icons, keys);
    this.updateHandlers.push(() => {
      if (!items.hidden) {
        const lastGradientColor = gradientColorFunc(),
          lastBackground = backgroundFunc();
        if (!(cb._lastGradientColor === lastGradientColor && cb._lastBackground === lastBackground)) {
          cb._lastGradientColor = lastGradientColor;
          cb._lastBackground = lastBackground;
          cb.iv();
        }
      }
    });
    return cb;
  }

  addLabelFont(items, label, getter, setter, keys) {
    const input = this.addLabelInput(items, label, value => {
      return getter(value) || ht.Default.labelFont
    }, setter ? (node, value) => {
      setter(node, value || undefined)
    } : null, undefined, undefined, undefined, keys);
    this.addButton(items, "...", null, null, () => {
      const handler = value => {
        this.setValue(setter, value)
      };
      this.editor.fontView.open(this.getValue(getter), handler, label)
    }, true);
    return input;
  }

  addLabelRotation(items, label, getter, setter, min, max, step, keys) {
    return this.addLabelInput(items, label, node => {
      return null == getter(node) ? max : 180 / Math.PI * getter(node)
    }, setter ? (data, value) => {
      value = value * Math.PI / 180;
      if (max !== undefined && value > max) {
        value = max;
      }
      if (min !== undefined && value < min) {
        value = min;
      }
      setter(data, value);
    } : null, "number", step || 1, undefined, keys);
  }

  addLabelAlign(items, label, getter, setter, keys) {
    return this.addLabelComboBox(items, label, data => {
      return getter(data) || "center";
    }, setter, tpeditor.consts.aligns, tpeditor.consts.alignLabels, undefined, keys);
  }

  addLabelVAlign(items, label, getter, setter, keys) {
    return this.addLabelComboBox(items, label, data => {
      return getter(data) || "bottom";
    }, setter, tpeditor.consts.vAligns, tpeditor.consts.vAlignLabels, undefined, keys);
  }

  addLabelStretch(items, label, getter, setter, keys) {
    return this.addLabelComboBox(items, label, data => {
      return getter(data) || "fill";
    }, setter, tpeditor.consts.stretchs, tpeditor.consts.stretchLabels, undefined, keys);
  }

  addLabelOrientation(items, label, getter, setter, keys) {
    return this.addLabelComboBox(items, label, data => {
      return getter(data) || "top";
    }, setter, tpeditor.consts.orientations, tpeditor.consts.orientationLabels, undefined, keys);
  }

  addLabelLabel(items, label, getter, setter, keys) {
    return this.addLabelInput(items, label, data => {
      const value = getter(data);
      return value?.replace(/\n/g, "\\n")
    }, setter ? (node, value) => {
      value = value?.replace(/\\n/g, "\n");
      setter(node, value);
    } : null, undefined, undefined, undefined, keys)
  }

  toDisplayName(items) {
    let label = "";
    items.forEach(item => {
      if (item) {
        if (isString(item)) {
          label += item;
        } else if (isString(item.element)) {
          label += item.element;
        } else {
          if (!item.element) return;
          if (item.element.innerHTML) {
            label += item.element.innerHTML;
          }
        }
      }
    });
    return label;
  }

  addLabel(items, label, getter, setter, step, keys) {
    let item = undefined,
      hasDataBound = false,
      resizable = getter && setter && step,
      dataBindings = config.dataBindings;
    if (keys && dataBindings.onButtonClicked) {
      if (!dataBindings.filter || dataBindings.filter(keys.accessType, keys.name, this)) {
        hasDataBound = true;
      }
    }

    if (hasDataBound || resizable) {
      item = createLabel(label, items.length ? "right" : "left");
      items.push(item);
      item.style.cursor = resizable ? "ew-resize" : "pointer";
      const handler = e => {
        e.preventDefault();
        this.beginTransaction();
        const offset = resizable ? this.getValue(getter) || 0 : 0,
          x = getClientPoint(e).x;
        let moving = false,
          h = e => {
            e.preventDefault();
            if (resizable) {
              const value = offset + (getClientPoint(e).x - x) * (isFunction(step) ? step() : step);
              this.setValue(setter, value);
              moving = true;
            }
          };
        window.addEventListener("mousemove", h, false);
        window.addEventListener("touchmove", h, false);
        h = e => {
          this.endTransaction();
          e.preventDefault();
          window.removeEventListener("mousemove", h, false);
          window.removeEventListener("touchmove", h, false);
          window.removeEventListener("mouseup", handler, false);
          window.removeEventListener("touchend", handler, false);
          if (hasDataBound && !moving) {
            config.dataBindings.onButtonClicked(this.data, keys.accessType, keys.name, this.editor);
          }
        };
        window.addEventListener("mouseup", handler, false);
        window.addEventListener("touchend", handler, false)
      };
      item.addEventListener("mousedown", handler, false);
      item.addEventListener("touchstart", handler, false);
    } else {
      item = { element: label, align: items.length ? "right" : "left" };
      items.push(item);
    }
    if (hasDataBound) {
      this.updateHandlers.push(function () {
        if (this.data) {
          const isDataBound = config.isDataBound(this.data, keys.accessType, keys.name);
          item.style.color = isDataBound ? config.color_select : config.color_dark;
        }
      });
    }
    return item;
  }

  createHandleChange(e, name, valueType) {
    return () => {
      let value = e.value;
      if (valueType === "pattern") {
        value = value.trim();
        if (value) {
          if (value.indexOf("[") < 0 || value.indexOf("]") < 0) return;
          value = value.replace("[", "").replace("]", "").split(",");
          if (value.length) {
            const numbers = [];
            for (let i = 0; i < value.length; i++) {
              const n = parseFloat(value[i]);
              if (isNaN(n)) return;
              numbers.push(n)
            }
            value = numbers
          } else {
            value = undefined;
          }
        } else {
          value = undefined;
        }
      } else if (valueType === "number") {
        if (value = parseFloat(value), isNaN(value)) return;
      } else if (valueType === "int") {
        if (value = parseInt(value), isNaN(value)) return;
      } else if (!value) {
        value = undefined;
      }
      this.setValue(name, value)
    }
  }

  createArrayIndexColumn(list, index, setter, valueType) {
    const defaultValue = list[index],
      value = valueType === "object" ? stringify(defaultValue, undefined, false) : defaultValue;
    return {
      name: index,
      width: 50,
      align: "center",
      editable: !!setter,
      sortable: false,
      clickable: false,
      getValueType: () => {
        return valueType
      },
      getValue: () => {
        return value
      },
      setValue: (data, column, value) => {
        this.setValue(setter, undefined, () => {
          const arr = list.slice();
          arr[index] = clone(value);
          return arr;
        })
      },
      isCellEditable: (data, column, value, tv) => {
        if (!this.editor.editable) return false;
        if (valueType === "object") {
          const title = getString("editor.object") + " [" + index + "]";
          this.editor.objectView.open(defaultValue, _setter => {
            column.setValue(data, column, _setter, tv)
          }, title);
          return false;
        }
        return true;
      }
    }
  }

  addArray(items, getter, setter, valueType) {
    const pane = new TablePane;
    pane.getTableHeader().setMovable(false);
    pane.getView().style.border = config.color_line + " solid 1px";
    const tv = pane.getTableView();
    tv.getDataModel().add(new ht.Data);
    this.updateHandlers.push(() => {
      if (!items.hidden) {
        const list = this.getValue(getter);
        tv.getColumnModel().clear();
        pane.addColumns([{
          name: getString("editor.length"),
          width: 50,
          align: "center",
          editable: !!setter,
          sortable: false,
          clickable: false,
          valueType: "int",
          getValue: () => {
            return list ? list.length : 0
          },
          setValue: (data, unused, length) => {
            this.setValue(setter, undefined, () => {
              if (length >= 0) {
                const arr = normalizeArray(list, length);
                if (["number", "int"].includes(valueType)) {
                  nullToZero(arr);
                } else if (valueType === "color") {
                  raceColor(arr);
                }
                return arr;
              }
            })
          }
        }]);
        if (list) {
          const columns = [];
          for (let i = 0; i < list.length; i++) {
            columns.push(this.createArrayIndexColumn(list, i, setter, valueType));
          }
          pane.addColumns(columns)
        }
      }
    });
    items.push(pane);
    return pane;
  }

  addTextArea(items, getter, setter) {
    const ta = new ht.widget.TextArea,
      el = ta.getElement();
    if (setter) {
      el.onblur = () => {
        this.setValue(setter, el.value);
      };
      el.forceOnblur = el.onblur;
    } else {
      ta.setEditable(false);
    }
    this.updateHandlers.push(() => {
      if (!items.hidden) {
        const value = this.getValue(getter) ?? "";
        el.value !== value && (el.value = value);
      }
    });
    items.push(ta);
    return ta;
  }

  addInput(items, getter, setter, valueType, editable, step) {
    const tf = new ht.widget.TextField;
    if (["number", "int"].includes(valueType)) {
      tf.setType("number");
      isNumber(step) && (tf.getElement().step = step)
    }
    const el = tf.getElement();
    if (setter) {
      const handler = this.createHandleChange(el, setter, valueType);
      tf.handleChange = handler;
      if (editable) {
        el.onkeyup = handler;
        el.onchange = handler;
      } else {
        el.onblur = handler;
        el.forceOnblur = el.onblur;
        el.onkeydown = e => {
          isEnter(e) && handler();
        }
      }
    } else {
      tf.setEditable(false);
    }
    this.updateHandlers.push(() => {
      if (!items.hidden) {
        let value = this.getValue(getter);
        if (valueType === "pattern") {
          if (value) {
            value = "[" + value.join() + "]";
          } else {
            value = "";
          }
        } else if (valueType === "number") {
          value = toNumber(parseFloat(value || 0))
        } else if (valueType === "int") {
          value = parseInt(value || 0)
        } else if (value == null) {
          value = ""
        }
        if (el.value !== value) {
          if (isString(value) && value.length > 1000 && value.startsWith("data:image")) {
            value = value.substr(0, 10) + "[...]";
          }
          el.value = value;
        }
      }
    });
    items.push(tf);
    return tf;
  }

  addColor(items, getter, setter) {
    const cp = new ht.widget.ColorPicker;
    if (setter) {
      cp.setInstant(true);
      cp.onValueChanged = () => {
        this.setValue(setter, cp.getValue());
      };
      cp.addViewListener(e => {
        if (e.kind === "open") {
          this.beginTransaction();
        } else if (e.kind === "close") {
          this.endTransaction();
        }
      })
    } else {
      cp.setDisabled(true);
    }
    this.updateHandlers.push(() => {
      if (!items.hidden) {
        const value = this.getValue(getter) ?? null;
        if (cp.getValue() != value) {
          cp.setValue(value);
        }
      }
    });
    items.push(cp);
    return cp;
  }

  addImage(items, getter) {
    const image = new ht.widget.Image;
    initImageIcon(image, this.editor);
    this.updateHandlers.push(() => {
      if (!items.hidden || items.forceToUpdate) {
        const value = this.getValue(getter);
        image.setExtraInfo(value)
      }
    });
    items.push(image);
    return image;
  }

  addCheckBox(items, getter, setter) {
    const cb = new ht.widget.CheckBox;
    if (setter) {
      cb.handleClick = () => {
        this.editor.editable && cb.setSelected(!cb.isSelected())
      };
      cb.onValueChanged = () => {
        this.setValue(setter, cb.getValue())
      }
    } else {
      cb.setDisabled(true);
    }
    this.updateHandlers.push(() => {
      if (!items.hidden) {
        const value = !!this.getValue(getter);
        cb.getValue() !== value && cb.setValue(value)
      }
    });
    items.push(cb);
    return cb;
  }

  addFunction(items, getter, setter, label, args) {
    const onClicked = () => {
      const title = getString("editor.function") + " - " + (label || ""),
        setValue = value => {
          this.setValue(setter, value)
        };
      this.editor.functionView.open(this.getValue(getter), setValue, title, args)
    }, cb = createButton(label, null, null, onClicked);
    items.push(cb);
    this.updateHandlers.push(() => {
      if (!items.hidden) {
        const value = this.getValue(getter);
        cb.setLabel(label || stringifyFunction(value));
        if (value) {
          cb.setLabelColor(config.color_select);
        } else {
          cb.setLabelColor(ht.Default.labelColor);
        }
      }
    });
    return cb;
  }

  addDataModel(items, getter, setter, label, extraInfo) {
    const onClicked = () => {
      const setValue = value => {
        this.setValue(setter, value)
      };
      this.editor.dataModelView.open(this.getValue(getter), setValue, this.editor.editable, extraInfo)
    };
    const btn = createButton(label, null, null, onClicked);
    items.push(btn);
    this.updateHandlers.push(() => {
      if (!items.hidden) {
        const value = this.getValue(getter);
        btn.setLabel(label);
        if (value) {
          btn.setLabelColor(config.color_select);
        } else {
          btn.setLabelColor(ht.Default.labelColor);
        }
      }
    });
    return btn
  }

  addObject(items, getter, setter, label) {
    const onClicked = () => {
      const title = getString("editor.object") + " - " + (label || ""),
        setValue = value => {
          this.setValue(setter, value);
        };
      this.editor.objectView.open(this.getValue(getter), setValue, title);
    }, btn = createButton(label, null, null, onClicked);
    items.push(btn);
    this.updateHandlers.push(() => {
      if (!items.hidden) {
        const value = this.getValue(getter);
        btn.setLabel(label || stringify(value, undefined, false));
        if (value !== undefined) {
          btn.setLabelColor(config.color_select);
        } else {
          btn.setLabelColor(ht.Default.labelColor);
        }
      }
    });
    return btn;
  }

  addComboBox(items, getter, setter, values, labels, icons) {
    const cb = new ht.widget.ComboBox;
    cb.setValues(values);
    cb.setLabels(labels);
    cb.setIcons(icons);
    cb.setDisabled(!setter);
    setter && (cb.onValueChanged = () => {
      this.setValue(setter, cb.getValue())
    });
    this.updateHandlers.push(() => {
      if (!items.hidden) {
        const value = this.getValue(getter);
        cb.getValue() !== value && cb.setValue(value)
      }
    });
    if (icons && icons[0].width) {
      cb.setIndent(icons[0].width + 4);
    }
    items.push(cb);
    return cb;
  }

  addButton(items, label, toolTip, icon, setter, single) {
    const onClicked = () => {
      this.global || single ? setter() : this.eachSelection(setter)
    },
      btn = createButton(label, toolTip, icon, onClicked);
    items.push(btn);
    return btn
  }

  addDBRow(items, accessType, name, params, height, widths, keys) {
    const length = items.length,
      indent = this.indent;
    let row = undefined;
    if (config.dataBindings.onButtonClicked && keys
      && config.dataBindings.filter?.(accessType, name, this)) {
      if (widths) {
        row = this.addRow(items, widths, height, params)
      } else if (length > 2 && length < 6) {
        row = this.addRow(items, [indent, .1, ...new Array(length - 2).fill(20)], height, params);
      } else if (length === 1) {
        row = this.addRow(items, [.1], height, params)
      }
    } else {
      const _setter = () => {
        config.dataBindings.onButtonClicked(this.data, accessType, name, this.editor)
      }, toolTip = config.dataBindings.getToolTip?.(accessType, name, this) ??
        accessType + ":" + name,
        btn = this.addButton(items, null, toolTip, null, _setter, true);
      this.updateHandlers.push(() => {
        if (!items.hidden && this.data) {
          const isDataBound = config.isDataBound(this.data, accessType, name);
          btn.setIcon(isDataBound ? "editor.bind.state" : "editor.unbind.state")
        }
      });
      if (widths) {
        widths = widths.slice();
        widths.push(20);
        row = this.addRow(items, widths, height, params);
      } else {
        if (length > 1 && length < 6) {
          row = this.addRow(items, [indent, .1, ...new Array(length - 1).fill(20)], height, params);
        } else if (length === 1) {
          row = this.addRow(items, [.1, 20], height, params)
        }
      }
    }
    row.keys = {
      name,
      displayName: this.toDisplayName(items),
      accessType
    };
    if (!this.addingCustomProperties && MAP?.[this.type][accessType + ":" + name]) {
      this.removeRows([row]);
    }
    return row;
  }

  addFuncRow(items, name, key, height, widths) {
    const indent = this.indent;
    let row = undefined;
    if (!config.dataBindingsForSymbol.filter?.(key || name, this)) {
      const _setter = () => {
        this.dataModel && this.editor.funcView.toggle(btn, name, key, this)
      },
        toolTip = config.dataBindingsForSymbol.getToolTip?.(key || name, this),
        btn = this.addButton(items, null, toolTip, null, _setter, true);
      this.updateHandlers.push(() => {
        if (!items.hidden) {
          let binding = false;
          if (this.global) {
            if (this.dataModel) {
              if (name === 'clip') {
                binding = isFunction(this.dataModel.a(name));
              } else {
                binding = !!this.dataModel.a(name + "_func");
              }
            }
          } else if (this.data) {
            binding = !!this.data.a(name)
          }
          btn.setIcon(binding ? "editor.bind.state" : "editor.unbind.state");
        }
      });
      const length = items.length;
      if (widths) {
        widths = widths.slice();
        widths.push(20);
        row = this.addRow(items, widths, height);
      } else if (length > 2 && length < 7) {
        row = this.addRow(items, [indent, .1, ...new Array(length - 2).fill(20)], height)
      }
    } else {
      const length = items.length;
      if (widths) {
        row = this.addRow(items, widths, height);
      } else if (length > 1 && length < 7) {
        row = this.addRow(items, [indent, .1, ...new Array(length - 2).fill(20)], height)
      }
    }

    row.keys = {
      name: key || name,
      displayName: this.toDisplayName(items)
    };
    if (!this.addingCustomProperties && MAP?.[this.type][key || name]) {
      this.removeRows([row]);
    }
    return row;
  }

  addNameRow(items, name, accessType, height, widths) {
    const indent = this.indent,
      length = items.length;
    let row = undefined;
    if (widths) {
      row = this.addRow(items, widths, height);
    } else if (length > 1) {
      row = this.addRow(items, [indent, .1, [...new Array(length - 2).fill(20)]], height)
    }
    row.keys = {
      name,
      displayName: this.toDisplayName(items),
      accessType
    };
    name = (accessType ? accessType + ":" : "") + name;
    if (!this.addingCustomProperties && MAP?.[this.type][name]) {
      this.removeRows([row]);
    }
    return row;
  }

  addGridsGuidesProperties() {
    this.addTitle("TitleGridsGuides");
    let items = [];
    this.addLabelCheckBox(items, getString("editor.gridenabled"), node => {
      return node.a("gridEnabled");
    }, (node, value) => {
      node.a("gridEnabled", value);
    });
    this.addButton(items, getString("editor.skew"), null, null, () => {
      this.editor?.currentView?.skewGrid();
    });
    this.addButton(items, getString("editor.reset"), null, null, () => {
      this.editor?.currentView?.resetGrid();
    });
    this.addNameRow(items, "gridEnabled", "a", undefined, [this.indent, 20, .1, .1]);
    items = [];
    this.addLabelInput(items, getString("editor.gridblocksize"), node => {
      return node.a("gridBlockSize")
    }, (node, value) => {
      value > 0 && node.a("gridBlockSize", value)
    }, "int", 1);
    this.addNameRow(items, "gridBlockSize", "a");
    items = [];
    this.addLabelInput(items, getString("editor.gridthicklinesevery"), node => {
      return node.a("gridThickLinesEvery");
    }, (node, value) => {
      value > 0 && node.a("gridThickLinesEvery", value);
    }, "int", 1);
    this.addNameRow(items, "gridThickLinesEvery", "a");
    items = [];
    this.addLabelColor(items, getString("editor.gridlightcolor"), node => {
      return node.a("gridLightColor");
    }, (node, value) => {
      node.a("gridLightColor", value);
    });
    this.addNameRow(items, "gridLightColor", "a");
    items = [];
    this.addLabelColor(items, getString("editor.gridthickcolor"), node => {
      return node.a("gridThickColor")
    }, (node, value) => {
      node.a("gridThickColor", value);
    });
    this.addNameRow(items, "gridThickColor", "a");
    items = [];
    this.addLabelInput(items, getString("editor.gridangle"), node => {
      return 180 / Math.PI * node.a("gridAngle");
    }, (node, value) => {
      node.a("gridAngle", value * Math.PI / 180)
    }, "number", 1);
    this.addNameRow(items, "gridAngle", "a");
    items = [];
    this.addLabelInput(items, getString("editor.gridrotation"), node => {
      return 180 / Math.PI * node.a("gridRotation")
    }, (node, value) => {
      node.a("gridRotation", value * Math.PI / 180)
    }, "number", 1);
    this.addNameRow(items, "gridRotation", "a");
    items = [];
    this.addLabelInput(items, getString("editor.gridzoomthreshold"), node => {
      return node.a("gridZoomThreshold");
    }, (node, value) => {
      value > 0 && node.a("gridZoomThreshold", value);
    }, "number", .01);
    this.addNameRow(items, "gridZoomThreshold", "a");
  }

  addHighlightProperties() {
  }

  addEditingPointProperties() {
    this.addTitle("TitleEditingPoint");
    const prop = { Mirrored: 0, Straight: 1, Disconnected: 2, Asymmetric: 3 };
    this.editingPointButtons = [];
    const addBtn = (btns, name) => {
      const label = getString("editor.editingpoint." + name.toLowerCase()),
        icon = "editor.point." + name.toLowerCase(),
        btn = createButton(label, null, icon, () => {
          this.editor.editInteractor.getSubModule("Curve").setCurrentSelectionStatus(btn.statusValue)
        });
      btn.setOrientation("v");
      btn.setTogglable(true);
      btn.setGroupId("editingPoint");
      btn.statusValue = prop[name];
      this.editingPointButtons.push(btn);
      btns.push(btn);
    };

    let items = [];
    addBtn(items, "Straight");
    addBtn(items, "Mirrored");
    this.addRow(items, [.1, .1], 60);
    items = [];
    addBtn(items, "Disconnected");
    addBtn(items, "Asymmetric");
    this.addRow(items, [.1, .1], 60);
    if (tpeditor.SceneView) {
      items = [];
      items.push(getString("editor.point"));
      this.addLabelInput(items, "X", () => {
        return this.editor.getCurrentEditingPointValue("x")
      }, (unused, value) => {
        return this.editor.setCurrentEditingPointValue("x", value)
      }, "number", 1);
      this.addLabelInput(items, "Y", () => {
        return this.editor.getCurrentEditingPointValue("y")
      }, (unusde, l) => {
        return this.editor.setCurrentEditingPointValue("y", l)
      }, "number", 1);
      this.addNameRow(items, "currentEditingPoint.x.y", undefined, undefined, this.w2)
        .visible = () => {
          return !(this.currentView instanceof tpeditor.SceneView)
        };
      items = [];
      items.push(getString("editor.point"));
      this.addLabelInput(items, "X", () => {
        return this.editor.getCurrentEditingPointValue("x")
      }, (node, value) => {
        return this.editor.setCurrentEditingPointValue("x", value)
      }, "number", 1);
      this.addLabelInput(items, "Y", () => {
        return this.editor.getCurrentEditingPointValue("e")
      }, (node, value) => {
        return this.editor.setCurrentEditingPointValue("e", value)
      }, "number", 1);
      this.addLabelInput(items, "Z", () => {
        return this.editor.getCurrentEditingPointValue("y")
      }, (node, value) => {
        return this.editor.setCurrentEditingPointValue("y", value)
      }, "number", 1);
      this.addNameRow(items, "currentEditingPoint.x.y.z", undefined, undefined, this.w3).visible = () => {
        return this.currentView instanceof tpeditor.SceneView;
      }
    }
  }

  addCustomProperties() {
    const cp = config.customProperties[this.type];
    if (cp?.length) {
      this.addTitle("TitleCustom");
      cp.forEach(prop => {
        this.addCustomProperty(prop);
      })
    }
  }

  fixAccessType(type = "a") {
    if (this.type === "symbol") {
      type = "a"
    } else if (this.type === "comp") {
      type = "s"
    }
    return type;
  }

  addEventProperties(items) {
    let selected = undefined;
    if (items) {
      selected = false;
    } else {
      items = [];
      selected = true;
    }
    const setter = () => {
      let data = this.global ? this.dataModel : this.data;
      if (data) {
        data = this.global ? [this.dataModel] : this.dataModel.sm().getSelection().toArray();
      }
      this.editor.eventView.open(data, this.type)
    };
    this.addLabel(items, getString("editor.events"));
    const btn = this.addButton(items, getString("editor.eventhandlers"), null, null, setter, true);
    if (selected) {
      if (["data", "data3d"].includes(this.type)) {
        this.addLabel(items, getString("editor.interactive"));
        this.addCheckBox(items, node => {
          return !!node && node.s("interactive")
        }, (node, value) => {
          node && node.s("interactive", value)
        });
        this.addRow(items, this.w1w1).keys = {
          name: "eventHandlers",
          displayName: getString("editor.eventhandlers")
        }
      } else {
        this.addRow(items, this.w1).keys = {
          name: "eventHandlers",
          displayName: getString("editor.eventhandlers")
        }
      }
    }
    this.updateHandlers.push(() => {
      if (!items.hidden) {
        selected = false;
        let data = this.global ? this.dataModel : this.data;
        EVENTS.forEach(event => {
          if (!selected) {
            if (["data", "data3d"].includes(this.type)) {
              selected = data.s(event);
            } else {
              selected = data.a(event);
            }
          }
        });
        btn.setLabelColor(selected ? config.color_select : ht.Default.labelColor)
      }
    })
  }

  addCustomProperty(prop) {
    const name = prop.name,
      editable = prop.editable !== false,
      defaultValue = prop.defaultValue,
      accessType = this.fixAccessType(prop.accessType),
      property = prop.property;
    let valueType = prop.valueType;
    if (!(valueType = config.valueTypes[valueType])) return false;
    this.addingCustomProperties = true;
    const items = [],
      label = getString(name) || property,
      gh = getter(accessType, property),
      sh = setter(accessType, property),
      _getter = type => {
        let value = gh(type);
        if (value === undefined) {
          value = defaultValue;
        }
        return value;
      },
      _setter = editable ? sh : null,
      extraInfo = prop.extraInfo;
    let values = undefined,
      labels = undefined,
      icons = undefined;
    if (extraInfo?.enum) {
      values = extraInfo.enum.values;
      labels = getStrings(extraInfo.enum.labels, extraInfo.enum.i18nLabels);
      icons = extraInfo.enum.icons
    }
    const bindable = prop.dataBinding || prop.bindable;
    let hasAction = tpeditor.SceneView && bindable && (["data", "data3d"].includes(this.type));
    let ui = undefined;
    if (extraInfo?.buildUI) {
      ui = extraInfo.buildUI(this, items, label, _getter, _setter, extraInfo);
      hasAction = false;
    } else if (values) {
      if (hasAction) {
        this.addActionLabelComboBox(items, label, accessType, property, values, labels, icons, _getter, _setter)
      } else {
        this.addLabelComboBox(items, label, _getter, _setter, values, labels, icons)
      }
    } else if (["int", "number"].includes(valueType.type)) {
      if (valueType.angle) {
        if (hasAction) {
          this.addActionLabelRotation(items, label, accessType, property,
            valueType.min, valueType.max, valueType.step, _getter, _setter);
        } else {
          this.addLabelRotation(items, label, _getter, _setter,
            valueType.min, valueType.max, valueType.step);
        }
      } else {
        if (hasAction) {
          this.addActionLabelRange(items, label, accessType, property, valueType.min, valueType.max,
            valueType.step, valueType.type, _getter, _setter);
        } else {
          this.addLabelRange(items, label, _getter, _setter, valueType.min, valueType.max,
            valueType.step, valueType.type);
        }
      }
    } else if (valueType.type === "color") {
      if (hasAction) {
        this.addActionLabelColor(items, label, accessType, property, _getter, _setter);
      } else {
        this.addLabelColor(items, label, _getter, _setter)
      }
    } else if (valueType.type === "boolean") {
      if (hasAction) {
        this.addActionLabelCheckBox(items, label, accessType, property, _getter, _setter);
      } else {
        this.addLabelCheckBox(items, label, _getter, _setter);
      }
    } else if (valueType.type === "enum") {
      if (hasAction) {
        this.addActionLabelComboBox(items, label, accessType, property, valueType.values,
          valueType.labels, valueType.icons, _getter, _setter);
      } else {
        this.addLabelComboBox(items, label, _getter, _setter, valueType.values, valueType.labels, valueType.icons);
      }
    } else if (valueType.type === "image") {
      if (hasAction) {
        this.addActionLabelImage(items, label, accessType, property, _getter, _setter);
      } else {
        this.addLabelImage(items, label, _getter, _setter);
      }
    } else if (valueType.type === "url") {
      if (hasAction) {
        this.addActionLabelURL(items, label, accessType, property, undefined, _getter, _setter);
      } else {
        this.addLabelURL(items, label, _getter, _setter);
      }
    } else if (valueType.type === "multiline") {
      if (hasAction) {
        this.addActionLabelMultiline(items, label, accessType, property, _getter, _setter);
      } else {
        this.addLabelMultiline(items, label, _getter, _setter);
      }
    } else if (valueType.type === "colorArray") {
      if (hasAction) {
        this.addActionLabelArray(items, label, accessType, property, "color", _getter, _setter);
      } else {
        this.addLabelArray(items, label, _getter, _setter, "color");
      }
    } else if (valueType.type === "numberArray") {
      if (hasAction) {
        this.addActionLabelArray(items, label, accessType, property, "number", _getter, _setter);
      } else {
        this.addLabelArray(items, label, _getter, _setter, "number");
      }
    } else if (valueType.type === "stringArray") {
      if (hasAction) {
        this.addActionLabelArray(items, label, accessType, property, "string", _getter, _setter);
      } else {
        this.addLabelArray(items, label, _getter, _setter, "string");
      }
    } else if (valueType.type === "objectArray") {
      if (hasAction) {
        this.addActionLabelArray(items, label, accessType, property, "object", _getter, _setter);
      } else {
        this.addLabelArray(items, label, _getter, _setter, "object");
      }
    } else if (valueType.type === "function") {
      if (hasAction) {
        this.addActionLabelFunction(items, label, accessType, property, property, extraInfo && extraInfo.arguments, _getter, _setter);
      } else {
        this.addLabelFunction(items, label, _getter, _setter, property, extraInfo && extraInfo.arguments);
      }
    } else if (valueType.type === "dataModel") {
      this.addActionLabelDataModel(items, label, accessType, property, property, _getter, _setter);
    } else if (valueType.type === "object") {
      if (hasAction) {
        this.addActionLabelObject(items, label, accessType, property, property, _getter, _setter);
      } else {
        this.addLabelObject(items, label, _getter, _setter, property);
      }
    } else if (valueType.type === "font") {
      if (hasAction) {
        this.addActionLabelFont(items, label, accessType, property, _getter, _setter);
      } else {
        this.addLabelFont(items, label, _getter, _setter);
      }
    } else if (valueType.type === "custom") {
      ui = valueType.buildUI(this, items, label, _getter, _setter, extraInfo);
      hasAction = false;
    } else {
      if (hasAction) {
        this.addActionLabelInput(items, label, accessType, property, undefined, undefined, undefined, _getter, _setter);
      } else {
        this.addLabelInput(items, label, _getter, _setter);
      }
    }
    let row = undefined;
    if (["display", "scene"].includes(this.type) || hasAction || !bindable) {
      row = this.addNameRow(items, property, accessType, getRowHeight(ui, valueType), getWidths(ui, valueType));
    } else if (["data", "data3d"].includes(this.type)) {
      row = this.addDBRow(items, accessType, property, null, getRowHeight(ui, valueType), getWidths(ui, valueType));
    } else if (["symbol", "comp"].includes(this.type)) {
      row = this.addFuncRow(items, property, null, getRowHeight(ui, valueType), getWidths(ui, valueType));
    }
    if (row && extraInfo) {
      row.visible = extraInfo.visible;
      row.onPropertyChanged = extraInfo.onPropertyChanged;
    }
    this.addingCustomProperties = false;
  }

  addLabelLayer(items, keys) {
    const _getter = getter("p", "layer"),
      _setter = setter("p", "layer");
    this.addLabel(items, getString("editor.layer"), undefined, undefined, undefined, keys);
    const cb = new ht.widget.ComboBox;
    cb.onValueChanged = () => {
      this.setValue(_setter, cb.getValue())
    };
    this.updateHandlers.push(() => {
      if (!items.hidden) {
        cb.setValues(this.editor.layerPane.layerNames);
        const value = this.getValue(_getter);
        cb.getValue() !== value && cb.setValue(value)
      }
    });
    items.push(cb);
    return cb;
  }

  addLabelIcons(items, keys) {
    this.addLabel(items, getString("editor.icons"), undefined, undefined, undefined, keys);
    const setter = () => {
      this.data && this.editor.iconsView.toggle(icon, this.data);
    },
      icon = this.addButton(items, "Icons", "s:icons", null, setter, true);
    this.updateHandlers.push(() => {
      items.hidden || icon.setLabelColor(this.data.s("icons") ?
        config.color_select : ht.Default.labelColor)
    });
    return icon;
  }

  addLabelBatch(items, keys) {
    const _getter = getter("s", "batch"),
      _setter = setter("s", "batch");
    this.addLabel(items, getString("editor.batch"), undefined, undefined, undefined, keys);
    const cb = new ht.widget.ComboBox;
    cb.onValueChanged = () => {
      this.setValue(_setter, cb.getValue())
    };
    this.updateHandlers.push(() => {
      if (!items.hidden) {
        cb.setValues(this.editor.batchView.batchNames);
        const value = this.getValue(_getter);
        cb.getValue() !== value && cb.setValue(value)
      }
    });
    items.push(cb);
    return cb
  }

  addActionLabel(items, label, accessType, name) {
    this.addLabel(items, label, undefined, undefined, undefined, { accessType, name })
  }

  addActionLabelInput(items, label, accessType, name, valueType, step, editable, value, defaultValue) {
    this.addLabelInput(items, label,
      getter(accessType, name, value),
      setter(accessType, name, defaultValue), valueType, step, editable, { accessType, name })
  }

  addActionLabelData(items, label, accessType, name, value, defaultValue) {
    this.addLabelData(items, label,
      getter(accessType, name, value),
      setter(accessType, name, defaultValue), { accessType, name })
  }

  addActionLabelRange(items, label, accessType, name, min, max, step, valueType, value, defaultValue) {
    if (step === undefined) {
      step = valueType === "int" ? 1 : .1
    }
    this.addLabelRange(items, label,
      getter(accessType, name, value),
      setter(accessType, name, defaultValue),
      min, max, step, valueType, { accessType, name }
    )
  }

  addActionLabelCheckBox(items, label, accessType, name, value, defaultValue) {
    this.addLabelCheckBox(items, label,
      getter(accessType, name, value),
      setter(accessType, name, defaultValue),
      { accessType, name }
    )
  }

  addActionLabelColor(items, label, accessType, name, value, defaultValue) {
    this.addLabelColor(items, label,
      getter(accessType, name, value),
      setter(accessType, name, defaultValue), { accessType, name }
    )
  }

  addActionLabelImage(items, label, accessType, name, value, defaultValue) {
    this.addLabelImage(items, label,
      getter(accessType, name, value),
      setter(accessType, name, defaultValue), { accessType, name })
  }

  addActionLabelObject(items, label, accessType, name, O, value, defaultValue) {
    this.addLabelObject(items, label,
      getter(accessType, name, value),
      setter(accessType, name, defaultValue), O, { accessType, name })
  }

  addActionLabelComboBox(items, label, accessType, name, valus, labels, icons, value, defaultValue) {
    this.addLabelComboBox(items, label,
      getter(accessType, name, value),
      setter(accessType, name, defaultValue), valus, labels, icons, { accessType, name })
  }

  addActionLabelComboBoxURL(items, label, accessType, name, values, labels, icons, getDroppable, value, defaultValue) {
    this.addLabelComboBoxURL(items, label,
      getter(accessType, name, value),
      setter(accessType, name, defaultValue), values, labels, icons, getDroppable, { accessType, name })
  }

  addActionLabelFont(items, label, accessType, name, value, defaultValue) {
    this.addLabelFont(items, label,
      getter(accessType, name, value),
      setter(accessType, name, defaultValue), { accessType, name })
  }

  addActionLabelPosition(items, label, accessType, name, value, defaultValue) {
    this.addLabelPosition(items, label,
      getter(accessType, name, value),
      setter(accessType, name, defaultValue), { accessType, name })
  }

  addActionLabelMultiline(items, label, accessType, name, value, defaultValue) {
    this.addLabelMultiline(items, label,
      getter(accessType, name, value),
      setter(accessType, name, defaultValue), { accessType, name })
  }

  addActionLabelRotation(items, label, accessType, name, min, max, step, value, defaultValue) {
    this.addLabelRotation(items, label,
      getter(accessType, name, value),
      setter(accessType, name, defaultValue), min, max, step, { accessType, name })
  }

  addActionLabelAlign(items, label, accessType, name, value, defaultValue) {
    this.addLabelAlign(items, label,
      getter(accessType, name, value),
      setter(accessType, name, defaultValue), { accessType, name })
  }

  addActionLabelVAlign(items, label, accessType, name, value, defaultValue) {
    this.addLabelVAlign(items, label,
      getter(accessType, name, value),
      setter(accessType, name, defaultValue), { accessType, name })
  }

  addActionLabelStretch(items, label, accessType, name, value, defaultValue) {
    this.addLabelStretch(items, label,
      getter(accessType, name, value),
      setter(accessType, name, defaultValue), { accessType, name })
  }

  addActionLabelOrientation(items, label, accessType, name, value, defaultValue) {
    this.addLabelOrientation(items, label,
      getter(accessType, name, value),
      setter(accessType, name, defaultValue), { accessType, name })
  }

  addActionLabelURL(items, label, accessType, name, getDroppable, value, defaultValue) {
    this.addLabelURL(items, label,
      getter(accessType, name, value),
      setter(accessType, name, defaultValue), getDroppable, { accessType, name })
  }

  addActionLabelArray(items, label, accessType, name, valueType, value, defaultValue) {
    this.addLabelArray(items, label,
      getter(accessType, name, value),
      setter(accessType, name, defaultValue), valueType, { accessType, name })
  }

  addActionLabelFunction(items, label, accessType, name, btnLabel, args, value, defaultValue) {
    this.addLabelFunction(items, label,
      getter(accessType, name, value),
      setter(accessType, name, defaultValue), btnLabel, args, { accessType, name })
  }

  addActionLabelDataModel(items, label, accessType, name, btnLabel, extraInfo, value, defaultValue) {
    this.addLabelDataModel(items, label,
      getter(accessType, name, value),
      setter(accessType, name, defaultValue), btnLabel, extraInfo, { accessType, name })
  }

  addActionLabelLayer(items) {
    this.addLabelLayer(items, { accessType: "p", name: "layer" })
  }

  addActionLabelIcons(items) {
    this.addLabelIcons(items, { accessType: "s", name: "icons" })
  }

  addActionLabelBatch(items) {
    this.addLabelBatch(items, { accessType: "s", name: "batch" })
  }
}
