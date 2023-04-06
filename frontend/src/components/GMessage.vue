<!--
SPDX-FileCopyrightText: 2021 SAP SE or an SAP affiliate company and Gardener contributors

SPDX-License-Identifier: Apache-2.0
-->

<template>
  <v-theme-provider :theme="defaultedTheme">
    <v-alert
      v-model="alertVisible"
      :color="color"
      :rounded="tile && '0'"
      closable
    >
      <div class="text-subtitle-1">
        {{ message }}
        <v-btn
          v-if="!!props.detailedMessage"
          variant="outlined"
          size="small"
          @click="detailedMessageVisible = !detailedMessageVisible"
        >
          Details
        </v-btn>
      </div>
      <transition name="fade">
        <div v-if="!!detailedMessageVisible">
          <code>{{ detailedMessage }}</code>
        </div>
      </transition>
    </v-alert>
  </v-theme-provider>
</template>

<script setup>
import { ref, computed, inject } from 'vue'

const { theme } = inject('vuetify')

const props = defineProps({
  message: {
    type: String,
    default: '',
  },
  detailedMessage: {
    type: String,
    default: '',
  },
  color: {
    type: String,
    required: true,
  },
  tile: {
    type: Boolean,
  },
  dark: {
    type: Boolean,
    default: null,
  },
})

const emits = defineEmits([
  'update:message',
  'update:detailed-message',
])

const detailedMessageVisible = ref(false)

const alertVisible = computed({
  get: () => !!props.message,
  set: (value) => {
    if (!value) return
    emits('update:message', undefined)
    emits('update:detailed-message', undefined)
  },
})

const defaultedTheme = computed(() => {
  if (props.dark !== null) {
    return props.dark ? 'dark' : 'light'
  }
  return theme.name.value
})
</script>

<style lang="scss" scoped>
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity .5s;
  }
  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }
</style>
