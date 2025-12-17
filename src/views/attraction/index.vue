<template>
  <div class="attraction-container">
    <div class="attraction-header">
      <div class="header-content">
        <h1>衢州景区</h1>
        <p>探寻浙西山水，品味千年人文</p>
        <div class="divider"></div>
      </div>
    </div>

    <div class="main-content">
      <div v-if="loading" class="state-box">
        <div class="spinner"></div>
        <p>正在加载景区数据...</p>
      </div>
      <div v-else-if="error" class="state-box">
        <p class="error-text">{{ error }}</p>
        <button @click="fetchAttractions" class="retry-btn">重新加载</button>
      </div>

      <div v-else class="content-wrapper">
        <div class="grid-container">
          <div 
            v-for="item in paginatedItems" 
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
            <img :src="selectedItem.image" :alt="selectedItem.name" @error="handleImgError($event)">
          </div>
          <div class="detail-info">
            <h2>{{ selectedItem.name }}</h2>
            
            <div class="detail-meta">
              <span class="meta-tag score" v-if="selectedItem.score">
                ★ {{ selectedItem.score }}分
              </span>
              <span class="meta-tag location">
                📍 {{ selectedItem.location }}
              </span>
            </div>

            <div class="action-bar">
              <button 
                class="action-btn like-btn" 
                :class="{ active: selectedItem.isLiked === 1 }"
                @click="handleLike(selectedItem)"
              >
                <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
                </svg>
                <span>{{ selectedItem.liked || 0 }}</span>
              </button>

              <button 
                class="action-btn dislike-btn" 
                :class="{ active: selectedItem.isLiked === 2 }"
                @click="handleDislike(selectedItem)"
              >
                <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"></path>
                </svg>
                <span>{{ selectedItem.disliked || 0 }}</span>
              </button>
            </div>
            
            <div class="update-time">
              更新于: {{ formatDate(selectedItem.updateTime) }}
            </div>

            <div class="detail-desc">
              <p>{{ selectedItem.description }}</p>
            </div>
          </div>
        </div>

        <button 
          class="nav-btn next-btn" 
          @click="navigateDetail(1)"
          :disabled="currentDetailIndex === attractionList.length - 1"
        >❯</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
// 确保引用路径正确
import { getAttraction, likeAttraction, dislikeAttraction } from '@/api/attraction'

// 数据状态
const attractionList = ref([])
const loading = ref(false)
const error = ref(null)

// 分页状态
const currentPage = ref(1)
const pageSize = 9

// 弹窗状态
const showModal = ref(false)
const selectedItem = ref(null)

// --- 计算属性 ---

const totalPages = computed(() => {
  return Math.ceil(attractionList.value.length / pageSize)
})

const paginatedItems = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  const end = start + pageSize
  return attractionList.value.slice(start, end)
})

const currentDetailIndex = computed(() => {
  if (!selectedItem.value) return -1
  return attractionList.value.findIndex(item => item.id === selectedItem.value.id)
})

// --- 方法 ---

// 获取数据
const fetchAttractions = async () => {
  try {
    loading.value = true
    error.value = null
    const response = await getAttraction()
    // 假设接口返回结构: { code: 1, data: [ ... ] }
    if (response.code === 1 && Array.isArray(response.data)) {
      attractionList.value = response.data
      // 初始化点赞状态字段，防止 undefined
      attractionList.value.forEach(item => {
          if (item.isLiked === undefined) item.isLiked = 0;
          if (item.liked === undefined) item.liked = 0;
          if (item.disliked === undefined) item.disliked = 0;
      })
    } else {
      throw new Error(response.msg || '数据加载失败')
    }
  } catch (err) {
    console.error(err)
    error.value = err.message || '加载失败，请检查网络'
  } finally {
    loading.value = false
  }
}

// --- 核心：点赞/差评 交互逻辑 ---

// 处理点赞 (isLiked: 0=无, 1=赞, 2=踩)
const handleLike = async (item) => {
  if (!item) return;
  
  const previousStatus = item.isLiked || 0; 

  try {
    // 互斥逻辑：如果当前已经是“差评”(2)，先取消差评
    if (previousStatus === 2) {
      const dislikeRes = await dislikeAttraction(item.id);
      if (dislikeRes.code === 1) {
         item.disliked = Math.max(0, (item.disliked || 0) - 1);
      }
    }

    // 执行点赞
    const res = await likeAttraction(item.id);
    
    if (res.code === 1) { 
      if (previousStatus === 1) {
        // 原本是赞，再次点击 -> 取消赞
        item.isLiked = 0;
        item.liked = Math.max(0, (item.liked || 0) - 1);
      } else {
        // 原本是无或踩 -> 变为赞
        item.isLiked = 1;
        item.liked = (item.liked || 0) + 1;
      }
    } 
  } catch (err) {
    console.error("点赞操作失败", err);
  }
}

