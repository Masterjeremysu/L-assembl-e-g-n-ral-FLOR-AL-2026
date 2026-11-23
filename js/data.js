/**
 * Données de l'Assemblée Générale 2026 - RÉSIDENCE LE FLORÉAL
 * Convocation du 25 novembre 2026 à 18h00 - Sassenage
 * 282 Copropriétaires intégrés - Total officiel 100 000 tantièmes
 */

const STORAGE_KEY = 'AG_CS_VOTES_DATA_FLOREAL_2026_V2';

const DEFAULT_AG_DATA = {
  config: {
    coproName: "RÉSIDENCE LE FLORÉAL",
    address: "13-19 Rue du Moucherotte, 38360 Sassenage",
    agDate: "2026-11-25",
    agTime: "18h00",
    agLocation: "Salle Jacques Prévert, Rue du Moucherotte, 38360 Sassenage",
    syndic: "Citya Agence Henry",
    totalTantiemes: 100000,
    presentTantiemes: 0,
    pinCode: "2026"
  },

  // Journal d'Audit & Traçabilité CS ("Qui a fait quoi ?")
  auditLogs: [],

  // Codes PIN individuels par membre CS
  memberPins: {},

  // Membres du Conseil Syndical avec tantièmes et mandats réels
  members: [
  {
    "id": "m_suzet",
    "name": "M. SUZET Jérémy",
    "lots": "",
    "tantiemes": 802,
    "statut": "ACTIF",
    "mandats": "DI TOMMASO Giuseppina (360), PARRINELLO Frédéric / Virginie (417)",
    "mandatTantiemes": 777
  },
  {
    "id": "m_guerre",
    "name": "Mme GUERRE Sylvie & M. GUERRE Joël",
    "lots": "",
    "tantiemes": 461,
    "statut": "ACTIF",    "mandats": "AZIMI Galina (464), BRUN Robert (395), GARCIA F.-OSIOL F (409), GARCIA Rémy (88), KIBARDINA Anastasia (417), RUSSO Anna (427), VOILQUE (378)",
    "mandatTantiemes": 2578
  },
  {
    "id": "m_brun",
    "name": "M. BRUN Éric",
    "lots": "",
    "tantiemes": 478,
    "statut": "ACTIF",    "mandats": "BRUN Ludovic / Jennifer (441), FILECCIA V. (378), TRAJILOVIC Olga (413)",
    "mandatTantiemes": 1232
  },
  {
    "id": "m_casari",
    "name": "M. CASARI Jean-Paul",
    "lots": "",
    "tantiemes": 358,
    "statut": "ACTIF",    "mandats": "GOMEZ Corinne (436), KECK Joséphine (425)",
    "mandatTantiemes": 861
  },
  {
    "id": "m_armonia",
    "name": "M. & Mme ARMONIA Frédéric / Diane",
    "lots": "",
    "tantiemes": 415,
    "statut": "ACTIF",    "mandats": "BORGHIN Serge (417)",
    "mandatTantiemes": 417
  },
  {
    "id": "m_ganet",
    "name": "Mme GANET Chantal",
    "lots": "",
    "tantiemes": 464,
    "statut": "ACTIF",    "mandats": "",
    "mandatTantiemes": 0
  },
  {
    "id": "m_pigois",
    "name": "Mlle PIGOIS Véronique",
    "lots": "",
    "tantiemes": 363,
    "statut": "ACTIF",    "mandats": "",
    "mandatTantiemes": 0
  },
  {
    "id": "m_duchez",
    "name": "M. DUCHEZ & Mme DABOIN SOTO Kévin / Risobel",
    "lots": "",
    "tantiemes": 417,
    "statut": "DEMISSIONNAIRE",
    "dateDemission": "Démission en cours d'exercice",    "mandats": "",
    "mandatTantiemes": 0
  },
  {
    "id": "m_bezy",
    "name": "M. BEZY David",
    "lots": "",
    "tantiemes": 464,
    "statut": "ACTIF",    "mandats": "",
    "mandatTantiemes": 0
  },
  {
    "id": "m_bonsignore",
    "name": "M. BONSIGNORE Alexis",
    "lots": "",
    "tantiemes": 358,
    "statut": "ACTIF",    "mandats": "",
    "mandatTantiemes": 0
  },
  {
    "id": "m_courant",
    "name": "M. COURANT Daniel",
    "lots": "",
    "tantiemes": 466,
    "statut": "DEMISSIONNAIRE",
    "dateDemission": "Démission en cours d'exercice",    "mandats": "",
    "mandatTantiemes": 0
  },
  {
    "id": "m_legrand",
    "name": "M. LEGRAND David",
    "lots": "",
    "tantiemes": 432,
    "statut": "DEMISSIONNAIRE",
    "dateDemission": "Démission en cours d'exercice",    "mandats": "",
    "mandatTantiemes": 0
  },
  {
    "id": "m_louis",
    "name": "M. LOUIS Janick & Justin",
    "lots": "",
    "tantiemes": 439,
    "statut": "ACTIF",    "mandats": "",
    "mandatTantiemes": 0
  }
],

  // Registre des 259 copropriétaires et leurs pouvoirs
  coproprietaires: [
    {
      "id": "c_1",
      "nom": "AKKAS Coskun",
      "lots": "",
      "tantiemes": 378,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_2",
      "nom": "AKKAS Samet",
      "lots": "",
      "tantiemes": 459,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_3",
      "nom": "AMBROGIO",
      "lots": "",
      "tantiemes": 44,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_4",
      "nom": "ANTOINE Jeanine",
      "lots": "",
      "tantiemes": 417,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_5",
      "nom": "ARMONIA Frédéric / Diane",
      "lots": "",
      "tantiemes": 415,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_6",
      "nom": "ARNAUD Alain",
      "lots": "",
      "tantiemes": 356,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_7",
      "nom": "AUBREE Rémi",
      "lots": "",
      "tantiemes": 358,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_8",
      "nom": "AVELINE Céline",
      "lots": "",
      "tantiemes": 356,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_9",
      "nom": "AZIMI Galina",
      "lots": "",
      "tantiemes": 464,
      "categorie": "",
      "statut": "POUVOIR",
      "mandataire": "GUERRE Sylvie",
      "notes": "Représenté par CS (GUERRE Sylvie)"
    },
    {
      "id": "c_10",
      "nom": "BACCAVIN Michel",
      "lots": "",
      "tantiemes": 44,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_11",
      "nom": "BASSO Stéphane",
      "lots": "",
      "tantiemes": 476,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_12",
      "nom": "BAUM Patrick",
      "lots": "",
      "tantiemes": 44,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_13",
      "nom": "BELHABIB Abdel",
      "lots": "",
      "tantiemes": 360,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_14",
      "nom": "BELLIN Patrick",
      "lots": "",
      "tantiemes": 44,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_15",
      "nom": "BELOUD & MME PRAMPOLINI ABDELAL ET MANON",
      "lots": "",
      "tantiemes": 436,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_16",
      "nom": "BENAHCENE Brahim",
      "lots": "",
      "tantiemes": 723,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_17",
      "nom": "BENENATI Louis",
      "lots": "",
      "tantiemes": 405,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_18",
      "nom": "BERARDI Vito",
      "lots": "",
      "tantiemes": 407,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_19",
      "nom": "BERNARD Jeanine",
      "lots": "",
      "tantiemes": 422,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_20",
      "nom": "BERTHAUD Martine",
      "lots": "",
      "tantiemes": 439,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_21",
      "nom": "BEZY David",
      "lots": "",
      "tantiemes": 464,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_22",
      "nom": "BIASINI Georgette",
      "lots": "",
      "tantiemes": 375,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_23",
      "nom": "BIROCHEAU Joël / Annie",
      "lots": "",
      "tantiemes": 356,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_24",
      "nom": "BITON Raquel",
      "lots": "",
      "tantiemes": 480,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_25",
      "nom": "BITON Jules",
      "lots": "",
      "tantiemes": 420,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_26",
      "nom": "BONATO ET CELESTRI Florian et Patricia",
      "lots": "",
      "tantiemes": 413,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_27",
      "nom": "BONSIGNORE Alexis",
      "lots": "",
      "tantiemes": 358,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_28",
      "nom": "BORGHIN Serge",
      "lots": "",
      "tantiemes": 417,
      "categorie": "",
      "statut": "POUVOIR",
      "mandataire": "ARMONIA Diane",
      "notes": "Représenté par CS (ARMONIA Diane)"
    },
    {
      "id": "c_29",
      "nom": "BOUHMAR Aïcha",
      "lots": "",
      "tantiemes": 375,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_30",
      "nom": "BOULEGHLEM Samir",
      "lots": "",
      "tantiemes": 439,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_31",
      "nom": "BOULUD Andrée",
      "lots": "",
      "tantiemes": 463,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_32",
      "nom": "BOUMAIZA Sofien / Marie",
      "lots": "",
      "tantiemes": 378,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_33",
      "nom": "BRAIDA Xavier et Charlotte",
      "lots": "",
      "tantiemes": 434,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_34",
      "nom": "BREAN Morgane",
      "lots": "",
      "tantiemes": 376,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_35",
      "nom": "BRIFFOD Ludovic",
      "lots": "",
      "tantiemes": 358,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_36",
      "nom": "BRUN Éric",
      "lots": "",
      "tantiemes": 478,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_37",
      "nom": "BRUN Ludovic / Jennifer",
      "lots": "",
      "tantiemes": 436,
      "categorie": "",
      "statut": "POUVOIR",
      "mandataire": "BRUN Éric",
      "notes": "Représenté par CS (BRUN Éric)"
    },
    {
      "id": "c_38",
      "nom": "BRUN R. / CASANOVA T.",
      "lots": "",
      "tantiemes": 5,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_39",
      "nom": "BRUN Robert",
      "lots": "",
      "tantiemes": 417,
      "categorie": "",
      "statut": "POUVOIR",
      "mandataire": "GUERRE Sylvie",
      "notes": "Représenté par CS (GUERRE Sylvie)"
    },
    {
      "id": "c_40",
      "nom": "BUGNARD Philippe",
      "lots": "",
      "tantiemes": 44,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_41",
      "nom": "CALVELO VAZQUEZ Fernando",
      "lots": "",
      "tantiemes": 459,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_42",
      "nom": "CANTON Gilles",
      "lots": "",
      "tantiemes": 358,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_43",
      "nom": "CAPRARA Anthony",
      "lots": "",
      "tantiemes": 44,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_44",
      "nom": "CAPRON Yvette",
      "lots": "",
      "tantiemes": 176,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_45",
      "nom": "CARATINI Yves",
      "lots": "",
      "tantiemes": 44,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_46",
      "nom": "CARELLA E.",
      "lots": "",
      "tantiemes": 432,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_47",
      "nom": "CARNEL Mauricette",
      "lots": "",
      "tantiemes": 413,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_48",
      "nom": "CARUSO Julien",
      "lots": "",
      "tantiemes": 44,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_49",
      "nom": "CASARI Jean-Paul",
      "lots": "",
      "tantiemes": 380,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_50",
      "nom": "CHALET Josiane",
      "lots": "",
      "tantiemes": 409,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": "Ancien proprio (vendu 2026)"
    },
    {
      "id": "c_51",
      "nom": "CHANCEL Yvonne",
      "lots": "",
      "tantiemes": 360,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_52",
      "nom": "CHAPELIER Mickaël / Stéphanie",
      "lots": "",
      "tantiemes": 459,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_53",
      "nom": "CHAPPELET Alain",
      "lots": "",
      "tantiemes": 44,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_54",
      "nom": "CHAPPELET Stéphanie",
      "lots": "",
      "tantiemes": 417,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_55",
      "nom": "CHARDIN Bernard",
      "lots": "",
      "tantiemes": 427,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_56",
      "nom": "CHARRIN Noémie",
      "lots": "",
      "tantiemes": 360,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_57",
      "nom": "CHASTAING Landry",
      "lots": "",
      "tantiemes": 343,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_58",
      "nom": "CHATIOU Mohamed",
      "lots": "",
      "tantiemes": 363,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_59",
      "nom": "CHAVANCY / FERRANDO Philippe / Ingrid",
      "lots": "",
      "tantiemes": 434,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_60",
      "nom": "CHAVANCY Rudy",
      "lots": "",
      "tantiemes": 373,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_61",
      "nom": "CHETRY Laurent",
      "lots": "",
      "tantiemes": 420,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_62",
      "nom": "CHEVALME Florence",
      "lots": "",
      "tantiemes": 483,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_63",
      "nom": "CHIHI ET MME ABIDAT Saifeddine et Nawel",
      "lots": "",
      "tantiemes": 425,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_64",
      "nom": "CLARY Maud",
      "lots": "",
      "tantiemes": 363,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_65",
      "nom": "CLAVEL Marcel",
      "lots": "",
      "tantiemes": 356,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_66",
      "nom": "COLOTTO Nicaise",
      "lots": "",
      "tantiemes": 436,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_67",
      "nom": "CORBEL / MEDICI Chrystel / Sophie",
      "lots": "",
      "tantiemes": 360,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_68",
      "nom": "CORDEL Marc",
      "lots": "",
      "tantiemes": 415,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_69",
      "nom": "CORREIA MARIA FERNANDA",
      "lots": "",
      "tantiemes": 44,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_70",
      "nom": "CORRENOZ Florence",
      "lots": "",
      "tantiemes": 360,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_71",
      "nom": "CORRENOZ Marcel",
      "lots": "",
      "tantiemes": 415,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_72",
      "nom": "COSTE Jean-Claude",
      "lots": "",
      "tantiemes": 375,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_73",
      "nom": "COSTERG François",
      "lots": "",
      "tantiemes": 360,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_74",
      "nom": "COUDRY Émilie",
      "lots": "",
      "tantiemes": 363,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_75",
      "nom": "COURANT Daniel",
      "lots": "",
      "tantiemes": 466,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_76",
      "nom": "COUTAND David",
      "lots": "",
      "tantiemes": 420,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_77",
      "nom": "COYNEL Gilbert",
      "lots": "",
      "tantiemes": 417,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_78",
      "nom": "CRAPANZANO Angélo",
      "lots": "",
      "tantiemes": 422,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_79",
      "nom": "CRISPOLTI / PARADISO Mathilde / Julien",
      "lots": "",
      "tantiemes": 360,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_80",
      "nom": "CROCHON Jean-Louis",
      "lots": "",
      "tantiemes": 461,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_81",
      "nom": "CROIBIER MUSCAT Jean-Marie",
      "lots": "",
      "tantiemes": 444,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_82",
      "nom": "CULLIE ou CAMPS Francis ou Yvette",
      "lots": "",
      "tantiemes": 375,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_83",
      "nom": "CURCIO MONTESINOS Jean-Baptiste Kelly",
      "lots": "",
      "tantiemes": 356,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_84",
      "nom": "CUTILLAS Julien",
      "lots": "",
      "tantiemes": 402,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_85",
      "nom": "CUTILLAS Pascual",
      "lots": "",
      "tantiemes": 44,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_86",
      "nom": "DAIMO Danielle",
      "lots": "",
      "tantiemes": 363,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_87",
      "nom": "DARMAISIN Gérard",
      "lots": "",
      "tantiemes": 348,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_88",
      "nom": "DERBRE Michel",
      "lots": "",
      "tantiemes": 413,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_89",
      "nom": "DESBOIS Laurent / Pornpana",
      "lots": "",
      "tantiemes": 432,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_90",
      "nom": "DI CARO Roland",
      "lots": "",
      "tantiemes": 417,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_91",
      "nom": "DI TOMMASO Giuseppina",
      "lots": "",
      "tantiemes": 392,
      "categorie": "",
      "statut": "POUVOIR",
      "mandataire": "SUZET",
      "notes": "Représenté par CS (SUZET)"
    },
    {
      "id": "c_92",
      "nom": "DIKYUVA Dilek",
      "lots": "",
      "tantiemes": 415,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_93",
      "nom": "DOLFINI Franck",
      "lots": "",
      "tantiemes": 44,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_94",
      "nom": "DONAT-REVERDY Odette",
      "lots": "",
      "tantiemes": 44,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_95",
      "nom": "DONDEYNE Noëlle",
      "lots": "",
      "tantiemes": 436,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_96",
      "nom": "DUCHEZ & MME DABOIN SOTO Kévin et Risobel",
      "lots": "",
      "tantiemes": 434,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_97",
      "nom": "DUMAS David",
      "lots": "",
      "tantiemes": 44,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_98",
      "nom": "DUMETZ Bastien",
      "lots": "",
      "tantiemes": 358,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_99",
      "nom": "DUMKE GERACI Anaïs ou Philippe",
      "lots": "",
      "tantiemes": 363,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_100",
      "nom": "E.P.F.L. - D",
      "lots": "",
      "tantiemes": 425,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_101",
      "nom": "FENARD Bernadette",
      "lots": "",
      "tantiemes": 419,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_102",
      "nom": "FERNANDES JOAQUIM",
      "lots": "",
      "tantiemes": 408,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_103",
      "nom": "FERRERA Auguste",
      "lots": "",
      "tantiemes": 439,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_104",
      "nom": "FILECCIA V.",
      "lots": "",
      "tantiemes": 378,
      "categorie": "",
      "statut": "POUVOIR",
      "mandataire": "BRUN Éric",
      "notes": "Représenté par CS (BRUN Éric)"
    },
    {
      "id": "c_105",
      "nom": "FRAILE Victor",
      "lots": "",
      "tantiemes": 420,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_106",
      "nom": "FRAMINET ROGER",
      "lots": "",
      "tantiemes": 44,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_107",
      "nom": "FRANCOIS CLAUDINE",
      "lots": "",
      "tantiemes": 358,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_108",
      "nom": "GABUS Francisca",
      "lots": "",
      "tantiemes": 422,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_109",
      "nom": "GANET Chantal",
      "lots": "",
      "tantiemes": 464,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_110",
      "nom": "GARCIA F.-OSIOL F",
      "lots": "",
      "tantiemes": 409,
      "categorie": "",
      "statut": "POUVOIR",
      "mandataire": "GUERRE Sylvie",
      "notes": "Représenté par CS (GUERRE Sylvie)"
    },
    {
      "id": "c_111",
      "nom": "GARCIA Rémy",
      "lots": "",
      "tantiemes": 88,
      "categorie": "",
      "statut": "POUVOIR",
      "mandataire": "GUERRE Sylvie",
      "notes": "Représenté par CS (GUERRE Sylvie)"
    },
    {
      "id": "c_112",
      "nom": "GAUCH Claude",
      "lots": "",
      "tantiemes": 400,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_113",
      "nom": "GAUDE Julien",
      "lots": "",
      "tantiemes": 44,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_114",
      "nom": "GAUTHIER Jean-Paul",
      "lots": "",
      "tantiemes": 436,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_115",
      "nom": "GHANMI Souad",
      "lots": "",
      "tantiemes": 351,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_116",
      "nom": "GIBALDI Alfonso",
      "lots": "",
      "tantiemes": 392,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_117",
      "nom": "GIBALDI Antonino",
      "lots": "",
      "tantiemes": 422,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_118",
      "nom": "GIL ET SOLLAMI JOSE ET PATRICIA",
      "lots": "",
      "tantiemes": 402,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_119",
      "nom": "GINET Erwan",
      "lots": "",
      "tantiemes": 371,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_120",
      "nom": "GIOTTA Elisabeth",
      "lots": "",
      "tantiemes": 424,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_121",
      "nom": "GIRARD Laure",
      "lots": "",
      "tantiemes": 358,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_122",
      "nom": "GODFRIN Bernadette",
      "lots": "",
      "tantiemes": 378,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_123",
      "nom": "GOMEZ Corinne",
      "lots": "",
      "tantiemes": 436,
      "categorie": "",
      "statut": "POUVOIR",
      "mandataire": "CASARI Jean-Paul",
      "notes": "Représenté par CS (CASARI Jean-Paul)"
    },
    {
      "id": "c_124",
      "nom": "GOUDET Valentin",
      "lots": "",
      "tantiemes": 360,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_125",
      "nom": "GRAMMATICA Jeanne",
      "lots": "",
      "tantiemes": 419,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_126",
      "nom": "GRISOLET Patrick",
      "lots": "",
      "tantiemes": 44,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_127",
      "nom": "GROEN Jérôme",
      "lots": "",
      "tantiemes": 366,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_128",
      "nom": "GUERRE Joël",
      "lots": "",
      "tantiemes": 461,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_129",
      "nom": "GUILLET Michel",
      "lots": "",
      "tantiemes": 400,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_130",
      "nom": "HADJ SAID Mohamed",
      "lots": "",
      "tantiemes": 343,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_131",
      "nom": "HAFSAOUI Zahra",
      "lots": "",
      "tantiemes": 415,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_132",
      "nom": "HEULINE Daniel / Véronique",
      "lots": "",
      "tantiemes": 417,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_133",
      "nom": "HUGON Francis",
      "lots": "",
      "tantiemes": 44,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_134",
      "nom": "IMBAULT-HUART Nathalie GX",
      "lots": "",
      "tantiemes": 419,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_135",
      "nom": "IZZO S.",
      "lots": "",
      "tantiemes": 464,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_136",
      "nom": "JARRAND-ALLIER / RICHTER Olivier / Audrey",
      "lots": "",
      "tantiemes": 436,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_137",
      "nom": "JEANSELME Frédéric",
      "lots": "0455",
      "tantiemes": 415,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_138",
      "nom": "JEANSELME Pierre",
      "lots": "",
      "tantiemes": 44,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_139",
      "nom": "JONAS Raymonde",
      "lots": "",
      "tantiemes": 44,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_140",
      "nom": "JULLIEN Franck",
      "lots": "",
      "tantiemes": 461,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_141",
      "nom": "KECK Joséphine",
      "lots": "",
      "tantiemes": 425,
      "categorie": "",
      "statut": "POUVOIR",
      "mandataire": "CASARI Jean-Paul",
      "notes": "Représenté par CS (CASARI Jean-Paul)"
    },
    {
      "id": "c_142",
      "nom": "KERNEVEZ",
      "lots": "",
      "tantiemes": 44,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_143",
      "nom": "KERNOU Fodil ou Nadira",
      "lots": "",
      "tantiemes": 436,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_144",
      "nom": "KHALFI Rachid / Amel",
      "lots": "",
      "tantiemes": 415,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_145",
      "nom": "KIBARDINA Anastasia",
      "lots": "",
      "tantiemes": 417,
      "categorie": "",
      "statut": "POUVOIR",
      "mandataire": "GUERRE Sylvie",
      "notes": "Représenté par CS (GUERRE Sylvie)"
    },
    {
      "id": "c_146",
      "nom": "KNEUSS Oria",
      "lots": "",
      "tantiemes": 373,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_147",
      "nom": "LA BOMBARDIERE (Mme MOREL Domi)",
      "lots": "",
      "tantiemes": 371,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_148",
      "nom": "LA GRECA Antonio",
      "lots": "",
      "tantiemes": 363,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_149",
      "nom": "LA LOGGIA Nunzia",
      "lots": "",
      "tantiemes": 375,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_150",
      "nom": "LAARIBIA Sid Ahmed",
      "lots": "",
      "tantiemes": 425,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_151",
      "nom": "LACAGNINA Geneviève",
      "lots": "",
      "tantiemes": 420,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_152",
      "nom": "LACAGNINA Lucia ou Concettina",
      "lots": "",
      "tantiemes": 405,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_153",
      "nom": "LACAGNINA Maurice G",
      "lots": "",
      "tantiemes": 371,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_154",
      "nom": "LACHGUER Ahmed",
      "lots": "",
      "tantiemes": 405,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_155",
      "nom": "LANVIN Nicolas",
      "lots": "",
      "tantiemes": 478,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_156",
      "nom": "LARDENOIS-ROBERT François-Louis",
      "lots": "",
      "tantiemes": 434,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_157",
      "nom": "LARGIER Serge et Aline",
      "lots": "",
      "tantiemes": 452,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_158",
      "nom": "LAROCHE René / Martine",
      "lots": "",
      "tantiemes": 375,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_159",
      "nom": "LAUREL Marie-Christine",
      "lots": "",
      "tantiemes": 425,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_160",
      "nom": "LAVERGNE Muriel",
      "lots": "",
      "tantiemes": 461,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_161",
      "nom": "LE FLOREAL CONCIERGERIE",
      "lots": "",
      "tantiemes": 407,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_162",
      "nom": "LE GAL Armand",
      "lots": "",
      "tantiemes": 363,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_163",
      "nom": "LEGRAND David",
      "lots": "",
      "tantiemes": 432,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_164",
      "nom": "LENOBLE Brigitte",
      "lots": "",
      "tantiemes": 44,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_165",
      "nom": "LEONE & MME GABUS Noel & Audrey",
      "lots": "",
      "tantiemes": 371,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_166",
      "nom": "LIAS Frédérique",
      "lots": "",
      "tantiemes": 420,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_167",
      "nom": "LO MONACO Christian",
      "lots": "",
      "tantiemes": 436,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_168",
      "nom": "LORINQUER J. OU RUIZ S.",
      "lots": "",
      "tantiemes": 44,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_169",
      "nom": "LOUIS Janick",
      "lots": "",
      "tantiemes": 439,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_170",
      "nom": "LOUIS Justin",
      "lots": "",
      "tantiemes": 363,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_171",
      "nom": "LUENGO Martine",
      "lots": "",
      "tantiemes": 439,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_172",
      "nom": "MARTINET Robert",
      "lots": "",
      "tantiemes": 363,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_173",
      "nom": "MAS Claude",
      "lots": "",
      "tantiemes": 404,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_174",
      "nom": "MAS Elodie",
      "lots": "",
      "tantiemes": 348,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_175",
      "nom": "MASCIAVE Louis",
      "lots": "",
      "tantiemes": 478,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_176",
      "nom": "MAUGIRONT Philippe",
      "lots": "",
      "tantiemes": 363,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_177",
      "nom": "MAZZOLENI Bertrand",
      "lots": "",
      "tantiemes": 480,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_178",
      "nom": "MELO & MME MANKA Mathieu et Laetitia",
      "lots": "",
      "tantiemes": 356,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_179",
      "nom": "MERITTO Kévin",
      "lots": "",
      "tantiemes": 413,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_180",
      "nom": "MESSINA S. & MME SAILLIER Stéphanie",
      "lots": "",
      "tantiemes": 434,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_181",
      "nom": "MEURANT David",
      "lots": "",
      "tantiemes": 420,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_182",
      "nom": "MINIAC Michèle",
      "lots": "",
      "tantiemes": 44,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_183",
      "nom": "MONACHINO-CALABRO Sandrine",
      "lots": "",
      "tantiemes": 478,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_184",
      "nom": "MONDINI Bernard",
      "lots": "",
      "tantiemes": 461,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_185",
      "nom": "MOREAU Alain",
      "lots": "",
      "tantiemes": 420,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_186",
      "nom": "MORIN Gisèle",
      "lots": "",
      "tantiemes": 422,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_187",
      "nom": "MORO Didier",
      "lots": "",
      "tantiemes": 478,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_188",
      "nom": "NAFFATI Samir / Inchirah",
      "lots": "",
      "tantiemes": 469,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_189",
      "nom": "NICOUD Colette",
      "lots": "",
      "tantiemes": 417,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_190",
      "nom": "NOVAT & MME LIOTIER Lionel et Christelle",
      "lots": "",
      "tantiemes": 461,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_191",
      "nom": "OSMANOVIC Midhet",
      "lots": "",
      "tantiemes": 405,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_192",
      "nom": "PADRINES Jennifer",
      "lots": "",
      "tantiemes": 358,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_193",
      "nom": "PAPIN ET MME VERVISCH REMY ET PATRICIA",
      "lots": "",
      "tantiemes": 415,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_194",
      "nom": "PARRINELLO Frédéric / Virginie",
      "lots": "",
      "tantiemes": 417,
      "categorie": "",
      "statut": "POUVOIR",
      "mandataire": "SUZET",
      "notes": "Représenté par CS (SUZET)"
    },
    {
      "id": "c_195",
      "nom": "PEIS Patrice",
      "lots": "",
      "tantiemes": 5,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_196",
      "nom": "PEREIRA LEONARDA",
      "lots": "",
      "tantiemes": 371,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_197",
      "nom": "PERLI Eric",
      "lots": "",
      "tantiemes": 439,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_198",
      "nom": "PERONNET Jessica",
      "lots": "",
      "tantiemes": 363,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_199",
      "nom": "PICCARRETA",
      "lots": "",
      "tantiemes": 402,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_200",
      "nom": "PIGOIS Véronique",
      "lots": "",
      "tantiemes": 363,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_201",
      "nom": "POCARD Daniel",
      "lots": "",
      "tantiemes": 404,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_202",
      "nom": "PORCHIER Bernard",
      "lots": "",
      "tantiemes": 44,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_203",
      "nom": "PRESTI Lillo",
      "lots": "",
      "tantiemes": 449,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_204",
      "nom": "QUERCIA Rose",
      "lots": "",
      "tantiemes": 432,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_205",
      "nom": "REPENTIN André",
      "lots": "",
      "tantiemes": 419,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_206",
      "nom": "REYNARD Elisabeth",
      "lots": "",
      "tantiemes": 410,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_207",
      "nom": "RISSO Jean-Marc",
      "lots": "",
      "tantiemes": 373,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_208",
      "nom": "RIVAS Evelyne / Didier",
      "lots": "",
      "tantiemes": 457,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_209",
      "nom": "RODRIGUES DE OLIVEIRA Daniel / Arminda",
      "lots": "",
      "tantiemes": 452,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_210",
      "nom": "RODRIGUES Narcisse",
      "lots": "",
      "tantiemes": 44,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_211",
      "nom": "ROUX Corine",
      "lots": "",
      "tantiemes": 44,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_212",
      "nom": "ROUX Estelle",
      "lots": "",
      "tantiemes": 44,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_213",
      "nom": "ROUX Michel",
      "lots": "",
      "tantiemes": 402,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_214",
      "nom": "ROYBON Grégoire",
      "lots": "",
      "tantiemes": 420,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_215",
      "nom": "RUDD Caixia",
      "lots": "",
      "tantiemes": 378,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_216",
      "nom": "RUSSO Anna",
      "lots": "",
      "tantiemes": 427,
      "categorie": "",
      "statut": "POUVOIR",
      "mandataire": "GUERRE Sylvie",
      "notes": "Représenté par CS (GUERRE Sylvie)"
    },
    {
      "id": "c_217",
      "nom": "RUSSO Thibaut",
      "lots": "",
      "tantiemes": 351,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_218",
      "nom": "SALERNO Indivision",
      "lots": "",
      "tantiemes": 410,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_219",
      "nom": "SANAA Hakim",
      "lots": "",
      "tantiemes": 436,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_220",
      "nom": "SANDRO",
      "lots": "",
      "tantiemes": 44,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_221",
      "nom": "SAUVENT Philippe et Joëlle",
      "lots": "",
      "tantiemes": 459,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_222",
      "nom": "SCANNELLA Pascal",
      "lots": "",
      "tantiemes": 432,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_223",
      "nom": "SCHRAMMEK & DUGLUE Julien et Morgane",
      "lots": "",
      "tantiemes": 417,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_224",
      "nom": "SELEK Martine",
      "lots": "",
      "tantiemes": 549,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_225",
      "nom": "SEOUD Nabil",
      "lots": "",
      "tantiemes": 464,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": "Ancien proprio (vendu 2026)"
    },
    {
      "id": "c_226",
      "nom": "SERAPHIN Gilles",
      "lots": "",
      "tantiemes": 417,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_227",
      "nom": "SESTIER Hubert",
      "lots": "",
      "tantiemes": 420,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_228",
      "nom": "SIBUE David",
      "lots": "",
      "tantiemes": 375,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_229",
      "nom": "SICIGNANO / ABREUX Sandra et Fabrizio",
      "lots": "",
      "tantiemes": 439,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_230",
      "nom": "SIERRA Indivision",
      "lots": "",
      "tantiemes": 476,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_231",
      "nom": "SILVAGNI Alain",
      "lots": "",
      "tantiemes": 405,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_232",
      "nom": "SILVESTRI Renato / Dominique",
      "lots": "",
      "tantiemes": 44,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_233",
      "nom": "SIMONETTI Emmanuel",
      "lots": "",
      "tantiemes": 476,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_234",
      "nom": "SOLITRO Hélène",
      "lots": "",
      "tantiemes": 407,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_235",
      "nom": "SOUSA RODRIGUES Narciso",
      "lots": "",
      "tantiemes": 409,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_236",
      "nom": "STOCLET David",
      "lots": "",
      "tantiemes": 434,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_237",
      "nom": "SUZET & MME FALCON Jérémy et Laura",
      "lots": "",
      "tantiemes": 802,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_238",
      "nom": "TARDY Pascal",
      "lots": "",
      "tantiemes": 348,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_239",
      "nom": "TARRICONE V. - SOARES J.",
      "lots": "",
      "tantiemes": 439,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_240",
      "nom": "TASKIN Haci / Serap",
      "lots": "",
      "tantiemes": 375,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_241",
      "nom": "TINCHON Jean-Loup",
      "lots": "",
      "tantiemes": 459,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_242",
      "nom": "TISSEYRE André",
      "lots": "",
      "tantiemes": 478,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_243",
      "nom": "TOMAS CAMBERO Antonio",
      "lots": "",
      "tantiemes": 365,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_244",
      "nom": "TOMASINO",
      "lots": "",
      "tantiemes": 464,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_245",
      "nom": "TRAJILOVIC Olga",
      "lots": "",
      "tantiemes": 413,
      "categorie": "",
      "statut": "POUVOIR",
      "mandataire": "BRUN Éric",
      "notes": "Représenté par CS (BRUN Éric)"
    },
    {
      "id": "c_246",
      "nom": "TRAPANI Felicia",
      "lots": "",
      "tantiemes": 413,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_247",
      "nom": "TREILLARD P.",
      "lots": "",
      "tantiemes": 400,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_248",
      "nom": "TRIBOULAT Frédéric / Virginie",
      "lots": "",
      "tantiemes": 417,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_249",
      "nom": "TRICOLI Indivision",
      "lots": "",
      "tantiemes": 425,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_250",
      "nom": "TRICOLI Luigi",
      "lots": "",
      "tantiemes": 363,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_251",
      "nom": "TRICOLI Luigina",
      "lots": "",
      "tantiemes": 44,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_252",
      "nom": "TROITSKY Gérald",
      "lots": "",
      "tantiemes": 461,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_253",
      "nom": "UN TOIT POUR TOUS DEV",
      "lots": "",
      "tantiemes": 2098,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_254",
      "nom": "VALLIER Frédéric / Virginie",
      "lots": "",
      "tantiemes": 408,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_255",
      "nom": "VARESANO Angèle & Corinne",
      "lots": "",
      "tantiemes": 351,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": "Ancien proprio (vendu 2026)"
    },
    {
      "id": "c_256",
      "nom": "VOILQUE",
      "lots": "",
      "tantiemes": 378,
      "categorie": "",
      "statut": "POUVOIR",
      "mandataire": "GUERRE Sylvie",
      "notes": "Représenté par CS (GUERRE Sylvie)"
    },
    {
      "id": "c_257",
      "nom": "ZANCO Florence",
      "lots": "",
      "tantiemes": 375,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_258",
      "nom": "ZARO Amandine",
      "lots": "",
      "tantiemes": 432,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_259",
      "nom": "ZEFI / SERGENT Agim / Alexandra",
      "lots": "",
      "tantiemes": 378,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_260",
      "nom": "ESPOSITO Michel",
      "lots": "0208",
      "tantiemes": 363,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_261",
      "nom": "EVRARD Philippe / Hélène",
      "lots": "Garage",
      "tantiemes": 44,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_262",
      "nom": "FALLETTA / GUELI Angelo / Sonia",
      "lots": "0348",
      "tantiemes": 360,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_263",
      "nom": "FANTINI",
      "lots": "0192",
      "tantiemes": 351,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": "Candidate CS (Rés. 08m)"
    },
    {
      "id": "c_264",
      "nom": "FAURE Francis",
      "lots": "0334",
      "tantiemes": 373,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_265",
      "nom": "FELAHI Brahim",
      "lots": "0099",
      "tantiemes": 373,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_266",
      "nom": "MACABET Martine",
      "lots": "Garage",
      "tantiemes": 44,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_267",
      "nom": "MAIRA",
      "lots": "0195",
      "tantiemes": 413,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_268",
      "nom": "MANGIONE Savino",
      "lots": "Garage",
      "tantiemes": 44,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_269",
      "nom": "MANIN A.-CROCHARD",
      "lots": "Garage",
      "tantiemes": 44,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_270",
      "nom": "MARCHANDEAU Christine",
      "lots": "0354",
      "tantiemes": 480,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_271",
      "nom": "MARLETAZ Joëlle",
      "lots": "0342",
      "tantiemes": 378,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_272",
      "nom": "MARTIN FRICHEMANN Catherine",
      "lots": "0222",
      "tantiemes": 373,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_273",
      "nom": "MESSINA Rocco",
      "lots": "0432",
      "tantiemes": 348,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": ""
    },
    {
      "id": "c_274",
      "nom": "DUGLUE Morgane",
      "lots": "Parking",
      "tantiemes": 5,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": "Compte séparé parking (0513)"
    },
    {
      "id": "c_275",
      "nom": "BRETON Léo",
      "lots": "0076",
      "tantiemes": 0,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": "Nouveau 2026 (0518) - tantièmes à vérifier sur feuille présence"
    },
    {
      "id": "c_276",
      "nom": "DIMAND Quentin",
      "lots": "0196",
      "tantiemes": 0,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": "Nouveau 2026 (0517) - tantièmes à vérifier sur feuille présence"
    },
    {
      "id": "c_277",
      "nom": "HEULINE ET MANCEAU Damien et Marie-Amélie",
      "lots": "0323",
      "tantiemes": 0,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": "Nouveau 2026 (0516) - tantièmes à vérifier sur feuille présence"
    },
    {
      "id": "c_278",
      "nom": "JEMILI",
      "lots": "0211",
      "tantiemes": 0,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": "Nouveau 2026 (0514) - tantièmes à vérifier sur feuille présence"
    },
    {
      "id": "c_279",
      "nom": "JERIDI Rime",
      "lots": "0421",
      "tantiemes": 0,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": "Actif 2026 (0310) - tantièmes à vérifier sur feuille présence"
    },
    {
      "id": "c_280",
      "nom": "LAFASCIANO et Mme MASCIAVE Franck",
      "lots": "0353",
      "tantiemes": 0,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": "Nouveau 2026 (0512) - tantièmes à vérifier sur feuille présence"
    },
    {
      "id": "c_281",
      "nom": "OUATTARA Kader et Maelys",
      "lots": "0426",
      "tantiemes": 0,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": "Nouveau 2026 (0515) - tantièmes à vérifier sur feuille présence"
    },
    {
      "id": "c_282",
      "nom": "SANCHEZ Corinne",
      "lots": "0320",
      "tantiemes": 0,
      "categorie": "",
      "statut": "ABSENT",
      "mandataire": "",
      "notes": "Actif 2026 (0238) - tantièmes à vérifier sur feuille présence"
    }
  ]
};
