<template>
  <div class="hash-generator">
    <el-card class="input-card">
      <template #header>
        <h3>哈希生成器</h3>
      </template>
      
      <el-form>
        <el-form-item label="输入文本">
          <el-input
            v-model="inputText"
            type="textarea"
            placeholder="输入要生成哈希的文本..."
            :rows="6"
          />
        </el-form-item>
        
        <el-form-item>
          <el-button 
            type="primary" 
            :disabled="!inputText.trim()"
            @click="generateHashes"
          >
            <el-icon><Lock /></el-icon>
            生成哈希值
          </el-button>
          <el-button @click="clear">
            <el-icon><Delete /></el-icon>
            清除
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <div v-if="Object.keys(hashes).length > 0" class="hash-results">
      <el-card 
        v-for="hashType in hashTypes" 
        :key="hashType.key"
        v-show="hashes[hashType.key]"
        class="hash-card"
      >
        <template #header>
          <div class="hash-header">
            <div>
              <h4>{{ hashType.name }}</h4>
              <p class="hash-desc">{{ hashType.description }}</p>
            </div>
            <el-button
              type="primary"
              size="small"
              @click="copyToClipboard(hashes[hashType.key], hashType.name)"
            >
              <el-icon><DocumentCopy /></el-icon>
              复制
            </el-button>
          </div>
        </template>
        
        <div class="hash-result">
          {{ hashes[hashType.key] }}
        </div>
      </el-card>
    </div>

    <el-card class="info-card">
      <template #header>
        <h3>关于哈希函数</h3>
      </template>
      <p>
        哈希函数是将输入数据转换为固定大小字符串的数学算法。
        它们通常用于数据完整性验证、密码存储和数字签名。
        每个哈希算法都会为输入数据产生唯一的"指纹"。
      </p>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { Lock, Delete, DocumentCopy } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const inputText = ref('')
const hashes = reactive<Record<string, string>>({})

const hashTypes = [
  { key: 'sha1', name: 'SHA-1', description: '160位哈希函数' },
  { key: 'sha256', name: 'SHA-256', description: '256位哈希函数' },
  { key: 'sha384', name: 'SHA-384', description: '384位哈希函数' },
  { key: 'sha512', name: 'SHA-512', description: '512位哈希函数' },
  { key: 'simple', name: '简单哈希', description: '用于演示的基础哈希' }
]

const generateHashes = async () => {
  if (!inputText.value.trim()) return

  const encoder = new TextEncoder()
  const data = encoder.encode(inputText.value)

  try {
    // 清空之前的结果
    Object.keys(hashes).forEach(key => delete hashes[key])

    // SHA-1
    const sha1Buffer = await crypto.subtle.digest('SHA-1', data)
    hashes.sha1 = Array.from(new Uint8Array(sha1Buffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')

    // SHA-256
    const sha256Buffer = await crypto.subtle.digest('SHA-256', data)
    hashes.sha256 = Array.from(new Uint8Array(sha256Buffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')

    // SHA-384
    const sha384Buffer = await crypto.subtle.digest('SHA-384', data)
    hashes.sha384 = Array.from(new Uint8Array(sha384Buffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')

    // SHA-512
    const sha512Buffer = await crypto.subtle.digest('SHA-512', data)
    hashes.sha512 = Array.from(new Uint8Array(sha512Buffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')

    // 简单哈希（用于演示，非加密安全）
    let hash = 0
    for (let i = 0; i < inputText.value.length; i++) {
      const char = inputText.value.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // 转换为32位整数
    }
    hashes.simple = Math.abs(hash).toString(16)

    ElMessage.success('哈希值生成成功')
  } catch (error) {
    ElMessage.error('生成哈希值失败')
  }
}

const clear = () => {
  inputText.value = ''
  Object.keys(hashes).forEach(key => delete hashes[key])
}

const copyToClipboard = async (text: string, type: string) => {
  try {
    await navigator.clipboard.writeText(text)
    ElMessage.success(`${type}哈希值已复制到剪贴板`)
  } catch (error) {
    ElMessage.error('复制失败')
  }
}
</script>

<style scoped>
.hash-generator {
  max-width: 800px;
  margin: 0 auto;
}

.input-card,
.info-card {
  margin-bottom: 1.5rem;
}

.hash-results {
  display: grid;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.hash-card {
  break-inside: avoid;
}

.hash-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.hash-header h4 {
  margin: 0 0 0.25rem 0;
  font-size: 1rem;
  font-weight: 600;
}

.hash-desc {
  margin: 0;
  font-size: 0.875rem;
  color: #6b7280;
}

.hash-result {
  background: #f9fafb;
  border-radius: 6px;
  padding: 1rem;
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 0.875rem;
  word-break: break-all;
  color: #374151;
  min-height: 60px;
}

.info-card p {
  margin: 0;
  color: #6b7280;
  line-height: 1.6;
}
</style>