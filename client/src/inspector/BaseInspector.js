import config from "../config.js";
import { getString, toNumber, getter, setter } from "../util/index.js";
import Inspector from "./index.js"

export default class BaseInspector extends Inspector {
  constructor(editor, name) {
    super(editor, name, "comp")
  }

  initForm() {
    this.addCustomProperties();
    this.addControlProperties();
    this.addLayoutProperties();
    this.addFormProperties();
    this.addShadowProperties()
  }

  isTitleVisible(row) {
    const compType = this.data ? this.data.compType : null;
    if (this.inspectorFilter.isCompTitleVisible(this.editor, compType, row.title)) {
      return super.isTitleVisible(row);
    }
    return false;
  }

  isPropertyVisible(row) {
    const compType = this.data ? this.data.compType : null;
    if (this.inspectorFilter.isCompPropertyVisible(this.editor, compType, row.keys?.name)) {
      return super.isPropertyVisible(row);
    }
    return false;
  }

  addControlProperties() {
    this.addTitle("TitleControl");
    this.addEventProperties();
    this.addStyleCheckBox(getString("editor.visible"), "2d.visible", "visible");
    this.addStyleCheckBox(getString("editor.selectable"), "2d.selectable", "selectable");
    this.addStyleCheckBox(getString("editor.movable"), "2d.movable", "movable");
    this.addStyleCheckBox(getString("editor.editable"), "2d.editable", "editable");
    this.addStyleCheckBox(getString("editor.pixelperfect"), "pixelPerfect", "pixelPerfect")
  }

  addFormProperties() {
    this.addTitle("TitleBasic");
    this.addStyleType();
    this.addStyleName();
    this.addStyleInput(getString("editor.prefix"), "prefix", "prefix");
    this.addStyleClip();
    this.addStyleZeroToOne(getString("editor.opacity"), "opacity", "opacity");
    this.addState();
  }

  addState() {
    const items = [],
      cb = new ht.widget.ComboBox,
      gFunc = getter("s", "state"),
      sFunc = setter("s", "state");

    this.addLabel(items, getString("editor.state"), gFunc, sFunc);
    cb.onValueChanged = () => {
      this.setValue(sFunc, cb.getValue())
    };
    this.updateHandlers.push(() => {
      if (!items.hidden) {
        const value = this.getValue(gFunc),
          states = this.editor.dm.a("stateEnum");
        if (states && states.length) {
          const values = states.map(item => {
            return item.value
          }), labels = states.map(item => {
            return item.label || item.value
          });
          values.unshift(undefined);
          labels.unshift("");
          cb.setValues(values);
          cb.setLabels(labels);
          cb.getValue() !== value && cb.setValue(value);
        }
      }
    });
    items.push(cb);
    const row = this.addFuncRow(items, "state");
    row.visible = () => {
      return this.editor.dm.a("stateEnum") && this.editor.dm.a("stateEnum").length
    }
    return row;
  }

  addStyleArea() {
    const items = [];
    this.addLabelInput(items, getString("editor.area"), node => {
      return "[" + toNumber(node.p().x - node.getWidth() * node.getAnchor().x) + "," +
        toNumber(node.p().y - node.getHeight() * node.getAnchor().y) + "," +
        toNumber(node.getWidth()) + "," + toNumber(node.getHeight()) + "]"
    });
    this.addFuncRow(items, "rect");
  }

  addStyleType() {
    const items = [];
    this.addLabelInput(items, getString("editor.type"), node => {
      return node.compType;
    });
    this.addRow(items, this.w1).keys = { name: "type" };
  }

  addStyleName() {
    const items = [];
    this.addLabelInput(items, getString("editor.name"), node => {
      return node.getDisplayName();
    }, (node, value) => {
      node.setDisplayName(value);
    });
    this.addFuncRow(items, "displayName");
  }

  addRotationInput() {
    const items = [];
    this.addLabelInput(items, getString("editor.rotation"), node => {
      return 180 / Math.PI * node.getRotation()
    }, (node, value) => {
      node instanceof ht.Node && node.setRotation(value * Math.PI / 180)
    }, "number", 1);
    this.addFuncRow(items, "rotation");
  }

