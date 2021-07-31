import { join } from 'path'
import { mkdirSync } from 'fs'
import { Contact, Message, Room, ScanStatus, Wechaty } from 'wechaty'
import { generate } from 'qrcode-terminal'
import { screen, msgConsole, leftPanel, rightPanel } from './src/main'
import { TreeNode, TreeChildren } from './src/interfaces'
import * as blessed from 'blessed'
import * as contrib from 'blessed-contrib'

const bot = new Wechaty({name: 'test'})
const filePath = join('data', 'files')


let contacts: Array<Contact>
let friends: Array<Contact>
let rooms: Array<Room>
let nameOf: Map<Contact | Room, string> = new Map()
let messagesOf: Map<Contact | Room, Message[]> = new Map()
let membersByRoom: Map<Room, Contact[]> = new Map()
let friendRecord: TreeChildren = {}
let roomRecord: TreeChildren = {}
let friendRoot: TreeNode
let roomRoot: TreeNode
let panelRoot: TreeNode

async function displayed(s: Contact | Room) {
  if (s instanceof Contact) {
    return await s.alias() || s.name() || s.id
  } else {
    return await s.topic() || s.id
  }
}

function onLogout (user: Contact, logElement: any) {
  logElement.log('StarterBot', '%s logout', user)
}

function onScan (qrcode: string, status: ScanStatus, logElement: contrib.Widgets.LogElement) {
  if (status === ScanStatus.Waiting || status === ScanStatus.Timeout) {
    generate(qrcode, { small: true }, (asciiart: string) => logElement.add(asciiart))
    logElement.log('Scan QR Code to login, status:' + ScanStatus[status])
    const qrcodeImageUrl = [
      'https://wechaty.js.org/qrcode/',
      encodeURIComponent(qrcode),
    ].join('')
    // logElement.log('StarterBot', 'onScan: %s(%s) - %s', ScanStatus[status], status, qrcodeImageUrl)
  } else {
    // logElement.log('StarterBot', 'onScan: %s(%s)', ScanStatus[status], status)
  }
}

function onLogin(user: Contact, logElement: any) {
    logElement.setContent('')
    logElement.log(`${user.name()} login`)
    bot.say('Wechaty login!').catch(console.error)
    // logElement.setLabel(logElement._label.content + ' - ' + user.name())
}

// when login complete, get all friend/room then display on the leftPanel
async function onReady(logElement: contrib.Widgets.LogElement) {
    bot.say('Wechaty ready!').catch(console.error)

    contacts = await bot.Contact.findAll()
    friends = contacts.filter(x => x.type() !== Contact.Type.Official)
    for (const f of friends) {
      const name = await displayed(f)
      nameOf.set(f, name)
      friendRecord[name!] = {
        name: name,
        extended: false,
        real: f 
      }
    }
    friendRoot = {
      name: "Friends",
      extended: true,
      real: bot.userSelf(),
      children: friendRecord
    }
    leftPanel.setData(friendRoot)
    msgConsole.log(`Totally ${friends.length} friends`)

    rooms = await bot.Room.findAll();
    for (const r of rooms) {
      const name = await displayed(r)
      nameOf.set(r, name)
      roomRecord[name] = {
        name: name,
        extended: false,
        real: r 
      }
    }
    roomRoot = {
      name: "Rooms",
      extended: true,
      real: bot.userSelf(),
      children: roomRecord
    }
    panelRoot = {
      name: bot.userSelf().name(),
      extended: true,
      children: {"Friends": friendRoot, "Rooms": roomRoot}
    }
    leftPanel.setData(panelRoot)
    msgConsole.log(`Totally ${rooms.length} rooms`);
  
    // TO DO: Fix crash
    // leftPanel.focus()
    screen.render()
}

async function onMessage(message: Message, logElement: contrib.Widgets.LogElement) {
  const type = message.type()
  logElement.log(message.toString())
  const k = message.room() || message.talker()
  if (!messagesOf.has(k)) messagesOf.set(k,[])
  messagesOf.get(k)!.push(message)
  if (type != Message.Type.Text) {
      const file = await message.toFileBox()
      const folder = join(filePath, bot.userSelf().name())
      mkdirSync(folder, {recursive: true})
      const name = join(folder, file.name)
      await file.toFile(name)
      logElement.log('Save file to: ' + name)
  }
  screen.render()
}


function startBot(bot: Wechaty, logElement: any) {
  logElement.log('Initing...')
  bot
  .on('logout', (user) => onLogout(user, logElement))
  .on('scan', (qrcode, status) => onScan(qrcode, status, logElement))
  .on('login', (user) => onLogin(user, logElement))
  .on('ready', () => onReady(logElement))
  .on('message', (m) => onMessage(m, logElement))
  .on('error', async e => {
    logElement.log(`error: ${e}`)
    if (bot.logonoff()) {
      bot.say('Wechaty error: ' + e.message).catch(console.error)
    }
    bot.stop()
  })

  bot.start()
  .catch(async e => {
    logElement.log(`start() fail: ${e}`)
    bot.stop()
    process.exit(-1)
  })
}

leftPanel.on('select', (node: contrib.Widgets.TreeNode, index) => {
  const name = node.name
  msgConsole.setContent('')
  rightPanel.setContent('')
  msgConsole.log(name || 'not found')
})

async function main() {
  startBot(bot, msgConsole)
  screen.render()
}

main()
