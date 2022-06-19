import { getString, getter, setter } from "../util";
import Inspector3d from "./Inspector3d.js";

export default class SceneInspector extends Inspector3d {
  constructor(editor) {
    super(editor, "scene", "scene", true);
  }

  initForm() {
    super.initForm();
    this.initSceneProperties();
    this.addBloomProperties();
    this.addDofProperties();
    this.addHighlightProperties();
    this.addGridsGuidesProperties();
    this.editor.scene.shadowMap && this.initShadowProperties();
  }

  initSceneProperties() {
    this.addTitle("TitleScenes");
    let items = [];
    this.addLabelCheckBox(items, getString("editor.debugTip"), () => {
      return this.editor.scene.isDebugTipShowing()
    }, (node, value) => {
      const scene = this.editor.scene;
      value ? scene.showDebugTip() : scene.hideDebugTip()
    });
    this.addRow(items, [this.indent, .1]);
    items = [];
    this.addLabelInput(items, getString("editor.previewurl"),
      getter("a", "previewURL"), setter("a", "previewURL"));
    this.addRow(items, [this.indent, .1]);
    items = [];
    items.push(getString("editor.camera"));
    this.addButton(items, null, getString("editor.reset"),
      "editor.resetsize.state", () => {
        this.editor.scene.setEye(ht.Default.graph3dViewEye)
      });
    this.addLabelInput(items, "X", () => {
      return parseFloat(this.editor.scene.getEye()[0])
    }, (node, eye) => {
      const coord = this.editor.scene.getEye();
      this.editor.scene.setEye(eye, coord[1], coord[2])
    }, "int", 1);
    this.addLabelInput(items, "Y", () => {
      return parseFloat(this.editor.scene.getEye()[1])
    }, (e, t) => {
      const eyes = this.editor.scene.getEye();
      this.editor.scene.setEye(eyes[0], t, eyes[2])
    }, "int", 1);
    this.addLabelInput(items, "Z", () => {
      return parseFloat(this.editor.scene.getEye()[2])
    }, (node, eye) => {
      const coord = this.editor.scene.getEye();
      this.editor.scene.setEye(coord[0], coord[1], eye)
    }, "int", 1);
    this.addRow(items, [this.indent - 40 - 8, 20, 20, .1, 20, .1, 20, .1]);
    items = [];
    items.push(getString("editor.center"));
    this.addButton(items, null, getString("editor.reset"), "editor.resetsize.state", function () {
      this.editor.scene.setCenter(ht.Default.graph3dViewCenter)
    });
    this.addLabelInput(items, "X", () => {
      return parseFloat(this.editor.scene.getCenter()[0])
    }, (node, x) => {
      const center = this.editor.scene.getCenter();
      this.editor.scene.setCenter(x, center[1], center[2])
    }, "int", 1);
    this.addLabelInput(items, "Y", () => {
      return parseFloat(this.editor.scene.getCenter()[1])
    }, (node, y) => {
      const center = this.editor.scene.getCenter();
      this.editor.scene.setCenter(center[0], y, center[2])
    }, "int", 1);
    this.addLabelInput(items, "Z", () => {
      return parseFloat(this.editor.scene.getCenter()[2])
    }, (node, z) => {
      const center = this.editor.scene.getCenter();
      this.editor.scene.setCenter(center[0], center[1], z)
    }, "int", 1);
    this.addRow(items, [this.indent - 40 - 8, 20, 20, .1, 20, .1, 20, .1]);
    items = [];
    this.addLabelRange(items, getString("editor.near"),
      data => {
        return data.a("sceneNear")
      }, (node, value) => {
        return node.a("sceneNear", value);
      }, 1, undefined, 1, "int");
    this.addLabelRange(items, getString("editor.far"),
      node => {
        return node.a("sceneFar")
      },
      (node, value) => {
        return node.a("sceneFar", value)
      }, 0, undefined, 100, "int");
    this.addRow(items, [this.indent, .1, this.indent2, .1]);
    items = [];
    this.addLabelColor(items, getString("editor.backgroundcolor"),
      getter("p", "background"), setter("p", "background"));
    this.addRow(items, [this.indent, .1]);
    items = [];
    this.addLabelImage(items, getString("editor.envmapimage"),
      dm => {
        const url = dm.getEnvmap(),
          fileNode = this.editor.getFileNode(url);
        return fileNode ? fileNode.url : url;
      }, (dm, image) => {
        return dm.setEnvmap(image);
      });
    this.addRow(items, [this.indent, .1, 20]);
    this.editor.scene;
    items = [];
    let params = ["json", "dm", "view"];
    this.addLabelFunction(items, getString("editor.onpredeserialize"),
      node => {
        return node.a("onPreDeserialize")
      },
      (node, value) => {
        node.a("onPreDeserialize", value)
      }, "onPreDeserialize", params);
    this.addOneRow(items);
    items = [];
    params = ["json", "dm", "view", "datas"];
    this.addLabelFunction(items, getString("editor.onpostdeserialize"),
      function (data) {
        return data.a("onPostDeserialize")
      },
      function (data, value) {
        data.a("onPostDeserialize", value)
      }, "onPostDeserialize", params);
    this.addOneRow(items);
    items = [];
    this.addLabelComboBox(items, getString("editor.orthographic"),
      function (data) {
        return data.a("sceneOrthographic")
      },
      function (data, value) {
        return data.a("sceneOrthographic", value)
      }, [false, "top", "right", "front"],
      [getString("editor.none"), getString("editor.viewtype.top"),
      getString("editor.viewtype.right"), getString("editor.viewtype.front")]);
    this.addOneRow(items);
  }

