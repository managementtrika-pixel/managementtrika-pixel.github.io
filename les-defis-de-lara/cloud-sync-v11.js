import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  limit,
  onSnapshot
} from 'https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js';

const CONFIG = window.LARA_FIREBASE_CONFIG;
const CLOUD_KEYS = ['laraUserV4','laraUser','laraHistoryV4','laraFavoritesV4','laraFriendsV4'];
const PHOTO_PREFIX = 'laraProfilePhotoV4:';
const $ = id => document.getElementById(id);
const safeParse = (value, fallback) => { try { return JSON.parse(value) ?? fallback } catch { return fallback } };
const readJson = (key, fallback) => safeParse(localStorage.getItem(key), fallback);
const saveJson = (key, value) => localStorage.setItem(key, JSON.stringify(value));
let app = null;
let auth = null;
let db = null;
let currentFirebaseUser = null;
let feedUnsubscribe = null;

function localMemory() {
  const memory = { version: 1, exportedAt: new Date().toISOString(), storage: {}, photos: {} };
  CLOUD_KEYS.forEach(key => {
    const value = localStorage.getItem(key);
    if (value !== null) memory.storage[key] = value;
  });
  Object.keys(localStorage)
    .filter(key => key.startsWith(PHOTO_PREFIX))
    .forEach(key => memory.photos[key] = localStorage.getItem(key));
  return memory;
}

function restoreMemory(memory) {
  if (!memory || !memory.storage) return;
  Object.entries(memory.storage).forEach(([key, value]) => {
    if (CLOUD_KEYS.includes(key)) localStorage.setItem(key, String(value));
  });
  if (memory.photos) {
    Object.entries(memory.photos).forEach(([key, value]) => {
      if (key.startsWith(PHOTO_PREFIX)) localStorage.setItem(key, String(value));
    });
  }
}

function currentProfile() {
  return readJson('laraUserV4', null) || readJson('laraUser', null) || { name: 'Invitée', email: '' };
}

function latestHistory() {
  return readJson('laraHistoryV4', []);
}

function cloudStatus(text, type = '') {
  const status = $('cloudStatus');
  if (!status) return;
  status.className = 'status on ' + (type || 'ok');
  status.textContent = text;
}

function ensureCloudPanel() {
  const profileCard = document.querySelector('#profile .card');
  if (!profileCard || $('cloudSection')) return;
  const box = document.createElement('div');
  box.className = 'sectionBox';
  box.id = 'cloudSection';
  box.innerHTML = `
    <h3>Compte cloud</h3>
    <p class="sub">Connecte-toi avec ton e-mail et un mot de passe pour retrouver automatiquement ton profil sur n’importe quel téléphone.</p>
    <div class="grid">
      <input id="cloudEmail" type="email" autocomplete="email" placeholder="E-mail du compte">
      <input id="cloudPassword" type="password" autocomplete="current-password" placeholder="Mot de passe">
      <div class="socialGrid">
        <button class="btn" id="cloudCreateBtn">Créer mon compte cloud</button>
        <button class="btn secondary" id="cloudLoginBtn">Me connecter</button>
      </div>
      <button class="btn ghost" id="cloudSyncBtn">Synchroniser maintenant</button>
      <button class="btn danger" id="cloudLogoutBtn">Déconnexion cloud</button>
      <div id="cloudStatus" class="status"></div>
    </div>
    <div class="cloudNotice">Si le cloud n’est pas encore configuré côté Firebase, cette zone reste en attente de la configuration du projet.</div>
  `;
  const memory = $('memorySection');
  const actions = profileCard.querySelector('.profileActions');
  if (memory) memory.insertAdjacentElement('beforebegin', box);
  else if (actions) actions.insertAdjacentElement('beforebegin', box);
  else profileCard.appendChild(box);
  $('cloudCreateBtn').onclick = createCloudAccount;
  $('cloudLoginBtn').onclick = loginCloudAccount;
  $('cloudSyncBtn').onclick = syncNow;
  $('cloudLogoutBtn').onclick = logoutCloud;
  const profile = currentProfile();
  if (profile.email && $('cloudEmail')) $('cloudEmail').value = profile.email;
  updateCloudButtons();
}

