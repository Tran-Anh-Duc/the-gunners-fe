<script setup lang="ts">
import AppTable from '@/components/common/AppTable.vue'
import type { TableColumn } from '@/types/table.ts'
import { ref, onMounted, reactive, computed } from 'vue'
import AppModal from '@/components/common/AppModal.vue'
import { ElMessage } from 'element-plus'
import type { Supplier, SupplierFormState   } from '@/types/supplier.ts'
import {
	getSuppliersList,
	showSupplierApi,
	createSupplierApi,
	updateSupplierApi,
} from '@/api/supplier.api.ts'
import type { Pagination } from '@/types/pagination.ts'
//table
const columns: TableColumn[] = [
	{ prop: 'name', label: 'Tên danh mục' },
	{ prop: 'contact_name', label: 'Tên người đại diện' },
	{ prop: 'description', label: 'Mô tả' },
	{ prop: 'phone', label: 'Số điện thoại' },
	{ prop: 'email', label: 'Địa chỉ Email' },
	{ prop: 'address', label: 'Địa chỉ' },
	{ prop: 'note', label: 'Ghi chú' },
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
const createDefaultForm = (): SupplierFormState => ({
	id: 0,
	business_id: null,
	name: '',
	contact_name: null,
	phone: null,
	email: null,
	address: null,
	note: null,
	description: null,
	is_active: true,
})
const form = reactive<SupplierFormState>(createDefaultForm())

const suppliers = ref<Supplier[]>([])
const loading = ref(false)
const pagination = reactive<Pagination>({
	page: 1,
	pageSize: 10,
	total: 0,
})
const searchForm = reactive({
	name: '',
	contact_name: '',
	phone: '',
	email: '',
	address: '',
	note: '',
	is_active: null,
})
const resetCreateForm = () => {
	Object.assign(form, createDefaultForm())
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
//even
const handlePageChange = (page: number) => {
	pagination.page = page
	fetchSuppliers()
}
const handleAction = async (payload: { key: string; row: Record<string, any> }) => {
	if (payload.key === 'edit') {
		modalMode.value = 'edit'
		await handleViewSupplier(payload.row.id)
	}

	if (payload.key === 'view') {
		modalMode.value = 'view'
		await handleViewSupplier(payload.row.id)
	}

	if (payload.key === 'delete') {
		console.log('delete', payload.row)
	}
}
const handleReset = () => {
	searchForm.name = ''
	searchForm.is_active = null
	fetchSuppliers()
}
const handleSearch = () => {
	pagination.page = 1
	fetchSuppliers()
}

//function
const fetchSuppliers = async () => {
	try {
		loading.value = true
		const res = await getSuppliersList({
			page: pagination.page,
			per_page: pagination.pageSize,
			name: searchForm.name,
			contact_name: searchForm.contact_name,
			phone: searchForm.phone,
			email: searchForm.email,
			address: searchForm.address,
			note: searchForm.note,
			is_active:
				searchForm.is_active === '' ||
				searchForm.is_active === null ||
				searchForm.is_active === undefined
					? undefined
					: Number(searchForm.is_active),
		})
		const responseData = res.data.data
		suppliers.value = responseData.items.map((item: any) => ({
			...item,
			is_active: item.is_active ? 'hoạt động' : 'Ngừng hoạt động',
		}))
		pagination.page = responseData.current_page ?? 1
		pagination.pageSize = responseData.per_page ?? 10
		pagination.total = responseData.total ?? 0
	} catch (error) {
		console.log(error)
	} finally {
		loading.value = false
	}
}
const handleViewSupplier = async (id: number) => {
	try {
		const res = await showSupplierApi(id)
		const suppllier = res.data.data
		form.id = suppllier.id
		form.name = suppllier.name
		form.contact_name = suppllier.contact_name ?? null
		form.phone = suppllier.phone ?? null
		form.email = suppllier.email ?? null
		form.address = suppllier.address ?? null
		form.note = suppllier.note ?? null
		form.is_active = Boolean(suppllier.is_active)
		showCreateModal.value = true
	} catch (error) {
		console.error(error)
	}
}
const handleSubmit = async () => {
	try {
		loading.value = true
		const payload = {
			name: form.name,
			contact_name: form.contact_name ?? undefined,
			phone: form.phone ?? undefined,
			email: form.email ?? undefined,
			address: form.address ?? undefined,
			note: form.note ?? undefined,
			is_active: form.is_active,
		}
		if (!form.id) {
			//create
			await createSupplierApi(payload)
			ElMessage.success('Tạo nguồn hàng thành công')
		} else {
			//edit
			await updateSupplierApi(form.id, payload)
			ElMessage.success('Cập nhật hàng thành công')
		}
		handleCloseCreateModal()
		await fetchSuppliers()
	} catch (error) {
		console.error(error)
	} finally {
		loading.value = false
	}
}

onMounted(async () => {
	try {
		loading.value = true
		await Promise.all([
			fetchSuppliers()
		])
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
						<el-form-item label="Tên người đại diện" class="search-form__item">
							<el-input
								v-model="searchForm.contact_name"
								placeholder="Nhập tên người đại diện"
								clearable
							/>
						</el-form-item>
						<el-form-item label="Số điện thoại" class="search-form__item">
							<el-input
								v-model="searchForm.phone"
								placeholder="Nhập số điện thoại"
								clearable
							/>
						</el-form-item>
						<el-form-item label="Email" class="search-form__item">
							<el-input
								v-model="searchForm.email"
								placeholder="Nhập email"
								clearable
							/>
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
			:data="suppliers"
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

					<el-form-item label="Người đại diện">
						<span class="unit-text">{{ form?.contact_name }}</span>
					</el-form-item>
					<el-form-item label="Số điện thoại">
						<span class="unit-text">{{ form?.phone }}</span>
					</el-form-item>
					<el-form-item label="Email">
						<span class="unit-text">{{ form?.email }}</span>
					</el-form-item>
					<el-form-item label="Địa chỉ">
						<span class="unit-text">{{ form?.address }}</span>
					</el-form-item>
					<el-form-item label="Ghi chú">
						<span class="unit-text">{{ form?.note }}</span>
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

					<el-form-item label="Người đại diện">
						<el-input v-model="form.contact_name" autocomplete="off" />
					</el-form-item>
					<el-form-item label="Số điện thoại">
						<el-input v-model="form.phone" autocomplete="off" />
					</el-form-item>
					<el-form-item label="Email">
						<el-input v-model="form.email" autocomplete="off" />
					</el-form-item>
					<el-form-item label="Địa chỉ">
						<el-input v-model="form.address" autocomplete="off" />
					</el-form-item>
					<el-form-item label="Ghi chú">
						<el-input v-model="form.note" autocomplete="off" />
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
