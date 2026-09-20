import { getPlaybackSource } from '../services/playbackAdapter.js';

let activeTriggerElement = null;
let currentSource = null;
let isFallbackMode = false;

export function renderVideoModal() {
  return `
    <div class="video-modal-backdrop" id="video-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="modal-project-title" aria-hidden="true">
      <div class="video-modal-container" id="video-modal-container">
        <button class="modal-close-btn" id="modal-close-btn" aria-label="Close video player">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        <div class="modal-video-wrapper" id="modal-player-slot">
          <!-- Video element dynamically injected -->
        </div>

        <div class="modal-details">
          <div class="modal-meta-row">
            <span class="card-category-badge" id="modal-category">Cinematic</span>
            <span id="modal-meta-info">1080p • Color Graded</span>
          </div>
          <h2 class="modal-title" id="modal-project-title">Project Title</h2>
          <p class="modal-desc" id="modal-project-desc">Project Description</p>
          
          <div class="modal-footer-row">
            <div id="modal-tags-container" style="display: flex; gap: 8px; flex-wrap: wrap;"></div>
            <button class="modal-source-toggle" id="modal-toggle-source-btn">
              Switch to Embedded Player
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}

export function openVideoModal(project, triggerElement) {
  activeTriggerElement = triggerElement;
  isFallbackMode = false;

  const backdrop = document.getElementById('video-modal-backdrop');
  const slot = document.getElementById('modal-player-slot');
  const titleEl = document.getElementById('modal-project-title');
  const descEl = document.getElementById('modal-project-desc');
  const categoryEl = document.getElementById('modal-category');
  const metaEl = document.getElementById('modal-meta-info');
  const tagsContainer = document.getElementById('modal-tags-container');
  const toggleBtn = document.getElementById('modal-toggle-source-btn');

  if (!backdrop || !slot) return;

  // Resolve playback source via adapter
  currentSource = getPlaybackSource(project);

  titleEl.textContent = currentSource.title || 'Untitled Project';
  descEl.textContent = currentSource.description || 'Cinematic video edit by Shadab Alam.';
  categoryEl.textContent = currentSource.category || 'Cinematic';
  metaEl.textContent = currentSource.mimeType || 'video/mp4';

  // Populate tags
  tagsContainer.innerHTML = (currentSource.tags || [])
    .map(t => `<span class="card-tag">#${t}</span>`)
    .join(' ');

  // Inject video player
  loadPlayer(false);

  // Configure switch toggle button
  if (toggleBtn) {
    toggleBtn.textContent = 'Switch to Embedded Preview';
    toggleBtn.onclick = () => {
      isFallbackMode = !isFallbackMode;
      toggleBtn.textContent = isFallbackMode ? 'Switch to Direct HTML5 Stream' : 'Switch to Embedded Preview';
      loadPlayer(isFallbackMode);
    };
  }

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

function loadPlayer(useEmbed) {
  const slot = document.getElementById('modal-player-slot');
  if (!slot || !currentSource) return;

  slot.innerHTML = '';

  if (useEmbed && currentSource.fallbackEmbedUrl) {
    const iframe = document.createElement('iframe');
    iframe.src = currentSource.fallbackEmbedUrl;
    iframe.allow = 'autoplay; fullscreen';
    iframe.allowFullscreen = true;
    iframe.title = currentSource.title;
    slot.appendChild(iframe);
  } else {
    const video = document.createElement('video');
    video.id = 'active-modal-video';
    video.controls = true;
    video.playsInline = true;
    video.autoplay = true;
    video.poster = currentSource.poster;
    video.preload = 'auto';

    const source = document.createElement('source');
    source.src = currentSource.src;
    source.type = currentSource.mimeType || 'video/mp4';
    video.appendChild(source);

    // If direct download stream fails (e.g., due to Google Drive virus-scan prompt on large files), auto fallback to embed
    video.onerror = () => {
      console.warn('Direct stream had playback issue, falling back to embedded player...');
      loadPlayer(true);
      const toggleBtn = document.getElementById('modal-toggle-source-btn');
      if (toggleBtn) toggleBtn.textContent = 'Switch to Direct HTML5 Stream';
    };

    slot.appendChild(video);
    video.play().catch(() => {
      // Autoplay with sound might be blocked by browser policy until interaction
      video.muted = true;
      video.play().catch(e => console.log('Autoplay muted handled:', e));
    });
  }
}

export function closeVideoModal() {
  const backdrop = document.getElementById('video-modal-backdrop');
  const slot = document.getElementById('modal-player-slot');

  if (!backdrop) return;

  // Release video resources
  if (slot) {
    const video = slot.querySelector('video');
    if (video) {
      video.pause();
      video.src = '';
      video.load();
    }
    slot.innerHTML = '';
  }

  // Restore scroll
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

  // Close when clicking on backdrop outside the modal container
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
