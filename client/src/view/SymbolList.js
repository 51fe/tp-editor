import config from "../config.js";
import { drawSnapshot, drawIcon, getString, msClass, removeItem } from "../util/index.js";
import ContextMenu from "../menu/ContextMenu.js";
import DNDIndexList from "./DNDIndexList.js";
import Restore from "../type/Restore.js";

class SymbolList extends DNDIndexList {
  constructor(symbolView) {
    super(symbolView.editor, symbolView.dm);
    this.symbolView = symbolView;
    this.graphView = symbolView.graphView;
    this.nodeIcon = drawSnapshot(this);
    this.initMenu();
    this.initStudio && this.initStudio();
    symbolView.dm.addDataPropertyChangeListener(e => {
      e.data.editorIcon = null;
    })
  }

  getToolTip(shape) {
    return config.getToolTip(shape, this);
  }

  onDataDoubleClicked() {
    this.editor.fitSelection();
  }

  onPropertyChanged(e) {
    e.property === "filter" && this.ivm();
    super.onPropertyChanged(e);
  }

  handleDataPropertyChange(e) {
    if (this._filter && (["displayName", "s:text", "s:type", "s:image"]
      .includes(e.property))) {
      super.handleDataPropertyChange(e);
    } else {
      this.ivm();
    }
  }

  isVisible(node) {
    if ("__renderHTML__" === node.getTag()) return false;
    if (!this._filter) return true;
    const func = this.getVisibleFunc();
    if (func && !func(node)) return false;
    if (config.symbolListVisibleFunc) {
      return config.symbolListVisibleFunc(node, this._filter);
    }
    let label = this.getLabel(node);
    const name = (this._filter + "").toLowerCase();
    if (label) {
      label = (label + "").toLowerCase()
    }
    return label.indexOf(name) >= 0;
  }

  validate() {
    this.graphView.validate();
    super.validate();
  }

  validateModel() {
    super.validateModel();
    if (config.filterSymbolViewEnabled) {
      this.graphView.setVisibleFunc(node => {
        return this.isVisible(node)
      });
    }
  }

  getIcon(shape) {
    if (shape instanceof Restore) {
      return "editor.restore.state";
    } else if (shape instanceof ht.Text) {
      return shape.getIcon();
    } else if (shape instanceof ht.Shape) {
      shape.editorIcon || (shape.editorIcon = drawIcon(shape));
      return shape.editorIcon;
    } else if (shape instanceof ht.Node) {
      return this.nodeIcon;
    }
    return null;
  }

  isDroppable() {
    return false;
  }

  _endCrossDrag() {
  }

  _endDrag(e, info) {
    this.editor.beginTransaction();
    const type = info.type,
      refData = info.refData;
    if (this.isSelected(this.draggingData)) {
      const data = this.getRowOrderSelection();
      type === "down" && data.reverse();
      data.each(data => {
        this._dropData(data, type, refData);
      })
    } else {
      this._dropData(this.draggingData, type, refData);
      this.sm().ss(this.draggingData);
    }
    this.editor.endTransaction();
  }

  _dropData(data, type, refData) {
    if (refData) {
      const list = this.dm().getDatas();
      let index = list.indexOf(refData);
      if (type === "down") {
        index++;
      }
      if (list.indexOf(data) < index) {
        index--;
      }
      this.dm().moveToIndex(data, index);
    } else {
      this.dm().bringToFront(data);
    }
  }

  rename(item, name) {
    item.setDisplayName(name);
  }

  initMenu() {
    this.menu = new ContextMenu;
    const items = [];
    this.initMenuItems(items);
    this.menu.setItems(items);
    this.menu.addTo(this.getView());
    this.editor.menus.push(this.menu);
  }

  onClosed() {
    removeItem(this.editor.menus, this.menu);
  }

  initMenuItems(items) {
    items.push(...[{
      id: "copy",
      label: getString("editor.copy"),
      action: () => {
        this.editor.copy();
      },
      visible: () => {
        return !!this.editor.ld;
      }
    }, {
      id: "paste",
      label: getString("editor.paste"),
      action: () => {
        this.editor.paste();
      },
      avisible: () => {
        return this.editable && this.editor.hasCopyInfo();
      }
    }, {
      id: "delete",
      label: getString("editor.delete"),
      action: () => {
        this.editor.delete();
      },
      avisible: () => {
        return this.editable && !!this.editor.ld;
      }
    }, "separator", {
      id: "bringToFront",
      label: getString("editor.bringtofront"),
      action: () => {
        this.editor.bringToFront();
      },
      avisible: () => {
        return this.editable && !!this.editor.ld;
      }
    }, {
      id: "bringForward",
      label: getString("editor.bringforward"),
      action: () => {
        this.editor.bringForward();
      },
      avisible: () => {
        return this.editable && !!this.editor.ld;
      }
    }, {
      id: "sendBackward",
      label: getString("editor.sendbackward"),
      action: () => {
        this.editor.sendBackward();
      },
      avisible: () => {
        return this.editable && !!this.editor.ld;
      }
    }, {
      id: "sendToBack",
      label: getString("editor.sendtoback"),
      action: () => {
        this.editor.sendToBack();
      },
      avisible: () => {
        return this.editable && !!this.editor.ld;
      }
    }])
  }

  get editable() {
    return this.editor.editable;
  }
  set editable(value) { }
}


msClass(SymbolList, { ms_ac: ["filter"] });

export default SymbolList;
