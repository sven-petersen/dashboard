//
// SPDX-FileCopyrightText: 2023 SAP SE or an SAP affiliate company and Gardener contributors
//
// SPDX-License-Identifier: Apache-2.0
//
import { unref, watch } from 'vue'

export default function useEvent (element, nameOrNames, listener, options = null) {
  const names = Array.isArray(nameOrNames) ? nameOrNames : [nameOrNames]
  const removeEventListeners = (e) => {
    names.forEach((name) => e.removeEventListener(name, listener))
  }
  const addEventListeners = (e) => {
    names.forEach((name) => e.addEventListener(name, listener, options))
  }

  const removeWatch = watch(
    () => unref(element),
    (newElement, oldElement) => {
      if (oldElement) {
        removeEventListeners(oldElement)
      }
      if (newElement) {
        addEventListeners(newElement)
      }
    },
    { immediate: true },
  )

  const remove = () => {
    removeWatch()
    if (element.value) {
      removeEventListeners(element.value)
    }
  }

  return remove
}
