import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import './index.css'

// 动态导入App组件
import('./App.vue').then((AppModule) => {
  const app = createApp(AppModule.default)
  app.use(ElementPlus)
  app.mount('#app')
})
