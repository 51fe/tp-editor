import config from "../config.js";

export default class BaseOverview extends ht.graph.Overview {
  constructor(gv) {
    super(gv);
    this.getView().style.background = config.color_pane_dark;
    this.setMaskBackground(null);
    this.setContentBorderColor(null);
    this.setContentBackground("white");
    this.getMask().style.border = config.color_select + " solid 1px";
  }
}
