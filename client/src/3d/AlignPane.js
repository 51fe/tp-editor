import { createButton, getString } from "../util/index.js";
import InspectorTool from "../pane/InspectorTool.js";
import FormPane from "../pane/FormPane.js";
import config from "./config3d";

export default class AlignPane extends FormPane {
  constructor(editor) {
    super()
    this.editor = editor;
    this.buttons = {};
    var items = [];
    items.push(this.createAlignBtn("cluster",
      getString("editor.align.cluster"), [{
        type: "shape",
        points: [5, 2, 11, 2, 5, 14, 11, 14],
        segments: [1, 2, 1, 2],
        borderWidth: 3,
        borderColor: config.color_select
      }, {
        type: "shape",
        points: [8, 5, 8, 11, 5, 8, 11, 8],
        segments: [1, 2, 1, 2],
        borderWidth: 1,
        borderColor: config.color_dark
      }]));
    items.push(this.createAlignBtn("distributeHorizontal",
      getString("editor.align.distributehorizontal"), [{
        type: "shape",
        points: [2, 2, 2, 14, 14, 2, 14, 14],
        segments: [1, 2, 1, 2],
        borderWidth: 1
      }, {
        type: "shape",
        points: [8, 5, 8, 11],
        borderWidth: 3
      }]));
    items.push(this.createAlignBtn("distributeVertical",
      getString("editor.align.distributevertical"), [{
        type: "shape",
        points: [2, 2, 14, 2, 2, 14, 14, 14],
        segments: [1, 2, 1, 2],
        borderWidth: 1
      }, {
        type: "shape",
        points: [5, 8, 11, 8],
        borderWidth: 3
      }]));
    items.push(this.createAlignBtn("alignLeft",
      getString("editor.align.alignleft"), [{
        type: "shape",
        points: [2, 2, 2, 14],
        segments: [1, 2],
        borderWidth: 1
      }, {
        type: "shape",
        points: [5, 5, 13, 5, 5, 11, 8, 11],
        segments: [1, 2, 1, 2],
        borderWidth: 3
      }]));
    items.push(this.createAlignBtn("alignHorizontal",
      getString("editor.align.alignhorizontal"), [{
        type: "shape",
        points: [8, 2, 8, 14],
        segments: [1, 2],
        borderWidth: 1
      }, {
        type: "shape",
        points: [3, 5, 13, 5, 6, 11, 10, 11],
        segments: [1, 2, 1, 2],
        borderWidth: 3
      }]));
    items.push(this.createAlignBtn("alignRight",
      getString("editor.align.alignright"), [{
        type: "shape",
        points: [14, 2, 14, 14],
        segments: [1, 2],
        borderWidth: 1
      }, {
        type: "shape",
        points: [3, 5, 11, 5, 11, 11, 8, 11],
        segments: [1, 2, 1, 2],
        borderWidth: 3
      }]));
    items.push(this.createAlignBtn("alignTop",
      getString("editor.align.aligntop"), [{
        type: "shape",
        points: [2, 2, 14, 2],
        segments: [1, 2],
        borderWidth: 1
      }, {
        type: "shape",
        points: [5, 5, 5, 13, 11, 5, 11, 8],
        segments: [1, 2, 1, 2],
        borderWidth: 3
      }]));
    items.push(this.createAlignBtn("alignVertical",
      getString("editor.align.alignvertical"), [{
        type: "shape",
        points: [2, 8, 14, 8],
        segments: [1, 2],
        borderWidth: 1
      }, {
        type: "shape",
        points: [5, 3, 5, 13, 11, 6, 11, 10],
        segments: [1, 2, 1, 2],
        borderWidth: 3
      }]));
    items.push(this.createAlignBtn("alignBottom",
      getString("editor.align.alignbottom"), [{
        type: "shape",
        points: [2, 14, 14, 14],
        segments: [1, 2],
        borderWidth: 1
      }, { type: "shape", points: [5, 3, 5, 11, 11, 11, 11, 8], segments: [1, 2, 1, 2], borderWidth: 3 }]));
    var ratio = .1,
      ratios = [ratio, ratio, ratio, ratio, ratio, ratio, ratio, ratio, ratio];
    this.addRow(items, ratios);
    this.updateItems();
    this.editor.sm.ms(() => {
      return this.updateItems();
    });
  }

