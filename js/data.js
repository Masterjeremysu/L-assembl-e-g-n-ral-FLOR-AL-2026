/**
 * Données de l'Assemblée Générale 2026 - RÉSIDENCE LE FLORÉAL
 * Convocation du 25 novembre 2026 à 18h00 - Sassenage
 */

const STORAGE_KEY = 'AG_CS_VOTES_DATA_FLOREAL_2026';

const DEFAULT_AG_DATA = {
  config: {
    coproName: "RÉSIDENCE LE FLORÉAL",
    address: "13-19 Rue du Moucherotte, 38360 Sassenage",
    agDate: "2026-11-25",
    agTime: "18h00",
    agLocation: "Salle Jacques Prévert, Rue du Moucherotte, 38360 Sassenage",
    syndic: "Citya Agence Henry",
    totalTantiemes: 10000,
    presentTantiemes: 0
  },
  
  // Liste des membres actuels du Conseil Syndical
  members: [
    { id: "m1", name: "Mme GANET", lots: "", tantiemes: 0, mandats: "", mandatTantiemes: 0 },
    { id: "m2", name: "Mlle PIGOIS", lots: "", tantiemes: 0, mandats: "", mandatTantiemes: 0 },
    { id: "m3", name: "M. ou Mme GUERRE", lots: "", tantiemes: 0, mandats: "", mandatTantiemes: 0 },
    { id: "m4", name: "M. ou Mme GARCIA F. - OSIOL F.", lots: "", tantiemes: 0, mandats: "", mandatTantiemes: 0 },
    { id: "m5", name: "M. DUCHEZ", lots: "", tantiemes: 0, mandats: "", mandatTantiemes: 0 },
    { id: "m6", name: "M. ou Mme CASARI", lots: "", tantiemes: 0, mandats: "", mandatTantiemes: 0 },
    { id: "m7", name: "M. LOUIS", lots: "", tantiemes: 0, mandats: "", mandatTantiemes: 0 },
    { id: "m8", name: "M. ou Mme BEZY", lots: "", tantiemes: 0, mandats: "", mandatTantiemes: 0 },
    { id: "m9", name: "Mme ARMONIA PESENTI", lots: "", tantiemes: 0, mandats: "", mandatTantiemes: 0 },
    { id: "m10", name: "M. et Mme LEGRAND", lots: "", tantiemes: 0, mandats: "", mandatTantiemes: 0 },
    { id: "m11", name: "M. BONSIGNORE", lots: "", tantiemes: 0, mandats: "", mandatTantiemes: 0 },
    { id: "m12", name: "M. ou Mme BRUN", lots: "", tantiemes: 0, mandats: "", mandatTantiemes: 0 },
    { id: "m13", name: "Mme FANTINI", lots: "", tantiemes: 0, mandats: "", mandatTantiemes: 0 },
    { id: "m14", name: "M. SUZET Jeremy", lots: "", tantiemes: 0, mandats: "", mandatTantiemes: 0 },
    { id: "m15", name: "Mme DABOIN SOTO", lots: "", tantiemes: 0, mandats: "", mandatTantiemes: 0 },
    { id: "m16", name: "Mme FALCON", lots: "", tantiemes: 0, mandats: "", mandatTantiemes: 0 },
    { id: "m17", name: "M. ou Mme COURANT", lots: "", tantiemes: 0, mandats: "", mandatTantiemes: 0 }
  ],

  // Registre complet des copropriétaires (prêt pour import)
  coproprietaires: [],

  // Ordre du jour complet & résolutions extraites de la convocation
  resolutions: [
    {
      id: "r01",
      number: "01",
      title: "Élection du/de la président(e) de séance de l'assemblée",
      description: "Pour remplir les fonctions de président(e) de séance, l'assemblée générale élit : ...\nCette décision devra recueillir la majorité de l'Article 24.",
      majorite: "Article 24",
      csConsigne: "POUR",
      csNotes: "Choisir un membre du conseil syndical pour présider la séance.",
      status: "EN_ATTENTE"
    },
    {
      id: "r02",
      number: "02",
      title: "Élection de scrutateur(s)/scrutatrice(s) de l'assemblée",
      description: "Pour remplir les fonctions de scrutateur(s)/scrutatrice(s) de séance, l'assemblée générale élit : ...\nCette décision devra recueillir la majorité de l'Article 24.",
      majorite: "Article 24",
      csConsigne: "POUR",
      csNotes: "",
      status: "EN_ATTENTE"
    },
    {
      id: "r03",
      number: "03",
      title: "Élection du secrétaire de séance de l'assemblée",
      description: "Pour remplir les fonctions de secrétaire de séance, l'assemblée générale élit : ...\nLe syndic dépose sur le bureau la feuille de présence, les pouvoirs, les bulletins de vote par correspondance, le registre des LRAR.\nMajorité de l'Article 24.",
      majorite: "Article 24",
      csConsigne: "POUR",
      csNotes: "Le syndic assure généralement le secrétariat.",
      status: "EN_ATTENTE"
    },
    {
      id: "r04",
      number: "04",
      title: "Rapport du conseil syndical pour l'exercice N du 01/07/2025 au 30/06/2026",
      description: "Le conseil syndical fait lecture de son rapport d'activité au cours de l'exercice N.\nCette résolution est une information, elle n'appelle pas au vote.",
      majorite: "article sans vote",
      csConsigne: "LIBRE",
      csNotes: "Présentation du bilan annuel par le Conseil Syndical.",
      status: "EN_ATTENTE"
    },
    {
      id: "r05",
      number: "05",
      title: "Approbation des comptes de l'exercice N du 01/07/2025 au 30/06/2026",
      description: "Comptes joints à la convocation en annexe.\nApprobation des comptes de charges dudit exercice pour un montant de 703 324,59 EUROS TTC.\nMajorité de l'Article 24.",
      majorite: "Article 24",
      csConsigne: "POUR",
      csNotes: "Comptes vérifiés avec le grand livre et les factures justificatives.",
      status: "EN_ATTENTE"
    },
    {
      id: "r06",
      number: "06",
      title: "Désignation du syndic (contrats joints à la convocation en annexes)",
      description: "Présentation des contrats de syndic en concurrence.\nCette résolution est une information, elle n'appelle pas au vote.",
      majorite: "article sans vote",
      csConsigne: "LIBRE",
      csNotes: "Passer directement aux votes des candidatures 06a et 06b.",
      status: "EN_ATTENTE"
    },
    {
      id: "r06a",
      number: "06a",
      title: "Candidature du syndic : CITYA agence HENRY",
      description: "Désignation du cabinet CITYA AGENCE HENRY pour une durée de 12 MOIS (01.01.2027 au 31.12.2027).\nMajorité de l'Article 25 ou à défaut article 25-1.",
      majorite: "Article 25 ou à défaut article 25-1",
      csConsigne: "POUR",
      csNotes: "Syndic sortant. Comparer les honoraires et prestations avec Trenta.",
      status: "EN_ATTENTE"
    },
    {
      id: "r06b",
      number: "06b",
      title: "Candidature du syndic : TRENTA IMMOBILIER",
      description: "Désignation du cabinet TRENTA IMMOBILIER pour une durée de 18 MOIS.\nMajorité de l'Article 25 ou à défaut article 25-1.",
      majorite: "Article 25 ou à défaut article 25-1",
      csConsigne: "LIBRE",
      csNotes: "Candidature concurrente proposée à l'AG.",
      status: "EN_ATTENTE"
    },
    {
      id: "r07",
      number: "07",
      title: "Approbation du budget prévisionnel pour l'exercice N+2 (01.07.2027 au 30.06.2028)",
      description: "Budget prévisionnel N+2 arrêté à la somme de 708 674 EUROS TTC.\nExigible par trimestres égaux.\nMajorité de l'Article 24.",
      majorite: "Article 24",
      csConsigne: "POUR",
      csNotes: "Budget nécessaire au fonctionnement courant de la résidence.",
      status: "EN_ATTENTE"
    },
    {
      id: "r08",
      number: "08",
      title: "Élection du conseil syndical",
      description: "Le conseil syndical assiste et contrôle la gestion du syndic.\nCette résolution est une information, elle n'appelle pas au vote.",
      majorite: "article sans vote",
      csConsigne: "LIBRE",
      csNotes: "Vote individuel candidat par candidat de 08a à 08n.",
      status: "EN_ATTENTE"
    },
    {
      id: "r08a",
      number: "08a",
      title: "Élection au Conseil Syndical : MME GANET",
      description: "Élection de MME GANET. Majorité de l'Article 25 ou à défaut article 25-1.",
      majorite: "Article 25 ou à défaut article 25-1",
      csConsigne: "POUR",
      csNotes: "",
      status: "EN_ATTENTE"
    },
    {
      id: "r08b",
      number: "08b",
      title: "Élection au Conseil Syndical : MME PIGOIS",
      description: "Élection de MME PIGOIS. Majorité de l'Article 25 ou à défaut article 25-1.",
      majorite: "Article 25 ou à défaut article 25-1",
      csConsigne: "POUR",
      csNotes: "",
      status: "EN_ATTENTE"
    },
    {
      id: "r08c",
      number: "08c",
      title: "Élection au Conseil Syndical : MME GUERRE",
      description: "Élection de MME GUERRE. Majorité de l'Article 25 ou à défaut article 25-1.",
      majorite: "Article 25 ou à défaut article 25-1",
      csConsigne: "POUR",
      csNotes: "",
      status: "EN_ATTENTE"
    },
    {
      id: "r08d",
      number: "08d",
      title: "Élection au Conseil Syndical : MME GARCIA",
      description: "Élection de MME GARCIA. Majorité de l'Article 25 ou à défaut article 25-1.",
      majorite: "Article 25 ou à défaut article 25-1",
      csConsigne: "POUR",
      csNotes: "",
      status: "EN_ATTENTE"
    },
    {
      id: "r08e",
      number: "08e",
      title: "Élection au Conseil Syndical : M. DUCHEZ",
      description: "Élection de M. DUCHEZ. Majorité de l'Article 25 ou à défaut article 25-1.",
      majorite: "Article 25 ou à défaut article 25-1",
      csConsigne: "POUR",
      csNotes: "",
      status: "EN_ATTENTE"
    },
    {
      id: "r08f",
      number: "08f",
      title: "Élection au Conseil Syndical : M. CASARI",
      description: "Élection de M. CASARI. Majorité de l'Article 25 ou à défaut article 25-1.",
      majorite: "Article 25 ou à défaut article 25-1",
      csConsigne: "POUR",
      csNotes: "",
      status: "EN_ATTENTE"
    },
    {
      id: "r08g",
      number: "08g",
      title: "Élection au Conseil Syndical : M. LOUIS",
      description: "Élection de M. LOUIS. Majorité de l'Article 25 ou à défaut article 25-1.",
      majorite: "Article 25 ou à défaut article 25-1",
      csConsigne: "POUR",
      csNotes: "",
      status: "EN_ATTENTE"
    },
    {
      id: "r08h",
      number: "08h",
      title: "Élection au Conseil Syndical : M. BEZY",
      description: "Élection de M. BEZY. Majorité de l'Article 25 ou à défaut article 25-1.",
      majorite: "Article 25 ou à défaut article 25-1",
      csConsigne: "POUR",
      csNotes: "",
      status: "EN_ATTENTE"
    },
    {
      id: "r08i",
      number: "08i",
      title: "Élection au Conseil Syndical : MME ARMONIA PESENTI",
      description: "Élection de MME ARMONIA PESENTI. Majorité de l'Article 25 ou à défaut article 25-1.",
      majorite: "Article 25 ou à défaut article 25-1",
      csConsigne: "POUR",
      csNotes: "",
      status: "EN_ATTENTE"
    },
    {
      id: "r08j",
      number: "08j",
      title: "Élection au Conseil Syndical : M. LEGRAND",
      description: "Élection de M. LEGRAND. Majorité de l'Article 25 ou à défaut article 25-1.",
      majorite: "Article 25 ou à défaut article 25-1",
      csConsigne: "POUR",
      csNotes: "",
      status: "EN_ATTENTE"
    },
    {
      id: "r08k",
      number: "08k",
      title: "Élection au Conseil Syndical : M. BONSIGNORE",
      description: "Élection de M. BONSIGNORE. Majorité de l'Article 25 ou à défaut article 25-1.",
      majorite: "Article 25 ou à défaut article 25-1",
      csConsigne: "POUR",
      csNotes: "",
      status: "EN_ATTENTE"
    },
    {
      id: "r08l",
      number: "08l",
      title: "Élection au Conseil Syndical : M. BRUN",
      description: "Élection de M. BRUN. Majorité de l'Article 25 ou à défaut article 25-1.",
      majorite: "Article 25 ou à défaut article 25-1",
      csConsigne: "POUR",
      csNotes: "",
      status: "EN_ATTENTE"
    },
    {
      id: "r08m",
      number: "08m",
      title: "Élection au Conseil Syndical : MME FANTINI",
      description: "Élection de MME FANTINI. Majorité de l'Article 25 ou à défaut article 25-1.",
      majorite: "Article 25 ou à défaut article 25-1",
      csConsigne: "POUR",
      csNotes: "",
      status: "EN_ATTENTE"
    },
    {
      id: "r08n",
      number: "08n",
      title: "Élection au Conseil Syndical : M. SUZET",
      description: "Élection de M. SUZET. Majorité de l'Article 25 ou à défaut article 25-1.",
      majorite: "Article 25 ou à défaut article 25-1",
      csConsigne: "POUR",
      csNotes: "",
      status: "EN_ATTENTE"
    },
    {
      id: "r09",
      number: "09",
      title: "Validation du cahier des charges pour l'installation de climatisations",
      description: "PJ : projet de cahier des charges.\nValidation du cahier des charges joint à la convocation pour l'installation de climatisations.\nMajorité de l'Article 25 ou à défaut article 25-1.",
      majorite: "Article 25 ou à défaut article 25-1",
      csConsigne: "POUR",
      csNotes: "Encadre l'esthétique et les règles techniques des climatiseurs privatifs.",
      status: "EN_ATTENTE"
    },
    {
      id: "r10",
      number: "10",
      title: "Décision quant à la mise en vente par adjudication du bien appartenant à PADRINES Jennifer",
      description: "Information générale sur les procédures en recouvrement.\nCette résolution est une information, elle n'appelle pas au vote.",
      majorite: "article sans vote",
      csConsigne: "LIBRE",
      csNotes: "Information préalable aux votes 10a, 10b, 10c.",
      status: "EN_ATTENTE"
    },
    {
      id: "r10a",
      number: "10a",
      title: "Saisie immobilière : montant des sommes estimées définitivement perdues",
      description: "Lots 456 et 363. Risque de sommes définitivement perdues évalué à 13 716,95 €.\nMajorité de l'Article 24.",
      majorite: "Article 24",
      csConsigne: "POUR",
      csNotes: "Nécessaire pour constater le montant de la créance irrécouvrable.",
      status: "EN_ATTENTE"
    },
    {
      id: "r10b",
      number: "10b",
      title: "Saisie immobilière : mise en vente des lots par adjudication",
      description: "L'assemblée générale décide de faire procéder à la saisie immobilière en vue de la vente des lots 456 et 363, et donne tous pouvoirs au syndic.\nMajorité de l'Article 24.",
      majorite: "Article 24",
      csConsigne: "POUR",
      csNotes: "Permet de recouvrer les charges impayées au bénéfice du syndicat.",
      status: "EN_ATTENTE"
    },
    {
      id: "r10c",
      number: "10c",
      title: "Saisie immobilière : montant de la mise à prix",
      description: "Fixe la mise à prix à un tiers de la valeur des biens, soit 42 000 €.\nSi défaut d'enchérisseur, le syndicat sera déclaré adjudicataire d'office.\nMajorité de l'Article 24.",
      majorite: "Article 24",
      csConsigne: "POUR",
      csNotes: "",
      status: "EN_ATTENTE"
    }
  ]
};
