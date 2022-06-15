import config from "../config.js";
import { getString, stringify } from "../util/index.js";
import FormPane from "./FormPane.js";
import CodeEditor from "../util/CodeEditor.js";

export default class DataView extends FormPane {
  constructor(editor) {
    super()
    this.editor = editor;
    this.initForm();
    this.visible = false;
    this.initTab();
    this.oopsImageJSON = ht.Default.getImage("editor.oops");
    this.oopsImage = ht.Default.toCanvas(this.oopsImageJSON, this.oopsImageJSON.width, this.oopsImageJSON.height,
      "fill", null, null, null, ht.Default.devicePixelRatio).toDataURL();
  }

  initForm() {
    const codeEditor = this.codeEditor = new CodeEditor({
      language: "json", lineNumbers: "off",
      readOnly: true, minimap: { enabled: false }
    });
    this.addRow([{ id: "content", element: codeEditor }], [.1], .1);
    this.addRow([{
      id: "url",
      textField: { editable: false }
    }, {
      id: "edit",
      button: {
        onClicked: () => {
          this.editor.editable && (this.editing = !this.editing);
        }
      }
    }, {
      id: "commit",
      button: {
        label: getString("editor.commit"),
        onClicked: () => {
          this.commit();
        }
      }
    }], [.1, 50, 50]);
    this.getView().style.background = config.color_pane;
    this.editing = false;
  }

  commit() {
    if (this.editor.editable) {
      this.currentView.update(this.content, true);
      this.editing = false;
    }
  }

  updateContentLater(e) {
    if (this.visible && !this.editing) {
      if (!(e && e.property === "*")) {
        if (this._updateContentLater) {
          clearTimeout(this._updateContentLater);
        }
        this._updateContentLater = setTimeout(() => {
          this.updateContent();
        }, 100);
      }
    }
  }

  updateContent() {
    if (this.visible && !this.editing) {
      this._updateContentLater = null;
      if (this.currentView) {
        this.content = stringify(this.currentView.content, undefined, false)
      } else {
        this.content = ''
      }
    }
  }

  updateUrl() {
    this.v("url", this.tab && this.tab.getTag() || "")
  }

  initTab(tab) {
    this.editing = false;
    if (this.dataModel) {
      this.dataModel.removeDataModelChangeListener(this.updateContentLater, this);
      this.dataModel.removeDataPropertyChangeListener(this.updateContentLater, this);
      this.dataModel.removePropertyChangeListener(this.updateContentLater, this)
    }
    if (tab && !tab._isUI) {
      this.currentView = tab.getView();
      this.dataModel = this.currentView.dm;
      this.dataModel.addDataModelChangeListener(this.updateContentLater, this);
      this.dataModel.addDataPropertyChangeListener(this.updateContentLater, this);
      this.dataModel.addPropertyChangeListener(this.updateContentLater, this);
      this.setDisabled(false);
    } else {
      this.currentView = null;
      this.dataModel = null;
      this.setDisabled(true);
    }
    this.tab = tab;
    this.updateUrl();
    this.updateContentLater();
  }

  get editing() {
    return this._editing
  }

  set editing(val) {
    if (this._editing !== val) {
      this._editing = val;
      this.getViewById("edit").setLabel(getString(val ? "editor.cancel" : "editor.edit"));
      this.getViewById("commit").setDisabled(!val);
      this.getViewById("content").setEditable(val);
      if (!val) {
        this.updateContentLater()
      }
    }
  }

  get visible() {
    return this._visible;
  }

  set visible(val) {
    if (this._visible !== val) {
      this._visible = val;
      if (val) {
        this.updateContent()
      } else if (!this.editing) {
        this.content = ""
      }
    }
  }

  get content() {
    return this.v("content");
  }

  set content(val) {
    this.setDisabled(false);
    this.v("content", val);
  }
}
