const root = document.documentElement;
const themeButton = document.querySelector('.theme-toggle');
const english = document.documentElement.lang === 'en';
function applyTheme(theme, persist=false) {
  if(root.dataset.theme!==theme)root.dataset.theme = theme;
  const dark = theme === 'dark';
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? '#13232c' : '#f1f6f8');
  themeButton.innerHTML = dark
    ? '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/></svg>'
    : '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.5 13.4A8.6 8.6 0 0 1 10.6 3.5 8.6 8.6 0 1 0 20.5 13.4Z"/></svg>';
  themeButton.title = english ? (dark ? 'Use light theme' : 'Use dark theme') : (dark ? '切换浅色主题' : '切换深色主题');
  themeButton.setAttribute('aria-label', english ? (dark ? 'Use light theme' : 'Use dark theme') : (dark ? '切换浅色主题' : '切换深色主题'));
  themeButton.setAttribute('aria-pressed', String(dark));
  if(persist){if(window.xiuTheme)window.xiuTheme.setPreference(theme);else try{localStorage.setItem('xiu-site-theme',theme);}catch{}}
}
let savedTheme = null;
try { savedTheme=window.xiuTheme?.getPreference()??localStorage.getItem('xiu-site-theme'); } catch {}
if(!['dark','light'].includes(savedTheme))savedTheme=null;
const media = matchMedia('(prefers-color-scheme: dark)');
applyTheme(['dark','light'].includes(savedTheme) ? savedTheme : media.matches ? 'dark' : 'light');
themeButton.addEventListener('click',()=>{savedTheme=root.dataset.theme==='dark'?'light':'dark';applyTheme(savedTheme,true);});
if(!window.xiuTheme)media.addEventListener('change',()=>{if(!savedTheme)applyTheme(media.matches?'dark':'light');});
new MutationObserver(()=>applyTheme(root.dataset.theme)).observe(root,{attributes:true,attributeFilter:['data-theme']});
const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('.site-nav');
function closeMenu(){nav.classList.remove('is-open');menuButton.setAttribute('aria-expanded','false');menuButton.textContent=english?'Menu':'菜单';}
menuButton.addEventListener('click',event=>{const opened=nav.classList.toggle('is-open');menuButton.setAttribute('aria-expanded',String(opened));menuButton.textContent=opened?(english?'Close':'收起'):(english?'Menu':'菜单');if(opened&&event.detail===0)nav.querySelector('a')?.focus({preventScroll:true});});
nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&nav.classList.contains('is-open')){closeMenu();menuButton.focus();}});
const anchors = [...nav.querySelectorAll('a[href^="#"]')];
if(anchors.length && 'IntersectionObserver' in window){
 const observer=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting){anchors.forEach(a=>{if(a.hash===`#${entry.target.id}`)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});}});},{rootMargin:'-15% 0px -60% 0px'});
 anchors.forEach(a=>{const section=document.querySelector(a.hash);if(section)observer.observe(section);});
}
const search=document.querySelector('#post-search');
if(search){
 let category='all';const entries=[...document.querySelectorAll('[data-post]')];const buttons=[...document.querySelectorAll('[data-category]')];
 function filterPosts(){const query=search.value.trim().toLowerCase();let count=0;entries.forEach(entry=>{const matched=(category==='all'||entry.dataset.post===category)&&entry.textContent.toLowerCase().includes(query);entry.hidden=!matched;if(matched)count++;});document.querySelector('#result-status').textContent=`${count} 篇记录`;document.querySelector('#empty-result').hidden=count>0;}
 buttons.forEach(button=>button.addEventListener('click',()=>{category=button.dataset.category;buttons.forEach(b=>b.setAttribute('aria-pressed',String(b===button)));filterPosts();}));
 document.querySelector('[data-reset-search]')?.addEventListener('click',()=>{category='all';search.value='';buttons.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.category==='all')));filterPosts();search.focus();});
 search.addEventListener('input',filterPosts);filterPosts();
}
document.querySelector('[data-print]')?.addEventListener('click',()=>window.print());
const cvEdit=document.querySelector('[data-edit-cv]');
if(cvEdit){
 const key='xiu-cv-draft-'+document.documentElement.lang;
 const fields=[...document.querySelectorAll('[data-cv-field]')];
 const original=new Map(fields.map(f=>[f.dataset.cvField,f.innerText]));
 function markField(f){const updated=f.innerText.trim()!==original.get(f.dataset.cvField).trim()&&f.innerText.trim()!=='';f.classList.toggle('cv-placeholder',!updated);f.classList.toggle('cv-edited',updated);f.closest('section').dataset.empty=String(!updated);}
 try{const draft=JSON.parse(localStorage.getItem(key)||'{}');fields.forEach(f=>{if(typeof draft[f.dataset.cvField]==='string')f.textContent=draft[f.dataset.cvField];markField(f);});}catch{fields.forEach(markField);}
 let editing=false;
 const names=english?{interests:'Research interests',experience:'Experience',awards:'Awards',skills:'Skills'}:{interests:'研究兴趣',experience:'实践经历',awards:'奖项与荣誉',skills:'技能'};
 cvEdit.addEventListener('click',()=>{editing=!editing;fields.forEach(f=>{f.contentEditable=String(editing);if(editing){f.setAttribute('role','textbox');f.setAttribute('aria-label',names[f.dataset.cvField]);f.setAttribute('aria-multiline','true');}else{f.removeAttribute('role');f.removeAttribute('aria-label');f.removeAttribute('aria-multiline');}markField(f);});cvEdit.textContent=editing?(english?'Save edits':'保存修改'):(english?'Edit template':'编辑模板');if(editing){fields[0].focus();}else{try{localStorage.setItem(key,JSON.stringify(Object.fromEntries(fields.map(f=>[f.dataset.cvField,f.innerText]))));}catch{cvEdit.textContent=english?'Storage unavailable':'浏览器无法保存';}}});
 fields.forEach(f=>f.addEventListener('input',()=>markField(f)));
}

