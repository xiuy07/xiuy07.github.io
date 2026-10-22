(() => {
  'use strict';
  const data = window.CPP_GUIDE;
  const $ = (selector) => document.querySelector(selector);
  const main = $('#main');
  const toc = $('#toc');
  const sidebar = $('#sidebar');
  const storageKey = 'cpp-guide-progress-v1';
  let state = { read: [], done: [], results: {}, last: '' };
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || 'null');
    if (saved && Array.isArray(saved.read) && Array.isArray(saved.done)) {
      state = { ...state, ...saved };
      state.read = saved.read.filter(id => data.chapters.some(c => c.id === id));
      state.done = saved.done.filter(id => data.problems.some(p => p.id === id));
    }
  } catch { /* 阅读功能不依赖存储权限。 */ }

  function escape(text) {
    return String(text).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  }
  let noticeTimer;
  function notify(text) {
    $('#status').textContent = text;
    clearTimeout(noticeTimer);
    noticeTimer = setTimeout(() => { $('#status').textContent = ''; }, 3500);
  }
  function save() {
    try { localStorage.setItem(storageKey, JSON.stringify(state)); }
    catch { notify('当前浏览器无法保存进度；页面仍可正常阅读。'); }
    updateNav();
  }
  function updateNav() {
    let group = '';
    let html = '<a class="nav-link" href="#start">学习路线与使用方法</a>';
    for (const chapter of data.chapters) {
      if (chapter.group !== group) {
        group = chapter.group;
        html += `<p class="nav-group">${escape(group)}</p>`;
      }
      html += `<a class="nav-link ${state.read.includes(chapter.id) ? 'read' : ''}" href="#chapter/${chapter.id}"><span class="nav-num">${String(chapter.number).padStart(2, '0')}</span><span>${escape(chapter.title)}</span></a>`;
    }
    html += '<p class="nav-group">练习与查阅</p><a class="nav-link" href="#practice">全部练习与测试结果</a><a class="nav-link" href="#sources">课程映射与参考来源</a>';
    $('#course-nav').innerHTML = html;
    $('#progress-text').textContent = `${state.read.length} / ${data.chapters.length}`;
    $('#progress').value = state.read.length;
    const route = location.hash.split('~')[0] || '#start';
    for (const link of document.querySelectorAll('#course-nav a')) {
      const active = link.getAttribute('href') === route;
      link.classList.toggle('active', active);
      if (active) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    }
  }
  function footer() {
    return '<footer class="site-foot">C++17 学习主线 · 2026-10-23<br>讲解、代码与测试可离线使用。<a href="#sources">查看参考来源</a>，或回到 <a href="../handbooks/">学习讲义</a>。</footer>';
  }
  function exerciseLinks(ids) {
    return '<div class="exercise-links">' + ids.map(id => {
      const p = data.problems.find(x => x.id === id);
      return `<a href="#problem/${id}"><span><code>${id}</code> ${escape(p.title)}</span><small>${state.done.includes(id) ? '已完成' : p.difficulty} · ${p.test_count} 组测试</small></a>`;
    }).join('') + '</div>';
  }
  function home() {
    const resume = data.chapters.find(c => c.id === state.last) || data.chapters[0];
    let html = `<p class="breadcrumb">学习讲义 / C++</p><h1>从 C 基础走向现代 C++</h1><p class="lead">沿着高级程序设计的课程主线，先看懂机制，再运行示例，最后用本地测试检查自己写的程序。</p><div class="meta"><span>16 章精简讲解</span><span>16 个可运行示例</span><span>32 道配套练习</span></div><div class="actions"><a class="button primary" href="#chapter/${resume.id}">${state.last ? '继续阅读' : '从第一章开始'}</a><a class="button" href="downloads/cpp-study-kit.zip" download>下载代码与测试</a></div><div class="intro-strip"><p>先完成一次：打开 <code>practice/solutions/p01/main.cpp</code>，填写代码，再运行：</p><pre><code>python practice/judge.py p01</code></pre><p>需要 Python 3.9+ 与支持 C++17 的 GCC / Clang。网页负责讲解，本机负责实际编译与评测。</p></div><h2 id="how">每章怎样学</h2><ol><li>先读机制，能用自己的话解释对象、区间或状态。</li><li>预测示例输出，再运行 <code>python practice/judge.py demo d01</code> 验证。</li><li>在预留的 <code>solutions/</code> 文件里实现练习，失败后看具体输入与差异。</li><li>需要时逐层展开提示，完成后再看参考实现。</li></ol><h2 id="route">学习路线</h2><p class="phase-note">前 4 章可按基础跳读；指针、拷贝、多态与模板建议亲手完成对应接口题。每章时间是首次阅读估计，不含练习。</p>`;
    let group = '';
    for (const c of data.chapters) {
      if (c.group !== group) {
        if (group) html += '</div>';
        group = c.group;
        html += `<h3 class="phase">${escape(group)}</h3><div class="route-list">`;
      }
      html += `<a class="route-row" href="#chapter/${c.id}"><span class="route-number">${String(c.number).padStart(2, '0')}</span><div><span class="route-title">${escape(c.title)}</span><p>${escape(c.summary)}</p></div><span class="route-time">${state.read.includes(c.id) ? '已读' : `${c.minutes} 分钟`}</span></a>`;
    }
    html += '</div><h2 id="local">本地练习怎么用</h2><p>学习包中的 <code>README.md</code> 有完整操作说明。评测器使用 Python 标准库，不依赖 npm。类与模板题填写 <code>solution.hpp</code>，固定入口调用你的接口；普通程序题填写 <code>main.cpp</code>。</p><pre><code>python practice/judge.py list\npython practice/judge.py p01\npython practice/judge.py all --keep-going\npython practice/judge.py demo all</code></pre><p>你还可以在 <code>notes/我的笔记.md</code>、<code>notes/错题本.md</code> 和 <code>notes/my_program.cpp</code> 继续记录自己的内容。</p><div class="callout"><h3>已经学过一些 C++？</h3><p>按薄弱点补：数组与 const 看 03–04；资源与特殊成员看 05–08；虚函数和对象切片看 09–10；模板与异常看 12–14。最近练过的最大空白矩形，在第 15 章逐步解释共同底边与弹栈边界。</p></div>';
    main.innerHTML = html + footer();
  }
  function chapterPage(chapter) {
    state.last = chapter.id;
    save();
    const index = chapter.number - 1;
    const previous = data.chapters[index - 1];
    const next = data.chapters[index + 1];
    main.innerHTML = `<p class="breadcrumb"><a href="#start">学习路线</a> / 第 ${chapter.number} 章</p><h1>${escape(chapter.title)}</h1><p class="lead">${escape(chapter.summary)}</p><div class="meta"><span>${escape(chapter.group)}</span><span>阅读约 ${chapter.minutes} 分钟</span><span>1 个示例 · 2 道练习</span></div><article>${chapter.html}</article><section class="chapter-foot"><h2 id="chapter-practice">动手练习</h2>${exerciseLinks(chapter.problems)}<h3>延伸阅读</h3><p>${escape(chapter.reading)}</p><p><a href="#sources">查看书目与课程对应关系</a>。练习运行以本指南 C++17 约定为准。</p><div class="completion"><span>能解释示例，并独立完成练习后，再继续下一章。</span><button id="mark-read" type="button" aria-pressed="${state.read.includes(chapter.id)}">${state.read.includes(chapter.id) ? '已标记读完' : '标记本章读完'}</button></div><nav class="pager" aria-label="相邻章节">${previous ? `<a href="#chapter/${previous.id}"><small>上一章</small>${escape(previous.title)}</a>` : '<a href="#start"><small>返回</small>学习路线</a>'}${next ? `<a href="#chapter/${next.id}"><small>下一章</small>${escape(next.title)}</a>` : '<a href="#practice"><small>继续练习</small>全部题目</a>'}</nav></section>${footer()}`;
    $('#mark-read').addEventListener('click', event => {
      const found = state.read.includes(chapter.id);
      state.read = found ? state.read.filter(id => id !== chapter.id) : [...state.read, chapter.id];
      event.currentTarget.setAttribute('aria-pressed', String(!found));
      event.currentTarget.textContent = found ? '标记本章读完' : '已标记读完';
      save();
      notify(found ? '已取消读完标记。' : '已保存本章阅读进度。');
    });
  }
  function practicePage() {
    main.innerHTML = `<p class="breadcrumb"><a href="#start">学习路线</a> / 练习</p><h1>把理解写成程序</h1><p class="lead">32 道练习随章节推进。先在本地文件中完成，再用配套测试核对。所有参考实现和测试也保留在学习包内。</p><div class="actions"><a class="button primary" href="downloads/cpp-study-kit.zip" download>下载完整学习包</a><a class="button" href="README.md">查看本地使用说明</a></div><div class="filters"><label>查找题目<input id="problem-search" type="search" placeholder="题号、名称或知识点"></label><label>所属章节<select id="chapter-filter"><option value="all">全部章节</option>${data.chapters.map(c => `<option value="${c.number}">${String(c.number).padStart(2, '0')} ${escape(c.title)}</option>`).join('')}</select></label><label>完成状态<select id="state-filter"><option value="all">全部</option><option value="todo">未完成</option><option value="done">已完成</option></select></label></div><p id="problem-count" class="phase-note" aria-live="polite"></p><table class="exercise-table"><thead><tr><th scope="col">题号</th><th scope="col">题目</th><th scope="col" class="chapter-cell">章节</th><th scope="col">状态</th></tr></thead><tbody id="problem-rows"></tbody></table><p id="problem-empty" class="empty" hidden>没有符合条件的题目。试试更短的关键词，或清除筛选条件。</p><div class="result-tools"><label for="import-results">导入本地测试结果</label><input id="import-results" type="file" accept="application/json,.json"><p>选择评测器生成的 <code>practice/local-results.json</code>。只在当前浏览器读取，不上传；参考解的测试结果不会计入自己的完成进度。</p></div>${footer()}`;
    function filter() {
      const query = $('#problem-search').value.toLowerCase().trim();
      const chapter = $('#chapter-filter').value;
      const status = $('#state-filter').value;
      const selected = data.problems.filter(p => (chapter === 'all' || p.chapter === Number(chapter)) &&
        (status === 'all' || state.done.includes(p.id) === (status === 'done')) &&
        (!query || `${p.id} ${p.title} ${p.search}`.toLowerCase().includes(query)));
      $('#problem-count').textContent = `${selected.length} 道题 · 已完成 ${state.done.length} / ${data.problems.length}`;
      $('#problem-empty').hidden = selected.length > 0;
      $('#problem-rows').innerHTML = selected.map(p => `<tr><td>${p.id}</td><td><a href="#problem/${p.id}">${escape(p.title)}</a><small>${p.difficulty} · ${p.mode === 'header' ? '接口题' : '完整程序'} · ${p.test_count} 组测试</small></td><td class="chapter-cell">第 ${p.chapter} 章</td><td class="${state.done.includes(p.id) ? 'done' : 'difficulty'}">${state.done.includes(p.id) ? '已完成' : '待练习'}</td></tr>`).join('');
    }
    $('#problem-search').addEventListener('input', filter);
    $('#chapter-filter').addEventListener('change', filter);
    $('#state-filter').addEventListener('change', filter);
    $('#import-results').addEventListener('change', async event => {
      const file = event.target.files[0];
      if (!file) return;
      try {
        if (file.size > 1024 * 1024) throw Error('结果文件过大，请选择评测器生成的 JSON。');
        const result = JSON.parse(await file.text());
        if (result.version !== 1 || !Array.isArray(result.results)) throw Error('结果格式不正确。');
        if (result.reference === true) throw Error('这是参考解结果，不计入你自己的完成进度。');
        const allowed = new Set(data.problems.map(p => p.id));
        let count = 0;
        for (const item of result.results) {
          if (!allowed.has(item.id) || !['AC', 'WA', 'CE', 'RE', 'TLE', 'OLE', 'MISSING', 'ERROR'].includes(item.status)) continue;
          state.done = state.done.filter(id => id !== item.id);
          if (item.status === 'AC') { state.done.push(item.id); count++; }
          state.results[item.id] = item.status;
        }
        save(); filter(); notify(`已导入测试结果，其中 ${count} 题通过。`);
      } catch (error) { notify(error instanceof SyntaxError ? '无法解析 JSON，请选择 local-results.json。' : error.message); }
      event.target.value = '';
    });
    filter();
  }
  function problemPage(p) {
    const chapter = data.chapters[p.chapter - 1];
    const next = data.problems[data.problems.indexOf(p) + 1];
    main.innerHTML = `<p class="breadcrumb"><a href="#practice">全部练习</a> / ${p.id}</p><h1>${escape(p.title)}</h1><div class="meta"><span>${p.difficulty}</span><span>${p.mode === 'header' ? '接口题' : '完整程序题'}</span><span>${p.test_count} 组公开测试</span><span>第 ${p.chapter} 章</span></div><div class="intro-strip"><p>先阅读 <a href="#chapter/${chapter.id}">${escape(chapter.title)}</a>，在学习包中的 <code>practice/solutions/${p.id}/${p.filename}</code> 编写。</p><pre><code>python practice/judge.py ${p.id}</code></pre></div><article>${p.html}</article><h2 id="starter">预留代码框架</h2><p>在自己的文件里填写 TODO。网页中的代码用于阅读与复制，实际编译在本机进行。</p><details><summary>查看 ${p.filename} 初始框架</summary>${p.starter_html}</details>${p.mode === 'header' ? `<details><summary>查看固定测试入口（无需修改）</summary>${p.driver_html}</details>` : ''}<h2 id="hints">遇到困难时</h2>${p.hints.map((hint, i) => `<details><summary>提示 ${i + 1}</summary><p>${escape(hint)}</p></details>`).join('')}<details><summary>查看思路与参考实现</summary><p>${escape(p.analysis)}</p><p>完成后再核对，也可以运行 <code>python practice/judge.py ${p.id} --reference</code> 检查参考实现；这不会改动自己的文件。</p>${p.reference_html}</details><div class="chapter-foot"><div class="completion"><span>测试通过后，检查题面要求的复杂度与资源释放。</span><button id="mark-done" type="button" aria-pressed="${state.done.includes(p.id)}">${state.done.includes(p.id) ? '已标记完成' : '标记本题完成'}</button></div><nav class="pager" aria-label="练习导航"><a href="#practice"><small>返回</small>全部练习</a>${next ? `<a href="#problem/${next.id}"><small>下一题 ${next.id}</small>${escape(next.title)}</a>` : `<a href="#chapter/${chapter.id}"><small>回顾</small>综合练习讲解</a>`}</nav></div>${footer()}`;
    $('#mark-done').addEventListener('click', event => {
      const done = state.done.includes(p.id);
      state.done = done ? state.done.filter(id => id !== p.id) : [...state.done, p.id];
      event.currentTarget.setAttribute('aria-pressed', String(!done));
      event.currentTarget.textContent = done ? '标记本题完成' : '已标记完成';
      save(); notify(done ? '已取消完成标记。' : '已保存手动完成标记。');
    });
  }
  function decorate() {
    for (const pre of main.querySelectorAll('pre')) {
      const text = (pre.querySelector('code') || pre).textContent;
      pre.tabIndex = 0;
      pre.setAttribute('aria-label', '代码或输入输出，可横向滚动');
      const button = document.createElement('button');
      button.type = 'button'; button.className = 'copy-button'; button.textContent = '复制';
      button.setAttribute('aria-label', '复制此代码块');
      button.addEventListener('click', async () => {
        try {
          if (navigator.clipboard && window.isSecureContext) await navigator.clipboard.writeText(text);
          else {
            const area = document.createElement('textarea'); area.value = text;
            area.style.position = 'fixed'; area.style.left = '-9999px';
            document.body.append(area); area.select();
            const ok = document.execCommand('copy'); area.remove();
            if (!ok) throw Error('copy');
            button.focus();
          }
          notify('已复制。');
        } catch { notify('浏览器未允许复制，请选中代码后手动复制。'); }
      });
      pre.append(button);
    }
    for (const table of main.querySelectorAll('article table')) {
      const wrapper = document.createElement('div'); wrapper.className = 'table-wrap';
      table.before(wrapper); wrapper.append(table);
    }
    const headings = [...main.querySelectorAll('h2[id]')];
    toc.innerHTML = headings.length ? '<p>本页内容</p>' + headings.map(h => `<a href="${location.hash.split('~')[0] || '#start'}~${encodeURIComponent(h.id)}">${escape(h.textContent)}</a>`).join('') : '';
  }
  let renderedRoute = '';
  function render() {
    const [path, anchor] = (location.hash.slice(1) || 'start').split('~');
    if (path !== renderedRoute) {
      const [kind, id] = path.split('/');
      let title = 'C++ 学习指南';
      if (kind === 'start') home();
      else if (kind === 'practice') { practicePage(); title = '全部练习'; }
      else if (kind === 'sources') { main.innerHTML = `<p class="breadcrumb"><a href="#start">学习路线</a> / 来源</p><h1>课程映射与参考来源</h1><article>${data.sources}</article>${footer()}`; title = '课程映射与参考来源'; }
      else if (kind === 'chapter' && data.chapters.some(c => c.id === id)) { const c = data.chapters.find(c => c.id === id); chapterPage(c); title = c.title; }
      else if (kind === 'problem' && data.problems.some(p => p.id === id)) { const p = data.problems.find(p => p.id === id); problemPage(p); title = `${p.id} ${p.title}`; }
      else main.innerHTML = '<h1>没有找到这一页</h1><p>链接可能不完整。可以从左侧目录选择章节，或搜索知识点。</p><a class="button primary" href="#start">返回学习路线</a>';
      document.title = title === 'C++ 学习指南' ? 'C++ 学习指南 · 讲解与本地练习' : `${title} · C++ 学习指南`;
      renderedRoute = path; decorate(); updateNav();
      window.scrollTo(0, 0);
      if (location.hash) main.focus({ preventScroll: true });
    }
    if (anchor) {
      try { document.getElementById(decodeURIComponent(anchor))?.scrollIntoView(); } catch { /* 无效锚点保持页面可用。 */ }
    }
    sidebar.classList.remove('open'); $('#menu-toggle').setAttribute('aria-expanded', 'false');
    $('#search-results').hidden = true;
  }
  $('#menu-toggle').addEventListener('click', () => {
    const open = sidebar.classList.toggle('open'); $('#menu-toggle').setAttribute('aria-expanded', String(open));
  });
  $('.skip').addEventListener('click', event => {
    event.preventDefault(); main.focus({ preventScroll: true }); window.scrollTo(0, 0);
  });
  $('#search-results').addEventListener('click', event => {
    if (event.target.closest('a')) $('#search-results').hidden = true;
  });
  $('#search').addEventListener('input', event => {
    const query = event.target.value.trim().toLowerCase();
    const results = $('#search-results');
    results.hidden = !query;
    if (!query) return;
    const matches = [...data.chapters.map(c => ({ href: `#chapter/${c.id}`, title: `第 ${c.number} 章 ${c.title}`, context: c.summary, search: c.title + c.search })), ...data.problems.map(p => ({ href: `#problem/${p.id}`, title: `${p.id} ${p.title}`, context: `第 ${p.chapter} 章 · ${p.difficulty} · ${p.source.label}`, search: p.id + p.title + p.search }))].filter(item => item.search.toLowerCase().includes(query)).slice(0, 14);
    results.innerHTML = matches.length ? matches.map(item => `<a href="${item.href}">${escape(item.title)}<small>${escape(item.context)}</small></a>`).join('') : '<p>没有找到结果，试试“指针”“拷贝”或“p13”。</p>';
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') { $('#search-results').hidden = true; sidebar.classList.remove('open'); $('#menu-toggle').setAttribute('aria-expanded', 'false'); }
  });
  document.addEventListener('click', event => {
    if (!event.target.closest('.search-wrap')) $('#search-results').hidden = true;
  });
  window.addEventListener('hashchange', render);
  render();
})();
