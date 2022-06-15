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

function addSkewTranlateItem(view, editor) {
  var items = view.menu.getItems();
  items.push({
    label: '轴侧切换',
    visible: function () {
      return editor.editable && view.sm().size() > 0;
    },
    action: function () {
      view.sm().each(function (data) {
        if (data.getClassName() === 'ht.Node' && !data.s('shape')) {
          var skewImage = 'symbols/basic/skew-image.json';
          var image = data.getImage();
          if (image === skewImage) {
            data.setImage(data.a('skew.image') || 'node_image');
          }
          else {
            data.a('skew.image', image);
            data.setImage(skewImage);
          }
        }
      });
    }
  });
}
