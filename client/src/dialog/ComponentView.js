import config from "../config.js";
import { EVENTS } from "../constants.js";
import {
  beginEdit, createButton, getString, isJSON, parse, parseFunction,
  parseString, serializeDM, stringify, trimExtension, xhrLoad
} from "../util/index.js";
import { createAlert } from "../util/DialogHelper.js";
import { createCodeEditor } from "../util/CodeEditor.js";
import FormPane from "../pane/FormPane.js";
import GraphView from "../view/GraphView.js";
import Dialog from "./index.js";
import TablePane from "../pane/TablePane.js";
import SplitView from "../view/SplitView.js";
import { getColumn, setColumn, setExtraInfoColumn } from "../util/column.js";

export default class ComponentView extends Dialog {
  constructor(editor) {
    super();
    this.editor = editor;
    this._errorMsg = null;
    this.drawCompType();
    this.initInspectorPane();
    this.initFuncPane();
    this.splitView = new SplitView(this.inspectorPane, this.graphView, "v", -200);
    this.mainSplitView = new SplitView(this.funcPane, this.splitView, "h", -360);
    this._eventData = new ht.Data;
    const buttons = [];
    buttons.push({
      label: getString("editor.refresh"), action: () => {
        this.refresh()
      }
    });
    buttons.push({
      label: getString("editor.ok"), action: () => {
        this.ok()
      }
    });
    buttons.push({
      label: getString("editor.cancel"), action: () => {
        this.hide()
      }
    });
    this.setConfig({
      closable: true,
      draggable: true,
      width: config.componentViewSize.width,
      height: config.componentViewSize.height,
      contentPadding: 0,
      resizeMode: "wh",
      maximizable: true,
      content: this.mainSplitView,
      buttons,
      buttonsAlign: "right"
    });
  }

  cancel() {
    this.hide()
  }

  save() {
    this.ok()
  }

  drawCompType() {
    ht.Default.setCompType("_editingCompType_", {
      func: function () { }
    })
    this.graphView = new GraphView;
    this.initOverviewNode();
    this.graphView.mi(e => {
      if (['doubleClickData', 'doubleClickBackground'].includes(e.kind)) {
        this.graphView.fitContent(config.animate, config.fitPadding);
      }
    });
    ht.Default.drawCompType = (draw, g, rect, comp, data, view) => {
      const editing = "_editingCompType_" === comp.type;
      try {
        editing && this.beforeDrawCompType(g);
        draw(g, rect, comp, data, view);
        editing && this.afterDrawCompType(g);
      } catch (error) {
        if (editing) {
          this.afterDrawCompType(g);
          this._errorMsg = getString("editor.compfunctionerror");
        }
        console.error(error.stack || error);
      }
    }
  }

  initOverviewNode() {
    const node = this.node,
      dm = this.graphView.dm();
    node && dm.contains(node) && dm.remove(node);
    const newNode = this.node = new ht.Node;
    newNode.setImage({
      width: 100, height: 100,
      fitSize: true,
      comps: [{ type: "_editingCompType_" }]
    });
    dm.add(newNode);
    dm.sm().ss(newNode);
  }

  beforeDrawCompType(g) {
    let restoreFlag = this._restoreFlag;
    if (!restoreFlag) {
      restoreFlag = this._restoreFlag = g.createLinearGradient(0, 0, 10, 10);
      restoreFlag.addColorStop(0, "black");
      restoreFlag.addColorStop(0, "black");
    }
    g.fillStyle = restoreFlag;
    g.save();
    g.fillStyle = "#000000";
  }

  afterDrawCompType(g) {
    g.restore();
    const needReset = g.fillStyle !== this._restoreFlag;
    if (needReset) {
      let i = 0;
      while (needReset) {
        g.restore();
        ++i < 20;
      }
      g.fillStyle = "black";
      this._errorMsg = getString("editor.complosssaveorrestore");
    } else {
      this._errorMsg = null;
    }
  }

  initFuncPane() {
    this.funcPane = new FormPane;
    this.funcPane.addRow([{
      id: "head",
      element: "function(g, rect, comp, data, view) {"
    }], [.1]);
    this.funcPane.addRow([{
      id: "func",
      element: createCodeEditor()
    }], [.1], .1);
    this.funcPane.addRow(["}"], [.1])
  }

