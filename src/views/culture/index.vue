<template>
  <div class="culture-container">
    <!-- 头部横幅区域 -->
    <div class="culture-header">
      <div class="header-content">
        <h1>衢州文化</h1>
        <p>传承文化根脉，感受千年智慧</p>
        <div class="divider"></div>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>正在加载文化数据...</p>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="error">
      <div class="error-icon">⚠️</div>
      <p>{{ error }}</p>
      <button @click="fetchCultures" class="retry-btn">重新加载</button>
    </div>

    <!-- 文化列表 -->
    <div v-else class="culture-list">
      <div v-for="culture in cultureList" :key="culture.id" class="culture-card">
        <!-- 图片区域（加边框分层） -->
        <div class="culture-image" v-if="culture.image">
          <img :src="culture.image" :alt="culture.title" class="card-img" />
          <div class="image-overlay"></div>
        </div>
        <!-- 卡片内容区（核心立体增强，已删除查看详情按钮） -->
        <div class="culture-content">
          <span class="culture-tag">文化遗产</span>
          <!-- 标题：单行省略 + hover显示完整（气泡提示） -->
          <div class="title-wrapper">
            <h2 class="culture-title">{{ culture.title }}</h2>
            <!-- 标题完整内容气泡（仅当文字溢出时显示） -->
            <div 
              class="title-tooltip" 
              :class="{ 'show-tooltip': isTitleOverflow(culture.title) }"
            >
              {{ culture.title }}
            </div>
          </div>
          <!-- 内容区内部分层容器（删除按钮后优化布局） -->
          <div class="content-inner">
            <!-- 描述：多行省略 + hover展开完整内容 -->
            <p class="culture-text" :class="{ 'expand-text': isDescHovered[culture.id] }"
               @mouseenter="isDescHovered[culture.id] = true"
               @mouseleave="isDescHovered[culture.id] = false">
              {{ culture.content }}
            </p>
            <div class="culture-meta">
              <span class="meta-item">
                <i class="icon-time"></i> 创建: {{ formatDate(culture.createTime) }}
              </span>
              <span class="meta-item">
                <i class="icon-refresh"></i> 更新: {{ formatDate(culture.updateTime) }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- 空状态处理（加立体阴影） -->
      <div v-if="cultureList.length === 0" class="empty-state">
        <div class="empty-icon">📜</div>
        <p>暂无文化数据</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getCulture } from '../../api/api'

// 文化数据
const cultureList = ref([])
const loading = ref(false)
const error = ref(null)
// 描述文字hover状态（控制是否展开）
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

// 判断标题是否溢出（用于控制气泡显示）
const isTitleOverflow = (title) => {
  // 仅当标题长度超过18个字符时判定为溢出（可根据需求调整）
  return title.length > 18
}

// 获取文化数据
const fetchCultures = async () => {
  try {
    loading.value = true
    error.value = null
    const response = await getCulture()

    if (response.code === 1 && response.data) {
      cultureList.value = response.data
      // 初始化描述hover状态
      response.data.forEach(item => {
        isDescHovered.value[item.id] = false
      })
    } else {
      throw new Error(response.msg || '数据加载失败')
    }
  } catch (err) {
    console.error('获取文化数据失败:', err)
    error.value = err.message || '数据加载失败，请稍后重试'
    cultureList.value = []
  } finally {
    loading.value = false
  }
}

// 组件挂载时：1.强制滚动到顶部 2.获取数据（解决页面进入位置问题）
onMounted(() => {
  // 关键代码：强制页面瞬间滚动到顶部（x=0, y=0）
  window.scrollTo({
    top: 0,
    left: 0,
    behavior: 'instant' // 无动画，避免延迟感
  })
  
  fetchCultures()
})
</script>

<style scoped>
/* 基础样式与变量（同步特产页立体参数） */
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

