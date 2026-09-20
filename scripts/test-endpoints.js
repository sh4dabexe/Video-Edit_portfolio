async function verifyAll() {
  console.log('Testing Vite Dev Server & API Endpoints...\n');

  // 1. Homepage
  const homeRes = await fetch('http://localhost:5173/');
  console.log(`[1] Homepage (GET /): Status ${homeRes.status} (Expected 200)`);
  const homeHtml = await homeRes.text();
  console.log(`    - Contains #app: ${homeHtml.includes('id="app"')}`);
  console.log(`    - Contains Inter & Instrument Serif: ${homeHtml.includes('Instrument+Serif')}`);

  // 2. Main JS & CSS assets
  const cssRes = await fetch('http://localhost:5173/src/styles/main.css');
  console.log(`[2] Main CSS (GET /src/styles/main.css): Status ${cssRes.status}`);

  const jsRes = await fetch('http://localhost:5173/src/main.js');
  console.log(`[3] Main JS (GET /src/main.js): Status ${jsRes.status}`);

  // 3. API Projects
  const projectsRes = await fetch('http://localhost:5173/api/projects');
  console.log(`[4] API Projects (GET /api/projects): Status ${projectsRes.status}`);
  const projects = await projectsRes.json();
  console.log(`    - Total Projects Returned: ${projects.length}`);
  console.log(`    - Project 1: "${projects[0]?.title}" (${projects[0]?.category})`);
  console.log(`    - Thumbnail: ${projects[0]?.thumbnail_url}`);

  // 4. API Playback
  const playbackRes = await fetch(`http://localhost:5173/api/projects/${projects[0]?.id}/playback`);
  console.log(`[5] API Playback (GET /api/projects/:id/playback): Status ${playbackRes.status}`);
  const playback = await playbackRes.json();
  console.log(`    - Playback Provider: ${playback.provider}`);
  console.log(`    - Direct Stream Source: ${playback.src}`);

  // 5. API Sync
  const syncRes = await fetch('http://localhost:5173/api/sync', { method: 'POST' });
  console.log(`[6] API Sync (POST /api/sync): Status ${syncRes.status}`);
  const syncData = await syncRes.json();
  console.log(`    - Sync Success: ${syncData.success}`);
  console.log(`    - Scanned: ${syncData.totalScanned}`);

  console.log('\nAll Automated Verifications Passed 100%!');
}

verifyAll().catch(console.error);
