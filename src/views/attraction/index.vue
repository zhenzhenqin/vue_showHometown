<template>
  <div class="attraction-container">
    <!-- 头部横幅区域 -->
    <div class="attraction-header">
      <div class="header-content">
        <h1>衢州景区</h1>
        <p>探寻浙西山水，品味千年人文</p>
        <div class="divider"></div>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>正在加载景区数据...</p>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="error">
      <div class="error-icon">⚠️</div>
      <p>{{ error }}</p>
      <button @click="fetchAttractions" class="retry-btn">重新加载</button>
    </div>

    <!-- 景区列表 -->
    <div v-else class="attraction-list">
      <div v-for="attraction in attractionList" :key="attraction.id" class="attraction-card">
        <!-- 卡片内容区 -->
        <div class="attraction-content">
          <!-- 顶部：景区名称 + 评分 -->
          <div class="top-bar">
            <!-- 景区名称：单行省略 + hover气泡 -->
            <div class="name-wrapper">
              <h2 class="attraction-name">{{ attraction.name }}</h2>
              <div class="name-tooltip" :class="{ 'show-tooltip': isTextOverflow(attraction.name, 18) }">
                {{ attraction.name }}
              </div>
            </div>
            <!-- 景区评分：突出显示 -->
            <div class="score-tag">
              <span class="icon-star">★</span>
              <span class="score-value">{{ attraction.score }}</span>
            </div>
          </div>

          <!-- 中间：景区位置（单行省略） -->
          <div class="location-wrapper">
            <span class="icon-location">📍</span>
            <p class="attraction-location" :title="attraction.location">
              {{ attraction.location }}
            </p>
          </div>

          <!-- 内容区内部分层容器（带纹路效果） -->
          <div class="content-inner">
            <!-- 景区描述：多行省略 + hover展开 -->
            <p class="attraction-desc" :class="{ 'expand-desc': isDescHovered[attraction.id] }"
              @mouseenter="isDescHovered[attraction.id] = true" @mouseleave="isDescHovered[attraction.id] = false">
              {{ attraction.description }}
            </p>

            <!-- 元数据：更新时间 -->
            <div class="attraction-meta">
              <span class="meta-item">
                <span class="icon-time">📅</span> 更新: {{ formatDate(attraction.updateTime) }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- 空状态处理 -->
      <div v-if="attractionList.length === 0" class="empty-state">
        <div class="empty-icon">🏞️</div>
        <p>暂无景区数据</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getAttraction } from '../../api/api'

// 响应式数据
const attractionList = ref([])
const loading = ref(false)
const error = ref(null)
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

// 判断文本是否溢出
const isTextOverflow = (text, maxLen) => {
  return text.length > maxLen
}

// 获取景区数据
const fetchAttractions = async () => {
  try {
    loading.value = true
    error.value = null
    const response = await getAttraction()

    if (response.code === 1 && Array.isArray(response.data)) {
      attractionList.value = response.data
      response.data.forEach(item => {
        isDescHovered.value[item.id] = false
      })
    } else {
      throw new Error('景区数据格式异常')
    }
  } catch (err) {
    console.error('获取景区数据失败:', err)
    error.value = err.message || '数据加载失败，请稍后重试'
    attractionList.value = []
  } finally {
    loading.value = false
  }
}

// 组件挂载：页面置顶 + 获取数据
onMounted(() => {
  window.scrollTo({
    top: 0,
    left: 0,
    behavior: 'instant'
  })
  fetchAttractions()
})
</script>

<style scoped>
/* 基础样式变量 */
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
  --score-color: #ff7d00;
  /* 新增纹路相关变量 */
  --texture-pattern: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23f0f0f0' fill-opacity='0.4' fill-rule='evenodd'/%3E%3C/svg%3E");
}

