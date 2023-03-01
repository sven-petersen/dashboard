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
import auth from './auth'
import api from './api'
import store from './store'
import yaml from './yaml'
// import './utils'
import vuetify from './vuetify'
import createRouter from '../router'

export function registerPlugins (app) {
  app
    .use(bus)
    .use(yaml)
    .use(localStorage)
    .use(logger)
    .use(vuetify)
    .use(auth)
    .use(api)
    .use(store)
    // .use(snotify) // requires compat GLOBAL_MOUNT and FILTERS

  app.use(createRouter({
    store: app.config.globalProperties.$store,
    logger: app.config.globalProperties.$store,
    auth: app.config.globalProperties.$auth,
  }))
}
