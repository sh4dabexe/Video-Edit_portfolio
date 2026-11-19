export function renderFooter() {
  const year = new Date().getFullYear();
  return `
    <footer class="site-footer">
      <div class="container footer-inner">
        <div class="footer-credits">
          <strong>Shadab Alam</strong> — Video Editor • Creative Technologist
        </div>

        <ul class="footer-links">
          <li><a href="#top">Video Portfolio</a></li>
          <li><a href="https://sh4dabexe.netlify.app/" target="_blank" rel="noopener noreferrer">Tech Portfolio</a></li>
          <li><a href="https://instagram.com/sh4dabexe" target="_blank" rel="noopener noreferrer">Instagram</a></li>
          <li><a href="https://t.me/sh4dabexe" target="_blank" rel="noopener noreferrer">Telegram</a></li>
          <li><a href="https://www.linkedin.com/in/sh4dabexe/" target="_blank" rel="noopener noreferrer">LinkedIn</a></li>
          <li><a href="https://github.com/sh4dabexe" target="_blank" rel="noopener noreferrer">GitHub</a></li>
        </ul>
      </div>
    </footer>
  `;
}
