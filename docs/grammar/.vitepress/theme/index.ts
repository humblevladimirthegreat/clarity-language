import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import LexiconSearch from '../components/LexiconSearch.vue'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('LexiconSearch', LexiconSearch)
  },
} satisfies Theme
