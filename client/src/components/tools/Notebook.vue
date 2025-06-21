<template>
  <div class="notebook-container">
    <div class="notebook-layout">
      <!-- Left Sidebar - Categories -->
      <div class="notebook-sidebar">
        <div class="sidebar-header">
          <h3>笔记本</h3>
          <el-button 
            type="primary" 
            size="small" 
            @click="showCreateCategory = true"
            :icon="Plus"
          >
            新建分类
          </el-button>
        </div>
        
        <div class="search-box">
          <el-input
            v-model="searchQuery"
            placeholder="搜索笔记..."
            :prefix-icon="Search"
            @input="handleSearch"
            clearable
          />
        </div>

        <div class="categories-tree">
          <el-tree
            :data="categoryTree"
            :props="treeProps"
            node-key="id"
            default-expand-all
            @node-click="handleCategoryClick"
            class="category-tree"
          >
            <template #default="{ node, data }">
              <div class="tree-node">
                <span>{{ data.name }}</span>
                <div class="node-actions">
                  <el-button
                    type="text"
                    size="small"
                    @click.stop="editCategory(data)"
                  >
                    编辑
                  </el-button>
                  <el-button
                    type="text"
                    size="small"
                    @click.stop="deleteCategory(data)"
                  >
                    删除
                  </el-button>
                </div>
              </div>
            </template>
          </el-tree>
        </div>
      </div>

      <!-- Middle Panel - Notes List -->
      <div class="notes-list-panel">
        <div class="notes-header">
          <h4>{{ selectedCategory ? selectedCategory.name : '所有笔记' }}</h4>
          <el-button 
            type="primary" 
            size="small" 
            @click="createNote"
            :icon="DocumentAdd"
          >
            新建笔记
          </el-button>
        </div>

        <div class="notes-list">
          <div 
            v-for="note in filteredNotes" 
            :key="note.id"
            class="note-item"
            :class="{ active: selectedNote?.id === note.id }"
            @click="selectNote(note)"
          >
            <div class="note-title">{{ note.title }}</div>
            <div class="note-preview">{{ getPreview(note.content) }}</div>
            <div class="note-meta">
              <span>{{ formatDate(note.updatedAt) }}</span>
              <el-tag v-if="note.tags" size="small">{{ JSON.parse(note.tags || '[]').join(', ') }}</el-tag>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Panel - Editor -->
      <div class="editor-panel" v-if="selectedNote">
        <div class="editor-header">
          <el-input
            v-model="selectedNote.title"
            placeholder="笔记标题"
            @blur="autoSave"
            class="title-input"
          />
          <div class="editor-actions">
            <el-button @click="togglePreview" :type="showPreview ? 'primary' : 'default'">
              {{ showPreview ? '编辑' : '预览' }}
            </el-button>
            <el-button @click="saveNote" type="primary">保存</el-button>
            <el-button @click="deleteNote(selectedNote)" type="danger">删除</el-button>
          </div>
        </div>

        <div class="editor-content">
          <div v-if="!showPreview" class="markdown-editor">
            <el-input
              v-model="selectedNote.content"
              type="textarea"
              :rows="20"
              placeholder="开始写作..."
              @input="autoSave"
            />
          </div>
          <div v-else class="markdown-preview" v-html="renderedMarkdown"></div>
        </div>

        <div class="editor-footer">
          <el-input
            v-model="tagInput"
            placeholder="添加标签，用逗号分隔"
            @blur="updateTags"
            class="tag-input"
          />
        </div>
      </div>
    </div>

    <!-- Create Category Dialog -->
    <el-dialog v-model="showCreateCategory" title="创建分类" width="400px">
      <el-form :model="newCategory" label-width="80px">
        <el-form-item label="分类名称">
          <el-input v-model="newCategory.name" placeholder="请输入分类名称" />
        </el-form-item>
        <el-form-item label="父分类">
          <el-select v-model="newCategory.parentId" placeholder="选择父分类（可选）" clearable>
            <el-option
              v-for="category in categories"
              :key="category.id"
              :label="category.name"
              :value="category.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCreateCategory = false">取消</el-button>
        <el-button type="primary" @click="createCategory">创建</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search, DocumentAdd } from '@element-plus/icons-vue'
import { marked } from 'marked'
import DOMPurify from 'dompurify'

interface Note {
  id: number
  title: string
  content: string
  categoryId?: number
  userId: number
  tags?: string
  createdAt: Date
  updatedAt: Date
}

