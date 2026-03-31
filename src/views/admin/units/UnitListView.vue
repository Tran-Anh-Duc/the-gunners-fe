<script setup lang="ts">
import AppTable from '@/components/common/AppTable.vue'
import type { TableColumn } from '@/types/table.ts'
import { ref, onMounted, reactive, computed } from 'vue'
import AppModal from '@/components/common/AppModal.vue'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '@/stores/auth.store.ts'
import type { User } from '@/types/user.ts'
import type { Unit } from '@/types/unit.ts'
import { getUnitList } from '@/api/unit.api.ts'

const columns: TableColumn[] = [
  { prop: 'code', label: 'Mã đơn vị' },
  { prop: 'name', label: 'Tên ơn vị' },
  { prop: 'description', label: 'Mô tả' },
  { prop: 'business_name', label: 'Cửa hàng' },
  { prop: 'is_active', label: 'Trạng thái' },
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
const units = ref<Unit[]>([])
const loading = ref(false)
const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 50,
})
const searchForm = reactive({
  name: '',
  code: '',
})
const handlePageChange = (page: number) => {
  pagination.page = page
  fetchUnits()
}
const handleAction = async (payload: { key: string; row: Record<string, any> }) => {
  if (payload.key === 'edit') {
    modalMode.value = 'edit'
    console.log('edit', payload.row)
    //await handleViewUser(payload.row.id)
  }

  if (payload.key === 'view') {
    modalMode.value = 'view'
    console.log('view', payload.row)
    //await handleViewUser(payload.row.id)
  }

  if (payload.key === 'delete') {
    console.log('delete', payload.row)
  }
}

const handleSearch = () => {
  pagination.page = 1
  fetchUnits()
}

const handleReset = () => {
  searchForm.name = ''
  searchForm.code = ''
  fetchUnits()
}

//modal
const showCreateModal = ref(false)
const modalMode = ref<'create' | 'edit' | 'view'>('create')
const authStore = useAuthStore()

//lấy thông tin user đang đăng nhập
const currentUserId = computed(() => authStore.user?.id)
const canEditPassword = computed(() => {
  return modalMode.value === 'create' || form.id === currentUserId.value
})

const fetchUnits = async () => {
  try {
    loading.value = true
    const res = await getUnitList({
      page: pagination.page,
      per_page: pagination.pageSize,
      name: searchForm.name,
      code: searchForm.code,
    })
    const responseData = res.data.data
    units.value = responseData.items.map((item: any) => ({
      ...item,
      is_active: item.is_active ? 'hoạt động' : 'Ngừng hoạt động',
    }))
    pagination.page = responseData.current_page
    pagination.pageSize = responseData.per_page
    pagination.total = responseData.total
  } catch (error) {
    console.error('lỗi fetchUnits:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchUnits()
})
</script>
<template>
  <div class="unit-list-view">
    <div class="search-box">
      <div class="search-box__header">
        <el-form :inline="true" class="search-form">
          <el-form-item label="Tên">
            <el-input v-model="searchForm.name" placeholder="Nhập tên" clearable />
          </el-form-item>
          <el-form-item label="Mã">
            <el-input v-model="searchForm.code" placeholder="Nhập mã" clearable />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch"> Tìm kiếm</el-button>
            <el-button @click="handleReset"> Đặt lại</el-button>
          </el-form-item>
        </el-form>
        <el-button type="success" @click="handleOpenCreateModal"> + Thêm mới</el-button>
      </div>
    </div>
    <AppTable
      :data="units"
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
          ? 'Tạo mới user'
          : modalMode === 'edit'
            ? 'Cập nhật user'
            : 'Chi tiết user'
      "
      @close="handleCloseCreateModal"
      @confirm="handleSubmit"
    >
      <template v-if="modalMode === 'view'">
        <el-form label-width="180px">
          <el-form-item label="ID" v-show="false">
            <span>{{ form?.id }}</span>
          </el-form-item>

          <el-form-item label="Business ID" v-show="false">
            <span>{{ form?.business_id }}</span>
          </el-form-item>

          <el-form-item label="Business name">
            <span>{{ form?.business_name }}</span>
          </el-form-item>

          <el-form-item label="Tên">
            <span>{{ form?.name }}</span>
          </el-form-item>

          <el-form-item label="Email">
            <span>{{ form?.email }}</span>
          </el-form-item>

          <el-form-item label="Phone">
            <span>{{ form?.phone || '-' }}</span>
          </el-form-item>

          <el-form-item label="Role">
            <span>{{ form?.role }}</span>
          </el-form-item>

          <el-form-item label="Trạng thái tại cửa hàng">
            <span>{{ form?.membership_status ? 'Đang hoạt động' : 'Ngưng hoạt động' }}</span>
          </el-form-item>

          <el-form-item label="Kích hoạt">
            <span>{{ form?.is_active ? 'Đang hoạt động' : 'Ngưng hoạt động' }}</span>
          </el-form-item>

          <el-form-item label="Owner">
            <span>{{ form?.is_owner ? 'Có' : 'Không' }}</span>
          </el-form-item>
        </el-form>
      </template>

      <template v-else>
        <el-form label-width="180px" label-position="left">
          <el-form-item label="ID" v-show="false">
            <el-input v-model="form.id" autocomplete="off" />
          </el-form-item>
          <el-form-item label="Tên">
            <el-input v-model="form.name" autocomplete="off" />
          </el-form-item>

          <el-form-item label="Email">
            <el-input v-model="form.email" autocomplete="new-email" />
          </el-form-item>

          <el-form-item v-if="canEditPassword" label="Password">
            <el-input
              v-model="form.password"
              type="password"
              autocomplete="new-password"
              show-password
            />
          </el-form-item>

          <el-form-item label="Phone">
            <el-input v-model="form.phone" autocomplete="off" />
          </el-form-item>

          <el-form-item label="Vai trò">
            <el-select v-model="form.role" placeholder="Chọn vai trò">
              <el-option label="manager" :value="manager" />
              <el-option label="staff" :value="staff" />
            </el-select>
          </el-form-item>

          <el-form-item label="Trạng thái tại cửa hàng" v-if="modalMode !== 'create'">
            <el-input v-model="form.membership_status" autocomplete="off" :disabled="true" />
          </el-form-item>

          <el-form-item label="Trạng thái tài khoản">
            <el-select v-model="form.is_active" placeholder="Chọn trạng thái">
              <el-option label="Hoạt động" :value="true" />
              <el-option label="Ngừng hoạt động" :value="false" />
            </el-select>
          </el-form-item>

          <el-form-item label="Business name">
            <el-input v-model="form.business_name" autocomplete="off" :disabled="!form.is_owner" />
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
<style>
.search-box__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
}

.search-form {
  flex: 1;
}

/*noinspection CssUnusedSymbol*/
.search-form .el-form-item {
  margin-bottom: 20px;
}
</style>
