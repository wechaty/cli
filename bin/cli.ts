#!/usr/bin/env node

import path            from 'path'
import { ArgumentParser }   from 'argparse'
import updateNotifier  from 'update-notifier'

import {
  log,
  MODULE_ROOT,
  VERSION,
}               from '../src/config'

import { startBot } from '../src/index'

function checkUpdate () {
  const pkgFile   = path.join(MODULE_ROOT, 'package.json')
  const pkg       = require(pkgFile)
  const notifier  = updateNotifier({
    pkg,
    updateCheckInterval: 1000 * 60 * 60 * 24 * 7, // 1 week
  })
  notifier.notify()
}

async function main (args: any): Promise<number> {
  log.level(args.log as any)
  log.timestamp(false)

  log.verbose('Manager', `Facenet v${VERSION}`)

  checkUpdate()

  try {
    startBot(args)
  } catch (e) {
    log.error(e as string)
    return 1
  }
  return 0
}

function parseArguments () {
  const parser = new ArgumentParser({
    description : 'Wechaty CLI',
  })

  const version = VERSION
  parser.add_argument('-v', '--version', { action: 'version', version })
  parser.add_argument('-l', '--log',
    {
      default: 'info',
      help: 'Log Level: silent, verbose, silly',
    },
  )
  parser.add_argument('-n', '--name', { default: 'bot', help: 'name of bot instance' })
  return parser.parse_args()
}

process.on('warning', (warning) => {
  console.warn(warning.name)    // Print the warning name
  console.warn(warning.message) // Print the warning message
  console.warn(warning.stack)   // Print the stack trace
})

main(parseArguments())
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