interface Category {
  id: number
  name: string
  parentId?: number
  userId: number
  createdAt: Date
  updatedAt: Date
  children?: Category[]
}

const notes = ref<Note[]>([])
const categories = ref<Category[]>([])
const selectedNote = ref<Note | null>(null)
const selectedCategory = ref<Category | null>(null)
const showPreview = ref(false)
const searchQuery = ref('')
const tagInput = ref('')
const showCreateCategory = ref(false)
const autoSaveTimer = ref<NodeJS.Timeout | null>(null)

const newCategory = reactive({
  name: '',
  parentId: null as number | null
})

const treeProps = {
  children: 'children',
  label: 'name'
}

// Computed properties
const categoryTree = computed(() => {
  const buildTree = (parentId: number | null = null): Category[] => {
    return categories.value
      .filter(cat => cat.parentId === parentId)
      .map(cat => ({
        ...cat,
        children: buildTree(cat.id)
      }))
  }
  return buildTree()
})

const filteredNotes = computed(() => {
  let filtered = notes.value
  
  if (selectedCategory.value) {
    filtered = filtered.filter(note => note.categoryId === selectedCategory.value!.id)
  }
  
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(note =>
      note.title.toLowerCase().includes(query) ||
      note.content.toLowerCase().includes(query)
    )
  }
  
  return filtered.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
})

const renderedMarkdown = computed(() => {
  if (!selectedNote.value) return ''
  const html = marked(selectedNote.value.content)
  return DOMPurify.sanitize(html)
})

// Methods
const loadCategories = async () => {
  try {
    const response = await fetch('/api/note-categories?userId=1')
    if (response.ok) {
      categories.value = await response.json()
    }
  } catch (error) {
    ElMessage.error('加载分类失败')
  }
}

const loadNotes = async (categoryId?: number) => {
  try {
    const url = categoryId 
      ? `/api/notes?userId=1&categoryId=${categoryId}`
      : '/api/notes?userId=1'
    const response = await fetch(url)
    if (response.ok) {
      notes.value = await response.json()
    }
  } catch (error) {
    ElMessage.error('加载笔记失败')
  }
}

const createCategory = async () => {
  if (!newCategory.name.trim()) {
    ElMessage.error('请输入分类名称')
    return
  }
  
  try {
    const response = await fetch('/api/note-categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: newCategory.name,
        parentId: newCategory.parentId || null,
        userId: 1
      })
    })
    
    if (response.ok) {
      ElMessage.success('分类创建成功')
      newCategory.name = ''
      newCategory.parentId = null
      showCreateCategory.value = false
      await loadCategories()
    }
  } catch (error) {
    ElMessage.error('创建分类失败')
  }
}

const createNote = async () => {
  try {
    const response = await fetch('/api/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: '新建笔记',
        content: '',
        categoryId: selectedCategory.value?.id || null,
        userId: 1
      })
    })
    
    if (response.ok) {
      const newNote = await response.json()
      notes.value.unshift(newNote)
      selectedNote.value = newNote
      ElMessage.success('笔记创建成功')
    }
  } catch (error) {
    ElMessage.error('创建笔记失败')
  }
}

