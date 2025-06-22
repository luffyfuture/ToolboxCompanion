<template>
  <div class="base64-encoder">
    <el-card class="input-card">
      <template #header>
        <h3>输入文本</h3>
      </template>
      <el-input
        v-model="inputText"
        type="textarea"
        placeholder="输入要编码/解码的文本..."
        :rows="6"
      />
      <div class="button-group">
        <el-button 
          type="primary" 
          :disabled="!inputText.trim()"
          @click="encode"
        >
          <el-icon><Top /></el-icon>
          编码为Base64
        </el-button>
        <el-button 
          type="warning" 
          :disabled="!inputText.trim()"
          @click="decode"
        >
          <el-icon><Bottom /></el-icon>
          从Base64解码
        </el-button>
        <el-button @click="clear">
          <el-icon><Delete /></el-icon>
          清除
        </el-button>
      </div>
    </el-card>

    <el-card v-if="encodedResult" class="result-card">
      <template #header>
        <div class="result-header">
          <h3>Base64编码结果</h3>
          <el-button
            type="primary"
            size="small"
            @click="copyToClipboard(encodedResult)"
          >
            <el-icon><DocumentCopy /></el-icon>
            复制
          </el-button>
        </div>
      </template>
      <div class="result-content">{{ encodedResult }}</div>
    </el-card>

    <el-card v-if="decodedResult" class="result-card">
      <template #header>
        <div class="result-header">
          <h3>解码结果</h3>
          <el-button
            type="primary"
            size="small"
            @click="copyToClipboard(decodedResult)"
          >
            <el-icon><DocumentCopy /></el-icon>
            复制
          </el-button>
        </div>
      </template>
      <div class="result-content">{{ decodedResult }}</div>
    </el-card>

    <el-card class="info-card">
      <template #header>
        <h3>关于Base64编码</h3>
      </template>
      <p>
        Base64是一种二进制到文本的编码方案，将二进制数据表示为ASCII字符串格式。
        它通常用于编码电子邮件附件、数据URL和Web应用程序中的数据。
      </p>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Top, Bottom, Delete, DocumentCopy } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const inputText = ref('')
const encodedResult = ref('')
const decodedResult = ref('')

const encode = () => {
  try {
    const result = btoa(unescape(encodeURIComponent(inputText.value)))
    encodedResult.value = result
    decodedResult.value = ''
    ElMessage.success('编码成功')
  } catch (error) {
    ElMessage.error('编码失败')
  }
}

const decode = () => {
  try {
    const result = decodeURIComponent(escape(atob(inputText.value)))
    decodedResult.value = result
    encodedResult.value = ''
    ElMessage.success('解码成功')
  } catch (error) {
    ElMessage.error('解码失败，请检查Base64格式是否正确')
  }
}

const clear = () => {
  inputText.value = ''
  encodedResult.value = ''
  decodedResult.value = ''
}

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
.base64-encoder {
  max-width: 800px;
  margin: 0 auto;
}

.input-card,
.result-card,
.info-card {
  margin-bottom: 1.5rem;
}

.button-group {
  margin-top: 1rem;
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.result-header h3 {
  margin: 0;
}

.result-content {
  background: #f9fafb;
  border-radius: 6px;
  padding: 1rem;
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 0.875rem;
  word-break: break-all;
  color: #374151;
  min-height: 100px;
}

.info-card p {
  margin: 0;
  color: #6b7280;
  line-height: 1.6;
}
</style>