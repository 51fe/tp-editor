/* data.setDataBindings({
  p: {
    name: { id: 'M001' },
    icon: {
      id: 'M002',
      func: function (value) {
        if (value > 70) {
          return 'symbols/scada/alarm.json';
        }
        if (value > 50) {
          return 'symbols/scada/warning.json';
        }
        return 'symbols/scada/normal.json';
      }
    }
  },
  s: {
    'shape.background': {
      id: 'M002'
              func: function (value) {
        if (value > 70) {
          return 'red';
        }
        if (value > 50) {
          return 'yellow';
        }
        return 'green';
      }
    },
    'shape.border.width': { id: 'M003' },
  },
  a: {
    'pressure': { id: 'M004' },
    'temperature': { id: 'M005' },
    'volume': { id: 'M006' }
  }
}); */

window.tpeditor_config.dataBindings = {

  onButtonClicked: function (data, accessType, name) {
    var dataBindings = data.getDataBindings();
    var id = '';
    var func = null;
    if (dataBindings && dataBindings[accessType] && dataBindings[accessType][name]) {
      id = dataBindings[accessType][name].id;
      func = dataBindings[accessType][name].func;
    }

    var S = tpeditor.getString;
    var formPane = new ht.widget.FormPane();
    formPane.addRow([
      S('Property'),
      {
        textField: {
          text: name,
          editable: false
        }
      }
    ], [50, 0.1]);
    formPane.addRow([
      S('Id'),
      {
        id: 'input',
        textField: {
          text: id
        }
      }
    ], [50, 0.1]);
    formPane.addRow([
      {
        element: S('Func'),
        vAlign: 'top'
      },
      {
        id: 'textArea',
        element: new tpeditor.CodeEditor({
          value: tpeditor.stringifyFunction(func),
          language: 'javascript',
          minimap: {
            enabled: false
          }
        })
      }
    ], [50, 0.1], 0.1);

    var dialog = new ht.widget.Dialog();
    var buttons = [{
      label: S('Cancel'),
      action: function () {
        dialog.hide();
      }
    }, {
      label: S('OK'),
      action: function () {
        var id = formPane.v('input');
        var func = formPane.v('textArea');
        var dataBindings = data.getDataBindings();
        if (!dataBindings) {
          dataBindings = {};
        }
        if (!dataBindings[accessType]) {
          dataBindings[accessType] = {};
        }
        if (!dataBindings[accessType][name]) {
          dataBindings[accessType][name] = {};
        }
        if (!id) {
          delete dataBindings[accessType][name];
        }
        else {
          dataBindings[accessType][name].id = id;
          dataBindings[accessType][name].func = tpeditor.parseFunction(func);
        }
        data.setDataBindings(dataBindings);
        data.fp('dataBindings', true, false);
        dialog.hide();
      }
    }];
    dialog.setConfig({
      title: S('BindingId'),
      draggable: true,
      width: 400,
      height: 400,
      contentPadding: 4,
      content: formPane,
      buttons: buttons,
      buttonsAlign: 'right'
    });
    dialog.show();
    formPane.getViewById('input').setFocus();
  }
};
