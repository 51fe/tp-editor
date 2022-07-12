import {
  FILE_LAYOUT_LIST, FILE_TYPE_ASSET, FILE_TYPE_DIR,
  FILE_TYPE_DISPLAY, FILE_TYPE_SCENE, FILE_TYPE_UI, FILE_LAYOUT_TiLE
} from "../constants.js";
import config from "../config.js";
import {
  getFileExt, getString, getTargetElement, getTip, isEnter, isEsc,
  layout, msClass, removeHTML, trimExtension
} from "../util/index.js";
import GraphView from "./GraphView.js";
import DisplayTree from "./DisplayTree.js";
import Interactor from "../interactor/index.js";

class ExplorerView extends GraphView {
  constructor(explorer, editable = true) {
    super(explorer.dataModel);
    this.explorer = explorer;
    this.editable = editable;
    this.editor = explorer.editor;
    this.getHScrollBar().style.display = "none";
    this.setMaxFileSize(config.imageSize);
    this.enableToolTip();
    this.setPannable(false);
    this.setInteractors([
      new ht.graph.ScrollBarInteractor(this),
      new Interactor(this),
      new ht.graph.DefaultInteractor(this),
      new ht.graph.TouchInteractor(this, { editable: false })
    ]);
    this.mi(e => {
      const kind = e.kind;
      "beginScroll" === kind ? this.disableToolTip() : "endScroll" === kind && this.enableToolTip()
    });
  }

  getToolTip(e) {
    const data = this.getDataAt(e);
    if (data) {
      if (this._filter) {
        return data.url;
      }
      return this.getLabel(data);
    }
    return null;
  }

  getLabel(data) {
    return getString("url:" + data.url, true) || this.getEditingLabel(data);
  }

  isEditable(data) {
    return this.editable && data?.a("editable") !== false;
  }

  getEditingLabel(data) {
    return data.s("label") || data.getName();
  }

  rename(data, name) {
    this.editor.renameFile(data, name, function () {
      if (data.s("label")) {
        data.s("label", name);
      } else {
        data.setName(name);
      }
    })
  }

  handleDelete() {
    if (this.editable && config.removeFileByKeyboardEnabled) {
      this.explorer.deleteSelection(this);
    }
  }

  beginEditing(data) {
    const params = { data, url: data.url };
    this.editor.fireEvent("fileRenaming", params);
    if (!params.preventDefault) {
      this.cancelEditing();
      this.makeVisible(data);
      this.validate();
      const ui = this.getDataUI(data);
      let isAccordionMode = false,
        rect = undefined;
      if (this.explorer.isAccordionMode() && data.fileType === FILE_TYPE_DIR) {
        rect = data.getRect();
        isAccordionMode = true;
      } else if (ui?.labelInfo) {
        rect = ui.labelInfo.rect;
      }
      if (rect) {
        let x = undefined,
          y = undefined,
          width = undefined,
          height = undefined;
        if (isAccordionMode) {
          x = rect.x;
          y = rect.y;
          width = rect.width;
          height = rect.height;
        } else if (this._layoutType === FILE_LAYOUT_LIST) {
          x = this._rowHeight;
          y = data.p().y - this._rowHeight / 2;
          width = this.getWidth() - x;
          height = this._rowHeight;
        } else {
          rect = ui.labelInfo.rect || data.getRect();
          x = data.p().x - data.getWidth() / 2;
          y = rect.y;
          width = data.getWidth();
          height = rect.height;
        }
        y += this.ty();
        this._currentEditor = new ht.widget.TextField;
        this._currentEditor.data = data;
        const el = this._currentEditor.getElement();
        let label = this.getEditingLabel(data);
        if (data.fileType === FILE_TYPE_ASSET) {
          this._editingExtension = getFileExt(label);
          label = trimExtension(label);
        }
        el.value = label ?? "";
        el.onblur = () => {
          this.endEditing();
        };
        el.onkeydown = e => {
          if (isEnter(e)) {
            this.endEditing();
          } else if (isEsc(e)) {
            this.cancelEditing();
          }
        };
        this.getView().appendChild(this._currentEditor.getView());
        layout(this._currentEditor, x, y, width, height);
        this._currentEditor.setFocus();
        ht.Default.callLater(el.select, el);
      }
    }
  }

  endEditing() {
    const editor = this._currentEditor;
    if (editor) {
      this.rename(editor.data, editor.getValue() + (this._editingExtension || ""));
      delete this._currentEditor;
      delete this._editingExtension;
      removeHTML(editor.getView());
      this.redraw();
    }

  }

