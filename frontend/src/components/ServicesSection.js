/**
 * Services Section
 * White background (#FFFFFF) with rounded top corners (60px),
 * huge black numbering, modern layout, tailored for video editing and post-production.
 */

const SERVICES_DATA = [
  {
    num: '01',
    title: 'Narrative & Commercial Editing',
    desc: 'Crafting high-impact narrative cuts and commercial edits tailored to grab attention, evoke emotion, and drive engagement across digital and broadcast screens.'
  },
  {
    num: '02',
    title: 'Color Grading & Film Emulation',
    desc: 'Bespoke color science, film print emulation, skin-tone balancing, and moody atmospheric palettes that elevate raw footage into cinematic art.'
  },
  {
    num: '03',
    title: 'Sound Design & Audio Mixing',
    desc: 'Immersive multi-track soundscapes, punchy tactile Foley, audio sweetening, and rhythmic sync that gives every cut visceral physical weight.'
  },
  {
    num: '04',
    title: 'Motion Design & Visual FX',
    desc: 'Dynamic animations, kinetic typography, screen tracking, visual cleanup, and graphic overlays that add energy and polished storytelling to your brand.'
  },
  {
    num: '05',
    title: 'Social-First Reels & Shorts',
    desc: 'High-retention 9:16 vertical edits engineered with viral pacing, scroll-stopping hooks, and seamless visual rhythm for maximum social reach.'
  }
];

export function renderServicesSection() {
  const itemsHtml = SERVICES_DATA.map(item => `
    <div class="service-item-row">
      <div class="service-num">${item.num}</div>
      <div class="service-body">
        <h3 class="service-title">${item.title}</h3>
        <p class="service-desc">${item.desc}</p>
      </div>
    </div>
  `).join('');

  return `
    <section class="services-section" id="services">
      <div class="services-container">
        <h2 class="services-heading">
          Services
        </h2>

        <div class="services-list">
          ${itemsHtml}
        </div>
      </div>
    </section>
  `;
}
