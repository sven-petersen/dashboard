//
// SPDX-FileCopyrightText: 2023 SAP SE or an SAP affiliate company and Gardener contributors
//
// SPDX-License-Identifier: Apache-2.0
//

import { createStore } from '@/store'

export default {
  install (app) {
    const store = createStore(app)
    app.use(store) // store.install already calls app.provide('store', ...)
    app.config.globalProperties.$store = store
  }
}

