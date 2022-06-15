import { unionRect } from "../util/index.js";
import config from "../config.js";

export default class GraphView extends ht.graph.GraphView {
  constructor(dm) {
    super(dm);
  }

  adjustZoom(value) {
    if (value > config.maxZoom) {
      return config.maxZoom
    } else if (value < config.minZoom) {
      return config.minZoom;
    }
    return value;
  }

  getUnionNodeRect(items) {
    let rect = undefined;
    items = items._as || items;
    items.forEach(item => {
      item instanceof ht.Node && (rect = unionRect(rect, this.getNodeRect(item)))
    })
    return rect;
  }

  getCenterDatas(points) {
    this.validate();
    const src = this.getViewRect(),
      target = this.getUnionNodeRect(points);
    if (!src || !target || ht.Default.intersectsRect(src, target)) return null;
    const x = src.x + src.width / 2 - target.x - target.width / 2,
      y = src.y + src.height / 2 - target.y - target.height / 2;
    this.moveDatas(points, x, y);
    return { x, y };
  }

  getFullscreenDatas() {
    return null;
  }
}
