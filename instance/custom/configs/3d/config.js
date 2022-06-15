window.tpeditor_config = {
  // port: 4000,
  locale: 'zh',
  promptBeforeClosing: true,
  indent: 110,
  imageSize: 400,
  numberPrecision: {
    position: 0,
    scale: 3,
    anchor: 4,
    rotation: 0,
    size: 0
  },
  importConfirm: true,

  // 为 socket.io 提供路径映射
  // urlPrefix: '2d/',

  // 配置编辑器扩展，运行于 client.js 加载前
  subConfigs: [
    'custom/configs/3d/config-handleEvent.js',
    'custom/configs/3d/config-onEditor3dCreated.js',
    'custom/configs/config-points.js',
    'custom/configs/config-valueTypes.js',
    'custom/configs/config-dataBindings.js',
    'custom/configs/config-customProperties.js'
  ],

  // 配置运行时依赖类库，运行于 client.js 加载后，
  // 一般放置需要与运行时共享的通用类库
  libs: [
    'custom/libs/gaolu-modeling.js',
    'custom/libs/gaolu-dialog.js',
    'custom/libs/echarts.js',
    'custom/libs/socket.io.js'
  ]
};
