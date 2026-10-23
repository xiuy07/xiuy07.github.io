(() => {
  'use strict';
  const data = window.PYTHON_GUIDE;
  const chapterCount=data.chapters.length, problemCount=data.problems.length;
  const trackLabel=t=>({base:"语言基础",data:"数据分析",features:"Python特性"}[t]||t);
  const $ = s => document.querySelector(s);
  const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const key = 'python-guide-v1';
  const chapterIds = new Set(data.chapters.map(c => c.id));
  const problemIds = new Set(data.problems.map(p => p.id));
  const defaults = () => ({read:[],done:[],results:{},notes:{},last:'01',font:18,dark:false});
  let state = defaults();
  function cleanState(s) {
    if (!s || typeof s !== 'object' || !Array.isArray(s.read) || !Array.isArray(s.done)) throw Error('学习记录格式不正确');
    const notes = {};
    for (const c of data.chapters) if (typeof s.notes?.[c.id] === 'string') notes[c.id] = s.notes[c.id].slice(0,50000);
    return {...defaults(),read:[...new Set(s.read.filter(id=>chapterIds.has(id)))],done:[...new Set(s.done.filter(id=>problemIds.has(id)))],notes,results:cleanResults(s.results),last:chapterIds.has(s.last)?s.last:'01',font:Math.min(24,Math.max(15,Number(s.font)||18)),dark:s.dark===true};
  }
  function cleanResults(results) {
    const clean={};
    if (!results || typeof results!=='object') return clean;
    for (const p of data.problems) {
      const r=results[p.id];
      if (r && ['AC','WA','CE','RE','TLE','OLE','DE','FE'].includes(r.verdict) && Number.isInteger(r.passed) && r.passed>=0 && r.passed<=p.tests.length && r.total===p.tests.length && (r.verdict!=='AC'||r.passed===r.total)) clean[p.id]={verdict:r.verdict,passed:r.passed,total:r.total};
    }
    return clean;
  }
  try {const saved=JSON.parse(localStorage.getItem(key)||'null');if(saved)state=cleanState(saved);}catch{}
  let track='all',problemTrack='all',problemStatus='all',stage=0,aliasStep=0,alignPosition=false,observer,timer;
  const navGroups=[['语义与容器','01','04'],['函数与程序组织','05','08'],['工程与算法工具','09','12'],['数组与表格','13','16'],['从清洗到报告','17','20'],['Python特性专题','21','24']];
  function notify(message){$('#status').textContent=message;clearTimeout(timer);timer=setTimeout(()=>$('#status').textContent='',4000);}
  function persist(){try{localStorage.setItem(key,JSON.stringify(state));}catch{notify('当前浏览器无法保存记录，可导出备份。');}updateProgress();}
  function applySettings(){document.documentElement.dataset.theme=state.dark?'dark':'light';document.documentElement.style.setProperty('--reading',state.font+'px');$('#theme').setAttribute('aria-label',state.dark?'切换浅色阅读':'切换暗色阅读');$('#theme').title=state.dark?'切换浅色阅读':'切换暗色阅读';}
  function updateProgress(){ $('#read-count').textContent=`${state.read.length} / ${chapterCount}`;$('#progress').max=chapterCount;$('#progress').value=state.read.length;$('#progress').textContent=`${state.read.length} / ${chapterCount}`; }
  function nav(){
    const current=location.hash.split('/')[1]?.split('~')[0];
    $('#chapters').innerHTML=navGroups.map(([title,start,end],i)=>`<details ${!current?(i===0?'open':''):(current>=start&&current<=end?'open':'')}><summary>${title}</summary>${data.chapters.filter(c=>c.id>=start&&c.id<=end).map(c=>`<a href="#chapter/${c.id}" class="${current===c.id?'active':''}" ${current===c.id?'aria-current="page"':''}><span class="num">${c.id}</span><span>${c.title}</span>${state.read.includes(c.id)?'<span class="read-dot" aria-label="已读">✓</span>':''}</a>`).join('')}</details>`).join('');
    const page=route().page;document.querySelectorAll('[data-page]').forEach(a=>{const active=a.dataset.page===page||(page==='problem'&&a.dataset.page==='practice');a.classList.toggle('active',active);if(active)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});
    updateProgress();
  }
  function route(){const [page='home',id='']=location.hash.slice(1).split('/');return {page:page||'home',id:id.split('~')[0]};}
  function syncSidebar(){const mobile=window.matchMedia('(max-width:720px)').matches;const open=$('#sidebar').classList.contains('open');$('#sidebar').inert=mobile&&!open;$('.shell').inert=mobile&&open;}
  function closeMenu(){$('#sidebar').classList.remove('open');$('#menu').setAttribute('aria-expanded','false');$('#scrim').hidden=true;syncSidebar();}
  function pageHeading(tag,title,description){return `<header class="page-heading"><span class="tag">${tag}</span><h1>${title}</h1><p>${description}</p></header>`;}
  function pipeline(){
    const tables=[
      '<tr><th>城市</th><th>单价 / 元</th><th>数量</th><th>收入 / 元</th></tr><tr><td>南京</td><td>10</td><td>2</td><td>20</td></tr><tr><td>苏州</td><td>8</td><td>3</td><td>24</td></tr><tr><td>南京</td><td class="invalid-cell">bad ×</td><td>1</td><td class="invalid-cell">无效</td></tr><tr><td>无锡</td><td>6</td><td>4</td><td>24</td></tr>',
      '<tr><th>城市</th><th>单价 / 元</th><th>数量</th><th>收入 / 元</th></tr><tr><td>南京</td><td>10</td><td>2</td><td>20</td></tr><tr><td>苏州</td><td>8</td><td>3</td><td>24</td></tr><tr><td>无锡</td><td>6</td><td>4</td><td>24</td></tr>',
      '<tr><th>城市</th><th>订单数</th><th>总收入 / 元</th></tr><tr><td>南京</td><td>1</td><td>20</td></tr><tr><td>苏州</td><td>1</td><td>24</td></tr><tr><td>无锡</td><td>1</td><td>24</td></tr>'
    ];
    const captions=['4条原始记录中有1条非法单价。点击上方步骤，观察表格变化。','单价转成数值，删除无法计算的记录。保留3条，收入合计68元。','按城市分组，分别计算订单数和收入；各组总收入相加仍为68元。'];
    const codes=["df = pd.read_csv('orders.csv')","df['price'] = pd.to_numeric(df['price'], errors='coerce')","df.groupby('city')['revenue'].sum()"];
    return `<section class="pipeline" aria-label="订单数据处理演示"><div class="pipeline-header"><span>一张订单表，三个处理步骤</span><span class="dots" aria-hidden="true"><i></i><i></i><i></i></span></div><div class="pipeline-body"><div class="step-buttons" role="group" aria-label="数据处理步骤">${['1 原始记录','2 清洗数据','3 分组汇总'].map((s,i)=>`<button data-stage="${i}" aria-pressed="${stage===i}">${s}</button>`).join('')}</div><div class="table-scroll"><table aria-label="${['原始订单','清洗后订单','城市汇总'][stage]}">${tables[stage]}</table></div><p class="pipeline-caption" aria-live="polite">${captions[stage]}</p></div><div class="pipeline-code">${esc(codes[stage])}</div></section>`;
  }
  function courseRows(){return data.chapters.filter(c=>track==='all'||c.track===track).map(c=>`<a class="chapter-row" href="#chapter/${c.id}"><span class="index">${c.id}</span><div><h3>${c.title}</h3><p>${c.sub}</p></div><div class="row-meta"><span class="time">${c.minutes} 分钟 · 2题</span><span>${state.read.includes(c.id)?'已读 ✓':'开始阅读'}</span></div></a>`).join('');}
  function home(){
    const last=data.chapters.find(c=>c.id===state.last);
    return `<section class="hero"><div class="hero-copy"><span class="tag">Python × 数据智能</span><h1><span>把 Python，</span><span>用到真实数据里。</span></h1><p>先猜输出，再看每一步如何发生。从名字与函数，到闭包、递归，再把一张脏表变成可解释的结果。</p><div class="hero-meta"><span>${chapterCount}章讲义</span><span>${problemCount}道练习</span><span>${chapterCount+(data.featureExamples?.length||0)}个运行示例</span></div><div class="hero-actions"><a class="button primary" href="#chapter/${last.id}">${state.read.length||state.last!=='01'?'继续学习':'开始第一章'} <span class="arrow" aria-hidden="true">↗</span></a><a class="button" href="#practice">打开练习台</a></div>${state.last!=='01'?`<p class="note-hint" style="margin-top:15px">上次读到：${last.id} ${last.title}</p>`:''}</div><div id="pipeline-slot">${pipeline()}</div></section>
    <div class="section-heading"><h2>两条主线，四章特性专题</h2><p>短例子拆开讲，先读懂，再动手。</p></div><div class="learning-bar"><a class="track-link" href="#chapter/01"><span class="track-number">01</span><div><strong>先把语言学扎实</strong><small>对象、函数、程序组织与算法工具 · 12章</small></div><span class="arrow" aria-hidden="true">↗</span></a><a class="track-link" href="#chapter/13"><span class="track-number">02</span><div><strong>再走一遍数据流程</strong><small>NumPy、pandas、清洗、汇总与报告 · 8章</small></div><span class="arrow" aria-hidden="true">↗</span></a></div>
    <section class="feature-entry"><div><span class="tag">本次新增</span><h3>把Python特性学明白</h3><p>借鉴CS61A的讲解思路，从环境与抽象理解代码。</p></div><div class="feature-shortcuts"><a href="#chapter/21">环境与闭包</a><a href="#chapter/22">递归与缓存</a><a href="#chapter/23">表达式与解包</a><a href="#chapter/24">对象协议</a></div></section>
    <div class="section-heading"><h2>课程目录</h2><div class="tabs" role="group" aria-label="课程路径筛选">${[['all','全部'],['base','语言基础'],['data','数据分析'],['features','Python特性']].map(([v,t])=>`<button data-track="${v}" aria-pressed="${track===v}">${t}</button>`).join('')}</div></div><div id="course-list" class="chapter-list">${courseRows()}</div>
    <div class="course-bottom"><div><h3>把练习留在自己的编辑器里</h3><p>作答文件、参考实现、测试数据和评测器都在学习包中。</p></div><a class="button" href="downloads/python-study-kit.zip" download>下载学习包 <span aria-hidden="true">↧</span></a></div>`;
  }
  function chapter(id){
    const c=data.chapters.find(c=>c.id===id);if(!c)return missing();
    state.last=id;persist();
    return `<div class="reader-layout"><article class="reader"><div class="reader-top"><span class="tag">${trackLabel(c.track)}</span><span>${c.minutes} 分钟 · 2道练习</span><a href="demos/${id}.py" download>下载示例</a></div><div class="prose">${c.html}</div><div class="reading-actions"><button class="primary" id="mark-read" data-id="${id}">${state.read.includes(id)?'已读 ✓ · 取消标记':'标记本章已读'}</button><a class="button" href="#problem/${c.problems[0]}">动手练习</a><button id="print-chapter">打印本章</button></div><div class="chapter-note"><label for="chapter-note">用自己的话记下一个收获</label><textarea id="chapter-note" data-chapter="${id}" placeholder="例如：浅拷贝只复制外层，嵌套列表仍然共享。">${esc(state.notes[id]||'')}</textarea><p class="note-hint">输入后自动保存到当前浏览器，可在“我的笔记”导出备份。</p></div><nav class="next-prev" aria-label="前后章节">${Number(id)>1?`<a href="#chapter/${String(Number(id)-1).padStart(2,'0')}">‹ 上一章</a>`:'<a href="#home">返回课程</a>'}${Number(id)<chapterCount?`<a href="#chapter/${String(Number(id)+1).padStart(2,'0')}">下一章 ›</a>`:'<a href="#practice">完成讲义，回到练习 ›</a>'}</nav></article><aside id="toc" class="toc" aria-label="本章目录"></aside></div>`;
  }
  function statusText(p){const r=state.results[p.id];return r?`${r.verdict} ${r.passed}/${r.total}`:state.done.includes(p.id)?'已自评完成':'待练习';}
  function problemRows(){
    const selected=data.problems.filter(p=>(problemTrack==='all'||p.track===problemTrack)&&(problemStatus==='all'||(problemStatus==='todo'&&!state.done.includes(p.id)&&state.results[p.id]?.verdict!=='AC')||(problemStatus==='ac'&&state.results[p.id]?.verdict==='AC')||(problemStatus==='review'&&state.results[p.id]&&state.results[p.id].verdict!=='AC')));
    return selected.length?selected.map(p=>`<a class="problem-row" href="#problem/${p.id}"><span class="problem-id">${p.id}</span><div><strong>${p.title}</strong><small>第${p.chapter}章 · ${p.deps.join('、')||'标准库'} · ${p.tests.length}组测试</small></div><span class="difficulty tag${p.level==='进阶'?' gold':''}">${p.level}</span><span class="problem-status">${statusText(p)}</span></a>`).join(''):'<div class="empty">当前筛选下没有练习。更改筛选条件再看看。</div>';
  }
  function practice(){return pageHeading('动手练习','在编辑器里写，用测试来检查','每章两道题，从基础使用到边界处理。先自己写，再看提示；测试通过后，回头解释复杂度和实现选择。')+
    `<div class="steps-guide"><div><strong>1. 下载并解压</strong><p>基础题只需Python 3.12+。数据题先安装学习包中的依赖。</p><code>python practice/judge.py doctor</code></div><div><strong>2. 填写作答文件</strong><p>题面规定 solve(data)，驱动器负责JSON输入输出。</p><code>practice/solutions/p01/main.py</code></div><div><strong>3. 运行本地评测</strong><p>可导出结果，再导入本页展示通过情况。</p><code>python practice/judge.py p01</code></div></div>
    <div class="callout"><strong>保存实际测试结果</strong><p><code>python practice/judge.py all --keep-going --report my-results.json</code></p><div class="practice-tools"><label for="report-import">导入评测结果</label><input class="file-input" id="report-import" type="file" accept=".json,application/json"><a href="downloads/python-study-kit.zip" class="button" download>下载学习包</a></div><p class="note-hint">网页展示本地结果，不在浏览器执行Python。自评完成与本地AC分别标记。</p></div>
    <div class="filterbar"><div class="tabs" role="group" aria-label="练习路径">${[['all','全部题目'],['base','语言基础'],['data','数据分析'],['features','Python特性']].map(([v,t])=>`<button data-problem-track="${v}" aria-pressed="${problemTrack===v}">${t}</button>`).join('')}</div><label class="subtle" style="font-size:12px">状态 <select id="problem-filter"><option value="all">全部状态</option><option value="todo">待完成</option><option value="ac">本地AC</option><option value="review">需要复习</option></select></label></div><div class="problem-list" id="problem-list">${problemRows()}</div>`;}
  function codeBlock(code){return `<pre><code>${esc(code)}</code></pre>`;}
  function problem(id){const p=data.problems.find(p=>p.id===id);if(!p)return missing();return `<div class="reader-layout"><article class="reader"><div class="reader-top"><span class="tag">${p.level}练习</span><span>${statusText(p)}</span><a href="#chapter/${p.chapter}">回到第${p.chapter}章</a></div><div class="prose">${p.html.replace(/<h2>提示<\/h2>[\s\S]*?(?=<h2>复杂度目标)/,'')}<details class="answer"><summary>卡住了？展开一句话提示</summary><p>${p.hint}</p></details><details class="answer"><summary>完成后核对参考实现</summary><p>先对照失败用例，再检查边界与复杂度。</p>${codeBlock(p.reference)}</details></div><div class="reading-actions"><button id="mark-done" data-id="${id}" class="primary">${state.done.includes(id)?'已自评完成 ✓ · 取消':'标记为已独立完成'}</button><a class="button" href="practice/solutions/${id}/main.py" download="${id}-main.py">下载作答模板</a><a class="button" href="practice/reference/${id}/main.py" download="${id}-reference.py">下载参考解</a></div><p class="note-hint">浏览器不替你运行测试；下载模板后，也可以用 --file 指定文件路径评测。</p><nav class="next-prev">${Number(id.slice(1))>1?`<a href="#problem/p${String(Number(id.slice(1))-1).padStart(2,'0')}">‹ 上一题</a>`:'<a href="#practice">返回题目列表</a>'}${Number(id.slice(1))<problemCount?`<a href="#problem/p${String(Number(id.slice(1))+1).padStart(2,'0')}">下一题 ›</a>`:'<a href="#practice">返回题目列表 ›</a>'}</nav></article><aside id="toc" class="toc" aria-label="题目目录"></aside></div>`;}
  function aliasDiagram(){
    const values=[[1,2],[1,2],[1,2,3],[1,2,3]];
    const captions=['a = [1, 2]：先建立一个列表对象。','b = a：两个名字指向同一个对象，没有复制列表。','b.append(3)：修改共享对象，a、b都能看到3。','b = [9]：只把b重新绑定到新对象，a仍指向旧列表。'];
    return `<div class="object-diagram"><div class="names"><span class="name-token">a →</span>${aliasStep>0&&aliasStep<3?'<span class="name-token">b →</span>':''}</div><div><div class="object-box">[${values[aliasStep].join(', ')}]</div>${aliasStep===3?'<div class="object-box" style="margin-top:12px">b → [9]</div>':''}</div></div><div class="object-caption" aria-live="polite">${captions[aliasStep]}</div><div class="lab-controls"><button id="alias-prev" ${aliasStep===0?'disabled':''}>上一步</button><button id="alias-next" ${aliasStep===3?'disabled':''}>下一步</button><button id="alias-reset">重置</button></div>`;
  }
  function alignDiagram(){return `<table class="alignment-table"><thead><tr><th>标签</th><th>a</th><th>b</th><th>a + b</th></tr></thead><tbody>${(alignPosition?[['A',10,1,11],['B',20,2,22]]:[['A',10,2,12],['B',20,1,21]]).map(r=>'<tr>'+r.map(v=>`<td>${v}</td>`).join('')+'</tr>').join('')}</tbody></table><p class="object-caption" aria-live="polite" style="margin-top:18px">${alignPosition?'位置相加示意：a.to_numpy() + b.to_numpy()，标签不再参与匹配。':'Series按标签对齐。b的原始存储顺序为B:1、A:2；a的A会与b的A相加。'}</p><div class="lab-controls"><button id="align-toggle">${alignPosition?'切回标签对齐':'对比按位置相加'}</button></div>`;}
  let traceMode='closure', traceStep=0;
  const traces={
    closure:{title:'闭包保存环境',chapter:'21',code:['def make_counter(start):','    total = start','    def add(step):','        nonlocal total','        total += step','        return total','    return add','counter = make_counter(10)','print(counter(2))','print(counter(3))'],steps:[
      {line:0,note:'执行def，模块环境把make_counter绑定到函数对象；函数体尚未执行。',rows:[['模块','make_counter → 函数','内建']],output:''},
      {line:1,note:'调用make_counter(10)，新环境F1中start=10，total=10。',rows:[['模块','make_counter → 函数','内建'],['F1 · make_counter','start=10, total=10','模块']],output:''},
      {line:6,note:'在F1定义add并返回；counter指向该函数，函数保留通向F1绑定的联系。',rows:[['模块','counter → add函数','内建'],['F1 · 外层绑定保留','total=10','模块']],output:''},
      {line:8,note:'调用counter(2)，新环境F2中step=2；自由变量total沿定义环境找到F1。',rows:[['模块','counter → add函数','内建'],['F1 · 外层绑定保留','total=10','模块'],['F2 · add','step=2','F1']],output:''},
      {line:5,note:'nonlocal让赋值更新F1中的total为12。F2返回12，第一行print显示12。',rows:[['模块','counter → add函数','内建'],['F1 · 外层绑定保留','total=12','模块']],output:'12'},
      {line:9,note:'再调用counter(3)，新环境F3中step=3；仍沿同一个定义环境F1查找。',rows:[['模块','counter → add函数','内建'],['F1 · 外层绑定保留','total=12','模块'],['F3 · add','step=3','F1']],output:'12'},
      {line:5,note:'F1中的total更新为15，F3返回15。外层函数不必重新运行。',rows:[['模块','counter → add函数','内建'],['F1 · 外层绑定保留','total=15','模块']],output:'12\n15'}]},
    recursion:{title:'递归怎样交回结果',chapter:'22',code:['def power_two(n):','    if n == 0:','        return 1','    return 2 * power_two(n - 1)','print(power_two(3))'],steps:[
      {line:4,note:'模块调用power_two(3)，先等待返回值，print尚未显示。',rows:[['F1 · power_two','n=3，等待子调用','模块']],output:''},
      {line:3,note:'F1需要power_two(2)的答案；新调用F2有自己的n=2。',rows:[['F1','n=3，等待2×?','模块'],['F2','n=2，等待子调用','模块']],output:''},
      {line:3,note:'继续调用power_two(1)，建立F3。每个函数的定义环境仍是模块，不是上一层调用。',rows:[['F1','n=3，等待2×?','模块'],['F2','n=2，等待2×?','模块'],['F3','n=1，等待子调用','模块']],output:''},
      {line:2,note:'F4中n=0，命中基例返回1。递归链开始收拢。',rows:[['F1','n=3，等待2×?','模块'],['F2','n=2，等待2×?','模块'],['F3','n=1，等待2×?','模块'],['F4','n=0，返回1','模块']],output:''},
      {line:3,note:'F3收到1，计算2×1并返回2；它不修改F2中的n。',rows:[['F1','n=3，等待2×?','模块'],['F2','n=2，等待2×?','模块'],['F3','n=1，返回2','模块']],output:''},
      {line:3,note:'F2收到2，计算2×2并返回4。',rows:[['F1','n=3，等待2×?','模块'],['F2','n=2，返回4','模块']],output:''},
      {line:4,note:'F1收到4并返回8，最后由print显示。返回的方向和外层名字查找的方向不同。',rows:[['模块','print接收8','内建']],output:'8'}]}
  };
  function traceDiagram(){const t=traces[traceMode],s=t.steps[traceStep];return `<div class="trace-tabs" role="group" aria-label="推演主题">${Object.entries(traces).map(([id,v])=>`<button data-trace-mode="${id}" aria-pressed="${traceMode===id}">${v.title}</button>`).join('')}</div><div class="trace-grid"><pre class="trace-code" aria-label="当前推演的Python代码">${t.code.map((line,i)=>`<span class="${i===s.line?'current-line':''}"><i aria-hidden="true">${i+1}</i>${esc(line)}</span>`).join('')}</pre><div class="trace-environment"><table class="alignment-table"><thead><tr><th>环境</th><th>绑定或返回</th><th>定义外层</th></tr></thead><tbody>${s.rows.map(r=>'<tr>'+r.map(v=>`<td>${esc(v)}</td>`).join('')+'</tr>').join('')}</tbody></table><div class="trace-output"><strong>屏幕输出</strong><pre>${esc(s.output||'（尚无输出）')}</pre></div></div></div><p class="trace-explanation" aria-live="polite"><strong>步骤 ${traceStep+1} / ${t.steps.length}</strong>${s.note}</p><div class="lab-controls"><button id="trace-prev" ${traceStep===0?'disabled':''}>上一步</button><button id="trace-next" ${traceStep===t.steps.length-1?'disabled':''}>下一步</button><button id="trace-reset">从头开始</button><a class="button" href="#chapter/${t.chapter}">读本节讲解</a></div>`;}
  function lab(){return pageHeading('交互实验','先猜一次，再看变化','固定示例逐步推演对象、标签、闭包环境和递归返回。每次先猜下一步，再点按钮核对。')+`<div class="lab-grid"><section class="lab-panel lab-wide"><h2>逐步看见函数调用</h2><p>左侧是代码，右侧记录当前环境和返回值。这里是已核对的固定示例推演，不执行任意输入代码。</p><div id="trace-slot">${traceDiagram()}</div></section><section class="lab-panel"><h2>名字与对象</h2><p>别名、修改、重新绑定，到底改变了什么？</p><div id="alias-slot">${aliasDiagram()}</div><a href="#chapter/02" class="source-link">回到第02章讲解</a></section><section class="lab-panel"><h2>标签不是位置</h2><p>两列看上去一样长，相加时一定按行配对吗？</p><div id="align-slot">${alignDiagram()}</div><a href="#chapter/14" class="source-link">回到第14章讲解</a></section><section class="lab-panel lab-wide"><h2>把原始订单变成城市收入</h2><p>删除坏数据会影响什么？分组后的金额能否与明细对上？</p><div id="pipeline-slot">${pipeline()}</div><a href="#chapter/20" class="source-link">运行完整Python项目，生成CSV、报告与图表</a></section></div>`;}
  function notebook(){const notes=Object.entries(state.notes).filter(([,v])=>v.trim());return pageHeading('学习记录','把理解写成自己的话','章节中的笔记会自动汇集到这里。记录保存在当前浏览器，换设备前可导出JSON备份。')+`<div class="practice-tools" style="margin-bottom:28px"><button id="export-state" class="primary">导出学习记录</button><label for="state-import">导入记录</label><input class="file-input" id="state-import" type="file" accept=".json,application/json"></div><p class="subtle" style="font-size:12px;margin-bottom:25px">已读 ${state.read.length}/${chapterCount}章 · 自评完成 ${state.done.length}/${problemCount}题 · 本地AC ${Object.values(state.results).filter(r=>r.verdict==='AC').length}/${problemCount}题</p><div class="notebook-list">${notes.length?notes.map(([id,n])=>`<article class="notebook-card"><h2><a href="#chapter/${id}">${id} ${data.chapters.find(c=>c.id===id).title}</a></h2><pre>${esc(n)}</pre><a class="source-link" href="#chapter/${id}">回到章节编辑</a></article>`).join(''):'<div class="empty">还没有笔记。打开任意一章，在文末写下一点自己的理解。</div>'}</div>`;}
  function sources(){return `<div class="reader-layout"><article class="reader"><div class="prose">${data.sourcesHtml}<h2>如何使用本讲义</h2><p>先预测折叠小测的输出，再展开解释；用逐步推演检查环境和返回值。会C++/Java可先精读02、04、06章；接着读21—24特性专题，或从13进入数据分析。</p><p>每章可分成两次阅读：第一次读核心概念和短例子，第二次完成推演、练习和复习。已读与独立完成是自评记录，导入本地评测JSON才显示AC。</p><h2>离线与评测</h2><p>完整学习包解压后直接打开 index.html，内容和字体无需网络加载。用自己的Python执行代码，评测器不是运行不可信代码的安全沙箱。每例默认5秒、约1MiB输出限制，无严格内存限制；整数精确比较；浮点结果允许1e-9绝对/相对误差，列表顺序必须一致。</p><p>参考解只能辅助核对，不自动计入个人完成状态。复杂度、是否使用指定类或生成器等实现约束需要人工检查。</p><h2>项目与验证文件</h2><p><a href="README.md">完整使用说明</a> · <a href="VALIDATION.md">验证记录</a> · <a href="THIRD_PARTY.md">字体与许可</a> · <a href="downloads/python-study-kit.zip" download>下载完整学习包</a></p></div></article><aside id="toc" class="toc" aria-label="说明目录"></aside></div>`;}
  function missing(){return `<div class="empty"><h1>没有找到这个页面</h1><p>可以从课程目录重新选择章节。</p><a class="button" href="#home">返回课程概览</a></div>`;}
  function enrich(){
    const toc=$('#toc');
    if(toc){const headings=[...document.querySelectorAll('.prose h2')];headings.forEach((h,i)=>h.id='section-'+i);toc.innerHTML='<div class="toc-title">本页内容</div>'+headings.map(h=>`<a href="#${route().page}/${route().id}~${h.id}" data-scroll="${h.id}">${h.textContent}</a>`).join('');if(observer)observer.disconnect();observer=new IntersectionObserver(entries=>{for(const e of entries)if(e.isIntersecting){toc.querySelectorAll('a').forEach(a=>a.classList.toggle('active',a.dataset.scroll===e.target.id));}},{rootMargin:'-100px 0px -65% 0px'});headings.forEach(h=>observer.observe(h));}
    document.querySelectorAll('.prose pre').forEach(pre=>{const b=document.createElement('button');b.className='copy-code';b.textContent='复制';b.addEventListener('click',async()=>{const code=pre.querySelector('code')?.textContent||[...pre.childNodes].filter(n=>n!==b).map(n=>n.textContent).join('');try{await navigator.clipboard.writeText(code);notify('代码已复制');}catch{const range=document.createRange();range.selectNodeContents(pre.querySelector('code')||pre);const sel=window.getSelection();sel.removeAllRanges();sel.addRange(range);notify('已选中代码，按 Ctrl+C 复制。');}});pre.append(b);});
    const filter=$('#problem-filter');if(filter)filter.value=problemStatus;
    const read=$('#mark-read');if(read)read.addEventListener('click',()=>{const id=read.dataset.id;state.read=state.read.includes(id)?state.read.filter(x=>x!==id):[...state.read,id];persist();nav();read.textContent=state.read.includes(id)?'已读 ✓ · 取消标记':'标记本章已读';notify(state.read.includes(id)?'本章已标记为已读':'已取消本章已读标记');});
    const done=$('#mark-done');if(done)done.addEventListener('click',()=>{const id=done.dataset.id;state.done=state.done.includes(id)?state.done.filter(x=>x!==id):[...state.done,id];persist();done.textContent=state.done.includes(id)?'已自评完成 ✓ · 取消':'标记为已独立完成';notify('自评记录已保存');});
    const note=$('#chapter-note');if(note)note.addEventListener('input',()=>{state.notes[note.dataset.chapter]=note.value;persist();});
  }
  function render(focus=true){
    if(observer)observer.disconnect();
    closeMenu();const {page,id}=route();const pages={home,chapter:()=>chapter(id),practice,problem:()=>problem(id),lab,notebook,sources};
    $('#main').innerHTML=(pages[page]||missing)();
    const name={home:'课程概览',chapter:data.chapters.find(c=>c.id===id)?.title||'章节',practice:'编程练习',problem:data.problems.find(p=>p.id===id)?.title||'练习',lab:'交互实验',notebook:'我的笔记',sources:'来源与使用说明'}[page]||'未找到';
    $('#breadcrumb').innerHTML=`学习空间 <span>/</span> ${esc(name)}`;document.title=name+' · Python 学习讲义';nav();enrich();
    if(focus){window.scrollTo(0,0);$('#main').focus({preventScroll:true});}
    const anchor=location.hash.split('~')[1];if(anchor)document.getElementById(anchor)?.scrollIntoView();
  }
  document.addEventListener('click',e=>{
    if(e.target.closest('.skip')){e.preventDefault();$('#main').focus();return;}
    const stageBtn=e.target.closest('[data-stage]');if(stageBtn){stage=Number(stageBtn.dataset.stage);$('#pipeline-slot').innerHTML=pipeline();$('#pipeline-slot').querySelector(`[data-stage="${stage}"]`).focus();}
    const trackBtn=e.target.closest('[data-track]');if(trackBtn){track=trackBtn.dataset.track;document.querySelectorAll('[data-track]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.track===track));$('#course-list').innerHTML=courseRows();}
    const pTrack=e.target.closest('[data-problem-track]');if(pTrack){problemTrack=pTrack.dataset.problemTrack;document.querySelectorAll('[data-problem-track]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.problemTrack===problemTrack));$('#problem-list').innerHTML=problemRows();}
    const scroll=e.target.closest('[data-scroll]');if(scroll){e.preventDefault();history.replaceState(null,'',scroll.getAttribute('href'));document.getElementById(scroll.dataset.scroll)?.scrollIntoView();}
    const traceModeButton=e.target.closest('[data-trace-mode]');if(traceModeButton){traceMode=traceModeButton.dataset.traceMode;traceStep=0;$('#trace-slot').innerHTML=traceDiagram();$('#trace-slot').querySelector(`[data-trace-mode="${traceMode}"]`).focus();}
    const id=e.target.closest('button')?.id;
    if(['trace-prev','trace-next','trace-reset'].includes(id)){traceStep=id==='trace-reset'?0:Math.max(0,Math.min(traces[traceMode].steps.length-1,traceStep+(id==='trace-next'?1:-1)));$('#trace-slot').innerHTML=traceDiagram();const target=$('#'+id);(target&&!target.disabled?target:$('#trace-reset')).focus();}
    if(id==='print-chapter')window.print();
    if(id==='alias-next'||id==='alias-prev'||id==='alias-reset'){aliasStep=id==='alias-reset'?0:Math.max(0,Math.min(3,aliasStep+(id==='alias-next'?1:-1)));$('#alias-slot').innerHTML=aliasDiagram();const target=$('#alias-slot').querySelector('#'+id);(target&&!target.disabled?target:$('#alias-reset')).focus();}
    if(id==='align-toggle'){alignPosition=!alignPosition;$('#align-slot').innerHTML=alignDiagram();$('#align-toggle').focus();}
    if(id==='export-state')download('python-learning-record.json',{schema:1,course:'python-guide-v1',state});
  });
  function download(name,value){const url=URL.createObjectURL(new Blob([JSON.stringify(value,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),2000);notify('学习记录已导出');}
  document.addEventListener('change',async e=>{
    if(e.target.id==='problem-filter'){problemStatus=e.target.value;$('#problem-list').innerHTML=problemRows();return;}
    if(!['report-import','state-import'].includes(e.target.id))return;
    const file=e.target.files[0];if(!file)return;
    try{
      if(file.size>5*1024*1024)throw Error('文件过大，请选择5MB以内的JSON记录');
      const value=JSON.parse(await file.text());
      if(value.schema!==1||value.course!=='python-guide-v1')throw Error('这不是本课程的记录文件');
      if(e.target.id==='state-import'){state=cleanState(value.state);persist();applySettings();render(false);notify('学习记录已导入');}
      else{
        if(value.reference!==false)throw Error('参考解验证不能作为个人测试成绩导入');
        if(!Array.isArray(value.results))throw Error('没有找到评测结果');
        const candidate={};for(const r of value.results)if(r&&problemIds.has(r.id))candidate[r.id]=r;
        const clean=cleanResults(candidate);if(!Object.keys(clean).length)throw Error('没有有效的本课程题目结果');
        state.results={...state.results,...clean};persist();render(false);notify(`已导入${Object.keys(clean).length}道题的本地评测结果`);
      }
    }catch(err){notify('导入失败：'+err.message);e.target.value='';}
  });
  $('#menu').addEventListener('click',()=>{const open=!$('#sidebar').classList.contains('open');$('#sidebar').classList.toggle('open',open);$('#menu').setAttribute('aria-expanded',String(open));$('#scrim').hidden=!open;syncSidebar();if(open)$('#sidebar a').focus();});
  $('#scrim').addEventListener('click',closeMenu);
  $('#theme').addEventListener('click',()=>{state.dark=!state.dark;applySettings();persist();});
  $('#font-down').addEventListener('click',()=>{state.font=Math.max(15,state.font-1);applySettings();persist();notify(`正文字号 ${state.font}px`);});
  $('#font-up').addEventListener('click',()=>{state.font=Math.min(24,state.font+1);applySettings();persist();notify(`正文字号 ${state.font}px`);});
  function openSearch(){if(!$('#search-dialog').open)$('#search-dialog').showModal();$('#search-input').focus();search();}
  function closeSearch(){$('#search-dialog').close();}
  $('#search-open').addEventListener('click',openSearch);$('#search-close').addEventListener('click',closeSearch);
  document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();openSearch();}if(e.key==='Escape')closeMenu();});
  const index=[...data.chapters.map(c=>({title:c.id+' '+c.title,sub:c.sub,url:'#chapter/'+c.id,text:c.title+c.sub+c.body+c.code})),...data.problems.map(p=>({title:p.id+' '+p.title,sub:'练习 · 第'+p.chapter+'章',url:'#problem/'+p.id,text:p.title+p.contract}))];
  function search(){const q=$('#search-input').value.trim().toLowerCase();const results=q?index.filter(x=>x.text.toLowerCase().includes(q)).slice(0,20):index.slice(0,5);$('#search-results').innerHTML=results.length?results.map(r=>`<a href="${r.url}">${esc(r.title)}<small>${esc(r.sub)}</small></a>`).join(''):'<p>没有找到相关内容，试试更短的关键词或英文API名。</p>';}
  $('#search-input').addEventListener('input',search);$('#search-results').addEventListener('click',e=>{if(e.target.closest('a'))closeSearch();});
  window.addEventListener('hashchange',()=>render());
  window.addEventListener('resize',syncSidebar);
  $('.primary-nav [data-page="practice"] span').textContent=problemCount;
  applySettings();render(false);
})();
