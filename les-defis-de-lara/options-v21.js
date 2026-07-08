window.LARA_EXTRA_FOODS = [
  'Aiguillette de poulet','Blanc de poulet','Cuisse de poulet','Escalope de dinde','Bœuf maigre','Steak 5%','Steak végétal','Jambon blanc','Jambon de dinde','Bacon de dinde','Œuf entier','Blancs d’œufs','Omelette','Saumon','Truite','Thon naturel','Sardines','Maquereau','Crevettes','Cabillaud','Colin','Lieu noir','Surimi','Tofu nature','Tofu fumé','Tempeh','Seitan','Skyr nature','Skyr vanille','Fromage blanc 0%','Fromage blanc 3%','Yaourt grec','Petit suisse','Cottage cheese','Mozzarella','Feta','Chèvre frais','Parmesan','Whey chocolat','Whey vanille','Caséine','Lait demi-écrémé','Lait végétal','Boisson amande','Boisson avoine',
  'Riz basmati','Riz thaï','Riz complet','Riz sauvage','Pâtes complètes','Pâtes semi-complètes','Pâtes de lentilles','Pâtes de pois chiches','Semoule','Boulgour','Quinoa','Sarrasin','Épeautre','Avoine','Flocons d’avoine','Muesli sans sucre','Granola maison','Pain complet','Pain de seigle','Pain aux céréales','Wrap complet','Tortilla maïs','Galette de riz','Patate douce','Pommes de terre','Pommes vapeur','Purée maison','Frites au four','Maïs','Polenta',
  'Lentilles vertes','Lentilles corail','Pois chiches','Haricots rouges','Haricots blancs','Flageolets','Fèves','Petits pois','Edamame','Houmous','Dahl de lentilles','Chili maison',
  'Brocolis','Chou-fleur','Chou rouge','Chou blanc','Choux de Bruxelles','Haricots verts','Courgettes','Aubergines','Poivrons','Carottes','Épinards','Champignons','Tomates','Tomates cerises','Concombre','Salade verte','Roquette','Mâche','Endives','Asperges','Poireaux','Oignons','Oignons rouges','Ail','Betterave','Radis','Potiron','Butternut','Courge','Avocat','Avocat toast','Ratatouille','Poêlée de légumes','Légumes vapeur','Légumes grillés',
  'Banane','Pomme','Poire','Orange','Clémentine','Kiwi','Fraise','Framboise','Myrtille','Fruits rouges','Mangue','Ananas','Raisin','Pêche','Nectarine','Abricot','Compote sans sucre','Datte','Figues','Pruneaux',
  'Amandes','Noix','Noix de cajou','Noisettes','Pistaches','Graines de chia','Graines de lin','Graines de courge','Graines de tournesol','Beurre de cacahuète','Purée d’amande','Tahini','Huile d’olive','Huile de colza','Olives','Chocolat noir 70%','Cacao non sucré','Miel','Sirop d’érable','Confiture allégée',
  'Bowl poulet','Bowl saumon','Bowl végétarien','Poké bowl','Salade César maison','Salade composée','Wrap poulet','Wrap saumon','Sandwich complet','Omelette légumes','Porridge','Pancakes protéinés','Smoothie protéiné','Soupe maison','Velouté légumes','Riz poulet curry','Pâtes saumon','Pâtes bolognaise maison','Lasagnes maison','Gratin légumes','Quiche maison','Pizza maison','Burger maison','Tacos maison équilibré','Sushi','Maki','Ramen maison','Couscous maison','Tajine poulet','Dahl lentilles','Chili con carne','Chili sin carne'
];

window.LARA_EXTRA_EXERCISES = [
  'Squat libre','Squat goblet','Squat barre','Squat sumo','Squat pause','Squat tempo','Box squat','Hack squat','Presse à cuisses','Presse pieds hauts','Presse pieds bas','Presse unilatérale','Fente avant','Fente arrière','Fente marchée','Fente bulgare','Fente latérale','Step up','Montée sur banc','Leg extension','Leg curl assis','Leg curl couché','Leg curl debout','Soulevé de terre roumain','Soulevé de terre jambes tendues','Good morning','Hip thrust','Hip thrust barre','Hip thrust machine','Hip thrust une jambe','Glute bridge','Glute bridge une jambe','Abduction machine','Abduction poulie','Abduction élastique','Kickback poulie','Kickback machine','Donkey kick','Fire hydrant','Cable pull through','Back extension fessiers','Frog pumps',
  'Développé couché','Développé incliné','Développé décliné','Pompes','Pompes inclinées','Chest press','Écarté poulie','Écarté haltères','Pec deck','Pull over','Développé épaules','Shoulder press','Développé militaire','Élévations latérales','Élévations frontales','Oiseau haltères','Face pull','Rowing menton',
  'Tirage vertical','Tirage poitrine','Tirage nuque','Tractions assistées','Tractions','Rowing barre','Rowing haltère','Rowing poulie basse','Rowing machine','Tirage horizontal','Tirage unilatéral','Lat pulldown prise serrée','Pull over poulie','Shrugs','Extensions lombaires',
  'Curl biceps','Curl marteau','Curl pupitre','Curl incliné','Curl poulie','Extension triceps poulie','Extension triceps corde','Barre au front','Dips assistés','Dips banc','Kickback triceps','Développé serré',
  'Gainage','Gainage latéral','Planche dynamique','Crunch','Crunch poulie','Relevés de jambes','Russian twist','Dead bug','Mountain climber','Hollow hold','Pallof press','Woodchopper','Ab wheel','Reverse crunch',
  'Rameur','Vélo','Vélo elliptique','Tapis de marche','Marche rapide','Marche inclinée','Course légère','Sprints','Air bike','SkiErg','Corde à sauter','Battle rope','Burpees','Jumping jacks','Montées de genoux','Farmer walk','Sled push','Kettlebell swing',
  'Mobilité hanches','Étirement ischios','Étirement quadriceps','Étirement fessiers','Ouverture de hanches','Mobilité épaules','Respiration diaphragmatique','Activation fessiers élastique','Échauffement bas du corps','Échauffement haut du corps'
];

try {
  if (typeof EXERCISES !== 'undefined' && Array.isArray(EXERCISES)) {
    const existing = new Set(EXERCISES.map(e => e.name));
    window.LARA_EXTRA_EXERCISES.forEach(name => {
      if (!existing.has(name)) EXERCISES.push({ name, category: 'Libre', family: 'custom', cue: 'Exercice ajouté aux propositions de publication.' });
    });
  }
} catch (error) {
  console.warn('Options supplémentaires non injectées', error);
}