// 处理差评
const handleDislike = async (item) => {
  if (!item) return;
  
  const previousStatus = item.isLiked || 0;

  try {
    // 互斥逻辑：如果当前已经是“点赞”(1)，先取消点赞
    if (previousStatus === 1) {
      const likeRes = await likeAttraction(item.id);
      if (likeRes.code === 1) {
        item.liked = Math.max(0, (item.liked || 0) - 1);
      }
    }

    // 执行差评
    const res = await dislikeAttraction(item.id);
    
    if (res.code === 1) {
      if (previousStatus === 2) {
        // 原本是踩，再次点击 -> 取消踩
        item.isLiked = 0;
        item.disliked = Math.max(0, (item.disliked || 0) - 1);
      } else {
        // 原本是无或赞 -> 变为踩
        item.isLiked = 2;
        item.disliked = (item.disliked || 0) + 1;
      }
    }
  } catch (err) {
    console.error("差评操作失败", err);
  }
}

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('zh-CN', {
    year: 'numeric', month: 'long', day: 'numeric'
  })
}

// 图片错误处理
const handleImgError = (e) => {
  e.target.style.backgroundColor = '#eee' 
  e.target.style.objectFit = 'contain'
}

// --- 翻页与弹窗逻辑 ---

const changePage = (page) => {
  if (page < 1 || page > totalPages.value) return
  currentPage.value = page
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const openModal = (item) => {
  selectedItem.value = item
  showModal.value = true
  document.body.style.overflow = 'hidden' 
}

const closeModal = () => {
  showModal.value = false
  selectedItem.value = null
  document.body.style.overflow = '' 
}

const navigateDetail = (direction) => {
  const newIndex = currentDetailIndex.value + direction
  if (newIndex >= 0 && newIndex < attractionList.value.length) {
    selectedItem.value = attractionList.value[newIndex]
  }
}

onMounted(() => {
  window.scrollTo(0, 0)
  fetchAttractions()
})
</script>

<style scoped>
/* 基础变量 */
:root {
  --primary-color: #1a5e38;
  --secondary-color: #e8f4ea;
  --score-color: #ff7d00;
  --text-dark: #333;
  --text-medium: #666;
  --bg-color: #f9fbf8;
}

.attraction-container {
  background-color: var(--bg-color);
  min-height: 100vh;
  padding-bottom: 40px;
  font-family: 'Segoe UI', sans-serif;
}

/* 头部样式 */
.attraction-header {
  background: linear-gradient(rgba(26, 94, 56, 0.9), rgba(26, 94, 56, 0.85)),
              url('https://picsum.photos/id/152/1920/500') center/cover no-repeat;
  color: #fff;
  padding: 60px 20px;
  text-align: center;
  position: relative;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}
.header-content {
  max-width: 800px;
  margin: 0 auto;
}
.attraction-header h1 {
  font-size: 2.5rem;
  margin-bottom: 15px;
  text-shadow: 0 3px 6px rgba(0, 0, 0, 0.3);
  letter-spacing: 0.5px;
}
.attraction-header p {
  font-size: 1.2rem;
  opacity: 0.9;
  margin-bottom: 20px;
  line-height: 1.6;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}
.divider {
  width: 80px;
  height: 3px;
  background-color: #fff;
  margin: 0 auto;
  border-radius: 3px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* 主体内容样式 */
.content-wrapper {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
}
.state-box {
  text-align: center;
  padding: 80px 20px;
  color: var(--text-medium);
}
.spinner {
  width: 50px;
  height: 50px;
  border: 5px solid var(--secondary-color);
  border-top: 5px solid var(--primary-color);
  border-radius: 50%;
  animation: spin 1.2s linear infinite;
  margin: 0 auto 25px;
}
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
.retry-btn {
  background-color: var(--primary-color);
  color: white;
  border: none;
  padding: 10px 24px;
  border-radius: 30px;
  cursor: pointer;
  margin-top: 15px;
}

/* Grid 网格布局 */
.grid-container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 35px;
  margin-bottom: 40px;
}
.grid-item {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0,0,0,0.08);
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  display: flex;
  flex-direction: column;
  border: 1px solid #f0f0f0;
}
.grid-item:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 30px rgba(0,0,0,0.15);
}
.image-wrapper {
  height: 240px;
  overflow: hidden;
  position: relative;
  background: #f5f5f5;
}
.image-wrapper img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s;
}
.grid-item:hover img {
  transform: scale(1.08);
}
.name-bar {
  padding: 20px;
  text-align: center;
  background: #fff;
  border-top: 1px solid #f0f0f0;
}
.name-bar h3 {
  margin: 0;
  font-size: 1.25rem;
  color: var(--text-dark);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 分页条 */
.pagination-bar {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  margin-top: 30px;
}
.page-btn {
  padding: 8px 20px;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.2s;
  color: #555;
}
.page-btn:hover:not(:disabled) {
  border-color: var(--primary-color);
  color: var(--primary-color);
  background: var(--secondary-color);
}
.page-btn:disabled {
  background: #f5f5f5;
  color: #ccc;
  cursor: not-allowed;
}

/* 详情弹窗样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.75);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}
.modal-content {
  background: #fff;
  width: 900px;
  max-width: 100%;
  max-height: 85vh;
  border-radius: 12px;
  position: relative;
  display: flex;
  animation: modalFadeIn 0.3s ease;
  box-shadow: 0 25px 50px rgba(0,0,0,0.3);
  overflow: hidden;
}
.close-btn {
  position: absolute;
  top: 15px;
  right: 20px;
  background: none;
  border: none;
  font-size: 32px;
  color: #999;
  cursor: pointer;
  z-index: 10;
  line-height: 1;
}
.close-btn:hover { color: #333; }

.nav-btn {
  background: rgba(255,255,255,0.9);
  border: none;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  font-size: 24px;
  cursor: pointer;
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 5;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  color: var(--primary-color);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}
.nav-btn:hover:not(:disabled) {
  background: var(--primary-color);
  color: #fff;
  transform: translateY(-50%) scale(1.1);
}
.nav-btn:disabled { opacity: 0; pointer-events: none; }
.prev-btn { left: 20px; }
.next-btn { right: 20px; }

/* 详情布局 */
.detail-body {
  display: flex;
  width: 100%;
}
.detail-image {
  flex: 1.2;
  background: #eee;
  min-height: 400px;
}
.detail-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.detail-info {
  flex: 1;
  padding: 50px 40px;
  overflow-y: auto;
  max-height: 85vh;
}
.detail-info h2 {
  font-size: 2rem;
  margin-bottom: 20px;
  color: var(--text-dark);
  line-height: 1.3;
}
.detail-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-bottom: 15px;
}
.meta-tag {
  display: inline-flex;
  align-items: center;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 0.95rem;
  font-weight: 500;
}
.meta-tag.score {
  background-color: #fff7e6;
  color: var(--score-color);
  border: 1px solid #ffe4b3;
}
.meta-tag.location {
  background-color: var(--secondary-color);
  color: var(--primary-color);
}
.update-time {
  font-size: 0.85rem;
  color: #999;
  margin-bottom: 25px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
}
.detail-desc {
  line-height: 1.8;
  color: #444;
  font-size: 1.05rem;
  white-space: pre-wrap;
}

