<!--
SPDX-FileCopyrightText: 2021 SAP SE or an SAP affiliate company and Gardener contributors

SPDX-License-Identifier: Apache-2.0
-->

<template>
  <div ref="root">
    <slot ref="children" />
  </div>
</template>

<script setup>
import { computed, watch, onMounted, onUpdated, ref, inject } from 'vue'

const props = defineProps({
  hintColor: {
    type: String,
    default: '',
  },
})

const vuetify = inject('vuetify')
const root = ref()
const children = ref()

const applyHintColor = () => {
  if (!root.value) {
    return
  }
  const hintElement = root.value?.querySelector('.v-messages__message')
  if (!hintElement) {
    return
  }

  const colorCode = vuetify.theme.current.value.colors[props.hintColor]
  if (!isSelectErrorColor.value && props.hintColor !== 'default') {
    hintElement.style = `color: ${colorCode}`
  } else {
    hintElement.style = ''
  }
}

const isSelectErrorColor = computed(() => !!root.value?.querySelector('div.v-input.v-input--error'))
watch(() => props.hintColor, applyHintColor)

onMounted(applyHintColor)
onUpdated(applyHintColor)
</script>
