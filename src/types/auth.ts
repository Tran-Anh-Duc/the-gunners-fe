import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'

export function useAuthUser() {
	const authStore = useAuthStore()

	const currentUserId = computed(() => authStore.user?.id)
	const businessIdCurrent = computed(() => authStore.user?.business_id)
	const businessNameCurrent = computed(() => authStore.user?.business_name)

	const canEditPassword = (modalMode: any, form: any) => {
		return computed(() => {
			return modalMode.value === 'create' || form.id === currentUserId.value
		})
	}

	return {
		currentUserId,
		businessIdCurrent,
		businessNameCurrent,
		canEditPassword,
	}
}