// Progressive enhancement: native scrolling, links, history and CV editing stay intact.
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const loadingImage = document.querySelector('.journal-cover, .career-hero > img');
const imageReady = loadingImage?.decode ? loadingImage.decode().catch(() => {}) : Promise.resolve();
const fontsReady = document.fonts?.ready || Promise.resolve();
Promise.race([Promise.all([imageReady, fontsReady]), new Promise(resolve => setTimeout(resolve, 1000))])
  .finally(() => delete root.dataset.loading);
addEventListener('pageshow', () => { delete root.dataset.loading; });

// The single moving highlight follows the actual link bounds, including after fonts load.
const navIndicator = document.createElement('span');
nav.classList.add('liquid-surface');
navIndicator.className = 'nav-indicator';
navIndicator.setAttribute('aria-hidden', 'true');
nav.prepend(navIndicator);
const navLinks = [...nav.querySelectorAll('a')];
let indicatedLink = null;
function moveHighlight(link) {
  if (!link || !link.getClientRects().length || innerWidth < 768) {
    nav.classList.remove('has-indicator');
    return;
  }
  indicatedLink = link;
  nav.style.setProperty('--indicator-x', `${link.offsetLeft}px`);
  nav.style.setProperty('--indicator-y', `${link.offsetTop}px`);
  nav.style.setProperty('--indicator-width', `${link.offsetWidth}px`);
  nav.style.setProperty('--indicator-height', `${link.offsetHeight}px`);
  nav.classList.add('has-indicator');
}
function currentNavLink() {
  return nav.querySelector('a[aria-current]') || navLinks.find(a => a.hash && location.hash === a.hash) || navLinks[0];
}
navLinks.forEach(link => {
  link.addEventListener('pointerenter', () => moveHighlight(link));
  link.addEventListener('focus', () => moveHighlight(link));
});
nav.addEventListener('pointerleave', () => moveHighlight(currentNavLink()));
nav.addEventListener('focusout', event => { if (!nav.contains(event.relatedTarget)) moveHighlight(currentNavLink()); });
new MutationObserver(() => moveHighlight(currentNavLink())).observe(nav, {subtree:true, attributes:true, attributeFilter:['aria-current']});
if ('ResizeObserver' in window) new ResizeObserver(() => moveHighlight(indicatedLink || currentNavLink())).observe(nav);
document.fonts?.ready.then(() => moveHighlight(currentNavLink()));
moveHighlight(currentNavLink());

