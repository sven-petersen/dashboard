<!--
SPDX-FileCopyrightText: 2021 SAP SE or an SAP affiliate company and Gardener contributors

SPDX-License-Identifier: Apache-2.0
-->

<template>
  <v-breadcrumbs
    :items="breadcrumbItems"
    class="pl-0"
  >
    <template #divider>
      <v-icon size="large">
        mdi-chevron-right
      </v-icon>
    </template>
    <template #title="{ item }">
      <router-link
        v-if="item.to"
        :to="item.to"
        class="text-decoration-none"
      >
        {{ item.text }}
      </router-link>
      <span
        v-else
        class="text-h6"
      >
        {{ item.text }}
      </span>
    </template>
  </v-breadcrumbs>
</template>

<script>
import { mapState } from 'vuex'
import get from 'lodash/get'

export default {
  name: 'Breadcrumb',
  computed: {
    ...mapState([
      'namespace',
    ]),
    breadcrumbItems () {
      let breadcrumbs = this.$route?.meta?.breadcrumbs ?? []
      if (typeof breadcrumbs === 'function') {
        breadcrumbs = breadcrumbs(this.$route)
      }
      if (breadcrumbs.length) {
        const last = breadcrumbs.slice(-1)[0]
        last.disabled ??= false
      }
      return breadcrumbs
    },
    routeParamName () {
      return get(this.$route.params, 'name')
    },
  },
}
</script>
