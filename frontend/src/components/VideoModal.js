import { getPlaybackSource } from '../services/playbackAdapter.js';

let activeTriggerElement = null;
let currentSource = null;
let isPortraitMode = false;

export function renderVideoModal() {
  return `
    <div class="video-modal-backdrop" id="video-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="modal-project-title" aria-hidden="true">
      <div class="video-modal-container portrait" id="video-modal-container">
        <button class="modal-close-btn" id="modal-close-btn" aria-label="Close video player" title="Close (Esc)">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        <div class="modal-video-wrapper" id="modal-player-slot">
          <!-- Player injected here -->
        </div>

        <div class="modal-details">
          <div class="modal-meta-row">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span class="card-category-badge" id="modal-category">Reels & Shorts</span>
              <span id="modal-meta-info" style="font-size: 0.78rem; color: var(--text-dim);">1080p • Color Graded</span>
            </div>
            <button class="modal-aspect-toggle" id="modal-ratio-toggle" title="Toggle aspect ratio view">
              📐 9:16 Fit
            </button>
          </div>

          <h2 class="modal-title" id="modal-project-title">Project Title</h2>
          <p class="modal-desc" id="modal-project-desc">Project Description</p>
          
          <div class="modal-footer-row">
            <div id="modal-tags-container" style="display: flex; gap: 6px; flex-wrap: wrap;"></div>
            <a href="#" id="modal-gdrive-link" target="_blank" rel="noopener noreferrer" class="modal-aspect-toggle" title="Open source file directly">
              <span>Drive Source ↗</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  `;
}

export function openVideoModal(project, triggerElement) {
  activeTriggerElement = triggerElement;

  const backdrop = document.getElementById('video-modal-backdrop');
  const container = document.getElementById('video-modal-container');
  const slot = document.getElementById('modal-player-slot');
  const titleEl = document.getElementById('modal-project-title');
  const descEl = document.getElementById('modal-project-desc');
  const categoryEl = document.getElementById('modal-category');
  const metaEl = document.getElementById('modal-meta-info');
  const tagsContainer = document.getElementById('modal-tags-container');
  const ratioBtn = document.getElementById('modal-ratio-toggle');
  const driveLink = document.getElementById('modal-gdrive-link');

  if (!backdrop || !slot || !container) return;

  // Resolve playback source via adapter
  currentSource = getPlaybackSource(project);

  titleEl.textContent = currentSource.title || 'Untitled Project';
  descEl.textContent = currentSource.description || 'Cinematic video edit by Shadab Alam.';
  categoryEl.textContent = currentSource.category || 'Cinematic';
  metaEl.textContent = currentSource.mimeType || 'video/mp4';

  if (driveLink) {
    driveLink.href = currentSource.fallbackEmbedUrl || `https://drive.google.com/file/d/${currentSource.id}/view`;
  }

  // Populate tags
  tagsContainer.innerHTML = (currentSource.tags || [])
    .map(t => `<span class="card-tag">#${t}</span>`)
    .join(' ');

  // Detect Aspect Ratio:
  // 1. Check thumbnail natural dimensions from card image
  const cardImg = triggerElement?.querySelector('.card-thumbnail');
  isPortraitMode = false;

  if (cardImg && cardImg.naturalHeight && cardImg.naturalWidth) {
    isPortraitMode = cardImg.naturalHeight > cardImg.naturalWidth;
  } else if (
    project.category === 'Reels & Shorts' ||
    project.is_vertical ||
    (project.drive_name && project.drive_name.toLowerCase().includes('tum')) // Barisho me Tum is 720x1280
  ) {
    isPortraitMode = true;
  }

  applyAspectMode(isPortraitMode);

  // Configure Aspect Toggle Button
  if (ratioBtn) {
    ratioBtn.onclick = () => {
      isPortraitMode = !isPortraitMode;
      applyAspectMode(isPortraitMode);
    };
  }

  // Load the video player (Google Drive official embed preview ensures 100% reliable streaming on all browsers)
  loadPlayer();

  // Show modal & lock background scroll
  backdrop.classList.add('active');
  backdrop.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';

  // Focus close button for accessibility
  setTimeout(() => {
    const closeBtn = document.getElementById('modal-close-btn');
    if (closeBtn) closeBtn.focus();
  }, 100);
}

function applyAspectMode(isPortrait) {
  const container = document.getElementById('video-modal-container');
  const ratioBtn = document.getElementById('modal-ratio-toggle');
  if (!container) return;

  if (isPortrait) {
    container.classList.add('portrait');
    container.classList.remove('landscape');
    if (ratioBtn) ratioBtn.textContent = '📐 9:16 (Reel)';
  } else {
    container.classList.add('landscape');
    container.classList.remove('portrait');
    if (ratioBtn) ratioBtn.textContent = '📐 16:9 (Cinema)';
  }
}

function loadPlayer() {
  const slot = document.getElementById('modal-player-slot');
  if (!slot || !currentSource) return;

  slot.innerHTML = '';

  // Google Drive preview embed iframe: streams in full HD, supports scrubbing,
  // volume, fullscreen, and is cross-origin compliant with zero Range request errors!
  const embedUrl = currentSource.fallbackEmbedUrl || `https://drive.google.com/file/d/${currentSource.id}/preview`;

  const iframe = document.createElement('iframe');
  iframe.src = embedUrl;
  iframe.allow = 'autoplay; fullscreen';
  iframe.allowFullscreen = true;
  iframe.title = currentSource.title;
  iframe.setAttribute('loading', 'eager');
  iframe.style.width = '100%';
  iframe.style.height = '100%';
  iframe.style.border = 'none';
  iframe.style.background = '#000000';

  slot.appendChild(iframe);
}

export function closeVideoModal() {
  const backdrop = document.getElementById('video-modal-backdrop');
  const slot = document.getElementById('modal-player-slot');

  if (!backdrop) return;

  // Release video/iframe resources cleanly
  if (slot) {
    slot.innerHTML = '';
  }

  // Restore body scroll
  document.body.style.overflow = '';
  backdrop.classList.remove('active');
  backdrop.setAttribute('aria-hidden', 'true');

  // Restore focus to original card
  if (activeTriggerElement && typeof activeTriggerElement.focus === 'function') {
    activeTriggerElement.focus();
    activeTriggerElement = null;
  }
}

export function initVideoModalEvents() {
  const backdrop = document.getElementById('video-modal-backdrop');
  const closeBtn = document.getElementById('modal-close-btn');

  if (closeBtn) {
    closeBtn.addEventListener('click', closeVideoModal);
  }

  // Close when clicking on dark backdrop outside container
  if (backdrop) {
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) {
        closeVideoModal();
      }
    });
  }

  // Escape key closes modal
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && backdrop && backdrop.classList.contains('active')) {
      closeVideoModal();
    }
  });
}
