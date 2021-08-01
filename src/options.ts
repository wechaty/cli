export const screenOption = {
  smartCSR: true,
  useBCE: true,
  autoPadding: true,
  dockBorders: true,
  forceUnicode: true,
  fullUnicode: true,
  sendFocus: true,
  warnings: true
}

export const listStyle = {
  item: {
    hover: {
      bg: 'blue'
    }
  },
  selected: {
    bg: 'blue',
    bold: true
  }
}

export const navigateOption = {
  mouse: true,
  keys: true,  // conflict with TreeElement keys: string[]
  vi: true
}

export const scrollOption = {
  clickable: true,
  scrollable: true,  // If scrollable option is enabled, Element inherits all methods from ScrollableBox
  // alwaysScroll: true,
  scrollbar: {
    track: {
      bg: 'cyan'
    },
    style: {
      inverse: true
    }
  },
}