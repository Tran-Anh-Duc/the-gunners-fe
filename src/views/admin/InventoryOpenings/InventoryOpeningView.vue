<script setup lang="ts">
import AppTable from '@/components/common/AppTable.vue'
import type { TableColumn } from '@/types/table.ts'
import { ref, onMounted, reactive, computed, onUnmounted } from 'vue'
import AppModal from '@/components/common/AppModal.vue'
import { ElMessage, ElDescriptions, ElDescriptionsItem } from 'element-plus'
import type {
	InventoryOpeningGroup,
	InventoryOpeningTableRow
} from '@/types/inventoryOpening.ts'
import type { Pagination } from '@/types/pagination.ts'
import {
	getInventoryOpeningsList,
	createInventoryOpeningApi
} from '@/api/inventoryOpening.api.ts'
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

const handleCreate = () => {
	console.log('create inventory opening')
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
			<el-button type="primary" @click="handleCreate">
				Thêm mới
			</el-button>
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
				<template v-if="row.row_type === 'product_header'">
					#
				</template>

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

				<template v-else-if="row.row_type === 'product_header'">
					Product
				</template>

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

				<template v-else-if="row.row_type === 'product_header'">
					Unit
				</template>

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

				<template v-else-if="row.row_type === 'product_header'">
					Quantity
				</template>

				<template v-else>
					{{ row.quantity }}
				</template>
			</template>
		</el-table-column>

		<el-table-column width="160" align="right">
			<template #default="{ row }">
				<template v-if="row.row_type === 'product_header'">
					Unit cost
				</template>

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

				<template v-else-if="row.row_type === 'product_header'">
					Amount
				</template>

				<template v-else>
					{{ Number(row.total_cost).toLocaleString() }}
				</template>
			</template>
		</el-table-column>

		<el-table-column label="Thao tác" width="160" fixed="right" align="center">
			<template #default="{ row }">
				<template v-if="row.row_type === 'product'">
					<el-button
						size="small"
						type="primary"
						@click="handleEdit(row)"
					>
						Sửa
					</el-button>

					<el-button
						size="small"
						type="danger"
						@click="handleDelete(row)"
					>
						Xóa
					</el-button>
				</template>
			</template>
		</el-table-column>
	</el-table>
	<div
		v-else
		v-loading="loading"
		class="inventory-opening-mobile"
	>
		<el-empty
			v-if="!inventoryOpeningGroups.length"
			description="Không có dữ liệu tồn đầu kỳ"
		/>

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

			<div
				v-for="detail in group.details"
				:key="detail.id"
				class="mobile-product-item"
			>
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




</style>
