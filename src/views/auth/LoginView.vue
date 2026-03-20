<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import type { LoginRequest } from '@/types/api'

const router = useRouter()
const authStore = useAuthStore()

const form = reactive<LoginRequest>({
  email: '',
  password: '',
})

const errorMessage = ref('')

const handleLogin = async () => {
  errorMessage.value = ''
  const success = await authStore.login(form)
  if (success) {
    await router.push('/admin')
  } else {
    errorMessage.value = 'Đăng nhập thất bại. Vui lòng kiểm tra email hoặc mật khẩu.'
  }
}
</script>

<template>
  <div class="login-page">
    <div class="login-card">
      <h1>Đăng nhập</h1>

      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="email">Email</label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            placeholder="Nhập email"
          />
        </div>

        <div class="form-group">
          <label for="password">Mật khẩu</label>
          <input
            id="password"
            v-model="form.password"
            type="password"
            placeholder="Nhập mật khẩu"
          />
        </div>

        <p v-if="errorMessage" class="error-text">
          {{ errorMessage }}
        </p>

        <button type="submit" :disabled="authStore.loading">
          {{ authStore.loading ? 'Đang đăng nhập...' : 'Đăng nhập' }}
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-card {
  width: 360px;
  padding: 24px;
  border: 1px solid #ddd;
  border-radius: 12px;
}

.form-group {
  margin-bottom: 16px;
}

input {
  width: 100%;
  height: 40px;
  padding: 0 12px;
  box-sizing: border-box;
}

button {
  width: 100%;
  height: 40px;
  cursor: pointer;
}

.error-text {
  color: red;
  margin-bottom: 12px;
}
</style>