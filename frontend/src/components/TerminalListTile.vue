<!--
SPDX-FileCopyrightText: 2021 SAP SE or an SAP affiliate company and Gardener contributors

SPDX-License-Identifier: Apache-2.0
-->

<template>
  <v-list-item
    title="Terminal"
    :description="description"
  >
    <template #prepend>
      <v-icon color="primary">
        mdi-console
      </v-icon>
    </template>
    <template #append>
      <v-tooltip location="top">
        <template #activator="slotProps">
          <div v-bind="slotProps.props">
            <v-btn
              icon
              variant="text"
              :to="to"
              :disabled="disabled"
              color="action-button"
            >
              <v-icon>mdi-console-line</v-icon>
            </v-btn>
          </div>
        </template>
        <span>{{ props.buttonDescription || props.description }}</span>
      </v-tooltip>
    </template>
  </v-list-item>
</template>

<script setup>
import { toRef, computed } from 'vue'
import useShootItem from '@/composables/useShootItem'

const props = defineProps({
  description: {
    type: String,
    required: true,
  },
  buttonDescription: {
    type: String,
    default: null,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  shootItem: {
    type: Object,
    required: true,
  },
})

const {
  shootNamespace,
  shootName,
} = useShootItem(toRef(props, 'shootItem'))

const to = computed(() => ({
  name: 'ShootItemTerminal',
  params: {
    namespace: shootNamespace,
    name: shootName,
  },
}
))
</script>
