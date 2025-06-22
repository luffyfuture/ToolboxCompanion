<template>
  <div class="text-counter">
    <el-row :gutter="20">
      <el-col :span="12">
        <el-card>
          <template #header>
            <h3>文本输入</h3>
          </template>
          <el-input
            v-model="text"
            type="textarea"
            placeholder="在此输入或粘贴您的文本..."
            :rows="15"
            resize="none"
          />
        </el-card>
      </el-col>
      
      <el-col :span="12">
        <el-card>
          <template #header>
            <h3>文本统计</h3>
          </template>
          <div class="stats-grid">
            <div class="stat-item">
              <div class="stat-label">字符数</div>
              <div class="stat-value">{{ stats.characters }}</div>
            </div>
            
            <div class="stat-item">
              <div class="stat-label">字符数(不含空格)</div>
              <div class="stat-value">{{ stats.charactersNoSpaces }}</div>
            </div>
            
            <div class="stat-item">
              <div class="stat-label">单词数</div>
              <div class="stat-value">{{ stats.words }}</div>
            </div>
            
            <div class="stat-item">
              <div class="stat-label">行数</div>
              <div class="stat-value">{{ stats.lines }}</div>
            </div>
            
            <div class="stat-item">
              <div class="stat-label">段落数</div>
              <div class="stat-value">{{ stats.paragraphs }}</div>
            </div>
            
            <div class="stat-item">
              <div class="stat-label">句子数</div>
              <div class="stat-value">{{ stats.sentences }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const text = ref('')

const stats = computed(() => {
  const characters = text.value.length
  const charactersNoSpaces = text.value.replace(/\s/g, '').length
  const words = text.value.trim() ? text.value.trim().split(/\s+/).length : 0
  const lines = text.value.split('\n').length
  const paragraphs = text.value.split(/\n\s*\n/).filter(p => p.trim()).length
  const sentences = text.value.split(/[.!?]+/).filter(s => s.trim()).length

  return {
    characters,
    charactersNoSpaces,
    words,
    lines,
    paragraphs,
    sentences
  }
})
</script>

<style scoped>
.text-counter {
  max-width: 100%;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.stat-item {
  background: #f9fafb;
  padding: 1rem;
  border-radius: 8px;
  text-align: center;
}

.stat-label {
  color: #6b7280;
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
}
</style>