  addStyleAnchor() {
    let items = [];
    this.addLabelInput(items, getString("editor.anchorx"), node => {
      return node.getAnchor().x;
    }, (node, value) => {
      node instanceof ht.Node && items.setAnchor(value, node.getAnchor().y, true)
    }, "number", .01);
    this.addFuncRow(items, "anchorX");
    items = [];
    this.addLabelInput(items, getString("editor.anchory"), node => {
      return node.getAnchor().y;
    }, (node, value) => {
      node instanceof ht.Node && node.setAnchor(node.getAnchor().x, value, true)
    }, "number", .01);
    this.addFuncRow(items, "anchorY");
  }

  addStyleScale() {
    let items = [];
    this.addLabelInput(items, getString("editor.scalex"), node => {
      return node.getScale().x
    }, (node, value) => {
      node instanceof ht.Node && node.setScale(value, node.getScale().y);
    }, "number", .01);
    this.addFuncRow(items, "scaleX");
    items = [];
    this.addLabelInput(items, getString("editor.scaley"), node => {
      return node.getScale().y
    }, (node, value) => {
      node instanceof ht.Node && node.setScale(node.getScale().x, value)
    }, "number", .01);
    this.addFuncRow(items, "scaleY");
  }

  addStyleClip() {
    this.addStyleZeroToOne(getString("editor.clippercentage"), "clip.percentage", "clipPercentage");
    this.addStyleComboBox(getString("editor.clipdirection"), "clip.direction",
      tpeditor.consts.clipDirections, tpeditor.consts.clipDirectionLabels, null, "clipDirection");
  }

  addShadowProperties() {
    this.addTitle("TitleShadow");
    this.addStyleCheckBox(getString("editor.shadow"), "shadow", "shadow");
    this.addStyleColor(getString("editor.shadowcolor"), "select.color", "shadowColor");
    this.addStyleInput(getString("editor.shadowblur"), "shadow.blur", "number", 1, "shadowblur");
    this.addStyleInput(getString("editor.shadowoffsetx"), "shadow.offset.x", "number", 1, "shadowOffsetX");
    this.addStyleInput(getString("editor.shadowoffsety"), "shadow.offset.y", "number", 1, "shadowOffsetYs");
  }

  addStyleLayout() {
    let items = [];
    this.addLabelInput(items, getString("editor.posx"), node => {
      return node.p().x;
    }, (node, value) => {
      node instanceof ht.Node && node.p(value, node.p().y);
    }, "number", 1), this.addLabelInput(items, getString("editor.posy"), node => {
      return node.p().y;
    }, (node, value) => {
      node instanceof ht.Node && node.p(node.p().x, value);
    }, "number", 1);
    this.addRow(items, this.w1w1).keys = { name: "position" };
    items = [];
    this.addLabelInput(items, getString("editor.width"), node => {
      return node.getWidth();
    }, (node, value) => {
      node instanceof ht.Node && node.setWidth(value);
    }, "number", 1);
    this.addLabelInput(items, getString("editor.height"), node => {
      return node.getHeight();
    }, (node, value) => {
      node instanceof ht.Node && node.setHeight(value);
    }, "number", 1);
    this.addRow(items, this.w1w1).keys = { name: "size" };
    return items;
  }

  addStyleColor(label, name, key, height) {
    const items = [];
    this.addLabelColor(items, label, node => {
      return node.s(name);
    }, (node, value) => {
      if (name === "shape.background" && node.s("shape.gradient.pack")) {
        node.s("shape.gradient.pack", undefined);
      }
      node.s(name, value);
    });
    return this.addFuncRow(items, name, key, height);
  }

  addStyleFunction(label, name, btnLabel, args, height) {
    const items = [];
    this.addLabelFunction(items, label, node => {
      return node.s(name)
    }, (node, value) => {
      node.s(name, value);
    }, btnLabel, args);
    return this.addFuncRow(items, name, btnLabel, height);
  }

  addStyleDataModel(label, name, key, extraInfo, height) {
    const items = [];
    this.addLabelDataModel(items, label, node => {
      return node.s(name);
    }, (node, value) => {
      node.s(name, value);
    }, key, extraInfo);
    return this.addFuncRow(items, name, key, height);
  }

