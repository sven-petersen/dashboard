//
// SPDX-FileCopyrightText: 2021 SAP SE or an SAP affiliate company and Gardener contributors
//
// SPDX-License-Identifier: Apache-2.0
//

// import Vue from 'vue'
// import Router from 'vue-router'
import { createRouter as createVueRouter, createWebHistory } from 'vue-router'

import createRoutes from './routes'
// import createGuards from './guards'

// Vue.use(Router)

// const userManager = Vue.auth
// const localStorage = Vue.localStorage
// const logger = Vue.logger
import MyDummy from '@/MyDummy.vue'
import MyDummy2 from '@/MyDummy2.vue'


export default function createRouter (/* store */) {
  // const zeroPoint = { x: 0, y: 0 } // TODO: change x,y to top,left after upgrading to router v4
  const zeroPoint = { left: 0, top: 0 } // TODO: change x,y to top,left after upgrading to router v4

  const routerOptions = {
    // mode: 'history',
    history: createWebHistory(import.meta.env.BASE_URL),
    // base: import.meta.env.BASE_URL,
    scrollBehavior (to, from, savedPosition) {
      return savedPosition || zeroPoint
    },
    // routes: createRoutes(store)
    // TODO: remove
    routes: [
      {
        path: '/login',
        name: 'Login',
        component: MyDummy
      },
      {
        path: '/login2',
        name: 'Login2',
        component: MyDummy2
      }
    ]
  }

  // // automatic signout when token expires
  // let timeoutID
  // store.watch((state, getters) => getters.userExpiresAt, expirationTime => {
  //   if (timeoutID) {
  //     clearTimeout(timeoutID)
  //   }
  //   const currentTime = Date.now()
  //   if (expirationTime) {
  //     if (expirationTime > currentTime) {
  //       const delay = Math.min(2147483647, expirationTime - currentTime) // setTimeout delay must not exceed 32-bit signed integer
  //       timeoutID = setTimeout(() => {
  //         logger.info('Session is expiring --> Redirecting to logout page')
  //         userManager.signout()
  //       }, delay)
  //     } else {
  //       logger.error('Expiration time of a new token is not expected to be in the past')
  //     }
  //   }
  // })

  // // router
  // const router = new Router(routerOptions)
  const router = createVueRouter(routerOptions)

  // // navigation guards
  // const guards = createGuards(store, userManager, localStorage, logger)
  // for (const guard of guards.beforeEach) {
  //   router.beforeEach(guard)
  // }
  // for (const guard of guards.afterEach) {
  //   router.afterEach(guard)
  // }

  // FIXME: reenable error page. But for now disable it because if the page has a client side error,
  //   we will be redirected to the error page instead of seeing Vites error message.
  // // router error
  // router.onError(err => {
  //   logger.error('Router error:', err)
  //   store.commit('SET_LOADING', false)
  //   store.commit('SET_ALERT', { type: 'error', message: err.message })
  //   router.push({ name: 'Error' })
  // })

  return router
}
