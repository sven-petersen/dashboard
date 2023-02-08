//
// SPDX-FileCopyrightText: 2021 SAP SE or an SAP affiliate company and Gardener contributors
//
// SPDX-License-Identifier: Apache-2.0

import Vue from 'vue'
import Vuetify from 'vuetify'

// TODO: this is just temporary so the jest-based tests continue to function
globalThis.jest = vi

const fetchMock = await import('jest-fetch-mock')

Vue.use(Vuetify)

Object.defineProperty(Vue, 'vuetify', { value: new Vuetify() })

fetchMock.enableMocks()

globalThis.document ??= {}
globalThis.document.createRange = vi.fn().mockImplementation(() => {
  const range = new Range()
  range.getBoundingClientRect = vi.fn()
  range.getClientRects = () => {
    return {
      item: () => null,
      length: 0,
      [Symbol.iterator]: vi.fn()
    }
  }
  return range
})

globalThis.window ??= {}
globalThis.window.matchMedia = vi.fn().mockImplementation(query => {
  return {
    matches: false,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn()
  }
})

const globalConsole = globalThis.console
globalThis.console = {
  log (...args) {
    globalConsole.log(...args)
  },
  warn: vi.fn(),
  error: vi.fn()
}

// see issue https://github.com/vuejs/vue-test-utils/issues/974#issuecomment-423721358
global.requestAnimationFrame = jest.fn().mockImplementation(cb => cb())
