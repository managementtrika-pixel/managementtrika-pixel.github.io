'use strict';

const A = window.ZCG_ASSETS || {};
const $ = (id) => document.getElementById(id);
const canvas = $('game');
const ctx = canvas.getContext('2d');
const W = 1280, H = 720;
const images = new Map();
const clamp = (v,a,b)=>Math.max(a,Math.min(b,v));
const lerp = (a,b,t)=>a+(b-a)*t;
const rand = (a,b)=>a+Math.random()*(b-a);
const choice = arr=>arr[(Math.random()*arr.length)|0];
const easeOut = t=>1-Math.pow(1-t,3);
const groundTop = 405;
const groundBottom = 650;

function img(name){
  if(images.has(name)) return images.get(name);
  const i = new Image();
  i.src = A[name] || '';
  images.set(name,i);
  return i;
}

const SAVE_KEY='zcg_rift_brawl_save_v1';
const defaultSave=()=>({
  unlockedCharacters:['zaim'],
  unlockedChapters:1,
  scores:{},
  survivalBest:0,
  settings:{music:true,sfx:true,vibration:true,difficulty:'normal'}
});
let save;
try { save=Object.assign(defaultSave(),JSON.parse(localStorage.getItem(SAVE_KEY)||'{}')); save.settings=Object.assign(defaultSave().settings,save.settings||{}); }
catch { save=defaultSave(); }
function persist(){ localStorage.setItem(SAVE_KEY,JSON.stringify(save)); }

const CHARACTERS={
  zaim:{
    id:'zaim', label:'Zaim Sinja', faction:'PLAYER · NINJA', card:'Zaim Sinja', unlockAt:1,
    desc:'Rapide, polyvalent, chakra et kunaï. Évolue jusqu’à Roobkage.',
    forms:[
      {name:'Zaim Sinja',card:'Zaim Sinja',hp:90,power:1,speed:4.7,energyMax:100,light:'Kunaï précis',heavy:'Frappe du Rubinobi',special:'Spirale de chakra',style:'zaim'},
      {name:'Rubinobi',card:'Rubinobi',hp:130,power:1.23,speed:5.2,energyMax:110,light:'Pas du Shinobi',heavy:'Impact rooftop',special:'Chakra concentré',style:'rubinobi'},
      {name:'Roobkage',card:'Roobkage',hp:180,power:1.52,speed:5.45,energyMax:125,light:'Ordre du Kage',heavy:'Impact souverain',special:'Spirale souveraine',style:'roobkage'}
    ]
  },
  emerald:{
    id:'emerald',label:'Bafolight',faction:'PLAYER · ÉMERAUDE',card:'Bafolight',unlockAt:2,
    desc:'Contrôle de zone et constructions d’énergie. Évolue en Bafolantern.',
    forms:[
      {name:'Bafolight',card:'Bafolight',hp:82,power:.95,speed:4.8,energyMax:120,light:'Petite lueur',heavy:'Impact de volonté',special:'Construction douteuse',style:'bafolight'},
      {name:'Bafolantern',card:'Bafolantern',hp:150,power:1.4,speed:5.0,energyMax:145,light:'Poing de volonté',heavy:'Marteau émeraude',special:'Construction totale',style:'bafolantern'}
    ]
  },
  roubaix:{
    id:'roubaix',label:'Ouai Roubaix',faction:'STREET',card:'Ouai Roubaix',unlockAt:3,
    desc:'Pression, rush et grosses chaînes de coups. Évolue jusqu’à Ca dit Wak.',
    forms:[
      {name:'Ouai Roubaix',card:'Ouai Roubaix',hp:78,power:1.03,speed:5.05,energyMax:95,light:'Téma la zone',heavy:'On descend',special:'Pression de zone',style:'roubaix'},
      {name:'Wesh la Street',card:'Wesh la Street',hp:110,power:1.28,speed:5.3,energyMax:105,light:'Ça dit quoi ?',heavy:'Descente dans la zone',special:'La Street',style:'wesh'},
      {name:'Ca dit Wak',card:'Ca dit Wak',hp:170,power:1.55,speed:5.4,energyMax:115,light:'Toute la zone',heavy:'WAK !',special:'Pression maximale',style:'wak'}
    ]
  }
};

