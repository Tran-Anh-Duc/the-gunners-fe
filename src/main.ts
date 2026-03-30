import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'

import App from './App.vue'
import router from './router'
//import pinia from './stores'
import './assets/styles/main.css'
import 'element-plus/dist/index.css'
import {useAuthStore} from "@/stores/auth.store.ts";

const app = createApp(App)
app.use(createPinia())
const authStore = useAuthStore()
authStore.init()
app.use(router)
app.use(ElementPlus)

app.mount('#app')
