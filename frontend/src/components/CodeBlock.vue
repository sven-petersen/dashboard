<!--
SPDX-FileCopyrightText: 2021 SAP SE or an SAP affiliate company and Gardener contributors

SPDX-License-Identifier: Apache-2.0
-->

<template>
  <div
    class="code-block"
    :data-lang="lang"
  >
    <div
      class="code-block-wrapper"
      :style="{ 'max-height': height }"
    >
      <!-- Do not add any space between <pre> and <code> tags as it will be visible in the rendered code block -->
      <pre><code
        ref="block"
        :class="lang"
      /></pre>
      <span
        class="copied"
        :class="{ 'active': showMessage }"
      >Copied!</span>
    </div>
    <copy-btn
      v-if="showCopyButton"
      class="copy-button"
      :clipboard-text="clipboardText"
      :user-feedback="false"
      @copy="onCopy"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import CopyBtn from '@/components/CopyBtn.vue'
import replace from 'lodash/replace'
import hljs from 'highlight.js/lib/core'

import bash from 'highlight.js/lib/languages/bash'
import shell from 'highlight.js/lib/languages/shell'
import json from 'highlight.js/lib/languages/json'
import javascript from 'highlight.js/lib/languages/javascript'
import yaml from 'highlight.js/lib/languages/yaml'

import 'highlight.js/styles/docco.css'

hljs.registerLanguage('bash', bash)
hljs.registerLanguage('shell', shell)
hljs.registerLanguage('json', json)
hljs.registerLanguage('javascript', javascript)
hljs.registerLanguage('yaml', yaml)

const props = defineProps({
  lang: {
    type: String,
    default: '',
  },
  height: {
    type: [Number, String],
    default: '450px',
  },
  content: {
    type: String,
    default: '',
  },
  clipboard: {
    type: String,
    default: '',
  },
  showCopyButton: {
    type: Boolean,
    default: true,
  },
})

const emits = defineEmits(['highlight-block'])

const showMessage = ref(false)
const block = ref()

const clipboardText = computed(() => props.clipboard ?? props.content)

const prettyPrint = (textContent) => {
  if (textContent) {
    block.value.textContent = textContent
  }
  let lines = block.value.textContent.split('\n')
  let matches
  if (lines[0] === '') {
    lines.shift()
  }
  const indentation = (matches = (/^[\s\t]+/).exec(lines[0])) !== null ? matches[0] : null
  if (indentation) {
    lines = lines.map(line => {
      line = replace(line, indentation, '')
      line = replace(line, /\t/g, '  ')
      return line
    })
    block.value.textContent = lines.join('\n').trim()
  }
  hljs.highlightElement(block.value)
  emits('highlight-block')
}

const onCopy = () => {
  showMessage.value = true
  window.setTimeout(() => {
    showMessage.value = false
  }, 2000)
}

watch(() => props.content, (textContent) => prettyPrint(textContent))

onMounted(() => {
  prettyPrint(props.content)
})
</script>

<style lang="scss" scoped>
  @use '@/sass/main.scss' as *;

  $grey-lighten-4: map-get($grey, 'lighten-4');

  .code-block {
    overflow: hidden;
    position: relative;
    border-radius: 2px;
    font-family: "Operator Mono", "Fira Code", Menlo, Hack, "Roboto Mono", "Liberation Mono", Monaco, monospace;
    font-size: 14px;
    line-height: 1.4em;
    + .code-block {
      margin-top: 24px;
    }
    &:hover {
      &:after {
        opacity: 0;
      }
      .copy-button {
        opacity: 1;
      }
    }
    &:after {
      position: absolute;
      top: 20px;
      right: 30px;
      transition: $swift-ease-out;
      color: rgba(#000, .26);
      font-family: Roboto, sans-serif;
      font-size: 11px;
      line-height: 1em;
    }
    &[data-lang="javascript"]:after {
      content: 'Javascript';
    }
    &[data-lang="yaml"]:after {
      content: 'YAML';
    }
    &[data-lang="json"]:after {
      content: 'JSON';
    }
    &[data-lang="bash"]:after {
      content: 'Shell';
    }
    pre {
      margin: 0;
      white-space: pre;
    }
    code.hljs {
      padding: 0;
      white-space: pre !important;
      color: initial;
      background-color: initial;
      font-weight: normal;
      box-shadow: none;
      -webkit-box-shadow: none;
      &:before {
        content: none;
      }
    }
  }

  .code-block-wrapper {
    min-width: 100%;
    max-height: 450px;
    padding: 16px;
    overflow: auto;
  }
  .copy-button {
    position: absolute;
    top: 12px;
    right: 12px;
    z-index: 2;
    opacity: 0;
    transition: $swift-ease-out;
  }
  .copied {
    padding: 8px 16px;
    position: absolute;
    top: 14px;
    left: 14px;
    background-color: rgba(#000, .87);
    border-radius: 2px;
    transform: translate3d(0, -48px, 0);
    transition: $swift-ease-in-out;
    color: #fff;
    font-family: $font-roboto;
    font-size: 14px;
    line-height: 1em;
    &.active {
      transition: $swift-ease-out;
      transform: translate3d(0, 0, 0);
    }
  }

  .theme--light .code-block {
    background-color: rgba(0, 0, 0, .02);
  }

  .theme--dark .code-block {
    background-color: rgba(0, 0, 0, .2);

    &:after {
      color: rgba(#fff, .26) !important;
    }
    code.hljs {
      color: $grey-lighten-4 !important;
    }
  }
</style>
