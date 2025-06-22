<template>
  <div class="notebook-container">
    <!-- Mobile Header -->
    <div class="mobile-header md:hidden">
      <div class="flex items-center justify-between p-4 border-b">
        <h2 class="text-lg font-semibold">笔记本</h2>
        <div class="flex gap-2">
          <el-button size="small" @click="showSidebar = !showSidebar">
            {{ showSidebar ? '隐藏' : '显示' }}分类
          </el-button>
          <el-button 
            type="primary" 
            size="small" 
            @click="showCreateCategory = true"
            :icon="Plus"
          >
            新建
          </el-button>
        </div>
      </div>
    </div>

    <div class="notebook-layout">
      <!-- Left Sidebar - Categories -->
      <div class="notebook-sidebar" :class="{ 'mobile-hidden': !showSidebar }">
        <div class="sidebar-header hidden md:flex">
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
      <div class="notes-list-panel" :class="{ 'mobile-hidden': selectedNote && isMobile }">
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
        <!-- Mobile back button -->
        <div class="mobile-back md:hidden">
          <el-button @click="selectedNote = null" size="small">
            ← 返回列表
          </el-button>
        </div>

        <div class="editor-header">
          <el-input
            v-model="selectedNote.title"
            placeholder="笔记标题"
            @blur="autoSave"
            class="title-input"
          />
          <div class="editor-actions">
            <el-button @click="saveNote" type="primary" size="small">保存</el-button>
            <el-button @click="deleteNote(selectedNote)" type="danger" size="small">删除</el-button>
          </div>
        </div>

        <div class="editor-content">
          <MdEditor
            v-if="selectedNote"
            v-model="selectedNote.content"
            @onSave="saveNote"
            @onChange="autoSave"
            style="height: 100%;"
            :toolbarsExclude="['github']"
            language="zh-CN"
          />
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
import { ref, reactive, computed, onMounted, onUnmounted, watch } from 'vue' // Removed nextTick
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search, DocumentAdd } from '@element-plus/icons-vue'
import { MdEditor } from 'md-editor-v3'
import 'md-editor-v3/lib/style.css'

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
// const showPreview = ref(false) // Removed
const searchQuery = ref('')
const tagInput = ref('')
const showCreateCategory = ref(false)
const autoSaveTimer = ref<ReturnType<typeof setTimeout> | null>(null) // Corrected type
const showSidebar = ref(false)
const isMobile = ref(false)
// const textareaRef = ref() // Removed

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

// const renderedMarkdown = computed(() => { // Removed
//   if (!selectedNote.value) return ''
//   // const html = marked(selectedNote.value.content) // md-editor-v3 handles this
//   // return DOMPurify.sanitize(html) // md-editor-v3 handles sanitization
// })

// Methods
const loadCategories = async () => {
  try {
    const response = await fetch('/api/note-categories?userId=1')
    if (response.ok) {
      categories.value = await response.json()
    } else {
      ElMessage.error('加载分类失败')
    }
  } catch (error) {
    console.error('Error loading categories:', error)
    ElMessage.error('加载分类失败')
  }
}

