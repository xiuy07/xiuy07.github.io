const readingKey='xiu-journal-reading-v1';
const month=30*24*60*60*1000;

export function createReadingMemory(storage,now=Date.now){
  const validRoute=route=>typeof route==='string'&&/^\/journal\/(?:[^/?#]+\/)+$/.test(route);
  function records(){
    try{
      const saved=JSON.parse(storage.getItem(readingKey)||'{}');
      if(!saved||typeof saved!=='object'||Array.isArray(saved))return {};
      return Object.fromEntries(Object.entries(saved).filter(([route,record])=>validRoute(route)&&record&&Number.isFinite(record.ratio)&&record.ratio>=.08&&record.ratio<.96&&Number.isFinite(record.updatedAt)&&record.updatedAt<=now()+300000&&now()-record.updatedAt<month));
    }catch{return {};}
  }
  return {
    get:route=>records()[route]||null,
    save(route,ratio){
      if(!validRoute(route)||!Number.isFinite(ratio))return;
      const saved=records();
      if(ratio>=.08&&ratio<.96)saved[route]={ratio,updatedAt:now()};else delete saved[route];
      const recent=Object.entries(saved).sort((a,b)=>b[1].updatedAt-a[1].updatedAt).slice(0,12);
      try{storage.setItem(readingKey,JSON.stringify(Object.fromEntries(recent)));}catch{}
    }
  };
}

export function readingPosition(top,height,viewport,scroll){
  const start=Math.max(0,top-96),distance=Math.max(1,height-Math.max(200,viewport-160));
  return {start,distance,ratio:Math.max(0,Math.min(1,(scroll-start)/distance))};
}

export function createSecretKeys(reveal,clock=Date.now){
  let letters='',last=0;
  return event=>{
    if(event.defaultPrevented||event.isComposing||event.repeat||event.ctrlKey||event.metaKey||event.altKey||event.target?.isContentEditable||event.target?.closest?.('input,textarea,select,[contenteditable]:not([contenteditable="false"]),[role="textbox"]')){letters='';return;}
    const now=clock(),key=event.key.toLowerCase();
    if(now-last>1200)letters='';last=now;
    if(!/^[a-z]$/.test(key)){letters='';return;}
    letters=(letters+key).slice(-3);
    if(letters==='sea'||letters==='moo'){const secret=letters;letters='';reveal(secret);}
  };
}

const notes=[
  '今天不赶路，听完这首歌再说。',
  '没写完的代码，等一阵海风再继续。',
  '有些歌，前奏响起就想再听一遍。',
  '今天的进度：给喜欢的事留了一点时间。',
  '海浪没有刷新按钮，下一朵也很好看。',
  '耳机戴好，这几分钟归自己。',
  '偶尔走错一页，也许会遇到一头奶牛。',
  '把这一小段安静，带回今天。'
];

export function installJournalExtras(){
  const motion=matchMedia('(prefers-reduced-motion: reduce)');
  const memory=createReadingMemory({getItem:key=>localStorage.getItem(key),setItem:(key,value)=>localStorage.setItem(key,value)});
  let session=null,saveTimer,cowTimer,opener;
  const dialog=document.getElementById('seaside-note'),visitor=document.querySelector('[data-cow-visitor]');
  const status=document.querySelector('[data-extras-status]');
  const today=new Date();
  let note=Math.floor(Date.UTC(today.getFullYear(),today.getMonth(),today.getDate())/86400000)%notes.length;
  function renderNote(){
    dialog.querySelector('[data-note-date]').textContent=`${today.getMonth()+1} 月 ${today.getDate()} 日 · 海边拾遗`;
    dialog.querySelector('[data-note-message]').textContent=notes[note];
  }
  function openShell(){
    if(!dialog?.showModal||dialog.open)return;
    opener=document.activeElement;renderNote();dialog.showModal();
  }
  function closeShell(){if(dialog?.open)dialog.close();}
  function hideCow(){clearTimeout(cowTimer);if(visitor)visitor.hidden=true;}
  function scheduleCow(){
    clearTimeout(cowTimer);
    cowTimer=setTimeout(()=>{if(!visitor.contains(document.activeElement))hideCow();},16000);
  }
  function findCow(){
    if(!visitor)return;
    closeShell();visitor.hidden=false;status.textContent='有一头奶牛来找你，可以送它回 404 牧场。';scheduleCow();
  }
  function geometry(article){const rect=article.getBoundingClientRect();return readingPosition(rect.top+scrollY,rect.height,innerHeight,scrollY);}
  function saveReading(){if(session&&!session.pending&&session.article.isConnected)memory.save(session.route,geometry(session.article).ratio);}
  async function moveToReading(current,ratio){
    await document.fonts?.ready;
    if(session!==current||!current.article.isConnected)return;
    current.pending=false;current.tools.querySelector('[data-reading-resume]').hidden=true;
    current.article.tabIndex=-1;current.article.focus({preventScroll:true});
    const position=geometry(current.article);
    scrollTo({top:position.start+position.distance*ratio,behavior:motion.matches?'auto':'smooth'});
  }
  function mount(){
    document.querySelectorAll('[data-open-seashell]').forEach(button=>{button.hidden=!dialog?.showModal;});
    const tools=document.querySelector('[data-reading-tools]'),article=document.getElementById('article-container');
    if(!tools||!article||session?.tools===tools)return;
    tools.hidden=false;
    const route=location.pathname,record=memory.get(route);
    const current={tools,article,route,pending:!!record};session=current;
    const resume=tools.querySelector('[data-reading-resume]');resume.hidden=!record;
    if(record)tools.querySelector('[data-reading-percent]').textContent=`${Math.round(record.ratio*100)}%`;
    tools.querySelector('[data-resume-reading]').addEventListener('click',()=>moveToReading(current,record?.ratio||0));
    tools.querySelector('[data-dismiss-reading]').addEventListener('click',()=>{memory.save(route,0);moveToReading(current,0);});
    const copy=tools.querySelector('[data-copy-link]'),feedback=tools.querySelector('[data-copy-status]');
    copy.addEventListener('click',async()=>{
      if(copy.disabled)return;copy.disabled=true;
      const url=new URL(route,location.origin).href;
      try{
        if(!navigator.clipboard?.writeText)throw new Error('Clipboard unavailable');
        await navigator.clipboard.writeText(url);
        if(session!==current)return;
        feedback.textContent='链接已复制';tools.querySelector('[data-copy-fallback]').hidden=true;
      }catch{
        if(session!==current)return;
        tools.querySelector('[data-copy-fallback]').hidden=false;
        const input=tools.querySelector('[data-copy-input]');input.value=url;input.focus();input.select();
        feedback.textContent='请手动复制下面的链接';
      }finally{if(copy.isConnected)copy.disabled=false;}
    });
  }
  document.addEventListener('click',event=>{if(event.target.closest('[data-open-seashell]'))openShell();});
  dialog?.querySelector('[data-close-seashell]').addEventListener('click',closeShell);
  dialog?.querySelector('[data-next-note]').addEventListener('click',()=>{note=(note+1)%notes.length;renderNote();});
  dialog?.querySelector('[data-find-cow]').addEventListener('click',findCow);
  dialog?.addEventListener('close',()=>{
    if(visitor&&!visitor.hidden)visitor.querySelector('a').focus({preventScroll:true});
    else if(opener?.isConnected)opener.focus({preventScroll:true});
  });
  dialog?.addEventListener('click',event=>{
    if(event.target!==dialog)return;
    const rect=dialog.getBoundingClientRect();
    if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)closeShell();
  });
  dialog?.addEventListener('keydown',event=>{
    if(event.key!=='Tab')return;
    const controls=[...dialog.querySelectorAll('button,a[href]')].filter(element=>!element.disabled&&element.getClientRects().length);
    const first=controls[0],last=controls.at(-1),active=document.activeElement;
    if(event.shiftKey&&(active===first||active===dialog)){event.preventDefault();last?.focus();}
    else if(!event.shiftKey&&(active===last||active===dialog)){event.preventDefault();first?.focus();}
  });
  visitor?.querySelector('[data-close-cow]').addEventListener('click',()=>{
    const hadFocus=visitor.contains(document.activeElement);hideCow();
    if(hadFocus)document.querySelector('[data-open-seashell]')?.focus({preventScroll:true});
  });
  visitor?.addEventListener('pointerenter',()=>clearTimeout(cowTimer));
  visitor?.addEventListener('pointerleave',scheduleCow);
  visitor?.addEventListener('focusout',scheduleCow);
  const secret=createSecretKeys(code=>{
    const search=document.querySelector('#local-search .search-dialog');
    if(document.querySelector('dialog[open],#sidebar-menus.open')||search&&getComputedStyle(search).display!=='none')return;
    code==='sea'?openShell():findCow();
  });
  document.addEventListener('keydown',secret);
  window.addEventListener('scroll',()=>{clearTimeout(saveTimer);saveTimer=setTimeout(saveReading,450);},{passive:true});
  window.addEventListener('pagehide',saveReading);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)saveReading();});
  document.addEventListener('pjax:send',()=>{saveReading();clearTimeout(saveTimer);session=null;closeShell();hideCow();});
  document.addEventListener('pjax:complete',mount);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
}

if(typeof document!=='undefined')installJournalExtras();
