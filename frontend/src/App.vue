<!--
SPDX-FileCopyrightText: 2021 SAP SE or an SAP affiliate company and Gardener contributors

SPDX-License-Identifier: Apache-2.0
 -->
<template>
  <!-- <div class="hello">
    App.vue
  </div> -->
  <router-view />
</template>

<script setup>
  import { onMounted, inject } from 'vue'
  const bus = inject('bus')

  onMounted(() => {
    window.addEventListener('keyup', ({ key }) => {
      if (key === 'Escape' || key === 'Esc') {
        bus.emit('esc-pressed')
      }
    })
  })
</script>

<style scoped>
.hello {
  position: absolute;
  z-index: 999;
  top: 50%;
  left: 50%;
  background: red;
  color: black;
  padding: 5em;
}
</style>
