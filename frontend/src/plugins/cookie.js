//
// SPDX-FileCopyrightText: 2021 SAP SE or an SAP affiliate company and Gardener contributors
//
// SPDX-License-Identifier: Apache-2.0
//

import cookie from 'js-cookie'

/**
 * TODO: check if we want to get rid of this wrapper
 * Previously we used the vue-cookie library. This however did not support
 * Vue3 and was just a tiny wrapper. This wrapper should keep the API identical.
*/
const cookieWrapper = {
  get: cookie.get,

  delete: cookie.remove,

  set: function (name, value, daysOrOptions) {
    let opts = daysOrOptions;
    if (Number.isInteger(daysOrOptions)) {
      opts = { expires: daysOrOptions };
    }
    return cookie.set(name, value, opts);
  },
}

export default {
  install(app) {
    app.config.globalProperties.$cookie = cookieWrapper
    app.provide(cookieWrapper)
  }
}
