<!--
SPDX-FileCopyrightText: 2021 SAP SE or an SAP affiliate company and Gardener contributors

SPDX-License-Identifier: Apache-2.0
-->

<!-- TODO: previous implementation used vue-snotify which supported displaying multiple
      toasts at once (stacked). This solution only displays the most recent one. While that is in
      in line with the Material Design guidelines this might be sup-optimal.
-->

<template>
  <div class="text-center ma-2">
    <v-snackbar
      v-model="active"
      :color="color"
      :timeout="timeout"
      location="bottom right"
    >
      <div v-if="title" class="text-subtitle-1 pb-1">{{ title }}</div>
      <p>{{ message }}</p>
      <template v-slot:actions>
        <v-btn
          variant="text"
          @click="active = false"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  components: [],
  data() {
    return {
      active: false,
      color: null,
      timeout: null,
      message: null
    }
  },
  computed: {
    ...mapGetters([
      'alert'
    ])
  },
  watch: {
    alert (value) {
      if (value) {
        this.showToast(value)
        this.setAlert(null)
      }
    }
  },
  methods: {
    ...mapActions([
      'setAlert'
    ]),
    showToast ({ message, type, title }) {
      this.title = title
      this.message = message
      this.timeout = type === 'success' ? 3000 : 5000
      this.color = ['success', 'warning', 'error'].includes(type) ? type : 'info'
      this.active = true
    }
  }
}
</script>
