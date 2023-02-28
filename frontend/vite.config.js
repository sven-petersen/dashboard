//
// SPDX-FileCopyrightText: 2023 SAP SE or an SAP affiliate company and Gardener contributors
//
// SPDX-License-Identifier: Apache-2.0

import { fileURLToPath, URL } from 'node:url'
import zlib from 'zlib'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vuetify from 'vite-plugin-vuetify'
// import Components from 'unplugin-vue-components/vite'
// import { Vuetify3Resolver } from 'unplugin-vue-components/resolvers'
import viteCompression from 'vite-plugin-compression'
import { visualizer } from 'rollup-plugin-visualizer'

const proxyTarget = 'http://localhost:3030'

const KiB = 1024

// https://vitejs.dev/config/
export default defineConfig(({ command }) => {
  const config = {
    plugins: [
      vue({
        template: {
          compilerOptions: {
            compatConfig: {
              MODE: 3
            }
          }
        }
      }),
      // TODO: needed? If so get it to work
      vuetify({
        // autoImport: true,
        styles: { configFile: 'src/sass/settings.scss' }
      }),
      // Components({
      //   resolvers: [Vuetify3Resolver()]
      // })
    ],
    define: {
      // Fix for vuelidate@0.7.7 which uses "process.env" which is not supported by vite.
      // Never versions of vuelidate should work with vite but this requires migrating
      // to vuelidate@2.0.0.
      'process.env.BUILD': '"web"',
    },
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
        // vue: '@vue/compat' // TODO: remove after migration to vue 3
        vue: '@vue/compat/dist/vue.runtime.esm-bundler.js' // TODO: remove after migration to vue 3
      },
      dedupe: [ '@vue/compat/dist/vue.runtime.esm-bundler.js', '@vue/compat', 'vue' ], // TODO: remove after migration to vue 3
      extensions: [
        '.js',
        '.json',
        '.jsx',
        '.mjs',
        '.ts',
        '.tsx',
        '.vue'
      ]
    },
    server: {
      port: 8080,
      strictPort: true,
      proxy: {
        '/api': {
          target: proxyTarget,
          changeOrigin: true,
          ws: true
        },
        '/auth': {
          target: proxyTarget
        }
      }
    },
    test: {
      globals: true,
      // include: ['tests/*'],
      coverage: {
        provider: 'c8',
        branches: 42,
        functions: 27,
        lines: 39,
        statements: 39
      },
      setupFiles: ['vitest.setup.js'],
      environment: 'jsdom'
    }
  }

  if (command === 'build') {
    config.plugins.push(
      viteCompression({
        algorithm: 'gzip',
        threshold: 8 * KiB
      }),
      viteCompression({
        algorithm: 'brotliCompress',
        threshold: 8 * KiB,
        compressionOptions: {
          [zlib.constants.BROTLI_PARAM_QUALITY]: 11
        }
      }),
      visualizer({
        filename: 'bundle-stats.treemap.html',
        brotliSize: true,
        gzipSize: true,
        template: 'treemap'
      }),
      visualizer({
        filename: 'bundle-stats.sunburst.html',
        brotliSize: true,
        gzipSize: true,
        template: 'sunburst'
      }),
      visualizer({
        filename: 'bundle-stats.network.html',
        brotliSize: true,
        gzipSize: true,
        template: 'network'
      })
    )
  }

  return config
})
