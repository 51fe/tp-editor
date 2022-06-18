# tp-editor（ 2D/3D）
> A topology 2D/3D editor with nodejs, express, socket.io es6, HT for Web and vite. It's a powerful large-screen data visualization tool with low-code.

## Features

- Graphic drawing and editing by dar ang drop;
- Displays, symbols and compoents creating and exporting;
- 2D assets and 3D models importing;
- SVG, CAD importing and displays, symbols converting;
- Obj, mtl, UVW 3D support;
- Displays, symbols, scenes preview;
- Attributes, styles, fields dataBinding;
- Themes, menus, tabs and functions configuration and customization;
- I18n support;
- Http(s) and websocket support;
- Third party data visualization libs support (Echarts).

## Snapshots
- 2D Editor (default)
![2D](https://www.riafan.com/github/tp-editor/2d.png)
- 3D Editor
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
- [TP Editor Guide](https://www.yuque.com/riafan/gbr71g/cllgrw)
