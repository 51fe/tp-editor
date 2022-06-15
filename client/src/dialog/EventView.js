import { EVENTS } from "../constants.js";
import config from "../config.js";
import FormPane from "../pane/FormPane.js";
import { getString, parseFunction, parseString } from "../util/index.js";
import { createCodeEditor } from "../util/CodeEditor.js";
import TabView from "../view/TabView.js";
import Dialog from "./index.js"

export default class EventView extends Dialog {
  constructor(editor) {
    super();
    this.editor = editor;
    this.createTabView();
    const buttons = [];
    buttons.push({
      label: getString("editor.ok"),
      action: () => {
        this.ok();
      }
    });
    buttons.push({
      label: getString("editor.cancel"),
      action: () => {
        this.hide();
      }
    });
    this.setConfig({
      title: getString("editor.eventhandlers"),
      closable: true,
      draggable: true,
      width: config.eventViewSize.width,
      height: config.eventViewSize.height,
      contentPadding: 6,
      resizeMode: "wh",
      maximizable: true,
      content: this.tabView,
      buttons,
      buttonsAlign: "right"
    });
    this.setModal(false);
  }

  cancel() {
    this.hide();
  }

  save() {
    this.ok();
  }

  ok(data) {
    if (this.target) {
      this.editor.beginTransaction();
      EVENTS.forEach(item => {
        const formPane = this[item + "FormPane"],
          content = formPane.v("body").trim();
        if (["data", "data3d"].includes(this.inspectorType)) {
          let value = undefined;
          if (data) {
            value = null;
          } else if (content) {
            value = parseFunction("function(event, data, view) {\n" + content + "\n}")
          }
          this.target.forEach(item => {
            item.s(item, value)
          })
        } else {
          let value = undefined;
          if (data) {
            value = null;
          } else if (content) {
            value = parseFunction("function(event, data, view, point, width, height) {\n" + content + "\n}");
          }
          this.target.forEach(item => {
            item.a(item, value)
          })
        }
      });
      this.editor.endTransaction();
    }
    this.callback && this.callback();
    this.hide();
  }

  createTabView() {
    const tabView = this.tabView = new TabView;
    EVENTS.forEach(item => {
      const formPane = this[item + "FormPane"] = new FormPane;
      formPane.addRow([{ id: "head", element: "" }], [.1]);
      formPane.addRow([{
        id: "body",
        element: createCodeEditor()
      }], [.1], .1);
      formPane.addRow(["}"], [.1]);
      this[item + "Tab"] = tabView.add(getString("editor.event." + item.toLowerCase()), formPane);
    });
    tabView.getTabModel().sm().ss(tabView.getTabModel().getDatas().get(0));
  }

  open(target, inspectorType, callback) {
    if (Array.isArray(target) && target.length) {
      this.target = target;
      this.inspectorType = inspectorType;
      this.callback = callback;
      EVENTS.forEach(item => {
        const formPane = this[item + "FormPane"];
        if (["data", "data3d"].includes(this.inspectorType)) {
          formPane.v("head", item + ": function(event, data, view) {");
          formPane.v("body", parseString(target[target.length - 1].s(item)));
        } else {
          formPane.v("head", item + ": function(event, data, view, point, width, height) {");
          formPane.v("body", parseString(target[target.length - 1].a(item)));
        }
      });
      this.show(this.editor.root);
    }
  }
}
