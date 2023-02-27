//
// SPDX-FileCopyrightText: 2021 SAP SE or an SAP affiliate company and Gardener contributors
//
// SPDX-License-Identifier: Apache-2.0
//

import EventEmitter from 'events'

export default {
  install (app) {
    const bus = new EventEmitter()
    app.config.globalProperties.$bus = bus
    app.provide('bus', bus)
  }
}
