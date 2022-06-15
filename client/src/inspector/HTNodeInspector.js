import config from "../config.js";
import {
  getString, getter, setter, isObject, isJSON,
  getDataBindingMap, getRowHeight, getWidths, isString, getStrings
} from "../util/index.js";
import HTDataInspector from "./HTDataInspector.js";

export default class HTNodeInspector extends HTDataInspector {
  constructor(editor, name) {
    super(editor, name);
  }

  initForm() {
    this.addCustomProperties();
    this.addControlProperties();
    this.addLayoutProperties();
    this.addBasicProperties();
    this.addImageProperties();
    this.addShapeProperties();
    this.addLabelProperties();
    this.addNoteProperties();
    this.addSelectProperties();
  }

  addControlProperties() {
    this.addTitle("TitleControl");
    this.addEventProperties();
    this.addDBComboBox("s", getString("editor.movemode"), "2d.move.mode", [undefined, "x", "y"],
      ["", getString("editor.horizontal"), getString("editor.vertical")]);
    this.addDBCheckBox("s", getString("editor.ingroup"), "ingroup");
    this.addDBCheckBox("s", getString("editor.visible"), "2d.visible");
    this.addDBCheckBox("s", getString("editor.selectable"), "2d.selectable");
    this.addDBCheckBox("s", getString("editor.movable"), "2d.movable");
    this.addDBCheckBox("s", getString("editor.editable"), "2d.editable");
    this.addDBCheckBox("s", getString("editor.pixelperfect"), "pixelPerfect")
  }

  addBasicProperties() {
    super.addBasicProperties();
    this.addDBGray();
    this.addDBLayer();
    this.addDBInput("p", getString("editor.tooltip"), "toolTip");
    this.addDBBodyColorProperty();
    this.addDBOpacityProperty();
    this.addDBIconsProperty();
    this.addDBState();
    this.addDBClipProperty();
  }
  addDBState() {
    const items = [];
    this.addLabelState(items);
    const row = this.addDBRow(items, "s", "state");
    row.visible = () => {
      const states = this.getStateEnum();
      return states?.length;
    };
    return row;
  }

  getStateEnum() {
    let result = null;
    if (this.data instanceof ht.Node) {
      const p = ht.Default.getImage(this.data.getImage());
      if (p) {
        result = p.stateEnum
      }
    }
    return result;
  }

  addActionLabelState(items) {
    this.addLabelState(items, { accessType: "s", name: "state" })
  }

  addLabelState(items, state) {
    const cb = new ht.widget.ComboBox,
      O = function (p) {
        var _state = p.s("state");
        if (_state) return _state;
        if (p.getImage) {
          var img = ht.Default.getImage(p.getImage());
          return img ? img.state : undefined
        }
      },
      states = setter("s", "state");
    this.addLabel(items, getString("editor.state"), undefined, undefined, undefined, state);
    cb.onValueChanged = () => {
      this.setValue(states, cb.getValue())
    };
    this.updateHandlers.push(() => {
      if (!items.hidden) {
        var stateEnum = this.getStateEnum();
        if (!stateEnum || 0 === !stateEnum) {
          return undefined
        }
        if (cb?.getValues().length) {
          cb.setValues();
          cb.setLabels();
          cb.setValue()
        }
        const value = this.getValue(O),
          states = stateEnum.map(item => {
            return item.value
          }),
          label = stateEnum.map(function (p) {
            return p.label || p.value
          });
        states.unshift(undefined);
        label.unshift("");
        cb.setValues(states);
        cb.setLabels(label);
        if (cb.getValue() !== value && typeof value != "object") {
          cb.setValue(value)
        }
      }
    });
    items.push(cb);
    return cb;
  }

  addActionLabelNodeImage(p) {
    this.addLabelNodeImage(p, { accessType: "p", name: "image" })
  }

  addLabelNodeImage(items, keys) {
    items.forceToUpdate = true;
    this.addLabelImage(items, getString("editor.image"), node => {
      const name = node.getImage(),
        img = ht.Default.getImage(name);
      this.invalidateDataBindings(isObject(img) ? img.dataBindings : null, img);
      return name;
    }, (node, image) => {
      if (!(isString(image) && image.endsWith("[...]"))) {
        node.setImage?.(image)
      }
    }, keys);
    this.addButton(items, null, getString("editor.resetsize"),
      "editor.resetsize.state", function (node) {
        node instanceof ht.Node && node.setSize(-1, -1)
      })
  }

