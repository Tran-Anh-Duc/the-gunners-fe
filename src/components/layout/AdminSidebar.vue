<script setup lang="ts">
import { useRoute } from 'vue-router'

const route = useRoute()
</script>

<template>
  <el-menu :default-active="route.path" class="sidebar-menu" router>
    <el-menu-item index="/admin"> Dashboard </el-menu-item>

    <el-sub-menu index="users">
      <template #title>Người dùng</template>

      <el-menu-item index="/admin/users"> User List </el-menu-item>
    </el-sub-menu>
    <el-sub-menu index="units">
      <template #title>Đơn vị</template>

      <el-menu-item index="/admin/units"> Unit List </el-menu-item>
    </el-sub-menu>
  </el-menu>
</template>
