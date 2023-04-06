<!--
SPDX-FileCopyrightText: 2021 SAP SE or an SAP affiliate company and Gardener contributors

SPDX-License-Identifier: Apache-2.0
-->

<template>
  <span v-if="title">{{ titleText }}</span>
  <!-- we make the tooltip background transparent so that it does not conflict with the cards background -->
  <v-tooltip
    v-else
    location="top"
    content-class="tooltip"
  >
    <template #activator="{ props: p }">
      <div
        class="d-flex align-center"
        v-bind="p"
      >
        <infra-icon
          :value="cloudProviderKind"
          class="mr-2"
        />
        {{ description }}
      </div>
    </template>
    <v-card>
      <v-list>
        <v-list-item>
          <v-list-item-content class="pa-0">
            <v-list-item-subtitle>Provider</v-list-item-subtitle>
            <v-list-item-title class="d-flex">
              <infra-icon
                :value="cloudProviderKind"
                class="mr-2"
              />{{ cloudProviderKind }}
            </v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item v-if="cloudProfileName">
          <v-list-item-content class="pa-0">
            <v-list-item-subtitle>Cloud Profile</v-list-item-subtitle>
            <v-list-item-title>{{ cloudProfileName }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item v-if="region">
          <v-list-item-content class="pa-0">
            <v-list-item-subtitle>Region</v-list-item-subtitle>
            <v-list-item-title>{{ region }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item v-if="zones.length">
          <v-list-item-content class="pa-0">
            <v-list-item-subtitle>{{ zoneTitle }}</v-list-item-subtitle>
            <v-list-item-title>{{ zoneText }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-card>
  </v-tooltip>
</template>

<script setup>
import { computed } from 'vue'
import InfraIcon from '@/components/VendorIcon.vue'

const props = defineProps({
  zones: {
    type: Array,
    default: () => [],
  },
  cloudProviderKind: {
    type: String,
    default: null,
  },
  cloudProfileName: {
    type: String,
    default: null,
  },
  region: {
    type: String,
    default: null,
  },
  title: {
    type: Boolean,
    default: false,
  },
  extended: {
    type: Boolean,
    default: false,
  },
})

const zoneText = computed(() => props.zones.join(', '))
const zoneTitle = computed(() => props.zones.length > 1 ? 'Zones' : 'Zone')
const description = computed(() => {
  const description = []
  if (props.extended && props.cloudProviderKind) {
    description.push(props.cloudProviderKind)
  }
  if (props.cloudProfileName) {
    description.push(props.cloudProfileName)
  }
  if (props.region) {
    description.push(props.region)
  }
  if (props.extended && props.zones.length) {
    description.push(zoneText.value)
  }

  return description.join(' / ')
})
const titleText = computed(() => {
  const titles = []
  if (props.extended && props.cloudProviderKind) {
    titles.push('Provider')
  }
  if (props.cloudProfileName) {
    titles.push('Profile')
  }
  if (props.region) {
    titles.push('Region')
  }
  if (props.extended && props.zones.length) {
    titles.push(zoneTitle.value)
  }
  return titles.join(' / ')
})

</script>

<style lang="scss" scoped>
  :deep(.tooltip) {
    padding: 0;
  }
</style>
