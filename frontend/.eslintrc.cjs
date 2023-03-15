//
// SPDX-FileCopyrightText: 2023 SAP SE or an SAP affiliate company and Gardener contributors
//
// SPDX-License-Identifier: Apache-2.0
//
/* eslint-env node */

const development = process.env.NODE_ENV === 'development'

module.exports = {
  root: true,
  env: {
    'jest/globals': true,
  },
  parserOptions: {
    ecmaVersion: '2022'
  },
  globals: {
    vi: true
  },
  extends: [
    // 'plugin:vue/vue3-recommended',
    'plugin:vue/vue3-essential',
    'plugin:vuetify/base',
    'eslint:recommended'
  ],
  plugins: [
    'jest'
  ],
  rules: {
    'no-console': [development ? 'off' : 'error', { allow: ['error'] }],
    'no-debugger': development ? 'off' : 'error',
    'vue/multi-word-component-names': 'off',
    'vue/no-mutating-props': 'off'
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
    },
    {
      files: [
        'vitest.setup.js',
        '**/__tests__/*.{j,t}s?(x)',
        '**/tests/unit/**/*.spec.{j,t}s?(x)'
      ],
      globals: {
        vi: 'readonly'
      }
    }
  ]
}
