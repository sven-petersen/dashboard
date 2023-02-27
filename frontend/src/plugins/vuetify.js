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

export default createVuetify({
  icons: {
    iconfont: 'mdi'
  },
  theme
})
