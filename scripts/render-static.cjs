/* Pre-render the default English view; browser JS adds filtering and translation.
   This is a string-rendering adapter, not a browser or layout test. */
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const {createHash} = require('node:crypto');
const root = path.resolve(__dirname, '..');
function createView(query = '') {
  const elements = new Map(), filterButtons = new Map();
  let focused = null;
  function element(id) {
    if (!elements.has(id)) elements.set(id, {
      id, innerHTML: '', textContent: '', value: '', hidden: false, open: false,
      dataset: {}, attributes: {}, listeners: {}, style: {setProperty() {}},
      classList: {add() {}, toggle() {}},
      setAttribute(key, value) { this.attributes[key] = value; },
      addEventListener(name, handler) { this.listeners[name] = handler; },
      focus() { focused = id; },
      querySelector() { return element(id + ':count'); }
    });
    return elements.get(id);
  }
  function buttons() {
    const found = [...element('filters').innerHTML.matchAll(/data-filter="([^"]+)"/g)];
    return found.map(match => {
      const value = match[1];
      if (!filterButtons.has(value)) {
        const button = element('filter:' + value);
        button.dataset.filter = value;
        filterButtons.set(value, button);
      }
      return filterButtons.get(value);
    });
  }
  const context = {
    URL, URLSearchParams, Intl, console,
    location: {search: query, href: 'https://example.com/' + query},
    history: {replaceState(_a, _b, url) { context.location.href = url.href; }},
    innerHeight: 800, scrollY: 0,
    matchMedia() { return {matches: false}; },
    requestAnimationFrame(fn) { fn(); }, addEventListener() {},
    document: {
      documentElement: {scrollHeight: 8000},
      getElementById: element,
      querySelector(selector) {
        const category = selector.match(/^\[data-filter="(.+)"\]$/);
        if (category) return buttons().find(b => b.dataset.filter === category[1]);
        return element(selector);
      },
      querySelectorAll(selector) {
        if (selector === '[data-filter]') return buttons();
        if (selector === 'details[open]') return [...elements.values()].filter(e => e.open && /^(detail|project)-/.test(e.id));
        return [];
      },
      addEventListener() {}
    }
  };
  context.window = context;
  vm.createContext(context);
  for (const file of ['content.js', 'portfolio.js', 'app.js']) vm.runInContext(fs.readFileSync(path.join(root, file), 'utf8'), context, {filename: file});
  return {context, elements, element, run: code => vm.runInContext(code, context), focus: () => focused};
}
function build({check = false} = {}) {
  const view = createView();
  const c = view.run('copy.en');
  const projects = view.run('portfolio'), media = view.run('mediaLinks');
  if (new Set(projects.map(p => p.id)).size !== projects.length) throw new Error('Duplicate project ID');
  for (const p of projects) {
    if (!['digital','creative'].includes(p.category) || !['active','completed','exploration','archive'].includes(p.stage)) throw new Error('Invalid category or stage: ' + p.id);
    for (const key of ['title','status','role','description','tags']) {
      if (!Array.isArray(p[key]) || p[key].length !== 2 || p[key].some(v => !v || (Array.isArray(v) && !v.length))) throw new Error('Missing English/Arabic ' + key + ': ' + p.id);
    }
  }
  for (const language of ['en','ar']) {
    const translated = view.run('copy.' + language);
    if (translated.media.length !== media.length) throw new Error('Media labels and links do not match: ' + language);
  }
  for (const url of [...media, ...projects.map(p => p.url).filter(Boolean)]) if (new URL(url).protocol !== 'https:') throw new Error('Expected HTTPS project/media link');
  let html = fs.readFileSync(path.join(root, 'src/index.template.html'), 'utf8');
  html = html.replace(/(<([\w-]+)\b[^>]*\bdata-t="([^"]+)"[^>]*>)[\s\S]*?(<\/\2>)/g, (_m, start, _tag, key, end) => start + (c[key] || '') + end);
  const slots = ['services', 'filters', 'stage', 'projects', 'archive', 'skill-groups', 'media-grid', 'steps', 'scenarios', 'scenario-result'];
  for (const id of slots) {
    let content = view.element(id).innerHTML;
    if (id === 'filters') content = content.replace(/(<button[^>]*data-filter="([^"]+)"[^>]*>[\s\S]*?<span class="filter-count">)(<\/span>)/g, (_m, start, category, end) => start + view.element('filter:' + category + ':count').textContent + end);
    const slot = new RegExp('(<([\\w-]+)\\b[^>]*\\bid="' + id + '"[^>]*>)\\s*(<\\/\\2>)');
    if (!slot.test(html)) throw new Error('Missing empty template slot: ' + id);
    html = html.replace(slot, (_m, start, _tag, end) => start + content + end);
  }
  html = html.replace('<span id="result-count" role="status" aria-live="polite"></span>', `<span id="result-count" role="status" aria-live="polite">${view.element('result-count').textContent}</span>`);
  html = html.replace('<span id="year"></span>', `<span id="year">${new Date().getFullYear()}</span>`);
  html = html.replace(/(<meta name="description" content=")[^"]*(">)/, '$1' + c.metaDescription + '$2');
  html = html.replace(/<link rel="icon" href="[^"]+">/, '<link rel="icon" href="irth-logo.png" type="image/png">');
  html = html.replace('</head>', '<noscript><style>.filters,.work-tools,#language,.scenarios{display:none}.start-grid{grid-template-columns:1fr}</style></noscript></head>');
  // Each changed asset gets a new URL automatically; visitors receive the latest release.
  for (const file of ['style.css','content.js','portfolio.js','app.js']) {
    const hash = createHash('sha256').update(fs.readFileSync(path.join(root, file))).digest('hex').slice(0,12);
    html = html.replaceAll('"' + file + '"', '"' + file + '?v=' + hash + '"');
  }
  for (const match of html.matchAll(/(?:src|href)="([^"#]+)"/g)) {
    const file = match[1].split('?')[0];
    if (!/^[a-z]+:/i.test(file) && !file.startsWith('//') && !fs.existsSync(path.join(root, file))) throw new Error('Missing local asset: ' + file);
  }
  const output = path.join(root, 'index.html');
  if (check) {
    if (fs.readFileSync(output, 'utf8') !== html) throw new Error('index.html is stale. Run node scripts/render-static.cjs');
  } else fs.writeFileSync(output, html);
  console.log((check ? 'Verified' : 'Rendered') + ' English page: ' + projects.length + ' projects, ' + c.services.length + ' services and ' + media.length + ' media links.');
}
if (require.main === module) build({check: process.argv.includes("--check")});
module.exports = {createView, build};
