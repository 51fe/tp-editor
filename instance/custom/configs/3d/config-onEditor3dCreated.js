(function () {
  window.tpeditor_config.onEditor3dCreated = function (editor3d, params) {
    addMainMenu(editor3d);
  };

  function addMainMenu(editor3d) {
    const items = editor3d.mainMenu.getItems();
    items[1].items.push({
      label: '高炉模型',
      action: function () {
        editor3d.getModelDialog('gaolu').open();
      }
    });
  }
})();
