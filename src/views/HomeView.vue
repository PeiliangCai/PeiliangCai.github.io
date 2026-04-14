<script setup>
import { Github, ExternalLink, GraduationCap, MapPin, Mail, Calendar } from 'lucide-vue-next'
import CertificateViewer from '../components/CertificateViewer.vue'

const certs = [
  { title: '🎓 CCF 大模型能力认证 (LMCC) 三级 (88分)', url: 'https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf' },
  { title: '🏆 全国大学生数学建模竞赛 省级一等奖', url: '#' },
  { title: '📄 英语六级证书 (CET-6)', url: '#' }
]

const education = [
  { school: '某某大学', degree: '计算机科学与技术 (本科)', period: '2021 - 2025', honors: '国家奖学金, GPA 3.9/4.0' }
]
</script>

<template>
  <div class="home-container animate-fade-in">
    <section class="bio-section">
      <div class="bio-header">
        <h1 class="hero-title">Peiliang Cai<span>.</span></h1>
        <p class="tagline geek-font">> Focus on Agentic RAG & Modern Frontend</p>
      </div>

      <div class="bio-grid">
        <div class="bio-text">
          <p class="intro-p">
            你好，我是<b>蔡培梁</b>。一名对底层技术和极客文化充满热忱的本科生。目前我的研究中心围绕着<strong>智能体搜索 (Agentic Search)</strong> 与 <strong>高性能前端架构</strong>。
          </p>
          <p class="intro-p">
            我喜欢在复杂的业务逻辑中抽象出优雅的系统架构，并不断探索 AI 原生应用在 Web 端生产力工具中的落地可能。
          </p>
          
          <div class="education-info">
            <h3 class="sub-heading">Education</h3>
            <div v-for="edu in education" :key="edu.school" class="edu-card glass">
              <div class="edu-top">
                <span class="school">{{ edu.school }}</span>
                <span class="period">{{ edu.period }}</span>
              </div>
              <p class="degree">{{ edu.degree }}</p>
              <p class="honors">{{ edu.honors }}</p>
            </div>
          </div>
        </div>

        <div class="bio-sidebar">
          <div class="contact-card glass">
            <h3 class="sub-heading">Contact & Social</h3>
            <ul class="contact-list">
              <li><MapPin :size="16" /> 上海, 中国</li>
              <li><Mail :size="16" /> example@email.com</li>
              <li>
                <a href="https://github.com/PeiliangCai" target="_blank" class="link-item">
                  <Github :size="16" /> github.com/PeiliangCai
                </a>
              </li>
            </ul>
          </div>

          <div class="certs-area">
            <h3 class="sub-heading">Certifications</h3>
            <div class="certs-list">
              <CertificateViewer 
                v-for="cert in certs" 
                :key="cert.title" 
                :title="cert.title" 
                :pdfUrl="cert.url" 
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.home-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 4rem 2rem;
}

.hero-title {
  font-size: 3.5rem;
  font-weight: 800;
  margin-bottom: 0.5rem;
}

.hero-title span { color: var(--accent-primary); }

.tagline {
  color: var(--accent-secondary);
  font-size: 1rem;
  margin-bottom: 4rem;
}

.bio-grid {
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 4rem;
}

.intro-p {
  font-size: 1.15rem;
  line-height: 1.8;
  color: var(--text-secondary);
  margin-bottom: 2rem;
}

.sub-heading {
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--accent-primary);
  margin-bottom: 1.5rem;
  font-weight: 800;
}

.edu-card {
  padding: 1.5rem;
}

.edu-top {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.school {
  font-weight: 700;
  font-size: 1.1rem;
}

.period {
  font-size: 0.85rem;
  color: var(--accent-secondary);
}

.degree {
  font-weight: 500;
  margin-bottom: 0.25rem;
}

.honors {
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.contact-card {
  padding: 1.5rem;
  margin-bottom: 3rem;
}

.contact-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  font-size: 0.95rem;
}

.contact-list li {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: var(--text-secondary);
}

.link-item {
  color: var(--accent-primary);
  font-weight: 600;
}

.link-item:hover { text-decoration: underline; }

.certs-area {
  margin-top: 1rem;
}

.certs-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

@media (max-width: 850px) {
  .bio-grid { grid-template-columns: 1fr; }
  .hero-title { font-size: 2.5rem; }
}
</style>
