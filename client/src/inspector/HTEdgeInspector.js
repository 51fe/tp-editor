import { getString } from "../util/index.js";
import HTNodeInspector from "./HTNodeInspector.js";


export default class HTEdgeInspector extends HTNodeInspector {
  constructor(editor, name) {
    super(editor, name)
  }

  initForm() {
    this.addEditingPointProperties();
    this.addCustomProperties();
    this.addControlProperties();
    this.addBasicProperties();
    this.addDBGray();
    this.addEdgeBasicProperties();
    this.addEdgeEndpointProperties();
    this.addEdgeDashProperties();
    this.addLabelProperties();
    this.addNoteProperties();
    this.addSelectProperties()
  }

  addControlProperties() {
    this.addTitle("TitleControl");
    this.addEventProperties();
    this.addDBCheckBox("s", getString("editor.visible"), "2d.visible");
    this.addDBCheckBox("s", getString("editor.selectable"), "2d.selectable");
    this.addDBCheckBox("s", getString("editor.editable"), "2d.editable");
    this.addDBCheckBox("s", getString("editor.independent"), "edge.independent");
    this.addDBCheckBox("s", getString("editor.toggleable"), "edge.toggleable");
  }

  isTitleVisible(row) {
    if (!("TitleEditingPoint" === row.title && !this.editor.pointsEditingMode)) {
      return super.isTitleVisible(row);
    }
    return false;
  }

  invalidateProperties(e) {
    if (e) {
      const property = e.property;
      if (["s:edge.type", "source", "target", "s:select.type"].includes(property)) {
        this.filterPropertiesLater();
        return false;
      }
    }
    super.invalidateProperties(e)
  }

  isPropertyVisible(row) {
    if (this.data) {
      const tag = row.items.tag;
      if (tag) {
        const type = this.data.s("edge.type");
        if ("edgeRipple" === tag) {
          if ("ripple" !== type) return false
        } else if ("edgeRadius" === tag) {
          const config = {
            "h.v": true,
            "v.h": true,
            ortho: true,
            flex: true,
            "extend.east": true,
            "extend.west": true,
            "extend.north": true,
            "extend.south": true,
            ortho2: true,
            flex2: true,
            "extend.north2": true,
            "extend.south2": true,
            "extend.west2": true,
            "extend.east2": true,
            "v.h2": true,
            "h.v2": true
          };
          if (!config[type]) return false
        } else if ("edgeOrtho" === tag) {
          if ("ortho" !== type && "ortho2" !== type) return false
        } else if ("edgeFlex" === tag) {
          if ("flex" !== type && "flex2" !== type) return false
        } else if ("edgeExtend" === tag) {
          const config = {
            "extend.east": true,
            "extend.west": true,
            "extend.north": true,
            "extend.south": true,
            "extend.north2": true,
            "extend.south2": true,
            "extend.west2": true,
            "extend.east2": true
          };
          if (!config[type]) return false
        } else if ("layer" === tag) {
          if (!this.editor.layerPane.layerNames.length) return false
        } else {
          if (!("edgeSourceIsEdge" !== tag || this.data.getSource() instanceof ht.Edge)) return false;
          if (!("edgeTargetIsEdge" !== tag || this.data.getTarget() instanceof ht.Edge)) return false;
          if (!("edgeSourceIsNode" !== tag || this.data.getSource() instanceof ht.Node)) return false;
          if ("edgeTargetIsNode" === tag && !(this.data.getTarget() instanceof ht.Node)) return false
        }
      }
    }
    return super.isPropertyVisible(row)
  }

  addBasicProperties() {
    super.addBasicProperties();
    this.addDBLayer();
    this.addDBInput("p", getString("editor.tooltip"), "toolTip");
    this.addDBOpacityProperty();
    this.addDBIconsProperty()
  }

  addSelectProperties() {
    this.addTitle("TitleSelect");
    this.addDBColor("s", getString("editor.color"), "select.color");
    this.addDBInput("s", getString("editor.width"), "select.width", "number", 1);
    const items = [];
    this.addLabelCheckBox(items, getString("editor.shadow"),
      data => {
        return "shadow" === data.s("select.type")
      },
      (data, value) => {
        data.s("select.type", value ? "shadow" : null)
      });
    this.addDBRow(items, "s", "select.type");
    this.addDBInput("s", getString("editor.shadowblur"), "shadow.blur", "number", 1);
    this.addDBInput("s", getString("editor.shadowoffsetx"), "shadow.offset.x", "number", 1);
    this.addDBInput("s", getString("editor.shadowoffsety"), "shadow.offset.y", "number", 1);
  }

