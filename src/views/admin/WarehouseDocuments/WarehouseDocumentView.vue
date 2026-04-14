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
const formatMoney = (value: number | string | null | undefined): string => {
	if (value === null || value === undefined || value === '') return '0'

	const number = Number(value)

	if (isNaN(number)) return '0'

	return new Intl.NumberFormat('vi-VN').format(number)
}
const handleAddDetailRow = () => {
	form.details.push(createDefaultWarehouseDocumentDetail())
}
const handleRemoveDetailRow = (index: number) => {
	form.details.splice(index, 1)
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
		approver_name: data.approver.name ?? null,
		approved_by: data.approver?.id ?? null,
		approved_at: data.approved_at ?? null,
		creator_name: data.creator.name ?? null,
		created_at: data.created_at ?? null,
		updated_at: data.updated_at ?? null,
		subtotal_amount: data.subtotal_amount ?? 0,
		tax_amount: data.tax_amount ?? 0,
		total_amount: data.total_amount ?? 0,
		details:
			data.details && data.details.length > 0
				? data.details.map((item) => ({
						product_id: item.product_id ?? null,
						product_name: item.product_name ?? '',
						unit_id: item.unit_id ?? null,
						unit_name: item.unit_name ?? '',
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
			:size="isMobile ? '100%' : modalMode === 'view' ? '90%' : '90%'"
			:with-header="true"
			:destroy-on-close="false"
			@close="handleCloseCreateModal"
		>
			<template #header>
				<div class="drawer-title">
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
											{{ form.warehouse_name }}
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
											{{ form.creator_name || '-' }}
										</el-descriptions-item>

										<el-descriptions-item label="Ngày tạo">
											{{ form.created_at }}
										</el-descriptions-item>

										<el-descriptions-item label="Người duyệt">
											{{ form.approver_name || '-' }}
										</el-descriptions-item>

										<el-descriptions-item label="Ngày duyệt">
											{{ form.approved_at || '-' }}
										</el-descriptions-item>

										<el-descriptions-item label="Người cập nhật">
											{{ form.approver_name || '-' }}
										</el-descriptions-item>

										<el-descriptions-item label="Ngày cập nhật">
											{{ form.updated_at || '-' }}
										</el-descriptions-item>
									</el-descriptions>
								</el-card>
							</el-col>
						</el-row>
					</div>
					<div>
						<el-card class="detail-table-card">
							<el-table :data="form?.details ?? []" border style="width: 100%">
								<el-table-column
									prop="product_name"
									label="Sản phẩm"
									align="left"
								/>
								<el-table-column
									prop="unit_name"
									label="Đơn vị"
									width="100"
									align="left"
								/>
								<el-table-column
									prop="quantity"
									label="SL"
									width="80"
									align="right"
								/>

								<el-table-column label="Đơn giá" align="right">
									<template #default="{ row }">
										{{ formatMoney(row.unit_price) }}
									</template>
								</el-table-column>

								<el-table-column label="Thành tiền" align="right">
									<template #default="{ row }">
										{{ formatMoney(row.subtotal) }}
									</template>
								</el-table-column>

								<el-table-column
									prop="tax_rate"
									label="Thuế (%)"
									width="100"
									align="right"
								/>

								<el-table-column label="Tiền thuế" align="right">
									<template #default="{ row }">
										{{ formatMoney(row.tax_price) }}
									</template>
								</el-table-column>

								<el-table-column label="Tổng tiền" align="right">
									<template #default="{ row }">
										{{ formatMoney(row.total_price) }}
									</template>
								</el-table-column>
							</el-table>
						</el-card>
					</div>
					<div class="document-footer">
						<!-- LEFT: NOTE -->
						<div class="document-note">
							<div class="document-note__title">Ghi chú</div>
							<div class="document-note__content">
								{{ form?.note || 'Không có ghi chú' }}
							</div>
						</div>

						<!-- RIGHT: SUMMARY -->
						<div class="document-summary">
							<div class="document-summary__row">
								<span>Tổng tiền hàng</span>
								<strong>{{ formatMoney(form?.subtotal_amount) }}</strong>
							</div>
							<div class="document-summary__row">
								<span>Tổng thuế</span>
								<strong>{{ formatMoney(form?.tax_amount) }}</strong>
							</div>
							<div class="document-summary__row document-summary__row--total">
								<span>Thành tiền</span>
								<strong>{{ formatMoney(form?.total_amount) }}</strong>
							</div>
						</div>
					</div>
				</template>

				<template v-else>
					<div class="document-overview-form">
						<el-row :gutter="16">
							<el-col :xs="24" :sm="24" :md="12">
								<el-card>
									<div class="overview-card__title">Thông tin chứng từ</div>

									<el-form
										:model="form"
										label-position="top"
										class="document-form-section"
									>
										<el-row :gutter="16">
											<el-col :span="12">
												<el-form-item label="Mã chứng từ">
													<el-input
														v-model="form.document_code"
														placeholder="Nhập mã chứng từ"
													/>
												</el-form-item>
											</el-col>

											<el-col :span="12">
												<el-form-item label="Loại">
													<el-select
														v-model="form.document_type"
														placeholder="Chọn loại phiếu"
														style="width: 100%"
													>
														<el-option
															label="Xuất kho"
															value="export"
														/>
														<el-option
															label="Nhập kho"
															value="import"
														/>
													</el-select>
												</el-form-item>
											</el-col>

											<el-col :span="12">
												<el-form-item label="Ngày chứng từ">
													<el-date-picker
														v-model="form.document_date"
														type="datetime"
														placeholder="Chọn ngày chứng từ"
														style="width: 100%"
													/>
												</el-form-item>
											</el-col>

											<el-col :span="12">
												<el-form-item label="Kho">
													<el-select
														v-model="form.warehouse_id"
														placeholder="Chọn kho"
														style="width: 100%"
													>
														<!-- ví dụ -->
														<!--
														<el-option
														  v-for="item in warehouseOptions"
														  :key="item.id"
														  :label="item.name"
														  :value="item.id"
														/>
														-->
													</el-select>
												</el-form-item>
											</el-col>

											<el-col :span="12">
												<el-form-item label="Mã tham chiếu">
													<el-input
														v-model="form.reference_code"
														placeholder="Nhập mã tham chiếu"
													/>
												</el-form-item>
											</el-col>
											<el-col :span="12">
												<el-form-item label="Trạng thái">
													<el-select
														v-model="form.status"
														style="width: 100%"
													>
														<el-option label="Nháp" value="draft" />
														<el-option
															label="Đã xác nhận"
															value="confirmed"
														/>
														<el-option
															label="Đã hủy"
															value="cancelled"
														/>
													</el-select>
												</el-form-item>
											</el-col>
										</el-row>
									</el-form>
								</el-card>
							</el-col>

							<el-col :xs="24" :sm="24" :md="12">
								<el-card>
									<div class="overview-card__title">Thông tin xử lý</div>

									<el-form
										:model="form"
										label-position="top"
										class="document-form-section"
									>
										<el-row :gutter="16">
											<el-col :span="12">
												<el-form-item label="Người tạo">
													<el-input
														v-model="form.creator_name"
														readonly
													/>
												</el-form-item>
											</el-col>

											<el-col :span="12">
												<el-form-item label="Ngày tạo">
													<el-input v-model="form.created_at" readonly />
												</el-form-item>
											</el-col>

											<el-col :span="12">
												<el-form-item label="Người duyệt">
													<el-input
														v-model="form.approver_name"
														readonly
													/>
												</el-form-item>
											</el-col>

											<el-col :span="12">
												<el-form-item label="Ngày duyệt">
													<el-input v-model="form.approved_at" readonly />
												</el-form-item>
											</el-col>

											<el-col :span="12">
												<el-form-item label="Người cập nhật">
													<el-input
														v-model="form.updater_name"
														readonly
													/>
												</el-form-item>
											</el-col>

											<el-col :span="12">
												<el-form-item label="Ngày cập nhật">
													<el-input v-model="form.updated_at" readonly />
												</el-form-item>
											</el-col>
										</el-row>
									</el-form>
								</el-card>
							</el-col>
						</el-row>
					</div>
					<el-card class="detail-section">
						<div class="overview-card__title detail-section__header">
							<span>Chi tiết sản phẩm</span>
							<el-button type="primary" plain @click="handleAddDetailRow">
								+ Thêm dòng
							</el-button>
						</div>

						<el-table :data="form.details" border style="width: 100%">
							<el-table-column label="Sản phẩm" min-width="220">
								<template #default="{ row }">
									<el-select
										v-model="row.product_id"
										placeholder="Chọn sản phẩm"
										style="width: 100%"
									>
										<!-- options -->
									</el-select>
								</template>
							</el-table-column>

							<el-table-column label="Đơn vị" min-width="140">
								<template #default="{ row }">
									<el-input v-model="row.unit_name" readonly />
								</template>
							</el-table-column>

							<el-table-column label="SL" width="120" align="right">
								<template #default="{ row }">
									<el-input-number
										v-model="row.quantity"
										:min="1"
										style="width: 100%"
									/>
								</template>
							</el-table-column>

							<el-table-column label="Đơn giá" width="150" align="right">
								<template #default="{ row }">
									<el-input-number
										v-model="row.unit_price"
										:min="0"
										:precision="2"
										style="width: 100%"
									/>
								</template>
							</el-table-column>

							<el-table-column label="Thuế (%)" width="120" align="right">
								<template #default="{ row }">
									<el-input-number
										v-model="row.tax_rate"
										:min="0"
										:max="100"
										style="width: 100%"
									/>
								</template>
							</el-table-column>

							<el-table-column label="Thành tiền" width="160" align="right">
								<template #default="{ row }">
									{{ formatMoney(row.total_price) }}
								</template>
							</el-table-column>

							<el-table-column label="Ghi chú" min-width="180">
								<template #default="{ row }">
									<el-input v-model="row.note" placeholder="Nhập ghi chú" />
								</template>
							</el-table-column>

							<el-table-column
								label="Thao tác"
								width="90"
								fixed="right"
								align="center"
							>
								<template #default="{ $index }">
									<el-button
										type="danger"
										link
										@click="handleRemoveDetailRow($index)"
									>
										Xóa
									</el-button>
								</template>
							</el-table-column>
						</el-table>
					</el-card>
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

:deep(.search-form__item .el-form-item__label) {
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

:deep(.search-box__actions .el-button) {
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

	:deep(.search-box__actions .el-button) {
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

.overview-card__title {
	margin-bottom: 5px;
	font-weight: 600;
}

:deep(.detail-table-card) {
	margin: 16px 10px 0;
}

.document-footer {
	display: flex;
	gap: 16px;
	margin-top: 16px;
}

/* LEFT */
.document-note {
	flex: 1;
	background: #fff;
	border: 1px solid #ebeef5;
	border-radius: 8px;
	padding: 12px 16px;
	margin-left: 10px;
}

.document-note__title {
	font-weight: 600;
	margin-bottom: 8px;
}

.document-note__content {
	color: #606266;
}

/* RIGHT */
.document-summary {
	width: 320px;
	background: #fff;
	border: 1px solid #ebeef5;
	border-radius: 8px;
	padding: 12px 16px;
	margin-right: 10px;
}

.document-summary__row {
	display: flex;
	justify-content: space-between;
	padding: 6px 0;
}

.document-summary__row--total {
	font-size: 16px;
	font-weight: 700;
	border-top: 1px solid #ebeef5;
	margin-top: 8px;
	padding-top: 10px;
}
.drawer-title {
	font-size: 20px;
	font-weight: 600;
	color: #1f2d3d; /* đậm hơn 1 chút */
}

.document-overview-form {
	overflow-x: hidden;
	padding: 0 20px;
	box-sizing: border-box;
}

.document-form-section :deep(.el-form-item__label) {
	font-weight: 500;
	color: #303133;
}

.document-form-section :deep(.el-form-item) {
	margin-bottom: 16px;
}

.document-form-section :deep(.el-form-item__label) {
	font-weight: 500;
	color: #303133;
}

.document-form-section :deep(.el-form-item) {
	margin-bottom: 16px;
}

.document-form-section :deep(.el-input.is-disabled .el-input__wrapper),
.document-form-section :deep(.el-input__wrapper) {
	box-sizing: border-box;
}

.document-form-section :deep(input[readonly]) {
	color: #606266;
}
</style>
