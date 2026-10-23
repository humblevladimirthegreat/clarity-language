<script setup lang="ts">
import DefaultTheme from 'vitepress/theme'
import { useRoute, withBase } from 'vitepress'
import { watch } from 'vue'
import RootsTableSort from '../components/RootsTableSort'
import NameChip from '../components/NameChip.vue'
import { applyHashRedirect } from '../lib/hash-redirect'

const siteBuildIso = __SITE_BUILD_ISO__
const siteBuildEt = __SITE_BUILD_ET__

const route = useRoute()

watch(
  () => route.data.isNotFound,
  (isNotFound) => {
    if (isNotFound) {
      route.data.frontmatter.sidebar = true
    }
  },
  { immediate: true },
)

watch(
  () => [route.path, route.hash] as const,
  ([path, hash]) => {
    if (typeof location === 'undefined') return
    const next = applyHashRedirect(path, hash)
    if (!next) return
    const dest = withBase(next.path) + location.search
    if (next.path === path) {
      history.replaceState(history.state, '', dest)
      window.scrollTo(0, 0)
      return
    }
    location.replace(dest)
  },
  { immediate: true },
)
</script>

<template>
  <DefaultTheme.Layout>
    <template #nav-bar-content-after>
      <NameChip placement="bar" />
    </template>
    <template #nav-screen-content-after>
      <NameChip placement="screen" />
    </template>
    <template #sidebar-nav-after>
      <p class="site-build-stamp-wrap">
        <time class="site-build-stamp" :datetime="siteBuildIso">
          {{ siteBuildEt }}
        </time>
      </p>
    </template>
    <template #layout-bottom>
      <RootsTableSort />
    </template>
  </DefaultTheme.Layout>
</template>
