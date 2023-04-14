<!--
SPDX-FileCopyrightText: 2021 SAP SE or an SAP affiliate company and Gardener contributors

SPDX-License-Identifier: Apache-2.0
-->

<template>
  <div>
    <v-list-item
      :value="shortcut"
      :disabled="disabled"
    >
      <template
        v-if="!hideIconSlot"
        #prepend
      >
        <span class="icon">
          <slot
            name="icon"
          />

        </span>
      </template>

      <v-list-item-title>
        {{ shortcut.title }}
        <v-tooltip
          v-if="isUnverified"
          location="top"
          max-width="400px"
        >
          <template #activator="slotProps">
            <v-chip
              size="x-small"
              class="my-0 ml-2 enablePointerEvents"
              variant="outlined"
              color="warning"
              v-bind="slotProps.props"
            >
              Unverified
            </v-chip>
          </template>
          This terminal shortcut was created by a member of this project and is not verified by the landscape administrator and therefore could be malicious
        </v-tooltip>
      </v-list-item-title>
      <v-list-item-subtitle
        v-if="shortcut.description"
        class="py-1 wrap-text"
      >
        {{ shortcut.description }}
      </v-list-item-subtitle>

      <template
        v-if="!readOnly"
        #append
      >
        <v-tooltip location="top">
          <template #activator="slotProps">
            <div v-bind="slotProps.props">
              <v-btn
                icon
                variant="text"
                :disabled="disabled"
                class="enablePointerEvents"
                color="action-button"
                @click.stop="addTerminalShortcut(shortcut)"
              >
                <v-icon>mdi-console-line</v-icon>
              </v-btn>
            </div>
          </template>
          <span v-if="!disabled">
            Create '<span class="font-family-monospace">{{ shortcut.title }}</span>' terminal session
          </span>
          <span v-else>
            Cluster is hibernated. Wake up cluster to open terminal
          </span>
        </v-tooltip>
        <v-tooltip location="top">
          <template #activator="slotProps">
            <v-btn
              icon
              variant="text"
              class="enablePointerEvents"
              color="action-button"
              v-bind="slotProps.props"
              @click.stop="expansionPanel = !expansionPanel"
            >
              <v-icon>{{ visibilityIconShortcut }}</v-icon>
            </v-btn>
          </template>
          <span>{{ shortcutVisibilityTitle }}</span>
        </v-tooltip>
      </template>
    </v-list-item>
    <v-expand-transition>
      <v-card
        v-if="expansionPanel"
        flat
      >
        <code-block
          lang="yaml"
          :content="shortcutYaml"
          :show-copy-button="false"
        />
      </v-card>
    </v-expand-transition>
  </div>
</template>

<script setup>
import { computed, ref, toRef, watch, onMounted, inject } from 'vue'
// import { useStore } from 'vuex'
import { TargetEnum } from '@/utils'
import CodeBlock from '@/components/CodeBlock.vue'
import useShootItem from '@/composables/useShootItem'

// const store = useStore()
const yaml = inject('yaml')

const props = defineProps({
  shortcut: {
    type: Object,
    required: true,
  },
  popperBoundariesSelector: {
    type: String,
    default: undefined,
  },
  hideIconSlot: {
    type: Boolean,
    default: false,
  },
  readOnly: {
    type: Boolean,
    default: false,
  },
  shootItem: {
    type: Object,
    required: true,
  },
})

const emits = defineEmits(['add-terminal-shortcut'])

const expansionPanel = ref(false)
const shortcutYaml = ref('')
const {
  isShootStatusHibernated,
} = useShootItem(toRef(props.shootItem))

const addTerminalShortcut = (shortcut) => {
  emits('add-terminal-shortcut', shortcut)
}

const updateShortcutYaml = async (value) => {
  shortcutYaml.value = await yaml.dump(value)
}

const disabled = computed(() => {
  if (props.shootItem && !isShootStatusHibernated.value) {
    return false
  }
  if (props.shortcut?.target !== TargetEnum.SHOOT) {
    return false
  }
  return true
})
const visibilityIconShortcut = computed(() => expansionPanel.value ? 'mdi-eye-off' : 'mdi-eye')
const shortcutVisibilityTitle = computed(() => expansionPanel.value ? 'Hide Shortcut' : 'Show Shortcut')
const isUnverified = computed(() => !!props.shortcut.unverified)

watch(
  () => props.shortcut,
  () => updateShortcutYaml(props.shortcut),
)

onMounted(() => {
  updateShortcutYaml(props.shortcut)
})
</script>

<style lang="scss" scoped>
  :deep(.popper) {
    text-align: initial;
  }

  .enablePointerEvents {
    pointer-events: auto !important;
  }

  .icon {
    margin-inline-end: 32px;
  }
</style>