const STYLES={
  zaim:{skin:'#bd8867',body:'#34523b',pants:'#263d2f',accent:'#594c7d',hair:'#241b18',headband:'#6a5d82',glasses:true,headband:true,weapon:'kunai'},
  rubinobi:{skin:'#bd8867',body:'#263f35',pants:'#1f342b',accent:'#4b5680',hair:'#241b18',headband:'#536581',glasses:true,headband:true,weapon:'kunai',scarf:true},
  roobkage:{skin:'#bd8867',body:'#152e29',pants:'#10231f',accent:'#d0b56c',hair:'#241b18',headband:'#687c77',glasses:true,headband:true,cloak:true,aura:'#67f7d0',weapon:'kunai'},
  bafolight:{skin:'#9b6e50',body:'#102b22',pants:'#0e211c',accent:'#45ffad',hair:'#181510',aura:'#45ffad',ring:true},
  bafolantern:{skin:'#9b6e50',body:'#0c3326',pants:'#09241c',accent:'#69ffc1',hair:'#181510',aura:'#48f7ac',armor:true,ring:true},
  roubaix:{skin:'#5b3828',body:'#38543a',pants:'#1e2421',accent:'#5a7e45',hair:'#15110f'},
  wesh:{skin:'#5b3828',body:'#152238',pants:'#101a29',accent:'#3471b5',hair:'#15110f'},
  wak:{skin:'#5b3828',body:'#172237',pants:'#0c1523',accent:'#2e63a5',hair:'#15110f',jersey:true,aura:'#3e7ee2'},
  triko:{skin:'#aa795b',body:'#1a382e',pants:'#111f1a',accent:'#e6424d',hair:'#1d1714',glasses:true},
  anbu:{skin:'#9a7968',body:'#151a1e',pants:'#101417',accent:'#6d7380',hair:'#161616',mask:true,weapon:'blade'},
  roobanbu:{skin:'#9a7968',body:'#111319',pants:'#0d0f14',accent:'#6b4f86',hair:'#161616',mask:true,weapon:'blade',cloak:true},
  roobkatsuki:{skin:'#9a7968',body:'#120e13',pants:'#0c0a0d',accent:'#b62043',hair:'#141216',mask:true,cloak:true,aura:'#ff315c',weapon:'blade'},
  clone:{skin:'#b27d5f',body:'#293e33',pants:'#1d2c24',accent:'#53776d',hair:'#281e18',headband:true},
  jinch:{skin:'#a66f51',body:'#30191b',pants:'#201114',accent:'#ff674c',hair:'#1a1210',aura:'#ff593f',big:true},
  copy:{skin:'#b3876d',body:'#26323a',pants:'#18232a',accent:'#8ba6b3',hair:'#26282a',headband:true,maskMouth:true},
  djako:{skin:'#ad7655',body:'#17261f',pants:'#101b17',accent:'#55f5ad',hair:'#1a1612',ring:true},
  sentinel:{skin:'#986b50',body:'#132820',pants:'#0e1d18',accent:'#6effbd',hair:'#181512',armor:true,shield:true},
  sinestro:{skin:'#b88565',body:'#382d12',pants:'#221a0c',accent:'#f3d94c',hair:'#17120f',aura:'#f1d64a',ring:true},
  parallax:{skin:'#a97858',body:'#241b0f',pants:'#171108',accent:'#f8d126',hair:'#17120f',aura:'#f3d327',cloak:true,big:true,ring:true},
  jacolossus:{skin:'#7f5a45',body:'#1d332b',pants:'#14241f',accent:'#62f3b4',hair:'#171513',aura:'#62f3b4',armor:true,huge:true},
  stonard:{skin:'#765444',body:'#30383c',pants:'#252b2e',accent:'#6fa6ce',hair:'#121212',stone:true,huge:true,armor:true},
  zarion:{skin:'#d5c7c1',body:'#211526',pants:'#17101b',accent:'#9d53d9',hair:'#e1e3ec',aura:'#a447e4',whiteHair:true,cloak:true,crown:true},
  fang:{skin:'#2c3035',body:'#17211f',pants:'#101715',accent:'#4ea86c',hair:'#25292c',wolf:true,hood:true},
  kayo:{skin:'#6d472e',body:'#9a7721',pants:'#241d16',accent:'#f1cc54',hair:'#2b1e13',jersey:true,basketball:true}
};

