window.isPracticing = window.location.host.indexOf('hightopo') >= 0;

window.tpeditor_config = {
  color_select: '#3658EF',
  locale: 'zh',
  locateFileEnabled: !isPracticing,
  componentsVisible: !isPracticing,
  displaysEditable: !isPracticing,
  symbolsEditable: !isPracticing,
  componentsEditable: !isPracticing,
  assetsEditable: !isPracticing,
  fontPreview: 'TPEDITOR',
  inspectorTitleHeight: 32,
  explorerMode: 'accordion',
  codeEditorClass: 'cs.MonacoDarkCodeEditor',
  fileSize: 58,
  expandedTitles: {
    TitleExtension: false
  },
  subConfigs: [
    'custom/libs/MonacoDarkCodeEditor.js',
    'custom/configs-customstyle/config-handleEvent.js',
    'custom/configs-customstyle/config-valueTypes.js',
    'custom/configs-customstyle/config-dataBindings.js',
    'custom/configs-customstyle/config-customProperties.js',
    'custom/configs-customstyle/config-onTitleCreating.js',
    'custom/configs-customstyle/config-onTitleCreated.js',
    'custom/configs-customstyle/config-onMainToolbarCreated.js',
    'custom/configs-customstyle/config-onMainMenuCreated.js',
    'custom/configs-customstyle/config-onRightToolbarCreated.js'
  ],
  libs: [
    'custom/libs/echarts.js',
    'custom/libs/socket.io.js'
  ],
  drawAccordionTitle: function (g, rect, data, view, option) {
    var isHover = option.isHover,
      isExpanded = option.isExpanded,
      hoverColor = option.hoverColor,
      selectColor = option.selectColor,
      label = view.getLabel(data);

    var x = rect.x,
      y = rect.y,
      width = rect.width,
      height = rect.height;

    if (isHover) {
      g.fillStyle = hoverColor;
      g.fillRect(x, y, width, height);
    }
    g.strokeStyle = selectColor;
    g.beginPath();
    if (isExpanded) {
      g.moveTo(x + 6, y + height / 2 + 2 - 6);
      g.lineTo(x + 14, y + height / 2 + 2);
      g.lineTo(x + 22, y + height / 2 + 2 - 6);
    }
    else {
      g.lineWidth = 2;
      g.moveTo(x + 6, y + height / 2);
      g.lineTo(x + 22, y + height / 2);
    }
    g.stroke();
    if (label) {
      ht.Default.drawText(g, label, 'bold 14px Arial', 'rgb(61,61,61)', x + 28, y, width - 28, height, 'left', 'middle');
    }
  },
  accordionMutex: true,
  appendDisplayConnectActionTypes: ['HostParent', 'CreateEdge', 'CopySize'],
  appendSymbolConnectActionTypes: ['CopySize'],
  appendConnectActions: {
    CopySize: {
      action: function (gv, source, target) {
        if (source instanceof ht.Node && target instanceof ht.Node) {
          source.setWidth(target.getWidth());
          source.setHeight(target.getHeight());
        }
      },
      extraInfo: {
        visible: function (gv) {
          return gv.sm().ld() instanceof ht.Node;
        }
      }
    },
    HostParent: {
      action: function (gv, source, target) {
        if (source instanceof ht.Node && target instanceof ht.Node) {
          gv.dm().beginTransaction();
          if (source instanceof ht.Node) source.setHost(target);
          source.setParent(target);
          gv.dm().endTransaction();
        }
      },
      extraInfo: {
        delete: {
          visible: function (gv) {
            var data = gv.sm().ld();
            return data instanceof ht.Node && (data.getHost() || data.getParent());
          },
          action: function (gv, source) {
            if (source instanceof ht.Node) {
              gv.dm().beginTransaction();
              source.setHost(undefined);
              source.setParent(undefined);
              gv.dm().endTransaction();
            }
          }
        },
        visible: function (gv) {
          return gv.sm().ld() instanceof ht.Node;
        }
      }
    },
    CreateEdge: {
      action: function (gv, source, target) {
        if (source instanceof ht.Node && target instanceof ht.Node) {
          var edge = new ht.Edge(source, target);
          gv.editView.addData(edge, false, false, true);
        }
      },
      extraInfo: {
        visible: function (gv) {
          return gv.sm().ld() instanceof ht.Node;
        }
      }
    }
  }
};
