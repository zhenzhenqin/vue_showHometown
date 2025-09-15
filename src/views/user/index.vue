<template>
  <div class="user-profile-container">
    <!-- 头部横幅 -->
    <div class="user-profile-header">
      <div class="header-content">
        <h1>个人主页</h1>
        <p>记录与分享，专注衢州本地内容创作</p>
        <div class="divider"></div>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>正在加载个人信息...</p>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="error">
      <div class="error-icon">⚠️</div>
      <p>{{ error }}</p>
      <button @click="fetchUserProfile" class="retry-btn">重新加载</button>
    </div>

    <!-- 个人信息主体 -->
    <div v-else class="user-profile-main">
      <!-- 左侧：头像区域（Twitter风格边框） -->
      <div class="avatar-section">
        <div class="avatar-container">
          <!-- 核心：Twitter风格头像（单线条圆形边框） -->
          <div class="twitter-style-avatar">
            <span class="avatar-initial">{{ userInitial }}</span>
          </div>
          <p class="avatar-name">{{ userProfile.realName }}</p>
          <p class="avatar-username">@{{ userProfile.username }}</p>
        </div>
      </div>

      <!-- 右侧：详细信息卡片 -->
      <div class="info-card">
        <!-- 个人简介 -->
        <div class="info-section intro-section">
          <h3 class="section-title">
            <i class="section-icon">✏️</i> 个人简介
          </h3>
          <p class="intro-content">
            {{ userProfile.introduction || '暂无个人简介，欢迎补充更多关于你的信息～' }}
          </p>
        </div>

        <!-- 联系方式 -->
        <div class="info-section contact-section">
          <h3 class="section-title">
            <i class="section-icon">📞</i> 联系方式
          </h3>
          <div class="contact-list">
            <div class="contact-item">
              <i class="contact-icon">📧</i>
              <span class="contact-label">邮箱：</span>
              <span class="contact-value">{{ userProfile.email }}</span>
            </div>
            <div class="contact-item">
              <i class="contact-icon">📱</i>
              <span class="contact-label">手机：</span>
              <span class="contact-value">{{ formatPhone(userProfile.phone) }}</span>
            </div>
          </div>
        </div>

        <!-- 账号信息 -->
        <div class="info-section account-section">
          <h3 class="section-title">
            <i class="section-icon">🔍</i> 账号信息
          </h3>
          <div class="account-list">
            <div class="account-item">
              <span class="account-label">账号创建时间：</span>
              <span class="account-value">{{ formatDate(userProfile.createTime) }}</span>
            </div>
            <div class="account-item">
              <span class="account-label">信息最后更新：</span>
              <span class="account-value">{{ formatDate(userProfile.updateTime) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { getUser } from '../../api/api'

// 响应式数据
const userProfile = ref({
  realName: '',
  username: '',
  email: '',
  phone: '',
  introduction: '',
  createTime: '',
  updateTime: ''
})
const loading = ref(false)
const error = ref(null)

// 计算属性：真实姓名首字母（默认头像）
const userInitial = computed(() => {
  return userProfile.value.realName ? userProfile.value.realName.charAt(0).toUpperCase() : 'U'
})

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return '暂无数据'
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 格式化手机号（中间打码）
const formatPhone = (phone) => {
  if (!phone || phone.length !== 11) return phone
  return `${phone.slice(0, 3)}****${phone.slice(7)}`
}

// 获取个人信息
const fetchUserProfile = async () => {
  try {
    loading.value = true
    error.value = null
    const response = await getUser()
    if (response.code === 1 && response.data) {
      const { password, id, ...safeData } = response.data // 过滤敏感信息
      userProfile.value = { ...userProfile.value, ...safeData }
    } else {
      throw new Error('个人信息获取失败')
    }
  } catch (err) {
    console.error('获取个人信息异常:', err)
    error.value = err.message || '数据加载失败，请稍后重试'
  } finally {
    loading.value = false
  }
}

// 组件挂载：页面置顶 + 获取数据
onMounted(() => {
  window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  fetchUserProfile()
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
  --shadow: 0 8px 28px rgba(0, 0, 0, 0.15);
  --shadow-hover: 0 15px 40px rgba(0, 0, 0, 0.22);
  --border-light: #f0f0f0;
  --radius: 12px;
  --transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  /* Twitter风格头像边框变量（核心） */
  --avatar-size: 160px; /* 头像尺寸 */
  --avatar-border-width: 2px; /* 边框粗细（细线条，类似Twitter） */
  --avatar-border-color: var(--primary-color); /* 边框颜色（主色，清晰可见） */
  --avatar-bg: #e6f7ee; /* 头像背景色 */
  --avatar-text-color: var(--primary-color); /* 首字母颜色 */
  /* 纹理图案 */
  --texture-pattern: url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23f0f0f0' fill-opacity='0.4' fill-rule='evenodd'/%3E%3C/svg%3E");
}

.user-profile-container {
  min-height: calc(100vh - 144px);
  background-color: #f9fbf8;
  padding: 0;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

/* 头部样式 */
.user-profile-header {
  background: linear-gradient(rgba(26, 94, 56, 0.9), rgba(26, 94, 56, 0.85)),
    url('https://picsum.photos/id/177/1920/500') center/cover no-repeat;
  color: var(--white);
  padding: 60px 20px;
  text-align: center;
  position: relative;
  box-shadow: var(--shadow);
}

.header-content {
  max-width: 800px;
  margin: 0 auto;
}

.user-profile-header h1 {
  font-size: 2.5rem;
  margin-bottom: 15px;
  text-shadow: 0 3px 6px rgba(0, 0, 0, 0.3);
  letter-spacing: 0.5px;
}

.user-profile-header p {
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
  display: inline-flex;
  align-items: center;
  gap: 8px;
  box-shadow: var(--shadow);
}

.retry-btn:hover {
  background-color: var(--primary-light);
  transform: translateY(-3px);
  box-shadow: var(--shadow-hover);
}

/* 个人信息主体 */
.user-profile-main {
  display: flex;
  flex-wrap: wrap;
  gap: 40px;
  padding: 60px 20px;
  max-width: 1200px;
  margin: 0 auto;
  justify-content: center;
}

/* 左侧：头像区域 */
.avatar-section {
  flex: 0 0 280px;
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

.avatar-container {
  text-align: center;
  padding: 20px;
}

/* 核心：Twitter风格头像（细线条圆形边框） */
.twitter-style-avatar {
  width: var(--avatar-size);
  height: var(--avatar-size);
  border-radius: 50%; /* 圆形头像 */
  /* 关键：细线条边框（和Twitter一致，不是填充色） */
  border: var(--avatar-border-width) solid var(--avatar-border-color);
  background-color: var(--avatar-bg);
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0 auto 15px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.08); /* 轻微阴影，突出层次 */
  transition: var(--transition);
}

/* Hover效果：头像和边框一起缩放，更自然 */
.twitter-style-avatar:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.12);
}

.avatar-initial {
  font-size: 4rem;
  font-weight: 700;
  color: var(--avatar-text-color);
}

.avatar-name {
  font-size: 1.5rem;
  color: var(--text-dark);
  margin: 0 0 5px;
  font-weight: 600;
}

.avatar-username {
  font-size: 1rem;
  color: var(--text-light);
  margin: 0;
}

/* 右侧：信息卡片 */
.info-card {
  flex: 1;
  min-width: 300px;
  max-width: 700px;
  background-color: var(--white);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  border: 1px solid var(--border-light);
  padding: 30px;
  background-image: var(--texture-pattern);
  background-size: 100px;
}

/* 信息分区通用样式 */
.info-section {
  margin-bottom: 25px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--border-light);
}

.info-section:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}

