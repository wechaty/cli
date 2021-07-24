import { join } from 'path'
import { mkdirSync } from 'fs'
import { Contact, Message, ScanStatus, Wechaty } from 'wechaty'
import { generate } from 'qrcode-terminal'
import { screen, msgConsole, leftPanel } from './src/main'
import * as blessed from 'blessed'
import * as contrib from 'blessed-contrib'

const bot = new Wechaty()
const filePath = join('data', 'files')

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

async function onReady(logElement: contrib.Widgets.LogElement) {
    bot.say('Wechaty ready!').catch(console.error)
    await showContacts(bot)
    screen.render()
}

async function onMessage(message: Message, logElement: contrib.Widgets.LogElement) {
  const type = message.type()
  logElement.log(message.toString())
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

async function showContacts(bot: Wechaty) {
  const contactList = await bot.Contact.findAll()
  msgConsole.log(`Totally ${contactList.length} contacts`)
  for (let i = 0; i < contactList.length; i++) {
    const contact = contactList[i]
    let alias = await contact.alias()
    alias = alias?`(${alias})`:''
    leftPanel.add(contact.name() + alias)
  }
  const roomList = await bot.Room.findAll()
  for (let i = 0; i < roomList.length; i++) {
    const room = roomList[i]
    leftPanel.add(await room.topic() || room.id)
  }
  leftPanel.render()
}

async function main() {
  startBot(bot, msgConsole)
  screen.render()
}

main()
