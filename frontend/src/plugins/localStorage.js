//
// SPDX-FileCopyrightText: 2021 SAP SE or an SAP affiliate company and Gardener contributors
//
// SPDX-License-Identifier: Apache-2.0
//

import createStorageWrapper from '@/utils/storage'

export default {
  install (app) {
    app.config.globalProperties.localStorage = createStorageWrapper(window.localStorage)
  }
}
