import { EMPTY_COMPS } from "../constants.js";
import config from "../config.js";
import { drawSnapshot, drawIcon, getString, msClass, removeItem, trimExtension, unionPoint } from "../util/index.js";
import ContextMenu from "../menu/ContextMenu.js";
import DNDTree from "./DNDTree.js";

class DisplayTree extends DNDTree {
  constructor(explorer) {
    super(explorer.editor, explorer.dm)
    this.displayView = explorer;
    this.graphView = explorer.graphView;
    this.nodeIcon = drawSnapshot(this);
    this.initMenu();
    this.initStudio && this.initStudio();
    explorer.dm.addDataPropertyChangeListener(e => {
      const data = e.data;
      if (data instanceof ht.Shape || data instanceof ht.Edge) {
        data.editorIcon = null;
      }
    });
    tpeditor.SceneView && this.enableToolTip();
  }

  getToolTip(prop) {
    return config.getToolTip(prop, this);
  }

  getBorderColor() {
    return null;
  }

  onDataDoubleClicked() {
    this.editor.fitSelection();
  }

  onPropertyChanged(e) {
    if (e.property === "filter") {
      this.visibleMap = null;
      this.ivm();
    }
    super.onPropertyChanged(e);
  }

  handleDataPropertyChange(e) {
    if (!this._filter || !["name", "displayName"].includes(e.property)) {
      super.handleDataPropertyChange(e);
    } else {
      this.visibleMap = null;
      this.ivm();
    }
  }

  checkVisible(data) {
    if (!this._filter) return true;
    if (config.displayTreeVisibleFunc) {
      return config.displayTreeVisibleFunc(data, this._filter);
    }
    let label = this.getLabel(data);
    const keyword = (this._filter + "").toLowerCase();
    if (label !== undefined) {
      label = (label + "").toLowerCase();
      return label.indexOf(keyword) >= 0
    }
    return false;
  }

  validateModel() {
    if (this._filter && !this.visibleMap) {
      this.visibleMap = {};
      this.getDataModel().each(data => {
        if (this.checkVisible(data)) {
          this.visibleMap[data._id] = true;
          let parant = data.getParent();
          while (parant && !this.visibleMap[parant._id]) {
            this.visibleMap[parant._id] = true;
            parant = parant.getParent();
          }
        }
      })
    }
    super.validateModel();
    if (config.filterDisplayViewEnabled) {
      this.graphView.setVisibleFunc(node => {
        return this.isVisible(node, true)
      })
    }
  }

  isVisible(node, visible) {
    if (!visible && node._refGraph) return false;
    const func = this.getVisibleFunc();
    if (!func?.(node)) {
      return !this._filter || this.visibleMap?.[node._id];
    }
    return false;
  }

  validate() {
    this.graphView.validate();
    super.validate();
  }

  getLabel(data) {
    if (data.toLabel() === undefined && data.s("editor.folder")) {
      return getString("ht.Folder");
    }
    return data.toLabel() ||
      data.s("label") ||
      getString(data.getClassName());
  }

  getIcon(data) {
    function getEditorIcon(tree, edge) {
      const info = tree.graphView.getEdgeInfo(edge);
      if (!info) return EMPTY_COMPS;
      const edgeTypeInfo = info.edgeTypeInfo;
      let pointList = undefined,
        segmentList = undefined;
      if (!info.type || info.points) {
        if (info.type) {
          pointList = new ht.List(info.sourcePoint);
          pointList.addAll(info.points),
            pointList.add(info.targetPoint);
          segmentList = info.segments;
        } else if (info.looped) {
          pointList = undefined;
          segmentList = new ht.List([1, 2, 2, 2, 2, 2, 1, 2])
        } else if (info.center) {
          pointList = [info.c1, info.sourcePoint, info.targetPoint, info.c2];
        } else {
          pointList = [info.sourcePoint, info.targetPoint];
        }
      } else if (edgeTypeInfo) {
        pointList = edgeTypeInfo.points;
        segmentList = edgeTypeInfo.segments;
      }
      const { x, y, width, height } = unionPoint(pointList);
      if (width || height) {
        const ratio = Math.max(1, Math.max(width, height) / 16),
          dx = (16 - width / ratio) / 2,
          dy = (16 - height / ratio) / 2;
        let points = [];
        if (points instanceof ht.List) {
          points = points.toArray();
        }
        points.forEach(function (point) {
          points.push((point.x - x) / ratio + dx, (point.y - y) / ratio + dy)
        });
        const segments = segmentList?.toArray() ?? null;
        return {
          width: 16,
          height: 16,
          comps: [{
            type: "shape",
            points,
            segments,
            borderWidth: 1,
            borderColor: info.color,
            borderCap: info.cap,
            borderJoin: info.join
          }]
        }
      }
      return EMPTY_COMPS;
    }
    if (data instanceof ht.SubGraph) {
      return "editor.subgraph";
    } else if (data instanceof ht.Group) {
      return "editor.group";
    } else if (data instanceof ht.RefGraph ||
      data instanceof ht.Text) {
      return data.getIcon();
    } else if (data instanceof ht.Block) {
      return "editor.block";
    } else if (data instanceof ht.Shape) {
      if (!data.editorIcon) {
        data.editorIcon = drawIcon(data);
      }
      return data.editorIcon;
    } else if (data instanceof ht.Edge) {
      if (!data.editorIcon) {
        data.editorIcon = getEditorIcon(this, data);
      }
      return data.editorIcon;
    } else if (data instanceof ht.Node) {
      return this.nodeIcon;
    } else if (data.s("editor.folder")) {
      if (this.hasExpandedChild(data)) {
        return "editor.direxpanded";
      }
      return "editor.dircollapsed";
    }
    return null;
  }

