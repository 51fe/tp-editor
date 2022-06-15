import Inspector3d from "./Inspector3d.js";
import { clone, getString, getter, setter } from "../util";
import { createCodeEditor } from "../util/CodeEditor.js";
import config from "./config3d.js";

const BATCH_INFO = {
  alphaTest: ht.Style.alphaTest,
  brightness: false,
  blend: false,
  color: undefined,
  image: undefined,
  light: true,
  reverseCull: false,
  reverseFlip: false,
  reverseColor: ht.Color.reverse,
  transparentMask: ht.Style["transparent.mask"],
  uvOffset: 0,
  uvScale: 1,
  discardSelectable: true,
  opacity: 1,
  transparent: false,
  autoSort: true
}

export default class BatchInfoDialog extends ht.widget.Dialog {
  constructor(editor) {
    super();
    this.editor = editor;
    const content = this._tabView = this.initTabView(),
      buttons = this.initButtons();
    this.setConfig({
      title: getString("editor.batchInfo"),
      closable: true,
      draggable: true,
      width: 415,
      height: 485,
      contentPadding: 6,
      resizeMode: "wh",
      maximizable: true,
      content,
      buttons,
      buttonsAlign: "right"
    });
    this.setModal(false);
  }

  initTabView() {
    const tabView = new ht.widget.TabView,
      commonView = this._commonView = this.initCommonView(),
      commonTab = this._commonTab = tabView.add(getString("editor.common"), commonView, true),
      advanceView = this._advanceView = this.initAdvanceView(),
      advanceTab = this._advanceTab = tabView.add(getString("editor.advance"), advanceView),
      sm = tabView.getTabModel().sm();
    sm.ms(() => {
      let ld = sm.ld();
      if (ld === commonTab) {
        this.parseBatchInfo(JSON.parse(advanceView.getValue()))
      } else if (ld === advanceTab && advanceView.setValue) {
        JSON.stringify(commonView.data.getAttrObject(),
          (value, space) => {
            return space === undefined ? null : space
          }, 4);
      }
    });
    return tabView;
  }

  initCommonView() {
    const inspector = new Inspector3d(this.editor, "batchInfo", "data");
    inspector.setLabelVPadding(0);
    inspector.getValue = (getter) => {
      return getter(this.data);
    };
    inspector.setValue = (setter, value, callback) => {
      setter(this.data, callback ? callback() : value);
    };
    inspector.data = new ht.Data
    inspector.data.onPropertyChanged = function () {
      return inspector.updateProperties();
    };
    let items = [];
    inspector.addLabelRange(items,
      getString("editor.alphatest"),
      getter("a", "alphaTest"),
      setter("a", "alphaTest"), 0, 1, .01, "number");
    inspector.addNameRow(items, "alphaTest", "a");
    items = [];
    inspector.addLabelCheckBox(items,
      getString("editor.brightness"),
      getter("a", "brightness"),
      setter("a", "brightness"));
    inspector.addNameRow(items, "brightness", "a");
    items = [];
    inspector.addLabelCheckBox(items,
      getString("editor.blend"),
      getter("a", "blend"),
      setter("a", "blend"));
    inspector.addNameRow(items, "blend", "a");
    items = [];
    inspector.addLabelColor(items,
      getString("editor.color"),
      getter("a", "color"),
      setter("a", "color"));
    inspector.addNameRow(items, "color", "a");
    items = [];
    inspector.addLabelImage(items,
      getString("editor.image"),
      getter("a", "image"),
      setter("a", "image"));
    inspector.addNameRow(items, "image", "a");
    items = [];
    inspector.addLabelCheckBox(items,
      getString("editor.light"),
      getter("a", "light"),
      setter("a", "light"));
    inspector.addNameRow(items, "light", "a");
    items = [];
    inspector.addLabelCheckBox(items,
      getString("editor.reversecull"),
      getter("a", "reverseCull"),
      setter("a", "reverseCull"));
    inspector.addNameRow(items, "reverseCull", "a");
    items = [];
    inspector.addLabelCheckBox(items,
      getString("editor.reverseflip"),
      getter("a", "reverseFlip"),
      setter("a", "reverseFlip"));
    inspector.addNameRow(items, "reverseFlip", "a");
    items = [];
    inspector.addLabelColor(items,
      getString("editor.reversecolor"),
      getter("a", "reverseColor"),
      setter("a", "reverseColor"));
    inspector.addNameRow(items, "reverseColor", "a");
    items = [];
    inspector.addLabelCheckBox(items,
      getString("editor.transparentmask"),
      getter("a", "transparentMask"),
      setter("a", "transparentMask"));
    inspector.addNameRow(items, "transparentMask", "a");
    items = [];
    inspector.addLabelRange(items,
      getString("editor.uvoffset"),
      getter("a", "uvOffset"),
      setter("a", "uvOffset"), undefined, undefined, 1, "number");
    inspector.addNameRow(items, "uvOffset", "a");
    items = [];
    inspector.addLabelRange(items,
      getString("editor.uvscale"),
      getter("a", "uvScale"),
      setter("a", "uvScale"), undefined, undefined, 1, "number");
    inspector.addNameRow(items, "uvScale", "a");
    items = [];
    inspector.addLabelCheckBox(items,
      getString("editor.discardSelectable"),
      getter("a", "discardSelectable"),
      setter("a", "discardSelectable"));
    inspector.addNameRow(items, "discardSelectable", "a");
    items = [];
    inspector.addLabelRange(items,
      getString("editor.opacity"),
      getter("a", "opacity"),
      setter("a", "opacity"), 0, 1, .01, "number");
    inspector.addNameRow(items, "opacity", "a");
    items = [];
    inspector.addLabelCheckBox(items,
      getString("editor.transparent"),
      getter("a", "transparent"),
      setter("a", "transparent"));
    inspector.addNameRow(items, "transparent", "a");
    items = [];
    inspector.addLabelCheckBox(items,
      getString("editor.autoSort"),
      getter("a", "autoSort"),
      setter("a", "autoSort"));
    inspector.addNameRow(items, "autoSort", "a");
    return inspector;
  }

  initAdvanceView() {
    return createCodeEditor({
      value: "",
      language: "json",
      theme: config.codeEditorTheme,
      readOnly: false,
      minimap: { enabled: false }
    })
  }

  initButtons() {
    const items = [];
    items.push({
      label: getString("editor.ok"),
      action: () => {
        const ld = this._tabView.getTabModel().sm().ld();
        if (ld === this._advanceTab) {
          const info = JSON.parse(this._advanceView.getValue());
          this.parseBatchInfo(info);
        }
        this.handleComplete(this.toBatchInfo());
        this.hide();
      }
    });
    items.push({
      label: getString("editor.cancel"),
      action: () => {
        this.hide();
      }
    });
    return items;
  }
  toBatchInfo() {
    const attrs = clone(this._commonView.data.getAttrObject());
    for (const key in BATCH_INFO) {
      const value = BATCH_INFO[key];
      if (attrs[key] === value || value === undefined && attrs[key] === null) {
        delete attrs[key];
      }
    }
    return attrs;
  }

  parseBatchInfo(info) {
    info = clone(info);
    for (const key in BATCH_INFO) {
      info[key] = BATCH_INFO[key];
    }
    this._commonView.data.setAttrObject(info);
  }

  handleComplete() {}

  show(handler, ...rest) {
    super.show(handler, rest);
    this._commonView.filterProperties();
  }

  hide() {
    this._commonView.data.setAttrObject({});
    this._tabView.getTabModel().sm().ss(this._commonTab);
    super.hide();
  }
}
