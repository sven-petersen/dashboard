<!--
SPDX-FileCopyrightText: 2021 SAP SE or an SAP affiliate company and Gardener contributors

SPDX-License-Identifier: Apache-2.0
-->

<template>
  <v-tooltip
    location="top"
    :disabled="noTooltip"
  >
    <template #activator="{ props: tooltipProps }">
      <span
        :class="contentClass"
        v-bind="tooltipProps"
      >{{ relDateTimeString }}</span>
    </template>
    {{ dateTimeString }}
  </v-tooltip>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import {
  getTimeStringFrom,
  getTimeStringTo,
  getTimestampFormatted,
  getDateFormatted,
  isValidTerminationDate,
} from '@/utils'
import {
  clockSecondsAccuracy,
  clockHalfAMinuteAccuracy,
  clockHalfAnHourAccuracy,
} from '@/utils/clock'

const props = defineProps({
  dateTime: {
    type: String,
    required: true,
  },
  mode: {
    type: String,
    default: null,
  },
  currentString: {
    type: String, // access the datetime string from outside of the component
    default: null,
  },
  withoutPrefixOrSuffix: {
    type: Boolean,
    default: false,
  },
  noTooltip: {
    type: Boolean,
    default: false,
  },
  dateTooltip: {
    type: Boolean,
    default: false,
  },
  contentClass: {
    type: String,
    default: '',
  },
  expiredText: {
    type: String,
    default: 'soon',
  },
})

const emits = defineEmits(['update:current-string'])

const currentDate = ref(new Date())
const negativeRefDate = ref(true)

let currentClock = null
let nextClock = null

const relDateTimeString = computed(() => {
  if (props.mode === 'future' && !isValidTerminationDate(props.dateTime)) {
    return props.expiredText
  }
  let relDateTimeString = ''
  if (props.dateTime && currentDate.value) {
    if (negativeRefDate.value) {
      relDateTimeString = getTimeStringFrom(
        new Date(props.dateTime),
        new Date(Math.max(new Date(props.dateTime), currentDate.value)),
        props.withoutPrefixOrSuffix,
      )
    } else {
      relDateTimeString = getTimeStringTo(
        new Date(Math.min(new Date(props.dateTime), currentDate.value)),
        new Date(props.dateTime),
        props.withoutPrefixOrSuffix,
      )
    }
  }

  emits('update:current-string', relDateTimeString)
  return relDateTimeString
})

const dateTimeString = computed(() => {
  if (props.dateTooltip) {
    return getDateFormatted(props.dateTime)
  }
  return getTimestampFormatted(props.dateTime)
})

watch(
  () => props.dateTime,
  (dateTimeValue) => {
    if (dateTimeValue) {
      updateClockInstance(dateTimeValue)
    }
  },
)

const updateClockInstance = (dateTimeValue) => {
  const currentDate = Date.now()
  const refDate = new Date(dateTimeValue).getTime()

  const diffInMilliseconds = Math.abs(currentDate - refDate)

  if (props.mode === 'past') {
    negativeRefDate.value = true
  } else if (props.mode === 'future') {
    negativeRefDate.value = false
  } else if (currentDate > refDate) {
    negativeRefDate.value = true
  } else {
    negativeRefDate.value = false
  }

  if (diffInMilliseconds <= 60 * 1000) {
    setClock(clockSecondsAccuracy, clockHalfAMinuteAccuracy)
  } else if (diffInMilliseconds <= 60 * 60 * 1000) {
    setClock(clockHalfAMinuteAccuracy, clockHalfAnHourAccuracy)
  } else {
    setClock(clockHalfAnHourAccuracy, null)
  }
}

const setClock = (newCurrentClock, newNextClock) => {
  currentClock?.removeEventListener('tick', handleTick)
  nextClock?.removeEventListener('tick', handleNextTick)

  currentClock = newCurrentClock
  nextClock = newNextClock
  currentClock?.addEventListener('tick', handleTick)
  nextClock?.addEventListener('tick', handleNextTick)
}

const handleTick = ({ date }) => {
  currentDate.value = date
}

const handleNextTick = () => {
  updateClockInstance(props.dateTime)
}

onMounted(() => {
  if (props.dateTime) {
    updateClockInstance(props.dateTime)
  }
})

onUnmounted(() => {
  setClock(null, null) // removes event listeners
})
</script>
