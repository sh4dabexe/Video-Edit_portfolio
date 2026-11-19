/**
 * Projects Section & Work Grid
 * Incorporates:
 * 1. 3 Sticky-Stacking Featured Project Cards with CloudFront imagery,
 *    live project buttons, and scroll scale calculations from prompt.
 * 2. Full 50-video Google Drive live synced archive with filter tabs,
 *    aspect ratio indicators (9:16 Reel vs 16:9 Cinema), and VideoModal player.
 */

import { openVideoModal } from './VideoModal.js';
import { triggerSync } from '../services/api.js';

let currentFilter = 'All';
let allProjects = [];

const FEATURED_SPOTLIGHTS = [
  {
    num: '01',
    category: 'Commercial / Narrative',
    name: 'Nextlevel Studio',
    col1Top: 'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260412_055344_5eff02e0-87a5-41ce-b64f-eb08da8f33db.png&w=1280&q=85',
    col1Bottom: 'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260412_055431_11d841fd-8b41-46a5-82e4-b04f2407a7d8.png&w=1280&q=85',
    col2: 'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260412_055451_e317bf2d-28d4-48cc-86b0-6f72f25b6327.png&w=1280&q=85',
    driveId: '1lwk1uzMh7lnv_FN_e-6OGdidpv5bleAm' // 2 Ecell DJ NSUT ESUMMIT
  },
  {
    num: '02',
    category: 'Personal / Cinematic Cut',
    name: 'Aura Brand Identity',
    col1Top: 'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260412_055654_911201c5-36d9-4bc6-bac7-331adfce159f.png&w=1280&q=85',
    col1Bottom: 'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260412_055723_5ceda0b8-d9c2-4665-b2e3-83ba19ba76d1.png&w=1280&q=85',
    col2: 'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260412_055753_adc5dcbd-a8e6-49c0-b43a-9b030d835cea.png&w=1280&q=85',
    driveId: '1Hk28W_db5hA1oDSgWdVJRzU7GvQfyvYI' // 5 Ecell Shark Tank
  },
  {
    num: '03',
    category: 'Client / Reel Showcase',
    name: 'Solaris Digital',
    col1Top: 'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260412_055759_963cfb0b-4bd1-4b0f-9d0a-09bd6cf95b2f.png&w=1280&q=85',
    col1Bottom: 'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260412_060108_438f781a-9846-4dcc-89ab-c4e6cb830f5b.png&w=1280&q=85',
    col2: 'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260412_055818_9d062121-ad7e-46b9-999a-1a6a692ef1ee.png&w=1280&q=85',
    driveId: '1T9NwlhN-k2yKGcOAuiZBzFlS8OQhNL7g' // 1 Her
  }
];

