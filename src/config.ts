import path from 'path'

export { log } from 'brolog'

export function parentDirectory (): string {     // export for test
  const parentDir = __dirname.split(path.sep)   // [... 'node_modules', 'facenet', 'dist', 'src']
    .slice(-2, -1)[0] // 'dist'
  return parentDir
}

export const MODULE_ROOT = parentDirectory() === 'dist'
  ? path.join(__dirname, '/../..')
  : path.join(__dirname, '/..')

const packageFile = path.join(MODULE_ROOT, 'package.json')
export const VERSION = require(packageFile).version

export interface TreeNode {
  name?: string,
  children?: TreeChildren | ((node: TreeNode) => TreeChildren | Promise<TreeChildren>),
  childrenContent?: TreeChildren,
  extended?: boolean,
  parent?: TreeNode,
  [custom: string]: any
}

export type TreeChildren = Record<string, TreeNode>
