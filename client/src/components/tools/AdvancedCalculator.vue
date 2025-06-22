<template>
  <div class="advanced-calculator">
    <el-card>
      <template #header>
        <h3>高级计算器</h3>
      </template>
      
      <el-tabs v-model="activeTab" type="card">
        <el-tab-pane label="计算器" name="basic">
          <div class="calculator-container">
            <basic-calculator />
            <el-divider />
            <h4>单位转换</h4>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-input v-model="unitValue" placeholder="输入数值" />
                <el-select v-model="unitFrom" class="unit-select">
                  <el-option label="米" value="m" />
                  <el-option label="千米" value="km" />
                  <el-option label="厘米" value="cm" />
                  <el-option label="毫米" value="mm" />
                </el-select>
              </el-col>
              <el-col :span="12">
                <el-input v-model="convertedValue" readonly />
                <el-select v-model="unitTo" class="unit-select">
                  <el-option label="米" value="m" />
                  <el-option label="千米" value="km" />
                  <el-option label="厘米" value="cm" />
                  <el-option label="毫米" value="mm" />
                </el-select>
              </el-col>
            </el-row>
            <el-button type="primary" @click="convertUnits">转换</el-button>
          </div>
        </el-tab-pane>
        
        <el-tab-pane label="进制转换" name="conversion">
          <div class="conversion-container">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-input v-model="inputValue" placeholder="输入数值" />
                <el-select v-model="inputBase" class="select-base">
                  <el-option label="二进制" value="2" />
                  <el-option label="八进制" value="8" />
                  <el-option label="十进制" value="10" />
                  <el-option label="十六进制" value="16" />
                </el-select>
              </el-col>
              
              <el-col :span="12">
                <el-input v-model="outputValue" readonly />
                <el-select v-model="outputBase" class="select-base">
                  <el-option label="二进制" value="2" />
                  <el-option label="八进制" value="8" />
                  <el-option label="十进制" value="10" />
                  <el-option label="十六进制" value="16" />
                </el-select>
              </el-col>
            </el-row>
            
            <el-button type="primary" @click="convertBase">转换</el-button>
          </div>
        </el-tab-pane>
        
        <el-tab-pane label="位运算" name="bitwise">
          <div class="bitwise-container">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-input v-model="bitwiseValue1" placeholder="数值1" />
              </el-col>
              <el-col :span="12">
                <el-input v-model="bitwiseValue2" placeholder="数值2" />
              </el-col>
            </el-row>
            
            <el-row :gutter="10" class="bitwise-buttons">
              <el-col :span="6"><el-button @click="bitwiseAnd">AND</el-button></el-col>
              <el-col :span="6"><el-button @click="bitwiseOr">OR</el-button></el-col>
              <el-col :span="6"><el-button @click="bitwiseXor">XOR</el-button></el-col>
              <el-col :span="6"><el-button @click="bitwiseNot">NOT</el-button></el-col>
            </el-row>
            
            <el-row :gutter="10" class="bitwise-buttons">
              <el-col :span="6"><el-button @click="leftShift"><<</el-button></el-col>
              <el-col :span="6"><el-button @click="rightShift">>></el-button></el-col>
              <el-col :span="6"><el-button @click="arithmeticRightShift">>>></el-button></el-col>
            </el-row>
            
            <el-input v-model="bitwiseResult" readonly />
          </div>
        </el-tab-pane>
        
        <el-tab-pane label="哈希计算" name="hash">
          <div class="hash-container">
            <el-input v-model="hashInput" type="textarea" :rows="3" placeholder="输入要计算哈希的文本" />
            
            <el-select v-model="hashAlgorithm" class="hash-select">
              <el-option label="MD5" value="md5" />
              <el-option label="SHA1" value="sha1" />
              <el-option label="SHA256" value="sha256" />
              <el-option label="SHA512" value="sha512" />
            </el-select>
            
            <el-button type="primary" @click="calculateHash">计算哈希</el-button>
            
            <el-input v-model="hashResult" readonly />
          </div>
        </el-tab-pane>
        
        <el-tab-pane label="网络计算" name="network">
          <div class="network-container">
            <el-input v-model="ipAddress" placeholder="IP地址 (例如: 192.168.1.1)" />
            <el-input v-model="subnetMask" placeholder="子网掩码 (例如: 255.255.255.0)" />
            
            <el-button type="primary" @click="calculateNetwork">计算网络信息</el-button>
            
            <el-divider />
            
            <el-row :gutter="20">
              <el-col :span="12">
                <el-input v-model="networkResult.network" readonly placeholder="网络地址" />
              </el-col>
              <el-col :span="12">
                <el-input v-model="networkResult.broadcast" readonly placeholder="广播地址" />
              </el-col>
            </el-row>
            
            <el-input v-model="networkResult.range" readonly placeholder="可用IP范围" />
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>
<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import BasicCalculator from './SimpleCalculator.vue'
// 单位转换
const unitValue = ref('')
const unitFrom = ref('m')
const unitTo = ref('km')
const convertedValue = ref('')
const unitConversionRates = {
  m: 1,
  km: 1000,
  cm: 0.01,
  mm: 0.001
}
const convertUnits = () => {
  if (!unitValue.value) return
  
  try {
    const value = parseFloat(unitValue.value)
    const fromRate = unitConversionRates[unitFrom.value]
    const toRate = unitConversionRates[unitTo.value]
    convertedValue.value = (value * fromRate / toRate).toString()
  } catch (error) {
    convertedValue.value = '转换错误'
  }
}
// 监听单位变化自动转换
watch([unitFrom, unitTo], () => {
  if (unitValue.value) {
    convertUnits()
  }
})
import CryptoJS from 'crypto-js'
const activeTab = ref('basic')
// 进制转换
const inputValue = ref('')
const inputBase = ref('10')
const outputValue = ref('')
const outputBase = ref('2')
const convertBase = () => {
  try {
    const num = parseInt(inputValue.value, parseInt(inputBase.value))
    outputValue.value = num.toString(parseInt(outputBase.value))
  } catch (error) {
    outputValue.value = '转换错误'
  }
}
// 位运算
const bitwiseValue1 = ref('')
const bitwiseValue2 = ref('')
const bitwiseResult = ref('')
const bitwiseAnd = () => {
  const num1 = parseInt(bitwiseValue1.value)
  const num2 = parseInt(bitwiseValue2.value)
  bitwiseResult.value = (num1 & num2).toString()
}
const bitwiseOr = () => {
  const num1 = parseInt(bitwiseValue1.value)
  const num2 = parseInt(bitwiseValue2.value)
  bitwiseResult.value = (num1 | num2).toString()
}
const bitwiseXor = () => {
  const num1 = parseInt(bitwiseValue1.value)
  const num2 = parseInt(bitwiseValue2.value)
  bitwiseResult.value = (num1 ^ num2).toString()
}
const bitwiseNot = () => {
  const num = parseInt(bitwiseValue1.value)
  bitwiseResult.value = (~num).toString()
}
const leftShift = () => {
  const num = parseInt(bitwiseValue1.value)
  const shift = parseInt(bitwiseValue2.value)
  bitwiseResult.value = (num << shift).toString()
}
const rightShift = () => {
  const num = parseInt(bitwiseValue1.value)
  const shift = parseInt(bitwiseValue2.value)
  bitwiseResult.value = (num >> shift).toString()
}
const arithmeticRightShift = () => {
  const num = parseInt(bitwiseValue1.value)
  const shift = parseInt(bitwiseValue2.value)
  bitwiseResult.value = (num >>> shift).toString()
}
// 哈希计算
const hashInput = ref('')
const hashAlgorithm = ref('md5')
const hashResult = ref('')
const calculateHash = () => {
  if (!hashInput.value) return
  
  try {
    switch (hashAlgorithm.value) {
      case 'md5':
        hashResult.value = CryptoJS.MD5(hashInput.value).toString()
        break
      case 'sha1':
        hashResult.value = CryptoJS.SHA1(hashInput.value).toString()
        break
      case 'sha256':
        hashResult.value = CryptoJS.SHA256(hashInput.value).toString()
        break
      case 'sha512':
        hashResult.value = CryptoJS.SHA512(hashInput.value).toString()
        break
    }
  } catch (error) {
    hashResult.value = '哈希计算错误'
  }
}
// 网络计算
const ipAddress = ref('')
const subnetMask = ref('')
const networkResult = ref({
  network: '',
  broadcast: '',
  range: ''
})
const calculateNetwork = () => {
  if (!ipAddress.value || !subnetMask.value) return
  
  try {
    const ipParts = ipAddress.value.split('.').map(Number)
    const maskParts = subnetMask.value.split('.').map(Number)
    
    // 计算网络地址
    const networkParts = ipParts.map((part, i) => part & maskParts[i])
    networkResult.value.network = networkParts.join('.')
    
    // 计算广播地址
    const broadcastParts = maskParts.map((part, i) => 
      networkParts[i] | (~part & 0xFF)
    )
    networkResult.value.broadcast = broadcastParts.join('.')
    
    // 计算可用IP范围
    const firstUsable = [...networkParts]
    firstUsable[3] += 1
    const lastUsable = [...broadcastParts]
    lastUsable[3] -= 1
    networkResult.value.range = `${firstUsable.join('.')} - ${lastUsable.join('.')}`
  } catch (error) {
    networkResult.value = {
      network: '计算错误',
      broadcast: '计算错误',
      range: '计算错误'
    }
  }
}
</script>
<style scoped>
.advanced-calculator {
  max-width: 100%;
  margin: 0 auto;
  padding: 10px;
  box-sizing: border-box;
}
@media (max-width: 768px) {
  .el-col {
    width: 100% !important;
  }
  
  .bitwise-buttons .el-col {
    margin-bottom: 8px;
  }
}
@media (max-width: 480px) {
  .el-tabs__item {
    padding: 0 8px;
    font-size: 12px;
  }
}
.conversion-container,
.bitwise-container,
.hash-container,
.network-container {
  padding: 20px;
}
.select-base,
.hash-select {
  margin: 10px 0;
  width: 100%;
}
.bitwise-buttons {
  margin: 10px 0;
}
.calculator-container {
  padding: 15px;
}
.unit-select {
  margin: 10px 0;
  width: 100%;
}
</style>
