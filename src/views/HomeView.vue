<script setup>
import { Github, MapPin, Mail, Sparkles } from 'lucide-vue-next'
import CertificateViewer from '../components/CertificateViewer.vue'
import profileData from '../data/profile.json'

// Avatar handling - assumes asset exists or shows placeholder
const avatarUrl = 'https://api.dicebear.com/7.x/avataaars/svg?seed=Peiliang&backgroundColor=6366f1'
</script>

<template>
  <div class="home-container animate-fade-in">
    <!-- Hero with Avatar -->
    <header class="hero-section">
      <div class="header-main">
        <div class="header-text">
          <h1 class="hero-title">{{ profileData.name }}<span>.</span></h1>
          <p class="tagline geek-font">> {{ profileData.tagline }}</p>
        </div>
        <div class="avatar-box glass">
          <img :src="avatarUrl" alt="Avatar" class="avatar-img" />
          <div class="avatar-status"></div>
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

      <!-- 2. Certifications & Awards -->
      <section class="content-section">
        <h3 class="sub-heading"><Sparkles :size="14" /> Certifications & Achievements</h3>
        
        <div class="certs-group">
          <!-- Certificates -->
          <div class="group-label geek-font">CERTIFICATES</div>
          <div class="certs-list-v">
            <CertificateViewer 
              v-for="cert in profileData.certificates" 
              :key="cert.title" 
              :title="cert.title" 
              :pdfUrl="cert.url" 
            />
          </div>

          <!-- Divider -->
          <div class="divider-dashed"></div>

          <!-- Awards -->
          <div class="group-label geek-font">AWARDS & SCHOLARSHIPS</div>
          <div class="certs-list-v">
            <CertificateViewer 
              v-for="award in profileData.awards" 
              :key="award.title" 
              :title="award.title" 
              :pdfUrl="award.url" 
            />
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.home-container {
  max-width: 850px;
  margin: 0 auto;
  padding: 4rem 2rem;
}

.hero-section {
  margin-bottom: 5rem;
}

.header-main {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2.5rem;
}

.hero-title {
  font-size: 3.5rem;
  font-weight: 800;
  margin-bottom: 0.25rem;
}

.hero-title span { color: var(--accent-primary); }

.tagline {
  color: var(--accent-secondary);
  font-size: 0.95rem;
}

/* Avatar Styling */
.avatar-box {
  width: 120px;
  height: 120px;
  border-radius: 24px;
  padding: 8px;
  position: relative;
  flex-shrink: 0;
}

.avatar-img {
  width: 100%;
  height: 100%;
  border-radius: 18px;
  object-fit: cover;
  background: var(--bg-dark);
}

.avatar-status {
  position: absolute;
  bottom: 4px;
  right: 4px;
  width: 12px;
  height: 12px;
  background: var(--accent-secondary);
  border: 2px solid var(--bg-dark);
  border-radius: 50%;
  box-shadow: 0 0 10px var(--accent-secondary);
}

.bio-intro {
  margin-bottom: 2rem;
}

.intro-p {
  font-size: 1.1rem;
  line-height: 1.8;
  color: var(--text-secondary);
  margin-bottom: 1rem;
}

.quick-contact {
  display: flex;
  gap: 2rem;
  font-size: 0.85rem;
  color: var(--text-secondary);
  flex-wrap: wrap;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.contact-item.link:hover {
  color: var(--accent-primary);
  text-decoration: underline;
}

/* Vertical Flow Layout */
.main-content-flow {
  display: flex;
  flex-direction: column;
  gap: 5rem;
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

.edu-card-v {
  padding: 1.75rem;
  margin-bottom: 1rem;
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
  color: var(--accent-secondary);
  background: rgba(16, 185, 129, 0.05);
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
}

.honors-v {
  font-size: 0.9rem;
  color: var(--accent-primary);
  font-weight: 600;
}

/* Certs & Awards Grouping */
.certs-group {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.group-label {
  font-size: 0.75rem;
  color: var(--text-secondary);
  opacity: 0.6;
}

.divider-dashed {
  margin: 1.5rem 0;
  border-top: 1px dashed var(--border-color);
  width: 100%;
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
  .hero-title { font-size: 2.5rem; }
  .edu-main { flex-direction: column; gap: 1rem; }
}
</style>
