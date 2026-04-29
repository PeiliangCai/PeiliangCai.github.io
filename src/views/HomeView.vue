<script setup>
import { Github, MapPin, Mail, Sparkles } from 'lucide-vue-next'
import CertificateViewer from '../components/CertificateViewer.vue'
import profileData from '../data/profile.json'
import siteData from '../data/site.json'
</script>

<template>
  <div class="home-container animate-fade-in">
    <!-- Hero with Avatar -->
    <header class="hero-section">
      <div class="hero-kicker geek-font">{{ siteData.pages.home.kicker }}</div>
      <div class="header-main">
        <div class="header-text">
          <h1 class="hero-title">
            <span class="hero-name-en">{{ profileData.name }}</span>
            <span v-if="profileData.nameCn" class="hero-name-cn">{{ profileData.nameCn }}</span>
          </h1>
          <p class="tagline geek-font">$ {{ profileData.tagline }}</p>
        </div>
        <div class="avatar-box glass">
          <img :src="siteData.avatarUrl" alt="Avatar" class="avatar-img" />
          <span class="avatar-status geek-font">ONLINE</span>
        </div>
      </div>
      
      <div class="bio-intro">
        <p v-for="(p, i) in profileData.intro" :key="i" class="intro-p" v-html="p"></p>
      </div>

      <div class="quick-contact">
        <span class="contact-item"><MapPin :size="14" /> {{ profileData.contact.location }}</span>
        <span class="contact-item"><Mail :size="14" /> {{ profileData.contact.email }}</span>
        <a :href="'https://' + profileData.contact.github" target="_blank" class="contact-item link">
          <Github :size="14" /> {{ profileData.contact.github }}
        </a>
      </div>
    </header>

    <!-- Vertical Layout Sections -->
    <div class="main-content-flow">
      <!-- 1. Education -->
      <section class="content-section">
        <h3 class="sub-heading"><Sparkles :size="14" /> Education</h3>
        <div class="vertical-list">
          <div v-for="edu in profileData.education" :key="edu.school" class="edu-card-v glass">
            <div class="edu-main">
              <div class="edu-primary">
                <span class="school-name">{{ edu.school }}</span>
                <span class="degree-name">{{ edu.degree }}</span>
              </div>
              <span class="period-v geek-font">{{ edu.period }}</span>
            </div>
            <p class="honors-v">{{ edu.honors }}</p>
          </div>
        </div>
      </section>

      <!-- 2. Certifications & Achievements -->
      <section v-if="profileData.certificates?.length || profileData.achievements?.length" class="content-section">
        <h3 class="sub-heading"><Sparkles :size="14" /> Certifications & Achievements</h3>
        
        <div class="certs-group">
          <!-- Certificates -->
          <div v-if="profileData.certificates?.length" class="certs-sub-group">
            <div class="group-label geek-font">CERTIFICATES</div>
            <div class="certs-list-v">
              <CertificateViewer 
                v-for="cert in profileData.certificates" 
                :key="cert.title" 
                :title="cert.title" 
                :pdfUrl="cert.url" 
              />
            </div>
          </div>

          <!-- Achievements -->
          <div v-if="profileData.achievements?.length" class="certs-sub-group">
            <div class="group-label geek-font">KEY ACHIEVEMENTS</div>
            <div class="achievements-list">
              <div v-for="ach in profileData.achievements" :key="ach.title" class="ach-item">
                <span class="ach-dot"></span>
                <span class="ach-text">{{ ach.title }}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 3. Hobbies -->
      <section v-if="profileData.hobbies?.length" class="content-section">
        <h3 class="sub-heading"><Sparkles :size="14" /> Hobbies & Interests</h3>
        <div class="hobbies-grid">
          <div v-for="hobby in profileData.hobbies" :key="hobby.title" class="hobby-card glass">
            <div class="hobby-header">
              <span class="hobby-icon">{{ hobby.icon }}</span>
              <h4 class="hobby-title">{{ hobby.title }}</h4>
            </div>
            <p class="hobby-desc">{{ hobby.desc }}</p>
            <div v-if="hobby.quote" class="hobby-quote">
              <span class="quote-mark">“</span>
              <p>{{ hobby.quote }}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.home-container {
  max-width: 1120px;
  margin: 0 auto;
  padding: 3.5rem 2rem 5rem;
}

.hero-section {
  position: relative;
  margin-bottom: 5.5rem;
  padding: clamp(2rem, 5vw, 4rem);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background:
    linear-gradient(135deg, rgba(0, 229, 255, 0.12), transparent 34%),
    linear-gradient(315deg, rgba(255, 61, 242, 0.1), transparent 32%),
    var(--surface-panel);
  box-shadow: var(--shadow-cyber);
  overflow: hidden;
}

.hero-section::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    linear-gradient(90deg, transparent, rgba(0, 229, 255, 0.18), transparent) 0 0 / 34% 1px no-repeat,
    repeating-linear-gradient(90deg, rgba(255, 255, 255, 0.035), rgba(255, 255, 255, 0.035) 1px, transparent 1px, transparent 18px);
  opacity: 0.4;
  pointer-events: none;
}

.hero-kicker {
  position: relative;
  margin-bottom: 1.25rem;
  color: var(--accent-secondary);
  font-size: 0.74rem;
  font-weight: 800;
  letter-spacing: 0.14em;
}

.header-main {
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 2rem;
  margin-bottom: 2rem;
}

