(function () {

  window.tpeditor_config.onMainMenuCreated = function (editor, params) {
    var S = tpeditor.getString;
    var mainMenu = editor.mainMenu;

    // Add some items on main menu
    var items = [
      {
        label: S('Hightopo'),
        items: [
          {
            label: S('Home'),
            action: function () { window.open('http://www.hightopo.com'); }
          },
          {
            label: S('GetStarted'),
            action: function () { window.open('http://www.hightopo.com/guide/guide/core/beginners/ht-beginners-guide.html'); }
          },
          {
            label: S('Guide'),
            action: function () { window.open('http://www.hightopo.com/guide/readme.html'); }
          },
          {
            label: S('API'),
            action: function () { window.open('https://www.hightopo.com/guide/doc/index.html'); }
          }
        ]
      },
      {
        label: S('Hightopo'),
        items: [
          {
            label: S('GitHub'),
            action: function () { window.open('https://github.com/51fe'); }
          },
          {
            label: S('Guide'),
            action: function () { window.open('https://www.yuque.com/riafan/gbr71g/cllgrw'); }
          },
          {
            label: S('Blog'),
            action: function () { window.open('http://www.riafan.com'); }
          },
          {
            label: S('ContactUs'),
            action: function () { window.open('mailto:riafan@163.com'); }
          }
        ]
      }
    ];
    mainMenu.getItems().push({
      label: S('Help'),
      items: items
    });
  };

})();
























