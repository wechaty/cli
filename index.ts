import { Wechaty } from 'wechaty'
import { generate } from 'qrcode-terminal'
import { screen, msgConsole } from './src/main'

const bot = new Wechaty()

function startBot(bot: Wechaty, logElement: any) {
  logElement.log('Initing...')
  bot
  .on('logout'	, user => logElement.log(`${user.name()} logouted`))
  .on('login'	  , user => {
    logElement.setContent('')
    logElement.log(`${user.name()} login`)
    bot.say('Wechaty login').catch(console.error)
    logElement.setLabel(logElement._label.content + ' - ' + user.name())
  })
  .on('scan', (qrcode) => {
    generate(
      qrcode,
      {
        small: true,
      },
      (asciiart: string) => logElement.setContent(asciiart),
    )
  })
  .on('message', async m => {
    logElement.log(m.toString())
  })

  bot.start()
  .catch(async e => {
    logElement.log(`start() fail: ${e}`)
    await bot.stop()
    process.exit(-1)
  })

  bot.on('error', async e => {
    logElement.log(`error: ${e}`)
    if (bot.logonoff()) {
      await bot.say('Wechaty error: ' + e.message).catch(console.error)
    }
    await bot.stop()
  })
}

startBot(bot, msgConsole)

screen.render()

