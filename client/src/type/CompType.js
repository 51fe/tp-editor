import config from "../config.js";
import { getString } from "../util/index.js";
import { renderUI, setProperty, updateBaseProperty, updateProperty } from "../util/type.js";

import { EVENTS } from "../constants.js";

export default class CompType extends ht.Node {
  constructor(prop, w, h, newAdded) {
    super();
    this.newAdded = newAdded;
    this.defaultValueMap = {};
    this.parse(prop, w, h);
  }

  getClass() {
    return CompType;
  }

  toLabel() {
    return this.getDisplayName() || this.s("type") || getString("editor.comptype.comp");
  }

  getStyle(name, value) {
    let style = super.getStyle(name, value);
    if (style === undefined) {
      style = this.defaultValueMap[name]
    }
    return style;
  }

  updateComponent(component) {
    if (this.properties) {
      this.properties = null;
    }
    this.disableDirty = true;
    this.defaultValueMap = {};
    const type = this.s("type"),
      cache = ht.Default.getCompType(type);
    if (cache) {
      this.newAdded && cache.events && this._updateEvents(cache.events);
      this.newAdded = undefined;
      this.component = null;
      const json = {
        cache,
        width: {
          value: 100, isSafeFunc: true,
          func: function (p) {
            return p._width
          }
        },
        height: {
          value: 100, isSafeFunc: true, func: function (p) {
            return p._height
          }
        },
        comps: [{
          type: {
            func: function (p) {
              return p.compType
            }, isSafeFunc: true
          }
        }]
      };
      !cache.width || this._width > 0 || this.setWidth(cache.width);
      !cache.height || this._height > 0 || this.setHeight(cache.height);
      if (cache.properties) {
        this.properties = cache.properties;
        for (let name in this.properties) {
          const prop = this.properties[name];
          json.comps[0][name] = { func: "style@" + name };
          setProperty(this, name, component ? component[name] : undefined, prop.defaultValue);
          this.defaultValueMap[name] = prop.defaultValue
        }
      }
      const comp = config.customProperties.comp;
      comp?.forEach?.(function (item) {
        const name = item.property;
        json.comps[0][name] = { func: "style@" + name }
      });
      this.setImage(json);
      this.ivLater()
    } else {
      this.component = component;
      if (this.getImage() !== "editor.comp") {
        this.setImage("editor.comp");
        this.ivLater();
      }
    }
    this.disableDirty = false;
  }

  ivLater() {
    ht.Default.callLater(() => {
      this.disableDirty = true;
      this.iv();
      this.disableDirty = false;
    })
  }

  onStyleChanged(name, oldValue, newValue) {
    super.onStyleChanged(name, oldValue, newValue);
    if (name === "type") {
      if (oldValue) {
        this.newAdded = true;
      }
      this.updateComponent(this.parsingComp);
    }
  }

  parse(prop, w, h) {
    if (prop) {
      this.parsingComp = prop;
      renderUI(this, prop, w, h);
      setProperty(this, "type", prop.type);
      this.parsingComp = null;
    }
  }

  _updateEvents(events) {
    EVENTS.forEach(item => {
      return this.a(item, undefined);
    });
    this.a(events);
  }

  toJSON() {
    const prop = {};
    updateProperty(this, prop, "type", "type", undefined);
    updateBaseProperty(this, prop);
    if (this.properties) {
      for (const name in this.properties) {
        updateProperty(this, prop, name, name, this.properties[name].defaultValue);
      }
    }
    return prop;
  }

  get compType() {
    const type = this.s("type");
    if (this.component) {
      this.updateComponent(this.component);
    } else if (type && ht.Default.getCompType(type) !== this.getImage().cache) {
      this.updateComponent(this.toJSON());
    }
    return type;
  }
}