  addImageProperties() {
    this.addDBStretch("s", getString("editor.stretch"), "image.stretch").items.tag = "imageRelative";
    const { shapes, shapeLabels, shapeIcons } = tpeditor.consts
    this.addDBComboBox("s", getString("editor.shape"), "shape", shapes, shapeLabels, shapeIcons);
    const items = [];
    this.addLabelNodeImage(items);
    this.imageRow = this.addDBRow(items, "p", "image");
    this.imageRow.items.tag = "imageRelative";
  }

  addLayoutProperties() {
    this.addTitle("TitleLayout");
    this.addDBInput("p", getString("editor.posx"), "x", "number", 1);
    this.addDBInput("p", getString("editor.posy"), "y", "number", 1);
    this.addDBInput("p", getString("editor.width"), "width", "number", 1);
    this.addDBInput("p", getString("editor.height"), "height", "number", 1);
    this.addDBRotation("p", getString("editor.rotation"), "rotation");
    let items = [];
    this.addLabelInput(items, getString("editor.scalex"), getter("p", "scaleX"), setter("p", "scaleX"), "number", .01);
    this.addButton(items, null, getString("editor.flipx"), "editor.flipx",
      node => {
        node instanceof ht.Node && node.setScaleX(-node.getScaleX())
      });
    this.addDBRow(items, "p", "scaleX");
    items = [];
    this.addLabelInput(items, getString("editor.scaley"), getter("p", "scaleY"), setter("p", "scaleY"), "number", .01);
    this.addButton(items, null, getString("editor.flipy"), "editor.flipy",
      node => {
        node instanceof ht.Node && node.setScaleY(-node.getScaleY())
      });
    this.addDBRow(items, "p", "scaleY");
    items = [];
    this.addLabelInput(items, getString("editor.anchorx"),
      node => {
        return node.getAnchor().x
      },
      (node, value) => {
        node instanceof ht.Node && node.setAnchor(value, node.getAnchor().y, true);
      }, "number", .01);
    this.addDBRow(items, "p", "anchorX");
    items = [];
    this.addLabelInput(items, getString("editor.anchory"),
      node => {
        return node.getAnchor().y
      },
      (node, value) => {
        node instanceof ht.Node && node.setAnchor(node.getAnchor().x, value, true);
      }, "number", .01);
    this.addDBRow(items, "p", "anchorY");
    this.addDBData("p", getString("editor.host"), "host",
      (node, value) => {
        if (!node.s("fullscreen") && node instanceof ht.Node && (value === undefined || value instanceof ht.Node)) {
          node.setHost(value);
        }
      }).items.tag = "host";
    this.addUpdateHandler(() => {
      this.updateSymbolLayoutProperties();
    });
    if (config.layoutEnabled) {
      this.addDBComboBox("s", getString("editor.fullscreen"), "fullscreen",
        tpeditor.consts.fullscreenValues, tpeditor.consts.fullscreenLabels).items.tag = "fullscreen";
      this.addDBComboBox("s", getString("editor.fullscreen.lock"), "fullscreen.lock",
        tpeditor.consts.fullscreenLockValues, tpeditor.consts.fullscreenLockLabels).items.tag = "fullscreenDetail";
      this.addDBInput("s", getString("editor.fullscreen.gap"), "fullscreen.gap", "number", 1).items.tag = "fullscreenDetail";
      this.addNameRow([null, { element: this.addLayoutView() }, null], "layoutView", undefined, 100, [.1, 100, .1]).items.tag = "nodeLayout";
      let row = this.addDBComboBox("s", getString("editor.nodeLayout.h"), "layout.h",
        tpeditor.consts.hLayoutValues, tpeditor.consts.hLayoutLabels);
      row.items.tag = "nodeLayout";
      this.layoutVRow = row = this.addDBComboBox("s", getString("editor.nodeLayout.v"), "layout.v",
        tpeditor.consts.vLayoutValues, tpeditor.consts.vLayoutLabels);
      row.items.tag = "nodeLayout";
    }
  }

