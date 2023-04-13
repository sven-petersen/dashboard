<!--
SPDX-FileCopyrightText: 2021 SAP SE or an SAP affiliate company and Gardener contributors

SPDX-License-Identifier: Apache-2.0
-->

<template>
  <div>
    <v-checkbox
      v-model="enableStaticTokenKubeconfig"
      label="Enable static token kubeconfig (not recommended)"
      color="primary"
      hide-details
    />
    <div class="text-caption mt-1">
      There are more <external-link
        class="text-caption"
        url="https://github.com/gardener/gardener/blob/master/docs/usage/shoot_access.md"
      >
        secure alternatives
      </external-link> to access the Shoot cluster.
    </div>
  </div>
</template>
<script setup>
import { computed } from 'vue'
import ExternalLink from '@/components/ExternalLink.vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
})

const emits = defineEmits(['update:modelValue'])

const enableStaticTokenKubeconfig = computed({
  get () { return props.modelValue },
  set (val) { emits('update:modelValue', val) },
})
</script>