function updateCloudButtons() {
  const ready = !!(CONFIG && auth && db);
  ['cloudCreateBtn','cloudLoginBtn','cloudSyncBtn','cloudLogoutBtn'].forEach(id => {
    const btn = $(id);
    if (btn) btn.disabled = !ready;
  });
  if (!CONFIG && $('cloudStatus')) cloudStatus('Cloud prêt côté application, mais firebase-config.js n’est pas encore rempli.', 'err');
  else if (currentFirebaseUser && $('cloudStatus')) cloudStatus('Connectée au cloud : ' + currentFirebaseUser.email, 'ok');
  else if (ready && $('cloudStatus')) cloudStatus('Cloud configuré. Connecte-toi ou crée ton compte.', 'ok');
}

async function uploadUserData(user) {
  const profile = currentProfile();
  const history = latestHistory();
  const favorites = readJson('laraFavoritesV4', []);
  const friends = readJson('laraFriendsV4', []);
  await setDoc(doc(db, 'users', user.uid), {
    email: user.email,
    profile,
    memory: localMemory(),
    stats: {
      total: history.length,
      updatedAt: new Date().toISOString()
    },
    favoritesCount: favorites.length,
    friendsCount: friends.length,
    updatedAt: serverTimestamp()
  }, { merge: true });
}

async function downloadUserData(user) {
  const snap = await getDoc(doc(db, 'users', user.uid));
  if (!snap.exists()) {
    await uploadUserData(user);
    return 'Premier enregistrement cloud créé.';
  }
  const data = snap.data();
  if (data.memory) {
    restoreMemory(data.memory);
    return 'Mémoire cloud restaurée sur ce téléphone.';
  }
  return 'Compte cloud trouvé, mais aucune mémoire sauvegardée.';
}

async function saveLatestActivity(user) {
  const latest = latestHistory()[0];
  if (!latest) return;
  const profile = currentProfile();
  await addDoc(collection(db, 'activity'), {
    uid: user.uid,
    name: profile.name || 'Participante',
    title: latest.title || 'Défi terminé',
    emoji: latest.emoji || '✨',
    mode: latest.mode || 'solo',
    level: latest.level || 'debutant',
    time: latest.time || '',
    category: latest.category || '',
    createdAt: serverTimestamp()
  });
}

async function createCloudAccount() {
  try {
    const email = $('cloudEmail')?.value.trim();
    const password = $('cloudPassword')?.value;
    if (!email || !password) return alert('Entre un e-mail et un mot de passe.');
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    currentFirebaseUser = credential.user;
    await uploadUserData(currentFirebaseUser);
    cloudStatus('Compte cloud créé et mémoire sauvegardée ✓', 'ok');
  } catch (error) {
    cloudStatus('Erreur création : ' + readableError(error), 'err');
  }
}

async function loginCloudAccount() {
  try {
    const email = $('cloudEmail')?.value.trim();
    const password = $('cloudPassword')?.value;
    if (!email || !password) return alert('Entre ton e-mail et ton mot de passe.');
    const credential = await signInWithEmailAndPassword(auth, email, password);
    currentFirebaseUser = credential.user;
    const message = await downloadUserData(currentFirebaseUser);
    cloudStatus(message + ' Recharge si besoin pour tout afficher.', 'ok');
    setTimeout(() => location.reload(), 700);
  } catch (error) {
    cloudStatus('Erreur connexion : ' + readableError(error), 'err');
  }
}

