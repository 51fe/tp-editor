import { EVENTS } from "../constants.js";
import config from "../config.js";
import { getInstance, instances } from "../util/Instances.js";
import CreateNodeInteractor from "../interactor/CreateNodeInteractor.js";
import CreateShapeInteractor from "../interactor/CreateShapeInteractor.js";
import { getFunc, getString, parse, parseValue, stringify, updateValue } from "../util/index.js";
import EditView from "./EditView.js";
import SymbolGraphView from "./SymbolGraphView.js";
import SymbolList from "./SymbolList.js";
import Restore from "../type/Restore.js";

export default class SymbolView extends EditView {
  constructor(editor, tab, url, json, parent_uuid, root_dir) {
    super(editor, tab, SymbolGraphView, "symbol", undefined, parent_uuid, root_dir)
    this.graphView.vectorDataBindingDisabled = true;
    this.graphView.getLabel = () => {
      return null
    }, this.graphView.setVisibleFunc(p => {
      return !(p instanceof Restore)
    });
    this.list = this.symbolList = new SymbolList(this);
    this.dm.a({
      name: undefined,
      comps: [],
      width: 100,
      height: 100,
      boundExtend: 0,
      fitSize: false,
      scrollable: false,
      interactive: false,
      disableSelectedBorder: false,
      pixelPerfect: true,
      clip: false,
      visible: true,
      color: undefined,
      blendMode: "multiply",
      opacity: 1
    });
    const symbol = config.customProperties.symbol;
    Array.isArray(symbol) && symbol.forEach(item => {
      this.dm.a(item.property, item.defaultValue)
    });
    this.dm.addIndexChangeListener(() => {
      this.dirty = true
    });
    this.dirty = false;
    this.dm.enableHistoryManager(config.maxUndoRedoSteps);
    const kinds = ["a:renderHTML", "a:width", "a:height", "f:dataBindings"];
    this.dm.mp(e => {
      kinds.includes(e.property) && this.updateRenderNode();
    });
    this.parse(url, json);
    const node = editor.getFileNode(url);
    this.editable = !node || false !== node.a("editable")
    url ? json || this.editor.fireEvent("symbolViewOpening", {
      symbolView: this,
      url
    }) : this.editor.fireEvent("symbolViewCreated", { symbolView: this, json: json })
  }

