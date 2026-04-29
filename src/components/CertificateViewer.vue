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
const errorMessage = ref('')
let pdfjsLib = null

const openModal = async () => {
  isOpen.value = true
  isLoading.value = true
  errorMessage.value = ''
  
  const isImage = /\.(jpg|jpeg|png|webp|svg)$/i.test(props.pdfUrl)

  try {
    // Wait for DOM to render canvasRef
    await new Promise(r => setTimeout(r, 50))
    const ctx = canvasRef.value?.getContext('2d')
    if (!ctx) throw new Error('Canvas is not ready')

    if (isImage) {
      await renderImageToCanvas(ctx)
    } else {
      await renderPDF(ctx)
    }
    
    // Always add watermark after content is drawn
    addWatermark(ctx, canvasRef.value.width, canvasRef.value.height)
  } catch (error) {
    console.error('Error rendering certificate:', error)
    errorMessage.value = '证书资源加载失败，请确认文件存在于 public/certs 目录。'
  } finally {
    isLoading.value = false
  }
}

const renderImageToCanvas = (ctx) => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const canvas = canvasRef.value
      // Base scale on window width or original size
      const maxWidth = Math.min(window.innerWidth * 0.9, 800)
      const scale = maxWidth / img.width
      
      canvas.width = img.width * scale
      canvas.height = img.height * scale
      
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      resolve()
    }
    img.onerror = () => reject(new Error(`Image load failed: ${props.pdfUrl}`))
    img.src = props.pdfUrl
  })
}

const renderPDF = async (ctx) => {
  if (!pdfjsLib) {
    pdfjsLib = await import('pdfjs-dist')
    pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker
  }

  const loadingTask = pdfjsLib.getDocument(props.pdfUrl)
  const pdf = await loadingTask.promise
  const page = await pdf.getPage(1)
  
  const viewport = page.getViewport({ scale: 1.5 })
  const canvas = canvasRef.value
  
  canvas.height = viewport.height
  canvas.width = viewport.width
  
  const renderContext = { canvasContext: ctx, viewport: viewport }
  await page.render(renderContext).promise
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
          <h3>{{ title }} - 预览</h3>
          <button @click="closeModal" class="close-btn"><X :size="20" /></button>
        </header>
        
        <div class="canvas-wrapper">
          <div v-if="isLoading" class="loader-box">
             <div class="spinner"></div>
             <span>SECURE RENDERING...</span>
          </div>
          <div v-if="errorMessage && !isLoading" class="error-box">
            <strong>PREVIEW OFFLINE</strong>
            <span>{{ errorMessage }}</span>
          </div>
          <canvas ref="canvasRef" class="pdf-canvas" v-show="!isLoading && !errorMessage"></canvas>
          <div v-if="!errorMessage" class="security-overlay"></div>
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
  padding: 0.7rem 0.9rem;
  cursor: pointer;
  width: fit-content;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--glass-bg);
  transition: all 0.25s var(--transition-smooth);
}

.cert-title {
  font-size: 1rem;
  color: var(--text-primary);
  transition: all 0.3s;
}

.cert-text-item:hover {
  border-color: var(--accent-primary);
  box-shadow: var(--shadow-hot);
  transform: translateY(-2px);
}

.cert-text-item:hover .cert-title {
  color: var(--accent-primary);
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
  background: rgba(0, 0, 0, 0.88);
  z-index: 2000;
  display: flex;
  justify-content: center;
  align-items: center;
  backdrop-filter: blur(10px);
}

.modal-container {
  width: 90%;
  max-width: 800px;
  background: var(--bg-card-strong);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: var(--shadow-cyber);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 2rem;
  border-bottom: 1px solid var(--border-color);
}

.modal-header h3 {
  font-size: 0.95rem;
}

.close-btn {
  display: grid;
  place-items: center;
  width: 2rem;
  height: 2rem;
  color: var(--text-secondary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
}

.close-btn:hover {
  color: var(--danger-glow);
  border-color: var(--danger-glow);
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
  background:
    repeating-linear-gradient(90deg, rgba(0, 229, 255, 0.05), rgba(0, 229, 255, 0.05) 1px, transparent 1px, transparent 14px),
    var(--surface-media);
  padding: 1rem;
}

.error-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 4rem 2rem;
  text-align: center;
  color: var(--text-secondary);
}

.error-box strong {
  color: var(--danger-glow);
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  letter-spacing: 0.12em;
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
  background: rgba(0, 0, 0, 0.34);
  text-align: center;
}

.warning-text {
  font-size: 0.7rem;
  color: var(--text-secondary);
  font-family: monospace;
}
</style>