  createAlignBtn(label, toolTip, items) {
    items.forEach(item => {
      item.borderCap = "round";
    });
    items[0].borderColor = items[0].borderColor || config.color_dark;
    items[1].borderColor = items[1].borderColor || config.color_select;
    const icon = { width: 16, height: 16, fitSize: true, comps: items };
    return this.buttons[label] = createButton(null, toolTip, icon, () => {
      const prefix = 'align',
        direction = label.substring(5);
      if (label?.startsWith(prefix)) {
        this[prefix](direction);
      } else {
        this[label]();
      }
    })
  }

  updateItems() {
    var items = [];
    this.editor.sm.each(function (e) {
      e instanceof ht.Node && items.push(e);
    });
    if (items.length > 2) {
      this.buttons.cluster.setDisabled(false);
      this.buttons.distributeHorizontal.setDisabled(false);
      this.buttons.distributeVertical.setDisabled(false);
      this.buttons.alignLeft.setDisabled(false);
      this.buttons.alignHorizontal.setDisabled(false);
      this.buttons.alignRight.setDisabled(false);
      this.buttons.alignTop.setDisabled(false);
      this.buttons.alignVertical.setDisabled(false);
      this.buttons.alignBottom.setDisabled(false);
    } else if (items.length > 1) {
      this.buttons.distributeHorizontal.setDisabled(true);
      this.buttons.distributeVertical.setDisabled(true);
      this.buttons.alignLeft.setDisabled(false);
      this.buttons.alignHorizontal.setDisabled(false);
      this.buttons.alignRight.setDisabled(false);
      this.buttons.alignTop.setDisabled(false);
      this.buttons.alignVertical.setDisabled(false);
      this.buttons.alignBottom.setDisabled(false);
    } else {
      this.buttons.cluster.setDisabled(true);
      this.buttons.distributeHorizontal.setDisabled(true);
      this.buttons.distributeVertical.setDisabled(true);
      this.buttons.alignLeft.setDisabled(true);
      this.buttons.alignHorizontal.setDisabled(true);
      this.buttons.alignRight.setDisabled(true);
      this.buttons.alignTop.setDisabled(true);
      this.buttons.alignVertical.setDisabled(true);
      this.buttons.alignBottom.setDisabled(true)
    }
  }

  getUnionRect(rect) {
    return this.editor.gv ? this.editor.gv.getUnionNodeRect(rect) : null
  }

  isSelected(data) {
    return this.editor.sm.contains(data)
  }

  hasSelectedGroupParent() {
    return InspectorTool.prototype.hasSelectedGroupParent.apply(this, arguments);
  }

  hasSelectedHost() {
    return InspectorTool.prototype.hasSelectedHost.apply(this, arguments);
  }

  cluster() {
    var selection = this.selection;
    if (selection.length) {
      this.editor.beginTransaction();
      this.align("Horizontal");
      this.align("Vertical");
      let min = undefined,
        max = undefined;
      selection.forEach(function (node) {
        if (min === undefined) {
          min = max = node.getElevation();
        } else {
          min > node.getElevation() && (min = node.getElevation());
          max < node.getElevation() && (max = node.getElevation());
        }
      });
      selection.sort(function (x, y) {
        return x.getElevation() - y.getElevation()
      });
      const gap = (max - min) / (selection.length - 1);
      for (let i = 1; i < selection.length - 1; i++) {
        selection[i].setElevation(min + i * gap);
      }
      this.editor.endTransaction();
    }
  }

  distributeHorizontal() {
    InspectorTool.prototype.distributeHorizontal().call(this);
  }

  distributeVertical() {
    InspectorTool.prototype.distributeVertical.call(this);
  }

  align(direction) {
    InspectorTool.prototype.align.call(this, direction);
  }

  get selection() {
    var items = [];
    this.editor.sm.each(item => {
      if (item instanceof ht.Node) {
        if (!this.hasSelectedGroupParent(item.getParent()) && !this.hasSelectedHost(item)) {
          items.push(item);
        }
      }
    });
    return items;
  }
}