.hero-title {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 0.75rem 1rem;
  font-size: clamp(3.2rem, 9vw, 3.2rem);
  font-weight: 950;
  line-height: 0.88;
  margin-bottom: 1rem;
  letter-spacing: 0;
  text-transform: uppercase;
  text-shadow: 0 0 28px rgba(0, 229, 255, 0.18);
}

.hero-name-cn {
  font-size: clamp(1.35rem, 4vw, 2.25rem);
  font-weight: 800;
  color: var(--text-muted);
  text-transform: none;
}

.tagline {
  color: var(--accent-secondary);
  font-size: clamp(0.82rem, 2vw, 1rem);
  letter-spacing: 0.04em;
  max-width: 620px;
}

.avatar-box {
  width: clamp(126px, 18vw, 170px);
  height: clamp(126px, 18vw, 170px);
  border-radius: 8px;
  padding: 10px;
  position: relative;
  flex-shrink: 0;
  transform: rotate(2deg);
}

.avatar-img {
  width: 100%;
  height: 100%;
  border-radius: 6px;
  object-fit: cover;
  background: var(--bg-dark);
  filter: saturate(1.15) contrast(1.05);
}

.avatar-status {
  position: absolute;
  right: 10px;
  bottom: 10px;
  padding: 0.22rem 0.42rem;
  color: var(--text-on-accent);
  background: var(--accent-secondary);
  border-radius: 3px;
  font-size: 0.62rem;
  font-weight: 900;
}

.bio-intro {
  position: relative;
  max-width: 880px;
  margin-bottom: 2rem;
}

.intro-p {
  font-size: clamp(1rem, 2vw, 1.14rem);
  line-height: 1.9;
  color: var(--text-secondary);
  margin-bottom: 1rem;
}

.quick-contact {
  position: relative;
  display: flex;
  gap: 0.75rem;
  font-size: 0.85rem;
  color: var(--text-secondary);
  flex-wrap: wrap;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.55rem 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--surface-control);
}

.contact-item.link:hover {
  color: var(--accent-primary);
  border-color: var(--accent-primary);
  box-shadow: var(--shadow-hot);
}

.main-content-flow {
  display: flex;
  flex-direction: column;
  gap: 4rem;
}

.sub-heading {
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  color: var(--accent-primary);
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.content-section {
  position: relative;
}

.content-section::before {
  content: '';
  position: absolute;
  top: 0.55rem;
  left: -1.35rem;
  width: 0.55rem;
  height: 0.55rem;
  background: var(--accent-primary);
  box-shadow: 0 0 18px var(--accent-primary);
  clip-path: polygon(50% 0, 100% 50%, 50% 100%, 0 50%);
}

.edu-card-v {
  padding: 1.5rem;
  margin-bottom: 1rem;
  transition: transform 0.3s var(--transition-smooth), border-color 0.3s var(--transition-smooth);
}

.edu-card-v:hover {
  transform: translateY(-4px);
  border-color: var(--border-hot);
}

.edu-main {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.75rem;
}

.edu-primary {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.school-name {
  font-size: 1.2rem;
  font-weight: 800;
  color: var(--text-primary);
}

.degree-name {
  font-weight: 500;
  color: var(--text-secondary);
}

.period-v {
  font-size: 0.8rem;
  color: var(--text-on-accent);
  background: var(--accent-secondary);
  padding: 0.25rem 0.55rem;
  border-radius: 4px;
  font-weight: 900;
}

.honors-v {
  font-size: 0.9rem;
  color: var(--accent-primary);
  font-weight: 600;
}

.certs-group {
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
}

.certs-sub-group {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.group-label {
  font-size: 0.75rem;
  color: var(--text-secondary);
  opacity: 0.6;
}

.achievements-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.ach-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.ach-dot {
  width: 6px;
  height: 6px;
  background: var(--accent-primary);
  border-radius: 50%;
  box-shadow: 0 0 8px var(--accent-primary);
}

.ach-text {
  font-size: 0.95rem;
  color: var(--text-primary);
}

.hobbies-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
}

.hobby-card {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  transition: all 0.3s var(--transition-smooth);
  min-height: 230px;
}

.hobby-card:hover {
  transform: translateY(-6px) skewX(-0.5deg);
  border-color: var(--accent-tertiary);
  box-shadow: 0 22px 70px rgba(255, 61, 242, 0.12);
}

.hobby-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.hobby-icon {
  display: grid;
  place-items: center;
  width: 2.4rem;
  height: 2.4rem;
  font-size: 1.35rem;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: rgba(0, 229, 255, 0.06);
}

.hobby-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text-primary);
}

.hobby-desc {
  font-size: 0.9rem;
  color: var(--text-secondary);
  line-height: 1.6;
}

.hobby-quote {
  margin-top: auto;
  padding: 0.75rem 1rem;
  background: rgba(0, 229, 255, 0.06);
  border-left: 2px solid var(--accent-primary);
  position: relative;
  font-style: italic;
}

.quote-mark {
  position: absolute;
  top: 0;
  left: -1.5rem;
  font-size: 2.5rem;
  opacity: 0.1;
  line-height: 1;
  font-family: serif;
}

.hobby-quote p {
  font-size: 0.85rem;
  color: var(--accent-primary);
  position: relative;
  z-index: 1;
}

@media (max-width: 700px) {
  .hobbies-grid {
    grid-template-columns: 1fr;
  }
}

.certs-list-v {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

@media (max-width: 600px) {
  .header-main {
    flex-direction: column-reverse;
    align-items: flex-start;
    gap: 2rem;
  }
  .hero-section {
    padding: 1.5rem;
  }
  .edu-main { flex-direction: column; gap: 1rem; }
}
</style>
