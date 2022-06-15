import { createItem, getString } from "../util";
import config from "./config3d";
import ContextMenu3d from "./ContextMenu3d.js";
import CreateEdgeInteractor3d from "./CreateEdgeInteractor3d.js";
import CreateNodeInteractor3d from "./CreateNodeInteractor3d.js";

export default class MainToolbar3d extends ht.widget.Toolbar {
  constructor(editor) {
    super()
    this.editor = editor;
    this.initMenu();
    this.createItems();
    this.enableToolTip();
  }

  initMenu() {
    this.editor.mainMenu = new ContextMenu3d(this.editor);
    const handler = e => {
      const menu = this.editor.mainMenu;
      menu.isShowing() && !menu.getView().contains(e.target) && menu.hide();
    };
    window.addEventListener("touchstart", handler, false);
    window.addEventListener("mousedown", handler, false)
  }

  createItems() {
    const items = [];
    items.push(this.createMenu());
    items.push(this.createEditItem());
    items.push(this.createCubeItem());
    items.push(this.createCylinderItem());
    items.push(this.createSphereItem());
    items.push(this.createWallItem());
    items.push(this.createDoorWindowItem());
    items.push(this.createFloorItem());
    items.push(this.createPipelineItem());
    this.setItems(items);
  }

  createMenu() {
    const item = createItem("menu", getString("editor.menu"), "editor.menu");
    item.action = (x, y, e) => {
      if (!this.editor.mainMenu.isShowing()) {
        this.editor.mainMenu.showOnView(this, 4, 20);
        e.preventDefault();
        e.stopPropagation();
      }
    };
    return item;
  }

  createEditItem() {
    return this.editor.createSceneItem("edit", getString("editor.edit"), "editor.edit")
  }

  createWallItem() {
    const bgColor = config.color_data_background,
      transparentColor = config.color_transparent;
    return this.editor.createSceneItem("wall",
      getString("editor.wall"), "editor.wall",
      new CreateEdgeInteractor3d(this.editor, function (points, segments) {
        const shape = new ht.Shape;
        shape.setTall(280);
        shape.setThickness(14);
        shape.setElevation(shape.getTall() / 2);
        shape.setPoints(points);
        shape.setSegments(segments);
        shape.s({
          "all.color": bgColor,
          "shape.background": null,
          "shape.border.width": shape.getThickness(),
          "shape.border.color": transparentColor
        });
        return shape;
      }))
  }

  createDoorWindowItem() {
    return this.editor.createSceneItem("doorWindow",
      getString("editor.doorwindow"), "editor.doorWindow",
      new CreateNodeInteractor3d(this.editor, function () {
        var dw = new ht.DoorWindow;
        dw.s({ "all.color": config.color_data_background });
        return dw;
      }, true));
  }

  createFloorItem() {
    const bgColor = config.color_data_background,
      transparentColor = config.color_transparent;
    return this.editor.createSceneItem("floor",
      getString("editor.floor"), "editor.floor",
      new CreateEdgeInteractor3d(this.editor, function (points, segments) {
        const shape = new ht.Shape;
        shape.setTall(10);
        shape.setThickness(-1);
        shape.setElevation(-shape.getTall() / 2), shape.setPoints(points);
        shape.setSegments(segments);
        shape.s({
          "shape3d.color": bgColor,
          "shape3d.top.color": bgColor,
          "shape3d.bottom.color": bgColor,
          "shape.background": transparentColor
        });
        shape.setAnchor3d(.5, 0, .5);
        return shape;
      }, true));
  }

  createPipelineItem() {
    const bgColor = config.color_data_background,
      transparentColor = config.color_transparent;
    return this.editor.createSceneItem("pipeline",
      getString("editor.pipeline"), "editor.pipeline",
      new CreateEdgeInteractor3d(this.editor, function (points, segments) {
        const polyline = new ht.Polyline;
        polyline.setPoints(points);
        polyline.setSegments(segments);
        polyline.setThickness(10);
        polyline.s({
          shape3d: "cylinder",
          "shape3d.color": bgColor,
          "shape3d.top.color": bgColor,
          "shape3d.bottom.color": bgColor,
          "shape.background": null,
          "shape.border.width": polyline.getThickness(),
          "shape.border.color": transparentColor
        });
        return polyline
      }));
  }

  createCubeItem() {
    return this.editor.createSceneItem("cube",
      getString("editor.cube"), "editor.cube",
      new CreateNodeInteractor3d(this.editor, function () {
        const node = new ht.Node;
        node.s({ "all.color": config.color_data_background });
        node.setAnchor3d(.5, 0, .5);
        return node;
      }, true));
  }

  createCylinderItem() {
    return this.editor.createSceneItem("cylinder",
      getString("editor.cylinder"), "editor.cylinder",
      new CreateNodeInteractor3d(this.editor, function () {
        const node = new ht.Node;
        node.s({
          shape3d: "cylinder",
          "shape3d.color": config.color_data_background
        });
        node.setAnchor3d(.5, 0, .5);
        return node;
      }, true));
  }

  createSphereItem() {
    return this.editor.createSceneItem("sphere",
      getString("editor.sphere"), "editor.sphere",
      new CreateNodeInteractor3d(this.editor, function () {
        var node = new ht.Node;
        node.s({
          shape3d: "sphere",
          "shape3d.color": config.color_data_background
        });
        node.setAnchor3d(.5, 0, .5);
        return node;
      }, true));
  }
}
