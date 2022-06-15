export default class SplitView extends ht.widget.SplitView {
  constructor(leftView, rightView, orientation, position) {
    super(leftView, rightView, orientation, position);
    this.setTogglable(false);
  }
}
