//
// SPDX-FileCopyrightText: 2021 SAP SE or an SAP affiliate company and Gardener contributors
//
// SPDX-License-Identifier: Apache-2.0
//

// import Vue from 'vue'
import { createVuetify } from 'vuetify'
import theme from './vuetify.theme.js'

// const vuetify = createVuetify({
//   icons: {
//     iconfont: 'mdi'
//   },
//   theme
// })

// Vue.use(vuetify)

// Object.defineProperty(Vue, 'vuetify', { value: vuetify })

// export default vuetify

export default {
  install (app) {
    const vuetify = createVuetify({
      icons: {
        iconfont: 'mdi'
      },
      theme
    })

    app.config.globalProperties.vuetify = vuetify
    app.use(vuetify)
  }
}