  addLayoutView(width = 100) {
    const gv = this.layoutGv = new ht.graph.GraphView,
      node = this.layoutNode = new ht.Node;
    let seleted = false;
    node.setImage("editor.layout.helper");
    node.a("selectColor", config.color_select);
    node.setSize(width, width);
    gv.dm().add(node);
    gv.tx(width / 2);
    gv.ty(width / 2);
    gv.handleScroll = () => { };
    gv.handlePinch = () => { };
    gv.setScrollBarVisible(false);
    gv.setRectSelectable(false);
    gv.setPannable(false);
    gv.setMovableFunc(() => {
      return false;
    });
    gv.dm().md(e => {
      if (!seleted) {
        this.beginTransaction();
        this.dataModel.sm().getSelection().each(data => {
          if (e.property === "a:layout.v") {
            data.s("layout.v", e.newValue);
          } else if (e.property === "a:layout.h") {
            data.s("layout.h", e.newValue);
          }
        });
        this.endTransaction();
      }
    });
    this.addUpdateHandler(() => {
      const data = this.data;
      seleted = true;
      node.a({
        "layout.v": data.s("layout.v"),
        "layout.h": data.s("layout.h")
      });
      seleted = false;
    });
    return gv;
  }

  addDBClipProperty() {
    this.addDBZeroToOne("s", getString("editor.clippercentage"), "clip.percentage");
    this.addDBComboBox("s", getString("editor.clipdirection"), "clip.direction",
      tpeditor.consts.clipDirections, tpeditor.consts.clipDirectionLabels);
  }

  addShapeProperties() {
    this.addShapeBackgroundProperties();
    this.addShapeForegroundProperties();
    this.addShapeBorderProperties();
    this.addShapeDashProperties();
  }

  addShapeBackgroundProperties() {
    this.addTitle("TitleShapeBackground");
    this.addDBColor("s", getString("editor.background"), "shape.background");
    this.addDBGradient(getString("editor.gradient"), "shape.gradient", "shape.background", "shape.gradient.color");
    this.addDBColor("s", getString("editor.gradientcolor"), "shape.gradient.color");
    this.addDBImage("s", getString("editor.repeatimage"), "shape.repeat.image");
    this.addDBZeroToOne("s", getString("editor.clippercentage"), "shape.fill.clip.percentage");
    this.addDBComboBox("s", getString("editor.clipdirection"), "shape.fill.clip.direction",
      tpeditor.consts.clipDirections, tpeditor.consts.clipDirectionLabels);
  }

  addShapeForegroundProperties() {
    this.addTitle("TitleShapeForeground");
    this.addDBColor("s", getString("editor.foreground"), "shape.foreground");
    this.addDBGradient(getString("editor.gradient"), "shape.foreground.gradient", "shape.foreground", "shape.foreground.gradient.color");
    this.addDBColor("s", getString("editor.gradientcolor"), "shape.foreground.gradient.color");
    this.addDBZeroToOne("s", getString("editor.clippercentage"), "shape.foreground.clip.percentage");
    this.addDBComboBox("s", getString("editor.clipdirection"), "shape.foreground.clip.direction",
      tpeditor.consts.clipDirections, tpeditor.consts.clipDirectionLabels);
  }

  addShapeBorderProperties() {
    this.addTitle("TitleShapeBorder");
    this.addDBInput("s", getString("editor.width"), "shape.border.width", "number", 1);
    this.addDBCheckBox("s", getString("editor.widthabsolute"), "shape.border.width.absolute");
    this.addDBPattern("s", getString("editor.pattern"), "shape.border.pattern");
    this.addDBColor("s", getString("editor.color"), "shape.border.color");
    this.addDBCheckBox("s", getString("editor.threed"), "shape.border.3d");
    this.addDBColor("s", getString("editor.threedcolor"), "shape.border.3d.color");
    this.addDBComboBox("s", getString("editor.join"), "shape.border.join", tpeditor.consts.joins, tpeditor.consts.joinLabels);
    this.addDBComboBox("s", getString("editor.cap"), "shape.border.cap", tpeditor.consts.caps, tpeditor.consts.capLabels);
    this.addOutlineProperties()
  }

  addOutlineProperties() {
    this.addDBInput("s", getString("editor.depth"), "shape.depth", "int", 1).items.tag = "shapeDepth";
    this.addDBInput("s", getString("editor.sides"), "shape.polygon.side", "int", 1).items.tag = "shapeSide";
    this.addDBInput("s", getString("editor.radius"), "shape.corner.radius", "number", 1).items.tag = "shapeRadius";
    this.addDBCheckBox("s", getString("editor.arcoval"), "shape.arc.oval").items.tag = "shapeArc";
    this.addDBCheckBox("s", getString("editor.closed"), "shape.arc.close").items.tag = "shapeArc";
    this.addDBRotation("s", getString("editor.arcfrom"), "shape.arc.from").items.tag = "shapeArc";
    this.addDBRotation("s", getString("editor.arcto"), "shape.arc.to").items.tag = "shapeArc"
  }

