/**
 * Hero Section
 * Massive .hero-heading gradient H1, Magnet mouse-following portrait,
 * horizontal navbar, and prompt-specified bottom bar with ContactButton.
 */

export function renderHero() {
  return `
    <section class="hero-section" id="hero">
      <!-- Horizontal Navbar -->
      <nav class="hero-navbar" aria-label="Main Navigation">
        <div class="nav-links-row">
          <a href="#hero" class="nav-brand-text" title="Shadab Alam — Video Editor">
            Shadab Alam
          </a>

          <div class="nav-links-group">
            <a href="#about" class="nav-item-link">About</a>
            <a href="#services" class="nav-item-link">Services</a>
            <a href="#projects" class="nav-item-link">Projects</a>
            <a href="#contact" class="nav-item-link">Contact</a>
            <a href="https://sh4dabexe.netlify.app/" target="_blank" rel="noopener noreferrer" class="nav-item-link nav-badge-pill" title="View Developer / Tech Portfolio">
              Tech Portfolio ↗
            </a>
          </div>
        </div>
      </nav>

      <!-- Massive Hero Heading -->
      <div class="hero-heading-wrap">
        <h1 class="hero-main-title hero-heading">
          Hi, i&apos;m shadab
        </h1>
      </div>

      <!-- Centered Portrait Stage with Magnet Effect -->
      <div class="hero-portrait-stage" id="hero-magnet-portrait">
        <img
          src="https://shrug-person-78902957.figma.site/_components/v2/d24c01ad3a56fc65e942a1f501eb73db42d7cf9a/Rectangle_40443.81459862.png"
          alt="Shadab Alam — Video Editor & Creative Technologist"
          class="hero-portrait-img"
          loading="eager"
        />
      </div>

      <!-- Bottom Bar -->
      <div class="hero-bottom-bar">
        <p class="hero-bottom-text">
          a video editor driven by crafting striking and unforgettable visual projects
        </p>

        <a href="#contact" class="contact-btn" id="hero-contact-cta">
          Contact Me
        </a>
      </div>
    </section>
  `;
}

/**
 * Initializes the Magnet mouse-following effect on the hero portrait
 * Tracks mouse position relative to element center, applies translate3d transform
 * with smooth active transition and smooth decay on exit.
 */
export function initHeroMagnet() {
  const portraitStage = document.getElementById('hero-magnet-portrait');
  const heroSection = document.getElementById('hero');
  if (!portraitStage || !heroSection) return;

  const strength = 18; // Magnet movement factor
  const padding = 150; // Distance threshold around portrait

  let isHovered = false;
  let rafId = null;

  const onMouseMove = (e) => {
    const rect = portraitStage.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const dx = e.clientX - centerX;
    const dy = e.clientY - centerY;
    const dist = Math.hypot(dx, dy);

    const maxDist = Math.max(rect.width, rect.height) / 2 + padding;

    if (dist < maxDist) {
      isHovered = true;
      const moveX = (dx / maxDist) * strength;
      const moveY = (dy / maxDist) * strength;

      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        portraitStage.style.transition = 'transform 0.3s ease-out';
        portraitStage.style.transform = `translateX(calc(-50% + ${moveX.toFixed(2)}px)) translateY(${moveY.toFixed(2)}px)`;
      });
    } else if (isHovered) {
      isHovered = false;
      portraitStage.style.transition = 'transform 0.6s ease-in-out';
      portraitStage.style.transform = 'translateX(-50%) translateY(0px)';
    }
  };

  const onMouseLeave = () => {
    isHovered = false;
    portraitStage.style.transition = 'transform 0.6s ease-in-out';
    portraitStage.style.transform = 'translateX(-50%) translateY(0px)';
  };

  heroSection.addEventListener('mousemove', onMouseMove, { passive: true });
  heroSection.addEventListener('mouseleave', onMouseLeave);
}
