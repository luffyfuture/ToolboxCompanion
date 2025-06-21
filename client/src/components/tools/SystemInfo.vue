<template>
  <div class="system-info">
    <div class="info-header">
      <h2>系统信息</h2>
      <el-button type="primary" @click="copyAllInfo">
        <el-icon><DocumentCopy /></el-icon>
        复制全部信息
      </el-button>
    </div>

    <div v-if="!systemInfo" class="loading">
      <el-card>
        <div class="loading-content">
          <el-icon class="loading-icon"><Loading /></el-icon>
          <p>正在获取系统信息...</p>
        </div>
      </el-card>
    </div>

    <div v-else class="info-grid">
      <!-- 浏览器信息 -->
      <el-card>
        <template #header>
          <h3>浏览器信息</h3>
        </template>
        <div class="info-list">
          <div class="info-item">
            <span class="info-label">浏览器:</span>
            <span class="info-value">{{ systemInfo.browser }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">版本:</span>
            <span class="info-value">{{ systemInfo.version }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">平台:</span>
            <span class="info-value">{{ systemInfo.platform }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">语言:</span>
            <span class="info-value">{{ systemInfo.language }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">时区:</span>
            <span class="info-value">{{ systemInfo.timezone }}</span>
          </div>
        </div>
      </el-card>

      <!-- 显示信息 -->
      <el-card>
        <template #header>
          <h3>显示信息</h3>
        </template>
        <div class="info-list">
          <div class="info-item">
            <span class="info-label">屏幕尺寸:</span>
            <span class="info-value">{{ systemInfo.screen.width }} × {{ systemInfo.screen.height }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">视口尺寸:</span>
            <span class="info-value">{{ systemInfo.viewport.width }} × {{ systemInfo.viewport.height }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">颜色深度:</span>
            <span class="info-value">{{ systemInfo.screen.colorDepth }} 位</span>
          </div>
          <div class="info-item">
            <span class="info-label">像素比:</span>
            <span class="info-value">{{ systemInfo.screen.pixelRatio }}x</span>
          </div>
        </div>
      </el-card>

      <!-- 硬件信息 -->
      <el-card v-if="systemInfo.memory || systemInfo.cores">
        <template #header>
          <h3>硬件信息</h3>
        </template>
        <div class="info-list">
          <div v-if="systemInfo.cores" class="info-item">
            <span class="info-label">CPU核心数:</span>
            <span class="info-value">{{ systemInfo.cores }}</span>
          </div>
          <div v-if="systemInfo.memory" class="info-item">
            <span class="info-label">设备内存:</span>
            <span class="info-value">{{ systemInfo.memory }} GB</span>
          </div>
        </div>
      </el-card>

      <!-- 网络信息 -->
      <el-card v-if="systemInfo.connection">
        <template #header>
          <h3>网络信息</h3>
        </template>
        <div class="info-list">
          <div class="info-item">
            <span class="info-label">连接类型:</span>
            <span class="info-value">{{ systemInfo.connection.effectiveType }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">下行速度:</span>
            <span class="info-value">{{ systemInfo.connection.downlink }} Mbps</span>
          </div>
        </div>
      </el-card>
    </div>

    <!-- User Agent -->
    <el-card v-if="systemInfo" class="user-agent-card">
      <template #header>
        <h3>User Agent</h3>
      </template>
      <div class="user-agent">
        {{ systemInfo.userAgent }}
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { DocumentCopy, Loading } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

interface SystemInfo {
  browser: string
  version: string
  platform: string
  userAgent: string
  language: string
  timezone: string
  screen: {
    width: number
    height: number
    colorDepth: number
    pixelRatio: number
  }
  viewport: {
    width: number
    height: number
  }
  connection?: {
    effectiveType: string
    downlink: number
  }
  memory?: number
  cores?: number
}

const systemInfo = ref<SystemInfo | null>(null)

const getSystemInfo = () => {
  const nav = navigator as any
  
  // 检测浏览器
  let browser = "未知"
  let version = "未知"
  
  if (nav.userAgentData) {
    const brands = nav.userAgentData.brands
    const mainBrand = brands.find((brand: any) => 
      !brand.brand.includes("Not") && !brand.brand.includes("Chromium")
    )
    if (mainBrand) {
      browser = mainBrand.brand
      version = mainBrand.version
    }
  } else {
    const userAgent = nav.userAgent
    if (userAgent.includes("Chrome")) {
      browser = "Chrome"
      version = userAgent.match(/Chrome\/([0-9.]+)/)?.[1] || "未知"
    } else if (userAgent.includes("Firefox")) {
      browser = "Firefox"
      version = userAgent.match(/Firefox\/([0-9.]+)/)?.[1] || "未知"
    } else if (userAgent.includes("Safari")) {
      browser = "Safari"
      version = userAgent.match(/Version\/([0-9.]+)/)?.[1] || "未知"
    } else if (userAgent.includes("Edge")) {
      browser = "Edge"
      version = userAgent.match(/Edge\/([0-9.]+)/)?.[1] || "未知"
    }
  }

  const info: SystemInfo = {
    browser,
    version,
    platform: nav.platform || "未知",
    userAgent: nav.userAgent,
    language: nav.language || "未知",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    screen: {
      width: screen.width,
      height: screen.height,
      colorDepth: screen.colorDepth,
      pixelRatio: window.devicePixelRatio || 1
    },
    viewport: {
      width: window.innerWidth,
      height: window.innerHeight
    }
  }

  // 网络信息（如果可用）
  if ('connection' in nav) {
    const connection = nav.connection
    info.connection = {
      effectiveType: connection.effectiveType || "未知",
      downlink: connection.downlink || 0
    }
  }

  // 内存（如果可用）
  if ('deviceMemory' in nav) {
    info.memory = nav.deviceMemory
  }

  // CPU核心数（如果可用）
  if ('hardwareConcurrency' in nav) {
    info.cores = nav.hardwareConcurrency
  }

  systemInfo.value = info
}

const updateViewport = () => {
  if (systemInfo.value) {
    systemInfo.value.viewport = {
      width: window.innerWidth,
      height: window.innerHeight
    }
  }
}

const copyAllInfo = async () => {
  if (!systemInfo.value) return
  
  const infoText = Object.entries(systemInfo.value)
    .map(([key, value]) => {
      if (typeof value === 'object' && value !== null) {
        return `${key}: ${JSON.stringify(value, null, 2)}`
      }
      return `${key}: ${value}`
    })
    .join('\n')
  
  try {
    await navigator.clipboard.writeText(infoText)
    ElMessage.success('系统信息已复制到剪贴板')
  } catch (error) {
    ElMessage.error('复制失败')
  }
}

onMounted(() => {
  getSystemInfo()
  
  // 监听窗口大小变化
  window.addEventListener('resize', updateViewport)
  
  // 清理事件监听器
  return () => {
    window.removeEventListener('resize', updateViewport)
  }
})
</script>

<style scoped>
.system-info {
  max-width: 100%;
}

.info-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.info-header h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
}

.loading {
  margin-bottom: 1.5rem;
}

.loading-content {
  text-align: center;
  padding: 2rem 0;
}

.loading-icon {
  font-size: 2rem;
  color: #6b7280;
  margin-bottom: 1rem;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.loading-content p {
  margin: 0;
  color: #6b7280;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.info-list {
  space-y: 0.75rem;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
}

.info-label {
  color: #6b7280;
  font-weight: 500;
}

.info-value {
  font-family: 'Monaco', 'Menlo', monospace;
  color: #374151;
  font-weight: 600;
}

.user-agent-card {
  margin-top: 1.5rem;
}

.user-agent {
  background: #f9fafb;
  border-radius: 6px;
  padding: 1rem;
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 0.875rem;
  word-break: break-all;
  color: #374151;
}
</style>