  addEdgeBasicProperties() {
    this.addTitle("TitleEdgeBasic");
    this.addDBInput("s", getString("editor.width"), "edge.width", "number", 1);
    this.addDBCheckBox("s", getString("editor.widthabsolute"), "edge.width.absolute");
    this.addDBPattern("s", getString("editor.pattern"), "edge.pattern");
    this.addDBColor("s", getString("editor.color"), "edge.color");
    this.addDBCheckBox("s", getString("editor.threed"), "edge.3d");
    this.addDBColor("s", getString("editor.threedcolor"), "edge.3d.color");
    this.addDBComboBox("s", getString("editor.join"), "edge.join", tpeditor.consts.joins, tpeditor.consts.joinLabels);
    this.addDBComboBox("s", getString("editor.cap"), "edge.cap", tpeditor.consts.caps, tpeditor.consts.capLabels);
    this.addDBInput("s", getString("editor.group"), "edge.group");
    this.addDBInput("s", getString("editor.offset"), "edge.offset", "number", 1);
    this.addDBInput("s", getString("editor.gap"), "edge.gap", "number", 1);
    this.addDBComboBox("s", getString("editor.type"), "edge.type", tpeditor.consts.edgeTypes, tpeditor.consts.edgeTypeLabels);
    this.addDBInput("s", getString("editor.radius"), "edge.corner.radius", "number", 1).items.tag = "edgeRadius";
    this.addDBZeroToOne("s", getString("editor.ortho"), "edge.ortho").items.tag = "edgeOrtho";
    this.addDBInput("s", getString("editor.flex"), "edge.flex", "number", 1).items.tag = "edgeFlex";
    this.addDBInput("s", getString("editor.extend"), "edge.extend", "number", 1).items.tag = "edgeExtend";
    this.addDBInput("s", getString("editor.ripplesize"), "edge.ripple.size", "int", 1).items.tag = "edgeRipple";
    this.addDBInput("s", getString("editor.ripplelength"), "edge.ripple.length", "number", 1).items.tag = "edgeRipple";
    this.addDBInput("s", getString("editor.rippleelevation"), "edge.ripple.elevation", "number", 1).items.tag = "edgeRipple";
    this.addDBCheckBox("s", getString("editor.rippleboth"), "edge.ripple.both").items.tag = "edgeRipple";
    this.addDBCheckBox("s", getString("editor.ripplestraight"), "edge.ripple.straight").items.tag = "edgeRipple";
    this.addDBCheckBox("s", getString("editor.center"), "edge.center");
    const items = [],
      setter = function (node) {
        node instanceof ht.Edge && node.toggle()
      };
    setter.once = true;
    this.addLabelCheckBox(items, getString("editor.expanded"), function (p) {
      return p.s("edge.expanded")
    }, setter);
    this.addDBRow(items, "s", "edge.expanded");
  }

  addEdgeDashProperties() {
    this.addTitle("TitleEdgeDash");
    this.addDBCheckBox("s", getString("editor.dash"), "edge.dash");
    this.addDBPattern("s", getString("editor.pattern"), "edge.dash.pattern");
    this.addDBColor("s", getString("editor.color"), "edge.dash.color");
    this.addDBInput("s", getString("editor.offset"), "edge.dash.offset", "number", 1);
    this.addDBInput("s", getString("editor.width"), "edge.dash.width", "number", 1);
    this.addDBCheckBox("s", getString("editor.threed"), "edge.dash.3d");
    this.addDBColor("s", getString("editor.threedcolor"), "edge.dash.3d.color")
  }

  addEdgeEndpointProperties() {
    this.addTitle("TitleEdgeEndpoint");
    this.addDBData("p", getString("editor.sourcedata"), "source",
      function (data, source) {
        if (data instanceof ht.Edge) {
          if (null == source || source instanceof ht.Node || source instanceof ht.Edge) {
            data.setSource(source);
            data.s("edge.source.percent", .5);
          }
        }
      });
    this.addDBData("p", getString("editor.targetdata"), "target",
      function (data, target) {
        if (data instanceof ht.Edge) {
          if (null == target || target instanceof ht.Node || target instanceof ht.Edge) {
            data.setTarget(target);
            data.s("edge.source.percent", .5);
          }
        }
      });
    let row = undefined;
    row = this.addDBZeroToOne("s", getString("editor.sourcepercent"), "edge.source.percent");
    row.items.tag = "edgeSourceIsEdge";
    row = this.addDBRange("s", getString("editor.sourceindex"), "edge.source.index", -1, undefined, 1, "int");
    row.items.tag = "edgeSourceIsEdge";
    row = this.addDBPosition("s", getString("editor.sourceposition"), "edge.source.position");
    row.items.tag = "edgeSourceIsNode";
    row = this.addDBInput("s", getString("editor.sourceoffsetx"), "edge.source.offset.x", "number", 1);
    row.items.tag = "edgeSourceIsNode";
    row = this.addDBInput("s", getString("editor.sourceoffsety"), "edge.source.offset.y", "number", 1);
    row.items.tag = "edgeSourceIsNode";
    row = this.addDBInput("s", getString("editor.sourceanchorx"), "edge.source.anchor.x", "number", .01);
    row.items.tag = "edgeSourceIsNode";
    row = this.addDBInput("s", getString("editor.sourceanchory"), "edge.source.anchor.y", "number", .01);
    row.items.tag = "edgeSourceIsNode";
    row = this.addDBZeroToOne("s", getString("editor.targetpercent"), "edge.target.percent");
    row.items.tag = "edgeTargetIsEdge";
    row = this.addDBRange("s", getString("editor.targetindex"), "edge.target.index", -1, undefined, 1, "int");
    row.items.tag = "edgeTargetIsEdge";
    row = this.addDBPosition("s", getString("editor.targetposition"), "edge.target.position");
    row.items.tag = "edgeTargetIsNode";
    row = this.addDBInput("s", getString("editor.targetoffsetx"), "edge.target.offset.x", "number", 1);
    row.items.tag = "edgeTargetIsNode";
    row = this.addDBInput("s", getString("editor.targetoffsety"), "edge.target.offset.y", "number", 1);
    row.items.tag = "edgeTargetIsNode";
    row = this.addDBInput("s", getString("editor.targetanchorx"), "edge.target.anchor.x", "number", .01);
    row.items.tag = "edgeTargetIsNode";
    row = this.addDBInput("s", getString("editor.targetanchory"), "edge.target.anchor.y", "number", .01);
    row.items.tag = "edgeTargetIsNode";
  }
}
