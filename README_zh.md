# tp-editor (2D/3D)[English Doc](https://github.com/51fe/tp-editor/blob/master/README.md)
> 拓扑编辑器用到了nodejs、express、socket.io、es6、Web版HT及vite等技术。 它是一款功能强大的低代码大屏数据可视化工具。

## 特性

- 支持简单拖拽画图编辑;
- 支持图纸、图标、组件、场景和模型导入（拖拽）导出（右键菜单）;
- 支持常见格式的2D资源和3D模型上传（拖拽）;
- 支持SVG、CAD文件导入及图纸、图标的转换;
- 支持Obj、mtl 3D格式及贴图;
- 支持图纸、图标场景预览;
- 支持属性、样式和字段的数据绑定
- 支持主题、菜单、标签页及控制功能的配置和自定义;
- 支持多语言;
- 支持Http(s)和websocket多协议;
- 支持整合第三方数据可视化库（Echarts）。

## 截图
- [2D编辑器](http://159.75.3.240:8080) (默认)
![2D](https://www.riafan.com/github/tp-editor/2d.png)
- [3D编辑器](http://159.75.3.240:8080/3d.html)
![3D](https://www.riafan.com/github/tp-editor/3d.png)

## 运行

### 开发环境

- 修改配置文件

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
- 运行开发环境客户端

```shell
cd tp-editor\client
npm run dev
```
- 使用nodemon运行开发环境服务端

```shell
cd tp-editor\server
npm run dev
```

### 生产环境

- 修改配置文件

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
- 编译生产环境客户端
```shell
cd tp-editor\client
npm run build
```
- 双击run.bat，就这没简单~~

## 支持

- [HT使用手册](https://www.hightopo.com/guide/guide/core/treetableview/examples/example_structure.html)
- [HT API](https://www.hightopo.com/guide/doc/index.html)
- [TP编辑器使用手册](https://www.yuque.com/docs/share/0200221e-0f40-427a-9793-8a61c93e283b?# 《拓扑编辑器使用手册》)
