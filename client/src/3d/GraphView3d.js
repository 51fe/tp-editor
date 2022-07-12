import { getString, positionImg } from "../util";
import config3d from "./config3d";

export default class GraphView3d extends ht.graph.GraphView {
  constructor(editor) {
    super(editor.dm);
    this.editor = editor;
    this._topCanvas = ht.Default.createCanvas();
    this._topDiv = ht.Default.createDiv();
    this._view.insertBefore(this._topCanvas, this._scrollBarDiv);
    this._view.insertBefore(this._topDiv, this._scrollBarDiv);
    this.initMenu();
    this.mi(e => {
      if (["prepareMove", "prepareEdit"].includes(e.kind) && e.event.altKey) {
        this.editor.copy();
        this.editor.paste();
        this.validate();
      }
    });
    this.editable = true;
  }

  isInteractive() {
    return false;
  }

  initMenu() {
    const items = [];
    this.menu = new ht.widget.ContextMenu(items);
    items.push({
      id: "copy",
      label: getString("editor.copy"),
      action: () => {
        this.editor.copy();
      },
      visible: function () {
        return !!this.editor.ld;
      }
    });
    items.push({
      id: "paste",
      label: getString("editor.paste"),
      action: () => {
        this.editor.paste();
      },
      visible: function () {
        return this.editable && this.editor.hasCopyInfo();
      }
    });
    const isSelected = () => {
      return this.sm().size() > 0;
    };
    const isSelectedAll = () => {
      for (let i = 0; i < this.sm().size(); i++) {
        const sel = this.sm().getSelection().get(i);
        if (sel instanceof ht.Block && !(sel instanceof ht.RefGraph)) return true;
      }
      return false;
    };
    items.push({
      separator: true,
      visible: function () {
        return this.editable && (isSelected() || isSelectedAll());
      }
    });
    items.push({
      id: "block",
      label: getString("editor.block"),
      action: () => {
        this.editor.block()
      }, visible: function () {
        return this.editable && isSelected();
      }
    });
    items.push({
      id: "unblock",
      label: getString("editor.unblock"),
      action: () => {
        this.editor.unblock();
      },
      visible: function () {
        return this.editable && isSelectedAll();
      }
    });
    this.menu.addTo(this.getView());
    this.editor.menus.push(this.menu);
  }

  getUnionNodeRect(rect) {
    let rect1 = undefined;
    rect = rect._as || rect;
    rect.forEach(item => {
      if (item instanceof ht.Node) {
        rect1 = ht.Default.unionRect(rect1, this.getNodeRect(item));
      }
    });
    return rect1;
  }

  getImage(shape) {
    const name = shape.s("shape3d");
    if (name) {
      const model = ht.Default.getShape3dModel(name);
      if (model?.json?.image) return model.json.image;
      if (["sphere", "cylinder"].includes(name)) return "editor.sphere.image";
    }
    const image = shape.getImage();
    if (image && image !== "node_image") {
      return image;
    } else if (shape.s("shape3d.image")) {
      return shape.s("shape3d.image");
    }
    return "editor.cube.image";
  }

  updateComponent(data) {
    if (this.isEditable(data)) {
      if (data instanceof ht.Edge) {
        return data.s("select.width");
      }
    }
    return 0;
  }

  isDroppable(e, data) {
    return [
      this.editor.models.list,
      this.editor.symbols.list,
      this.editor.assets.list
    ].includes(data.view);
  }

  removeDragImage() {
    if (this.dragImage) {
      ht.Default.removeHTML(this.dragImage);
      this.dragImage = null;
    }
  }

  handleCrossDrag(e, state, info) {
    const view = info.view,
      fileNode = view.draggingData;
    if (state === "enter") {
      this._topDiv.style.border = "solid " + config3d.color_select_dark + " 2px";
      if (!this.dragImage && fileNode && ["model", "symbol", "image"].includes(fileNode.fileType) &&
        ht.Default.getImage(fileNode.getImage()) !== ht.Default.getImage("editor.unknown")) {
        const size = config3d.dragImageSize;
        this.dragImage = ht.Default.toCanvas(fileNode.getImage(), size, size,
          "centerUniform", fileNode, info.view, null, ht.Default.devicePixelRatio);
        positionImg(e, this.dragImage);
        this.dragImage.style.opacity = config3d.dragImageOpacity;
        ht.Default.appendToScreen(this.dragImage);
      }
    } else if (["exit", "cancel"].includes(state)) {
      this._topDiv.style.border = "";
      this.removeDragImage();
    } else if (state === "over") {
      positionImg(e, this.dragImage);
    } else if (state === "drop") {
      this._topDiv.style.border = "";
      if (fileNode) {
        this.removeDragImage();
        this.sm().cs();
        if (view.handleDropToEditView) {
          view.handleDropToEditView(this, fileNode, this.lp(e), e)
        } else if (view.isSelected(fileNode)) {
          view.sm().toSelection().each(e => {
            this.addViewData(fileNode, e);
          })
        } else {
          this.addViewData(fileNode, e);
        }
      }
    }
  }

  addViewData(fileNode, e) {
    const shape3d = fileNode.getFileUUID(),
      ld = this.lp(e);
    if (fileNode.fileType === "model") {
      const node = new ht.Node;
      node.s({ shape3d });
      node.setAnchor3d(.5, 0, .5);
      node.setPosition(ld);
      this.dm().add(node);
      this.sm().ss(node);
    } else if (["symbol", "image"].includes(fileNode.fileType)) {
      const node = new ht.Node;
      node.s({
        shape3d: "billboard",
        "shape3d.image": shape3d,
        "texture.cache": false,
        autorotate: true,
        alwaysOnTop: false,
        fixSizeOnScreen: [-1, -1]
      });
      node.setAnchor3d(.5, 0, .5);
      node.p(ld);
      node.setImage(shape3d);
      this.dm().add(node);
      this.sm().ss(node);
    }
  }
}
