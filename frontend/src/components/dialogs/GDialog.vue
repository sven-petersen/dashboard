<!--
SPDX-FileCopyrightText: 2021 SAP SE or an SAP affiliate company and Gardener contributors

SPDX-License-Identifier: Apache-2.0
 -->

<template>
  <v-dialog
    v-model="visible"
    scrollable
    persistent
    :width="width"
    max-width="90vw"
  >
    <v-card>
      <v-toolbar
        flat
        color="primary"
        class="toolbar-background toolbar-title--text"
      >
        <v-toolbar-title class="dialog-title align-center justify-start">
          <slot name="caption">
            Confirm Dialog
          </slot>
          <template v-if="$slots.affectedObjectName">
            &nbsp;
            <span class="font-family-monospace font-weight-bold"><slot name="affectedObjectName" /></span>
          </template>
        </v-toolbar-title>
      </v-toolbar>
      <slot name="top" />
      <div
        ref="cardContent"
        :style="{ 'max-height': maxHeight }"
        class="card-content"
      >
        <slot name="card" />
        <v-card-text v-if="$slots.message">
          <slot name="message" />
        </v-card-text>
      </div>
      <slot name="errorMessage" />
      <g-message
        v-model:message="message"
        v-model:detailed-message="detailedMessage"
        color="error"
        class="mt-4"
      />
      <v-divider />
      <v-card-actions>
        <v-spacer />
        <v-text-field
          v-if="confirmValue && !confirmDisabled"
          ref="deleteDialogInput"
          v-model="userInput"
          class="mr-2 confirm-input"
          :label="hint"
          :error="notConfirmed && userInput.length > 0"
          hide-details
          type="text"
          variant="outlined"
          color="primary"
          dense
          @keyup.enter="resolveAction(true)"
        />
        <v-btn
          v-if="cancelButtonText.length"
          variant="text"
          @click="resolveAction(false)"
        >
          {{ cancelButtonText }}
        </v-btn>
        <v-tooltip
          location="top"
          :disabled="valid"
        >
          <template #activator="slotProps">
            <div v-bind="slotProps.props">
              <v-btn
                variant="text"
                :disabled="!valid"
                class="toolbar-background--text"
                @click="resolveAction(true)"
              >
                {{ confirmButtonText }}
              </v-btn>
            </div>
          </template>
          <span v-if="confirmDisabled">There are input errors that you need to resolve</span>
          <span v-else-if="notConfirmed">You need to confirm your changes by typing this cluster's name</span>
        </v-tooltip>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { setDelayedInputFocus } from '@/utils'
import GMessage from '@/components/GMessage.vue'
import noop from 'lodash/noop'
import isFunction from 'lodash/isFunction'

const props = defineProps({
  confirmValue: {
    type: String,
    default: null,
  },
  confirmDisabled: {
    type: Boolean,
    default: false,
  },
  errorMessage: {
    type: String,
    default: null,
  },
  detailedErrorMessage: {
    type: String,
    default: null,
  },
  confirmButtonText: {
    type: String,
    default: 'Confirm',
  },
  cancelButtonText: {
    type: String,
    default: 'Cancel',
  },
  width: {
    type: String,
    default: '500',
  },
  maxHeight: {
    type: String,
    default: '50vh',
  },
  disableConfirmInputFocus: {
    type: Boolean,
  },
})

const emits = defineEmits([
  'dialog-closed',
  'update:error-message',
  'update:detailed-error-message',
])

const userInput = ref('')
const visible = ref(false)
const resolve = ref(noop)
const cardContent = ref()
const deleteDialogInput = ref()

const notConfirmed = computed(() => {
  return props.confirmValue && props.confirmValue !== userInput.value
})
const hint = computed(() => {
  if (userInput.value.length === 0) {
    return `Type ${props.confirmValue} to confirm`
  } else if (userInput.value !== props.confirmValue) {
    return `Input does not match ${props.confirmValue}`
  }
  return ''
})
const message = computed({
  get () {
    return props.errorMessage
  },
  set (value) {
    emits('update:error-message', value)
  },
})
const detailedMessage = computed({
  get () {
    return props.detailedErrorMessage
  },
  set (value) {
    emits('update:detailed-error-message', value)
  },
})
const valid = computed(() => {
  return !props.confirmDisabled && !notConfirmed.value
})

watch(() => visible.value, (value) => {
  if (value) {
    showScrollBar()
  }
})

let confirmationInterceptor

const confirmWithDialog = (newConfirmationInterceptor) => {
  showDialog()
  userInput.value = ''
  confirmationInterceptor = newConfirmationInterceptor

  // we must delay the "focus" handling because the dialog.open is animated
  // and the 'autofocus' property didn't work in this case.
  if (!props.disableConfirmInputFocus) {
    setDelayedInputFocus(deleteDialogInput)
  }

  // eslint-disable-next-line promise/param-names
  return new Promise(r => {
    resolve.value = r
  })
}
const hideDialog = () => {
  visible.value = false
}
const showDialog = () => {
  visible.value = true
}
const resolveAction = async (value) => {
  if (value && !valid.value) {
    return
  }

  if (isFunction(resolve.value)) {
    if (value) {
      if (confirmationInterceptor) {
        const confirmed = await confirmationInterceptor()
        if (!confirmed) {
          // cancel resolve action
          return
        }
      }
    }
    const r = resolve.value
    resolve.value = undefined
    r(value)
  }
  emits('dialog-closed', value)
  visible.value = false
}
const showScrollBar = (retryCount = 0) => {
  if (!visible.value || retryCount > 10) {
    // circuit breaker
    return
  }
  if (!cardContent.value?.clientHeight) {
    nextTick(() => showScrollBar(retryCount + 1))
    return
  }
  const scrollTopVal = cardContent.value.scrollTop
  cardContent.value.scrollTop = scrollTopVal + 10
  cardContent.value.scrollTop = scrollTopVal - 10
}

defineExpose({
  confirmWithDialog,
  showDialog,
  hideDialog,
})
</script>

<style lang="scss" scoped>
  .confirm-input {
    width: 18em;
  }

  .card-content {
    overflow: scroll;
  }
</style>
