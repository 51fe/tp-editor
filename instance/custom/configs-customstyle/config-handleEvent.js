(function () {

  window.tpeditor_config.handleEvent = function (editor, type, params) {
    var S = tpeditor.getString;
    if (type === 'editorCreated') {
      handleEditorCreated(editor);
      // addPoints(editor);
    }
    else if (type === 'displayViewCreated' || type === 'displayViewOpened') {
      addPrintSelectionItem(params.displayView.displayTree, 'editor.displayTree');
      addPrintSelectionItem(params.displayView.graphView, 'editor.displayView.graphView');
      // params.displayView.graphView.getEditInteractor().setStyle('anchorVisible', false);
      // params.displayView.graphView.getEditInteractor().setStyle('connectGuideVisible', false);
    }
    else if (type === 'symbolViewCreated' || type === 'symbolViewOpened') {
      addPrintSelectionItem(params.symbolView.symbolList, 'editor.symbolList');
      addPrintSelectionItem(params.symbolView.graphView, 'editor.symbolView.graphView');
    }
    else if (type === 'displayViewSaving') {
      // if (!params.displayView.dm.size()) {
      //     window.alert(S('NothingToBeSaved'));
      //     params.preventDefault = true;
      // }
    }
    else if (type === 'symbolViewSaving') {
      // if (!params.symbolView.dm.size()) {
      //     window.alert(S('NothingToBeSaved'));
      //     params.preventDefault = true;
      // }
    }
    else if (type === 'paste') {
      params.datas.forEach(function (data) {
        var dataBindings = data.getDataBindings();
        if (dataBindings) {
          // update attrs
          for (var name in dataBindings.a) {
            var db = dataBindings.a[name];
            db.id = db.id + '_copied';
          }
          // update styles
          for (var name in dataBindings.s) {
            var db = dataBindings.s[name];
            db.id = db.id + '_copied';
          }
          // update properties
          for (var name in dataBindings.p) {
            var db = dataBindings.p[name];
            db.id = db.id + '_copied';
          }
        }
      });
    }
  };

  function addPrintSelectionItem(view, name) {
    var items = view.menu.getItems();
    items.push('separator');
    items.push({
      icon: 'symbols/basic/ht.json',
      label: tpeditor.getString('PrintSelection'),
      visible: function () {
        if (view instanceof ht.widget.TabView) {
          return view.getTabModel().getSelectionModel().size() > 0;
        }
        else {
          return view.getSelectionModel().size() > 0;
        }
      },
      background: function () {
        return '#F7F7F7';
      },
      action: function () {
        console.log(name + ' selection:[');
        if (view instanceof ht.widget.TabView) {
          view.getTabModel().getSelectionModel().each(function (data) {
            console.log(data);
          });
        }
        else {
          view.getSelectionModel().each(function (data) {
            console.log(data);
          });
        }
        console.log(']');
      }
    });
  }
  function handleEditorCreated(editor) {
    // Prevent some files from being renamed, moved or deleted
    editor.addEventListener(function (event) {
      if (event.type === 'fileRenaming' ||
        event.type === 'fileMoving' ||
        event.type === 'fileDeleting') {
        if (event.params.url === 'symbols/basic/ht.json' ||
          event.params.url === 'symbols/basic' ||
          event.params.url === 'displays/basic') {
          event.params.preventDefault = true;
        }
      }
    });

    editor.displays.list.menu.setItemVisible('open', false);
    editor.symbols.list.menu.setItemVisible('open', false);
    editor.symbols.list.menu.setItemVisible('insert', false);
    editor.components.list.menu.setItemVisible('open', false);
    editor.components.list.menu.setItemVisible('insert', false);
    editor.assets.list.menu.setItemVisible('insert', false);


    // Add print item
    addPrintSelectionItem(editor.displays.tree, 'editor.displays.tree');
    addPrintSelectionItem(editor.displays.list, 'editor.displays.list');
    addPrintSelectionItem(editor.symbols.tree, 'editor.symbols.tree');
    addPrintSelectionItem(editor.symbols.list, 'editor.symbols.list');
    addPrintSelectionItem(editor.components.tree, 'editor.components.tree');
    addPrintSelectionItem(editor.components.list, 'editor.components.list');
    addPrintSelectionItem(editor.assets.tree, 'editor.assets.tree');
    addPrintSelectionItem(editor.assets.list, 'editor.assets.list');
    addPrintSelectionItem(editor.mainTabView, 'editor.mainTabView');

    // 修改tab样式
    var drawTab = function (g, tab, x, y, w, h, background) {
      var self = this,
        color = background,
        font = self.getLabelFont(tab),
        label = self.getLabel(tab),
        tabWidth = self.getTabWidth(tab),
        selectBackground = self._selectBackground,
        textSize = ht.Default.getTextSize(font, label),
        selectWidth = textSize.width,
        selectHeight = 2;

      g.save();
      if (tab === self.getCurrentTab()) {
        var offsetX = (tabWidth - selectWidth) / 2;
        g.fillStyle = selectBackground;
        g.fillRect(x + offsetX, y + h - selectHeight - 1, selectWidth, selectHeight)
        color = selectBackground;
      }
      ht.Default.drawText(g, label, font, color, x, y, w, h, 'center', 'middle');
      g.restore();
    }
    var getLabelFont = function (tab) {
      var font = '14px Microsoft YaHei';
      if (tab === this.getCurrentTab()) {
        return 'bold ' + font;
      }
      return font;
    }
    editor.leftTopTabView.setTabHeight(32);
    editor.leftTopTabView.drawTab = drawTab;
    editor.leftTopTabView.getLabelFont = getLabelFont;
    editor.rightBottomTabView.setTabHeight(32);
    editor.rightBottomTabView.drawTab = drawTab;
    editor.rightBottomTabView.getLabelFont = getLabelFont;

    // 右侧属性页工具栏高
    editor.rightTopBorderPane.setTopHeight(0);
    // 左侧tab组件 tab高
    editor.leftTopTabView.setTabHeight(32);
    // 编辑tab组件 tab高度
    editor.mainTabView.setTabHeight(32);
    // 顶部工具栏高度
    editor.mainPane.setTopHeight(36);

    // 列表下工具条不可见
    editor.displays.bottomPane.setBottomHeight(0)
    editor.symbols.bottomPane.setBottomHeight(0)
    editor.components.bottomPane.setBottomHeight(0)
    editor.assets.bottomPane.setBottomHeight(0)
    // // Remove components tab
    // editor.leftTopTabView.remove(editor.componentsTab);

    // // Rearrange toolbar items
    // var mainItems = editor.mainToolbar.getItems();
    // var rightItems = editor.rightToolbar.getItems();
    // editor.mainToolbar.setItems([mainItems[0], editor.rightToolbar.removeItemById('save')]);
    // editor.rightToolbar.setItems(mainItems.slice(1).concat(rightItems));

    // // Draw extra icon on file list
    // var fileList = editor.displays.list;
    // fileList.addTopPainter(function(g) {
    //     var htIcon = ht.Default.getImage('symbols/basic/ht.json');
    //     fileList.getDataModel().each(function(file) {
    //         if (fileList.isVisible(file)) {
    //             if (fileList.getLayoutType() === 'list') {
    //                 var x = 0;
    //                 var y = file.p().y - fileList.getRowHeight() / 2;
    //                 var width = fileList.getWidth();
    //                 var height = fileList.getRowHeight();
    //                 g.fillStyle = 'yellow';
    //                 g.beginPath();
    //                 g.rect(width - 16, y, 16, 16);
    //                 g.fill();
    //                 ht.Default.drawStretchImage(g, htIcon, 'uniform', width - 16, y, 16, 16);
    //             }
    //             else {
    //                 var rect = file.getRect();
    //                 g.fillStyle = 'yellow';
    //                 g.beginPath();
    //                 g.rect(rect.x + rect.width - 16, rect.y, 16, 16);
    //                 g.fill();
    //                 ht.Default.drawStretchImage(g, htIcon, 'uniform', rect.x + rect.width - 16, rect.y, 16, 16);
    //             }
    //         }
    //     });
    // });

    // Add a custom tab to show more information
    // addCustomTab(editor);

    // Disable symbol editing
    // var oldOpen = editor.open;
    // editor.open = function(fileNode) {
    //     if (fileNode && fileNode.fileType === 'symbol') {
    //         return;
    //     }
    //     oldOpen.apply(editor, arguments);
    // }
  }

  function addPoints(editor) {
    var pointsTab = new ht.Tab();
    pointsTab.setName('测点');
    editor.leftTopTabView.getTabModel().add(pointsTab);

    var fileIcon = 'symbols/basic/point.json';
    var textIcon = {
      "width": 32,
      "height": 16,
      "comps": [
        {
          "type": "text",
          "text": "##.#",
          "align": "center",
          "rect": [
            0,
            0,
            32,
            16
          ]
        }
      ]
    };
    var points = new tpeditor.Explorer(editor, '测点根目录', false);
    pointsTab.setView(points);
    points.list.isDroppableToDisplayView = true;
    points.list.handleDropToEditView = function (view, fileNode, point, event) {
      if (fileNode.getIcon() === textIcon) {
        var text = new ht.Text();
        text.s({
          'text': '##.#',
          'text.align': 'center'
        });
        text.setDataBindings({
          s: { text: { id: fileNode.getName() } }
        });
        text.a(fileNode.getAttrObject());
        text.setDisplayName(fileNode.getName());
        text.p(point);
        view.addData(text);
      }
      else {
        var node = new ht.Node();
        node.setImage(fileIcon);
        node.a(fileNode.getAttrObject());
        node.p(point);
        node.setDisplayName(fileNode.getName());
        view.addData(node);
      }
    };
    var json = {
      'Factory 1': {
        'Reactor 200': {
          'P201': { fileType: 'point', fileIcon: fileIcon },
          'P202': { fileType: 'point', fileIcon: fileIcon }
        },
        'Reactor 300': {
          'P305': { fileType: 'point', fileIcon: fileIcon },
          'P306': { fileType: 'point', fileIcon: fileIcon },
          'P307': { fileType: 'point', fileIcon: fileIcon },
        },
      },
      'Factory 2': {
        'Reactor 400': {
          fileType: 'dir',
          attrs: { 'needToLoad': true }
        },
      },
      'P001': { fileType: 'point', fileIcon: textIcon, styles: { 'image.stretch': 'uniform' } },
      'P002': { fileType: 'point', fileIcon: textIcon, styles: { 'image.stretch': 'uniform' } },
      'P003': { fileType: 'point', fileIcon: textIcon, styles: { 'image.stretch': 'uniform' } },
      'P004': {
        fileType: 'point', fileIcon: fileIcon,
        styles: { label: 'TPEDITOR', 'label.color': 'red' },
        attrs: { pointColor: 'red', dragImage: 'assets/hightopo.png' }
      },
      'P005': { fileType: 'point', fileIcon: fileIcon, attrs: { pointColor: 'green', dragImage: fileIcon } }
    }

    points.parse(json);

    points.tree.sm().ms(function (event) {
      var data = points.tree.sm().ld();
      if (data && data.a('needToLoad')) {
        data.a('needToLoad', false);
        for (var i = 0; i < 100; i++) {
          var value = {
            fileType: 'point',
            fileIcon: textIcon,
            styles: { 'image.stretch': 'uniform' },
            attrs: { 'userInfo': '<' + i + '>' }
          };
          points.parseChild(data, 'HT-' + i, value);
        }
      }
    });
  }

  // function addCustomTab(editor) {
  //     var tabView = new ht.widget.TabView();
  //     var styleTab = new ht.Tab();
  //     styleTab.setName('Style Properties');
  //     styleTab.setView(editor.inspectorPane);
  //     tabView.getTabModel().add(styleTab);

  //     var customFormPane = new ht.widget.FormPane();
  //     var customTab = new ht.Tab();
  //     customTab.setName('Custom Properties');
  //     customTab.setView(customFormPane);
  //     tabView.getTabModel().add(customTab);

  //     tabView.getTabModel().sm().ss(styleTab);
  //     editor.rightTopBorderPane.setCenterView(tabView);

  //     var dm;
  //     var data;
  //     var updaters = [];
  //     editor.addEventListener(function(event) {
  //         if (event.type === 'tabUpdated') {
  //             if (dm) {
  //                 dm.sm().removeSelectionChangeListener(updateCustomFormPane);
  //                 dm.removeDataPropertyChangeListener(handlePropertyChange);
  //             }
  //             dm = editor.displayView ? editor.displayView.dm : null;
  //             if (dm) {
  //                 dm.sm().addSelectionChangeListener(updateCustomFormPane);
  //                 dm.addDataPropertyChangeListener(handlePropertyChange);
  //             }
  //             updateCustomFormPane();
  //         }
  //     });

  //     function updateCustomFormPane() {
  //         customFormPane.clear();
  //         if (dm) {
  //             data = dm.sm().ld();
  //             updates = [];
  //             if (data) {
  //                 // add Id row
  //                 var getter = function() {
  //                     return data.getId();
  //                 };
  //                 var setter = null;
  //                 createTextField('Id', getter, setter);

  //                 // Add name row
  //                 getter = function() {
  //                     if (data) {
  //                         return data.getDisplayName() || '';
  //                     }
  //                     return '';
  //                 };
  //                 setter = function(value) {
  //                     if (data) {
  //                         data.setDisplayName(value);
  //                     }
  //                 };
  //                 createTextField('Name', getter, setter);

  //                 var index = 0;
  //                 data.eachChild(function(child) {
  //                     createChildInfo(child, index++);
  //                 });
  //             }
  //         }
  //         updateProperties();
  //     }

  //     function createTextField(name, getter, setter) {
  //         var textField = new ht.widget.TextField();
  //         customFormPane.addRow([name, textField], [70, 0.1]);
  //         updaters.push(function() {
  //             textField.setValue(getter());
  //         });
  //         if (setter) {
  //             var input = textField.getElement();
  //             input.onblur = function() {
  //                 setter(input.value);
  //             };
  //             input.onkeydown = function(event) {
  //                 if (ht.Default.isEnter(event)) {
  //                     setter(input.value);
  //                 }
  //             };
  //         }
  //         else {
  //             textField.setEditable(false);
  //         }
  //     }

  //     function createChildInfo(child, index) {
  //         var title = { element: ' > Child-' + index, font: 'bold 12px arial, sans-serif' };
  //         customFormPane.addRow([title], [0.1], null, { background: '#F7F7F7' });

  //         // add Id row
  //         var getter = function() {
  //             return child.getId();
  //         };
  //         var setter = null;
  //         createTextField('Id', getter, setter);

  //         // Add name row
  //         getter = function() {
  //             return child.getDisplayName() || '';
  //         };
  //         setter = function(value) {
  //             child.setDisplayName(value);
  //         };
  //         createTextField('Name', getter, setter);
  //     }

  //     function handlePropertyChange(event) {
  //         if (event.data === data) {
  //             updateProperties();
  //         }
  //     }

  //     function updateProperties() {
  //         if (data) {
  //             updaters.forEach(function(updater) {
  //                 updater();
  //             });
  //         }
  //     }
  // }

})();
























