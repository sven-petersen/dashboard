<!--
SPDX-FileCopyrightText: 2021 SAP SE or an SAP affiliate company and Gardener contributors

SPDX-License-Identifier: Apache-2.0
 -->

<template>
  <g-error
    code="404"
    text="Looks like you're lost"
    message="The page you are looking for is not available!"
    button-text="Get me out of here"
    @click="onClick"
  />
</template>

<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'
import { useRouter, useRoute } from 'vue-router'
import GError from '@/components/GError.vue'
import get from 'lodash/get'

const store = useStore()
const route = useRoute()
const router = useRouter()

const fallbackRoute = computed(() => {
  const defaultNamespace = store.getters.defaultNamespace
  const namespace = get(route, 'params.namespace', defaultNamespace)
  const name = get(route, 'params.name')
  if (namespace) {
    if (name) {
      return {
        name: 'ShootItem',
        params: {
          namespace,
          name,
        },
      }
    }
    return {
      name: 'ShootList',
      params: {
        namespace,
      },
    }
  }
  return {
    name: 'Home',
  }
})

const onClick = async ({ name } = {}) => {
  if (!name) {
    try {
      await router.push(fallbackRoute)
    } catch (err) {
      /* Catch and ignore navigation aborted errors. Redirection happens in navigation guards (see https://router.vuejs.org/guide/essentials/navigation.html#router-push-location-oncomplete-onabort). */
    }
  } else {
    router.back()
  }
}
</script>
