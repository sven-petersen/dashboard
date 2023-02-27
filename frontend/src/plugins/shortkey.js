//
// SPDX-FileCopyrightText: 2021 SAP SE or an SAP affiliate company and Gardener contributors
//
// SPDX-License-Identifier: Apache-2.0
//

// FIXME: https://github.com/fgr-araujo/vue-shortkey only supports Vue2
import ShortKey from 'vue-shortkey'

export default {
  install (app) {
    app.use(ShortKey)
  }
}
