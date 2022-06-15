import config from "../config.js";
import { isEmptyObject } from "../util/index.js";

export default class InspectorFilter {
  constructor(editor, inspector) {
    this.editor = editor;
    this.inspector = inspector;
    ["isDataTitleVisible", "isDataPropertyVisible", "isCompTitleVisible", "isCompPropertyVisible",
      "isDisplayTitleVisible", "isDisplayPropertyVisible", "isSymbolTitleVisible", "isSymbolPropertyVisible",
      "isData3dTitleVisible", "isData3dPropertyVisible", "isSceneTitleVisible", "isScenePropertyVisible"]
      .forEach(name => {
        const detailFilter = config.detailFilter,
          compactFilter = config.compactFilter,
          isEmpty = isEmptyObject(compactFilter);
        this[name] = function () {
          if (detailFilter[name] && !detailFilter[name].apply(inspector, arguments)) return false;
          if (config.commonAndAdvancedFilterMode) {
            if (editor.inspectorCompact) return !(compactFilter[name] && !compactFilter[name].apply(inspector, arguments));
            if (isEmpty) return true;
            if (compactFilter[name] && !compactFilter[name].apply(inspector, arguments)) return true;
            if (name.indexOf("Title") > 0) return true;
            const title = inspector._currentTitle;
            if ("isDataPropertyVisible" === name && compactFilter.isDataTitleVisible) {
              compactFilter.isDataTitleVisible.call(inspector, arguments[0], arguments[1], title)
            }
            if ("isCompPropertyVisible" === name && compactFilter.isCompTitleVisible) {
              compactFilter.isCompTitleVisible.call(inspector, arguments[0], arguments[1], title)
            }
            if ("isDisplayPropertyVisible" === name && compactFilter.isDisplayTitleVisible) {
              compactFilter.isDisplayTitleVisible.call(inspector, arguments[0], title)
            }
            if ("isData3dPropertyVisible" === name && compactFilter.isData3dTitleVisible) {
              compactFilter.isData3dTitleVisible.call(inspector, arguments[0], arguments[1], title)
            }
            if ("isScenePropertyVisible" === name && compactFilter.isSceneTitleVisible) {
              compactFilter.isSceneTitleVisible.call(inspector, arguments[0], title)
            }
          }
          return !(editor.inspectorCompact && compactFilter[name] && !compactFilter[name].apply(inspector, arguments))
        }
      })
  }
}
