<script setup lang="ts">
import DefaultTheme from 'vitepress/theme'
import { useRoute } from 'vitepress'
import { watch } from 'vue'
import RootsTableSort from '../components/RootsTableSort'

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
</script>

<template>
  <DefaultTheme.Layout>
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
