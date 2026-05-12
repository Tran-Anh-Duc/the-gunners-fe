<script setup lang="ts">
import AppTable from '@/components/common/AppTable.vue'
import type { TableColumn } from '@/types/table.ts'
import { ref, onMounted, reactive, computed, onUnmounted } from 'vue'
import AppModal from '@/components/common/AppModal.vue'
import { ElMessage, ElDescriptions, ElDescriptionsItem } from 'element-plus'
import dayjs from 'dayjs'
import type {
	InventoryOpeningGroup,
	InventoryOpeningTableRow,
	InventoryOpeningForm, InventoryOpening
} from '@/types/inventoryOpening.ts'
import type { Pagination } from '@/types/pagination.ts'
import {
	getInventoryOpeningsList,
	createInventoryOpeningApi,
	showInventoryOpeningApi,
	updateInventoryOpeningApi
} from '@/api/inventoryOpening.api.ts'
import type { Product } from '@/types/product.ts'
import type { Warehouse } from '@/types/warehouse.ts'
import { getProductList } from '@/api/product.api.ts'
import { getWarehouseList } from '@/api/warehouse.api.ts'
const isMobile = ref(false)

const loading = ref(false)
const inventoryOpeningGroups = ref<InventoryOpeningGroup[]>([])

const pagination = reactive<Pagination>({
	page: 1,
	pageSize: 10,
	total: 50,
})

const searchForm = reactive({
	page: 1,
	per_page: 10,

	keyword: '',

	warehouse_id: undefined as number | undefined,
	product_id: undefined as number | undefined,

	opening_date_from: '',
	opening_date_to: '',

	sort_by: '',
	sort_order: 'desc' as 'asc' | 'desc',
})

const tableRows = computed<InventoryOpeningTableRow[]>(() => {
	const rows: InventoryOpeningTableRow[] = []

	inventoryOpeningGroups.value.forEach((group) => {
		rows.push({
			row_type: 'warehouse_summary',
			row_key: `warehouse-${group.warehouse_id}`,
			warehouse_id: group.warehouse_id,
			warehouse_code: group.warehouse.code,
			warehouse_name: group.warehouse.name,
			opening_date: group.opening_date,
			total_quantity: group.total_quantity,
			warehouse_total_cost: group.total_cost,
		})

		rows.push({
			row_type: 'product_header',
			row_key: `product-header-${group.warehouse_id}`,
			warehouse_id: group.warehouse_id,
		})

		group.details.forEach((detail, index) => {
			rows.push({
				row_type: 'product',
				row_key: `product-${group.warehouse_id}-${detail.id}`,
				warehouse_id: group.warehouse_id,
				index: index + 1,
				opening_id: detail.id,
				product_id: detail.product_id,
				product_name: detail.product_name,
				unit_id: detail.unit_id,
				unit_name: detail.unit_name,
				quantity: detail.quantity,
				unit_cost: detail.unit_cost,
				total_cost: detail.total_cost,
				note: detail.note,
			})
		})
	})

	return rows
})

const fetchInventoryOpenings = async () => {
	loading.value = true

	try {
		const res = await getInventoryOpeningsList({
			page: pagination.page,
			per_page: pagination.pageSize,
		})
		const data = res.data.data
		inventoryOpeningGroups.value = data.items || []
		pagination.current_page = data.current_page || 1
		pagination.per_page = data.per_page || searchForm.per_page
		pagination.total = data.total || 0
		pagination.last_page = data.last_page || 1
	} catch (error) {
		ElMessage.error('Không thể tải danh sách tồn đầu kỳ.')
	} finally {
		loading.value = false
	}
}

// submit form

const drawerVisible = ref(false)
const drawerMode = ref<'create' | 'edit' | 'view'>('create')
const submitLoading = ref(false)

const defaultForm = (): InventoryOpeningForm => ({
	business_id: undefined,
	warehouse_id: undefined,
	product_id: undefined,
	product_name: '',
	unit_id: undefined,
	unit_name: '',
	opening_date: dayjs().format('YYYY-MM-DD'),
	quantity: undefined,
	unit_cost: undefined,
	note: null,
})

const form = reactive<InventoryOpeningForm>(defaultForm())
const resetForm = () => {
	Object.assign(form, defaultForm())
}
const handleCreate = () => {
	drawerMode.value = 'create'
	resetForm()
	drawerVisible.value = true
}

const warehouse_options = ref<Warehouse[]>([])
const warehouse_loading = ref(false)

const product_options = ref<Product[]>([])
const product_loading = ref(false)

