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

export function createReadingCheckpoint(waitingForChoice=false){
  let waiting=waitingForChoice,manual=false;
  return {
    noteScrollIntent(){manual=true;},
    choose(){waiting=false;},
    accept(ratio){
      if(!Number.isFinite(ratio)||waiting&&!(manual&&ratio>=.08))return null;
      waiting=false;return ratio;
    }
  };
}

export function estimateReadingMinutes(text,imageCount=0){
  const characters=(text.match(/[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}]/gu)||[]).length;
  const words=(text.match(/[A-Za-z0-9]+(?:['’][A-Za-z0-9]+)*/g)||[]).length;
  return Math.max(1,Math.ceil(characters/300+words/200+Math.max(0,imageCount)/12));
}

export function createKeptNote(storage,ids){
  const key='xiu-journal-kept-note-v1';
  return {
    get(){try{const id=JSON.parse(storage.getItem(key)||'null');return ids.includes(id)?id:null;}catch{return null;}},
    set(id){
      if(id!==null&&!ids.includes(id))return false;
      try{storage.setItem(key,JSON.stringify(id));return true;}catch{return false;}
    }
  };
}

export function isBackdropPoint(rect,x,y){return x<rect.left||x>rect.right||y<rect.top||y>rect.bottom;}

export function createBackdropDismiss(){
  let outside=false;
  return {
    start(rect,x,y,targetIsBackdrop){outside=targetIsBackdrop&&isBackdropPoint(rect,x,y);},
    cancel(){outside=false;},
    finish(rect,x,y,targetIsBackdrop){const dismiss=outside&&targetIsBackdrop&&isBackdropPoint(rect,x,y);outside=false;return dismiss;}
  };
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
  ['one-song','今天不赶路，听完这首歌再说。'],
  ['sea-breeze','没写完的代码，等一阵海风再继续。'],
  ['intro','有些歌，前奏响起就想再听一遍。'],
  ['small-progress','今天的进度：给喜欢的事留了一点时间。'],
  ['next-wave','海浪没有刷新按钮，下一朵也很好看。'],
  ['headphones','耳机戴好，这几分钟归自己。'],
  ['lost-cow','偶尔走错一页，也许会遇到一头奶牛。'],
  ['quiet-moment','把这一小段安静，带回今天。']
];

export function installJournalExtras(){
  const motion=matchMedia('(prefers-reduced-motion: reduce)');
  const storage={getItem:key=>localStorage.getItem(key),setItem:(key,value)=>localStorage.setItem(key,value)};
  const memory=createReadingMemory(storage),keptNote=createKeptNote(storage,notes.map(([id])=>id));
  let session=null,saveTimer,cowTimer,opener,noteAnimation;
  const backdrop=createBackdropDismiss();
  const dialog=document.getElementById('seaside-note'),visitor=document.querySelector('[data-cow-visitor]');
  const status=document.querySelector('[data-extras-status]');
  const today=new Date();
  let note=Math.floor(Date.UTC(today.getFullYear(),today.getMonth(),today.getDate())/86400000)%notes.length;
  function renderNote(animate=false){
    const date=new Date(),id=notes[note][0],saved=keptNote.get()===id;
    dialog.querySelector('[data-note-date]').textContent=`${date.getMonth()+1} 月 ${date.getDate()} 日 · 海边拾遗`;
    dialog.querySelector('[data-note-count]').textContent=`${note+1} / ${notes.length}`;
    dialog.querySelector('[data-note-count]').setAttribute('aria-label',`第 ${note+1} 枚，共 ${notes.length} 枚`);
    const message=dialog.querySelector('[data-note-message]');message.textContent=notes[note][1];
    dialog.querySelector('[data-keep-note]').setAttribute('aria-pressed',String(saved));
    dialog.querySelector('[data-keep-label]').textContent=saved?'已留住':'留住这枚';
    const feedback=dialog.querySelector('[data-note-status]'),text=saved?'下次打开，先看这一枚。':'留住后，下次先看这一枚。';
    if(feedback.textContent!==text)feedback.textContent=text;
    noteAnimation?.cancel();
    if(animate&&!motion.matches&&message.animate)noteAnimation=message.animate([{opacity:0,transform:'translateY(4px)'},{opacity:1,transform:'translateY(0)'}],{duration:180,easing:'ease-out'});
  }
  function openShell(){
    if(!dialog?.showModal||dialog.open)return;
    const saved=keptNote.get();if(saved)note=notes.findIndex(([id])=>id===saved);
    opener=document.activeElement;renderNote();dialog.showModal();document.documentElement.classList.add('seaside-is-open');
  }
  function closeShell(){if(dialog?.open)dialog.close();}
  function hideCow(){clearTimeout(cowTimer);if(visitor)visitor.hidden=true;if(status)status.textContent='';}
  function scheduleCow(){
    clearTimeout(cowTimer);
    cowTimer=setTimeout(()=>{if(!visitor.contains(document.activeElement))hideCow();},16000);
  }
  function findCow(){
    if(!visitor)return;
    closeShell();visitor.hidden=false;status.textContent='有一头奶牛来找你，可以送它回 404 牧场。';scheduleCow();
  }
  function geometry(article){const rect=article.getBoundingClientRect();return readingPosition(rect.top+scrollY,rect.height,innerHeight,scrollY);}
  function saveReading(){
    if(!session?.article.isConnected)return;
    const ratio=session.checkpoint.accept(geometry(session.article).ratio);
    if(ratio!==null)memory.save(session.route,ratio);
  }
  async function moveToReading(current,ratio){
    await document.fonts?.ready;
    if(session!==current||!current.article.isConnected)return;
    current.checkpoint.choose();current.tools.querySelector('[data-reading-resume]').hidden=true;
    current.article.tabIndex=-1;current.article.focus({preventScroll:true});
    const position=geometry(current.article);
    scrollTo({top:position.start+position.distance*ratio,behavior:motion.matches?'auto':'smooth'});
  }
  function mount(){
    document.querySelectorAll('[data-open-seashell]').forEach(button=>{button.hidden=!dialog?.showModal;});
    refreshCards();
    const tools=document.querySelector('[data-reading-tools]'),article=document.getElementById('article-container');
    if(!tools||!article||session?.tools===tools)return;
    tools.hidden=false;
    const route=location.pathname,record=memory.get(route);
    const current={tools,article,route,checkpoint:createReadingCheckpoint(!!record)};session=current;
    // A cached article may still contain the previous toolbar during a deployment.
    const readingTime=tools.querySelector('[data-reading-time]');
    if(readingTime)readingTime.textContent=`约 ${estimateReadingMinutes(article.textContent,article.querySelectorAll('img').length)} 分钟`;
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
        clearTimeout(current.copyTimer);current.copyTimer=setTimeout(()=>{if(session===current)feedback.textContent='';},4000);
      }catch{
        if(session!==current)return;
        tools.querySelector('[data-copy-fallback]').hidden=false;
        const input=tools.querySelector('[data-copy-input]');input.value=url;input.focus();input.select();
        feedback.textContent='请手动复制下面的链接';
      }finally{if(copy.isConnected)copy.disabled=false;}
    });
  }
  function refreshCards(){
    for(const card of document.querySelectorAll('.recent-post-item')){
      const link=card.querySelector('a.article-title');if(!link)continue;
      const record=memory.get(new URL(link.href).pathname);
      let badge=card.querySelector('[data-reading-card]');
      if(!record){badge?.remove();continue;}
      if(!badge){badge=document.createElement('span');badge.className='journal-card-reading';badge.dataset.readingCard='';card.querySelector('.article-meta-wrap')?.append(badge);}
      badge.textContent=`读到 ${Math.round(record.ratio*100)}%`;
    }
  }
  document.addEventListener('click',event=>{if(event.target.closest('[data-open-seashell]'))openShell();});
  dialog?.querySelector('[data-close-seashell]').addEventListener('click',closeShell);
  dialog?.querySelector('[data-next-note]').addEventListener('click',()=>{note=(note+1)%notes.length;renderNote(true);});
  dialog?.querySelector('[data-keep-note]').addEventListener('click',()=>{
    const id=notes[note][0],saved=keptNote.get()===id;
    if(keptNote.set(saved?null:id))renderNote();
    else dialog.querySelector('[data-note-status]').textContent='浏览器暂时无法保存，可以继续换笺。';
  });
  dialog?.querySelector('[data-find-cow]').addEventListener('click',findCow);
  dialog?.addEventListener('close',()=>{
    if(dialog.open)return;
    document.documentElement.classList.remove('seaside-is-open');noteAnimation?.cancel();backdrop.cancel();
    if(visitor&&!visitor.hidden)visitor.querySelector('a').focus({preventScroll:true});
    else if(opener?.isConnected)opener.focus({preventScroll:true});
  });
  dialog?.addEventListener('pointerdown',event=>backdrop.start(dialog.getBoundingClientRect(),event.clientX,event.clientY,event.target===dialog));
  dialog?.addEventListener('pointercancel',()=>backdrop.cancel());
  dialog?.addEventListener('click',event=>{
    if(backdrop.finish(dialog.getBoundingClientRect(),event.clientX,event.clientY,event.target===dialog))closeShell();
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
  const noteScrollIntent=event=>{
    if(!session||event.defaultPrevented||event.ctrlKey||event.metaKey||event.altKey||event.target?.isContentEditable||event.target?.closest?.('dialog,#local-search,#sidebar-menus,input,textarea,select,[contenteditable]:not([contenteditable="false"])'))return;
    if(event.type==='keydown'&&(!['ArrowDown','ArrowUp','PageDown','PageUp','Home','End',' '].includes(event.key)||event.key===' '&&event.target?.closest?.('button,a')))return;
    session.checkpoint.noteScrollIntent();
  };
  window.addEventListener('wheel',noteScrollIntent,{passive:true});
  window.addEventListener('touchmove',noteScrollIntent,{passive:true});
  document.addEventListener('keydown',noteScrollIntent);
  window.addEventListener('scroll',()=>{clearTimeout(saveTimer);saveTimer=setTimeout(saveReading,450);},{passive:true});
  window.addEventListener('pagehide',saveReading);
  window.addEventListener('pageshow',()=>{document.documentElement.classList.toggle('seaside-is-open',!!dialog?.open);refreshCards();});
  window.addEventListener('storage',event=>{if(event.key===readingKey||event.key===null)refreshCards();});
  motion.addEventListener('change',()=>{if(motion.matches)noteAnimation?.cancel();});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)saveReading();else refreshCards();});
  document.addEventListener('pjax:send',()=>{saveReading();clearTimeout(saveTimer);clearTimeout(session?.copyTimer);session=null;closeShell();hideCow();});
  document.addEventListener('pjax:complete',mount);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
}

if(typeof document!=='undefined')installJournalExtras();
