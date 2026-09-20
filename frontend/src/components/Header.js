export function renderHeader() {
  const headerHtml = `
    <header class="site-header" id="site-header">
      <div class="container header-inner">
        <a href="#top" class="logo" aria-label="Shadab Alam Portfolio Home">
          <span class="logo-dot"></span>
          <span>Shadab Alam</span>
        </a>

        <nav class="nav-desktop" aria-label="Main Navigation">
          <ul class="nav-links">
            <li><a href="#work" class="nav-link">Work</a></li>
            <li><a href="#about" class="nav-link">About</a></li>
            <li><a href="#contact" class="nav-link">Contact</a></li>
          </ul>
          <a href="https://sh4dabexe.netlify.app/" target="_blank" rel="noopener noreferrer" class="header-cta-pill" title="View Developer Portfolio">
            <span>Tech Portfolio</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="7" y1="17" x2="17" y2="7"></line>
              <polyline points="7 7 17 7 17 17"></polyline>
            </svg>
          </a>
        </nav>

        <button class="burger-btn" id="burger-btn" aria-label="Toggle navigation menu" aria-expanded="false">
          <span class="burger-line"></span>
          <span class="burger-line"></span>
        </button>
      </div>
    </header>

    <div class="mobile-menu" id="mobile-menu" aria-hidden="true">
      <ul class="mobile-nav-links">
        <li><a href="#work" class="mobile-nav-link">Work</a></li>
        <li><a href="#about" class="mobile-nav-link">About</a></li>
        <li><a href="#contact" class="mobile-nav-link">Contact</a></li>
      </ul>
      <a href="https://sh4dabexe.netlify.app/" target="_blank" rel="noopener noreferrer" class="btn-primary" style="margin-top: 16px;">
        <span>View Tech Portfolio</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="7" y1="17" x2="17" y2="7"></line>
          <polyline points="7 7 17 7 17 17"></polyline>
        </svg>
      </a>
    </div>
  `;

  return headerHtml;
}

export function initHeaderEvents() {
  const burger = document.getElementById('burger-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  if (!burger || !mobileMenu) return;

  const toggleMenu = (open) => {
    const isOpen = open !== undefined ? open : !burger.classList.contains('open');
    burger.classList.toggle('open', isOpen);
    mobileMenu.classList.toggle('open', isOpen);
    burger.setAttribute('aria-expanded', String(isOpen));
    mobileMenu.setAttribute('aria-hidden', String(!isOpen));
    document.body.style.overflow = isOpen ? 'hidden' : '';
  };

  burger.addEventListener('click', () => toggleMenu());

  mobileMenu.querySelectorAll('.mobile-nav-link, a').forEach(link => {
    link.addEventListener('click', () => toggleMenu(false));
  });

  // Header background shade on scroll
  const header = document.getElementById('site-header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header.style.background = 'rgba(0, 0, 0, 0.85)';
      header.style.borderBottomColor = 'rgba(255, 255, 255, 0.16)';
    } else {
      header.style.background = 'rgba(0, 0, 0, 0.7)';
      header.style.borderBottomColor = 'rgba(255, 255, 255, 0.12)';
    }
  }, { passive: true });
}
