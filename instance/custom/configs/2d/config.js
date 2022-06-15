window.isPracticing = window.location.host.indexOf('hightopo') >= 0;

window.tpeditor_config = {
  //color_select: '#FF7733',
  // explorerMode: 'accordion',
  // port: 4000,
  locale: 'zh',
  // rotateAsClock: true,
  // filterDisplayViewEnabled: false,
  // filterSymbolViewEnabled: true,
  // mixMaskAndBackground: false,
  // saveSymbolCustomPropertyDefaultValue: true,
  // saveCompCustomPropertyDefaultValue: true,
  // importDataBindingsButtonVisible: false,
  // scenesVisible: true,
  // modelsVisible: true,
  // fitContentForDisplayView: true,
  // fitContentForSymbolView: true,
  componentsVisible: !isPracticing,
  displaysEditable: !isPracticing,
  symbolsEditable: !isPracticing,
  componentsEditable: !isPracticing,
  assetsEditable: !isPracticing,
  locateFileEnabled: !isPracticing,
  fontPreview: 'TPEDITOR',
  expandedTitles: {
    TitleExtension: false
  },
  subConfigs: [
    'custom/configs/2d/config-utils.js',
    'custom/configs/config-points.js',
    'custom/configs/2d/config-inspectorTab.js',
    'custom/configs/2d/config-handleEvent.js',
    'custom/configs/config-valueTypes.js',
    'custom/configs/config-dataBindings.js',
    'custom/configs/2d/config-dataBindingsForSymbol.js',
    'custom/configs/2d/config-connectActions.js',
    'custom/configs/2d/config-inspectorFilter.js',
    'custom/configs/config-customProperties.js',
    'custom/configs/2d/config-onEditorCreated.js',
    'custom/configs/2d/config-onTitleCreating.js',
    'custom/configs/2d/config-onTitleCreated.js',
    'custom/configs/2d/config-onMainToolbarCreated.js',
    'custom/configs/2d/config-onMainMenuCreated.js',
    'custom/configs/2d/config-onRightToolbarCreated.js'
  ],
  libs: [
    'custom/libs/echarts.js',
    'custom/libs/socket.io.js'
  ],
  handleInsertSceneFileToGraphView: function (displayView, fileNode, point) {
    var node = new ht.Node();
    node.a('sceneURL', fileNode.url);
    node.setImage('symbols/html/scene.json')
    if (point) {
      node.p(point.x, point.y);
    }
    else {
      var rect = displayView.graphView.getViewRect();
      if (rect) {
        node.p(rect.x + rect.width / 2, rect.y + rect.height / 2);
      }
    }
    node.setDisplayName(tpeditor.fileNameToDisplayName(fileNode.url));
    displayView.addData(node);
  },
  handleInsertModelFileToGraphView: function (displayView, fileNode, point) {
    var node = new ht.Node();
    node.a('modelURL', fileNode.url);
    node.setImage('symbols/html/obj.json')
    if (point) {
      node.p(point.x, point.y);
    }
    else {
      var rect = displayView.graphView.getViewRect();
      if (rect) {
        node.p(rect.x + rect.width / 2, rect.y + rect.height / 2);
      }
    }
    node.setDisplayName(tpeditor.fileNameToDisplayName(fileNode.url));
    displayView.addData(node);
  }
};
