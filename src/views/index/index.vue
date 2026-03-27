<template>
  <div class="home-container">
    <!-- 欢迎区域 -->
    <section class="hero-section">
      <div class="hero-content">
        <h1 class="hero-title">南孔圣地 · 衢州有礼</h1>
        <p class="hero-subtitle">探索浙西山水，品味千年人文</p>
        <div class="hero-tags">
          <span class="tag">景点</span>
          <span class="tag">美食</span>
          <span class="tag">文化</span>
        </div>
      </div>
    </section>

    <!-- 功能入口 -->
    <section class="features-section">
      <h2 class="section-title">探索衢州</h2>
      <div class="feature-grid">
        <div class="feature-card" @click="goTo('/attraction')">
          <div class="feature-icon">🏔️</div>
          <h3>景点</h3>
          <p>江郎山、天脊龙门...</p>
        </div>
        <div class="feature-card" @click="goTo('/specialties')">
          <div class="feature-icon">🍜</div>
          <h3>美食</h3>
          <p>衢州烤饼、龙游发糕...</p>
        </div>
        <div class="feature-card" @click="goTo('/culture')">
          <div class="feature-icon">📜</div>
          <h3>文化</h3>
          <p>南孔文化、婺剧...</p>
        </div>
        <div class="feature-card" @click="goTo('/map')">
          <div class="feature-icon">🗺️</div>
          <h3>地图</h3>
          <p>全域导览</p>
        </div>
      </div>
    </section>

    <!-- 浮动AI助手 -->
    <FloatingAI />
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import FloatingAI from '@/components/FloatingAI.vue'

const router = useRouter()

const goTo = (path) => {
  router.push(path)
}
</script>

<style scoped>
.home-container {
  min-height: 100vh;
  background: linear-gradient(180deg, #f8fafc 0%, #e2e8f0 100%);
}

.hero-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 80px 20px;
  text-align: center;
  position: relative;
  overflow: hidden;
}

.hero-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
}

.hero-content {
  position: relative;
  z-index: 1;
}

.hero-title {
  font-size: 3rem;
  color: white;
  margin-bottom: 16px;
  text-shadow: 0 2px 10px rgba(0,0,0,0.2);
}

.hero-subtitle {
  font-size: 1.25rem;
  color: rgba(255,255,255,0.9);
  margin-bottom: 24px;
}

.hero-tags {
  display: flex;
  justify-content: center;
  gap: 12px;
}

.tag {
  background: rgba(255,255,255,0.2);
  color: white;
  padding: 8px 20px;
  border-radius: 20px;
  font-size: 0.9rem;
  backdrop-filter: blur(10px);
}

.features-section {
  padding: 60px 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.section-title {
  text-align: center;
  font-size: 2rem;
  color: #333;
  margin-bottom: 40px;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 24px;
}

.feature-card {
  background: white;
  border-radius: 20px;
  padding: 40px 30px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
}

.feature-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 12px 40px rgba(102, 126, 234, 0.2);
}

.feature-icon {
  font-size: 3rem;
  margin-bottom: 16px;
}

.feature-card h3 {
  font-size: 1.5rem;
  color: #333;
  margin-bottom: 8px;
}

.feature-card p {
  color: #666;
  font-size: 0.95rem;
}
</style>
