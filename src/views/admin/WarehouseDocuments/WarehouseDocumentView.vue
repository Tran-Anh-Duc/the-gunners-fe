<script setup lang="ts">
import AppTable from '@/components/common/AppTable.vue'
import type { TableColumn } from '@/types/table.ts'
import { ref, onMounted, reactive, computed, onUnmounted } from 'vue'
import AppModal from '@/components/common/AppModal.vue'
import { ElMessage } from 'element-plus'
import type { WarehouseDocument } from '@/types/WarehouseDocument.ts'
import type { Pagination } from '@/types/pagination.ts'
import { getWarehouseDocumentList, showWarehouseDocumentApi } from '@/api/warehouseDocument.api.ts'
const isMobile = ref(false)

const checkMobile = () => {
	isMobile.value = window.innerWidth <= 768
}
//table
const columns: TableColumn[] = [
	{ prop: 'document_code', label: 'Mã chứng từ' },
	{ prop: 'document_type', label: 'Loại chứng từ' },
	{ prop: 'document_date', label: 'Ngày chứng từ' },
	{ prop: 'status', label: 'Trạng thái' },
	{ prop: 'reference_code', label: 'Mã tham chiếu' },
	{ prop: 'tax_amount', label: 'Tổng tiền thuế' },
	{ prop: 'total_amount', label: 'Tổng tiền(Bao gồm thuế)' },
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
const getDefaultForm = (): WarehouseDocument => ({
	id: 0,
	business_id: 0,
	document_code: '',
	document_type: 'import',
	document_date: '',
	status: 'draft',
	reference_code: '',
	subtotal_amount: 0,
	tax_amount: 0,
	total_amount: 0,
	note: '',
	warehouse: null,
	creator: null,
	approver: null,
	approved_at: '',
	created_at: '',
	details: [],
})
const form = ref<WarehouseDocument | null>(null)
const warehouseDocuments = ref<WarehouseDocument[]>([])
const loading = ref(false)
const pagination = reactive<Pagination>({
	page: 1,
	pageSize: 10,
	total: 0,
})
const searchForm = reactive({
	document_code: '',
	document_type: null,
})
const resetCreateForm = () => {
	form.value = getDefaultForm()
}
const handlePageChange = (page: number) => {
	pagination.page = page
	fetchWarehouseDocuments()
}

const handleAction = async (payload: { key: string; row: Record<string, any> }) => {
	if (payload.key === 'edit') {
		modalMode.value = 'edit'
		showDrawer.value = true
		await getWarehouseDocumentDetail(payload.row.id)
		return
	}

	if (payload.key === 'view') {
		modalMode.value = 'view'
		showDrawer.value = true
		await getWarehouseDocumentDetail(payload.row.id)
		return
	}

	if (payload.key === 'delete') {
		console.log('delete', payload.row)
	}
}

const handleReset = () => {
	searchForm.document_code = ''
	searchForm.document_type = null
	pagination.page = 1
	fetchWarehouseDocuments()
}

const handleSearch = () => {
	pagination.page = 1
	fetchWarehouseDocuments()
}
//modal
const showDrawer = ref(false)
const modalMode = ref<'create' | 'edit' | 'view'>('create')
const handleOpenCreateModal = () => {
	modalMode.value = 'create'
	resetCreateForm()
	showDrawer.value = true
}
const handleCloseCreateModal = () => {
	showDrawer.value = false
	form.value = null
}

//function
const fetchWarehouseDocuments = async () => {
	try {
		loading.value = true
		const res = await getWarehouseDocumentList({
			page: pagination.page,
			per_page: pagination.pageSize,
			document_code: searchForm.document_code.trim() || undefined,
			document_type: searchForm.document_type || undefined,
		})
		const responseData = res.data.data
		warehouseDocuments.value = responseData.items
		pagination.page = responseData.current_page
		pagination.pageSize = responseData.per_page
		pagination.total = responseData.total
	} catch (error) {
		console.error(error)
	} finally {
		loading.value = false
	}
}

const getWarehouseDocumentDetail = async (id: number) => {
	try {
		const res = await showWarehouseDocumentApi(id)
		form.value = res.data.data
		modalMode.value = 'view'
		showDrawer.value = true
	} catch (error) {
		console.error(error)
	}
}

const handleSubmit = async () => {
	try {
		console.log('herr')
	} catch (error) {
		console.error(error)
	}
}

onMounted(async () => {
	try {
		// UI
		checkMobile()
		window.addEventListener('resize', checkMobile)

		// API
		await fetchWarehouseDocuments()
	} catch (error) {
		console.error(error)
	}
})

onUnmounted(() => {
	window.removeEventListener('resize', checkMobile)
})
</script>
<template>
	<div class="unit-list-view">
		<div class="search-box">
			<div class="search-box__header">
				<div class="search-box__left">
					<el-form class="search-form" label-position="top">
						<el-form-item label="Mã phiếu" class="search-form__item">
							<el-input
								v-model="searchForm.document_code"
								placeholder="Nhập mã phiếu"
								clearable
							/>
						</el-form-item>

						<el-form-item
							label="Loại phiếu"
							class="search-form__item search-form__item--status"
						>
							<el-select
								v-model="searchForm.document_type"
								placeholder="Chọn loại phiếu"
								clearable
							>
								<el-option label="Phiếu nhập" value="import" />
								<el-option label="Phiếu xuất" value="export" />
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
			:data="warehouseDocuments"
			:columns="columns"
			:loading="loading"
			:pagination="pagination"
			@action="handleAction"
			@page-change="handlePageChange"
		/>

		<el-drawer
			v-model="showDrawer"
			:size="isMobile ? '100%' : modalMode === 'view' ? '90%' : '70%'"
			:with-header="true"
			:destroy-on-close="false"
			@close="handleCloseCreateModal"
		>
			<template #header>
				<div>
					{{
						modalMode === 'create'
							? 'Tạo mới phiếu kho'
							: modalMode === 'edit'
								? 'Cập nhật phiếu kho'
								: 'Chi tiết phiếu kho'
					}}
				</div>
			</template>

			<div v-loading="loading">
				<template v-if="modalMode === 'view'">
					<div v-if="form" class="document-detail-modal">
						<!-- block detail hiện tại giữ gần như nguyên -->
					</div>
				</template>

				<template v-else>
					<div>Form create / edit ở đây</div>
				</template>
			</div>

			<template #footer>
				<div class="drawer-footer">
					<el-button @click="handleCloseCreateModal">Đóng</el-button>

					<el-button v-if="modalMode !== 'view'" type="primary" @click="handleSubmit">
						{{ modalMode === 'create' ? 'Tạo mới' : 'Cập nhật' }}
					</el-button>
				</div>
			</template>
		</el-drawer>
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

.document-detail-modal {
	display: flex;
	flex-direction: column;
	gap: 16px;
	height: 100%;
}

.document-detail-modal__header {
	display: grid;
	grid-template-columns: repeat(3, minmax(0, 1fr));
	gap: 16px;
}

.document-detail-modal__content {
	display: grid;
	grid-template-columns: minmax(0, 1fr) 320px;
	gap: 16px;
	align-items: start;
}

.document-detail-modal__main,
.document-detail-modal__sidebar {
	min-width: 0;
}

.drawer-footer {
	display: flex;
	justify-content: flex-end;
	gap: 12px;
	width: 100%;
}
</style>
