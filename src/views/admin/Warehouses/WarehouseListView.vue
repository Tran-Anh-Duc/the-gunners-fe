<script setup lang="ts">
import AppTable from '@/components/common/AppTable.vue'
import type { TableColumn } from '@/types/table.ts'
import { ref, onMounted, reactive, computed } from 'vue'
import AppModal from '@/components/common/AppModal.vue'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '@/stores/auth.store.ts'
import type { Warehouse } from '@/types/warehouse.ts'
import { getWarehouseList } from '@/api/warehouse.api.ts'
import type { Unit } from '@/types/unit.ts'
import type { Pagination } from '@/types/pagination.ts'

const columns: TableColumn[] = [
  { prop: 'code', label: 'Mã kho' },
  { prop: 'name', label: 'Tên kho' },
  { prop: 'address', label: 'Địa chỉ kho' },
  { prop: 'status', label: 'Trạng thái' },
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

const form = reactive({
  id: 0,
  business_id: null as number | null,
  name: '' | null,
  code: '' | null,
  address: '' | null,
  status: 'active' | null,
})

const warehouses = ref<Warehouse[]>([])
const loading = ref(false)
const pagination = reactive<Pagination>({
  page: 1,
  pageSize: 10,
  total: 0,
})

const searchForm = reactive({
  name: '',
  code: '',
  status: 'active',
})
const resetCreateForm = () => {
  form.id = 0
  form.business_id = 0
  form.name = ''
  form.code = ''
  form.address = ''
  form.status = 'active'
}

const handlePageChange = (page: number) => {
  pagination.page = page
  fetchWarehouses()
}

const handleAction = async (payload: { key: string; row: Record<string, any> }) => {
  if (payload.key === 'edit') {
    modalMode.value = 'edit'
    await handleViewWarehouse(payload.row.id)
  }

  if (payload.key === 'view') {
    modalMode.value = 'view'
    await handleViewWarehouse(payload.row.id)
  }

  if (payload.key === 'delete') {
    console.log('delete', payload.row)
  }
}
const handleSearch = () => {
  pagination.page = 1
  fetchWarehouses()
}
const handleReset = () => {
  searchForm.name = ''
  searchForm.code = ''
  searchForm.status = ''
  fetchWarehouses()
}

//Modal
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
//lấy thông tin user đang đăng nhập
const authStore = useAuthStore()
const currentUserId = computed(() => authStore.user?.id)
const businessIdCurrent = computed(() => authStore.user?.business_id)
const businessNameCurrent = computed(() => authStore.user?.business_name)
const canEditPassword = computed(() => {
  return modalMode.value === 'create' || form.id === currentUserId.value
})

//list funtion
const fetchWarehouses = async () => {
  try {
    loading.value = true
    const res = await getWarehouseList({
      page: pagination.page,
      per_page: pagination.pageSize,
      name: searchForm.name,
      code: searchForm.code,
      status: searchForm.status,
    })
    const responseData = res.data.data
    warehouses.value = responseData.items
    pagination.page = responseData.current_page
    pagination.pageSize = responseData.per_page
    pagination.total = responseData.total
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

const handleViewWarehouse = async () => {
  try {
    console.log('handleViewWarehouse')
  } catch (error) {
    console.error(error)
  }
}

onMounted(() => {
  fetchWarehouses()
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

            <el-form-item label="Trạng thái" class="search-form__item search-form__item--status">
              <el-select v-model="searchForm.status" placeholder="Chọn trạng thái" clearable>
                <el-option label="Hoạt động" value="active" />
                <el-option label="Ngừng hoạt động" value="unactive" />
              </el-select>
            </el-form-item>
          </el-form>
        </div>

        <div class="search-box__right">
          <div class="search-box__actions">
            <el-button type="primary" @click="handleSearch">Tìm kiếm</el-button>
            <el-button @click="handleReset">Đặt lại</el-button>
          </div>

          <el-button type="success" @click="handleOpenCreateModal" class="search-box__create">
            + Thêm mới
          </el-button>
        </div>
      </div>
    </div>

    <AppTable
      :data="warehouses"
      :columns="columns"
      :loading="loading"
      :pagination="pagination"
      @action="handleAction"
      @page-change="handlePageChange"
    />
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
  width: 160px;
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
 .search-box{
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