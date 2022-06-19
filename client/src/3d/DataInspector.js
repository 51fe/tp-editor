import { getString, getter, isImage, isJSON, setter } from "../util/index.js";
import Inspector3d from "./Inspector3d.js";

export default class DataInspector extends Inspector3d {
  constructor(editor, name) {
    super(editor, name, "data3d", false);
  }

  initForm() {
    super.initForm();
    this.addFormProperties();
    this.addWireframeProperties();
    this.addTransformProperties();
    this.editor.scene.shadowMap && this.addShadowProperties();
  }

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
    this.addLabelInput(items,
      getString("editor.tooltip"),
      getter("p", "toolTip"),
      setter("p", "toolTip"));
    this.addRow(items, [this.indent, .1]);
    const values = [undefined, "billboard", "plane", "box", "sphere", "cone", "torus", "cylinder",
      "star", "rect", "roundRect", "triangle", "rightTriangle", "parallelogram", "trapezoid"],
      ICONS = {
        undefined: "editor.cube",
        null: "editor.cube",
        sphere: "editor.sphere",
        cylinder: "editor.cylinder",
        cone: "editor.scene.cone",
        torus: "editor.scene.torus",
        triangle: "editor.scene.triangle",
        rightTriangle: "editor.scene.rightTriangle",
        parallelogram: "editor.scene.parallelogram",
        trapezoid: "editor.scene.trapezoid",
        rect: "editor.scene.rect",
        roundRect: "editor.scene.roundRect",
        star: "editor.scene.star",
        box: "editor.scene.box",
        billboard: "editor.scene.billboard",
        plane: "editor.scene.plane"
      },
      labels = [],
      icons = [];

    values.forEach(key => {
      labels.push(getString("editor." + (key ? key.toLowerCase() : "cube")));
      icons.push({
        width: 16,
        height: 16,
        comps: [{
          type: "image",
          stretch: "centerUniform",
          color: tpeditor.config.color_dark,
          name: ICONS[key],
          rect: [0, 0, 16, 16]
        }]
      })
    });
    items = [];
    this.addLabelComboBoxURL(items, getString("editor.type"),
      (node) => {
        const url = node.s("shape3d");
        if (isImage(url)) {
          const fileNode = this.editor.getFileNode(url);
          return fileNode ? fileNode.url : url
        }
        return url
      },
      (node, value) => {
        node.s("shape3d", value);
        this.editor.updateInspector();
      }, values, labels, icons,
      (e, info) => {
        return !!info.view.draggingData && "model" === info.view.draggingData.fileType
      });
    this.addImage(items, function (node) {
      return node.s("shape3d")
    }, undefined, function (url) {
      return isImage(url) ? url.substr(0, url.length - 5) + ".png" : null
    }, function (node) {
      return isJSON(node.rawIcon)
    });
    this.addOneRow(items);
    items = [];
    this.addLabelCheckBox(items, getString("editor.selectable"),
      function (node) {
        return node.s("3d.selectable")
      },
      function (node, value) {
        node.s("2d.selectable", value);
        node.s("3d.selectable", value);
      });
    this.addLabelCheckBox(items, getString("editor.movable"),
      function (node) {
        return node.s("3d.movable");
      },
      function (node, value) {
        node.s("2d.movable", value);
        node.s("3d.movable", value);
      });
    this.addRow(items, [this.indent, .1, this.indent2, .1]);
    items = [];
    this.addLabelCheckBox(items, getString("editor.editable"),
      function (node) {
        return node.s("3d.editable");
      },
      function (node, value) {
        node.s("2d.editable", value);
        node.s("3d.editable", value);
      });
    this.addLabelCheckBox(items, getString("editor.visible"),
      function (node) {
        return node.s("3d.visible")
      },
      function (node, value) {
        node.s("2d.visible", value);
        node.s("3d.visible", value);
      });
    this.addRow(items, [this.indent, .1, this.indent2, .1]);
    items = [];
    this.addLabelCheckBox(items, getString("editor.mask"),
      function (node) {
        return node.s("transparent.mask");
      },
      function (node, value) {
        return node.s("transparent.mask", value);
      });
    this.addLabelCheckBox(items, getString("editor.cache"),
      function (node) {
        return node.s("texture.cache");
      },
      (node, value) => {
        node.s("texture.cache", value);
        node.s("shape3d.image.cache") !== undefined && node.s("shape3d.image.cache", undefined);
        this.editor.scene.invalidateShape3dCachedImage(node);
      });
    this.addRow(items, [this.indent, .1, this.indent2, .1]);
    items = [];
    const _getter = function (node) {
      let value = node.s("fixSizeOnScreen");
      value === undefined && (value = node.s("shape3d.fixSizeOnScreen"));
      return !!value;
    };
    this.addLabelCheckBox(items, getString("editor.fitsize"), _getter,
      function (node, value) {
        node.s("fixSizeOnScreen", !!value && [-1, -1]);
        node.s("shape3d.fixSizeOnScreen") !== undefined && node.s("shape3d.fixSizeOnScreen", undefined);
        value && node.s("autorotate", true);
      });
    const dynamic = this.addLabelCheckBox(items, getString("editor.dynamic"),
      function (node) {
        let dynamic = node.s("vector.dynamic");
        dynamic === undefined && (dynamic = node.s("shape3d.vector.dynamic"));
        return !!dynamic
      },
      function (node, value) {
        node.s("vector.dynamic", value);
        node.s("shape3d.vector.dynamic") !== undefined && node.s("shape3d.vector.dynamic", undefined);
      });
    this.addRow(items, [this.indent, .1, this.indent2, .1]);
    items = [];
    this.addLabelCheckBox(items, getString("editor.alwaysontop"),
      function (node) {
        if (node.getRenderLayer) return "top" === node.getRenderLayer();
        let value = node.s("alwaysOnTop");
        value === undefined && (value = node.s("shape3d.alwaysOnTop"));
        return value;
      },
      function (node, value) {
        if (node.setRenderLayer) {
          node.setRenderLayer(value ? "top" : null);
          return;
        }
        node.s("alwaysOnTop", value);
        null != node.s("shape3d.alwaysOnTop") && node.s("shape3d.alwaysOnTop", undefined);
      });
    const autorotate = this.addLabelComboBox(items, getString("editor.autorotate"),
      function (node) {
        let value = node.s("autorotate");
        value === undefined && (value = node.s("shape3d.autorotate"));
        return value;
      },
      function (node, value) {
        node.s("autorotate", value);
        node.s("shape3d.autorotate") !== undefined && node.s("shape3d.autorotate", undefined);
      }, [false, true, "x", "y", "z"]);

