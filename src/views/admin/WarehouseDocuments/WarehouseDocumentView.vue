<script setup lang="ts">
import AppTable from '@/components/common/AppTable.vue'
import type { TableColumn } from '@/types/table.ts'
import { ref, onMounted, reactive, computed } from 'vue'
import AppModal from '@/components/common/AppModal.vue'
import { ElMessage } from 'element-plus'
import type { WarehouseDocument } from '@/types/WarehouseDocument.ts'
import type { Pagination } from '@/types/pagination.ts'
import { getWarehouseDocumentList, showWarehouseDocumentApi } from '@/api/warehouseDocument.api.ts'
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
	form.id = 0
	form.business_id = 0
}
const handlePageChange = (page: number) => {
	pagination.page = page
	fetchWarehouseDocuments()
}

const handleAction = async (payload: { key: string; row: Record<string, any> }) => {
	if (payload.key === 'edit') {
		modalMode.value = 'edit'
		await handleViewWarehouseDocument(payload.row.id)
	}

	if (payload.key === 'view') {
		modalMode.value = 'view'
		await handleViewWarehouseDocument(payload.row.id)
	}

	if (payload.key === 'delete') {
		console.log('delete', payload.row)
	}
}

const handleReset = () => {
	searchForm.document_code = ''
	searchForm.document_type = null
	fetchWarehouseDocuments()
}

