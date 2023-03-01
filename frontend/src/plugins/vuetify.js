//
// SPDX-FileCopyrightText: 2021 SAP SE or an SAP affiliate company and Gardener contributors
//
// SPDX-License-Identifier: Apache-2.0
//

import { createVuetify } from 'vuetify'
import theme from './vuetify.theme.js'
// Styles
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'

const vuetify = createVuetify({
  icons: {
    iconfont: 'mdi'
  },
  theme
})

export default {
  install (app) {
    app.use(vuetify)
    app.config.globalProperties.$vuetify = vuetify
    app.provide('vuetify', vuetify)
  }
}
