<!--
SPDX-FileCopyrightText: 2021 SAP SE or an SAP affiliate company and Gardener contributors

SPDX-License-Identifier: Apache-2.0
-->

<template>
  <div>
    <v-list-item
      title="Terminal Shortcuts"
      subtitle="Launch preconfigured terminals for frequently used views"
    >
      <template #prepend>
        <icon-base
          class="icon"
          width="24"
          height="23"
          icon-color="primary"
          view-box="-4 0 56 54"
        >
          <terminal-shortcut-icon />
        </icon-base>
      </template>

      <template #append>
        <v-tooltip location="top">
          <template #activator="slotProps">
            <v-btn
              color="action-button"
              icon
              variant="text"
              v-bind="slotProps.props"
              @click.stop="expansionPanel = !expansionPanel"
            >
              <v-icon>{{ expansionPanelIcon }}</v-icon>
            </v-btn>
          </template>
          <span>{{ expansionPanelTooltip }}</span>
        </v-tooltip>
      </template>
    </v-list-item>
    <v-expand-transition appear>
      <v-card
        v-if="expansionPanel"
        flat
        class="ml-16 mt-2 mr-1"
      >
        <v-card-text class="pa-0">
          <terminal-shortcuts
            :shoot-item="shootItem"
            :popper-boundaries-selector="props.popperBoundariesSelector"
            @add-terminal-shortcut="onAddTerminalShortcut"
          />
        </v-card-text>
      </v-card>
    </v-expand-transition>
    <unverified-terminal-shortcuts-dialog
      ref="unverified"
    />
    <webterminal-service-account-dialog
      ref="serviceAccount"
      :namespace="shootNamespace"
    />
  </div>
</template>

<script setup>
import { toRef, computed, ref } from 'vue'
import { useStore } from 'vuex'
import TerminalShortcuts from '@/components/TerminalShortcuts.vue'
import IconBase from '@/components/icons/IconBase.vue'
import TerminalShortcutIcon from '@/components/icons/TerminalShortcutIcon.vue'
import UnverifiedTerminalShortcutsDialog from '@/components/dialogs/UnverifiedTerminalShortcutsDialog.vue'
import WebterminalServiceAccountDialog from '@/components/dialogs/WebterminalServiceAccountDialog.vue'
import { TargetEnum } from '@/utils'
import { getMembers } from '@/utils/api'
import includes from 'lodash/includes'
import useShootItem from '@/composables/useShootItem'

const props = defineProps({
  popperBoundariesSelector: {
    type: String,
    default: undefined,
  },
  shootItem: {
    type: Object,
    required: true,
  },
})

const emits = defineEmits(['add-terminal-shortcut'])

const {
  shootNamespace,
} = useShootItem(toRef(props, 'shootItem'))
const store = useStore()

const expansionPanel = ref(false)
const serviceAccount = ref()

const isAdmin = computed(() => store.getters.isAdmin)
const expansionPanelIcon = computed(() => {
  return expansionPanel.value ? 'mdi-chevron-up' : 'mdi-chevron-down'
})
const expansionPanelTooltip = computed(() => {
  return expansionPanel.value ? 'Hide terminal shortcuts' : 'Show terminal shortcuts'
})

const onAddTerminalShortcut = async (shortcut) => {
  if (shortcut.unverified) {
    const confirmation = await this.$refs.unverified.promptForConfirmation()
    if (!confirmation) {
      return
    }
  }

  const isGardenTarget = shortcut.target === TargetEnum.GARDEN
  if (!isAdmin.value && isGardenTarget) {
    const { data: projectMembers } = await getMembers({ namespace: shootNamespace })
    const serviceAccountName = `system:serviceaccount:${shootNamespace}:dashboard-webterminal`
    const member = projectMembers.find(({ username }) => username === serviceAccountName)
    const roles = member.roles
    if (!includes(roles, 'admin')) {
      const confirmation = await serviceAccount.value.promptForConfirmation(member)
      if (!confirmation) {
        return
      }
    }
  }

  emits('add-terminal-shortcut', shortcut)
}
</script>

<style lang="scss" scoped>
.icon {
  margin-inline-end: 32px;
}
</style>
