import { FILE_LAYOUT_LIST, FILE_TYPE_DIR, FILE_TYPE_UNKNOWN } from "../constants.js";
import config from "../config.js";
import { drawBorder, drawText, getString, isFF, isLeftButton, isShiftDown, msClass } from "../util/index.js";
import { createAlert } from "../util/DialogHelper.js";
import ExplorerView from "./ExplorerView.js";
import DisplayTree from "./DisplayTree.js";

ht.Default.setCompType("accordion-title-comp",
  function (g, rect, comp, data, view) {
    const title = config.drawAccordionTitle;
    if (title) {
      return title(g, rect, data, view, {
        isHover: data.__hover,
        isExpanded: data.expanded,
        hoverColor: config.color_hover,
        selectColor: config.color_select
      })
    }
    const hover = data.__hover,
      { x, y, width, height } = rect,
      label = view.getLabel(data),
      gap = view.getFileGap();
    g.save();
    if (hover || view.isSelected(data)) {
      g.fillStyle = config.color_hover;
      g.fillRect(x, y, width, height);
    }
    g.fillStyle = config.color_select;
    g.fillRect(x + gap, y + (height - 8) / 2, 8, 8);
    label && drawText(g, label, "bold 14px Arial",
      ht.Default.labelColor, x + gap + 8 + 8, y, 200, height, "left", "middle");
    g.restore()
  });

ht.Default.setImage("accordion-title", {
  width: 160,
  height: 24,
  fitSize: true,
  pixelPerfect: false,
  interactive: true,
  boundExtend: 2,
  onDown: function (e, node, acc) {
    if (isLeftButton(e)) {
      if (acc.getMutex() && !node.expanded) {
        acc.dirs.forEach(function (dir) {
          dir !== node && (dir.expanded = false)
        });
      }
      node.expanded = !node.expanded;
      acc.ivm();
    }
  },
  onEnter: function (e, data) {
    data.__hover = true;
    data.iv();
  },
  onLeave: function (event, data) {
    data.__hover = false;
    data.iv();
  },
  comps: [{
    type: "accordion-title-comp",
    displayName: "clock-pointer",
    rect: [0, 0, 160, 24]
  }
  ]
});

export default class Accordion extends ExplorerView {
  constructor(explorer, editable = true) {
    super(explorer, editable);
    this.setFileGap(10);
    this.setMutex(config.accordionMutex);
    this.nodes = [];
    this.dirs = [];
    this.bottomRects = [];
    this.addViewListener(e => {
      "beginValidate" === e.kind && this.doLayout()
    });
    this.setSelectionModelShared(false);
    this.dm().sm().ms(() => {
      this.sm().cs();
    });
    this._layouted = false, this.mi(this.handleInteraction.bind(this));
    this.addBottomPainter(this.paintBottom.bind(this));
    this.addTopPainter(this.paintTop.bind(this));
  }

  paintBottom(g) {
    const h = this._rowHeight,
      w = this.getWidth();
    this.nodes.forEach(node => {
      if (this._layoutType === FILE_LAYOUT_LIST) {
        if (this.isSelected(node)) {
          g.beginPath();
          g.rect(0, node.p().y - h / 2, w, h);
          g.fillStyle = config.color_select;
          g.fill();
        }
      } else {
        let borderColor = config.color_mask;
        if (this.isSelected(node)) {
          borderColor = config.color_select;
        }
        const { x, y, width, height } = node.getRect(),
          padding = this._filePadding;
        drawBorder(g, borderColor, x - padding, y - padding, width + 2 * padding, height + 2 * padding, 1);
      }
    });
    g.beginPath();
    g.lineWidth = 2;
    g.strokeStyle = config.color_hover;
    this.bottomRects.forEach(({ x, y, width, height }) => {
      g.moveTo(x + 10, y + height / 2);
      g.lineTo(x + width - 10, y + height / 2);
    });
    g.stroke();
  }

  isDroppable(e, state) {
    return this.explorer.rootDir === "displays" &&
      state.view instanceof DisplayTree ||
      state.view === this.editor.dndFromOutside;
  }

  handleDragAndDrop(e, state) {
    const data = this.draggingData;
    if (data?.fileType !== FILE_TYPE_DIR) {
      super.handleDragAndDrop(e, state);
    }
  }

  isLabelVisible(node) {
    return node.fileType !== FILE_TYPE_DIR;
  }