  addShapeDashProperties() {
    this.addTitle("TitleShapeDash");
    this.addDBPattern("s", getString("editor.pattern"), "shape.dash.pattern");
    this.addDBCheckBox("s", getString("editor.dash"), "shape.dash");
    this.addDBColor("s", getString("editor.color"), "shape.dash.color");
    this.addDBInput("s", getString("editor.offset"), "shape.dash.offset", "number", 1);
    this.addDBInput("s", getString("editor.width"), "shape.dash.width", "number", 1);
    this.addDBCheckBox("s", getString("editor.threed"), "shape.dash.3d");
    this.addDBColor("s", getString("editor.threedcolor"), "shape.dash.3d.color");
  }

  invalidateProperties(e) {
    this._updateDataBindingsLater && this.updateDataBindings();
    if (e) {
      if (["s:shape", "host", "s:fullscreen"].includes(e.property)) {
        this.filterPropertiesLater();
        return false;
      }
      if ("s:select.type" === e.property && ("shadow" === e.oldValue || "shadow" === e.newValue)) {
        this.filterPropertiesLater();
        return false;
      }
    }
    super.invalidateProperties(e);
  }

  isTitleVisible(row) {
    const titleStyle = { TitleShapeBackground: true, TitleShapeForeground: true, TitleShapeBorder: true, TitleShapeDash: true };
    return !(!(!this.data || this.data instanceof ht.Shape || this.data.s("shape")) && titleStyle[row.title]) && super.isTitleVisible(row)
  }

  isPropertyVisible(row) {
    if (this.data) {
      const tag = row.items.tag;
      if (tag) {
        if ("selectShadow" === tag) {
          if ("shadow" !== this.data.s("select.type")) return false
        } else if ("shapeDepth" === tag) {
          if ("rect" !== this.data.s("shape")) return false
        } else if ("shapeSide" === tag) {
          if ("polygon" !== this.data.s("shape")) return false
        } else if ("shapeRadius" === tag) {
          if ("roundRect" !== this.data.s("shape")) return false
        } else if ("shapeArc" === tag) {
          if ("arc" !== this.data.s("shape")) return false
        } else if ("imageRelative" === tag) {
          if (this.data.s("shape")) return false
        } else if ("layer" === tag) {
          if (!this.editor.layerPane.layerNames.length) return false
        } else if ("fullscreen" === tag) {
          if (this.data.getHost()) return false
        } else if ("fullscreenDetail" === tag) {
          if (!this.data.s("fullscreen")) return false
        } else if ("host" === tag) {
          if (this.data.s("fullscreen")) return false
        } else if ("nodeLayout" === tag && !this.data.getHost()) return false
      }
    }
    return super.isPropertyVisible(row)
  }

  invalidateDataBindings(dataBindings, img) {
    if (this.dataBindings !== dataBindings) {
      this._dataBindings = dataBindings;
      this.pendingImage = img;
      if (!this._updateDataBindingsLater) {
        this._updateDataBindingsLater = true;
        requestAnimationFrame(() => {
          this._updateDataBindingsLater && this.updateDataBindings()
        })
      }
    }
  }

  updateDataBindings() {
    this._updateDataBindingsLater = false;
    if (this.dataBindings === this._dataBindings) {
      this._dataBindings = null;
      this.pendingImage = null;
      return false
    }
    this._rows = this.rows;
    this.removeRows(this.dataBindingRows);
    this?.dataBindingHandlers?.forEach?.(this.removeUpdateHandler, this);
    this.dataBindingRows = [];
    this.dataBindingHandlers = [];
    this.dataBindings = this._dataBindings;
    if (this.dataBindings) {
      const length = this.updateHandlers.length;
      let attrs = {},
        keys = {},
        dataBindings = {};
      this.pendingImage.comps.forEach(comp => {
        if (isJSON(comp.type)) {
          const compType = ht.Default.getCompType(comp.type);
          if (compType) {
            for (const name in compType.properties) {
              attrs[name] = compType.properties[name].defaultValue;
            }
          }
        }
        getDataBindingMap(comp, keys, dataBindings);
      });
      for (const name in keys) {
        if (dataBindings[name] === undefined) {
          dataBindings[name] = attrs[keys[name]];
        }
      }
      let group = undefined,
        index = this._rows.indexOf(this.imageRow) + 1;
      this.dataBindings.forEach(prop => {
        if (prop?.group !== group) {
          group = prop.group;
          const row = this.addTitle(group, { index });
          row.items.tag = "imageRelative";
          this.dataBindingRows.push(row);
          index++;
        }
        this.addProperty (prop, index, dataBindings) && index++;
      });
      this.dataBindingHandlers = this.updateHandlers.slice(length);
    }
    this.rows = this._rows;
    this.filterProperties();
  }

