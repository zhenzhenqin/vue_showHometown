<template>
  <div class="specialties-container">
    <!-- 头部横幅区域 -->
    <div class="specialties-header">
      <div class="header-content">
        <h1>地方特产</h1>
        <p>品味地域特色，传承匠心工艺</p>
        <div class="divider"></div>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>正在加载特产数据...</p>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="errorMsg" class="error">
      <div class="error-icon">⚠️</div>
      <p>{{ errorMsg }}</p>
      <button @click="fetchSpecialties" class="retry-btn">重新加载</button>
    </div>

    <!-- 特产列表 -->
    <div v-else class="specialties-list">
      <div 
        v-for="item in specialties" 
        :key="item.id" 
        class="specialty-card"
      >
        <!-- 图片区域 -->
        <div class="specialty-image" v-if="item.image">
          <img 
            :src="item.image" 
            :alt="item.name" 
            class="card-img" 
            @error="handleImgError($event)"
          />
          <div class="image-overlay"></div>
          <div class="price-tag">¥{{ item.price.toFixed(2) }}</div>
        </div>

        <!-- 卡片内容区 -->
        <div class="specialty-content">
          <span class="specialty-tag">地方特产</span>
          <!-- 标题：单行省略 + hover气泡 -->
          <div class="name-wrapper">
            <h2 class="specialty-name">{{ item.name }}</h2>
            <div 
              class="name-tooltip" 
              :class="{ 'show-tooltip': isNameOverflow(item.name) }"
            >
              {{ item.name }}
            </div>
          </div>
          <!-- 内容区内部分层模块 -->
          <div class="content-inner">
            <p 
              class="specialty-desc" 
              :class="{ 'expand-desc': isDescHovered[item.id] }"
              @mouseenter="isDescHovered[item.id] = true"
              @mouseleave="isDescHovered[item.id] = false"
            >
              {{ item.description }}
            </p>
            <div class="specialty-meta">
              <span class="meta-item">
                <i class="icon-time"></i> 更新: {{ formatDate(item.updateTime) }}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 空状态 -->
      <div v-if="specialties.length === 0" class="empty-state">
        <div class="empty-icon">🛒</div>
        <p>暂无特产数据</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getSpecialty } from '../../api/api'

// 特产数据
const specialties = ref([])
const loading = ref(false)
const errorMsg = ref(null)
const isDescHovered = ref({})

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// 图片加载失败处理
const handleImgError = (e) => {
  e.target.src = require('@/assets/images/default-food.png')
}

// 判断标题是否过长
const isNameOverflow = (name) => {
  return name.length > 18
}

// 获取特产数据
const fetchSpecialties = async () => {
  try {
    loading.value = true
    errorMsg.value = null
    const response = await getSpecialty()
    
    if (response.code === 1 && response.data) {
      specialties.value = response.data
      response.data.forEach(item => {
        isDescHovered.value[item.id] = false
      })
    } else {
      throw new Error(response.msg || '数据加载失败')
    }
  } catch (err) {
    console.error('获取特产数据失败:', err)
    errorMsg.value = err.message || '数据加载失败，请稍后重试'
    specialties.value = []
  } finally {
    loading.value = false
  }
}

// 组件挂载时：1.获取数据 2.强制滚动到页面顶部
onMounted(() => {
  // 关键代码：强制页面滚动到顶部（x=0, y=0）
  window.scrollTo({
    top: 0,
    left: 0,
    behavior: 'instant' // 无动画瞬间滚动
  })
  
  fetchSpecialties()
})
</script>

