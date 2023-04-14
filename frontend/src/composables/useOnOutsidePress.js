//
// SPDX-FileCopyrightText: 2023 SAP SE or an SAP affiliate company and Gardener contributors
//
// SPDX-License-Identifier: Apache-2.0
//
import useEvent from './useEvent'

export default function useOnOutsidePress (elementOrElements, callback) {
  const elements = Array.isArray(elementOrElements) ? elementOrElements : [elementOrElements]
  const handler = (event) => {
    const isOutsideAllElements = !elements.some((element) => {
      return element.value === event.target || element.value?.contains(event.target)
    })
    if (isOutsideAllElements) {
      callback(event)
    }
  }

  return useEvent(document, ['mousedown', 'touchstart'], handler, { passive: true })
}
