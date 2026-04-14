<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    modelValue: boolean
    title?: string
    width?: string
    loading?: boolean
    destroyOnClose?: boolean
    closeOnClickModal?: boolean
  }>(),
  {
    title: '',
    width: '50%',
    loading: false,
    destroyOnClose: false,
    closeOnClickModal: false,
  },
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'close'): void
  (e: 'cancel'): void
  (e: 'confirm'): void
}>()

const handleClose = () => {
  emit('update:modelValue', false)
  emit('close')
}

const handleCancel = () => {
  emit('update:modelValue', false)
  emit('cancel')
}

const handleConfirm = () => {
  emit('confirm')
}
</script>

<template>
  <el-dialog
    :model-value="modelValue"
    :title="title"
    :width="width"
    :destroy-on-close="destroyOnClose"
    :close-on-click-modal="closeOnClickModal"
    class="app-modal"
    @close="handleClose"
  >
    <slot />

    <template #footer>
      <slot name="footer">
        <el-button @click="handleCancel">Huỷ</el-button>
        <el-button type="primary" :loading="loading" @click="handleConfirm">
          Xác nhận
        </el-button>
      </slot>
    </template>
  </el-dialog>
</template>

<style scoped>
:deep(.el-dialog) {
  max-width: 720px;
  min-width: 320px;
  border-radius: 12px;
}

:deep(.el-dialog__body) {
  padding: 20px 24px;
}

@media (max-width: 768px) {
  :deep(.el-dialog) {
    width: 92% !important;
    margin-top: 8vh;
  }
}
</style>