const formatMoney = (value: number | string | null | undefined): string => {
	if (value === null || value === undefined || value === '') return '0'

	const number = Number(value)

	if (isNaN(number)) return '0'

	return new Intl.NumberFormat('vi-VN').format(number)
}

const handleSearchWarehouse = async (query: string) => {
	warehouse_loading.value = true

	try {
		const res = await getWarehouseList({
			name: query,
			is_option: 1,
		})

		warehouse_options.value = res.data.data || []
	} finally {
		warehouse_loading.value = false
	}
}

const handleSearchProduct = async (query: string) => {
	product_loading.value = true

	try {
		const res = await getProductList({
			name: query,
			is_option: 1,
		})

		product_options.value = res.data.data || []
	} finally {
		product_loading.value = false
	}
}

const handleSelectProduct = (productId: number | null) => {
	const product = product_options.value.find((item) => item.id === productId)

	if (!product) {
		form.product_id = undefined
		form.product_name = ''
		form.unit_id = undefined
		form.unit_name = ''
		return
	}

	form.product_id = product.id
	form.product_name = product.name
	form.unit_id = product.unit_id
	form.unit_name = product.unit?.name || ''
}

const handleSubmit = async () => {
	submitLoading.value = true

	try {
		const payload = {
			...form,
			quantity: Number(form.quantity || 0),
			unit_cost: Number(form.unit_cost || 0),
		}

		if (drawerMode.value === 'edit' && editingId.value) {
			await updateInventoryOpeningApi(editingId.value, payload)
			ElMessage.success('Cập nhật tồn đầu kỳ thành công')
		} else {
			await createInventoryOpeningApi(payload)
			ElMessage.success('Thêm mới tồn đầu kỳ thành công')
		}

		drawerVisible.value = false
		fetchInventoryOpenings()
	} finally {
		submitLoading.value = false
	}
}

const editingId = ref<number | null>(null)
const drawerLoading = ref(false)

const handleEdit = async (row: InventoryOpening) => {
	const id = row.opening_id
	drawerMode.value = 'edit'
	editingId.value = id
	resetForm()
	drawerVisible.value = true
	drawerLoading.value = true

	try {
		const res = await showInventoryOpeningApi(id)
		const data = res.data.data
		console.log('detail data:', data)
		console.log('warehouse:', data.warehouse)
		console.log('product:', data.product)
		Object.assign(form, {
			warehouse_id: data.warehouse_id,
			product_id: data.product_id,
			product_name: data.product_name,
			unit_id: data.unit_id,
			unit_name: data.unit_name,
			opening_date: data.opening_date,
			quantity: Number(data.quantity || 0),
			unit_cost: Number(data.unit_cost || 0),
			note: data.note ?? null,
		})

		if (data.warehouse) {
			warehouse_options.value = [data.warehouse]
		}

		if (data.product) {
			product_options.value = [data.product]
		}
	} finally {
		drawerLoading.value = false
	}
}

const checkMobile = () => {
	isMobile.value = window.innerWidth <= 768
}

onMounted(() => {
	checkMobile()
	window.addEventListener('resize', checkMobile)
	fetchInventoryOpenings()
})

