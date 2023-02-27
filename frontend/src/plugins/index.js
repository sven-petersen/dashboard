//
// SPDX-FileCopyrightText: 2021 SAP SE or an SAP affiliate company and Gardener contributors
//
// SPDX-License-Identifier: Apache-2.0
//

import './styles'
// import vuelidate from './vuelidate'
// import shortkey from './shortkey'
// import snotify from './snotify'
// import cookie from './cookie'
import bus from './bus'
import localStorage from './localStorage'
import logger from './logger'
// import auth from './auth'
import api from './api'
// import yaml from './yaml'
// import './utils'
import vuetify from './vuetify'
import createRouter from '../router'

export function registerPlugins (app) {
  app
    .use(bus)
    .use(localStorage)
    .use(logger)
    .use(api)
    .use(vuetify)
    .use(createRouter(/* store */))
}