  paintTop(g) {
    if (config.drawDNDState) {
      g.drawDNDState = true;
    } else {
      config.texureImage3D && (g.texureImage3D = true);
      g.texureImage2D = true;
    }
    let dragInfo = undefined;
    if (this._dragInfo?.inView) {
      dragInfo = this._dragInfo;
    } else {
      this._crossDragInfo && (dragInfo = this._crossDragInfo);
    }
    if (dragInfo) {
      const borderColor = config.color_select_dark,
        targetData = dragInfo.targetData;
      if (targetData) {
        const { x, y, width, height } = targetData.getRect();
        g.beginPath();
        g.rect(x, y, width, height);
        g.lineWidth = 2;
        g.strokeStyle = config.color_select_dark;
        g.stroke();
      } else {
        const { width, height } = this.getViewRect();
        drawBorder(g, borderColor, 0, 0, width, height, 2);
      }
    }
  }

  getDataAt(e) {
    if (this._layoutType !== FILE_LAYOUT_LIST) {
      return super.getDataAt(e);
    }
    const data = super.getDataAt(e);
    if (data) return data;
    const y = this.lp(e).y;
    for (let i = 0; i < this.nodes.length; i++) {
      const node = this.nodes[i],
        _y = node.getY(),
        h = this._rowHeight,
        min = _y - h / 2,
        max = _y + h / 2;
      if (y >= min && y < max) {
        return node;
      }
    }
  }

  handleInteraction(e) {
    const kind = e.kind,
      data = e.data,
      event = e.event;
    if (kind === "doubleClickData" && this.sm().size() === 1
      && data.fileType !== FILE_TYPE_DIR) {
      this.setFilter("");
      data.getParent().expanded = true;
      this.sm().ss(data);
      this.ivm();
      this.editor.open(data, isShiftDown(event), true);
    }
  }

  handleDataDoubleSelect(e, node) {
    if (this.isEditable(node)) {
      const point = this.lp(e);
      if (node.fileType !== FILE_TYPE_DIR) {
        if (this._layoutType === FILE_LAYOUT_LIST) {
          point.x > this._rowHeight && this.beginEditing(node);
        }
      } else {
        const ui = this.getDataUI(node);
        if (ui?.labelInfo?.rect && ht.Default.containsPoint(ui.labelInfo.rect, point)) {
          this.beginEditing(node);
        }
      }
    }
  }

  getLabelColor(fileNode) {
    if (fileNode !== this.draggingData || this.isSelected(fileNode)) {
      if (this._layoutType === FILE_LAYOUT_LIST) {
        if (this.isSelected(fileNode)) {
          return config.color_light;
        } else {
          return ht.Default.labelColor;
        }
      } else {
        if (this.isSelected(fileNode)) {
          return config.color_select;
        } else {
          return ht.Default.labelColor;
        }
      }
    }
    return config.color_select;
  }

  isVisible(fileNode) {
    if (!this._layouted) return false;
    if (this._visibleFunc?.(fileNode) === false) return false;
    const rootDir = this.explorer.rootDir,
      parent = fileNode.getParent();
    if (fileNode.a("visible") === false) return false;
    if (fileNode.fileType === FILE_TYPE_UNKNOWN || !parent) return false;
    if (this._filter) {
      const label = this.getLabel(fileNode);
      if (parent.url === rootDir && fileNode.fileType === FILE_TYPE_DIR) {
        const children = fileNode.getChildren();
        for (let i = 0; i < children.length; i++) {
          const child = children.get(i);
          if (this.isVisible(child)) return true;
        }
        return false;
      }
      if (parent.getParent?.().url === rootDir &&
        fileNode.fileType !== FILE_TYPE_DIR) {
        return label?.indexOf?.(this._filter) >= 0
      }
    }
    return parent.url === rootDir && fileNode.fileType === FILE_TYPE_DIR ||
      parent.getParent?.()?.url === rootDir &&
      fileNode.fileType !== FILE_TYPE_DIR && !!parent.expanded;
  }

  adjustTranslateX() {
    return 0
  }

  adjustTranslateY(dy) {
    if (!this.contentHeight) return 0;
    const rect = this.getViewRect(),
      _y = rect.height - this.contentHeight;
    if (dy >= 0 || _y >= 0) {
      return 0
    } else if (dy > _y) {
      return dy;
    }
    return _y;
  }

  getImage(fileNode) {
    if (fileNode.getImage) {
      if (fileNode.fileType === FILE_TYPE_DIR) {
        return "accordion-title";
      }
      return fileNode.getImage();
    }
  }

