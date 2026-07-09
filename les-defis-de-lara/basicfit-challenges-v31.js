(()=>{
  const LEVELS={
    debutant:{label:'Débutant',rounds:2,reps:[10,12],time:20,rest:'1 min',suffix:'facile'},
    intermediaire:{label:'Intermédiaire',rounds:3,reps:[12,15],time:30,rest:'45 sec',suffix:'tonique'},
    confirme:{label:'Confirmé',rounds:4,reps:[15,20],time:40,rest:'30 sec',suffix:'intense'}
  };
  const BASIC_FIT={
    Jambes:[
      {name:'Presse à cuisses',material:'presse à cuisses',cue:'pousse avec les talons, sans verrouiller les genoux'},
      {name:'Leg extension',material:'machine extension de jambes',cue:'tends les jambes puis redescends lentement'},
      {name:'Leg curl',material:'machine ischios',cue:'ramène les talons vers les fessiers en contrôlant'},
      {name:'Squat au banc',material:'banc + poids du corps',cue:'touche le banc puis remonte sans t’écraser'},
      {name:'Fente arrière',material:'poids du corps ou haltères',cue:'recule une jambe et garde le buste droit'}
    ],
    Fessiers:[
      {name:'Abduction machine',material:'machine abducteurs',cue:'ouvre les genoux puis reviens doucement'},
      {name:'Hip thrust sur banc',material:'banc + haltère ou barre',cue:'monte le bassin et serre les fessiers en haut'},
      {name:'Kickback à la poulie',material:'poulie basse',cue:'pousse la jambe vers l’arrière sans cambrer'},
      {name:'Pont fessier au sol',material:'tapis',cue:'monte le bassin et contrôle la descente'},
      {name:'Squat sumo haltère',material:'haltère',cue:'garde le dos droit et pousse dans les talons'}
    ],
    Dos:[
      {name:'Tirage vertical',material:'machine tirage vertical',cue:'tire la barre vers le haut de la poitrine'},
      {name:'Tirage horizontal assis',material:'machine rowing assis',cue:'tire les poignées vers le ventre'},
      {name:'Rowing haltères sur banc',material:'banc + haltères',cue:'garde le dos stable et tire le coude vers l’arrière'},
      {name:'Face pull à la poulie',material:'poulie + corde',cue:'tire vers le visage en gardant les épaules basses'},
      {name:'Écarté inversé machine',material:'machine arrière d’épaules',cue:'ouvre les bras sans hausser les épaules'}
    ],
    Haut:[
      {name:'Chest press',material:'machine poitrine',cue:'pousse les poignées devant toi puis reviens lentement'},
      {name:'Développé épaules machine',material:'machine épaules',cue:'pousse au-dessus de la tête sans creuser le dos'},
      {name:'Élévations latérales',material:'haltères légers',cue:'monte les bras jusqu’aux épaules'},
      {name:'Curl biceps',material:'haltères ou poulie',cue:'plie les coudes sans balancer le corps'},
      {name:'Triceps poulie',material:'poulie + corde',cue:'tends les bras vers le bas en gardant les coudes fixes'}
    ],
    Gainage:[
      {name:'Gainage avant',material:'tapis',cue:'garde le ventre serré et le dos droit'},
      {name:'Dead bug',material:'tapis',cue:'tends bras et jambe opposés en gardant le bas du dos au sol'},
      {name:'Bird dog',material:'tapis',cue:'tends bras et jambe opposés sans bouger le bassin'},
      {name:'Pallof press',material:'poulie',cue:'pousse les mains devant toi sans tourner le buste'},
      {name:'Crunch contrôlé',material:'tapis',cue:'décolle les épaules sans tirer sur la nuque'}
    ],
    Cardio:[
      {name:'Vélo',material:'vélo',cue:'garde une cadence régulière'},
      {name:'Tapis plat',material:'tapis de course sans inclinaison',cue:'marche vite avec les épaules relâchées'},
      {name:'Rameur',material:'rameur',cue:'pousse avec les jambes puis tire avec les bras'},
      {name:'Elliptique',material:'vélo elliptique',cue:'garde le rythme sans bloquer la respiration'},
      {name:'Step bas',material:'step ou banc bas',cue:'monte et descends sans sauter'}
    ],
    Mobilité:[
      {name:'Ouverture de poitrine',material:'tapis ou zone libre',cue:'ouvre les bras et respire calmement'},
      {name:'Mobilité hanches',material:'tapis',cue:'fais des mouvements lents et contrôlés'},
      {name:'Mobilité chevilles',material:'mur ou banc',cue:'avance le genou sans décoller le talon'},
      {name:'Étirement dos',material:'tapis',cue:'arrondis puis relâche le dos doucement'},
      {name:'Respiration profonde',material:'tapis',cue:'inspire par le nez puis expire lentement'}
    ]
  };
  const ORDER=['Jambes','Fessiers','Dos','Haut','Gainage','Cardio','Mobilité'];
  const TITLES={
    Jambes:['Jambes simples','Bas du corps clair','Jambes machines','Routine jambes','Jambes faciles'],
    Fessiers:['Fessiers simples','Booty basic','Fessiers machines','Routine fessiers','Fessiers propres'],
    Dos:['Dos posture','Dos simple','Routine dos','Posture Basic-Fit','Dos contrôlé'],
    Haut:['Haut du corps','Bras et épaules','Poitrine simple','Routine haut','Haut tonique'],
    Gainage:['Ventre stable','Core simple','Gainage propre','Centre du corps','Abdos contrôlés'],
    Cardio:['Cardio facile','Cardio machine','Souffle régulier','Cardio propre','Endurance simple'],
    Mobilité:['Mobilité douce','Retour au calme','Corps léger','Souplesse simple','Respiration et mobilité']
  };
  const emojiFor={Jambes:'🌸',Fessiers:'🍑',Dos:'💎',Haut:'🏋️‍♀️',Gainage:'🧘‍♀️',Cardio:'🚲',Mobilité:'🫶'};
  function pick(category,i,shift=0){const list=BASIC_FIT[category];return list[(i+shift)%list.length]}
  function reps(level,i,shift=0){const r=LEVELS[level].reps;return r[0]+((i+shift)%(r[1]-r[0]+1))}
  function title(category,mode,level,i){const base=TITLES[category][i%TITLES[category].length];const levelWord=LEVELS[level].suffix;return `${base} ${levelWord}${mode==='duo'?' duo':''}`}
  function soloDescription(category,level,i){
    const cfg=LEVELS[level],a=pick(category,i),b=pick(category,i,2),c=pick(category,i,4),r1=reps(level,i),r2=reps(level,i,2);
    if(category==='Cardio')return `Matériel : ${a.material}. Fais ${cfg.time} secondes à rythme normal, puis ${cfg.time} secondes un peu plus rapide. Répète ${cfg.rounds+2} fois. Objectif : respirer fort, mais rester propre.`;
    if(category==='Mobilité')return `Matériel : ${a.material}. Fais ${cfg.rounds} tours tranquilles : ${cfg.time} secondes de ${a.name.toLowerCase()}, ${cfg.time} secondes de ${b.name.toLowerCase()}, puis ${cfg.time} secondes de ${c.name.toLowerCase()}. Respire lentement.`;
    return `Matériel : ${a.material}, ${b.material}. Fais ${cfg.rounds} tours : ${r1} ${a.name.toLowerCase()}, ${r2} ${b.name.toLowerCase()}, puis ${cfg.time} secondes de ${c.name.toLowerCase()}. Repos : ${cfg.rest}.`;
  }
  function duoDescription(category,level,i){
    const cfg=LEVELS[level],a=pick(category,i),b=pick(category,i,2),c=pick(category,i,4),r1=reps(level,i),r2=reps(level,i,2);
    if(category==='Cardio')return `Matériel : ${a.material}. À deux : l’une travaille ${cfg.time} secondes, l’autre récupère. Alternez ${cfg.rounds+3} fois. Restez sur un rythme clair et contrôlé.`;
    if(category==='Mobilité')return `Matériel : ${a.material}. À deux, faites ${cfg.rounds} tours ensemble : ${cfg.time} secondes de ${a.name.toLowerCase()}, ${cfg.time} secondes de ${b.name.toLowerCase()}, puis respiration lente.`;
    return `Matériel : ${a.material}, ${b.material}. Chacune fait ${cfg.rounds} tours : ${r1} ${a.name.toLowerCase()} puis ${r2} ${b.name.toLowerCase()}. L’autre récupère et compte les répétitions. Finissez ensemble avec ${cfg.time} secondes de ${c.name.toLowerCase()}.`;
  }
  function makeChallenge(mode,level,i){
    const category=ORDER[i%ORDER.length];
    const e1=pick(category,i),e2=pick(category,i,2),e3=pick(category,i,4);
    return {
      emoji:emojiFor[category],
      title:title(category,mode,level,i),
      description:mode==='duo'?duoDescription(category,level,i):soloDescription(category,level,i),
      category:category==='Haut'?'Haut du corps':category,
      exercises:[e1,e2,e3],
      material:[e1.material,e2.material,e3.material].filter(Boolean).join(' • '),
      source:'basic-fit-v31'
    };
  }
  const challenges={solo:{debutant:[],intermediaire:[],confirme:[]},duo:{debutant:[],intermediaire:[],confirme:[]}};
  for(const mode of ['solo','duo'])for(const level of ['debutant','intermediaire','confirme'])challenges[mode][level]=Array.from({length:84},(_,i)=>makeChallenge(mode,level,i));
  window.CHALLENGES=challenges;
  window.TOTAL_CHALLENGES=504;
  window.LARA_BASICFIT_CHALLENGES_READY=true;
})();
