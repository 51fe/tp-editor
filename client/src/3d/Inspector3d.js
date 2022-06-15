import { drawStretchImage, getDataBindingMap, getString, isJSON } from "../util/index.js";
import Inspector from "../Inspector/index.js";
import HTNodeInspector from "../inspector/HTNodeInspector.js";
import config3d from "./config3d";

export default class Inspector3d extends Inspector {
  constructor(editor, name, type, global = false) {
    super(editor, name, type, global)
    this.setHPadding(8);
    this.setVPadding(4);
    this.addUpdateHandler(() => {
      this.invalidateDataBindings();
    });
    this._cacheImgObjects = [];
  }

  initForm() {
    super.initForm();
    this.addCustomProperties();
  }

  addOneRow(items, index, params) {
    const widths = [this.indent, .1],
      length = items.length;
    for (let i = 2; i < length; i++) {
      widths.push(20);
    }
    const row = this.addRow(items, widths, index ? this.getRowHeight() * index : null, params);
    row.index = this.getRows().length - 1;
    return row;
  }

  invalidateDataBindings() {
    if (!this._updateDataBindingsLater) {
      this._updateDataBindingsLater = true;
      requestAnimationFrame(() => {
        this.initDataBindings();
      })
    }
  }

  initDataBindings() {
    this._updateDataBindingsLater = false;
    const data = this.data;
    if (data) {
      const images = [
        data.s("all.image"),
        data.s("top.image"),
        data.s("bottom.image"),
        data.s("left.image"),
        data.s("right.image"),
        data.s("front.image"),
        data.s("back.image"),
        data.s("shape3d.image"),
        data.s("shape3d.top.image"),
        data.s("shape3d.bottom.image"),
        data.s("shape3d.from.image"),
        data.s("shape3d.to.image")
      ],
        items = [],
        count = images.length;
      let binded = false;
      for (let i = 0; i < count; i++) {
        let img = images[i];
        if (img) {
          if (!(img = ht.Default.getImage(img))) {
            binded = true;
            break
          }
          items.push(img);
        }
      }
      if (binded) {
        const loaded = ht.Default.handleImageLoaded;
        ht.Default.handleImageLoaded = (...rest) => {
          loaded.apply(ht.Default, rest);
          ht.Default.handleImageLoaded = loaded;
          this.initDataBindings();
        }
        return;
      }
      if (items.length !== 0) {
        const cacheImgObjects = this._cacheImgObjects;
        let needUpdate = cacheImgObjects.length !== items.length;
        if (!needUpdate) {
          needUpdate = items.some(item => cacheImgObjects.indexOf(item) === -1);
        }
        if (needUpdate) {
          this._rows = this.rows;
          this.clearDataBinding();
          this._cacheImgObjects = items;
          const props = [],
            bindings = {},
            map = {},
            dataBinding = {},
            length = items.length;
          for (let i = 0; i < length; i++) {
            const item = items[i];
            if (item.comps) {
              item.comps.forEach(function (comp) {
                if (isJSON(comp.type)) {
                  const instance = ht.Default.getCompType(comp.type);
                  if (instance) {
                    for (const key in instance.properties) {
                      bindings[key] = instance.properties[key].defaultValue;
                    }
                  }
                }
                getDataBindingMap(comp, map, dataBinding)
              });
              for (const key in map) {
                if (dataBinding[key] === undefined) {
                  dataBinding[key] = bindings[map[key]];
                }
              }
            }
            this.dataBindings && props.push(...this.dataBindings);
          }
          if (props.length > 0) {
            const length = this.updateHandlers.length;
            this.dataBindingRows.push(this.addTitle("TitleDataBinding"));
            const map = {};
            props.forEach(prop => {
              const attr = prop.attr;
              if (!map[attr]) {
                map[attr] = 1;
                HTNodeInspector.prototype.addProperty.call(this, prop, undefined, dataBinding);
              }
            });
            this.dataBindingHandlers = this.updateHandlers.slice(length);
          }
          this.rows = this._rows;
          this.filterProperties();
        }
      }
    }
  }

  clearDataBinding() {
    const rows = this.dataBindingRows;
    rows?.length > 0 && this.removeRows(rows);
    this.dataBindingRows = [];
    var handlers = this.dataBindingHandlers;
    handlers?.forEach?.(e => {
      this.removeUpdateHandler(e)
    });
    this.dataBindingHandlers = [];
    this._cacheImgObjects = [];
  }

