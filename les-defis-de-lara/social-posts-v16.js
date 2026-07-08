import { getApps, getApp, initializeApp } from 'https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js';
import { getFirestore, collection, addDoc, serverTimestamp, query, orderBy, limit, onSnapshot } from 'https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js';

const CONFIG = window.LARA_FIREBASE_CONFIG;
const app = getApps().length ? getApp() : initializeApp(CONFIG);
const auth = getAuth(app);
const db = getFirestore(app);
let currentUser = null;
let selectedPostType = 'meal';
let compressedImage = '';
let unsubscribePosts = null;
const $ = id => document.getElementById(id);
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const typeLabels = { meal:'Mon repas', session:'Ma séance', progress:'Mes progrès' };
const typeEmoji = { meal:'🍽️', session:'🏋️‍♀️', progress:'✨' };

function readLocalProfile() {
  try { return JSON.parse(localStorage.getItem('laraUserV4')) || JSON.parse(localStorage.getItem('laraUser')) || {}; }
  catch { return {}; }
}

function currentName() {
  const profile = readLocalProfile();
  return profile.name || currentUser?.email?.split('@')[0] || 'Participante';
}

function ensureFeedShell() {
  if (!document.getElementById('feed')) {
    const main = document.querySelector('main.app');
    if (!main) return;
    const section = document.createElement('section');
    section.id = 'feed';
    section.className = 'screen';
    section.innerHTML = '<div class="card"><button class="btn secondary" id="feedBackBtn">← Retour aux défis</button><h2>Fil d’actualité</h2><div id="postComposerMount"></div><div id="feedList"></div></div>';
    main.appendChild(section);
    document.getElementById('feedBackBtn').onclick = () => window.show ? show('home') : null;
  }
  const card = document.querySelector('#feed .card');
  if (card && !document.getElementById('postComposerMount')) {
    const h2 = card.querySelector('h2');
    const mount = document.createElement('div');
    mount.id = 'postComposerMount';
    h2?.insertAdjacentElement('afterend', mount);
  }
  if (card && !document.getElementById('feedList')) {
    const list = document.createElement('div');
    list.id = 'feedList';
    card.appendChild(list);
  }
}

function fieldTemplate() {
  if (selectedPostType === 'meal') return `
    <input id="postFood" placeholder="Aliment ou plat — ex : Bowl poulet riz légumes">
    <input id="postQuantity" placeholder="Quantité — ex : 150 g de poulet, 80 g de riz">
    <textarea id="postRecipe" placeholder="Recette / composition — ex : cuisson, ingrédients, sauce, assaisonnement"></textarea>
  `;
  if (selectedPostType === 'session') return `
    <input id="postExercise" placeholder="Exercice pratiqué — ex : Hip thrust, presse, tirage vertical">
    <input id="postSets" placeholder="Nombre de séries — ex : 4 séries de 12">
    <textarea id="postRecipe" placeholder="Détails de la séance — charges, sensations, repos, objectif"></textarea>
  `;
  return `
    <input id="postExercise" placeholder="Zone ou exercice suivi — ex : fessiers, dos, cardio, posture">
    <input id="postQuantity" placeholder="Mesure / repère — ex : -2 cm taille, +10 kg hip thrust, 3 séances/semaine">
    <textarea id="postRecipe" placeholder="Ce qui a changé — énergie, régularité, poids, mensurations, ressenti"></textarea>
  `;
}

function renderComposer() {
  ensureFeedShell();
  const mount = document.getElementById('postComposerMount');
  if (!mount) return;
  mount.innerHTML = `
    <div class="postComposer">
      <h3>Créer une publication</h3>
      <div class="postTabs">
        <button class="postTab meal ${selectedPostType==='meal'?'active':''}" data-type="meal">🍽️ Mon repas</button>
        <button class="postTab session ${selectedPostType==='session'?'active':''}" data-type="session">🏋️‍♀️ Ma séance</button>
        <button class="postTab progress ${selectedPostType==='progress'?'active':''}" data-type="progress">✨ Mes progrès</button>
      </div>
      <div class="postFields">
        <textarea id="postDescription" placeholder="Description de ta publication"></textarea>
        ${fieldTemplate()}
        <input id="postImage" type="file" accept="image/*" capture="environment">
        <img id="postImagePreview" class="postImagePreview" alt="Aperçu">
        <button class="btn postCreateButton" id="publishPostBtn">Publier</button>
        <div id="postStatus" class="postStatus"></div>
      </div>
    </div>
  `;
  document.querySelectorAll('.postTab').forEach(button => button.onclick = () => { selectedPostType = button.dataset.type; compressedImage = ''; renderComposer(); });
  document.getElementById('postImage').onchange = handleImage;
  document.getElementById('publishPostBtn').onclick = publishPost;
}

function setPostStatus(text, type='ok') {
  const box = document.getElementById('postStatus');
  if (!box) return;
  box.className = 'postStatus on ' + type;
  box.textContent = text;
}

