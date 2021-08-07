import * as blessed from 'blessed'
import * as contrib from 'blessed-contrib'
import {
  screenOption,
  scrollOption,
  navigateOption,
  listStyle,
}                   from './options'

const screen = blessed.screen(screenOption)
screen.title = 'wechaty-cli'

// eslint-disable-next-line new-cap
const grid = new contrib.grid({
  cols: 12,
  rows: 12,
  screen,
})

const leftPanel: contrib.Widgets.TreeElement = grid.set(0, 0, 12, 3, contrib.tree, {
  label: 'Contact List',
  // ...scrollOption,
  mouse: true,
  style: listStyle,
  vi: true,
})

const msgConsole: contrib.Widgets.LogElement = grid.set(0, 3, 12, 7, blessed.log, {
  fg: 'green',
  label: 'Messages',
  selectedFg: 'green',
  ...navigateOption,
  ...scrollOption,
})

const rightPanel = grid.set(0, 10, 12, 2, contrib.tree, { label: 'Options' })

screen.key(['escape', 'C-c', 'C-d'], () => {
  return process.exit(0)
})

export {
  screen,
  grid,
  msgConsole,
  leftPanel,
  rightPanel,
}
