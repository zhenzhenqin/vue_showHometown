<template>
  <div class="specialties-container">
    <!-- 顶部横幅区域 -->
    <div class="specialties-header">
      <div class="header-content">
        <h1>地方特产</h1>
        <p>品味地域特色，传承匠心工艺</p>
        <div class="divider"></div>
      </div>
    </div>

    <div class="main-content">
      <div v-if="loading" class="state-box">
        <div class="spinner"></div>
        <p>数据加载中...</p>
      </div>
      <div v-else-if="errorMsg" class="state-box">
        <p class="error-text">{{ errorMsg }}</p>
        <button @click="fetchSpecialties" class="retry-btn">重试</button>
      </div>

      <div v-else class="content-wrapper">
        <div class="grid-container">
          <div 
            v-for="(item, index) in paginatedItems" 
            :key="item.id" 
            class="grid-item"
            @click="openModal(item)"
          >
            <div class="image-wrapper">
              <img 
                :src="item.image" 
                :alt="item.name" 
                @error="handleImgError($event)"
              />
            </div>
            <div class="name-bar">
              <h3>{{ item.name }}</h3>
            </div>
          </div>
        </div>

        <div class="pagination-bar" v-if="totalPages > 1">
          <button 
            :disabled="currentPage === 1" 
            @click="changePage(currentPage - 1)"
            class="page-btn"
          >上一页</button>
          
          <span class="page-info">第 {{ currentPage }} / {{ totalPages }} 页</span>
          
          <button 
            :disabled="currentPage === totalPages" 
            @click="changePage(currentPage + 1)"
            class="page-btn"
          >下一页</button>
        </div>
      </div>
    </div>

    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content">
        <button class="close-btn" @click="closeModal">×</button>

        <button 
          class="nav-btn prev-btn" 
          @click="navigateDetail(-1)"
          :disabled="currentDetailIndex === 0"
        >❮</button>

        <div class="detail-body" v-if="selectedItem">
          <div class="detail-image">
            <img :src="selectedItem.image" @error="handleImgError($event)">
          </div>
          <div class="detail-info">
            <h2>{{ selectedItem.name }}</h2>
            <div class="detail-meta">
              <span class="price">¥{{ selectedItem.price?.toFixed(2) }}</span>
              <span class="date">更新于: {{ formatDate(selectedItem.updateTime) }}</span>
            </div>
            <div class="detail-desc">
              <p>{{ selectedItem.description }}</p>
            </div>
          </div>
        </div>

        <button 
          class="nav-btn next-btn" 
          @click="navigateDetail(1)"
          :disabled="currentDetailIndex === specialties.length - 1"
        >❯</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getSpecialty } from '../../api/api'

// 数据状态
const specialties = ref([]) // 所有数据
const loading = ref(false)
const errorMsg = ref(null)

// 分页状态
const currentPage = ref(1)
const pageSize = 9 // 每页显示9个

// 弹窗状态
const showModal = ref(false)
const selectedItem = ref(null)

// --- 计算属性 ---

// 计算总页数
const totalPages = computed(() => {
  return Math.ceil(specialties.value.length / pageSize)
})

// 获取当前页需要展示的数据切片
const paginatedItems = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  const end = start + pageSize
  return specialties.value.slice(start, end)
})

// 获取当前选中项在总列表中的索引（用于上下切换）
const currentDetailIndex = computed(() => {
  if (!selectedItem.value) return -1
  return specialties.value.findIndex(item => item.id === selectedItem.value.id)
})

// --- 方法 ---

// 获取数据
const fetchSpecialties = async () => {
  try {
    loading.value = true
    errorMsg.value = null
    const response = await getSpecialty()
    // 假设后端返回结构为 { code: 1, data: [...] }
    if (response.code === 1 && response.data) {
      specialties.value = response.data
    } else {
      throw new Error(response.msg || '数据加载失败')
    }
  } catch (err) {
    console.error(err)
    errorMsg.value = '加载失败，请检查网络'
  } finally {
    loading.value = false
  }
}

// 图片错误处理
const handleImgError = (e) => {
  // 请确保你有这个默认图片，或者替换为网络图片
  e.target.src = require('@/assets/images/default-food.png') 
}

// 日期格式化
const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('zh-CN')
}

// --- 交互逻辑 ---

