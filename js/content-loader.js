/* ==========================================================================
   JM Munna — Content Loader
   Fetches the JSON files edited through Decap CMS (in /content) and renders
   them into the static page. No build step, no backend — just fetch + DOM.
   Every render function is defensive: missing content hides its section or
   shows a clean placeholder instead of a broken card.
   ========================================================================== */

const ICONS = {
  facebook: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M13.5 21v-7.5h2.5l.5-3H13.5V8.5c0-.9.25-1.5 1.55-1.5H16.5V4.3C16.2 4.26 15.2 4.17 14 4.17c-2.4 0-4 1.47-4 4.15V10.5H7.5v3H10V21h3.5Z"/></svg>',
  youtube: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M21.6 7.6a2.7 2.7 0 0 0-1.9-1.9C18 5.2 12 5.2 12 5.2s-6 0-7.7.5a2.7 2.7 0 0 0-1.9 1.9A28 28 0 0 0 2 12a28 28 0 0 0 .4 4.4 2.7 2.7 0 0 0 1.9 1.9c1.7.5 7.7.5 7.7.5s6 0 7.7-.5a2.7 2.7 0 0 0 1.9-1.9A28 28 0 0 0 22 12a28 28 0 0 0-.4-4.4ZM10 15.2V8.8l5.5 3.2Z"/></svg>',
  play: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7Z"/></svg>',
  external: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><path d="M15 3h6v6"/><path d="M10 14 21 3"/></svg>'
};

async function fetchJSON(path) {
  try {
    const res = await fetch(path, { cache: 'no-cache' });
    if (!res.ok) throw new Error('not found');
    return await res.json();
  } catch (e) {
    return null;
  }
}

function placeholder(label) {
  return `<div class="placeholder-fill">${label}</div>`;
}

function mediaTag(src, alt, label) {
  return src
    ? `<img src="${src}" alt="${escapeHtml(alt || '')}" loading="lazy">`
    : placeholder(label || 'Image coming soon');
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str == null ? '' : String(str);
  return div.innerHTML;
}

function setText(id, value, fallback) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = value || fallback || '';
}

function hide(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add('hidden-section');
}

function socialIconsHTML(social) {
  if (!social) return '';
  let html = '';
  if (social.facebook) html += `<a class="social-icon" href="${social.facebook}" target="_blank" rel="noopener" aria-label="Facebook">${ICONS.facebook}</a>`;
  if (social.youtube) html += `<a class="social-icon" href="${social.youtube}" target="_blank" rel="noopener" aria-label="YouTube">${ICONS.youtube}</a>`;
  return html;
}

/* ---------- Facebook / YouTube video URL parsing ---------- */
function parseVideoEmbed(url) {
  if (!url) return null;
  if (/youtube\.com|youtu\.be/.test(url)) {
    let id = '';
    const short = url.match(/youtu\.be\/([\w-]+)/);
    const long = url.match(/[?&]v=([\w-]+)/);
    if (short) id = short[1];
    else if (long) id = long[1];
    if (id) return { type: 'youtube', embedUrl: `https://www.youtube.com/embed/${id}` };
  }
  if (/facebook\.com|fb\.watch/.test(url)) {
    const embedUrl = `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=0`;
    return { type: 'facebook', embedUrl, originalUrl: url };
  }
  return { type: 'unknown', originalUrl: url };
}

/* ---------- Renderers ---------- */

function renderSettings(settings) {
  if (!settings) return;
  document.title = settings.site_title || document.title;
  setText('meta-description', '');
  const desc = document.getElementById('meta-description');
  if (desc && settings.meta_description) desc.setAttribute('content', settings.meta_description);
  const ogDesc = document.getElementById('og-description');
  if (ogDesc && settings.meta_description) ogDesc.setAttribute('content', settings.meta_description);
  const ogImg = document.getElementById('og-image');
  if (ogImg && settings.profile_image) ogImg.setAttribute('content', settings.profile_image);

  if (settings.favicon) {
    const fav = document.getElementById('favicon-link');
    if (fav) fav.setAttribute('href', settings.favicon);
  }

  const brandText = document.getElementById('brand-text');
  const brand = document.getElementById('nav-brand');
  if (settings.logo_image && brand) {
    brand.innerHTML = `<img src="${settings.logo_image}" alt="${escapeHtml(settings.logo_text || 'Logo')}" style="height:34px;width:34px;border-radius:8px;object-fit:cover;"><span>${escapeHtml(settings.logo_text || 'JM Munna')}</span>`;
  } else if (brandText) {
    brandText.textContent = settings.logo_text || 'JM Munna';
  }

  setText('footer-brand', settings.logo_text || 'JM Munna');
  const year = new Date().getFullYear();
  setText('footer-meta', `© ${year} ${settings.logo_text || 'JM Munna'}. Built with care.`);

  const heroSocial = document.getElementById('hero-social');
  const footerSocial = document.getElementById('footer-social');
  const iconsHtml = socialIconsHTML(settings.social);
  if (heroSocial) heroSocial.innerHTML = iconsHtml;
  if (footerSocial) footerSocial.innerHTML = iconsHtml;
}

