import { openVideoModal } from './VideoModal.js';
import { triggerSync } from '../services/api.js';

let currentFilter = 'All';
let allProjects = [];

export function renderWorkSection() {
  return `
    <section class="work-section" id="work">
      <div class="container">
        <div class="section-header">
          <div class="section-title-wrap">
            <span class="section-eyebrow">Selected Works</span>
            <h2 class="section-title">Projects & Visual Stories</h2>
          </div>

          <div style="display: flex; align-items: center; gap: 14px; flex-wrap: wrap;">
            <div class="filter-bar" id="category-filter-bar">
              <button class="filter-btn active" data-category="All">All</button>
              <button class="filter-btn" data-category="Cinematic">Cinematic</button>
              <button class="filter-btn" data-category="Commercial">Commercial</button>
              <button class="filter-btn" data-category="Reels & Shorts">Reels & Shorts</button>
              <button class="filter-btn" data-category="Music Video">Music Video</button>
            </div>

            <button class="btn-secondary" id="sync-refresh-btn" style="padding: 6px 14px; font-size: 0.8rem;" title="Sync new videos directly from Google Drive">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
              </svg>
              <span>Sync Drive</span>
            </button>
          </div>
        </div>

        <div class="work-grid" id="work-grid-container" aria-live="polite">
          <div class="skeleton-card"></div>
          <div class="skeleton-card"></div>
          <div class="skeleton-card"></div>
        </div>
      </div>
    </section>
  `;
}

function formatFileSize(bytes) {
  if (!bytes) return '';
  const mb = bytes / (1024 * 1024);
  return `${mb.toFixed(1)} MB`;
}

function renderCard(project) {
  const thumbnail = project.thumbnail_url || `https://drive.google.com/thumbnail?id=${project.drive_file_id}&sz=w1200`;
  const tagsHtml = (project.tags || [])
    .slice(0, 3)
    .map(t => `<span class="card-tag">#${t}</span>`)
    .join(' ');

  const card = document.createElement('article');
  card.className = 'project-card';
  card.setAttribute('tabindex', '0');
  card.setAttribute('role', 'button');
  card.setAttribute('aria-label', `Play video: ${project.title}`);
  card.dataset.id = project.id || project.drive_file_id;

  card.innerHTML = `
    <div class="card-media">
      <img
        src="${thumbnail}"
        alt="Thumbnail for ${project.title}"
        class="card-thumbnail"
        loading="lazy"
        onerror="this.src='data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22640%22 height=%22360%22 viewBox=%220 0 640 360%22><rect width=%22100%25%22 height=%22100%25%22 fill=%22%23161616%22/><text x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 fill=%22%23666%22 font-family=%22sans-serif%22 font-size=%2220%22>Video Preview</text></svg>'"
      />
      <div class="card-play-overlay">
        <div class="play-badge" aria-hidden="true">
          <svg viewBox="0 0 24 24">
            <polygon points="5 3 19 12 5 21 5 3"></polygon>
          </svg>
        </div>
      </div>
    </div>
    <div class="card-info">
      <div class="card-meta-row">
        <div style="display: flex; align-items: center; gap: 6px;">
          <span class="card-category-badge">${project.category || 'Cinematic'}</span>
          <span class="card-category-badge" style="font-size: 0.72rem; opacity: 0.85;">${project.is_vertical ? '9:16 Reel' : '16:9 Cinema'}</span>
        </div>
        <span>${formatFileSize(project.file_size)}</span>
      </div>
      <h3 class="card-title">${project.title}</h3>
      ${tagsHtml ? `<div class="card-tags">${tagsHtml}</div>` : ''}
    </div>
  `;

  // Open modal on click or Enter / Space keypress
  const openAction = () => openVideoModal(project, card);
  card.addEventListener('click', openAction);
  card.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openAction();
    }
  });

  return card;
}

export function updateWorkGrid(projects) {
  allProjects = projects || [];
  const container = document.getElementById('work-grid-container');
  if (!container) return;

  container.innerHTML = '';

  const filtered = currentFilter === 'All'
    ? allProjects
    : allProjects.filter(p => p.category === currentFilter);

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 64px 20px; color: var(--text-muted);">
        <p style="font-size: 1.1rem; margin-bottom: 8px;">No projects found in this category.</p>
        <p style="font-size: 0.9rem; color: var(--text-dim);">New videos will automatically appear here when uploaded to Google Drive.</p>
      </div>
    `;
    return;
  }

  filtered.forEach(project => {
    container.appendChild(renderCard(project));
  });
}

export function initWorkGridEvents(onRefreshNeeded) {
  // Category filter handlers
  const filterButtons = document.querySelectorAll('.filter-btn');
  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.dataset.category || 'All';
      updateWorkGrid(allProjects);
    });
  });

  // Sync button handler
  const syncBtn = document.getElementById('sync-refresh-btn');
  if (syncBtn) {
    syncBtn.addEventListener('click', async () => {
      syncBtn.disabled = true;
      syncBtn.innerHTML = `
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation: spin 1s linear infinite;">
          <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
        </svg>
        <span>Syncing...</span>
      `;
      showSyncToast('Scanning Google Drive for updates...');

      try {
        const result = await triggerSync();
        const freshProjects = (result && result.projects && result.projects.length > 0)
          ? result.projects
          : (onRefreshNeeded ? await onRefreshNeeded() : []);

        if (freshProjects && freshProjects.length > 0) {
          updateWorkGrid(freshProjects);
        } else if (onRefreshNeeded) {
          await onRefreshNeeded();
        }

        showSyncToast(`Drive sync completed! Found ${freshProjects?.length || 0} videos.`);
      } catch (err) {
        showSyncToast('Sync error: ' + err.message);
      } finally {
        syncBtn.disabled = false;
        syncBtn.innerHTML = `
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
          </svg>
          <span>Sync Drive</span>
        `;
      }
    });
  }
}

function showSyncToast(msg) {
  let toast = document.getElementById('sync-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'sync-toast';
    toast.className = 'sync-toast';
    document.body.appendChild(toast);
  }
  toast.innerHTML = `
    <span class="logo-dot"></span>
    <span>${msg}</span>
  `;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 4000);
}
