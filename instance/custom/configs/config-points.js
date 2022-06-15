
// Used in config-valueTypes.js
function createPointsValueType() {
  return {
    type: 'custom',
    buildUI: function (inspector, items, displayName, getter, setter) {
      inspector.addLabelInput(items, displayName, getter, setter);
      var pointsExplorer = createPointsExplorer(inspector.editor);
      var label = '...';
      var toolTip = null;
      var icon = null;
      var once = true;
      var handler = function (data) {
        var dialog = new ht.widget.Dialog();
        var buttons = [];
        buttons.push(
          {
            label: '确定',
            action: function () {
              var data = pointsExplorer.list.sm().ld();
              inspector.setValue(setter, data ? data.getId() : undefined);
              dialog.hide();
            }
          },
          {
            label: '取消',
            action: function () {
              dialog.hide();
            }
          }
        );
        dialog.setConfig({
          title: '选择测点',
          draggable: true,
          width: 300,
          height: 400,
          contentPadding: 0,
          content: pointsExplorer,
          buttons: buttons,
          buttonsAlign: 'right'
        });
        var value = inspector.getValue(getter);
        var data = pointsExplorer.list.dm().getDataById(value);
        if (data) {
          pointsExplorer.tree.sm().ss(data.getParent());
          pointsExplorer.list.sm().ss(data);
        }
        dialog.show();
      };
      inspector.addButton(items, label, toolTip, icon, handler, once);
    }
  };
}

// Used in config-handleEvent.js
function addPointsTab(editor) {
  var pointsTab = new ht.Tab();
  pointsTab.setName('测点');
  editor.leftTopTabView.getTabModel().add(pointsTab);
  pointsTab.setView(createPointsExplorer(editor, true));
  return pointsTab;
}

function createPointsExplorer(editor, draggable) {
  var fileIcon = 'symbols/basic/point.json';
  var textIcon = {
    "width": 32,
    "height": 16,
    "comps": [
      {
        "type": "text",
        "text": "##.#",
        "align": "center",
        "rect": [0, 0, 32, 16]
      }
    ]
  };
  var pointsExplorer = new tpeditor.Explorer(editor, '测点根目录', false);
  var json = {
    '电池': {
      'B001': { fileType: 'point', fileIcon: 'symbols/demo/battery/battery.json' },
      'B002': { fileType: 'point', fileIcon: 'symbols/demo/battery/battery.json' },
      'B003': { fileType: 'point', fileIcon: 'symbols/demo/battery/battery.json' }
    },
    '油罐': {
      'T001': { fileType: 'point', fileIcon: 'symbols/basic/tank.json' },
      'T002': { fileType: 'point', fileIcon: 'symbols/basic/tank.json' },
      'T003': { fileType: 'point', fileIcon: 'symbols/basic/tank.json' },
      'T004': { fileType: 'point', fileIcon: 'symbols/basic/tank.json' }
    },
    '风扇': {
      '三叶片': { fileType: 'dir', attrs: { 'needToLoad': true, prefix: 'FA/', icon: 'symbols/demo/fan/fan1.json' } },
      '四叶片': { fileType: 'dir', attrs: { 'needToLoad': true, prefix: 'FB/', icon: 'symbols/demo/fan/fan2.json' } }
    },
    '电流': {
      'Ia': { fileType: 'point', fileIcon: textIcon, styles: { 'image.stretch': 'uniform' } },
      'Ib': { fileType: 'point', fileIcon: textIcon, styles: { 'image.stretch': 'uniform' } },
      'Ic': { fileType: 'point', fileIcon: textIcon, styles: { 'image.stretch': 'uniform' } },
      '空目录': {
      },
      '自定义目录': {
        fileType: 'dir',
        fileIcon: 'symbols/basic/告警.json',
        fileImage: 'symbols/basic/告警绑定.json',
        attrs: {
          alarmInfo: {
            severity: 1,
            count: 8
          }
        },
        children: {
          'None drag image': { fileType: 'point', fileIcon: textIcon, styles: { 'image.stretch': 'uniform' }, attrs: { dragImage: null } },
          'Custom drag image': {
            fileType: 'point',
            fileIcon: textIcon,
            fileImage: 'symbols/basic/ht.json',
            styles: { 'image.stretch': 'uniform' },
            attrs: { dragImage: 'assets/hightopo.png' }
          },
        }
      }
    }
  }

  pointsExplorer.parse(json);
  pointsExplorer.tree.sm().ms(function (event) {
    var data = pointsExplorer.tree.sm().ld();
    if (data && data.a('needToLoad')) {
      data.a('needToLoad', false);
      for (var i = 1; i < 10; i++) {
        var value = {
          fileType: 'point',
          fileIcon: data.a('icon')
        };
        pointsExplorer.parseChild(data, data.a('prefix') + i, value);
      }
    }
  });

  if (draggable) {
    pointsExplorer.list.isDroppableToDisplayView = true;
    pointsExplorer.list.handleDropToEditView = function (view, fileNode, point, event) {
      if (fileNode.getIcon() === textIcon) {
        var text = new ht.Text();
        text.s({
          'text': '##.#',
          'text.align': 'center'
        });
        text.setDataBindings({
          s: { text: { id: fileNode.getName() } }
        });
        text.setDisplayName(fileNode.getName());
        text.p(point);
        view.addData(text);
      }
      else {
        var node = new ht.Node();
        node.setImage(fileNode.getImage());
        node.p(point);
        node.setDisplayName(fileNode.getName());
        view.addData(node);
      }
    };
  }

  return pointsExplorer;
}

