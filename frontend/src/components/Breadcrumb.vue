<!--
SPDX-FileCopyrightText: 2021 SAP SE or an SAP affiliate company and Gardener contributors

SPDX-License-Identifier: Apache-2.0
-->

<template>
  <v-breadcrumbs
    :items="breadcrumbItems"
    class="pl-0 breadcrumbs"
  >
    <template #divider>
      <v-icon size="large">
        mdi-chevron-right
      </v-icon>
    </template>
    <template #title="{ item }">
      <span
        class="text-h6"
      >
        {{ item.text }}
      </span>
    </template>
  </v-breadcrumbs>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const breadcrumbItems = computed(() => {
  let breadcrumbs = route?.meta?.breadcrumbs ?? []
  if (typeof breadcrumbs === 'function') {
    breadcrumbs = breadcrumbs(route)
  }
  // last one is disabled by default which we do not want (will be rendered greyed out)
  // as we use it as some sort of page title.
  breadcrumbs.forEach((b) => {
    b.disabled = false
  })
  if (breadcrumbs.length) {
    const last = breadcrumbs.slice(-1)[0]
    last.disabled ??= false
  }
  return breadcrumbs
})

</script>

<style lang="scss" scoped>
.breadcrumbs :deep(a) {
  color: rgb(var(--v-theme-anchor));
}
</style>
