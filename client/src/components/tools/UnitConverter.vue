<template>
  <div class="unit-converter">
    <el-card>
      <template #header>
        <h3>单位转换器</h3>
      </template>
      
      <el-form :model="form" label-width="100px">
        <el-form-item label="转换类别">
          <el-select v-model="form.category" @change="handleCategoryChange" style="width: 100%">
            <el-option
              v-for="cat in categories"
              :key="cat.key"
              :label="cat.name"
              :value="cat.key"
            />
          </el-select>
        </el-form-item>
        
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="从">
              <el-select v-model="form.fromUnit" style="width: 100%">
                <el-option
                  v-for="unit in currentUnits"
                  :key="unit.key"
                  :label="unit.name"
                  :value="unit.key"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="到">
              <el-select v-model="form.toUnit" style="width: 100%">
                <el-option
                  v-for="unit in currentUnits"
                  :key="unit.key"
                  :label="unit.name"
                  :value="unit.key"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item label="输入值">
          <el-input
            v-model="form.inputValue"
            type="number"
            placeholder="输入要转换的数值"
            @input="handleConvert"
          />
        </el-form-item>
        
        <el-form-item v-if="result" label="转换结果">
          <el-input v-model="result" readonly>
            <template #append>{{ getUnitName(form.toUnit) }}</template>
          </el-input>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'

const form = reactive({
  category: 'length',
  fromUnit: 'meter',
  toUnit: 'kilometer',
  inputValue: ''
})

const result = ref('')

const conversions = {
  length: {
    name: '长度',
    units: {
      meter: { name: '米', factor: 1 },
      kilometer: { name: '千米', factor: 0.001 },
      centimeter: { name: '厘米', factor: 100 },
      millimeter: { name: '毫米', factor: 1000 },
      inch: { name: '英寸', factor: 39.3701 },
      foot: { name: '英尺', factor: 3.28084 },
      yard: { name: '码', factor: 1.09361 },
      mile: { name: '英里', factor: 0.000621371 }
    }
  },
  weight: {
    name: '重量',
    units: {
      kilogram: { name: '千克', factor: 1 },
      gram: { name: '克', factor: 1000 },
      pound: { name: '磅', factor: 2.20462 },
      ounce: { name: '盎司', factor: 35.274 },
      ton: { name: '吨', factor: 0.001 }
    }
  },
  temperature: {
    name: '温度',
    units: {
      celsius: { name: '摄氏度', factor: 1 },
      fahrenheit: { name: '华氏度', factor: 1 },
      kelvin: { name: '开尔文', factor: 1 }
    }
  }
}

const categories = computed(() => {
  return Object.entries(conversions).map(([key, cat]) => ({
    key,
    name: cat.name
  }))
})

const currentUnits = computed(() => {
  const category = conversions[form.category as keyof typeof conversions]
  return Object.entries(category.units).map(([key, unit]) => ({
    key,
    name: unit.name
  }))
})

const handleCategoryChange = () => {
  const firstUnit = Object.keys(conversions[form.category as keyof typeof conversions].units)[0]
  form.fromUnit = firstUnit
  form.toUnit = firstUnit
  result.value = ''
}

const handleConvert = () => {
  if (!form.inputValue || !form.fromUnit || !form.toUnit) {
    result.value = ''
    return
  }

  const value = parseFloat(form.inputValue)
  if (isNaN(value)) {
    result.value = ''
    return
  }

  let convertedValue = 0

  if (form.category === 'temperature') {
    // 温度转换需要特殊处理
    if (form.fromUnit === 'celsius' && form.toUnit === 'fahrenheit') {
      convertedValue = (value * 9/5) + 32
    } else if (form.fromUnit === 'fahrenheit' && form.toUnit === 'celsius') {
      convertedValue = (value - 32) * 5/9
    } else if (form.fromUnit === 'celsius' && form.toUnit === 'kelvin') {
      convertedValue = value + 273.15
    } else if (form.fromUnit === 'kelvin' && form.toUnit === 'celsius') {
      convertedValue = value - 273.15
    } else if (form.fromUnit === 'fahrenheit' && form.toUnit === 'kelvin') {
      convertedValue = (value - 32) * 5/9 + 273.15
    } else if (form.fromUnit === 'kelvin' && form.toUnit === 'fahrenheit') {
      convertedValue = (value - 273.15) * 9/5 + 32
    } else {
      convertedValue = value
    }
  } else {
    // 标准单位转换
    const categoryData = conversions[form.category as keyof typeof conversions]
    const fromFactor = categoryData.units[form.fromUnit as keyof typeof categoryData.units].factor
    const toFactor = categoryData.units[form.toUnit as keyof typeof categoryData.units].factor
    
    // 转换为基础单位，然后转换为目标单位
    const baseValue = value / fromFactor
    convertedValue = baseValue * toFactor
  }

  result.value = convertedValue.toFixed(6).replace(/\.?0+$/, '')
}

const getUnitName = (unitKey: string) => {
  const category = conversions[form.category as keyof typeof conversions]
  return category.units[unitKey as keyof typeof category.units]?.name || ''
}
</script>

<style scoped>
.unit-converter {
  max-width: 600px;
  margin: 0 auto;
}

.el-form-item {
  margin-bottom: 1.5rem;
}
</style>