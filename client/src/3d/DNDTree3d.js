import { fileNameToDisplayName, getString, isJSON, isString, msClass } from "../util";
import config from "./config3d";
import DNDTree from "../view/DNDTree.js";

class DNDTree3d extends DNDTree {
  constructor(editor) {
    super(editor, editor.dm);
    this.initMenu();
  }

  handleDelete() {
    this.removeSelection();
  }

  onDataDoubleClicked(data, e) {
    if (e.altKey) {
      this.editor.gv.fitData(data, true, config.fitDataPadding);
    } else {
      this.editor.gv.makeCenter(data, true);
      this.editor.scene.flyTo(data, { animation: true });
    }
  }

  getLabel(data) {
    var label = super.getLabel(data);
    if (!label) {
      let name = data.s("shape3d");
      if (data instanceof ht.Block) {
        label = getString(data.getClassName());
      } else if (data instanceof ht.Shape) {
        if (name === "cylinder") {
          label = getString("editor.pipeline");
        } else if (data.getThickness() > 0) {
          label = getString("editor.wall");
        } else {
          label = getString("editor.floor");
        }
      } else if (data instanceof ht.Node) {
        name = "editor." + (name || "cube");
        if (!(label = getString(name)) || name === label) {
          if (isJSON(name)) {
            const node = this.editor.getFileNode(name),
              fileName = node ? node.getName() : name;
            label = fileNameToDisplayName(fileName);
          } else {
            label = name;
          }
        }
      }
      if (!label) {
        label = getString("editor.cube");
      }
    }
    return label || "";
  }

  getIcon() {
    return {
      width: 20, height: 16,
      comps: [{
        type: "image",
        stretch: "uniform",
        color: {
          func: function (shape) {
            if (shape instanceof ht.Block) return null;
            if (shape instanceof ht.Node) {
              const shape3d = shape.s("shape3d");
              if (isString(shape3d) && isJSON(shape3d)) return null;
            }
            return config.color_dark;
          }
        },
        name: {
          func: function (shape) {
            if (shape instanceof ht.Block) return "editor.block";
            if (shape instanceof ht.Shape) {
              if (shape.getThickness() > 0) {
                return "editor.wall";
              }
              return "editor.floor";
            }
            if (shape instanceof ht.Node) {
              var shape3d = shape.s("shape3d");
              if (shape3d) {
                if (isString(shape3d) && isJSON(shape3d)) {
                  return shape3d.substr(0, shape3d.length - 4) + "png";
                }
                if ("sphere" === shape3d) return "editor.sphere";
                if ("cylinder" === shape3d) return "editor.cylinder";
              }
              return "editor.cube";
            }
            return shape.getIcon();
          }
        },
        rect: [0, 0, 20, 16]
      }]
    }
  }

  _endDrag(e, info) {
    const type = info.type,
      parent = info.parent,
      refData = info.refData;
    if (this.isSelected(this.draggingData)) {
      const selection = this.getTopRowOrderSelection();
      type === "down" && selection.reverse();
      selection.each(data => {
        this._dropData(data, type, parent, refData);
      })
    } else {
      this._dropData(this.draggingData, type, parent, refData);
    }
    this.sm().ss(this.draggingData);
    parent && this.expand(parent);
  }

  _dropData(data, state, node, item) {
    data.setParent(node);
    if (["down", "up"].includes(state)) {
      let list = this.dm().getRoots();
      if (node) {
        list = node.getChildren();
      }
      let index = list.indexOf(item);
      if (state === "down") {
        index++;
      }
      if (list.indexOf(data) < index) {
        index--;
      }
      this.dm().moveTo(data, index);
    } else {
      node || this.dm().moveToBottom(data);
    }
  }

  isEditable() {
    return true;
  }

  rename(data, name) {
    data.setDisplayName(name);
  }

  initMenu() {
    this.menu = new ht.widget.ContextMenu;
    const items = [],
      editor = this.editor;
    this.addSelectDescendantItems(items);
    this.addBlockItems(items);
    this.menu.setItems(items);
    this.menu.addTo(this.getView());
    editor.menus.push(this.menu);
  }

  onPropertyChanged(e) {
    "filter" === e.property && (this.visibleMap = null, this.ivm());
    super.onPropertyChanged(e);
  }

  handleDataPropertyChange(e) {
    if (this._filter && ["name", "displayName"].includes(e.property)) {
      this.visibleMap = null;
      this.ivm();
    } else {
      super.handleDataPropertyChange(e);
    }
  }

  checkVisible(data) {
    if (!this._filter) return true;
    if (config.sceneTreeVisibleFunc) {
      return config.sceneTreeVisibleFunc(data, this._filter);
    }
    let label = this.getLabel(data);
    const filter = (this._filter + "").toLowerCase();
    if (label === undefined) {
      label = (label + "").toLowerCase();
      return label.indexOf(filter) >= 0
    }
    return false;
  }

  validateModel() {
    if (this._filter && !this.visibleMap) {
      this.visibleMap = {};
      this.getDataModel().each(data => {
        if (this.checkVisible(data)) {
          this.visibleMap[data._id] = true;
          for (let parent = data.getParent(); parent && !this.visibleMap[parent._id];) {
            this.visibleMap[parent._id] = true;
            parent = parent.getParent();
          }
        }
      })
    }
    super.validateModel();
  }

  isVisible(node, visible) {
    if (!visible && node._refGraph) return false;
    const func = this.getVisibleFunc();
    if (!func?.(node)) {
      return !this._filter || this.visibleMap?.[node._id];
    }
    return false;
  }
}

msClass(DNDTree3d, { ms_ac: ["filter"] });

export default DNDTree3d;
