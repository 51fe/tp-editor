(function () {

  window.tpeditor_config.onEditorCreated = function (editor, params) {
    // editor.leftTopTabView.select(editor.assetsTab);
    // editor.displays.list.menu.setItemVisible('rename', false);
    // editor.symbols.list.menu.setItemVisible('rename', false);
    // editor.components.list.menu.setItemVisible('rename', false);
    // editor.assets.list.menu.setItemVisible('rename', false);

    // Add print item
    // addPrintSelectionItem(editor.displays.tree, 'editor.displays.tree');
    // addPrintSelectionItem(editor.displays.list, 'editor.displays.list');
    // addPrintSelectionItem(editor.symbols.tree, 'editor.symbols.tree');
    // addPrintSelectionItem(editor.symbols.list, 'editor.symbols.list');
    // addPrintSelectionItem(editor.components.tree, 'editor.components.tree');
    // addPrintSelectionItem(editor.components.list, 'editor.components.list');
    // addPrintSelectionItem(editor.assets.tree, 'editor.assets.tree');
    // addPrintSelectionItem(editor.assets.list, 'editor.assets.list');
    // addPrintSelectionItem(editor.mainTabView, 'editor.mainTabView');

    // Add points tab
    // addPointsTab(editor);

    // Add a custom tab to show more information
    // addInspectorTab(editor);

    // Draw extra icon on file list
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
  };

})();
























