/**
 * Portfolio Footer
 */

export function renderFooter() {
  const currentYear = new Date().getFullYear();

  return `
    <footer class="portfolio-footer">
      <div class="footer-inner">
        <div>
          <span style="font-weight: 700; color: var(--text-highlight);">Shadab Alam</span>
          <span style="opacity: 0.6; margin-left: 8px;">— Video Editor & Creative Technologist</span>
        </div>

        <div>
          <a href="#hero" style="color: var(--text-highlight); text-transform: uppercase; font-size: 0.8rem; letter-spacing: 0.1em; opacity: 0.8;">
            Back to Top ↑
          </a>
        </div>

        <div style="font-size: 0.78rem; opacity: 0.6;">
          © ${currentYear} Shadab Alam. All rights reserved.
        </div>
      </div>
    </footer>
  `;
}
