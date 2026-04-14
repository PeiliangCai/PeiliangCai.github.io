<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { Eye, X } from 'lucide-vue-next'

// Vite-native way to get worker URL
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min?url'

const props = defineProps({
  title: String,
  pdfUrl: String
})

const isOpen = ref(false)
const canvasRef = ref(null)
const isLoading = ref(false)
let pdfjsLib = null

const openModal = async () => {
  isOpen.value = true
  isLoading.value = true
  
  try {
    if (!pdfjsLib) {
      pdfjsLib = await import('pdfjs-dist')
      // Set worker using the local bundled URL
      pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker
    }

    setTimeout(async () => {
      try {
        const loadingTask = pdfjsLib.getDocument(props.pdfUrl)
        const pdf = await loadingTask.promise
        const page = await pdf.getPage(1)
        
        const viewport = page.getViewport({ scale: 1.5 })
        const canvas = canvasRef.value
        if (!canvas) return
        
        const context = canvas.getContext('2d')
        canvas.height = viewport.height
        canvas.width = viewport.width
        
        const renderContext = { canvasContext: context, viewport: viewport }
        await page.render(renderContext).promise
        addWatermark(context, canvas.width, canvas.height)
      } catch (err) {
        console.error('PDF Render Error:', err)
      } finally {
        isLoading.value = false
      }
    }, 100)
    
  } catch (error) {
    console.error('Error loading PDF.js:', error)
    isLoading.value = false
  }
}

const addWatermark = (ctx, width, height) => {
  ctx.save()
  ctx.rotate(-Math.PI / 4)
  ctx.font = 'bold 24px JetBrains Mono'
  ctx.fillStyle = 'rgba(120, 120, 120, 0.15)'
  ctx.textAlign = 'center'
  const text = '仅供 PeiliangCai 求职展示 - 请勿传播'
  for (let i = -width; i < width * 2; i += 300) {
    for (let j = -height; j < height * 2; j += 100) {
      ctx.fillText(text, i, j)
    }
  }
  ctx.restore()
}

const closeModal = () => {
  isOpen.value = false
}

// Security: Disable right click and specific shortcuts
const handleGlobalEvents = (e) => {
  if (!isOpen.value) return

  // Disable right click
  if (e.type === 'contextmenu') e.preventDefault()
  
  // Disable Print (Ctrl+P) and Save (Ctrl+S)
  if (e.ctrlKey && (e.key === 'p' || e.key === 's')) {
    e.preventDefault()
    alert('为了版权保护，预览模式禁止打印和直接保存。')
  }
}

onMounted(() => {
  window.addEventListener('contextmenu', handleGlobalEvents)
  window.addEventListener('keydown', handleGlobalEvents)
})

onUnmounted(() => {
  window.removeEventListener('contextmenu', handleGlobalEvents)
  window.removeEventListener('keydown', handleGlobalEvents)
})
</script>

<template>
  <div class="cert-text-item" @click="openModal">
    <span class="cert-title">{{ title }}</span>
    <button class="view-icon-btn">
      <Eye :size="16" />
    </button>
  </div>

  <teleport to="body">
    <div v-if="isOpen" class="modal-overlay" @click.self="closeModal">
      <div class="modal-container glass animate-fade-in">
        <header class="modal-header">
          <h3>{{ title }} - 安全预览</h3>
          <button @click="closeModal" class="close-btn"><X :size="20" /></button>
        </header>
        
        <div class="canvas-wrapper">
          <div v-if="isLoading" class="loader-box">
             <div class="spinner"></div>
             <span>SECURE RENDERING...</span>
          </div>
          <canvas ref="canvasRef" class="pdf-canvas" v-show="!isLoading"></canvas>
          <div class="security-overlay"></div>
        </div>

        <footer class="modal-footer">
          <p class="warning-text">⚠️ 受到数字水印保护。已禁用打印、快捷保存与右键。</p>
        </footer>
      </div>
    </div>
  </teleport>
</template>

<style scoped>
.cert-text-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0;
  cursor: pointer;
  width: fit-content;
}

.cert-title {
  font-size: 1rem;
  color: var(--text-primary);
  border-bottom: 1px dashed var(--border-color);
  transition: all 0.3s;
}

.cert-text-item:hover .cert-title {
  color: var(--accent-primary);
  border-bottom-color: var(--accent-primary);
}

.view-icon-btn {
  color: var(--text-secondary);
  opacity: 0.6;
}

.cert-text-item:hover .view-icon-btn {
  opacity: 1;
  color: var(--accent-primary);
}

/* Modal and Loading styles same as before with refinements */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.9);
  z-index: 2000;
  display: flex;
  justify-content: center;
  align-items: center;
  backdrop-filter: blur(10px);
}

.modal-container {
  width: 90%;
  max-width: 800px;
  background: var(--bg-dark);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 0 40px rgba(0,0,0,0.5);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 2rem;
  border-bottom: 1px solid var(--border-color);
}

.loader-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  padding: 6rem;
  color: var(--accent-primary);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--border-color);
  border-top: 4px solid var(--accent-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin { 100% { transform: rotate(360deg); } }

.canvas-wrapper {
  position: relative;
  max-height: 70vh;
  overflow-y: auto;
  display: flex;
  justify-content: center;
  background: #000;
  padding: 1rem;
}

.pdf-canvas {
  max-width: 100%;
  height: auto;
  user-select: none;
  pointer-events: none; /* Block context menu and selection on canvas itself */
}

.security-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 10;
  pointer-events: none;
}

.modal-footer {
  padding: 0.75rem;
  background: rgba(0,0,0,0.5);
  text-align: center;
}

.warning-text {
  font-size: 0.7rem;
  color: var(--text-secondary);
  font-family: monospace;
}
</style>
