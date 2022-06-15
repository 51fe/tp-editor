import config from "../config.js";
import { beginEdit, clone, getString, parseFunction, stringifyFunction } from "../util/index.js";
import { createCodeEditor } from "../util/CodeEditor.js";
import Dialog from "./index.js";
import SplitView from "../view/SplitView.js";
import { getColumn, setColumn, setExtraInfoColumn } from "../util/column.js";
import FormPane from "../pane/FormPane.js";
import TablePane from "../pane/TablePane.js";

export default class SymbolLayoutView extends Dialog {
  constructor(editor) {
    super()
    this.editor = editor;
    this.editable = true
  }

  init() {
    this.initFuncPane();
    this.initInspectorPane();
    const view = new SplitView(this.funcPane, this.inspectorPane, "h", .5);
    this.setConfig({
      title: getString("editor.layoutattach"),
      closable: true,
      draggable: true,
      width: config.attachPointsViewSize.width,
      height: config.attachPointsViewSize.height,
      resizeMode: "wh",
      maximizable: true,
      content: view,
      buttons: [{
        label: getString("editor.ok"), action: () => {
          this.ok();
        }
      }, {
        label: getString("editor.cancel"), action: () => {
          this.hide();
        }
      }],
      buttonsAlign: "right"
    })
  }

  show(title = getString("editor.tooltip"), content = "", onYes, onNo) {
    this._init || this.init();
    this.setTitle(title);
    this.contentDiv.innerHTML = content;
    this.onYes = onYes;
    this.onNo = onNo;
    super.show(this, this.editor.root);
  }

  initFuncPane() {
    this.funcPane = new FormPane;
    this.funcPane.addRow([{
      id: "head",
      element: "function(host, attach) {"
    }], [.1]);
    this.funcPane.addRow([{
      id: "func",
      element: createCodeEditor()
    }], [.1], .1);
    this.funcPane.addRow(["}"], [.1])
  }

  initInspectorPane() {
    this.inspectorPane = new FormPane;
    this.tableModel = new ht.DataModel;
    this.tablePane = new TablePane(this.tableModel);
    this.tableView = this.tablePane.getTableView();
    this.tableView.setEditable(true);
    this.tableView.isEditable = () => {
      return this.editable
    };
    this.tablePane.getView().style.border = config.color_line + " solid 1px";
    this.tablePane.addColumns([
      getColumn("attr", getString("editor.property"), 90),
      getColumn("valueType", getString("editor.valuetype"), 80, {
        values: tpeditor.consts.valueTypes,
        labels: tpeditor.consts.valueTypeLabels
      }),
      getColumn("defaultValue", getString("editor.defaultvalue"), 90),
      getColumn("name", getString("editor.name"), 80),
      getColumn("group", getString("editor.group"), 80),
      getColumn("description", getString("editor.description"), 120),
      getColumn("extraInfo", getString("editor.extrainfo"), 100)
    ]);
    this.initColumn();
    this.initExtraInfoColumn();
    this.inspectorPane.addRow([this.tablePane], [.1], .1);
    this.inspectorPane.addRow([{
      button: {
        toolTip: getString("editor.add"),
        icon: "editor.add",
        onClicked: () => {
          this.editable && this.addProperties({ attr: "layout." }, true)
        }
      }
    }, {
      button: {
        toolTip: getString("editor.delete"),
        icon: "editor.delete",
        onClicked: () => {
          this.editable && this.tableView.removeSelection();
        }
      }
    }, null, {
      button: {
        icon: "editor.top",
        toolTip: getString("editor.bringtofront"),
        onClicked: () => {
          if (this.editable && this.tableView.sm().size()) {
            this.tableModel.moveSelectionToTop();
          }
        }
      }
    }, {
      button: {
        icon: "editor.up",
        toolTip: getString("editor.bringforward"),
        onClicked: () => {
          if (this.editable && this.tableView.sm().size()) {
            this.tableModel.moveSelectionUp();
          }
        }
      }
    }, {
      button: {
        icon: "editor.down",
        toolTip: getString("editor.sendbackward"),
        onClicked: () => {
          if (this.editable && this.tableView.sm().size()) {
            this.tableModel.moveSelectionDown();
          }
        }
      }
    }, {
      button: {
        icon: "editor.bottom",
        toolTip: getString("editor.sendtoback"),
        onClicked: () => {
          if (this.editable && this.tableView.sm().size()) {
            this.tableModel.moveSelectionToBottom();
          }
        }
      }
    }], [20, 20, .1, 20, 20, 20, 20])
  }

  initColumn() {
    setColumn(this.editor, this.tableView);
  }

  initExtraInfoColumn() {
    setExtraInfoColumn(this.editor, this.tableView);
  }

  addProperties({ attr, valueType, defaultValue, name, description, extraInfo }, refresh) {
    const data = new ht.Data;
    data.a({
      attr: attr || "",
      valueType: valueType || "String",
      defaultValue,
      name,
      description,
      extraInfo
    });
    this.tableModel.add(data);
    this.tableModel.sm().ss(data);
    refresh && setTimeout(() => {
      this.tableView.tx(0);
      beginEdit(this.tableView, data, this.tableView.getColumnModel().getDataByTag("attr"), attr)
    }, 100);
  }

  update(json, params) {
    let value = "";
    if (json) {
      value = stringifyFunction(json);
      const start = value.indexOf("{"),
        end = value.lastIndexOf("}");
      value = value.substring(start + 1, end)
    }
    this.funcPane.v("func", value);
    this.tableModel.clear();
    params?.forEach(param => {
      this.addProperties(param)
    })
  }

  open(json, params, setValue) {
    if (!this._init) {
      this.init();
    }
    this.setValue = setValue;
    this.update(json, params);
    this.show(this.editor.root)
  }

  ok() {
    const vaue = {},
      func = this.funcPane.v("func");
    if (func) {
      vaue.func = parseFunction("function(host, attach) {" + func + "}")
    }
    if (this.tableModel.size()) {
      vaue.properties = [];
      this.tableModel.each(item => {
        vaue.properties.push(clone(item.getAttrObject()))
      })
    }
    this.setValue(vaue);
    this.hide();
  }
}