<style scoped>
/* 基础变量 */
:root {
  --primary-color: #1a5e38;
  --primary-light: #2a7d4a;
  --secondary-color: #e8f4ea;
  --text-dark: #333;
  --text-medium: #666;
  --text-light: #999;
  --white: #fff;
  --card-bg: #fff;
  --content-bg: #fdfdfd;
  --shadow: 0 8px 28px rgba(0, 0, 0, 0.15);
  --shadow-hover: 0 15px 40px rgba(0, 0, 0, 0.22);
  --inner-shadow: inset 0 3px 8px rgba(0, 0, 0, 0.05);
  --border-light: #f0f0f0;
  --radius: 12px;
  --transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.specialties-container {
  min-height: calc(100vh - 144px);
  background-color: #f9fbf8;
  padding: 0;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
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

.specialties-header h1 {
  font-size: 2.5rem;
  margin-bottom: 15px;
  text-shadow: 0 3px 6px rgba(0, 0, 0, 0.3);
  letter-spacing: 0.5px;
}

.specialties-header p {
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

/* 加载/错误状态 */
.loading, .error {
  text-align: center;
  padding: 80px 20px;
  color: var(--text-medium);
  background-color: var(--white);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  max-width: 600px;
  margin: 0 auto;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 5px solid var(--secondary-color);
  border-top: 5px solid var(--primary-color);
  border-radius: 50%;
  animation: spin 1.2s linear infinite;
  margin: 0 auto 25px;
  box-shadow: 0 0 15px rgba(26, 94, 56, 0.1);
}

@keyframes spin {
  0% { transform: rotate(0deg) scale(1); }
  50% { transform: rotate(180deg) scale(1.05); }
  100% { transform: rotate(360deg) scale(1); }
}

.error-icon {
  font-size: 40px;
  margin-bottom: 20px;
  color: #e74c3c;
  text-shadow: 0 2px 4px rgba(231, 76, 60, 0.2);
}

.retry-btn {
  background-color: var(--primary-color);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 30px;
  cursor: pointer;
  margin-top: 15px;
  font-size: 1rem;
  transition: var(--transition);
  box-shadow: 0 6px 15px rgba(26, 94, 56, 0.3);
}

.retry-btn:hover {
  background-color: var(--primary-light);
  transform: translateY(-3px);
  box-shadow: 0 10px 25px rgba(26, 94, 56, 0.4);
}

/* 列表容器 */
.specialties-list {
  display: grid;
  gap: 40px;
  padding: 60px 20px;
  max-width: 1400px;
  margin: 0 auto;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
}

/* 特产卡片（外框立体基础） */
.specialty-card {
  background: var(--card-bg);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  overflow: hidden;
  transition: var(--transition);
  display: flex;
  flex-direction: column;
  height: 100%;
  position: relative;
  border: 1px solid var(--border-light);
  padding: 4px;
}

.specialty-card:hover {
  transform: translateY(-12px) scale(1.02);
  box-shadow: var(--shadow-hover);
  z-index: 10;
}

/* 图片区域（与内容区分隔） */
.specialty-image {
  height: 220px;
  overflow: hidden;
  position: relative;
  border-radius: calc(var(--radius) - 4px);
  border: 1px solid var(--border-light);
  margin-bottom: 4px;
}

.card-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: var(--transition);
}

.specialty-card:hover .card-img {
  transform: scale(1.1);
}

.image-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 50%;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
  z-index: 1;
}

.price-tag {
  position: absolute;
  top: 15px;
  left: 15px;
  background-color: var(--primary-color);
  color: var(--white);
  font-size: 1rem;
  font-weight: bold;
  padding: 6px 12px;
  border-radius: 6px;
  z-index: 2;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  transition: var(--transition);
  border: 1px solid rgba(255,255,255,0.2);
}

.specialty-card:hover .price-tag {
  transform: translateY(-3px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4);
}

/* 卡片内容区 */
.specialty-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: var(--content-bg);
  border-radius: calc(var(--radius) - 4px);
  border: 1px solid var(--border-light);
  padding: 25px;
  box-shadow: var(--inner-shadow);
  position: relative;
  background-image: linear-gradient(180deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 15%);
  padding-bottom: 20px;
}

/* 内容区内部再分层：标签悬浮 */
.specialty-tag {
  display: inline-block;
  background-color: var(--secondary-color);
  color: var(--primary-color);
  font-size: 0.8rem;
  padding: 5px 14px;
  border-radius: 20px;
  margin-bottom: 15px;
  font-weight: 500;
  width: fit-content;
  box-shadow: 0 4px 10px rgba(26, 94, 56, 0.18);
  border: 1px solid rgba(26, 94, 56, 0.1);
  transition: var(--transition);
  transform: translateY(0);
}

.specialty-card:hover .specialty-tag {
  background-color: var(--primary-color);
  color: var(--white);
  box-shadow: 0 6px 14px rgba(26, 94, 56, 0.3);
  transform: translateY(-2px);
  border-color: rgba(255,255,255,0.2);
}

/* 标题容器：控制单行省略与气泡 */
.name-wrapper {
  position: relative;
  width: 100%;
  margin-bottom: 18px;
}