    this.addRow(items, [this.indent, .1, this.indent2, .1]);
    items = [];
    this.addLabelRange(items, getString("editor.texturescale"),
      function (node) {
        let scale = undefined;
        return 1 !== node.s("texture.scale") ? scale = node.s("texture.scale") : 1 !== node.s("shape3d.texture.scale") && (scale = node.s("shape3d.texture.scale")), scale || 1
      },
      function (node, value) {
        node.s("texture.scale", value);
        node.s("shape3d.texture.scale", undefined);
      }, 0, 10, .1, "number");
    this.addRow(items, [this.indent, .1]);
    items = [];
    this.addLabelRange(items, getString("editor.envmap"),
      function (node) {
        return node.s("envmap") || 0
      }, setter("s", "envmap"), 0, 1, .01, "number");
    this.addRow(items, [this.indent, .1]);
    items = [];
    this.addLabelRange(items, getString("editor.brightness"),
      function (node) {
        return node.s("select.brightness")
      }, setter("s", "select.brightness"), 0, 1, .01, "number");
    this.addRow(items, [this.indent, .1]);
    items = [];
    this.addLabelObject(items, getString("editor.polygonoffset"),
      function (node) {
        return node.s("polygonOffset")
      }, setter("s", "polygonOffset"), "number");
    this.addRow(items, [this.indent, .1]);
    items = [];
    this.addLabelComboBox(items, getString("editor.clipdirection"), function (node) {
      return node.s("3d.clip.direction")
    },
      function (node, value) {
        node.s("3d.clip.direction", value);
      },
      [null, "left", "right", "top", "bottom", "front", "back"],
      ["", getString("editor.clipdirection.left"),
        getString("editor.clipdirection.right"),
        getString("editor.clipdirection.top"),
        getString("editor.clipdirection.bottom"),
        getString("editor.clipdirection.front"),
        getString("editor.clipdirection.back")
      ]);
    this.addOneRow(items);
    items = [];
    this.addLabelRange(items, getString("editor.clippercentage"),
      function (node) {
        return node.s("3d.clip.percentage")
      },
      function (node, value) {
        node.s("3d.clip.percentage", value)
      }, 0, 1, .01, "number");
    this.addOneRow(items);
    if (tpeditor.config.batchEditable) {
      items = [];
      this.addLabelComboBox(items, getString("editor.batch"),
        function (node) {
          return node.s("batch");
        },
        function (node, value) {
          return node.s("batch", value);
        }, [], []).getValues = () => {
          return this.editor.batchView.keys;
        };
      this.addOneRow(items);
    }
    this.updateHandlers.push(() => {
      if (this.data) {
        const value = getter(this.data);
        autorotate.setDisabled(value);
        dynamic.setDisabled(value)
      }
    })
  }

  addTransformProperties() {
    this.addTitle("TitleTransform");
    const numberPrecision = tpeditor.config.numberPrecision;
    let items = [];
    this.addLabelComboBox(items, getString("editor.rotationMode"), function (node) {
      return node.getRotationMode()
    }, function (node, value) {
      return node.setRotationMode(value)
    }, ["xyz", "xzy", "yxz", "yzx", "zxy", "zyx"]);
    this.addRow(items, [this.indent, .1]);
    const rotation = numberPrecision.rotation || 0;
    let type = rotation === 0 ? "int" : "number",
      value = 1 / Math.pow(10, rotation);
    items = [];
    items.push(getString("editor.rotation"));
    this.addButton(items, null, getString("editor.reset"), "editor.resetsize.state", function (node) {
      node instanceof ht.Node && node.r3(0, 0, 0);
    });
    this.addLabelInput(items, "X", function (node) {
      return Number((180 / Math.PI * node.getRotationX()).toFixed(rotation));
    }, function (node, value) {
      node instanceof ht.Node && node.setRotationX(value * Math.PI / 180)
    }, type, value);
    this.addLabelInput(items, "Y", function (node) {
      return Number((180 / Math.PI * node.getRotationY()).toFixed(rotation));
    }, function (node, e) {
      node instanceof ht.Node && node.setRotationY(e * Math.PI / 180)
    }, type, value);
    this.addLabelInput(items, "Z", function (node) {
      return Number((180 / Math.PI * node.getRotationZ()).toFixed(rotation));
    }, function (node, value) {
      node instanceof ht.Node && node.setRotationZ(value * Math.PI / 180);
    }, type, value);
    this.addRow(items, [this.indent - 40 - 8, 20, 20, .1, 20, .1, 20, .1]);
    const position = numberPrecision.position || 0;
    items = [];
    items.push(getString("editor.position"));
    this.addButton(items, null, getString("editor.reset"), "editor.resetsize.state",
      function (node) {
        node instanceof ht.Node && node.p3(0, 0, 0);
      });
    this.addLabelInput(items, "X",
      function (node) {
        return Number(node.getX().toFixed(position));
      },
      function (node, value) {
        return node.setX(parseFloat(value));
      }, type, value);
    this.addLabelInput(items, "Y",
      function (node) {
        return Number(node.getElevation().toFixed(position));
      },
      function (node, value) {
        return node.setElevation(parseFloat(value));
      }, type, value), this.addLabelInput(items, "Z",
        function (node) {
          return Number(node.getY().toFixed(position));
        },
        function (node, value) {
          return node.setY(parseFloat(value));
        }, type, value);
    this.addRow(items, [this.indent - 40 - 8, 20, 20, .1, 20, .1, 20, .1]);
    const size = numberPrecision.size || 0;
    type = size === 0 ? "int" : "number";
    value = 1 / Math.pow(10, size);
    items = [], items.push(getString("editor.size"));
    this.addButton(items, null, getString("editor.reset"), "editor.resetsize.state",
      function (node) {
        node instanceof ht.Node && node.s3(-1, -1, -1);
      });
    this.addLabelInput(items, "X", function (node) {
      return Number(node.getWidth().toFixed(size));
    }, function (node, value) {
      return node.setWidth(parseFloat(value))
    }, type, value), this.addLabelInput(items, "Y", function (node) {
      return Number(node.getTall().toFixed(size));
    }, function (node, value) {
      return node.setTall(parseFloat(value));
    }, type, value);
    this.addLabelInput(items, "Z", function (node) {
      return Number(node.getHeight().toFixed(size));
    }, function (node, value) {
      return node.setHeight(parseFloat(value));
    }, type, value), this.addRow(items, [this.indent - 40 - 8, 20, 20, .1, 20, .1, 20, .1]);
    const anchor = numberPrecision.anchor || 0;
    items = [];
    items.push(getString("editor.anchor"));
    this.addButton(items, null, getString("editor.reset"), "editor.resetsize.state", function (node) {
      node instanceof ht.Node && node.setAnchor3d(.5, 0, .5, true);
    });
    this.addLabelInput(items, "X", function (node) {
      return Number(node.getAnchorX().toFixed(anchor));
    }, function (node, value) {
      if (node instanceof ht.Node) {
        node.setAnchor3d(parseFloat(value), node.getAnchorElevation(), node.getAnchorY(), true);
      }
    }, type, value);
    this.addLabelInput(items, "Y", function (node) {
      return Number(node.getAnchorElevation().toFixed(anchor));
    }, function (node, value) {
      if (node instanceof ht.Node) {
        node.setAnchor3d(node.getAnchorX(), parseFloat(value), node.getAnchorY(), true);
      }
    }, type, value);
    this.addLabelInput(items, "Z", function (node) {
      return Number(node.getAnchorY().toFixed(anchor));
    }, function (node, value) {
      if (node instanceof ht.Node) {
        node.setAnchor3d(node.getAnchorX(), node.getAnchorElevation(), parseFloat(value), true);
      }
    }, type, value);
    this.addRow(items, [this.indent - 40 - 8, 20, 20, .1, 20, .1, 20, .1]);
    const scale = numberPrecision.scale || 0;
    items = [];
    items.push(getString("editor.scale"));
    this.addButton(items, null, getString("editor.reset"), "editor.resetsize.state", function (node) {
      node instanceof ht.Node && node.setScale3d(1, 1, 1);
    });
    this.addLabelInput(items, "X", function (node) {
      return Number(node.getScaleX().toFixed(scale));
    }, function (node, value) {
      node instanceof ht.Node && node.setScaleX(parseFloat(value));
    }, type, value), this.addLabelInput(items, "Y", function (node) {
      return Number(node.getScaleTall().toFixed(scale));
    }, function (node, value) {
      node instanceof ht.Node && node.setScaleTall(parseFloat(value))
    }, type, value);
    this.addLabelInput(items, "Z", function (node) {
      return Number(node.getScaleY().toFixed(scale));
    }, function (node, value) {
      node instanceof ht.Node && node.setScaleY(parseFloat(value));
    }, type, value);
    this.addRow(items, [this.indent - 40 - 8, 20, 20, .1, 20, .1, 20, .1]);
  }

  addWireframeProperties() {
    this.addTitle("TitleWireFrame");
    let items = [];
    this.addLabelComboBox(items, getString("editor.visible"), getter("s", "wf.visible"),
      function (node, value) {
        node.s("wf.visible", value);
      }, [false, true, "selected"]),
      this.addLabelCheckBox(items, getString("editor.wfshort"),
        getter("s", "wf.short"),
        setter("s", "wf.short"));
    this.addRow(items, [this.indent, .1, this.indent2, .1]);
    items = [];
    this.addLabelColor(items, getString("editor.color"),
      getter("s", "wf.color"), setter("s", "wf.color"));
    this.addRow(items, [this.indent, .1]);
    items = [];
    this.addLabelCheckBox(items, getString("editor.wfgeometry"),
      getter("s", "wf.geometry"), setter("s", "wf.geometry"));
    this.addLabelCheckBox(items, getString("editor.wfloadQuadWireframe"),
      getter("s", "wf.loadQuadWireframe"),
      setter("s", "wf.loadQuadWireframe"));
    this.addRow(items, [this.indent, .1, this.indent2, .1]);
    items = [];
    this.addLabelComboBox(items, getString("editor.wfcombineTriangle"),
      getter("s", "wf.combineTriangle"), setter("s", "wf.combineTriangle"),
      [false, true, 2, 3],
      [
        getString("editor.wfdontcombine"),
        getString("editor.wfcombineadjacent"),
        getString("editor.wfcombinecommon"),
        getString("editor.wfcombinesmooth")
      ]);
    this.addRow(items, [this.indent, .1]);
  }

  addShadowProperties() {
    this.addTitle("TitleShadow");
    const items = [];
    this.addLabelCheckBox(items, getString("editor.shadow.cast"),
      getter("s", "shadow.cast"), setter("s", "shadow.cast"));
    this.addLabelCheckBox(items, getString("editor.shadow.receive"),
      getter("s", "shadow.receive"), setter("s", "shadow.receive"));
    this.addRow(items, [this.indent, .1, this.indent2, .1]);
  }
}