const ENEMIES={
  sinanbu:{name:'SinANBU',style:'anbu',hp:56,speed:2.4,damage:8,type:'melee',card:'SinANBU'},
  roobanbu:{name:'RoobANBU',style:'roobanbu',hp:115,speed:2.65,damage:13,type:'elite',card:'RoobANBU'},
  clone:{name:'Zaimbun',style:'clone',hp:44,speed:3.1,damage:7,type:'rush',card:'Zaimbun'},
  jinch:{name:'Sinnchūriki',style:'jinch',hp:160,speed:1.75,damage:18,type:'tank',card:'Sinnchūriki'},
  copy:{name:'Roobgan',style:'copy',hp:92,speed:2.4,damage:11,type:'counter',card:'Roobgan'},
  roobkatsuki:{name:'Roobkatsuki',style:'roobkatsuki',hp:360,speed:2.45,damage:18,type:'bossNinja',boss:true,card:'Roobkatsuki'},
  djako:{name:'Djako Recrue',style:'djako',hp:58,speed:2.2,damage:8,type:'ranged',card:'Djako Recrue'},
  sentinel:{name:'Bafo Sentinel',style:'sentinel',hp:135,speed:1.8,damage:14,type:'shield',card:'Bafo Sentinel'},
  sinestro:{name:'Bafo Sinestro',style:'sinestro',hp:88,speed:2.25,damage:11,type:'rangedFear',card:'Bafo Sinestro'},
  jacolossus:{name:'Jacolossus',style:'jacolossus',hp:210,speed:1.35,damage:21,type:'tank',card:'Jacolossus'},
  parallax:{name:'Baforallax',style:'parallax',hp:420,speed:2.0,damage:20,type:'bossEmerald',boss:true,card:'Baforallax'},
  thug:{name:'Street',style:'wesh',hp:62,speed:2.5,damage:9,type:'melee',card:'Wesh la Street'},
  rival:{name:'United Man',style:'kayo',hp:145,speed:2.65,damage:14,type:'elite',card:'United Man'},
  stonard:{name:'Capitaine Stonard',style:'stonard',hp:260,speed:1.4,damage:24,type:'bossTank',boss:true,card:'Capitaine Stonard'},
  fang:{name:'Fang',style:'fang',hp:180,speed:3.1,damage:15,type:'bossRush',boss:true,card:'Fang'},
  kayo:{name:'Kayo',style:'kayo',hp:210,speed:2.95,damage:16,type:'bossKayo',boss:true,card:'Kayo'},
  zarion:{name:'Zarion, Roi Falfugor',style:'zarion',hp:460,speed:2.05,damage:22,type:'bossCaster',boss:true,card:'Zarion, Roi Falfugor'}
};

