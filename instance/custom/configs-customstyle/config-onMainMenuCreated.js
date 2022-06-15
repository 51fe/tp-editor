(function () {

  window.tpeditor_config.onMainMenuCreated = function (editor, params) {
    var S = tpeditor.getString;
    var mainMenu = editor.mainMenu;

    // Hide some items from main menu
    mainMenu.setItemVisible('undo', false);
    mainMenu.setItemVisible('redo', false);
    mainMenu.setItemVisible('afterRedo', false);

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
            label: S('Blog'),
            action: function () { window.open('http://www.hightopo.com/blog'); }
          },
          {
            label: S('Guide'),
            action: function () { window.open('http://www.hightopo.com/guide/readme.html'); }
          }
        ]
      },
      {
        label: S('ContactUs'),
        action: function () { window.open('mailto:riafan@163.com'); }
      }
    ];
    if (!isPracticing) {
      items = items.concat([
        'separator',
        {
          label: S('Readme'),
          action: function () { window.open('../help/readme.txt'); }
        },
        {
          label: S('Releases'),
          action: function () { window.open('../help/releases.txt'); }
        }
      ]);
    }
    mainMenu.getItems().push({
      label: S('Help'),
      items: items
    });
  };

})();
























