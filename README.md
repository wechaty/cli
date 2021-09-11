# wechaty-cli

[![NPM](https://github.com/wechaty/cli/actions/workflows/npm.yml/badge.svg)](https://github.com/wechaty/cli/actions/workflows/npm.yml)
[![NPM Version](https://badge.fury.io/js/wechaty-cli.svg)](https://badge.fury.io/js/wechaty-cli)
[![npm (tag)](https://img.shields.io/npm/v/wechaty-cli/next.svg)](https://www.npmjs.com/package/wechaty-cli?activeTab=versions)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-blue.svg)](https://www.typescriptlang.org/)

![wechaty-cli](docs/images/terminal-wechaty.webp)

Terminal Command Line Client (CLI) for Wechaty

## Usage

### Install from NPM

```sh
npm install wechaty-cli
```

Show version:

```sh
$ wechaty-cli --version
0.2.1
```

Start CLI

```sh
wechaty-cli
```

### Install from source

```sh
git clone https://github.com/wechaty/cli.git wechaty-cli
cd wechaty-cli
npm start
```

### Build from Dockerfile

```sh
git clone https://github.com/wechaty/cli.git wechaty-cli
cd wechaty-cli
docker build -t wechaty-cli .  # this command needs only to be executed once
docker run --rm -it wechaty-cli  # use this command to run wechaty-cli at any time!
```

### Debug in VS Code

Debugging with configuration "Launch via NPM", the app will run immediately in the integrated terminal.

To test the app in external terminal, run `npm run debug` then start debugging with configuration "Attach".

## Resources

### Wechaty

- [Summer of Wechaty](https://github.com/wechaty/summer-of-wechaty/issues/80)
- [Wechaty API](https://wechaty.js.org/docs/api)

### Related Projects

- [blessed](https://github.com/chjj/blessed#documentation)
- [blessed-contrib](https://github.com/yaronn/blessed-contrib#widgets)
- [node-facenet](https://github.com/huan/node-facenet)
- [console-tg-client](https://github.com/lekzd/console-tg-client)

## History

### master v0.2 (Sep 12, 2021)

1. ESM support

### v0.0.1 (Jul 3, 2021)

Init.

## Creators

- [@chinggg](https://github.com/chinggg) - (刘靖) liuchinggg@gmail.com
- [@huan](https://github.com/huan) - ([李卓桓](https://wechaty.js.org/contributors/huan)) zixia@zixia.net

## Copyright & License

- Code & Docs © 2021 Wechaty Contributors <https://github.com/wechaty>
- Code released under the Apache-2.0 License
- Docs released under Creative
