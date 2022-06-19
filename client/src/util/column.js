import { getString } from ".";

export function getColumn(name, displayName, width, types) {
  return {
    name,
    tag: name,
    accessType: "attr",
    width,
    displayName,
    align: "center",
    enum: types,
    editable: true
  }
}

export function setColumn(editor, tableView) {
  const column = tableView.getColumnModel().getDataByTag("defaultValue"),
    valueTypes = tpeditor.config.valueTypes;
  column.getValue = data => {
    let defaultValue = data.a("defaultValue");
    if (data.a("valueType") === "Angle" && defaultValue) {
      defaultValue = defaultValue / Math.PI * 180;
    }
    return defaultValue;
  };
  column.setValue = (data, column, defaultValue) => {
    if (data.a("valueType") === "Angle") {
      defaultValue = defaultValue * Math.PI / 180;
    }
    data.a("defaultValue", defaultValue);
  };
  column.getEnumValues = data => {
    const valueType = data ? valueTypes[data.a("valueType")] : null;
    return valueType?.type === "enum" ? valueType.values : null;
  };
  column.getEnumLabels = data => {
    const valueType = data ? valueTypes[data.a("valueType")] : null;
    return valueType?.type === "enum" ? valueType.labels : null
  };
  column.getEnumIcons = data => {
    const valueType = data ? valueTypes[data.a("valueType")] : null;
    return valueType?.type === "enum" ? valueType.icons : null
  };
  column.getEnumDropDownWidth = data => {
    const valueType = data ? valueTypes[data.a("valueType")] : null;
    return valueType?.type === "enum" ? valueType.dropDownWidth : null
  };
  column.getValueType = data => {
    const valueType = data ? valueTypes[data.a("valueType")] : null;
    return valueType?.type ?? null
  };
  column.isCellEditable = data => {
    const valueType = data ? valueTypes[data.a("valueType")] : null,
      type = valueType ? valueType.type : null,
      extraInfo = data.a("extraInfo"),
      handler = tpeditor.config.handleDefaultVauleColumnEdit,
      setter = (value) => {
        data.a("defaultValue", value)
      },
      defaultValue = data.a("defaultValue");
    if (handler?.(setter, valueType, type, extraInfo)) return false;
    if (type === "function") {
      const title = getString("editor.function") + " " + data.a("property") ?? "";
      editor.functionView.open(defaultValue, setter, title, extraInfo?.arguments);
      return false;
    }
    if (type === "multiline") {
      editor.textView.open(defaultValue, setter, data.a("property") ?? "&nbsp;");
      return false;
    }
    if (type === "font") {
      editor.fontView.open(defaultValue, setter, data.a("property") ?? "&nbsp;")
      return false;
    }
    if (["object", "custom", "stringArray", "objectArray",
      "numberArray", "colorArray"].includes(type)) {
      const title = getString("editor.object") + " " + data.a("property") ?? "";
      editor.fontView.open(defaultValue, setter, title);
      return false;
    }
    if (type === "dataModel") {
      editor.dataModelView.open(defaultValue, setter, column.editable, extraInfo);
      return false;
    }
    return true;
  }
}

export function setExtraInfoColumn(editor, tableView) {
  tableView.getColumnModel().getDataByTag("extraInfo").isCellEditable = data => {
    const title = getString("editor.extrainfo") + " " + (data.a("property") || "");
    editor.objectView.open(data.a("extraInfo"), value => {
      data.a("extraInfo", value)
    }, title);
    return false;
  }
}