  clear() {
    this.dm.beginTransaction();
    super.clear();
    const _config = config;
    this.dm.a("connectActionType", _config.symbolConnectActionType);
    this.dm.a("anchorEnabled", _config.symbolAnchorEnabled);
    this.dm.a("guideLineEnabled", _config.symbolGuideLineEnabled);
    this.dm.a("highlightEnabled", _config.symbolHighlightEnabled);
    this.dm.a("highlightColor", _config.symbolHighlightColor);
    this.dm.a("highlightBorderWidth", _config.symbolHighlightBorderWidth);
    this.dm.a("highlightBorderPattern", _config.symbolHighlightBorderPattern);
    this.dm.setAutoAdjustIndex(false);
    this.dm.endTransaction();
  }
  resetGrid() {
    this.dm.beginTransaction();
    const _config = config;
    this.dm.a("rulerEnabled", _config.symbolRulerEnabled);
    this.dm.a("gridEnabled", _config.symbolGridEnabled), this.dm.a("gridBlockSize", _config.symbolGridBlockSize);
    this.dm.a("gridThickLinesEvery", _config.symbolGridThickLinesEvery);
    this.dm.a("gridThickColor", _config.symbolGridThickColor);
    this.dm.a("gridLightColor", _config.symbolGridLightColor);
    this.dm.a("gridAngle", _config.symbolGridAngle);
    this.dm.a("gridRotation", _config.symbolGridRotation);
    this.dm.a("gridZoomThreshold", _config.symbolGridZoomThreshold);
    this.dm.a("alignmentGuideEnabled", _config.symbolGridAlignmentGuideEnabled);
    this.dm.a("alignmentGuideColor", _config.symbolGridAlignmentGuideColor);
    this.dm.endTransaction();
  }
  onClosed() {
    super.onClosed();
    this.list.onClosed();
  }
  updateImpl(json, dirty) {
    const dm = this.dm,
      _config = parse(json);
    this.clear();
    dm.setBackground(_config.background);
    dm.a("previewURL", _config.previewURL);
    dm.a("snapshotURL", _config.snapshotURL);
    dm.dataBindings = _config.dataBindings;
    this.attrObject = _config.attrObject;
    dm.a("xAlignmentGuides", _config.xAlignmentGuides);
    dm.a("yAlignmentGuides", _config.yAlignmentGuides);
    _config.rulerEnabled !== undefined && dm.a("rulerEnabled", _config.rulerEnabled);
    _config.gridEnabled !== undefined && dm.a("gridEnabled", _config.gridEnabled);
    _config.gridBlockSize !== undefined && dm.a("gridBlockSize", _config.gridBlockSize);
    _config.gridThickLinesEvery !== undefined && dm.a("gridThickLinesEvery", _config.gridThickLinesEvery);
    _config.gridThickColor !== undefined && dm.a("gridThickColor", _config.gridThickColor);
    _config.gridLightColor !== undefined && dm.a("gridLightColor", _config.gridLightColor);
    _config.gridAngle !== undefined && dm.a("gridAngle", _config.gridAngle);
    _config.gridRotation !== undefined && dm.a("gridRotation", _config.gridRotation);
    _config.gridZoomThreshold !== undefined && dm.a("gridZoomThreshold", _config.gridZoomThreshold);
    _config.anchorEnabled !== undefined && dm.a("anchorEnabled", _config.anchorEnabled);
    _config.guideLineEnabled !== undefined && dm.a("guideLineEnabled", _config.guideLineEnabled);
    _config.highlightEnabled !== undefined && dm.a("highlightEnabled", _config.highlightEnabled);
    _config.highlightColor !== undefined && dm.a("highlightColor", _config.highlightColor);
    _config.highlightBorderWidth !== undefined && dm.a("highlightBorderWidth", _config.highlightBorderWidth);
    _config.highlightBorderPattern !== undefined && dm.a("highlightBorderPattern", _config.highlightBorderPattern);
    _config.alignmentGuideEnabled !== undefined && dm.a("alignmentGuideEnabled", _config.alignmentGuideEnabled);
    _config.alignmentGuideColor !== undefined && dm.a("alignmentGuideColor", _config.alignmentGuideColor);
    _config.connectActionType && dm.a("connectActionType", _config.connectActionType);
    EVENTS.forEach(event => {
      dm.a(event, _config[event])
    });
    dm.a({
      name: _config.name,
      renderHTML: _config.renderHTML,
      layoutAttach: _config.layoutAttach,
      layoutProperties: _config.layoutProperties,
      comps: parseValue(_config.comps, []),
      width: parseValue(_config.width, 100),
      height: parseValue(_config.height, 100),
      boundExtend: parseValue(_config.boundExtend, 0),
      fitSize: parseValue(_config.fitSize, false),
      scrollable: parseValue(_config.scrollable, false),
      interactive: parseValue(_config.interactive, false),
      disableSelectedBorder: parseValue(_config.disableSelectedBorder, false),
      pixelPerfect: parseValue(_config.pixelPerfect, true),
      clip: parseValue(_config.clip, false),
      visible: parseValue(_config.visible, true),
      color: parseValue(_config.color, undefined),
      blendMode: parseValue(_config.blendMode, "multiply"),
      opacity: parseValue(_config.opacity, 1),
      attachPoints: parseValue(_config.attachPoints, undefined),
      attachStyle: parseValue(_config.attachStyle, undefined),
      cacheRule: parseValue(_config.cacheRule, false),
      textureCache: parseValue(_config.textureCache, false),
      state: parseValue(_config.state, undefined),
      stateEnum: parseValue(_config.stateEnum, undefined),
      comps_func: getFunc(_config.comps),
      width_func: getFunc(_config.width),
      height_func: getFunc(_config.height),
      fitSize_func: getFunc(_config.fitSize),
      scrollable_func: getFunc(_config.scrollable),
      interactive_func: getFunc(_config.interactive),
      disableSelectedBorder_func: getFunc(_config.disableSelectedBorder),
      pixelPerfect_func: getFunc(_config.pixelPerfect),
      visible_func: getFunc(_config.visible),
      color_func: getFunc(_config.color),
      blendMode_func: getFunc(_config.blendMode),
      opacity_func: getFunc(_config.opacity),
      attachPoints_func: getFunc(_config.attachPoints),
      attachStyle_func: getFunc(_config.attachStyle),
      cacheRule_func: getFunc(_config.cacheRule),
      textureCache_func: getFunc(_config.textureCache),
      state_func: getFunc(_config.state)
    });
    const symbol = config.customProperties.symbol;
    symbol?.forEach?.(item => {
      dm.a(item.property, parseValue(_config[item.property], item.defaultValue))
    });
    const pane = this.editor.symbolStatePane;
    pane.symbolViewUpdating = true;
    dm.a("comps").forEach(comp => {
      getInstance(comp, this);
    });
    pane.symbolViewUpdating = false;
    this.dirty = !!dirty;
    if (!dirty && config.fitContentForSymbolView) {
      this.graphView.fitContent(config.animate, config.fitPadding);
    }
    this.updateRenderNode();
  }