  addStyleObject(label, name, key, height) {
    const items = [];
    this.addLabelObject(items, label, node => {
      return node.s(name);
    }, (node, value) => {
      node.s(name, value);
    }, key);
    return this.addFuncRow(items, name, key, height);
  }

  addStyleLabel(label, name, key, height) {
    const items = [];
    this.addLabelInput(items, label, node => {
      const value = node.s(name);
      return value?.replace(/\n/g, "\\n");
    }, (node, value) => {
      node.s(name, value?.replace(/\\n/g, "\n"));
    });
    return this.addFuncRow(items, name, key, height);
  }

  addStyleArray(label, name, key, valueType, height) {
    const items = [];
    this.addLabelArray(items, label, node => {
      return node.s(name);
    }, (node, value) => {
      node.s(name, value);
    }, valueType);
    return this.addFuncRow(items, name, key, height);
  }

  addStyleMultiline(label, name, key, height) {
    const items = [];
    this.addLabelMultiline(items, label, node => {
      return node.s(name);
    }, (node, value) => {
      node.s(name, value);
    });
    return this.addFuncRow(items, name, key, height);
  }

  addStyleFont(label, name, key, height) {
    const items = [];
    this.addLabelFont(items, label, node => {
      return node.s(name)
    }, (node, value) => {
      node.s(name, value)
    });
    return this.addFuncRow(items, name, key, height);
  }

  addStyleTextArea(label, name, key, height) {
    const items = [];
    this.addLabelTextArea(items, label, node => {
      return node.s(name)
    }, (node, value) => {
      node.s(name, value)
    });
    return this.addFuncRow(items, name, key, height)
  }

  addStyleInput(label, name, valueType, resize, key, height) {
    const items = [];
    this.addLabelInput(items, label, node => {
      return node.s(name)
    }, (node, value) => {
      node.s(name, value)
    }, valueType, resize);
    return this.addFuncRow(items, name, key, height);
  }

  addStyleCheckBox(label, name, key, height) {
    const items = [];
    this.addLabelCheckBox(items, label, node => {
      return node.s(name);
    }, (node, vale) => {
      node.s(name, vale)
    });
    return this.addFuncRow(items, name, key, height);
  }

  addStyleAlign(label, name, key, height) {
    const items = [];
    this.addLabelComboBox(items, label, node => {
      return node.s(name) || "center"
    }, (node, value) => {
      node.s(name, value)
    }, ["left", "center", "right"],
      [getString("editor.align.left"), getString("editor.align.center"), getString("editor.align.right")]);
    return this.addFuncRow(items, name, key, height);
  }

  addStyleVAlign(label, name, key, height) {
    const items = [];
    this.addLabelComboBox(items, label, node => {
      return node.s(name) || "bottom"
    }, (node, value) => {
      node.s(name, value);
    }, ["top", "middle", "bottom"],
      [getString("editor.valign.top"), getString("editor.valign.middle"), getString("editor.valign.bottom")]);
    return this.addFuncRow(items, name, key, height);
  }

  addStyleStretch(label, name, key, height) {
    const items = [];
    this.addLabelComboBox(items, label, node => {
      return node.s(name) || "fill";
    }, (node, value) => {
      node.s(name, value);
    }, ["fill", "uniform", "centerUniform"],
      [getString("editor.stretch.fill"), getString("editor.stretch.uniform"), getString("editor.stretch.centeruniform")]);
    return this.addFuncRow(items, name, key, height);
  }

  addStyleComboBox(label, name, values, labels, icons, key, height) {
    const items = [];
    this.addLabelComboBox(items, label, node => {
      return node.s(name);
    }, (node, value) => {
      node.s(name, value);
    }, values, labels, icons);
    return this.addFuncRow(items, name, key, height);
  }

  addStyleImage(label, name, key, height) {
    const items = [];
    this.addLabelImage(items, label, node => {
      return node.s(name);
    }, (node, value) => {
      node.s(name, value);
    });
    return this.addFuncRow(items, name, key, height);
  }

