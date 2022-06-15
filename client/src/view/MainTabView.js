import config from "../config.js";
import { FILE_TYPE_SYMBOL, FILE_TYPE_DISPLAY, FILE_TYPE_SCENE, FILE_TYPE_UI } from "../constants.js";
import { getString, trimExtension } from "../util/index.js";
import TabView from "./TabView.js";
import DisplayView from "./DisplayView.js";
import ContextMenu from "../menu/ContextMenu.js";
import SymbolView from "./SymbolView.js";
import Dialog from "../dialog/index.js";

export default class MainTabView extends TabView {
  constructor(editor) {
    super();
    this.editor = editor;
    this.getTabModel().sm().ms(() => {
      const tab = this.currentTab;
      this.editor.initTab(tab);
      if (config.uisVisible) {
        if (tab?._isUI) {
          tab.getView().redraw(true);
          editor.mainSplitView.setStatus("cr");
        } else {
          editor.mainSplitView.setStatus("normal");
        }
      }
    });
    const visible = () => {
      return !!this.getTabModel().size();
    };
    this.menu = new ContextMenu([{
      id: "closeTab",
      label: getString("editor.closetab"),
      action: () => {
        this.closeTab();
      },
      visible
    }, {
      id: "closeOtherTabs",
      label: getString("editor.closeothertabs"),
      action: () => {
        this.closeOtherTabs();
      },
      visible
    }, {
      id: "closeTabsToTheRight",
      label: getString("editor.closetabstotheright"),
      action: () => {
        this.closeTabsToTheRight();
      },
      visible
    }]);
    this.menu.beforeShow = index => {
      this._rightClickTab = this.getTabAt(index);
    };
    this.menu.addTo(this.getTitleDiv());
    this.editor.menus.push(this.menu);
    this.addTitleTipHandler();
  }

  drawCloseIcon(data, ctx, fillStyle, rect) {
    if (data.a("dirty")) {
      ctx.fillStyle = fillStyle;
      ctx.beginPath();
      ctx.arc(rect.x + rect.width / 2, rect.y + rect.height / 2, 3, 0, 2 * Math.PI, true);
      ctx.fill();
    } else {
      super.drawCloseIcon(data, ctx, fillStyle, rect);
    }
  }

  open(fileNode) {
    if (fileNode) {
      const type = fileNode.fileType,
        isDisplay = type === FILE_TYPE_DISPLAY,
        isSymbol = type === FILE_TYPE_SYMBOL,
        isUI = type === FILE_TYPE_UI,
        isScene = type === FILE_TYPE_SCENE && tpeditor.SceneView;
      if (isDisplay || isSymbol || isScene || isUI) {
        const url = fileNode.url;
        let tab = this.getTabModel().getDataByTag(url);
        if (!tab) {
          if (tpeditor.SceneView && isScene && this.hasTooManyOpenScenes()) return;
          tab = new ht.Tab;
          tab.setTag(url);
          tab.setClosable(true);
          tab.setName(trimExtension(fileNode.getName()));
          tab.a("uuid", fileNode.uuid);
          if (isDisplay) {
            tab.setIcon("editor.display");
            new DisplayView(this.editor, tab, url, undefined, undefined, undefined,
              fileNode.parent_uuid, fileNode.root_dir);
          }
          if (isSymbol) {
            tab.setIcon("editor.symbol");
            new SymbolView(this.editor, tab, url, undefined, fileNode.parent_uuid, fileNode.root_dir);
          }
          if (isScene) {
            tab.setIcon("editor.scene"), new tpeditor.SceneView(this.editor, tab, url, undefined,
              fileNode.parent_uuid, fileNode.root_dir);
          }
          if (isUI) {
            tab.setIcon("editor.ui-tab");
            tab._isUI = true, new tpeditor.UIView(this.editor, tab, url, undefined,
              fileNode.parent_uuid, fileNode.root_dir);
          }
          this.editor.addTab(tab);
        }
        this.getTabModel().sm().ss(tab)
      }
    }
  }

  newDisplayView(title) {
    const tab = new ht.Tab;
    tab.setClosable(true);
    tab.setIcon("editor.display");
    tab.setName(title || getString("editor.untitled"));
    const dv = new DisplayView(this.editor, tab);
    this.editor.addTab(tab, true);
    return dv;
  }

  newSymbolView(title, zoomable = true) {
    const tab = new ht.Tab;
    tab.setClosable(true);
    tab.setIcon("editor.symbol");
    tab.setName(title || getString("editor.untitled"));
    const sv = new SymbolView(this.editor, tab);
    this.editor.addTab(tab, true);
    zoomable && this.editor.zoomToFit();
    return sv;
  }

  newUIView(title) {
    const tab = new ht.Tab;
    tab._isUI = true;
    tab.setClosable(true);
    tab.setIcon("editor.ui-tab");
    tab.setName(title || getString("editor.untitled"));
    const uv = new tpeditor.UIView(this.editor, tab);
    this.editor.addTab(tab, true);
    return uv;
  }

