<template>
  <div class="password-generator">
    <el-card class="settings-card">
      <template #header>
        <h3>密码设置</h3>
      </template>
      
      <el-form :model="settings" label-width="120px">
        <el-form-item :label="`长度: ${settings.length}`">
          <el-slider
            v-model="settings.length"
            :min="4"
            :max="50"
            show-stops
          />
        </el-form-item>

        <el-form-item label="字符类型">
          <div class="checkbox-group">
            <el-checkbox v-model="settings.includeUppercase">大写字母 (A-Z)</el-checkbox>
            <el-checkbox v-model="settings.includeLowercase">小写字母 (a-z)</el-checkbox>
            <el-checkbox v-model="settings.includeNumbers">数字 (0-9)</el-checkbox>
            <el-checkbox v-model="settings.includeSymbols">符号 (!@#$%)</el-checkbox>
          </div>
        </el-form-item>

        <el-form-item>
          <el-checkbox v-model="settings.excludeSimilar">
            排除相似字符 (il1Lo0O)
          </el-checkbox>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="generatePassword" style="width: 100%">
            <el-icon><Key /></el-icon>
            生成密码
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card v-if="generatedPassword" class="result-card">
      <template #header>
        <div class="result-header">
          <h3>生成的密码</h3>
          <el-tag :type="strengthTag.type" size="small">
            {{ strengthTag.label }}
          </el-tag>
        </div>
      </template>
      
      <div class="password-result">
        <el-input
          v-model="generatedPassword"
          readonly
          class="password-input"
        >
          <template #append>
            <el-button @click="copyToClipboard(generatedPassword)">
              <el-icon><DocumentCopy /></el-icon>
            </el-button>
          </template>
        </el-input>
      </div>
    </el-card>

    <el-card v-if="history.length > 0" class="history-card">
      <template #header>
        <h3>最近生成的密码</h3>
      </template>
      
      <div class="history-list">
        <div 
          v-for="(password, index) in history" 
          :key="index"
          class="history-item"
        >
          <span class="password-text">{{ password }}</span>
          <el-button
            size="small"
            @click="copyToClipboard(password)"
          >
            <el-icon><DocumentCopy /></el-icon>
          </el-button>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, computed } from 'vue'
import { Key, DocumentCopy } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const settings = reactive({
  length: 12,
  includeUppercase: true,
  includeLowercase: true,
  includeNumbers: true,
  includeSymbols: false,
  excludeSimilar: false
})

const generatedPassword = ref('')
const history = ref<string[]>([])

const generatePassword = () => {
  let charset = ''
  const similarChars = 'il1Lo0O'

  if (settings.includeUppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  if (settings.includeLowercase) charset += 'abcdefghijklmnopqrstuvwxyz'
  if (settings.includeNumbers) charset += '0123456789'
  if (settings.includeSymbols) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?'

  if (settings.excludeSimilar) {
    charset = charset.split('').filter(char => !similarChars.includes(char)).join('')
  }

  if (!charset) {
    ElMessage.error('请至少选择一种字符类型')
    return
  }

  let newPassword = ''
  for (let i = 0; i < settings.length; i++) {
    newPassword += charset.charAt(Math.floor(Math.random() * charset.length))
  }

  generatedPassword.value = newPassword
  history.value.unshift(newPassword)
  
  // 保留最近10个密码
  if (history.value.length > 10) {
    history.value = history.value.slice(0, 10)
  }
  
  ElMessage.success('密码生成成功')
}

const getStrengthScore = (password: string) => {
  let score = 0
  if (password.length >= 8) score += 1
  if (password.length >= 12) score += 1
  if (/[a-z]/.test(password)) score += 1
  if (/[A-Z]/.test(password)) score += 1
  if (/[0-9]/.test(password)) score += 1
  if (/[^A-Za-z0-9]/.test(password)) score += 1
  return score
}

const strengthTag = computed(() => {
  if (!generatedPassword.value) return { label: '', type: 'info' }
  
  const score = getStrengthScore(generatedPassword.value)
  if (score <= 2) return { label: '弱', type: 'danger' }
  if (score <= 4) return { label: '中', type: 'warning' }
  return { label: '强', type: 'success' }
})

const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
    ElMessage.success('密码已复制到剪贴板')
  } catch (error) {
    ElMessage.error('复制失败')
  }
}
</script>

<style scoped>
.password-generator {
  max-width: 600px;
  margin: 0 auto;
}

.settings-card,
.result-card,
.history-card {
  margin-bottom: 1.5rem;
}

.checkbox-group {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.result-header h3 {
  margin: 0;
}

.password-result {
  margin-bottom: 1rem;
}

.password-input :deep(.el-input__inner) {
  font-family: 'Monaco', 'Menlo', monospace;
  font-weight: 600;
}

.history-list {
  max-height: 200px;
  overflow-y: auto;
}

.history-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: #f9fafb;
  border-radius: 6px;
  margin-bottom: 0.5rem;
}

.password-text {
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 0.875rem;
  flex: 1;
  margin-right: 1rem;
  word-break: break-all;
}

@media (max-width: 768px) {
  .checkbox-group {
    grid-template-columns: 1fr;
  }
}
</style>