<template>
  <div class="color-picker">
    <el-row :gutter="20">
      <el-col :span="12">
        <el-card>
          <template #header>
            <h3>颜色选择器</h3>
          </template>
          
          <div class="color-display">
            <div 
              class="color-preview"
              :style="{ backgroundColor: selectedColor }"
            ></div>
            <input
              type="color"
              v-model="selectedColor"
              class="color-input"
            />
          </div>

          <el-form-item label="十六进制值" style="margin-top: 1rem;">
            <el-input
              v-model="selectedColor"
              placeholder="#000000"
            />
          </el-form-item>

          <div class="preset-colors">
            <h4>预设颜色</h4>
            <div class="color-grid">
              <div
                v-for="(color, index) in presetColors"
                :key="index"
                class="preset-color"
                :style="{ backgroundColor: color }"
                @click="selectedColor = color"
              ></div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="12">
        <el-card>
          <template #header>
            <h3>颜色值</h3>
          </template>
          
          <div class="color-values">
            <div 
              v-for="format in colorFormats" 
              :key="format.name"
              class="color-format"
            >
              <div class="format-info">
                <span class="format-name">{{ format.name }}</span>
                <div class="format-value">{{ format.value }}</div>
              </div>
              <el-button
                size="small"
                @click="copyToClipboard(format.value, format.name)"
              >
                <el-icon><DocumentCopy /></el-icon>
              </el-button>
            </div>

            <div class="rgb-breakdown">
              <h4>RGB分解</h4>
              <div class="rgb-grid">
                <div class="rgb-item r">
                  <div class="rgb-label">R</div>
                  <div class="rgb-value">{{ rgb.r }}</div>
                </div>
                <div class="rgb-item g">
                  <div class="rgb-label">G</div>
                  <div class="rgb-value">{{ rgb.g }}</div>
                </div>
                <div class="rgb-item b">
                  <div class="rgb-label">B</div>
                  <div class="rgb-value">{{ rgb.b }}</div>
                </div>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { DocumentCopy } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const selectedColor = ref('#3b82f6')

const presetColors = [
  '#FF5733', '#33FF57', '#3357FF', '#FF33F1', '#F1FF33', '#33FFF1',
  '#FF8C33', '#8C33FF', '#33FF8C', '#FF3333', '#33FF33', '#3333FF',
  '#FFD700', '#FF69B4', '#00CED1', '#FF4500', '#32CD32', '#8A2BE2',
  '#DC143C', '#00FA9A', '#4169E1', '#FF1493', '#00FF7F', '#9932CC'
]

const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 }
}

const hexToHsl = (hex: string) => {
  const rgb = hexToRgb(hex)
  const r = rgb.r / 255
  const g = rgb.g / 255
  const b = rgb.b / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h, s, l = (max + min) / 2

  if (max === min) {
    h = s = 0
  } else {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break
      case g: h = (b - r) / d + 2; break
      case b: h = (r - g) / d + 4; break
      default: h = 0
    }
    h /= 6
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  }
}

const rgb = computed(() => hexToRgb(selectedColor.value))
const hsl = computed(() => hexToHsl(selectedColor.value))

const colorFormats = computed(() => [
  {
    name: 'HEX',
    value: selectedColor.value
  },
  {
    name: 'RGB',
    value: `rgb(${rgb.value.r}, ${rgb.value.g}, ${rgb.value.b})`
  },
  {
    name: 'RGBA',
    value: `rgba(${rgb.value.r}, ${rgb.value.g}, ${rgb.value.b}, 1)`
  },
  {
    name: 'HSL',
    value: `hsl(${hsl.value.h}, ${hsl.value.s}%, ${hsl.value.l}%)`
  },
  {
    name: 'HSLA',
    value: `hsla(${hsl.value.h}, ${hsl.value.s}%, ${hsl.value.l}%, 1)`
  }
])

const copyToClipboard = async (text: string, format: string) => {
  try {
    await navigator.clipboard.writeText(text)
    ElMessage.success(`${format}值已复制到剪贴板`)
  } catch (error) {
    ElMessage.error('复制失败')
  }
}
</script>

<style scoped>
.color-picker {
  max-width: 100%;
}

.color-display {
  text-align: center;
  margin-bottom: 1rem;
}

.color-preview {
  width: 120px;
  height: 120px;
  border-radius: 8px;
  border: 2px solid #e5e7eb;
  margin: 0 auto 1rem;
}

.color-input {
  width: 80px;
  height: 40px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.preset-colors h4 {
  margin: 1rem 0 0.5rem 0;
  color: #374151;
}

.color-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 0.5rem;
}

.preset-color {
  width: 32px;
  height: 32px;
  border-radius: 4px;
  border: 2px solid #e5e7eb;
  cursor: pointer;
  transition: all 0.2s;
}

.preset-color:hover {
  border-color: #9ca3af;
  transform: scale(1.1);
}

.color-values {
  space-y: 1rem;
}

.color-format {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: #f9fafb;
  border-radius: 6px;
  margin-bottom: 0.75rem;
}

.format-info {
  flex: 1;
}

.format-name {
  font-size: 0.75rem;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
}

.format-value {
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 0.875rem;
  color: #374151;
}

.rgb-breakdown {
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
}

.rgb-breakdown h4 {
  margin: 0 0 0.75rem 0;
  color: #6b7280;
}

.rgb-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
}

.rgb-item {
  text-align: center;
  padding: 0.5rem;
  border-radius: 4px;
}

.rgb-item.r {
  background: #fef2f2;
  color: #dc2626;
}

.rgb-item.g {
  background: #f0fdf4;
  color: #16a34a;
}

.rgb-item.b {
  background: #eff6ff;
  color: #2563eb;
}

.rgb-label {
  font-size: 0.75rem;
  font-weight: 600;
}

.rgb-value {
  font-family: 'Monaco', 'Menlo', monospace;
  font-weight: 600;
}
</style>