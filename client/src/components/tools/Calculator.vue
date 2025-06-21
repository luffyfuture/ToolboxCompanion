<template>
  <div class="calculator-container">
    <el-card class="calculator-card">
      <div class="calculator-display">
        <div class="expression">{{ expression }}</div>
        <div class="result">{{ display }}</div>
      </div>
      
      <div class="calculator-buttons">
        <!-- 第一行 -->
        <el-button @click="clear" class="btn-secondary">C</el-button>
        <el-button @click="clearEntry" class="btn-secondary">CE</el-button>
        <el-button @click="backspace" class="btn-secondary">
          <el-icon><Delete /></el-icon>
        </el-button>
        <el-button @click="inputOperation('/')" class="btn-operator">÷</el-button>
        
        <!-- 第二行 -->
        <el-button @click="inputNumber('7')" class="btn-number">7</el-button>
        <el-button @click="inputNumber('8')" class="btn-number">8</el-button>
        <el-button @click="inputNumber('9')" class="btn-number">9</el-button>
        <el-button @click="inputOperation('*')" class="btn-operator">×</el-button>
        
        <!-- 第三行 -->
        <el-button @click="inputNumber('4')" class="btn-number">4</el-button>
        <el-button @click="inputNumber('5')" class="btn-number">5</el-button>
        <el-button @click="inputNumber('6')" class="btn-number">6</el-button>
        <el-button @click="inputOperation('-')" class="btn-operator">−</el-button>
        
        <!-- 第四行 -->
        <el-button @click="inputNumber('1')" class="btn-number">1</el-button>
        <el-button @click="inputNumber('2')" class="btn-number">2</el-button>
        <el-button @click="inputNumber('3')" class="btn-number">3</el-button>
        <el-button @click="inputOperation('+')" class="btn-operator">+</el-button>
        
        <!-- 第五行 -->
        <el-button @click="inputNumber('0')" class="btn-number btn-zero">0</el-button>
        <el-button @click="inputDecimal" class="btn-number">.</el-button>
        <el-button @click="calculate" class="btn-equals">=</el-button>
      </div>
    </el-card>
    
    <!-- 历史记录 -->
    <el-card class="history-card">
      <template #header>
        <div class="history-header">
          <el-icon><Clock /></el-icon>
          <span>计算历史</span>
        </div>
      </template>
      
      <div class="history-content">
        <div v-if="history.length === 0" class="no-history">
          暂无计算记录
        </div>
        <div v-else class="history-list">
          <div 
            v-for="(entry, index) in history" 
            :key="index"
            class="history-item"
          >
            <span class="history-expression">{{ entry.expression }}</span>
            <span class="history-result">{{ entry.result }}</span>
          </div>
        </div>
        
        <el-button 
          v-if="history.length > 0"
          @click="clearHistory" 
          text 
          type="danger"
          class="clear-history-btn"
        >
          清除历史
        </el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { Delete, Clock } from '@element-plus/icons-vue'

const display = ref('0')
const expression = ref('')
const lastOperation = ref<string | null>(null)
const waitingForNewNumber = ref(true)

interface HistoryEntry {
  expression: string
  result: string
}

const history = reactive<HistoryEntry[]>([])

const updateDisplay = () => {
  // 触发响应式更新
}

const inputNumber = (num: string) => {
  if (waitingForNewNumber.value) {
    display.value = num
    waitingForNewNumber.value = false
  } else {
    display.value = display.value === '0' ? num : display.value + num
  }
}

const inputDecimal = () => {
  if (waitingForNewNumber.value) {
    display.value = '0.'
    waitingForNewNumber.value = false
  } else if (display.value.indexOf('.') === -1) {
    display.value += '.'
  }
}

const inputOperation = (operation: string) => {
  if (!waitingForNewNumber.value) {
    if (expression.value && lastOperation.value) {
      calculate()
    } else {
      expression.value = display.value
    }
  }

  lastOperation.value = operation
  expression.value += ` ${getOperationSymbol(operation)} `
  waitingForNewNumber.value = true
}

