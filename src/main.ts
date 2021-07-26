import * as blessed from 'blessed'
import * as contrib from 'blessed-contrib'
import { screenOption, scrollOption, navigateOption, listStyle } from './options'

const screen = blessed.screen(screenOption)
screen.title = 'wechaty-cli'

const prompt = blessed.prompt({
  parent: screen,
  tags: true,
  border: 'line',
  hidden: true,
  ...navigateOption
});

const grid = new contrib.grid({rows: 12, cols: 12, screen: screen})

const leftPanel = grid.set(0, 0, 12, 3, blessed.list, {
  label: 'Contact List',
  ...scrollOption,
  style: listStyle,
  // TO DO: search does not work
  search: (callback: (arg0: any, arg1: string) => void) => {
    prompt.input('Search:', '', function(err, value) {
      if (err) return;
      return callback(null, value);
    });
  }
})

const msgConsole = grid.set(0, 3, 12, 6, contrib.log, {
  fg: 'green',
  selectedFg: 'green',
  label: 'Messages',
  ...scrollOption
})
const rightPanel = grid.set(0, 9, 12, 3, blessed.list, {label: 'Options'})

screen.key(['escape', 'C-c', 'C-d'], function(ch, key) {
  return process.exit(0);
});

export { screen, grid, msgConsole, leftPanel }