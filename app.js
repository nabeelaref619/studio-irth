const categories = ['all', 'digital', 'creative'];
const stages = ['all', 'active', 'completed', 'exploration', 'archive'];
let lang = new URLSearchParams(location.search).get('lang') === 'ar' ? 'ar' : 'en';
let filter = 'all', stage = 'all', scenario = 0;
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const observer = 'IntersectionObserver' in window ? new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, {threshold: .06}) : null;
const byId = id => document.getElementById(id);
const local = value => Array.isArray(value) ? value[lang === 'ar' ? 1 : 0] : value;
const number = value => new Intl.NumberFormat(lang).format(value);
function reveal() {
  if (reduced.matches) return;
  document.querySelectorAll('.reveal:not(.visible)').forEach(el => observer ? observer.observe(el) : el.classList.add('visible'));
}
function tags(project) {
  return `<ul class="project-tags">${local(project.tags).map(tag => `<li>${tag}</li>`).join('')}</ul>`;
}
function projectLink(project) {
  return project.url ? `<a class="text-link" href="${project.url}" target="_blank" rel="noopener noreferrer">${local(project.link)}</a>` : '';
}
function matchesStage(project) { return stage === 'all' || project.stage === stage; }
function syncFilters() {
  document.querySelectorAll('[data-filter]').forEach(button => {
    const category = button.dataset.filter;
    button.setAttribute('aria-pressed', String(filter === category));
    button.querySelector('.filter-count').textContent = number(portfolio.filter(p => matchesStage(p) && (category === 'all' || p.category === category)).length);
  });
  byId('stage').value = stage;
}
function renderProjects() {
  const c = copy[lang];
  const chosen = portfolio.filter(p => matchesStage(p) && (filter === 'all' || p.category === filter));
  const featured = chosen.filter(p => p.featured), archive = chosen.filter(p => !p.featured);
  const projects = byId('projects');
  projects.classList.toggle('single-feature', featured.length === 1);
  projects.hidden = !featured.length;
  projects.innerHTML = featured.map(p => `
    <article class="project reveal" id="project-${p.id}">
      <div class="project-face cover-${p.theme}">
        <div class="cover-art" aria-hidden="true"><i></i><i></i><i></i></div>
        <div class="project-topline"><span class="label">${p.category === 'digital' ? c.digitalLabel : c.creativeLabel}</span><span class="project-status status-${p.stage}">${local(p.status)}</span></div>
        <div class="project-word">${local(p.brand).replaceAll('\n', '<br>')}</div>
        <div class="project-baseline"><span class="small">${local(p.line)}</span></div>
      </div>
      <div class="project-meta"><h3>${local(p.title)}</h3></div>
      <p class="project-role">${local(p.role)}</p><p class="project-description">${local(p.description)}</p>
      <details class="project-detail" id="detail-${p.id}"><summary>${c.read}<span aria-hidden="true">+</span></summary><div class="project-detail-body"><p>${local(p.detail)}</p>${tags(p)}${projectLink(p)}</div></details>
    </article>`).join('');
  byId('archive-heading').hidden = !archive.length;
  byId('archive').innerHTML = archive.map(p => `
    <details class="archive-project reveal" id="project-${p.id}">
      <summary><span class="archive-number" aria-hidden="true">${number(portfolio.indexOf(p) + 1)}</span><span class="archive-name">${local(p.title)}<span>${p.category === 'digital' ? c.digitalLabel : c.creativeLabel}</span></span><span class="project-status status-${p.stage}">${local(p.status)}</span><span class="archive-plus" aria-hidden="true">+</span></summary>
      <div class="archive-body"><p class="project-role">${local(p.role)}</p><p>${local(p.description)}</p>${tags(p)}${projectLink(p)}</div>
    </details>`).join('');
  byId('empty-work').hidden = chosen.length > 0;
  byId('result-count').textContent = `${c.resultsLabel}: ${number(chosen.length)}`;
}
function renderServices() {
  const c = copy[lang];
  byId('services').innerHTML = c.services.map((s, i) => `
    <article class="service reveal">
      <div class="service-top"><span class="service-index" aria-hidden="true">0${i + 1}</span><span class="service-kicker">${s[3]}</span></div>
      <h3>${s[0]}</h3><p>${s[1]}</p>
      <ul>${s[2].split('|').map(item => `<li>${item}</li>`).join('')}</ul>
      <a class="text-link" href="#work" data-work-category="${categories[i + 1]}">${c.serviceLinks[i]}</a>
    </article>`).join('');
}
function renderProfile() {
  const c = copy[lang];
  byId('skill-groups').innerHTML = c.skillGroups.map(s => `
    <article class="skill-group reveal"><span class="skill-number" aria-hidden="true">${s[0]}</span><h3>${s[1]}</h3><p>${s[2]}</p><ul>${s[3].map(item => `<li>${item}</li>`).join('')}</ul></article>`).join('');
  byId('media-grid').innerHTML = c.media.map((m, i) => `
    <article class="media-card reveal"><a class="media-link" href="${mediaLinks[i]}" target="_blank" rel="noopener noreferrer" aria-label="${c.watch}: ${m[1]} — ${m[2]}">
      <div class="broadcast broadcast-${i}"><span class="broadcast-type">${m[0]}</span><span class="broadcast-name">${m[1]}</span><span class="broadcast-bottom"><span class="waveform" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></span><span class="play-icon" aria-hidden="true">▶</span></span></div>
      <h3>${m[2]}</h3><p>${m[3]}</p><span class="text-link">${c.watch}</span>
    </a></article>`).join('');
}
function renderScenario() {
  const c = copy[lang], data = c.scenarios[scenario], options = byId('scenarios');
  options.setAttribute('aria-label', c.startTitle.replace(/<[^>]*>/g, ' '));
  options.innerHTML = c.scenarios.map((s, i) => `<button type="button" data-scenario="${i}" aria-pressed="${i === scenario}" aria-controls="scenario-result"><span class="scenario-number" aria-hidden="true">0${i + 1}</span><span>${s[0]}</span><span class="scenario-sign" aria-hidden="true">${i === scenario ? '−' : '+'}</span></button>`).join('');
  const subject = encodeURIComponent(`Studio Irth — ${data[0]}`);
  byId('scenario-result').innerHTML = `<span class="eyebrow">${data[1]}</span><h3>${data[2]}</h3><p>${data[3]}</p><ol>${data[4].map(item => `<li>${item}</li>`).join('')}</ol><a class="text-link" href="mailto:naref@studioirth.com?subject=${subject}">${c.startAction}</a>`;
}
function render() {
  const c = copy[lang];
  const openProjects = [...document.querySelectorAll('details[open]')].map(el => el.id);
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  document.title = lang === 'ar' ? 'استوديو إرث | حلول رقمية وتواصل إبداعي' : 'Studio Irth | Digital Solutions & Creative Communications';
  document.querySelector('meta[name="description"]').setAttribute('content', c.metaDescription);
  document.querySelectorAll('[data-t]').forEach(el => { el.innerHTML = c[el.dataset.t] || ''; });
  const toggle = byId('language');
  toggle.textContent = lang === 'ar' ? 'English' : 'العربية';
  toggle.lang = lang === 'ar' ? 'en' : 'ar';
  toggle.setAttribute('aria-label', lang === 'ar' ? 'Switch to English' : 'التبديل إلى العربية');
  document.querySelector('nav').setAttribute('aria-label', lang === 'ar' ? 'التنقّل الرئيسي' : 'Main navigation');
  document.querySelector('.hero').setAttribute('aria-label', c.heroAria);
  document.querySelector('.hero .art img').alt = c.heroAlt;
  renderServices();
  byId('filters').setAttribute('aria-label', lang === 'ar' ? 'تصفية المشاريع حسب المجال' : 'Filter projects by discipline');
  byId('filters').innerHTML = c.filters.map((label, i) => `<button type="button" data-filter="${categories[i]}" aria-pressed="${filter === categories[i]}" aria-controls="projects archive"><span>${label}</span><span class="filter-count"></span></button>`).join('');
  byId('stage').innerHTML = stages.map((value, i) => `<option value="${value}">${c[['statusAll', 'statusActive', 'statusDone', 'statusIdeas', 'statusArchive'][i]]}</option>`).join('');
  syncFilters();
  renderProjects();
  openProjects.forEach(id => { const el = byId(id); if (el) el.open = true; });
  renderProfile();
  byId('steps').innerHTML = c.steps.map((s, i) => `<article class="step reveal"><span class="number" aria-hidden="true">0${i + 1}</span><h3>${s[0]}</h3><p>${s[1]}</p></article>`).join('');
  renderScenario();
  reveal();
  queueScrollUpdate();
}
function refreshWork() { syncFilters(); renderProjects(); reveal(); queueScrollUpdate(); }
byId('services').addEventListener('click', event => {
  const link = event.target.closest('[data-work-category]');
  if (!link) return;
  filter = link.dataset.workCategory;
  stage = 'all';
  refreshWork();
});
byId('scenarios').addEventListener('click', event => {
  const button = event.target.closest('[data-scenario]');
  if (!button) return;
  scenario = Number(button.dataset.scenario);
  renderScenario();
  document.querySelector(`[data-scenario="${scenario}"]`).focus({preventScroll: true});
  queueScrollUpdate();
});
byId('language').addEventListener('click', () => {
  lang = lang === 'ar' ? 'en' : 'ar';
  const url = new URL(location.href);
  if (lang === 'ar') url.searchParams.set('lang', 'ar'); else url.searchParams.delete('lang');
  history.replaceState(null, '', url);
  render();
});
byId('filters').addEventListener('click', event => {
  const button = event.target.closest('[data-filter]');
  if (!button) return;
  filter = button.dataset.filter;
  refreshWork();
});
byId('stage').addEventListener('change', event => { stage = event.target.value; refreshWork(); });
byId('clear-filters').addEventListener('click', () => {
  filter = 'all'; stage = 'all'; refreshWork();
  document.querySelector('[data-filter="all"]').focus({preventScroll: true});
});
let pending = false;
const progress = document.querySelector('.reading-progress');
function updateScroll() {
  const max = document.documentElement.scrollHeight - innerHeight;
  progress.style.transform = `scaleX(${max > 0 ? Math.min(1, Math.max(0, scrollY / max)) : 0})`;
  pending = false;
}
function queueScrollUpdate() { if (!pending) { pending = true; requestAnimationFrame(updateScroll); } }
addEventListener('scroll', queueScrollUpdate, {passive: true});
addEventListener('resize', queueScrollUpdate, {passive: true});
document.addEventListener('toggle', queueScrollUpdate, true);
if (document.fonts) document.fonts.ready.then(queueScrollUpdate);
const art = document.querySelector('.hero-stage');
if (matchMedia('(hover:hover)').matches) {
  art.addEventListener('pointermove', event => {
    if (reduced.matches) return;
    const box = art.getBoundingClientRect();
    art.style.setProperty('--pointer-x', `${(event.clientX - box.left - box.width / 2) * .018}px`);
    art.style.setProperty('--pointer-y', `${(event.clientY - box.top - box.height / 2) * .018}px`);
  });
  art.addEventListener('pointerleave', () => {
    art.style.setProperty('--pointer-x', '0px');
    art.style.setProperty('--pointer-y', '0px');
  });
}
byId('year').textContent = new Date().getFullYear();
render();