const saveNote = async () => {
  if (!selectedNote.value) return
  
  try {
    const response = await fetch(`/api/notes/${selectedNote.value.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: selectedNote.value.title,
        content: selectedNote.value.content,
        tags: tagInput.value ? JSON.stringify(tagInput.value.split(',').map(t => t.trim())) : null
      })
    })
    
    if (response.ok) {
      const updatedNote = await response.json()
      const index = notes.value.findIndex(n => n.id === updatedNote.id)
      if (index !== -1) {
        notes.value[index] = updatedNote
      }
      ElMessage.success('保存成功')
    }
  } catch (error) {
    ElMessage.error('保存失败')
  }
}

const deleteNote = async (note: Note) => {
  try {
    await ElMessageBox.confirm('确定要删除这篇笔记吗？', '确认删除', {
      type: 'warning'
    })
    
    const response = await fetch(`/api/notes/${note.id}`, {
      method: 'DELETE'
    })
    
    if (response.ok) {
      notes.value = notes.value.filter(n => n.id !== note.id)
      if (selectedNote.value?.id === note.id) {
        selectedNote.value = null
      }
      ElMessage.success('删除成功')
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

const selectNote = (note: Note) => {
  selectedNote.value = note
  tagInput.value = note.tags ? JSON.parse(note.tags).join(', ') : ''
}

const handleCategoryClick = (category: Category) => {
  selectedCategory.value = category
  loadNotes(category.id)
}

const handleSearch = async () => {
  if (searchQuery.value.trim()) {
    try {
      const response = await fetch(`/api/notes/search?userId=1&q=${encodeURIComponent(searchQuery.value)}`)
      if (response.ok) {
        notes.value = await response.json()
      }
    } catch (error) {
      ElMessage.error('搜索失败')
    }
  } else {
    loadNotes(selectedCategory.value?.id)
  }
}

const autoSave = () => {
  if (autoSaveTimer.value) {
    clearTimeout(autoSaveTimer.value)
  }
  autoSaveTimer.value = setTimeout(() => {
    saveNote()
  }, 2000)
}

const togglePreview = () => {
  showPreview.value = !showPreview.value
}

const updateTags = () => {
  if (selectedNote.value) {
    selectedNote.value.tags = tagInput.value ? JSON.stringify(tagInput.value.split(',').map(t => t.trim())) : null
    autoSave()
  }
}

const getPreview = (content: string) => {
  return content.substring(0, 100) + (content.length > 100 ? '...' : '')
}

const formatDate = (date: Date) => {
  return new Date(date).toLocaleString('zh-CN')
}

const editCategory = (category: Category) => {
  // TODO: Implement category editing
  ElMessage.info('分类编辑功能待实现')
}

const deleteCategory = async (category: Category) => {
  try {
    await ElMessageBox.confirm('确定要删除这个分类吗？', '确认删除', {
      type: 'warning'
    })
    
    const response = await fetch(`/api/note-categories/${category.id}`, {
      method: 'DELETE'
    })
    
    if (response.ok) {
      await loadCategories()
      ElMessage.success('分类删除成功')
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除分类失败')
    }
  }
}

// Lifecycle
onMounted(() => {
  loadCategories()
  loadNotes()
})

// Watchers
watch(selectedCategory, (newCategory) => {
  if (newCategory) {
    loadNotes(newCategory.id)
  } else {
    loadNotes()
  }
})
</script>

<style scoped>
.notebook-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.notebook-layout {
  display: flex;
  height: 600px;
  border: 1px solid #e6e6e6;
  border-radius: 8px;
  overflow: hidden;
}

.notebook-sidebar {
  width: 250px;
  border-right: 1px solid #e6e6e6;
  display: flex;
  flex-direction: column;
  background: #fafafa;
}

.sidebar-header {
  padding: 16px;
  border-bottom: 1px solid #e6e6e6;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.sidebar-header h3 {
  margin: 0;
  font-size: 16px;
}

.search-box {
  padding: 16px;
  border-bottom: 1px solid #e6e6e6;
}

.categories-tree {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.tree-node {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.node-actions {
  display: none;
}

.tree-node:hover .node-actions {
  display: block;
}

.notes-list-panel {
  width: 300px;
  border-right: 1px solid #e6e6e6;
  display: flex;
  flex-direction: column;
}

.notes-header {
  padding: 16px;
  border-bottom: 1px solid #e6e6e6;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.notes-header h4 {
  margin: 0;
  font-size: 14px;
}

.notes-list {
  flex: 1;
  overflow-y: auto;
}

.note-item {
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: background-color 0.2s;
}

.note-item:hover {
  background-color: #f5f5f5;
}

.note-item.active {
  background-color: #e6f7ff;
  border-left: 3px solid #1890ff;
}

.note-title {
  font-weight: 500;
  font-size: 14px;
  margin-bottom: 4px;
  color: #333;
}

.note-preview {
  font-size: 12px;
  color: #666;
  margin-bottom: 8px;
  line-height: 1.4;
}

.note-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 11px;
  color: #999;
}

.editor-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.editor-header {
  padding: 16px;
  border-bottom: 1px solid #e6e6e6;
  display: flex;
  gap: 12px;
  align-items: center;
}

.title-input {
  flex: 1;
}

.editor-content {
  flex: 1;
  overflow: hidden;
}

.markdown-editor {
  height: 100%;
  padding: 16px;
}

.markdown-preview {
  height: 100%;
  padding: 16px;
  overflow-y: auto;
  background: #fff;
}

.editor-footer {
  padding: 16px;
  border-top: 1px solid #e6e6e6;
}

.tag-input {
  width: 100%;
}
</style>