  addProperty (prop, index, dataBinding, rows, layout) {
    const items = [],
      name = prop.attr,
      valueType = config.valueTypes[prop.valueType];
    if (!valueType) {
      this.editor.fireEvent("error", { message: "Wrong value type:" + prop.valueType });
      return false;
    }
    const label = getString(prop.name) || name,
      _getter = (node) => {
        let value = node.a(name);
        if (value === undefined) {
          value = dataBinding[name];
        }
        return value;
      },
      _setter = (node, value) => {
        node.a(name, value);
      },
      extraInfo = prop?.extraInfo;
    let values = undefined,
      labels = undefined,
      icons = undefined;
    if (extraInfo?.enum) {
      values = extraInfo.enum.values;
      labels = getStrings(extraInfo.enum.labels, extraInfo.enum.i18nLabels);
      icons = extraInfo.enum.icons;
    }
    const bindable = prop?.bindable;
    let hasAction = tpeditor.SceneView && bindable,
      ui = undefined;
    if (extraInfo?.buildUI) {
      ui = extraInfo.buildUI(this, items, label, _getter, _setter, extraInfo);
      hasAction = false;
    }
    if (values) {
      if (hasAction) {
        this.addActionLabelComboBox(items, label, "a", name,
          values, labels, icons, _getter, _setter);
      } else {
        this.addLabelComboBox(items, label, _getter, _setter, values, labels, icons)
      }
    } else if (["int", "number"].includes(valueType.type)) {
      if (valueType.angle) {
        if (hasAction) {
          this.addActionLabelRotation(items, label, "a", name,
            valueType.min, valueType.max, valueType.step, _getter, _setter)
        } else {
          this.addLabelRotation(items, label, _getter, _setter,
            valueType.min, valueType.max, valueType.step);
        }
      } else {
        if (hasAction) {
          this.addActionLabelRange(items, label, "a", name, valueType.min, valueType.max,
            valueType.step, valueType.type, _getter, _setter);
        } else {
          this.addLabelRange(items, label, _getter, _setter, valueType.min, valueType.max,
            valueType.step, valueType.type);
        }
      }
    } else if (valueType.type === "color") {
      if (hasAction) {
        this.addActionLabelColor(items, label, "a", name, _getter, _setter)
      } else {
        this.addLabelColor(items, label, _getter, _setter);
      }
    } else if (valueType.type === "boolean") {
      if (hasAction) {
        this.addActionLabelCheckBox(items, label, "a", name, _getter, _setter);
      } else {
        this.addLabelCheckBox(items, label, _getter, _setter);
      }
    } else if (valueType.type === "enum") {
      if (hasAction) {
        this.addActionLabelComboBox(items, label, "a", name, valueType.values,
          valueType.labels, valueType.icons, _getter, _setter)
      } else {
        this.addLabelComboBox(items, label, _getter, _setter,
          valueType.values, valueType.labels, valueType.icons);
      }
    } else if (valueType.type === "multiline") {
      if (hasAction) {
        this.addActionLabelMultiline(items, label, "a", name, _getter, _setter)
      } else {
        this.addLabelMultiline(items, label, _getter, _setter)
      }
    } else if (valueType.type === "font") {
      if (hasAction) {
        this.addActionLabelFont(items, label, "a", name, _getter, _setter)
      } else {
        this.addLabelFont(items, label, _getter, _setter);
      }
    } else if (valueType.type === "image") {
      if (hasAction) {
        this.addActionLabelFont(items, label, "a", name, _getter, _setter)
      } else { this.addLabelFont(items, label, _getter, _setter); }
    } else if (valueType.type === "url") {
      if (hasAction) {
        this.addActionLabelURL(items, label, "a", name, undefined, _getter, _setter)
      } else {
        this.addLabelURL(items, label, _getter, _setter);
      }
    } else if (valueType.type === "colorArray") {
      if (hasAction) {
        this.addActionLabelArray(items, label, "a", name, "color", _getter, _setter)
      } else {
        this.addLabelArray(items, label, _getter, _setter, "color");
      }
    } else if (valueType.type === "numberArray") {
      if (hasAction) {
        this.addActionLabelArray(items, label, "a", name, "number", _getter, _setter)
      } else { this.addLabelArray(items, label, _getter, _setter, "number"); }
    } else if (valueType.type === "stringArray") {
      if (hasAction) {
        this.addActionLabelArray(items, label, "a", name, "string", _getter, _setter)
      } else {
        this.addLabelArray(items, label, _getter, _setter, "string");
      }
    } else if (valueType.type === "objectArray") {
      if (hasAction) {
        this.addActionLabelArray(items, label, "a", name, "object", _getter, _setter)
      } else { this.addLabelArray(items, label, _getter, _setter, "object"); }
    } else if (valueType.type === "function") {
      if (hasAction) {
        this.addActionLabelFunction(items, label, "a", name, name, extraInfo && extraInfo.arguments, _getter, _setter)
      } else {
        this.addLabelFunction(items, label, _getter, _setter, name, extraInfo && extraInfo.arguments);
      }
    } else if (valueType.type === "object") {
      if (hasAction) {
        this.addActionLabelObject(items, label, "a", name, name, _getter, _setter)
      } else {
        this.addLabelObject(items, label, _getter, _setter, name);
      }
    } else if (valueType.type === "custom") {
      ui = valueType.buildUI(this, items, label, _getter, _setter, extraInfo);
      hasAction = false;
    } else if (valueType.type === "dataModel") {
      if (hasAction) {
        this.addActionLabelDataModel(items, label, "a", name, name, extraInfo, _getter, _setter)
      } else {
        this.addLabelDataModel(items, label, _getter, _setter, name, extraInfo);
      }
    } else {
      if (hasAction) {
        this.addActionLabelInput(items, label, "a", name, undefined, undefined, undefined, _getter, _setter)
      } else {
        this.addLabelInput(items, label, _getter, _setter);
      }
    }
    const row = this.addDBRow(items, "a", name, { index },
      getRowHeight(ui, valueType), getWidths(ui, valueType), bindable && !hasAction);
    if (extraInfo) {
      row.visible = extraInfo.visible;
      row.onPropertyChanged = extraInfo.onPropertyChanged;
    }
    if (!rows) {
      rows = this.dataBindingRows;
    }
    rows.push(row);
    if (layout !== null) {
      items.tag = layout || "imageRelative";
    }
    return true;
  }