  updateRenderNode() {
    if (tpeditor.SceneView) {
      const dm = this.dm,
        html = dm.a("renderHTML");
      let data = dm.getDataByTag("__renderHTML__");
      if (!html) {
        data?.removeFromDataModel();
        return false;
      }
      data = { comps: [] };
      data.renderHTML = html;
      data.dataBindings = dm.dataBindings;
      this.addValue(data, "width");
      this.addValue(data, "height");
      if (!data) {
        data = new ht.Node;
        data.setTag("__renderHTML__");
        data.s({ "2d.selectable": false });
        this.dm.add(data);
      }
      data.setImage(data);
      data.setRect({
        x: 0,
        y: 0,
        width: data.width,
        height: data.height
      });
    }
  }

  addValue(prop, name, defaultValue) {
    const value = this.dm.a(name);
    updateValue(prop, name, this.dm.a(name + "_func"), value, defaultValue)
  }

  createInteractor(type, callback, fill) {
    const { color_data_border, color_data_background } = config,
      Instance = instances[type];
    if (type === "shape") {
      return new CreateShapeInteractor(this.tab, null, (points, segments) => {
        const prop = {
          type: "shape",
          background: null,
          borderColor: color_data_border,
          borderWidth: 1
        };
        callback && callback(prop, points, segments);
        const instance = new Instance(prop);
        instance.setPoints(points);
        instance.setSegments(segments);
        this.editor.fireEvent("compInited", {
          type,
          data: instance,
          symbolView: this.editor.symbolView
        });
        return instance;
      }, fill)
    } else {
      return new CreateNodeInteractor(this.tab, null, (rect, center) => {
        const { x, y, width, height } = rect;
        let prop = undefined;
        if (type === "arc") {
          prop = {
            type,
            rect: [x, y, width, height],
            background: color_data_background,
            borderWidth: 1,
            borderColor: color_data_border,
            arcFrom: 0,
            arcTo: 4.1888
          }
        } else if (type === "border") {
          prop = {
            type,
            rect: [x, y, width, height],
            border: 1,
            color: color_data_border
          }
        } else if (type === "text") {
          prop = {
            type,
            rect: [x, y, width, height],
            text: getString("editor.text")
          }
        } else if (["comp", "image"].includes(type)) {
          if (center) {
            prop = { rect: [x + width / 2, y + height / 2, -1, -1] }
          } else {
            prop = { rect: [x, y, width, height] }
          }
        } else if (type === "pieChart") {
          prop = {
            type: "pieChart",
            values: [10, 20, 40, 60, 80],
            colors: ["#7EB6EA", "#434348", "#93EB82", "#F5A262", "#8087E6"]
          }
        } else if (type === "oneDimensionalColumnChart") {
          prop = {
            type: "columnChart",
            series: [{
              values: [10, 20, 40, 60, 80],
              colors: ["#7EB6EA", "#434348", "#93EB82", "#F5A262", "#8087E6"]
            }]
          }
        } else if (type === "columnChart") {
          prop = {
            type: "columnChart",
            series: [
              { values: [30, 40, 60, 70, 80], color: "#7EB6EA" },
              { values: [20, 40, 50, 80, 90], color: "#434348" }
            ]
          }
        } else if (type === "lineChart") {
          prop = {
            type: "lineChart",
            series: [{ values: [10, 40, 30, 60, 70], color: "#7EB6EA" }]
          }
        } else {
          prop = {
            type,
            rect: [x, y, width, height],
            background: color_data_background,
            borderWidth: 1,
            borderColor: color_data_border
          };
        }
        callback && callback(prop, rect, center);
        const data = new Instance(prop);
        this.editor.fireEvent("compInited", {
          type,
          data,
          symbolView: this.editor.symbolView
        });
        return data;
      })
    }
  }

  get attrObject() {
    return this._attrObject;
  }
  set attrObject(value) {
    const sm = this.editor.rightBottomTabView.getTabModel().sm();
    this._attrObject = value;
    if(this.editor.dataViewTab && sm.co(this.editor.dataViewTab)) {
      this.editor.dataView.updateContent();
    }
  }

