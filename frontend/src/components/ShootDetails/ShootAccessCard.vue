<!--
SPDX-FileCopyrightText: 2021 SAP SE or an SAP affiliate company and Gardener contributors

SPDX-License-Identifier: Apache-2.0
-->

<template>
  <v-list key="accessCardList">
    <v-list-item
      v-show="!isAnyTileVisible"
      title="Access information currently not available"
    >
      <template #prepend>
        <v-icon color="primary">
          mdi-alert-circle-outline
        </v-icon>
      </template>
    </v-list-item>

    <terminal-list-tile
      v-if="isTerminalTileVisible"
      :shoot-item="props.shootItem"
      target="shoot"
      :description="shootTerminalDescription"
      :button-description="shootTerminalButtonDescription"
      :disabled="shootTerminalButtonDisabled"
    />

    <v-divider
      v-if="isTerminalTileVisible && (isTerminalShortcutsTileVisible || isDashboardTileVisible || isCredentialsTileVisible || isKubeconfigTileVisible || isGardenctlTileVisible)"
      inset
    />

    <terminal-shortcuts-tile
      v-if="isTerminalShortcutsTileVisible"
      :shoot-item="props.shootItem"
      popper-boundaries-selector="#accessCardList"
      class="mt-3"
      @add-terminal-shortcut="onAddTerminalShortcut"
    />

    <v-divider
      v-if="isTerminalShortcutsTileVisible && (isDashboardTileVisible || isCredentialsTileVisible || isKubeconfigTileVisible || isGardenctlTileVisible)"
      inset
    />

    <!-- TODO: -->
    <!-- v-if="isDashboardTileVisible && !hasDashboardTokenAuth" -->
    <!-- <link-list-tile
      icon="mdi-developer-board"
      app-title="Dashboard"
      :url="dashboardUrl"
      :url-text="dashboardUrlText"
      :is-shoot-status-hibernated="isShootStatusHibernated"
    /> -->

    <template v-if="isDashboardTileVisible && hasDashboardTokenAuth">
      <v-list-item>
        <template #prepend>
          <v-icon color="primary">
            mdi-developer-board
          </v-icon>
        </template>

        <v-list-item-subtitle>Dashboard</v-list-item-subtitle>
        <v-list-item-subtitle class="text-caption wrap-text py-2">
          Access Dashboard using the kubectl command-line tool by running the following command:
          <code>kubectl proxy</code>.
          Kubectl will make Dashboard available at:
        </v-list-item-subtitle>
        <v-list-item-title>
          <v-tooltip
            v-if="isShootStatusHibernated"
            location="top"
          >
            <template #activator="slotProps">
              <span
                class="text-grey"
                v-bind="slotProps.props"
              >{{ dashboardUrlText }}</span>
            </template>
            Dashboard is not running for hibernated clusters
          </v-tooltip>
          <a
            v-else
            :href="dashboardUrl"
            target="_blank"
            rel="noopener"
          >{{ dashboardUrlText }}</a>
        </v-list-item-title>
      </v-list-item>

      <v-list-item v-if="token">
        <template #prepend>
          <v-icon color="primary">
            blank
          </v-icon>
        </template>

        <v-list-item-subtitle>Token</v-list-item-subtitle>

        <v-list-item-title class="pt-1">
          <pre class="scroll">{{ tokenText }}</pre>
        </v-list-item-title>

        <template #append>
          <copy-btn :clipboard-text="token" />
          <v-tooltip location="top">
            <template #activator="slotProps">
              <v-btn
                icon
                color="action-button"
                v-bind="slotProps.props"
                @click.stop="showToken = !showToken"
              >
                <v-icon>{{ visibilityIcon }}</v-icon>
              </v-btn>
            </template>
            <span>{{ tokenVisibilityTitle }}</span>
          </v-tooltip>
        </template>
      </v-list-item>
    </template>

    <v-divider
      v-if="isDashboardTileVisible && (isCredentialsTileVisible || isKubeconfigTileVisible || isGardenctlTileVisible)"
      inset
    />

    <username-password
      v-if="isCredentialsTileVisible"
      :username="username"
      :password="password"
    />

    <v-divider
      v-if="isCredentialsTileVisible && (isKubeconfigTileVisible || isGardenctlTileVisible)"
      inset
    />

    <v-list v-if="isKubeconfigTileVisible">
      <shoot-kubeconfig
        :shoot-item="props.shootItem"
        :show-icon="true"
        type="gardenlogin"
      />
      <shoot-kubeconfig
        :shoot-item="props.shootItem"
        :show-icon="false"
        type="token"
      />
    </v-list>

    <v-divider
      v-if="isKubeconfigTileVisible && isGardenctlTileVisible"
      inset
    />

    <gardenctl-commands
      v-if="isGardenctlTileVisible"
      :shoot-item="props.shootItem"
    />
  </v-list>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useStore } from 'vuex'
