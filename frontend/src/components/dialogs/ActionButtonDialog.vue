<!--
SPDX-FileCopyrightText: 2021 SAP SE or an SAP affiliate company and Gardener contributors

SPDX-License-Identifier: Apache-2.0
 -->

<template>
  <div v-if="canPatchShoots">
    <v-tooltip
      location="top"
      max-width="600px"
      :disabled="disableToolTip"
    >
      <template #activator="slotProps">
        <div v-bind="slotProps.props">
          <v-btn
            :icon="isIconButton"
            :variant="buttonVariant"
            :size="smallIcon ? 'small' : undefined"
            :color="iconColor"
            :loading="loading"
            :disabled="isShootMarkedForDeletion || isShootActionsDisabledForPurpose || disabled"
            :width="buttonWidth"
            class="text-none font-weight-regular pa-0"
            @click="showDialog"
          >
            <div>
              <v-icon>
                {{ icon }}
              </v-icon>
            </div>
            <div
              v-if="isTextButton"
              class="ml-3 d-flex flex-grow-1"
            >
              {{ buttonText }}
            </div>
          </v-btn>
        </div>
      </template>
      {{ actionToolTip }}
    </v-tooltip>
    <GDialog
      ref="gDialog"
      v-model:error-message="errorMessage"
      v-model:detailed-error-message="detailedErrorMessage"
      :confirm-button-text="confirmButtonText"
      :confirm-disabled="!valid"
      :width="width"
      :max-height="maxHeight"
      :confirm-value="confirmValue"
      :disable-confirm-input-focus="disableConfirmInputFocus"
    >
      <template #caption>
        {{ caption }}
      </template>
      <template #affectedObjectName>
        {{ shootName }}
      </template>
      <template #top>
        <slot name="top" />
      </template>
      <template #card>
        <slot name="card" />
      </template>
      <template #message>
        <slot name="actionComponent" />
      </template>
      <template #errorMessage>
        <slot name="errorMessage" />
      </template>
    </GDialog>
  </div>
  <div
    v-else
    style="width: 36px"
  />
</template>

<script setup>
import { ref, toRef, computed, nextTick } from 'vue'
import { useStore } from 'vuex'
import useShootItem from '@/composables/useShootItem'
import GDialog from '@/components/dialogs/GDialog.vue'

const store = useStore()

const props = defineProps({
  icon: {
    type: String,
    default: 'mdi-cog-outline',
  },
  caption: {
    type: String,
    default: null,
  },
  tooltip: {
    type: String,
    default: null,
  },
  confirmButtonText: {
    type: String,
    default: 'Save',
  },
  confirmRequired: {
    type: Boolean,
    default: false,
  },
  valid: {
    type: Boolean,
    default: true,
  },
  width: {
    type: String,
    default: null,
  },
  maxHeight: {
    type: String,
    default: '50vh',
  },
  loading: {
    type: Boolean,
  },
  iconColor: {
    type: String,
    default: 'action-button',
  },
  smallIcon: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  disableConfirmInputFocus: {
    type: Boolean,
  },
  buttonText: {
    type: String,
    default: null,
  },
  buttonVariant: {
    type: String,
    default: 'text',
  },
  shootItem: {
    type: Object,
    required: true,
  },
})

const emits = defineEmits(['dialog-opened'])

const errorMessage = ref()
const detailedErrorMessage = ref()
const gDialog = ref()
const {
  shootName,
  shootActionToolTip,
} = useShootItem(toRef(props, 'shootItem'))

const confirmValue = computed(() => props.confirmRequired ? shootName.value : undefined)
const isIconButton = computed(() => !props.buttonText)
const isTextButton = computed(() => !!props.buttonText)
const buttonWidth = computed(() => props.buttonText ? '100%' : undefined)
const actionToolTip = computed(() => props.tooltip || shootActionToolTip(props.caption))
const disableToolTip = computed(() => props.buttonText === actionToolTip.value)
const canPatchShoots = computed(() => store.getters.canPatchShoots)

const showDialog = (resetError = true) => {
  if (resetError) {
    errorMessage.value = undefined
    detailedErrorMessage.value = undefined
  }
  gDialog.value.showDialog()
  nextTick(() => {
    // need to defer event until dialog has been rendered
    emits('dialog-opened')
  })
}
const waitForDialogClosed = async () => {
  return gDialog.value.confirmWithDialog()
}
const hideDialog = () => {
  gDialog.value?.hideDialog()
}
const setError = (err) => {
  errorMessage.value = err.errorMessage
  detailedErrorMessage.value = err.detailedErrorMessage

  showDialog(false)
}

defineExpose({
  waitForDialogClosed,
  showDialog,
  hideDialog,
  setError,
})
</script>
