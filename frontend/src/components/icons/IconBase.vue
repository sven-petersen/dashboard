<!--
SPDX-FileCopyrightText: 2021 SAP SE or an SAP affiliate company and Gardener contributors

SPDX-License-Identifier: Apache-2.0
-->

<template>
  <!-- do not use kebab case for viewBox SVG attribute -->
  <svg
    xmlns="http://www.w3.org/2000/svg"
    :width="props.width"
    :height="props.height"
    :viewBox="props.viewBox"
    :aria-labelledby="props.iconName"
  >
    <title
      :id="props.iconName"
      lang="en"
    >{{ props.iconName }} icon</title>
    <g :fill="iconColorCode">
      <slot />
    </g>
  </svg>
</template>

<script setup>
import { computed, inject } from 'vue'
import { isHtmlColorCode } from '@/utils'

const vuetify = inject('vuetify')

const props = defineProps({
  iconName: {
    type: String,
    default: 'box',
  },
  width: {
    type: [Number, String],
    default: 24,
  },
  height: {
    type: [Number, String],
    default: 24,
  },
  viewBox: {
    type: [Array, String],
    default: '0 0 25 25',
  },
  iconColor: {
    type: String,
    default: '#FFF',
  },
})

const iconColorCode = computed(() => {
  if (isHtmlColorCode(props.iconColor)) {
    return props.iconColor
  }
  return vuetify.theme.current.value.colors[props.iconColor]
})

</script>