const loadNotes = async (categoryId?: number) => {
  try {
    const url = categoryId 
      ? `/api/notes?userId=1&categoryId=${categoryId}` // Assuming userId=1
      : '/api/notes?userId=1' // Assuming userId=1
    const response = await fetch(url)
    if (response.ok) {
      notes.value = await response.json()
    } else {
      ElMessage.error('加载笔记失败')
    }
  } catch (error) {
    console.error('Error loading notes:', error)
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
        userId: 1 // Assuming userId=1
      })
    })
    
    if (response.ok) {
      ElMessage.success('分类创建成功')
      newCategory.name = ''
      newCategory.parentId = null
      showCreateCategory.value = false
      await loadCategories()
    } else {
      ElMessage.error('创建分类失败')
    }
  } catch (error) {
    console.error('Error creating category:', error)
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
        content: '', // md-editor-v3 will provide initial content if any
        categoryId: selectedCategory.value?.id || null,
        userId: 1 // Assuming userId=1
      })
    })
    
    if (response.ok) {
      const newNote = await response.json()
      notes.value.unshift(newNote) // Add to the beginning of the list
      selectedNote.value = newNote
      ElMessage.success('笔记创建成功')
    } else {
      ElMessage.error('创建笔记失败')
    }
  } catch (error) {
    console.error('Error creating note:', error)
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
        notes.value[index] = { ...notes.value[index], ...updatedNote } // Ensure reactivity
      }
      ElMessage.success('保存成功')
    } else {
      ElMessage.error('保存失败')
    }
  } catch (error) {
    console.error('Error saving note:', error)
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
    } else {
      ElMessage.error('删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') { // To avoid error message on cancel
      console.error('Error deleting note:', error)
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
  // loadNotes(category.id) // This will be triggered by the watcher
}

const handleSearch = async () => {
  // Debounce this if called frequently on input
  if (searchQuery.value.trim()) {
    try {
      const response = await fetch(`/api/notes/search?userId=1&q=${encodeURIComponent(searchQuery.value)}`) // Assuming userId=1
      if (response.ok) {
        notes.value = await response.json()
      } else {
        ElMessage.error('搜索失败')
      }
    } catch (error) {
      console.error('Error searching notes:', error)
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
    if (selectedNote.value) { // Ensure selectedNote exists before saving
        saveNote()
    }
  }, 1500) // Adjusted auto-save delay
}

// togglePreview removed

const updateTags = () => {
  if (selectedNote.value) {
    // selectedNote.value.tags = tagInput.value ? JSON.stringify(tagInput.value.split(',').map(t => t.trim())) : null
    // autoSave() // Save will be triggered by content change or explicit save
    // We might want to save immediately when tags change or just update the ref and let autoSave handle it.
    // For now, let's trigger saveNote directly if tags change.
    saveNote();
  }
}

const getPreview = (content: string) => {
  // This preview is for the notes list, not the editor itself.
  // md-editor-v3 will handle its own preview.
  // We can generate a plain text preview here.
  const plainText = content.replace(/<[^>]*>?/gm, '').replace(/[#*`>\-]/g, '') // Basic removal of markdown/html
  return plainText.substring(0, 100) + (plainText.length > 100 ? '...' : '')
}

const formatDate = (date: Date | string) => { // Allow string for flexibility if API returns string
  return new Date(date).toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
}

const editCategory = (category: Category) => {
  // TODO: Implement category editing
  ElMessage.info('分类编辑功能待实现')
}

const deleteCategory = async (category: Category) => {
  try {
    await ElMessageBox.confirm(`确定要删除分类 "${category.name}" 吗？其下的所有笔记将被取消分类。`, '确认删除', {
      type: 'warning'
    })
    
    const response = await fetch(`/api/note-categories/${category.id}`, {
      method: 'DELETE'
    })
    
    if (response.ok) {
      await loadCategories()
      await loadNotes() // Refresh notes as some might be uncategorized
      ElMessage.success('分类删除成功')
    } else {
      ElMessage.error('删除分类失败')
    }
  } catch (error) {
     if (error !== 'cancel') {
      console.error('Error deleting category:', error)
      ElMessage.error('删除分类失败')
    }
  }
}

// insertMarkdown function removed

const checkMobile = () => {
  isMobile.value = window.innerWidth < 768
}

// Lifecycle
onMounted(() => {
  loadCategories()
  loadNotes() // Load all notes initially
  checkMobile()
  window.addEventListener('resize', checkMobile)
})

onUnmounted(() => {
  if (autoSaveTimer.value) {
    clearTimeout(autoSaveTimer.value)
  }
  window.removeEventListener('resize', checkMobile)
})

// Watchers
watch(selectedCategory, (newCategory) => {
  loadNotes(newCategory?.id) // Use optional chaining
})

</script>

<style scoped>
.notebook-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.notebook-layout {
  display: flex;
  flex: 1;
  height: calc(100vh - 120px); /* Adjust as needed */
  border: 1px solid #e6e6e6;
  border-radius: 8px;
  overflow: hidden; /* This is important */
}

@media (max-width: 768px) {
  .notebook-layout {
    height: calc(100vh - 160px); /* Adjust as needed for mobile header */
  }
}

.notebook-sidebar {
  width: 250px;
  border-right: 1px solid #e6e6e6;
  display: flex;
  flex-direction: column;
  background: #fafafa;
  transition: transform 0.3s ease;
  flex-shrink: 0; /* Prevent sidebar from shrinking */
}

@media (max-width: 768px) {
  .notebook-sidebar {
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    width: 280px;
    z-index: 10;
    box-shadow: 2px 0 8px rgba(0, 0, 0, 0.15);
  }
  
  .notebook-sidebar.mobile-hidden {
    transform: translateX(-100%);
  }
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

.category-tree {
 /* Make sure the tree itself doesn't cause overflow issues if names are too long */
  word-break: break-all;
}

.tree-node {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.node-actions {
  display: none; /* Hidden by default, shown on hover */
  white-space: nowrap; /* Prevent actions from wrapping */
}

.tree-node:hover .node-actions {
  display: block;
}

.notes-list-panel {
  width: 300px;
  border-right: 1px solid #e6e6e6;
  display: flex;
  flex-direction: column;
  flex-shrink: 0; /* Prevent panel from shrinking */
}

@media (max-width: 768px) {
  .notes-list-panel {
    width: 100%; /* Take full width on mobile when active */
  }
  
  .notes-list-panel.mobile-hidden {
    display: none;
  }
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
  border-left: 3px solid #1890ff; /* Highlight active note */
}

.note-title {
  font-weight: 500;
  font-size: 14px;
  margin-bottom: 4px;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.note-preview {
  font-size: 12px;
  color: #666;
  margin-bottom: 8px;
  line-height: 1.4;
  /* For multi-line ellipsis (might need JS for perfect cross-browser) */
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  max-height: 2.8em; /* 2 lines * 1.4 line-height */
}

.note-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 11px;
  color: #999;
}

.editor-panel {
  flex: 1; /* Take remaining space */
  display: flex;
  flex-direction: column;
  min-width: 0; /* Crucial for flex items that might overflow */
  overflow: hidden; /* Let children handle their scroll */
}

@media (max-width: 768px) {
  .editor-panel {
    position: absolute; /* Overlay other panels on mobile when active */
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: white; /* Ensure it covers content below */
    z-index: 5; /* Above notes list */
  }
}

.editor-header {
  padding: 16px;
  border-bottom: 1px solid #e6e6e6;
  display: flex;
  gap: 12px;
  align-items: center;
}

.title-input {
  flex: 1; /* Title input takes available space */
}

.editor-content {
  flex: 1; /* Editor content (MdEditor) takes remaining height */
  display: flex;
  flex-direction: column;
  min-height: 0; /* Allows MdEditor to shrink and grow properly */
  overflow: hidden; /* MdEditor will handle its own scrolling */
}

.editor-footer {
  padding: 16px;
  border-top: 1px solid #e6e6e6;
}

.tag-input {
  width: 100%;
}

.mobile-header {
  background: white;
  border-bottom: 1px solid #e6e6e6;
}

.mobile-back {
  padding: 8px 16px;
  border-bottom: 1px solid #e6e6e6;
}

/* Removed styles for .markdown-toolbar, .markdown-textarea, .markdown-preview
   as md-editor-v3 handles its own styling and preview. */

/* Ensure md-editor-v3 takes full height within its container */
:deep(.md-editor) {
  height: 100% !important;
}
:deep(.md-editor-preview-wrapper){
  height: 100% !important;
}

</style>