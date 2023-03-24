//
// SPDX-FileCopyrightText: 2021 SAP SE or an SAP affiliate company and Gardener contributors
//
// SPDX-License-Identifier: Apache-2.0
//

import { createRouter as createVueRouter, createWebHistory } from 'vue-router'

import createRoutes from './routes'
import createGuards from './guards'

export default function createRouter ({ store, logger, auth, localStorage }) {
  const zeroPoint = { left: 0, top: 0 }

  const routerOptions = {
    history: createWebHistory(import.meta.env.BASE_URL),
    scrollBehavior (to, from, savedPosition) {
      return savedPosition || zeroPoint
    },
    routes: createRoutes(store)
  }

  // automatic signout when token expires
  let timeoutID
  store.watch((state, getters) => getters.userExpiresAt, expirationTime => {
    if (timeoutID) {
      clearTimeout(timeoutID)
    }
    const currentTime = Date.now()
    if (expirationTime) {
      if (expirationTime > currentTime) {
        const delay = Math.min(2147483647, expirationTime - currentTime) // setTimeout delay must not exceed 32-bit signed integer
        timeoutID = setTimeout(() => {
          logger.info('Session is expiring --> Redirecting to logout page')
          auth.signout()
        }, delay)
      } else {
        logger.error('Expiration time of a new token is not expected to be in the past')
      }
    }
  })

  // router
  const router = createVueRouter(routerOptions)

  // navigation guards
  const guards = createGuards(store, auth, localStorage, logger)
  for (const guard of guards.beforeEach) {
    router.beforeEach(guard)
  }
  for (const guard of guards.afterEach) {
    router.afterEach(guard)
  }

  // TODO: re-enable - but during migration it helps to keep this disabled to prevent redirects
  //   while making a component work with Vue/Vuetify 3
  // router error
  // router.onError(err => {
  //   logger.error('Router error:', err)
  //   store.commit('SET_LOADING', false)
  //   store.commit('SET_ALERT', { type: 'error', message: err.message })
  //   router.push({ name: 'Error' })
  // })

  return router
}
