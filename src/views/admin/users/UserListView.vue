<script setup lang="ts">
import AppTable from '@/components/common/AppTable.vue'
import type { TableColumn } from '@/types/table.ts'
import { getUserList, createUserApi, showUserApi } from '@/api/user.api.ts'
import type { User } from '@/types/user.ts'
import { ref, onMounted, reactive } from 'vue'
import AppModal from '@/components/common/AppModal.vue'
import { ElMessage } from 'element-plus'

const columns: TableColumn[] = [
  { prop: 'name', label: 'Tên' },
  { prop: 'email', label: 'Email' },
  { prop: 'phone', label: 'SĐT' },
  { prop: 'business_name', label: 'Cửa hàng' },
  { prop: 'role', label: 'Vai trò' },
  { prop: 'membership_status', label: 'Trạng thái thành viên' },
  { prop: 'is_active', label: 'Hoạt động' },

  {
    label: 'Thao tác',
    type: 'actions',
    actions: [
      { key: 'edit', label: 'Sửa', type: 'primary' },
      { key: 'delete', label: 'Xóa', type: 'danger' },
    ],
  },
]

const loading = ref(false)

const searchForm = reactive({
  name: '',
  email: '',
  phone: '',
})

const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 50,
})

const users = ref<User[]>([])

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

const form = reactive({
  business_id: 1,
  name: '',
  email: '',
  password: '',
  phone: '',
  avatar: '',
  role: 'staff',
  membership_status: 'active',
  is_owner: false,
  is_active: true,
})

const resetCreateForm = () => {
  form.name = ''
  form.email = ''
  form.password = ''
  form.phone = ''
}

const fetchUsers = async () => {
  try {
    loading.value = true
    const res = await getUserList({
      page: pagination.page,
      per_page: pagination.pageSize,
      name: searchForm.name,
      email: searchForm.email,
      phone: searchForm.phone,
    })
    const responseData = res.data.data
    users.value = responseData.items
    pagination.page = responseData.current_page
    pagination.pageSize = responseData.per_page
    pagination.total = responseData.total
  } catch (error) {
    console.error('5. lỗi fetchUsers:', error)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  fetchUsers()
}

const handleReset = () => {
  searchForm.name = ''
  searchForm.email = ''
  searchForm.phone = ''
  fetchUsers()
}

const handlePageChange = (page: number) => {
  pagination.page = page
  fetchUsers()
}

const handleAction = async (payload: { key: string; row: Record<string, any> }) => {
  if (payload.key === 'edit') {
    modalMode.value = 'edit'
    await handleViewUser(payload.row.id)
  }

  if (payload.key === 'view') {
    modalMode.value = 'view'
    await handleViewUser(payload.row.id)
  }

  if (payload.key === 'delete') {
    console.log('delete', payload.row)
  }
}

const handleViewUser = async (id: number) => {
  try {
    const res = await showUserApi(id)
    const user = res.data.data
    form.name = user.name || ''
    form.email = user.email || ''
    form.password = ''
    form.phone = user.phone || ''
    console.log('User detail:', user)
    showCreateModal.value = true
  } catch (error) {
    console.error(error)
  }
}

const handleSubmit = async () => {
  try {
    loading.value = true
    await createUserApi({
      name: form.name,
      email: form.email,
      password: form.password,
      phone: form.phone,
    })
    ElMessage.success('Tạo user thành công')
    handleCloseCreateModal()
    await fetchUsers()
  } catch (e) {
    ElMessage.error('Tạo thất bại')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchUsers()
})
</script>
<template>
  <div class="user-list-view">
    <div class="search-box">
      <div class="search-box__header">
        <el-form :inline="true" class="search-form">
          <el-form-item label="Tên">
            <el-input v-model="searchForm.name" placeholder="Nhập tên" clearable />
          </el-form-item>

          <el-form-item label="Email">
            <el-input v-model="searchForm.email" placeholder="Nhập email" clearable />
          </el-form-item>

          <el-form-item label="SĐT">
            <el-input v-model="searchForm.phone" placeholder="Nhập số điện thoại" clearable />
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
      :data="users"
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
      width="50%"
      @cancel="handleCloseCreateModal"
      @close="handleCloseCreateModal"
      @confirm="handleSubmit"
    >
      <el-form label-width="120px">
        <el-form-item label="Tên">
          <el-input v-model="form.name" autocomplete="off" />
	        
        </el-form-item>

        <el-form-item label="Email">
          <el-input v-model="form.email" autocomplete="new-email" />
        </el-form-item>

        <el-form-item label="Password">
          <el-input v-model="form.password" type="password" autocomplete="new-password" />
        </el-form-item>

        <el-form-item label="Phone">
          <el-input v-model="form.phone" autocomplete="new-phone" />
        </el-form-item>
      </el-form>
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

.search-form .el-form-item {
  margin-bottom: 20px;
}
</style>