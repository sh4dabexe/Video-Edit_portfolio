import './styles/main.css';
import { renderHeader, initHeaderEvents } from './components/Header.js';
import { renderHero } from './components/Hero.js';
import { renderWorkSection, initWorkGridEvents, updateWorkGrid } from './components/WorkGrid.js';
import { renderAboutSection } from './components/AboutSection.js';
import { renderContactSection } from './components/ContactSection.js';
import { renderFooter } from './components/Footer.js';
import { renderVideoModal, initVideoModalEvents } from './components/VideoModal.js';
import { fetchProjects } from './services/api.js';

// Pre-load cached projects if available for instant paint
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
  const loadData = async () => {
    try {
      const projects = await fetchProjects();
      if (projects && projects.length > 0) {
        updateWorkGrid(projects);
      }
    } catch (err) {
      console.error('Failed to load portfolio projects:', err);
    }
  };

  initWorkGridEvents(loadData);

  // Fetch latest projects in background
  await loadData();
}

document.addEventListener('DOMContentLoaded', initApp);
