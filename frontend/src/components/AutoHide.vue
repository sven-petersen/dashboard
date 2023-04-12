<!--
SPDX-FileCopyrightText: 2021 SAP SE or an SAP affiliate company and Gardener contributors

SPDX-License-Identifier: Apache-2.0
-->

<template>
  <div class="d-flex align-center justify-start flex-nowrap fill-height auto-hide-wrapper">
    <div class="auto-hide-slot">
      <slot v-if="props.left" />
    </div>
    <slot name="activator" />
    <div class="auto-hide-slot">
      <slot v-if="props.right" />
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  left: {
    type: Boolean,
  },
  right: {
    type: Boolean,
  },
})
</script>

<style lang="scss" scoped>
  .auto-hide-wrapper {
    &:hover {
      .auto-hide-slot {
        opacity: 1;
        &:after {
          opacity: 0;
        }
      }
    }
    .auto-hide-slot {
      opacity: 0;
    }
  }
</style>
