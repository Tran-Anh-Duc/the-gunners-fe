import { defineStore } from 'pinia'
import { loginApi } from '@/api/auth.api'
import type { LoginRequest, LoginResponse } from '@/types/api'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as LoginResponse | null,
    token: '' as string,
    loading: false,
  }),

  actions: {
    async login(data: LoginRequest) {
      try {
        this.loading = true
        const res = await loginApi(data)
        this.token = res.data.data.access_token
        this.expires_in = res.data.data.expires_in
        localStorage.setItem('token', this.token)
        localStorage.setItem('token_expired_at', String(Date.now() + Number(this.expires_in) * 1000))
        return true
      } catch (e) {
        console.log('login error', e)
        return false
      } finally {
        this.loading = false
      }
    },
    logout() {
      this.user = null
      this.token = ''
      localStorage.removeItem('token')
    },
  },
})
