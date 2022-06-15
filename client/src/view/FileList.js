import { copy, drawBorder, fileNameToDisplayName, getString, isFF, isJSON, isShiftDown, preventDefault } from "../util/index.js";
import config from "../config.js";
import { createAlert, getInput } from "../util/DialogHelper.js";
import ExplorerView from "./ExplorerView.js";
import DisplayTree from "./DisplayTree";
import { FILE_LAYOUT_LIST, FILE_TYPE_UNKNOWN, FILE_TYPE_DIR } from "../constants.js";
export default class FileList extends ExplorerView {
  constructor(explorer, editable = true) {
    super(explorer, editable)
    this.nodes = [];
    this.doLayoutBind = this.doLayout.bind(this);
    this.dm().sm().ms(() => {
      this.sm().cs();
      this.doLayoutLater();
    });
    this.dm().mm(() => {
      this.doLayoutLater();
    });
    this.addInteractorListener(this.handleInteraction.bind(this));
    this.addBottomPainter(this.paintBottom.bind(this));
    this.addTopPainter(this.paintTop.bind(this));
    this.getCoreInteractor().disabled = true;
  }

  getDataAt(e) {
    if (this._layoutType === FILE_LAYOUT_LIST) {
      const index = Math.floor(this.lp(e).y / this._rowHeight);
      return this.nodes[index];
    }
    return super.getDataAt(e);
  }

  paintBottom(g) {
    const h = this._rowHeight,
      w = this.getWidth();
    this.nodes.forEach(node => {
      if (this.isSelected(node)) {
        if (this._layoutType === FILE_LAYOUT_LIST) {
          g.beginPath();
          g.rect(0, node.p().y - h / 2, w, h);
          g.fillStyle = config.color_select;
          g.fill();
        } else {
          const rect = node.getRect();
          drawBorder(g, config.color_select,
            rect.x - 2, rect.y - 2, rect.width + 4, rect.height + 4, 1)
        }
      }
    })
  }

  paintTop(g) {
    if (config.drawDNDState) {
      g.drawDNDState = true;
    } else {
      config.texureImage3D && (g.texureImage3D = true);
      g.texureImage2D = true;
    }
    let info = undefined;
    if (this._dragInfo && this._dragInfo.inView) {
      info = this._dragInfo;
    } else if (this._crossDragInfo) {
      info = this._crossDragInfo
    }
    if (info) {
      const color = config.color_select_dark,
        targetData = info.targetData;
      if (targetData) {
        if (this._layoutType === FILE_LAYOUT_LIST) {
          const y = targetData.p().y - this._rowHeight / 2,
            w = this.getWidth(),
            h = this._rowHeight;
          drawBorder(g, color, 0, y, w, h, 2)
        } else {
          const { x, y, width, height } = targetData.getRect();
          g.beginPath();
          g.rect(x, y, width, height);
          g.lineWidth = 2;
          g.strokeStyle = config.color_select_dark;
          g.stroke();
        }
      } else {
        const { x, y, width, height } = this.getViewRect();
        drawBorder(g, color, x, y, width, height, 2)
      }
    }
  }

  toDraggingDatas(isDown) {
    const items = [];
    if (this.isSelected(this.draggingData)) {
      this.sm().toSelection().each(data => {
        if (data.fileType !== FILE_TYPE_DIR) {
          items.push(data);
        }
      });
      isDown && items.reverse();
    } else if (this.draggingData.fileType !== FILE_TYPE_DIR) {
      items.push(this.draggingData);
    }
    return items;
  }

  isDroppable(e, info) {
    return this.explorer.rootDir === "displays" && info.view instanceof DisplayTree ||
      info.view === this.editor.dndFromOutside;
  }

  _endDrag(e, info) {
    const targetData = info.targetData;
    if (targetData) {
      const draggingData = this.draggingData,
        setter = () => {
          if (this.isSelected(draggingData)) {
            this.sm().toSelection().each(data => {
              this.editor.moveFile(data, targetData);
            });
          } else {
            this.editor.moveFile(draggingData, targetData);
          }
        };
      if (config.promptForMovingFile) {
        createAlert(getString("editor.move"), getString("editor.confirmmovefile"), setter);
      } else {
        setter();
      }
    }
  }