function renderHome(home) {
  if (!home) return;
  setText('hero-role', home.hero_role, 'Video Editor & Student');
  const nameEl = document.getElementById('hero-name');
  if (nameEl) {
    nameEl.innerHTML = `${escapeHtml(home.hero_name || 'JM Munna')}<span class="role" id="hero-role">${escapeHtml(home.hero_role || 'Video Editor & Student')}</span>`;
  }
  setText('hero-intro', home.hero_intro);
  const primaryCta = document.getElementById('cta-primary');
  if (primaryCta) primaryCta.textContent = home.cta_primary_text || 'View My Work';
  const secondaryCta = document.getElementById('cta-secondary');
  if (secondaryCta) secondaryCta.textContent = home.cta_secondary_text || 'Contact Me';

  const heroFrame = document.getElementById('hero-frame');
  if (heroFrame && home.hero_image) {
    heroFrame.innerHTML = `<img src="${home.hero_image}" alt="${escapeHtml(home.hero_name || 'Profile photo')}"><span class="hero-frame-tag">REC ●</span>`;
  }

  if (home.about_preview) setText('about-preview-text', home.about_preview);
  else hide('about-preview-section');

  setText('contact-heading', home.contact_cta_heading, 'Let\u2019s work together');
  setText('contact-text', home.contact_cta_text);
}

function renderAbout(about) {
  if (!about) return;
  setText('about-intro', about.intro);
  setText('about-biography', about.biography);
  setText('about-interests', about.interests, '—');
  setText('about-focus', about.current_focus, '—');
  setText('about-growth', about.growth_note, '—');
  const portrait = document.getElementById('about-portrait');
  if (portrait && about.profile_image) {
    portrait.innerHTML = `<img src="${about.profile_image}" alt="Portrait">`;
  }
}

function renderSkills(skills) {
  const grid = document.getElementById('skills-grid');
  if (!skills || !grid) return;
  setText('skills-intro', skills.intro);
  const items = skills.items || [];
  if (!items.length) { hide('skills'); return; }
  grid.innerHTML = items.map(s => `
    <div class="skill-card">
      <h3>${escapeHtml(s.name)}</h3>
      <p>${escapeHtml(s.note || '')}</p>
    </div>`).join('');
}

function renderEducation(education) {
  const wrap = document.getElementById('education-timeline');
  if (!education || !wrap) return;
  const items = education.items || [];
  if (!items.length) {
    wrap.innerHTML = `<div class="empty-note">Education details coming soon.</div>`;
    return;
  }
  wrap.innerHTML = items.map(e => `
    <div class="timeline-item">
      <div class="timeline-dates">${escapeHtml(e.start_date || '')}${e.end_date ? ' – ' + escapeHtml(e.end_date) : ''}</div>
      <h3>${escapeHtml(e.degree || '')}</h3>
      <p class="org">${escapeHtml(e.institution || '')}</p>
      ${e.description ? `<p class="desc">${escapeHtml(e.description)}</p>` : ''}
    </div>`).join('');
}

function renderExperience(experience) {
  const wrap = document.getElementById('experience-content');
  if (!experience || !wrap) return;
  const items = experience.items || [];
  if (!items.length) {
    wrap.innerHTML = `<div class="empty-note">${escapeHtml(experience.empty_message || 'Currently building experience and working on personal and creative projects.')}</div>`;
    return;
  }
  wrap.innerHTML = `<div class="timeline">` + items.map(e => `
    <div class="timeline-item">
      <div class="timeline-dates">${escapeHtml(e.start_date || '')}${e.end_date ? ' – ' + escapeHtml(e.end_date) : ' – Present'}</div>
      <h3>${escapeHtml(e.position || '')}</h3>
      <p class="org">${escapeHtml(e.organization || '')}</p>
      ${e.description ? `<p class="desc">${escapeHtml(e.description)}</p>` : ''}
    </div>`).join('') + `</div>`;
}

function projectCardHTML(p) {
  return `
    <div class="project-card" data-project='${escapeHtml(JSON.stringify(p))}'>
      <div class="project-thumb">${mediaTag(p.cover_image, p.title, 'Project cover')}</div>
      <div class="project-body">
        <p class="project-cat">${escapeHtml(p.category || '')}</p>
        <h3>${escapeHtml(p.title || 'Untitled project')}</h3>
        <p>${escapeHtml(p.description || '')}</p>
      </div>
    </div>`;
}

