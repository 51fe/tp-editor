import config from "../config.js";
import { getString, isObject } from "../util/index.js";
import FormPane from "./FormPane.js";
import TablePane from "./TablePane.js";

export default class LayerPane extends FormPane {
  constructor(editor) {
    super()
    this.editor = editor;
    this._layerNames = [];
    this.setDisabled(true);
    this.tableModel = new ht.DataModel;
    this.tablePane = new TablePane(this.tableModel);
    this.tableView = this.tablePane.getTableView();
    this.tableView.setEditable(true);
    const isCellEditable = this.tableView.isCellEditable;
    this.tableView.isCellEditable = function () {
      return !!editor.editable && isCellEditable.apply(this, arguments)
    };
    this.tablePane.getView().style.border = config.color_line + " solid 1px";
    this.tablePane.addColumns([
      this.getColumn("name", getString("editor.name"), 100),
      this.getColumn("visible", getString("editor.visible"), 50),
      this.getColumn("selectable", getString("editor.selectable"), 50),
      this.getColumn("movable", getString("editor.movable"), 50),
      this.getColumn("editable", getString("editor.editable"), 50)
    ]);
    this.addRow([this.tablePane], [.1], .1);
    this.addRow([{
      button: {
        icon: "editor.add",
        toolTip: getString("editor.add"),
        onClicked: () => {
          this.editor.editable && (this.addLayer(ht.Data.prototype._layer, true, true, true, true), this.updateLayers())
        }
      }
    }, {
      button: {
        icon: "editor.delete",
        toolTip: getString("editor.delete"),
        onClicked: () => {
          this.editor.editable && this.tableView.sm().size() && (this.dataModel.beginTransaction(), this.removeSelectionLayers(), this.updateLayers(), this.dataModel.endTransaction())
        }
      }
    }, null, {
      button: {
        icon: "editor.top",
        toolTip: getString("editor.bringtofront"),
        onClicked: () => {
          this.editor.editable && this.tableView.sm().size() && (this.tableModel.moveSelectionToTop(), this.updateLayers())
        }
      }
    }, {
      button: {
        icon: "editor.up",
        toolTip: getString("editor.bringforward"),
        onClicked: () => {
          this.editor.editable && this.tableView.sm().size() && (this.tableModel.moveSelectionUp(), this.updateLayers())
        }
      }
    }, {
      button: {
        icon: "editor.down",
        toolTip: getString("editor.sendbackward"),
        onClicked: () => {
          this.editor.editable && this.tableView.sm().size() && (this.tableModel.moveSelectionDown(), this.updateLayers())
        }
      }
    }, {
      button: {
        icon: "editor.bottom",
        toolTip: getString("editor.sendtoback"),
        onClicked: () => {
          this.editor.editable && this.tableView.sm().size() && (this.tableModel.moveSelectionToBottom(), this.updateLayers())
        }
      }
    }], [20, 20, .1, 20, 20, 20, 20]);
  }

  addLayer(name, visible = true, selectable = true, movable = true, editable = true) {
    const data = new ht.Data;
    data.a({ name, visible, selectable, movable, editable });
    this.tableModel.add(data)
  }

  removeSelectionLayers() {
    const dm = this.dataModel,
      selection = this.tableModel.sm().getSelection(),
      size = this.tableModel.size(),
      names = selection.toArray().map(item => {
        return item.a("name")
      });
    let _name = null;
    if (size > selection.size()) {
      const items = this.tableModel.toDatas().toArray();
      for (let i = size - 1; i >= 0; i--) {
        const name = items[i].a("name");
        if (names.indexOf(name) < 0) {
          _name = name;
          break;
        }
      }
    }
    dm.each(data => {
      if (names.indexOf(data.getLayer()) >= 0) {
        data.setLayer(_name);
      }
    });
    this.tableView.removeSelection()
  }

  getColumn(name, displayName, width) {
    return {
      name,
      tag: name,
      accessType: "attr",
      width,
      displayName,
      align: "center",
      editable: true,
      setValue: (data, column, value) => {
        if (value !== data.a(name)) {
          data.a(name, value);
          this.updateLayers();
        }
      }
    }
  }

  initTab() {
    this.dataModel?.removePropertyChangeListener(this.handleDataModelPropertyChange, this);
    const view = this.editor.displayView || this.editor.sceneView;
    if (view) {
      this.dataModel = view.dm;
      this.dataModel.addPropertyChangeListener(this.handleDataModelPropertyChange, this);
      this.setDisabled(false);
    } else {
      this.dataModel = null, this.setDisabled(true);
    }
    this.updateTable();
    this.updateInspector();
  }

  handleDataModelPropertyChange(p) {
    "layers" === p.property && (this.updateTable(), this.updateInspector())
  }

  updateLayers() {
    if (this.dataModel) {
      const layers = this.tableModel.size() ? [] : null;
      layers && this.tableModel.getRoots().forEach(data => {
        layers.push({
          name: data.a("name"),
          visible: data.a("visible"),
          selectable: data.a("selectable"),
          movable: data.a("movable"),
          editable: data.a("editable")
        })
      });
      this.isSettingLayers = true;
      this.dataModel.setLayers(layers);
      this.isSettingLayers = false;
      this.updateInspector();
    }
  }

  updateTable() {
    if (!this.isSettingLayers) {
      this.tableModel.clear();
      if (this.dataModel) {
        const layers = this.dataModel.getLayers();
        layers?.forEach?.(layer => {
          if (isObject(layer)) {
            const { name, visible, selectable, movable, editable } = layer;
            this.addLayer(name, visible, selectable, movable, editable);
          } else {
            this.addLayer(layer, true, true, true, true);
          }
        })
      }
    }
  }

  updateInspector() {
    if (this.dataModel) {
      const layers = this.dataModel.getLayers(),
        inspector = this.editor.inspector;
      this._layerNames = []
      layers && layers.forEach(item => {
        this._layerNames.push(isObject(item) ? item.name : item)
      });
      if (inspector) {
        inspector.invalidateProperties();
        inspector.filterPropertiesLater();
      }
    }
  }

  get layerNames() {
    return this._layerNames;
  }
}
