#!/usr/bin/env ts-node
import { join } from 'path'
import { mkdirSync } from 'fs'
import { Contact, Message, Room, ScanStatus, Wechaty } from 'wechaty'
import { generate } from 'qrcode-terminal'
import { screen, msgConsole, leftPanel } from './main'
import { TreeNode, TreeChildren } from './config'

let bot: Wechaty
const filePath = join('data', 'files')

let contacts: Array<Contact>
let friends: Array<Contact>
let rooms: Array<Room>
const nameOf: Map<Contact | Room, string> = new Map()
const messagesOf: Map<Contact | Room, Message[]> = new Map()
// let membersByRoom: Map<Room, Contact[]> = new Map()
const friendRecord: TreeChildren = {}
const roomRecord: TreeChildren = {}
let friendRoot: TreeNode
let roomRoot: TreeNode
let panelRoot: TreeNode

async function displayed (s: Contact | Room) {
  if (s instanceof Contact) {
    return await s.alias() || s.name() || s.id
  } else {
    return await s.topic() || s.id
  }
}

function onLogout (user: Contact) {
  msgConsole.log(`${user} logout`)
}

function onScan (qrcode: string, status: ScanStatus) {
  if (status === ScanStatus.Waiting || status === ScanStatus.Timeout) {
    generate(qrcode, { small: true }, (asciiart: string) => msgConsole.add(asciiart))
    msgConsole.log('Scan QR Code to login, status:' + ScanStatus[status])
    const qrcodeImageUrl = [
      'https://wechaty.js.org/qrcode/',
      encodeURIComponent(qrcode),
    ].join('')
    void qrcodeImageUrl
    // logElement.log('StarterBot', 'onScan: %s(%s) - %s', ScanStatus[status], status, qrcodeImageUrl)
  } else {
    // logElement.log('StarterBot', 'onScan: %s(%s)', ScanStatus[status], status)
  }
}

function onLogin (user: Contact) {
  msgConsole.setContent('')
  msgConsole.log(`${user.name()} login`)
  bot.say('Wechaty login!').catch(console.error)
}

// when login complete, get all friend/room then display on the leftPanel
async function onReady () {
  bot.say('Wechaty ready!').catch(console.error)

  contacts = await bot.Contact.findAll()
  friends = contacts.filter(x => x.type() !== Contact.Type.Official)
  for (const f of friends) {
    const name = await displayed(f)
    nameOf.set(f, name)
    friendRecord[name!] = {
      extended: false,
      name: name,
      real: f,
    }
  }
  friendRoot = {
    children: friendRecord,
    extended: true,
    name: 'Friends',
    real: bot.userSelf(),
  }
  leftPanel.setData(friendRoot)
  msgConsole.log(`Totally ${friends.length} friends`)

  rooms = await bot.Room.findAll()
  for (const r of rooms) {
    const name = await displayed(r)
    nameOf.set(r, name)
    roomRecord[name] = {
      extended: false,
      name: name,
      real: r,
    }
  }
  roomRoot = {
    children: roomRecord,
    extended: true,
    name: 'Rooms',
    real: bot.userSelf(),
  }
  panelRoot = {
    children: { Friends: friendRoot, Rooms: roomRoot },
    extended: true,
    name: bot.userSelf().name(),
  }
  leftPanel.setData(panelRoot)
  msgConsole.log(`Totally ${rooms.length} rooms`)

  leftPanel.focus()
  screen.render()
}

async function onMessage (message: Message) {
  const type = message.type()
  msgConsole.log(message.toString())
  const k = message.room() || message.talker()
  if (!messagesOf.has(k)) messagesOf.set(k, [])
  messagesOf.get(k)!.push(message)
  if (type !== Message.Type.Text) {
    const file = await message.toFileBox()
    const folder = join(filePath, bot.userSelf().name())
    mkdirSync(folder, { recursive: true })
    const name = join(folder, file.name)
    await file.toFile(name)
    msgConsole.log('Save file to: ' + name)
  }
  screen.render()
}

export function startBot (args: any) {
  msgConsole.log('Initing...')
  bot = new Wechaty({ name: args.name })
    .on('logout', user => onLogout(user))
    .on('scan', (qrcode, status) => onScan(qrcode, status))
    .on('login', user => onLogin(user))
    .on('ready', () => onReady())
    .on('message', (m) => onMessage(m))
    .on('error', async e => {
      msgConsole.log(`error: ${e}`)
      if (bot.logonoff()) {
        bot.say('Wechaty error: ' + e.message).catch(console.error)
      }
      bot.stop()
        .catch(console.error)
    })

  bot.start()
    .catch(async e => {
      msgConsole.log(`start() fail: ${e}`)
      // bot.stop()
      //   .catch(console.error)
      process.exit(-1)
    })

  screen.render()
}