  addSelectProperties() {
    this.addTitle("TitleSelect");
    this.addDBColor("s", getString("editor.color"), "select.color");
    this.addDBInput("s", getString("editor.width"), "select.width", "number", 1);
    this.addDBInput("s", getString("editor.padding"), "select.padding", "number", 1);
    this.addDBComboBox("s", getString("editor.selecttype"), "select.type", tpeditor.consts.selectTypes, tpeditor.consts.selectTypeLabels, tpeditor.consts.selectTypeIcons);
    this.addDBInput("s", getString("editor.shadowblur"), "shadow.blur", "number", 1).items.tag = "selectShadow";
    this.addDBInput("s", getString("editor.shadowoffsetx"), "shadow.offset.x", "number", 1).items.tag = "selectShadow";
    this.addDBInput("s", getString("editor.shadowoffsety"), "shadow.offset.y", "number", 1).items.tag = "selectShadow"
  }

  updateSymbolLayoutProperties() {
    const host = this.data.getHost?.();
    let data = host?.getImage(),
      layoutProperties = undefined;
    if (data) {
      data = ht.Default.getImage(data);
      if (isObject(data)) {
        layoutProperties = data.layoutProperties;
      }
    }
    if (this.layoutProperties !== layoutProperties) {
      this._rows = this.rows;
      this.removeRows(this.layoutPropertiesRows);
      this?.layoutPropertiesHandlers.forEach?.(this.removeUpdateHandler, this);
      this.layoutPropertiesRows = [];
      this.layoutPropertiesHandlers = [];
      this.layoutProperties = layoutProperties;
      if (this.layoutProperties) {
        const length = this.updateHandlers.length;
        let group = undefined,
          index = this._rows.indexOf(this.layoutVRow) + 1;
        this.layoutProperties.forEach(prop => {
          if (prop.group && group !== prop.group) {
            group = prop.group;
            const row = this.addTitle(group, { index });
            row.items.tag = "layoutRelative";
            this.layoutPropertiesRows.push(row);
            index++;
          }
          if (this.addProperty (prop, index, {}, this.layoutPropertiesRows, "layoutRelative")) {
            index++;
          }
        });
        this.layoutPropertiesHandlers = this.updateHandlers.slice(length);
      }
      this.rows = this._rows;
    }
  }
}
