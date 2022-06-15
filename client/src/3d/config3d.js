const Default = ht.Default,
  config3d = {
    ...tpeditor.config,
    texureImage3D: true,
    modelDialogClasses: {},
    objViewSize: { width: 800, height: 500 },
    imageViewSize: { width: 600, height: 500 },
    sceneGridEnabled: true,
    sceneGridBlockCount: 50,
    sceneGridBlockSize: 40,
    sceneGridColor: "rgb(191, 191, 191)",
    sceneEye: Default.graph3dViewEye,
    sceneCenter: Default.graph3dViewCenter,
    sceneNear: Default.graph3dViewNear,
    sceneFar: Default.graph3dViewFar,
    sceneBloom: false,
    sceneBloomStrength: 1.5,
    sceneBloomThreshold: .55,
    sceneBloomRadius: .4,
    sceneDof: false,
    sceneDofAperture: .025,
    sceneDofImage: null,
    sceneHighlightMode: "style",
    sceneHighlightColor: ht.Style["highlight.color"],
    sceneHighlightWidth: ht.Style["highlight.width"],
    sceneDashEnable: false,
    sceneHeadlightEnable: !Default.graph3dViewHeadlightDisabled,
    sceneHeadlightRange: Default.graph3dViewHeadlightRange,
    sceneHeadlightColor: "rgb(255,255,255)",
    sceneHeadlightIntensity: Default.graph3dViewHeadlightIntensity,
    sceneHeadlightAmbientIntensity: Default.graph3dViewHeadlightAmbientIntensity,
    sceneFogEnable: !Default.graph3dViewFogDisabled,
    sceneFogColor: Default.graph3dViewFogColor,
    sceneFogNear: Default.graph3dViewFogNear,
    sceneFogFar: Default.graph3dViewFogFar,
    sceneBatchBrightnessDisabled: Default.graph3dViewBatchBrightnessDisabled,
    sceneBatchBlendDisabled: Default.graph3dViewBatchBlendDisabled,
    sceneBatchColorDisabled: Default.graph3dViewBatchColorDisabled,
    sceneShadowEnabled: false,
    sceneShadowDegreeX: ht.Style["shadow.degree.x"],
    sceneShadowDegreeZ: ht.Style["shadow.degree.z"],
    sceneShadowIntensity: ht.Style["shadow.intensity"],
    sceneShadowQuality: ht.Style["shadow.quality"],
    sceneShadowType: ht.Style["shadow.type"],
    sceneShadowRadius: ht.Style["shadow.radius"],
    sceneShadowBias: ht.Style["shadow.bias"],
    sceneEditHelperDisabled: false,
    sceneOrthographic: false
  };

