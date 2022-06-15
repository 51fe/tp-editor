function addInspectorTab(editor) {
  var tabView = new ht.widget.TabView();
  var tabHeight = tabView.getTabHeight();
  var styleTab = new ht.Tab();
  styleTab.setName('Style Properties');
  styleTab.setView(editor.inspectorPane);
  tabView.getTabModel().add(styleTab);

  var formPane = new ht.widget.FormPane();
  var customTab = new ht.Tab();
  customTab.setName('Custom Properties');
  customTab.setView(formPane);
  tabView.getTabModel().add(customTab);

  tabView.getTabModel().sm().ss(styleTab);
  editor.rightTopBorderPane.setCenterView(tabView);

  var dm;
  var data;
  var updaters = [];
  editor.addEventListener(function (event) {
    if (event.type === 'tabUpdated') {
      if (dm) {
        dm.sm().removeSelectionChangeListener(updateFormPane);
        dm.removeDataPropertyChangeListener(handlePropertyChange);
      }
      dm = editor.displayView ? editor.displayView.dm : null;
      if (dm) {
        dm.sm().addSelectionChangeListener(updateFormPane);
        dm.addDataPropertyChangeListener(handlePropertyChange);
      }
      updateFormPane();
    }
  });
  updateFormPane();

  function updateFormPane() {
    data = null;
    formPane.clear();
    if (dm) {
      data = dm.sm().ld();
      updates = [];
      if (data) {
        // add Id row
        var getter = function () {
          return data.getId();
        };
        var setter = null;
        createTextField('Id', getter, setter);

        // Add name row
        getter = function () {
          if (data) {
            return data.getDisplayName() || '';
          }
          return '';
        };
        setter = function (value) {
          if (data) {
            data.setDisplayName(value);
          }
        };
        createTextField('Name', getter, setter);

        var index = 0;
        data.eachChild(function (child) {
          createChildInfo(child, index++);
        });
      }
    }
    updateProperties();
  }

  function createTextField(name, getter, setter) {
    var textField = new ht.widget.TextField();
    formPane.addRow([name, textField], [70, 0.1]);
    updaters.push(function () {
      textField.setValue(getter());
    });
    if (setter) {
      var input = textField.getElement();
      input.onblur = function () {
        setter(input.value);
      };
      input.onkeydown = function (event) {
        if (ht.Default.isEnter(event)) {
          setter(input.value);
        }
      };
    }
    else {
      textField.setEditable(false);
    }
  }

  function createChildInfo(child, index) {
    var title = { element: ' > Child-' + index, font: 'bold 12px arial, sans-serif' };
    formPane.addRow([title], [0.1], null, { background: '#F7F7F7' });

    // add Id row
    var getter = function () {
      return child.getId();
    };
    var setter = null;
    createTextField('Id', getter, setter);

    // Add name row
    getter = function () {
      return child.getDisplayName() || '';
    };
    setter = function (value) {
      child.setDisplayName(value);
    };
    createTextField('Name', getter, setter);
  }

  function handlePropertyChange(event) {
    if (event.data === data) {
      updateProperties();
    }
  }

  function updateProperties() {
    if (data) {
      tabView.setTabHeight(tabHeight);
      updaters.forEach(function (updater) {
        updater();
      });
    }
    else {
      tabView.getTabModel().sm().ss(styleTab);
      tabView.setTabHeight(0);
    }
  }
}