  get content() {
    const dm = this.dm,
      attrObject = this.attrObject,
      prop = { modified: (new Date).toString() };
    if (attrObject !== undefined) {
      prop.attrObject = attrObject;
    }
    dm.getBackground() && (prop.background = dm.getBackground());
    dm.dataBindings && (prop.dataBindings = parse(stringify(dm.dataBindings), { ignoreDataModel: 1 }));
    dm.a("previewURL") && (prop.previewURL = dm.a("previewURL"));
    dm.a("snapshotURL") && (prop.snapshotURL = dm.a("snapshotURL"));
    if (dm.a("connectActionType") !== config.symbolConnectActionType) {
      prop.connectActionType = dm.a("connectActionType");
    }
    dm.a("rulerEnabled") !== config.symbolRulerEnabled && (prop.rulerEnabled = dm.a("rulerEnabled"));
    dm.a("gridEnabled") !== config.symbolGridEnabled && (prop.gridEnabled = dm.a("gridEnabled"));
    dm.a("gridBlockSize") !== config.symbolGridBlockSize && (prop.gridBlockSize = dm.a("gridBlockSize"));
    if (dm.a("gridThickLinesEvery") !== config.symbolGridThickLinesEvery) {
      prop.gridThickLinesEvery = dm.a("gridThickLinesEvery");
    }
    dm.a("gridThickColor") !== config.symbolGridThickColor && (prop.gridThickColor = dm.a("gridThickColor"));
    dm.a("gridLightColor") !== config.symbolGridLightColor && (prop.gridLightColor = dm.a("gridLightColor"));
    dm.a("gridAngle") !== config.symbolGridAngle && (prop.gridAngle = dm.a("gridAngle"));
    dm.a("gridRotation") !== config.symbolGridRotation && (prop.gridRotation = dm.a("gridRotation"));
    dm.a("gridZoomThreshold") !== config.symbolGridZoomThreshold && (prop.gridZoomThreshold = dm.a("gridZoomThreshold"));
    dm.a("anchorEnabled") !== config.symbolAnchorEnabled && (prop.anchorEnabled = dm.a("anchorEnabled"));
    dm.a("guideLineEnabled") !== config.symbolGuideLineEnabled && (prop.guideLineEnabled = dm.a("guideLineEnabled"));
    dm.a("highlightEnabled") !== config.symbolHighlightEnabled && (prop.highlightEnabled = dm.a("highlightEnabled"));
    dm.a("highlightColor") !== config.symbolHighlightColor && (prop.highlightColor = dm.a("highlightColor"));
    if (dm.a("highlightBorderWidth") !== config.symbolHighlightBorderWidth) {
      prop.highlightBorderWidth = dm.a("highlightBorderWidth");
    }
    if (dm.a("highlightBorderPattern") !== config.symbolHighlightBorderPattern) {
      prop.highlightBorderPattern = dm.a("highlightBorderPattern");
    }
    dm?.a("xAlignmentGuides")?.length && (prop.xAlignmentGuides = dm.a("xAlignmentGuides"));
    dm?.a("yAlignmentGuides")?.length && (prop.yAlignmentGuides = dm.a("yAlignmentGuides"));
    dm.a("cacheRule") && this.addValue(prop, "cacheRule");
    dm.a("textureCache") && this.addValue(prop, "textureCache");
    if (dm?.a("alignmentGuideEnabled") !== config.symbolGridAlignmentGuideEnabled) {
      prop.alignmentGuideEnabled = dm.a("alignmentGuideEnabled");
    }
    if (dm?.a("alignmentGuideColor") !== config.symbolGridAlignmentGuideColor) {
      prop.alignmentGuideColor = dm.a("alignmentGuideColor");
    }
    if (dm?.a("stateEnum")?.length) {
      prop.stateEnum = dm.a("stateEnum");
      this.addValue(prop, "state");
    }
    EVENTS.forEach(name => {
      dm.a(name) && (prop[name] = dm.a(name))
    });
    dm.a("renderHTML") && (prop.renderHTML = dm.a("renderHTML"));
    dm.a("layoutAttach") && (prop.layoutAttach = dm.a("layoutAttach"));
    dm.a("layoutProperties") && (prop.layoutProperties = dm.a("layoutProperties"));
    this.addValue(prop, "width");
    this.addValue(prop, "height");
    this.addValue(prop, "boundExtend", 0);
    this.addValue(prop, "fitSize", false);
    this.addValue(prop, "scrollable", false);
    this.addValue(prop, "interactive", false);
    this.addValue(prop, "disableSelectedBorder", false);
    this.addValue(prop, "pixelPerfect", true);
    this.addValue(prop, "name");
    this.addValue(prop, "clip", false);
    this.addValue(prop, "visible", true);
    this.addValue(prop, "color");
    this.addValue(prop, "blendMode", "multiply");
    this.addValue(prop, "opacity", 1);
    this.addValue(prop, "attachPoints");
    this.addValue(prop, "attachStyle");
    const symbol = config.customProperties?.symbol,
      defaultValue = !!config.saveSymbolCustomPropertyDefaultValue;
    symbol?.forEach?.(item => {
      if (defaultValue) {
        this.addValue(prop, item.property);
      } else {
        this.addValue(prop, item.property, item.defaultValue);
      }
    });
    const values = [];
    if (dm.a("comps_func")) {
      prop.comps = { values, func: dm.a("comps_func") };
    } else {
      prop.comps = values;
    }
    dm.each(data => {
      if (data.getTag() !== "__renderHTML__") {
        values.push(data.toJSON());
      }
    });
    return prop;
  }
}
