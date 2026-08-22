function showScreen(id){$(id).classList.add('active')}
function hideScreen(id){$(id).classList.remove('active')}
function hideAllScreens(){document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'))}
function showTouch(){if(matchMedia('(pointer:coarse)').matches||innerWidth<900)$('touchControls').classList.remove('hidden')}

function cardVisual(name,set='PLAYER'){return A[name]?`<img src="${A[name]}">`:`<div class="card-fallback"><span>${set}</span><strong>${name}</strong><i>ZEUBI CARD GAMES</i></div>`}
function renderCharacterSelect(){
  const root=$('characterCards');root.innerHTML='';for(const c of Object.values(CHARACTERS)){const unlocked=save.unlockedCharacters.includes(c.id);const b=document.createElement('button');b.className='select-card'+(Game.selectedChar===c.id?' selected':'')+(!unlocked?' locked':'');b.disabled=!unlocked;b.innerHTML=`${cardVisual(c.card,c.faction)}<div class="shade"></div><div class="copy"><small>${unlocked?c.faction:'VERROUILLÉ'}</small><h3>${c.label}</h3><p>${unlocked?c.desc:`Termine le chapitre ${c.unlockAt-1}`}</p></div>`;b.onclick=()=>{Game.selectedChar=c.id;renderCharacterSelect()};root.appendChild(b)}
}
function renderChapters(){
  const root=$('chapterCards');root.innerHTML='';for(const c of CHAPTERS){const unlocked=c.id<=save.unlockedChapters;const b=document.createElement('button');b.className='chapter-card'+(!unlocked?' locked':'');b.disabled=!unlocked;const boss=ENEMIES[c.boss];b.innerHTML=`<span class="num">CHAPITRE ${c.id}</span><h3>${c.title}</h3><p>${c.subtitle}</p><div class="best">${unlocked?`Meilleur score : ${(save.scores[c.id]||0).toLocaleString('fr-FR')}`:'Verrouillé'}</div>${A[boss.card]?`<img src="${A[boss.card]}">`:''}`;b.onclick=()=>Game.startChapter(c.id);root.appendChild(b)}
}
function renderCodex(filter='Tous'){
  const filters=['Tous','Ninja','Émeraude','Street','Factions'];$('codexFilters').innerHTML='';for(const f of filters){const b=document.createElement('button');b.textContent=f;b.className=f===filter?'active':'';b.onclick=()=>renderCodex(f);$('codexFilters').appendChild(b)}
  $('codexGrid').innerHTML='';for(const c of CODEX.filter(c=>filter==='Tous'||c.set===filter)){const b=document.createElement('button');b.className='codex-card';const visual=A[c.name]?`<img loading="lazy" src="${A[c.name]}">`:`<div class="card-fallback"><span>${c.set}</span><strong>${c.name}</strong><i>ZEUBI CARD GAMES</i></div>`;b.innerHTML=`${visual}<b>${c.name}</b><small>${c.set}</small>`;$('codexGrid').appendChild(b)}
}

function openCampaign(){Game.mode='campaign';hideAllScreens();renderCharacterSelect();showScreen('characterSelect')}
function openSurvival(){Game.mode='survival';hideAllScreens();renderCharacterSelect();showScreen('characterSelect')}
function backToMenu(){Game.quit()}

const menuArt=A['Booster Ninja']||A['Roobkage']||'';if(menuArt)$('menuBooster').src=menuArt;else $('menuBooster').style.display='none';
document.addEventListener('click',e=>{
  const a=e.target.closest('[data-action]')?.dataset.action;if(!a)return;audio.ensure();
  if(a==='campaign')openCampaign();else if(a==='survival')openSurvival();else if(a==='codex'){hideAllScreens();renderCodex();showScreen('codex')}else if(a==='options'){hideAllScreens();syncOptions();showScreen('options')}else if(a==='back'){if($('chapterSelect').classList.contains('active')){hideAllScreens();renderCharacterSelect();showScreen('characterSelect')}else backToMenu()}else if(a==='resume')Game.resume();else if(a==='restart'){hideScreen('pause');hideScreen('result');Game.mode==='survival'?Game.startSurvival():Game.startChapter(Game.level?.id||1)}else if(a==='quit')backToMenu();
});
$('confirmCharacter').onclick=()=>{audio.ensure();if(Game.mode==='survival')Game.startSurvival();else{hideAllScreens();renderChapters();showScreen('chapterSelect')}};
$('bossIntroContinue').onclick=()=>{if(Game.bossIntroCallback){const cb=Game.bossIntroCallback;Game.bossIntroCallback=null;cb()}};
$('resultContinue').onclick=()=>{hideScreen('result');if(Game.mode==='survival'){Game.startSurvival();return}if(Game.level?.id<4&&$('resultEyebrow').textContent.includes('TERMINÉE'))Game.startChapter(Game.level.id+1);else Game.startChapter(Game.level?.id||1)};
function syncOptions(){$('musicToggle').checked=!!save.settings.music;$('sfxToggle').checked=!!save.settings.sfx;$('vibrationToggle').checked=!!save.settings.vibration;$('difficulty').value=save.settings.difficulty||'normal'}
['musicToggle','sfxToggle','vibrationToggle'].forEach(id=>$(id).onchange=()=>{save.settings.music=$('musicToggle').checked;save.settings.sfx=$('sfxToggle').checked;save.settings.vibration=$('vibrationToggle').checked;persist();audio.setSettings()});$('difficulty').onchange=()=>{save.settings.difficulty=$('difficulty').value;persist()};$('resetSave').onclick=()=>{if(confirm('Réinitialiser toute la progression Rift Brawl ?')){save=defaultSave();persist();syncOptions()}};
$('pauseBtn').onclick=()=>Game.pause();

const keyMap={ArrowLeft:'left',a:'left',q:'left',ArrowRight:'right',d:'right',ArrowUp:'up',w:'up',z:'up',ArrowDown:'down',s:'down'};
addEventListener('keydown',e=>{const k=e.key.length===1?e.key.toLowerCase():e.key;if(keyMap[k]){Game.input[keyMap[k]]=1;e.preventDefault();return}if(['j','k','l','e','i',' ','p','Escape'].includes(k)){e.preventDefault();if(k==='j')Game.player?.input('light');else if(k==='k')Game.player?.input('heavy');else if(k==='l')Game.player?.input('special');else if(k==='e')Game.player?.input('evolve');else if(k==='i')Game.player?.input('jump');else if(k===' ')Game.player?.input('dash');else if(Game.state==='playing')Game.pause();else if(Game.state==='pause')Game.resume()}});
addEventListener('keyup',e=>{const k=e.key.length===1?e.key.toLowerCase():e.key;if(keyMap[k])Game.input[keyMap[k]]=0});

for(const b of document.querySelectorAll('[data-touch]')){
  const action=b.dataset.touch;const movement=['left','right','up','down'].includes(action);
  const down=e=>{e.preventDefault();if(movement)Game.input[action]=1;else Game.player?.input(action)};const up=e=>{e.preventDefault();if(movement)Game.input[action]=0};b.addEventListener('pointerdown',down);b.addEventListener('pointerup',up);b.addEventListener('pointercancel',up);b.addEventListener('pointerleave',up);
}

window.ZCG={androidBack(){if(Game.state==='playing')Game.pause();else if(Game.state==='pause')Game.resume();else if(Game.state!=='menu')backToMenu()},game:Game};

function loop(){Game.update();Game.render();requestAnimationFrame(loop)}
showScreen('menu');syncOptions();requestAnimationFrame(loop);
