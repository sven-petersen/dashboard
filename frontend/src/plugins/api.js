//
// SPDX-FileCopyrightText: 2022 SAP SE or an SAP affiliate company and Gardener contributors
//
// SPDX-License-Identifier: Apache-2.0
//

import api, { interceptors } from '@/utils/api'
import { createAbortError } from '@/utils/errors'

export default {
  registerRequestInterceptor (auth) {
    this.unregister = interceptors.register({
      async requestFulfilled (...args) {
        const url = args[0] ?? ''
        if (url.startsWith('/api')) {
          try {
            await auth.ensureValidToken()
          } catch (err) {
            throw createAbortError('Request aborted')
          }
        }
        return args
      }
    })
  },
  install (app) {
    this.registerRequestInterceptor(app.config.globalProperties.$auth)
    app.config.globalProperties.$api = api
    app.provide('api', api)
  }
}