onUnmounted(() => {
	window.removeEventListener('resize', checkMobile)
})
</script>
<template>
	<el-drawer
		v-model="drawerVisible"
		:title="drawerMode === 'create' ? 'Thêm mới tồn đầu kỳ' : 'Cập nhật tồn đầu kỳ'"
		:size="isMobile ? '100%' : '1500px'"
		destroy-on-close
	>
		<div class="inventory-opening-drawer">
			<el-scrollbar class="drawer-scroll">
				<div class="drawer-content">
					<div class="drawer-main-layout">
						<div class="drawer-form-panel">
							<!-- Form sẽ đặt ở đây -->
							<el-card shadow="never">
								<template #header>
									<span>Thông tin tồn đầu kỳ</span>
								</template>
								<el-form
									ref="formRef"
									:model="form"
									label-width="120px"
									label-position="left"
								>
									<!--								thông tin kho-->
									<el-form-item label="Kho" prop="warehouse_id">
										<el-select
											v-model="form.warehouse_id"
											filterable
											remote
											clearable
											remote-show-suffix
											:remote-method="handleSearchWarehouse"
											:loading="warehouse_loading"
											placeholder="Tìm kho"
											style="width: 100%"
										>
											<el-option
												v-for="item in warehouse_options"
												:key="item.id"
												:label="`${item.code} - ${item.name}`"
												:value="item.id"
											/>
										</el-select>
									</el-form-item>
									<el-form-item label="Ngày tồn đầu kỳ" prop="opening_date">
										<el-date-picker
											v-model="form.opening_date"
											type="date"
											value-format="YYYY-MM-DD"
											placeholder="Chọn ngày"
											style="width: 100%"
										/>
									</el-form-item>
									<el-form-item label="Sản phẩm" prop="product_id">
										<el-select
											v-model="form.product_id"
											filterable
											remote
											clearable
											remote-show-suffix
											:remote-method="handleSearchProduct"
											:loading="product_loading"
											@change="handleSelectProduct"
											placeholder="Tìm sản phẩm"
											style="width: 100%"
										>
											<el-option
												v-for="item in product_options"
												:key="item.id"
												:label="`${item.sku} - ${item.name}`"
												:value="item.id"
											/>
										</el-select>
									</el-form-item>
									<el-form-item label="Đơn vị tính">
										<el-input
											v-model="form.unit_name"
											disabled
											placeholder="Tự động theo sản phẩm"
										/>
									</el-form-item>
									<el-form-item label="Số lượng tồn" prop="quantity">
										<el-input-number
											v-model="form.quantity"
											:min="0"
											style="width: 100%"
										/>
									</el-form-item>
									<el-form-item label="Giá vốn / đơn vị" prop="unit_cost">
										<el-input-number
											v-model="form.unit_cost"
											:min="0"
											style="width: 100%"
										/>
									</el-form-item>
									<el-form-item label="Ghi chú" prop="note">
										<el-input
											v-model="form.note"
											type="textarea"
											:rows="3"
											placeholder="Nhập ghi chú"
										/>
									</el-form-item>
								</el-form>
							</el-card>
						</div>

						<div class="drawer-summary-panel">
							<el-card shadow="never" class="summary-card">
								<template #header>
									<span>Tóm tắt</span>
								</template>

								<div class="summary-list">
									<div class="summary-item">
										<span class="summary-label">Kho</span>
										<span class="summary-value">
											{{
												warehouse_options.find(
													(item) => item.id === form.warehouse_id,
												)?.name || '--'
											}}
										</span>
									</div>

									<div class="summary-item">
										<span class="summary-label">Sản phẩm</span>
										<span class="summary-value">
											{{ form.product_name || '--' }}
										</span>
									</div>

									<div class="summary-item">
										<span class="summary-label">Đơn vị</span>
										<span class="summary-value">
											{{ form.unit_name || '--' }}
										</span>
									</div>

									<div class="summary-item">
										<span class="summary-label">Số lượng</span>
										<span class="summary-value">
											{{ form.quantity || 0 }}
										</span>
									</div>

									<div class="summary-item">
										<span class="summary-label">Giá vốn</span>
										<span class="summary-value">
											{{ formatMoney(form.unit_cost || 0) }}
										</span>
									</div>

									<div class="summary-total">
										<div class="summary-total-label">Tổng giá trị tồn</div>

										<div class="summary-total-value">
											{{
												formatMoney(
													(form.quantity || 0) * (form.unit_cost || 0),
												)
											}}
										</div>
									</div>
								</div>
							</el-card>
						</div>
					</div>
				</div>
			</el-scrollbar>

			<div class="drawer-footer">
				<el-button @click="drawerVisible = false"> Huỷ </el-button>

				<el-button type="primary" :loading="submitLoading" @click="handleSubmit">
					Lưu
				</el-button>
			</div>
		</div>
	</el-drawer>

	<div class="inventory-opening-toolbar">
		<div class="inventory-opening-search">
			<div class="search-grid">
				<div class="search-item">
					<div class="search-label">Từ khóa</div>

					<el-input
						v-model="searchForm.keyword"
						clearable
						placeholder="Tìm theo sản phẩm / kho"
					/>
				</div>

				<div class="search-item">
					<div class="search-label">Kho</div>

					<el-select
						v-model="searchForm.warehouse_id"
						clearable
						filterable
						placeholder="Chọn kho"
						style="width: 100%"
					>
						<el-option label="Warehouse 2" :value="2" />
					</el-select>
				</div>

				<div class="search-item">
					<div class="search-label">Sản phẩm</div>

					<el-select
						v-model="searchForm.product_id"
						clearable
						filterable
						placeholder="Chọn sản phẩm"
						style="width: 100%"
					>
						<el-option label="Loa bluetooth mini" :value="3" />
					</el-select>
				</div>

				<div class="search-item">
					<div class="search-label">Từ ngày</div>

					<el-date-picker
						v-model="searchForm.opening_date_from"
						type="date"
						value-format="YYYY-MM-DD"
						placeholder="Từ ngày"
						style="width: 100%"
					/>
				</div>
			</div>
		</div>

		<div class="inventory-opening-actions">
			<el-button type="primary" @click="handleCreate"> Thêm mới </el-button>
		</div>
	</div>

	<el-table
		v-if="!isMobile"
		:data="tableRows"
		:loading="loading"
		border
		:show-header="false"
		row-key="row_key"
		empty-text="Không có dữ liệu tồn đầu kỳ"
		style="width: 100%"
	>
		<el-table-column width="80">
			<template #default="{ row }">
				<template v-if="row.row_type === 'product_header'"> # </template>

				<template v-else-if="row.row_type === 'product'">
					{{ row.index }}
				</template>
			</template>
		</el-table-column>

		<el-table-column min-width="300">
			<template #default="{ row }">
				<template v-if="row.row_type === 'warehouse_summary'">
					<strong>{{ row.warehouse_name }}</strong>
					<span> - {{ row.warehouse_code }}</span>
				</template>

				<template v-else-if="row.row_type === 'product_header'"> Product </template>

				<template v-else>
					{{ row.product_name }}
				</template>
			</template>
		</el-table-column>

		<el-table-column width="160">
			<template #default="{ row }">
				<template v-if="row.row_type === 'warehouse_summary'">
					Opening: {{ row.opening_date }}
				</template>

				<template v-else-if="row.row_type === 'product_header'"> Unit </template>

				<template v-else>
					{{ row.unit_name }}
				</template>
			</template>
		</el-table-column>

		<el-table-column width="150" align="right">
			<template #default="{ row }">
				<template v-if="row.row_type === 'warehouse_summary'">
					Total qty: {{ row.total_quantity }}
				</template>

				<template v-else-if="row.row_type === 'product_header'"> Quantity </template>

				<template v-else>
					{{ row.quantity }}
				</template>
			</template>
		</el-table-column>

		<el-table-column width="160" align="right">
			<template #default="{ row }">
				<template v-if="row.row_type === 'product_header'"> Unit cost </template>

				<template v-else-if="row.row_type === 'product'">
					{{ Number(row.unit_cost).toLocaleString() }}
				</template>
			</template>
		</el-table-column>

		<el-table-column width="170" align="right">
			<template #default="{ row }">
				<template v-if="row.row_type === 'warehouse_summary'">
					Total: {{ Number(row.warehouse_total_cost).toLocaleString() }}
				</template>

				<template v-else-if="row.row_type === 'product_header'"> Amount </template>

				<template v-else>
					{{ Number(row.total_cost).toLocaleString() }}
				</template>
			</template>
		</el-table-column>

		<el-table-column label="Thao tác" width="160" fixed="right" align="center">
			<template #default="{ row }">
				<template v-if="row.row_type === 'product'">
					<el-button size="small" type="primary" @click="handleEdit(row)">
						Sửa
					</el-button>

					<el-button size="small" type="danger" @click="handleDelete(row)">
						Xóa
					</el-button>
				</template>
			</template>
		</el-table-column>
	</el-table>
	<div v-else v-loading="loading" class="inventory-opening-mobile">
		<el-empty v-if="!inventoryOpeningGroups.length" description="Không có dữ liệu tồn đầu kỳ" />

		<el-card
			v-for="group in inventoryOpeningGroups"
			:key="group.warehouse_id"
			class="inventory-opening-mobile-card"
		>
			<div class="mobile-warehouse-name">
				{{ group.warehouse.name }}
			</div>

			<div class="mobile-warehouse-code">
				{{ group.warehouse.code }} · {{ group.opening_date }}
			</div>

			<div class="mobile-summary">
				<div>Tổng SL: {{ group.total_quantity }}</div>
				<div>Tổng giá trị: {{ Number(group.total_cost).toLocaleString() }}</div>
			</div>

			<div v-for="detail in group.details" :key="detail.id" class="mobile-product-item">
				<div class="mobile-product-name">
					{{ detail.product_name }}
				</div>

				<div class="mobile-product-meta">
					{{ detail.unit_name }} · SL: {{ detail.quantity }}
				</div>

				<div class="mobile-product-meta">
					Giá vốn: {{ Number(detail.unit_cost).toLocaleString() }}
				</div>

				<div class="mobile-product-amount">
					Thành tiền: {{ Number(detail.total_cost).toLocaleString() }}
				</div>
			</div>
		</el-card>
	</div>
