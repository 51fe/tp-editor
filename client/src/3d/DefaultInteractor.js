export default class DefaultInteractor extends ht.graph3d.DefaultInteractor {
  constructor() {
    super();
    this.keep = true;
  }

  handle_touchstart(e) {
    super.handle_touchstart(e);
    var state = this.getState();
    const states = ["edit_tx", "edit_ty", "edit_tz", "edit_rx",
      "edit_ry", "edit_rz", "edit_sx", "edit_sy", "edit_sz"];
    if (!(["move", "select"].includes(state) || states.includes(state))) {
      var isLeftButton = ht.Default.isLeftButton(e),
        isMiddleButton = ht.Default.isMiddleButton(e),
        count = ht.Default.getTouchCount(e) === 1;
      (isLeftButton || isMiddleButton) && count && this.setState("pan");
    }
  }
}
