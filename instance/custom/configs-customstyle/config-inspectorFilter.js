(function () {
  var detail_data_titles = [
    'TitleNote'
  ];
  var detail_p_names = [
    'parent',
    'icon',
    'expanded'
  ];
  var detail_s_names = [
    '2d.move.mode',
    'ingroup',
    'label.opacity',
    'note.toggleable',
    'note.expanded',
    'note.opacity',
    'note.max',
    'edge.independent',
    'edge.toggleable',
    'edge.expanded',
    'edge.source.position',
    'edge.target.position',
    'group.position',
    'group.toggleable',
    'group.padding.left',
    'group.padding.right',
    'group.padding.top',
    'group.padding.bottom',
  ];
  var detail_comp_titles = [

  ];
  var detail_comp_names = [

  ];
  var detail_display_titles = [

  ];
  var detail_display_names = [
    //'previewURL'
  ];
  var detail_symbol_titles = [

  ];
  var detail_symbol_names = [

  ];
  window.tpeditor_config.detailFilter = {
    isDataTitleVisible: function (editor, data, title) {
      if (detail_data_titles[title]) {
        return false;
      }
      return true;
    },
    isDataPropertyVisible: function (editor, data, accessType, name) {
      if (accessType === 'p' && detail_p_names[name]) {
        return false;
      }
      if (accessType === 's' && detail_s_names[name]) {
        return false;
      }
      return true;
    },
    isCompTitleVisible: function (editor, type, title) {
      if (detail_comp_titles[title]) {
        return false;
      }
      return true;
    },
    isCompPropertyVisible: function (editor, type, name) {
      if (detail_comp_names[name]) {
        return false;
      }
      return true;
    },
    isDisplayTitleVisible: function (editor, title) {
      if (detail_display_titles[title]) {
        return false
      }
      return true;
    },
    isDisplayPropertyVisible: function (editor, name) {
      if (detail_display_names[name]) {
        return false;
      }
      return true;
    },
    isSymbolTitleVisible: function (editor, title) {
      if (detail_symbol_titles[title]) {
        return false
      }
      return true;
    },
    isSymbolPropertyVisible: function (editor, name) {
      if (detail_symbol_names[name]) {
        return false;
      }
      return true;
    }
  };

  var compact_data_titles = [
    'TitleLabel',
    'TitleSelect',
    'TitleEdgeNode',
    'TitleEdgeDash'
  ];
  var compact_p_names = [
    'className',
    'toolTip',
    'anchorX',
    'anchorY',
    'scaleX',
    'scaleY'
  ];
  var compact_s_names = [
    'icons',
    'opacity',
    'body.color',
    'image.stretch',
    'shape',
    'shape.border.join',
    'shape.border.cap',
    'shape.repeat.image',
    'shape.border.pattern',
    'edge.join',
    'edge.cap',
    'edge.group',
    'edge.gap',
    'group.image',
    'group.image.stretch',
    'group.repeat.image',
    'group.border.pattern',
    'group.border.join',
    'group.border.cap',
    'clip.percentage',
    'clip.direction',
    'shape.fill.clip.percentage',
    'shape.fill.clip.direction',
    'shape.fill.rule'
  ];
  var compact_comp_titles = [
    'TitleDash',
    'TitleShadow'
  ];
  var compact_comp_names = [
    'visible',
    'selectable',
    'movable',
    'editable',
    'opacity',
    'scaleX',
    'scaleY',
    'anchorX',
    'anchorY',
    'borderCap',
    'borderJoin',
  ];
  var compact_display_titles = [

  ];
  var compact_display_names = [
    'count'
  ];
  var compact_symbol_titles = [

  ];
  var compact_symbol_names = [
    'count',
    'visible',
    'clip'
  ];
  window.tpeditor_config.compactFilter = {
    isDataTitleVisible: function (editor, data, title) {
      if (compact_data_titles[title]) {
        return false;
      }
      return true;
    },
    isDataPropertyVisible: function (editor, data, accessType, name) {
      if (accessType === 'p' && compact_p_names[name]) {
        return false;
      }
      if (accessType === 's' && compact_s_names[name]) {
        return false;
      }
      return true;
    },
    isCompTitleVisible: function (editor, type, title) {
      if (compact_comp_titles[title]) {
        return false;
      }
      return true;
    },
    isCompPropertyVisible: function (editor, type, name) {
      if (compact_comp_names[name]) {
        return false;
      }
      return true;
    },
    isDisplayTitleVisible: function (editor, title) {
      if (compact_display_titles[title]) {
        return false
      }
      return true;
    },
    isDisplayPropertyVisible: function (editor, name) {
      if (compact_display_names[name]) {
        return false;
      }
      return true;
    },
    isSymbolTitleVisible: function (editor, title) {
      if (compact_symbol_titles[title]) {
        return false
      }
      return true;
    },
    isSymbolPropertyVisible: function (editor, name) {
      if (compact_symbol_names[name]) {
        return false;
      }
      return true;
    }
  };

  function toMap(array) {
    var map = {};
    array.forEach(function (o) {
      map[o] = true;
    });
    return map;
  }

  // data
  detail_data_titles = toMap(detail_data_titles);
  detail_p_names = toMap(detail_p_names);
  detail_s_names = toMap(detail_s_names);
  compact_data_titles = toMap(compact_data_titles);
  compact_p_names = toMap(compact_p_names);
  compact_s_names = toMap(compact_s_names);

  // comp
  detail_comp_titles = toMap(detail_comp_titles);
  detail_comp_names = toMap(detail_comp_names);
  compact_comp_titles = toMap(compact_comp_titles);
  compact_comp_names = toMap(compact_comp_names);

  // display
  detail_display_titles = toMap(detail_display_titles);
  detail_display_names = toMap(detail_display_names);
  compact_display_titles = toMap(compact_display_titles);
  compact_display_names = toMap(compact_display_names);

  // symbol
  detail_symbol_titles = toMap(detail_symbol_titles);
  detail_symbol_names = toMap(detail_symbol_names);
  compact_symbol_titles = toMap(compact_symbol_titles);
  compact_symbol_names = toMap(compact_symbol_names);

})();