["TitleScenes"].forEach(function (key) {
  if (config3d.expandedTitles[key] === undefined) {
    config3d.expandedTitles[key] = true
  }
});
ht.Default.setImage("editor.axis", {
  background: "rgb(179,179,179)",
  width: 16,
  height: 16,
  blendMode: "override",
  comps: [{
    type: "shape",
    borderWidth: 1,
    borderColor: "rgb(138,138,138)",
    borderCap: "round",
    shadowColor: "#1ABC9C",
    points: [8, 2.48536, 8, 9, 1.08734, 12.01256, 8, 9, 14, 13]
  }]
});
ht.Default.setImage("editor.cube.image", {
  width: 100,
  height: 100,
  comps: [{ type: "rect", background: "rgba(156,156,156,0.4)", rect: [0, 0, 100, 100] }]
});
ht.Default.setImage("editor.sphere.image", {
  width: 100,
  height: 100,
  comps: [{ type: "oval", background: "rgba(156,156,156,0.4)", rect: [0, 0, 100, 100] }]
});
ht.Default.setImage("editor.floor", {
  background: "rgb(0,0,0)",
  width: 16,
  height: 16,
  comps: [{
    type: "parallelogram",
    borderWidth: 1,
    borderColor: "rgb(255,255,255)",
    rect: [1.5056, 9.71598, 12.98879, 3.75]
  }, {
    type: "shape",
    borderWidth: 1,
    borderColor: "rgb(255,255,255)",
    borderCap: "round",
    opacity: .2,
    points: [14.49439, 9.71598, 14.49439, 1.61266, 4.70858, 1.61266, 4.70858, 9.71598]
  }]
}), ht.Default.setImage("editor.wall", {
  background: "rgb(0,0,0)",
  width: 16,
  height: 16,
  comps: [{
    type: "shape",
    borderWidth: 1,
    borderColor: "rgb(255,255,255)",
    opacity: .2,
    points: [2, 15, 10, 15, 14, 11]
  }, {
    type: "shape",
    borderWidth: 1,
    borderColor: "rgb(255,255,255)",
    points: [6, 2, 14, 2, 14, 11, 6, 11, 2, 15, 2, 6, 6, 2, 6, 11]
  }]
});
ht.Default.setImage("editor.cancel", {
  background: "red",
  width: 16,
  height: 16,
  comps: [{
    type: "circle",
    borderWidth: 1,
    borderColor: "rgb(255,255,255)",
    shadowColor: "#1ABC9C",
    rect: [1, 1, 14, 14]
  }, {
    type: "shape",
    borderWidth: 1,
    borderColor: "rgb(255,255,255)",
    borderCap: "round",
    points: [10.94702, 4.96729, 4.99893, 11.04194]
  }, {
    type: "shape",
    borderWidth: 1,
    borderColor: "rgb(255,255,255)",
    borderCap: "round",
    points: [5, 4.96729, 11.29505, 11.29505]
  }]
});
ht.Default.setImage("editor.pipeline", {
  background: "rgb(82,82,82)",
  width: 16,
  height: 16,
  blendMode: "override",
  comps: [{
    type: "shape",
    borderWidth: 1,
    borderColor: "rgb(255,255,255)",
    points: [14.11524, 6.61831, 14.11524, 6.61831, 9.30492, 12.81031, 8.07676, 10.14929, 6.8486, 7.48826,
      9.56079, 4.00846, 6.33686, 4.00846, 3.11293, 4.00846, .86129, 8.92112, .86129, 8.92112],
    segments: [1, 4, 4, 4]
  }, {
    type: "shape",
    borderWidth: 1,
    borderColor: "rgb(255,255,255)",
    opacity: .4,
    points: [15.28357, 7.93382, 15.28357, 7.93382, 10.47326, 14.12582, 9.24509, 11.46479, 8.01693,
      8.80377, 10.72913, 5.32397, 7.50519, 5.32397, 4.28126, 5.32397, 2.02963, 10.23663, 2.02963, 10.23663],
    segments: [1, 4, 4, 4]
  }]
});
ht.Default.setImage("editor.doorWindow", {
  width: 16,
  height: 16,
  comps: [{ type: "rect", borderWidth: 1, borderColor: "#979797", rect: [4.5, .5, 7, 15] }, {
    type: "shape",
    borderWidth: 1,
    borderColor: "#979797",
    points: [8.5469, 8, 10.42756, 8]
  }]
});
ht.Default.setImage("editor.cube", {
  background: "rgb(82,82,82)",
  width: 16,
  height: 16,
  blendMode: "override",
  comps: [{
    type: "rect",
    borderWidth: 1,
    borderColor: "rgb(255,255,255)",
    shadowColor: "#1ABC9C",
    rect: [2.48996, 3.51341, 9.97783, 10.97318]
  }, {
    type: "shape",
    borderWidth: 1,
    borderColor: "rgb(255,255,255)",
    opacity: .4,
    points: [15, 1, 12.39369, 3.59417, 12.39369, 14.44, 15, 11.41017, 15, 1, 5.46231, 1, 2.50972, 3.59417]
  }]
});
ht.Default.setImage("editor.sphere", {
  background: "rgb(179,179,179)",
  width: 16,
  height: 16,
  comps: [{
    type: "oval",
    borderWidth: 1,
    borderColor: "rgb(255,255,255)",
    rect: [1.49999, 1.5, 13, 13]
  }, {
    type: "arc",
    borderWidth: 1,
    borderColor: "rgb(255,255,255)",
    borderCap: "round",
    arcFrom: 3.22886,
    arcTo: 5.96903,
    arcClose: false,
    arcOval: true,
    opacity: .4,
    rotation: 2.4578,
    rect: [.10993, 1.43114, 12.94079, 10.68594]
  }]
});
ht.Default.setImage("editor.cylinder", {
  background: "rgb(179,179,179)",
  width: 16,
  height: 16,
  comps: [{
    type: "oval",
    borderWidth: 1,
    borderColor: "rgb(255,255,255)",
    rect: [1.5, 1.5, 13, 9.5]
  }, {
    type: "arc",
    borderWidth: 1,
    borderColor: "rgb(255,255,255)",
    arcClose: false,
    arcOval: true,
    opacity: .4,
    rotation: 3.14159,
    rect: [1.49362, 6, 13, 9.5]
  }, {
    type: "shape",
    borderWidth: 1,
    borderColor: "rgb(255,255,255)",
    opacity: .4,
    points: [1.49362, 10.75, 1.48724, 6.35177]
  }, {
    type: "shape",
    borderWidth: 1,
    borderColor: "rgb(255,255,255)",
    opacity: .4,
    points: [14.5, 10.75, 14.5, 6.10177]
  }]
});
ht.Default.setImage("editor.scene.cone", {
  background: "rgb(82,82,82)",
  width: 16,
  height: 16,
  comps: [{
    type: "oval",
    borderWidth: 1,
    borderColor: "rgb(255,255,255)",
    opacity: .4,
    rect: [3, 10, 10, 3.48659]
  }, {
    type: "shape",
    borderWidth: 1,
    borderColor: "rgb(255,255,255)",
    borderCap: "round",
    points: [3, 12, 8, 2, 13, 12]
  }]
});
ht.Default.setImage("editor.scene.torus", {
  background: "rgb(82,82,82)",
  width: 16,
  height: 16,
  comps: [{
    type: "oval",
    borderWidth: 1,
    borderColor: "rgb(255,255,255)",
    opacity: .4,
    rect: [1, 4, 14, 10]
  }, {
    type: "oval",
    borderWidth: 1,
    borderColor: "rgb(255,255,255)",
    rect: [2, 2, 12, 10]
  }]
});
ht.Default.setImage("editor.scene.triangle", {
  background: "rgb(82,82,82)",
  width: 16,
  height: 16,
  comps: [{
    type: "triangle",
    borderWidth: 1,
    borderColor: "rgb(255,255,255)",
    opacity: .4,
    rect: [1.53493, 5, 13.1269, 9.05393]
  }, {
    type: "triangle",
    borderWidth: 1,
    borderColor: "rgb(255,255,255)",
    rect: [2.09838, 2, 12, 10]
  }]
});
ht.Default.setImage("editor.scene.rightTriangle", {
  background: "rgb(82,82,82)",
  width: 16,
  height: 16,
  comps: [{
    type: "rightTriangle",
    borderWidth: 1,
    borderColor: "rgb(255,255,255)",
    opacity: .4,
    rect: [1.53493, 5, 13.1269, 9.05393]
  }, {
    type: "rightTriangle",
    borderWidth: 1,
    borderColor: "rgb(255,255,255)",
    rect: [3.09838, 2, 10.90162, 10]
  }]
});
ht.Default.setImage("editor.scene.parallelogram", {
  background: "rgb(82,82,82)",
  width: 16,
  height: 16,
  comps: [{
    type: "parallelogram",
    borderWidth: 1,
    borderColor: "rgb(255,255,255)",
    opacity: .4,
    rect: [1, 5, 14, 8]
  }, {
    type: "parallelogram",
    borderWidth: 1,
    borderColor: "rgb(255,255,255)",
    rect: [1, 2, 13, 8]
  }]
});
ht.Default.setImage("editor.scene.trapezoid", {
  background: "rgb(82,82,82)",
  width: 16,
  height: 16,
  comps: [{
    type: "trapezoid",
    borderWidth: 1,
    borderColor: "rgb(255,255,255)",
    opacity: .4,
    rect: [.90479, 6, 14, 8]
  }, {
    type: "trapezoid",
    borderWidth: 1,
    borderColor: "rgb(255,255,255)",
    rect: [1.40479, 2.5, 13, 9]
  }]
});
ht.Default.setImage("editor.scene.rect", {
  background: "rgb(82,82,82)",
  width: 16,
  height: 16,
  comps: [{
    type: "rect",
    borderWidth: 1,
    borderColor: "rgb(255,255,255)",
    opacity: .4,
    rect: [1.53493, 5, 13.1269, 9.05393]
  }, {
    type: "rect",
    borderWidth: 1,
    borderColor: "rgb(255,255,255)",
    rect: [3.2894, 2.39375, 9.61796, 9.2125]
  }]
});
ht.Default.setImage("editor.scene.roundRect", {
  background: "rgb(82,82,82)",
  width: 16,
  height: 16,
  comps: [{
    type: "roundRect",
    borderWidth: 1,
    borderColor: "rgb(255,255,255)",
    opacity: .4,
    rect: [1.53493, 5, 13.1269, 9.05393]
  }, {
    type: "roundRect",
    borderWidth: 1,
    borderColor: "rgb(255,255,255)",
    rect: [3.2894, 2.39375, 9.61796, 9.2125]
  }]
});
ht.Default.setImage("editor.scene.star", {
  background: "rgb(82,82,82)",
  width: 16,
  height: 16,
  comps: [{
    type: "star",
    borderWidth: 1,
    borderColor: "rgb(255,255,255)",
    opacity: .4,
    rect: [1.59838, 2, 13, 13]
  }, {
    type: "star",
    borderWidth: 1,
    borderColor: "rgb(255,255,255)",
    rect: [2, 1, 12, 12]
  }]
});
ht.Default.setImage("editor.scene.box", {
  background: "rgb(82,82,82)",
  width: 16,
  height: 16,
  comps: [{
    type: "rect",
    borderWidth: 1,
    borderColor: "rgb(255,255,255)",
    shadowColor: "#1ABC9C",
    opacity: .4,
    rect: [2.48996, 3.51341, 9.97783, 10.97318]
  }, {
    type: "shape",
    borderWidth: 1,
    borderColor: "rgb(255,255,255)",
    opacity: .4,
    points: [15, 1, 12.39369, 3.59417, 12.39369, 14.44, 15, 11.41017, 15, 1, 5.46231, 1, 2.50972, 3.59417]
  }]
});
ht.Default.setImage("editor.scene.billboard", {
  background: "rgb(82,82,82)",
  width: 16,
  height: 16,
  comps: [{
    type: "shape",
    borderWidth: 1,
    borderColor: "rgb(255,255,255)",
    borderCap: "round",
    points: [8, 13, 6, 10, 3, 10, 3, 3, 13, 3, 13, 10, 10, 10, 8, 13]
  }]
});
ht.Default.setImage("editor.scene.plane", {
  background: "rgb(82,82,82)",
  width: 16,
  height: 16,
  comps: [{
    type: "shape",
    borderWidth: 1,
    borderColor: "rgb(255,255,255)",
    borderCap: "round",
    points: [1.5, 12.5, 5.5, 7.5, 14.5, 7.5, 10.5, 12.5, 1.5, 12.5]
  }]
});
export default config3d;
