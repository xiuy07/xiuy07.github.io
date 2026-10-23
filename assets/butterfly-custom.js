/* Accessibility and shared preferences around official Butterfly interactions. */
(() => {
  try {
    const theme=localStorage.getItem('xiu-site-theme');
    if(['dark','light'].includes(theme))document.documentElement.dataset.theme=theme;
  } catch {}
  new MutationObserver(() => {
    try {localStorage.setItem('xiu-site-theme',document.documentElement.dataset.theme);} catch {}
  }).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
  const visible=element=>element&&getComputedStyle(element).display!=='none'&&getComputedStyle(element).visibility!=='hidden';
  const focusables=container=>[...container.querySelectorAll('a[href],button,input,[tabindex="0"]')].filter(element=>visible(element)&&element.getClientRects().length&&!element.disabled);
  let settleTimer;
  const prefetched=new Set();
  const motionPreference=matchMedia('(prefers-reduced-motion: reduce)');
  let seaObserver;
  function refreshSeaState(){
    const sea=document.querySelector('.ocean-motion');
    if(sea)sea.dataset.paused=String(document.hidden||motionPreference.matches);
  }

  function enhance() {
    if(!document.querySelector('.skip-link')){
      const skip=document.createElement('a');skip.href='#content-inner';skip.textContent='跳到正文';skip.className='skip-link';document.body.prepend(skip);
    }
    const main=document.getElementById('content-inner');
    if(main)main.tabIndex=-1;
    for(const [selector,label] of [['#search-button .search','搜索记录'],['#toggle-menu .site-page','打开菜单'],['#scroll-down','向下查看记录']]) {
      const element=document.querySelector(selector);
      if(!element||element.dataset.accessible)continue;
      element.dataset.accessible='true';element.tabIndex=0;element.setAttribute('role','button');element.setAttribute('aria-label',label);
      element.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();element.click();}});
    }
    for(const dropdown of document.querySelectorAll('.site-page.group')){
      dropdown.tabIndex=0;dropdown.setAttribute('role','button');dropdown.setAttribute('aria-label','日常栏目');
      if(dropdown.dataset.accessible)continue;
      dropdown.dataset.accessible='true';
      dropdown.addEventListener('keydown',event=>{
        if(event.key==='Enter'||event.key===' '){event.preventDefault();dropdown.click();}
        if(event.key==='ArrowDown'&&dropdown.closest('#nav')){event.preventDefault();dropdown.nextElementSibling?.querySelector('a')?.focus();}
      });
    }
    document.querySelector('.search-close-button')?.setAttribute('aria-label','关闭搜索');
    const input=document.querySelector('.local-search-input input');
    input?.setAttribute('aria-label','搜索记录');
    document.querySelector('#nav')?.setAttribute('aria-label','主导航');
    const announcement=document.querySelector('.card-announcement .item-headline span');
    if(announcement)announcement.textContent='最近在做';
    document.querySelectorAll('.avatar-img img').forEach(avatar=>{avatar.alt='修源的文字头像';});
    const sidebar=document.getElementById('sidebar-menus');
    const trigger=document.querySelector('#toggle-menu .site-page');
    if(trigger){trigger.setAttribute('aria-controls','sidebar-menus');trigger.setAttribute('aria-expanded',String(sidebar?.classList.contains('open')||false));}
    if(sidebar&&!sidebar.dataset.accessible){
      sidebar.dataset.accessible='true';sidebar.setAttribute('aria-label','网站菜单');
      const close=document.createElement('button');close.type='button';close.className='journal-menu-close';close.setAttribute('aria-label','关闭菜单');close.innerHTML='<i class="fas fa-xmark" aria-hidden="true"></i>';
      close.addEventListener('click',()=>document.getElementById('menu-mask')?.click());sidebar.prepend(close);
      const syncSidebar=()=>{
        const open=sidebar.classList.contains('open');
        const hadFocus=sidebar.contains(document.activeElement);
        sidebar.inert=!open;sidebar.setAttribute('aria-hidden',String(!open));
        document.querySelector('#toggle-menu .site-page')?.setAttribute('aria-expanded',String(open));
        if(open)close.focus();
        else if(hadFocus)document.querySelector('#toggle-menu .site-page')?.focus();
      };
      syncSidebar();new MutationObserver(syncSidebar).observe(sidebar,{attributes:true,attributeFilter:['class']});
    }
    const dialog=document.querySelector('#local-search .search-dialog');
    if(dialog){
      dialog.setAttribute('role','dialog');dialog.setAttribute('aria-modal','true');dialog.setAttribute('aria-label','搜索记录');
    }
    if(!document.getElementById('page-transition-progress')){
      const bar=document.createElement('div');bar.id='page-transition-progress';bar.setAttribute('role','progressbar');bar.setAttribute('aria-label','正在加载页面');bar.setAttribute('aria-hidden','true');document.body.prepend(bar);
    }
    if(!document.getElementById('ocean-click-layer')){
      const layer=document.createElement('div');layer.id='ocean-click-layer';layer.setAttribute('aria-hidden','true');document.body.append(layer);
    }
    seaObserver?.disconnect();
    const sea=document.querySelector('.ocean-motion');
    if(sea&&'IntersectionObserver' in window){seaObserver=new IntersectionObserver(entries=>{sea.dataset.offscreen=String(!entries[0].isIntersecting);},{threshold:0});seaObserver.observe(sea);}
    refreshSeaState();
    document.querySelectorAll('[data-bgm-player]').forEach(player=>{
      if(player.dataset.ready)return;
      player.dataset.ready='true';
      const audio=player.querySelector('[data-bgm-audio]');
      const toggle=player.querySelector('[data-bgm-toggle]');
      const label=player.querySelector('[data-bgm-label]');
      const status=player.querySelector('[data-bgm-status]');
      const title=toggle.dataset.bgmTitle;
      const volume=player.querySelector('[data-bgm-volume]');
      const mute=player.querySelector('[data-bgm-mute]');
      const level=player.querySelector('[data-bgm-level]');
      const settings=player.querySelector('[data-bgm-settings]');
      let lastAudible=.15;
      audio.volume=.15;
      const updateVolume=()=>{
        const percent=Math.round(audio.volume*100),muted=audio.muted||percent===0;
        volume.value=String(percent);volume.setAttribute('aria-valuetext',`${percent}%`);level.textContent=`${percent}%`;
        player.dataset.muted=String(muted);mute.setAttribute('aria-pressed',String(muted));
        mute.setAttribute('aria-label',muted?'取消静音':'静音');mute.title=muted?'取消静音':'静音';
      };
      audio.addEventListener('volumechange',updateVolume);
      volume.addEventListener('input',()=>{
        audio.volume=Math.max(0,Math.min(1,Number(volume.value)/100));
        audio.muted=audio.volume===0;if(audio.volume>0)lastAudible=audio.volume;updateVolume();
      });
      mute.addEventListener('click',()=>{
        if(audio.muted||audio.volume===0){if(audio.volume===0)audio.volume=lastAudible;audio.muted=false;}
        else audio.muted=true;
        updateVolume();
      });
      settings.addEventListener('keydown',event=>{if(event.key==='Escape'){settings.open=false;settings.querySelector('summary').focus();}});
      updateVolume();
      const update=()=>{
        const playing=!audio.paused;
        toggle.setAttribute('aria-pressed',String(playing));
        toggle.setAttribute('aria-label',`${playing?'暂停':'播放'}背景音乐：${title}`);
        label.textContent=playing?'暂停音乐':'听一会儿';
        player.classList.toggle('is-playing',playing);
      };
      audio.addEventListener('play',update);audio.addEventListener('pause',update);
      audio.addEventListener('error',()=>{status.textContent='音乐暂时无法播放。';update();});
      toggle.addEventListener('click',async()=>{
        if(!audio.paused){audio.pause();return;}
        try{status.textContent='';await audio.play();}catch{status.textContent='音乐暂时无法播放。';update();}
      });
    });
  }
  document.addEventListener('DOMContentLoaded',()=>{
    enhance();
    // Keep the branded loader on first visit; internal navigation uses a slim progress bar.
    queueMicrotask(()=>{
      if(window.globalFn?.pjaxSend)delete window.globalFn.pjaxSend.preloader_init;
      if(window.pjax?.options){
        for(const selector of ['link[rel="canonical"]','meta[name="description"]','meta[property="og:title"]','meta[property="og:url"]','meta[property="og:description"]']){
          if(document.querySelector(selector)&&!window.pjax.options.selectors.includes(selector))window.pjax.options.selectors.push(selector);
        }
      }
    });
  });
  document.addEventListener('pjax:complete',enhance);
  document.addEventListener('pjax:send',()=>{
    document.querySelectorAll('[data-bgm-audio]').forEach(audio=>{audio.pause();audio.currentTime=0;});
    clearTimeout(settleTimer);document.documentElement.dataset.navigating='pending';
    document.getElementById('page-transition-progress')?.setAttribute('aria-hidden','false');
  });
  const finishNavigation=()=>{
    document.documentElement.dataset.navigating='settled';
    document.getElementById('page-transition-progress')?.setAttribute('aria-hidden','true');
    settleTimer=setTimeout(()=>delete document.documentElement.dataset.navigating,300);
  };
  document.addEventListener('pjax:complete',finishNavigation);
  document.addEventListener('pjax:error',finishNavigation);
  function prefetch(event){
    const link=event.target.closest('a[href]');
    if(!link||link.target==='_blank'||navigator.connection?.saveData)return;
    const url=new URL(link.href,location.href);
    if(url.origin!==location.origin||!url.pathname.startsWith('/journal/')||url.pathname===location.pathname||prefetched.has(url.pathname)||prefetched.size>=20)return;
    prefetched.add(url.pathname);
    const hint=document.createElement('link');hint.rel='prefetch';hint.href=url.origin+url.pathname;document.head.append(hint);
  }
  document.addEventListener('pointerover',prefetch,{passive:true});
  document.addEventListener('focusin',prefetch);
  document.addEventListener('visibilitychange',refreshSeaState);
  motionPreference.addEventListener('change',refreshSeaState);
  document.addEventListener('click',event=>{
    document.querySelectorAll('[data-bgm-settings][open]').forEach(settings=>{if(!settings.contains(event.target))settings.open=false;});
    if(motionPreference.matches||event.detail===0||event.button!==0||event.target.closest('input,textarea,select,[contenteditable="true"]'))return;
    const layer=document.getElementById('ocean-click-layer');if(!layer)return;
    while(layer.children.length>=6)layer.firstElementChild.remove();
    const ripple=document.createElement('span');ripple.className='sea-click';ripple.style.setProperty('--drop-x',`${event.clientX}px`);ripple.style.setProperty('--drop-y',`${event.clientY}px`);
    for(const [x,y] of [[-30,-23],[30,-29],[-18,27],[32,18]]){const spray=document.createElement('i');spray.style.setProperty('--spray-x',`${x}px`);spray.style.setProperty('--spray-y',`${y}px`);ripple.append(spray);}
    layer.append(ripple);setTimeout(()=>ripple.remove(),1100);
  });
  document.addEventListener('keydown',event=>{
    const dialog=document.querySelector('#local-search .search-dialog');
    const sidebar=document.getElementById('sidebar-menus');
    const searchOpen=visible(dialog)&&getComputedStyle(dialog).animationName!=='search_close';
    const activeContainer=searchOpen?dialog:sidebar?.classList.contains('open')?sidebar:null;
    if(event.key==='Tab'&&activeContainer){
      const elements=focusables(activeContainer),first=elements[0],last=elements.at(-1);
      if(event.shiftKey&&(document.activeElement===first||!activeContainer.contains(document.activeElement))){event.preventDefault();last?.focus();}
      else if(!event.shiftKey&&(document.activeElement===last||!activeContainer.contains(document.activeElement))){event.preventDefault();first?.focus();}
    }
    if(event.key==='Escape'){
      if(searchOpen){
        document.querySelector('.search-close-button')?.click();
        document.querySelector('#search-button .search')?.focus();
      }else if(sidebar?.classList.contains('open')){
        document.getElementById('menu-mask')?.click();
      }
    }
  });
})();
