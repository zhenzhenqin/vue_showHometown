<template>
  <div class="ai-chat-container">
    <!-- 聊天头部 -->
    <div class="chat-header">
      <div class="header-icon">🤖</div>
      <div class="header-info">
        <h2>AI智能导游</h2>
        <p>基于知识库的智能问答助手</p>
      </div>
      <div class="header-badge" v-if="isTyping">思考中...</div>
    </div>

    <!-- 欢迎语 -->
    <div v-if="messages.length === 0" class="welcome-section">
      <div class="welcome-icon">🏠</div>
      <h3>你好，我是衢州AI导游！</h3>
      <p>你可以问我关于衢州的景点、美食、文化等问题</p>
      <div class="quick-questions">
        <div class="quick-title">试试这样问：</div>
        <div class="quick-tags">
          <span 
            v-for="q in quickQuestions" 
            :key="q.text"
            class="quick-tag"
            @click="sendQuestion(q.text)"
          >
            {{ q.text }}
          </span>
        </div>
      </div>
    </div>

    <!-- 消息列表 -->
    <div class="message-list" ref="messageListRef">
      <div 
        v-for="(msg, index) in messages" 
        :key="index"
        class="message-item"
        :class="msg.role"
      >
        <div class="message-avatar">
          {{ msg.role === 'user' ? '👤' : '🤖' }}
        </div>
        <div class="message-content">
          <!-- AI加载中显示动画 -->
          <div v-if="msg.role === 'assistant' && msg.streaming && !msg.content" class="message-bubble loading-bubble">
            <div class="loading-dots">
              <span></span><span></span><span></span>
            </div>
          </div>
          <!-- AI正常显示 -->
          <div v-else class="message-bubble">
            {{ msg.content }}<span v-if="msg.streaming" class="cursor">|</span>
          </div>
          <div class="message-time" v-if="msg.createTime && !msg.streaming">
            {{ formatTime(msg.createTime) }}
          </div>
        </div>
      </div>
    </div>

    <!-- 输入区域 -->
    <div class="input-section">
      <div class="input-wrapper">
        <input 
          v-model="inputText"
          type="text"
          placeholder="输入你的问题..."
          class="chat-input"
          :disabled="isTyping"
          @keyup.enter="sendMessage"
        />
        <button 
          class="send-btn"
          :disabled="!inputText.trim() || isTyping"
          @click="sendMessage"
        >
          {{ isTyping ? '...' : '➤' }}
        </button>
      </div>
      <div class="input-tips">
        按 Enter 发送 | 支持询问景点、特产、文化等信息
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, onMounted } from 'vue'

// 状态
const messages = ref([])
const inputText = ref('')
const isTyping = ref(false)
const sessionId = ref(null)
const messageListRef = ref(null)

// 快捷问题
const quickQuestions = [
  { text: '衢州有什么好吃的？' },
  { text: '推荐几个景点' },
  { text: '衢州文化介绍' },
  { text: '怎么玩？' },
  { text: '有什么特产？' }
]

// 发送消息（流式输出）
const sendMessage = async () => {
  if (!inputText.value.trim() || isTyping.value) return
  sendQuestion(inputText.value.trim())
}

const sendQuestion = async (question) => {
  inputText.value = ''
  
  // 添加用户消息
  const userMsg = {
    role: 'user',
    content: question,
    createTime: new Date().toISOString()
  }
  messages.value.push(userMsg)
  scrollToBottom()
  
  isTyping.value = true
  
  // 添加AI消息占位
  const aiMsg = {
    role: 'assistant',
    content: '',
    streaming: true,
    createTime: new Date().toISOString()
  }
  messages.value.push(aiMsg)
  
  try {
    // 使用fetch + ReadableStream接收SSE
    const response = await fetch(`http://localhost:8080/ai/chat/stream?question=${encodeURIComponent(question)}&sessionId=${sessionId.value || ''}`, {
      method: 'GET',
      headers: {
        'Accept': 'text/event-stream'
      }
    })

    if (!response.ok) {
      throw new Error('请求失败')
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let fullContent = ''
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value)
      
      // 按\n\n分割处理完整的数据块
      while (buffer.includes('\n')) {
        const newlineIndex = buffer.indexOf('\n')
        const line = buffer.substring(0, newlineIndex)
        buffer = buffer.substring(newlineIndex + 1)
        
        // 处理 data: 格式
        if (line.startsWith('data:')) {
          const data = line.substring(5)
          if (data === '[DONE]' || data === '') continue
          fullContent += data
          aiMsg.content = fullContent
          messages.value = [...messages.value]
          scrollToBottom()
        }
      }
    }

    aiMsg.streaming = false
    aiMsg.createTime = new Date().toISOString()

  } catch (error) {
    console.error('AI问答失败:', error)
    aiMsg.content = '抱歉，服务暂时不可用，请稍后再试。'
    aiMsg.streaming = false
  } finally {
    isTyping.value = false
    scrollToBottom()
  }
}

