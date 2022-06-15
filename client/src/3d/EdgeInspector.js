import { getString, getter, isJSON, setter } from "../util";
import config from "./config3d";
import DataInspector from "./DataInspector.js";
import { getU, getV, setNull, setU, setV } from "./util";

export default class EdgeInspector extends DataInspector {
  constructor(editor) {
    super(editor, "Edge");
  }

  initForm() {
    super.initForm();
    this.addEdgeBasicProperties();
    this.addEdgeDashProperties();
    this.addEdgeSourceNodeProperties();
    this.addEdgeTargetNodeProperties();
  }

  addFormProperties() {
    this.addTitle("TitleBasic");
    let items = [];
    this.addLabelInput(items,
      getString("editor.name"),
      getter("p", "displayName"),
      setter("p", "displayName"));
    this.addLabelInput(items,
      getString("editor.tag"),
      getter("p", "tag"),
      setter("p", "tag")),
      this.addRow(items, [this.indent, .1, this.indent2, .1]);
    items = [];
    this.addLabelURL(items,
      getString("editor.navigate"), url => {
        return url.a("navigate") || ""
      }, function (url, value) {
        url.a("navigate", value)
      }, function (shape, valie) {
        var data = valie.view.draggingData;
        return data && ("scene" === data.fileType || "display" === data.fileType)
      });
    this.addLabelInput(items,
      getString("editor.tooltip"),
      getter("p", "toolTip"),
      setter("p", "toolTip"));
    this.addRow(items, [this.indent, .1, this.indent2, .1]);
    items = [];
    this.addLabelComboBoxURL(items, getString("editor.type"), shape => {
      var shape3d = shape.s("shape3d");
      if (isJSON(shape3d)) {
        var node = this.editor.getFileNode(shape3d);
        return node ? node.url : shape3d
      }
      return shape3d;
    }, (node, value) => {
      node.s("shape3d", value);
      this.editor.updateInspector();
    }, ["", "cylinder"], undefined, undefined, function (shape, data) {
      return !!data.view.draggingData && data.view.draggingData.fileType === "model"
    });
    this.addImage(items, function (shape) {
      return shape.s("shape3d")
    }, undefined, function (str) {
      return isJSON(str) ? str.substr(0, str.length - 5) + ".png" : null
    }, function (R) {
      return isJSON(R.rawIcon)
    });
    this.addOneRow(items);
    items = [];
    this.addLabelCheckBox(items,
      getString("editor.selectable"), function (shape) {
        return shape.s("3d.selectable")
      }, function (shape, selectable) {
        shape.s("2d.selectable", selectable);
        shape.s("3d.selectable", selectable)
      });
    this.addLabelCheckBox(items,
      getString("editor.movable"), function (shape) {
        return shape.s("3d.movable")
      }, function (shape3d, movable) {
        shape3d.s("2d.movable", movable);
        shape3d.s("3d.movable", movable)
      });
    this.addRow(items, [this.indent, .1, this.indent2, .1]);
    items = [];
    this.addLabelCheckBox(items,
      getString("editor.editable"), function (shape) {
        return shape.s("3d.editable")
      }, function (shape, editable) {
        shape.s("2d.editable", editable);
        shape.s("3d.editable", editable)
      }), this.addLabelCheckBox(items,
        getString("editor.visible"), function (shape) {
          return shape.s("3d.visible")
        }, function (shape, visible) {
          shape.s("2d.visible", visible);
          shape.s("3d.visible", visible)
        }), this.addRow(items, [this.indent, .1, this.indent2, .1]);
    items = [];
    this.addLabelCheckBox(items,
      getString("editor.interactive"), function (shape) {
        return shape.s("interactive")
      }, function (shape, interactive) {
        return shape.s("interactive", interactive)
      });
    this.addRow(items, [this.indent, .1]);
    items = [];
    this.addLabelRange(items,
      getString("editor.envmap"), function (shape) {
        return shape.s("envmap") || 0
      }, setter("s", "envmap"), 0, 1, .01, "number");
    this.addRow(items, [this.indent, .1]);
    items = [];
    this.addLabelRange(items,
      getString("editor.brightness"), function (R) {
        return R.s("select.brightness")
      }, setter("s", "select.brightness"), 0, 1, .01, "number");
    this.addRow(items, [this.indent, .1]);
    items = [];
    this.addLabelObject(items,
      getString("editor.polygonoffset"), function (R) {
        return R.s("polygonOffset")
      }, setter("s", "polygonOffset"), "number");
    this.addRow(items, [this.indent, .1]);
  }

