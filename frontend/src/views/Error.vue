<!--
SPDX-FileCopyrightText: 2021 SAP SE or an SAP affiliate company and Gardener contributors

SPDX-License-Identifier: Apache-2.0
 -->

<template>
  <v-app>
    <v-main>
      <g-error
        :message="message"
        @click="goHome"
      />
    </v-main>
  </v-app>
</template>

<script setup>
import GError from '@/components/GError.vue'
import { computed } from 'vue'
import { useStore } from 'vuex'

// TODO: make sure to check this after migrating to Pinia
const store = useStore()

const message = computed(() => store.state.alert?.message)

const goHome = async () => {
  try {
    await this.$router.push({ name: 'Home' })
  } catch (err) {
    // Catch and ignore navigation aborted errors. Redirection happens in navigation guards
    // (see https://router.vuejs.org/guide/essentials/navigation.html#router-push-location-oncomplete-onabort).
  }
}
</script>