// Mobile navigation dismisses on outside input and whenever it becomes a desktop nav.
document.addEventListener('pointerdown', event => {
  if (nav.classList.contains('is-open') && !event.target.closest('.site-header')) closeMenu();
});
matchMedia('(min-width:768px)').addEventListener('change', event => { if (event.matches) closeMenu(); });

// Reveal only selected content groups. Body text and print content remain immediately usable.
if ('IntersectionObserver' in window) {
  const revealTargets = [...document.querySelectorAll('.post-entry, .music-shelf, .photo-section, .career-section, .cv-section')];
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.remove('reveal-pending');
      entry.target.classList.add('reveal-visible');
      revealObserver.unobserve(entry.target);
    });
  }, {threshold:0, rootMargin:'0px 0px -24px 0px'});
  if (!reducedMotion.matches) revealTargets.forEach((target, index) => {
    target.style.setProperty('--reveal-delay', `${Math.min(index % 2, 1) * 65}ms`);
    target.classList.add('reveal-pending');
    revealObserver.observe(target);
  });
  reducedMotion.addEventListener('change', event => {
    if (event.matches) { revealObserver.disconnect(); revealTargets.forEach(el => el.classList.remove('reveal-pending')); }
  });
  const topMarker = document.createElement('span');
  topMarker.setAttribute('aria-hidden', 'true');
  topMarker.style.cssText = 'position:absolute;top:500px;left:0;width:1px;height:1px;pointer-events:none';
  document.body.append(topMarker);
  new IntersectionObserver(([entry]) => {
    document.querySelector('.reading-tools')?.classList.toggle('is-visible', !entry.isIntersecting && entry.boundingClientRect.top < 0);
  }).observe(topMarker);
}

// Intent-based prefetch warms just a few same-origin HTML pages; no wheel/touch hijacking.
const prefetchedPages = new Set();
let prefetchIntent;
function prefetchPage(anchor) {
  if (!anchor || anchor.hasAttribute('download') || anchor.target === '_blank') return;
  const connection = navigator.connection;
  if (connection?.saveData || /(^|-)2g$/.test(connection?.effectiveType || '')) return;
  const url = new URL(anchor.href, location.href);
  if (url.origin !== location.origin || !url.pathname.endsWith('/') || url.pathname === location.pathname || prefetchedPages.has(url.pathname) || prefetchedPages.size >= 6) return;
  prefetchedPages.add(url.pathname);
  const preload = document.createElement('link');
  preload.rel = 'prefetch'; preload.href = url.pathname; preload.as = 'document';
  document.head.append(preload);
}
document.addEventListener('pointerover', event => {
  const anchor = event.target.closest('a');
  clearTimeout(prefetchIntent);
  if (anchor) prefetchIntent = setTimeout(() => prefetchPage(anchor), 100);
});
document.addEventListener('pointerout', () => clearTimeout(prefetchIntent));
document.addEventListener('focusin', event => prefetchPage(event.target.closest('a')));

