<!--
SPDX-FileCopyrightText: 2021 SAP SE or an SAP affiliate company and Gardener contributors

SPDX-License-Identifier: Apache-2.0
-->
<!-- eslint-disable vue/no-v-html -->

<template>
  <pre
    class="ansi-text"
    v-html="escapedAnsiHTML"
  />
</template>

<script setup>
import { computed } from 'vue'
import ansiHTML from 'ansi-html'
import escape from 'lodash/escape'

const props = defineProps({
  text: {
    type: String,
    default: '',
  },
})

const escapedAnsiHTML = computed(() => ansiHTML(escape(props.text)))
</script>

<style lang="scss" scoped>

.ansi-text {
  text-align: left;
  min-width: 250px;
  white-space: pre-wrap;
  max-height: inherit;
}

</style>
