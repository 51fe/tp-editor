import config from "../config.js";
import { clone, parse } from "../util/index.js";
import EditView from "./EditView.js";
import DisplayGraphView from "./DisplayGraphView.js";
import DisplayTree from "./DisplayTree.js";

import CreateShapeInteractor from "../interactor/CreateShapeInteractor.js";
import CreateNodeInteractor from "../interactor/CreateNodeInteractor.js";
import CreateEdgeInteractor from "../interactor/CreateEdgeInteractor.js";

export default class DisplayView extends EditView {
  constructor(editor, tab, url, json, ListTree, sceneView, parent_uuid, root_dir) {
    super(editor, tab, DisplayGraphView, "display", sceneView, parent_uuid, root_dir);
    this.displayTree = this.list = new (ListTree || DisplayTree)(this);
    this.dm.setHierarchicalRendering(true);
    this.dm.enableHistoryManager(config.maxUndoRedoSteps);
    this.dirty = false;
    this.parse(url, json);
    const node = editor.getFileNode(url);
    this.editable = !node || false !== node.a("editable");
    if (!sceneView) {
      if (url && !json) {
        this.editor.fireEvent("displayViewOpening", {
          displayView: this,
          url
        });
      } else {
        this.editor.fireEvent("displayViewCreated", {
          displayView: this,
          json: json
        });
      }
    }
    if (config.standaloneViewCounter) {
      this?.initIdCounter?.();
    }
  }

  onClosed() {
    super.onClosed(this);
    this.displayTree.onClosed();
  }

  handleDataModelChanged(e) {
    if (e.kind === "add" && !this.dm.isDeserializing() && !ht.Default.isIsolating()) {
      e.data.setLayer(this.editor.currentLayer);
    }
    this.dirty = true;
  }

  clear() {
    if (!this.sceneView) {
      this.dm.beginTransaction();
      super.clear();
      this.dm.a("connectActionType", config.displayConnectActionType);
      this.dm.a("anchorEnabled", config.displayAnchorEnabled);
      this.dm.a("guideLineEnabled", config.displayGuideLineEnabled);
      this.dm.a("highlightEnabled", config.displayHighlightEnabled);
      this.dm.a("highlightColor", config.displayHighlightColor);
      this.dm.a("highlightBorderWidth", config.displayHighlightBorderWidth);
      this.dm.a("highlightBorderPattern", config.displayHighlightBorderPattern);
      this.dm.endTransaction();
    }
  }

  resetGrid() {
    if (!this.sceneView) {
      this.dm.beginTransaction();
      this.dm.a("rulerEnabled", config.displayRulerEnabled);
      this.dm.a("gridEnabled", config.displayGridEnabled);
      this.dm.a("gridBlockSize", config.displayGridBlockSize);
      this.dm.a("gridThickLinesEvery", config.displayGridThickLinesEvery);
      this.dm.a("gridThickColor", config.displayGridThickColor);
      this.dm.a("gridLightColor", config.displayGridLightColor);
      this.dm.a("gridAngle", config.displayGridAngle);
      this.dm.a("gridRotation", config.displayGridRotation);
      this.dm.a("gridZoomThreshold", config.displayGridZoomThreshold);
      this.dm.a("alignmentGuideEnabled", config.displayGridAlignmentGuideEnabled);
      this.dm.a("alignmentGuideColor", config.displayGridAlignmentGuideColor);
      this.dm.endTransaction();
    }
  }

  updateImpl(json, dirty) {
    const _config = parse(json);
    this.clear();
    this.dm.deserialize(json, undefined, {
      setId: config.setId,
      disableInit: true,
      disableOnPreDeserialize: true,
      disableOnPostDeserialize: true
    });
    this.dirty = !!dirty;
    if (!dirty && config.fitContentForDisplayView) {
      if (_config.contentRect) {
        const rect = clone(_config.contentRect);
        ht.Default.grow(rect, config.fitPadding);
        if (this.graphView.getWidth() && this.graphView.getHeight()) {
          this.graphView.fitRect(rect, config.animate);
        } else {
          setTimeout(() => {
            this.graphView.fitRect(rect, config.animate)
          }, 600)
        }
      } else {
        this.graphView.fitContent(config.animate, config.fitPadding);
      }
    }
    return _config;
  }

