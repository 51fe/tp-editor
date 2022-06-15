window.tpeditor_config.appendDisplayConnectActionTypes = ['HostParent', 'CreateEdge', 'CopySize', 'AnimatePaths'];
window.tpeditor_config.appendSymbolConnectActionTypes = ['CopySize'];
window.tpeditor_config.appendConnectActions = {
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
  },
  AnimatePaths: {
    action: function (gv, source, target) {
      if (source instanceof ht.Node && target instanceof ht.Shape) {
        gv.dm().beginTransaction();
        if (target.getTag() == null) target.setTag(target.getId());
        var animatePaths = source.a('animatePaths');
        if (!animatePaths) animatePaths = {};
        animatePaths = ht.Default.clone(animatePaths);
        animatePaths[target.getTag()] = true;
        source.a('animatePaths', animatePaths);
        gv.dm().endTransaction();
      }
    },
    extraInfo: {
      delete: {
        visible: function (gv) {
          var data = gv.sm().ld();
          return data instanceof ht.Node && data.a('animatePaths');
        },
        action: function (gv, source) {
          if (source instanceof ht.Node) {
            source.a('animatePaths', undefined);
          }
        }
      },
      visible: function (gv) {
        return gv.sm().ld() instanceof ht.Node;
      }
    }
  }
};
