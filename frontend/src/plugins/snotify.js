//
// SPDX-FileCopyrightText: 2021 SAP SE or an SAP affiliate company and Gardener contributors
//
// SPDX-License-Identifier: Apache-2.0
//

import Snotify from 'vue-snotify'

export default {
  install (app) {
    app.use(Snotify)
  }
}

