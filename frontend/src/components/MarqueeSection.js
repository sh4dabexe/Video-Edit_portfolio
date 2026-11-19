/**
 * Marquee Section
 * Two rows of 21 GIF tiles scrolling horizontally based on page scroll
 * and continuous auto-flow, with will-change: transform.
 */

const GIF_URLS = [
  'https://motionsites.ai/assets/hero-space-voyage-preview-eECLH3Yc.gif',
  'https://motionsites.ai/assets/hero-codenest-preview-Cgppc2qV.gif',
  'https://motionsites.ai/assets/hero-vex-ventures-preview-BczMFIiw.gif',
  'https://motionsites.ai/assets/hero-stellar-ai-v2-preview-DjvxjG3C.gif',
  'https://motionsites.ai/assets/hero-asme-preview-B_nGDnTP.gif',
  'https://motionsites.ai/assets/hero-transform-data-preview-Cx5OU29N.gif',
  'https://motionsites.ai/assets/hero-vitara-preview-Cjz2QYyU.gif',
  'https://motionsites.ai/assets/hero-terra-preview-BFjrCr7T.gif',
  'https://motionsites.ai/assets/hero-skyelite-preview-DHaZIgUv.gif',
  'https://motionsites.ai/assets/hero-aethera-preview-DknSlcTa.gif',
  'https://motionsites.ai/assets/hero-designpro-preview-D8c5_een.gif',
  'https://motionsites.ai/assets/hero-stellar-ai-preview-D3HL6bw1.gif',
  'https://motionsites.ai/assets/hero-xportfolio-preview-D4A8maiC.gif',
  'https://motionsites.ai/assets/hero-orbit-web3-preview-BXt4OttD.gif',
  'https://motionsites.ai/assets/hero-nexora-preview-cx5HmUgo.gif',
  'https://motionsites.ai/assets/hero-evr-ventures-preview-DZxeVFEX.gif',
  'https://motionsites.ai/assets/hero-planet-orbit-preview-DWAP8Z1P.gif',
  'https://motionsites.ai/assets/hero-new-era-preview-CocuDUm9.gif',
  'https://motionsites.ai/assets/hero-wealth-preview-B70idl_u.gif',
  'https://motionsites.ai/assets/hero-luminex-preview-CxOP7ce6.gif',
  'https://motionsites.ai/assets/hero-celestia-preview-0yO3jXO8.gif'
];

export function renderMarqueeSection() {
  const row1Images = GIF_URLS.slice(0, 11);
  const row2Images = GIF_URLS.slice(11);

  // Triple each array for seamless wrap
  const tripledRow1 = [...row1Images, ...row1Images, ...row1Images];
  const tripledRow2 = [...row2Images, ...row2Images, ...row2Images];

  const buildTiles = (list) => list.map(url => `
    <div class="marquee-tile">
      <img src="${url}" alt="Creative motion preview" loading="lazy" />
    </div>
  `).join('');

  return `
    <section class="marquee-section" id="marquee">
      <div class="marquee-track-container">
        <!-- Row 1: Moves RIGHT on scroll -->
        <div class="marquee-row" id="marquee-row-1">
          ${buildTiles(tripledRow1)}
        </div>

        <!-- Row 2: Moves LEFT on scroll -->
        <div class="marquee-row" id="marquee-row-2">
          ${buildTiles(tripledRow2)}
        </div>
      </div>
    </section>
  `;
}

export function initMarqueeScroll() {
  const section = document.getElementById('marquee');
  const row1 = document.getElementById('marquee-row-1');
  const row2 = document.getElementById('marquee-row-2');

  if (!section || !row1 || !row2) return;

  let ticking = false;

  const updateMarqueePositions = () => {
    const rect = section.getBoundingClientRect();
    const sectionTop = window.scrollY + rect.top;
    
    // Formula from prompt: (window.scrollY - sectionTop + window.innerHeight) * 0.3
    const offset = (window.scrollY - sectionTop + window.innerHeight) * 0.35;

    // Row 1 moves RIGHT
    row1.style.transform = `translateX(${(offset - 300).toFixed(2)}px)`;
    // Row 2 moves LEFT
    row2.style.transform = `translateX(${(-(offset - 100)).toFixed(2)}px)`;

    ticking = false;
  };

  const onScroll = () => {
    if (!ticking) {
      window.requestAnimationFrame(updateMarqueePositions);
      ticking = true;
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  // Initial calculation
  updateMarqueePositions();
}
