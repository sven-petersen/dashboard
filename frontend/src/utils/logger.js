//
// SPDX-FileCopyrightText: 2022 SAP SE or an SAP affiliate company and Gardener contributors
//
// SPDX-License-Identifier: Apache-2.0
//

import createStorageWrapper from '@/utils/storage'

const levels = {
  debug: 1,
  info: 2,
  warn: 3,
  error: 4,
  silent: 5
}

export class Logger {
  #level

  constructor (level = 'debug') {
    this.#level = level
  }

  setLevel (value) {
    if (Object.keys(levels).includes(value)) {
      this.#level = value
    }
  }

  get level () {
    return levels[this.#level]
  }

  _print (key, ...args) {
    const ts = new Date().toISOString()
    const prefix = ts.substring(0, 10) + ' ' + ts.substring(11, ts.length - 1) + ':'
    if (typeof args[0] === 'string') {
      args.unshift(prefix + ' ' + args.shift())
    } else {
      args.unshift(prefix)
    }
    console[key](...args) // eslint-disable-line
  }

  debug (...args) {
    if (this.level <= levels.debug) {
      this._print('debug', ...args)
    }
  }

  log (...args) {
    if (this.level <= levels.info) {
      this._print('log', ...args)
    }
  }

  info (...args) {
    if (this.level <= levels.info) {
      this._print('info', ...args)
    }
  }

  warn (...args) {
    if (this.level <= levels.warn) {
      this._print('warn', ...args)
    }
  }

  error (...args) {
    if (this.level <= levels.error) {
      this._print('error', ...args)
    }
  }
}

// TODO: check if we want to have a global logger or not. If yes it should be considered if createLogger below
//   should be exported and/or if we still want to create a separate instance in plugins/logger to attach
//   to the Vue app instance.
//   "globalLogger" is currently one way to make the logger easily accessible outside of the context of
//   a component/app creation such as the store (ex. store/modules/shoot/index.js)
//
export const globalLogger = createLogger(createStorageWrapper(window.localStorage))

export default function createLogger (storage) {
  const logger = new Logger()
  logger.setLevel(storage.getItem('global/log-level'))
  storage.on('change', (key, value) => {
    if (key === null) {
      logger.setLevel('debug')
    } else if (key === 'global/log-level') {
      logger.setLevel(value)
    }
  })
  return logger
}
