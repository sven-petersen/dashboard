//
// SPDX-FileCopyrightText: 2023 SAP SE or an SAP affiliate company and Gardener contributors
//
// SPDX-License-Identifier: Apache-2.0
//

import { computed } from 'vue'
// TODO: useAppStore from @/store/app when migrating to Pinia
import { useStore } from 'vuex'
import cloneDeep from 'lodash/cloneDeep'

import {
  getTimestampFormatted,
  getCreatedBy,
  isShootStatusHibernated as isShootStatusHibernatedUtil,
  isReconciliationDeactivated,
  isTypeDelete,
  isTruthyValue,
} from '@/utils'

export default function useShootItem (shootItemRef) {
  // computed from store
  const store = useStore()
  const selectedAccessRestrictionsForShootByCloudProfileNameAndRegion = computed(
    () => store.getters.selectedAccessRestrictionsForShootByCloudProfileNameAndRegion,
  )
  const isSeedUnreachableByName = computed(() => store.getters.isSeedUnreachableByName)
  const projectNameByNamespace = computed(() => store.getters.projectNameByNamespace)

  // other computed values
  const shootMetadata = computed(() => shootItemRef.value?.metadata || {})
  const shootName = computed(() => shootMetadata.value?.name)
  const shootNamespace = computed(() => shootMetadata.value?.namespace)
  const shootAnnotations = computed(() => shootMetadata.value?.annotations || {})
  const shootCreationTimestamp = computed(() => shootMetadata.value?.creationTimestamp)
  const shootDeletionTimestamp = computed(() => shootMetadata.value?.deletionTimestamp)
  const isShootMarkedForDeletion = computed(() => {
    const confirmationDeprecated = shootAnnotations.value?.['confirmation.garden.sapcloud.io/deletion'] ?? 'false'
    const confirmation = shootAnnotations.value?.['confirmation.gardener.cloud/deletion'] ?? confirmationDeprecated

    return !!shootDeletionTimestamp.value && isTruthyValue(confirmation)
  })
  const shootCreatedBy = computed(() => getCreatedBy(shootMetadata.value))
  const shootCreatedAt = computed(() => getTimestampFormatted(shootMetadata.value.creationTimestamp))
  const isShootReconciliationDeactivated = computed(() => isReconciliationDeactivated(shootMetadata.value))
  const shootGenerationValue = computed(() => shootMetadata.value.generation)
  const shootProjectName = computed(() => projectNameByNamespace(this.shootMetadata.value))
  const shootGardenOperation = computed(() => shootAnnotations.value['gardener.cloud/operation'])
  const shootSpec = computed(() => shootItemRef.value?.spec ?? {})
  const shootPurpose = computed(() => shootSpec.value?.purpose)
  const isTestingCluster = computed(() => shootPurpose.value === 'testing')
  const shootExpirationTimestamp = computed(() => {
    return (shootAnnotations.value['shoot.gardener.cloud/expiration-timestamp'] ||
      shootAnnotations.value['shoot.garden.sapcloud.io/expirationTimestamp'])
  })
  const isShootActionsDisabledForPurpose = computed(() => shootPurpose.value === 'infrastructure')
  const isShootSettingHibernated = computed(() => shootSpec.value?.hibernation?.enabled ?? false)
  const shootStatus = computed(() => shootItemRef.value?.status ?? {})
  const lastMaintenance = computed(() => shootStatus.value.lastMaintenance ?? {})
  const isLastMaintenanceFailed = computed(() => lastMaintenance.value.state === 'Failed')
  const isStaleShoot = computed(() => shootItemRef.value?.stale)
  const isShootStatusHibernated = computed(() => isShootStatusHibernatedUtil(shootStatus.value))
  const isShootStatusHibernationProgressing = computed(() => isShootSettingHibernated.value !== isShootStatusHibernated.value)
  const shootSecretBindingName = computed(() => shootSpec.value.secretBindingName)
  const shootK8sVersion = computed(() => shootSpec.value?.kubernetes?.version)
  const shootEnableStaticTokenKubeconfig = computed(() => shootSpec.value?.kubernetes?.enableStaticTokenKubeconfig ?? true)
  const shootCloudProfileName = computed(() => shootSpec.value?.cloudProfileName)
  const shootCloudProviderKind = computed(() => shootSpec.value?.provider?.type)
  const shootWorkerGroups = computed(() => shootSpec.value?.provider?.workers ?? [])
  const shootAddons = computed(() => cloneDeep(shootSpec.value?.addons ?? {}))
  const shootRegion = computed(() => shootSpec.value.region)
  const shootZones = computed(() => {
    const workers = shootSpec.value?.provider?.workers || []
    const uniqueZones = [...new Set(workers.flatMap(({ zones }) => zones))]
    return uniqueZones.filter(Boolean)
  })
  const podsCidr = computed(() => shootSpec.value?.networking?.pods)
  const nodesCidr = computed(() => shootSpec.value?.networking?.nodes)
  const servicesCidr = computed(() => shootSpec.value?.networking?.services)
  const shootDomain = computed(() => shootSpec.value?.dns?.domain)
  const isCustomShootDomain = computed(() => shootDnsProviders.value?.some((provider) => provider.primary))
  const shootDnsProviders = computed(() => shootSpec.value?.dns?.providers)
  const shootHibernationSchedules = computed(() => shootSpec.value?.hibernation?.schedules ?? [])
  const shootMaintenance = computed(() => shootSpec.value?.maintenance ?? [])
  const shootControlPlaneHighAvailabilityFailureTolerance = computed(() => {
    return shootSpec.value?.controlPlane?.highAvailability?.failureTolerance?.type
  })
  const shootInfo = computed(() => shootItemRef.value?.info ?? {})
  const seedShootIngressDomain = computed(() => shootInfo.value.seedShootIngressDomain || '')
  const canLinkToSeed = computed(() => shootItemRef.value?.info?.canLinkToSeed ?? false)
  const isShootLastOperationTypeDelete = computed(() => isTypeDelete(shootLastOperation.value))
  const isShootLastOperationTypeControlPlaneMigrating = computed(() => {
    const lastOp = shootLastOperation.value
    return (lastOp.type === 'Migrate' || (lastOp.type === 'Restore' && lastOp.state !== 'Succeeded'))
  })
  const shootLastOperationTypeControlPlaneMigrationMessage = computed(() => {
    switch (shootLastOperation.value.type) {
      case 'Migrate':
        return 'Deleting Resources on old Seed'
      case 'Restore':
        return 'Creating Resources on new Seed'
      default:
        return ''
    }
  })
  const shootLastOperation = computed(() => shootItemRef.value?.status?.lastOperation ?? {})
  const shootLastErrors = computed(() => shootItemRef.value?.status?.lastErrors ?? [])
  const shootConditions = computed(() => shootItemRef.value?.status?.conditions ?? [])
  const shootConstraints = computed(() => shootItemRef.value?.status?.constraints ?? [])
  const shootReadiness = computed(() => {
    const shootConstraintsWithErrorCode = shootConstraints.value.filter((constraint) => {
      return constraint.codes && constraint.codes.length
    })
    return [
      ...shootConditions.value,
      ...shootConstraintsWithErrorCode,
    ]
  })
  const shootObservedGeneration = computed(() => shootItemRef.value?.status?.observedGeneration)
  const shootTechnicalId = computed(() => shootItemRef.value?.status?.technicalID)
  const shootSeedName = computed(() => shootSpec.value?.seedName)
  const isSeedUnreachable = computed(() => isSeedUnreachableByName(shootSeedName.value))
  const shootSelectedAccessRestrictions = computed(() => {
    return selectedAccessRestrictionsForShootByCloudProfileNameAndRegion({
      shootResource: shootItemRef.value,
      cloudProfileName: shootCloudProfileName.value,
      region: shootRegion.value,
    })
  })
  const hibernationPossibleConstraint = computed(() => {
    return shootConstraints.value.find(({ type }) => type === 'HibernationPossible')
  })
  const isHibernationPossible = computed(() => {
    const status = hibernationPossibleConstraint.value?.status ?? 'True'
    return status !== 'False'
  })
  const hibernationPossibleMessage = computed(() => {
    return hibernationPossibleConstraint.value?.message || 'Hibernation currently not possible'
  })
  const maintenancePreconditionSatisfiedConstraint = computed(() => {
    return shootConstraints.value.find(({ type }) => type === 'MaintenancePreconditionsSatisfied')
  })
  const isMaintenancePreconditionSatisfied = computed(() => {
    const status = maintenancePreconditionSatisfiedConstraint.value?.status ?? 'True'
    return status !== 'False'
  })
  const maintenancePreconditionSatisfiedMessage = computed(() => {
    return maintenancePreconditionSatisfiedConstraint.value?.message || 'It may not be safe to trigger maintenance for this cluster'
  })
  const caCertificateValiditiesAcceptableConstraint = computed(() => {
    return shootConstraints.value.find(({ type }) => type === 'CACertificateValiditiesAcceptable')
  })
  const isCACertificateValiditiesAcceptable = computed(() => {
    const status = caCertificateValiditiesAcceptableConstraint.value?.status ?? 'True'
    return status !== 'False'
  })
  const caCertificateValiditiesAcceptableMessage = computed(() => {
    return caCertificateValiditiesAcceptableConstraint.value?.message || 'There is at least one CA certificate which expires in less than 1y. Consider schduling a Certificate Authorities Rotation for this cluster'
  })

  // methods
  const shootActionToolTip = (tooltip) => {
    if (!isShootActionsDisabledForPurpose.value) {
      return tooltip
    }
    return 'Actions disabled for cluster with purpose infrastructure'
  }

  return {
    selectedAccessRestrictionsForShootByCloudProfileNameAndRegion,
    isSeedUnreachableByName,
    projectNameByNamespace,

    shootMetadata,
    shootName,
    shootNamespace,
    shootAnnotations,
    shootCreationTimestamp,
    shootDeletionTimestamp,
    isShootMarkedForDeletion,
    shootCreatedBy,
    shootCreatedAt,
    isShootReconciliationDeactivated,
    shootGenerationValue,
    shootProjectName,
    shootGardenOperation,
    shootSpec,
    shootPurpose,
    isTestingCluster,
    shootExpirationTimestamp,
    isShootActionsDisabledForPurpose,
    isShootSettingHibernated,
    shootStatus,
    lastMaintenance,
    isLastMaintenanceFailed,
    isStaleShoot,
    isShootStatusHibernated,
    isShootStatusHibernationProgressing,
    shootSecretBindingName,
    shootK8sVersion,
    shootEnableStaticTokenKubeconfig,
    shootCloudProfileName,
    shootCloudProviderKind,
    shootWorkerGroups,
    shootAddons,
    shootRegion,
    shootZones,
    podsCidr,
    nodesCidr,
    servicesCidr,
    shootDomain,
    isCustomShootDomain,
    shootDnsProviders,
    shootHibernationSchedules,
    shootMaintenance,
    shootControlPlaneHighAvailabilityFailureTolerance,
    shootInfo,
    seedShootIngressDomain,
    canLinkToSeed,
    isShootLastOperationTypeDelete,
    isShootLastOperationTypeControlPlaneMigrating,
    shootLastOperationTypeControlPlaneMigrationMessage,
    shootLastOperation,
    shootLastErrors,
    shootConditions,
    shootConstraints,
    shootReadiness,
    shootObservedGeneration,
    shootTechnicalId,
    shootSeedName,
    isSeedUnreachable,
    shootSelectedAccessRestrictions,
    hibernationPossibleConstraint,
    isHibernationPossible,
    hibernationPossibleMessage,
    maintenancePreconditionSatisfiedConstraint,
    isMaintenancePreconditionSatisfied,
    maintenancePreconditionSatisfiedMessage,
    caCertificateValiditiesAcceptableConstraint,
    isCACertificateValiditiesAcceptable,
    caCertificateValiditiesAcceptableMessage,

    shootActionToolTip,
  }
}
