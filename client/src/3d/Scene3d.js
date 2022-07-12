import config3d from "./config3d";
import { isImage, positionImg } from "../util/index.js";

export default class Scene3d extends ht.graph3d.Graph3dView {
  constructor(editor) {
    super(editor.dm)
    this.editor = editor;
    this.setEditable(true);
    this.topDiv = ht.Default.createDiv();
    this.getPostProcessing().setSerializable(false);
  }

  isInteractive() {
    return false;
  }

  handleDelete() {
    this.removeSelection();
  }

  getBrightness(node) {
    return node.s("brightness");
  }

  isDroppable(node, e) {
    return [this.editor.models.list, this.editor.symbols.list, this.editor.assets.list].includes(e.view);
  }

  removeDragImage() {
    if (this.dragImage) {
      ht.Default.removeHTML(this.dragImage);
      this.dragImage = null;
    }
  }

  handleCrossDrag(e, kind, info) {
    const view = info.view,
      data = view.draggingData;
    if (kind === "enter") {
      this._view.insertBefore(this.topDiv, this._scrollBarDiv);
      ht.Default.layout(this.topDiv, 0, 0, this.getWidth(), this.getHeight());
      this.topDiv.style.border = "solid " + config3d.color_select_dark + " 2px";
      if (!this.dragImage && ["model", "symbol", "image"].includes(data?.fileType) &&
        ht.Default.getImage(data?.getImage()) !== ht.Default.getImage("editor.unknown")) {
        const size = config3d.dragImageSize;
        this.dragImage = ht.Default.toCanvas(data.getImage(), size, size, "centerUniform",
          data, info.view, null, ht.Default.devicePixelRatio);
        positionImg(e, this.dragImage);
        this.dragImage.style.opacity = config3d.dragImageOpacity;
        ht.Default.appendToScreen(this.dragImage);
      }
    } else if (["exit", "cancel"].includes(kind)) {
      ht.Default.removeHTML(this.topDiv);
      this.removeDragImage();
    } else if (kind === "over") {
      positionImg(e, this.dragImage);
    } else if (kind === "drop") {
      ht.Default.removeHTML(this.topDiv);
      if (data) {
        this.removeDragImage();
        const points = this.getHitPosition(e);
        if (view.isSelected(data)) {
          view.sm().toSelection().each(item => {
            if (view.handleDropToEditView) {
              view.handleDropToEditView(this, item, points, e)
            } else {
              this.addViewData(item, points)
            }
          })
        } else if (view.handleDropToEditView) {
          view.handleDropToEditView(this, data, points, e);
        } else {
          this.addViewData(data, points);
        }
      }
    }
  }

  addViewData(data, points) {
    if (data) {
      const uuiD = data.getFileUUID(),
        fileType = data.fileType;
      if (fileType === 'model' || "symbol" === fileType || isImage(uuiD)) {
        const node = new ht.Node;
        if (fileType === 'model') {
          node.s({ shape3d: uuiD })
        } else if ("symbol" === fileType || isImage(uuiD)) {
          node.s({
            shape3d: "billboard",
            "shape3d.image": uuiD,
            "texture.cache": false,
            autorotate: true,
            alwaysOnTop: false,
            fixSizeOnScreen: [-1, -1]
          });
          node.setImage(uuiD);
        }
        node.setAnchor3d(.5, 0, .5);
        node.p3(points);
        node.s("wf.visible", "selected");
        this.dm().add(node), this.sm().ss(node);
      }
    }
  }

  toImage(img) {
    let w = this.getWidth(),
      h = this.getHeight();
    const size = config3d.imageSize || 400,
      mh = Math.max(w, h),
      ratio = size / mh;
    w = Math.floor(w * ratio);
    h = Math.floor(h * ratio);
    return this.toCanvas(img, w, h).toDataURL("image/png", 1)
  }

  invalidateAll(e, kind) {
    if (["imageLoaded", "modelLoaded"].includes(kind)) {
      const inspector = this.editor.inspector;
      if (inspector) {
        if (kind === "modelLoaded") {
          inspector.filterPropertiesLater()
        } else {
          inspector.invalidateProperties();
        }
        inspector.invalidateDataBindings?.();
      }
    }
    super.invalidateAll(e, kind);
  }
}
