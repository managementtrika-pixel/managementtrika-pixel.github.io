(()=>{
  const FRIENDS_KEY='laraFriendsV4';
  const read=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key))??fallback}catch{return fallback}};
  const friends=()=>read(FRIENDS_KEY,[]);
  function friendLabel(){const n=friends().length;return n+' ami'+(n>1?'s':'');}
  function ensureFriendMeta(){
    const email=document.getElementById('profileEmail');
    if(!email)return;
    let meta=document.getElementById('profileFriendMeta');
    if(!meta){meta=document.createElement('div');meta.id='profileFriendMeta';meta.className='profileFriendMeta';email.insertAdjacentElement('afterend',meta)}
    meta.textContent='👭 '+friendLabel();
  }
  function ensureQuickActions(){
    const head=document.querySelector('#profile .profileHead');
    if(!head||document.getElementById('profileQuickActions'))return;
    const actions=document.createElement('div');
    actions.id='profileQuickActions';
    actions.className='profileQuickActions';
    actions.innerHTML='<button class="primary" id="quickAddFriend">Ajouter une amie</button><button id="quickCopyCode">Copier mon code</button>';
    head.insertAdjacentElement('afterend',actions);
    actions.querySelector('#quickAddFriend').onclick=()=>document.getElementById('friendCodeInput')?.focus();
    actions.querySelector('#quickCopyCode').onclick=()=>window.copyMyFriendCode?.();
  }
  function rebuildFriendsSection(){
    const section=document.getElementById('friendsSection');
    if(!section||section.dataset.profileV28)return;
    section.dataset.profileV28='1';
    section.innerHTML=`
      <div class="friendsIntroCompact">
        <div><h3>Mes amis</h3><p>Ajoute une amie avec son code court pour comparer vos défis.</p></div>
        <span class="friendCountTiny" id="friendCountTiny">${friendLabel()}</span>
      </div>
      <div class="friendAddCard">
        <b>Ajouter une amie</b>
        <div class="friendAddRow">
          <textarea id="friendCodeInput" class="friendCodeBox" rows="2" placeholder="Colle ici son code ami"></textarea>
          <button id="addFriendBtn">Ajouter</button>
        </div>
      </div>
      <div class="friendShareCard">
        <b>Mon code ami</b>
        <div class="friendShareActions">
          <button id="copyFriendCodeBtn">Copier mon code</button>
          <button id="showFriendCodeBtn">Afficher</button>
        </div>
        <textarea id="myFriendCode" class="friendCodeBox isHidden" rows="2" readonly></textarea>
        <div id="copyState" class="copyState"></div>
      </div>
      <div id="friendsList"></div>
    `;
    section.querySelector('#addFriendBtn').onclick=()=>{window.addFriendFromCode?.();setTimeout(refreshProfileFriends,120)};
    section.querySelector('#copyFriendCodeBtn').onclick=()=>window.copyMyFriendCode?.();
    section.querySelector('#showFriendCodeBtn').onclick=()=>{const field=document.getElementById('myFriendCode');field?.classList.toggle('isHidden');window.refreshMyFriendCode?.();};
    window.refreshMyFriendCode?.();
    window.renderFriendsList?.();
  }
  function ensureLogoutBottom(){
    const card=document.querySelector('#profile .card');
    if(!card||document.getElementById('profileLogoutZone'))return;
    const zone=document.createElement('div');
    zone.id='profileLogoutZone';
    zone.className='profileLogoutZone';
    zone.innerHTML='<button id="profileLogoutBtn">Se déconnecter</button><small>Tu pourras te reconnecter avec ton e-mail et ton mot de passe.</small>';
    card.appendChild(zone);
    zone.querySelector('#profileLogoutBtn').onclick=()=>{
      const topLogout=document.getElementById('logoutNav');
      if(topLogout){topLogout.click();return;}
      localStorage.removeItem('laraUserV4');
      localStorage.removeItem('laraUser');
      location.reload();
    };
  }
  function refreshProfileFriends(){
    ensureFriendMeta();
    const tiny=document.getElementById('friendCountTiny');
    if(tiny)tiny.textContent=friendLabel();
    try{window.renderFriendsList?.()}catch{}
  }
  function patchRenderers(){
    if(window.renderProfile&&!window.renderProfile._profileV28){
      const old=window.renderProfile;
      window.renderProfile=function(){const r=old.apply(this,arguments);setTimeout(enhanceProfile,40);return r};
      window.renderProfile._profileV28=true;
    }
    if(window.renderSocialExtras&&!window.renderSocialExtras._profileV28){
      const old=window.renderSocialExtras;
      window.renderSocialExtras=function(){const r=old.apply(this,arguments);setTimeout(enhanceProfile,60);return r};
      window.renderSocialExtras._profileV28=true;
    }
    if(window.addFriendFromCode&&!window.addFriendFromCode._profileV28){
      const old=window.addFriendFromCode;
      window.addFriendFromCode=function(){const r=old.apply(this,arguments);setTimeout(refreshProfileFriends,180);return r};
      window.addFriendFromCode._profileV28=true;
    }
    if(window.removeFriend&&!window.removeFriend._profileV28){
      const old=window.removeFriend;
      window.removeFriend=function(){const r=old.apply(this,arguments);setTimeout(refreshProfileFriends,180);return r};
      window.removeFriend._profileV28=true;
    }
  }
  function enhanceProfile(){
    patchRenderers();
    ensureFriendMeta();
    ensureQuickActions();
    rebuildFriendsSection();
    ensureLogoutBottom();
    refreshProfileFriends();
  }
  document.addEventListener('DOMContentLoaded',()=>setTimeout(enhanceProfile,500));
  setTimeout(enhanceProfile,1200);
  setTimeout(enhanceProfile,2500);
  setInterval(()=>{if(document.querySelector('#profile.on'))enhanceProfile()},1800);
})();
