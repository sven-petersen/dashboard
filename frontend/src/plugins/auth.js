//
// SPDX-FileCopyrightText: 2021 SAP SE or an SAP affiliate company and Gardener contributors
//
// SPDX-License-Identifier: Apache-2.0
//

import { UserManager } from '@/utils/auth'

export default {
  install (app) {
    const auth = new UserManager()
    app.config.globalProperties.$auth = auth
    app.provide('auth', auth)
  }
}
