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
