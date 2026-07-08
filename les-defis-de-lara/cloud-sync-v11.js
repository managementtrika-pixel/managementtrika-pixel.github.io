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
let restoredOnce = false;

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(screen => screen.classList.remove('on'));
  const target = $(id);
  if (target) target.classList.add('on');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function cloudStatus(text, type = 'ok') {
  const status = $('authStatus');
  if (!status) return;
  status.className = 'status on ' + type;
  status.textContent = text;
}

function readableError(error) {
  const code = error?.code || '';
  if (code.includes('auth/email-already-in-use')) return 'Compte déjà créé avec cet e-mail. Clique sur “Me connecter”. Code : ' + code;
  if (code.includes('auth/operation-not-allowed')) return 'Connexion e-mail/mot de passe non activée dans Firebase Authentication. Code : ' + code;
  if (code.includes('auth/unauthorized-domain')) return 'Domaine non autorisé dans Firebase Authentication. Ajoute managementtrika-pixel.github.io dans les domaines autorisés. Code : ' + code;
  if (code.includes('auth/invalid-credential') || code.includes('auth/wrong-password')) return 'E-mail ou mot de passe incorrect. Code : ' + code;
  if (code.includes('auth/user-not-found')) return 'Aucun compte trouvé avec cet e-mail. Code : ' + code;
  if (code.includes('auth/weak-password')) return 'Mot de passe trop faible : utilise au moins 6 caractères. Code : ' + code;
  if (code.includes('permission-denied')) return 'Compte créé/connecté, mais Firestore bloque la sauvegarde. Vérifie les règles Firestore. Code : ' + code;
  if (code.includes('failed-precondition')) return 'Firestore n’est peut-être pas encore créé ou activé. Code : ' + code;
  return (error?.message || 'Erreur inconnue') + (code ? ' Code : ' + code : '');
}

function currentProfile() {
  return readJson('laraUserV4', null) || readJson('laraUser', null) || { name: 'Invitée', email: '' };
}

function latestHistory() {
  return readJson('laraHistoryV4', []);
}

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

function ensureAuthScreen() {
  const login = $('login');
  if (!login) return;
  login.innerHTML = `
    <div class="card">
      <span class="tag">Compte cloud</span>
      <h1>Connexion</h1>
      <p class="sub">Connecte-toi une seule fois. Ensuite, l’application garde ta session et récupère automatiquement ta mémoire.</p>
      <div class="grid">
        <input id="authName" autocomplete="given-name" placeholder="Ton prénom — seulement pour créer un compte">
        <input id="authEmail" type="email" autocomplete="email" placeholder="Ton e-mail">
        <input id="authPassword" type="password" autocomplete="current-password" placeholder="Mot de passe">
        <button class="btn" id="authLoginBtn">Me connecter</button>
        <button class="btn secondary" id="authCreateBtn">Créer mon compte</button>
        <div id="authStatus" class="status"></div>
        <p class="tiny">Tes défis, favoris, amis et statistiques seront liés à ce compte.</p>
      </div>
    </div>
  `;
  $('authLoginBtn').onclick = loginAccount;
  $('authCreateBtn').onclick = createAccount;
  const last = currentProfile();
  if (last.email) $('authEmail').value = last.email;
}

function ensureTopLogout() {
  const top = document.querySelector('.topActions');
  if (!top) return;
  let logout = $('logoutNav');
  if (!logout) {
    logout = document.createElement('button');
    logout.id = 'logoutNav';
    logout.textContent = 'Déconnexion';
    logout.onclick = logoutAccount;
    top.appendChild(logout);
  }
  logout.style.display = currentFirebaseUser ? '' : 'none';
}

function hideAppWhenLoggedOut() {
  const profile = $('profileNav');
  const feed = $('feedNav');
  if (profile) profile.style.display = 'none';
  if (feed) feed.style.display = 'none';
  ensureTopLogout();
  showScreen('login');
}

