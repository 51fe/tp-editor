import { clone, createIconButton, parse, stringify } from "./util/index.js";
import SvgConverter from "./util/SvgConverter.js";

var ht = window.ht, Default = ht.Default;
Default.getInternal().addMethod(Default, {
  svgToShape: function (svg, conf) {
    var converter = new SvgConverter(conf);
    return { converter, output: converter.toShape(svg) }
  }
});

function setConfig(key, value) {
  config[key] === undefined && (config[key] = value)
}

function canUse() {
  const agent = navigator.userAgent;
  return agent.indexOf("compatible") > -1 && agent.indexOf("MSIE") > -1 ||
    agent.indexOf("Trident") > -1 && agent.indexOf("rv:11.0") > -1
}

function extendNode(view) {
  let json = {
    clazz: this.getClass(),
    name: this.getName(),
    displayName: this.getDisplayName(),
    toolTip: this.getToolTip(),
    tag: this.getTag(),
    icon: this.getIcon(),
    layer: this.getLayer(),
    parent: view.copyData(this.getParent()),
    a: {},
    s: {},
    dataBindings: this.getDataBindings() ? stringify(this.getDataBindings(), null, false) : null
  };
  const map = this.getStyleMap();
  for (const name in map) {
    json.s[name] = clone(this.s(name));
  }
  const attrs = this.getAttrObject();
  for (const name in attrs) {
    json.a[name] = clone(this.a(name));
  }
  return json;
}

function cloneNode(json, view) {
  const shape = new json.clazz,
    dm = view.dm();
  config.cloneName && shape.setName(json.name);
  config.cloneDisplayName && shape.setDisplayName(json.displayName);
  config.cloneToolTip && shape.setToolTip(json.toolTip);
  config.cloneTag && !dm.getDataByTag(json.tag) && shape.setTag(json.tag);
  config.cloneIcon && shape.setIcon(json.icon);
  config.cloneLayer && shape.setLayer(json.layer);
  if (config.cloneStyle) {
    for (const name in json.s) {
      shape.s(name, clone(json.s[name]));
    }
  }
  if (config.cloneAttr) {
    for (const name in json.a) {
      shape.a(name, clone(json.a[name]));
    }
  }
  if (config.cloneDataBindings && json.dataBindings) {
    shape.setDataBindings(parse(json.dataBindings));
  }
  return shape;
}

function cloneParent(json, view, info) {
  let parent = undefined;
  if (config.cloneParent) {
    parent = view.parse(json.parent, info);
  }
  this.setParent(parent || view.getCurrentSubGraph())
}

function extend3d(d3) {
  const json = extendNode.call(this, d3);
  json.r3 = this.r3();
  json.rotationMode = this.getRotationMode();
  json.p3 = this.p3();
  json.s3 = this.s3();
  json.scale3d = this.getScale3d();
  json.anchor3d = this.getAnchor3d();
  json.image = this.getImage();
  json.host = d3.copyData(this.getHost());
  return json;
}

function clone3d(json, view) {
  const node = cloneNode(json, view);
  if (config.cloneRotation) {
    node.r3(json.r3);
    node.setRotationMode(json.rotationMode);
  }
  config.clonePosition && node.p3(json.p3);
  config.cloneSize && node.s3(json.s3);
  config.cloneScale && node.setScale3d(json.scale3d);
  config.cloneAnchor && node.setAnchor3d(json.anchor3d);
  config.cloneImage && node.setImage(json.image);
  return node;
}

function cloneHost(json, view, info) {
  cloneParent.call(this, json, view, info);
  if (config.cloneHost) {
    this.setHost(view.parse(json.host, info))
  }
}

function extendEdge(edge) {
  const json = extendNode.call(this, edge);
  json.source = edge.copyData(this.getSource());
  json.target = edge.copyData(this.getTarget());
  return json;
}

function cloneEdge(json, view, info) {
  cloneParent.call(this, json, view, info);
  config.cloneSource && this.setSource(view.parse(json.source, info));
  config.cloneTarget && this.setTarget(view.parse(json.target, info))
}

function extendGroup(group) {
  const json = extend3d.call(this, group);
  json.expanded = this.isExpanded();
  return json
}

function cloneGroup(json, view) {
  const group = clone3d(json, view);
  config.cloneExpanded && group.setExpanded(json.expanded);
  return group;
}

function extendShape(shape) {
  const json = extend3d.call(this, shape);
  json.points = clone(this.getPoints());
  json.segments = clone(this.getSegments());
  json.thickness = this.getThickness();
  json.closePath = this.isClosePath();
  return json;
}

function cloneShape(json, view) {
  const shape = clone3d(json, view);
  config.clonePoints && shape.setPoints(clone(json.points));
  config.cloneSegments && shape.setSegments(clone(json.segments));
  config.cloneThickness && shape.setThickness(json.thickness);
  config.cloneClosePath && shape.setClosePath(json.closePath);
  return shape;
}

function extendBlock(block) {
  const json = extend3d.call(this, block);
  json.clickThroughEnabled = this.isClickThroughEnabled();
  json.syncSize = this.isSyncSize();
  return json;
}

function cloneBlock(json, view) {
  const block = clone3d(json, view);
  config.cloneClickThroughEnabled && block.setClickThroughEnabled(json.clickThroughEnabled);
  config.cloneSyncSize && block.setSyncSize(json.syncSize);
  return block;
}

function extendRefGraph(refGraph) {
  const json = extendBlock.call(this, refGraph);
  json.ref = this.getRef();
  return json;
}

function cloneRefGraph(json, view) {
  const refGraph = cloneBlock(json, view);
  config.cloneRef && refGraph.setRef(json.ref);
  return refGraph;
}

const config = window.tpeditor_config || {}
setConfig("color_select", "#45C4F9");
setConfig("color_select_dark", "#39B0E4");
setConfig("color_pane", "#FFFFFF");
setConfig("color_pane_dark", "#F7F7F7");
setConfig("color_line", "#E4E4E4");
setConfig("color_dark", "#2C2C2C");
setConfig("color_light", "white");
setConfig("color_data_border", "#979797");
setConfig("color_data_background", "#D8D8D8");
setConfig("color_transparent", "rgba(156,156,156,0.4)");
setConfig("color_disabled", "#8C8C8C");
setConfig("color_guide", "red");
setConfig("color_hover", "rgba(184,184,184,0.18)");
setConfig("color_mask", "rgba(84,110,125,0.30)");
setConfig("logEditorInfo", true);
setConfig("host", window.location.hostname);
setConfig("port", window.location.port);
setConfig("locale", "zh");
setConfig("serviceClass", undefined);
setConfig("maxUndoRedoSteps", 200);
setConfig("inspectorTitleHeight", undefined);
setConfig("inspectorTitleBackground", undefined);
setConfig("smallFont", "10px arial, sans-serif");
setConfig("boldFont", "bold 12px arial, sans-serif");
setConfig("leftSplitViewPosition", 240);
setConfig("rightSplitViewPosition", -300);
setConfig("mainSplitViewPosition", -360);
setConfig("explorerSplitViewPosition", .4);
setConfig("requestDelay", 100);
setConfig("imageSize", 256);
setConfig("fileSize", 50);
setConfig("maxFileSize", 200);
setConfig("dragImageSize", 50);
setConfig("dragImageOpacity", .7);
setConfig("animate", true);
setConfig("fitPadding", 20);
setConfig("fitContentForDisplayView", true);
setConfig("fitContentForSymbolView", true);
setConfig("rulerSize", 16);
setConfig("edgeLoop", true);
setConfig("pasteOffset", 0);
setConfig("pasteToLastSelectedIndex", false);
setConfig("continuousLayout", true);
setConfig("maxZoom", 50);
setConfig("minZoom", .01);
setConfig("detailFilter", {});
setConfig("compactFilter", {});
setConfig("customProperties", {});
setConfig("displayRulerEnabled", true);
setConfig("displayGridEnabled", false);
setConfig("displayGridBlockSize", 40);
setConfig("displayGridThickLinesEvery", 10);
setConfig("displayGridThickColor", "rgb(191, 191, 191)");
setConfig("displayGridLightColor", "rgba(191, 191, 191, 0.4)");
setConfig("displayGridAngle", Math.PI / 2);
setConfig("displayGridRotation", 0);
setConfig("displayGridZoomThreshold", .25);
setConfig("displayGridAlignmentGuideColor", tpeditor_config.color_guide);
setConfig("displayGridAlignmentGuideEnabled", true);
setConfig("displayAnchorEnabled", true);
setConfig("displayGuideLineEnabled", true);
setConfig("displayHighlightEnabled", true);
setConfig("displayHighlightColor", tpeditor_config.color_select);
setConfig("displayHighlightBorderWidth", 1);
setConfig("displayHighlightBorderPattern", [1, 4]);
setConfig("symbolRulerEnabled", true);
setConfig("symbolGridEnabled", false);
setConfig("symbolGridBlockSize", 1);
setConfig("symbolGridThickLinesEvery", 20);
setConfig("symbolGridThickColor", "rgb(191, 191, 191)");
setConfig("symbolGridLightColor", "rgba(191, 191, 191, 0.2)");
setConfig("symbolGridAngle", Math.PI / 2);
setConfig("symbolGridRotation", 0);
setConfig("symbolGridZoomThreshold", .25);
setConfig("symbolGridAlignmentGuideColor", tpeditor_config.color_guide);
setConfig("symbolGridAlignmentGuideEnabled", true);
setConfig("symbolAnchorEnabled", true);
setConfig("symbolGuideLineEnabled", true);
setConfig("symbolHighlightEnabled", true);
setConfig("symbolHighlightColor", tpeditor_config.color_select);
setConfig("symbolHighlightBorderWidth", 1);
setConfig("symbolHighlightBorderPattern", [1, 4]);
setConfig("maxStringLength", 1e6);
setConfig("maxFileNameLength", 100);
setConfig("traceMissingI18n", false);
setConfig("container", undefined);
setConfig("continuousCreating", false);
setConfig("valueTypes", {});
setConfig("indent", 94);
setConfig("indent2", 68);
setConfig("clearDataBindingsBeforeImporting", true);
setConfig("insertDisplayViewAsRefGraph", false);
setConfig("displayPreviewURL", "display.html");
setConfig("symbolPreviewURL", "symbol.html");
setConfig("removeFileByKeyboardEnabled", false);
setConfig("locateFileEnabled", true);
setConfig("promptBeforeClosing", true);
setConfig("displaysVisible", true);
setConfig("symbolsVisible", true);
setConfig("componentsVisible", true);
setConfig("scenesVisible", false);
setConfig("modelsVisible", false);
setConfig("uisVisible", false);
setConfig("assetsVisible", true);
setConfig("displaysEditable", true);
setConfig("symbolsEditable", true);
setConfig("componentsEditable", true);
setConfig("scenesEditable", true);
setConfig("modelsEditable", true);
setConfig("assetsEditable", true);
setConfig("settingDefaultValueBeforeSaving", false);
setConfig("svgSegments", 20);
setConfig("svgMinimumFontSize", 12);
setConfig("svgWaitingTime", 600);
setConfig("importConfirm", true);
setConfig("newIfFailToOpen", true);
setConfig("dataBindings", {});
setConfig("dataBindingsForSymbol", {});
setConfig("useCodeEditor", !canUse());
setConfig("codeEditorClass", undefined);
setConfig("convertCodeEditorOption", undefined);
setConfig("fontPreview", "TPEDITOR");
setConfig("checkForFileChanges", true);
setConfig("checkForFileChangesInterval", 3000);
setConfig("cloneAttr", true);
setConfig("cloneStyle", true);
setConfig("cloneName", true);
setConfig("cloneDisplayName", true);
setConfig("cloneToolTip", true);
setConfig("cloneTag", true);
setConfig("cloneIcon", true);
setConfig("cloneLayer", true);
setConfig("cloneParent", true);
setConfig("cloneDataBindings", true);
setConfig("cloneSource", true);
setConfig("cloneTarget", true);
setConfig("cloneExpanded", true);
setConfig("cloneClickThroughEnabled", true);
setConfig("cloneSyncSize", true);
setConfig("cloneRef", true);
setConfig("clonePoints", true);
setConfig("cloneSegments", true);
setConfig("cloneThickness", true);
setConfig("cloneClosePath", true);
setConfig("cloneRotation", true);
setConfig("clonePosition", true);
setConfig("cloneSize", true);
setConfig("cloneScale", true);
setConfig("cloneAnchor", true);
setConfig("cloneImage", true);
setConfig("cloneHost", true);
setConfig("isOpenable", null);
setConfig("dialogTitleBackground", null);
setConfig("componentViewSize", {
  width: 700,
  height: 500
});
setConfig("eventViewSize", { width: 600, height: 400 });
setConfig("fontViewSize", {
  width: 500,
  height: 400
});
setConfig("functionViewSize", { width: 500, height: 400 });
setConfig("objectViewSize", {
  width: 500,
  height: 400
});
setConfig("textViewSize", { width: 500, height: 400 });
setConfig("attachPointsViewSize", {
  width: 700,
  height: 500
});
setConfig("drawAccordionTitle", null);
setConfig("accordionMutex", false);
setConfig("importDataBindingsButtonVisible", true);
setConfig("saveSymbolCustomPropertyDefaultValue", false);
setConfig("saveCompCustomPropertyDefaultValue", false);
setConfig("deleteFileConfirm", true);
setConfig("mixMaskAndBackground", true);
setConfig("moveDummyThreshold", 32);
setConfig("smartGuideThreshold", 8);
setConfig("cadToDisplayBoundingType", "Standard");
setConfig("cadToSymbolBoundingType", "Reset");
setConfig("promptForMovingFile", false);
setConfig("displayTreeVisibleFunc", null);
setConfig("symbolListVisibleFunc", null);
setConfig("onElementCreated", null);
setConfig("commonAndAdvancedFilterMode", false);
setConfig("edgeTypes", [undefined, "points", "boundary", "flex2", "ortho2", "h.v2", "v.h2",
  "extend.north2", "extend.south2", "extend.west2", "extend.east2"]);