function renderProjects(projects) {
  const grid = document.getElementById('projects-grid');
  const featuredGrid = document.getElementById('featured-projects-grid');
  if (!projects) return;
  setText('projects-intro', projects.intro);
  const items = projects.items || [];
  if (!items.length) {
    hide('projects');
    hide('featured-work-section');
    return;
  }
  if (grid) grid.innerHTML = items.map(projectCardHTML).join('');
  const featured = items.filter(p => p.featured);
  if (featuredGrid) {
    if (featured.length) featuredGrid.innerHTML = featured.map(projectCardHTML).join('');
    else hide('featured-work-section');
  }
  document.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('click', () => openProjectModal(JSON.parse(card.dataset.project)));
  });
}

function photoItemHTML(p) {
  return `
    <div class="gallery-item" data-photo='${escapeHtml(JSON.stringify(p))}'>
      ${mediaTag(p.image, p.title, 'Photo')}
      ${(p.title || p.caption) ? `<div class="gallery-caption">${escapeHtml(p.title || '')}${p.caption ? ' — ' + escapeHtml(p.caption) : ''}</div>` : ''}
    </div>`;
}

function renderPhotos(photos) {
  const grid = document.getElementById('gallery-grid');
  const featuredGrid = document.getElementById('featured-photos-grid');
  if (!photos) return;
  setText('gallery-intro', photos.intro);
  const items = photos.items || [];
  if (!items.length) {
    hide('gallery');
    hide('featured-photos-section');
    return;
  }
  if (grid) grid.innerHTML = items.map(photoItemHTML).join('');
  const featured = items.filter(p => p.featured);
  if (featuredGrid) {
    if (featured.length) featuredGrid.innerHTML = featured.map(photoItemHTML).join('');
    else hide('featured-photos-section');
  }
  document.querySelectorAll('.gallery-item').forEach(item => {
    item.addEventListener('click', () => openPhotoLightbox(JSON.parse(item.dataset.photo)));
  });
}

function videoCardHTML(v) {
  return `
    <div class="video-card" data-video='${escapeHtml(JSON.stringify(v))}'>
      <div class="video-thumb">
        ${mediaTag(v.thumbnail, v.title, 'Video thumbnail')}
        <div class="play-btn"><span>${ICONS.play}</span></div>
      </div>
      <div class="video-body">
        <h3>${escapeHtml(v.title || 'Untitled video')}</h3>
        ${v.description ? `<p>${escapeHtml(v.description)}</p>` : ''}
      </div>
    </div>`;
}

function renderVideos(videos) {
  const grid = document.getElementById('videos-grid');
  const featuredGrid = document.getElementById('featured-videos-grid');
  if (!videos) return;
  setText('videos-intro', videos.intro);
  const items = videos.items || [];
  if (!items.length) {
    hide('videos');
    hide('featured-videos-section');
    return;
  }
  if (grid) grid.innerHTML = items.map(videoCardHTML).join('');
  const featured = items.filter(v => v.featured);
  if (featuredGrid) {
    if (featured.length) featuredGrid.innerHTML = featured.map(videoCardHTML).join('');
    else hide('featured-videos-section');
  }
  document.querySelectorAll('.video-card').forEach(card => {
    card.addEventListener('click', () => openVideoModal(JSON.parse(card.dataset.video)));
  });
}

function renderCertificates(certs) {
  const grid = document.getElementById('certificates-grid');
  if (!certs) return;
  setText('certificates-intro', certs.intro);
  const items = certs.items || [];
  if (!items.length) { hide('certificates'); return; }
  grid.innerHTML = items.map(c => `
    <div class="cert-card">
      <div class="cert-thumb">${mediaTag(c.image, c.title, 'Certificate')}</div>
      <div class="cert-body">
        <h3>${escapeHtml(c.title || '')}</h3>
        <p class="issuer">${escapeHtml(c.issuer || '')}</p>
        <p class="date">${escapeHtml(c.date || '')}</p>
        ${c.link ? `<a href="${c.link}" target="_blank" rel="noopener">View certificate ↗</a>` : ''}
      </div>
    </div>`).join('');
}

function renderContact(contact, settings) {
  if (!contact) return;
  setText('contact-heading', contact.heading);
  setText('contact-text', contact.text);
  const linksWrap = document.getElementById('contact-links');
  if (linksWrap) {
    let html = socialIconsHTML(settings ? settings.social : null);
    if (contact.email) html += `<a class="btn btn-outline" href="mailto:${contact.email}">Email</a>`;
    if (contact.phone) html += `<a class="btn btn-outline" href="tel:${contact.phone}">Call</a>`;
    linksWrap.innerHTML = html;
  }
  const cv = document.getElementById('cv-download');
  if (cv) {
    if (contact.cv_file) {
      cv.href = contact.cv_file;
      cv.setAttribute('download', '');
      cv.classList.remove('hidden-section');
    } else {
      cv.classList.add('hidden-section');
    }
  }
}

