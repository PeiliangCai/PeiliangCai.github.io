<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { Eye, X, Download, Printer } from 'lucide-vue-next'
import * as pdfjsLib from 'pdfjs-dist'

// Worker setup for PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`

const props = defineProps({
  title: String,
  pdfUrl: String
})

const isOpen = ref(false)
const canvasRef = ref(null)
const isLoading = ref(false)

const openModal = async () => {
  isOpen.value = true
  isLoading.value = true
  
  // Wait for canvas to be in DOM
  setTimeout(async () => {
    try {
      const loadingTask = pdfjsLib.getDocument(props.pdfUrl)
      const pdf = await loadingTask.promise
      const page = await pdf.getPage(1)
      
      const viewport = page.getViewport({ scale: 1.5 })
      const canvas = canvasRef.value
      const context = canvas.getContext('2d')
      
      canvas.height = viewport.height
      canvas.width = viewport.width
      
      const renderContext = {
        canvasContext: context,
        viewport: viewport
      }
      
      await page.render(renderContext).promise
      
      // Add Watermark
      addWatermark(context, canvas.width, canvas.height)
      
    } catch (error) {
      console.error('Error rendering PDF:', error)
    } finally {
      isLoading.value = false
    }
  }, 100)
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

// Anti-theft: Disable right click inside modal
const handleContextMenu = (e) => {
  if (isOpen.value) {
    e.preventDefault()
  }
}

onMounted(() => {
  window.addEventListener('contextmenu', handleContextMenu)
})

onUnmounted(() => {
  window.removeEventListener('contextmenu', handleContextMenu)
})
</script>

<template>
  <div class="cert-item glass" @click="openModal">
    <div class="cert-info">
      <span class="cert-icon">🎓</span>
      <span class="cert-title">{{ title }}</span>
    </div>
    <button class="view-btn">
      <Eye :size="18" />
    </button>
  </div>

  <teleport to="body">
    <div v-if="isOpen" class="modal-overlay" @click.self="closeModal">
      <div class="modal-container glass animate-fade-in">
        <header class="modal-header">
          <h3>{{ title }} - 预览模式</h3>
          <button @click="closeModal" class="close-btn"><X :size="20" /></button>
        </header>
        
        <div class="canvas-wrapper" @contextmenu.prevent>
          <div v-if="isLoading" class="loader">渲染中...</div>
          <canvas ref="canvasRef" class="pdf-canvas"></canvas>
          <!-- Pointer events none overlay for extra security -->
          <div class="security-overlay"></div>
        </div>

        <footer class="modal-footer">
          <p class="warning-text">⚠️ 该展示已由 Canvas 渲染为图片，并受到数字水印保护。已禁用打印与右键。</p>
        </footer>
      </div>
    </div>
  </teleport>
</template>

<style scoped>
.cert-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  margin-bottom: 1rem;
  cursor: pointer;
  transition: all 0.3s var(--transition-smooth);
}

.cert-item:hover {
  border-color: var(--accent-primary);
  transform: translateX(10px);
}

.cert-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.cert-icon {
  font-size: 1.5rem;
}

.cert-title {
  font-weight: 500;
  color: var(--text-primary);
}

.view-btn {
  color: var(--text-secondary);
  transition: color 0.3s;
}

.cert-item:hover .view-btn {
  color: var(--accent-primary);
}

/* Modal */
.modal-container {
  width: 90%;
  max-width: 800px;
  background: var(--bg-dark);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--border-color);
}

.canvas-wrapper {
  position: relative;
  max-height: 70vh;
  overflow-y: auto;
  display: flex;
  justify-content: center;
  background: #1e1e1e;
  padding: 2rem;
}

.pdf-canvas {
  max-width: 100%;
  height: auto;
  user-select: none;
  -webkit-user-drag: none;
}

.security-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 10;
}

.modal-footer {
  padding: 1rem;
  background: rgba(0, 0, 0, 0.3);
  text-align: center;
}

.warning-text {
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.loader {
  color: var(--accent-primary);
  font-weight: bold;
}

.close-btn {
  color: var(--text-secondary);
  transition: color 0.3s;
}

.close-btn:hover {
  color: #ff4757;
}
</style>