// Small sites benefit from quick navigation, rather than a dashboard's dense menu hierarchy.
const quickDialog = document.querySelector('.quick-dialog');
if (quickDialog && typeof quickDialog.showModal === 'function') {
  const quickButton = document.createElement('button');
  quickButton.type = 'button'; quickButton.className = 'quick-toggle';
  quickButton.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4 4"/></svg><kbd>K</kbd>';
  quickButton.setAttribute('aria-label', english ? 'Quick navigation (Control or Command K)' : '快速跳转（Ctrl 或 Command K）');
  quickButton.setAttribute('aria-haspopup', 'dialog');
  quickButton.title = english ? 'Quick navigation' : '快速跳转';
  document.querySelector('.header-tools').prepend(quickButton);
  const quickInput = quickDialog.querySelector('input');
  const quickResults = quickDialog.querySelector('.quick-results');
  const quickPages = english ? [
    ['Profile','/en/','Education and interests'],['Journal','/journal/','日常记录'],['Archives','/journal/archives/','All records'],['Music','/journal/music/','Red Velvet · NMIXX'],['Crazy Cow','/journal/crazy-cow/','A small game'],['Photos','/journal/photos/','相册'],['About','/journal/about/','关于修源'],['CV','/en/cv/','Editable template'],['中文主页','/','Chinese profile']
  ] : [
    ['职业主页','/','教育与简历'],['日常记录','/journal/','音乐、生活与小作品'],['归档','/journal/archives/','按时间查看记录'],['耳机里的片刻','/journal/music/','音乐与留白'],['Crazy Cow','/journal/crazy-cow/','一个 3D 牧场小游戏'],['相册','/journal/photos/','照片与记录'],['关于我','/journal/about/','修源'],['书影音','/journal/books/','读过与看过'],['朋友们的主页','/journal/friends/','友链'],['简历','/cv/','编辑与打印'],['English','/en/','Yuan Xiu']
  ];
  let returnFocus;
  function filterQuickPages() {
    const query = quickInput.value.trim().toLowerCase();
    const matches = quickPages.filter(page => page.join(' ').toLowerCase().includes(query));
    quickResults.replaceChildren(...matches.map(([label, href, description], index) => {
      const li = document.createElement('li');
      const a = document.createElement('a'); a.href = href;
      const title = document.createElement('span'); title.textContent = label;
      const note = document.createElement('small'); note.textContent = description;
      a.append(title, note); a.dataset.selected = String(index === 0);
      a.addEventListener('focus', () => quickResults.querySelectorAll('a').forEach(el => el.dataset.selected = String(el === a)));
      a.addEventListener('click', () => quickDialog.close());
      li.append(a); return li;
    }));
    quickDialog.querySelector('.quick-empty').hidden = matches.length > 0;
    quickDialog.querySelector('#quick-status').textContent = english ? `${matches.length} pages` : `${matches.length} 个页面`;
  }
  function openQuickPages() {
    if (quickDialog.open) { quickDialog.close(); return; }
    closeMenu(); returnFocus = document.activeElement;
    quickInput.value = ''; filterQuickPages(); quickDialog.showModal(); quickInput.focus();
  }
  quickButton.addEventListener('click', openQuickPages);
  quickDialog.querySelector('.quick-close').addEventListener('click', () => quickDialog.close());
  quickDialog.addEventListener('click', event => { if (event.target === quickDialog) {
    const box = quickDialog.getBoundingClientRect();
    if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) quickDialog.close();
  }});
  quickDialog.addEventListener('close', () => returnFocus?.focus());
  quickInput.addEventListener('input', filterQuickPages);
  quickDialog.addEventListener('keydown', event => {
    const links = [...quickResults.querySelectorAll('a')];
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      const direction = event.key === 'ArrowDown' ? 1 : -1;
      const current = links.indexOf(document.activeElement);
      if (!links.length) return;
      const index = current < 0 ? (direction === 1 ? 0 : links.length - 1) : (current + direction + links.length) % links.length;
      links[index].focus();
    } else if (event.key === 'Enter' && document.activeElement === quickInput) {
      event.preventDefault(); links[0]?.click();
    }
  });
  document.addEventListener('keydown', event => {
    const editing = event.target.closest('input,textarea,select,[contenteditable=true]');
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k' && (!editing || quickDialog.open)) {
      event.preventDefault(); openQuickPages();
    }
  });
}

// Contrast follows the surface behind the floating controls, without a scroll handler.
const siteHeader = document.querySelector('.site-header');
const coverStage = document.querySelector('.cover-stage');
if (coverStage && 'IntersectionObserver' in window) {
  siteHeader.dataset.overCover = 'true';
  new IntersectionObserver(([entry]) => {
    siteHeader.dataset.overCover = String(entry.isIntersecting);
  }, {rootMargin:'-86px 0px 0px 0px', threshold:0}).observe(coverStage);
}

