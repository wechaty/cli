import blessed from 'blessed'
import contrib from 'blessed-contrib'
import { refresh, showMember, showProfile } from './bot.js'

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

const msgConsole: contrib.Widgets.LogElement = grid.set(0, 3, 9, 7, blessed.log, {
  fg: 'green',
  label: 'Messages',
  selectedFg: 'green',
  ...navigateOption,
  ...scrollOption,
})

const textArea: blessed.Widgets.TextareaElement = grid.set(9, 3, 2, 7, blessed.textarea, {
  fg: 'blue',
  inputOnFocus: true,
  mouse: true,
})

const rightPanel: contrib.Widgets.TreeElement = grid.set(0, 10, 12, 2, contrib.tree, {
  label: 'Active Chats',
  mouse: true,
  style: listStyle,
  vi: true,
})

const menuBar: blessed.Widgets.ListbarElement = grid.set(11, 3, 1, 7, blessed.listbar, {
  commands: {
    active: {
      callback: () => rightPanel.focus(),
      keys: ['a'],
    },
    contact: {
      callback: () => leftPanel.focus(),
      keys: ['c'],
    },
    input: {
      callback: () => textArea.focus(),
      keys: ['i'],
    },
    member: {
      callback: showMember,
      keys: ['m'],
    },
    profile: {
      callback: showProfile,
      keys: ['p'],
    },
    refresh: {
      callback: refresh,
      keys: ['r'],
    },
  },
  mouse: true,
  style: listStyle,
})

const memberTree: contrib.Widgets.TreeElement = grid.set(1, 3, 9, 6, contrib.tree, {
  hidden: true,
  label: 'members',
  mouse: true,
  style: listStyle,
  vi: true,
})

const profileBox: blessed.Widgets.TextElement = grid.set(1, 3, 9, 6, blessed.text, {
  hidden: true,
  label: 'profile',
  style: listStyle,
})

const prompty: blessed.Widgets.PromptElement = grid.set(4, 4, 4, 4, blessed.prompt, {
  hidden: true,
  ...navigateOption,
})

screen.key(['C-c'], () => {
  return process.exit(0)
})

leftPanel.rows.key('/', () => {
  const inner = leftPanel.rows
  prompty.input('Search:', '', (err, value) => {
    if (err) return
    const index = inner.fuzzyFind(value) as any as number
    inner.select(index)
  })
})

screen.key('tab', () => screen.focusNext())
screen.key('S-tab', () => screen.focusPrevious())

export {
  screen,
  grid,
  msgConsole,
  leftPanel,
  rightPanel,
  textArea,
  menuBar,
  memberTree,
  profileBox,
}
