(function () {
  var createColorIcon = function (color) {
    return {
      width: 20,
      height: 14,
      comps: [
        {
          type: 'rect',
          rect: [1, 1, 18, 12],
          background: color
        }
      ]
    };
  };
  window.tpeditor_config.valueTypes = {
    AlarmSeverity: {
      type: 'enum',
      values: [500, 400, 300, 200, 100, 0],
      i18nLabels: [
        'AlarmSeverityCritical',
        'AlarmSeverityMajor',
        'AlarmSeverityMinor',
        'AlarmSeverityWarning',
        'AlarmSeverityIndeterminate',
        'AlarmSeverityCleared'
      ],
      icons: [
        createColorIcon('#FF0000'),
        createColorIcon('#FFA000'),
        createColorIcon('#FFFF00'),
        createColorIcon('#00FFFF'),
        createColorIcon('#C800FF'),
        createColorIcon('#00FF00')
      ]
    },
    PVState: {
      type: 'enum',
      values: ['#323450', '#454668', '#FF6A01', '#FF2D0D'],
      i18nLabels: ['PV_state_0', 'PV_state_1', 'PV_state_2', 'PV_state_3'],
      icons: [
        createColorIcon('#323450'),
        createColorIcon('#454668'),
        createColorIcon('#FF6A01'),
        createColorIcon('#FF2D0D')
      ]
    },
    PVHLXState: {
      type: 'enum',
      values: ['#6F7082', '#76E33E', '#FF6A01', '#FF2D0D'],
      i18nLabels: ['PV_hlx_state_0', 'PV_hlx_state_1', 'PV_hlx_state_2', 'PV_hlx_state_3'],
      icons: [
        createColorIcon('#6F7082'),
        createColorIcon('#76E33E'),
        createColorIcon('#FF6A01'),
        createColorIcon('#FF2D0D')
      ]
    }
  };
})();
