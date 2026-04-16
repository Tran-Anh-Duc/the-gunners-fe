<script setup lang="ts">
import AppTable from '@/components/common/AppTable.vue'
import type { TableColumn } from '@/types/table.ts'
import { ref, onMounted, reactive, computed } from 'vue'
import AppModal from '@/components/common/AppModal.vue'
import { ElMessage } from 'element-plus'
import type { Category, CategoryFormRequest, CategoryFormState } from '@/types/category.ts'
import {
	getCategoryList,
	showCategoryApi,
	createCategoryApi,
	updateCategoryApi,
} from '@/api/category.api.ts'
import type { Pagination } from '@/types/pagination.ts'
//table
const columns: TableColumn[] = [
	{ prop: 'name', label: 'Tên danh mục' },
	{ prop: 'description', label: 'Mô tả' },
	{ prop: 'is_active', label: 'Trạng thái' },
	{ prop: 'created_at', label: 'Ngày tạo' },
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
//form
const form = reactive<CategoryFormState>({
	id: 0,
	business_id: null,
	name: '',
	description: null,
	is_active: true,
})
const categories = ref<Category[]>([])
const loading = ref(false)
const pagination = reactive<Pagination>({
	page: 1,
	pageSize: 10,
	total: 0,
})
const searchForm = reactive({
	name: '',
	is_active: null,
})
const resetCreateForm = () => {
	form.id = 0
	form.business_id = 0
	form.name = ''
	form.description = ''
	form.is_active = true
}
//even
const handlePageChange = (page: number) => {
	pagination.page = page
	fetchCategories()
}
const handleAction = async (payload: { key: string; row: Record<string, any> }) => {
	if (payload.key === 'edit') {
		modalMode.value = 'edit'
		await handleViewCategory(payload.row.id)
	}

	if (payload.key === 'view') {
		modalMode.value = 'view'
		await handleViewCategory(payload.row.id)
	}

	if (payload.key === 'delete') {
		console.log('delete', payload.row)
	}
}
const handleReset = () => {
	searchForm.name = ''
	searchForm.is_active = null
	fetchCategories()
}
const handleSearch = () => {
	pagination.page = 1
	fetchCategories()
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

//function
const fetchCategories = async () => {
	try {
		loading.value = true
		const res = await getCategoryList({
			page: pagination.page,
			per_page: pagination.pageSize,
			name: searchForm.name,
			is_active:
				searchForm.is_active === null || searchForm.is_active === '' || searchForm.is_active === undefined
					? undefined
					: Number(searchForm.is_active),
		})
		const responseData = res.data.data
		categories.value = responseData.items.map((item: any) => ({
			...item,
			is_active: item.is_active ? 'hoạt động' : 'Ngừng hoạt động',
		}))
		pagination.page = responseData.current_page ?? 1
		pagination.pageSize = responseData.per_page ?? 10
		pagination.total = responseData.total ?? 0
	} catch (error) {
		console.error(error)
	} finally {
		loading.value = false
	}
}

const handleViewCategory = async (id: number) => {
	try {
		const res = await showCategoryApi(id)
		const category = res.data.data
		form.id = category.id
		form.name = category.name
		form.description = category.description
		form.is_active = Boolean(category.is_active)
		showCreateModal.value = true
	} catch (error) {
		console.error(error)
	}
}
const handleSubmit = async () => {
	try {
		loading.value = true
		const payload: CategoryFormRequest = {
			name: form.name,
			description: form.description ?? undefined,
			is_active: form.is_active,
		}
		if (!form.id) {
			//create
			await createCategoryApi(payload)
			ElMessage.success('Tạo danh mục thành công')
		} else {
			//edit
			await updateCategoryApi(form.id, payload)
			ElMessage.success('Cập nhật danh mục thành công')
		}
		handleCloseCreateModal()
		await fetchCategories()
	} catch (error) {
		console.error(error)
	}
}

onMounted(() => {
	fetchCategories()
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

						<el-form-item
							label="Trạng thái"
							class="search-form__item search-form__item--status"
						>
							<el-select
								v-model="searchForm.is_active"
								placeholder="Chọn trạng thái"
								clearable
							>
								<el-option label="Hoạt động" :value="true" />
								<el-option label="Ngừng hoạt động" :value="false" />
							</el-select>
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
			:data="categories"
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
					? 'Tạo mới kho'
					: modalMode === 'edit'
						? 'Cập nhật kho'
						: 'Chi tiết kho'
			"
			@close="handleCloseCreateModal"
			@confirm="handleSubmit"
		>
			<template v-if="modalMode === 'view'">
				<el-form label-width="140px" label-position="left">
					<el-form-item label="Tên">
						<span class="unit-text">{{ form?.name }}</span>
					</el-form-item>

					<el-form-item label="Mô tả">
						<span class="unit-text">{{ form?.description }}</span>
					</el-form-item>

					<el-form-item label="Trạng thái">
						<el-tag :type="form.is_active ? 'success' : 'info'">
							{{ form.is_active ? 'Đang hoạt động' : 'Ngừng hoạt động' }}
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

					<el-form-item label="Mô tả">
						<el-input v-model="form.description" autocomplete="off" />
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

.search-form__item--status {
	width: 220px;
}

.search-form__item :deep(.el-input),
.search-form__item :deep(.el-select) {
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

.search-box {
	margin-bottom: 15px;
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

	.search-form__item,
	.search-form__item--status {
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
