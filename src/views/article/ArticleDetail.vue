<template>
  <div class="reading-page">
    <div class="nav-bar">
      <el-button link @click="$router.back()">
        <el-icon class="icon-back"><ArrowLeft /></el-icon> 返回列表
      </el-button>
    </div>

    <div class="article-container" v-if="article.id">
      
      <header class="article-header">
        <h1 class="title">{{ article.title }}</h1>
        
        <div class="meta-info">
          <div class="author-block">
            <el-avatar :size="40" class="avatar">{{ (article.adminName || 'A').charAt(0) }}</el-avatar>
            <div class="text-info">
              <span class="author-name">{{ article.adminName || '管理员' }}</span>
              <!-- <span class="publish-time">{{ formatTime(article.createTime) }} · 阅读 {{ article.viewCount || 0 }}</span> -->
            </div>
          </div>
          <div v-if="article.mood" class="mood-tag">
            {{ getMoodEmoji(article.mood) }}
          </div>
        </div>
      </header>

      <div v-if="article.coverImg" class="cover-wrapper">
        <img :src="article.coverImg" alt="Article Cover" class="cover-image" />
      </div>

      <main class="markdown-body">
        <MdPreview :modelValue="article.contentMd" />
      </main>

      <div class="end-divider">
        <span>- THE END -</span>
      </div>
    </div>

    <div class="skeleton-container" v-else>
      <el-skeleton :rows="10" animated />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { MdPreview } from 'md-editor-v3';
import 'md-editor-v3/lib/style.css';
import { ArrowLeft } from '@element-plus/icons-vue';
// 确保你的 api 路径正确
import { getArticleDetail } from '@/api/article';

const route = useRoute();
const article = ref({});

onMounted(async () => {
  const id = route.params.id;
  if(id) {
    try {
      const res = await getArticleDetail(id);
      article.value = res.data;
    } catch (error) {
      console.error("加载文章失败", error);
    }
  }
});

// 格式化时间
const formatTime = (t) => {
  if (!t) return '';
  return t.replace('T', ' ').substring(0, 16);
};

// 心情映射
const getMoodEmoji = (mood) => {
  const map = { happy: '😄 开心', emo: '🌧️ Emo', calm: '☕ 平静', angry: '🔥 暴躁' };
  return map[mood] || '📝 随笔';
};
</script>

<style scoped lang="scss">
.reading-page {
  min-height: 100vh;
  background-color: #ffffff; /* 纯白背景，类似文档 */
  padding-bottom: 80px;
}

.nav-bar {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px 0;
  
  .icon-back {
    margin-right: 5px;
    font-size: 18px;
  }
  
  :deep(.el-button) {
    font-size: 16px;
    color: #666;
    &:hover { color: #333; }
  }
}

.article-container {
  max-width: 800px; /* 限制最大宽度，提升阅读体验 */
  margin: 0 auto;
  padding: 0 20px;
  animation: fadeIn 0.5s ease;
}

.article-header {
  margin-bottom: 30px;

  .title {
    font-size: 2.5rem;
    font-weight: 800;
    color: #333;
    line-height: 1.3;
    margin-bottom: 20px;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  }

  .meta-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    .author-block {
      display: flex;
      align-items: center;
      gap: 12px;
      
      .avatar {
        background: #f0f0f0;
        color: #555;
        font-weight: bold;
      }

      .text-info {
        display: flex;
        flex-direction: column;
        
        .author-name {
          font-weight: 600;
          color: #333;
          font-size: 1rem;
        }
        
        .publish-time {
          font-size: 0.85rem;
          color: #999;
          margin-top: 2px;
        }
      }
    }

    .mood-tag {
      background: #f7f7f7;
      padding: 5px 12px;
      border-radius: 20px;
      font-size: 0.9rem;
      color: #666;
    }
  }
}

.cover-wrapper {
  width: 100%;
  margin-bottom: 40px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 8px 20px rgba(0,0,0,0.08);

  .cover-image {
    width: 100%;
    height: auto;
    max-height: 500px;
    object-fit: cover; /* 保持图片比例 */
    display: block;
  }
}

.markdown-body {
  /* 调整 markdown 编辑器预览组件的默认样式，使其融入页面 */
  :deep(.md-editor-preview-wrapper) {
    padding: 0;
  }
  :deep(.md-editor-preview) {
    font-size: 1.1rem; /* 正文字号稍微大一点，看起来更舒服 */
    line-height: 1.8;
    color: #2c3e50;
  }
}

.end-divider {
  text-align: center;
  margin-top: 60px;
  color: #ccc;
  font-size: 0.9rem;
  letter-spacing: 2px;
  position: relative;
  
  &::before, &::after {
    content: "";
    display: inline-block;
    width: 50px;
    height: 1px;
    background: #eee;
    vertical-align: middle;
    margin: 0 15px;
  }
}

.skeleton-container {
  max-width: 800px;
  margin: 40px auto;
  padding: 0 20px;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

/* 移动端适配 */
@media (max-width: 768px) {
  .title { font-size: 1.8rem !important; }
  .nav-bar { padding-left: 20px; }
}
</style>