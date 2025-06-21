<template>
  <div class="qr-generator">
    <el-card>
      <template #header>
        <h3>二维码生成器</h3>
      </template>
      
      <el-form :model="form" label-width="100px">
        <el-form-item label="文本或URL">
          <el-input
            v-model="form.text"
            placeholder="输入文本或URL来生成二维码..."
          />
        </el-form-item>

        <el-form-item label="尺寸">
          <el-select v-model="form.size" style="width: 200px">
            <el-option label="150x150" value="150" />
            <el-option label="200x200" value="200" />
            <el-option label="300x300" value="300" />
            <el-option label="400x400" value="400" />
            <el-option label="500x500" value="500" />
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-button 
            type="primary" 
            :disabled="!form.text.trim()"
            @click="generateQR"
          >
            <el-icon><Picture /></el-icon>
            生成二维码
          </el-button>
          <el-button @click="clear">
            <el-icon><Delete /></el-icon>
            清除
          </el-button>
        </el-form-item>

        <el-form-item v-if="qrUrl">
          <div class="qr-result">
            <div class="qr-image-container">
              <img 
                :src="qrUrl" 
                alt="生成的二维码" 
                :style="{ width: `${form.size}px`, height: `${form.size}px` }"
              />
            </div>
            <div class="qr-actions">
              <el-button type="success" @click="downloadQR">
                <el-icon><Download /></el-icon>
                下载二维码
              </el-button>
            </div>
          </div>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="info-card">
      <template #header>
        <h3>关于二维码</h3>
      </template>
      <p>
        二维码可以存储各种类型的数据，包括文本、URL、联系人信息、WiFi凭据等。
        它们可以被智能手机和其他具有摄像头功能的设备扫描。
      </p>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { Picture, Delete, Download } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const form = reactive({
  text: '',
  size: '200'
})

const qrUrl = ref('')

const generateQR = () => {
  if (!form.text.trim()) return
  
  const encodedText = encodeURIComponent(form.text)
  const url = `https://api.qrserver.com/v1/create-qr-code/?size=${form.size}x${form.size}&data=${encodedText}`
  qrUrl.value = url
  ElMessage.success('二维码生成成功')
}

const downloadQR = () => {
  if (!qrUrl.value) return
  
  const link = document.createElement('a')
  link.href = qrUrl.value
  link.download = 'qrcode.png'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  ElMessage.success('二维码下载成功')
}

const clear = () => {
  form.text = ''
  qrUrl.value = ''
}
</script>

<style scoped>
.qr-generator {
  max-width: 600px;
  margin: 0 auto;
}

.info-card {
  margin-top: 1.5rem;
}

.qr-result {
  text-align: center;
  width: 100%;
}

.qr-image-container {
  background: #f9fafb;
  border-radius: 8px;
  padding: 1.5rem;
  display: inline-block;
  margin-bottom: 1rem;
}

.qr-actions {
  margin-top: 1rem;
}

.info-card p {
  margin: 0;
  color: #6b7280;
  line-height: 1.6;
}
</style>