setConfig("fileOpeners", {});
setConfig("paramHandlers", {});
setConfig("getToolTip", function () {
  return null;
});
setConfig("createFileTreeSortFunc", function (tree) {
  return function (x, y) {
    if (x.url && y.url) {
      return x.url - y.url > 0;
    } else {
      ht.Default.sortFunc(tree.getLabel(x), tree.getLabel(y));
    }
  }
});
setConfig("explorerMode", "treeList");
setConfig("filterDisplayViewEnabled", false);
setConfig("filterSymbolViewEnabled", false);
setConfig("customAttachPointsColumns", null);
setConfig("isCopyCompsWhenNewState", true);
setConfig("codeEditorTheme", null);
setConfig("accordionListIndent", 0);
setConfig("copyFileByServer", true);
setConfig("isDataBound", function (data, accessType, name) {
  const bindings = data.getDataBindings();
  return bindings?.[accessType]?.[name];
});
setConfig("checkFileName", function (name) {
  name = name.trim();
  if(!name) {
    return false;
  } else if(!/[!@?#$%^&*/]/.test(name)) {
    return name;
  }
  return false;
});
setConfig("handleDefaultVauleColumnEdit", null);
setConfig("paletteColors", [["rgb(51,153,255)", "#60ACFC", "#32D3EB", "rgb(93,217,174)", "rgb(125,195,125)",
  "rgb(255,235,195)", "rgb(226,250,87)"], ["#FEB64D", "#FF7C7C", "rgb(241,125,164)", "rgb(204,104,166)",
  "rgb(135,144,204)", "rgb(145,115,205)", "rgb(124,145,155)"], ["rgb(48,242,120)", "rgb(0,199,7)",
  "rgb(242,83,75)", "rgb(212,0,0)", "rgb(240,225,19)", "rgb(247,247,247)", "rgb(61,61,61)"]]);
setConfig("gradients", [null, "linear.southwest", "linear.southeast", "linear.northwest", "linear.northeast", "linear.north",
  "linear.south", "linear.west", "linear.east", "radial.center", "radial.southwest", "radial.southeast", "radial.northwest",
  "radial.northeast", "radial.north", "radial.south", "radial.west", "radial.east", "spread.horizontal", "spread.vertical",
  "spread.diagonal", "spread.antidiagonal", "spread.north", "spread.south", "spread.west", "spread.east"]);
if (!tpeditor_config.gradientIcons) {
  tpeditor_config.gradientIcons = [];
  tpeditor_config.gradients.forEach(function (gradient) {
    let item = { width: 20, height: 14, comps: [] };
    if (gradient) {
      item = {
        width: 20,
        height: 14,
        comps: [{
          type: "rect",
          rect: [0, 0, 20, 14],
          gradient,
          gradientColor: tpeditor_config.color_line,
          background: tpeditor_config.color_dark
        }]
      }
    }
    tpeditor_config.gradientIcons.push(item);
  })
}
setConfig("fontList", ["SimSun", "NSimSun", "FangSong", "KaiTi", "FangSong_GB2312", "Microsoft YaHei", "cursive",
  "monospace", "serif", "sans-serif", "fantasy", "Arial", "Arial Black", "Arial Narrow", "Arial Rounded MT Bold",
  "Bookman Old Style", "Bradley Hand ITC", "Century", "Century Gothic", "Comic Sans MS", "Courier", "Courier New",
  "Georgia", "Gentium", "Impact", "King", "Lucida Console", "Lalit", "Modena", "Monotype Corsiva", "Papyrus",
  "Tahoma", "TeX", "Times", "Times New Roman", "Trebuchet MS", "Verdana", "Verona", "PingFangSC-Thin"]);
setConfig("ignoreFontDetection", false);
setConfig("symbolStateEnabled", false);
setConfig("layerEnabled", true);
setConfig("layoutEnabled", true);
setConfig("overviewEnabled", true);
setConfig("dataViewEnabled", true);
setConfig("expandedTitles", {});
["TitleBasic", "TitleCustom", "TitleBackground", "TitleBorder", "TitleText", "TitleImage",
  "TitleGroupBasic", "TitleEdgeBasic", "TitleArc", "TitleDataBinding", "TitleComponent",
  "TitleShapeBackground", "TitleShapeBorder", "TitleGroupTitle", "TitleEditingPoint", "TitleChart"]
  .forEach(function (i) {
    if (!tpeditor_config.expandedTitles[i]) {
      tpeditor_config.expandedTitles[i] = true;
    }
  });
setConfig("displayConnectActionType", null);
setConfig("symbolConnectActionType", null);
setConfig("displayConnectActionTypes", [null, "copyStyle", "host", "parent"]);
setConfig("symbolConnectActionTypes", [null, "copyStyle"]);
setConfig("appendDisplayConnectActionTypes", null);
setConfig("appendSymbolConnectActionTypes", null);
setConfig("appendConnectActions", null);
setConfig("connectActions", {
  copyStyle: {
    action: function (e, item, data) {
      if (data) {
        const style = data.getStyleMap();
        for (const name in style) {
          if (!["shape", "label", "label2", "note", "note2", "text"].includes(name)) {
            item.s(name, clone(style[name]));
          }
        }
      }
    },
    extraInfo: {
      visible: function () {
        return true;
      }
    }
  },
  host: {
    action: function (e, item, data) {
      if (item instanceof ht.Node && data instanceof ht.Node && !item.s("fullscreen")) {
        item.setHost(data);
      }
    },
    extraInfo: {
      delete: {
        visible: function (view) {
          return view.sm().ld()?.getHost?.();
        },
        action: function (e, item) {
          item?.setHost?.(undefined)
        }
      },
      visible: function (view) {
        return view.sm().ld() instanceof ht.Node;
      }
    }
  },
  parent: {
    action: function (e, item, data) {
      data && item.setParent(data);
    },
    extraInfo: {
      delete: {
        visible: function (view) {
          return view.sm().ld().getParent();
        },
        action: function (e, item) {
          item.setParent(undefined);
        }
      },
      visible: function () {
        return true;
      }
    }
  }
});
tpeditor_config.appendDisplayConnectActionTypes?.forEach?.(function (type) {
  tpeditor_config.displayConnectActionTypes.push(type);
});
tpeditor_config.appendSymbolConnectActionTypes?.forEach?.(function (type) {
  tpeditor_config.symbolConnectActionTypes.push(type)
});
for (const name in tpeditor_config.appendConnectActions) {
  tpeditor_config.connectActions[name] = tpeditor_config.appendConnectActions[name];
}
for (const name in tpeditor_config.connectActions) {
  const item = tpeditor_config.connectActions[name];
  ht.Default.setConnectAction(name, item.action, item.extraInfo)
}

const divEl = ht.Default.getToolTipDiv();
divEl.style.color = tpeditor_config.color_dark;
divEl.style.background = tpeditor_config.color_pane;
ht.widget.ColorPicker.prototype._paletteColors = tpeditor_config.paletteColors;
ht.graph.GraphView.prototype._scrollBarColor = tpeditor_config.color_transparent;
ht.graph.GraphView.prototype._rectSelectBackground = tpeditor_config.color_transparent;
ht.graph.GraphView.prototype._rectSelectBorderColor = tpeditor_config.color_select;
ht.graph.GraphView.prototype.isLabelVisible = function () {
  return true;
};
ht.widget.ListView.prototype._scrollBarColor = tpeditor_config.color_transparent;
ht.widget.TreeView.prototype._scrollBarColor = tpeditor_config.color_transparent;
ht.widget.TableView.prototype._scrollBarColor = tpeditor_config.color_transparent;
ht.widget.TreeTableView.prototype._scrollBarColor = tpeditor_config.color_transparent;
ht.widget.PropertyView.prototype._scrollBarColor = tpeditor_config.color_transparent;
ht.widget.FormPane.prototype._scrollBarColor = tpeditor_config.color_transparent;
ht.widget.SplitView.prototype._dividerBackground = tpeditor_config.color_line;
ht.widget.SplitView.prototype._continuousLayout = tpeditor_config.continuousLayout;
ht.widget.ListView.prototype._selectBackground = tpeditor_config.color_select;
ht.widget.TreeView.prototype._selectBackground = tpeditor_config.color_select;
ht.widget.TableView.prototype._selectBackground = tpeditor_config.color_select;
ht.widget.TreeTableView.prototype._selectBackground = tpeditor_config.color_select;
ht.widget.TableHeader.prototype._columnLineColor = tpeditor_config.color_line;
ht.widget.TableHeader.prototype._insertColor = tpeditor_config.color_select_dark;
ht.widget.TableView.prototype._columnLineColor = tpeditor_config.color_line;
ht.widget.Toolbar.prototype._separatorColor = tpeditor_config.color_line;
ht.widget.Toolbar.prototype._itemGap = 4;
ht.widget.Button.prototype._labelColor = tpeditor_config.color_light;
ht.widget.Button.prototype._borderColor = null;
ht.widget.Button.prototype._background = tpeditor_config.color_select;
ht.widget.Button.prototype._selectBackground = tpeditor_config.color_select_dark;
ht.widget.CheckBox.prototype._pressBackground = tpeditor_config.color_pane_dark;
ht.widget.ComboBox.prototype._selectBackground = tpeditor_config.color_select;
ht.widget.TabView.prototype._insertColor = tpeditor_config.color_select_dark;
ht.widget.TabView.prototype._selectWidth = 0;
ht.widget.TabView.prototype._selectBackground = tpeditor_config.color_select;
ht.widget.TabView.prototype._tabBackground = tpeditor_config.color_dark;
ht.widget.TabView.prototype.getTabBackground = function (tab) {
  return tab == this.getCurrentTab() ? tpeditor_config.color_select : tpeditor_config.color_dark
};
ht.widget.FormPane.prototype._hPadding = 4;
ht.widget.FormPane.prototype._vPadding = 4;
ht.widget.FormPane.prototype._hGap = 4;
ht.widget.FormPane.prototype._vGap = 4;
ht.widget.Slider.prototype._background = tpeditor_config.color_da;
ht.widget.Slider.prototype._leftBackground = tpeditor_config.color_select;
ht.widget.Slider.prototype._button = {
  width: 14,
  height: 14,
  comps: [{
    type: "circle",
    rect: [0, 0, 14, 14],
    borderWidth: 1,
    borderColor: tpeditor_config.color_dark,
    background: tpeditor_config.color_pane_dark
  }]
};
ht.widget.ComboBox.prototype._dropDownIcon = ht.widget.MultiComboBox.prototype._dropDownIcon = {
  width: 16,
  height: 16,
  comps: [{
    type: "shape",
    points: [13, 6, 8, 12, 3, 6],
    segments: [1, 2, 2],
    borderWidth: 1,
    borderColor: tpeditor_config.color_dark
  }]
};
ht.Default.comboBoxBorderColor = config.color_line;
ht.Default.textFieldBorderColor = config.color_line;
ht.Default.contextMenuHoverBackground = config.color_select;
ht.Default.contextMenuSeparatorColor = config.color_line;
ht.Default.dialogTitleBackground = config.dialogTitleBackground || config.color_dark;
ht.Default.dialogButtonBackground = config.color_select;
ht.Default.dialogButtonSelectBackground = config.color_select_dark;
ht.Default.dialogHeaderBackground = config.color_pane_dark;
ht.Default.toolbarBackground = config.color_pane_dark;
ht.Default.tableHeaderBackground = config.color_pane_dark;
ht.Default.contextMenuLabelFont = ht.Default.labelFont;
ht.Default.contextMenuBorderRadius = 0;
ht.Default.contextMenuBorderColor = config.color_line;
ht.Default.contextMenuSubmenuMark = ">&nbsp;";
ht.Default.contextMenuCheckIcon = {
  width: 16,
  height: 16,
  comps: [{
    type: "shape", points: [13, 3, 7, 12, 4, 8],
    borderWidth: 1, borderColor: tpeditor_config.color_dark
  }]
};
ht.Default.handleUnfoundImage = function () {
  return ht.Default.getImage("editor.unknown")
};
ht.Default.setImage("radioOn", {
  width: 16,
  height: 16,
  comps: [{
    type: "circle",
    rect: [2, 2, 12, 12],
    borderWidth: 1,
    borderColor: ht.Color.widgetIconBorder,
    background: "#FFF"
  }, { type: "circle", rect: [4, 4, 8, 8], background: tpeditor_config.color_select }]
});
ht.Default.setImage("expandIcon", {
  width: 16,
  height: 16,
  comps: [{
    type: "shape",
    points: [13, 6, 8, 12, 3, 6],
    segments: [1, 2, 2],
    borderWidth: 1,
    borderColor: tpeditor_config.color_dark
  }]
});
ht.Default.setImage("collapseIcon", {
  width: 16,
  height: 16,
  comps: [{
    type: "shape",
    points: [6, 3, 12, 8, 6, 13],
    segments: [1, 2, 2],
    borderWidth: 1,
    borderColor: tpeditor_config.color_dark
  }]
});

ht.Default.setImage("check", {
  width: 16,
  height: 16,
  comps: [{ type: "border", rect: [1, 1, 14, 14], width: 1, color: config.color_line }, {
    type: "shape",
    points: [13, 3, 7, 12, 4, 8],
    borderWidth: 2,
    borderColor: {
      func: function (data, view) {
        if (data && view?.getRowSize && view?.isSelected) {
          let selected = view.isSelected(data);
          if (view.isCheckMode && view.getFocusData) {
            const checked = view.isCheckMode();
            selected = selected && !checked || data === view.getFocusData() && checked
          }
          if (selected) return config.color_line;
        }
        return config.color_select;
      }
    }
  }]
});
ht.Default.setImage("uncheck", {
  width: 16,
  height: 16,
  comps: [{ type: "border", rect: [1, 1, 14, 14], width: 1, color: config.color_line }]
});
ht.Default.setImage("text_icon", {
  width: 16,
  height: 16,
  comps: [{
    type: "shape",
    points: [3, 14, 8, 2, 13, 14, 5, 9, 11, 9],
    segments: [1, 2, 2, 1, 2],
    borderColor: config.color_dark,
    borderWidth: 1
  }]
});
ht.Default.setImage("refGraph_icon", {
  width: 16,
  height: 16,
  comps: [{
    type: "shape",
    borderWidth: 1,
    borderColor: config.color_dark,
    rotation: .7854,
    points: [12.90381, 7.59615, 12.90381, 7.59615, 12.90381, 4.61619, 12.90381, 3.59619, 12.90381, 2.57619,
      11.72047, 1.59619, 10.40381, 1.59619, 9.08714, 1.59619, 7.90381, 2.61619, 7.90381, 3.59619, 7.90381,
      4.35799, 7.90381, 7.59615, 7.90381, 7.59615, 7.90381, 7.59615, 7.90381, 9.59619, 10.40381, 9.59619],
    segments: [1, 4, 4, 4, 4, 4]
  }, {
    type: "shape",
    borderWidth: 1,
    borderColor: config.color_dark,
    rotation: -2.35619,
    points: [8.21091, 12.28904, 8.21091, 12.28904, 8.21091, 9.30909, 8.21091, 8.28909, 8.21091, 7.26909,
      7.02758, 6.28909, 5.71091, 6.28909, 4.39425, 6.28909, 3.21091, 7.30909, 3.21091, 8.28909, 3.21091,
      9.05088, 3.21091, 12.28904, 3.21091, 12.28904, 3.21091, 12.28904, 3.21091, 14.28909, 5.71091, 14.28909],
    segments: [1, 4, 4, 4, 4, 4]
  }]
});
ht.Default.setImage("editor.unknown", {
  width: 200,
  height: 200,
  textureCache: true,
  comps: [{
    type: "roundRect",
    background: "rgb(247,247,247)",
    borderColor: "#979797",
    cornerRadius: 20,
    selectable: false,
    rect: [0, 0, 200, 200]
  }, {
    type: "shape",
    background: "rgba(255,170,79,0.63)",
    borderColor: "rgb(124,145,155)",
    points: [35.92101, 125.8927, 70.22338, 97.87611, 96.05685, 117.16025, 108.79166, 106.08902,
      115.70485, 111.45559, 92.40971, 145.02116, 35.92101, 145.02116, 35.92101, 130.19911]
  }, {
    type: "shape",
    background: "rgba(255,170,79,0.63)",
    borderColor: "rgb(124,145,155)",
    points: [143.94195, 74.95345, 121.52647, 95.32915, 136.08054, 112.06633,
      115.341, 146.63224, 166.86461, 146.63224, 166.86461, 103.69774]
  }, {
    type: "shape",
    borderWidth: 4,
    borderColor: "rgb(124,145,155)",
    displayName: "不规则图形",
    closePath: true,
    points: [86.52393, 81.40417, 110.5868, 43.51795, 35.32634, 43.51795, 35.32634,
      146.93709, 93.17962, 146.93709, 117.24248, 111.09877, 86.52393, 81.40417]
  }, {
    type: "shape",
    borderWidth: 4,
    borderColor: "rgb(124,145,155)",
    closePath: true,
    points: [105.77896, 81.40417, 129.84183, 43.51795, 168.08039, 43.51795, 168.08039,
      146.93709, 112.43465, 146.93709, 136.49752, 111.09877, 105.77896, 81.40417]
  }, {
    type: "shape",
    borderWidth: 4,
    borderColor: "rgb(124,145,155)",
    points: [35.92101, 126.00861, 70.52846, 96.60621, 95.13328, 116.95012, 108.45973, 104.311]
  }, {
    type: "shape",
    borderWidth: 4,
    borderColor: "rgb(124,145,155)",
    points: [122.25418, 94.2376, 144.08528, 74.22575, 168.32002, 106.08902]
  }, {
    type: "oval",
    background: "#FF7C7C",
    borderWidth: 4,
    borderColor: "rgb(124,145,155)",
    rect: [56.57448, 66.67972, 14, 14]
  }]
});
ht.Default.setImage("editor.root", {
  width: 30,
  height: 30,
  fitSize: true,
  comps: [{ type: "shape", points: [23, 8, 8, 23], segments: [1, 2], borderWidth: 1, borderColor: "white" }]
});
ht.Default.setImage("editor.display", {
  background: "rgb(179,179,179)",
  width: 16,
  height: 16,
  blendMode: "override",
  comps: [{
    type: "circle",
    borderWidth: 1,
    borderColor: config.color_light,
    rect: [6, 1, 4, 4.00837]
  }, { type: "circle", borderWidth: 1, borderColor: config.color_light, rect: [11, 10.99163, 4, 4.00837] }, {
    type: "shape",
    borderWidth: 1,
    borderColor: config.color_light,
    points: [2.98235, 11.0795, 2.98235, 8, 7.89475, 8, 7.89475, 5.00837, 7.89475, 8, 13, 8, 13, 11]
  }, { type: "circle", borderWidth: 1, borderColor: config.color_light, rect: [1, 10.99163, 4, 4.00837] }]
});
ht.Default.setImage("editor.symbol", {
  background: "rgb(179,179,179)",
  width: 16,
  height: 16,
  blendMode: "override",
  comps: [{ type: "circle", borderWidth: 1, borderColor: config.color_light, rect: [0, 2, 10, 8] }, {
    type: "rect",
    borderWidth: 1,
    borderColor: config.color_light,
    rect: [5, 6, 10, 8]
  }]
});
ht.Default.setImage("editor.filter", {
  background: "rgb(130,130,130)",
  width: 16,
  height: 16,
  comps: [{
    type: "shape",
    borderWidth: 1,
    borderColor: "rgb(255,255,255)",
    closePath: true,
    points: [2, 1.5, 14, 1.5, 9.50949, 5.5, 9.50949, 9.5, 13, 9.5, 9.50949, 9.5, 9.50949,
      11.5, 12, 11.5, 9.50949, 11.5, 9.50949, 14.5, 6.5335, 12.5, 6.5335, 5.5, 2, 1.5]
  }]
});
ht.Default.setImage("editor.bind", {
  width: 16,
  height: 16,
  comps: [{
    type: "shape",
    borderWidth: 1,
    borderColor: "white",
    borderCap: "round",
    rotation: .7854,
    points: [12.5502, 6.7981, 12.5502, 6.7981, 12.5502, 4.8181, 12.5502, 3.7981, 12.5502, 2.7781,
      11.36687, 1.7981, 10.0502, 1.7981, 8.73354, 1.7981, 7.5502, 2.8181, 7.5502, 3.7981, 7.5502,
      4.55989, 7.5502, 7.79805, 7.5502, 7.79805, 7.5502, 7.79805, 7.5502, 9.7981, 10.0502, 9.7981],
    segments: [1, 4, 4, 4, 4, 4]
  }, {
    type: "shape",
    borderWidth: 1,
    borderColor: "white",
    borderCap: "round",
    rotation: -2.35619,
    points: [8.4498, 11.2019, 8.4498, 11.2019, 8.4498, 9.2219, 8.4498, 8.2019, 8.4498, 7.1819,
      7.26646, 6.2019, 5.9498, 6.2019, 4.63313, 6.2019, 3.4498, 7.2219, 3.4498, 8.2019, 3.4498,
      8.9637, 3.4498, 12.20186, 3.4498, 12.20186, 3.4498, 12.20186, 3.4498, 14.2019, 5.9498, 14.2019],
    segments: [1, 4, 4, 4, 4, 4]
  }]
});
ht.Default.setImage("editor.unbind", {
  background: "rgb(179,179,179)",
  width: 16,
  height: 16,
  blendMode: "override",
  comps: [{
    type: "shape",
    borderWidth: 1,
    borderColor: "rgb(138,138,138)",
    borderCap: "round",
    shadowColor: "#1ABC9C",
    rotation: .7854,
    points: [13.49999, 7.03553, 13.49999, 7.03553, 13.49999, 5.05554, 13.49999, 4.03553,
      13.49999, 3.01553, 12.31666, 2.03553, 10.99999, 2.03553, 9.68333, 2.03553, 8.49999,
      3.05553, 8.49999, 4.03553, 8.49999, 5.01553, 8.49999, 7.03553, 8.49999, 7.03553],
    segments: [1, 4, 4, 4, 4]
  }, {
    type: "shape",
    borderWidth: 1,
    borderColor: "rgb(138,138,138)",
    borderCap: "round",
    shadowColor: "#1ABC9C",
    rotation: 3.92699,
    points: [7.28554, 13.25761, 7.28554, 13.25761, 7.28554, 11.27761, 7.28554, 10.2576,
      7.28554, 9.23761, 6.1022, 8.25761, 4.78554, 8.25761, 3.46887, 8.25761, 2.28554,
      9.2776, 2.28554, 10.2576, 2.28554, 11.2376, 2.28554, 13.25761, 2.28554, 13.25761],
    segments: [1, 4, 4, 4, 4]
  }]
});
ht.Default.setImage("editor.dircollapsed", {
  background: "rgb(179,179,179)",
  width: 16,
  height: 16,
  comps: [{
    type: "shape",
    background: "rgb(255,204,153)",
    borderWidth: 1,
    borderColor: "rgb(138,138,138)",
    borderCap: "round",
    shadowColor: "#1ABC9C",
    points: [14.5, 14.5, .5, 14.5, .5, 1.50001, 6.5, 1.50001, 7.5, 3.50001, 14.5, 3.50001, 14.5, 14.5]
  }, {
    type: "shape",
    background: "rgb(255,227,199)",
    borderWidth: 1,
    borderColor: "rgb(138,138,138)",
    borderCap: "round",
    shadowColor: "#1ABC9C",
    points: [.5, 5.50001, 14.5, 5.50001, 14.5, 14.50001, .5, 14.50001, .5, 5.50001]
  }]
});
ht.Default.setImage("editor.direxpanded", {
  background: "rgb(179,179,179)",
  width: 16,
  height: 16,
  comps: [{
    type: "shape",
    background: "rgb(255,255,255)",
    borderWidth: 1,
    borderColor: "rgb(51,153,255)",
    borderCap: "round",
    shadowColor: "#1ABC9C",
    points: [2.35891, 10.47175, 3.3125, 6.30284, 15.5, 6.30284, 13.625, 14.5, .5,
      14.5, .5, 1.5, 6.125, 1.5, 7.0625, 3.2289, 12.6875, 3.2289, 12.6875, 6.30284]
  }]
});
ht.Default.setImage("editor.dir", {
  background: "rgb(227,227,227)",
  width: 20,
  height: 20,
  fitSize: true,
  cacheRule: true,
  comps: [{
    type: "shape",
    background: "#FFCC99",
    borderWidth: 1,
    borderColor: "rgb(255,255,255)",
    borderCap: "round",
    points: [19, 4, 19, 18, 1, 18, 1, 2, 8.71429, 2, 10, 4, 19, 4]
  }, {
    type: "rect",
    shadow: true,
    shadowColor: "rgba(0,0,0,0.4)",
    shadowBlur: 2,
    shadowOffsetX: 0,
    shadowOffsetY: 1,
    background: "rgb(255,255,255)",
    borderColor: "#979797",
    rotation: 6.28319,
    rect: [2.98273, 5.998, 13.98346, 9.99004]
  }, {
    type: "shape",
    background: "rgba(255,255,153,0.3)",
    borderColor: "rgb(255,255,255)",
    borderCap: "round",
    points: [18, 9, 18, 17, 2, 17, 2, 9, 18, 9]
  }, {
    type: "rect",
    shadowColor: "rgb(0,0,0)",
    shadowBlur: 2,
    shadowOffsetX: 0,
    shadowOffsetY: 1,
    background: "rgb(232,230,230)",
    borderColor: "#979797",
    rotation: 6.28319,
    rect: [4, 7, 11.98532, 1.06039]
  }]
});
ht.Default.setImage("editor.dxf", {
  width: 64,
  height: 64,
  fitSize: true,
  comps: [{
    type: "shape",
    shadowColor: "#1ABC9C",
    background: "#000000",
    points: [25.13334, 60.62742, 20.38001, 60.62742, 20.11302, 60.62742, 19.89504, 60.41688,
      19.89504, 60.15453, 19.89504, 43.31796, 19.89504, 43.05561, 20.11302, 42.84507,
      20.38001, 42.84507, 25.13334, 42.84507, 30.66329, 42.84507, 33.35167, 45.67873,
      33.35167, 51.50916, 33.35167, 57.47593, 30.51009, 60.62742, 25.13334, 60.62742,
      25.13334, 60.62742, 23.32783, 57.5939, 25.03463, 57.5939, 28.43349, 57.5939,
      29.82018, 55.90554, 29.82018, 51.77117, 29.82018, 47.64415, 28.35946, 45.88193,
      24.93627, 45.88193, 23.32783, 45.88193, 23.32783, 57.5939, 23.32783, 57.5939],
    segments: [1, 2, 4, 2, 4, 2, 4, 4, 2, 1, 2, 4, 4, 2, 2, 2]
  }, {
    type: "shape",
    shadowColor: "#1ABC9C",
    background: "#000000",
    points: [48.10416, 60.62742, 45.1488, 60.62742, 44.97846, 60.62742, 44.82286, 60.54254,
      44.73581, 60.40217, 40.95446, 54.3465, 37.26771, 60.39482, 37.1786, 60.53886, 37.01957,
      60.62776, 36.84889, 60.62776, 34.01657, 60.62776, 33.84041, 60.62776, 33.67761, 60.53552,
      33.59227, 60.38379, 33.50693, 60.2324, 33.51275, 60.04759, 33.60735, 59.89987, 39.05608,
      51.53522, 33.90312, 43.56961, 33.80853, 43.42557, 33.8027, 43.24076, 33.88804, 43.08937,
      33.97338, 42.93797, 34.13618, 42.8454, 34.31235, 42.8454, 37.31706, 42.8454, 37.4874,
      42.8454, 37.64677, 42.93396, 37.73382, 43.078, 41.14399, 48.68284, 44.48219, 43.08168,
      44.56924, 42.93396, 44.72861, 42.84507, 44.90272, 42.84507, 47.73299, 42.84507, 47.91121,
      42.84507, 48.074, 42.93731, 48.15729, 43.08903, 48.24434, 43.24042, 48.2368, 43.42524, 48.14221,
      43.56928, 43.03826, 51.48342, 48.51339, 59.89987, 48.60798, 60.04759, 48.61552, 60.2324, 48.52847,
      60.38379, 48.44518, 60.53485, 48.28238, 60.62742, 48.10416, 60.62742, 48.10416, 60.62742],
    segments: [1, 2, 4, 2, 2, 4, 2, 4, 4, 2, 2, 4, 4, 2, 4, 2, 2, 4, 2, 4, 4, 2, 2, 4, 4, 2]
  }, {
    type: "shape",
    shadowColor: "#1ABC9C",
    background: "#000000",
    points: [53.17006, 60.62742, 50.68081, 60.62742, 50.41177, 60.62742, 50.19585, 60.41688, 50.19585,
      60.15453, 50.19585, 43.31796, 50.19585, 43.05561, 50.41177, 42.84507, 50.68081, 42.84507, 60.09288,
      42.84507, 60.36192, 42.84507, 60.57784, 43.05561, 60.57784, 43.31796, 60.57784, 45.40904, 60.57784,
      45.67138, 60.36192, 45.88193, 60.09288, 45.88193, 53.65537, 45.88193, 53.65537, 50.62587, 59.22886,
      50.62587, 59.4979, 50.62587, 59.71382, 50.83642, 59.71382, 51.09876, 59.71382, 53.18984, 59.71382,
      53.45219, 59.4979, 53.66273, 59.22886, 53.66273, 53.65537, 53.66273, 53.65537, 60.1542, 53.65537,
      60.41688, 53.43911, 60.62742, 53.17006, 60.62742, 53.17006, 60.62742],
    segments: [1, 2, 4, 2, 4, 2, 4, 2, 4, 2, 2, 2, 4, 2, 4, 2, 2, 4, 2]
  }, {
    type: "shape",
    shadowColor: "#1ABC9C",
    background: "#000000",
    points: [56.21111, 19.11398, 40.59837, 2.34525, 40.23096, 1.94622, 39.70418, 1.92216, 39.15478, 1.92216,
      8.11505, 1.92216, 7.04265, 1.92216, 6.07649, 2.35795, 6.07649, 3.40366, 6.07649, 60.1542, 6.07649,
      61.1999, 7.04299, 62.07784, 8.11505, 62.07784, 13.93496, 62.07784, 15.00736, 62.07784, 15.87481,
      61.28546, 15.87481, 60.23975, 15.87481, 59.19405, 15.00702, 58.40166, 13.93496, 58.40166, 9.84618,
      58.40166, 9.84618, 5.59867, 35.20824, 5.59867, 35.20824, 21.86677, 35.20824, 22.91248, 36.27174,
      23.64538, 37.3438, 23.64538, 52.6875, 23.64538, 52.6875, 35.56255, 52.6875, 36.60826, 53.67148,
      37.45412, 54.74388, 37.45412, 55.81629, 37.45412, 56.80027, 36.60793, 56.80027, 35.56255, 56.80027,
      20.28301, 56.80027, 19.81747, 56.52917, 19.46155, 56.21111, 19.11398, 56.21111, 19.11398, 39.32101,
      6.67546, 51.68947, 19.9692, 39.32101, 19.9692, 39.32101, 6.67546, 39.32101, 6.67546],
    segments: [1, 2, 4, 2, 4, 2, 4, 2, 4, 4, 2, 2, 2, 2, 4, 2, 2, 4, 4, 2, 4, 2, 1, 2, 2, 2, 2]
  }]
});
ht.Default.setImage("editor.obj", {
  width: 64,
  height: 64,
  fitSize: true,
  attachStyle: "close",
  comps: [{
    type: "shape",
    background: "rgb(0,0,0)",
    points: [56.21111, 19.11398, 40.59837, 2.34525, 40.23096, 1.94622, 39.70418, 1.92216, 39.15478, 1.92216, 8.11505,
      1.92216, 7.04265, 1.92216, 6.07649, 2.35795, 6.07649, 3.40366, 6.07649, 60.1542, 6.07649, 61.1999, 7.04299,
      62.07784, 8.11505, 62.07784, 13.93496, 62.07784, 15.00736, 62.07784, 15.87481, 61.28546, 15.87481, 60.23975,
      15.87481, 59.19405, 15.00702, 58.40166, 13.93496, 58.40166, 9.84618, 58.40166, 9.84618, 5.59867, 35.20824,
      5.59867, 35.20824, 21.86677, 35.20824, 22.91248, 36.27174, 23.64538, 37.3438, 23.64538, 52.6875, 23.64538,
      52.6875, 35.56255, 52.6875, 36.60826, 53.67148, 37.45412, 54.74388, 37.45412, 55.81629, 37.45412, 56.80027,
      36.60793, 56.80027, 35.56255, 56.80027, 20.28301, 56.80027, 19.81747, 56.52917, 19.46155, 56.21111, 19.11398,
      56.21111, 19.11398, 39.32101, 6.67546, 51.68947, 19.9692, 39.32101, 19.9692, 39.32101, 6.67546, 39.32101, 6.67546],
    segments: [1, 2, 4, 2, 4, 2, 4, 2, 4, 4, 2, 2, 2, 2, 4, 2, 2, 4, 4, 2, 4, 2, 1, 2, 2, 2, 2]
  }, {
    type: "shape",
    background: "#000000",
    borderWidth: .5,
    borderColor: "rgb(0,0,0)",
    pixelPerfect: true,
    points: [31.21904, 47.49025, 32.38182, 48.81914, 33.04627, 50.64637, 33.04627, 52.80583, 33.04627, 54.96528, 32.38182,
      56.79251, 31.21904, 58.12141, 29.89014, 59.4503, 28.22903, 60.28086, 26.06957, 60.28086, 23.91012, 60.28086, 22.249,
      59.61642, 20.9201, 58.12141, 19.75732, 56.79251, 19.09287, 54.96528, 19.09287, 52.80583, 19.09287, 50.64637, 19.59121,
      48.81914, 20.9201, 47.49025, 22.08289, 45.99524, 23.91012, 45.33079, 26.06957, 45.33079, 28.22903, 45.33079, 30.05626,
      45.99524, 31.21904, 47.49025, 22.58122, 48.81914, 21.75066, 49.81582, 21.41844, 51.14471, 21.41844, 52.80583, 21.41844,
      54.46695, 21.75066, 55.79584, 22.58122, 56.79251, 23.41178, 57.78919, 24.57456, 58.28752, 26.06957, 58.28752, 27.56458,
      58.28752, 28.72736, 57.78919, 29.55792, 56.79251, 30.38848, 55.79584, 30.7207, 54.46695, 30.7207, 52.80583, 30.7207,
      51.14471, 30.22237, 49.81582, 29.55792, 48.81914, 28.72736, 47.82247, 27.56458, 47.32414, 26.06957, 47.32414, 24.57456,
      47.32414, 23.41178, 47.82247, 22.58122, 48.81914],
    segments: [1, 4, 4, 4, 4, 4, 4, 4, 4, 5, 1, 4, 4, 4, 4, 4, 4, 4, 4, 5]
  }, {
    type: "shape",
    background: "#000000",
    borderWidth: .5,
    borderColor: "rgb(0,0,0)",
    pixelPerfect: true,
    points: [41.68409, 45.66302, 43.01298, 45.66302, 44.17577, 45.99524, 45.00633, 46.65969, 45.83689, 47.32414,
      46.16911, 48.1547, 46.16911, 49.31748, 46.16911, 50.14804, 46.003, 50.81249, 45.50466, 51.31082, 45.17244,
      51.80916, 44.50799, 52.30749, 43.84354, 52.47361, 44.84021, 52.63972, 45.50466, 52.97194, 46.003, 53.63639,
      46.50133, 54.13472, 46.66745, 54.96528, 46.66745, 55.96195, 46.66745, 57.45696, 46.16911, 58.45363, 45.17244,
      59.11808, 44.34188, 59.61642, 43.1791, 59.94864, 41.68409, 59.94864, 35.20573, 59.94864, 35.20573, 45.66302,
      41.68409, 45.66302, 37.36518, 51.64305, 41.18575, 51.64305, 42.18242, 51.64305, 42.84687, 51.47693, 43.34521,
      51.14471, 43.84354, 50.81249, 44.00966, 50.14804, 44.00966, 49.48359, 44.00966, 48.81914, 43.84354, 48.32081,
      43.34521, 47.98858, 42.84687, 47.65636, 42.18242, 47.49025, 41.18575, 47.49025, 37.36518, 47.49025, 37.36518,
      51.64305, 37.36518, 58.12141, 41.35186, 58.12141, 42.34854, 58.12141, 43.01298, 57.9553, 43.51132, 57.62307,
      44.17577, 57.29085, 44.50799, 56.6264, 44.50799, 55.79584, 44.50799, 54.96528, 44.17577, 54.30084, 43.67743,
      53.96861, 43.1791, 53.63639, 42.34854, 53.47028, 41.35186, 53.47028, 37.19907, 53.47028, 37.19907, 58.12141],
    segments: [1, 4, 4, 4, 4, 4, 4, 4, 4, 2, 2, 2, 5, 1, 2, 4, 4, 4, 4, 2, 2, 5, 1, 2, 4, 4, 4, 4, 2, 2, 5]
  }, {
    type: "shape",
    background: "#000000",
    borderWidth: .5,
    borderColor: "rgb(0,0,0)",
    pixelPerfect: true,
    points: [56.80027, 45.66302, 56.80027, 55.29751, 56.80027, 56.95863, 56.46805, 58.12141, 55.8036, 58.95197, 54.97304,
      59.78253, 53.81026, 60.28086, 52.14914, 60.28086, 50.65413, 60.28086, 49.65746, 59.94864, 48.99301, 59.11808, 48.16245,
      58.28752, 47.83023, 57.29085, 47.83023, 55.79584, 47.83023, 55.29751, 49.98968, 55.29751, 49.98968, 55.79584, 49.98968,
      57.45696, 50.65413, 58.28752, 52.14914, 58.28752, 52.9797, 58.28752, 53.64414, 57.9553, 53.97637, 57.62307, 54.30859,
      57.12474, 54.4747, 56.46029, 54.4747, 55.29751, 54.4747, 45.66302, 56.80027, 45.66302],
    segments: [1, 2, 4, 4, 4, 4, 2, 2, 2, 4, 4, 4, 2, 2, 5]
  }]
});
ht.Default.setImage("editor.mtl", {
  width: 64,
  height: 64,
  fitSize: true,
  attachStyle: "close",
  comps: [{
    type: "shape",
    background: "rgb(0,0,0)",
    points: [56.21111, 19.11398, 40.59837, 2.34525, 40.23096, 1.94622, 39.70418, 1.92216, 39.15478, 1.92216, 8.11505,
      1.92216, 7.04265, 1.92216, 6.07649, 2.35795, 6.07649, 3.40366, 6.07649, 60.1542, 6.07649, 61.1999, 7.04299,
      62.07784, 8.11505, 62.07784, 13.93496, 62.07784, 15.00736, 62.07784, 15.87481, 61.28546, 15.87481, 60.23975,
      15.87481, 59.19405, 15.00702, 58.40166, 13.93496, 58.40166, 9.84618, 58.40166, 9.84618, 5.59867, 35.20824,
      5.59867, 35.20824, 21.86677, 35.20824, 22.91248, 36.27174, 23.64538, 37.3438, 23.64538, 52.6875, 23.64538,
      52.6875, 35.56255, 52.6875, 36.60826, 53.67148, 37.45412, 54.74388, 37.45412, 55.81629, 37.45412, 56.80027,
      36.60793, 56.80027, 35.56255, 56.80027, 20.28301, 56.80027, 19.81747, 56.52917, 19.46155, 56.21111, 19.11398,
      56.21111, 19.11398, 39.32101, 6.67546, 51.68947, 19.9692, 39.32101, 19.9692, 39.32101, 6.67546, 39.32101, 6.67546],
    segments: [1, 2, 4, 2, 4, 2, 4, 2, 4, 4, 2, 2, 2, 2, 4, 2, 2, 4, 4, 2, 4, 2, 1, 2, 2, 2, 2]
  }, {
    type: "shape",
    background: "#000000",
    borderWidth: .5,
    borderColor: "rgb(0,0,0)",
    pixelPerfect: true,
    points: [21.55794, 45.99697, 26.66087, 57.7337, 26.66087, 57.7337, 31.7638, 45.99697, 34.31526, 45.99697, 34.31526,
      60.62536, 32.10399, 60.62536, 32.10399, 50.24941, 32.10399, 50.24941, 27.68146, 60.62536, 25.81038, 60.62536,
      21.38785, 50.24941, 21.38785, 50.24941, 21.38785, 60.62536, 19.00648, 60.62536, 19.00648, 45.99697, 21.55794, 45.99697],
    segments: [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 5]
  }, {
    type: "shape",
    background: "#000000",
    borderWidth: .5,
    borderColor: "rgb(0,0,0)",
    pixelPerfect: true,
    points: [48.09317, 45.99697, 48.09317, 47.86804, 43.16034, 47.86804, 43.16034, 60.45527, 40.94907,
      60.45527, 40.94907, 47.86804, 36.01624, 47.86804, 36.01624, 45.99697, 48.09317, 45.99697],
    segments: [1, 2, 2, 2, 2, 2, 2, 2, 2, 5]
  }, {
    type: "shape",
    background: "#000000",
    borderWidth: .5,
    borderColor: "rgb(0,0,0)",
    pixelPerfect: true,
    points: [52.00541, 45.99697, 52.00541, 58.58419, 60, 58.58419, 60, 60.45527,
      49.79414, 60.45527, 49.79414, 45.82687, 52.00541, 45.82687],
    segments: [1, 2, 2, 2, 2, 2, 2, 5]
  }]
});
ht.Default.setImage("editor.ui", {
  modified: "Thu Jun 04 2020 09:40:36 GMT+0800 (China Standard Time)",
  width: 16,
  height: 16,
  fitSize: true,
  attachStyle: "close",
  comps: [{
    type: "shape",
    background: "rgb(0,0,0)",
    points: [14.84148, 4.57262, 10.64058, .11253, 10.54173, .0064, 10.39999, 0, 10.25216, 0, 1.90035, 0,
      1.61181, 0, 1.35184, .11591, 1.35184, .39404, 1.35184, 15.48836, 1.35184, 15.76649, 1.6119, 16,
      1.90035, 16, 6.28421, 16, 6.57276, 16, 7.02587, 15.76649, 7.02587, 15.48836, 7.02587, 15.21023,
      6.57267, 15.02222, 6.28421, 15.02222, 2.36615, 15.02222, 2.36615, .97787, 9.19027, .97787, 9.19027,
      5.3048, 9.19027, 5.58293, 9.47642, 5.77787, 9.76488, 5.77787, 13.89338, 5.77787, 13.89338, 8.94755,
      13.89338, 9.22569, 14.15814, 9.45067, 14.44669, 9.45067, 14.73524, 9.45067, 15, 9.2256, 15, 8.94755,
      15, 4.88356, 15, 4.75973, 14.92706, 4.66507, 14.84148, 4.57262, 14.84148, 4.57262, 10.29689, 1.26427,
      13.62485, 4.80009, 10.29689, 4.80009, 10.29689, 1.26427, 10.29689, 1.26427],
    segments: [1, 2, 4, 2, 4, 2, 4, 2, 4, 4, 2, 2, 2, 2, 4, 2, 2, 4, 4, 2, 4, 2, 1, 2, 2, 2, 2]
  }, {
    type: "shape",
    background: "#000000",
    borderWidth: .2,
    borderColor: "rgb(0,0,0)",
    pixelPerfect: true,
    points: [10.74059, 12.112, 10.74059, 14.67455, 10.74059, 15.11636, 10.6512, 15.42564, 10.47242, 15.64655, 10.24894,
      15.86746, 9.93607, 16, 9.48912, 16, 9.08686, 16, 8.81868, 15.91164, 8.6399, 15.69073, 8.41643, 15.46982, 8.32704,
      15.20473, 8.32704, 14.80709, 8.32704, 12.112, 8.90807, 12.112, 8.90807, 14.80709, 8.90807, 15.24891, 9.08686,
      15.46982, 9.48912, 15.46982, 9.71259, 15.46982, 9.89137, 15.38146, 9.98077, 15.29309, 10.07016, 15.16055,
      10.11485, 14.98382, 10.11485, 14.67455, 10.11485, 12.112, 10.74059, 12.112, 10.74059, 12.112],
    segments: [1, 2, 4, 4, 4, 4, 2, 2, 2, 4, 4, 4, 2, 2, 2]
  }, { type: "rect", background: "rgb(0,0,0)", borderColor: "#979797", rect: [11.65679, 12.112, .82321, 3.888] }]
});
ht.Default.setImage("editor.ui-tab", {
  modified: "Thu Jun 04 2020 09:40:36 GMT+0800 (China Standard Time)",
  width: 16,
  height: 16,
  fitSize: true,
  attachStyle: "close",
  comps: [{
    type: "shape",
    background: "rgb(255,255,255)",
    points: [14.84148, 4.57262, 10.64058, .11253, 10.54173, .0064, 10.39999, 0, 10.25216, 0, 1.90035, 0, 1.61181, 0,
      1.35184, .11591, 1.35184, .39404, 1.35184, 15.48836, 1.35184, 15.76649, 1.6119, 16, 1.90035, 16, 6.28421, 16,
      6.57276, 16, 7.02587, 15.76649, 7.02587, 15.48836, 7.02587, 15.21023, 6.57267, 15.02222, 6.28421, 15.02222,
      2.36615, 15.02222, 2.36615, .97787, 9.19027, .97787, 9.19027, 5.3048, 9.19027, 5.58293, 9.47642, 5.77787,
      9.76488, 5.77787, 13.89338, 5.77787, 13.89338, 8.94755, 13.89338, 9.22569, 14.15814, 9.45067, 14.44669, 9.45067,
      14.73524, 9.45067, 15, 9.2256, 15, 8.94755, 15, 4.88356, 15, 4.75973, 14.92706, 4.66507, 14.84148, 4.57262, 14.84148,
      4.57262, 10.29689, 1.26427, 13.62485, 4.80009, 10.29689, 4.80009, 10.29689, 1.26427, 10.29689, 1.26427],
    segments: [1, 2, 4, 2, 4, 2, 4, 2, 4, 4, 2, 2, 2, 2, 4, 2, 2, 4, 4, 2, 4, 2, 1, 2, 2, 2, 2]
  }, {
    type: "shape",
    background: "rgb(255,255,255)",
    borderWidth: .2,
    borderColor: "rgb(255,255,255)",
    pixelPerfect: true,
    points: [10.74059, 12.112, 10.74059, 14.67455, 10.74059, 15.11636, 10.6512, 15.42564, 10.47242, 15.64655,
      10.24894, 15.86746, 9.93607, 16, 9.48912, 16, 9.08686, 16, 8.81868, 15.91164, 8.6399, 15.69073, 8.41643,
      15.46982, 8.32704, 15.20473, 8.32704, 14.80709, 8.32704, 12.112, 8.90807, 12.112, 8.90807, 14.80709, 8.90807,
      15.24891, 9.08686, 15.46982, 9.48912, 15.46982, 9.71259, 15.46982, 9.89137, 15.38146, 9.98077, 15.29309, 10.07016,
      15.16055, 10.11485, 14.98382, 10.11485, 14.67455, 10.11485, 12.112, 10.74059, 12.112, 10.74059, 12.112],
    segments: [1, 2, 4, 4, 4, 4, 2, 2, 2, 4, 4, 4, 2, 2, 2]
  }, { type: "rect", background: "rgb(255,255,255)", rect: [11.65679, 12.112, .82321, 3.888] }]
});
ht.Default.setImage("editor.ttf", {
  width: 64,
  height: 64,
  fitSize: true,
  comps: [{
    type: "shape",
    background: "#000000",
    points: [53.17006, 60.62742, 50.68081, 60.62742, 50.41177, 60.62742, 50.19585, 60.41688, 50.19585, 60.15453, 50.19585,
      43.31796, 50.19585, 43.05561, 50.41177, 42.84507, 50.68081, 42.84507, 60.09288, 42.84507, 60.36192, 42.84507,
      60.57784, 43.05561, 60.57784, 43.31796, 60.57784, 45.40904, 60.57784, 45.67138, 60.36192, 45.88193, 60.09288,
      45.88193, 53.65537, 45.88193, 53.65537, 50.62587, 59.22886, 50.62587, 59.4979, 50.62587, 59.71382, 50.83642,
      59.71382, 51.09876, 59.71382, 53.18984, 59.71382, 53.45219, 59.4979, 53.66273, 59.22886, 53.66273, 53.65537,
      53.66273, 53.65537, 60.1542, 53.65537, 60.41688, 53.43911, 60.62742, 53.17006, 60.62742, 53.17006, 60.62742],
    segments: [1, 2, 4, 2, 4, 2, 4, 2, 4, 2, 2, 2, 4, 2, 4, 2, 2, 4, 2]
  }, {
    type: "shape",
    background: "#000000",
    points: [56.21111, 19.11398, 40.59837, 2.34525, 40.23096, 1.94622, 39.70418, 1.92216, 39.15478, 1.92216, 8.11505,
      1.92216, 7.04265, 1.92216, 6.07649, 2.35795, 6.07649, 3.40366, 6.07649, 60.1542, 6.07649, 61.1999, 7.04299, 62.07784,
      8.11505, 62.07784, 13.93496, 62.07784, 15.00736, 62.07784, 15.87481, 61.28546, 15.87481, 60.23975, 15.87481, 59.19405,
      15.00702, 58.40166, 13.93496, 58.40166, 9.84618, 58.40166, 9.84618, 5.59867, 35.20824, 5.59867, 35.20824, 21.86677,
      35.20824, 22.91248, 36.27174, 23.64538, 37.3438, 23.64538, 52.6875, 23.64538, 52.6875, 35.56255, 52.6875, 36.60826,
      53.67148, 37.45412, 54.74388, 37.45412, 55.81629, 37.45412, 56.80027, 36.60793, 56.80027, 35.56255, 56.80027,
      20.28301, 56.80027, 19.81747, 56.52917, 19.46155, 56.21111, 19.11398, 56.21111, 19.11398, 39.32101, 6.67546,
      51.68947, 19.9692, 39.32101, 19.9692, 39.32101, 6.67546, 39.32101, 6.67546],
    segments: [1, 2, 4, 2, 4, 2, 4, 2, 4, 4, 2, 2, 2, 2, 4, 2, 2, 4, 4, 2, 4, 2, 1, 2, 2, 2, 2]
  }, {
    type: "shape",
    background: "#000000",
    points: [41.52931, 60.62742, 39.04006, 60.62742, 38.77102, 60.62742, 38.5551, 60.41688, 38.5551, 60.15453,
      38.5551, 42.84507, 46.88507, 42.84507, 47.15411, 42.84507, 47.37003, 43.05561, 47.37003, 43.31796,
      47.37003, 45.40904, 47.37003, 45.67138, 47.15411, 45.88193, 46.88507, 45.88193, 42.01462, 45.88193,
      42.01462, 60.1542, 42.01462, 60.41688, 41.79836, 60.62742, 41.52931, 60.62742, 41.52931, 60.62742],
    segments: [1, 2, 4, 2, 2, 4, 2, 4, 2, 2, 4, 2]
  }, {
    type: "shape",
    background: "#000000",
    rotation: 3.14159,
    points: [33.91988, 42.84507, 39.07014, 42.84507, 39.33918, 42.84507, 39.5551, 43.05561, 39.5551, 43.31796,
      39.5551, 45.40904, 39.5551, 45.67138, 39.33918, 45.88193, 39.07014, 45.88193, 33.91988, 45.88193],
    segments: [1, 2, 4, 2, 4, 2]
  }, {
    type: "shape",
    background: "#000000",
    points: [25.11617, 60.62742, 22.62692, 60.62742, 22.35788, 60.62742, 22.14196, 60.41688, 22.14196, 60.15453,
      22.14196, 42.84507, 30.47192, 42.84507, 30.74096, 42.84507, 30.95688, 43.05561, 30.95688, 43.31796, 30.95688,
      45.40904, 30.95688, 45.67138, 30.74096, 45.88193, 30.47192, 45.88193, 25.60148, 45.88193, 25.60148, 60.1542,
      25.60148, 60.41688, 25.38522, 60.62742, 25.11617, 60.62742, 25.11617, 60.62742],
    segments: [1, 2, 4, 2, 2, 4, 2, 4, 2, 2, 4, 2]
  }, {
    type: "shape",
    background: "#000000",
    rotation: 3.14159,
    points: [17.50673, 42.84507, 22.657, 42.84507, 22.92604, 42.84507, 23.14196, 43.05561, 23.14196, 43.31796,
      23.14196, 45.40904, 23.14196, 45.67138, 22.92604, 45.88193, 22.657, 45.88193, 17.50673, 45.88193],
    segments: [1, 2, 4, 2, 4, 2]
  }]
});
ht.Default.setImage("editor.otf", {
  width: 64,
  height: 64,
  fitSize: true,
  comps: [{
    type: "shape",
    background: "#000000",
    points: [53.17006, 60.62742, 50.68081, 60.62742, 50.41177, 60.62742, 50.19585, 60.41688, 50.19585, 60.15453,
      50.19585, 43.31796, 50.19585, 43.05561, 50.41177, 42.84507, 50.68081, 42.84507, 60.09288, 42.84507, 60.36192,
      42.84507, 60.57784, 43.05561, 60.57784, 43.31796, 60.57784, 45.40904, 60.57784, 45.67138, 60.36192, 45.88193,
      60.09288, 45.88193, 53.65537, 45.88193, 53.65537, 50.62587, 59.22886, 50.62587, 59.4979, 50.62587, 59.71382,
      50.83642, 59.71382, 51.09876, 59.71382, 53.18984, 59.71382, 53.45219, 59.4979, 53.66273, 59.22886, 53.66273,
      53.65537, 53.66273, 53.65537, 60.1542, 53.65537, 60.41688, 53.43911, 60.62742, 53.17006, 60.62742, 53.17006, 60.62742],
    segments: [1, 2, 4, 2, 4, 2, 4, 2, 4, 2, 2, 2, 4, 2, 4, 2, 2, 4, 2]
  }, {
    type: "shape",
    background: "#000000",
    points: [56.21111, 19.11398, 40.59837, 2.34525, 40.23096, 1.94622, 39.70418, 1.92216, 39.15478, 1.92216, 8.11505,
      1.92216, 7.04265, 1.92216, 6.07649, 2.35795, 6.07649, 3.40366, 6.07649, 60.1542, 6.07649, 61.1999, 7.04299,
      62.07784, 8.11505, 62.07784, 13.93496, 62.07784, 15.00736, 62.07784, 15.87481, 61.28546, 15.87481, 60.23975,
      15.87481, 59.19405, 15.00702, 58.40166, 13.93496, 58.40166, 9.84618, 58.40166, 9.84618, 5.59867, 35.20824,
      5.59867, 35.20824, 21.86677, 35.20824, 22.91248, 36.27174, 23.64538, 37.3438, 23.64538, 52.6875, 23.64538,
      52.6875, 35.56255, 52.6875, 36.60826, 53.67148, 37.45412, 54.74388, 37.45412, 55.81629, 37.45412, 56.80027,
      36.60793, 56.80027, 35.56255, 56.80027, 20.28301, 56.80027, 19.81747, 56.52917, 19.46155, 56.21111, 19.11398,
      56.21111, 19.11398, 39.32101, 6.67546, 51.68947, 19.9692, 39.32101, 19.9692, 39.32101, 6.67546, 39.32101, 6.67546],
    segments: [1, 2, 4, 2, 4, 2, 4, 2, 4, 4, 2, 2, 2, 2, 4, 2, 2, 4, 4, 2, 4, 2, 1, 2, 2, 2, 2]
  }, {
    type: "shape",
    background: "#000000",
    points: [41.52931, 60.62742, 39.04006, 60.62742, 38.77102, 60.62742, 38.5551, 60.41688, 38.5551, 60.15453,
      38.5551, 42.84507, 46.88507, 42.84507, 47.15411, 42.84507, 47.37003, 43.05561, 47.37003, 43.31796, 47.37003,
      45.40904, 47.37003, 45.67138, 47.15411, 45.88193, 46.88507, 45.88193, 42.01462, 45.88193, 42.01462, 60.1542,
      42.01462, 60.41688, 41.79836, 60.62742, 41.52931, 60.62742, 41.52931, 60.62742],
    segments: [1, 2, 4, 2, 2, 4, 2, 4, 2, 2, 4, 2]
  }, {
    type: "shape",
    background: "#000000",
    rotation: 3.14159,
    points: [33.91988, 42.84507, 39.07014, 42.84507, 39.33918, 42.84507, 39.5551, 43.05561, 39.5551, 43.31796,
      39.5551, 45.40904, 39.5551, 45.67138, 39.33918, 45.88193, 39.07014, 45.88193, 33.91988, 45.88193],
    segments: [1, 2, 4, 2, 4, 2]
  }, { type: "oval", borderWidth: 3.3, borderColor: "rgb(0,0,0)", rect: [18.97543, 44.76232, 11.82189, 13.94784] }]
});
ht.Default.setImage("editor.js", {
  width: 64,
  height: 64,
  fitSize: true,
  comps: [{
    type: "shape",
    background: "#000000",
    points: [56.21111, 19.11398, 40.59837, 2.34525, 40.23096, 1.94622, 39.70418, 1.92216, 39.15478, 1.92216,
      8.11505, 1.92216, 7.04265, 1.92216, 6.07649, 2.35795, 6.07649, 3.40366, 6.07649, 60.1542, 6.07649,
      61.1999, 7.04299, 62.07784, 8.11505, 62.07784, 13.93496, 62.07784, 15.00736, 62.07784, 15.87481,
      61.28546, 15.87481, 60.23975, 15.87481, 59.19405, 15.00702, 58.40166, 13.93496, 58.40166, 9.84618,
      58.40166, 9.84618, 5.59867, 35.20824, 5.59867, 35.20824, 21.86677, 35.20824, 22.91248, 36.27174,
      23.64538, 37.3438, 23.64538, 52.6875, 23.64538, 52.6875, 35.56255, 52.6875, 36.60826, 53.67148,
      37.45412, 54.74388, 37.45412, 55.81629, 37.45412, 56.80027, 36.60793, 56.80027, 35.56255, 56.80027,
      20.28301, 56.80027, 19.81747, 56.52917, 19.46155, 56.21111, 19.11398, 56.21111, 19.11398, 39.32101,
      6.67546, 51.68947, 19.9692, 39.32101, 19.9692, 39.32101, 6.67546, 39.32101, 6.67546],
    segments: [1, 2, 4, 2, 4, 2, 4, 2, 4, 4, 2, 2, 2, 2, 4, 2, 2, 4, 4, 2, 4, 2, 1, 2, 2, 2, 2]
  }, {
    type: "text",
    text: { func: "attr@name", value: "JS" },
    align: "center",
    font: "bold 24px Arial Rounded MT Bold",
    rect: [17.50673, 40.58187, 46.49327, 23.41813]
  }]
});
ht.Default.setImage("editor.sound", {
  width: 64,
  height: 64,
  fitSize: true,
  comps: [{
    type: "shape",
    background: "#000000",
    points: [56.21111, 19.11398, 40.59837, 2.34525, 40.23096, 1.94622, 39.70418, 1.92216, 39.15478, 1.92216,
      8.11505, 1.92216, 7.04265, 1.92216, 6.07649, 2.35795, 6.07649, 3.40366, 6.07649, 60.1542, 6.07649,
      61.1999, 7.04299, 62.07784, 8.11505, 62.07784, 13.93496, 62.07784, 15.00736, 62.07784, 15.87481,
      61.28546, 15.87481, 60.23975, 15.87481, 59.19405, 15.00702, 58.40166, 13.93496, 58.40166, 9.84618,
      58.40166, 9.84618, 5.59867, 35.20824, 5.59867, 35.20824, 21.86677, 35.20824, 22.91248, 36.27174,
      23.64538, 37.3438, 23.64538, 52.6875, 23.64538, 52.6875, 35.56255, 52.6875, 36.60826, 53.67148,
      37.45412, 54.74388, 37.45412, 55.81629, 37.45412, 56.80027, 36.60793, 56.80027, 35.56255, 56.80027,
      20.28301, 56.80027, 19.81747, 56.52917, 19.46155, 56.21111, 19.11398, 56.21111, 19.11398, 39.32101,
      6.67546, 51.68947, 19.9692, 39.32101, 19.9692, 39.32101, 6.67546, 39.32101, 6.67546],
    segments: [1, 2, 4, 2, 4, 2, 4, 2, 4, 4, 2, 2, 2, 2, 4, 2, 2, 4, 4, 2, 4, 2, 1, 2, 2, 2, 2]
  }, {
    type: "shape",
    background: "#231815",
    points: [29.93506, 40.65719, 29.93506, 52.11129, 29.99768, 52.17391, 38.01482, 58.31199, 38.01482,
      53.06642, 38.01482, 39.70982, 38.01482, 34.45641, 29.93506, 40.65719, 29.93506, 40.65719,
      29.93506, 40.65719, 29.93506, 40.65719, 44.44257, 36.03797, 44.44257, 36.03797, 43.87107,
      35.70912, 43.69881, 34.9732, 44.02766, 34.40163, 44.37211, 33.84573, 45.10803, 33.65787, 45.66393,
      33.99448, 47.80131, 35.26287, 49.59417, 37.09491, 50.81553, 39.2714, 52.01338, 41.37743, 52.71019,
      43.80448, 52.71019, 46.38028, 52.71019, 48.95608, 52.01338, 51.38313, 50.81553, 53.48924, 49.59417,
      55.65789, 47.80131, 57.49777, 45.66393, 58.77392, 45.10803, 59.1262, 44.37211, 58.93834, 44.02766,
      58.35901, 43.69881, 57.79528, 43.87107, 57.05152, 44.44257, 56.7305, 46.24326, 55.65789, 47.71518,
      54.13119, 48.7486, 52.32266, 49.73508, 50.57675, 50.30665, 48.55685, 50.30665, 46.38812, 50.30665,
      44.23514, 49.72724, 42.19948, 48.7486, 40.46141, 47.71518, 38.63721, 46.23542, 37.10275, 44.44257,
      36.03797, 44.44257, 36.03797, 44.44257, 36.03797, 28.49449, 40.89991, 28.49449, 40.89991, 23.62472,
      40.89991, 23.62472, 51.86073, 28.49449, 51.86073, 28.49449, 40.89991, 28.49449, 40.89991, 28.49449,
      40.89991, 28.80767, 38.51197, 28.80767, 38.51197, 38.42189, 31.14469, 38.64118, 30.96459, 38.91517,
      30.86286, 39.21267, 30.86286, 39.88597, 30.86286, 40.41052, 31.38741, 40.41052, 32.05287, 40.41052,
      39.70982, 40.41052, 39.97605, 41.53008, 40.43014, 42.47745, 41.16606, 43.21337, 42.09776, 44.14506,
      43.28777, 44.7088, 44.76753, 44.7088, 46.38812, 44.7088, 48.00879, 44.1529, 49.50414, 43.21337, 50.67856,
      42.50096, 51.61017, 41.53008, 52.33834, 40.41052, 52.80027, 40.41052, 53.07426, 40.41052, 60.72336, 40.41052,
      60.99743, 40.32439, 61.24015, 40.1678, 61.45936, 39.76073, 61.97607, 39.01698, 62.07788, 38.50019, 61.67073,
      28.82334, 54.25651, 22.46606, 54.25651, 22.43471, 54.25651, 21.77708, 54.25651, 21.23686, 53.72412, 21.23686,
      53.06642, 21.23686, 39.73333, 21.23686, 39.70982, 21.23686, 39.04435, 21.76924, 38.51197, 22.43471, 38.51197,
      28.80767, 38.51197, 28.80767, 38.51197, 28.80767, 38.51197, 40.40269, 41.5497, 40.40269, 41.5497, 40.40269,
      51.21878, 41.06823, 50.85858, 41.62405, 50.37322, 42.08598, 49.79381, 42.8219, 48.86219, 43.26039, 47.6721,
      43.26039, 46.38812, 43.26039, 45.11197, 42.81414, 43.92196, 42.08598, 42.98243, 41.62405, 42.39526, 41.06039,
      41.90982, 40.40269, 41.5497, 40.40269, 41.5497, 40.40269, 41.5497],
    segments: [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 2, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 2, 2, 1, 2, 2, 2, 2, 2,
      2, 2, 1, 2, 2, 4, 4, 2, 2, 4, 4, 4, 4, 2, 2, 4, 4, 2, 2, 2, 4, 2, 2, 4, 2, 2, 2, 1, 2, 2, 4, 4, 4, 4, 2, 2]
  }]
});
ht.Default.setImage("editor.video", {
  width: 64,
  height: 64,
  fitSize: true,
  comps: [{
    type: "shape",
    background: "#000000",
    points: [56.21111, 19.11398, 40.59837, 2.34525, 40.23096, 1.94622, 39.70418, 1.92216, 39.15478, 1.92216, 8.11505,
      1.92216, 7.04265, 1.92216, 6.07649, 2.35795, 6.07649, 3.40366, 6.07649, 60.1542, 6.07649, 61.1999, 7.04299, 62.07784,
      8.11505, 62.07784, 13.93496, 62.07784, 15.00736, 62.07784, 15.87481, 61.28546, 15.87481, 60.23975, 15.87481,
      59.19405, 15.00702, 58.40166, 13.93496, 58.40166, 9.84618, 58.40166, 9.84618, 5.59867, 35.20824, 5.59867,
      35.20824, 21.86677, 35.20824, 22.91248, 36.27174, 23.64538, 37.3438, 23.64538, 52.6875, 23.64538, 52.6875,
      35.56255, 52.6875, 36.60826, 53.67148, 37.45412, 54.74388, 37.45412, 55.81629, 37.45412, 56.80027, 36.60793,
      56.80027, 35.56255, 56.80027, 20.28301, 56.80027, 19.81747, 56.52917, 19.46155, 56.21111, 19.11398, 56.21111,
      19.11398, 39.32101, 6.67546, 51.68947, 19.9692, 39.32101, 19.9692, 39.32101, 6.67546, 39.32101, 6.67546],
    segments: [1, 2, 4, 2, 4, 2, 4, 2, 4, 4, 2, 2, 2, 2, 4, 2, 2, 4, 4, 2, 4, 2, 1, 2, 2, 2, 2]
  }, {
    type: "shape",
    background: "#231815",
    points: [34.79567, 39.50193, 35.8771, 39.50193, 36.86394, 39.06777, 37.56645, 38.36518, 38.28485, 37.63888, 38.7269,
      36.65212, 38.7269, 35.57851, 38.7269, 34.497, 38.28485, 33.51024, 37.56645, 32.80765, 36.86394, 32.08933, 35.86927,
      31.6472, 34.79567, 31.6472, 33.70626, 31.6472, 32.7274, 32.08933, 32.0169, 32.80765, 31.30641, 33.51024, 30.86435,
      34.497, 30.86435, 35.57851, 30.86435, 36.65212, 31.30641, 37.63888, 32.0169, 38.36518, 32.7274, 39.05987, 33.71416,
      39.50193, 34.79567, 39.50193, 34.79567, 39.50193, 34.79567, 39.50193, 33.03527, 33.81021, 33.03527, 33.81021, 33.47733,
      33.36816, 34.10098, 33.08399, 34.79567, 33.08399, 35.48246, 33.08399, 36.0982, 33.36816, 36.54816, 33.81021, 36.99022,
      34.26807, 37.27438, 34.88382, 37.27438, 35.57061, 37.27438, 36.2574, 36.99022, 36.87315, 36.54816, 37.33101, 36.0982,
      37.76524, 35.48246, 38.0494, 34.79567, 38.0494, 34.10098, 38.0494, 33.47733, 37.76524, 33.03527, 37.33101, 32.59314,
      36.87315, 32.31687, 36.2574, 32.31687, 35.57061, 32.31687, 34.88382, 32.59314, 34.27598, 33.03527, 33.81021, 33.03527,
      33.81021, 33.03527, 33.81021, 38.719, 42.35963, 38.719, 42.35963, 39.05848, 43.38583, 39.77688, 44.19107, 40.6768,
      44.64103, 42.60298, 45.61989, 44.97913, 44.84625, 45.95008, 42.92007, 46.40794, 42.02015, 46.53422, 40.94655, 46.17901,
      39.92027, 45.86323, 38.89408, 45.14484, 38.08884, 44.23702, 37.63888, 43.33711, 37.18892, 42.2714, 37.06264, 41.24513,
      37.40995, 40.21894, 37.74943, 39.39789, 38.46775, 38.95583, 39.35984, 38.49007, 40.25185, 38.3796, 41.32546, 38.719,
      42.35963, 38.719, 42.35963, 38.719, 42.35963, 40.24257, 40.02292, 40.24257, 40.02292, 40.53471, 39.44669, 41.04781,
      38.99665, 41.68726, 38.77563, 42.33454, 38.5704, 43.02923, 38.64144, 43.58184, 38.93351, 44.15808, 39.22558, 44.60803,
      39.72295, 44.82124, 40.38604, 45.03436, 41.03339, 44.96332, 41.70438, 44.67907, 42.28851, 44.06341, 43.50428, 42.55557,
      43.98577, 41.33198, 43.3543, 40.77937, 43.07005, 40.30578, 42.56486, 40.10048, 41.9175, 39.87945, 41.25442, 39.9663,
      40.58343, 40.24257, 40.02292, 40.24257, 40.02292, 40.24257, 40.02292, 40.13209, 46.26716, 40.13209, 46.26716, 39.16114,
      46.10935, 38.09543, 46.33828, 37.21915, 46.96976, 36.34286, 47.61711, 35.80606, 48.54073, 35.65607, 49.5354, 35.65607,
      49.5354, 35.50608, 50.53006, 35.71929, 51.57996, 36.35076, 52.46415, 36.98231, 53.33245, 37.89803, 53.86926, 38.89269,
      54.02714, 38.9243, 54.02714, 41.04781, 54.38235, 43.08447, 52.8904, 43.42395, 50.76689, 43.42395, 50.75899, 43.56604,
      49.76433, 43.34501, 48.71435, 42.71346, 47.84604, 42.06618, 46.96976, 41.14256, 46.42505, 40.13209, 46.26716, 40.13209,
      46.26716, 40.13209, 46.26716, 39.14533, 52.60623, 39.14533, 52.60623, 39.12953, 52.59833, 38.49797, 52.49568, 37.91384,
      52.1641, 37.51912, 51.61157, 37.1244, 51.05896, 36.97441, 50.38798, 37.07706, 49.75642, 37.17181, 49.13278, 37.51912,
      48.54073, 38.07172, 48.13021, 38.62433, 47.73549, 39.30322, 47.60131, 39.93469, 47.69606, 40.55044, 47.79081, 41.15046,
      48.13021, 41.5451, 48.69072, 41.94772, 49.24333, 42.08981, 49.91431, 41.98724, 50.53796, 41.77403, 51.87993, 40.4794,
      52.81936, 39.14533, 52.60623, 39.14533, 52.60623, 39.14533, 52.60623, 49.24984, 57.84791, 49.24984, 57.84791, 41.37939,
      57.84791, 46.82629, 55.31388, 50.46553, 49.76433, 50.46553, 43.63056, 50.46553, 39.30453, 48.70514, 35.38909, 45.86323,
      32.54719, 43.03714, 29.72109, 39.12162, 27.9607, 34.79567, 27.9607, 26.1594, 27.9607, 19.12572, 34.99437, 19.12572, 43.63056,
      19.12572, 47.94079, 20.88612, 51.87993, 23.71222, 54.69813, 26.54622, 57.54003, 30.46963, 59.30043, 34.79567, 59.30043,
      35.20611, 59.30043, 35.29296, 59.30043, 49.24984, 59.30043, 49.64456, 59.30043, 49.96816, 58.96893, 49.96816, 58.57421,
      49.96816, 58.17158, 49.64456, 57.84791, 49.24984, 57.84791, 49.24984, 57.84791, 49.24984, 57.84791, 34.79567, 56.88485,
      34.79567, 56.88485, 31.13271, 56.88485, 27.81723, 55.39282, 25.42528, 53.00087, 23.01761, 50.5853, 21.54138, 47.28553,
      21.54138, 43.62266, 21.54138, 36.34425, 27.51725, 30.36837, 34.79567, 30.36837, 38.45064, 30.36837, 41.77403, 31.8525,
      44.15808, 34.25227, 46.56583, 36.64422, 48.04206, 39.96769, 48.04206, 43.62266, 48.04206, 47.28553, 46.55793, 50.6011,
      44.16598, 53.00087, 41.68726, 55.48757, 38.30856, 56.88485, 34.79567, 56.88485, 34.79567, 56.88485, 34.79567, 56.88485,
      28.91446, 44.64103, 28.91446, 44.64103, 29.80655, 44.18317, 30.54067, 43.38583, 30.86435, 42.35173, 31.19593, 41.32546,
      31.08538, 40.25976, 30.63542, 39.35984, 29.67237, 37.44156, 27.25672, 36.66002, 25.35424, 37.63888, 23.42015, 38.62564,
      22.64651, 41.00178, 23.62545, 42.92007, 24.07541, 43.81998, 24.88057, 44.53838, 25.90684, 44.86206, 26.94884, 45.20146,
      28.02245, 45.09889, 28.91446, 44.64103, 28.91446, 44.64103, 28.91446, 44.64103, 26.3647, 43.51211, 26.3647, 43.51211,
      25.71735, 43.29108, 25.20425, 42.82532, 24.91218, 42.28069, 24.29643, 41.0492, 24.79373, 39.54136, 26.00942, 38.92561,
      27.22519, 38.30986, 28.73294, 38.79143, 29.34869, 40.02292, 29.63286, 40.59134, 29.7118, 41.25442, 29.50658, 41.90178,
      29.28555, 42.54905, 28.81979, 43.06215, 28.27509, 43.34639, 27.69877, 43.63056, 27.01198, 43.71741, 26.3647, 43.51211,
      26.3647, 43.51211, 26.3647, 43.51211, 29.44344, 46.26716, 29.44344, 46.26716, 27.31195, 46.59874, 25.85153, 48.61178,
      26.17521, 50.72738, 26.17521, 50.75899, 26.33309, 51.75365, 26.8778, 52.69308, 27.73828, 53.32455, 28.59876, 53.9561,
      29.66447, 54.17713, 30.62752, 54.02714, 30.66703, 54.01924, 32.80634, 53.67194, 34.25886, 51.66681, 33.92728, 49.52749,
      33.60361, 47.39609, 31.58275, 45.94356, 29.44344, 46.26716, 29.44344, 46.26716, 29.44344, 46.26716, 32.50637, 49.75642,
      32.50637, 49.75642, 32.7274, 51.1063, 31.80378, 52.39303, 30.44593, 52.60623, 30.4223, 52.61413, 29.79865, 52.7009,
      29.13557, 52.55091, 28.59086, 52.14837, 28.04616, 51.75365, 27.69877, 51.15371, 27.5962, 50.53006, 27.5962, 50.50635,
      27.3909, 49.17229, 28.33032, 47.90128, 29.66447, 47.69606, 31.00644, 47.48293, 32.29317, 48.40655, 32.50637, 49.75642,
      32.50637, 49.75642, 32.50637, 49.75642, 32.50637, 49.75642, 37.44808, 43.63056, 37.44808, 43.63056, 37.44808, 42.89644,
      37.1481, 42.22537, 36.67444, 41.75171, 36.18497, 41.27022, 35.52189, 40.96235, 34.79567, 40.96235, 34.06147, 40.96235,
      33.39048, 41.27022, 32.90891, 41.75171, 32.43525, 42.23328, 32.14318, 42.89644, 32.14318, 43.63056, 32.14318, 44.36469,
      32.43525, 45.02785, 32.90891, 45.50933, 33.39838, 45.983, 34.06147, 46.28297, 34.79567, 46.28297, 36.25609, 46.28297,
      37.44808, 45.08308, 37.44808, 43.63056, 37.44808, 43.63056, 37.44808, 43.63056, 34.79567, 44.83835, 34.79567, 44.83835,
      34.45619, 44.83835, 34.14831, 44.71207, 33.93519, 44.49104, 33.71416, 44.28574, 33.5878, 43.96997, 33.5878, 43.63846,
      33.5878, 43.31479, 33.71416, 42.99901, 33.93519, 42.77798, 34.14831, 42.56486, 34.45619, 42.42277, 34.79567, 42.42277,
      35.11927, 42.42277, 35.42714, 42.55695, 35.64817, 42.77798, 35.86927, 42.99901, 36.01136, 43.31479, 36.01136, 43.63846,
      36.01136, 44.30155, 35.46665, 44.83835, 34.79567, 44.83835, 34.79567, 44.83835, 34.79567, 44.83835],
    segments: [1, 4, 4, 4, 4, 4, 4, 4, 4, 2, 2, 1, 2, 4, 4, 4, 4, 4, 4, 4, 4, 2, 2, 1, 2, 4, 4, 4, 4, 4,
      4, 4, 2, 2, 1, 2, 4, 4, 4, 4, 4, 4, 4, 2, 2, 1, 2, 4, 4, 2, 4, 4, 2, 4, 2, 4, 4, 2, 2, 1, 2, 2, 4,
      4, 4, 4, 4, 4, 4, 2, 2, 1, 2, 2, 4, 4, 4, 4, 4, 4, 2, 2, 2, 4, 4, 2, 2, 1, 2, 4, 4, 4, 4, 4, 4, 4,
      2, 2, 1, 2, 4, 4, 4, 4, 4, 4, 2, 2, 1, 2, 4, 4, 4, 4, 4, 4, 2, 2, 1, 2, 4, 2, 4, 4, 2, 4, 4, 2, 2,
      1, 2, 4, 2, 4, 4, 2, 4, 4, 2, 2, 2, 1, 2, 4, 4, 4, 4, 4, 4, 4, 2, 2, 1, 2, 4, 4, 4, 4, 4, 4, 4, 2, 2]
  }]
});
ht.Default.setImage("editor.flipx", {
  width: 16,
  height: 16,
  comps: [{
    type: "shape",
    points: [8, 1, 8, 14],
    segments: [1, 2],
    borderWidth: 1,
    borderColor: config.color_dark
  }, { type: "shape", points: [6, 3, 6, 13, 2, 13], background: config.color_dark }, {
    type: "shape",
    points: [10, 3, 10, 13, 14, 13],
    background: config.color_select
  }]
});
ht.Default.setImage("editor.flipy", {
  width: 16,
  height: 16,
  comps: [{
    type: "shape",
    points: [2, 8, 15, 8],
    segments: [1, 2],
    borderWidth: 1,
    borderColor: config.color_dark
  }, { type: "shape", points: [3, 6, 13, 6, 3, 2], background: config.color_dark }, {
    type: "shape",
    points: [3, 10, 13, 10, 3, 14],
    background: config.color_select
  }]
});
ht.Default.setImage("editor.resetsize", {
  width: 16,
  height: 16,
  comps: [{
    type: "shape",
    borderWidth: 1,
    borderColor: "white",
    points: [8, 1, 8, 6, 6, 3, 8, 1, 10, 3, 8, 10, 8, 15, 6, 13, 8, 15, 10,
      13, 1, 8, 6, 8, 3, 6, 1, 8, 3, 10, 10, 8, 15, 8, 13, 6, 15, 8, 13, 10],
    segments: [1, 2, 1, 2, 2, 1, 2, 1, 2, 2, 1, 2, 1, 2, 2, 1, 2, 1, 2, 2]
  }]
});
ht.Default.setImage("editor.func", {
  width: 16,
  height: 16,
  comps: [{ type: "border", rect: [0, 0, 16, 16], width: 1, color: "#E4E4E4" }, {
    type: "text",
    rect: [0, 0, 16, 16],
    text: "F",
    align: "center",
    color: "black"
  }]
});
ht.Default.setImage("editor.comp", {
  fitSize: true, comps: [{
    type: {
      func: function (p) {
        return p.compType
      },
      isSafeFunc: true
    }
  }]
});
ht.Default.setImage("editor.oops", {
  width: 128,
  height: 128,
  comps: [{
    type: "oval",
    background: "rgb(255,255,255)",
    borderWidth: 2,
    borderColor: "rgb(61,61,61)",
    rect: [21.53429, 22.96531, 88.8981, 74.69064]
  }, {
    type: "shape",
    background: "rgb(237,237,237)",
    borderColor: "#979797",
    points: [34.08079, 87.52544, 34.08079, 87.52544, 59.57908, 97.75645, 77.79215, 90.58303, 96.00522,
      83.40961, 106.8249, 68.87436, 109.71641, 51.69689, 109.71641, 51.69689, 117.89865, 74.48774,
      101.34821, 87.52544, 84.79777, 100.56314, 59.50721, 102.27801, 46.42474, 94.29524],
    segments: [1, 4, 4, 4, 4]
  }, {
    type: "arc",
    background: "rgb(196,185,185)",
    borderColor: "rgb(61,61,61)",
    arcTo: 0,
    arcOval: true,
    rotation: 3.14159,
    rect: [32.3979, 36.49467, 28.49791, 18.12387]
  }, {
    type: "arc",
    background: "rgb(196,185,185)",
    borderColor: "rgb(61,61,61)",
    arcTo: 0,
    arcOval: true,
    rotation: 3.14159,
    rect: [68.95508, 36.49467, 28.49791, 18.12387]
  }, {
    type: "shape",
    background: "rgb(149,224,245)",
    borderColor: "#979797",
    points: [39.9814, 51.13901, 39.9814, 51.13901, 32.00842, 57.90113, 30.56723, 66.4088, 29.12604, 74.91647,
      34.21664, 85.16969, 34.21664, 85.16969, 39.0516, 89.44677, 39.0516, 89.44677, 36.05169, 79.68945, 37.3999,
      70.48443, 38.74811, 61.27941, 44.44444, 52.62669, 44.44444, 52.62669, 39.9814, 51.13901, 39.9814, 51.13901],
    segments: [1, 4, 4, 2, 4, 4, 2, 2]
  }, {
    type: "shape",
    background: "rgb(149,224,245)",
    borderColor: "#979797",
    scaleX: -1,
    points: [97.67259, 49.56003, 97.67259, 49.56003, 89.6996, 57.90113, 88.25841, 66.4088, 86.81722, 74.91647,
      91.8398, 85.99598, 91.8398, 85.99598, 96.74279, 89.44677, 96.74279, 89.44677, 93.74288, 79.68945,
      95.09109, 70.48443, 96.4393, 61.27941, 102.44264, 50.50641, 102.44264, 50.50641, 97.67259, 49.56003],
    segments: [1, 4, 4, 2, 4, 4, 2]
  }, {
    type: "shape",
    borderWidth: 2,
    borderColor: "rgb(61,61,61)",
    borderCap: "round",
    points: [59.61377, 32.055, 59.61377, 32.055, 61.61221, 36.91182, 59.19747,
      38.71578, 56.78274, 40.51974, 34.08079, 42.18493, 34.08079, 42.18493],
    segments: [1, 4, 4]
  }, {
    type: "shape",
    borderWidth: 2,
    borderColor: "rgb(61,61,61)",
    borderCap: "round",
    scaleX: -1,
    points: [94.48806, 32.055, 94.48806, 32.055, 96.4865, 36.91182, 94.07177,
      38.71578, 91.65703, 40.51974, 68.95508, 42.18493, 68.95508, 42.18493],
    segments: [1, 4, 4]
  }, {
    type: "shape",
    borderWidth: 2,
    borderColor: "rgb(61,61,61)",
    borderCap: "round",
    points: [67.02409, 33.58143, 67.02409, 33.58143, 64.9426, 37.74441, 67.02409, 39.68714],
    segments: [1, 4]
  }, {
    type: "arc",
    background: "rgb(255,255,255)",
    borderWidth: 2,
    borderColor: "rgb(61,61,61)",
    arcTo: 0,
    arcOval: true,
    rotation: 3.14159,
    rect: [68.95508, 40.07324, 28.49791, 11.89121]
  }, {
    type: "arc",
    background: "rgb(255,255,255)",
    borderWidth: 2,
    borderColor: "rgb(61,61,61)",
    arcTo: 0,
    arcOval: true,
    rotation: 3.14159,
    rect: [32.3979, 40.07323, 28.49791, 11.89121]
  }, {
    type: "shape",
    borderWidth: 2,
    borderColor: "rgb(61,61,61)",
    borderCap: "round",
    points: [60.89581, 46.6003, 56.70566, 57.66949, 39.6779, 55.58118, 39.6779, 55.58118],
    segments: [1, 4]
  }, {
    type: "shape",
    borderWidth: 2,
    borderColor: "rgb(61,61,61)",
    borderCap: "round",
    scaleX: -1,
    points: [90.173, 46.6003, 85.98284, 57.66949, 68.95508, 55.58118, 68.95508, 55.58118],
    segments: [1, 4]
  }, {
    type: "shape",
    background: "rgb(61,61,61)",
    borderColor: "#979797",
    points: [40.88134, 45.66533, 40.88134, 50.44931, 49.68823, 51.31913, 49.03586, 45.66533, 40.99007, 45.5566]
  }, {
    type: "shape",
    background: "rgb(61,61,61)",
    borderColor: "#979797",
    points: [78.31735, 45.66533, 78.31735, 50.44931, 87.12423, 51.31913, 86.47187, 45.66533, 78.42607, 45.5566]
  }, {
    type: "shape",
    borderWidth: 2,
    borderColor: "rgb(61,61,61)",
    borderCap: "round",
    points: [36.81151, 80.08117, 46.71402, 84.60188, 54.03326, 76.42155, 61.35251, 85.46297,
      73.83828, 76.20628, 86.96987, 83.95607, 93.85858, 76.85209, 99.24038, 80.08117]
  }, {
    type: "shape",
    background: "rgb(237,237,237)",
    borderColor: "rgb(61,61,61)",
    borderCap: "round",
    points: [95.58345, 31.98512, 95.58345, 31.98512, 104.33563, 25.53184, 105.97087, 18.7394,
      107.6061, 11.94695, 113.65647, 33.63444, 105.97087, 42.39888],
    segments: [1, 4, 4]
  }, {
    type: "shape",
    background: "rgb(237,237,237)",
    borderColor: "rgb(61,61,61)",
    borderCap: "round",
    rotation: .2618,
    points: [44.41276, 23.77714, 38.68944, 23.77714, 33.30496, 20.23699, 28.88983,
      14.5401, 24.47469, 8.84321, 22.55729, 35.68983, 32.04166, 40.72938],
    segments: [1, 4, 4]
  }, {
    type: "oval",
    borderWidth: 2,
    borderColor: "rgb(61,61,61)",
    rect: [21.53429, 22.96531, 88.8981, 74.69064]
  }, {
    type: "shape",
    borderWidth: 2,
    borderColor: "rgb(61,61,61)",
    borderCap: "round",
    points: [93.19422, 30.5138, 93.19422, 30.5138, 96.32695, 28.82985, 99.04364, 25.51534, 100.63358, 23.57553,
      102.08422, 21.24706, 102.68792, 18.7394, 104.32316, 11.94695, 112.13179, 31.92062, 104.44618, 40.68506],
    segments: [1, 4, 4, 4]
  }, {
    type: "shape",
    borderWidth: 2,
    borderColor: "rgb(61,61,61)",
    borderCap: "round",
    rotation: .2618,
    points: [40.62881, 26.14647, 34.90549, 26.14647, 32.31798, 22.75803, 27.90285,
      17.06114, 23.48771, 11.36426, 18.41848, 35.24736, 27.90285, 40.28692],
    segments: [1, 4, 4]
  }, {
    type: "oval",
    background: "rgb(255,255,255)",
    borderColor: "#979797",
    anchorX: .41176,
    anchorY: .88889,
    rect: [91.52207, 49.98659, 1.67215, 3.35736]
  }, {
    type: "oval",
    background: "rgb(255,255,255)",
    borderColor: "#979797",
    anchorX: .41176,
    anchorY: .88889,
    rect: [39.44815, 49.46033, 2.86639, 3.35736]
  }]
});
ht.Default.setImage("editor.block", {
  background: "rgb(179,179,179)",
  width: 16,
  height: 16,
  blendMode: "override",
  comps: [{
    type: "shape",
    background: "rgb(255,227,199)",
    borderWidth: 1,
    borderColor: "rgb(138,138,138)",
    borderCap: "round",
    shadowColor: "#1ABC9C",
    points: [15, 14.5, 1, 14.5, 1, 1.50001, 7, 1.50001, 8, 3.50001, 15, 3.50001, 15, 14.5]
  }, {
    type: "rect",
    background: "rgb(255,255,255)",
    borderWidth: 1,
    borderColor: "rgb(138,138,138)",
    rect: [5.5, 7.22625, 6, 5]
  }, {
    type: "circle",
    background: "rgb(255,255,255)",
    borderWidth: 1,
    borderColor: "rgb(138,138,138)",
    rect: [2.5, 4.72625, 6, 5]
  }]
});
ht.Default.setImage("editor.group", {
  background: "rgb(179,179,179)",
  width: 16,
  height: 16,
  blendMode: "override",
  comps: [{
    type: "shape",
    background: "rgb(255,227,199)",
    borderWidth: 1,
    borderColor: "rgb(138,138,138)",
    borderCap: "round",
    shadowColor: "#1ABC9C",
    points: [15.5, 15.5, .5, 15.5, .5, .5, 6.92857, .5, 8.00001, 2.80769, 15.5, 2.80769, 15.5, 15.5]
  }, {
    type: "shape",
    background: "rgb(255,255,255)",
    borderWidth: 1,
    borderColor: "rgb(138,138,138)",
    borderCap: "round",
    shadowColor: "#1ABC9C",
    points: [2.82964, 11.54111, 13.17036, 11.54111, 13.17036, 13.12467, 13.17036, 5.20688, 2.82964, 5.20688, 2.82964, 13.12467,
      13.17036, 13.12467, 7.26137, 13.12467, 5.78413, 15.5, 10.21588, 15.5, 8.84426, 13.12467, 13.17036, 13.12467, 13.17036, 11.54111]
  }]
});
ht.Default.setImage("editor.subgraph", {
  background: "rgb(179,179,179)",
  width: 16,
  height: 16,
  blendMode: "override",
  comps: [{
    type: "shape",
    background: "rgb(255,227,199)",
    borderWidth: 1,
    borderColor: "rgb(138,138,138)",
    borderCap: "round",
    shadowColor: "#1ABC9C",
    points: [15.5, 15.5, .5, 15.5, .5, .5, 6.92857, .5, 8.00001, 2.80769, 15.5, 2.80769, 15.5, 15.5]
  }, {
    type: "shape",
    background: "rgb(255,255,255)",
    borderWidth: 1,
    borderColor: "rgb(138,138,138)",
    closePath: true,
    points: [4.90316, 8.05737, 4.90316, 8.05737, 4.30121, 6.50546, 5.25104, 5.82166, 6.20086, 5.13787, 7.09165, 5.82166, 7.09165,
      5.82166, 7.09165, 5.82166, 7.76857, 4.36921, 9.6391, 4.91013, 11.50964, 5.45106, 11.09684, 8.05737, 11.09684, 8.05737,
      11.09684, 8.05737, 12.482, 8.53031, 12.482, 9.79106, 12.482, 10.86629, 11.67411, 11.63079, 11.09684, 11.63079, 4.90316,
      11.63079, 4.31315, 11.63079, 3.518, 10.84732, 3.518, 9.79106, 3.518, 8.56402, 4.90316, 8.05737, 4.90316, 8.05737],
    segments: [1, 4, 4, 4, 4, 4, 4, 2, 4, 4]
  }, {
    type: "shape",
    borderWidth: 1,
    borderColor: "rgb(138,138,138)",
    borderJoin: "miter",
    points: [13, 13.5, 8.02409, 13.5, 8, 9, 8.02409, 13.5, 3, 13.5]
  }]
});
ht.Default.setImage("editor.restore", {
  background: "rgb(179,179,179)",
  width: 16,
  height: 16,
  blendMode: "override",
  comps: [{
    type: "triangle",
    background: "rgb(138,138,138)",
    borderWidth: 1,
    borderColor: "rgb(138,138,138)",
    shadowColor: "#1ABC9C",
    rotation: 1.5708,
    rect: [7.5, 1.71892, 3, 2]
  }, {
    type: "arc",
    borderWidth: 1,
    borderColor: "rgb(138,138,138)",
    borderCap: "round",
    arcFrom: 0,
    arcTo: 4.7124,
    arcClose: false,
    shadowColor: "#1ABC9C",
    rect: [2, 2.78108, 12, 12]
  }]
});
ht.Default.setImage("editor.add", {
  background: "rgb(150,150,150)",
  width: 16,
  height: 16,
  comps: [{
    type: "shape",
    borderWidth: 1,
    borderColor: "rgb(255,255,255)",
    rotation: 3.14159,
    points: [9.47991, 2.5, 13.48953, 7.4, 9.47991, 7.4, 9.47991, 2.5, 2.48953, 2.5, 2.48953, 13.5, 13.48953, 13.5, 13.48953, 7.4]
  }]
});
ht.Default.setImage("editor.delete", {
  background: "rgb(89,89,89)",
  width: 16,
  height: 16,
  comps: [{
    type: "shape",
    borderWidth: 1,
    borderColor: "rgb(255,255,255)",
    borderCap: "round",
    shadowColor: "#1ABC9C",
    points: [5.5, 5.57173, 5.5, 12.45709]
  }, {
    type: "shape",
    borderWidth: 1,
    borderColor: "rgb(255,255,255)",
    borderCap: "round",
    shadowColor: "#1ABC9C",
    points: [8.05685, 5.57173, 8.05685, 12.45709]
  }, {
    type: "shape",
    borderWidth: 1,
    borderColor: "rgb(255,255,255)",
    borderCap: "round",
    shadowColor: "#1ABC9C",
    points: [10.5, 5.57173, 10.5, 12.45709]
  }, {
    type: "shape",
    borderWidth: 1,
    borderColor: "rgb(255,255,255)",
    borderCap: "round",
    shadowColor: "#1ABC9C",
    points: [1, 3.18902, 15, 3.16996, 5.32652, 3.16021, 6.32652, 1.16021, 9.32652, 1.16021, 10.32652, 3.16021]
  }, {
    type: "rect",
    borderWidth: 1,
    borderColor: "rgb(255,255,255)",
    shadowColor: "#1ABC9C",
    rect: [3.33333, 3.18902, 9.33334, 11.65078]
  }]
});
ht.Default.setImage("editor.import", {
  background: "rgb(179,179,179)",
  width: 16,
  height: 16,
  comps: [{
    type: "triangle",
    borderColor: "rgb(255,255,255)",
    borderWidth: 1,
    rotation: 1.5708,
    rect: [7.5, 1.71892, 3, 2]
  }, {
    type: "arc",
    borderWidth: 1,
    borderColor: "rgb(255,255,255)",
    borderCap: "round",
    arcFrom: 0,
    arcTo: 4.7124,
    arcClose: false,
    rect: [2, 2.78108, 12, 12]
  }]
});
ht.Default.setImage("editor.top", {
  background: "rgb(145,145,145)",
  width: 16,
  height: 16,
  comps: [{
    type: "rightTriangle",
    borderWidth: 1,
    borderColor: "rgb(255,255,255)",
    shadowColor: "#1ABC9C",
    rotation: 2.35619,
    rect: [3.86035, 6.44002, 8.20153, 8.2581]
  }, {
    type: "shape",
    borderWidth: 1,
    borderColor: "rgb(255,255,255)",
    borderCap: "round",
    shadowColor: "#1ABC9C",
    rotation: 3.14159,
    points: [2.14176, 4.58061, 13.85824, 4.51881]
  }]
});
ht.Default.setImage("editor.up", {
  background: "rgb(145,145,145)",
  width: 16,
  height: 16,
  comps: [{
    type: "rightTriangle",
    borderWidth: 1,
    borderColor: "rgb(255,255,255)",
    shadowColor: "#1ABC9C",
    rotation: 2.35619,
    rect: [3.89924, 6.05159, 8.20153, 8.2581]
  }]
});
ht.Default.setImage("editor.down", {
  background: "rgb(145,145,145)",
  width: 16,
  height: 16,
  comps: [{
    type: "rightTriangle",
    borderWidth: 1,
    borderColor: "rgb(255,255,255)",
    shadowColor: "#1ABC9C",
    rotation: 5.49779,
    rect: [3.89924, .69031, 8.20153, 8.2581]
  }]
});
ht.Default.setImage("editor.bottom", {
  background: "rgb(145,145,145)",
  width: 16,
  height: 16,
  comps: [{
    type: "rightTriangle",
    borderWidth: 1,
    borderColor: "rgb(255,255,255)",
    shadowColor: "#1ABC9C",
    rotation: 5.49779,
    rect: [3.93812, .69031, 8.20153, 8.2581]
  }, {
    type: "shape",
    borderWidth: 1,
    borderColor: "rgb(255,255,255)",
    borderCap: "round",
    shadowColor: "#1ABC9C",
    rotation: 3.14159,
    points: [2.14176, 10.85024, 13.85824, 10.78844]
  }]
});
ht.Default.setImage("editor.menu", {
  background: "rgb(179,179,179)",
  width: 16,
  height: 16,
  blendMode: "override",
  comps: [{
    type: "shape",
    borderWidth: 1,
    borderColor: "rgb(138,138,138)",
    borderCap: "round",
    shadowColor: "#1ABC9C",
    points: [.93729, 4, 14.93729, 4]
  }, {
    type: "shape",
    borderWidth: 1,
    borderColor: "rgb(138,138,138)",
    borderCap: "round",
    shadowColor: "#1ABC9C",
    points: [1.06271, 8, 15.06271, 8]
  }, {
    type: "shape",
    borderWidth: 1,
    borderColor: "rgb(138,138,138)",
    borderCap: "round",
    shadowColor: "#1ABC9C",
    points: [1.06271, 12, 15.06271, 12]
  }]
});
ht.Default.setImage("editor.undo", {
  background: "rgb(191,191,191)",
  width: 16,
  height: 16,
  comps: [{
    type: "shape",
    background: "rgb(255,255,255)",
    points: [9.9945, 5.006, 6.0345, 5.006, 6.0345, 3.527, 6.0345, 3.336, 5.9255, 3.162, 5.7545, 3.078, 5.5825, 2.994, 5.3785, 3.015, 5.2275, 3.132, 2.4795, 5.264, 2.3575, 5.359, 2.2865, 5.505, 2.2865, 5.659, 2.2865, 5.813, 2.3575, 5.959, 2.4795, 6.054, 5.2275, 8.186, 5.3175, 8.256, 5.4255, 8.292, 5.5345, 8.292, 5.6095, 8.292, 5.6845, 8.275, 5.7545, 8.241, 5.9255, 8.157, 6.0345, 7.983, 6.0345, 7.792, 6.0345, 6.006, 9.9945, 6.006, 11.5445, 6.006, 12.7135, 7.296, 12.7135, 9.006, 12.7135, 10.689, 11.4815, 12.006, 9.9085, 12.006, 5.0345, 12.006, 4.7585, 12.006, 4.5345, 12.23, 4.5345, 12.506, 4.5345, 12.782, 4.7585, 13.006, 5.0345, 13.006, 9.9085, 13.006, 12.0425, 13.006, 13.7135, 11.249, 13.7135, 9.006, 13.7135, 6.763, 12.0795, 5.006, 9.9945, 5.006, 9.9945, 5.006],
    segments: [1, 2, 2, 4, 4, 2, 4, 4, 2, 4, 4, 4, 2, 2, 4, 4, 2, 4, 4, 2, 4, 4, 2]
  }]
});
ht.Default.setImage("editor.redo", {
  background: "rgb(191,191,191)",
  width: 16,
  height: 16,
  comps: [{
    type: "shape",
    background: "rgb(255,255,255)",
    shadowColor: "#1ABC9C",
    scaleX: -1,
    points: [9.9945, 5.006, 6.0345, 5.006, 6.0345, 3.527, 6.0345, 3.336, 5.9255, 3.162, 5.7545, 3.078, 5.5825, 2.994, 5.3785, 3.015, 5.2275, 3.132, 2.4795, 5.264, 2.3575, 5.359, 2.2865, 5.505, 2.2865, 5.659, 2.2865, 5.813, 2.3575, 5.959, 2.4795, 6.054, 5.2275, 8.186, 5.3175, 8.256, 5.4255, 8.292, 5.5345, 8.292, 5.6095, 8.292, 5.6845, 8.275, 5.7545, 8.241, 5.9255, 8.157, 6.0345, 7.983, 6.0345, 7.792, 6.0345, 6.006, 9.9945, 6.006, 11.5445, 6.006, 12.7135, 7.296, 12.7135, 9.006, 12.7135, 10.689, 11.4815, 12.006, 9.9085, 12.006, 5.0345, 12.006, 4.7585, 12.006, 4.5345, 12.23, 4.5345, 12.506, 4.5345, 12.782, 4.7585, 13.006, 5.0345, 13.006, 9.9085, 13.006, 12.0425, 13.006, 13.7135, 11.249, 13.7135, 9.006, 13.7135, 6.763, 12.0795, 5.006, 9.9945, 5.006, 9.9945, 5.006],
    segments: [1, 2, 2, 4, 4, 2, 4, 4, 2, 4, 4, 4, 2, 2, 4, 4, 2, 4, 4, 2, 4, 4, 2]
  }]
});
ht.Default.setImage("editor.edit", {
  background: "rgb(179,179,179)",
  width: 16,
  height: 16,
  blendMode: "override",
  comps: [{
    type: "shape",
    borderWidth: 1,
    borderColor: "rgb(51,153,255)",
    shadowColor: "#1ABC9C",
    rotation: 5.49779,
    closePath: true,
    points: [6, -.83884, .5, 13.16116, 6.04966, 10.58206, 11.5, 13.16116, 6, -.83884]
  }]
});
ht.Default.setImage("editor.rulers", {
  background: "rgb(179,179,179)",
  width: 16,
  height: 16,
  blendMode: "override",
  comps: [{
    type: "shape",
    borderWidth: 1,
    borderColor: "rgb(138,138,138)",
    borderCap: "round",
    shadowColor: "#1ABC9C",
    rotation: 1.5708,
    points: [1.50517, 1.5, 1.5, 4.49799, 2.47337, 4.49798, 1.5, 4.49799, 1.50003, 14.5, 11.23413, 14.48019, 11.23413,
      13.48171, 11.23413, 14.47896, 14.5, 14.47897, 4.00002, 14.47899, 4.00001, 12.00001, 1.50521, 12.00002]
  }, {
    type: "shape",
    borderWidth: 1,
    borderColor: "rgb(138,138,138)",
    borderCap: "round",
    shadowColor: "#1ABC9C",
    points: [14, 6, 14, 14, 6, 14]
  }]
});
ht.Default.setImage("editor.grid", {
  background: "rgb(179,179,179)",
  width: 16,
  height: 16,
  blendMode: "override",
  comps: [{
    type: "shape",
    borderWidth: 1,
    borderColor: "rgb(138,138,138)",
    borderCap: "round",
    shadowColor: "#1ABC9C",
    points: [4.49468, 1.49999, 4.5, 14.49999, 4.49468, 11.53541, 1.5, 11.51432, 14.5, 11.51432, 11.52105,
      11.53541, 11.52105, 14.49999, 11.52105, 1.49999, 11.5, 4.50429, 14.5, 4.50429, 1.5, 4.50429]
  }]
});
ht.Default.setImage("editor.save", {
  background: "rgb(179,179,179)",
  width: 16,
  height: 16,
  blendMode: "override",
  comps: [{
    type: "shape",
    borderWidth: 1,
    borderColor: "rgb(138,138,138)",
    shadowColor: "#1ABC9C",
    points: [3.66183, 14.5, 14.5, 14.5, 14.5, 4.83454, 10.71984, 1.5, 3.66183, 1.5, 3.66183, 6.18654, 10.71984,
      6.18654, 10.71984, 1.5, 1.5, 1.5, 1.5, 14.5, 3.66183, 14.5, 3.66183, 9.03168, 12.17213, 9.03168, 12.17213, 14.5]
  }]
});
ht.Default.setImage("editor.preview", {
  background: "rgb(179,179,179)",
  width: 16,
  height: 16,
  blendMode: "override",
  comps: [{
    type: "shape",
    borderWidth: 1,
    borderColor: "rgb(138,138,138)",
    borderCap: "round",
    points: [1.9869, 6.489, 2, 2, 14, 8, 1.9869, 14, 2, 9.555]
  }]
});
ht.Default.setImage("editor.reload", {
  background: "rgb(179,179,179)",
  width: 16,
  height: 16,
  blendMode: "override",
  comps: [{
    type: "triangle",
    background: "rgb(138,138,138)",
    borderWidth: 1,
    borderColor: "rgb(138,138,138)",
    shadowColor: "#1ABC9C",
    rotation: 1.5708,
    rect: [7.5, 1.71892, 3, 2]
  }, {
    type: "arc",
    borderWidth: 1,
    borderColor: "rgb(138,138,138)",
    borderCap: "round",
    arcFrom: 0,
    arcTo: 4.7124,
    arcClose: false,
    shadowColor: "#1ABC9C",
    rect: [2, 2.78108, 12, 12]
  }]
});
ht.Default.setImage("editor.zoomout", {
  width: 16,
  height: 16,
  comps: [{ type: "shape", borderWidth: 1, borderColor: "white", points: [2, 8, 14, 8] }]
});
ht.Default.setImage("editor.zoomin", {
  width: 16,
  height: 16,
  comps: [{
    type: "shape",
    borderWidth: 1,
    borderColor: "white",
    points: [2, 8, 14, 8, 8, 2, 8, 14],
    segments: [1, 2, 1, 2]
  }]
});
ht.Default.setImage("editor.zoomtofit", {
  background: "rgb(179,179,179)",
  width: 16,
  height: 16,
  blendMode: "override",
  comps: [{
    type: "shape",
    borderWidth: 1,
    borderColor: "rgb(138,138,138)",
    borderCap: "round",
    shadowColor: "#1ABC9C",
    points: [8.00001, 11.91764, 8.00001, 15]
  }, {
    type: "triangle",
    background: "rgb(138,138,138)",
    borderWidth: 1,
    borderColor: "rgb(138,138,138)",
    shadowColor: "#1ABC9C",
    rotation: -1.5708,
    rect: [9.75, 7.24608, 2, 1.5]
  }, {
    type: "shape",
    borderWidth: 1,
    borderColor: "rgb(138,138,138)",
    borderCap: "round",
    shadowColor: "#1ABC9C",
    rotation: -1.5708,
    points: [13.516, 6.484, 13.516, 9.51599]
  }, {
    type: "shape",
    borderWidth: 1,
    borderColor: "rgb(138,138,138)",
    borderCap: "round",
    shadowColor: "#1ABC9C",
    rotation: -3.14159,
    points: [8.00001, .99999, 8.00001, 4.08236]
  }, {
    type: "shape",
    borderWidth: 1,
    borderColor: "rgb(138,138,138)",
    borderCap: "round",
    shadowColor: "#1ABC9C",
    rotation: 1.5708,
    points: [2.516, 6.4801, 2.516, 9.51209]
  }, {
    type: "triangle",
    background: "rgb(138,138,138)",
    borderWidth: 1,
    borderColor: "rgb(138,138,138)",
    shadowColor: "#1ABC9C",
    rotation: 1.5708,
    rect: [4.25, 7.24608, 2, 1.5]
  }, {
    type: "triangle",
    background: "rgb(138,138,138)",
    borderWidth: 1,
    borderColor: "rgb(138,138,138)",
    shadowColor: "#1ABC9C",
    rotation: 3.14159,
    rect: [7.00001, 4.5, 2, 1.5]
  }, {
    type: "triangle",
    background: "rgb(138,138,138)",
    borderWidth: 1,
    borderColor: "rgb(138,138,138)",
    shadowColor: "#1ABC9C",
    rotation: 6.28319,
    rect: [7, 10, 2, 1.5]
  }]
});
ht.Default.setImage("editor.toggleleft", {
  background: "rgb(179,179,179)",
  width: 16,
  height: 16,
  blendMode: "override",
  comps: [{
    type: "rect",
    borderWidth: 1,
    borderColor: "rgb(138,138,138)",
    shadowColor: "#1ABC9C",
    rotation: 1.5708,
    rect: [2.50002, 1.00002, 10.99995, 13.99996]
  }, {
    type: "shape",
    borderWidth: 1,
    borderColor: "rgb(138,138,138)",
    borderCap: "round",
    shadowColor: "#1ABC9C",
    points: [3.49001, 5.50001, 3.51001, 10.49999]
  }]
});
ht.Default.setImage("editor.toggleboth", {
  background: "rgb(179,179,179)",
  width: 16,
  height: 16,
  blendMode: "override",
  comps: [{
    type: "rect",
    borderWidth: 1,
    borderColor: "rgb(138,138,138)",
    shadowColor: "#1ABC9C",
    rotation: 1.5708,
    rect: [2.5, 1, 11, 14]
  }]
});
ht.Default.setImage("editor.toggleright", {
  background: "rgb(179,179,179)",
  width: 16,
  height: 16,
  blendMode: "override",
  comps: [{
    type: "rect",
    borderWidth: 1,
    borderColor: "rgb(138,138,138)",
    shadowColor: "#1ABC9C",
    rotation: 1.5708,
    rect: [2.50002, 1.00002, 10.99995, 13.99996]
  }, {
    type: "shape",
    borderWidth: 1,
    borderColor: "rgb(138,138,138)",
    borderCap: "round",
    shadowColor: "#1ABC9C",
    points: [12.49999, 5.50001, 12.51999, 10.49999]
  }]
});
ht.Default.setImage("editor.layout.helper", ht.Default.parse(JSON.stringify({
  dataBindings: [{ attr: "selectColor", valueType: "Color", defaultValue: "#60ACFC" }, {
    attr: "layout.h",
    valueType: "String"
  }, { attr: "layout.v", valueType: "String" }],
  width: 100,
  height: 100,
  interactive: true,
  disableSelectedBorder: true,
  pixelPerfect: false,
  comps: [{
    type: "rect",
    borderColor: "#979797",
    displayName: "左侧交互",
    rect: [5.51795, 27.5, 20.9641, 44.5],
    onDown: "__ht__function(event, data, view, point, width, height) {\nif (ht.Default.isShiftDown()) {\n    data.a('layout.h', 'leftright');\n}\nelse {\n    data.a('layout.h', 'left');\n}\n}"
  }, {
    type: "rect",
    borderColor: "#979797",
    displayName: "右侧交互",
    rect: [74.0359, 27.5, 20.9641, 45],
    onDown: "__ht__function(event, data, view, point, width, height) {\nif (ht.Default.isShiftDown()) {\n    data.a('layout.h', 'leftright');\n}\nelse {\n    data.a('layout.h', 'right');\n}\n}"
  }, {
    type: "rect",
    borderColor: "#979797",
    displayName: "上侧交互",
    rect: [27.5, 6, 45, 20],
    onDown: "__ht__function(event, data, view, point, width, height) {\nif (ht.Default.isShiftDown()) {\n    data.a('layout.v', 'topbottom');\n}\nelse {\n    data.a('layout.v', 'top');\n}\n}"
  }, {
    type: "rect",
    borderColor: "#979797",
    displayName: "下侧交互",
    rect: [27.5, 74, 45, 20],
    onDown: "__ht__function(event, data, view, point, width, height) {\nif (ht.Default.isShiftDown()) {\n    data.a('layout.v', 'topbottom');\n}\nelse {\n    data.a('layout.v', 'bottom');\n}\n}"
  }, {
    type: "rect",
    borderColor: "#979797",
    displayName: "横向中心交互",
    rect: [28.22051, 44, 16, 12],
    onDown: "__ht__function(event, data, view, point, width, height) {\ndata.a('layout.h', 'center');\n}"
  }, {
    type: "rect",
    borderColor: "#979797",
    displayName: "横向中心交互",
    rect: [55.77949, 44, 16, 12],
    onDown: "__ht__function(event, data, view, point, width, height) {\ndata.a('layout.h', 'center');\n}"
  }, {
    type: "rect",
    borderColor: "#979797",
    displayName: "纵向中心交互",
    rect: [44.22051, 28, 11.55897, 16],
    onDown: "__ht__function(event, data, view, point, width, height) {\ndata.a('layout.v', 'center');\n}"
  }, {
    type: "rect",
    borderColor: "#979797",
    displayName: "纵向中心交互",
    rect: [44.22051, 56, 11.55897, 16],
    onDown: "__ht__function(event, data, view, point, width, height) {\ndata.a('layout.v', 'center');\n}"
  }, { type: "rect", borderWidth: 1, borderColor: "#d4d4d4", rect: [5, 5, 90, 90] }, {
    type: "rect",
    borderWidth: 1,
    borderColor: "#d4d4d4",
    borderPattern: [6, 6],
    rect: [27.5, 27.5, 45, 45]
  }, {
    type: "rect",
    background: {
      func: "__ht__function(data, view) {\nvar layoutH = data.a('layout.h');\nif (layoutH === 'left' || layoutH === 'leftright') {\n    return data.a('selectColor');\n}\nreturn '#d4d4d4';\n}",
      value: "#D4D4D4"
    },
    borderColor: "#979797",
    rect: [8, 48, 16, 4]
  }, {
    type: "rect",
    background: {
      func: "__ht__function(data, view) {\nvar layoutH = data.a('layout.h');\nif (layoutH === 'right' || layoutH === 'leftright') {\n    return data.a('selectColor');\n}\nreturn '#d4d4d4';\n}",
      value: "#D8D8D8"
    },
    borderColor: "#979797",
    rect: [76, 48, 16, 4]
  }, {
    type: "rect",
    background: {
      func: "__ht__function(data, view) {\nvar layoutH = data.a('layout.h');\nif (layoutH === 'center') {\n    return data.a('selectColor');\n}\nreturn '#d4d4d4';\n}",
      value: "#D8D8D8"
    },
    borderColor: "#979797",
    rect: [34, 48, 32, 4],
    onDown: "__ht__function(event, data, view, point, width, height) {\ndata.a('layout.h', 'center');\n}"
  }, {
    type: "rect",
    background: {
      func: "__ht__function(data, view) {\nvar layoutV = data.a('layout.v');\nif (layoutV === 'bottom' || layoutV === 'topbottom') {\n    return data.a('selectColor');\n}\nreturn '#d4d4d4';\n}",
      value: "#D8D8D8"
    },
    borderColor: "#979797",
    rect: [48, 76, 4, 16]
  }, {
    type: "rect",
    background: {
      func: "__ht__function(data, view) {\nvar layoutV = data.a('layout.v');\nif (layoutV === 'top' || layoutV === 'topbottom') {\n    return data.a('selectColor');\n}\nreturn '#d4d4d4';\n}",
      value: "#D8D8D8"
    },
    borderColor: "#979797",
    rect: [48, 8, 4, 16]
  }, {
    type: "rect",
    background: {
      func: "__ht__function(data, view) {\nvar layoutV = data.a('layout.v');\nif (layoutV === 'center') {\n    return data.a('selectColor');\n}\nreturn '#d4d4d4';\n}",
      value: "#D8D8D8"
    },
    borderColor: "#979797",
    rect: [48, 34, 4, 32],
    onDown: "__ht__function(event, data, view, point, width, height) {\ndata.a('layout.v', 'center');\n}"
  }, {
    type: "rect",
    background: {
      func: "__ht__function(data, view) {\nif (data.a('layout.h') === 'center' || data.a('layout.v')  === 'center') {\n    return data.a('selectColor');\n}\nreturn '#d4d4d4';\n}",
      value: "#D8D8D8"
    },
    borderColor: "#979797",
    rect: [48, 48, 4, 4]
  }]
}))), ht.Default.setImage("editor.attachPoint", {
  width: 10,
  height: 10,
  boundExtend: 1,
  comps: [{
    type: "shape",
    borderWidth: 1,
    background: { func: "attr@selectColor", value: "rgb(51,153,255)" },
    borderColor: { func: "attr@selectColor", value: "rgb(51,153,255)" },
    closePath: true,
    points: [5, 0, 0, 5, 5, 10, 10, 5]
  }]
});
ht.Default.setImage("editor.debug", {
  width: 16,
  height: 16,
  comps: [{
    type: "shape",
    borderWidth: 1,
    borderColor: "rgb(255,255,255)",
    pixelPerfect: true,
    points: [7.94786, 14.04023, 7.94786, 14.04023, 5.74115, 14.04023, 3.96501, 12.19542, 3.96501, 9.90337, 3.96501,
      5.76652, 11.98452, 5.76652, 11.98452, 9.90337, 11.9307, 12.19542, 10.15457, 14.04023, 7.94786, 14.04023, 12.60426,
      13.98532, 12.60426, 13.11086, 12.16217, 12.33113, 11.46956, 11.86165, 11.95932, 6.90006, 12.73466, 6.45216, 13.26319,
      5.60927, 13.26319, 4.65313, 13.26319, 4.65313, 3.34528, 13.98532, 3.34528, 13.13137, 3.76687, 12.36776, 4.43165, 11.8952,
      1.94907, 9.37134, 3.96309, 9.37134, 3.93694, 6.8475, 3.19558, 6.38817, 2.74126, 5.57307, 2.74126, 4.65313, 2.74126, 4.65313,
      10.93997, 4.92497, 5.00957, 4.92497, 5.00957, 3.27764, 6.32743, 1.95977, 7.97477, 1.95977, 9.6221, 1.95977, 10.93997,
      3.27764, 10.93997, 4.92497, 10.93997, 4.92497, 7.97477, 13.98532, 7.97477, 7.94509, 12.03691, 9.37134, 14.05093, 9.37134],
    segments: [1, 2, 4, 2, 2, 2, 4, 5, 1, 4, 1, 4, 2, 1, 4, 1, 2, 1, 4, 2, 1, 2, 4, 4, 2, 5, 1, 2, 1, 2]
  }]
});
ht.Default.setImage("editor.display.rect", {
  background: "rgb(179,179,179)",
  width: 16,
  height: 16,
  blendMode: "override",
  comps: [{
    type: "rect",
    borderWidth: 1,
    borderColor: "rgb(138,138,138)",
    shadowColor: "#1ABC9C",
    rect: [2.5, 1.5, 11, 13]
  }]
});
ht.Default.setImage("editor.display.oval", {
  background: "rgb(179,179,179)",
  width: 16,
  height: 16,
  blendMode: "override",
  comps: [{
    type: "circle",
    borderWidth: 1,
    borderColor: "rgb(138,138,138)",
    shadowColor: "#1ABC9C",
    rect: [1, 1, 14, 14]
  }]
});
ht.Default.setImage("editor.display.roundrect", {
  background: "rgb(179,179,179)",
  width: 16,
  height: 16,
  blendMode: "override",
  comps: [{
    type: "roundRect",
    borderWidth: 1,
    borderColor: "rgb(138,138,138)",
    cornerRadius: 2.5,
    shadowColor: "#1ABC9C",
    rect: [2.5, 1, 11, 14]
  }]
});
ht.Default.setImage("editor.display.triangle", {
  background: "rgb(179,179,179)", width: 16, height: 16, blendMode: "override", comps: [{
    type: "shape",
    borderWidth: 1,
    borderColor: "rgb(138,138,138)",
    borderCap: "round",
    rotation: 4.71239,
    points: [1.00872, 1, 14.99345, 8, .99345, 15, 1.00872, 1]
  }]
});
ht.Default.setImage("editor.display.polygon", {
  width: 16,
  height: 16,
  comps: [{ type: "polygon", rect: [1, 1, 14, 14], borderColor: "white", borderWidth: 1 }]
});
ht.Default.setImage("editor.display.star", {
  width: 16,
  height: 16,
  comps: [{ type: "star", rect: [1, 1, 14, 14], borderColor: "white", borderWidth: 1 }]
});
ht.Default.setImage("editor.display.arc", {
  width: 16,
  height: 16,
  comps: [{ type: "arc", rect: [1, 1, 14, 14], arcFrom: 0, arcTo: 4.1888, borderColor: "white", borderWidth: 1 }]
});
ht.Default.setImage("editor.display.shape", {
  background: "rgb(179,179,179)",
  width: 16,
  height: 16,
  blendMode: "override",
  comps: [{
    type: "arc",
    borderWidth: 1,
    borderColor: "rgb(138,138,138)",
    shadowColor: "#1ABC9C",
    rotation: -2.35619,
    rect: [6.45666, .50222, 10, 8]
  }, {
    type: "oval",
    background: "rgb(138,138,138)",
    borderColor: "rgb(138,138,138)",
    shadowColor: "#1ABC9C",
    rotation: -2.35619,
    rect: [4.92983, 8.48004, 2.48323, 2.47136]
  }, {
    type: "shape",
    borderWidth: 1,
    borderColor: "rgb(138,138,138)",
    borderCap: "round",
    shadowColor: "#1ABC9C",
    rotation: -2.35619,
    points: [.71918, 15.84031, -.26373, 13.78, 4.61411, 6.85806, 4.66212,
      13.2497, 4.61411, 6.85806, 9.56535, 13.77996, 8.58245, 15.84028]
  }]
});
ht.Default.setImage("editor.display.node", {
  background: "rgb(179,179,179)",
  width: 16,
  height: 16,
  blendMode: "override",
  comps: [{
    type: "shape",
    borderWidth: 1,
    borderColor: "rgb(138,138,138)",
    borderCap: "round",
    shadowColor: "#1ABC9C",
    points: [1.5, 9.38462, 14.5, 9.38462, 14.5, 11.23077, 14.5, 2, 1.5, 2, 1.5,
      11.23077, 14.5, 11.23077, 7.07143, 11.23077, 5, 15, 11, 15, 8.92857, 11.23077]
  }]
});
ht.Default.setImage("editor.display.group", {
  background: "rgb(179,179,179)",
  width: 16,
  height: 16,
  blendMode: "override",
  comps: [{
    type: "shape",
    borderWidth: 1,
    borderColor: "rgb(138,138,138)",
    borderCap: "round",
    shadowColor: "#1ABC9C",
    points: [13, 12.5, 13, 10.54, 3, 10.54, 13, 10.54, 13, 5.5, 3, 5.5,
      3, 12.5, 13, 12.5, 7, 12.5, 5.85714, 15.5, 10.14287, 15.5, 9, 12.5]
  }, {
    type: "shape",
    borderWidth: 1,
    borderColor: "rgb(138,138,138)",
    borderCap: "round",
    shadowColor: "#1ABC9C",
    points: [15.5, 15.5, .5, 15.5, .5, .5, 6.92857, .5, 8, 2.19286, 15.5, 2.19286, 15.5, 15.5]
  }]
});
ht.Default.setImage("editor.display.edge", {
  background: "rgb(179,179,179)",
  width: 16,
  height: 16,
  blendMode: "override",
  comps: [{
    type: "circle",
    borderWidth: 1,
    borderColor: "rgb(138,138,138)",
    shadowColor: "#1ABC9C",
    rect: [.69044, .97071, 4, 4.00837]
  }, {
    type: "circle",
    borderWidth: 1,
    borderColor: "rgb(138,138,138)",
    shadowColor: "#1ABC9C",
    rect: [11.27696, 10.99163, 4, 4.00837]
  }, {
    type: "shape",
    borderWidth: 1,
    borderColor: "rgb(138,138,138)",
    shadowColor: "#1ABC9C",
    points: [4.35933, 3.02819, 7.84441, 2.9749, 7.84441, 12.99581, 11.64067, 12.99581]
  }]
});
ht.Default.setImage("editor.display.text", {
  background: "rgb(179,179,179)",
  width: 16,
  height: 16,
  blendMode: "override",
  comps: [{
    type: "shape",
    borderWidth: 1,
    borderColor: "rgb(138,138,138)",
    borderCap: "round",
    shadowColor: "#1ABC9C",
    points: [1, 15, 8.06501, 1, 15, 15, 12.38059, 9.8, 4.10171, 9.8]
  }]
});
ht.Default.setImage("editor.display.subgraph", {
  gridThickColor: "rgb(191,191,191)",
  width: 16,
  height: 16,
  blendMode: "override",
  comps: [{
    type: "shape",
    borderWidth: 1,
    borderColor: "rgb(207,207,207)",
    visible: false,
    closePath: true,
    points: [2.81788, 9.09381, 2.81788, 9.09381, 1.38027, 6.92868, 3.20223, 5.43826, 5.02418,
      3.94784, 6.51488, 5.43826, 6.51488, 5.43826, 6.51488, 5.43826, 7.61273, 3.06338, 10.74281,
      3.94784, 13.87289, 4.8323, 13.18212, 9.09381, 13.18212, 9.09381, 13.18212, 9.09381, 15.5,
      9.8671, 15.5, 11.92851, 15.5, 13.6866, 14.14811, 14.93662, 13.18212, 14.93662, 2.81788, 14.93662,
      1.83057, 14.93662, .5, 13.65558, .5, 11.92851, .5, 9.92221, 2.81788, 9.09381, 2.81788, 9.09381],
    segments: [1, 4, 4, 4, 4, 4, 4, 2, 4, 4]
  }, {
    type: "rect",
    borderWidth: 1,
    borderColor: "rgb(138,138,138)",
    shadowColor: "#1ABC9C",
    rect: [4.99379, 5.52777, 6, 4.47223]
  }, {
    type: "circle",
    background: "rgb(138,138,138)",
    borderColor: "rgb(138,138,138)",
    visible: false,
    shadowColor: "#1ABC9C",
    rect: [4, 6.43826, 2, 2]
  }, {
    type: "arc",
    borderWidth: 1,
    borderColor: "rgb(138,138,138)",
    borderCap: "round",
    arcFrom: 3.15905,
    arcTo: 5.5676,
    arcClose: false,
    visible: false,
    shadowColor: "#1ABC9C",
    rect: [2.5, 3.11794, 5, 5]
  }, {
    type: "arc",
    borderWidth: 1,
    borderColor: "rgb(138,138,138)",
    borderCap: "round",
    arcFrom: 3.57792,
    arcTo: 6.6497,
    arcClose: false,
    visible: false,
    shadowColor: "#1ABC9C",
    rect: [5.63862, 1.53868, 9.36138, 7.15852]
  }, {
    type: "arc",
    borderWidth: 1,
    borderColor: "rgb(138,138,138)",
    borderCap: "round",
    arcFrom: 1.5708,
    arcTo: 3.87463,
    arcClose: false,
    visible: false,
    shadowColor: "#1ABC9C",
    rect: [-1, 6.56338, 8.99379, 5.93662]
  }, {
    type: "arc",
    borderWidth: 1,
    borderColor: "rgb(138,138,138)",
    borderCap: "round",
    arcFrom: 5.00909,
    arcTo: 1.5708,
    arcClose: false,
    visible: false,
    shadowColor: "#1ABC9C",
    rect: [8.00621, 6.56338, 8.99379, 5.93662]
  }, {
    type: "shape",
    borderWidth: 1,
    borderColor: "rgb(138,138,138)",
    borderCap: "round",
    visible: false,
    points: [3.4969, 12.5, 12.5031, 12.5]
  }, {
    type: "shape",
    borderWidth: 1,
    borderColor: "rgb(138,138,138)",
    points: [9.72, 12.5, 8, 10, 6.34, 12.5]
  }, {
    type: "circle",
    background: "rgb(138,138,138)",
    borderColor: "rgb(138,138,138)",
    shadowColor: "#1ABC9C",
    displayName: "圆形",
    rect: [0, 0, 2, 2]
  }, {
    type: "shape",
    borderWidth: 1,
    borderColor: "rgb(138,138,138)",
    borderJoin: "miter",
    points: [15, 15.5, 8.02409, 15.5, 8.02409, 14, 8.02409, 15.5, 1, 15.5]
  }, {
    type: "shape",
    borderWidth: 1,
    borderColor: "rgb(138,138,138)",
    closePath: true,
    points: [2.81167, 6.59481, 2.81167, 6.59481, 1.80439, 4.03022, 3.39379, 2.90023, 4.98319, 1.77025,
      6.47379, 2.90023, 6.47379, 2.90023, 6.47379, 2.90023, 7.60652, .5, 10.7366, 1.3939, 13.86668, 2.28781,
      13.17591, 6.59481, 13.17591, 6.59481, 13.17591, 6.59481, 15.49379, 7.37636, 15.49379, 9.45978, 15.49379,
      11.23663, 14.1419, 12.5, 13.17591, 12.5, 2.81167, 12.5, 1.82436, 12.5, .49379, 11.20528, .49379,
      9.45978, .49379, 7.43206, 2.81167, 6.59481, 2.81167, 6.59481],
    segments: [1, 4, 4, 4, 4, 4, 4, 2, 4, 4]
  }]
});
ht.Default.setImage("editor.symbol.rect", {
  background: "rgb(179,179,179)",
  width: 16,
  height: 16,
  blendMode: "override",
  comps: [{
    type: "rect",
    borderWidth: 1,
    borderColor: "rgb(138,138,138)",
    shadowColor: "#1ABC9C",
    rect: [2.5, 1.5, 11, 13]
  }]
});
ht.Default.setImage("editor.symbol.oval", {
  background: "rgb(179,179,179)",
  width: 16,
  height: 16,
  blendMode: "override",
  comps: [{
    type: "circle",
    borderWidth: 1,
    borderColor: "rgb(138,138,138)",
    shadowColor: "#1ABC9C",
    rect: [1, 1, 14, 14]
  }]
});
ht.Default.setImage("editor.symbol.roundrect", {
  background: "rgb(179,179,179)",
  width: 16,
  height: 16,
  blendMode: "override",
  comps: [{
    type: "roundRect",
    borderWidth: 1,
    borderColor: "rgb(138,138,138)",
    cornerRadius: 2.5,
    shadowColor: "#1ABC9C",
    rect: [2.5, 1, 11, 14]
  }]
});
ht.Default.setImage("editor.symbol.triangle", {
  background: "rgb(179,179,179)",
  width: 16,
  height: 16,
  blendMode: "override",
  comps: [{
    type: "shape",
    borderWidth: 1,
    borderColor: "rgb(138,138,138)",
    borderCap: "round",
    rotation: 4.71239,
    points: [1.00872, 1, 14.99345, 8, .99345, 15, 1.00872, 1]
  }]
});
ht.Default.setImage("editor.symbol.polygon", {
  width: 16,
  height: 16,
  comps: [{ type: "polygon", rect: [1, 1, 14, 14], borderColor: "white", borderWidth: 1 }]
});
ht.Default.setImage("editor.symbol.star", {
  width: 16,
  height: 16,
  comps: [{ type: "star", rect: [1, 1, 14, 14], borderColor: "white", borderWidth: 1 }]
});
ht.Default.setImage("editor.symbol.arc", {
  width: 16,
  height: 16,
  comps: [{ type: "arc", rect: [1, 1, 14, 14], arcFrom: 0, arcTo: 4.1888, borderColor: "white", borderWidth: 1 }]
});
ht.Default.setImage("editor.symbol.image", {
  background: "rgb(156,156,156)",
  width: 16,
  height: 16,
  comps: [{ type: "rect", borderWidth: 1, borderColor: "rgb(255,255,255)", rect: [.5, 1.96, 15, 12] }, {
    type: "circle",
    background: "rgb(255,255,255)",
    borderColor: "rgb(255,255,255)",
    rect: [3.32103, 4.48721, 1.5, 1.5]
  }, {
    type: "shape",
    borderWidth: 1,
    borderColor: "rgb(255,255,255)",
    borderCap: "round",
    points: [2.18757, 9.112, 6.11684, 9.112, 7.77072, 10.39241, 9.50807, 13.68975, 9.69338, 14.04145,
      9.04982, 12.34611, 7.45717, 10.69236, 7.45717, 10.69236, 8.72728, 5.98721, 14.05092, 5.98721],
    segments: [1, 4, 4, 4]
  }]
});
ht.Default.setImage("editor.symbol.shape", {
  background: "rgb(179,179,179)",
  width: 16,
  height: 16,
  blendMode: "override",
  comps: [{
    type: "arc",
    borderWidth: 1,
    borderColor: "rgb(138,138,138)",
    shadowColor: "#1ABC9C",
    rotation: -2.35619,
    rect: [6.45666, .50222, 10, 8]
  }, {
    type: "oval",
    background: "rgb(138,138,138)",
    borderColor: "rgb(138,138,138)",
    shadowColor: "#1ABC9C",
    rotation: -2.35619,
    rect: [4.92983, 8.48004, 2.48323, 2.47136]
  }, {
    type: "shape",
    borderWidth: 1,
    borderColor: "rgb(138,138,138)",
    borderCap: "round",
    shadowColor: "#1ABC9C",
    rotation: -2.35619,
    points: [.71918, 15.84031, -.26373, 13.78, 4.61411, 6.85806, 4.66212,
      13.2497, 4.61411, 6.85806, 9.56535, 13.77996, 8.58245, 15.84028]
  }]
});
ht.Default.setImage("editor.symbol.border", {
  background: "rgb(179,179,179)",
  width: 16,
  height: 16,
  blendMode: "override",
  comps: [{
    type: "shape",
    borderWidth: 1,
    borderColor: "rgb(138,138,138)",
    borderCap: "round",
    points: [.5, 6.01503, .5, 2, 15.48868, 2, 15.5, 14, .5, 14, .5, 10]
  }]
});
ht.Default.setImage("editor.symbol.text", {
  background: "rgb(179,179,179)",
  width: 16,
  height: 16,
  blendMode: "override",
  comps: [{
    type: "shape",
    borderWidth: 1,
    borderColor: "rgb(138,138,138)",
    borderCap: "round",
    shadowColor: "#1ABC9C",
    points: [1, 15, 8.06501, 1, 15, 15, 12.38059, 9.8, 4.10171, 9.8]
  }]
});
ht.Default.setImage("editor.symbol.piechart", {
  background: "rgb(97,97,97)",
  width: 16,
  height: 16,
  comps: [{
    type: "arc",
    borderWidth: 1,
    borderColor: "rgb(255,255,255)",
    arcFrom: .5236,
    arcTo: 4.71239,
    rect: [.53628, 2.06928, 13.08634, 13.08634]
  }, {
    type: "arc",
    borderWidth: 1,
    borderColor: "rgb(255,255,255)",
    arcFrom: 4.71239,
    arcTo: .5236,
    rect: [2.37737, 1, 13.08634, 13.08634]
  }]
});
ht.Default.setImage("editor.symbol.onedimensionalcolumnchart", {
  background: "rgb(179,179,179)",
  width: 16,
  height: 16,
  blendMode: "override",
  comps: [{
    type: "rect",
    borderWidth: 1,
    borderColor: "rgb(138,138,138)",
    rect: [3.42625, 5.95042, 3, 9.04958]
  }, { type: "rect", borderWidth: 1, borderColor: "rgb(138,138,138)", rect: [10.00543, 1, 3, 14] }]
});
ht.Default.setImage("editor.symbol.columnchart", {
  background: "rgb(179,179,179)",
  width: 16,
  height: 16,
  blendMode: "override",
  comps: [{ type: "rect", borderWidth: 1, borderColor: "rgb(138,138,138)", rect: [1, 9, 3, 6] }, {
    type: "rect",
    borderWidth: 1,
    borderColor: "rgb(138,138,138)",
    rect: [4, 5.95042, 3, 9.04958]
  }, { type: "rect", borderWidth: 1, borderColor: "rgb(138,138,138)", rect: [9, 1, 3, 14] }, {
    type: "rect",
    borderWidth: 1,
    borderColor: "rgb(138,138,138)",
    rect: [12, 10.93747, 3, 4.06253]
  }]
});
ht.Default.setImage("editor.symbol.linechart", {
  background: "rgb(179,179,179)",
  width: 16,
  height: 16,
  blendMode: "override",
  comps: [{ type: "shape", borderWidth: 1, borderColor: "rgb(138,138,138)", points: [1, 14, 5, 7, 11, 8, 15, 2] }]
});
ht.Default.setImage("editor.point.mirrored", {
  width: 30,
  height: 30,
  fitSize: false,
  comps: [{
    type: "arc",
    background: "rgb(202,235,248)",
    borderWidth: 2,
    borderColor: "rgb(17,158,216)",
    arcClose: false,
    rect: [3.5, 10.30081203536023, 23, 25.3726296254234]
  }, {
    type: "oval",
    background: "rgb(255,255,255)",
    borderWidth: 2,
    borderColor: "rgb(51,51,51)",
    rect: [12, 7.300812035360231, 6, 6]
  }, {
    type: "rect",
    background: "rgb(51,51,51)",
    borderColor: "#979797",
    rect: [17.842265898626422, 9.310233818119592, 9.826713258365732, 2]
  }, {
    type: "rect",
    background: "rgb(51,51,51)",
    borderColor: "#979797",
    rect: [24.713262902082427, 8.310233818119592, 3, 4]
  }, {
    type: "rect",
    background: "rgb(51,51,51)",
    borderColor: "#979797",
    rect: [2.4018068742542837, 9.30081203536023, 9.826713258365732, 2]
  }, {
    type: "rect",
    background: "rgb(51,51,51)",
    borderColor: "#979797",
    rect: [2.286737097917573, 8.310233818119592, 3, 4]
  }]
});
ht.Default.setImage("editor.point.straight", {
  width: 30,
  height: 30,
  fitSize: false,
  comps: [{
    type: "shape",
    background: "rgb(200,234,247)",
    borderWidth: 2,
    borderColor: "rgb(17,160,217)",
    points: [26.974999999999998, 23.185840967335317, 15.133692185007973, 10.275109094255685, 3.0250000000000004, 23.185840967335317]
  }, {
    type: "oval",
    background: "rgb(255,255,255)",
    borderWidth: 2,
    borderColor: "rgb(51,51,51)",
    rect: [12, 7.561327956066684, 6, 6]
  }]
});
ht.Default.setImage("editor.point.disconnected", {
  width: 30,
  height: 30,
  fitSize: false,
  comps: [{
    type: "shape",
    background: "rgb(200,234,247)",
    borderWidth: 2,
    borderColor: "rgb(17,160,217)",
    points: [3.1940148593724587, 22.95774078992803, 3.1940148593724587, 18.139874123261343, 7.6015038461565965,
      10.497740789928038, 14.542032480517832, 10.497740789928038, 26.80598514062754, 22.95774078992803],
    segments: [1, 4, 2]
  }, {
    type: "oval",
    background: "rgb(255,255,255)",
    borderWidth: 2,
    borderColor: "rgb(51,51,51)",
    rect: [12.093814401372779, 7.5391087731804305, 6, 6]
  }, {
    type: "rect",
    background: "rgb(51,51,51)",
    borderColor: "#979797",
    rotation: .7853981633974483,
    rect: [16.36973009802768, 14.555043156001322, 9.826713258365732, 2]
  }, {
    type: "rect",
    background: "rgb(51,51,51)",
    borderColor: "#979797",
    rotation: .7853981633974483,
    rect: [22.831111406474626, 16.51363217953681, 3, 4]
  }, {
    type: "rect",
    background: "rgb(51,51,51)",
    borderColor: "#979797",
    rect: [2.2671011430070465, 9.53910877318043, 9.826713258365732, 2]
  }, {
    type: "rect",
    background: "rgb(51,51,51)",
    borderColor: "#979797",
    rect: [2.152031366670336, 8.548530555939791, 3, 4]
  }]
});
ht.Default.setImage("editor.point.asymmetric", {
  width: 30,
  height: 30,
  fitSize: false,
  comps: [{
    type: "shape",
    background: "rgb(200,234,247)",
    borderWidth: 2,
    borderColor: "rgb(17,160,217)",
    points: [3.5000000000000027, 22.974997694265234, 3.5000000000000027, 17.50768540873153, 5.131816608669447, 11.637417102180905,
      12.400695544362113, 11.637417102180905, 22.516641067164265, 11.637417102180905, 26.5, 22.974997694265234, 26.5, 22.974997694265234],
    segments: [1, 4, 4]
  }, {
    type: "oval",
    background: "rgb(255,255,255)",
    borderWidth: 2,
    borderColor: "rgb(51,51,51)",
    rect: [9.324670579660944, 7.637417102180905, 6, 6]
  }, {
    type: "rect",
    background: "rgb(51,51,51)",
    borderColor: "#979797",
    rect: [3.405482351035767, 9.637417102180905, 6.540642002660807, 2]
  }, {
    type: "rect",
    background: "rgb(51,51,51)",
    borderColor: "#979797",
    rect: [2.7221578598514142, 8.637417102180905, 3, 4]
  }, {
    type: "rect",
    background: "rgb(51,51,51)",
    borderColor: "#979797",
    rect: [15.278596259040164, 9.637417102180905, 11.965262549245955, 2]
  }, {
    type: "rect",
    background: "rgb(51,51,51)",
    borderColor: "#979797",
    rect: [24.731262324024406, 8.637417102180905, 3, 4]
  }]
});
ht.Default.setImage("editor.layout.circular", {
  width: 16,
  height: 16,
  comps: [{
    type: "shape",
    background: "white",
    points: [7, 2, 7, 4, 9, 4, 9, 2, 2, 7, 2, 9, 4, 9, 4, 7, 12, 7, 12, 9, 14,
      9, 14, 7, 4, 12, 4, 14, 6, 14, 6, 12, 10, 12, 10, 14, 12, 14, 12, 12],
    segments: [1, 2, 2, 2, 1, 2, 2, 2, 1, 2, 2, 2, 1, 2, 2, 2, 1, 2, 2, 2]
  }, {
    type: "shape",
    borderColor: "white",
    borderWidth: 1,
    points: [8, 3, 3, 8, 5, 13, 11, 13, 13, 8],
    segments: [1, 2, 2, 2, 2, 5]
  }]
});
ht.Default.setImage("editor.layout.symmetric", {
  width: 16,
  height: 16,
  comps: [{
    type: "shape",
    background: "white",
    points: [7, 2, 7, 4, 9, 4, 9, 2, 2, 7, 2, 9, 4, 9, 4, 7, 12, 7, 12, 9, 14,
      9, 14, 7, 4, 12, 4, 14, 6, 14, 6, 12, 10, 12, 10, 14, 12, 14, 12, 12],
    segments: [1, 2, 2, 2, 1, 2, 2, 2, 1, 2, 2, 2, 1, 2, 2, 2, 1, 2, 2, 2]
  }, {
    type: "shape",
    borderWidth: 1,
    borderColor: "white",
    points: [8, 8, 8, 3, 8, 8, 3, 8, 8, 8, 5, 13, 8, 8, 11, 13, 8, 8, 13, 8],
    segments: [1, 2, 1, 2, 1, 2, 1, 2, 1, 2]
  }]
});
ht.Default.setImage("editor.layout.hierarchical", {
  width: 16,
  height: 16,
  comps: [{
    type: "shape",
    background: "white",
    points: [4, 3, 4, 5, 6, 5, 6, 3, 10, 3, 10, 5, 12, 5, 12, 3, 1, 11, 1, 13,
      3, 13, 3, 11, 7, 11, 7, 13, 9, 13, 9, 11, 13, 11, 13, 13, 15, 13, 15, 11],
    segments: [1, 2, 2, 2, 1, 2, 2, 2, 1, 2, 2, 2, 1, 2, 2, 2, 1, 2, 2, 2]
  }, {
    type: "shape",
    borderColor: "white",
    borderWidth: 1,
    points: [5, 4, 2, 12, 5, 4, 8, 12, 5, 4, 14, 12, 11, 4, 2, 12, 11, 4, 8, 12, 11, 4, 14, 12],
    segments: [1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2]
  }]
});
ht.Default.setImage("editor.layout.towardnorth", {
  width: 16,
  height: 16,
  comps: [{
    type: "shape",
    background: "white",
    points: [7, 3, 7, 5, 9, 5, 9, 3, 1, 11, 1, 13, 3, 13, 3, 11, 7, 11, 7, 13, 9, 13, 9, 11, 13, 11, 13, 13, 15, 13, 15, 11],
    segments: [1, 2, 2, 2, 1, 2, 2, 2, 1, 2, 2, 2, 1, 2, 2, 2]
  }, {
    type: "shape",
    borderColor: "white",
    borderWidth: 1,
    points: [8, 4, 2, 12, 8, 4, 8, 12, 8, 4, 14, 12],
    segments: [1, 2, 1, 2, 1, 2]
  }]
});
ht.Default.setImage("editor.layout.towardsouth", {
  width: 16,
  height: 16,
  comps: [{ type: "image", name: "editor.layout.towardnorth", rotation: Math.PI, rect: [0, 0, 16, 16] }]
});
ht.Default.setImage("editor.layout.towardeast", {
  width: 16,
  height: 16,
  comps: [{ type: "image", name: "editor.layout.towardnorth", rotation: .5 * -Math.PI, rect: [0, 0, 16, 16] }]
});
ht.Default.setImage("editor.layout.towardwest", {
  width: 16,
  height: 16,
  comps: [{ type: "image", name: "editor.layout.towardnorth", rotation: .5 * Math.PI, rect: [0, 0, 16, 16] }]
});
ht.Default.setImage("editor.align.distributehorizontal", {
  background: "rgb(150,150,150)",
  width: 16,
  height: 16,
  comps: [{
    type: "shape",
    points: [2, 2, 2, 14, 14, 2, 14, 14],
    segments: [1, 2, 1, 2],
    borderWidth: 1,
    borderCap: "round",
    borderColor: {
      func: function () {
        return config.color_dark;
      }
    }
  }, {
    type: "shape", points: [8, 5, 8, 11], borderWidth: 3, borderCap: "round", borderColor: {
      func: function () {
        return config.color_select;
      }
    }
  }]
});
ht.Default.setImage("editor.align.distributevertical", {
  background: "rgb(150,150,150)",
  width: 16,
  height: 16,
  comps: [{
    type: "shape",
    points: [2, 2, 14, 2, 2, 14, 14, 14],
    segments: [1, 2, 1, 2],
    borderWidth: 1,
    borderCap: "round",
    borderColor: {
      func: function () {
        return config.color_dark;
      }
    }
  }, {
    type: "shape", points: [5, 8, 11, 8], borderWidth: 3, borderCap: "round", borderColor: {
      func: function () {
        return config.color_select;
      }
    }
  }]
});
ht.Default.setImage("editor.align.alignleft", {
  background: "rgb(150,150,150)",
  width: 16,
  height: 16,
  comps: [{
    type: "shape",
    points: [2, 2, 2, 14],
    segments: [1, 2],
    borderWidth: 1,
    borderCap: "round",
    borderColor: {
      func: function () {
        return config.color_dark;
      }
    }
  }, {
    type: "shape",
    points: [5, 5, 13, 5, 5, 11, 8, 11],
    segments: [1, 2, 1, 2],
    borderWidth: 3,
    borderCap: "round",
    borderColor: {
      func: function () {
        return config.color_select;
      }
    }
  }]
});
ht.Default.setImage("editor.align.alignhorizontal", {
  background: "rgb(150,150,150)",
  width: 16,
  height: 16,
  comps: [{
    type: "shape",
    points: [8, 2, 8, 14],
    segments: [1, 2],
    borderWidth: 1,
    borderCap: "round",
    borderColor: {
      func: function () {
        return config.color_dark;
      }
    }
  }, {
    type: "shape",
    points: [3, 5, 13, 5, 6, 11, 10, 11],
    segments: [1, 2, 1, 2],
    borderWidth: 3,
    borderCap: "round",
    borderColor: {
      func: function () {
        return config.color_select;
      }
    }
  }]
});
ht.Default.setImage("editor.align.alignright", {
  background: "rgb(150,150,150)",
  width: 16,
  height: 16,
  comps: [{
    type: "shape",
    points: [14, 2, 14, 14],
    segments: [1, 2],
    borderWidth: 1,
    borderCap: "round",
    borderColor: {
      func: function () {
        return config.color_dark;
      }
    }
  }, {
    type: "shape",
    points: [3, 5, 11, 5, 11, 11, 8, 11],
    segments: [1, 2, 1, 2],
    borderWidth: 3,
    borderCap: "round",
    borderColor: {
      func: function () {
        return config.color_select;
      }
    }
  }]
});
ht.Default.setImage("editor.align.aligntop", {
  background: "rgb(150,150,150)",
  width: 16,
  height: 16,
  comps: [{
    type: "shape",
    points: [2, 2, 14, 2],
    segments: [1, 2],
    borderWidth: 1,
    borderCap: "round",
    borderColor: {
      func: function () {
        return config.color_dark;
      }
    }
  }, {
    type: "shape",
    points: [5, 5, 5, 13, 11, 5, 11, 8],
    segments: [1, 2, 1, 2],
    borderWidth: 3,
    borderCap: "round",
    borderColor: {
      func: function () {
        return config.color_select;
      }
    }
  }]
});
ht.Default.setImage("editor.align.alignvertical", {
  background: "rgb(150,150,150)",
  width: 16,
  height: 16,
  comps: [{
    type: "shape",
    points: [2, 8, 14, 8],
    segments: [1, 2],
    borderWidth: 1,
    borderCap: "round",
    borderColor: {
      func: function () {
        return config.color_dark;
      }
    }
  }, {
    type: "shape",
    points: [5, 3, 5, 13, 11, 6, 11, 10],
    segments: [1, 2, 1, 2],
    borderWidth: 3,
    borderCap: "round",
    borderColor: {
      func: function () {
        return config.color_select
      }
    }
  }]
});
ht.Default.setImage("editor.align.alignbottom", {
  background: "rgb(150,150,150)",
  width: 16,
  height: 16,
  comps: [{
    type: "shape",
    points: [2, 14, 14, 14],
    segments: [1, 2],
    borderWidth: 1,
    borderCap: "round",
    borderColor: {
      func: function () {
        return config.color_dark;
      }
    }
  }, {
    type: "shape",
    points: [5, 3, 5, 11, 11, 11, 11, 8],
    segments: [1, 2, 1, 2],
    borderWidth: 3,
    borderCap: "round",
    borderColor: {
      func: function () {
        return config.color_select;
      }
    }
  }]
});

ht.widget.TreeView.prototype._expandIcon = "expandIcon";
ht.widget.TreeView.prototype._collapseIcon = "collapseIcon";
ht.widget.TreeTableView.prototype._expandIcon = "expandIcon";
ht.widget.TreeTableView.prototype._collapseIcon = "collapseIcon";
const _handler = function (e) {
  e.keyCode === 8 && e.preventDefault();
},
  setEditable = ht.widget.TextField.prototype.setEditable;
ht.widget.TextField.prototype.setEditable =
  ht.widget.TextArea.prototype.setEditable =
  function (editable) {
    setEditable.call(this, editable);
    const el = this._element;
    el.style.color = editable ? ht.Default.labelColor : config.color_disabled;
    if (editable) {
      el.style.color = ht.Default.labelColor
      el.removeEventListener("keydown", _handler);
    } else {
      el.style.color = tpeditor_config.color_disabled;
      el.addEventListener("keydown", _handler);
    }
  };

ht.Default.onElementCreated = function (el) {
  if (el.tagName === "INPUT" && el.type !== "button" || el.tagName === "TEXTAREA") {
    el.style.border = tpeditor_config.color_line + " solid 1px";
    el.style.outline = 0, el.style.padding = "2px";
    if (el.tagName === "TEXTAREA") {
      el.style.whiteSpace = "pre", el.setAttribute("spellcheck", "false");
    }
    el.addEventListener("focus", function () {
      el.oldBorder = el.style.border;
      el.style.border = tpeditor_config.color_select + " solid 1px";
      el.tagName === "INPUT" && requestAnimationFrame(function () {
        el.select();
      });
      el.tagName === "TEXTAREA" && (el.style.zIndex = "1")
    }, false);

    el.addEventListener("blur", function () {
      el.style.border = el.oldBorder;
      el.tagName === "TEXTAREA" && (el.style.zIndex = "");
    }, false);
    if (tpeditor_config.onElementCreated) {
      tpeditor_config.onElementCreated(el);
    }
  }
};
ht.Default.onWidgetColorPickerCreated = function (pane) {
  function bindInput(pane, view, el) {
    el.style.cursor = "ew-resize";
    const char = el.innerHTML.charAt(0),
      input = view.querySelector("input.color_" + char),
      handler = function (e) {
        e.preventDefault();
        const val = (char === "A" ? parseFloat(input.value) : parseInt(input.value)) || 0,
          x1 = ht.Default.getClientPoint(e).x,
          onMouseMove = function (e) {
            e.preventDefault();
            const tx = ht.Default.getClientPoint(e).x - x1;
            let value = undefined;
            if (char === "A") {
              value = val + .01 * tx;
              value > 1 && (value = 1);
              value < 0 && (value = 0);
              input.value = value.toFixed(2);
            } else {
              value = val + 1 * tx;
              value > 255 && (value = 255);
              value < 0 && (value = 0);
              input.value = value;
            }
            pane.updateInputChange();
          };
        window.addEventListener("mousemove", onMouseMove, false);
        window.addEventListener("touchmove", onMouseMove, false);
        const onMouseUp = function (e) {
          e.preventDefault();
          window.removeEventListener("mousemove", onMouseMove, false);
          window.removeEventListener("touchmove", onMouseMove, false);
          window.removeEventListener("mouseup", onMouseUp, false);
          window.removeEventListener("touchend", onMouseUp, false);
        };
        window.addEventListener("mouseup", onMouseUp, false);
        window.addEventListener("touchend", onMouseUp, false);
      };
    el.addEventListener("mousedown", handler, false);
    el.addEventListener("touchstart", handler, false);
  }
  const border = tpeditor_config.color_line + " solid 1px";
  const view = pane.getView();
  let palettes = view.querySelectorAll(".colorPalette");
  for (let i = 0; i < palettes.length; i++) {
    palettes[i].style.border = border;
  }
  view.querySelector(".satval").style.border = border;
  view.querySelector(".hue_image").style.border = border;
  view.querySelector(".preview").style.border = border;
  palettes = view.querySelectorAll('input[type="button"]');
  for (let i = 0; i < palettes.length; i++) {
    const palett = palettes[i];
    palett.style.border = border;
    palett.style.background = "none";
    palett.style.outline = "none";
    palett.style.width = "30px";
    palett.addEventListener("mouseover", function (e) {
      e.target.style.background = tpeditor_config.color_hover
    }, false);
    palett.addEventListener("mouseout", function (e) {
      e.target.style.background = "none";
    }, false);
  }
  palettes = view.querySelectorAll("span");
  for (let i = 0; i < palettes.length; i++) {
    bindInput(pane, view, palettes[i]);
  }
};

createIconButton("editor.layout.circular");
createIconButton("editor.layout.symmetric");
createIconButton("editor.layout.hierarchical");
createIconButton("editor.layout.towardnorth");
createIconButton("editor.layout.towardsouth");
createIconButton("editor.layout.towardeast");
createIconButton("editor.layout.towardwest");
createIconButton("editor.root");
createIconButton("editor.bind", () => true);
createIconButton("editor.unbind");
createIconButton("editor.dir");
createIconButton("editor.dxf");
createIconButton("editor.obj");
createIconButton("editor.mtl");
createIconButton("editor.ui-tab");
createIconButton("editor.ttf");
createIconButton("editor.otf");
createIconButton("editor.sound");
createIconButton("editor.video");
createIconButton("editor.resetsize");
createIconButton("editor.restore");
createIconButton("editor.js");

ht.Default.handleUnfoundImage = function () {
  return ht.Default.getImage("editor.unknown");
};

ht.Data.prototype.clone = cloneParent;
ht.Data.prototype.toJSON = function (view) {
  return this._refGraph ? [] : [extendNode(view), cloneNode];
};
ht.Node.prototype.clone = cloneHost;
ht.Node.prototype.toJSON = function (d3) {
  return this._refGraph ? [] : [extend3d(d3), clone3d];
};
ht.Edge.prototype.clone = cloneEdge;
ht.Edge.prototype.toJSON = function (edge) {
  return this._refGraph ? [] : [extendEdge(edge), cloneNode];
};
ht.Group.prototype.toJSON = function (group) {
  return this._refGraph ? [] : [extendGroup(group), cloneGroup];
};
ht.Shape.prototype.toJSON = function (shape) {
  return this._refGraph ? [] : [extendShape(shape), cloneShape];
};
ht.Block.prototype.toJSON = function (block) {
  return this._refGraph ? [] : [extendBlock(block), cloneBlock];
};
ht.RefGraph.prototype.toJSON = function (refGraph) {
  return this._refGraph ? [] : [extendRefGraph(refGraph), cloneRefGraph];
};

config.configStudio?.();
export default config;
