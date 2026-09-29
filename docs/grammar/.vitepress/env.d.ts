/// <reference types="vite/client" />

declare const __SITE_BUILD_ISO__: string
declare const __SITE_BUILD_ET__: string

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent
  export default component
}
