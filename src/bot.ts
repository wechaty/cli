import { join }       from 'path'
import { mkdirSync }  from 'fs'

import {
  Contact,
  Message,
  PuppetModuleName,
  Room,
  ScanStatus,
  Wechaty,
}                   from 'wechaty'
import qrTerminal   from 'qrcode-terminal'

import {
  screen,
  msgConsole,
  leftPanel,
  rightPanel,
  textArea,
  menuBar,
  memberTree,
}                     from './ui.js'
import type {
  TreeNode,
  TreeChildren,
}                     from './config.js'
import { reverseObject } from './utils.js'

let bot: Wechaty
const filePath = join('data', 'files')

let contacts: Contact[]
let friends: Contact[]
let rooms: Room[]
let curChat: Wechaty | Contact | Room
const messages: Message[] = []
const nameOf: Map<Contact | Room, string> = new Map()
const membersByRoom: Map<Room, Contact[]> = new Map()
let friendRecord: TreeChildren
let roomRecord: TreeChildren
let activeRecord: TreeChildren = {}
let friendRoot: TreeNode
let roomRoot: TreeNode
let panelRoot: TreeNode
let activeRoot: TreeNode
let memberRoot: TreeNode = {}

async function displayed (s: Contact | Room) {
  if (s instanceof Contact) {
    return await s.alias() || s.name() || s.id
  } else {
    return await s.topic() || s.id
  }
}

async function recordify (a: (Contact | Room)[]) {
  const record: TreeChildren = {}
  for (const x of a) {
    if (!nameOf.has(x)) nameOf.set(x, await displayed(x))
    const name = nameOf.get(x)
    record[name!] = {
      extended: false,
      name: name,
      real: x,
    }
  }
  return record
}

export async function refresh () {
  contacts = await bot.Contact.findAll()
  friends = contacts.filter(x => x.type() !== Contact.Type.Official)
  friendRecord = await recordify(friends)
  friendRoot = {
    children: friendRecord,
    extended: true,
    name: 'Friends',
    real: bot.userSelf(),
  }
  leftPanel.setData(friendRoot)
  msgConsole.log(`Totally ${friends.length} friends`)

  rooms = await bot.Room.findAll()
  roomRecord = await recordify(rooms)
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
    real: bot.userSelf(),
  }
  leftPanel.setData(panelRoot)
  msgConsole.log(`Totally ${rooms.length} rooms`)
}

export async function activy (activer: Contact | Room) {
  const newcord = await recordify([activer])
  // Later properties should overwrite earlier properties with the same name
  activeRecord = { ...activeRecord, ...newcord }
  activeRoot = {
    children: reverseObject(activeRecord),
    extended: true,
    name: 'Active Chats',
    real: bot.userSelf(),
  }
  rightPanel.setData(activeRoot)
}

export async function showMember () {
  if (curChat !== memberRoot['real'] && curChat instanceof Room) {
    if (!membersByRoom.has(curChat)) membersByRoom.set(curChat, await curChat.memberAll())
    const members = membersByRoom.get(curChat)!
    const memberRecord = await recordify(members)
    memberRoot = {
      children: memberRecord,
      extended: true,
      name: nameOf.get(curChat) + ' 的成员',
      real: curChat,
    }
    memberTree.setData(memberRoot)
  }
  memberTree.toggle()
  if (!memberTree.hidden) memberTree.focus()
  screen.render()
}

function onLogout (user: Contact) {
  msgConsole.log(`${user} logout`)
}

function onScan (qrcode: string, status: ScanStatus) {
  if (status === ScanStatus.Waiting || status === ScanStatus.Timeout) {
    qrTerminal.generate(qrcode, { small: true }, (asciiart: string) => msgConsole.add(asciiart))
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
  curChat = bot
}

// when login complete, get all friend/room then display on the leftPanel
async function onReady () {
  bot.say('Wechaty ready!').catch(console.error)
  await refresh()
  screen.render()
}

async function onMessage (message: Message) {
  const type = message.type()
  const actor = message.room() || [message.talker(), message.listener()].filter(x => x !== bot.userSelf())[0]
  activy(actor!).catch(console.error)
  msgConsole.log(message.toString())
  messages.push(message)
  if (type !== Message.Type.Text) {
    const file = await message.toFileBox()
    const folder = join(filePath, bot.userSelf().name())
    mkdirSync(folder, { recursive: true })
    const name = join(folder, file.name)
    await file.toFile(name, true)
    msgConsole.log('Save file to: ' + name)
  }
  screen.render()
}

export function startBot (args: any) {
  msgConsole.log('Initing...')

  const puppet = process.env['WECHATY_PUPPET'] || 'wechaty-puppet-wechat'

  bot = new Wechaty({
    name: args.name,
    puppet: puppet as PuppetModuleName,
  })
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
  menuBar.focus()
}

async function onSelectChat (node: TreeNode) {
  const real = node['real']
  curChat = real
  msgConsole.setLabel(`与 ${node.name} 的对话`)
  msgConsole.setContent('')
  rightPanel.setContent('')
  const msgs = messages.filter(m =>
    (m.room() || m.talker()) === real || (m.room() || m.listener()) === real
  )
  msgs.forEach(m => msgConsole.log(m.toString()))
}

leftPanel.on('select', onSelectChat)
rightPanel.on('select', onSelectChat)

textArea.key('enter', () => {
  curChat.say(textArea.value).catch(console.error)
  textArea.clearValue()
})