  addProperty(prop, e) {
    const items = [],
      attr = prop.attr,
      valueType = config3d.valueTypes[prop.valueType];
    if (!valueType) {
      this.editor.fireEvent("error", {
        message: "Wrong value type:" + prop.valueType,
        dataBind: prop
      });
      return false;
    }
    const label = getString(prop.name) || attr,
      _getter = function (node) {
        let _value = node.a(attr);
        if (_value === undefined) {
          _value = e[attr]
        }
        return _value;
      },
      _setter = function (node, value) {
        return node.a(attr, value)
      };
    const type = valueType.type;
    if (["int", "number"].includes(type)) {
      if (valueType.angle) {
        this.addLabelRotation(items, label, _getter, _setter,
          valueType.min, valueType.max, valueType.step)
      } else {
        this.addLabelRange(items, label, _getter, _setter,
          valueType.min, valueType.max, valueType.step, valueType.type)
      }
    } else if (type === "color") {
      this.addLabelColor(items, label, _getter, _setter)
    } else if (type === "boolean") {
      this.addLabelCheckBox(items, label, _getter, _setter);
    } else if (type === "enum") {
      this.addLabelComboBox(items, label, _getter, _setter,
        valueType.values, valueType.labels, valueType.icons);
    } else if (type === "multiline") {
      this.addLabelMultiline(items, label, _getter, _setter);
    } else if (type === "font") {
      this.addLabelFont(items, label, _getter, _setter);
    } else if (type === "image") {
      this.addLabelImage(items, label, _getter, _setter);
    } else if (type === "url") {
      this.addLabelURL(items, label, _getter, _setter);
    } else if (type === "colorArray") {
      this.addLabelArray(items, label, _getter, _setter, "color")
    } else if (type === "numberArray") {
      this.addLabelArray(items, label, _getter, _setter, "number")
    } else if (type === "stringArray") {
      this.addLabelArray(items, label, _getter, _setter, "string")
    } else if (type === "objectArray") {
      this.addLabelArray(items, label, _getter, _setter, "object")
    } else if (type === "function") {
      this.addLabelFunction(items, label, _getter, _setter, attr)
    } else if (type === "object") {
      this.addLabelObject(items, label, _getter, _setter, attr)
    } else {
      this.addLabelInput(items, label, _getter, _setter);
    }
    return items;
  }

  addLabelData(items, label, getter, setter) {
    const input = this.addLabelInput(items, label, name => {
      var node = getter(name);
      return node ? node.toLabel() || node.getClassName() : "";
    }),
      el = input.getElement();
    input.isDroppable = (e, info) => {
      return this.dataModel === info.view.draggingData?.getDataModel();
    };

    input.handleCrossDrag = (e, kind, info) => {
      if (kind === "enter") {
        el.style.border = "solid " + config3d.color_select_dark + " 2px";
      } else if (["exit", "cancel"].includes(kind)) {
        el.style.border = ""
      } else if (["over", "drop"].includes(kind)) {
        el.style.border = "";
        this.setValue(setter, info.view.draggingData);
        input.setFocus();
      }
    };
    el.onkeydown = e => {
      ht.Default.isDelete(e) && this.setValue(setter, null)
    };
    const Image = new ht.widget.Image;
    Image.drawImage = (g, img, x, y, w, h) => {
      const data = Image.data,
        view = this.editor.list;

      if (data && view && view.dm().contains(data)) {
        img = view.getIcon(data);
        if (img) {
          drawStretchImage(g, ht.Default.getImage(img),
            "centerUniform", x, y, w, h, data, view);
        }
      }
      this.updateHandlers.push(() => {
        if (!items.hidden) {
          var data = Image.data;
          Image.data = this.getValue(data);
          Image.fp("data", label, Image.data);
        }
      });
      items.push(Image);
    }
  }

  addImage(items, getter, setter, getIcon, prop) {
    const image = new ht.widget.Image;
    image.vectorDataBindingDisabled = true;
    const _getIcon = getIcon || function (url) {
      var img = ht.Default.getImage(url);
      return img && img.snapshotURL ? img.snapshotURL : url
    };
    this.updateHandlers.push(() => {
      if (!items.hidden) {
        const icon = this.getValue(getter);
        image.rawIcon = icon;
        image.setIcon(_getIcon(icon))
      }
    });
    const el = image.getView();
    el.style.cursor = "pointer";
    const handler = e => {
      e.preventDefault();
      if (!prop || prop.image) {
        if (ht.Default.isDoubleClick(e)) {
          this.editor.open(image.rawIcon);
        } else {
          this.editor.selectFileNode(image.rawIcon);
        }
      }
    };
    el.addEventListener("mousedown", handler, false);
    el.addEventListener("touchstart", handler, false);
    items.push(image);
    return image;
  }

  get type() {
    return this._type;
  }

  set type(value) {
    this._type = value;
  }

  get dataModel() {
    return this.editor.dm;
  }
}
