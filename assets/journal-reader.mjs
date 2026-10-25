const preferenceKey='xiu-journal-reader-v1';
export function createReaderPreferences(storage){
  const normalize=value=>({size:['standard','comfortable','large'].includes(value?.size)?value.size:'standard',spacing:['standard','relaxed'].includes(value?.spacing)?value.spacing:'standard'});
  return {
    read(){try{return normalize(JSON.parse(storage.getItem(preferenceKey)||'null'));}catch{return normalize(null);}},
    save(value){try{storage.setItem(preferenceKey,JSON.stringify(normalize(value)));return true;}catch{return false;}}
  };
}

export function isSearchShortcut(event){
  if(event.defaultPrevented||event.isComposing||event.repeat||event.altKey||event.target?.isContentEditable||event.target?.closest?.('input,textarea,select,[contenteditable]:not([contenteditable="false"]),[role="textbox"]'))return false;
  return event.key==='/'&&!event.ctrlKey&&!event.metaKey||event.key.toLowerCase()==='k'&&(event.ctrlKey||event.metaKey)&&!event.shiftKey;
}

export async function copyFeedAddress({writeText,url,onCopied,onManual}){
  try{if(!writeText)throw Error('Clipboard unavailable');await writeText(url);onCopied();}catch{onManual();}
}

export function installJournalReader(){
  const root=document.documentElement;
  const preferences=createReaderPreferences({getItem:key=>localStorage.getItem(key),setItem:(key,value)=>localStorage.setItem(key,value)});
  const enhanced=new WeakSet();let choice=preferences.read();
  function apply(){
    root.dataset.journalTextSize=choice.size;root.dataset.journalLineSpacing=choice.spacing;
    document.querySelectorAll('[data-reader-size]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.readerSize===choice.size)));
    document.querySelectorAll('[data-reader-spacing]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.readerSpacing===choice.spacing)));
  }
  function closeSettings(restoreFocus=false){
    document.querySelectorAll('[data-reading-settings][open]').forEach(settings=>{settings.open=false;if(restoreFocus)settings.querySelector('summary').focus({preventScroll:true});});
  }
  function saveChoice(settings){
    apply();const saved=preferences.save(choice);
    settings.querySelector('[data-reader-status]').textContent=saved?'已记住你的阅读设置。':'本次已调整，浏览器暂时无法保存。';
  }
  function mount(){
    apply();
    const search=document.querySelector('#search-button .search');if(search)search.title='搜索记录（/ 或 Ctrl / Command K）';
    for(const settings of document.querySelectorAll('[data-reading-settings]')){
      if(enhanced.has(settings))continue;enhanced.add(settings);
      settings.addEventListener('click',event=>{
        const size=event.target.closest('[data-reader-size]'),spacing=event.target.closest('[data-reader-spacing]');
        if(size){choice={...choice,size:size.dataset.readerSize};saveChoice(settings);}
        if(spacing){choice={...choice,spacing:spacing.dataset.readerSpacing};saveChoice(settings);}
        if(event.target.closest('[data-reader-reset]')){choice={size:'standard',spacing:'standard'};saveChoice(settings);}
        if(event.target.closest('[data-reader-close]'))closeSettings(true);
      });
      settings.addEventListener('keydown',event=>{if(event.key==='Escape'){event.preventDefault();closeSettings(true);}});
      settings.addEventListener('toggle',()=>{
        if(!settings.open||!settings.isConnected)return;
        const panel=settings.querySelector('.reading-settings-panel'),rect=panel.getBoundingClientRect();
        // Finish positioning before the reader reaches for a control; a smooth
        // page scroll can race the browser's own summary focus scrolling.
        if(rect.bottom>innerHeight-16||rect.top<80)panel.scrollIntoView({block:'nearest',behavior:'instant'});
      });
    }
    const copy=document.querySelector('[data-copy-feed]');
    if(copy&&!enhanced.has(copy)){
      enhanced.add(copy);copy.hidden=false;
      copy.addEventListener('click',async()=>{
        if(copy.disabled)return;copy.disabled=true;
        const input=document.querySelector('[data-feed-url]'),status=document.querySelector('[data-feed-status]');
        await copyFeedAddress({url:input.value,writeText:navigator.clipboard?.writeText?text=>navigator.clipboard.writeText(text):null,
          onCopied(){if(copy.isConnected)status.textContent='订阅地址已复制。';},
          onManual(){if(copy.isConnected){status.textContent='请手动复制上面的地址。';input.focus();input.select();}}
        });
        if(copy.isConnected)copy.disabled=false;
      });
    }
  }
  document.addEventListener('click',event=>{document.querySelectorAll('[data-reading-settings][open]').forEach(settings=>{if(!settings.contains(event.target))settings.open=false;});});
  document.addEventListener('keydown',event=>{
    if(!isSearchShortcut(event)||document.querySelector('dialog[open],#sidebar-menus.open'))return;
    const search=document.querySelector('#search-button .search'),dialog=document.querySelector('#local-search .search-dialog');
    if(!search||!dialog||getComputedStyle(dialog).display!=='none')return;
    event.preventDefault();closeSettings();search.click();
  });
  window.addEventListener('storage',event=>{if(event.key===null||event.key===preferenceKey){choice=preferences.read();apply();}});
  window.addEventListener('pageshow',()=>{choice=preferences.read();apply();});
  document.addEventListener('pjax:send',()=>closeSettings());
  document.addEventListener('pjax:complete',mount);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
}

if(typeof document!=='undefined')installJournalReader();
