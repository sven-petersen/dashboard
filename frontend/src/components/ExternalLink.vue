<!--
SPDX-FileCopyrightText: 2021 SAP SE or an SAP affiliate company and Gardener contributors

SPDX-License-Identifier: Apache-2.0
-->

<template>
  <a
    :href="safeUrl"
    target="_blank"
    rel="noopener"
    class="text-decoration-none text-no-wrap"
  >
    <span class="text-decoration-underline">
      <slot>{{ url }}</slot>
    </span>
    <v-icon
      :size="12"
      class="inherit-color ml-1"
    >mdi-open-in-new</v-icon>
  </a>
</template>

<script setup>
import { toRef } from 'vue'
import useSanitizeUrl from '@/composables/useSanitizeUrl'

const props = defineProps({
  url: {
    type: String,
    required: true,
  },
})

const safeUrl = useSanitizeUrl(toRef(props, 'url'))
</script>
