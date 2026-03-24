<template>
  <!-- Bảng chính của Element Plus -->
  <!-- :data="data" chính là dữ liệu được truyền từ component cha (UserListView) -->
  <el-table :data="data" border stripe style="width: 100%" v-loading="loading">
    <!-- Lặp qua từng cấu hình cột (columns) -->
    <template v-for="col in columns" :key="col.prop || col.type || col.label">
      <!-- ================= CỘT THƯỜNG ================= -->
      <!-- Nếu không phải cột action thì render như cột bình thường -->
      <!-- key trong object data (vd: name, email, status) -->
      <!-- tên hiển thị trên header -->
      <!-- độ rộng cột (nếu có) -->
      <el-table-column
        v-if="col.type !== 'actions'"
        :prop="col.prop"
        :label="col.label"
        :width="col.width"
      />

      <!-- ================= CỘT ACTION ================= -->
      <!-- Nếu là cột action thì render custom -->
      <el-table-column v-else :label="col.label" :width="col.width || 180" align="center">
        <!-- slot default của mỗi dòng -->
        <!-- row chính là từng object trong data -->
        <template #default="{ row }">
          <!-- Lặp qua danh sách action (edit, delete, ...) -->
          <el-button
            v-for="action in col.actions"
            :key="action.key"
            link
            :type="action.type || 'primary'"
            @click="handleAction(action.key, row)"
          >
            {{ action.label }}
          </el-button>
        </template>
      </el-table-column>
    </template>
  </el-table>
  <div v-if="pagination" style="margin-top: 16px; display: flex; justify-content: flex-end">
    <el-pagination
      background
      layout="prev, pager, next"
      :total="pagination.total"
      :current-page="pagination.page"
      :page-size="pagination.pageSize"
      @current-change="handlePageChange"
    />
  </div>
</template>

<script setup lang="ts">
import type { TableColumn } from '@/types/table'

type Pagination = {
  page: number
  pageSize: number
  total: number
}

/**
 * ================= PROPS =================
 * Component này nhận 2 props từ component cha:
 * - data: dữ liệu bảng (mảng object)
 * - columns: cấu hình cột
 */
type Props = {
  data: Record<string, any>[] // ví dụ: [{ id: 1, name: 'Duc' }]
  columns: TableColumn[] // cấu hình từng cột
  loading?: boolean
  pagination?: Pagination
}

/**
 * defineProps giúp Vue lấy dữ liệu truyền từ component cha
 * Ví dụ:
 * <AppTable :data="users" :columns="columns" />
 */
const props = defineProps<Props>()

/**
 * ================= EMIT EVENT =================
 * Khi bấm nút action (edit/delete/...)
 * AppTable sẽ phát event ra ngoài
 */
const emit = defineEmits<{
  (e: 'action', payload: { key: string; row: Record<string, any> }): void
  (e: 'page-change', page: number): void
}>()

const handlePageChange = (page: number) => {
  emit('page-change', page)
}

/**
 * ================= HANDLE ACTION =================
 * Hàm xử lý khi click nút
 * - key: loại action (edit, delete, ...)
 * - row: dữ liệu của dòng đang click
 */
const handleAction = (key: string, row: Record<string, any>) => {
  // phát event ra component cha
  emit('action', { key, row })
}
</script>
