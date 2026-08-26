import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import './custom.css'
import LexiconSearch from '../components/LexiconSearch.vue'
import GlossViewer from '../components/GlossViewer.vue'
import AgelanInspect from '../components/AgelanInspect.vue'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('LexiconSearch', LexiconSearch)
    app.component('GlossViewer', GlossViewer)
    app.component('AgelanInspect', AgelanInspect)
  },
} satisfies Theme
