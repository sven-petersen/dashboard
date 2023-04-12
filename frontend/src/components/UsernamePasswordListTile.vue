<!--
SPDX-FileCopyrightText: 2021 SAP SE or an SAP affiliate company and Gardener contributors

SPDX-License-Identifier: Apache-2.0
-->

<template>
  <div v-if="showCredentials || showNotAvailablePlaceholder">
    <template v-if="showCredentials">
      <v-list-item
        v-if="username"
        :title="username"
        :subtitle="usernameTitle"
      >
        <template #prepend>
          <v-icon color="primary">
            {{ icon }}
          </v-icon>
        </template>
        <template #append>
          <copy-btn :clipboard-text="username" />
        </template>
      </v-list-item>

      <v-list-item
        v-if="email"
        :title="email"
        :subtitle="emailTitle"
      >
        <template #prepend>
          <v-icon color="primary">
            {{ username ? 'blank' : icon }}
          </v-icon>
        </template>
        <template #append>
          <copy-btn :clipboard-text="email" />
        </template>
      </v-list-item>

      <v-list-item
        :title="passwordText"
        :subtitle="passwordTitle"
      >
        <template #prepend>
          <v-icon>blank</v-icon>
        </template>
        <template #append>
          <copy-btn :clipboard-text="password" />
          <v-tooltip location="top">
            <template #activator="slotProps">
              <v-btn
                icon
                variant="text"
                color="action-button"
                v-bind="slotProps.props"
                @click.stop="showPassword = !showPassword"
              >
                <v-icon>{{ visibilityIcon }}</v-icon>
              </v-btn>
            </template>
            <span>{{ passwordVisibilityTitle }}</span>
          </v-tooltip>
        </template>
      </v-list-item>
    </template>
    <v-list-item v-else-if="showNotAvailablePlaceholder">
      <v-list-item-icon>
        <v-icon color="primary">
          {{ icon }}
        </v-icon>
      </v-list-item-icon>
      <slot name="notAvailablePlaceholder">
        <v-list-item-content>
          <v-list-item-subtitle>Credentials</v-list-item-subtitle>
          <v-list-item-title class="pt-1">
            <v-icon color="primary">
              mdi-alert-circle-outline
            </v-icon>
            Currently not available
          </v-list-item-title>
        </v-list-item-content>
      </slot>
    </v-list-item>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import CopyBtn from '@/components/CopyBtn.vue'

const props = defineProps({
  icon: {
    type: String,
    default: 'mdi-account-outline',
  },
  usernameTitle: {
    type: String,
    default: 'User',
  },
  passwordTitle: {
    type: String,
    default: 'Password',
  },
  emailTitle: {
    type: String,
    default: 'Email',
  },
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  showNotAvailablePlaceholder: {
    type: Boolean,
    default: true,
  },
})

const showPassword = ref(false)

const passwordText = computed(() => showPassword.value ? props.password : '****************')
const passwordVisibilityTitle = computed(() => showPassword.value ? 'Hide password' : 'Show password')
const visibilityIcon = computed(() => showPassword.value ? 'mdi-eye-off' : 'mdi-eye')
const showCredentials = computed(() => {
  return (!!props.username || !!props.email) && !!props.password
})

const reset = () => { showPassword.value = false }

watch(
  () => props.password,
  () => reset(),
)

</script>
