<script setup>
import { Github, ExternalLink, Code2, BrainCircuit, GraduationCap } from 'lucide-vue-next'
import CertificateViewer from '../components/CertificateViewer.vue'

const certs = [
  { title: '🎓 CCF 大模型能力认证 (LMCC) 三级 (88分)', url: 'https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf' },
  { title: '🏆 全国大学生数学建模竞赛 省级一等奖', url: '#' }
]
</script>

<template>
  <div class="home-container animate-fade-in">
    <!-- Hero Section -->
    <section class="hero">
      <div class="hero-content">
        <div class="status-badge geek-font">
          <span class="pulse-small"></span> SYSTEM.READY
        </div>
        <h1 class="hero-title">
          Hello, I'm <span class="highlight">Peiliang Cai</span>
        </h1>
        <p class="hero-subtitle">
          聚焦 <span class="tag">Agentic RAG</span> 与 <span class="tag">现代前端架构</span>。
          致力于通过深度工程实践探索 AI 原生应用的最优路径。
        </p>

        <!-- Stats Grid -->
        <div class="stats-grid">
          <div class="stat-item glass">
            <GraduationCap class="stat-icon" :size="24" />
            <div class="stat-text">
              <span class="stat-val">3.9/4.0</span>
              <span class="stat-label">Total GPA</span>
            </div>
          </div>
          <div class="stat-item glass">
            <span class="geek-font math-tag">MATH</span>
            <div class="stat-text">
              <span class="stat-val">99</span>
              <span class="stat-label">Advanced Math / Linear Algebra</span>
            </div>
          </div>
        </div>

        <div class="social-links">
          <a href="https://github.com/PeiliangCai" target="_blank" class="social-btn glass">
            <Github :size="20" /> GitHub
          </a>
          <a href="#portfolio" class="social-btn glass accent">
            View Projects <ExternalLink :size="16" />
          </a>
        </div>
      </div>
      
      <div class="hero-visual">
        <!-- Geeky abstract visual placeholder or decor -->
        <div class="visual-blob"></div>
      </div>
    </section>

    <!-- Certifications Section -->
    <section class="certs-section">
      <h2 class="section-title">Certifications<span>.</span></h2>
      <div class="certs-list">
        <CertificateViewer 
          v-for="cert in certs" 
          :key="cert.title" 
          :title="cert.title" 
          :pdfUrl="cert.url" 
        />
      </div>
    </section>
  </div>
</template>

<style scoped>
.home-container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 2rem;
}

.hero {
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: 4rem;
  align-items: center;
  min-height: 70vh;
  margin-bottom: 6rem;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 0.8rem;
  background: rgba(16, 185, 129, 0.1);
  color: var(--accent-secondary);
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 700;
  margin-bottom: 2rem;
}

.pulse-small {
  width: 6px;
  height: 6px;
  background: var(--accent-secondary);
  border-radius: 50%;
  animation: pulse-small 2s infinite;
}

@keyframes pulse-small {
  0% { transform: scale(1); opacity: 0.5; }
  50% { transform: scale(1.5); opacity: 1; }
  100% { transform: scale(1); opacity: 0.5; }
}

.hero-title {
  font-size: 4rem;
  font-weight: 800;
  line-height: 1.1;
  margin-bottom: 1.5rem;
}

.highlight {
  color: var(--accent-primary);
  text-shadow: 0 0 30px rgba(99, 102, 241, 0.3);
}

.hero-subtitle {
  font-size: 1.25rem;
  color: var(--text-secondary);
  max-width: 600px;
  margin-bottom: 3rem;
}

.tag {
  color: var(--text-primary);
  background: var(--border-color);
  padding: 0.1rem 0.5rem;
  border-radius: 4px;
  font-family: monospace;
}

.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  padding: 1.25rem;
}

.stat-icon {
  color: var(--accent-primary);
}

.math-tag {
  background: var(--accent-secondary);
  color: #000;
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  font-weight: 900;
  font-size: 0.7rem;
}

.stat-val {
  display: block;
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--text-primary);
}

.stat-label {
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.social-links {
  display: flex;
  gap: 1.5rem;
}

.social-btn {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.8rem 1.5rem;
  font-weight: 600;
  transition: all 0.3s;
}

.social-btn:hover {
  transform: translateY(-3px);
  border-color: var(--accent-primary);
}

.social-btn.accent {
  background: var(--accent-primary);
  color: white;
  border: none;
}

.hero-visual {
  position: relative;
  display: flex;
  justify-content: center;
}

.visual-blob {
  width: 300px;
  height: 300px;
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
  filter: blur(80px);
  opacity: 0.2;
  border-radius: 50%;
  animation: blob-float 10s infinite linear;
}

@keyframes blob-float {
  0% { transform: scale(1) translate(0, 0); }
  33% { transform: scale(1.1) translate(20px, -30px); }
  66% { transform: scale(0.9) translate(-20px, 10px); }
  100% { transform: scale(1) translate(0, 0); }
}

@media (max-width: 900px) {
  .hero {
    grid-template-columns: 1fr;
    text-align: center;
  }
  .hero-subtitle {
    margin-inline: auto;
  }
  .stats-grid {
    grid-template-columns: 1fr;
  }
  .social-links {
    justify-content: center;
  }
  .hero-title {
    font-size: 2.5rem;
  }
}
</style>
