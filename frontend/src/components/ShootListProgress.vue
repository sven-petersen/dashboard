<!--
SPDX-FileCopyrightText: 2022 SAP SE or an SAP affiliate company and Gardener contributors

SPDX-License-Identifier: Apache-2.0
-->

<template>
  <v-progress-linear
    :indeterminate="indeterminate"
    :color="color"
    :model-value="value"
    :striped="striped"
  />
</template>

<script setup>
import { computed } from 'vue'
import useShootSubscription from '@/composables/useShootSubscription'

defineProps({
  color: {
    type: String,
    default: 'primary',
  },
})

const { kind } = useShootSubscription()

const indeterminate = computed(() => kind.value.startsWith('progress'))
const striped = computed(() => kind.value === 'alert-connect')
const value = computed(() => kind.value === 'alert-connect' ? 100 : 0)
</script>