// 滚动到底部
const scrollToBottom = () => {
  nextTick(() => {
    if (messageListRef.value) {
      messageListRef.value.scrollTop = messageListRef.value.scrollHeight
    }
  })
}

// 格式化时间
const formatTime = (timeStr) => {
  const date = new Date(timeStr)
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  return `${hours}:${minutes}`
}

onMounted(() => {
  // 初始化
})
</script>

<style scoped>
.ai-chat-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  max-width: 800px;
  margin: 0 auto;
  background: #f5f7fa;
}

.chat-header {
  display: flex;
  align-items: center;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  gap: 15px;
}

.header-icon {
  font-size: 40px;
  background: white;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.header-info h2 {
  margin: 0;
  font-size: 20px;
}

.header-info p {
  margin: 5px 0 0 0;
  opacity: 0.9;
  font-size: 14px;
}

.header-badge {
  margin-left: auto;
  background: rgba(255,255,255,0.2);
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

.welcome-section {
  padding: 40px 20px;
  text-align: center;
  background: white;
  margin: 20px;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
}

.welcome-icon {
  font-size: 60px;
  margin-bottom: 20px;
}

.welcome-section h3 {
  margin: 0 0 10px 0;
  color: #333;
}

.welcome-section p {
  margin: 0;
  color: #666;
}

.quick-questions {
  margin-top: 30px;
}

.quick-title {
  font-size: 14px;
  color: #999;
  margin-bottom: 15px;
}

.quick-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
}

.quick-tag {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 10px 20px;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 14px;
}

.quick-tag:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.message-list {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.message-item {
  display: flex;
  gap: 12px;
  max-width: 80%;
}

.message-item.user {
  flex-direction: row-reverse;
  align-self: flex-end;
}

.message-item.assistant {
  align-self: flex-start;
}

.message-avatar {
  font-size: 28px;
  width: 40px;
  height: 40px;
  background: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.message-content {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.message-item.user .message-content {
  align-items: flex-end;
}

.message-bubble {
  padding: 12px 18px;
  border-radius: 18px;
  line-height: 1.8;
  font-size: 15px;
  word-break: break-word;
  white-space: pre-wrap;
}

.message-item.user .message-bubble {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-bottom-right-radius: 4px;
}

.message-item.assistant .message-bubble {
  background: white;
  color: #333;
  border-bottom-left-radius: 4px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  white-space: pre-wrap;
}

.cursor {
  animation: blink 1s infinite;
}

@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}

/* 加载动画 */
.loading-bubble {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 60px;
  min-height: 40px;
}

.loading-dots {
  display: flex;
  gap: 4px;
}

.loading-dots span {
  width: 8px;
  height: 8px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-radius: 50%;
  animation: bounce 1.4s infinite ease-in-out both;
}

.loading-dots span:nth-child(1) {
  animation-delay: -0.32s;
}

.loading-dots span:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes bounce {
  0%, 80%, 100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
}

.message-time {
  font-size: 12px;
  color: #999;
}

.input-section {
  padding: 20px;
  background: white;
  border-top: 1px solid #eee;
}

.input-wrapper {
  display: flex;
  gap: 12px;
  max-width: 800px;
  margin: 0 auto;
}

.chat-input {
  flex: 1;
  padding: 14px 20px;
  border: 2px solid #e8e8e8;
  border-radius: 30px;
  font-size: 16px;
  outline: none;
  transition: border-color 0.3s;
}

.chat-input:focus {
  border-color: #667eea;
}

.send-btn {
  width: 50px;
  height: 50px;
  border: none;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 50%;
  font-size: 20px;
  cursor: pointer;
  transition: all 0.3s;
}

.send-btn:hover:not(:disabled) {
  transform: scale(1.1);
}

.send-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.input-tips {
  text-align: center;
  margin-top: 10px;
  font-size: 12px;
  color: #999;
}
</style>