// 翻页
const changePage = (page) => {
  if (page < 1 || page > totalPages.value) return
  currentPage.value = page
  // 翻页后回到顶部
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// 打开弹窗
const openModal = (item) => {
  selectedItem.value = item
  showModal.value = true
  document.body.style.overflow = 'hidden' // 禁止背景滚动
}

// 关闭弹窗
const closeModal = () => {
  showModal.value = false
  selectedItem.value = null
  document.body.style.overflow = '' // 恢复背景滚动
}

// 弹窗内切换 (direction: -1 为上一个, 1 为下一个)
const navigateDetail = (direction) => {
  const newIndex = currentDetailIndex.value + direction
  if (newIndex >= 0 && newIndex < specialties.value.length) {
    selectedItem.value = specialties.value[newIndex]
  }
}

onMounted(() => {
  fetchSpecialties()
})
</script>

<style scoped>
:root {
  --primary-color: #1a5e38;
  --bg-color: #f5f7fa;
  --modal-bg: rgba(0, 0, 0, 0.75);
}

.specialties-container {
  background-color: var(--bg-color);
  min-height: 100vh;
  padding-bottom: 40px;
  font-family: 'Segoe UI', sans-serif;
}

/* 头部样式 */
.specialties-header {
  background: linear-gradient(rgba(26, 94, 56, 0.9), rgba(26, 94, 56, 0.85)),
    url('https://picsum.photos/id/292/1920/500') center/cover no-repeat;
  color: var(--white);
  padding: 60px 20px;
  text-align: center;
  position: relative;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}

.header-content {
    max-width: 800px;
    margin: 0 auto;
  }


.specialties-header h1 { margin: 0 0 10px 0; font-size: 2rem; }

/* 横幅 */
.specialties-container {
  min-height: calc(100vh - 144px);
  background-color: #f9fbf8;
  padding: 0;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}


/* 状态提示 */
.state-box {
  text-align: center;
  padding: 50px;
  color: #666;
}
.retry-btn {
  padding: 8px 20px;
  background: #1a5e38;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

/* --- 核心列表布局 --- */
.content-wrapper {
  max-width: 1200px;
  margin: 0 auto;
  padding: 30px 20px;
}

/* 3列网格 */
.grid-container {
  display: grid;
  grid-template-columns: repeat(3, 1fr); /* 强制3列 */
  gap: 30px;
  margin-bottom: 40px;
}

/* 卡片样式 */
.grid-item {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0,0,0,0.08);
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  display: flex;
  flex-direction: column;
}

.grid-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.15);
}

/* 图片区域 */
.image-wrapper {
  height: 250px; /* 固定高度 */
  overflow: hidden;
  background: #eee;
}
.image-wrapper img {
  width: 100%;
  height: 100%;
  object-fit: cover; /* 保证图片填满不变形 */
  transition: transform 0.5s;
}
.grid-item:hover img {
  transform: scale(1.05);
}

/* 名称区域 */
.name-bar {
  padding: 20px;
  text-align: center;
  background: #fff;
  border-top: 1px solid #eee;
}
.name-bar h3 {
  margin: 0;
  font-size: 1.2rem;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* --- 分页条 --- */
.pagination-bar {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  margin-top: 20px;
}
.page-btn {
  padding: 10px 20px;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}
.page-btn:hover:not(:disabled) {
  border-color: #1a5e38;
  color: #1a5e38;
}
.page-btn:disabled {
  background: #f5f5f5;
  color: #ccc;
  cursor: not-allowed;
}
.page-info {
  font-weight: bold;
  color: #555;
}

/* --- 模态框 (Modal) --- */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.7);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-content {
  background: #fff;
  width: 900px;
  max-width: 90%;
  max-height: 85vh;
  border-radius: 12px;
  position: relative;
  display: flex;
  animation: fadeIn 0.3s ease;
  box-shadow: 0 20px 50px rgba(0,0,0,0.3);
}

/* 关闭按钮 */
.close-btn {
  position: absolute;
  top: 15px;
  right: 20px;
  background: none;
  border: none;
  font-size: 30px;
  color: #999;
  cursor: pointer;
  z-index: 10;
  line-height: 1;
}
.close-btn:hover { color: #333; }

/* 左右导航按钮 */
.nav-btn {
  background: rgba(255,255,255,0.8);
  border: 1px solid #eee;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  font-size: 24px;
  cursor: pointer;
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  z-index: 5;
  box-shadow: 0 4px 10px rgba(0,0,0,0.1);
}
.nav-btn:hover:not(:disabled) {
  background: #1a5e38;
  color: #fff;
}
.nav-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}
.prev-btn { left: -70px; color: #fff; background: rgba(255,255,255,0.2); border: none;} /* 放在弹窗外侧更好看 */
.next-btn { right: -70px; color: #fff; background: rgba(255,255,255,0.2); border: none;}

/* 详情内容布局 */
.detail-body {
  display: flex;
  width: 100%;
  overflow: hidden;
  border-radius: 12px;
}
.detail-image {
  flex: 1;
  min-width: 0; /* 防止溢出 */
  background: #f0f0f0;
}
.detail-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.detail-info {
  flex: 1;
  padding: 40px;
  overflow-y: auto;
  max-height: 80vh;
}
.detail-info h2 {
  font-size: 2rem;
  margin-bottom: 20px;
  color: #333;
}
.detail-meta {
  display: flex;
  gap: 20px;
  margin-bottom: 25px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
}
.price {
  font-size: 1.5rem;
  color: #1a5e38;
  font-weight: bold;
}
.date {
  color: #999;
  display: flex;
  align-items: center;
}
.detail-desc {
  line-height: 1.8;
  color: #555;
  font-size: 1.1rem;
}

/* 响应式调整 */
@media (max-width: 1024px) {
  .grid-container { grid-template-columns: repeat(2, 1fr); }
  .modal-content { width: 95%; flex-direction: column; }
  .detail-image { height: 300px; }
  .nav-btn { position: absolute; top: 50%; background: #fff; color: #333; }
  .prev-btn { left: 10px; }
  .next-btn { right: 10px; }
}

@media (max-width: 600px) {
  .grid-container { grid-template-columns: 1fr; }
}

@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}
</style>