  doLayout() {
    if (this._lastWidth !== this.getWidth() ||
      this._lastHeight !== this.getHeight() ||
      this._lastFileSize !== this.getFileSize()
    ) {
      this._doLayoutLater = false;
      this.redraw();
      const dirs = this.dirs = [],
        nodes = this.nodes = [],
        rects = this.bottomRects = [];
      this.dm().each(fileNode => {
        if (this.isVisible(fileNode) && fileNode.fileType === FILE_TYPE_DIR) {
          dirs.push(fileNode);
        }
      });
      const width = this._lastWidth = this.getWidth(),
        height = this._titleHeight;
      let y = 0;
      this._lastHeight = this.getHeight();
      this._lastFileSize = this._fileSize;
      if (this._expandIds) {
        this.dirs.forEach(dir => {
          dir.expanded = this._expandIds.indexOf(dir.getId()) >= 0
        });
        delete this._expandIds;
      }
      dirs.forEach(dir => {
        dir.setAnchor(0, 0);
        dir.p(0, y);
        dir.setSize(width, height);
        dir.s("label", null);
        y += height;
        const items = [];
        dir.getChildren().each(child => {
          if (this.isVisible(child)) {
            items.push(child);
            nodes.push(child)
          }
        });
        y = this.layoutChildren(items, y);
        if (dir.expanded) {
          rects.push({
            x: 0,
            y,
            width,
            height: 16
          });
          y += 16;
        }
      });
      this.contentHeight = y;
      this._layouted = true;
    }
  }

  layoutChildren(items, y) {
    if (items?.length === 0) return y;
    const fileGap = this._fileGap;
    if (this._layoutType === FILE_LAYOUT_LIST) {
      const rowHeight = this._rowHeight,
        h = Math.max(rowHeight - 4, 15);
      items.forEach(item => {
        item.setPosition(fileGap + h / 2 + config.accordionListIndent, y + 2 + h / 2);
        item.setSize(h, h);
        item.s({
          "label.position": 20,
          "label.offset.x": 3,
          "label.offset.y": 0,
          "label.max": undefined
        });
        y += rowHeight;
      });
      return y;
    }
    const w = this.getWidth(),
      fileSize = this._fileSize,
      padding = this._filePadding,
      max = fileSize + 2 * padding,
      _w = fileSize + fileGap + 2 * padding,
      _h = fileSize + fileGap + 16 + 2 * padding;
    let _x = fileGap,
      _y = y + fileGap,
      i = 0;
    items.forEach((item, index) => {
      item.setPosition(_x + max / 2, _y + max / 2);
      item.setSize(fileSize, fileSize);
      item.s({
        "label.position": 31,
        "label.offset.x": 0,
        "label.offset.y": 2 + padding,
        "label.max": max
      });
      if ((i + 2) * _w + fileGap > w) {
        _x = fileGap;
        if (index !== items.length - 1) {
          _y += _h;
        }
        i = 0;
      } else {
        _x += _w;
        i++;
      }
    });
    return _y + _h;
  }

  handleScroll(e) {
    let step = e.wheelDelta / 10;
    if (isFF && e.detail) {
      step = -e.detail;
    }
    if (isFF || e.wheelDelta !== e.wheelDeltaX) {
      this.translate(0, step);
    }
  }

  adjustZoom() {
    return 1;
  }

  _endDrag(e, info) {
    const tData = info.targetData;
    if (tData?.fileType === FILE_TYPE_DIR) {
      const dData = this.draggingData,
        moveFile = () => {
          if (this.isSelected(dData)) {
            this.sm().toSelection().each(function (p) {
              this.editor.moveFile(p, tData)
            })
          } else {
            this.editor.moveFile(dData, tData);
          }
          this.doLayout();
          this.redraw();
        };
      if (config.promptForMovingFile) {
        createAlert(
          getString("editor.move"),
          getString("editor.confirmmovefile"),
          moveFile,
          () => { }
        )
      } else {
        moveFile();
      }
    }
  }

  toDraggingDatas(e) {
    const list = [];
    if (this.isSelected(this.draggingData)) {
      this.sm().toSelection().each(function (p) {
        if (p.fileType !== FILE_TYPE_DIR) {
          list.push(p)
        }
      });
      e && list.reverse();
    } else {
      if (this.draggingData.fileType !== FILE_TYPE_DIR) {
        list.push(this.draggingData);
      }
    }
    return list;
  }

  invalidateModel() {
    this._lastWidth = null;
    this.iv();
  }

  ivm() {
    this.invalidateModel();
  }

  getContentRect() {
    return {
      x: 0,
      y: 0,
      width: this.getWidth(),
      height: this.contentHeight ?? 0
    }
  }

  onPropertyChanged(e) {
    super.onPropertyChanged(e);
    const map = {
      layoutType: true,
      fileSize: true,
      fileGap: true,
      rowHeight: true,
      filePadding: true,
      titleHeight: true
    };
    if (map[e.property]) {
      this.ivm();
    }
  }

  get expandIds() {
    const ids = [];
    this.dirs.forEach(function (dir) {
      if (dir.expanded) {
        ids.push(dir.getId());
      }
    });
    return ids;
  }

  set expandIds(value) {
    this._expandIds = value;
    this._lastWidth = null;
  }
}

msClass(Accordion, {
  ms_ac: ["filePadding", "titleHeight", "mutex"],
  _mutex: false,
  _filePadding: 6,
  _titleHeight: 36
});
