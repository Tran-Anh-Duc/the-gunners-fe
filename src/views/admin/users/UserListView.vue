<script setup lang="ts">
import AppTable from '@/components/common/AppTable.vue'
import type { TableColumn } from '@/types/table.ts'
import { getUserList } from '@/api/user.api.ts'
import type { User } from '@/types/user.ts'
import { ref, onMounted, reactive } from 'vue'

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

const handleAction = (payload: { key: string; row: Record<string, any> }) => {
  if (payload.key === 'edit') {
    console.log('edit', payload.row)
  }

  if (payload.key === 'delete') {
    console.log('delete', payload.row)
  }
}

const handleSubmit = async () => {
  try {
    await createUserApi(form)

    ElMessage.success('Tạo user thành công')

    showCreateModal.value = false

    // reload list
    handleSearch()
  } catch (e) {
    ElMessage.error('Tạo thất bại')
  }
}

onMounted(() => {
  fetchUsers()
})
</script>

<template>
  <el-dialog v-model="showCreateModal" title="Thêm user" class="user-dialog" destroy-on-close>
    <el-form class="user-form" :model="form" label-width="120px">
      <el-form-item label="Tên">
        <el-input v-model="form.name" />
      </el-form-item>

      <el-form-item label="Email">
        <el-input v-model="form.email" />
      </el-form-item>

      <el-form-item label="Password">
        <el-input v-model="form.password" type="password" show-password />
      </el-form-item>

      <el-form-item label="SĐT">
        <el-input v-model="form.phone" />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="showCreateModal = false">Huỷ</el-button>
      <el-button type="primary" @click="handleSubmit">Tạo mới</el-button>
    </template>
  </el-dialog>

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
            <el-button type="primary" @click="handleSearch"> Tìm kiếm </el-button>
            <el-button @click="handleReset"> Đặt lại </el-button>
          </el-form-item>
        </el-form>

        <el-button type="success" @click="showCreateModal = true"> + Thêm mới </el-button>
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

.dialog-body {
  height: 50vh; /* 👈 chiều cao = 50% màn hình */
  overflow-y: auto; /* 👈 có scroll nếu dài */
}
</style>