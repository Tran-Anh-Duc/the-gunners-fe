<script setup lang="ts">
import { useRoute } from 'vue-router'

const route = useRoute()
const emit = defineEmits(['close'])

const handleClick = () => {
	emit('close')
}
</script>

<template>
	<el-menu :default-active="route.path" class="sidebar-menu" router @select="handleClick">
		<el-menu-item index="/admin">Dashboard</el-menu-item>

		<!-- Users -->
		<el-sub-menu index="users">
			<template #title>Danh mục tài khoản</template>
			<el-menu-item index="/admin/users">Danh sách tài khoản</el-menu-item>
		</el-sub-menu>

		<!-- Meta Data -->
		<el-sub-menu index="meta">
			<template #title>Meta Data</template>

			<el-menu-item index="/admin/units">Danh mục Đơn vị</el-menu-item>

			<el-menu-item index="/admin/warehouses">Danh mục Kho</el-menu-item>

			<el-menu-item index="/admin/categories">Danh mục loại phẩm</el-menu-item>

			<el-menu-item index="/admin/products">Danh mục sản phẩm</el-menu-item>

			<el-menu-item index="/admin/customers">Danh mục khách hàng (nhận)</el-menu-item>

			<el-menu-item index="/admin/suppliers">Danh mục khách hàng (nhập)</el-menu-item>
		</el-sub-menu>
		<!-- List order -->
		<el-sub-menu index="orders">
			<template #title>Quản lý đơn hàng</template>
			<el-menu-item index="/admin/orders">Danh sách đơn hàng</el-menu-item>
		</el-sub-menu>
	</el-menu>
</template>
<style scoped>
.sidebar-menu {
	height: 100%;
	overflow-y: auto;
}

.el-menu-item,
.el-sub-menu__title {
	white-space: normal;
	line-height: 1.4;
}
</style>
