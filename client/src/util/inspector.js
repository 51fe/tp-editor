export function nullToZero(arr) {
  if (Array.isArray(arr)) {
    for (let i = 0; i < arr.length; i++) {
      let item = arr[i];
      if (item == null) {
        item = 0;
      }
    }
  }
}

export function raceColor(colors) {
  if (Array.isArray(colors)) {
    const _colors = ht.Color.chart;
    for (let i = 0; i < colors.length; i++) {
      if (colors[i] == undefined) {
        colors[i] = _colors[i % _colors.length];
      }
    }
  }
}

export function normalizeArray(list, len) {
  if (len === undefined) {
    if (Array.isArray(list)) {
      len = list.length;
    } else {
      len = 0;
    }
  }
  const arr = new Array(len);
  for (let i = 0; i < len; i++) {
    if (Array.isArray(list)) {
      arr[i] = list[i];
    } else {
      arr[i] = undefined;
    }
  }
  return arr;
}
