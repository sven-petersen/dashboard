// SPDX-FileCopyrightText: 2021 SAP SE or an SAP affiliate company and Gardener contributors
//
// SPDX-License-Identifier: Apache-2.0

const development = process.env.NODE_ENV === 'development'

module.exports = {
  root: true,
  env: {
    'jest/globals': true
  },
  globals: {
    vi: true
  },
  extends: [
    'plugin:vue/essential',
    'plugin:vuetify/base',
    '@vue/standard'
  ],
  plugins: [
    'jest'
  ],
  rules: {
    'no-console': [development ? 'off' : 'error', { allow: ['error'] }],
    'no-debugger': development ? 'off' : 'error',
    'vue/multi-word-component-names': 'off',
    'vue/no-mutating-props': 'off',
    'vuetify/no-deprecated-classes': 'error',
    'vuetify/grid-unknown-attributes': 'error',
    'vuetify/no-legacy-grid': 'error'
  },
  overrides: [
    {
      files: [
        '**/__tests__/*.{j,t}s?(x)',
        '**/tests/unit/**/*.spec.{j,t}s?(x)'
      ],
      env: {
        jest: true
      }
    }
  ]
}
