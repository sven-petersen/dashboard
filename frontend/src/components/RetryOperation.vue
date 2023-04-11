<!--
SPDX-FileCopyrightText: 2021 SAP SE or an SAP affiliate company and Gardener contributors

SPDX-License-Identifier: Apache-2.0
-->

<template>
  <v-tooltip
    v-if="canRetry"
    location="top"
  >
    <template #activator="{ props: tooltipProps }">
      <v-btn
        icon
        variant="text"
        class="text-primary"
        v-bind="tooltipProps"
        @click="onRetryOperation"
      >
        <v-icon>mdi-reload</v-icon>
      </v-btn>
      <div>
        shootGenerationValue: {{ shootGenerationValue }}
        shootName: {{ shootName }}
      </div>
    </template>
    Retry Operation
  </v-tooltip>
</template>

<script setup>
import { computed, toRef } from 'vue'
import { useStore } from 'vuex'
import { addShootAnnotation } from '@/utils/api'
import useShootItem from '@/composables/useShootItem'

const props = defineProps({
  retryingOperation: {
    type: Boolean,
    default: false,
  },
  shootItem: {
    type: Object,
    required: true,
  },
})

const store = useStore()

const {
  shootGenerationValue,
  shootObservedGeneration,
  shootLastOperation,
  isShootReconciliationDeactivated,
  shootNamespace,
  shootName,
} = useShootItem(toRef(props, 'shootItem'))

const canRetry = computed(() => {
  const reconcileScheduled = shootGenerationValue.value !== shootObservedGeneration.value && !!shootObservedGeneration.value
  return shootLastOperation.value?.state === 'Failed' &&
    !isShootReconciliationDeactivated.value &&
    !props.retryingOperation &&
    !reconcileScheduled
})

const onRetryOperation = async () => {
  props.retryingOperation = true

  const retryAnnotation = { 'gardener.cloud/operation': 'retry' }
  try {
    await addShootAnnotation({
      namespace: shootNamespace.value,
      name: shootName.value,
      data: retryAnnotation,
    })
  } catch (err) {
    // eslint-disable-next-line no-console
    console.log('failed to retry operation', err)

    store.dispatch('setError', err)
  }
  props.retryingOperation = false
}
</script>