/* 标题：单行省略核心样式 */
.specialty-name {
  font-size: 1.4rem;
  color: var(--text-dark);
  margin-bottom: 0;
  line-height: 1.4;
  transition: var(--transition);
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
  padding-bottom: 8px;
  border-bottom: 1px solid var(--border-light);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
  cursor: default;
}

.specialty-card:hover .specialty-name {
  color: var(--primary-color);
  text-shadow: 0 3px 6px rgba(26, 94, 56, 0.15);
}

/* 标题气泡：hover显示完整内容 */
.name-tooltip {
  position: absolute;
  top: -40px;
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(0, 0, 0, 0.8);
  color: var(--white);
  font-size: 0.9rem;
  padding: 6px 12px;
  border-radius: 6px;
  white-space: nowrap;
  z-index: 20;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.3s ease;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.name-tooltip::after {
  content: '';
  position: absolute;
  bottom: -6px;
  left: 50%;
  transform: translateX(-50%);
  border-width: 6px 6px 0;
  border-style: solid;
  border-color: rgba(0, 0, 0, 0.8) transparent transparent;
}

.name-wrapper:hover .name-tooltip {
  opacity: 1;
  visibility: visible;
}

/* 内容区内部核心模块 */
.content-inner {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 15px;
  background: var(--white);
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
  margin-bottom: 0;
  min-height: 100px;
}

/* 描述：多行省略 + hover展开核心样式 */
.specialty-desc {
  color: var(--text-medium);
  line-height: 1.7;
  margin-bottom: 15px;
  flex: 1;
  background: rgba(255,255,255,0.8);
  padding: 8px 0;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  transition: all 0.3s ease;
}

.specialty-desc.expand-desc {
  -webkit-line-clamp: unset;
  max-height: 280px;
  overflow-y: auto;
  scrollbar-width: thin;
}

.specialty-desc.expand-desc::-webkit-scrollbar {
  width: 4px;
}
.specialty-desc.expand-desc::-webkit-scrollbar-thumb {
  background-color: var(--text-light);
  border-radius: 2px;
}

/* 元数据区立体分隔 */
.specialty-meta {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 0.85rem;
  color: var(--text-light);
  border-top: 1px solid var(--border-light);
  padding-top: 12px;
  margin-top: auto;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.icon-time::before {
  content: "📅";
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

/* 空状态 */
.empty-state {
  grid-column: 1 / -1;
  text-align: center;
  padding: 80px 20px;
  color: var(--text-medium);
  background-color: var(--white);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  margin: 0 20px;
  transition: var(--transition);
  border: 1px solid var(--border-light);
}

.empty-state:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow-hover);
}

.empty-icon {
  font-size: 60px;
  margin-bottom: 20px;
  opacity: 0.6;
  text-shadow: 0 3px 6px rgba(0, 0, 0, 0.1);
}

/* 响应式适配 */
@media (max-width: 1024px) {
  .specialties-list {
    gap: 35px;
    padding: 50px 15px;
  }
  .specialty-card:hover {
    transform: translateY(-8px) scale(1.01);
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.18);
  }
  .specialty-desc {
    -webkit-line-clamp: 2;
  }
}

@media (max-width: 768px) {
  .specialties-header {
    padding: 40px 15px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.12);
  }
  
  .specialties-header h1 {
    font-size: 2rem;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }
  
  .specialties-list {
    grid-template-columns: 1fr;
    gap: 30px;
    padding: 40px 15px;
  }
  
  .specialty-image {
    height: 200px;
  }
  
  .specialty-content {
    padding: 20px;
    padding-bottom: 15px;
  }
  
  .content-inner {
    padding: 12px;
    min-height: 80px;
  }
  
  .specialty-card {
    box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
  }
  
  .specialty-card:hover {
    transform: translateY(-6px) scale(1.01);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  }
  .specialty-desc {
    -webkit-line-clamp: 2;
  }
  .name-tooltip {
    font-size: 0.8rem;
    padding: 4px 8px;
    top: -35px;
  }
}

@media (max-width: 480px) {
  .specialties-header h1 {
    font-size: 1.7rem;
  }
  
  .specialty-name {
    font-size: 1.3rem;
    padding-bottom: 6px;
  }
  
  .specialty-desc {
    -webkit-line-clamp: 2;
  }
  
  .price-tag {
    font-size: 0.9rem;
    padding: 5px 10px;
    box-shadow: 0 3px 8px rgba(0, 0, 0, 0.25);
  }
}
</style>
