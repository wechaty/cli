export const screenOption = {
  autoPadding: true,
  dockBorders: true,
  forceUnicode: true,
  fullUnicode: true,
  ignoreLocked: ['C-c', 'escape'],
  sendFocus: true,
  smartCSR: true,
  useBCE: true,
  warnings: true,
}

export const listStyle = {
  // focus: {
  //   bg: 'red',
  // },
  item: {
    hover: {
      bg: 'blue',
    },
  },
  selected: {
    bg: 'blue',
    bold: true,
  },
}

export const navigateOption = {
  keys: true,  // conflict with TreeElement keys: string[]
  mouse: true,
  vi: true,
}

export const scrollOption = {
  clickable: true,
  scrollable: true,  // If scrollable option is enabled, Element inherits all methods from ScrollableBox
  // alwaysScroll: true,
  scrollbar: {
    style: {
      inverse: true,
    },
    track: {
      bg: 'cyan',
    },
  },
}