  addTransformProperties() { }

  addEdgeBasicProperties() {
    this.addTitle("TitleEdgeBasic");
    var items = [];
    this.addLabelComboBox(items,
      getString("editor.type"),
      getter("s", "edge.type"),
      setter("s", "edge.type"), [undefined, "points"]);
    this.addRow(items, [this.indent, .1]);
    items = [];
    this.addLabelInput(items,
      getString("editor.width"),
      getter("s", "edge.width"),
      setter("s", "edge.width"), "number", 1);
    this.addLabelInput(items,
      getString("editor.offset"),
      getter("s", "edge.offset"),
      setter("s", "edge.offset"), "number", 1);
    this.addRow(items, [this.indent, .1, this.indent2, .1]);
    items = [];
    this.addLabelInput(items,
      getString("editor.side"),
      getter("s", "shape3d.side"),
      setter("s", "shape3d.side"), "number", 1);
    this.addLabelInput(items,
      getString("editor.resolution"),
      getter("s", "shape3d.resolution"),
      setter("s", "shape3d.resolution"), "number", 1);
    this.addRow(items, [this.indent, .1, this.indent2, .1]);
    items = [];
    this.addLabelColor(items,
      getString("editor.color"),
      getter("s", "edge.color"),
      setter("s", "edge.color"));
    this.addLabelCheckBox(items,
      getString("editor.center"),
      getter("s", "edge.center"),
      setter("s", "edge.center"));
    this.addRow(items, [this.indent, .1, this.indent2, .1]);
    items = [];
    var image = getter("s", "shape3d.image");
    this.addLabelImage(items,
      getString("editor.image"), value => {
        var url = image(value), fileNode = this.editor.getFileNode(url);
        return fileNode ? fileNode.url : url
      }, setter("s", "shape3d.image"));
    this.addRow(items, [this.indent, .1, 20]);
    items = [];
    this.addLabel(items, "UV");
    this.addButton(items, null,
      getString("editor.reset"), "editor.resetsize.state", setNull("shape3d.uv.scale"));
    this.addLabelInput(items, "U", getU("shape3d.uv.scale"), setU("shape3d.uv.scale"), "number", 1);
    this.addLabelInput(items, "V", getV("shape3d.uv.scale"), setV("shape3d.uv.scale"), "number", 1);
    this.addRow(items, [this.indent - 20 - 8, 20, 20, .1, 20, .1]);
    items = [];
    this.addLabel(items, "UV " + getString("editor.offset"));
    this.addButton(items, null, getString("editor.reset"),
      "editor.resetsize.state", setNull("shape3d.uv.offset"));
    this.addLabelInput(items, "U", shape => {
      return (shape.s("shape3d.uv.offset") || [0, 0])[0];
    }, (shape, value) => {
      var offset = shape.s("shape3d.uv.offset") || [];
      shape.s("shape3d.uv.offset", [value, offset[1]])
    }, "number", .1);
    this.addLabelInput(items, "V", shape => {
      return (shape.s("shape3d.uv.offset") || [0, 0])[1]
    }, (shape, value) => {
      var offset = shape.s("shape3d.uv.offset") || [];
      shape.s("shape3d.uv.offset", [offset[0], value])
    }, "number", .1);
    this.addRow(items, [this.indent - 20 - 8, 20, 20, .1, 20, .1])
  }

  addEdgeDashProperties() {
  }

