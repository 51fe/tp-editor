import { getString } from "../util/index.js";
import Inspector from "./index.js";

export default class DisplayInspector extends Inspector {
  constructor(editor, name) {
    super(editor, name, "display", true);
  }

  initForm() {
    this.addCustomProperties();
    this.addFormProperties();
    this.addHighlightProperties();
    this.addGridsGuidesProperties();
  }

  isTitleVisible(row) {
    if (this.inspectorFilter.isDisplayTitleVisible(this.editor, row.title)) {
      return super.isTitleVisible(row);
    }
    return false;
  }

  isPropertyVisible(row) {
    if (this.inspectorFilter.isDisplayPropertyVisible(this.editor, row.keys?.name)) {
      return super.isPropertyVisible(row);
    }
    return false;
  }

  addFormProperties() {
    this.addTitle("TitleBasic");
    let items = [];
    this.addLabelInput(items, getString("editor.previewurl"), function (dm) {
      return dm.a("previewURL");
    }, function (dm, value) {
      dm.a("previewURL", value);
    });
    this.addNameRow(items, "previewURL", "a");
    items = [];
    this.addLabelImage(items, getString("editor.snapshoturl"), function (dm) {
      return dm.a("snapshotURL");
    }, function (node, value) {
      node.a("snapshotURL", value);
    });
    this.addNameRow(items, "snapshotURL", "a");
    items = [];
    this.addLabelColor(items, getString("editor.background"), function (dm) {
      return dm.getBackground();
    }, function (dm, value) {
      dm.setBackground(value);
    });
    this.addNameRow(items, "background", "p");
    items = [];
    this.addLabelInput(items, getString("editor.width"), function (dm) {
      return dm.a("width");
    }, function (dm, value) {
      dm.a("width", value);
    }, "number", 1);
    this.addNameRow(items, "width", "a");
    items = [];
    this.addLabelInput(items, getString("editor.height"), function (dm) {
      return dm.a("height");
    }, function (dm, value) {
      dm.a("height", value);
    }, "number", 1);
    this.addNameRow(items, "height", "a");
    items = [];
    let args = ["json", "dm", "view"];
    this.addLabelFunction(items,
      getString("editor.onpredeserialize"), function (dm) {
        return dm.a("onPreDeserialize")
      }, function (dm, handler) {
        dm.a("onPreDeserialize", handler)
      }, "onPreDeserialize", args);
    this.addNameRow(items, "onPreDeserialize", "a");
    items = [];
    args = ["json", "dm", "view", "datas"];
    this.addLabelFunction(items, getString("editor.onpostdeserialize"), function (dm) {
      return dm.a("onPostDeserialize");
    }, function (dm, value) {
      dm.a("onPostDeserialize", value);
    }, "onPostDeserialize", args);
    this.addNameRow(items, "onPostDeserialize", "a");
    items = [];
    this.addLabelComboBox(items, getString("editor.connectactiontype"), function (dm) {
      return dm.a("connectActionType");
    }, function (dm, value) {
      dm.a("connectActionType", value);
    }, tpeditor.consts.displayConnectActionTypes, tpeditor.consts.displayConnectActionTypeLabels);
    this.addNameRow(items, "connectActionType", "a");
    items = [];
    this.addLabelCheckBox(items, getString("editor.hierarchicalrendering"),
      function (dm) {
        return dm.isHierarchicalRendering();
      },
      function (dm, value) {
        dm.setHierarchicalRendering(value);
      });
    this.addNameRow(items, "hierarchicalRendering", "p");
    items = [];
    this.addLabelCheckBox(items, getString("editor.zoomable"),
      function (dm) {
        return dm.a?.("zoomable") ?? true;
      },
      function (dm, value) {
        dm.a("zoomable", value);
      });

    this.addNameRow(items, "zoomable", "a");
    items = [];
    this.addLabelCheckBox(items, getString("editor.pannable"),
      function (dm) {
        return dm.a?.("pannable") ?? true;
      },
      function (dm, value) {
        dm.a("pannable", value);
      });
    this.addNameRow(items, "pannable", "a");
    items = [];
    this.addLabelCheckBox(items, getString("editor.rectselectable"),
      function (dm) {
        return dm.a?.("rectSelectable") ?? true;
      },
      function (dm, value) {
        dm.a?.("rectSelectable", value);
      });
    this.addNameRow(items, "rectSelectable", "a");
    items = [];
    this.addLabelCheckBox(items, getString("editor.fitcontent"),
      function (dm) {
        return dm.a?.("fitContent");
      },
      function (dm, value) {
        dm.a?.("fitContent", value);
      });
    this.addNameRow(items, "fitContent", "a");
    this.addLayoutProperties();
  }

  addLayoutProperties() {
    const items = [getString("editor.layout")];
    this.addLayoutBtn(items, "circular");
    this.addLayoutBtn(items, "symmetric");
    this.addLayoutBtn(items, "hierarchical");
    this.addLayoutBtn(items, "towardnorth");
    this.addLayoutBtn(items, "towardsouth");
    this.addLayoutBtn(items, "towardeast");
    this.addLayoutBtn(items, "towardwest");
    this.addRow(items, [this.indent, .1, .1, .1, .1, .1, .1, .1]).keys = { name: "layouts" }
  }

  addLayoutBtn(items, value) {
    const setter = () => {
      this.editor.editable && this?.dataModel.layout(value);
    };
    return this.addButton(items, null, getString("editor.layout." + value),
      "editor.layout." + value + ".state", setter);
  }
}