  initInspectorPane() {
    const indent = config.indent;
    this.inspectorPane = new FormPane;
    const eventButton = createButton(getString("editor.eventhandlers"), null, null,
      () => {
        this.editor.eventView.open(
          [this._eventData],
          null,
          this.resetEventButtonLabelColor.bind(this)
        )
      });
    this.eventButton = eventButton;
    this.inspectorPane.addRow([
      getString("editor.name"), {
        id: "name",
        textField: {}
      }, {
        element: getString("editor.events"),
        align: "right"
      }, { element: eventButton }], [indent, .1, indent, .1]);
    this.inspectorPane.addRow([
      getString("editor.width"), {
        id: "width",
        textField: {}
      }, { element: getString("editor.height"), align: "right" }, {
        id: "height",
        textField: {}
      }], [indent, .1, indent, .1]);
    this.inspectorPane.addRow([
      getString("editor.path"), {
        id: "path",
        textField: { editable: false }
      }], [indent, .1]);
    this.inspectorPane.addRow([
      getString("editor.snapshoturl"), {
        id: "snapshotURL",
        textField: {}
      }], [indent, .1]);
    this.createTable();
  }

  createTable() {
    const dm = this.tableModel = new ht.DataModel;
    this.tablePane = new TablePane(this.tableModel);
    this.tableView = this.tablePane.getTableView();
    this.tableView.setEditable(true);
    this.tableView.isEditable = () => {
      return this.editable
    };
    this.tablePane.getView().style.border = config.color_line + " solid 1px";
    this.tablePane.addColumns([getColumn("property", getString("editor.property"), 150),
    getColumn("valueType", getString("editor.valuetype"), 80, {
      values: tpeditor.consts.valueTypes,
      labels: tpeditor.consts.valueTypeLabels
    }),
    getColumn("defaultValue", getString("editor.defaultvalue"), 90),
    getColumn("name", getString("editor.name"), 80),
    getColumn("group", getString("editor.group"), 80),
    getColumn("description", getString("editor.description"), 120),
    getColumn("extraInfo", getString("editor.extrainfo"), 100)]);
    this.initColumn();
    this.initExtraInfoColumn();
    this.inspectorPane.addRow([this.tablePane], [.1], .1);
    this.inspectorPane.addRow([{
      button: {
        toolTip: getString("editor.add"),
        icon: "editor.add",
        onClicked: () => {
          if (this.editable) {
            const data = new ht.Data;
            data.a({ property: "property", valueType: "String" });
            let index = undefined;
            const ld = dm.sm().ld();
            if (ld) {
              index = dm.getRoots().indexOf(ld) + 1;
            }
            dm.add(data, index);
            dm.sm().ss(data);
            setTimeout(() => {
              this.tableView.tx(0);
              beginEdit(this.tableView, data, this.tableView.getColumnModel().getDataByTag("property"))
            }, 100)
          }
        }
      }
    }, {
      button: {
        toolTip: getString("editor.delete"),
        icon: "editor.delete",
        onClicked: () => {
          this.editable && this.tableView.removeSelection()
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

  open(fileNode, path = undefined) {
    this.fileNode = fileNode;
    this.initOverviewNode();
    if (fileNode) {
      xhrLoad(fileNode.url, res => {
        this.update(fileNode.url, fileNode.path,
          trimExtension(fileNode.getName()), res, fileNode.a("editable"))
      })
    } else {
      this.update(undefined, path || this.editor.components.currentDir, getString("editor.untitled"))
    }
  }

  update(url, path, name, json, editable) {
    this.editable = false !== editable;
    this._eventData.setAttrObject({});
    if (json) {
      json = parse(json);
      this.setTitle(getString("editor.editcomponent"));
      this.node.setWidth(json.width || 100);
      this.node.setHeight(json.height || 100);
      this.inspectorPane.v("width", this.node.getWidth());
      this.inspectorPane.v("height", this.node.getHeight());
      this.inspectorPane.v("snapshotURL", json.snapshotURL || "");
      this.inspectorPane.getViewById("name").setEditable(false);
      this.inspectorPane.v("name", name || "");
      this.inspectorPane.v("path", path || "");
      this.funcPane.v("func", parseString(json.func));
      this.tableModel.clear();
      if (json.properties) {
        for (let property in json.properties) {
          const { valueType, defaultValue, name, group, description, extraInfo } = json.properties[property],
            data = new ht.Data;
          data.a({
            property,
            valueType,
            defaultValue,
            name,
            group,
            description,
            extraInfo
          });
          this.tableModel.add(data);
        }
      }
      this._eventData = new ht.Data;
      if (json.events) {
        for (const i in json.events) {
          this._eventData.a(i, json.events[i]);
        }
      }
      this.refresh();
      this.show(this.editor.root);
      this.editor.fireEvent("componentViewOpened", {
        componentView: this,
        url,
        json
      })
    } else {
      this.setTitle(getString("editor.newcomponent"));
      this.node.setWidth(100);
      this.node.setHeight(100);
      this.inspectorPane.v("width", this.node.getWidth());
      this.inspectorPane.v("height", this.node.getHeight());
      this.inspectorPane.v("snapshotURL", "");
      this.inspectorPane.getViewById("name").setEditable(true);
      this.inspectorPane.v("name", name);
      this.inspectorPane.v("path", path);
      this.funcPane.v("func", "");
      this.tableModel.clear();
      this.refresh();
      this.show(this.editor.root);
      this.url = url;
      this.editor.fireEvent("componentViewCreated", { componentView: this });
      this.resetEventButtonLabelColor();
    }
  }

  getFunction() {
    return parseFunction(this.funcPane.v("head") + "\n" + this.funcPane.v("func").trim() + "\n}")
  }

  getProperties(serialized) {
    const properties = {};
    this.tableModel.getRoots().each(data => {
      const defaultValue = data.a("defaultValue");
      properties[data.a("property")] = {
        valueType: data.a("valueType"),
        defaultValue: serialized ? serializeDM(defaultValue) : defaultValue,
        name: data.a("name"),
        group: data.a("group"),
        description: data.a("description"),
        extraInfo: data.a("extraInfo")
      }
    });
    return properties;
  }

  refresh(callback) {
    ht.Default.setCompType("_editingCompType_", {
      func: this.getFunction(),
      properties: this.getProperties()
    });
    this.node.setWidth(parseFloat(this.inspectorPane.v("width")));
    this.node.setHeight(parseFloat(this.inspectorPane.v("height")));
    this.node.iv();
    this.graphView.fitContent(config.animate, config.fitPadding);
    const handler = e => {
      if (e.kind === "validate") {
        callback && callback(!this._errorMsg);
        this._errorMsg && this.editor.showMessage(this._errorMsg, "error");
        this.graphView.removeViewListener(handler, this);
      }
    };
    this.graphView.addViewListener(handler, this)
  }

  createEvents() {
    const data = this._eventData,
      events = {};
    EVENTS.forEach(item => {
      const event = data.a(item);
      if (event) {
        events[item] = event;
      }
    });
    return events;
  }

  resetEventButtonLabelColor() {
    let selected = false;
    for (let i = 0; i < EVENTS.length; i++) {
      if (this._eventData.a(EVENTS[i])) {
        selected = true;
        break
      }
    }
    this.eventButton.setLabelColor(selected ? config.color_select : ht.Default.labelColor);
  }

  ok() {
    if (!this.editable) {
      this.hide();
      return false;
    }
    let name = this.inspectorPane.v("name").trim();
    const path = this.inspectorPane.v("path");
    if (!this.url) {
      const comps = this.editor.components;
      if (comps.isAccordionMode() && comps.rootDir === path) {
        this.editor.showMessage(getString("editor.createfolderfirst"), "error", 2000);
        return false;
      }
    }
    const url = this.url || path + "/" + name + ".json";
    if (!name) {
      createAlert(null, getString("editor.inputempty"));
      return false
    }
    if (name.length > config.maxFileNameLength) {
      createAlert(null, getString("editor.inputmax"));
      return false;
    }
    if (!config?.checkFileName(name, url)) {
      createAlert(null, getString("editor.invalidfilename"));
      return false;
    }
    isJSON(name) && (name = trimExtension(name));
    const content = this.content;
    let params = { componentView: this, url, json: stringify(content) };
    this.editor.fireEvent("componentViewSaving", params);
    if (!params.preventDefault) {
      params = {
        path: params.url,
        content: params.json
      };
      if (config.vision) {
        params.root_dir = this.editor.components.rootDir;
        params.parent_uuid = this.editor.components.tree.sm().ld().uuid;
      }
      this.refresh(callback => {
        callback && this.editor.request("upload", params, res => {
          const result = config.vision ? res && res.uuid : res === true
          if (result) {
            this.refresh();
            this.graphView.sm().cs();
            this.graphView.validate();
          }
          this.editor.saveImage(content.snapshotURL || this.graphView, path + "/" + name + ".png", () => {
            this.editor.fireEvent("componentViewSaved", params);
          }, res.uuid, res.parent_uuid, res.root_dir);
          this.hide();
          this.editor.selectFileNode(params.path);
          params = {
            componentView: this,
            url: params.path,
            json: params.content
          }
        })
      })
    }
  }

  get content() {
    const pane = this.inspectorPane,
      json = {
        modified: new Date().toString(),
        width: parseFloat(pane.v("width")),
        height: parseFloat(pane.v("height")),
        func: this.getFunction()
      },
      snapshotURL = pane.v("snapshotURL"),
      events = this.createEvents();
    if (this.tableModel.size()) {
      json.properties = this.getProperties(true);
    }
    events && (json.events = events);
    snapshotURL && (json.snapshotURL = snapshotURL);
    return json;
  }
}
