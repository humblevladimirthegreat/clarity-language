import globals from 'globals'
import pluginVue from 'eslint-plugin-vue'
import pluginVueA11y from 'eslint-plugin-vuejs-accessibility'
import tsParser from '@typescript-eslint/parser'
import vueParser from 'vue-eslint-parser'

const componentFiles = ['docs/grammar/.vitepress/components/**/*.vue']

export default [
  {
    ignores: ['dist/**', 'node_modules/**', 'web/lib/**'],
  },
  ...pluginVue.configs['flat/essential'].map((config) => ({
    ...config,
    files: componentFiles,
  })),
  ...pluginVueA11y.configs['flat/recommended'].map((config) => ({
    ...config,
    files: componentFiles,
  })),
  {
    files: componentFiles,
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: tsParser,
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
      globals: {
        ...globals.browser,
      },
    },
    rules: {
      // GlossOverlay: parent overlay handles arrow keys; token spans are pointer targets.
      'vuejs-accessibility/interactive-supports-focus': 'off',
      'vuejs-accessibility/click-events-have-key-events': 'off',
      'vuejs-accessibility/mouse-events-have-key-events': 'off',
      'vuejs-accessibility/no-static-element-interactions': 'off',
    },
  },
]
