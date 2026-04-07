<script setup lang="ts">
import AppTable from '@/components/common/AppTable.vue'
import type { TableColumn } from '@/types/table.ts'
import { ref, onMounted, reactive, computed, vShow } from 'vue'
import AppModal from '@/components/common/AppModal.vue'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '@/stores/auth.store.ts'
import type { Unit, UnitFormRequest } from '@/types/unit.ts'
import { createUnitApi, getUnitList, showUnitApi, updateUnitApi } from '@/api/unit.api.ts'

const columns: TableColumn[] = [
	{ prop: 'code', label: 'Mã đơn vị' },
	{ prop: 'name', label: 'Tên ơn vị' },
	{ prop: 'description', label: 'Mô tả' },
	{ prop: 'business_name', label: 'Cửa hàng' },
	{ prop: 'is_active', label: 'Trạng thái' },
	{
		label: 'Thao tác',
		type: 'actions',
		actions: [
			{ key: 'edit', label: 'Sửa', type: 'primary' },
			{ key: 'view', label: 'chi tiết', type: 'warning' },
			{ key: 'delete', label: 'Xóa', type: 'danger' },
		],
	},
]

const form = reactive({
	id: 0,
	business_id: null as number | null,
	name: '' | null,
	code: '' | null,
	description: '' | null,
	is_active: true,
})

const units = ref<Unit[]>([])
const loading = ref(false)
const pagination = reactive({
	page: 1,
	pageSize: 10,
	total: 50,
})
const searchForm = reactive({
	name: '',
	code: '',
})
const handlePageChange = (page: number) => {
	pagination.page = page
	fetchUnits()
}
const handleAction = async (payload: { key: string; row: Record<string, any> }) => {
	if (payload.key === 'edit') {
		modalMode.value = 'edit'
		await handleViewUser(payload.row.id)
	}

	if (payload.key === 'view') {
		modalMode.value = 'view'
		await handleViewUser(payload.row.id)
	}

	if (payload.key === 'delete') {
		console.log('delete', payload.row)
	}
}

const handleSearch = () => {
	pagination.page = 1
	fetchUnits()
}

const handleReset = () => {
	searchForm.name = ''
	searchForm.code = ''
	fetchUnits()
}

//modal
const showCreateModal = ref(false)
const modalMode = ref<'create' | 'edit' | 'view'>('create')
const handleCloseCreateModal = () => {
	showCreateModal.value = false
	resetCreateForm()
}
const handleOpenCreateModal = () => {
	modalMode.value = 'create'
	resetCreateForm()
	showCreateModal.value = true
}
const resetCreateForm = () => {
	form.id = 0
	form.business_id = 0
	form.name = ''
	form.code = ''
	form.description = ''
	form.is_active = true
}

//lấy thông tin user đang đăng nhập
const authStore = useAuthStore()
const currentUserId = computed(() => authStore.user?.id)
const businessIdCurrent = computed(() => authStore.user?.business_id)
const businessNameCurrent = computed(() => authStore.user?.business_name)
const canEditPassword = computed(() => {
	return modalMode.value === 'create' || form.id === currentUserId.value
})

const fetchUnits = async () => {
	try {
		loading.value = true
		const res = await getUnitList({
			page: pagination.page,
			per_page: pagination.pageSize,
			name: searchForm.name,
			code: searchForm.code,
		})
		const responseData = res.data.data
		units.value = responseData.items.map((item: any) => ({
			...item,
			is_active: item.is_active ? 'hoạt động' : 'Ngừng hoạt động',
		}))
		pagination.page = responseData.current_page
		pagination.pageSize = responseData.per_page
		pagination.total = responseData.total
	} catch (error) {
		console.error('lỗi fetchUnits:', error)
	} finally {
		loading.value = false
	}
}

const handleSubmit = async () => {
	try {
		loading.value = true
		const payload: UnitFormRequest = {
			name: form.name,
			description: form.description,
			is_active: form.is_active,
		}
		if (!form.id) {
			await createUnitApi(payload)
			ElMessage.success('Tạo đơn vị tính thành công')
		} else {
			await updateUnitApi(form.id, payload)
			ElMessage.success('Cập nhật đơn vị tính thành công')
		}
		handleCloseCreateModal()
		await fetchUnits()
	} catch (error) {
		console.error(error)
	}
}

const handleViewUser = async (id: number) => {
	try {
		const res = await showUnitApi(id)
		const unit = res.data.data
		form.id = unit.id || 0
		form.code = unit.code || ''
		form.name = unit.name || ''
		form.description = unit.description || ''
		form.is_active = unit.is_active
		form.business_id = unit.business_id
		showCreateModal.value = true
	} catch (error) {
		console.error(error)
	}
}

