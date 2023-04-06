<!--
SPDX-FileCopyrightText: 2021 SAP SE or an SAP affiliate company and Gardener contributors

SPDX-License-Identifier: Apache-2.0
-->

<template>
  <v-avatar
    :class="{ 'icon-background' : !noBackground }"
    small
    :size="size"
    class="rounded-lg"
    tile
  >
    <img
      v-if="iconSrc"
      :src="iconSrc"
      :style="iconStyle"
      :alt="`${value} logo`"
      class="rounded-0"
    >
    <v-icon
      v-else-if="isMdiIcon"
      class="text-primary"
      style="font-size:1.5em"
    >
      {{ value }}
    </v-icon>
    <v-icon
      v-else
      class="text-primary"
      style="font-size:1.5em"
    >
      mdi-blur-radial
    </v-icon>
  </v-avatar>
</template>

<script setup>
import { computed } from 'vue'
import azureIcon from '@/assets/azure.svg'
import awsIcon from '@/assets/aws.svg'
import gcpIcon from '@/assets/gcp.svg'
import openstackIcon from '@/assets/openstack.svg'
import alicloudIcon from '@/assets/alicloud.svg'
import vsphereIcon from '@/assets/vsphere.svg'
import metalIcon from '@/assets/metal.svg'
import onmetalIcon from '@/assets/onmetal.svg'
import awsRoute53Icon from '@/assets/aws-route53.svg'
import azureDnsIcon from '@/assets/azure-dns.svg'
import googleClouddnsIcon from '@/assets/google-clouddns.svg'
import alicloudDnsIcon from '@/assets/alicloud-dns.png'
import cloudflareDnsIcon from '@/assets/cloudflare-dns.svg'
import infobloxDnsIcon from '@/assets/infoblox-dns.svg'
import netlifyDnsIcon from '@/assets/netlify-dns.svg'
import coreosIcon from '@/assets/coreos.svg'
import suseIcon from '@/assets/suse.svg'
import ubuntuIcon from '@/assets/ubuntu.svg'
import gardenlinuxIcon from '@/assets/gardenlinux.svg'
import flatcarIcon from '@/assets/flatcar.svg'
import hcloudIcon from '@/assets/hcloud.svg'

const props = defineProps({
  value: {
    type: String,
    required: true,
  },
  size: {
    type: Number,
    default: 24,
  },
  noBackground: {
    type: Boolean,
    default: false,
  },
})

const iconSrc = computed(() => {
  switch (props.value) {
    // infrastructures
    case 'azure':
      return azureIcon
    case 'aws':
      return awsIcon
    case 'gcp':
      return gcpIcon
    case 'openstack':
      return openstackIcon
    case 'alicloud':
      return alicloudIcon
    case 'vsphere':
      return vsphereIcon
    case 'metal':
      return metalIcon
    case 'onmetal':
      return onmetalIcon
    // dns
    case 'aws-route53':
      return awsRoute53Icon
    case 'azure-dns':
    case 'azure-private-dns':
      return azureDnsIcon
    case 'google-clouddns':
      return googleClouddnsIcon
    case 'openstack-designate':
      return openstackIcon
    case 'alicloud-dns':
      return alicloudDnsIcon
    case 'cloudflare-dns':
      return cloudflareDnsIcon
    case 'infoblox-dns':
      return infobloxDnsIcon
    case 'netlify-dns':
      return netlifyDnsIcon
    // os
    case 'coreos':
      return coreosIcon
    case 'suse-jeos':
      return suseIcon
    case 'suse-chost':
      return suseIcon
    case 'ubuntu':
      return ubuntuIcon
    case 'gardenlinux':
      return gardenlinuxIcon
    case 'flatcar':
      return flatcarIcon
    case 'hcloud':
      return hcloudIcon
  }
  return undefined
})

const isMdiIcon = computed(() => props.value?.startsWith('mdi-'))

const iconStyle = computed(() => {
  const maxIconSize = props.size - 4
  return {
    maxHeight: `${maxIconSize}px`,
    maxWidth: `${maxIconSize}px`,
  }
})
</script>

<style lang="scss" scoped>
  @use '@/sass/main.scss' as *;

  $grey-darken-2: map-get($grey, 'darken-2');

  .v-theme--dark .icon-background {
    background-color: $grey-darken-2
  }
</style>
