<template>
  <div class="simple-calculator">
    <el-card>
      <template #header>
        <h3>简单计算器</h3>
      </template>
      
      <div class="calculator-display">
        <div class="expression">{{ expression }}</div>
        <div class="result">{{ display }}</div>
      </div>
      
      <div class="calculator-buttons">
        <el-row :gutter="10">
          <el-col :span="6"><el-button @click="clear" class="btn-secondary" style="width: 100%">C</el-button></el-col>
          <el-col :span="6"><el-button @click="clearEntry" class="btn-secondary" style="width: 100%">CE</el-button></el-col>
          <el-col :span="6"><el-button @click="backspace" class="btn-secondary" style="width: 100%">⌫</el-button></el-col>
          <el-col :span="6"><el-button @click="inputOperation('/')" class="btn-operator" style="width: 100%">÷</el-button></el-col>
        </el-row>
        
        <el-row :gutter="10" style="margin-top: 10px">
          <el-col :span="6"><el-button @click="inputNumber('7')" class="btn-number" style="width: 100%">7</el-button></el-col>
          <el-col :span="6"><el-button @click="inputNumber('8')" class="btn-number" style="width: 100%">8</el-button></el-col>
          <el-col :span="6"><el-button @click="inputNumber('9')" class="btn-number" style="width: 100%">9</el-button></el-col>
          <el-col :span="6"><el-button @click="inputOperation('*')" class="btn-operator" style="width: 100%">×</el-button></el-col>
        </el-row>
        
        <el-row :gutter="10" style="margin-top: 10px">
          <el-col :span="6"><el-button @click="inputNumber('4')" class="btn-number" style="width: 100%">4</el-button></el-col>
          <el-col :span="6"><el-button @click="inputNumber('5')" class="btn-number" style="width: 100%">5</el-button></el-col>
          <el-col :span="6"><el-button @click="inputNumber('6')" class="btn-number" style="width: 100%">6</el-button></el-col>
          <el-col :span="6"><el-button @click="inputOperation('-')" class="btn-operator" style="width: 100%">−</el-button></el-col>
        </el-row>
        
        <el-row :gutter="10" style="margin-top: 10px">
          <el-col :span="6"><el-button @click="inputNumber('1')" class="btn-number" style="width: 100%">1</el-button></el-col>
          <el-col :span="6"><el-button @click="inputNumber('2')" class="btn-number" style="width: 100%">2</el-button></el-col>
          <el-col :span="6"><el-button @click="inputNumber('3')" class="btn-number" style="width: 100%">3</el-button></el-col>
          <el-col :span="6"><el-button @click="inputOperation('+')" class="btn-operator" style="width: 100%">+</el-button></el-col>
        </el-row>
        
        <el-row :gutter="10" style="margin-top: 10px">
          <el-col :span="12"><el-button @click="inputNumber('0')" class="btn-number" style="width: 100%">0</el-button></el-col>
          <el-col :span="6"><el-button @click="inputDecimal" class="btn-number" style="width: 100%">.</el-button></el-col>
          <el-col :span="6"><el-button @click="calculate" class="btn-equals" style="width: 100%">=</el-button></el-col>
        </el-row>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const display = ref('0')
const expression = ref('')
const lastOperation = ref<string | null>(null)
const waitingForNewNumber = ref(true)

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
  const sanitized = expr
    .replace(/×/g, '*')
    .replace(/÷/g, '/')
    .replace(/−/g, '-')

  return Function('"use strict"; return (' + sanitized + ')')()
}
</script>

<style scoped>
.simple-calculator {
  max-width: 400px;
  margin: 0 auto;
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
  margin-top: 1rem;
}

.btn-number {
  background: white;
  border: 1px solid #e5e7eb;
  color: #374151;
  height: 3rem;
}

.btn-secondary {
  background: #f3f4f6;
  border: 1px solid #d1d5db;
  color: #374151;
  height: 3rem;
}

.btn-operator {
  background: #3b82f6;
  border: none;
  color: white;
  height: 3rem;
}

.btn-equals {
  background: #10b981;
  border: none;
  color: white;
  height: 3rem;
}
</style>