.culture-container {
  min-height: calc(100vh - 144px);
  background-color: #f9fbf8;
  padding: 0;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

/* 头部样式（加阴影增强分层） */
.culture-header {
  background: linear-gradient(rgba(26, 94, 56, 0.9), rgba(26, 94, 56, 0.85)),
    url('https://picsum.photos/id/1036/1920/500') center/cover no-repeat;
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

.culture-header h1 {
  font-size: 2.5rem;
  margin-bottom: 15px;
  text-shadow: 0 3px 6px rgba(0, 0, 0, 0.3);
  letter-spacing: 0.5px;
}

.culture-header p {
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

/* 加载状态（加立体阴影） */
.loading {
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

/* 错误状态（加立体阴影） */
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

/* 列表容器（增大间距，突出卡片） */
.culture-list {
  display: grid;
  gap: 40px;
  padding: 60px 20px;
  max-width: 1400px;
  margin: 0 auto;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
}

/* 文化卡片（核心立体结构） */
.culture-card {
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

.culture-card:hover {
  transform: translateY(-12px) scale(1.02);
  box-shadow: var(--shadow-hover);
  z-index: 10;
}

/* 卡片图片（加边框分层） */
.culture-image {
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

.culture-card:hover .card-img {
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

/* 卡片内容区（核心立体增强，删除按钮后优化内边距） */
.culture-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: var(--content-bg);
  border-radius: calc(var(--radius) - 4px);
  border: 1px solid var(--border-light);
  padding: 25px;
  box-shadow: var(--inner-shadow);
  position: relative;
  background-image: linear-gradient(180deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0) 15%);
  /* 删除按钮后减小底部内边距，避免留白过多 */
  padding-bottom: 20px;
}

/* 文化标签（立体阴影+hover动效） */
.culture-tag {
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

.culture-card:hover .culture-tag {
  background-color: var(--primary-color);
  color: var(--white);
  box-shadow: 0 6px 14px rgba(26, 94, 56, 0.3);
  transform: translateY(-2px);
  border-color: rgba(255, 255, 255, 0.2);
}

/* 标题容器：控制单行省略与气泡定位 */
.title-wrapper {
  position: relative;
  width: 100%;
  margin-bottom: 18px;
}

/* 标题：单行省略（核心样式） */
.culture-title {
  font-size: 1.4rem;
  color: var(--text-dark);
  line-height: 1.4;
  transition: var(--transition);
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
  padding-bottom: 8px;
  border-bottom: 1px solid var(--border-light);
  /* 单行省略关键样式 */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
  cursor: default;
}

.culture-card:hover .culture-title {
  color: var(--primary-color);
  text-shadow: 0 3px 6px rgba(26, 94, 56, 0.15);
}

/* 标题气泡：hover显示完整内容 */
.title-tooltip {
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

/* 标题hover时显示气泡 */
.title-wrapper:hover .title-tooltip {
  opacity: 1;
  visibility: visible;
}

/* 气泡底部小三角 */
.title-tooltip::after {
  content: '';
  position: absolute;
  bottom: -6px;
  left: 50%;
  transform: translateX(-50%);
  border-width: 6px 6px 0;
  border-style: solid;
  border-color: rgba(0, 0, 0, 0.8) transparent transparent;
}

/* 内容区内部分层容器（删除按钮后优化布局） */
.content-inner {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 15px;
  background: var(--white);
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
  /* 取消底部margin，避免与内容区底部产生多余间距 */
  margin-bottom: 0;
  /* 确保描述展开时不超出容器，避免布局抖动 */
  position: relative;
  min-height: 100px;
}

/* 描述：多行省略 + hover展开（核心样式） */
.culture-text {
  color: var(--text-medium);
  line-height: 1.7;
  margin-bottom: 15px;
  flex: 1;
  background: rgba(255, 255, 255, 0.8);
  padding: 8px 0;
  /* 多行省略关键样式（兼容主流浏览器） */
  display: -webkit-box;
  -webkit-line-clamp: 3; /* 默认显示3行，可调整 */
  -webkit-box-orient: vertical;
  overflow: hidden;
  transition: all 0.3s ease;
  height: auto; /* 初始自动高度 */
}

/*  hover时展开完整内容 */
.culture-text.expand-text {
  -webkit-line-clamp: unset; /* 取消行数限制 */
  height: auto; /* 高度自适应 */
  max-height: 300px; /* 最大高度限制，避免内容过长溢出卡片 */
  overflow-y: auto; /* 内容超限时滚动 */
  scrollbar-width: thin; /* 细滚动条（Firefox） */
}

/* 滚动条美化（Chrome/Safari） */
.culture-text.expand-text::-webkit-scrollbar {
  width: 4px;
}
.culture-text.expand-text::-webkit-scrollbar-thumb {
  background-color: var(--text-light);
  border-radius: 2px;
}

/* 元数据（立体分隔，删除按钮后底部对齐） */
.culture-meta {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 0;
  font-size: 0.85rem;
  color: var(--text-light);
  border-top: 1px solid var(--border-light);
  padding-top: 12px;
  /* 让元数据区始终靠底部显示，填补删除按钮后的空间 */
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

.icon-refresh::before {
  content: "🔄";
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

/* 已删除所有.read-more相关样式 */

/* 空状态（立体阴影） */
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
  .culture-list {
    gap: 35px;
    padding: 50px 15px;
  }
  .culture-card:hover {
    transform: translateY(-8px) scale(1.01);
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.18);
  }
  .culture-text {
    -webkit-line-clamp: 2; /* 中屏显示2行 */
  }
}

@media (max-width: 768px) {
  .culture-header {
    padding: 40px 15px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.12);
  }
  .culture-header h1 {
    font-size: 2rem;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }
  .culture-list {
    grid-template-columns: 1fr;
    gap: 30px;
    padding: 40px 15px;
  }
  .culture-image {
    height: 200px;
  }
  .culture-content {
    padding: 20px;
    padding-bottom: 15px; /* 小屏进一步减小底部内边距 */
  }
  .content-inner {
    padding: 12px;
    min-height: 80px;
  }
  .culture-card {
    box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
  }
  .culture-card:hover {
    transform: translateY(-6px) scale(1.01);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  }
  .culture-title {
    font-size: 1.3rem;
    padding-bottom: 6px;
  }
  .culture-text {
    -webkit-line-clamp: 2; /* 小屏显示2行 */
  }
  .title-tooltip {
    font-size: 0.8rem;
    padding: 4px 8px;
    top: -35px;
  }
}

@media (max-width: 480px) {
  .culture-header h1 {
    font-size: 1.7rem;
  }
  .culture-header p {
    font-size: 1rem;
  }
  .culture-text {
    -webkit-line-clamp: 2;
  }
}
</style>