//
// SPDX-FileCopyrightText: 2021 SAP SE or an SAP affiliate company and Gardener contributors
//
// SPDX-License-Identifier: Apache-2.0
//

const yaml = import('js-yaml')

export default {
  install (app) {
    const yamlFacade = {
      dump (obj) {
        return yaml.then(({ dump }) => dump(obj, {
          skipInvalid: true
        }))
      },
      load (data) {
        return yaml.then(({ load }) => load(data))
      }
    }

    app.config.globalProperties.$yaml = yamlFacade
    app.provide('yaml', yamlFacade)
  }
}
