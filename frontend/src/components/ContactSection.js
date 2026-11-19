/**
 * Contact Section
 * Features .hero-heading gradient title, positioning copy,
 * signature ContactButton, and platform pill links.
 */

export function renderContactSection() {
  return `
    <section class="contact-section" id="contact">
      <div class="contact-container">
        <h2 class="contact-heading hero-heading">
          Let's connect
        </h2>

        <p class="contact-subtext">
          Available for commercial edits, narrative storytelling, viral short-form retention, and full post-production workflows.
        </p>

        <a href="mailto:sh4dabalam@gmail.com" class="contact-btn">
          Contact Me
        </a>

        <div class="social-links-grid">
          <a href="https://instagram.com/sh4dabexe" target="_blank" rel="noopener noreferrer" class="social-pill-link" title="Instagram Profile">
            <span>Instagram</span> ↗
          </a>
          <a href="https://t.me/sh4dabexe" target="_blank" rel="noopener noreferrer" class="social-pill-link" title="Telegram Profile">
            <span>Telegram</span> ↗
          </a>
          <a href="https://www.linkedin.com/in/sh4dabexe/" target="_blank" rel="noopener noreferrer" class="social-pill-link" title="LinkedIn Profile">
            <span>LinkedIn</span> ↗
          </a>
          <a href="https://github.com/sh4dabexe" target="_blank" rel="noopener noreferrer" class="social-pill-link" title="GitHub Profile">
            <span>GitHub</span> ↗
          </a>
          <a href="https://sh4dabexe.netlify.app/" target="_blank" rel="noopener noreferrer" class="social-pill-link" title="Developer & Tech Portfolio">
            <span>Tech Portfolio</span> ↗
          </a>
        </div>
      </div>
    </section>
  `;
}
