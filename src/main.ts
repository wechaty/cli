import * as blessed from 'blessed'
import * as contrib from 'blessed-contrib'

const screen = blessed.screen({
    smartCSR:       true,
    fullUnicode:    true,
})
screen.title = 'wechaty-cli'


const grid = new contrib.grid({rows: 12, cols: 12, screen: screen})
const leftPanel = grid.set(0, 0, 12, 3, blessed.list, {label: 'Contact List'})
const msgConsole = grid.set(0, 3, 12, 6, contrib.log, {
  fg: 'green',
  selectedFg: 'green',
  label: 'Messages',
})
const rightPanel = grid.set(0, 9, 12, 3, contrib.tree, {label: 'Options'})

screen.key(['escape', 'C-c'], function(ch, key) {
  return process.exit(0);
});

export { screen, grid, msgConsole, leftPanel }
