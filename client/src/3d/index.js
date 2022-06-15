import config from "./config3d.js";
import Editor3d from "./Editor3d.js";
"use strict";
ht.Default.handleUnfoundModel = function () {
  return ht.Default.createBoxModel();
};
const tpeditor3d = {
  config,
  createTablePane: () => {
    const tablePane = new ht.widget.TablePane;
    tablePane.getView().style.border = config.color_line + " solid 1px";
    return tablePane;
  },
  version: "1.0.0",
  createEditor3d: (parentDOM = {}) => {
    if (parentDOM) {
      if (ht.Default.isString(parentDOM)) {
        parentDOM = { container: parentDOM };
      } else {
        parentDOM.tagName && parentDOM.appendChild && (parentDOM = { container: parentDOM });
      }
    }
    let div = undefined,
      container = parentDOM.container;
    if (parentDOM.container === undefined) {
      container = parentDOM.container;
    }
    if (container === null) {
      div = null;
    } else if (container) {
      if (ht.Default.isString(container)) {
        div = document.getElementById(container)
      } else if (container.length) {
        div = ht.Default.createDiv();
        div.style.left = container[0] + "px";
        div.style.top = container[1] + "px";
        div.style.width = container[2] + "px";
        div.style.height = container[3] + "px";
        document.body.appendChild(div);
      } else {
        div = container;
      }
    } else {
      div = document.body;
    }
    parentDOM.body = div;
    new Editor3d(parentDOM);
  }
}

if (!config.valueTypes) {
  config.valueTypes = {};
}

config.valueTypes.HighlightEnum = {
  type: "enum",
  values: [0, 1, 2],
  i18nLabels: ["editor.none", "editor.selected", "editor.hover"]
}

window.tpeditor3d = tpeditor3d;
export default tpeditor3d;
