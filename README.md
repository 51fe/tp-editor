# tp-editor（2D/3D）[中文说明](https://github.com/51fe/tp-editor/blob/master/README_zh.md)
> A topology 2D/3D editor with nodejs, express, socket.io es6, HT for Web and vite. It's a powerful large-screen data visualization tool with low-code.

## Features

- Graphic drawing and editing by darg ang drop;
- Displays, symbols and compoents importing（darg ang drop） and exporting（content menu）;
- 2D assets and 3D models importing;
- SVG, CAD importing and displays, symbols converting;
- Obj, mtl, UVW 3D support;
- Displays, symbols, scenes preview;
- Attributes, styles, fields dataBinding;
- Themes, menus, tabs and control functions configuration and customization;
- I18n support;
- Http(s) and websocket support;
- Third party data visualization libs support (Echarts).

## Snapshots
- [2D Editor](http://159.75.3.240:8080) (default)
![2D](https://www.riafan.com/github/tp-editor/2d.png)
- [3D Editor](http://159.75.3.240:8080/3d.html)
![3D](https://www.riafan.com/github/tp-editor/3d.png)

## Run

### Develpment

- Edit the configuration file

```shell
// server/config.ini
[Dev]
port = 4000
autoOpen = false
storagePrefix =
urlPrefix =
is3D = false
clientDir = ../client
customDir = ../instance/custom
storageDir = ../instance/storage
```
- Run the development client

```shell
cd tp-editor\client
npm run dev
```
- Run the development server with nodemon

```shell
cd tp-editor\server
npm run dev
```

### Production

- Edit the configuration file

```shell
// server/config.ini
[Pro]
port = 3000
autoOpen = true
storagePrefix =
urlPrefix =
is3D = false
clientDir = public
customDir = ../instance/custom
storageDir = ../instance/storage
```
- Build the production client
```shell
cd tp-editor\client
npm run build
```
- Double click run.bat, enjoy~~

## Support

- [HT Guide](https://www.hightopo.com/guide/guide/core/treetableview/examples/example_structure.html)
- [HT API](https://www.hightopo.com/guide/doc/index.html)
- [TP Editor Guide](https://www.yuque.com/docs/share/0200221e-0f40-427a-9793-8a61c93e283b?#拓扑编辑器使用手册》)
