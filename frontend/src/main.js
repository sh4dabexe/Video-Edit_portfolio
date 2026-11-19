import './styles/main.css';
import { renderHero, initHeroMagnet } from './components/Hero.js';
import { renderMarqueeSection, initMarqueeScroll } from './components/MarqueeSection.js';
import { renderAboutSection, initAboutScrollEvents } from './components/AboutSection.js';
import { renderServicesSection } from './components/ServicesSection.js';
import { renderWorkSection, initWorkGridEvents, updateWorkGrid } from './components/WorkGrid.js';
import { renderContactSection } from './components/ContactSection.js';
import { renderFooter } from './components/Footer.js';
import { renderVideoModal, initVideoModalEvents } from './components/VideoModal.js';
import { fetchProjects } from './services/api.js';

// Pre-load cached projects for instant initial paint
import cachedProjects from './data/projects-cache.json';

async function initApp() {
  const app = document.getElementById('app');
  if (!app) return;

  // Assemble Main Page according to section order in prompt:
  // 1. HeroSection
  // 2. MarqueeSection
  // 3. AboutSection
  // 4. ServicesSection
  // 5. ProjectsSection (Stacking Spotlight + 50 GDrive Videos)
  // 6. ContactSection
  // 7. Footer
  // 8. VideoModal
  app.innerHTML = `
    <div class="main-wrapper">
      ${renderHero()}
      ${renderMarqueeSection()}
      ${renderAboutSection()}
      ${renderServicesSection()}
      ${renderWorkSection()}
      ${renderContactSection()}
      ${renderFooter()}
      ${renderVideoModal()}
    </div>
  `;

  // Initialize Interactive Effects
  initHeroMagnet();
  initMarqueeScroll();
  initAboutScrollEvents();
  initVideoModalEvents();

  // Instant render with cached data if present
  if (Array.isArray(cachedProjects) && cachedProjects.length > 0) {
    updateWorkGrid(cachedProjects);
  }

  // Define data fetch & refresh handler
  const loadData = async (forceRefresh = false) => {
    try {
      const projects = await fetchProjects(forceRefresh);
      if (projects && projects.length > 0) {
        updateWorkGrid(projects);
      }
    } catch (err) {
      console.warn('Portfolio load check:', err.message);
    }
  };

  initWorkGridEvents(() => loadData(true));

  // Automatically fetch latest live projects on page load
  await loadData(true);

  // Background Automatic Sync: Periodically poll every 15s
  setInterval(() => {
    loadData(true);
  }, 15000);
}

document.addEventListener('DOMContentLoaded', initApp);