  handleDisplayTreeDrop(view, targetData) {
    let list = [view.draggingData];
    if (view.isSelected(view.draggingData)) {
      list = view.getTopRowOrderSelection().toArray();
    }
    const target = {};
    list.forEach(data => {
      copy(data, target);
    });
    const serializer = new ht.JSONSerializer(view.getDataModel(), true);
    serializer.isSerializable = data => {
      return target[data._id]
    };
    var content = serializer.serialize();
    getInput(getString("editor.inputnewdisplayname") + " [" + targetData.url + "]",
      view.getLabel(view.draggingData), {
      nullable: false,
      trim: true,
      maxLength: config.maxFileNameLength,
      checkFunc: config.checkFileName,
      root: this.editor.root
    }, (dir, action) => {
      if (action === "ok") {
        isJSON(dir) || (dir += ".json");
        const path = targetData.url + "/" + dir,
          params = { path, content, parent_uuid: targetData.uuid, root_dir: targetData.rootDir };
        this.editor.request("upload", params, showSuccess => {
          if (showSuccess === true) {
            const gv = this.editor.gv,
              isVisible = gv.isVisible;
            gv.isVisible = node => {
              return gv.isVisible(node) && target[node._id];
            };
            this.editor.saveImage(gv, path.substring(0, path.length - 5) + ".png",
              undefined, showSuccess.uuid, showSuccess.parent_uuid, targetData.rootDir);
            gv.isVisible = isVisible;
            gv.redraw();
          }
          this.editor.fireEvent("displayViewSaved", { url: path });
        })
      }
    })
  }

  handleDataDoubleSelect(e, node) {
    if (this.isEditable(node)) {
      const point = this.lp(e);
      if (this._layoutType === FILE_LAYOUT_LIST) {
        point.x > this._rowHeight && this.beginEditing(node);
      } else {
        const ui = this.getDataUI(node);
        if (ui?.labelInfo?.rect && ht.Default.containsPoint(ui.labelInfo.rect, point)) {
          this.beginEditing(node);
        }
      }
    }
  }

  getLabelColor(data) {
    if (data !== this.draggingData || this.isSelected(data)) {
      if (this._layoutType === FILE_LAYOUT_LIST) {
        if (this.isSelected(data)) {
          return config.color_light;
        }
        return ht.Default.labelColor;
      } else if (this.isSelected(data)) {
        return config.color_select;
      }
      return ht.Default.labelColor;
    }
    return config.color_select
  }

  handleInteraction(e) {
    const kind = e.kind,
      data = e.data,
      event = e.event;
    if (kind === "clickData" && this._filter) {
      this.dm().sm().ss(data.getParent());
    } else if (kind === "doubleClickData") {
      if (this.sm().size() === 1) {
        this.setFilter("");
      }
      this._justDoubleClickData = true;
      if (data.fileType === FILE_TYPE_DIR) {
        this.dm().sm().ss(data);
        this._levelChanged = true;
      } else {
        this.editor.open(data, isShiftDown(event), true)
      }
    } else if (e.kind === "doubleClickBackground" && !this._filter) {
      const ld = this.dm().sm().ld();
      if (ld && ld.getParent()) {
        const params = { target: this.explorer };
        if (params.preventDefault) return;
        this._upLevel = true;
        this.dm().sm().ss(ld.getParent());
        this._levelChanged = true;
      }
    }
  }

  handleScroll(e, deltaY) {
    preventDefault(e);
    if (isShiftDown(e)) {
      if (deltaY > 0) {
        this.setFileSize(Math.min(this.getFileSize() + 2, this.getMaxFileSize()));
      } else {
        this.setFileSize(Math.max(this.getFileSize() - 2, 1));
      }
    } else if (isFF || e.wheelDelta !== e.wheelDeltaX) {
      if (isFF && e.detail) {
        deltaY = -e.detail;
      } else {
        deltaY = e.wheelDelta / 40;
      }
      this.translate(0, 20 * deltaY);
    }
  }

  handlePinch(e, tx, ty) {
    if (ty < tx) {
      this.setFileSize(Math.min(this.getFileSize() + 2,
        this.getMaxFileSize()));
    } else {
      this.setFileSize(Math.max(this.getFileSize() - 2, 1));
    }
  }

