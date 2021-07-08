import { createApp } from 'vue'
import App from './App.vue'
import { store, key } from './store'
import router from './router'
import 'normalize.css'
import './css/global.scss'

createApp(App)
  .use(store, key)
  .use(router)
  .mount('#app')
