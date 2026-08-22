(()=>{
  const A=window.ZCG_ASSETS=window.ZCG_ASSETS||{};
  const defs={
    'Zaim Sinja':['PLAYER · NINJA','#3f745f','忍'],'Rubinobi:['PLAYER · NINJA','#2d6d69','忍'],'Roobkage':['PLAYER · NINJA','#1c8277','影'],
    Bafolight:['PLAYER · ÉMERAUDE','#238b55','✦'],Bafolantern:['PLAYER · ÉMERAUDE','#18b965','✦'],
    'Ouai Roubaix':['STREET','#2c6e48','RBX'],'Wesh la Street':['STREET','#38684f','93'],'Ca dit Wak':['STREET','#147a4c','WAK'],
    Roobkatsuki:['NINJA · BOSS','#7b233f','☁'],Baforallax:['ÉMERAUDE · BOSS','#777314','◈'],
    'United Man':['STREET · ÉLITE','#8f5137','U'],'Fang:['ZANIMAUX · BOSS','#486a47','牙'],Kayo:['SPORTIFS · BOSS','#a05b2c','KO'],
    'Capitaine Stonard':['STONARD · BOSS','#466d82','◆'],'Zarion, Roi Falfugor':['FALFUGOR · BOSS','#733c91','♛'],Triko:['STREET','#8d3c3c','T'],
    SinANBU:['NINJA','#424958','暗'],RoobANBU:['NINJA','#553d70','暗'],Zaimbun:['NINJA','#516e62','分'],Roobunshin:['NINJA','#426c64','分'],
    'Zaimchū':['NINJA','#665249','封'],'Sinnchūriki':['NINJA','#8b493c','獣'],Roobjutsu:['NINJA','#385d67','術'],Zaimsei:['NINJA','#5b6244','師'],Sinnobi:['NINJA','#354c54','忍'],Roobgan:['NINJA','#633f4f','眼'],
    'Djako Recrue':['ÉMERAUDE','#398a55','✦'],'Jack-o’-Lanterne':['ÉMERAUDE','#25945c','✦'],'DJ Nova':['ÉMERAUDE','#1acb72','★'],
    'Jaï Projection':['ÉMERAUDE','#357d65','◇'],'Jaï Constructeur':['ÉMERAUDE','#278c63','▱'],'Bafo des Patrouilles':['ÉMERAUDE','#3b7d58','✦'],
    'Bafo Sentinel':['ÉMERAUDE','#2b8a62','⬡'],'Bafo Centurion':['ÉMERAUDE','#178d5c','✦'],'Bafo Sinestro':['ÉMERAUDE','#8e7a27','!'],
    'Djako Batterie':['ÉMERAUDE','#368e61','▣'],'Djako Surchargé':['ÉMERAUDE','#20a866','⚡'],Jacolossus:['ÉMERAUDE','#1f855d','巨']
  };
  const esc=s=>String(s).replace(/[&<>\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[c]));
  const card=(name,[set,color,symbol])=>{
    const n=esc(name),st=esc(set),sy=esc(symbol);
    const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="660" height="940" viewBox="0 0 660 940">
      <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#050909"/><stop offset=".55" stop-color="${color}"/><stop offset="1" stop-color="#050707"/></linearGradient><radialGradient id="r"><stop stop-color="${color}" stop-opacity=".9"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient></defs>
      <rect width="660" height="940" rx="36" fill="#050706"/><rect x="15" y="15" width="630" height="910" rx="30" fill="url(#g)" stroke="#c3a35c" stroke-width="7"/>
      <path d="M36 150H624V670H36Z" fill="#07100f" stroke="#9b814a" stroke-width="3"/><circle cx="330" cy="390" r="235" fill="url(#r)"/>
      <circle cx="330" cy="380" r="145" fill="#050909" opacity=".82"/><text x="330" y="425" text-anchor="middle" font-size="135" font-family="sans-serif" font-weight="900" fill="#e9d39d">${sy}</text>
      <text x="46" y="82" font-family="sans-serif" font-size="25" font-weight="900" fill="#d8bc77">${st}</text>
      <text x="46" y="127" font-family="sans-serif" font-size="38" font-weight="900" fill="#fff">${n}</text>
      <rect x="44" y="705" width="572" height="72" rx="14" fill="#07100f" stroke="${color}" stroke-width="2"/><text x="70" y="750" font-family="sans-serif" font-size="26" font-weight="800" fill="#fff">ZEUBI IMPACT</text>
      <rect x="44" y="792" width="572" height="72" rx="14" fill="#07100f" stroke="#b99a58" stroke-width="2"/><text x="70" y="837" font-family="sans-serif" font-size="24" font-weight="700" fill="#cfd8d2">RIFT BRAWL</text>
      <text x="330" y="902" text-anchor="middle" font-family="sans-serif" font-size="18" font-weight="800" fill="#bda56d">ZEUBI CARD GAMES</text>
    </svg>`;
    return 'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);
  };
  for(const [name,d] of Object.entries(defs)) if(!A[name]) A[name]=card(name,d);
})();
