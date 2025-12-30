<template>
  <div class="timeline-page">
    <div class="background-animation"></div>

    <div class="header-section">
      <h1 class="main-title">时光 · 轴</h1>
      <p class="subtitle">Time Flows, Memories Remain.</p>
    </div>

    <div class="timeline-container">
      <div class="spine"></div>

      <div 
        v-for="(item, index) in list" 
        :key="item.id"
        class="timeline-item"
        :class="[
          index % 2 === 0 ? 'left-item' : 'right-item', 
          { 'visible': visibleItems.includes(item.id) }
        ]"
        :ref="el => setItemRef(el, item.id)"
        @click="goDetail(item.id)"
      >
        <div class="dot">
          <div class="dot-inner"></div>
        </div>

        <div class="card-box">
          <div class="card-content glass-effect">
            <div class="cover-wrapper">
              <div 
                class="cover" 
                :style="{ backgroundImage: `url(${item.coverImg || '/images/default-cover.jpg'})` }"
              ></div>
              <div class="cover-date">
                <span class="day">{{ formatDay(item.createTime) }}</span>
                <span class="month">{{ formatMonth(item.createTime) }}</span>
              </div>
            </div>

            <div class="info">
              <h3 class="title">{{ item.title }}</h3>
              <p class="summary">{{ item.summary }}</p>
              <div class="footer">
                <span class="author">
                  <el-icon><User /></el-icon> {{ item.authorName || 'Admin' }}
                </span>
                <span class="read-more">阅读全文 <el-icon><ArrowRight /></el-icon></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="load-more" v-if="!loading && list.length > 0">
      <span>THE END</span>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { getArticleList } from '@/api/article';
import { User, ArrowRight } from '@element-plus/icons-vue';

const router = useRouter();
const list = ref([]);
const loading = ref(false);
const visibleItems = ref([]); // 存储已进入视口的元素ID
const observer = ref(null);

// 格式化日期
const formatDay = (t) => t ? new Date(t).getDate() : '01';
const formatMonth = (t) => t ? new Date(t).toLocaleString('default', { month: 'short' }).toUpperCase() : 'JAN';

const goDetail = (id) => router.push(`/article/${id}`);

// 设置观察者
const setItemRef = (el, id) => {
  if (el && observer.value) {
    el.setAttribute('data-id', id);
    observer.value.observe(el);
  }
};

onMounted(async () => {
  loading.value = true;
  try {
    // 获取数据
    const res = await getArticleList({ page: 1, pageSize: 20 });
    list.value = res.data.rows || [];
    
    // 初始化 IntersectionObserver
    initObserver();
  } finally {
    loading.value = false;
  }
});

onUnmounted(() => {
  if (observer.value) observer.value.disconnect();
});

const initObserver = () => {
  observer.value = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      // 当元素进入视口 15% 时触发
      if (entry.isIntersecting) {
        const id = Number(entry.target.getAttribute('data-id'));
        if (!visibleItems.value.includes(id)) {
          visibleItems.value.push(id);
        }
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });
};
</script>

<style scoped lang="scss">
/* --- 页面容器 --- */
.timeline-page {
  min-height: 100vh;
  padding: 60px 20px;
  background-color: #f5f7fa;
  position: relative;
  overflow-x: hidden;
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
}

/* 动态背景 */
.background-animation {
  position: fixed;
  top: 0; left: 0; width: 100%; height: 100%;
  background: linear-gradient(120deg, #e0c3fc 0%, #8ec5fc 100%);
  opacity: 0.2;
  z-index: 0;
  pointer-events: none;
}

/* 头部标题 */
.header-section {
  text-align: center;
  margin-bottom: 80px;
  position: relative;
  z-index: 2;
  
  .main-title {
    font-size: 3rem;
    color: #2c3e50;
    margin-bottom: 10px;
    letter-spacing: 4px;
    font-weight: 800;
  }
  .subtitle {
    font-size: 1.2rem;
    color: #7f8c8d;
    font-family: 'Georgia', serif;
    font-style: italic;
  }
}

/* --- 时间轴容器 --- */
.timeline-container {
  max-width: 1000px;
  margin: 0 auto;
  position: relative;
  z-index: 2;
  padding-bottom: 100px;
}

/* 中轴线 */
.spine {
  position: absolute;
  left: 50%;
  top: 0;
  bottom: 0;
  width: 4px;
  background: rgba(0, 0, 0, 0.05);
  transform: translateX(-50%);
  border-radius: 2px;
  
  &::after {
    content: '';
    position: absolute;
    top: 0; left: 0; width: 100%; height: 50vh;
    background: linear-gradient(to bottom, #42b983, transparent);
    opacity: 0.5;
  }
}

/* --- 单个时间节点 --- */
.timeline-item {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 60px;
  position: relative;
  width: 100%;
  perspective: 1000px; /* 3D 视距，这是旋转效果的关键 */
}

/* 圆点 */
.dot {
  position: absolute;
  left: 50%;
  width: 20px;
  height: 20px;
  transform: translateX(-50%);
  background: #fff;
  border-radius: 50%;
  border: 4px solid #fff;
  box-shadow: 0 0 0 3px rgba(66, 185, 131, 0.2);
  z-index: 5;
  transition: all 0.3s ease;
  
  .dot-inner {
    width: 100%; height: 100%;
    background: #42b983;
    border-radius: 50%;
  }
}

/* 卡片盒子 - 用于占位和布局 */
.card-box {
  width: 45%; /* 卡片宽度 */
  position: relative;
  transition: all 0.8s cubic-bezier(0.2, 0.8, 0.2, 1);
  opacity: 0; /* 初始隐藏 */
}

/* 玻璃卡片 - 实际内容 */
.card-content {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0,0,0,0.05);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;
  border: 1px solid rgba(255, 255, 255, 0.5);
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 40px rgba(66, 185, 131, 0.2);
    
    .read-more {
      color: #42b983;
      padding-right: 5px;
    }
  }
}