  isDroppable(e, info) {
    if (this.editor.editable) {
      return info.view === this.editor.symbols.getFileListView() ||
        info.view === this.editor.assets.getFileListView() ||
        info.view === this.editor.displays.getFileListView()
    }
  }

  _endCrossDrag(e, info) {
    if (this.editor.editable && this._crossDragInfo) {
      this.editor.beginTransaction();
      const items = [],
        view = info.view,
        { type, parent, refData } = this._crossDragInfo;
      view !== this.editor.symbols.getFileListView() &&
        view !== this.editor.assets.getFileListView() ||
        view.toDraggingDatas(type === "down").forEach(item => {
          const node = new ht.Node;
          node.setImage(item.getFileUUID());
          node.setDisplayName(trimExtension(item.getName()));
          items.push(node),
            this.displayView.addData(node, true),
            this.editor.gv.getCenterDatas([node]),
            this._dropData(node, type, parent, refData)
        });
      view === this.editor.displays.getFileListView() &&
        view.toDraggingDatas(type === "down").forEach(item => {
          if (item.url !== this.editor.url) {
            const refGraph = new ht.RefGraph;
            refGraph.setRef(item.getFileUUID());
            refGraph.setDisplayName(trimExtension(item.getName()));
            items.push(refGraph);
            this.displayView.addData(refGraph, true);
            this._dropData(refGraph, type, parent, refData);
          }
        });
      items.length && this.sm().ss(items);
      this.editor.endTransaction();
    }
  }

  _endDrag(e, info) {
    if (this.editor.editable) {
      this.editor.beginTransaction();
      const type = info.type,
        parent = info.parent,
        refData = info.refData;
      if (this.isSelected(this.draggingData)) {
        const selection = this.getTopRowOrderSelection();
        type === "down" && selection.reverse();
        selection.each(data => {
          this._dropData(data, type, parent, refData)
        })
      } else {
        this._dropData(this.draggingData, type, parent, refData);
        this.sm().ss(this.draggingData);
      }
      parent && this.expand(parent);
      this.editor.endTransaction();
    }
  }

  _dropData(node, type, parent, refData) {
    if (this.editor.editable) {
      node.setParent(parent);
      if (["down", "up"].includes(type)) {
        const list = parent ? parent.getChildren() : this.dm().getRoots();
        let index = list.indexOf(refData);
        if (type === "down") {
          index++;
        }
        if (list.indexOf(node) < index) {
          index--;
        }
        this.dm().moveTo(node, index);
      } else {
        parent || this.dm().moveToBottom(node)
      }
    }
  }

  rename(data, name) {
    data.setDisplayName(name);
  }

  initMenu() {
    this.menu = new ContextMenu;
    const items = [];
    this.initMenuItems(items);
    this.menu.setItems(items);
    this.menu.addTo(this.getView());
    this.editor.menus.push(this.menu)
  }

  onClosed() {
    removeItem(this.editor.menus, this.menu)
  }

  initMenuItems(items) {
    const selected = () => {
      const selection = this.editor.selection;
      for (let i = 0; i < selection.length; i++) {
        if (selection[i].s("editor.folder")) {
          return true;
        }
      }
      return false;
    };
    items.push(...[{
      id: "folder",
      label: getString("editor.folder"),
      action: () => {
        this.editor.folder()
      },
      visible: () => {
        return this.editable && !!this.editor.ld;
      }
    }, {
      id: "unfolder",
      label: getString("editor.unfolder"),
      action: () => {
        this.editor.unfolder();
      },
      visible: () => {
        return this.editable && selected();
      }
    }, {
      separator: true,
      visible: () => {
        return this.editable && !!this.editor.ld;
      }
    }, {
      id: "copy",
      label: getString("editor.copy"),
      action: () => {
        this.editor.copy();
      },
      visible: () => {
        return this.editable && !!this.editor.ld;
      }
    }, {
      id: "paste",
      label: getString("editor.paste"),
      action: () => {
        this.editor.paste()
      },
      visible: () => {
        return this.editable && this.editor.hasCopyInfo();
      }
    }, {
      id: "delete",
      label: getString("editor.delete"),
      action: () => {
        this.editor.delete()
      },
      visible: () => {
        return this.editable && !!this.editor.ld;
      }
    }, {
      separator: true,
      visible: () => {
        return this.editable && !!this.editor.ld;
      }
    }, {
      id: "bringToFront",
      label: getString("editor.bringtofront"),
      action: () => {
        this.editor.bringToFront();
      },
      visible: () => {
        return this.editable && !!this.editor.ld
      }
    }, {
      id: "bringForward",
      label: getString("editor.bringforward"),
      action: () => {
        this.editor.bringForward()
      },
      visible: () => {
        return this.editable && !!this.editor.ld
      }
    }, {
      id: "sendBackward",
      label: getString("editor.sendbackward"),
      action: () => {
        this.editor.sendBackward();
      },
      visible: () => {
        return this.editable && !!this.editor.ld
      }
    }, {
      id: "sendToBack",
      label: getString("editor.sendtoback"),
      action: () => {
        this.editor.sendToBack();
      },
      visible: () => {
        return this.editable && !!this.editor.ld
      }
    }, {
      separator: true,
      visible: () => {
        return this.editable && !!this.editor.ld
      }
    }, {
      id: "expandAll",
      label: getString("editor.expandall"),
      action: () => {
        this.expandAll();
      }
    }, {
      id: "collapseAll",
      label: getString("editor.collapseall"),
      action: () => {
        this.collapseAll();
      }
    }]);
    this.addSelectDescendantItems(items);
    this.addBlockItems(items);
  }

  get editable() {
    return this.editor.editable;
  }

  set editable(value) { }
}

msClass(DisplayTree, { ms_ac: ["filter"] });

export default DisplayTree;
