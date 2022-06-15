export function addTab(tabView, name, view, selected) {
  var tab = new ht.Tab;
  tab.setName(name);
  tab.setView(view);
  tabView.getTabModel().add(tab);
  selected && tabView.getTabModel().sm().ss(tab);
  return tab;
}

export function getU(name) {
  return function (node) {
    let value = node.s(name);
    return value?.[0] ?? 1;
  }
}

export function setU(name) {
  return function (node, x) {
    let value = node.s(name);
    if (!value) {
      value = node.s("all.uv.scale")
    }
    node.s(name, [x, value?.[1] ?? 1])
  }
}

export function getV(name) {
  return function (node) {
    let value = node.s(name);
    if (!value) {
      value = node.s("all.uv.scale")
    }
    return value?.[1] ?? 1;
  }
}

export function setV(name) {
  return function (data, y) {
    var value = data.s(name);
    value || (value = data.s("all.uv.scale"));
    data.s(name, [value?.[0] ?? 1, y])
  }
}

export function setNull(name) {
  return function (shape) {
    shape.s(name, null);
  }
}
