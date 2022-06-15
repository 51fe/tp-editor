(function () {

  var isHandling = false;
  window.tpeditor_config.onTitleCreated = function (editor, params) {
    if (!isHandling) {
      isHandling = true;
      handleTitleCreated(editor, params);
      isHandling = false;
    }
  };

  function handleTitleCreated(editor, params) {
    var title = params.title;
    var oldTitle = params.oldTitle;
    var inspector = params.inspector;
    if (inspector.type === 'display' && title === 'TitleBasic') {
      addPropertiesToDisplay(inspector);
    }
  }

  function addPropertiesToDisplay(inspector) {
    var S = tpeditor.getString;
    var indent = tpeditor.config.indent;

    var dialog = createDialog(inspector);

    var items = [];
    var label = '定时器';
    var toolTip = '设置定时器';
    var icon = null;
    var onClicked = function () {
      updateTimers(inspector, dialog);
      dialog.show();
    };
    var button = tpeditor.createButton(label, toolTip, icon, onClicked);
    items.push('定时器');
    items.push(button);
    inspector.addRow(items, [indent, 0.1]);

  }

  function updateTimers(inspector, dialog) {
    var timers = inspector.getPropertyValue('timers');
    dialog.tableModel.clear();
    if (timers) {
      timers.forEach(function (timer) {
        var data = new ht.Data();
        data.a('func', timer.func);
        data.a('interval', timer.interval);
        dialog.tableModel.add(data);
      });
    }
  }

  function commitTimers(inspector, dialog) {
    var timers = [];
    dialog.tableModel.each(function (data) {
      timers.push({
        func: data.a('func'),
        interval: data.a('interval')
      });
    });
    inspector.setPropertyValue('timers', timers);
  }

  function createDialog(inspector) {
    var tableModel = new ht.DataModel();
    var tablePane = new ht.widget.TablePane(tableModel);
    var tableView = this.tableView = tablePane.getTableView();
    tableView.setEditable(true);
    tablePane.getView().style.border = tpeditor_config.color_line + ' solid 1px';
    tablePane.addColumns([
      {
        name: 'func',
        accessType: 'attr',
        width: 200,
        displayName: '函数名称',
        editable: true
      },
      {
        name: 'interval',
        accessType: 'attr',
        valueType: 'int',
        width: 140,
        displayName: '周期（单位：毫秒）',
        editable: true
      }
    ]);

    var formPane = new ht.widget.FormPane();

    formPane.addRow([
      {
        button: {
          label: '添加',
          onClicked: function () {
            var data = new ht.Data();
            data.a('func', 'action');
            data.a('interval', 500);
            tableModel.add(data);
          }
        }
      },
      {
        button: {
          label: '删除',
          onClicked: function () {
            tableView.removeSelection();
          }
        }
      }
    ],
      [40, 40]);

    formPane.addRow([tablePane], [0.1], 0.1)
    var dialog = new ht.widget.Dialog();
    var buttons = [];
    buttons.push({
      label: '确定',
      action: function () {
        commitTimers(inspector, dialog);
        dialog.hide();
      }
    });
    buttons.push({
      label: '取消',
      action: function () {
        dialog.hide();
      }
    });
    dialog.setConfig({
      title: '设置定时器',
      closable: true,
      draggable: true,
      width: 400,
      height: 300,
      contentPadding: 6,
      resizeMode: "wh",
      maximizable: true,
      content: formPane,
      buttons: buttons,
      buttonsAlign: 'right'
    });

    dialog.tableModel = tableModel;
    return dialog;
  }
})();
