function showAppWhenLoggedIn() {
  const profile = $('profileNav');
  const feed = $('feedNav');
  if (profile) profile.style.display = '';
  if (feed) feed.style.display = '';
  ensureTopLogout();
  const user = currentProfile();
  if ($('hello')) $('hello').textContent = 'Bonjour ' + (user.name || '✨') + ' ✨';
  showScreen('home');
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

async function tryUploadUserData(user) {
  try {
    await uploadUserData(user);
    return { ok: true };
  } catch (error) {
    console.warn('Sauvegarde Firestore impossible', error);
    return { ok: false, message: readableError(error) };
  }
}

async function downloadUserData(user) {
  const snap = await getDoc(doc(db, 'users', user.uid));
  if (!snap.exists()) {
    await uploadUserData(user);
    return false;
  }
  const data = snap.data();
  if (data.memory) {
    restoreMemory(data.memory);
    return true;
  }
  return false;
}

async function tryDownloadUserData(user) {
  try {
    return await downloadUserData(user);
  } catch (error) {
    console.warn('Restauration Firestore impossible', error);
    cloudStatus(readableError(error), 'err');
    return false;
  }
}

function updateLocalProfileFromAuth(user, name = '') {
  const existing = currentProfile();
  const cleanName = String(name || existing.name || user.email?.split('@')[0] || 'Membre').trim();
  const profile = { name: cleanName, email: user.email || existing.email || '', guest: false };
  saveJson('laraUserV4', profile);
  saveJson('laraUser', profile);
}

async function createAccount() {
  try {
    const name = $('authName')?.value.trim();
    const email = $('authEmail')?.value.trim();
    const password = $('authPassword')?.value;
    if (!name) return cloudStatus('Entre ton prénom pour créer ton compte.', 'err');
    if (!email || !password) return cloudStatus('Entre un e-mail et un mot de passe.', 'err');
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    currentFirebaseUser = credential.user;
    updateLocalProfileFromAuth(currentFirebaseUser, name);
    const sync = await tryUploadUserData(currentFirebaseUser);
    if (!sync.ok) cloudStatus('Compte créé ✓ mais sauvegarde cloud bloquée : ' + sync.message, 'err');
    else cloudStatus('Compte créé et sauvegardé ✓', 'ok');
    showAppWhenLoggedIn();
  } catch (error) {
    cloudStatus(readableError(error), 'err');
  }
}

async function loginAccount() {
  try {
    const email = $('authEmail')?.value.trim();
    const password = $('authPassword')?.value;
    if (!email || !password) return cloudStatus('Entre ton e-mail et ton mot de passe.', 'err');
    const credential = await signInWithEmailAndPassword(auth, email, password);
    currentFirebaseUser = credential.user;
    const restored = await tryDownloadUserData(currentFirebaseUser);
    if (!restored) updateLocalProfileFromAuth(currentFirebaseUser, $('authName')?.value.trim());
    const sync = await tryUploadUserData(currentFirebaseUser);
    if (!sync.ok) cloudStatus('Connectée ✓ mais sauvegarde cloud bloquée : ' + sync.message, 'err');
    else cloudStatus('Connectée ✓', 'ok');
    showAppWhenLoggedIn();
  } catch (error) {
    cloudStatus(readableError(error), 'err');
  }
}

async function logoutAccount() {
  if (!auth) return;
  await signOut(auth);
  currentFirebaseUser = null;
  restoredOnce = false;
  ensureAuthScreen();
  hideAppWhenLoggedOut();
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

async function syncNow() {
  if (!currentFirebaseUser) return;
  try {
    await uploadUserData(currentFirebaseUser);
    await saveLatestActivity(currentFirebaseUser);
  } catch (error) {
    console.warn('Synchronisation cloud impossible', error);
  }
}

function startCloudFeed() {
  if (!db || feedUnsubscribe) return;
  try {
    const feedQuery = query(collection(db, 'activity'), orderBy('createdAt', 'desc'), limit(30));
    feedUnsubscribe = onSnapshot(feedQuery, snapshot => {
      window.LARA_CLOUD_FEED = snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }));
      if (typeof window.openFeed === 'function' && document.getElementById('feed')?.classList.contains('on')) window.openFeed();
    }, error => console.warn('Lecture fil cloud impossible', error));
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

function disableLocalLogin() {
  window.enterApp = () => cloudStatus('Utilise la connexion cloud avec e-mail et mot de passe.', 'err');
  window.guest = () => cloudStatus('Le mode invité est désactivé pour garder la mémoire du compte.', 'err');
}

function initCloudAuth() {
  ensureAuthScreen();
  hideAppWhenLoggedOut();
  disableLocalLogin();
  patchSaveResultSync();
  patchFeedRenderer();
  if (!CONFIG) {
    cloudStatus('Configuration Firebase manquante.', 'err');
    return;
  }
  try {
    app = initializeApp(CONFIG);
    auth = getAuth(app);
    db = getFirestore(app);
    onAuthStateChanged(auth, async user => {
      currentFirebaseUser = user;
      ensureTopLogout();
      if (!user) {
        hideAppWhenLoggedOut();
        return;
      }
      try {
        if (!restoredOnce) {
          const restored = await tryDownloadUserData(user);
          if (!restored) updateLocalProfileFromAuth(user);
          restoredOnce = true;
        }
        await tryUploadUserData(user);
      } catch (error) {
        console.warn('Restauration cloud impossible', error);
      }
      startCloudFeed();
      showAppWhenLoggedIn();
    });
  } catch (error) {
    cloudStatus('Firebase ne s’initialise pas : ' + readableError(error), 'err');
  }
}

initCloudAuth();
