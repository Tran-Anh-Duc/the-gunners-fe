<script setup lang="ts">
import { Menu } from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth.store'
import { computed } from 'vue'
import { useRoute } from 'vue-router'

defineProps<{
  isMobile: boolean
}>()

const emit = defineEmits<{
  (e: 'open-drawer'): void
}>()

const authStore = useAuthStore()
const route = useRoute()

const pageTitle = computed(() => {
  return String(route.meta.title || 'Admin')
})

const handleLogout = () => {
  authStore.logout()
}
</script>

<template>
  <div class="header">
    <div class="header-left">
      <el-button v-if="isMobile" :icon="Menu" text @click="emit('open-drawer')" />
      <span class="header-title">{{ pageTitle }}</span>
    </div>

    <div class="header-right">
      <el-button type="danger" @click="handleLogout"> Logout / Đăng xuất </el-button>
    </div>
  </div>
</template>

<style scoped>
.header {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  box-sizing: border-box;
  background: #ffffff;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.header-right {
  display: flex;
  align-items: center;
}
</style>
