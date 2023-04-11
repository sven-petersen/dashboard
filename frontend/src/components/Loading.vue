<!--
SPDX-FileCopyrightText: 2021 SAP SE or an SAP affiliate company and Gardener contributors

SPDX-License-Identifier: Apache-2.0
-->

<template>
  <v-overlay :model-value="loading">
    <v-progress-circular
      indeterminate
      :size="64"
    />
  </v-overlay>
</template>

<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'

// TODO: migrate to Pinia (useAppStore from @/store/app)
const store = useStore()
const loading = computed(() => store.state.loading)
</script>
