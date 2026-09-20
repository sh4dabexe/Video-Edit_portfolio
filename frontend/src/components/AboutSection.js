export function renderAboutSection() {
  return `
    <section class="about-section" id="about">
      <div class="container">
        <div class="about-grid">
          <div class="about-bio">
            <span class="section-eyebrow">Creative Philosophy</span>
            <h2 class="about-headline">
              Great editing isn’t just cutting footage — it’s <span class="serif-italic">orchestrating</span> how the audience feels.
            </h2>
            <div style="margin-top: 12px;">
              <a href="#contact" class="btn-primary" style="padding: 10px 22px; font-size: 0.9rem;">
                <span>Let’s Collaborate</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </a>
            </div>
          </div>

          <div class="about-bio">
            <p class="about-text">
              I’m <strong>Shadab Alam</strong>, a video editor and creative technologist based in India. I bridge the gap between creative visual storytelling and technological precision. Every project begins with finding the emotional heartbeat of the story — selecting takes, structuring tempo, designing multi-layered soundscapes, and sculpting colors that draw viewers into the scene.
            </p>
            <p class="about-text">
              Whether cutting high-energy short-form reels that stop the scroll, narrative commercial pieces, or cinematic visual reels, my focus is always on storytelling clarity, intentional pacing, and polished finishing.
            </p>

            <div style="margin-top: 16px;">
              <h4 style="font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--text-muted); margin-bottom: 12px;">
                Editing Toolkit & Specializations
              </h4>
              <div class="skills-list">
                <span class="skill-pill">Premiere Pro</span>
                <span class="skill-pill">DaVinci Resolve Studio</span>
                <span class="skill-pill">After Effects</span>
                <span class="skill-pill">Cinematic Color Grading</span>
                <span class="skill-pill">Immersive Sound Design</span>
                <span class="skill-pill">Pacing & Visual Rhythm</span>
                <span class="skill-pill">Kinetic Typography</span>
                <span class="skill-pill">CapCut Pro</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `;
}