  addStyleURL(label, name, key, height) {
    const items = [];
    this.addLabelURL(items, label, node => {
      return node.s(name);
    }, (node, value) => {
      node.s(name, value);
    });
    return this.addFuncRow(items, name, key, height);
  }

  addStylePattern(label, name, key, height) {
    const items = [];
    this.addLabelInput(items, label, node => {
      return node.s(name);
    }, (node, value) => {
      node.s(name, value);
    }, "pattern");
    return this.addFuncRow(items, name, key, height);
  }

  addStyleZeroToOne(label, name, key) {
    return this.addStyleRange(label, name, 0, 1, .01, key);
  }

  addStylePosition(label, name, key) {
    return this.addStyleRange(label, name, 1, 55, 1, key);
  }

  addStyleRange(label, name, min, max, resize, key) {
    const items = [];
    this.addLabelInput(items, label, node => {
      const value = node.s(name);
      return null == value ? max : value
    }, (node, value) => {
      max !== undefined && value > max && (value = max);
      min !== undefined && value < min && (value = min);
      node.s(name, value);
    }, "number", resize);
    return this.addFuncRow(items, name, key);
  }

  addStyleRotation(label, name, key, min, max, step) {
    const items = [];
    this.addLabelInput(items, label, node => {
      const value = node.s(name);
      return value === undefined ? max : 180 / Math.PI * value;
    }, (node, value) => {
      value = value * Math.PI / 180;
      max !== undefined && value > max && (value = max);
      min !== undefined && value < min && (value = min);
      node.s(name, value);
    }, "number", step ?? 1);
    return this.addFuncRow(items, name, key);
  }

  addStyleGradient(label, name, bgKey, gradientKey, key) {
    const items = [];
    this.addLabelGradient(items, label, name, bgKey, gradientKey);
    return this.addFuncRow(items, name, key);
  }

  addLayoutProperties() {
    this.addTitle("TitleLayout");
    this.addStyleArea();
    this.addStyleLayout();
    this.addRotationInput();
    this.addStyleAnchor();
    this.addStyleScale();
    const getFitSize = gv => {
      return !!gv.dataModel.a("fitSize")
    },
      gv = this.layoutGv = new ht.graph.GraphView,
      node = this.layoutNode = new ht.Node;
    let seleted = false;

    node.setImage("editor.layout.helper");
    node.a("selectColor", config.color_select);
    gv.dm().add(node);
    gv.tx(50);
    gv.ty(50);
    gv.handleScroll = () => { };
    gv.handlePinck = () => { };
    gv.setScrollBarVisible(false);
    gv.setRectSelectable(false);
    gv.setPannable(false);
    gv.setMovableFunc(() => {
      return false;
    });
    gv.dm().md(e => {
      if (!seleted) {
        this.beginTransaction();
        this.dataModel.sm().getSelection().each(item => {
          if (e.property === "a:layout.v") {
            item.s("layout.v", e.newValue);
          } else if (e.property === "a:layout.h") {
            item.s("layout.h", e.newValue);
          }
        });
        this.endTransaction();
      }
    });
    if (config.layoutEnabled) {
      this.addRow(["", { element: gv }, ""], [.1, 100, .1], 100).visible = getFitSize;
      this.addUpdateHandler(() => {
        const _data = this.data;
        seleted = true;
        node.a({
          "layout.v": _data.s("layout.v"),
          "layout.h": _data.s("layout.h")
        });
        seleted = false
      });
      let items = [];
      this.addLabelComboBox(items, getString("editor.nodeLayout.h"), node => {
        return node.s("layout.h");
      }, (node, value) => {
        node.s("layout.h", value);
      }, tpeditor.consts.hLayoutValues, tpeditor.consts.hLayoutLabels);
      this.addFuncRow(items, "layout.h").visible = getFitSize;
      items = [];
      this.addLabelComboBox(items, getString("editor.nodeLayout.v"), node => {
        return node.s("layout.v");
      }, (node, value) => {
        node.s("layout.v", value);
      }, tpeditor.consts.vLayoutValues, tpeditor.consts.vLayoutLabels);
      this.addFuncRow(items, "layout.v").visible = getFitSize;
    }
  }
}
