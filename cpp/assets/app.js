(() => {
  'use strict';
  const data = window.CPP_GUIDE;
  const $ = (selector) => document.querySelector(selector);
  const main = $('#main');
  const toc = $('#toc');
  const sidebar = $('#sidebar');
  const storageKey = 'cpp-guide-progress-v1';
  let state = { read: [], done: [], results: {}, last: '', track: 'cpp', font: 18, dark: false };
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
    for (const chapter of data.chapters.filter(c => c.track === state.track)) {
      if (chapter.group !== group) {
        group = chapter.group;
        html += `<p class="nav-group">${escape(group)}</p>`;
      }
      html += `<a class="nav-link ${state.read.includes(chapter.id) ? 'read' : ''}" href="#chapter/${chapter.id}"><span class="nav-num">${String(chapter.number).padStart(2, '0')}</span><span>${escape(chapter.title)}</span></a>`;
    }
    html += '<p class="nav-group">练习与查阅</p><a class="nav-link" href="#implementations">实现索引与复杂度</a><a class="nav-link" href="#practice">全部练习与测试结果</a><a class="nav-link" href="#sources">课程映射与参考来源</a>';
    $('#course-nav').innerHTML = html;
    $('#progress-text').textContent = `${state.read.length} / ${data.chapters.length}`;
    $('#progress').max = data.chapters.length;
    $('#progress').value = state.read.length;
    for (const b of document.querySelectorAll('[data-track]')) b.setAttribute('aria-pressed', String(b.dataset.track === state.track));
    const route = location.hash.split('~')[0] || '#start';
    for (const link of document.querySelectorAll('#course-nav a')) {
      const active = link.getAttribute('href') === route;
      link.classList.toggle('active', active);
      if (active) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    }
  }
  function footer() {
    return '<footer class="site-foot">C++17 · 数据结构与算法 · 2026-10-23<br>讲解、代码与测试可离线使用。<a href="#sources">查看参考来源</a>，或回到 <a href="../handbooks/">学习讲义</a>。</footer>';
  }
  function exerciseLinks(ids) {
    return '<div class="exercise-links">' + ids.map(id => {
      const p = data.problems.find(x => x.id === id);
      return `<a href="#problem/${id}"><span><code>${id}</code> ${escape(p.title)}</span><small>${state.done.includes(id) ? '已完成' : p.difficulty} · ${p.test_count} 组测试</small></a>`;
    }).join('') + '</div>';
  }
  function home() {
    const resume = data.chapters.find(c => c.id === state.last && c.track === state.track) || data.chapters.find(c => c.track === state.track);
    const chapters = data.chapters.filter(c => c.track === state.track);
    main.innerHTML = `<p class="breadcrumb">学习讲义 / PROGRAMMING & ALGORITHMS</p><p class="book-label">两门课程，一条动手学习的路线</p><h1>理解机制，<br>把算法写出来。</h1><p class="lead">从 C++ 的对象与资源管理，到数据结构的不变式与算法设计。读讲解、手推过程、运行示例，再用本地测试检查自己的实现。</p><div class="meta"><span>${data.chapters.length} 章讲义</span><span>${data.chapters.length} 个运行示例</span><span>${data.problems.length} 道编程练习</span><span>每个算法章节附手推题</span></div><div class="actions"><a class="button primary" href="#chapter/${resume.id}">${state.last ? '继续阅读' : '开始阅读'}</a><a class="button" href="downloads/cpp-study-kit.zip" download>下载代码与测试</a></div><div class="volume-intro"><a href="#chapter/${data.chapters[0].id}"><span>上篇 · 01—16</span><strong>C++ 语言与程序设计</strong><p>类型、对象、资源、继承、模板与标准库。</p></a><a href="#chapter/17-analysis"><span>下篇 · 17—32</span><strong>数据结构与算法</strong><p>线性结构、树、哈希、图、排序与区间查询。</p></a></div><h2 id="route">${state.track === 'dsa' ? '下篇 · 数据结构与算法' : '上篇 · C++ 语言'}</h2><p class="phase-note">左侧切换上下篇。每章从问题与不变式开始，代码与提示可按需展开。</p><div class="route-list">${chapters.map(c => `<a class="route-row" href="#chapter/${c.id}"><span class="route-number">${c.number}</span><div><span class="route-title">${escape(c.title)}</span><p>${escape(c.summary)}</p></div><span class="route-time">${state.read.includes(c.id) ? '已读' : c.minutes+' 分钟'}</span></a>`).join('')}</div><h2 id="how">一章的学习顺序</h2><ol><li>先读机制，画出结构、区间或状态的含义。</li><li>完成手推题，预测示例输出，再实际运行演示。</li><li>在 <code>practice/solutions/</code> 的预留文件里独立实现。</li><li>运行测试，检查失败输入；需要时再展开提示与参考实现。</li></ol><h2 id="local">把练习带到本机</h2><p>解压学习包，需要 Python 3.9+ 和支持 C++17 的 GCC / Clang。没有 Python 第三方运行依赖。网页展示讲解与预期输出，实际编译和评测在本机进行。</p><pre><code>python practice/judge.py list --track dsa
python practice/judge.py p33
python practice/judge.py demo d17
python practice/judge.py all --track dsa --keep-going</code></pre><p>接口题填写 <code>solution.hpp</code>，完整程序题填写 <code>main.cpp</code>。<a href="#implementations">实现索引</a>帮助你查找完整算法代码；自己的总结可以继续写在 <code>notes/</code> 中。</p><div class="callout"><h3>先分清你在证明什么</h3><p>公开测试检查输入输出。复杂度、不变式、是否使用指定数据结构，还要结合手推题与代码审查。测试通过以后，再解释一次“为什么这样更新”。</p></div>${footer()}`;
  }
  function implementationsPage() {
    const names = [
      [17,'二分 / 最大子段和','O(log n) / O(n)'],[18,'动态顺序表 / 循环链表','访问 O(1)，移动 O(n)'],
      [19,'括号栈 / 循环队列','O(n) / 单次 O(1)'],[20,'KMP / Trie','O(n+m) / O(单词长)'],
      [21,'遍历 / 二叉树重建','O(n)'],[22,'BST / AVL / B 树插入','O(h) / O(log n) / O(t logₜ n)'],
      [23,'最小堆 / Huffman','单次 O(log n) / O(n log n)'],[24,'线性探测哈希集合','平均 O(1)，最坏 O(容量)'],
      [25,'并查集','均摊 O(α(n))'],[26,'BFS / DFS','O(V+E)'],[27,'拓扑 / 关键路径','本实现 O((V+E)log V)'],
      [28,'Dijkstra / Bellman–Ford / Floyd','O((V+E)log(V+E)) / O(VE) / O(V³)'],
      [29,'Prim / Kruskal','O((V+E)log(V+E)) / O(E log E)'],[30,'归并 / 快排 / 堆排 / 基数排序','见排序对照表'],
      [31,'活动选择 / 0/1 背包','O(n log n) / O(nC)'],[32,'Fenwick / 懒标记线段树','单次 O(log n)']
    ];
    main.innerHTML = `<p class="breadcrumb"><a href="#start">学习路线</a> / 实现索引</p><h1>从不变式找到实现</h1><p class="lead">所有实现集中在 <code>algorithms/dsa.hpp</code>，采用 C++17。章节里解释状态与边界，下载包中提供可复用代码和运行示例。</p><div class="actions"><a class="button primary" href="algorithms/dsa.hpp" download>下载实现头文件</a><a class="button" href="algorithms/README.md">接口与前置条件</a></div><h2 id="index">数据结构与算法速查</h2><div class="table-wrap"><table><thead><tr><th>章节 / 实现</th><th>时间复杂度</th><th>演示</th></tr></thead><tbody>${names.map(([n,t,c])=>`<tr><td><a href="#chapter/${data.chapters[n-1].id}">${n} · ${t}</a></td><td>${c}</td><td><code>d${n}</code></td></tr>`).join('')}</tbody></table></div><h2 id="contracts">统一约定</h2><ul><li>数组与图结点从 0 编号；区间采用 <code>[l,r)</code>，空区间合法。</li><li>路径、区间累计与权值使用 <code>long long</code>；最短路不可达哨兵是 <code>study::INF</code>。</li><li>Dijkstra 要求非负边；MST 处理无向图；有向图强连通分量不等同于无向连通分量。</li><li>B 树实现插入与查找；AVL 同时实现插入和删除。BST / AVL 的下标结点池不回收已删除槽位。</li><li>教学版堆排序另用 O(n) 堆空间；基数排序仅接受 32 位无符号数。</li></ul><h2 id="use">在自己的程序中引用</h2><pre><code>#include "algorithms/dsa.hpp"
// 编译：g++ -std=c++17 -O2 main.cpp -o main
// 算法位于 study 命名空间。</code></pre><p>要练习实现时，填写对应题目的预留文件；想对照算法时，阅读章节折叠的完整实现。<a href="#practice">进入配套练习</a>。</p>${footer()}`;
  }
  function chapterPage(chapter) {
    state.track = chapter.track;
    state.last = chapter.id;
    save();
    const index = chapter.number - 1;
    const previous = data.chapters[index - 1];
    const next = data.chapters[index + 1];
    main.innerHTML = `<p class="breadcrumb"><a href="#start">学习路线</a> / 第 ${chapter.number} 章</p><h1>${escape(chapter.title)}</h1><p class="lead">${escape(chapter.summary)}</p><div class="meta"><span>${escape(chapter.group)}</span><span>阅读约 ${chapter.minutes} 分钟</span><span>1 个示例 · 2 道练习</span></div><article>${chapter.html}</article><div id="algorithm-demo"></div><section class="chapter-foot"><h2 id="chapter-practice">动手练习</h2>${exerciseLinks(chapter.problems)}<h3>延伸阅读</h3><p>${escape(chapter.reading)}</p><p><a href="#sources">查看书目与课程对应关系</a>。练习运行以本指南 C++17 约定为准。</p><div class="completion"><span>能解释示例，并独立完成练习后，再继续下一章。</span><button id="mark-read" type="button" aria-pressed="${state.read.includes(chapter.id)}">${state.read.includes(chapter.id) ? '已标记读完' : '标记本章读完'}</button></div><nav class="pager" aria-label="相邻章节">${previous ? `<a href="#chapter/${previous.id}"><small>上一章</small>${escape(previous.title)}</a>` : '<a href="#start"><small>返回</small>学习路线</a>'}${next ? `<a href="#chapter/${next.id}"><small>下一章</small>${escape(next.title)}</a>` : '<a href="#practice"><small>继续练习</small>全部题目</a>'}</nav></section>${footer()}`;
    if (chapter.widget) mountWidget(chapter.widget);
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
    main.innerHTML = `<p class="breadcrumb"><a href="#start">学习路线</a> / 练习</p><h1>把理解写成程序</h1><p class="lead">${data.problems.length} 道练习随章节推进。先在本地文件中完成，再用配套测试核对。所有参考实现和测试也保留在学习包内。</p><div class="actions"><a class="button primary" href="downloads/cpp-study-kit.zip" download>下载完整学习包</a><a class="button" href="README.md">查看本地使用说明</a></div><div class="filters"><label>学习路线<select id="track-filter"><option value="all">全部路线</option><option value="cpp">C++ 语言</option><option value="dsa">数据结构与算法</option></select></label><label>查找题目<input id="problem-search" type="search" placeholder="题号、名称或知识点"></label><label>所属章节<select id="chapter-filter"><option value="all">全部章节</option>${data.chapters.map(c => `<option value="${c.number}">${String(c.number).padStart(2, '0')} ${escape(c.title)}</option>`).join('')}</select></label><label>完成状态<select id="state-filter"><option value="all">全部</option><option value="todo">未完成</option><option value="done">已完成</option></select></label></div><p id="problem-count" class="phase-note" aria-live="polite"></p><table class="exercise-table"><thead><tr><th scope="col">题号</th><th scope="col">题目</th><th scope="col" class="chapter-cell">章节</th><th scope="col">状态</th></tr></thead><tbody id="problem-rows"></tbody></table><p id="problem-empty" class="empty" hidden>没有符合条件的题目。试试更短的关键词，或清除筛选条件。</p><div class="result-tools"><label for="import-results">导入本地测试结果</label><input id="import-results" type="file" accept="application/json,.json"><p>选择评测器生成的 <code>practice/local-results.json</code>。只在当前浏览器读取，不上传；参考解的测试结果不会计入自己的完成进度。</p></div>${footer()}`;
    function filter() {
      const query = $('#problem-search').value.toLowerCase().trim();
      const chapter = $('#chapter-filter').value;
      const track = $('#track-filter').value;
      const status = $('#state-filter').value;
      const selected = data.problems.filter(p => (track === 'all' || p.track === track) && (chapter === 'all' || p.chapter === Number(chapter)) &&
        (status === 'all' || state.done.includes(p.id) === (status === 'done')) &&
        (!query || `${p.id} ${p.title} ${p.search}`.toLowerCase().includes(query)));
      $('#problem-count').textContent = `${selected.length} 道题 · 已完成 ${state.done.length} / ${data.problems.length}`;
      $('#problem-empty').hidden = selected.length > 0;
      $('#problem-rows').innerHTML = selected.map(p => `<tr><td>${p.id}</td><td><a href="#problem/${p.id}">${escape(p.title)}</a><small>${p.difficulty} · ${p.mode === 'header' ? '接口题' : '完整程序'} · ${p.test_count} 组测试</small></td><td class="chapter-cell">第 ${p.chapter} 章</td><td class="${state.done.includes(p.id) ? 'done' : 'difficulty'}">${state.done.includes(p.id) ? '已完成' : '待练习'}</td></tr>`).join('');
    }
    $('#track-filter').value = state.track;
    $('#track-filter').addEventListener('change', filter);
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
        if (result.reference !== false) throw Error('这是参考解结果，不计入你自己的完成进度。');
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
    state.track = chapter.track; save();
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
  function mountWidget(kind) {
    const box = $('#algorithm-demo');
    let frames = [], title = '';
    if (kind === 'binary') {
      title = '手推二分：找第一个 ≥ 5 的位置';
      const a = [1,2,2,4,5,5,8,9]; let l=0,r=a.length;
      while(l<r) { const mid=l+Math.floor((r-l)/2); frames.push({values:a, marked:mid, note:`l=${l}，r=${r}，mid=${mid}。a[mid]=${a[mid]}，${a[mid]<5?'排除 [l,mid]':'保留 mid，缩小右边界'}。`}); if(a[mid]<5)l=mid+1;else r=mid; }
      frames.push({values:a,marked:l,note:`l=r=${l}，停止。答案为下标 ${l}。区间右端是排除端点。`});
    } else if (kind === 'heap') {
      title = '手推最小堆：插入 2 后上浮';
      const a=[3,6,5,9,8,7]; frames.push({values:[...a],marked:-1,note:'初始堆：父亲不大于孩子，数组下标从 0 开始。'});a.push(2);let i=a.length-1;
      frames.push({values:[...a],marked:i,note:'把新元素 2 放到数组末尾，保持完全二叉树形状。'});
      while(i>0){const p=Math.floor((i-1)/2);if(a[p]<=a[i])break;[a[p],a[i]]=[a[i],a[p]];i=p;frames.push({values:[...a],marked:i,note:`与父亲交换，2 来到下标 ${i}。继续向上检查。`});}
      frames.push({values:[...a],marked:0,note:'上浮完成。数组顺序不是整体有序，但每条父子边满足堆序。'});
    } else if (kind === 'bfs') {
      title = '手推 BFS：入队时标记';
      const g=[[1,2],[0,3],[0,3,4],[1,2],[2]],d=[0,-1,-1,-1,-1],q=[0];
      frames.push({values:[...d],marked:0,note:'边：0–1、0–2、1–3、2–3、2–4。距离初值 [0,−1,−1,−1,−1]，队列 [0]。'});
      while(q.length){const u=q.shift();for(const v of g[u])if(d[v]<0){d[v]=d[u]+1;q.push(v);}frames.push({values:[...d],marked:u,note:`处理结点 ${u}，尚未发现的邻居入队并立即标记。队列 [${q.join(', ')}]。`});}
    }
    if(!frames.length)return;
    box.innerHTML = `<section class="algorithm-lab"><p class="book-label">一步一步看状态</p><h2 id="interactive">${title}</h2><p class="phase-note">浏览器中的固定过程演示；完整 C++ 实现请运行本章 demo。</p><div class="trace-values" role="list" aria-label="当前数组状态"></div><p class="trace-note" aria-live="polite"></p><div class="trace-actions"><button type="button" class="trace-prev">上一步</button><span class="trace-step"></span><button type="button" class="trace-next">下一步</button><button type="button" class="trace-reset">重来</button></div></section>`;
    let step=0;const draw=()=>{const f=frames[step];box.querySelector('.trace-values').innerHTML=f.values.map((v,i)=>`<div role="listitem" class="trace-cell ${i===f.marked?'marked':''}"><small>${i}</small><strong>${v}</strong></div>`).join('');box.querySelector('.trace-note').textContent=f.note;box.querySelector('.trace-step').textContent=`${step+1} / ${frames.length}`;box.querySelector('.trace-prev').disabled=step===0;box.querySelector('.trace-next').disabled=step===frames.length-1;};
    box.querySelector('.trace-prev').onclick=()=>{step--;draw();};box.querySelector('.trace-next').onclick=()=>{step++;draw();};box.querySelector('.trace-reset').onclick=()=>{step=0;draw();};draw();
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
      let title = 'C++ 与数据结构';
      if (kind === 'start') home();
      else if (kind === 'implementations') { implementationsPage(); title = '实现索引'; }
      else if (kind === 'practice') { practicePage(); title = '全部练习'; }
      else if (kind === 'sources') { main.innerHTML = `<p class="breadcrumb"><a href="#start">学习路线</a> / 来源</p><h1>课程映射与参考来源</h1><article>${data.sources}</article>${footer()}`; title = '课程映射与参考来源'; }
      else if (kind === 'chapter' && data.chapters.some(c => c.id === id)) { const c = data.chapters.find(c => c.id === id); chapterPage(c); title = c.title; }
      else if (kind === 'problem' && data.problems.some(p => p.id === id)) { const p = data.problems.find(p => p.id === id); problemPage(p); title = `${p.id} ${p.title}`; }
      else main.innerHTML = '<h1>没有找到这一页</h1><p>链接可能不完整。可以从左侧目录选择章节，或搜索知识点。</p><a class="button primary" href="#start">返回学习路线</a>';
      document.title = title === 'C++ 与数据结构' ? 'C++ 与数据结构 · 学习讲义' : `${title} · C++ 与数据结构`;
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
  function applyReading() {
    state.font = Math.min(22, Math.max(16, Number(state.font) || 18));
    document.documentElement.style.setProperty('--reading-size', state.font + 'px');
    document.documentElement.dataset.theme = state.dark ? 'dark' : 'light';
    $('#font-value').textContent = state.font;
    $('#font-down').disabled = state.font <= 16; $('#font-up').disabled = state.font >= 22;
    $('#theme-toggle').textContent = state.dark ? '浅色阅读' : '暗色阅读';
    $('#theme-toggle').setAttribute('aria-pressed', String(state.dark));
  }
  for (const b of document.querySelectorAll('[data-track]')) b.addEventListener('click', () => {
    state.track = b.dataset.track; save();
    if ((location.hash || '#start').split('~')[0] === '#start') { home(); decorate(); }
    else { location.hash = 'chapter/' + data.chapters.find(c => c.track === state.track).id; }
  });
  $('#font-down').addEventListener('click', () => { state.font--; applyReading(); save(); });
  $('#font-up').addEventListener('click', () => { state.font++; applyReading(); save(); });
  $('#theme-toggle').addEventListener('click', () => { state.dark = !state.dark; applyReading(); save(); });
  if (!['cpp','dsa'].includes(state.track)) state.track = 'cpp';
  applyReading();
  window.addEventListener('hashchange', render);
  render();
})();