/* --- 左右布局差异 & 进场动画 --- */

/* 左侧卡片 */
.left-item {
  justify-content: flex-start;
  
  .card-box {
    margin-left: auto; /* 推到左边靠近中轴线 */
    margin-right: 50%; /* 留出右边空间 */
    padding-right: 40px; /* 与中轴线的间距 */
    
    /* 初始状态：向左旋转90度，像门一样关着 */
    transform: translateX(-50px) rotateY(-30deg) scale(0.9);
    transform-origin: right center; /* 旋转轴在右侧 */
  }
}

/* 右侧卡片 */
.right-item {
  justify-content: flex-end;
  
  .card-box {
    margin-right: auto;
    margin-left: 50%;
    padding-left: 40px;
    
    /* 初始状态：向右旋转90度 */
    transform: translateX(50px) rotateY(30deg) scale(0.9);
    transform-origin: left center; /* 旋转轴在左侧 */
  }
}

/* 激活状态 (Visible) - 归位 */
.timeline-item.visible {
  .card-box {
    opacity: 1;
    transform: translateX(0) rotateY(0) scale(1); /* 恢复正常 */
  }
  
  .dot {
    box-shadow: 0 0 0 6px rgba(66, 185, 131, 0.4);
    transform: translateX(-50%) scale(1.2);
  }
}

/* --- 卡片内部样式 --- */
.cover-wrapper {
  position: relative;
  height: 200px;
  overflow: hidden;
  
  .cover {
    width: 100%; height: 100%;
    background-size: cover;
    background-position: center;
    transition: transform 0.5s ease;
  }
  
  /* 悬停时图片轻微放大 */
  .card-content:hover .cover { transform: scale(1.05); }
  
  .cover-date {
    position: absolute;
    top: 15px; left: 15px;
    background: rgba(255, 255, 255, 0.9);
    padding: 5px 12px;
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    align-items: center;
    box-shadow: 0 4px 10px rgba(0,0,0,0.1);
    
    .day { font-size: 1.2rem; font-weight: bold; color: #2c3e50; line-height: 1; }
    .month { font-size: 0.7rem; color: #95a5a6; letter-spacing: 1px; }
  }
}

.info {
  padding: 20px;
  
  .title {
    font-size: 1.4rem;
    color: #2c3e50;
    margin-bottom: 10px;
    font-weight: 600;
  }
  
  .summary {
    color: #7f8c8d;
    font-size: 0.95rem;
    line-height: 1.6;
    margin-bottom: 20px;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  
  .footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.9rem;
    color: #bdc3c7;
    border-top: 1px solid #f0f0f0;
    padding-top: 15px;
    
    .author { display: flex; align-items: center; gap: 5px; }
    .read-more { 
      cursor: pointer; 
      display: flex; align-items: center; gap: 5px; 
      transition: all 0.3s;
    }
  }
}

.load-more {
  text-align: center;
  color: #bdc3c7;
  letter-spacing: 3px;
  margin-top: 40px;
  font-size: 0.8rem;
}

/* --- 移动端适配 --- */
@media (max-width: 768px) {
  .spine { left: 20px; }
  
  .timeline-item {
    justify-content: flex-start;
    margin-bottom: 40px;
    
    .dot { left: 20px; }
    
    .card-box {
      width: calc(100% - 50px);
      margin-left: 50px !important;
      margin-right: 0 !important;
      padding: 0 !important;
      
      /* 移动端统一从右侧滑入 */
      transform: translateX(30px) rotateY(0) !important;
    }
    
    &.visible .card-box {
      transform: translateX(0) !important;
    }
  }
}
</style>