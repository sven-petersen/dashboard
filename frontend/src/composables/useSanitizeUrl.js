//
// SPDX-FileCopyrightText: 2021 SAP SE or an SAP affiliate company and Gardener contributors
//
// SPDX-License-Identifier: Apache-2.0
//

import { computed, unref } from 'vue'
import { sanitizeUrl } from '@braintree/sanitize-url'

export default function useSanitizeUrl (urlRef) {
  return computed(() => {
    return sanitizeUrl(unref(urlRef))
  })
}