  createInteractor(type, callback, fill) {
    const instance = new type;
    if (instance instanceof ht.Shape) {
      return new CreateShapeInteractor(this.tab, null, function (points, segments) {
        const shape = new type;
        shape.setPoints(points);
        shape.setSegments(segments);
        callback && callback(shape);
        return shape;
      }, fill);
    }
    if (instance instanceof ht.Edge) {
      return new CreateEdgeInteractor(this.tab, null, function (node, points) {
        const edge = new ht.Edge(node, points);
        callback && callback(edge);
        return edge;
      });
    }
    if (instance instanceof ht.Node) {
      return new CreateNodeInteractor(this.tab, null, function (points, segments) {
        const node = new type;
        callback && callback(node, points, segments);
        return node;
      });
    }
    return undefined;
  }

  get content() {
    const dm = this.dm,
      json = dm.toJSON();
    json.modified = (new Date).toString();
    dm.a("connectActionType") === config.displayConnectActionType && delete json.a.connectActionType;
    dm.a("rulerEnabled") === config.displayRulerEnabled && delete json.a.rulerEnabled;
    dm.a("gridEnabled") === config.displayGridEnabled && delete json.a.gridEnabled;
    dm.a("gridBlockSize") === config.displayGridBlockSize && delete json.a.gridBlockSize;
    dm.a("gridThickLinesEvery") === config.displayGridThickLinesEvery && delete json.a.gridThickLinesEvery;
    dm.a("gridThickColor") === config.displayGridThickColor && delete json.a.gridThickColor;
    dm.a("gridLightColor") === config.displayGridLightColor && delete json.a.gridLightColor;
    dm.a("gridAngle") === config.displayGridAngle && delete json.a.gridAngle;
    dm.a("gridRotation") === config.displayGridRotation && delete json.a.gridRotation;
    dm.a("gridZoomThreshold") === config.displayGridZoomThreshold && delete json.a.gridZoomThreshold;
    dm.a("anchorEnabled") === config.displayAnchorEnabled && delete json.a.anchorEnabled;
    dm.a("guideLineEnabled") === config.displayGuideLineEnabled && delete json.a.guideLineEnabled;
    dm.a("highlightEnabled") === config.displayHighlightEnabled && delete json.a.highlightEnabled;
    dm.a("highlightColor") === config.displayHighlightColor && delete json.a.highlightColor;
    dm.a("highlightBorderWidth") === config.displayHighlightBorderWidth && delete json.a.highlightBorderWidth;
    dm.a("highlightBorderPattern") === config.displayHighlightBorderPattern && delete json.a.highlightBorderPattern;
    dm.a("xAlignmentGuides") && !dm.a("xAlignmentGuides").length && delete json.a.xAlignmentGuides;
    dm.a("yAlignmentGuides") && !dm.a("yAlignmentGuides").length && delete json.a.yAlignmentGuides;
    dm.a("alignmentGuideEnabled") === config.displayGridAlignmentGuideEnabled && delete json.a.alignmentGuideEnabled;
    dm.a("alignmentGuideColor") === config.displayGridAlignmentGuideColor && delete json.a.alignmentGuideColor;
    const rect = this.graphView.getContentRect();
    dm.a("width") > 0 && dm.a("height") > 0 && (json.contentRect = {
      x: 0,
      y: 0,
      width: dm.a("width"),
      height: dm.a("height")
    });
    dm.size() && rect?.width && rect?.height && (json.contentRect = rect);
    return json;
  }
}
