import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import LexiconSearch from '../components/LexiconSearch.vue'
import GlossViewer from '../components/GlossViewer.vue'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('LexiconSearch', LexiconSearch)
    app.component('GlossViewer', GlossViewer)
  },
} satisfies Theme
