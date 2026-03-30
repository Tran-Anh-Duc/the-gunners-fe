<script setup lang="ts">
import AppTable from '@/components/common/AppTable.vue'
import type { TableColumn } from '@/types/table.ts'
import { getUserList, createUserApi, showUserApi, updateUserApi } from '@/api/user.api.ts'
import type { UpdateUserPayload, User } from '@/types/user.ts'
import { ref, onMounted, reactive, computed } from 'vue'
import AppModal from '@/components/common/AppModal.vue'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '@/stores/auth.store.ts'

const columns: TableColumn[] = [
  { prop: 'name', label: 'Tên' },
  { prop: 'email', label: 'Email' },
  { prop: 'phone', label: 'SĐT' },
  { prop: 'business_name', label: 'Cửa hàng' },
  { prop: 'role', label: 'Vai trò' },
  { prop: 'membership_status', label: 'Trạng thái tại cửa hàng' },
  { prop: 'is_active', label: 'Trạng thái tài khoản' },
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
  id: 0,
  business_id: null as number | null,
  business_name: '',
  name: '',
  email: '',
  password: '',
  phone: '',
  avatar: '',
  role: 'staff',
  membership_status: null as string | null,
  is_owner: false,
  is_active: true,
})

const resetCreateForm = () => {
  form.id = 0
  form.business_id = 1
  form.business_name = ''
  form.name = ''
  form.email = ''
  form.password = ''
  form.phone = ''
  form.avatar = ''
  form.role = 'staff'
  form.membership_status = null
  form.is_owner = false
  form.is_active = true
}

const authStore = useAuthStore()
const currentUserId = computed(() => authStore.user?.id)
const canEditPassword = computed(() => {
  return modalMode.value === 'create' || form.id === currentUserId.value
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
    users.value = responseData.items.map((item: any) => ({
      ...item,
      membership_status: item.membership_status ? 'hoạt động' : 'Ngừng hoạt động',
      is_active: item.is_active ? 'hoạt động' : 'Ngừng hoạt động',
    }))
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
  pagination.page = 1
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
    form.id = user.id || 0
    form.name = user.name || ''
    form.email = user.email || ''
    form.password = ''
    form.phone = user.phone || ''
    form.role = user.role || ''
    form.business_name = user.business_name || ''
    form.membership_status = user.membership_status || ''
    form.is_active = user.is_active
    form.business_id = user.business_id
    form.avatar = user.avatar
    form.is_owner = user.is_owner
    showCreateModal.value = true
  } catch (error) {
    console.error(error)
  }
}

const handleSubmit = async () => {
  try {
    loading.value = true
    if (!form.id) {
      await createUserApi({
        name: form.name,
        email: form.email,
        password: form.password,
        phone: form.phone,
        avatar: form.avatar,
        is_active: form.is_active,
        business_id: form.business_id,
        role: form.role,
      })
      ElMessage.success('Tạo người dùng thành công')
    } else {
      const payload: UpdateUserPayload = {
        name: form.name,
        email: form.email,
        phone: form.phone,
        is_active: form.is_active,
      }
      if (form.avatar) {
        payload.avatar = form.avatar
      }
      if (canEditPassword.value && form.password.trim() !== '') {
        payload.password = form.password
      }
      await updateUserApi(form.id, payload)
      ElMessage.success('Cập nhật người dùng thành công')
    }
    handleCloseCreateModal()
    await fetchUsers()
  } catch (e) {
    ElMessage.error(form.id ? 'Cập nhật thất bại' : 'Tạo thất bại')
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