const handleSearch = () => {
	pagination.page = 1
	fetchWarehouseDocuments()
}
//modal
const showCreateModal = ref(false)
const modalMode = ref<'create' | 'edit' | 'view'>('create')
const handleOpenCreateModal = () => {
	modalMode.value = 'create'
	resetCreateForm()
	showCreateModal.value = true
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

const handleViewWarehouseDocument = async (id:number) => {
	try {
		const res = await showWarehouseDocumentApi(id)
		form.value = res.data.data
		modalMode.value = 'view'
		showCreateModal.value = true
	} catch (error) {
		console.error(error)
	}
}

onMounted(async () => {
	try {
		await Promise.all([fetchWarehouseDocuments()])
	} catch (error) {
		console.error(error)
	}
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

		<AppModal
	v-model="showCreateModal"
	:title="
		modalMode === 'create'
			? 'Tạo mới phiếu kho'
			: modalMode === 'edit'
				? 'Cập nhật phiếu kho'
				: 'Chi tiết phiếu kho'
	"
	width="1200px"
	:show-confirm="modalMode !== 'view'"
	@close="handleCloseCreateModal"
	@confirm="handleSubmit"
>
	<template v-if="modalMode === 'view'">
		<div v-if="form" class="document-detail-modal">
			<div class="document-detail-modal__header">
				<div class="info-card">
					<div class="info-card__title">Thông tin phiếu</div>
					<div class="info-card__body">
						<div class="info-row">
							<span class="info-row__label">Mã phiếu:</span>
							<span class="info-row__value">{{ form.document_code || '--' }}</span>
						</div>
						<div class="info-row">
							<span class="info-row__label">Loại phiếu:</span>
							<span class="info-row__value">
								{{ form.document_type === 'import' ? 'Phiếu nhập' : 'Phiếu xuất' }}
							</span>
						</div>
						<div class="info-row">
							<span class="info-row__label">Ngày chứng từ:</span>
							<span class="info-row__value">{{ form.document_date || '--' }}</span>
						</div>
						<div class="info-row">
							<span class="info-row__label">Trạng thái:</span>
							<span class="info-row__value">{{ form.status || '--' }}</span>
						</div>
						<div class="info-row">
							<span class="info-row__label">Mã tham chiếu:</span>
							<span class="info-row__value">{{ form.reference_code || '--' }}</span>
						</div>
					</div>
				</div>

				<div class="info-card">
					<div class="info-card__title">Thông tin kho</div>
					<div class="info-card__body">
						<div class="info-row">
							<span class="info-row__label">Mã kho:</span>
							<span class="info-row__value">{{ form.warehouse?.code || '--' }}</span>
						</div>
						<div class="info-row">
							<span class="info-row__label">Tên kho:</span>
							<span class="info-row__value">{{ form.warehouse?.name || '--' }}</span>
						</div>
						<div class="info-row">
							<span class="info-row__label">Business ID:</span>
							<span class="info-row__value">{{ form.business_id || '--' }}</span>
						</div>
					</div>
				</div>

				<div class="info-card">
					<div class="info-card__title">Người xử lý</div>
					<div class="info-card__body">
						<div class="info-row">
							<span class="info-row__label">Người tạo:</span>
							<span class="info-row__value">{{ form.creator?.name || '--' }}</span>
						</div>
						<div class="info-row">
							<span class="info-row__label">Người duyệt:</span>
							<span class="info-row__value">{{ form.approver?.name || '--' }}</span>
						</div>
						<div class="info-row">
							<span class="info-row__label">Ngày duyệt:</span>
							<span class="info-row__value">{{ form.approved_at || '--' }}</span>
						</div>
						<div class="info-row">
							<span class="info-row__label">Ngày tạo:</span>
							<span class="info-row__value">{{ form.created_at || '--' }}</span>
						</div>
					</div>
				</div>
			</div>

			<div class="document-detail-modal__content">
				<div class="document-detail-modal__main">
					<div class="section-title">Chi tiết sản phẩm</div>

					<!-- Desktop / tablet -->
					<div class="document-detail-table">
						<el-table :data="form.details || []" border style="width: 100%">
							<el-table-column type="index" label="STT" width="60" align="center" />
							<el-table-column prop="product.sku" label="SKU" min-width="120" />
							<el-table-column prop="product_name" label="Tên sản phẩm" min-width="180" />
							<el-table-column prop="unit_name" label="Đơn vị" min-width="100" />
							<el-table-column prop="quantity" label="Số lượng" min-width="100" align="right" />
							<el-table-column prop="unit_price" label="Đơn giá" min-width="120" align="right" />
							<el-table-column prop="tax_rate" label="Thuế suất" min-width="100" align="right" />
							<el-table-column prop="tax_price" label="Tiền thuế" min-width="120" align="right" />
							<el-table-column prop="total_price" label="Tổng tiền" min-width="120" align="right" />
						</el-table>
					</div>

					<!-- Mobile -->
					<div class="document-detail-mobile-list">
						<div
							v-for="(item, index) in form.details || []"
							:key="item.id"
							class="detail-mobile-card"
						>
							<div class="detail-mobile-card__header">
								<div class="detail-mobile-card__title">
									{{ index + 1 }}. {{ item.product_name || '--' }}
								</div>
								<div class="detail-mobile-card__sku">
									SKU: {{ item.product?.sku || '--' }}
								</div>
							</div>

							<div class="detail-mobile-card__body">
								<div class="detail-mobile-row">
									<span class="detail-mobile-row__label">Đơn vị</span>
									<span class="detail-mobile-row__value">{{ item.unit_name || '--' }}</span>
								</div>
								<div class="detail-mobile-row">
									<span class="detail-mobile-row__label">Số lượng</span>
									<span class="detail-mobile-row__value">{{ item.quantity || '--' }}</span>
								</div>
								<div class="detail-mobile-row">
									<span class="detail-mobile-row__label">Đơn giá</span>
									<span class="detail-mobile-row__value">{{ item.unit_price || '--' }}</span>
								</div>
								<div class="detail-mobile-row">
									<span class="detail-mobile-row__label">Thành tiền</span>
									<span class="detail-mobile-row__value">{{ item.subtotal || '--' }}</span>
								</div>
								<div class="detail-mobile-row">
									<span class="detail-mobile-row__label">Thuế suất</span>
									<span class="detail-mobile-row__value">{{ item.tax_rate || '--' }}</span>
								</div>
								<div class="detail-mobile-row">
									<span class="detail-mobile-row__label">Tiền thuế</span>
									<span class="detail-mobile-row__value">{{ item.tax_price || '--' }}</span>
								</div>
								<div class="detail-mobile-row detail-mobile-row--total">
									<span class="detail-mobile-row__label">Tổng tiền</span>
									<span class="detail-mobile-row__value">{{ item.total_price || '--' }}</span>
								</div>
								<div class="detail-mobile-row">
									<span class="detail-mobile-row__label">Ghi chú</span>
									<span class="detail-mobile-row__value">{{ item.note || '--' }}</span>
								</div>
							</div>
						</div>
					</div>
				</div>

				<div class="document-detail-modal__sidebar">
					<div class="summary-card">
						<div class="summary-card__title">Tổng hợp</div>

						<div class="summary-row">
							<span>Tạm tính</span>
							<strong>{{ form.subtotal_amount || '--' }}</strong>
						</div>

						<div class="summary-row">
							<span>Thuế</span>
							<strong>{{ form.tax_amount || '--' }}</strong>
						</div>

						<div class="summary-row summary-row--grand">
							<span>Tổng tiền</span>
							<strong>{{ form.total_amount || '--' }}</strong>
						</div>
					</div>

					<div class="summary-card">
						<div class="summary-card__title">Ghi chú chứng từ</div>
						<div class="summary-note">
							{{ form.note || '--' }}
						</div>
					</div>
				</div>
			</div>
		</div>
	</template>

	<template v-else>
		<div>Form create / edit để làm sau</div>
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

.document-detail-modal {
	display: flex;
	flex-direction: column;
	gap: 20px;
}

.document-detail-modal__header {
	display: grid;
	grid-template-columns: repeat(3, minmax(0, 1fr));
	gap: 16px;
}

.document-detail-modal__content {
	display: grid;
	grid-template-columns: minmax(0, 1fr) 280px;
	gap: 16px;
	align-items: start;
}

.document-detail-modal__main {
	min-width: 0;
}

.document-detail-modal__sidebar {
	display: flex;
	flex-direction: column;
	gap: 16px;
}

.info-card,
.summary-card {
	border: 1px solid #ebeef5;
	border-radius: 10px;
	background: #fff;
	padding: 16px;
}

.info-card__title,
.summary-card__title,
.section-title {
	margin-bottom: 14px;
	font-size: 16px;
	font-weight: 600;
	color: #303133;
}

.info-card__body {
	display: flex;
	flex-direction: column;
	gap: 10px;
}

.info-row {
	display: flex;
	gap: 8px;
	font-size: 14px;
	line-height: 1.5;
}

.info-row__label {
	min-width: 110px;
	font-weight: 600;
	color: #606266;
}

.info-row__value {
	color: #303133;
	word-break: break-word;
}

.document-detail-table {
	display: block;
}

.document-detail-mobile-list {
	display: none;
}

.summary-row {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 10px 0;
	font-size: 14px;
	border-bottom: 1px solid #f0f2f5;
}

.summary-row:last-child {
	border-bottom: none;
}

.summary-row--grand {
	font-size: 16px;
	font-weight: 700;
	padding-top: 14px;
}

.summary-note {
	font-size: 14px;
	color: #606266;
	line-height: 1.6;
	word-break: break-word;
	min-height: 60px;
}

/* Mobile card list */
.detail-mobile-card {
	border: 1px solid #ebeef5;
	border-radius: 10px;
	background: #fff;
	padding: 14px;
	margin-bottom: 12px;
}

.detail-mobile-card:last-child {
	margin-bottom: 0;
}

.detail-mobile-card__header {
	padding-bottom: 10px;
	margin-bottom: 10px;
	border-bottom: 1px solid #f0f2f5;
}

.detail-mobile-card__title {
	font-size: 15px;
	font-weight: 600;
	color: #303133;
	line-height: 1.5;
}

.detail-mobile-card__sku {
	margin-top: 4px;
	font-size: 13px;
	color: #909399;
}

.detail-mobile-card__body {
	display: flex;
	flex-direction: column;
	gap: 8px;
}

.detail-mobile-row {
	display: flex;
	justify-content: space-between;
	align-items: flex-start;
	gap: 12px;
	font-size: 14px;
}

.detail-mobile-row__label {
	color: #606266;
	flex-shrink: 0;
}

.detail-mobile-row__value {
	color: #303133;
	text-align: right;
	word-break: break-word;
}

.detail-mobile-row--total {
	padding-top: 8px;
	margin-top: 4px;
	border-top: 1px dashed #dcdfe6;
	font-weight: 600;
}

@media (max-width: 1200px) {
	.document-detail-modal__header {
		grid-template-columns: 1fr;
	}

	.document-detail-modal__content {
		grid-template-columns: 1fr;
	}
}

@media (max-width: 768px) {
	.info-row {
		flex-direction: column;
		gap: 2px;
	}

	.info-row__label {
		min-width: unset;
	}

	.document-detail-table {
		display: none;
	}

	.document-detail-mobile-list {
		display: block;
	}

	.summary-card,
	.info-card {
		padding: 14px;
	}

	.section-title,
	.info-card__title,
	.summary-card__title {
		font-size: 15px;
	}
}
</style>