export function renderWorkSection() {
  const spotlightCardsHtml = FEATURED_SPOTLIGHTS.map((card, idx) => `
    <div class="stack-card-wrapper" style="top: ${90 + idx * 28}px; z-index: ${idx + 1};">
      <div class="stack-project-card" data-spotlight-idx="${idx}">
        <div class="card-top-row">
          <div class="card-header-left">
            <span class="card-num">${card.num}</span>
            <div class="card-title-group">
              <span class="card-category-label">${card.category}</span>
              <h3 class="card-project-name">${card.name}</h3>
            </div>
          </div>

          <button class="live-project-btn spotlight-play-btn" data-drive-id="${card.driveId}" title="Play featured edit">
            Live Project
          </button>
        </div>

        <div class="card-media-grid">
          <div class="col-left-stack">
            <div class="col-image-wrap img-left-top">
              <img src="${card.col1Top}" alt="${card.name} preview 1" loading="lazy" />
            </div>
            <div class="col-image-wrap img-left-bottom">
              <img src="${card.col1Bottom}" alt="${card.name} preview 2" loading="lazy" />
            </div>
          </div>
          <div class="col-image-wrap col-right-tall">
            <img src="${card.col2}" alt="${card.name} hero preview" loading="lazy" />
          </div>
        </div>
      </div>
    </div>
  `).join('');

  return `
    <section class="projects-section" id="projects">
      <!-- Section Title -->
      <div class="projects-header-block">
        <h2 class="projects-main-heading hero-heading">
          Project
        </h2>
      </div>

      <!-- 3 Sticky-Stacking Spotlight Cards -->
      <div class="sticky-stack-container" id="spotlight-stack">
        ${spotlightCardsHtml}
      </div>

      <!-- Full Google Drive Live Archive -->
      <div class="container drive-archive-section" id="archive">
        <div class="drive-archive-header">
          <div class="drive-section-title-wrap">
            <span class="drive-eyebrow">Google Drive Sync Archive</span>
            <h3 class="drive-title">All Video Works (<span id="total-count-badge">50</span>)</h3>
          </div>

          <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
            <div class="drive-filter-bar" id="category-filter-bar">
              <button class="filter-btn active" data-category="All">All</button>
              <button class="filter-btn" data-category="Cinematic">Cinematic</button>
              <button class="filter-btn" data-category="Commercial">Commercial</button>
              <button class="filter-btn" data-category="Reels & Shorts">Reels & Shorts</button>
              <button class="filter-btn" data-category="Music Video">Music Video</button>
            </div>

            <button class="sync-action-btn" id="sync-refresh-btn" title="Sync newest video uploads from Google Drive">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
              </svg>
              <span>Sync Drive</span>
            </button>
          </div>
        </div>

        <!-- 50 Videos Grid -->
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
  card.className = `project-card ${project.is_vertical ? 'is-vertical-card' : ''}`;
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
        onerror="this.src='data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22640%22 height=%22360%22 viewBox=%220 0 640 360%22><rect width=%22100%25%22 height=%22100%25%22 fill=%22%23121212%22/><text x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 fill=%22%23888%22 font-family=%22sans-serif%22 font-size=%2218%22>Video Preview</text></svg>'"
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
          <span class="card-category-badge" style="opacity: 0.75;">${project.is_vertical ? '9:16 Reel' : '16:9 Cinema'}</span>
        </div>
        <span>${formatFileSize(project.file_size)}</span>
      </div>
      <h3 class="card-title">${project.title}</h3>
      ${tagsHtml ? `<div class="card-tags">${tagsHtml}</div>` : ''}
    </div>
  `;

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
  // Always strictly preserve Google Drive sort order
  allProjects = (projects || []).slice().sort((a, b) => {
    const oA = typeof a.sort_order === 'number' ? a.sort_order : 999999;
    const oB = typeof b.sort_order === 'number' ? b.sort_order : 999999;
    return oA - oB;
  });

  const countBadge = document.getElementById('total-count-badge');
  if (countBadge) {
    countBadge.textContent = allProjects.length;
  }

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
  // Filter tabs
  const filterButtons = document.querySelectorAll('#category-filter-bar .filter-btn');
  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.dataset.category || 'All';
      updateWorkGrid(allProjects);
    });
  });

  // Spotlight Play buttons
  const spotlightButtons = document.querySelectorAll('.spotlight-play-btn');
  spotlightButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const driveId = btn.dataset.driveId;
      const targetProject = allProjects.find(p => p.drive_file_id === driveId || p.id === driveId) || {
        id: driveId,
        drive_file_id: driveId,
        title: btn.closest('.stack-project-card')?.querySelector('.card-project-name')?.textContent || 'Featured Project',
        category: 'Cinematic',
        is_vertical: false,
        aspect_ratio: '16:9'
      };
      openVideoModal(targetProject, btn);
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
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
            <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
          </svg>
          <span>Sync Drive</span>
        `;
      }
    });
  }

  // Sticky Card Stacking Scale Effect on Scroll
  initStickyCardStack();
}

/**
 * Implements the prompt's scale calculation:
 * targetScale = 1 - (totalCards - 1 - index) * 0.03
 */
function initStickyCardStack() {
  const cards = document.querySelectorAll('.stack-project-card');
  if (!cards.length) return;

  const total = cards.length;

  const onScroll = () => {
    cards.forEach((card, idx) => {
      const parent = card.parentElement;
      const rect = parent.getBoundingClientRect();
      const topOffset = 90 + idx * 28;

      if (rect.top <= topOffset + 10) {
        // Scrolled past sticky top point, apply scale reduction
        const targetScale = 1 - (total - 1 - idx) * 0.03;
        card.style.transform = `scale(${targetScale})`;
      } else {
        card.style.transform = 'scale(1)';
      }
    });
  };

  window.addEventListener('scroll', onScroll, { passive: true });
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