import UsernamePassword from '@/components/UsernamePasswordListTile.vue'
import CopyBtn from '@/components/CopyBtn.vue'
import TerminalListTile from '@/components/TerminalListTile.vue'
import TerminalShortcutsTile from '@/components/ShootDetails/TerminalShortcutsTile.vue'
import ShootKubeconfig from '@/components/ShootDetails/ShootKubeconfig.vue'
import GardenctlCommands from '@/components/ShootDetails/GardenctlCommands.vue'
import LinkListTile from '@/components/LinkListTile.vue'
import isEmpty from 'lodash/isEmpty'
import useShootItem from '@/composables/useShootItem'

const props = defineProps({
  hideTerminalShortcuts: {
    type: Boolean,
    default: false,
  },
  shootItem: {
    type: Object,
    required: true,
  },
})

const emits = defineEmits(['add-terminal-shortcut'])

const store = useStore()
const showToken = ref(false)

const {
  isSeedUnreachable,
  isShootStatusHibernated,
  shootInfo,
} = useShootItem(props.shootItem)
const hasShootTerminalAccess = computed(() => store.getters.hasShootTerminalAccess)
const isAdmin = computed(() => store.getters.isAdmin)
const canCreateShootsAdminkubeconfig = computed(() => store.getters.canCreateShootsAdminkubeconfig)
const hasControlPlaneTerminalAccess = computed(() => store.getters.hasControlPlaneTerminalAccess)
const isTerminalShortcutsFeatureEnabled = computed(() => store.getters.isTerminalShortcutsFeatureEnabled)
const canPatchShoots = computed(() => store.getters.canPatchShoots)

const hasDashboardEnabled = computed(() => {
  return props.shootItem.spec?.addons?.kubernetesDashboard?.enabled === true
})
const hasDashboardTokenAuth = computed(() => {
  return props.shootItem.spec?.addons?.kubernetesDashboard?.authenticationMode === 'token'
})
const dashboardUrl = computed(() => {
  if (!hasDashboardEnabled.value) {
    return ''
  }
  if (!hasDashboardTokenAuth.value) {
    return shootInfo.value.dashboardUrl || ''
  }

  if (!shootInfo.value.dashboardUrlPath) {
    return ''
  }
  const pathname = shootInfo.value.dashboardUrlPath
  return `http://localhost:8001${pathname}`
})

const dashboardUrlText = computed(() => {
  if (hasDashboardTokenAuth?.value) {
    return dashboardUrl.value
  }
  return shootInfo.value?.dashboardUrlText || ''
})
const username = computed(() => shootInfo.value.cluster_username || '')
const password = computed(() => shootInfo.value.cluster_password || '')
const kubeconfigGardenlogin = computed(() => shootInfo.value?.kubeconfigGardenlogin)
const shootTerminalButtonDisabled = computed(() => !isAdmin.value && isShootStatusHibernated.value)
const shootTerminalButtonDescription = computed(() => {
  if (shootTerminalButtonDisabled.value) {
    return 'Cluster is hibernated. Wake up cluster to open terminal.'
  }
  return shootTerminalDescription.value
})
const shootTerminalDescription = computed(() => {
  return hasControlPlaneTerminalAccess.value ? 'Open terminal into cluster or cluster\'s control plane' : 'Open terminal into cluster'
})
const isAnyTileVisible = computed(() => {
  return (
    isDashboardTileVisible.value ||
    isCredentialsTileVisible.value ||
    isKubeconfigTileVisible.value ||
    isTerminalTileVisible.value
  )
})
const isDashboardTileVisible = computed(() => !!dashboardUrl.value)
const isCredentialsTileVisible = computed(() => !!username.value && !!password.value)
const isKubeconfigTileVisible = computed(() => !!kubeconfigGardenlogin.value || canPatchShoots.value)
const isGardenctlTileVisible = computed(() => canCreateShootsAdminkubeconfig.value)
const isTerminalTileVisible = computed(() => {
  return !isEmpty(props.shootItem) && hasShootTerminalAccess.value && !isSeedUnreachable.value
})
const isTerminalShortcutsTileVisible = computed(() => {
  return (
    !isEmpty(props.shootItem) &&
    isTerminalShortcutsFeatureEnabled.value &&
    hasShootTerminalAccess.value &&
    !props.hideTerminalShortcuts &&
    !isSeedUnreachable.value
  )
})
const token = computed(() => shootInfo.value.cluster_token || '')
const tokenText = computed(() => showToken.value ? token.value : '****************')
const tokenVisibilityTitle = computed(() => showToken.value ? 'Hide token' : 'Show token')
const visibilityIcon = computed(() => showToken.value ? 'mdi-eye-off' : 'mdi-eye')

const onAddTerminalShortcut = (shortcut) => {
  emits('add-terminal-shortcut', shortcut)
}
</script>

<style lang="scss" scoped>
  .scroll {
    overflow-x: auto;
  }

  .wrap-text {
    line-height: inherit;
    overflow: auto !important;
    white-space: normal !important;
    code {
      box-shadow: none !important;
      padding: 1px;
      color: black;
    }
  }

</style>
