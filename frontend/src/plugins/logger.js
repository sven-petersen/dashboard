//
// SPDX-FileCopyrightText: 2021 SAP SE or an SAP affiliate company and Gardener contributors
//
// SPDX-License-Identifier: Apache-2.0
//

import createLogger from '@/utils/logger'

export default {
  install (app) {
    const { $localStorage } = app.config.globalProperties
    const logger = createLogger($localStorage)
    app.config.globalProperties.$logger = logger
    app.provide('logger', logger)
  }
}
