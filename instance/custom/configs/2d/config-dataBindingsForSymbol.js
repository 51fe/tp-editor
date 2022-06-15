window.tpeditor_config.dataBindingsForSymbol = {
  // filter: function(property, inspector) {
  //     if (property === 'width' || property === 'rotation') return false;
  //     return true;
  // },
  // getToolTip: function(property, insepctor) {
  //     return property + ': { func: ^_^ }';
  // },
  // comboBoxEditable: true,
  // getComboBoxValues: function(callback) {
  //     callback(['key1', 'key2', 'key3', 'key4', 'key5', 'key6']);
  // },
  onButtonClicked: function (funcView, property, editor) {
    var dataModel = new ht.DataModel();
    var treeView = new ht.widget.TreeView(dataModel);
    for (var i = 0; i < 100; i++) {
      var data = new ht.Data();
      data.setName('key' + i);
      dataModel.add(data);
    }

    var dialog = new ht.widget.Dialog();
    var buttons = [];
    buttons.push(
      {
        label: '确定',
        action: function () {
          var data = treeView.sm().ld();
          funcView.v('property', data ? data.getName() : '');
          dialog.hide();
          funcView.smartClose = true;
        }
      },
      {
        label: '取消',
        action: function () {
          dialog.hide();
          funcView.smartClose = true;
        }
      }
    );
    dialog.setConfig({
      title: 'Binding for ' + property,
      draggable: true,
      width: 200,
      height: 230,
      contentPadding: 0,
      content: treeView,
      buttons: buttons,
      buttonsAlign: 'right'
    });
    dialog.show();
  }
};