/* ---------- Modals ---------- */
function openModal(innerHTML) {
  const overlay = document.getElementById('modal-overlay');
  const box = document.getElementById('modal-box');
  box.innerHTML = `<button class="modal-close" id="modal-close" aria-label="Close">✕</button>` + innerHTML;
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
  document.getElementById('modal-close').addEventListener('click', closeModal);
}
function closeModal() {
  document.getElementById('modal-overlay').classList.remove('open');
  document.getElementById('modal-box').innerHTML = '';
  document.body.style.overflow = '';
}

function openProjectModal(p) {
  const tools = (p.tools || '').split(',').map(t => t.trim()).filter(Boolean);
  openModal(`
    <div class="project-modal-cover">${mediaTag(p.cover_image, p.title, 'Project cover')}</div>
    <div class="modal-body-pad">
      <p class="project-cat">${escapeHtml(p.category || '')}</p>
      <h3>${escapeHtml(p.title || '')}</h3>
      <p>${escapeHtml(p.description || '')}</p>
      <div class="project-modal-meta">
        ${tools.map(t => `<span class="tag-pill">${escapeHtml(t)}</span>`).join('')}
      </div>
      ${p.link ? `<div style="margin-top:20px;"><a class="btn btn-primary" href="${p.link}" target="_blank" rel="noopener">Visit Project</a></div>` : ''}
    </div>`);
}

function openPhotoLightbox(p) {
  openModal(`
    <div class="modal-media">${mediaTag(p.image, p.title, 'Photo')}</div>
    ${(p.title || p.caption) ? `<div class="modal-body-pad"><h3>${escapeHtml(p.title || '')}</h3><p>${escapeHtml(p.caption || '')}</p></div>` : ''}`);
}

function openVideoModal(v) {
  const parsed = parseVideoEmbed(v.video_url);
  let mediaHtml = '';
  if (parsed && parsed.type === 'youtube') {
    mediaHtml = `<div class="modal-media"><iframe src="${parsed.embedUrl}" title="${escapeHtml(v.title || '')}" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe></div>`;
  } else if (parsed && parsed.type === 'facebook') {
    mediaHtml = `<div class="modal-media"><iframe src="${parsed.embedUrl}" title="${escapeHtml(v.title || '')}" allow="autoplay; encrypted-media; picture-in-picture; web-share" allowfullscreen></iframe></div>
      <div class="modal-fallback" style="padding:16px 28px 0;">
        <p>Video not loading? Facebook privacy settings can block embeds.</p>
        <a class="btn btn-outline btn-sm" href="${parsed.originalUrl}" target="_blank" rel="noopener">Watch on Facebook ↗</a>
      </div>`;
  } else {
    mediaHtml = `<div class="modal-fallback">
        <p>This video is hosted externally.</p>
        ${v.video_url ? `<a class="btn btn-primary" href="${v.video_url}" target="_blank" rel="noopener">Watch Video ↗</a>` : ''}
      </div>`;
  }
  openModal(`${mediaHtml}<div class="modal-body-pad"><h3>${escapeHtml(v.title || '')}</h3>${v.description ? `<p>${escapeHtml(v.description)}</p>` : ''}</div>`);
}

/* ---------- Boot ---------- */
async function loadAllContent() {
  const [settings, home, about, skills, education, experience, projects, photos, videos, certificates, contact] = await Promise.all([
    fetchJSON('content/settings.json'),
    fetchJSON('content/home.json'),
    fetchJSON('content/about.json'),
    fetchJSON('content/skills.json'),
    fetchJSON('content/education.json'),
    fetchJSON('content/experience.json'),
    fetchJSON('content/projects.json'),
    fetchJSON('content/photos.json'),
    fetchJSON('content/videos.json'),
    fetchJSON('content/certificates.json'),
    fetchJSON('content/contact.json'),
  ]);

  renderSettings(settings);
  renderHome(home);
  renderAbout(about);
  renderSkills(skills);
  renderEducation(education);
  renderExperience(experience);
  renderProjects(projects);
  renderPhotos(photos);
  renderVideos(videos);
  renderCertificates(certificates);
  renderContact(contact, settings);

  document.dispatchEvent(new Event('content:loaded'));
}

document.addEventListener('DOMContentLoaded', loadAllContent);

document.addEventListener('click', (e) => {
  if (e.target.id === 'modal-overlay') closeModal();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal();
});
