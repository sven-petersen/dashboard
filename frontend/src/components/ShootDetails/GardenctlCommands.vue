<!--
SPDX-FileCopyrightText: 2021 SAP SE or an SAP affiliate company and Gardener contributors

SPDX-License-Identifier: Apache-2.0
-->

<template>
  <v-list>
    <template
      v-for="({ title, subtitle, value, displayValue }, index) in commands"
      :key="title"
    >
      <v-list-item>
        <template #prepend>
          <v-icon
            color="primary"
          >
            {{ index === 0 ? 'mdi-console-line' : 'blank' }}
          </v-icon>
        </template>
        <v-list-item-title>{{ title }}</v-list-item-title>
        <v-list-item-subtitle>
          {{ subtitle }}
        </v-list-item-subtitle>

        <template #append>
          <gardenctl-info />
          <copy-btn :clipboard-text="value" />
          <v-tooltip location="top">
            <template #activator="slotProps">
              <v-btn
                icon
                variant="text"
                color="action-button"
                v-bind="slotProps.props"
                @click.stop="toggle(index)"
              >
                <v-icon>{{ visibilityIcon(index) }}</v-icon>
              </v-btn>
            </template>
            <span>{{ visibilityTitle(index) }}</span>
          </v-tooltip>
        </template>
      </v-list-item>
      <v-list-item
        v-if="expansionPanel[index]"
        :key="'expansion-' + title"
      >
        <template #prepend>
          <v-icon>
            blank
          </v-icon>
        </template>
        <code-block
          lang="shell"
          :content="displayValue"
          :show-copy-button="false"
        />
      </v-list-item>
    </template>
  </v-list>
</template>

<script setup>
import { toRef, ref, computed } from 'vue'
import CopyBtn from '@/components/CopyBtn.vue'
import CodeBlock from '@/components/CodeBlock.vue'
import GardenctlInfo from '@/components/GardenctlInfo.vue'
import { useStore } from 'vuex'
import useShootItem from '@/composables/useShootItem'

const store = useStore()

const props = defineProps({
  shootItem: {
    type: Object,
    required: true,
  },
})

const {
  shootName,
} = useShootItem(toRef(props, 'shootItem'))
const expansionPanel = ref([])
const cfg = computed(() => store.state.cfg)
const isAdmin = computed(() => store.getters.isAdmin)
const projectFromProjectList = computed(() => store.getters.projectFromProjectList)

const projectName = computed(() => {
  return projectFromProjectList.value?.metadata?.name
})
const commands = computed(() => {
  const displayValue = command => {
    return '$ ' + command
      .replace(/ --/g, ' \\\n    --')
  }

  const cmds = [
    {
      title: 'Target Cluster',
      subtitle: 'Gardenctl command to target the shoot cluster',
      value: targetShootCommand.value,
      displayValue: displayValue(targetShootCommand.value),
    },
  ]

  if (isAdmin.value) {
    cmds.unshift({
      title: 'Target Control Plane',
      subtitle: 'Gardenctl command to target the control plane of the shoot cluster',
      value: targetControlPlaneCommand.value,
      displayValue: displayValue(targetControlPlaneCommand.value),
    })
  }
  return cmds
})
const targetControlPlaneCommand = computed(() => {
  const args = []
  if (cfg.value.clusterIdentity) {
    args.push(`--garden ${cfg.value.clusterIdentity}`)
  }
  if (projectName.value) {
    args.push(`--project ${projectName.value}`)
  }
  if (shootName.value) {
    args.push(`--shoot ${shootName.value}`)
  }

  args.push('--control-plane')

  return `gardenctl target ${args.join(' ')}`
})
const targetShootCommand = computed(() => {
  const args = []
  if (cfg.value.clusterIdentity) {
    args.push(`--garden ${cfg.value.clusterIdentity}`)
  }
  if (projectName.value) {
    args.push(`--project ${projectName.value}`)
  }
  if (shootName.value) {
    args.push(`--shoot ${shootName.value}`)
  }

  return `gardenctl target ${args.join(' ')}`
})

const visibilityIcon = (index) => {
  return expansionPanel.value[index] ? 'mdi-eye-off' : 'mdi-eye'
}
const visibilityTitle = (index) => {
  return expansionPanel.value[index] ? 'Hide Command' : 'Show Command'
}
const toggle = (index) => {
  expansionPanel.value[index] = !expansionPanel.value[index]
}
</script>

<style scoped>
  :deep(.hljs-meta) {
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    -khtml-user-select: none;
    -moz-user-select: none;
    user-select: none;
  }
</style>
