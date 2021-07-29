import { join } from 'path'
import { mkdirSync } from 'fs'
import { Contact, Message, Room, ScanStatus, Wechaty } from 'wechaty'
import { generate } from 'qrcode-terminal'
import { screen, msgConsole, leftPanel, rightPanel } from './src/main'
import * as blessed from 'blessed'
import * as contrib from 'blessed-contrib'

const bot = new Wechaty({name: 'test'})
const filePath = join('data', 'files')

// name must be unique
let contactList: Array<Contact>
let friendList: Array<Contact>
let roomList: Array<Room>
let friendByName: Map<string, Contact> = new Map()
let roomByName: Map<string, Room> = new Map()
let msgByName: Map<string, Array<Message>>  = new Map()
let membersByRoom: Map<Room, Contact[]> = new Map()

function toBlessedText (s: string, p: blessed.Widgets.Node) {
  return blessed.text({parent: p, content: s})
}

async function getKey(s: Contact | Room) {
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
    generate(qrcode, { small: true }, (asciiart: string) => logElement.setContent(asciiart))
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
    logElement.setLabel(logElement._label.content + ' - ' + user.name())
}

// when login complete, get all friend/room then display on the leftPanel
async function onReady(logElement: contrib.Widgets.LogElement) {
    bot.say('Wechaty ready!').catch(console.error)

    contactList = await bot.Contact.findAll()
    friendList = contactList.filter(x => x.type() !== Contact.Type.Official)
    await Promise.all(friendList.map(async f => friendByName.set(await getKey(f), f)));
    [...friendByName.keys()].forEach(f => leftPanel.add(f))
    msgConsole.log(`Totally ${friendList.length} friends`)
    msgConsole.log(friendByName.size.toString())

    roomList = await bot.Room.findAll()
    await Promise.all(roomList.map(async f => roomByName.set(await getKey(f), f)));
    [...roomByName.keys()].forEach(r => leftPanel.add(r))
    msgConsole.log(`Totally ${roomList.length} rooms`);
    msgConsole.log(roomByName.size.toString())
    screen.render()
}

async function onMessage(message: Message, logElement: contrib.Widgets.LogElement) {
  const type = message.type()
  logElement.log(message.toString())
  const source = message.room() || message.talker()
  const k = await getKey(source)
  if (!msgByName.has(k)) msgByName.set(k,[])
  msgByName.get(k)!.push(message)
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

leftPanel.on('select item', async (item, index) => {
  const name = item.getContent().trim()
  msgConsole.setContent('')
  rightPanel.setContent('')
  const msgs = msgByName.get(name) || ['No message!']
  msgs.forEach(m => msgConsole.add(m.toString()))
  const source: Contact | Room | undefined = friendByName.get(name) || roomByName.get(name)
  msgConsole.log(name)
  msgConsole.log(friendByName.has(name).toString())
  msgConsole.log(roomByName.has(name).toString())
  if(source === undefined) {  // 所有中文字符都失败
    msgConsole.log('error: source no found')
    // click '李涵' to test a specified name
    msgConsole.log('李涵')
    msgConsole.log(`name == '李涵' ${name == '李涵'}`) // false! although they are displayed the same
    msgConsole.log(`friendByName.has('李涵') ${friendByName.has('李涵')}`)  
    // Array.from(friendByName.keys()).forEach(s => msgConsole.log(s))
  } else {
    msgConsole.log(await getKey(source))
  }
  if (source instanceof Room) {
    if(membersByRoom.has(source)) membersByRoom.set(source, await source.memberAll())
    const members = membersByRoom.get(source)
    rightPanel.setitems(members?.map(m => getKey(m)))
  }
})

leftPanel.on('cancel item', (item, index) => {
  const name = item.getText()
  msgConsole.setContent('')
  msgConsole.log(name + 'cancel')
  const msgs = [...msgByName.values()].forEach(m => msgConsole.add(m.toString()))
})

async function main() {
  startBot(bot, msgConsole)
  screen.render()
}

main()
