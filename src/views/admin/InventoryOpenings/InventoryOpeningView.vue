<script setup lang="ts">
import AppTable from '@/components/common/AppTable.vue'
import type { TableColumn } from '@/types/table.ts'
import { ref, onMounted, reactive, computed, onUnmounted } from 'vue'
import AppModal from '@/components/common/AppModal.vue'
import { ElMessage, ElDescriptions, ElDescriptionsItem } from 'element-plus'
import type {
	InventoryOpeningGroup
} from '@/types/inventoryOpening.ts'
import type { Pagination } from '@/types/pagination.ts'
import {
	getInventoryOpeningsList
} from '@/api/inventoryOpening.api.ts'
const isMobile = ref(false)




</script>
<template>
		<div>hahahahaa</div>
</template>
<style scoped>

</style>