  addEdgeSourceNodeProperties() {
    const numberPrecision = config.numberPrecision;
    this.addTitle("TitleEdgeSourceNode");
    var items = [];
    this.addLabelData(items, getString("editor.node"), getter("p", "source"),
      function (shape, source) {
        if (shape instanceof ht.Edge) {
          if (source == null || source instanceof ht.Node) {
            shape.setSource(source);
            shape.s("edge.source.percent", .5);
          }
        }
      });
    this.addRow(items, [this.indent, .1, 20]);
    const anchor = numberPrecision.anchor || 0,
      type = anchor === 0 ? "int" : "number",
      precision = 1 / Math.pow(10, anchor);
    items = [];
    items.push(getString("editor.anchor"));
    this.addButton(items, null,
      getString("editor.reset"), "editor.resetsize.state", function (shape) {
        shape instanceof ht.Edge && shape.s({
          "edge.source.anchor.x": .5,
          "edge.source.anchor.elevation": .5,
          "edge.source.anchor.y": .5
        })
      });
    this.addLabelInput(items, "X", function (shape) {
      let x = shape.s("edge.source.anchor.x");
      if (x == null) {
        x = .5
      }
      return Number(x.toFixed(anchor));
    }, function (shape, value) {
      shape instanceof ht.Edge && shape.s("edge.source.anchor.x", parseFloat(value))
    }, type, precision);
    this.addLabelInput(items, "Y", function (shape) {
      var elevation = shape.s("edge.source.anchor.elevation");
      if (elevation == null) {
        elevation = .5
      }
      return Number(elevation.toFixed(anchor));
    }, function (shape, value) {
      shape instanceof ht.Edge && shape.s("edge.source.anchor.elevation", parseFloat(value))
    }, type, precision), this.addLabelInput(items, "Z", function (shape) {
      let y = shape.s("edge.source.anchor.y");
      if (y == null) {
        y = .5
      }
      return Number(y.toFixed(anchor));
    }, function (shape, value) {
      shape instanceof ht.Edge && shape.s("edge.source.anchor.y", parseFloat(value))
    }, type, precision), this.addRow(items, [this.indent - 40 - 8, 20, 20, .1, 20, .1, 20, .1])
  }

  addEdgeTargetNodeProperties() {
    var numberPrecision = config.numberPrecision;
    this.addTitle("TitleEdgeTargetNode");
    var items = [];
    this.addLabelData(items,
      getString("editor.node"),
      getter("p", "target"), function (shape, value) {
        if (shape instanceof ht.Edge) {
          if (null == value || value instanceof ht.Node || value instanceof ht.Edge) {
            shape.setTarget(value);
            shape.s("edge.target.percent", .5)
          }
        }
      });
    this.addRow(items, [this.indent, .1, 20]);
    const anchor = numberPrecision.anchor || 0,
      type = anchor === 0 ? "int" : "number",
      precision = 1 / Math.pow(10, anchor);
    items = [];
    items.push(getString("editor.anchor"));
    this.addButton(items, null,
      getString("editor.reset"), "editor.resetsize.state",
      function (shape) {
        shape instanceof ht.Edge && shape.s({
          "edge.target.anchor.x": .5,
          "edge.target.anchor.elevation": .5,
          "edge.target.anchor.y": .5
        })
      });
    this.addLabelInput(items, "X", function (shape) {
      let x = shape.s("edge.target.anchor.x");
      if (x == null) {
        x = .5
      }
      return Number(x.toFixed(anchor));
    }, function (shape, e) {
      shape instanceof ht.Edge && shape.s("edge.target.anchor.x", parseFloat(e))
    }, type, precision);

    this.addLabelInput(items, "Y", function (shape) {
      let elevation = shape.s("edge.target.anchor.elevation");
      if (elevation == null) {
        elevation = .5
      }
      return Number(elevation.toFixed(anchor));
    }, function (shape, value) {
      shape instanceof ht.Edge && shape.s("edge.target.anchor.elevation", parseFloat(value))
    }, type, precision);
    this.addLabelInput(items, "Z", function (shape) {
      let y = shape.s("edge.target.anchor.y");
      if (y == null) {
        y = .5
      }
      return Number(y.toFixed(anchor));
    }, function (shape, value) {
      shape instanceof ht.Edge && shape.s("edge.target.anchor.y", parseFloat(value))
    }, type, precision);
    this.addRow(items, [this.indent - 40 - 8, 20, 20, .1, 20, .1, 20, .1]);
  }
}