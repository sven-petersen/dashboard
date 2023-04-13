<!--
SPDX-FileCopyrightText: 2021 SAP SE or an SAP affiliate company and Gardener contributors

SPDX-License-Identifier: Apache-2.0
-->

<template>
  <action-button-dialog
    ref="actionDialog"
    :shoot-item="shootItem"
    width="500"
    confirm-required
    caption="Configure Static Token Kubeconfig"
    @dialog-opened="onConfigurationDialogOpened"
  >
    <template #actionComponent>
      <static-token-kubeconfig-switch
        v-model="enableStaticTokenKubeconfig"
      />
    </template>
  </action-button-dialog>
</template>

<script setup>
import { ref, toRef } from 'vue'
import ActionButtonDialog from '@/components/dialogs/ActionButtonDialog.vue'
import StaticTokenKubeconfigSwitch from '@/components/StaticTokenKubeconfigSwitch.vue'
import { updateShootEnableStaticTokenKubeconfig } from '@/utils/api'
import { errorDetailsFromError } from '@/utils/error'
import useShootItem from '@/composables/useShootItem'

const props = defineProps({
  shootItem: {
    type: Object,
    required: true,
  },
})

const {
  shootEnableStaticTokenKubeconfig,
  shootNamespace,
  shootName,
} = useShootItem(toRef(props, 'shootItem'))
const enableStaticTokenKubeconfig = ref(shootEnableStaticTokenKubeconfig.value)
const actionDialog = ref()

const reset = () => {
  enableStaticTokenKubeconfig.value = shootEnableStaticTokenKubeconfig.value
}

const updateConfiguration = async () => {
  try {
    await updateShootEnableStaticTokenKubeconfig({
      namespace: shootNamespace.value,
      name: shootName.value,
      data: {
        enableStaticTokenKubeconfig: enableStaticTokenKubeconfig.value,
      },
    })
  } catch (err) {
    const errorMessage = 'Could not update static kubeconfig flag'
    const errorDetails = errorDetailsFromError(err)
    const detailedErrorMessage = errorDetails.detailedMessage
    actionDialog.value.setError({ errorMessage, detailedErrorMessage })
    console.error(errorMessage, errorDetails.errorCode, errorDetails.detailedMessage, err)
  }
}

const onConfigurationDialogOpened = async () => {
  reset()
  const confirmed = await actionDialog.value?.waitForDialogClosed()
  if (confirmed) {
    await updateConfiguration()
  }
}
</script>
