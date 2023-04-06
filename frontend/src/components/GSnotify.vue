<!--
SPDX-FileCopyrightText: 2021 SAP SE or an SAP affiliate company and Gardener contributors

SPDX-License-Identifier: Apache-2.0
-->

<!-- TODO: previous implementation used vue-snotify which supported displaying multiple
      toasts at once (stacked). This solution only displays the most recent one. While that is in
      in line with the Material Design guidelines this might be sup-optimal.
-->

<template>
  <div class="text-center ma-2">
    <v-snackbar
      v-model="state.active"
      :color="state.color"
      :timeout="state.timeout"
      location="bottom right"
    >
      <div
        v-if="title"
        class="text-subtitle-1 pb-1"
      >
        {{ state.title }}
      </div>
      <p>{{ state.message }}</p>
      <template #actions>
        <v-btn
          variant="text"
          @click="state.active = false"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script setup>
import { reactive, computed, watch } from 'vue'
import { useStore } from 'vuex'

const state = reactive({
  active: false,
  color: null,
  timeout: null,
  message: null,
  title: null,
})

const store = useStore()

const alert = computed(() => store.getters.alert)
const unsetAlert = () => store.dispatch('setAlert', null)

const showToast = ({ message, type, title }) => {
  state.title = title
  state.message = message
  state.timeout = type === 'success' ? 3000 : 5000
  state.color = ['success', 'warning', 'error'].includes(type) ? type : 'info'
  state.active = true
}

watch(alert, (value) => {
  if (value) {
    showToast(value)
    unsetAlert()
  }
})
</script>
