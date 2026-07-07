const CHALLENGES=window.CHALLENGES;
const LEVEL_LABELS={debutant:'Débutant',intermediaire:'Intermédiaire',confirme:'Confirmé'};
const USER_KEY='laraUserV4',HISTORY_KEY='laraHistoryV4',FAVORITES_KEY='laraFavoritesV4';
let user=null,level='',mode='',current=null,difficultyValue='',result=null,selfie=null;
const $=id=>document.getElementById(id);
function show(id){document.querySelectorAll('.screen').forEach(x=>x.classList.remove('on'));$(id).classList.add('on');window.scrollTo({top:0,behavior:'smooth'})}
function loadJson(key,fallback){try{return JSON.parse(localStorage.getItem(key))??fallback}catch{return fallback}}
function saveJson(key,value){localStorage.setItem(key,JSON.stringify(value))}
function setupUser(u){user=u;saveJson(USER_KEY,u);$('hello').textContent='Bonjour '+u.name+' ✨';$('profileNav').classList.remove('hide');show('home')}
function enterApp(){const firstName=$('name').value.trim(),mail=$('email').value.trim();if(!firstName){$('name').focus();return alert('Entre ton prénom')};setupUser({name:firstName,email:mail,guest:false})}
function guest(){setupUser({name:'Invitée',email:'',guest:true})}
(function init(){const old=loadJson('laraUser',null),saved=loadJson(USER_KEY,null)||old;if(saved?.name){user=saved;$('hello').textContent='Bonjour '+saved.name+' ✨';$('profileNav').classList.remove('hide');show('home')}})();
function pickLevel(btn){document.querySelectorAll('.level').forEach(x=>x.classList.remove('sel'));btn.classList.add('sel');level=btn.dataset.v}
function start(selectedMode){if(!level)return alert('Choisis ton niveau');mode=selectedMode;draw();show('challenge')}
function favorites(){return loadJson(FAVORITES_KEY,[])}
function isFavorite(title){return favorites().some(f=>f.title===title)}
function updateFavoriteButton(){const on=current&&isFavorite(current.title);$('favoriteBtn').classList.toggle('on',!!on);$('favoriteBtn').textContent=on?'♥':'♡'}
function toggleFavorite(){if(!current)return;let list=favorites();const index=list.findIndex(f=>f.title===current.title);if(index>=0)list.splice(index,1);else list.unshift({title:current.title,emoji:current.emoji,category:current.category,level,mode});saveJson(FAVORITES_KEY,list.slice(0,30));updateFavoriteButton()}
function draw(){const list=CHALLENGES[mode][level];let next=list[Math.floor(Math.random()*list.length)];if(current&&list.length>1){while(next.title===current.title)next=list[Math.floor(Math.random()*list.length)]}current=next;$('ce').textContent=current.emoji;$('ct').textContent=current.title;$('cd').textContent=current.description;$('cc').textContent=current.category;$('tip').textContent='Adapte toujours les charges, le rythme et l’amplitude à ton niveau.';updateFavoriteButton()}
function finish(){show('feedback')}
function difficulty(btn){document.querySelectorAll('.diff button').forEach(x=>x.classList.remove('sel'));btn.classList.add('sel');difficultyValue=btn.dataset.v}
function parseMinutes(time){const m=String(time).match(/(\d+)\s*min/),s=String(time).match(/(\d+)\s*s/);return (m?Number(m[1]):0)+(s?Number(s[1])/60:0)}
function saveResult(){if(!difficultyValue)return alert('Choisis la difficulté ressentie');const mins=$('min').value,secs=$('sec').value,time=(mins?mins+' min ':'')+(secs?secs+' s':'');result={id:Date.now(),date:new Date().toISOString(),name:user?.name||'Invitée',email:user?.email||'',title:current.title,emoji:current.emoji,category:current.category,mode,level,time:time||'Non renseigné',minutes:parseMinutes(time),difficulty:difficultyValue,comment:$('comment').value.trim()||'Aucun commentaire'};const history=loadJson(HISTORY_KEY,[]);history.unshift(result);saveJson(HISTORY_KEY,history.slice(0,150));$('summary').textContent=result.title+' • '+result.time+' • '+result.difficulty;show('success')}