/* --- 新增：操作栏样式 --- */
.action-bar {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border: 1px solid #ddd;
  border-radius: 20px;
  background-color: #fff;
  cursor: pointer;
  transition: all 0.2s ease;
  color: var(--text-medium);
  font-size: 1rem;
}

.action-btn svg {
  transition: transform 0.2s;
}

.action-btn:hover {
  background-color: #f5f5f5;
  transform: translateY(-2px);
}

/* 点赞激活 - 绿色 */
.action-btn.like-btn.active {
  background-color: #e8f4ea; 
  border-color: #1a5e38;
  color: #1a5e38;
}
.action-btn.like-btn.active svg {
  fill: #1a5e38; 
  transform: scale(1.1) rotate(-10deg);
}

/* 差评激活 - 红色/橙色 */
.action-btn.dislike-btn.active {
  background-color: #fff1f0;
  border-color: #ff4d4f;
  color: #ff4d4f;
}
.action-btn.dislike-btn.active svg {
  fill: #ff4d4f;
  transform: scale(1.1) rotate(10deg);
}

/* 响应式 */
@media (max-width: 1024px) {
  .grid-container { grid-template-columns: repeat(2, 1fr); }
  .modal-content { flex-direction: column; overflow-y: auto; }
  .detail-body { flex-direction: column; }
  .detail-image { height: 300px; flex: none; }
  .detail-info { padding: 30px; flex: none; }
  .prev-btn { left: 10px; top: 150px; }
  .next-btn { right: 10px; top: 150px; }
}
@media (max-width: 600px) {
  .grid-container { grid-template-columns: 1fr; }
  .attraction-header h1 { font-size: 2rem; }
}
@keyframes modalFadeIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}
</style>