.attraction-container {
  min-height: calc(100vh - 144px);
  background-color: #f9fbf8;
  padding: 0;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

/* 头部样式 */
.attraction-header {
  background: linear-gradient(rgba(26, 94, 56, 0.9), rgba(26, 94, 56, 0.85)),
    url('https://picsum.photos/id/152/1920/500') center/cover no-repeat;
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

/* 加载/错误状态 */
.loading,
.error {
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
  0% {
    transform: rotate(0deg) scale(1);
  }

  50% {
    transform: rotate(180deg) scale(1.05);
  }

  100% {
    transform: rotate(360deg) scale(1);
  }
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
  display: inline-flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 6px 15px rgba(26, 94, 56, 0.3);
}

.retry-btn:hover {
  background-color: var(--primary-light);
  transform: translateY(-3px);
  box-shadow: 0 10px 25px rgba(26, 94, 56, 0.4);
}

/* 景区列表容器 */
.attraction-list {
  display: grid;
  gap: 40px;
  padding: 60px 20px;
  max-width: 1400px;
  margin: 0 auto;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
}

/* 景区卡片 */
.attraction-card {
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

.attraction-card:hover {
  transform: translateY(-12px) scale(1.02);
  box-shadow: var(--shadow-hover);
  z-index: 10;
}

/* 卡片内容区（恢复纹路效果） */
.attraction-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: var(--content-bg);
  border-radius: calc(var(--radius) - 4px);
  border: 1px solid var(--border-light);
  padding: 25px;
  box-shadow: var(--inner-shadow);
  position: relative;
  /* 恢复背景纹路 */
  background-image:
    linear-gradient(180deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0) 15%),
    var(--texture-pattern);
}

/* 顶部：名称 + 评分 横向布局 */
.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

/* 景区名称样式 */
.name-wrapper {
  position: relative;
  max-width: 70%;
}

.attraction-name {
  font-size: 1.4rem;
  color: var(--text-dark);
  line-height: 1.4;
  transition: var(--transition);
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
  cursor: default;
}

.attraction-card:hover .attraction-name {
  color: var(--primary-color);
  text-shadow: 0 3px 6px rgba(26, 94, 56, 0.15);
}

/* 名称气泡提示 */
.name-tooltip {
  position: absolute;
  top: -40px;
  left: 0;
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
  left: 10px;
  border-width: 6px 6px 0;
  border-style: solid;
  border-color: rgba(0, 0, 0, 0.8) transparent transparent;
}

.name-wrapper:hover .name-tooltip {
  opacity: 1;
  visibility: visible;
}

/* 评分标签 */
.score-tag {
  display: flex;
  align-items: center;
  gap: 4px;
  background-color: var(--score-color);
  color: var(--white);
  padding: 4px 10px;
  border-radius: 20px;
  font-weight: 500;
  box-shadow: 0 2px 4px rgba(255, 125, 0, 0.2);
}

.icon-star {
  color: var(--white);
  font-size: 0.9rem;
}

.score-value {
  font-size: 1rem;
}

/* 景区位置 */
.location-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text-medium);
  font-size: 0.95rem;
  margin-bottom: 15px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
}

.icon-location {
  color: var(--primary-color);
  font-size: 1.1rem;
}

.attraction-location {
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
}

/* 内容区内部分层容器（带纹路） */
.content-inner {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 15px;
  background: var(--white);
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
  margin-bottom: 0;
  min-height: 120px;
  /* 补充轻微纹理 */
  background-image: var(--texture-pattern);
  background-size: 100px;
}

/* 景区描述 */
.attraction-desc {
  color: var(--text-medium);
  line-height: 1.7;
  margin-bottom: 15px;
  flex: 1;
  background: rgba(255, 255, 255, 0.9);
  padding: 8px 0;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  transition: all 0.3s ease;
}

.attraction-desc.expand-desc {
  -webkit-line-clamp: unset;
  max-height: 300px;
  overflow-y: auto;
  scrollbar-width: thin;
}

.attraction-desc.expand-desc::-webkit-scrollbar {
  width: 4px;
}

.attraction-desc.expand-desc::-webkit-scrollbar-thumb {
  background-color: var(--text-light);
  border-radius: 2px;
}

/* 元数据 */
.attraction-meta {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 0;
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

.icon-time {
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
  background-image: var(--texture-pattern);
  background-size: 100px;
}

.empty-state:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow-hover);
}

.empty-icon {
  font-size: 60px;
  margin-bottom: 20px;
  opacity: 0.6;
  color: var(--primary-color);
}

/* 响应式适配 */
@media (max-width: 1024px) {
  .attraction-list {
    gap: 35px;
    padding: 50px 15px;
  }

  .attraction-card:hover {
    transform: translateY(-8px) scale(1.01);
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.18);
  }

  .attraction-desc {
    -webkit-line-clamp: 2;
  }
}

@media (max-width: 768px) {
  .attraction-header {
    padding: 40px 15px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.12);
  }

  .attraction-header h1 {
    font-size: 2rem;
  }

  .attraction-list {
    grid-template-columns: 1fr;
    gap: 30px;
    padding: 40px 15px;
  }

  .attraction-content {
    padding: 20px;
  }

  .content-inner {
    padding: 12px;
    min-height: 100px;
  }

  .attraction-card {
    box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
  }

  .attraction-card:hover {
    transform: translateY(-6px) scale(1.01);
  }

  .attraction-name {
    font-size: 1.3rem;
  }
}

@media (max-width: 480px) {
  .attraction-header h1 {
    font-size: 1.7rem;
  }

  .top-bar {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .name-wrapper {
    max-width: 100%;
  }
}
</style>