async function syncNow() {
  if (!currentFirebaseUser) return cloudStatus('Connecte-toi d’abord au cloud.', 'err');
  try {
    await uploadUserData(currentFirebaseUser);
    await saveLatestActivity(currentFirebaseUser);
    cloudStatus('Synchronisation cloud effectuée ✓', 'ok');
  } catch (error) {
    cloudStatus('Erreur synchronisation : ' + readableError(error), 'err');
  }
}

async function logoutCloud() {
  if (!auth) return;
  await signOut(auth);
  currentFirebaseUser = null;
  cloudStatus('Déconnectée du cloud.', 'ok');
}

function readableError(error) {
  const code = error?.code || '';
  if (code.includes('auth/email-already-in-use')) return 'cet e-mail existe déjà, utilise “Me connecter”.';
  if (code.includes('auth/invalid-credential') || code.includes('auth/wrong-password')) return 'e-mail ou mot de passe incorrect.';
  if (code.includes('auth/weak-password')) return 'mot de passe trop faible.';
  if (code.includes('permission-denied')) return 'règles Firestore trop restrictives.';
  return error?.message || 'erreur inconnue';
}

function startCloudFeed() {
  if (!db || feedUnsubscribe) return;
  try {
    const feedQuery = query(collection(db, 'activity'), orderBy('createdAt', 'desc'), limit(30));
    feedUnsubscribe = onSnapshot(feedQuery, snapshot => {
      window.LARA_CLOUD_FEED = snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }));
      if (typeof window.renderFeed === 'function') window.renderFeed();
      if (typeof window.openFeed === 'function' && document.getElementById('feed')?.classList.contains('on')) window.openFeed();
    });
  } catch (error) {
    console.warn('Fil cloud non disponible', error);
  }
}

function patchSaveResultSync() {
  const originalSave = window.saveResult;
  if (typeof originalSave !== 'function' || originalSave.cloudPatched) return;
  const patched = function() {
    originalSave.apply(this, arguments);
    setTimeout(() => { if (currentFirebaseUser) syncNow(); }, 400);
  };
  patched.cloudPatched = true;
  window.saveResult = patched;
}

function patchOpenProfile() {
  const original = window.openProfile;
  window.openProfile = function() {
    if (typeof original === 'function') original.apply(this, arguments);
    ensureCloudPanel();
    updateCloudButtons();
  };
}

function patchFeedRenderer() {
  const originalOpenFeed = window.openFeed;
  window.openFeed = function() {
    if (typeof originalOpenFeed === 'function') originalOpenFeed.apply(this, arguments);
    const box = document.getElementById('feedList');
    const cloudItems = window.LARA_CLOUD_FEED || [];
    if (box && cloudItems.length) {
      const escaped = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
      box.innerHTML = cloudItems.map(item => `<article class="feedItem"><div class="feedAvatar">${escaped((item.name||'?').charAt(0).toUpperCase())}</div><div class="feedContent"><b>${escaped(item.name||'Participante')}<span class="onlineBadge">Cloud</span></b><p>${escaped(item.emoji||'✨')} ${escaped(item.title||'Défi terminé')}</p><span>${escaped(item.mode==='duo'?'Duo':'Solo')} • ${escaped(item.level||'')}</span></div></article>`).join('');
    }
  };
}

function initCloud() {
  patchOpenProfile();
  patchSaveResultSync();
  patchFeedRenderer();
  document.addEventListener('click', event => {
    const label = (event.target?.textContent || '').toLowerCase();
    if (label.includes('profil')) setTimeout(() => { ensureCloudPanel(); updateCloudButtons(); }, 80);
  }, true);
  if (!CONFIG) return;
  try {
    app = initializeApp(CONFIG);
    auth = getAuth(app);
    db = getFirestore(app);
    onAuthStateChanged(auth, async user => {
      currentFirebaseUser = user;
      updateCloudButtons();
      if (user) {
        startCloudFeed();
        try { await uploadUserData(user); } catch (error) { console.warn('Sync initiale impossible', error); }
      }
    });
  } catch (error) {
    console.error('Firebase non initialisé', error);
  }
}

initCloud();
