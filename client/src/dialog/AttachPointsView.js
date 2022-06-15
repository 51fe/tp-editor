
import config from "../config.js";
import { getString } from "../util/index.js";
import FormPane from "../pane/FormPane.js";
import TablePane from "../pane/TablePane.js";
import SplitView from "../view/SplitView.js";
import Dialog from "./index.js";

export default class AttachPointsView extends Dialog {
  constructor(editor) {
    super();
    this.editor = editor;
  }

  init() {
    const dm = this.dm = new ht.DataModel,
      gv = this.gv = new ht.graph.GraphView(dm),
      rightFormPane = this.rightFormPane = new FormPane,
      splitView = this.splitView = new SplitView(gv, rightFormPane, "h", .6),
      node = this.targetNode = new ht.Node;
    node.setAnchor(0, 0);
    node.p(0, 0);
    node.s("2d.selectable", false);
    gv.dm().add(node);
    gv.setEditable(true);
    gv.addBottomPainter(function (g) {
      const vr = this.getViewRect();
      g.fillStyle = "#cbd3d8";
      g.fillRect(vr.x, vr.y, vr.width, vr.height);
      const rect = node.getRect();
      g.fillStyle = "#fff";
      g.fillRect(rect.x, rect.y, rect.width, rect.height)
    });
    const buttons = [{
      label: getString("editor.ok"), action: () => {
        this.editor.dm.a("attachPoints", this.toPointsData());
        this.hide();
      }
    }, {
      label: getString("editor.cancel"), action: () => {
        this.hide();
      }
    }];
    this.setConfig({
      title: "吸附点",
      content: splitView,
      closable: true,
      draggable: true,
      maximizable: true,
      resizeMode: "wh",
      buttons,
      width: config.attachPointsViewSize.width,
      height: config.attachPointsViewSize.height
    });
    this.addPane();
    dm.md(e => {
      if (e.property === "position" && e.data !== node) {
        const data = e.data,
          offsetX = data.a("offsetX"),
          offsetY = data.a("offsetY"),
          w = e.newValue.x - offsetX,
          h = e.newValue.y - offsetY;
        data.a({
          x: parseFloat((w / node.getWidth()).toFixed(2)),
          y: parseFloat((h / node.getHeight()).toFixed(2))
        })
      }
    });
    gv.mp(e => {
      if (e.property === "zoom") {
        const value = 1 / gv.getZoom();
        dm.each(data => {
          data !== node && data.setScale(value, value)
        })
      }
    });
    this._init = true;
  }

  addPane() {
    const pane = new TablePane(this.dm),
      tv = this.tableView = pane.getTableView();
    tv.isVisible = target => {
      return target !== this.targetNode
    };
    tv.setEditable(true);
    pane.getView().style.border = config.color_line + " solid 1px";
    pane.addColumns([
      this.getColumn("x", getString("editor.attach.x"), 70, (data, column, value) => {
        const w = this.targetNode.getWidth();
        data.setX(w * value + (data.a("offsetX") || 0));
      }),
      this.getColumn("y", getString("editor.attach.y"), 70, (data, column, value) => {
        const h = this.targetNode.getHeight();
        data.setY(h * value + (data.a("offsetY") || 0));
      }),
      this.getColumn("offsetX", getString("editor.attach.offsetX"), 70, (data, column, value) => {
        data.a("offsetX", value);
        const w = this.targetNode.getWidth();
        data.setX(w * data.a("x") + value);
      }),
      this.getColumn("offsetY", getString("editor.attach.offsetY"), 70, (node, column, value) => {
        node.a("offsetY", value);
        const h = this.targetNode.getHeight();
        node.setY(h * node.a("y") + value);
      })]);
    const columns = config.customAttachPointsColumns;
    if (columns && columns.length) {
      const customColumns = this.customColumns = columns.map(column => {
        return this.getColumn(column.name, column.displayName, column.width || 70, column.setter, "string")
      });
      pane.addColumns(customColumns)
    }
    this.rightFormPane.addRow([pane], [.1], 200);
    this.rightFormPane.addRow([{
      button: {
        icon: "editor.add",
        toolTip: getString("editor.add"),
        onClicked: () => {
          this.add();
        }
      }
    }, {
      button: {
        icon: "editor.delete",
        toolTip: getString("editor.delete"),
        onClicked: () => {
          this.remove();
        }
      }
    }], [20, 20], 20)
  }

  add(x = 0, y = 0, offsetX = 0, offsetY = 0, source = {}) {
    const node = new ht.Node,
      scale = 1 / this.gv.getZoom();
    node.setImage("editor.attachPoint");
    node.setScale(scale, scale);
    node.a({
      x,
      y,
      offsetX,
      offsetY
    });
    node.s({ "2d.editable": false });
    if (source) {
      for (const key in source) {
        if (["x", "y", "offsetX", "offsetY"].includes(key)) {
          node.a(key, source[key]);
        }
      }
    }
    const w = this.targetNode.getWidth(),
      h = this.targetNode.getHeight();
    node.p(x * w + offsetX, y * h + offsetY);
    this.gv.dm().add(node);
    return node;
  }

  remove() {
    const selections = this.dm.sm().getSelection().toArray();
    for (let i = selections.length - 1; i >= 0; i--) {
      this.dm.remove(selections[i]);
    }
  }

  getColumn(name, displayName, width, setValue, valueType = "number") {
    return {
      name,
      tag: name,
      width,
      displayName,
      align: "center",
      editable: true,
      valueType,
      getValue: data => {
        return data.a(name);
      },
      setValue
    }
  }

  toPointsData() {
    this.dm.toDatas(data => {
      return data !== this.targetNode
    }).toArray().map(data => {
      const point = { x: data.a("x"), y: data.a("y") };
      data.a("offsetX") && (point.offsetX = data.a("offsetX"));
      data.a("offsetY") && (point.offsetY = data.a("offsetY"));
      this.customColumns?.forEach?.(column => {
        const name = data.a(column.name);
        name && (point[column.name] = name)
      });
      return point;
    })
  }

  cancel() {
    this.hide();
  }

  createNodeByPointData() {
    const points = this.editor.dm.a("attachPoints");
    Array.isArray(points) && points.forEach(point => {
      this.add(point.x, point.y, point.offsetX, point.offsetY, point)
    })
  }

  show(image) {
    this._init || this.init();
    this.dm.clear();
    this.dm.add(this.targetNode);
    this.targetNode.setImage(image);
    this.createNodeByPointData();
    super.show(this.editor.root);
    this.gv.fitContent(true)
  }
}
