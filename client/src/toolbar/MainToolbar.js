import config from "../config.js";
import { getString, createItem } from "../util/index.js";
import Toolbar from "./index.js";
import MainMenu from "../menu/MainMenu.js";

export default class MainToolbar extends Toolbar {
  constructor(editor) {
    super();
    this.editor = editor;
    this.initMenu();
    this.createItems();
    this.enableToolTip();
  }

  initTab() {
    this.iv();
  }

  initMenu() {
    this.editor.mainMenu = new MainMenu(this.editor);
    const handler = e => {
      const menu = this.editor.mainMenu;
      menu.isShowing() && !menu.getView().contains(e.target) && menu.hide();
    };
    window.addEventListener("touchstart", handler, false);
    window.addEventListener("mousedown", handler, false);
  }

  createItems() {
    const items = [];
    this.createMenu(items);
    this.createEditItem(items);
    this.createDisplayItems(items);
    this.createSymbolItems(items);
    this.createSceneItems(items);
    this.setItems(items);
  }

  createMenu(items) {
    const item = createItem("menu", getString("editor.menu"), "editor.menu");
    item.action = (data, item, e) => {
      if (!this.editor.mainMenu.isShowing()) {
        this.editor.mainMenu.showOnView(this, 4, 20);
        e.preventDefault();
        e.stopPropagation();
      }
    };
    items.push(item);
  }

  createEditItem(items) {
    const editable = () => {
      return this.editor.currentView && this.editor.currentView.getState() === "edit"
    },
      item = createItem("edit", getString("editor.edit"), "editor.edit", editable);
    item.visible = () => {
      return (!this.editor.currentView || !this.editor.currentView.getPreferredSize) && this.editor.editable
    };
    item.action = () => {
      const currentView = this.editor.currentView;
      currentView && currentView.setState("edit");
    };
    items.push(item);
  }

  createDisplayItems(items) {
    const initData = type => {
      return data => {
        if (["Node", "SubGraph", "Edge"].includes(type)) {
          data.s({
            "edge.width": 1,
            "edge.color": config.color_data_border
          });
        } else if (type === "Group") {
          data.setExpanded(true);
        } else if (type === "arc") {
          data.s({
            shape: type,
            "shape.background": config.color_data_background,
            "shape.border.width": 1,
            "shape.border.color": config.color_data_border,
            "shape.arc.from": 0,
            "shape.arc.to": 4.1888
          });
        } else if (type === "Shape") {
          data.s({
            "shape.background": null,
            "shape.border.color": config.color_data_border,
            "shape.border.width": 1
          });
        } else if (type === "Text") {
          data.s("text", getString("editor.text"));
        } else {
          data.s({
            shape: type,
            "shape.background": config.color_data_background,
            "shape.border.width": 1,
            "shape.border.color": config.color_data_border
          });
        }
        this.editor.fireEvent("dataInited", { type, data, displayView: this.editor.displayView })
      }
    };
    items.push(this.editor.createDisplayItem("Shape", getString("editor.shape"), "editor.display.shape", ht.Shape, initData("Shape")));
    items.push(this.editor.createDisplayItem("Oval", getString("editor.oval"), "editor.display.oval", ht.Node, initData("oval")));
    items.push(this.editor.createDisplayItem("RoundRect", getString("editor.roundrect"), "editor.display.roundrect", ht.Node, initData("roundRect")));
    items.push(this.editor.createDisplayItem("Rect", getString("editor.rect"), "editor.display.rect", ht.Node, initData("rect")));
    items.push(this.editor.createDisplayItem("Polygon", getString("editor.polygon"), "editor.display.polygon", ht.Node, initData("polygon")));
    items.push(this.editor.createDisplayItem("Triangle", getString("editor.triangle"), "editor.display.triangle", ht.Node, initData("triangle")));
    items.push(this.editor.createDisplayItem("Star", getString("editor.star"), "editor.display.star", ht.Node, initData("star")));
    items.push(this.editor.createDisplayItem("Arc", getString("editor.arc"), "editor.display.arc", ht.Node, initData("arc")));
    items.push(this.editor.createDisplayItem("Text", getString("editor.text"), "editor.display.text", ht.Text, initData("Text")));
    items.push(this.editor.createDisplayItem("Node", getString("editor.node"), "editor.display.node", ht.Node, initData("Node")));
    items.push(this.editor.createDisplayItem("Group", getString("editor.group"), "editor.display.group", ht.Group, initData("Group")));
    items.push(this.editor.createDisplayItem("SubGraph", getString("editor.subgraph"), "editor.display.subgraph", ht.SubGraph, initData("SubGraph")));
    items.push(this.editor.createDisplayItem("Edge", getString("editor.edge"), "editor.display.edge", ht.Edge, initData("Edge")));
  }

  createSymbolItems(items) {
    items.push(this.editor.createSymbolItem("shape", getString("editor.shape"), "editor.symbol.shape", "shape"));
    items.push(this.editor.createSymbolItem("oval", getString("editor.oval"), "editor.symbol.oval", "oval"));
    items.push(this.editor.createSymbolItem("roundRect", getString("editor.roundrect"), "editor.symbol.roundrect", "roundRect"));
    items.push(this.editor.createSymbolItem("rect", getString("editor.rect"), "editor.symbol.rect", "rect"));
    items.push(this.editor.createSymbolItem("polygon", getString("editor.polygon"), "editor.symbol.polygon", "polygon"));
    items.push(this.editor.createSymbolItem("triangle", getString("editor.triangle"), "editor.symbol.triangle", "triangle"));
    items.push(this.editor.createSymbolItem("star", getString("editor.star"), "editor.symbol.star", "star"));
    items.push(this.editor.createSymbolItem("arc", getString("editor.arc"), "editor.symbol.arc", "arc"));
    items.push(this.editor.createSymbolItem("text", getString("editor.text"), "editor.symbol.text", "text"));
    items.push(this.editor.createSymbolItem("border", getString("editor.border"), "editor.symbol.border", "border"));
    items.push(this.editor.createSymbolItem("piechart", getString("editor.piechart"), "editor.symbol.piechart", "pieChart"));
    items.push(this.editor.createSymbolItem("onedimensionalcolumnchart", getString("editor.onedimensionalcolumnchart"), "editor.symbol.onedimensionalcolumnchart", "oneDimensionalColumnChart"));
    items.push(this.editor.createSymbolItem("columnchart", getString("editor.columnchart"), "editor.symbol.columnchart", "columnChart"));
    items.push(this.editor.createSymbolItem("linechart", getString("editor.linechart"), "editor.symbol.linechart", "lineChart"))
  }

  createSceneItems() { }
}