  deleteTexture(dir) {
    this.getTabModel().each(tab => {
      if (!tab._isUI) {
        const view = tab.getView();
        view.graphView.invalidateAll();
        const g3d = view.g3d;
        if (g3d) {
          g3d.deleteTexture(dir);
          const fileNode = this.editor.getFileNode(dir);
          if (fileNode) {
            const uuid = fileNode.getFileUUID();
            g3d.deleteTexture(uuid);
          }
          g3d.dm().each(data => {
            g3d.invalidateCachedTexture(data);
          });
          g3d.invalidateAll();
        }
      }
    })
  }

  updateUIRefs(e) {
    this.getTabModel().each(data => {
      if (data._isUI) {
        data.getView().handleFileChanged(e);
      }
    })
  }

  reload() {
    this.currentTab?.getView().reload();
  }

  save(callback, url) {
    this.currentTab?.getView().save(callback, url)
  }

  saveAll(callback) {
    const tabs = this.tabs;
    let i = -1;
    const handler = () => {
      i++;
      if (i < tabs.length) {
        tabs[i].getView().save(handler);
      } else {
        callback();
      }
    };
    handler();
  }

  preview() {
    this.currentTab?.getView().preview();
  }

  selectTab(tab) {
    tab && this.getTabModel().sm().ss(tab)
  }

  onTabClosing(tab) {
    this.closeTab(tab);
    return false;
  }

  closeTab(tab, callback, silent) {
    const _tab = tab || this._rightClickTab || this.currentTab;
    if (_tab) {
      this.closeTabs([_tab], callback, silent);
    }
  }

  closeOtherTabs(callback, silent) {
    const currentTab = this._rightClickTab || this.currentTab;
    this.closeTabs(this.tabs.filter(tab => {
      return tab !== currentTab;
    }), callback, silent);
  }

  closeTabsToTheRight(callback, silent) {
    const currentTab = this._rightClickTab || this.currentTab;
    if (currentTab) {
      let index = this.tabs.indexOf(currentTab);
      this.closeTabs(this.tabs.slice(index + 1), callback, silent);
    }
  }

  closeAllTabs(callback, silent) {
    this.closeTabs(this.tabs, callback, silent);
  }

  closeTabs(tabs, callback, silent) {
    let index = undefined;
    const handler = action => {
      if (action !== "cancel" && tabs.length) {
        const currentTab = tabs.shift(0);
        if (index === undefined) {
          index = this.tabs.indexOf(currentTab) - 1
        }
        this.confimRemoveTab(currentTab, handler, silent);
      } else {
        callback && callback();
        const length = this.tabs.length;
        if (!this.currentTab && length) {
          if (index === undefined || index < 0) {
            index = 0;
          }
          if (index > length - 1) {
            index = length - 1;
          }
          this.selectTab(this.tabs[index]);
        }
      }
    };
    handler();
    this._rightClickTab = null;
  }

  removeTab(tab) {
    const view = tab.getView(),
      params = { url: view.url };
    this.editor.fireViewEvent(view, "Closing", params);
    if (!params.preventDefault) {
      view.onClosed();
      this.getTabModel().remove(tab);
      this.editor.fireEvent("tabClosed", { tab });
      this.editor.fireViewEvent(view, "Closed", params);
    }
  }

  confimRemoveTab(tab, callBack, silent) {
    const view = tab.getView();
    if (!silent && view.dirty && view.editable) {
      const params = { tab };
      this.editor.fireEvent("tabPrompting", params);
      if (params.action === "notSave") {
        this.removeTab(tab);
        callBack && callBack("notSave");
      } else if (params.action === "save") {
        view.save(() => {
          this.removeTab(tab);
          callBack && callBack("save")
        });
      } else if (params.action === "cancel") {
        callBack && callBack("cancel");
      } else {
        const buttons = [{
          label: getString("editor.notsave"),
          action: () => {
            dialog.hide();
            this.removeTab(tab);
            callBack && callBack("notSave");
          }
        }, {
          label: getString("editor.save"),
          action: () => {
            view.save(() => {
              dialog.hide();
              this.removeTab(tab);
              callBack && callBack("save");
            })
          }
        }, {
          label: getString("editor.cancel"),
          action: () => {
            dialog.hide();
            callBack && callBack("cancel");
          }
        }],
          dialog = new Dialog({
            title: tab.getName(),
            contentPadding: 20,
            width: 260,
            draggable: true,
            content: '<p style="color: ' + ht.Default.labelColor + '">' +
              getString("editor.savechange") + "</p>",
            buttons
          });
        dialog.cancel = buttons[2].action;
        dialog.save = buttons[1].action;
        dialog.show(this.editor.body);
      }
    } else {
      this.removeTab(tab);
      callBack && callBack();
    }
  }

  addTitleTipHandler() {
  }

  get currentTab() {
    return this.getTabModel().sm().ld();
  }

  get tabs() {
    return this.getTabModel().getRoots().toArray();
  }
}
