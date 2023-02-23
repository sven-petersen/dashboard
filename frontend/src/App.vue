<!--
SPDX-FileCopyrightText: 2021 SAP SE or an SAP affiliate company and Gardener contributors

SPDX-License-Identifier: Apache-2.0
 -->
<template>
  <div class="hello">
    App.vue
  </div>
  <router-view />
</template>

<script setup>
  import { onMounted } from 'vue'

  onMounted(() => {
    window.addEventListener('keyup', ({ key }) => {
      if (key === 'Escape' || key === 'Esc') {
        this.$bus.emit('esc-pressed')
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