</template>
<style scoped>
.inventory-opening-mobile-card {
	margin-bottom: 12px;
}

.mobile-warehouse-name,
.mobile-product-name {
	font-weight: 600;
}

.mobile-warehouse-code,
.mobile-product-meta {
	margin-top: 4px;
	color: var(--el-text-color-secondary);
}

.mobile-summary,
.mobile-product-item {
	margin-top: 12px;
	padding-top: 12px;
	border-top: 1px solid var(--el-border-color-lighter);
}

.mobile-product-amount {
	margin-top: 4px;
	font-weight: 600;
}

.inventory-opening-toolbar {
	display: grid;
	grid-template-columns: minmax(0, 1fr) 120px;
	gap: 16px;
	margin-bottom: 12px;
	align-items: start;
}

.inventory-opening-search {
	min-width: 0;
}

.search-grid {
	display: grid;
	grid-template-columns: repeat(3, 260px);
	gap: 8px 16px;
	align-items: end;
}

.search-item {
	width: 260px;
}

.search-label {
	margin-bottom: 4px;
	font-size: 12px;
	font-weight: 600;
	line-height: 1;
}

.search-item :deep(.el-input),
.search-item :deep(.el-select),
.search-item :deep(.el-date-editor) {
	width: 100%;
}

.search-item :deep(.el-input__wrapper),
.search-item :deep(.el-select__wrapper) {
	min-height: 30px;
}