  cancelEditing() {
    const editor = this._currentEditor;
    if (editor) {
      delete this._currentEditor;
      removeHTML(editor.getView());
      this.redraw();
    }
  }

  _clearDragInfo() {
    this.editor.dnd.hideTip();
    if (this._dragInfo) {
      this._dragInfo = null;
      this.redraw();
    }
  }

  handleDragAndDrop(e, state) {
    if (state === "prepare") {
      this._clearDragInfo();
      return;
    }
    if (state === "begin") {
      const data = this.draggingData;
      if (data.fileType === FILE_TYPE_DISPLAY) {
        ht.ui && ht.ui.DragHelper.doDrag(this, {
          "a:clazz": "ht.ui.UIGraphView",
          "a:initProps": { disableInit: true, url: data.url }
        }, {
          width: 10,
          height: 0,
          comps: []
        }, 0, 0);
      } else if (data.fileType === FILE_TYPE_SCENE) {
        ht.ui && ht.ui.DragHelper.doDrag(this, {
          "a:clazz": "ht.ui.UIGraph3dView",
          "a:initProps": { disableInit: true, url: data.url }
        }, {
          width: 10,
          height: 0,
          comps: []
        }, 0, 0);
      } else if (data.fileType === FILE_TYPE_UI) {
        ht.ui && ht.ui.DragHelper.doDrag(this, { "a:clazz": data.url }, {
          width: 10,
          height: 0,
          comps: []
        }, 0, 0);
      }
      this._dragInfo = { tip: getTip(this), view: this };
    }
    const info = this._dragInfo;
    if (info) {
      const dnd = this.editor.dnd;
      if (["begin", "between"].includes(state)) {
        if (this.getView().contains(getTargetElement(e))) {
          info.inView = true;
          this._dragging(e, info);
          dnd.clearDropView(e, info);
        } else {
          info.inView && this.redraw();
          info.inView = false;
          dnd.crossDrag(e, info);
        }
        dnd.showTip(info.tip, e);
        return;
      }
      if (state === "end") {
        if (info.inView) {
          this._endDrag(e, info)
        } else {
          dnd.crossDrop(e, info);
        }
        this._clearDragInfo();
        return;
      } else if (state === "cancel") {
        if (!info.inView) {
          dnd.crossCancel(e, info)
        }
        this._clearDragInfo();
        return;
      }
      return undefined;
    }
  }

  _dragging(e, inro) {
    if (this.editable) {
      const data = this.getDataAt(e);
      if (data?.fileType === FILE_TYPE_DIR) {
        inro.targetData = data;
      } else {
        inro.targetData = null;
        this.autoScroll(e);
        this.redraw();
      }
    }
  }

  _endDrag() { }

  handleSelectionChange(e) {
    super.handleSelectionChange(e);
    this.redraw();
  }

  handleCrossDrag(e, state, info) {
    if (this.editable) {
      if (["exit", "cancel"].includes(state)) {
        this._crossDragInfo = null;
        this.redraw();
        return;
      }
      if (["enter", "over"].includes(state)) {
        this._crossDragInfo || (this._crossDragInfo = {});
        this._dragging(e, this._crossDragInfo);
        return;
      }
      if ("drop" === state) {
        let url = this.explorer.currentDir;
        if (this._crossDragInfo.targetData) {
          url = this._crossDragInfo.targetData.url
        }
        const params = { url, event: e };
        this.editor.fireEvent("explorerCrossDrop", params);
        params.preventDefault || this._endCrossDrag(e, info);
        this._crossDragInfo = null;
        this.redraw();
        return;
      }
    }
  }

  _endCrossDrag(e, info) {
    if (this.editable && this._crossDragInfo) {
      let targetData = this._crossDragInfo.targetData;
      if (targetData?.fileType !== FILE_TYPE_DIR) {
        targetData = this.dm().sm().ld();
      }
      if (targetData) {
        const view = info.view;
        if (this.explorer.rootDir === "displays" && view instanceof DisplayTree) {
          this.handleDisplayTreeDrop(view, targetData);
        }
        if (view === this.editor.dndFromOutside) {
          this.editor.dropLocalFileOnDir(e, targetData);
        }
      }
    }
  }

  validateImpl() {
    document.body.contains(this.getView()) && super.validateImpl();
  }
}

msClass(ExplorerView, {
  ms_ac: ["layoutType", "fileSize", "fileGap", "rowHeight", "maxFileSize", "filter"],
  _fileRect: { x: 0, y: 0, width: 0, height: 0 },
  _layoutType: FILE_LAYOUT_TiLE,
  _fileSize: 50,
  _fileGap: 6,
  _rowHeight: 21,
  _maxFileSize: 200
});

export default ExplorerView;
