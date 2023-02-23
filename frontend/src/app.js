//
// SPDX-FileCopyrightText: 2021 SAP SE or an SAP affiliate company and Gardener contributors
//
// SPDX-License-Identifier: Apache-2.0
//

import { createApp as createVueApp } from 'vue'
import App from './App.vue'
// import store from '@/store'
import router from '@/router'

export function createApp (plugins) {
  // const router = createRouter(/* store */)
  const app = createVueApp(App)

  plugins.forEach((p) => app.use(p))
  app.use(router)

  return app
}