async function handleImage(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  if (!file.type.startsWith('image/')) return setPostStatus('Choisis une image valide.', 'err');
  try {
    compressedImage = await compressImage(file);
    const preview = document.getElementById('postImagePreview');
    if (preview) { preview.src = compressedImage; preview.classList.add('on'); }
    setPostStatus('Image ajoutée ✓', 'ok');
  } catch {
    setPostStatus('Image trop lourde ou impossible à lire.', 'err');
  }
}

async function compressImage(file) {
  const data = await new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = reject; reader.readAsDataURL(file); });
  const image = await new Promise((resolve, reject) => { const img = new Image(); img.onload = () => resolve(img); img.onerror = reject; img.src = data; });
  const max = 720;
  const ratio = Math.min(1, max / Math.max(image.width, image.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(image.width * ratio);
  canvas.height = Math.round(image.height * ratio);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/jpeg', 0.72);
}

async function publishPost() {
  if (!currentUser) return setPostStatus('Connecte-toi pour publier.', 'err');
  const description = document.getElementById('postDescription')?.value.trim() || '';
  const food = document.getElementById('postFood')?.value.trim() || '';
  const quantity = document.getElementById('postQuantity')?.value.trim() || '';
  const recipe = document.getElementById('postRecipe')?.value.trim() || '';
  const exercise = document.getElementById('postExercise')?.value.trim() || '';
  if (!description && !food && !exercise && !recipe) return setPostStatus('Ajoute au moins une description ou un détail.', 'err');
  try {
    document.getElementById('publishPostBtn').disabled = true;
    await addDoc(collection(db, 'posts'), {
      uid: currentUser.uid,
      name: currentName(),
      type: selectedPostType,
      description,
      food,
      quantity,
      recipe,
      exercise,
      imageData: compressedImage || '',
      createdAt: serverTimestamp()
    });
    compressedImage = '';
    setPostStatus('Publication envoyée ✓', 'ok');
    renderComposer();
  } catch (error) {
    console.warn(error);
    setPostStatus('Publication impossible : vérifie les règles Firestore.', 'err');
  }
}

function startPostsFeed() {
  if (unsubscribePosts) return;
  const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'), limit(40));
  unsubscribePosts = onSnapshot(q, snapshot => {
    window.LARA_SOCIAL_POSTS = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    renderPostsFeed();
  }, error => console.warn('Posts feed error', error));
}

function renderPostsFeed() {
  ensureFeedShell();
  renderComposer();
  const list = document.getElementById('feedList');
  if (!list) return;
  const posts = window.LARA_SOCIAL_POSTS || [];
  const cloud = window.LARA_CLOUD_FEED || [];
  const postHtml = posts.map(postCard).join('');
  const oldActivity = cloud.length ? '<h3>Défis réalisés</h3>' + cloud.slice(0,10).map(item => `<article class="feedItem"><div class="feedAvatar">${esc((item.name||'?').charAt(0).toUpperCase())}</div><div class="feedContent"><b>${esc(item.name||'Participante')}<span class="onlineBadge">Défi</span></b><p>${esc(item.emoji||'✨')} ${esc(item.title||'Défi terminé')}</p><span>${esc(item.mode==='duo'?'Duo':'Solo')} • ${esc(item.level||'')}</span></div></article>`).join('') : '';
  list.innerHTML = postHtml || '<div class="emptySocial">Aucune publication pour le moment.</div>';
  if (oldActivity) list.insertAdjacentHTML('beforeend', oldActivity);
}

function postCard(post) {
  const type = post.type || 'meal';
  const details = [];
  if (post.food) details.push('Aliment : ' + post.food);
  if (post.exercise) details.push('Exercice : ' + post.exercise);
  if (post.quantity) details.push('Quantité / repère : ' + post.quantity);
  if (post.recipe) details.push((type==='meal'?'Recette':'Détails') + ' : ' + post.recipe);
  return `<article class="postCard ${esc(type)}">
    <div class="postHead">
      <div class="postAuthor"><div class="postAvatar">${esc((post.name||'?').charAt(0).toUpperCase())}</div><div class="postMeta"><b>${esc(post.name||'Participante')}</b><span>Publication</span></div></div>
      <span class="postBadge ${esc(type)}">${typeEmoji[type]||'✨'} ${esc(typeLabels[type]||'Post')}</span>
    </div>
    ${post.description?`<p class="postText">${esc(post.description)}</p>`:''}
    ${details.length?`<div class="postDetails">${details.map(item=>`<span class="postChip">${esc(item)}</span>`).join('')}</div>`:''}
    ${post.imageData?`<img class="postPhoto" src="${post.imageData}" alt="Image de publication">`:''}
  </article>`;
}

const originalOpenFeed = window.openFeed;
window.openFeed = function() {
  if (typeof originalOpenFeed === 'function') originalOpenFeed();
  ensureFeedShell();
  renderPostsFeed();
  if (typeof window.show === 'function') window.show('feed');
};

onAuthStateChanged(auth, user => {
  currentUser = user;
  if (user) startPostsFeed();
});

document.addEventListener('DOMContentLoaded', () => setTimeout(() => { ensureFeedShell(); renderComposer(); }, 500));
