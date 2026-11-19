import './styles/main.css';
import { renderHeader, initHeaderEvents } from './components/Header.js';
import { renderHero } from './components/Hero.js';
import { renderWorkSection, initWorkGridEvents, updateWorkGrid } from './components/WorkGrid.js';
import { renderAboutSection } from './components/AboutSection.js';
import { renderContactSection } from './components/ContactSection.js';
import { renderFooter } from './components/Footer.js';
import { renderVideoModal, initVideoModalEvents } from './components/VideoModal.js';
import { fetchProjects } from './services/api.js';

// Pre-load cached projects if available for instant initial paint
import cachedProjects from './data/projects-cache.json';

async function initApp() {
  const app = document.getElementById('app');
  if (!app) return;

  // Assemble Main Page
  app.innerHTML = `
    ${renderHeader()}
    <main>
      ${renderHero()}
      ${renderWorkSection()}
      ${renderAboutSection()}
      ${renderContactSection()}
    </main>
    ${renderFooter()}
    ${renderVideoModal()}
  `;

  // Initialize Component Interactions
  initHeaderEvents();
  initVideoModalEvents();

  // Instant render with cached data if present
  if (Array.isArray(cachedProjects) && cachedProjects.length > 0) {
    updateWorkGrid(cachedProjects);
  }

  // Define refresh logic
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

  // Background Automatic Sync: Periodically poll for new Google Drive video uploads every 10s
  setInterval(() => {
    loadData(true);
  }, 10000);
}

document.addEventListener('DOMContentLoaded', initApp);
