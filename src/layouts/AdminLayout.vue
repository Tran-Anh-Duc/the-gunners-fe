<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import AdminSidebar from '@/components/layout/AdminSidebar.vue'
import AdminHeader from '@/components/layout/AdminHeader.vue'

const drawer = ref(false)
const windowWidth = ref(window.innerWidth)

const isMobile = computed(() => windowWidth.value < 768)

const handleResize = () => {
  windowWidth.value = window.innerWidth

  if (windowWidth.value >= 768) {
    drawer.value = false
  }
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<template>
  <el-container class="layout-container">
    <el-aside v-if="!isMobile" width="220px" class="layout-aside">
      <AdminSidebar />
    </el-aside>

    <el-container>
      <el-header class="layout-header">
        <AdminHeader :is-mobile="isMobile" @open-drawer="drawer = true" />
      </el-header>

      <el-main class="layout-main">
        <router-view />
      </el-main>
    </el-container>
  </el-container>

  <el-drawer
    v-model="drawer"
    direction="ltr"
    size="220px"
    :with-header="false"
  >
    <AdminSidebar />
  </el-drawer>
</template>

<style scoped>
.layout-container {
  min-height: 100vh;
}

.layout-aside {
  border-right: 1px solid #e5e7eb;
  background: #ffffff;
}

.layout-header {
  padding: 0;
  height: 60px;
  border-bottom: 1px solid #e5e7eb;
  background: #ffffff;
}

.layout-main {
  background: #f5f7fa;
  padding: 20px;
}
</style>