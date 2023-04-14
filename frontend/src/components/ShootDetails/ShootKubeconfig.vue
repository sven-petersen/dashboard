<!--
SPDX-FileCopyrightText: 2023 SAP SE or an SAP affiliate company and Gardener contributors

SPDX-License-Identifier: Apache-2.0
-->

<template>
  <div>
    <v-list-item>
      <template #prepend>
        <v-icon color="primary">
          {{ icon }}
        </v-icon>
      </template>
      <template v-if="isGardenloginType">
        <v-list-item-title>
          Kubeconfig - Gardenlogin
        </v-list-item-title>
        <v-list-item-subtitle
          v-if="isKubeconfigAvailable"
          class="wrap-text"
        >
          Does not contain credentials (requires <span class="font-family-monospace">gardenlogin</span> kubectl plugin)
        </v-list-item-subtitle>
        <v-list-item-subtitle v-else>
          Gardenlogin kubeconfig currently not available
        </v-list-item-subtitle>
      </template>
      <template v-else>
        <v-list-item-title>Kubeconfig - Static Token</v-list-item-title>
        <v-list-item-subtitle v-if="!shootEnableStaticTokenKubeconfig">
          Static token kubeconfig is disabled for this cluster
        </v-list-item-subtitle>
        <v-list-item-subtitle v-else-if="!isKubeconfigAvailable">
          Static token kubeconfig currently not available
        </v-list-item-subtitle>
        <v-list-item-subtitle
          v-else
          class="wrap-text"
        >
          Contains static token credential. Not recommended, consider disabling the static token kubeconfig
        </v-list-item-subtitle>
      </template>

      <template #append>
        <gardenlogin-info v-if="isGardenloginType" />
        <v-tooltip
          v-if="isKubeconfigAvailable"
          location="top"
        >
          <template #activator="slotProps">
            <v-btn
              icon
              variant="text"
              color="action-button"
              v-bind="slotProps.props"
              @click.stop="onDownload"
            >
              <v-icon>mdi-download</v-icon>
            </v-btn>
          </template>
          <span>Download Kubeconfig</span>
        </v-tooltip>
        <copy-btn
          v-if="isKubeconfigAvailable"
          :clipboard-text="kubeconfig"
        />
        <v-tooltip
          v-if="isKubeconfigAvailable"
          location="top"
        >
          <template #activator="slotProps">
            <v-btn
              icon
              variant="text"
              color="action-button"
              v-bind="slotProps.props"
              @click.stop="toggleKubeconfig"
            >
              <v-icon>{{ kubeconfigVisibilityIcon }}</v-icon>
            </v-btn>
          </template>
          <span>{{ kubeconfigVisibilityTitle }}</span>
        </v-tooltip>
        <static-token-kubeconfig-configuration
          v-if="!isGardenloginType"
          :shoot-item="shootItem"
        />
      </template>
    </v-list-item>
    <v-list-item
      v-if="kubeconfigExpansionPanel"
      key="expansion-gardenlogin-kubeconfig"
    >
      <template #prepend>
        <v-icon color="primary">
          blank
        </v-icon>
      </template>
      <code-block
        lang="yaml"
        :content="kubeconfig"
        :show-copy-button="false"
      />
    </v-list-item>
  </div>
</template>

<script setup>
import { computed, ref, toRef, watch } from 'vue'
import CopyBtn from '@/components/CopyBtn.vue'
import CodeBlock from '@/components/CodeBlock.vue'
import GardenloginInfo from '@/components/GardenloginInfo.vue'
import StaticTokenKubeconfigConfiguration from '@/components/StaticTokenKubeconfigConfiguration.vue'
import download from 'downloadjs'
import useShootItem from '@/composables/useShootItem'

const props = defineProps({
  showListIcon: {
    type: Boolean,
    default: false,
  },
  type: {
    type: String,
    default: 'gardenlogin',
  },
  shootItem: {
    type: Object,
    required: true,
  },
})

const kubeconfigExpansionPanel = ref(false)
const {
  shootProjectName,
  shootName,
  shootInfo,
  shootEnableStaticTokenKubeconfig,
} = useShootItem(toRef(props, 'shootItem'))

const icon = computed(() => props.showListIcon ? 'mdi-file' : '')
const kubeconfig = computed(() => {
  const foo = props.shootItem
  return isGardenloginType.value
    ? shootInfo.value?.kubeconfigGardenlogin
    : shootInfo.value?.kubeconfig
})
const isKubeconfigAvailable = computed(() => !!kubeconfig.value)
const kubeconfigVisibilityIcon = computed(() => kubeconfigExpansionPanel.value ? 'mdi-eye-off' : 'mdi-eye')
const kubeconfigVisibilityTitle = computed(() => {
  return kubeconfigExpansionPanel.value ? 'Hide Kubeconfig' : 'Show Kubeconfig'
})
const isGardenloginType = computed(() => props.type === 'gardenlogin')
const getQualifiedName = computed(() => {
  const prefix = isGardenloginType.value ? 'kubeconfig-gardenlogin' : 'kubeconfig'
  return `${prefix}--${shootProjectName.value}--${shootName.value}.yaml`
})

const toggleKubeconfig = () => {
  kubeconfigExpansionPanel.value = !kubeconfigExpansionPanel.value
}
const reset = () => {
  kubeconfigExpansionPanel.value = false
}
const onDownload = () => {
  if (kubeconfig.value) {
    download(kubeconfig.value, getQualifiedName.value, 'text/yaml')
  }
}

watch(() => kubeconfig.value, reset)
</script>
