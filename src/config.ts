import { log } from 'brolog'

import { packageJson } from './package-json.js'

const VERSION = packageJson.version || '0.0.0'

/* eslint-disable no-use-before-define */
type TreeChildren = Record<string, TreeNode>

interface TreeNode {
  name?: string,
  children?: TreeChildren | ((node: TreeNode) => TreeChildren | Promise<TreeChildren>),
  childrenContent?: TreeChildren,
  extended?: boolean,
  parent?: TreeNode,
  [custom: string]: any
}

export type {
  TreeNode,
  TreeChildren,
}
export {
  log,
  VERSION,
}

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
