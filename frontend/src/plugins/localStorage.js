//
// SPDX-FileCopyrightText: 2021 SAP SE or an SAP affiliate company and Gardener contributors
//
// SPDX-License-Identifier: Apache-2.0
//

import createStorageWrapper from '@/utils/storage'

export default {
  install (app) {
    const wrappedStorage = createStorageWrapper(window.localStorage)
    app.config.globalProperties.$localStorage = wrappedStorage
    app.provide('localStorage', wrappedStorage)
  }
}