const CHAPTERS=[
  {id:1,key:'ninja',title:"L’Ombre des Ninjas",subtitle:'Village PLAYER · Nuit',boss:'roobkatsuki',bossText:'La branche ANBU atteint sa surévolution. Nuage interdit, Sentence écarlate : ne reste jamais immobile.',length:4750,palette:'ninja',zones:[
    {x:620,label:'Filature',spawn:['sinanbu','sinanbu','clone']},
    {x:1480,label:'Les clones',spawn:['clone','clone','sinanbu','copy']},
    {x:2400,label:'Assaut masqué',spawn:['roobanbu','sinanbu','sinanbu']},
    {x:3300,label:'Chakra instable',spawn:['jinch','roobanbu']},
    {x:4210,label:'BOSS',spawn:['roobkatsuki'],boss:true}
  ]},
  {id:2,key:'emerald',title:'Volonté Émeraude',subtitle:'Secteur cosmique · Rupture',boss:'parallax',bossText:'La peur a pris corps. Baforallax contrôle l’espace et projette des vagues jaunes qui traversent les lignes.',length:4900,palette:'emerald',zones:[
    {x:650,label:'Première lueur',spawn:['djako','djako','sentinel']},
    {x:1540,label:'Patrouille',spawn:['sentinel','djako','djako']},
    {x:2460,label:'Peur naissante',spawn:['sinestro','sentinel','djako']},
    {x:3400,label:'Construction colossale',spawn:['jacolossus','sinestro']},
    {x:4350,label:'BOSS',spawn:['parallax'],boss:true}
  ]},
  {id:3,key:'street',title:'Roubaix la Street',subtitle:'Zone urbaine · 02:17',boss:'rival',bossText:'United Man mélange Street et Sportifs : garde tes distances quand il charge, puis punis son recovery.',length:4750,palette:'street',zones:[
    {x:620,label:'Téma la zone',spawn:['thug','thug','thug']},
    {x:1500,label:'Ça dit quoi ?',spawn:['thug','rival']},
    {x:2380,label:'Descente dans la zone',spawn:['thug','thug','rival']},
    {x:3330,label:'WAK !',spawn:['rival','rival']},
    {x:4200,label:'RIVAL',spawn:['rival'],boss:true}
  ]},
  {id:4,key:'rift',title:'Rift des Factions',subtitle:'Tournoi ZEUBI · Finale',boss:'zarion',bossText:'Le Roi Falfugor ferme le Rift. Ses malédictions apparaissent au sol avant l’impact : lis les télégraphes.',length:5600,palette:'rift',zones:[
    {x:650,label:'ZANIMAUX',spawn:['fang'],boss:true,mini:true},
    {x:1750,label:'SPORTIFS',spawn:['kayo'],boss:true,mini:true},
    {x:2900,label:'STONARD',spawn:['stonard'],boss:true,mini:true},
    {x:4050,label:'Rift ouvert',spawn:['sinanbu','sentinel','thug','copy']},
    {x:5050,label:'FALFUGOR',spawn:['zarion'],boss:true}
  ]}
];

const CODEX=[
  ...['Zaim Sinja','Rubinobi','Roobkage','Zaimbun','Roobunshin','SinANBU','RoobANBU','Roobkatsuki','Zaimchū','Sinnchūriki','Roobjutsu','Zaimsei','Sinnobi','Roobgan'].map(name=>({name,set:'Ninja'})),
  ...['Bafolight','Bafolantern','Djako Recrue','Jack-o’-Lanterne','DJ Nova','Jaï Projection','Jaï Constructeur','Bafo des Patrouilles','Bafo Sentinel','Bafo Centurion','Bafo Sinestro','Baforallax','Djako Batterie','Djako Surchargé','Jacolossus'].map(name=>({name,set:'Émeraude'})),
  ...['Ouai Roubaix','Wesh la Street','Ca dit Wak','United Man','Triko'].map(name=>({name,set:'Street'})),
  ...['Capitaine Stonard','Zarion, Roi Falfugor','Fang','Kayo'].map(name=>({name,set:'Factions'}))
];