  onPropertyChanged(e) {
    super.onPropertyChanged(e)
    const map = {
      filter: true,
      layoutType: true,
      fileSize: true,
      fileGap: true,
      rowHeight: true,
      visibleFunc: true
    };
    map[e.property] && this.doLayoutLater();
  }

  isVisible(fileNode) {
    if (this._layouting) {
      if (fileNode.a("visible") === false) return false;
      if (this._visibleFunc && false === this._visibleFunc(fileNode)) return false;
      const filter = this._filter;
      if (filter) {
        const ld = this.dm().sm().ld();
        if (!fileNode.isDescendantOf(ld)) return false;
        if (config.vision && fileNode.uuid === fileNameToDisplayName(filter)) return true;
        const label = this.getLabel(fileNode);
        if (!label || label.indexOf(filter) < 0) return false;
      } else {
        const ld = this.dm().sm().ld();
        if (!ld || fileNode.getParent() !== ld) return false;
      }
      if (!(fileNode.fileType !== FILE_TYPE_UNKNOWN)) return false;
    } else {
      if (this.nodes.indexOf(fileNode) < 0) return false;
      if (!this.isNodeInRect(fileNode)) return false;
    }
    return true;
  }

  isNodeInRect(node) {
    const rect = ht.Default.clone(this.getViewRect());
    ht.Default.grow(rect, this.getFileSize());
    return ht.Default.containsPoint(rect, node.p()) ||
      ht.Default.intersectsRect(rect, node.getRect());
  }

  isMovable() {
    return false;
  }

  onValidated() {
    this._lastWidth === this.getWidth() &&
      this._lastHeight === this.getHeight() ||
      this.doLayoutLater();
  }

  adjustTranslateX() {
    return 0;
  }

  adjustTranslateY(y) {
    var h = this.getHeight() - this._fileRect.height;
    y < h && (y = h);
    return y > 0 ? 0 : Math.round(y);
  }

  getContentRect() {
    return this._fileRect;
  }

  doLayoutLater() {
    if (!this._doLayoutLater) {
      this._doLayoutLater = true;
      requestAnimationFrame(this.doLayoutBind);
    }
  }

  doLayout() {
    this._layouting = true;
    this._doLayoutLater = false;
    this.redraw();
    const nodes = this.nodes = [];
    this.dm().getDatas().each(node => {
      this.isVisible(node) && nodes.push(node)
    });
    const width = this._lastWidth = this.getWidth();
    this._lastHeight = this.getHeight();
    const fileGap = this._fileGap;
    if (this._layoutType === FILE_LAYOUT_LIST) {
      const rowHeight = this._rowHeight,
        h = Math.max(rowHeight - 4, 2);
      for (let i = 0; i < nodes.length; i++) {
        this.updateFileNodeProperties(nodes[i],
          fileGap + h / 2, rowHeight * i + 2 + h / 2, h);
      }
      this._fileRect = {
        x: 0,
        y: 0,
        width,
        height: rowHeight * nodes.length
      }
    } else {
      const fileSize = this._fileSize,
        hw = fileSize + fileGap,
        vh = fileSize + fileGap + 16;
      let w = fileGap,
        h = fileGap,
        offset = 0;
      for (let i = 0; i < nodes.length; i++) {
        this.updateFileNodeProperties(nodes[i],
          w + fileSize / 2, h + fileSize / 2, fileSize);
        if ((offset + 2) * hw + fileGap > width) {
          w = fileGap;
          if (i !== nodes.length - 1) {
            h += vh;
          }
          offset = 0;
        } else {
          w += hw;
          offset++;
        }
      }
      this._fileRect = { x: 0, y: 0, width, height: h + vh }
    }
    this.tx(this.tx());
    this.ty(this.ty());
    this.showScrollBar();
    this._layouting = false;
  }

  updateFileNodeProperties(node, x, y, w) {
    if (this._layoutType === FILE_LAYOUT_LIST) {
      node.setPosition(x, y);
      node.setSize(w, w);
      node.s({
        "label.position": 20,
        "label.offset.x": 3,
        "label.offset.y": 0,
        "label.max": undefined
      })
    } else {
      node.setPosition(x, y);
      node.setSize(w, w);
      node.s({
        "label.position": 31,
        "label.offset.x": 0,
        "label.offset.y": 2,
        "label.max": w
      })
    }
  }
}