// A rounded-rectangle displacement map refracts the background only along the rim.
// Text is never filtered. Unsupported SVG backdrop filters retain the CSS material.
const glassElements = [...document.querySelectorAll('.site-nav,.header-tools,.hero-link,.hero-card,.career-lens')];
glassElements.forEach(element => element.classList.add('liquid-surface'));
const reducedTransparency = matchMedia('(prefers-reduced-transparency: reduce)');
if (CSS.supports('backdrop-filter', 'url("#liquid-lens")') && 'ResizeObserver' in window) {
  const svgNS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(svgNS, 'svg');
  svg.classList.add('liquid-defs'); svg.setAttribute('aria-hidden', 'true');
  const defs = document.createElementNS(svgNS, 'defs'); svg.append(defs); document.body.append(svg);
  const maps = new WeakMap();
  function updateLens(element, index) {
    if (reducedTransparency.matches || element.closest('.site-header')) { element.style.removeProperty('backdrop-filter'); return; }
    const box = element.getBoundingClientRect();
    const width = Math.round(box.width), height = Math.round(box.height);
    if (width < 5 || height < 5 || width > 850 || height > 400 || (innerWidth < 768 && element === nav)) return;
    const previous = maps.get(element);
    if (previous?.width === width && previous?.height === height) return;
    const radius = Math.min(parseFloat(getComputedStyle(element).borderTopLeftRadius) || 26, width / 2, height / 2);
    const rim = Math.min(13, radius * .7);
    const canvas = document.createElement('canvas'); canvas.width = width; canvas.height = height;
    const context = canvas.getContext('2d');
    if (!context) return;
    const pixels = context.createImageData(width, height);
    for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
      const dx = x + .5 - width / 2, dy = y + .5 - height / 2;
      const qx = Math.abs(dx) - (width / 2 - radius), qy = Math.abs(dy) - (height / 2 - radius);
      const ox = Math.max(qx, 0), oy = Math.max(qy, 0), length = Math.hypot(ox, oy);
      const depth = -(length + Math.min(Math.max(qx, qy), 0) - radius);
      let nx = 0, ny = 0;
      if (length > 0) { nx = ox / length * Math.sign(dx); ny = oy / length * Math.sign(dy); }
      else if (qx > qy) nx = Math.sign(dx); else ny = Math.sign(dy);
      const bend = depth > 0 && depth < rim ? Math.sin(Math.PI * depth / rim) * .8 : 0;
      const offset = (y * width + x) * 4;
      pixels.data[offset] = 128 + nx * bend * 127;
      pixels.data[offset + 1] = 128 + ny * bend * 127;
      pixels.data[offset + 2] = 128; pixels.data[offset + 3] = 255;
    }
    context.putImageData(pixels, 0, 0);
    const filter = previous?.filter || document.createElementNS(svgNS, 'filter');
    const id = `liquid-rim-${index}`;
    filter.setAttribute('id', id); filter.setAttribute('filterUnits', 'userSpaceOnUse');
    filter.setAttribute('x', '0'); filter.setAttribute('y', '0');
    filter.setAttribute('width', String(width)); filter.setAttribute('height', String(height));
    filter.setAttribute('color-interpolation-filters', 'sRGB');
    const image = document.createElementNS(svgNS, 'feImage');
    image.setAttribute('href', canvas.toDataURL()); image.setAttribute('width', String(width)); image.setAttribute('height', String(height)); image.setAttribute('result', 'rim');
    const displacement = document.createElementNS(svgNS, 'feDisplacementMap');
    displacement.setAttribute('in', 'SourceGraphic'); displacement.setAttribute('in2', 'rim');
    displacement.setAttribute('scale', '28'); displacement.setAttribute('xChannelSelector', 'R'); displacement.setAttribute('yChannelSelector', 'G');
    filter.replaceChildren(image, displacement);
    if (!previous) defs.append(filter);
    maps.set(element, {width, height, filter});
    element.style.backdropFilter = `url("#${id}") blur(.6px) saturate(1.22)`;
  }
  const observer = new ResizeObserver(entries => entries.forEach(entry => updateLens(entry.target, glassElements.indexOf(entry.target))));
  glassElements.forEach(element => observer.observe(element));
  reducedTransparency.addEventListener('change', () => {
    glassElements.forEach((element, index) => {
      const previous = maps.get(element);
      if (previous) { previous.width = 0; previous.height = 0; }
      updateLens(element, index);
    });
  });
}

if (!reducedMotion.matches && matchMedia('(hover:hover)').matches) glassElements.forEach(element => {
  let lightFrame = 0;
  element.addEventListener('pointermove', event => {
    if (reducedMotion.matches) return;
    cancelAnimationFrame(lightFrame);
    lightFrame = requestAnimationFrame(() => {
      const box = element.getBoundingClientRect();
      element.style.setProperty('--light-x', `${(event.clientX - box.left) / box.width * 100}%`);
      element.style.setProperty('--light-y', `${(event.clientY - box.top) / box.height * 100}%`);
    });
  });
  element.addEventListener('pointerleave', () => {
    cancelAnimationFrame(lightFrame); element.style.removeProperty('--light-x'); element.style.removeProperty('--light-y');
  });
});
