<script setup lang="ts">
import AppTable from '@/components/common/AppTable.vue'
import type { TableColumn } from '@/types/table.ts'
import { ref, onMounted, reactive, computed, onUnmounted } from 'vue'
import AppModal from '@/components/common/AppModal.vue'
import { ElMessage, ElDescriptions, ElDescriptionsItem } from 'element-plus'
import type {
	WarehouseDocument,
	WarehouseDocumentFormDetail,
	WarehouseDocumentFormRequest,
	WarehouseDocumentListParams,
} from '@/types/WarehouseDocument.ts'
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
const createDefaultWarehouseDocumentDetail = (): WarehouseDocumentFormDetail => ({
	product_id: null,
	product_name: '',
	unit_id: null,
	unit_name: '',
	quantity: 1,
	unit_price: 0,
	subtotal: 0,
	tax_rate: 0,
	tax_price: 0,
	total_price: 0,
	note: null,
})
const createDefaultWarehouseDocumentForm = (): WarehouseDocumentFormRequest => ({
	business_id: 1,
	document_code: '',
	document_type: 'import',
	warehouse_id: null,
	document_date: '',
	status: 'draft',
	reference_code: null,
	note: null,
	approved_by: null,
	approved_at: null,
	details: [createDefaultWarehouseDocumentDetail()],
})

const form = reactive<WarehouseDocumentFormRequest>(createDefaultWarehouseDocumentForm())
const warehouseDocuments = ref<WarehouseDocument[]>([])
const loading = ref(false)
const submitLoading = ref(false)
const pagination = reactive<Pagination>({
	page: 1,
	pageSize: 10,
	total: 0,
})
const searchForm = reactive<WarehouseDocumentListParams>({
	document_code: '',
	document_type: null,
})
const resetCreateForm = () => {
	Object.assign(form, createDefaultWarehouseDocumentForm())
}
const handlePageChange = (page: number) => {
	pagination.page = page
	fetchWarehouseDocuments()
}

const handleAction = async (payload: { key: string; row: Record<string, any> }) => {
	if (payload.key === 'edit' || payload.key === 'view') {
		modalMode.value = payload.key
		await getWarehouseDocumentDetail(payload.row.id)
		showDrawer.value = true
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
	resetCreateForm()
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
const mapWarehouseDocumentToForm = (data: WarehouseDocument): WarehouseDocumentFormRequest => {
	return {
		business_id: data.business_id ?? null,
		document_code: data.document_code ?? '',
		document_type:
			data.document_type === 'import' || data.document_type === 'export'
				? data.document_type
				: 'import',

		warehouse_id: data.warehouse?.id ?? null,
		warehouse_name: data.warehouse.name ?? null,
		document_date: data.document_date ?? '',
		status:
			data.status === 'draft' || data.status === 'confirmed' || data.status === 'cancelled'
				? data.status
				: 'draft',

		reference_code: data.reference_code ?? null,
		note: data.note ?? null,

		approved_by: data.approver?.id ?? null,
		approved_at: data.approved_at ?? null,

		details:
			data.details && data.details.length > 0
				? data.details.map((item) => ({
						product_id: item.product_id ?? null,
						product_name: item.product_name ?? '',
						unit_id: item.unit_id ?? null,
						unit_name: item.unit_name ?? '',

						// ⚠️ ép string → number
						quantity: Number(item.quantity ?? 0),
						unit_price: Number(item.unit_price ?? 0),
						subtotal: Number(item.subtotal ?? 0),
						tax_rate: Number(item.tax_rate ?? 0),
						tax_price: Number(item.tax_price ?? 0),
						total_price: Number(item.total_price ?? 0),

						note: item.note ?? null,
					}))
				: [createDefaultWarehouseDocumentDetail()],
	}
}
const getWarehouseDocumentDetail = async (id: number) => {
	try {
		const res = await showWarehouseDocumentApi(id)
		const data = res.data.data
		Object.assign(form, mapWarehouseDocumentToForm(data))
		console.log(form)
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
					<div class="document-overview">
						<el-row :gutter="0">
							<el-col :xs="36" :sm="36" :md="12">
								<el-card>
									<div class="overview-card__title">Thông tin chứng từ</div>

									<el-descriptions :column="2" border label-width="140px">
										<el-descriptions-item label="Mã chứng từ">
											{{ form.document_code }}
										</el-descriptions-item>

										<el-descriptions-item label="Loại">
											{{
												form.document_type === 'export'
													? 'Xuất kho'
													: 'Nhập kho'
											}}
										</el-descriptions-item>

										<el-descriptions-item label="Ngày chứng từ">
											{{ form.document_date }}
										</el-descriptions-item>

										<el-descriptions-item label="Trạng thái">
											<el-tag
												:type="
													form.status === 'confirmed' ? 'success' : 'info'
												"
											>
												{{
													form.status === 'confirmed'
														? 'Đã xác nhận'
														: form.status
												}}
											</el-tag>
										</el-descriptions-item>

										<el-descriptions-item label="Kho">
											{{ form.warehouse?.name }}
										</el-descriptions-item>

										<el-descriptions-item label="Mã tham chiếu">
											{{ form.reference_code || '-' }}
										</el-descriptions-item>
									</el-descriptions>
								</el-card>
							</el-col>

							<el-col :xs="36" :sm="36" :md="12">
								<el-card>
									<div class="overview-card__title">Thông tin xử lý</div>

									<el-descriptions :column="2" border label-width="140px">
										<el-descriptions-item label="Người tạo">
											{{ form.creator?.name || '-' }}
										</el-descriptions-item>

										<el-descriptions-item label="Ngày tạo">
											{{ form.created_at }}
										</el-descriptions-item>

										<el-descriptions-item label="Người duyệt">
											{{ form.approver?.name || '-' }}
										</el-descriptions-item>

										<el-descriptions-item label="Ngày duyệt">
											{{ form.approved_at || '-' }}
										</el-descriptions-item>

										<el-descriptions-item label="Người cập nhật">
											{{ form.updater?.name || '-' }}
										</el-descriptions-item>

										<el-descriptions-item label="Ngày cập nhật">
											{{ form.updated_at || '-' }}
										</el-descriptions-item>
									</el-descriptions>
								</el-card>
							</el-col>
						</el-row>
					</div>
				</template>

				<template v-else>
					<div class="document-form-modal">
						<!-- form create / edit ở đây -->
					</div>
				</template>
			</div>

			<template #footer>
				<div class="drawer-footer">
					<el-button @click="handleCloseCreateModal">Đóng</el-button>

					<el-button
						v-if="modalMode !== 'view'"
						type="primary"
						:loading="submitLoading"
						@click="handleSubmit"
					>
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

.document-overview {
	width: 100%;
	max-width: 100%;
	overflow-x: hidden;
	box-sizing: border-box;
}

:deep(.document-overview .el-col) {
	padding-right: 8px;
	padding-left: 8px;
	margin-bottom: 16px;
	box-sizing: border-box;
}
</style>
