import config from "../config.js";

export default class BaseDropDown extends ht.widget.BaseDropDownTemplate {
  constructor(menu) {
    super();
    const gv = this.gv = new ht.graph.GraphView,
      dm = gv.dm();
    gv.setMovableFunc(function () {
      return false
    });
    gv.setZoomable(false);
    gv.setPannable(false);
    gv.setPannable(false);
    gv.setRectSelectable(false);
    gv.setScrollBarVisible(false);
    gv.sm().setSelectionMode("single");
    dm.setBackground(config.color_pane);
    for (let i = 1; i < 56; i++) {
      const node = new ht.Node;
      node.setTag(i);
      node.setRect(80, 60, 300, 160);
      node.s({
        label: "   " + i + "   ",
        "label.position": i,
        "label.offset.x": 0,
        "label.offset.y": 0,
        "label.color": ht.Default.labelColor,
        "label.font": "18px Arial",
        shape: "rect",
        "shape.background": null,
        "shape.border.width": 1,
        "select.width": 0,
        interactive: true
      });
      dm.add(node)
    }
    gv.sm().ms(() => {
      if (!this._openSetting && gv.sm().ld()) {
        menu.close();
      }
    });
    const color = ht.Default.brighter(config.color_select, 50);
    gv.mi(function (e) {
      const data = e.data,
        kind = e.kind;
      if (kind === "onEnter") {
        data._hover = true;
        data.iv();
      } else if (kind === "onLeave") {
        data._hover = false;
        data.iv();
      }
    });
    gv.getLabelBackground = function (data) {
      return gv.isSelected(data) ? config.color_select : data._hover ? color : null
    }
  }

  getView() {
    return this.gv.getView();
  }

  getValue() {
    const data = this.gv.sm().ld();
    return data ? data.s("label.position") : this._sourceValue;
  }

  getWidth() {
    return 360;
  }

  getHeight() {
    return 220;
  }

  onOpened(tag) {
    const gv = this.gv,
      data = gv.dm().getDataByTag(tag);
    this._openSetting = true;
    gv.sm().ss(data);
    this._openSetting = false;
    this._sourceValue = tag;
    gv.fitContent(false, 0)
  }

  onClosed() { }
}
