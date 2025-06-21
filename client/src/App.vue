<template>
  <div class="toolbox-app">
    <el-container class="toolbox-container">
      <!-- 侧边栏 -->
      <el-aside width="280px" class="toolbox-sidebar">
        <div class="sidebar-header">
          <div class="logo">
            <el-icon size="24"><Tools /></el-icon>
            <div class="logo-text">
              <h1>工具箱 Pro</h1>
              <p>实用工具集合</p>
            </div>
          </div>
        </div>
        
        <el-menu
          :default-active="activeToolId"
          class="sidebar-menu"
          @select="handleToolSelect"
        >
          <div v-for="category in toolCategories" :key="category.id" class="menu-category">
            <div class="category-title">{{ category.name }}</div>
            <el-menu-item
              v-for="tool in category.tools"
              :key="tool.id"
              :index="tool.id"
              class="tool-menu-item"
            >
              <el-icon>
                <i :class="getIconClass(tool.icon)"></i>
              </el-icon>
              <span>{{ tool.name }}</span>
            </el-menu-item>
          </div>
        </el-menu>
        
        <div class="sidebar-footer">
          <span>v1.0.0</span>
          <el-button text>
            <el-icon><Setting /></el-icon>
          </el-button>
        </div>
      </el-aside>
      
      <!-- 主内容区 -->
      <el-main class="toolbox-main">
        <div class="tool-header">
          <div class="tool-info">
            <el-icon size="20">
              <i :class="getIconClass(activeTool.icon)"></i>
            </el-icon>
            <div>
              <h2>{{ activeTool.name }}</h2>
              <p>{{ activeTool.description }}</p>
            </div>
          </div>
          <el-button type="primary" plain size="small">
            <el-icon><FullScreen /></el-icon>
            全屏
          </el-button>
        </div>
        
        <div class="tool-content">
          <component :is="activeTool.component" />
        </div>
      </el-main>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { 
  Tools, 
  Setting, 
  FullScreen
} from '@element-plus/icons-vue'

// 导入工具组件
import SimpleCalculator from './components/tools/SimpleCalculator.vue'
import UnitConverter from './components/tools/UnitConverter.vue'
import TextCounter from './components/tools/TextCounter.vue'
import CaseConverter from './components/tools/CaseConverter.vue'
import Base64Encoder from './components/tools/Base64Encoder.vue'
import QRGenerator from './components/tools/QRGenerator.vue'
import ColorPicker from './components/tools/ColorPicker.vue'
import PasswordGenerator from './components/tools/PasswordGenerator.vue'
import HashGenerator from './components/tools/HashGenerator.vue'
import SystemInfo from './components/tools/SystemInfo.vue'
import Notebook from './components/tools/Notebook.vue'

interface Tool {
  id: string
  name: string
  description: string
  icon: string
  component: any
  category: string
}

const tools: Tool[] = [
  {
    id: 'calculator',
    name: '计算器',
    description: '进行基本数学计算',
    icon: 'calculator',
    component: SimpleCalculator,
    category: '数学工具'
  },
  {
    id: 'unit-converter',
    name: '单位转换',
    description: '转换不同的单位',
    icon: 'exchange-alt',
    component: UnitConverter,
    category: '数学工具'
  },
  {
    id: 'text-counter',
    name: '文本统计',
    description: '统计字符、单词和行数',
    icon: 'align-left',
    component: TextCounter,
    category: '文本工具'
  },
  {
    id: 'case-converter',
    name: '大小写转换',
    description: '转换文本大小写格式',
    icon: 'font',
    component: CaseConverter,
    category: '文本工具'
  },
  {
    id: 'base64',
    name: 'Base64编码',
    description: '编码和解码Base64文本',
    icon: 'code',
    component: Base64Encoder,
    category: '文本工具'
  },
  {
    id: 'qr-generator',
    name: '二维码生成',
    description: '从文本生成二维码',
    icon: 'qrcode',
    component: QRGenerator,
    category: '生成器'
  },
  {
    id: 'color-picker',
    name: '颜色选择器',
    description: '选择和转换颜色',
    icon: 'palette',
    component: ColorPicker,
    category: '生成器'
  },
  {
    id: 'password-generator',
    name: '密码生成器',
    description: '生成安全密码',
    icon: 'key',
    component: PasswordGenerator,
    category: '生成器'
  },
  {
    id: 'hash-generator',
    name: '哈希生成器',
    description: '生成哈希值',
    icon: 'fingerprint',
    component: HashGenerator,
    category: '系统工具'
  },
  {
    id: 'system-info',
    name: '系统信息',
    description: '查看系统信息',
    icon: 'info-circle',
    component: SystemInfo,
    category: '系统工具'
  },
  {
    id: 'notebook',
    name: '笔记本',
    description: '支持Markdown的智能笔记本',
    icon: 'book',
    component: Notebook,
    category: '文档工具'
  }
]

const activeToolId = ref('calculator')

const toolCategories = computed(() => {
  const categories = ['数学工具', '文本工具', '生成器', '系统工具', '文档工具']
  return categories.map(categoryName => ({
    id: categoryName,
    name: categoryName,
    tools: tools.filter(tool => tool.category === categoryName)
  }))
})

const activeTool = computed(() => {
  return tools.find(tool => tool.id === activeToolId.value) || tools[0]
})

const handleToolSelect = (toolId: string) => {
  activeToolId.value = toolId
}

const getIconClass = (iconName: string) => {
  return `fas fa-${iconName}`
}
</script>

<style scoped>
.toolbox-app {
  height: 100vh;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
}

.toolbox-container {
  height: 100%;
}

.toolbox-sidebar {
  background: #ffffff;
  border-right: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.logo .el-icon {
  color: #3b82f6;
  background: #dbeafe;
  padding: 0.5rem;
  border-radius: 0.5rem;
}

.logo-text h1 {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
}

.logo-text p {
  margin: 0;
  font-size: 0.75rem;
  color: #6b7280;
}

.sidebar-menu {
  flex: 1;
  border: none;
  padding: 1rem 0;
}

.menu-category {
  margin-bottom: 1rem;
}

.category-title {
  font-size: 0.75rem;
  font-weight: 500;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 0 1rem;
  margin-bottom: 0.5rem;
}

.tool-menu-item {
  margin: 0 0.5rem;
  border-radius: 0.5rem;
}

.tool-menu-item.is-active {
  background-color: #3b82f6 !important;
  color: white !important;
}

.sidebar-footer {
  padding: 1rem;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.75rem;
  color: #6b7280;
}

.toolbox-main {
  padding: 0;
  background: #f9fafb;
}

.tool-header {
  background: white;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.tool-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.tool-info .el-icon {
  color: #3b82f6;
}

.tool-info h2 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
}

.tool-info p {
  margin: 0;
  font-size: 0.875rem;
  color: #6b7280;
}

.tool-content {
  padding: 1.5rem;
  height: calc(100vh - 80px);
  overflow-y: auto;
}
</style>