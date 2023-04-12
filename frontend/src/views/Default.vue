<!--
SPDX-FileCopyrightText: 2021 SAP SE or an SAP affiliate company and Gardener contributors

SPDX-License-Identifier: Apache-2.0
-->

<template>
  <v-app ref="root">
    <loading />
    <main-navigation />
    <main-toolbar />
    <main-content ref="content" />
    <g-snotify />
  </v-app>
</template>

<script setup>
import { onMounted, computed, ref } from 'vue'
import { onBeforeRouteUpdate } from 'vue-router'
import MainNavigation from '@/components/MainNavigation.vue'
import MainToolbar from '@/components/MainToolbar.vue'
import MainContent from '@/components/MainContent.vue'
import Loading from '@/components/Loading.vue'
import GSnotify from '@/components/GSnotify.vue'
import set from 'lodash/set'

function setElementStyle (element, key, value) {
  if (element) {
    set(element.style, key, value)
  }
}

function disableVerticalScrolling (element) {
  setElementStyle(element, 'overflowY', 'hidden')
}

const root = ref()
const content = ref()

const rootEl = computed(() => root.value?.$el)
const getWrapElement = computed(() => rootEl.value.querySelector(':scope > div[class$="wrap"]'))

onMounted(() => {
  disableVerticalScrolling(rootEl.value)
  disableVerticalScrolling(getWrapElement.value)
})

onBeforeRouteUpdate(() => {
  content.value.setScrollTop(0)
})

</script>
