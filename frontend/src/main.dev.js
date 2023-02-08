//
// SPDX-FileCopyrightText: 2021 SAP SE or an SAP affiliate company and Gardener contributors
//
// SPDX-License-Identifier: Apache-2.0
//

// Import Plugins
import '@/plugins'

// Create App
import vuetify from '@/plugins/vuetify.dev'
import { createApp } from '@/app'

createApp(vuetify).$mount('#app')