class AudioEngine{
  constructor(){this.ac=null;this.master=null;this.musicGain=null;this.sfxGain=null;this.timer=null;this.step=0;}
  ensure(){
    if(this.ac) return;
    const AC=window.AudioContext||window.webkitAudioContext;
    if(!AC) return;
    this.ac=new AC();
    this.master=this.ac.createGain();this.master.gain.value=.7;this.master.connect(this.ac.destination);
    this.musicGain=this.ac.createGain();this.musicGain.gain.value=save.settings.music?.16:0;this.musicGain.connect(this.master);
    this.sfxGain=this.ac.createGain();this.sfxGain.gain.value=save.settings.sfx?.35:0;this.sfxGain.connect(this.master);
  }
  setSettings(){if(!this.ac)return;this.musicGain.gain.setTargetAtTime(save.settings.music?.16:0,this.ac.currentTime,.04);this.sfxGain.gain.setTargetAtTime(save.settings.sfx?.35:0,this.ac.currentTime,.04)}
  tone(freq,dur=.08,type='sine',vol=.15,slide=0){if(!save.settings.sfx)return;this.ensure();if(!this.ac)return;const o=this.ac.createOscillator(),g=this.ac.createGain();o.type=type;o.frequency.setValueAtTime(freq,this.ac.currentTime);if(slide)o.frequency.exponentialRampToValueAtTime(Math.max(40,freq+slide),this.ac.currentTime+dur);g.gain.setValueAtTime(vol,this.ac.currentTime);g.gain.exponentialRampToValueAtTime(.001,this.ac.currentTime+dur);o.connect(g);g.connect(this.sfxGain);o.start();o.stop(this.ac.currentTime+dur)}
  noise(dur=.035,vol=.08){if(!save.settings.sfx)return;this.ensure();if(!this.ac)return;const len=Math.floor(this.ac.sampleRate*dur),b=this.ac.createBuffer(1,len,this.ac.sampleRate),d=b.getChannelData(0);for(let i=0;i<len;i++)d[i]=Math.random()*2-1;const s=this.ac.createBufferSource(),g=this.ac.createGain();s.buffer=b;g.gain.setValueAtTime(vol,this.ac.currentTime);g.gain.exponentialRampToValueAtTime(.001,this.ac.currentTime+dur);s.connect(g);g.connect(this.sfxGain);s.start()}
  sfx(name){if(name==='hit'){this.noise(.045,.12);this.tone(120,.06,'square',.08,-40)}else if(name==='heavy'){this.noise(.08,.18);this.tone(75,.1,'sawtooth',.12,-30)}else if(name==='special'){this.tone(260,.18,'sine',.1,520);this.tone(130,.22,'triangle',.07,160)}else if(name==='dash'){this.noise(.05,.06);this.tone(210,.06,'triangle',.05,90)}else if(name==='evolve'){this.tone(180,.45,'sawtooth',.08,700);setTimeout(()=>this.tone(360,.42,'triangle',.08,900),120)}else if(name==='ko'){this.tone(120,.32,'sawtooth',.1,-60)}else if(name==='pickup'){this.tone(520,.08,'sine',.07,180)}}
  startMusic(palette='ninja'){
    this.ensure();if(!this.ac)return;clearInterval(this.timer);this.step=0;
    const roots={ninja:55,emerald:61.7,street:49,rift:46.2,survival:52};const root=roots[palette]||55;
    this.timer=setInterval(()=>{if(!save.settings.music||Game.state!=='playing')return;const s=this.step++%16;if(s===0||s===8)this.kick(root);if(s===4||s===12)this.snare();if(s%2===0)this.hat();if(s===0||s===6||s===10)this.bass(root*(s===10?1.5:s===6?1.25:1));},115);
  }
  kick(f){if(!this.ac)return;const o=this.ac.createOscillator(),g=this.ac.createGain();o.frequency.setValueAtTime(f*2.4,this.ac.currentTime);o.frequency.exponentialRampToValueAtTime(f*.85,this.ac.currentTime+.11);g.gain.setValueAtTime(.14,this.ac.currentTime);g.gain.exponentialRampToValueAtTime(.001,this.ac.currentTime+.12);o.connect(g);g.connect(this.musicGain);o.start();o.stop(this.ac.currentTime+.13)}
  snare(){if(!this.ac)return;const len=Math.floor(this.ac.sampleRate*.07),b=this.ac.createBuffer(1,len,this.ac.sampleRate),d=b.getChannelData(0);for(let i=0;i<len;i++)d[i]=(Math.random()*2-1)*(1-i/len);const s=this.ac.createBufferSource(),g=this.ac.createGain();s.buffer=b;g.gain.value=.055;s.connect(g);g.connect(this.musicGain);s.start()}
  hat(){if(!this.ac)return;const len=Math.floor(this.ac.sampleRate*.02),b=this.ac.createBuffer(1,len,this.ac.sampleRate),d=b.getChannelData(0);for(let i=0;i<len;i++)d[i]=(Math.random()*2-1);const s=this.ac.createBufferSource(),g=this.ac.createGain();s.buffer=b;g.gain.value=.012;s.connect(g);g.connect(this.musicGain);s.start()}
  bass(f){if(!this.ac)return;const o=this.ac.createOscillator(),g=this.ac.createGain();o.type='triangle';o.frequency.value=f;g.gain.setValueAtTime(.032,this.ac.currentTime);g.gain.exponentialRampToValueAtTime(.001,this.ac.currentTime+.18);o.connect(g);g.connect(this.musicGain);o.start();o.stop(this.ac.currentTime+.2)}
}
const audio=new AudioEngine();
function vibrate(pattern){if(save.settings.vibration&&navigator.vibrate)navigator.vibrate(pattern)}