onMounted(() => {
	fetchUnits()
})
</script>
<template>
	<div class="unit-list-view">
		<div class="search-box">
			<div class="search-box__header">
				<div class="search-box__left">
					<el-form class="search-form" label-position="top">
						<el-form-item label="Tên" class="search-form__item">
							<el-input v-model="searchForm.name" placeholder="Nhập tên" clearable />
						</el-form-item>

						<el-form-item label="Mã" class="search-form__item">
							<el-input v-model="searchForm.code" placeholder="Nhập mã" clearable />
						</el-form-item>
					</el-form>
				</div>

				<div class="search-box__right">
					<div class="search-box__actions">
						<el-button type="primary" @click="handleSearch">Tìm kiếm</el-button>
						<el-button @click="handleReset">Đặt lại</el-button>
					</div>

					<el-button
						type="success"
						@click="handleOpenCreateModal"
						class="search-box__create"
					>
						+ Thêm mới
					</el-button>
				</div>
			</div>
		</div>

		<AppTable
			:data="units"
			:columns="columns"
			:loading="loading"
			:pagination="pagination"
			@action="handleAction"
			@page-change="handlePageChange"
		/>

		<AppModal
			v-model="showCreateModal"
			:title="
				modalMode === 'create'
					? 'Tạo mới đơn vị'
					: modalMode === 'edit'
						? 'Cập nhật đơn vị'
						: 'Chi tiết đơn vị'
			"
			@close="handleCloseCreateModal"
			@confirm="handleSubmit"
		>
			<template v-if="modalMode === 'view'">
				<el-form label-width="140px" label-position="left">
					<el-form-item label="Tên">
						<span class="unit-text">{{ form?.name }}</span>
					</el-form-item>

					<el-form-item label="Mã">
						<span class="unit-text">{{ form?.code }}</span>
					</el-form-item>

					<el-form-item label="Mô tả">
						<span class="unit-text">{{ form?.description }}</span>
					</el-form-item>

					<el-form-item label="Trạng thái">
						<el-tag :type="form?.is_active ? 'success' : 'info'">
							{{ form?.is_active ? 'Đang hoạt động' : 'Ngừng hoạt động' }}
						</el-tag>
					</el-form-item>
				</el-form>
			</template>

			<template v-else>
				<el-form label-width="140px" label-position="left">
					<el-form-item v-show="false" label="ID">
						<el-input v-model="form.id" autocomplete="off" />
					</el-form-item>

					<el-form-item label="Tên">
						<el-input v-model="form.name" autocomplete="off" />
					</el-form-item>

					<el-form-item label="Mã" v-show="modalMode == 'edit'">
						<el-input
							v-model="form.code"
							autocomplete="off"
							:disabled="modalMode !== 'create'"
						/>
					</el-form-item>

					<el-form-item label="Mô tả">
						<el-input
							v-model="form.description"
							type="textarea"
							maxlength="300"
							show-word-limit
							autocomplete="off"
						/>
					</el-form-item>

					<el-form-item label="Trạng thái">
						<el-select
							v-model="form.is_active"
							placeholder="Chọn trạng thái"
							style="width: 100%"
						>
							<el-option label="Hoạt động" :value="true" />
							<el-option label="Ngừng hoạt động" :value="false" />
						</el-select>
					</el-form-item>

					<el-form-item label="Business ID" v-show="false">
						<el-input v-model="form.business_id" />
					</el-form-item>
				</el-form>
			</template>

			<template v-if="modalMode === 'view'" #footer>
				<el-button @click="handleCloseCreateModal">Đóng</el-button>
			</template>
		</AppModal>
	</div>
</template>

<style scoped>
.unit-list-view {
	display: flex;
	flex-direction: column;
	gap: 16px;
}

.search-box__header {
	display: flex;
	justify-content: space-between;
	align-items: flex-start;
	gap: 16px;
}

.search-box__left {
	flex: 1;
	min-width: 0;
}

.search-form {
	display: flex;
	flex-wrap: wrap;
	gap: 12px 16px;
}

.search-form__item {
	width: 220px;
	margin-bottom: 0;
}

.search-form__item :deep(.el-input) {
	width: 100%;
}

.search-form__item :deep(.el-form-item__label) {
	padding-bottom: 6px;
	line-height: 1.2;
	font-weight: 500;
}

.search-box__right {
	display: flex;
	align-items: flex-start;
	gap: 12px;
	flex-shrink: 0;
}

.search-box__actions {
	display: flex;
	gap: 8px;
}

.search-box__actions .el-button {
	min-width: 110px;
}

.search-box__create {
	white-space: nowrap;
}

.unit-text {
	font-weight: 500;
}

@media (max-width: 768px) {
	.search-box__header {
		flex-direction: column;
		align-items: stretch;
	}

	.search-box__right {
		flex-direction: column;
		width: 100%;
	}

	.search-form {
		width: 100%;
		gap: 12px;
	}

	.search-form__item {
		width: 100%;
	}

	.search-box__actions {
		width: 100%;
	}

	.search-box__actions .el-button {
		flex: 1;
		min-width: 0;
	}

	.search-box__create {
		width: 100%;
	}
}
</style>