  addBloomProperties() {
    this.addTitle("TitleBloom");
    let items = [];
    this.addLabelCheckBox(items, getString("editor.bloom"), function (dm) {
      return dm.a("sceneBloom");
    }, function (dm, value) {
      return dm.a("sceneBloom", value);
    });
    this.addLabelRange(items, getString("editor.strength"), function (dm) {
      return dm.a("sceneBloomStrength")
    }, function (dm, value) {
      return dm.a("sceneBloomStrength", value)
    }, 0, undefined, .01, "number");
    this.addRow(items, [this.indent, .1, this.indent2, .1]);
    items = [];
    this.addLabelRange(items, getString("editor.radius"), function (dm) {
      return dm.a("sceneBloomRadius");
    }, function (dm, value) {
      return dm.a("sceneBloomRadius", value);
    }, 0, undefined, .01, "number");
    this.addLabelRange(items, getString("editor.threshold"), function (dm) {
      return dm.a("sceneBloomThreshold")
    }, function (dm, value) {
      return dm.a("sceneBloomThreshold", value);
    }, 0, 1, .01, "number");
    this.addRow(items, [this.indent, .1, this.indent2, .1]);
  }

  addDofProperties() {
    this.addTitle("TitleDOF");
    let items = [];
    this.addLabelCheckBox(items, getString("editor.dof"), function (dm) {
      return dm.a("sceneDof")
    }, function (dm, value) {
      return dm.a("sceneDof", value)
    }), this.addLabelRange(items, getString("editor.aperture"), function (dm) {
      return dm.a("sceneDofAperture")
    }, function (dm, value) {
      return dm.a("sceneDofAperture", value);
    }, 0, 1, .001, "number");
    this.addRow(items, [this.indent, .1, this.indent2, .1]);
    items = [];
    this.addLabelImage(items, getString("editor.image"), dm => {
      const url = dm.a("sceneDofImage"),
        fileNode = this.editor.getFileNode(url);
      return fileNode ? fileNode.url : url;
    }, function (dm, value) {
      return dm.a("sceneDofImage", value);
    });
    this.addRow(items, [this.indent, .1, 20]);
  }

  addHighlightProperties() {
    this.addTitle("TitleHighlight");
    let items = [];
    this.addLabelRange(items, getString("editor.width"), function (dm) {
      return dm.a("sceneHighlightWidth");
    }, function (dm, value) {
      return dm.a("sceneHighlightWidth", value);
    }, 0, undefined, .1, "number");
    this.addLabelColor(items, getString("editor.color"), function (dm) {
      return dm.a("sceneHighlightColor")
    }, function (dm, value) {
      dm.a("sceneHighlightColor", value);
    });
    this.addRow(items, [this.indent, .1, this.indent2, .1]);
    items = [];
    this.addLabelComboBox(items, getString("editor.mode"), function (dm) {
      return dm.a("sceneHighlightMode")
    }, function (dm, value) {
      dm.a("sceneHighlightMode", value);
    }, ["disabled", "selected", "hover", "style"],
      [getString("editor.highlightmode.disabled"),
      getString("editor.highlightmode.selected"),
      getString("editor.highlightmode.hover"),
      getString("editor.highlightmode.style")]
    );
    this.addRow(items, [this.indent, .1]);
  }

