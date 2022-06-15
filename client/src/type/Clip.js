import { getString, parseValue, updateValue } from "../util/index.js";
import { renderUI, setProperty, toPoints, toPointList, 
  updateBaseProperty, updateProperty } from "../util/type.js";

export default class Clip extends ht.Node {
  constructor(prop, w, h) {
    super();
    this.parse(prop, w, h);
  }

  getClass() {
    return Clip;
  }

  toLabel() {
    return this.getDisplayName() || getString("editor.comptype.clip");
  }

  parse(prop, w, h) {
    if (prop) {
      setProperty(this, "type", prop.type, "clip");
      renderUI(this, prop, w, h);
      this.setPoints(toPointList(parseValue(prop.points)));
      this.setSegments(parseValue(prop.segments));
    }
  }

  toJSON() {
    const prop = {};
    updateProperty(this, prop, "type", "type", undefined);
    updateBaseProperty(this, prop);
    updateValue(prop, "points", this.a("points"));
    toPoints(this.getPoints());
    if (this.getSegments()) {
      const segments = this.getSegments().toArray();
      if (segments.length) {
        let hasSegment = segments[0] === 1;
        if (hasSegment) {
          for (let i = 1; i < segments.length; i++) {
            if (segments[i] !== 2) {
              hasSegment = false;
              break;
            }
          }
        }
        hasSegment || updateValue(prop, "segments", this.a("segments"), segments);
      }
    }
    return prop;
  }

  get compType() {
    return this.s("shape");
  }
}

