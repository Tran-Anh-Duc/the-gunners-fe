<script setup lang="ts">
import AppTable from '@/components/common/AppTable.vue'
import type { TableColumn } from '@/types/table.ts'
import { ref, onMounted, reactive, computed } from 'vue'
import AppModal from '@/components/common/AppModal.vue'
import { ElMessage } from 'element-plus'
import type { Product, ProductFormRequest, ProductFormState } from '@/types/product.ts'
import {
	createProductApi,
	getProductList,
	showProductApi,
	updateProductApi,
} from '@/api/product.api.ts'
import type { Pagination } from '@/types/pagination.ts'
import { getCategoryList } from '@/api/category.api.ts'
import { getUnitList } from '@/api/unit.api.ts'
import type { UnitOptionListData } from '@/types/unit'
import type { CategoryOptionListData } from '@/types/category'

//table
const columns: TableColumn[] = [
	{ prop: 'name', label: 'Tên danh mục' },
	{ prop: 'sku', label: 'Mã sản phẩm' },
	{ prop: 'description', label: 'Mô tả' },
	{ prop: 'unit_name', label: 'Đơn vị' },
	{ prop: 'category_name', label: 'Nhóm sản pẩm' },
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
const createDefaultForm = (): ProductFormState => ({
	id: 0,
	business_id: null,
	name: null,
	sku: null,
	description: null,
	is_active: true,
	unit_id: null,
	category_id: null,
	unit_name: null,
	category_name: null,
})
const form = reactive<ProductFormState>(createDefaultForm())

const products = ref<Product[]>([])
//lấy option
const unitOptions = ref<UnitOptionListData>([])
const categoryOptions = ref<CategoryOptionListData>([])
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
	form.unit_id = null
	form.category_id = null
	form.sku = ''
}

//even
const handlePageChange = (page: number) => {
	pagination.page = page
	fetchProducts()
}
const handleAction = async (payload: { key: string; row: Record<string, any> }) => {
	if (payload.key === 'edit') {
		modalMode.value = 'edit'
		await handleViewProduct(payload.row.id)
	}

	if (payload.key === 'view') {
		modalMode.value = 'view'
		await handleViewProduct(payload.row.id)
	}

	if (payload.key === 'delete') {
		console.log('delete', payload.row)
	}
}
const handleReset = () => {
	searchForm.name = ''
	searchForm.is_active = null
	fetchProducts()
}
const handleSearch = () => {
	pagination.page = 1
	fetchProducts()
}
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
// gọi thêm api
const fetchUnitOptions = async () => {
	try {
		const res = await getUnitList({ is_option: 1 })
		unitOptions.value = (res.data.data as unknown as UnitOptionListData) ?? []
	} catch (error) {
		console.error(error)
	}
}

const fetchCategoryOptions = async () => {
	try {
		const res = await getCategoryList({ is_option: 1 })
		categoryOptions.value = (res.data.data as unknown as CategoryOptionListData) ?? []
	} catch (error) {
		console.error(error)
	}
}

const fetchProducts = async () => {
	try {
		loading.value = true
		const res = await getProductList({
			page: pagination.page,
			per_page: pagination.pageSize,
			name: searchForm.name,
			is_active:
				searchForm.is_active === '' ||
				searchForm.is_active === null ||
				searchForm.is_active === undefined
					? undefined
					: Number(searchForm.is_active),
		})
		const responseData = res.data.data
		products.value = (responseData.items ?? []).map((item: any) => ({
			...item,
			is_active: item.is_active ? 'hoạt động' : 'Ngừng hoạt động',
			unit_name: item.unit?.name ?? null,
			category_name: item.category?.name ?? null,
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

const handleViewProduct = async (id: number) => {
	try {
		const res = await showProductApi(id)
		const product = res.data.data
		form.id = product.id
		form.name = product.name
		form.description = product.description ?? null
		form.sku = product.sku ?? null
		form.is_active = Boolean(product.is_active)
		form.unit_id = Number(product.unit_id) ?? undefined
		form.category_id = Number(product.category_id) ?? undefined
		form.category_name = product.category?.name ?? null
		form.unit_name = product.unit?.name ?? null
		showCreateModal.value = true
	} catch (error) {
		console.error(error)
	}
}
const handleSubmit = async () => {
	try {
		loading.value = true
		const payload: ProductFormRequest = {
			name: form.name ?? '',
			description: form.description ?? undefined,
			is_active: form.is_active,
			unit_id: form.unit_id ?? undefined,
			category_id: form.category_id ?? undefined,
		}
		if (modalMode.value === 'create') {
			payload.sku = form.sku ?? undefined
		}
		if (!form.id) {
			//create
			await createProductApi(payload)
			ElMessage.success('Tạo sản phẩm thành công')
		} else {
			//update
			await updateProductApi(form.id, payload)
			ElMessage.success('Cập nhật sản phẩm thành công')
		}
		handleCloseCreateModal()
		await fetchProducts()
	} catch (error) {
		console.error(error)
	} finally {
		loading.value = false
	}
}

onMounted(async () => {
	try {
		loading.value = true
		await Promise.all([fetchProducts(), fetchUnitOptions(), fetchCategoryOptions()])
	} catch (error) {
		console.error(error)
	} finally {
		loading.value = false
	}
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
			:data="products"
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

					<el-form-item label="Đơn vị">
						<span class="unit-text">{{ form?.unit_name }}</span>
					</el-form-item>

					<el-form-item label="Nhóm sản pẩm">
						<span class="unit-text">{{ form?.category_name }}</span>
					</el-form-item>

					<el-form-item label="Trạng thái">
						<el-tag :type="form?.is_active == true ? 'success' : 'info'">
							{{ form?.is_active == true ? 'Đang hoạt động' : 'Ngừng hoạt động' }}
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

					<el-form-item label="Mã sản phẩm(SKU)">
						<el-input
							v-model="form.sku"
							autocomplete="off"
							:disabled="modalMode === 'edit'"
						/>
					</el-form-item>

					<el-form-item label="Mô tả">
						<el-input v-model="form.description" autocomplete="off" />
					</el-form-item>

					<el-form-item label="Đơn vị">
						<el-select v-model="form.unit_id">
							<el-option
								v-for="unit in unitOptions"
								:key="unit.id"
								:label="unit.name"
								:value="unit.id"
							/>
						</el-select>
					</el-form-item>

					<el-form-item label="Nhóm sản pẩm">
						<el-select v-model="form.category_id">
							<el-option
								v-for="category in categoryOptions"
								:key="category.id"
								:label="category.name"
								:value="category.id"
							/>
						</el-select>
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
