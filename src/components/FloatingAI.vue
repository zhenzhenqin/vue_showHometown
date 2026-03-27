<template>
  <div class="floating-ai" ref="aiRef" :style="posStyle" @mousedown="startDrag" @touchstart="startDrag">
    <div class="ai-btn" @click.stop="goToAI">
      <span class="ai-icon">🤖</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const aiRef = ref(null)
const isDragging = ref(false)
const pos = ref({ x: 30, y: window.innerHeight - 180 })
const offset = ref({ x: 0, y: 0 })

const posStyle = computed(() => ({
  right: 'auto',
  left: `${pos.value.x}px`,
  top: `${pos.value.y}px`
}))

const goToAI = () => {
  if (!isDragging.value) {
    router.push('/ai')
  }
}

const startDrag = (e) => {
  e.preventDefault()
  isDragging.value = false
  const clientX = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX
  const clientY = e.type === 'touchstart' ? e.touches[0].clientY : e.clientY
  const rect = aiRef.value.getBoundingClientRect()
  offset.value = {
    x: clientX - rect.left,
    y: clientY - rect.top
  }
  document.addEventListener('mousemove', onDrag)
  document.addEventListener('mouseup', stopDrag)
  document.addEventListener('touchmove', onDrag, { passive: false })
  document.addEventListener('touchend', stopDrag)
}

const onDrag = (e) => {
  if (e.type === 'touchmove') e.preventDefault()
  isDragging.value = true
  const clientX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX
  const clientY = e.type === 'touchmove' ? e.touches[0].clientY : e.clientY
  const x = clientX - offset.value.x
  const y = clientY - offset.value.y
  const maxX = window.innerWidth - 50
  const maxY = window.innerHeight - 50
  pos.value = {
    x: Math.max(0, Math.min(x, maxX)),
    y: Math.max(0, Math.min(y, maxY))
  }
}

const stopDrag = () => {
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
  document.removeEventListener('touchmove', onDrag)
  document.removeEventListener('touchend', stopDrag)
  setTimeout(() => { isDragging.value = false }, 50)
}

onUnmounted(() => {
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
  document.removeEventListener('touchmove', onDrag)
  document.removeEventListener('touchend', stopDrag)
})
</script>

<style scoped>
.floating-ai {
  position: fixed;
  z-index: 9999;
  cursor: grab;
  touch-action: none;
}

.floating-ai:active {
  cursor: grabbing;
}

.ai-btn {
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.5);
  transition: transform 0.3s ease;
  animation: bounce 2s ease-in-out infinite;
}

.ai-btn:hover {
  transform: scale(1.1);
}

.ai-icon {
  font-size: 24px;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}

@media (max-width: 768px) {
  .ai-btn {
    width: 45px;
    height: 45px;
  }
  .ai-icon {
    font-size: 20px;
  }
}
</style>
