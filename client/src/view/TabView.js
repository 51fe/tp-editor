export default class TabView extends ht.widget.TabView {
  constructor() {
    super();
  }

  add(name, view, selected, visible = true) {
    const tab = super.add(name, view, selected);
    tab.setVisible(visible);
    return tab;
  }
}