const calculate = () => {
  if (!expression.value || !lastOperation.value) return

  try {
    const fullExpression = expression.value + display.value
    const result = evaluateExpression(fullExpression)
    
    history.unshift({
      expression: fullExpression,
      result: result.toString()
    })

    if (history.length > 10) {
      history.splice(10)
    }

    display.value = result.toString()
    expression.value = ''
    lastOperation.value = null
    waitingForNewNumber.value = true
  } catch (error) {
    display.value = 'Error'
    clear()
  }
}

const clear = () => {
  display.value = '0'
  expression.value = ''
  lastOperation.value = null
  waitingForNewNumber.value = true
}

const clearEntry = () => {
  display.value = '0'
  waitingForNewNumber.value = true
}

const backspace = () => {
  if (display.value.length > 1) {
    display.value = display.value.slice(0, -1)
  } else {
    display.value = '0'
    waitingForNewNumber.value = true
  }
}

const clearHistory = () => {
  history.splice(0)
}

const getOperationSymbol = (operation: string): string => {
  switch (operation) {
    case '+': return '+'
    case '-': return '−'
    case '*': return '×'
    case '/': return '÷'
    default: return operation
  }
}

const evaluateExpression = (expr: string): number => {
  // 替换显示符号为实际操作符
  const sanitized = expr
    .replace(/×/g, '*')
    .replace(/÷/g, '/')
    .replace(/−/g, '-')

  // 简单表达式求值（生产环境建议使用专业的表达式解析器）
  return Function('"use strict"; return (' + sanitized + ')')()
}
</script>

<style scoped>
.calculator-container {
  display: flex;
  gap: 1.5rem;
  max-width: 800px;
  margin: 0 auto;
}

.calculator-card {
  flex: 1;
  max-width: 400px;
}

.calculator-display {
  background: #1f2937;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  text-align: right;
}

.expression {
  color: #9ca3af;
  font-size: 0.875rem;
  min-height: 1.25rem;
  font-family: 'Monaco', 'Menlo', monospace;
}

.result {
  color: white;
  font-size: 2rem;
  font-weight: 600;
  font-family: 'Monaco', 'Menlo', monospace;
  margin-top: 0.5rem;
}

.calculator-buttons {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.75rem;
}

.calculator-buttons .el-button {
  height: 3.5rem;
  font-size: 1.125rem;
  font-weight: 600;
}

.btn-number {
  background: white;
  border: 1px solid #e5e7eb;
  color: #374151;
}

.btn-number:hover {
  background: #f9fafb;
}

.btn-zero {
  grid-column: span 2;
}

.btn-secondary {
  background: #f3f4f6;
  border: 1px solid #d1d5db;
  color: #374151;
}

.btn-secondary:hover {
  background: #e5e7eb;
}

.btn-operator {
  background: #3b82f6;
  border: none;
  color: white;
}

.btn-operator:hover {
  background: #2563eb;
}

.btn-equals {
  background: #10b981;
  border: none;
  color: white;
}

.btn-equals:hover {
  background: #059669;
}

.history-card {
  flex: 1;
  max-width: 300px;
}

.history-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #6b7280;
  font-weight: 500;
}

.history-content {
  max-height: 300px;
  overflow-y: auto;
}

.no-history {
  text-align: center;
  color: #9ca3af;
  padding: 2rem 0;
}

.history-list {
  space-y: 0.5rem;
}

.history-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: #f9fafb;
  border-radius: 6px;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
}

.history-expression {
  color: #6b7280;
}

.history-result {
  font-family: 'Monaco', 'Menlo', monospace;
  font-weight: 600;
  color: #374151;
}

.clear-history-btn {
  width: 100%;
  margin-top: 1rem;
}

@media (max-width: 768px) {
  .calculator-container {
    flex-direction: column;
  }
  
  .calculator-card,
  .history-card {
    max-width: 100%;
  }
}
</style>