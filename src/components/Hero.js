export function renderHero() {
  return `
    <section class="hero-section" id="top">
      <div class="container">
        <div class="hero-content">
          <div class="hero-label">
            <span class="hero-status-pulse"></span>
            <span>Available for Select Creative Projects & Commercials</span>
          </div>

          <h1 class="hero-headline">
            Sculpting emotion through <span class="serif-italic">rhythm,</span> cut & <span class="serif-italic">cinematic</span> vision.
          </h1>

          <p class="hero-description">
            Hi, I’m <strong>Shadab Alam</strong> — a video editor and creative technologist specializing in narrative pacing, immersive sound design, and color grading that leaves a lasting impression.
          </p>

          <div class="hero-actions">
            <a href="#work" class="btn-primary" id="hero-view-work-btn">
              <span>View Selected Work</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <polyline points="19 12 12 19 5 12"></polyline>
              </svg>
            </a>

            <a href="https://sh4dabexe.netlify.app/" target="_blank" rel="noopener noreferrer" class="btn-secondary" id="hero-tech-portfolio-btn">
              <span>Explore Tech Portfolio</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="7" y1="17" x2="17" y2="7"></line>
                <polyline points="7 7 17 7 17 17"></polyline>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </section>
  `;
}
