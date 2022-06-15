var GaoluDialog = function(editor) {
    GaoluDialog.superClass.constructor.call(this);

    this.editor = editor;
    var buttons = [];
    buttons.push({
         label: '确认',
         action: function () {
            this.ok();
         }
    });
    buttons.push({
         label: '取消',
         action: function () {
            this.hide();
         }
    });
    this.dm = new ht.DataModel();
    this.node = new ht.Node();
    this.node.setAnchor3d(0.5, 0, 0.5);
    this.dm.add(this.node);
    this.g3d = new ht.graph3d.Graph3dView(this.dm);
    this.g3d.setGridVisible(true);
    this.g3d.setFar(100000);
    this.g3d.setGridSize(100);
    this.g3d.setGridGap(100);
    this.g3d.setEye([0, 4000, 6000]);
    this.g3d.setCenter([0, 2000, 0]);
    this.table = this.createTable();

    this.formPane = new ht.widget.FormPane();
    var items = [];
    this.formPane.addRow([
        {
            element: '路径'
        },
        {
            id: 'url',
            textField: {}
        }
    ],
    [60, 0.1]);
    this.formPane.addRow([
        {
            element: this.table
        }
    ],
    [0.1], 0.1);
    this.splitView = new ht.widget.SplitView(this.g3d, this.formPane, 'h', 0.4);

    this.setConfig({
        title: '高炉模型设置',
        closable: true,
        draggable: true,
        width: 600,
        height: 400,
        contentPadding: 0,
        resizeMode: "wh",
        maximizable: true,
        content: this.splitView,
        buttons: buttons,
        buttonsAlign: 'right'
    });
    this.setModal(false);
};

ht.Default.def('GaoluDialog', ht.widget.Dialog, {
    ok: function() {
        let url = this.formPane.v('url');
        if (!url) return;
        var params = {
            path: url,
            content: ht.Default.stringify(this.json)
        };
        this.editor.request('upload', params, function (data) {
            params = {
                path: url.substr(0, url.length - 5) + '.png',
                content: this.g3d.toDataURL(this.dm.getBackground())
            };
            this.editor.request('upload', params, function (data) {
                this.hide();
            });
        });

    },
    open: function(url, json) {
        json = json || {
          "modelType": "gaolu",
          "class": "GaoluDialog",
          "params": [
            {
              "id": "head",
              "label": "炉顶封罩",
              "outsideRadius": "3300;8200",
              "insideRadius": "3000;7200",
              "height": "3000"
            },
            {
              "id": "throat",
              "label": "炉喉",
              "outsideRadius": "8200",
              "insideRadius": "7200",
              "height": "2000"
            },
            {
              "id": "body",
              "label": "炉身",
              "outsideRadius": "8200;12200",
              "insideRadius": "7200;11200",
              "height": "15000"
            },
            {
              "id": "waist",
              "label": "炉腰",
              "outsideRadius": "12200",
              "insideRadius": "11200",
              "height": "1800"
            },
            {
              "id": "belly",
              "label": "炉腹",
              "outsideRadius": "12200;10800",
              "insideRadius": "11200;9800",
              "height": "3300"
            },
            {
              "id": "jar",
              "label": "炉缸",
              "outsideRadius": "10800;11800",
              "insideRadius": "9800",
              "height": "6600"
            },
            {
              "id": "bottom",
              "label": "炉底",
              "outsideRadius": "11800",
              "insideRadius": "9800",
              "height": "3767"
            },
            {
              "id": "base",
              "label": "炉基",
              "outsideRadius": "11800",
              "insideRadius": "9800",
              "height": "3127"
            }
          ]
        };

        this.url = url;
        this.json = json;
        if (this.url) {
            this.formPane.getViewById('url').setEditable(false);
            this.formPane.v('url', this.url);
        }
        else {
            this.formPane.getViewById('url').setEditable(true);
            this.formPane.v('url', this.editor.models.currentDir + '/***.json');
        }
        this.updateModel();
        this.initTable(this.json);
        if (!this.isShowing()) {
            this.show();
        }
    },
    createTable: function() {
        var table = new ht.widget.TablePane();

        table.setColumns([
            {
                displayName: '部位',
                name: 'label',
                accessType: 'attr',
                editable: false
            },
            {
                displayName: '外径',
                name: 'outsideRadius',
                accessType: 'attr',
                editable: true
            },
            {
                displayName: '内径',
                name: 'insideRadius',
                accessType: 'attr',
                editable: true
            },
            {
                displayName: '高度',
                name: 'height',
                accessType: 'attr',
                editable: true
            }
        ]);

        table.getTableView().setEditable(true);

        var dm = table.getDataModel();
        dm.md(this.updateModel, this);

        return table;
    },
    updateModel: function() {
        var handler = ht.Default.getModelTypeHandler('gaolu');
        var node = this.node;
        handler(this.json, function(model) {
            node.s('shape3d', model);
        });
    },
    initTable: function(json) {
        var table = this.table;
        var dm = table.getDataModel();
        dm.clear();

        json.params.forEach(function (p) {
            var node = new ht.Node();
            node.setTag(p.id);
            node.setAttrObject(p);
            dm.add(node);
        });
    }
});

if (!tpeditor_config.modelDialogClasses) {
    tpeditor_config.modelDialogClasses = {};
}
tpeditor_config.modelDialogClasses.gaolu = GaoluDialog;