  addGridsGuidesProperties() {
    this.addTitle("TitleGridsGuides");
    let items = [];
    this.addLabelColor(items, getString("editor.gridcolor"), function (dm) {
      return dm.a("sceneGridColor");
    }, function (dm, value) {
      dm.a("sceneGridColor", value);
    });
    this.addRow(items, [this.indent, .1]);
    items = [];
    this.addLabelRange(items, getString("editor.gridsize"), function (dm) {
      return dm.a("sceneGridBlockCount");
    }, function (dm, value) {
      dm.a("sceneGridBlockCount", value);
    }, 0, undefined, 1, "int");
    this.addLabelRange(items, getString("editor.gridgap"), function (dm) {
      return dm.a("sceneGridBlockSize");
    }, function (dm, value) {
      dm.a("sceneGridBlockSize", value);
    }, 1, undefined, 1, "int");
    this.addRow(items, [this.indent, .1, this.indent2, .1]);
  }

  initShadowProperties() {
    this.editor.scene, this.editor.scene.shadowMap;
    this.addTitle("TitleShadow");
    let items = [];
    this.addLabelCheckBox(items, getString("editor.shadow.enable"), function (dm) {
      return dm.a("sceneShadowEnabled");
    }, function (dm, value) {
      return dm.a("sceneShadowEnabled", value);
    });
    this.addRow(items, [this.indent, .1]), items = [], this.
      addLabelRange(items, getString("editor.shadow.degreeX"), function (dm) {
        return dm.a("sceneShadowDegreeX");
      }, function (dm, value) {
        return dm.a("sceneShadowDegreeX", value);
      }, 0, 360, .01, "number");
    this.addRow(items, [this.indent, .1]);
    items = [];
    this.addLabelRange(items, getString("editor.shadow.degreeZ"), function (dm) {
      return dm.a("sceneShadowDegreeZ")
    }, function (dm, value) {
      return dm.a("sceneShadowDegreeZ", value);
    }, -90, 90, .01, "number");
    this.addRow(items, [this.indent, .1]);
    items = [];
    this.addLabelRange(items, getString("editor.shadow.intensity"), function (dm) {
      return dm.a("sceneShadowIntensity");
    }, function (dm, value) {
      return dm.a("sceneShadowIntensity", value);
    }, 0, 1, .01, "number");
    this.addRow(items, [this.indent, .1]);
    items = [];
    this.addLabelComboBox(items, getString("editor.shadow.quality"), function (dm) {
      return dm.a("sceneShadowQuality")
    }, function (dm, value) {
      return dm.a("sceneShadowQuality", value);
    }, ["low", "medium", "high", "ultra"], [
      getString("editor.shadow.quality.low"),
      getString("editor.shadow.quality.medium"),
      getString("editor.shadow.quality.high"),
      getString("editor.shadow.quality.ultra")
    ]
    );
    this.addRow(items, [this.indent, .1]);
    items = [];
    this.addLabelComboBox(items, getString("editor.shadow.type"), function (dm) {
      return dm.a("sceneShadowType")
    }, function (node, value) {
      return node.a("sceneShadowType", value);
    }, ["none", "hard", "soft"], [
      getString("editor.shadow.type.none"),
      getString("editor.shadow.type.hard"),
      getString("editor.shadow.type.soft")]
    );
    this.addRow(items, [this.indent, .1]);
    items = [];
    this.addLabelRange(items, getString("editor.shadow.radius"), function (dm) {
      return dm.a("sceneShadowRadius");
    }, function (dm, value) {
      return dm.a("sceneShadowRadius", value);
    }, 0, 100, .1, "number");
    this.addRow(items, [this.indent, .1]);
    items = [];
    this.addLabelRange(items, getString("editor.shadow.bias"), function (dm) {
      return dm.a("sceneShadowBias")
    }, function (dm, value) {
      return dm.a("sceneShadowBias", value)
    }, -.01, .01, 1e-4, "number");
    this.addRow(items, [this.indent, .1]);
  }
}
