<template>
  <div class="case-converter">
    <el-card class="input-card">
      <template #header>
        <h3>文本输入</h3>
      </template>
      <el-input
        v-model="inputText"
        type="textarea"
        placeholder="输入要转换的文本..."
        :rows="6"
      />
    </el-card>

    <div class="conversion-grid">
      <el-card 
        v-for="conversion in conversions" 
        :key="conversion.name" 
        class="conversion-item"
      >
        <template #header>
          <div class="conversion-header">
            <div>
              <h4>{{ conversion.name }}</h4>
              <p class="conversion-desc">{{ conversion.description }}</p>
            </div>
            <el-button
              type="primary"
              size="small"
              :disabled="!inputText.trim()"
              @click="copyToClipboard(conversion.convert(inputText))"
            >
              <el-icon><DocumentCopy /></el-icon>
              复制
            </el-button>
          </div>
        </template>
        
        <div class="conversion-result">
          {{ inputText ? conversion.convert(inputText) : '转换结果将在此显示...' }}
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { DocumentCopy } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const inputText = ref('')

const conversions = [
  {
    name: '大写',
    convert: (text: string) => text.toUpperCase(),
    description: '将所有字母转换为大写'
  },
  {
    name: '小写',
    convert: (text: string) => text.toLowerCase(),
    description: '将所有字母转换为小写'
  },
  {
    name: '首字母大写',
    convert: (text: string) => text.toLowerCase().replace(/\b\w/g, l => l.toUpperCase()),
    description: '每个单词的首字母大写'
  },
  {
    name: '句首大写',
    convert: (text: string) => text.toLowerCase().replace(/(^\w|\.\s+\w)/g, l => l.toUpperCase()),
    description: '每个句子的首字母大写'
  },
  {
    name: '驼峰命名',
    convert: (text: string) => text.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase()),
    description: '转换为驼峰命名格式'
  },
  {
    name: '帕斯卡命名',
    convert: (text: string) => text.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase()).replace(/^./, l => l.toUpperCase()),
    description: '转换为帕斯卡命名格式'
  },
  {
    name: '下划线命名',
    convert: (text: string) => text.toLowerCase().replace(/[^a-zA-Z0-9]+/g, '_').replace(/^_|_$/g, ''),
    description: '转换为下划线命名格式'
  },
  {
    name: '短横线命名',
    convert: (text: string) => text.toLowerCase().replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-|-$/g, ''),
    description: '转换为短横线命名格式'
  }
]

const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
    ElMessage.success('已复制到剪贴板')
  } catch (error) {
    ElMessage.error('复制失败')
  }
}
</script>

<style scoped>
.case-converter {
  max-width: 100%;
}

.input-card {
  margin-bottom: 1.5rem;
}

.conversion-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 1rem;
}

.conversion-item {
  min-height: 200px;
}

.conversion-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.conversion-header h4 {
  margin: 0 0 0.25rem 0;
  font-size: 1rem;
  font-weight: 600;
}

.conversion-desc {
  margin: 0;
  font-size: 0.875rem;
  color: #6b7280;
}

.conversion-result {
  background: #f9fafb;
  border-radius: 6px;
  padding: 1rem;
  min-height: 80px;
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 0.875rem;
  word-break: break-all;
  color: #374151;
}

.conversion-result:empty::before {
  content: '转换结果将在此显示...';
  color: #9ca3af;
}
</style>