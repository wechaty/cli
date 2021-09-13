import blessed from 'blessed'
import contrib from 'blessed-contrib'

import {
  screenOption,
  scrollOption,
  navigateOption,
  listStyle,
}                   from './config.js'

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

const msgConsole: contrib.Widgets.LogElement = grid.set(0, 3, 10, 7, blessed.log, {
  fg: 'green',
  label: 'Messages',
  selectedFg: 'green',
  ...navigateOption,
  ...scrollOption,
})

const textArea: blessed.Widgets.TextareaElement = grid.set(10, 3, 2, 7, blessed.textarea, {
  fg: 'blue',
  inputOnFocus: true,
  mouse: true,
})

const rightPanel: contrib.Widgets.TreeElement = grid.set(0, 10, 12, 2, contrib.tree, { 
  label: 'Profile',
  mouse: true,
  style: listStyle,
  vi: true,
 })

screen.key(['C-c', 'C-d'], () => {
  return process.exit(0)
})

screen.key('tab', () => screen.focusNext())
screen.key('S-tab', () => screen.focusPrevious())

leftPanel.rows.on('click', () => leftPanel.focus())
textArea.on('click', () => textArea.focus())

export {
  screen,
  grid,
  msgConsole,
  leftPanel,
  rightPanel,
  textArea,
}
