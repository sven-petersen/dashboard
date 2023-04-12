//
// SPDX-FileCopyrightText: 2023 SAP SE or an SAP affiliate company and Gardener contributors
//
// SPDX-License-Identifier: Apache-2.0
//

import { computed } from 'vue'
// TODO: useAppStore from @/store/app when migrating to Pinia
import { useStore } from 'vuex'
import { constants } from '@/store/modules/shoots/helper'
import colors from 'vuetify/lib/util/colors'

export default function useShootSubscription (shootItemRef) {
  // computed from store
  const store = useStore()

  const subscriptionState = computed(() => store.state.shoots.subscriptionState)
  const subscriptionError = computed(() => store.state.shoots.subscriptionError)
  const loading = computed(() => store.getters['shoots/loading'])
  const subscription = computed(() => store.getters['shoots/subscription'])
  const subscribed = computed(() => store.getters['shoots/subscribed'])
  const unsubscribed = computed(() => store.getters['shoots/unsubscribed'])

  const readyState = computed(() => store.state.socket.readyState)
  const connected = computed(() => store.state.socket.connected)
  const active = computed(() => store.getters['socket/active'])

  // computed
  const kind = computed(() => {
    if (loading.value) {
      return subscriptionError.value
        ? subscriptionState.value === constants.LOADING
          ? 'alert-load'
          : 'alert-subscribe'
        : 'progress'
    }
    if (!connected.value) {
      return active.value
        ? 'progress-connect'
        : 'alert-connect'
    }
    return 'ok'
  })
  const color = computed(() => {
    switch (kind.value) {
      case 'alert-connect':
      case 'alert-load':
      case 'alert-subscribe':
        return 'error'
      case 'progress-connect':
        return colors.grey.darken1
      case 'progress':
      default:
        return 'primary'
    }
  })
  const message = computed(() => {
    const name = subscription.value?.name ? 'shoot' : 'shoots'
    switch (kind.value) {
      case 'alert-connect':
        return 'Establishing real-time server connection failed'
      case 'alert-load':
        return `Loading ${name} failed. Data may be outdated`
      case 'alert-subscribe':
        return `Subscribing ${name} failed. Data may be outdated`
      case 'progress-connect':
        return 'Establishing real-time server connection ...'
      case 'progress':
        return `Subscribing ${name} ...`
      default:
        return subscribed.value
          ? `Successfully loaded and subscribed ${name}`
          : 'Real-time server connected'
    }
  })
  const hint = computed(() => {
    return kind.value.startsWith('alert')
      ? `Pressing the ${this.action.toUpperCase()} button may fix the problem`
      : ''
  })
  const action = computed(() => {
    switch (kind.value) {
      case 'alert-connect':
        return 'reconnect'
      case 'alert-subscribe':
        return 'retry'
      case 'alert-load':
        return 'reload'
      default:
        return ''
    }
  })

  // actions & mutations
  const reload = () => store.dispatch('synchronize')
  const reconnect = () => store.commit('CONNECT')

  // methods
  const retry = () => {
    if (!connected.value && !active.value) {
      reconnect()
    } else {
      reload()
    }
  }

  return {
    // computed from state/store
    loading,
    subscription,
    subscribed,
    unsubscribed,
    subscriptionState,
    subscriptionError,
    active,
    readyState,
    connected,
    // computed
    kind,
    color,
    message,
    name,
    hint,
    action,
    // methods
    retry,
  }
}
