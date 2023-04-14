<!--
SPDX-FileCopyrightText: 2023 SAP SE or an SAP affiliate company and Gardener contributors

SPDX-License-Identifier: Apache-2.0
-->

<template>
  <g-popper
    title="Gardenctl Info"
    placement="bottom"
  >
    <template #activator="{ on }">
      <v-btn
        icon
        variant="text"
        v-on="on"
      >
        <v-tooltip location="top">
          <template #activator="slotProps">
            <v-icon
              color="action-button"
              v-bind="slotProps.props"
            >
              mdi-information-outline
            </v-icon>
          </template>
          <span>Show information about gardenctl</span>
        </v-tooltip>
      </v-btn>
    </template>
    <div class="text-h6 text-grey-darken-1 mb-4">
      Gardenctl
    </div>
    <p>
      gardenctl is a command-line client for the Gardener. It facilitates the administration of one or many garden, seed and shoot clusters. Use this tool to configure access to clusters and configure cloud provider CLI tools. It also provides support for accessing cluster nodes via ssh.
    </p>
    <p>
      If not already done <external-link url="https://github.com/gardener/gardenctl-v2#installation">
        install
      </external-link>
      <span class="font-family-monospace pl-1">gardenctl</span> and
      <external-link url="https://github.com/gardener/gardenctl-v2#configuration">
        configure
      </external-link>
      it accordingly.
    </p>
    <GardenctlConfigExample />
  </g-popper>
</template>

<script setup>
import GPopper from '@/components/GPopper.vue'
import GardenctlConfigExample from '@/components/GardenctlConfigExample.vue'
import ExternalLink from '@/components/ExternalLink.vue'
</script>

<style lang="scss" scoped>
  :deep(.popper) {
    text-align: initial;
  }
</style>