.section-title {
  font-size: 1.2rem;
  color: var(--primary-color);
  margin: 0 0 15px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.section-icon {
  font-size: 1.1rem;
}

/* 个人简介区域 */
.intro-content {
  font-size: 1rem;
  color: var(--text-medium);
  line-height: 1.7;
  margin: 0;
  padding: 10px 15px;
  background-color: var(--secondary-color);
  border-radius: 8px;
  min-height: 60px;
  display: flex;
  align-items: center;
}

/* 联系方式区域 */
.contact-list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
  font-size: 1rem;
}

.contact-item:last-child {
  margin-bottom: 0;
}

.contact-icon {
  color: var(--primary-color);
  font-size: 1.1rem;
  width: 20px;
  text-align: center;
}

.contact-label {
  color: var(--text-light);
  width: 60px;
}

.contact-value {
  color: var(--text-dark);
  flex: 1;
}

/* 账号信息区域 */
.account-list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.account-item {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
  font-size: 1rem;
}

.account-item:last-child {
  margin-bottom: 0;
}

.account-label {
  color: var(--text-light);
  flex: 0 0 140px;
}

.account-value {
  color: var(--text-dark);
  flex: 1;
}

/* 响应式适配 */
@media (max-width: 768px) {
  .user-profile-main {
    padding: 40px 15px;
    gap: 30px;
  }

  .avatar-section {
    flex: 0 0 100%;
    margin-bottom: 10px;
  }

  /* 小屏：缩小头像和边框 */
  :root {
    --avatar-size: 140px;
    --avatar-border-width: 2px; /* 边框粗细保持不变，确保可见 */
  }

  .avatar-initial {
    font-size: 3.5rem;
  }

  .info-card {
    padding: 20px;
    min-width: auto;
    width: 100%;
  }

  .account-label {
    flex: 0 0 120px;
  }
}

@media (max-width: 480px) {
  .user-profile-header h1 {
    font-size: 2rem;
  }

  .user-profile-header p {
    font-size: 1rem;
  }

  /* 超小屏：进一步缩小头像 */
  :root {
    --avatar-size: 120px;
  }

  .avatar-initial {
    font-size: 3rem;
  }

  .contact-item, .account-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 5px;
  }

  .contact-label, .account-label {
    width: auto;
  }
}
</style>