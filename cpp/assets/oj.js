(() => {
  'use strict';
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const statusNames = {AC:'通过全部测试',WA:'答案不符',CE:'编译错误',RE:'运行错误',TLE:'运行超时',OLE:'输出超限',OK:'运行完成',ERROR:'评测未完成'};
  function mount(root, p, {notify, accept}) {
    let active = true, token = '', ready = false, busy = false, timer, editor, history = [];
    const q = s => root.querySelector(s);
    const key = `cpp-oj-draft-v1-${p.id}`;
    let draft = p.starter_source;
    try { draft = localStorage.getItem(key) ?? draft; } catch { /* The editor still works. */ }
    const sample = p.samples?.[0] || {input:'', output:''};
    const ch = window.CPP_GUIDE.chapters[p.chapter - 1];
    root.innerHTML = `<div class="page-heading"><div><p class="oj-breadcrumb"><a href="#practice">题库</a> / ${esc(p.id)} · ${esc(p.difficulty)}</p><h1>${esc(p.title)}</h1><p>${esc(p.topic || ch.title)} · C++17 · ${p.test_count} 组公开测试</p></div><a class="btn" href="#training">训练路线</a></div>
      <div class="oj-connection" role="status"><span class="oj-dot"></span><span id="oj-engine">正在检查本地评测环境…</span></div>
      <details class="oj-start" id="oj-start"><summary>启动本地 OJ，直接在网页评测</summary><ol><li><a href="downloads/cpp-study-kit.zip" download>下载并解压学习包</a>，准备 Python 3.9+ 和支持 C++17 的 GCC / Clang。</li><li>在解压目录运行 <code>python run_oj.py</code>，按终端地址打开本地 OJ。</li><li>在本地网页中编辑、运行和提交；用 <code>--cxx 编译器路径</code> 指定编译器。</li></ol><p>此处 GitHub Pages 提供题库与编辑器。编译和测试由本地服务执行；草稿只存在当前浏览器，切换到本地前请下载代码带过去。服务仅运行你自己的可信代码。</p></details>
      <div class="oj-panes"><section class="card oj-description" aria-label="题目资料"><div class="oj-tabs" role="tablist" aria-label="题目资料"><button id="oj-tab-statement" role="tab" aria-selected="true" aria-controls="oj-statement" tabindex="0" data-oj-tab="statement">题目</button><button id="oj-tab-hints" role="tab" aria-selected="false" aria-controls="oj-hints" tabindex="-1" data-oj-tab="hints">提示</button><button id="oj-tab-editorial" role="tab" aria-selected="false" aria-controls="oj-editorial" tabindex="-1" data-oj-tab="editorial">题解</button></div>
      <div id="oj-statement" role="tabpanel" aria-labelledby="oj-tab-statement" class="oj-document"><article>${p.html}</article>${p.mode==='header'?`<details><summary>固定测试入口（自动调用你的接口，无需修改）</summary>${p.driver_html}</details>`:''}<p><a href="#chapter/${esc(ch.id)}">阅读关联讲义：${esc(ch.title)}</a></p></div>
      <div id="oj-hints" role="tabpanel" aria-labelledby="oj-tab-hints" class="oj-document" hidden><h2>逐层提示</h2>${p.hints.map((h,i)=>`<details><summary>提示 ${i+1}</summary><p>${esc(h)}</p></details>`).join('')}<p>先用小规模暴力解验证，再逐步降低复杂度。</p></div>
      <div id="oj-editorial" role="tabpanel" aria-labelledby="oj-tab-editorial" class="oj-document" hidden><details><summary>展开题解与参考实现</summary>${p.editorial_html || `<p>${esc(p.analysis)}</p>`}${p.editorial_html?.includes('完整 C++17 实现')?'':p.reference_html}</details></div></section>
      <section class="oj-workspace" aria-label="编写与评测"><div class="card oj-editor-card"><div class="card-header"><label for="oj-source">${esc(p.filename)} <span>C++17${p.mode==='header'?' · 固定入口自动调用接口':''}</span></label><span id="oj-saved" aria-live="polite">草稿就绪</span></div><textarea id="oj-source" spellcheck="false" wrap="off" aria-label="C++17 代码编辑器"></textarea><div class="oj-editor-foot"><span id="oj-lines"></span><div><button id="oj-restore" class="btn btn-sm" type="button">恢复初始框架</button><button id="oj-download" class="btn btn-sm" type="button">下载代码</button></div></div></div>
      <section class="card oj-console"><div class="card-body"><div class="oj-run-actions"><button id="oj-run" class="btn" type="button" disabled>运行输入</button><button id="oj-submit" class="btn btn-primary" type="button" disabled>提交全部测试</button><span id="oj-job-status" role="status" aria-live="polite">等待本地服务</span></div><label for="oj-input">运行输入 <span>可修改；不会改变正式测试</span></label><textarea id="oj-input" rows="4" spellcheck="false" aria-describedby="oj-input-note"></textarea><p id="oj-input-note">上方预填首个样例。运行输入只检查这一次运行；提交全部测试才会记录整题通过。编辑器内按 Esc 后 Tab 可移出编辑区。</p><details><summary>样例期望输出</summary><pre class="oj-plain">${esc(sample.output)}</pre></details><div id="oj-output" aria-live="polite" aria-atomic="false"><p class="oj-muted">提交后显示编译信息、逐组用时和首个失败用例。</p></div></div></section>
      <section class="card oj-history"><div class="card-header"><h2>本地提交记录</h2><button id="oj-refresh" class="btn btn-sm" type="button">刷新</button></div><div id="oj-history" class="card-body"><p class="oj-muted">启动本地服务后查看本题记录。</p></div></section></section></div>`;
    const source = q('#oj-source'); source.value = draft; q('#oj-input').value = sample.input;
    function value() { return editor ? editor.getValue() : source.value; }
    function save() {
      const text = value();
      q('#oj-lines').textContent = `${text.split('\n').length} 行 · ${text.length} 字符`;
      try { localStorage.setItem(key, text); q('#oj-saved').textContent = '已保存到此浏览器'; }
      catch { q('#oj-saved').textContent = '未能自动保存，请下载代码'; }
    }
    source.addEventListener('input', save); save();
    if (window.CodeMirror) {
      editor = window.CodeMirror.fromTextArea(source, {mode:'text/x-c++src',lineNumbers:true,indentUnit:4,tabSize:4,matchBrackets:true,lineWrapping:false,screenReaderLabel:'C++17 代码编辑器',extraKeys:{Esc:cm=>cm.setOption('extraKeys',{Tab:false,'Shift-Tab':false,Esc:()=>{}})}});
      // Tab inserts indentation until Esc explicitly releases it for keyboard navigation.
      editor.on('change', save); editor.refresh();
    }
    function choose(name, focus=false) {
      for (const button of root.querySelectorAll('[data-oj-tab]')) {
        const selected=button.dataset.ojTab===name;
        button.setAttribute('aria-selected',String(selected)); button.tabIndex=selected?0:-1;
        q('#oj-'+button.dataset.ojTab).hidden=!selected;
        if(selected && focus)button.focus();
      }
    }
    root.querySelector('.oj-tabs').addEventListener('click',e=>{const b=e.target.closest('[data-oj-tab]');if(b)choose(b.dataset.ojTab);});
    root.querySelector('.oj-tabs').addEventListener('keydown',e=>{
      if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;
      const tabs=[...root.querySelectorAll('[data-oj-tab]')],i=tabs.indexOf(document.activeElement);
      const j=e.key==='Home'?0:e.key==='End'?2:(i+(e.key==='ArrowRight'?1:2))%3;
      e.preventDefault();choose(tabs[j].dataset.ojTab,true);
    });
    q('#oj-restore').onclick=()=>{if(!window.confirm('用初始框架替换当前草稿？请先下载需要保留的代码。'))return;if(editor)editor.setValue(p.starter_source);else source.value=p.starter_source;save();};
    q('#oj-download').onclick=()=>{
      const url=URL.createObjectURL(new Blob([value()],{type:'text/plain;charset=utf-8'}));
      const a=document.createElement('a');a.href=url;a.download=p.id+'-'+p.filename;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);notify('代码已交给浏览器下载。');
    };
    async function api(path, options) {
      const response=await fetch(path,{...options,headers:{'Content-Type':'application/json',...(token?{'X-OJ-Token':token}:{}),...options?.headers},cache:'no-store'});
      const text=await response.text();let result;
      try { result=JSON.parse(text); } catch { throw Error('当前地址没有本地评测接口，请运行 python run_oj.py。'); }
      if(!response.ok)throw Error(result.error||`请求失败（${response.status}）`);
      return result;
    }
    function buttons() { for(const id of ['#oj-run','#oj-submit'])q(id).disabled=!ready||busy; }
    async function refreshHistory() {
      if(!ready)return;
      try {
        const response=await api('/api/history');if(!active)return;history=response.history;
        for(const id of response.accepted||[])accept(id);
        const items=history.filter(x=>x.problem===p.id).slice(0,12);
        q('#oj-history').innerHTML=items.length?`<table class="table"><thead><tr><th>时间</th><th>方式</th><th>结果</th><th>通过</th></tr></thead><tbody>${items.map(x=>`<tr><td>${esc(new Date(x.submitted).toLocaleString())}</td><td>${x.mode==='judge'?'全量提交':'运行输入'}</td><td class="oj-verdict ${x.status==='AC'?'is-ac':''}">${esc(x.status)}</td><td>${x.passed}/${x.total}</td></tr>`).join('')}</tbody></table>`:'<p class="oj-muted">本题还没有提交记录。代码快照与结果保存在学习包的 .local-oj 目录。</p>';
      } catch(error) {if(active)q('#oj-history').textContent=error.message;}
    }
    function show(job) {
      const status=statusNames[job.status]||job.status;
      q('#oj-job-status').textContent=`${job.status} · ${status}`;
      q('#oj-output').innerHTML=`<div class="oj-result-title ${job.status==='AC'?'is-ac':''}"><strong>${esc(job.status)} · ${esc(status)}</strong><span>${job.elapsed_ms} ms 总耗时（含编译）</span></div><p>${esc(job.message)}</p>${job.compiler_log?`<details open><summary>编译器输出</summary><pre class="oj-plain">${esc(job.compiler_log)}</pre></details>`:''}<div class="oj-case-grid">${(job.cases||[]).map(c=>`<span class="oj-case ${c.status==='AC'||c.status==='OK'?'is-ac':'is-fail'}">${esc(c.name)} · ${esc(c.status)} · ${c.elapsed_ms} ms</span>`).join('')}</div>${(job.cases||[]).filter(c=>c.actual!==undefined||c.stderr).map(c=>`<section class="oj-case-output"><h3>${esc(c.name)} · ${esc(c.status)}</h3>${c.input!==undefined?`<details><summary>失败输入（最多显示 8000 字符）</summary><pre class="oj-plain">${esc(c.input)}</pre></details>`:''}${c.expected!==undefined?`<h4>期望输出</h4><pre class="oj-plain">${esc(c.expected)}</pre>`:''}${c.actual!==undefined?`<h4>实际输出${job.mode==='judge'?'（最多显示 8000 字符）':''}</h4><pre class="oj-plain">${esc(c.actual)||'（空输出）'}</pre>`:''}${c.stderr?`<h4>标准错误</h4><pre class="oj-plain">${esc(c.stderr)}</pre>`:''}</section>`).join('')}`;
      if(job.mode==='judge'&&job.status==='AC')accept(p.id);
    }
    async function poll(id) {
      try {
        const job=await api('/api/jobs/'+id);if(!active)return;
        if(job.state==='done'){show(job);busy=false;buttons();refreshHistory();return;}
        q('#oj-job-status').textContent=job.state==='queued'?'排队中…':job.progress?`测试中 ${job.progress}/${job.total}…`:'编译并准备测试…';
        timer=setTimeout(()=>poll(id),600);
      } catch(error){if(active){busy=false;buttons();q('#oj-job-status').textContent=error.message;}}
    }
    async function submit(mode) {
      if(!ready||busy)return;
      if(!value().trim()){notify('请先填写代码。');return;}
      busy=true;buttons();q('#oj-job-status').textContent='正在提交代码快照…';save();
      try {const job=await api('/api/jobs',{method:'POST',body:JSON.stringify({problem:p.id,mode,source:value(),input:q('#oj-input').value})});if(active)poll(job.job);}
      catch(error){if(active){busy=false;buttons();q('#oj-job-status').textContent=error.message;}}
    }
    q('#oj-run').onclick=()=>submit('sample');q('#oj-submit').onclick=()=>submit('judge');q('#oj-refresh').onclick=refreshHistory;
    (async()=>{
      if(location.protocol!=='http:'||location.hostname!=='127.0.0.1') {
        q('#oj-engine').textContent='当前为在线题库；下载学习包后启动本地服务，即可运行和评测。';q('#oj-start').open=true;return;
      }
      try {
        const meta=await api('/api/meta');if(!active)return;token=meta.token;
        if(!meta.compiler)throw Error('本地服务已连接，但没有找到编译器；请按启动说明指定 --cxx。');
        ready=true;buttons();q('#oj-engine').textContent=`本地评测已连接 · ${meta.compiler} · C++17`;root.querySelector('.oj-connection').classList.add('connected');q('#oj-job-status').textContent='可以运行输入或提交全部测试';refreshHistory();
      } catch(error){if(active){q('#oj-engine').textContent=error.message;q('#oj-start').open=true;}}
    })();
    return ()=>{active=false;clearTimeout(timer);editor?.toTextArea();};
  }
  window.CPP_OJ={mount};
})();
