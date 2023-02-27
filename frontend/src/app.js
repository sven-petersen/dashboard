//
// SPDX-FileCopyrightText: 2021 SAP SE or an SAP affiliate company and Gardener contributors
//
// SPDX-License-Identifier: Apache-2.0
//

import { createApp as createVueApp, h } from 'vue'
// import store from '@/store'
import createRouter from '@/router'

const App = {
  name: 'app',
  created () {
    // provide the keyboard events for dialogs. Dialogs can't catch keyboard events
    // if any input element of the dialog didn't have the focus.
    window.addEventListener('keyup', ({ key }) => {
      if (key === 'Escape' || key === 'Esc') {
        this.$bus.emit('esc-pressed')
      }
    })
  },
  render () {
    return h('router-view')
  }
}

export { App }

export function createApp (plugins) {
  const app = createVueApp({
    // store,
    router: createRouter(/* store */),
    render () {
      return h(App)
    }
  })

  plugins.forEach((p) => app.use(p))
  return app
}
