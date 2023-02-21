//
// SPDX-FileCopyrightText: 2023 SAP SE or an SAP affiliate company and Gardener contributors
//
// SPDX-License-Identifier: Apache-2.0

import path from 'path'
import zlib from 'zlib'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import Components from 'unplugin-vue-components/vite'
// TODO: migrate to vite-plugin-vuetify instead of unplugin-vue-components
import { VuetifyResolver } from 'unplugin-vue-components/resolvers'
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
              MODE: 2 // TODO: set mode to 3
            }
          }
        }
      }),
      Components({
        resolvers: [VuetifyResolver()]
      })
    ],
    define: {
      // Fix for vuelidate@0.7.7 which uses "process.env" which is not supported by vite.
      // Never versions of vuelidate should work with vite but this requires migrating
      // to vuelidate@2.0.0.
      'process.env.BUILD': '"web"'
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src/'),
        vue: '@vue/compat/dist/vue.runtime.esm-bundler.js'
      }
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
