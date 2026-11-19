/**
 * About Section
 * Full-viewport centered section with four corner 3D decorative assets,
 * .hero-heading "About me", scroll-driven character-by-character opacity reveal,
 * and ContactButton.
 */

const ABOUT_TEXT = "With more than five years of experience in video editing and storytelling, I focus on narrative pacing, atmospheric color grading, and immersive sound design. I truly enjoy working with creators and brands that aim to stand out and present their best visual identity. Let's build something incredible together!";

export function renderAboutSection() {
  // Wrap each character into a span for scroll-driven character opacity reveal
  const charactersHtml = ABOUT_TEXT.split('').map((char, i) => {
    return `<span class="char-span" data-char-index="${i}">${char}</span>`;
  }).join('');

  return `
    <section class="about-section" id="about">
      <!-- 4 Decorative 3D Elements in Corners -->
      <img
        src="https://shrug-person-78902957.figma.site/_components/v2/ebb2b8f25d8e24d5f0a5ca8af4c950de81aa2fd7/moon_icon.11395d36.png"
        alt="Moon 3D Decorative Icon"
        class="about-deco about-deco-top-left"
        id="about-deco-1"
        loading="lazy"
      />
      <img
        src="https://shrug-person-78902957.figma.site/_components/v2/ebb2b8f25d8e24d5f0a5ca8af4c950de81aa2fd7/p59_1.4659672e.png"
        alt="Geometric 3D Object"
        class="about-deco about-deco-bottom-left"
        id="about-deco-2"
        loading="lazy"
      />
      <img
        src="https://shrug-person-78902957.figma.site/_components/v2/ebb2b8f25d8e24d5f0a5ca8af4c950de81aa2fd7/lego_icon-1.703bb594.png"
        alt="Lego 3D Decorative Icon"
        class="about-deco about-deco-top-right"
        id="about-deco-3"
        loading="lazy"
      />
      <img
        src="https://shrug-person-78902957.figma.site/_components/v2/ebb2b8f25d8e24d5f0a5ca8af4c950de81aa2fd7/Group_134-1.2e04f3ce.png"
        alt="3D Group Icon"
        class="about-deco about-deco-bottom-right"
        id="about-deco-4"
        loading="lazy"
      />

      <!-- Content Wrap -->
      <div class="about-content-wrap">
        <h2 class="about-heading hero-heading">
          About me
        </h2>

        <p class="about-animated-text" id="about-char-container">
          ${charactersHtml}
        </p>

        <a href="#contact" class="contact-btn">
          Contact Me
        </a>
      </div>
    </section>
  `;
}

/**
 * Initializes character-by-character scroll opacity animation
 * and subtle floating parallax on corner 3D decorations.
 */
export function initAboutScrollEvents() {
  const section = document.getElementById('about');
  const container = document.getElementById('about-char-container');
  if (!section || !container) return;

  const spans = container.querySelectorAll('.char-span');
  const totalChars = spans.length;

  const deco1 = document.getElementById('about-deco-1');
  const deco2 = document.getElementById('about-deco-2');
  const deco3 = document.getElementById('about-deco-3');
  const deco4 = document.getElementById('about-deco-4');

  let ticking = false;

  const onScroll = () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        const rect = section.getBoundingClientRect();
        const winHeight = window.innerHeight;

        // Progress when section enters from bottom (start 0.8) to center/exit (end 0.2)
        const start = winHeight * 0.85;
        const end = winHeight * 0.15;
        const current = rect.top;

        let progress = (start - current) / (start - end);
        progress = Math.max(0, Math.min(1, progress));

        const activeCount = Math.floor(progress * totalChars);

        spans.forEach((span, idx) => {
          if (idx <= activeCount) {
            span.classList.add('active');
          } else {
            span.classList.remove('active');
          }
        });

        // Gentle floating parallax on 3D elements
        const floatDelta = (progress - 0.5) * 40;
        if (deco1) deco1.style.transform = `translateY(${floatDelta * -0.6}px) rotate(${floatDelta * 0.1}deg)`;
        if (deco2) deco2.style.transform = `translateY(${floatDelta * 0.8}px) rotate(${floatDelta * -0.15}deg)`;
        if (deco3) deco3.style.transform = `translateY(${floatDelta * -0.7}px) rotate(${floatDelta * -0.1}deg)`;
        if (deco4) deco4.style.transform = `translateY(${floatDelta * 0.9}px) rotate(${floatDelta * 0.2}deg)`;

        ticking = false;
      });
      ticking = true;
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}
