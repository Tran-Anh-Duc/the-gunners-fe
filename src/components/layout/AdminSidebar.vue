<script setup lang="ts">
import { useRoute } from 'vue-router'

const route = useRoute()
</script>

<template>
	<el-menu :default-active="route.path" class="sidebar-menu" router>
		<el-menu-item index="/admin">Dashboard</el-menu-item>

		<!-- Users -->
		<el-sub-menu index="users">
			<template #title>Người dùng</template>
			<el-menu-item index="/admin/users">User List</el-menu-item>
		</el-sub-menu>

		<!-- Meta Data -->
		<el-sub-menu index="meta">
			<template #title>Meta Data</template>

			<el-menu-item index="/admin/units"> Đơn vị </el-menu-item>

			<el-menu-item index="/admin/warehouses"> Kho </el-menu-item>

			<el-menu-item index="/admin/categories"> Danh mục sản phẩm </el-menu-item>
		</el-sub-menu>
	</el-menu>
</template>
