import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import './custom.css'
import Layout from './Layout.vue'
import LexiconSearch from '../components/LexiconSearch.vue'
import GlossViewer from '../components/GlossViewer.vue'
import AgelanInspect from '../components/AgelanInspect.vue'
import IpaPlay from '../components/IpaPlay.vue'

export default {
  extends: DefaultTheme,
  Layout,
  enhanceApp({ app }) {
    app.component('LexiconSearch', LexiconSearch)
    app.component('GlossViewer', GlossViewer)
    app.component('AgelanInspect', AgelanInspect)
    app.component('IpaPlay', IpaPlay)
  },
} satisfies Theme
