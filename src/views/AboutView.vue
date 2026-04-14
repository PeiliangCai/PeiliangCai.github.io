<script setup>
import { GraduationCap, Book, Award, Microscope, Mail, Github, Twitter } from 'lucide-vue-next'
</script>

<template>
  <div class="about-view">
    <header class="about-header section">
      <h1 class="title">关于我<span>.</span></h1>
      <p class="subtitle">追逐技术前沿，探索学术深海。</p>
    </header>

    <div class="about-grid">
      <section class="bio-section glass-effect">
        <div class="section-title">
          <User :size="20" />
          <h2>个人简介</h2>
        </div>
        <p>
          你好！我是一名计算机科学专业的本科生，目前专注于前端技术栈与人工智能领域的交叉探索。我热爱通过代码解决现实问题，并对复杂的系统设计充满好奇。
        </p>
        <p>
          在学术上，我保持着对前沿论文的追踪，并积极参与实验室的科研工作。我的目标是未来能够深入研究系统架构或智能交互领域。
        </p>
      </section>

      <section class="research-section glass-effect">
        <div class="section-title">
          <Microscope :size="20" />
          <h2>科研与项目 (Research)</h2>
        </div>
        <div class="research-list">
          <div class="research-item">
            <div class="research-header">
              <h3>基于深度学习的图像风格迁移系统</h3>
              <span class="date">2023 - 2024</span>
            </div>
            <p>作为核心成员参与导师实验室项目，负责前端展示界面的开发与模型接口的对接，优化了实时交互的响应速度。</p>
          </div>
          <div class="research-item">
            <div class="research-header">
              <h3>分布式系统中的共识算法优化探索</h3>
              <span class="date">2023 至今</span>
            </div>
            <p>研究 Raft 算法在特定弱网络环境下的表现，并尝试通过消息压缩机制减少同步延迟。</p>
          </div>
        </div>
      </section>

      <section class="academic-section glass-effect">
        <div class="section-title">
          <GraduationCap :size="20" />
          <h2>教育背景</h2>
        </div>
        <div class="edu-item">
          <div class="edu-header">
            <h3>某某大学 - 本科</h3>
            <span>2021 - 2025</span>
          </div>
          <p>计算机科学与技术 · GPA: 3.9/4.0 (Top 5%)</p>
          <ul class="edu-achievements">
            <li>国家奖学金 (2023)</li>
            <li>数学建模竞赛省级一等奖</li>
            <li>程序设计竞赛杰出奖</li>
          </ul>
        </div>
      </section>

      <section class="skills-section glass-effect">
        <div class="section-title">
          <Book :size="20" />
          <h2>技能图谱</h2>
        </div>
        <div class="skills-content">
          <div class="skill-group">
            <label>Frontend</label>
            <div class="tags">
              <span>Vue 3</span><span>React</span><span>TypeScript</span><span>Vite</span>
            </div>
          </div>
          <div class="skill-group">
            <label>Backend & Research</label>
            <div class="tags">
              <span>Python</span><span>Node.js</span><span>PyTorch</span><span>Docker</span>
            </div>
          </div>
        </div>
      </section>
    </div>

    <section class="contact-section section">
      <h2>联系我</h2>
      <div class="contact-links">
        <a href="mailto:example@email.com" class="contact-card glass-effect">
          <Mail :size="24" />
          <span>Email</span>
        </a>
        <a href="https://github.com" target="_blank" class="contact-card glass-effect">
          <Github :size="24" />
          <span>GitHub</span>
        </a>
        <a href="#" class="contact-card glass-effect">
          <Twitter :size="24" />
          <span>Twitter</span>
        </a>
      </div>
    </section>
  </div>
</template>

<style scoped>
.about-view {
  padding-bottom: 4rem;
}

.title {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.title span {
  color: var(--accent-color);
}

.subtitle {
  font-size: 1.25rem;
  color: var(--text-secondary);
}

.about-grid {
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 2rem;
  margin-top: 3rem;
}

.glass-effect {
  padding: 2.5rem;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: var(--accent-color);
  margin-bottom: 2rem;
}

.section-title h2 {
  font-size: 1.25rem;
  color: var(--text-primary);
}

.bio-section p {
  margin-bottom: 1.5rem;
  color: var(--text-secondary);
}

.research-list {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.research-item h3 {
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
}

.research-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.5rem;
}

.date {
  font-size: 0.8rem;
  color: var(--accent-color);
  font-weight: 600;
}

.research-item p {
  font-size: 0.95rem;
  color: var(--text-secondary);
}

.edu-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.edu-achievements {
  margin-top: 1rem;
  padding-left: 1.25rem;
  color: var(--text-secondary);
  font-size: 0.95rem;
}

.edu-achievements li {
  margin-bottom: 0.5rem;
}

.skill-group {
  margin-bottom: 1.5rem;
}

.skill-group label {
  display: block;
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--text-secondary);
  margin-bottom: 1rem;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.tags span {
  padding: 0.4rem 0.8rem;
  background: var(--border-color);
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 500;
}

.contact-section h2 {
  margin-bottom: 2.5rem;
  text-align: center;
}

.contact-links {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
}

.contact-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 2rem;
  transition: all var(--transition-speed);
}

.contact-card:hover {
  transform: translateY(-5px);
  border-color: var(--accent-color);
  color: var(--accent-color);
}

@media (max-width: 900px) {
  .about-grid {
    grid-template-columns: 1fr;
  }
  .contact-links {
    grid-template-columns: 1fr;
  }
}
</style>
