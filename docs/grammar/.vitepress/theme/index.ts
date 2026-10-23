import { defineAsyncComponent } from 'vue'
import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import './custom.css'
import Layout from './Layout.vue'
import LexiconSearch from '../components/LexiconSearch.vue'
import NameRespell from '../components/NameRespell.vue'
import DigitPegs from '../components/DigitPegs.vue'
import FingerCode from '../components/FingerCode.vue'
import GlossViewer from '../components/GlossViewer.vue'
import EnglishHelper from '../components/EnglishHelper.vue'
import AgebenInspect from '../components/AgebenInspect.vue'
import ClaritishEditor from '../components/ClaritishEditor.vue'
import IpaPlay from '../components/IpaPlay.vue'
import NameHelper from '../components/NameHelper.vue'
import PitchDrill from '../components/PitchDrill.vue'
import PrintButton from '../components/PrintButton.vue'
import SelfCode from '../components/SelfCode.vue'
import SelfGloss from '../components/SelfGloss.vue'

export default {
  extends: DefaultTheme,
  Layout,
  enhanceApp({ app }) {
    app.component('LexiconSearch', LexiconSearch)
    app.component('NameRespell', NameRespell)
    app.component('DigitPegs', DigitPegs)
    app.component('FingerCode', FingerCode)
    app.component('GlossViewer', GlossViewer)
    app.component('EnglishHelper', EnglishHelper)
    app.component('AgebenInspect', AgebenInspect)
    app.component('ClaritishEditor', ClaritishEditor)
    app.component('IpaPlay', IpaPlay)
    app.component('NameHelper', NameHelper)
    app.component('PitchDrill', PitchDrill)
    app.component('PrintButton', PrintButton)
    app.component('SelfCode', SelfCode)
    app.component('SelfGloss', SelfGloss)
    // Only its own page needs the game engine and its data, so it loads as a separate chunk.
    app.component('WizardSandbox', defineAsyncComponent(() => import('../components/WizardSandbox.vue')))
  },
} satisfies Theme
