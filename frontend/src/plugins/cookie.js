//
// SPDX-FileCopyrightText: 2021 SAP SE or an SAP affiliate company and Gardener contributors
//
// SPDX-License-Identifier: Apache-2.0
//

// FIXME: https://github.com/alfhen/vue-cookie seems to be Vue2 only
import VueCookie from 'vue-cookie'

export default {
  install (app) {
    app.use(VueCookie)
  }
}
