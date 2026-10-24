/* Accessibility and shared preferences around official Butterfly interactions. */
(() => {
  const visible=element=>element&&getComputedStyle(element).display!=='none'&&getComputedStyle(element).visibility!=='hidden';
  const focusables=container=>[...container.querySelectorAll('a[href],button,input,[tabindex="0"]')].filter(element=>visible(element)&&element.getClientRects().length&&!element.disabled);
  let settleTimer;
  const prefetched=new Set();
  const motionPreference=matchMedia('(prefers-reduced-motion: reduce)');
  const musicGraphs=new Map();
  const musicControls=new Map();
  let seaObserver;
  function refreshSeaState(){
    const sea=document.querySelector('.ocean-motion');
    if(sea)sea.dataset.paused=String(document.hidden||motionPreference.matches);
  }

  function enhanceMusic(player) {
    if(musicControls.has(player))return;
    player.dataset.ready='true';
    const audio=player.querySelector('[data-bgm-audio]');
    const toggle=player.querySelector('[data-bgm-toggle]');
    const label=player.querySelector('[data-bgm-label]');
    const status=player.querySelector('[data-bgm-status]');
    const title=toggle.dataset.bgmTitle;
    let playRequest=0,wantsPlay=false,loading=false;
    const volume=player.querySelector('[data-bgm-volume]');
    const mute=player.querySelector('[data-bgm-mute]');
    const level=player.querySelector('[data-bgm-level]');
    const settings=player.querySelector('[data-bgm-settings]');
    let lastAudible=.15,volumeLevel=.15,isMuted=false;
    audio.volume=.15;
    const nativeVolume=Math.abs(audio.volume-.15)<.001;
    const updateVolume=()=>{
      const percent=Math.round(volumeLevel*100),muted=isMuted||percent===0;
      volume.value=String(percent);volume.setAttribute('aria-valuetext',`${percent}%`);level.textContent=`${percent}%`;
      player.dataset.muted=String(muted);mute.setAttribute('aria-pressed',String(muted));
      mute.setAttribute('aria-label',muted?'取消静音':'静音');mute.title=muted?'取消静音':'静音';
    };
    const applyVolume=()=>{
      audio.muted=isMuted;
      const graph=musicGraphs.get(player);
      if(graph)graph.gain.gain.setTargetAtTime(isMuted?0:volumeLevel,graph.context.currentTime,.015);
      else if(nativeVolume)audio.volume=volumeLevel;
      updateVolume();
    };
    const prepareAudio=()=>{
      // iOS may ignore HTMLMediaElement.volume. Route through GainNode when needed.
      if(nativeVolume)return Promise.resolve();
      let graph=musicGraphs.get(player);
      if(!graph){
        const AudioContext=window.AudioContext||window.webkitAudioContext;
        if(!AudioContext)throw new Error('Audio gain unavailable');
        const context=new AudioContext(),gain=context.createGain();
        gain.gain.value=isMuted?0:volumeLevel;
        try{const source=context.createMediaElementSource(audio);source.connect(gain);gain.connect(context.destination);}
        catch(error){context.close().catch(()=>{});throw error;}
        graph={context,gain};musicGraphs.set(player,graph);
      }
      applyVolume();
      return graph.context.state!=='running'?graph.context.resume():Promise.resolve();
    };
    audio.addEventListener('volumechange',updateVolume);
    volume.addEventListener('input',()=>{
      volumeLevel=Math.max(0,Math.min(1,Number(volume.value)/100));
      isMuted=volumeLevel===0;if(volumeLevel>0)lastAudible=volumeLevel;applyVolume();
    });
    mute.addEventListener('click',()=>{
      if(isMuted||volumeLevel===0){if(volumeLevel===0)volumeLevel=lastAudible;isMuted=false;}
      else isMuted=true;
      applyVolume();
    });
    settings.addEventListener('keydown',event=>{if(event.key==='Escape'){settings.open=false;settings.querySelector('summary').focus();}});
    updateVolume();
    const update=()=>{
      const playing=wantsPlay&&!audio.paused&&!loading;
      toggle.setAttribute('aria-pressed',String(wantsPlay));toggle.setAttribute('aria-busy',String(loading));
      toggle.setAttribute('aria-label',`${loading?'取消加载':playing?'暂停':'播放'}背景音乐：${title}`);
      label.textContent=loading?'正在打开…':playing?'暂停音乐':'听一会儿';
      player.dataset.loading=String(loading);
      player.classList.toggle('is-playing',playing);
    };
    const stop=(reset=false)=>{
      ++playRequest;wantsPlay=false;loading=false;audio.pause();status.textContent='';
      if(reset){try{audio.currentTime=0;}catch{}settings.open=false;}
      update();
    };
    musicControls.set(player,{stop});
    audio.addEventListener('play',()=>{if(!wantsPlay||!player.isConnected){stop();return;}update();});
    audio.addEventListener('playing',()=>{if(!wantsPlay||!player.isConnected){stop();return;}loading=false;status.textContent='';update();});
    audio.addEventListener('waiting',()=>{if(wantsPlay){loading=true;update();}});
    audio.addEventListener('pause',()=>{if(audio.paused&&(wantsPlay||loading))stop();else update();});
    audio.addEventListener('error',()=>{stop();status.textContent='音乐暂时无法播放。';});
    toggle.addEventListener('click',async()=>{
      if(wantsPlay||!audio.paused){stop();return;}
      const request=++playRequest;wantsPlay=true;loading=true;status.textContent='正在打开背景音乐…';update();
      try{
        await Promise.all([prepareAudio(),audio.play()]);
        if(request!==playRequest||!player.isConnected){if(!wantsPlay||!player.isConnected)audio.pause();return;}
        loading=false;status.textContent='';update();
      }catch{
        if(request!==playRequest)return;
        stop();status.textContent='音乐暂时无法播放。';
      }
    });
  }

  function enhance() {
    for(const [player,control] of musicControls){if(!player.isConnected){control.stop();musicControls.delete(player);}}
    for(const [player,graph] of musicGraphs){if(!player.isConnected){graph.context.close().catch(()=>{});musicGraphs.delete(player);}}
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
    document.querySelectorAll('[data-bgm-player]').forEach(enhanceMusic);
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
    musicControls.forEach(control=>control.stop(true));
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
  window.addEventListener('pagehide',()=>musicControls.forEach(control=>control.stop()));
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
    if(event.target.closest('#darkmode'))window.xiuTheme?.setPreference(document.documentElement.dataset.theme);
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