.search-item :deep(.el-input__inner) {
	height: 30px;
	line-height: 30px;
}

.inventory-opening-actions {
	display: flex;
	justify-content: flex-end;
	align-items: flex-start;
	padding-top: 22px;
}

.inventory-opening-actions :deep(.el-button) {
	height: 30px;
	padding: 0 14px;
}

@media (max-width: 768px) {
	.inventory-opening-toolbar {
		display: block;
	}

	.search-grid {
		grid-template-columns: 1fr;
		gap: 8px;
	}

	.search-item {
		width: 100%;
	}

	.inventory-opening-actions {
		margin-top: 10px;
		justify-content: flex-end;
	}
}

.inventory-opening-drawer {
	height: 100%;
	display: flex;
	flex-direction: column;
}

.drawer-scroll {
	flex: 1;
	min-height: 0;
}

.drawer-content {
	padding: 16px;
}

.drawer-main-layout {
	display: grid;
	grid-template-columns: minmax(0, 1fr) 320px;
	gap: 16px;
	align-items: start;
}

.drawer-form-panel,
.drawer-summary-panel {
	min-width: 0;
}

.drawer-form-panel :deep(.el-card__body) {
	padding: 20px;
}

.drawer-form-panel :deep(.el-form-item) {
	margin-bottom: 18px;
}

.drawer-form-panel :deep(.el-form-item__label) {
	justify-content: flex-start;
	font-weight: 500;
	color: #606266;
}

.drawer-form-panel :deep(.el-form-item__content) {
	min-width: 0;
}

.drawer-form-panel :deep(.el-select),
.drawer-form-panel :deep(.el-date-editor),
.drawer-form-panel :deep(.el-input-number),
.drawer-form-panel :deep(.el-textarea) {
	width: 100%;
}

.drawer-footer {
	padding: 12px 16px;
	border-top: 1px solid #ebeef5;
	display: flex;
	justify-content: flex-end;
	gap: 8px;
	background: #fff;
}

@media (max-width: 768px) {
	.drawer-content {
		padding: 12px;
	}

	.drawer-main-layout {
		grid-template-columns: 1fr;
	}

	.drawer-summary-panel {
		order: 2;
	}

	.drawer-form-panel :deep(.el-card__body) {
		padding: 16px;
	}

	.drawer-form-panel :deep(.el-form-item) {
		display: block;
		margin-bottom: 16px;
	}

	.drawer-form-panel :deep(.el-form-item__label) {
		width: auto !important;
		margin-bottom: 6px;
		line-height: 1.4;
	}

	.drawer-form-panel :deep(.el-form-item__content) {
		margin-left: 0 !important;
	}

	.drawer-footer {
		position: sticky;
		bottom: 0;
	}
}

.summary-card {
	position: sticky;
	top: 0;
}

.summary-list {
	display: flex;
	flex-direction: column;
	gap: 14px;
}

.summary-item {
	display: flex;
	flex-direction: column;
	gap: 4px;
	padding-bottom: 12px;
	border-bottom: 1px solid #f0f2f5;
}

.summary-label {
	font-size: 13px;
	color: #909399;
}

.summary-value {
	font-size: 14px;
	font-weight: 500;
	color: #303133;
	word-break: break-word;
}

.summary-total {
	margin-top: 8px;
	padding: 16px;
	border-radius: 8px;
	background: #f5f7fa;
}

.summary-total-label {
	font-size: 13px;
	color: #606266;
	margin-bottom: 6px;
}

.summary-total-value {
	font-size: 24px;
	font-weight: 700;
	color: #409eff;
}
</style>
