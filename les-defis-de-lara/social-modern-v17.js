(()=>{
  document.body.classList.add('modern-ui');
  let activeFilter='all';
  const labelToScreen={home:'home',feed:'feed',profile:'profile'};
  function qs(sel){return document.querySelector(sel)}
  function all(sel){return Array.from(document.querySelectorAll(sel))}
  function safeShow(id){if(typeof window.show==='function')window.show(id);else{all('.screen').forEach(s=>s.classList.remove('on'));document.getElementById(id)?.classList.add('on')}}
  function setActive(name){all('.modern-nav-btn').forEach(btn=>btn.classList.toggle('active',btn.dataset.target===name||btn.dataset.action===name))}
  function goHome(){safeShow('home');setActive('home')}
  function goFeed(){if(typeof window.openFeed==='function')window.openFeed();else safeShow('feed');setActive('feed');setTimeout(enhanceFeed,120)}
  function goProfile(){if(typeof window.openProfile==='function')window.openProfile();else safeShow('profile');setActive('profile')}
  function openComposer(){goFeed();setTimeout(()=>{enhanceComposer();document.body.classList.add('composer-open')},180)}
  function closeComposer(){document.body.classList.remove('composer-open')}
  function injectBottomNav(){if(qs('.modern-bottom-nav'))return;const nav=document.createElement('nav');nav.className='modern-bottom-nav';nav.innerHTML=`
    <button class="modern-nav-btn active" data-target="home"><span>⌂</span>Accueil</button>
    <button class="modern-nav-btn" data-target="challenge"><span>◇</span>Défis</button>
    <button class="modern-nav-btn publish" data-action="publish"><span>＋</span>Publier</button>
    <button class="modern-nav-btn" data-target="feed"><span>▣</span>Fil</button>
    <button class="modern-nav-btn" data-target="profile"><span>◌</span>Profil</button>`;document.body.appendChild(nav);nav.querySelector('[data-target="home"]').onclick=goHome;nav.querySelector('[data-target="challenge"]').onclick=goHome;nav.querySelector('[data-target="feed"]').onclick=goFeed;nav.querySelector('[data-target="profile"]').onclick=goProfile;nav.querySelector('[data-action="publish"]').onclick=openComposer}
  function injectBackdrop(){if(qs('.composer-backdrop'))return;const back=document.createElement('div');back.className='composer-backdrop';back.onclick=closeComposer;document.body.appendChild(back)}
  function enhanceComposer(){injectBackdrop();const composer=qs('#postComposerMount .postComposer');if(!composer)return;if(!composer.querySelector('.composer-handle'))composer.insertAdjacentHTML('afterbegin','<div class="composer-handle"></div><button class="composer-close" type="button">×</button>');const close=composer.querySelector('.composer-close');if(close)close.onclick=closeComposer;const publish=composer.querySelector('#publishPostBtn');if(publish&&!publish.dataset.modern){publish.dataset.modern='1';publish.addEventListener('click',()=>setTimeout(closeComposer,750))}}
  function enhanceFeed(){const feed=qs('#feed .card');if(!feed)return;enhanceComposer();if(!qs('.feedFilters')){const filters=document.createElement('div');filters.className='feedFilters';filters.innerHTML=`<button class="feedFilter active" data-filter="all">Tous</button><button class="feedFilter" data-filter="meal">Repas</button><button class="feedFilter" data-filter="session">Séances</button><button class="feedFilter" data-filter="progress">Progrès</button>`;const list=qs('#feedList');if(list)list.insertAdjacentElement('beforebegin',filters);filters.querySelectorAll('.feedFilter').forEach(button=>button.onclick=()=>{activeFilter=button.dataset.filter;filters.querySelectorAll('.feedFilter').forEach(b=>b.classList.toggle('active',b===button));applyFilter()})}applyFilter();setActive('feed')}
  function applyFilter(){all('.postCard').forEach(card=>{const visible=activeFilter==='all'||card.classList.contains(activeFilter);card.style.display=visible?'':'none'})}
  function observeFeed(){const feedList=qs('#feedList');if(!feedList||feedList.dataset.modernObserved)return;if(feedList){feedList.dataset.modernObserved='1';new MutationObserver(()=>setTimeout(()=>{enhanceFeed();applyFilter()},30)).observe(feedList,{childList:true,subtree:true})}}
  function patchClicks(){const profile=document.getElementById('profileNav');if(profile&&!profile.dataset.modern){profile.dataset.modern='1';profile.addEventListener('click',()=>setActive('profile'),true)}const feed=document.getElementById('feedNav');if(feed&&!feed.dataset.modern){feed.dataset.modern='1';feed.addEventListener('click',()=>setTimeout(()=>{enhanceFeed();setActive('feed')},80),true)}}
  function watchScreens(){const main=qs('main.app');if(!main||main.dataset.modernScreenWatch)return;main.dataset.modernScreenWatch='1';new MutationObserver(()=>{const current=qs('.screen.on')?.id;if(current==='home')setActive('home');if(current==='profile')setActive('profile');if(current==='feed'){setActive('feed');enhanceFeed();observeFeed()}}).observe(main,{attributes:true,subtree:true,attributeFilter:['class']})}
  function init(){injectBottomNav();injectBackdrop();patchClicks();watchScreens();enhanceFeed();observeFeed();setActive(qs('.screen.on')?.id||'home')}
  document.addEventListener('DOMContentLoaded',()=>setTimeout(init,250));setTimeout(init,700);setTimeout(init,1600);window.LaraModernUI={openComposer,closeComposer,enhanceFeed};
})();
