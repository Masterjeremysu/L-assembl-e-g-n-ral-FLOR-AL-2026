/**
 * Données de l'Assemblée Générale 2026 - RÉSIDENCE LE FLORÉAL
 * Convocation du 25 novembre 2026 à 18h00 - Sassenage
 * 259 Copropriétaires intégrés - Total 97 478 tantièmes
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
    totalTantiemes: 97478,
    presentTantiemes: 0
  },

  // Membres du Conseil Syndical avec tantièmes et mandats réels
  members: [
  {
    "id": "m_suzet",
    "name": "M. SUZET Jérémy & Mme FALCON Laura",
    "lots": "",
    "tantiemes": 802,
    "mandats": "DI TOMMASO Giuseppina (360), PARRINELLO Frédéric / Virginie (417)",
    "mandatTantiemes": 777
  },
  {
    "id": "m_guerre",
    "name": "Mme GUERRE Sylvie & M. GUERRE Joël",
    "lots": "",
    "tantiemes": 461,
    "mandats": "AZIMI Galina (464), BRUN Robert (395), GARCIA F.-OSIOL F (409), GARCIA Rémy (88), KIBARDINA Anastasia (417), RUSSO Anna (427), VOILQUE (378)",
    "mandatTantiemes": 2578
  },
  {
    "id": "m_brun",
    "name": "M. BRUN Éric",
    "lots": "",
    "tantiemes": 478,
    "mandats": "BRUN Ludovic / Jennifer (441), FILECCIA V. (378), TRAJILOVIC Olga (413)",
    "mandatTantiemes": 1232
  },
  {
    "id": "m_casari",
    "name": "M. CASARI Jean-Paul",
    "lots": "",
    "tantiemes": 358,
    "mandats": "GOMEZ Corinne (436), KECK Joséphine (425)",
    "mandatTantiemes": 861
  },
  {
    "id": "m_armonia",
    "name": "M. & Mme ARMONIA Frédéric / Diane",
    "lots": "",
    "tantiemes": 415,
    "mandats": "BORGHIN Serge (417)",
    "mandatTantiemes": 417
  },
  {
    "id": "m_ganet",
    "name": "Mme GANET Chantal",
    "lots": "",
    "tantiemes": 464,
    "mandats": "",
    "mandatTantiemes": 0
  },
  {
    "id": "m_pigois",
    "name": "Mlle PIGOIS Véronique",
    "lots": "",
    "tantiemes": 363,
    "mandats": "",
    "mandatTantiemes": 0
  },
  {
    "id": "m_duchez",
    "name": "M. DUCHEZ & Mme DABOIN SOTO Kévin / Risobel",
    "lots": "",
    "tantiemes": 417,
    "mandats": "",
    "mandatTantiemes": 0
  },
  {
    "id": "m_bezy",
    "name": "M. BEZY David",
    "lots": "",
    "tantiemes": 464,
    "mandats": "",
    "mandatTantiemes": 0
  },
  {
    "id": "m_bonsignore",
    "name": "M. BONSIGNORE Alexis",
    "lots": "",
    "tantiemes": 358,
    "mandats": "",
    "mandatTantiemes": 0
  },
  {
    "id": "m_courant",
    "name": "M. COURANT Daniel",
    "lots": "",
    "tantiemes": 466,
    "mandats": "",
    "mandatTantiemes": 0
  },
  {
    "id": "m_legrand",
    "name": "M. LEGRAND David",
    "lots": "",
    "tantiemes": 432,
    "mandats": "",
    "mandatTantiemes": 0
  },
  {
    "id": "m_louis",
    "name": "M. LOUIS Janick & Justin",
    "lots": "",
    "tantiemes": 439,
    "mandats": "",
    "mandatTantiemes": 0
  },
  {
    "id": "m_fantini",
    "name": "Mme FANTINI",
    "lots": "",
    "tantiemes": 0,
    "mandats": "",
    "mandatTantiemes": 0
  }
],

  // Registre des 259 copropriétaires et leurs pouvoirs
  coproprietaires: [
  {
    "id": "c_1",
    "nom": "AKKAS Costun",
    "lots": "",
    "tantiemes": 378,
    "categorie": "Standard",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "Standard"
  },
  {
    "id": "c_2",
    "nom": "AKKAS Samet",
    "lots": "",
    "tantiemes": 459,
    "categorie": "🔥 Top 20%",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "🔥 Top 20%"
  },
  {
    "id": "c_3",
    "nom": "AMBROGIO",
    "lots": "",
    "tantiemes": 44,
    "categorie": "Standard",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "Standard"
  },
  {
    "id": "c_4",
    "nom": "ANTOINE Jeanine",
    "lots": "",
    "tantiemes": 417,
    "categorie": "Standard",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "Standard"
  },
  {
    "id": "c_5",
    "nom": "ARMONIA Frédéric / Diane",
    "lots": "",
    "tantiemes": 415,
    "categorie": "Standard",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "Standard"
  },
  {
    "id": "c_6",
    "nom": "ARNAUD Alain",
    "lots": "",
    "tantiemes": 356,
    "categorie": "Standard",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "Standard"
  },
  {
    "id": "c_7",
    "nom": "AUBREE Rémi",
    "lots": "",
    "tantiemes": 358,
    "categorie": "Standard",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "Standard"
  },
  {
    "id": "c_8",
    "nom": "AVELINE Céline",
    "lots": "",
    "tantiemes": 356,
    "categorie": "Standard",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "Standard"
  },
  {
    "id": "c_9",
    "nom": "AZIMI Galina",
    "lots": "",
    "tantiemes": 464,
    "categorie": "🔥 Top 20%",
    "statut": "POUVOIR",
    "mandataire": "GUERRE Sylvie",
    "notes": "🔥 Top 20% | Représenté par CS (GUERRE Sylvie)"
  },
  {
    "id": "c_10",
    "nom": "BACCAVIN Michel",
    "lots": "",
    "tantiemes": 44,
    "categorie": "Standard",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "Standard"
  },
  {
    "id": "c_11",
    "nom": "BASSO Stéphane",
    "lots": "",
    "tantiemes": 476,
    "categorie": "🔥 Top 20%",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "🔥 Top 20%"
  },
  {
    "id": "c_12",
    "nom": "BAUM Patrick",
    "lots": "",
    "tantiemes": 44,
    "categorie": "Standard",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "Standard"
  },
  {
    "id": "c_13",
    "nom": "BELHABIB Abdel",
    "lots": "",
    "tantiemes": 360,
    "categorie": "Standard",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "Standard"
  },
  {
    "id": "c_14",
    "nom": "BELLIN Patrick",
    "lots": "",
    "tantiemes": 44,
    "categorie": "Standard",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "Standard"
  },
  {
    "id": "c_15",
    "nom": "BELOUD & MME PRAMPOLINI ABDELAL ET MANON",
    "lots": "",
    "tantiemes": 436,
    "categorie": "🔥 Top 20%",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "🔥 Top 20%"
  },
  {
    "id": "c_16",
    "nom": "BENAHCENE Brahim",
    "lots": "",
    "tantiemes": 723,
    "categorie": "🔥 Top 20%",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "🔥 Top 20%"
  },
  {
    "id": "c_17",
    "nom": "BENENATI Louis",
    "lots": "",
    "tantiemes": 405,
    "categorie": "Standard",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "Standard"
  },
  {
    "id": "c_18",
    "nom": "BERARDI Vito",
    "lots": "",
    "tantiemes": 407,
    "categorie": "Standard",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "Standard"
  },
  {
    "id": "c_19",
    "nom": "BERNARD Jeanine",
    "lots": "",
    "tantiemes": 422,
    "categorie": "Standard",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "Standard"
  },
  {
    "id": "c_20",
    "nom": "BERTHAUD Martine",
    "lots": "",
    "tantiemes": 439,
    "categorie": "🔥 Top 20%",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "🔥 Top 20%"
  },
  {
    "id": "c_21",
    "nom": "BEZY David",
    "lots": "",
    "tantiemes": 464,
    "categorie": "🔥 Top 20%",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "🔥 Top 20%"
  },
  {
    "id": "c_22",
    "nom": "BIASINI Georgette",
    "lots": "",
    "tantiemes": 375,
    "categorie": "Standard",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "Standard"
  },
  {
    "id": "c_23",
    "nom": "BIROCHEAU Joël / Annie",
    "lots": "",
    "tantiemes": 356,
    "categorie": "Standard",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "Standard"
  },
  {
    "id": "c_24",
    "nom": "BITON Raquel",
    "lots": "",
    "tantiemes": 480,
    "categorie": "🔥 Top 20%",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "🔥 Top 20%"
  },
  {
    "id": "c_25",
    "nom": "BITON Jules",
    "lots": "",
    "tantiemes": 420,
    "categorie": "Standard",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "Standard"
  },
  {
    "id": "c_26",
    "nom": "BONATO ET CELESTRI Florian et Patricia",
    "lots": "",
    "tantiemes": 413,
    "categorie": "Standard",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "Standard"
  },
  {
    "id": "c_27",
    "nom": "BONSIGNORE Alexis",
    "lots": "",
    "tantiemes": 358,
    "categorie": "Standard",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "Standard"
  },
  {
    "id": "c_28",
    "nom": "BORGHIN Serge",
    "lots": "",
    "tantiemes": 417,
    "categorie": "Standard",
    "statut": "POUVOIR",
    "mandataire": "ARMONIA Diane",
    "notes": "Standard | Représenté par CS (ARMONIA Diane)"
  },
  {
    "id": "c_29",
    "nom": "BOUHMAR Aïcha",
    "lots": "",
    "tantiemes": 375,
    "categorie": "Standard",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "Standard"
  },
  {
    "id": "c_30",
    "nom": "BOULEGHLEM Samir",
    "lots": "",
    "tantiemes": 439,
    "categorie": "🔥 Top 20%",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "🔥 Top 20%"
  },
  {
    "id": "c_31",
    "nom": "BOULUD Andrée",
    "lots": "",
    "tantiemes": 463,
    "categorie": "🔥 Top 20%",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "🔥 Top 20%"
  },
  {
    "id": "c_32",
    "nom": "BOUMAIZA Sofien / Marie",
    "lots": "",
    "tantiemes": 378,
    "categorie": "Standard",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "Standard"
  },
  {
    "id": "c_33",
    "nom": "BRAIDA Xavier et Charlotte",
    "lots": "",
    "tantiemes": 434,
    "categorie": "Standard",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "Standard"
  },
  {
    "id": "c_34",
    "nom": "BREAN Morgane",
    "lots": "",
    "tantiemes": 400,
    "categorie": "Standard",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "Standard"
  },
  {
    "id": "c_35",
    "nom": "BRIFFOD Ludovic",
    "lots": "",
    "tantiemes": 407,
    "categorie": "Standard",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "Standard"
  },
  {
    "id": "c_36",
    "nom": "BRUN Éric",
    "lots": "",
    "tantiemes": 478,
    "categorie": "🔥 Top 20%",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "🔥 Top 20%"
  },
  {
    "id": "c_37",
    "nom": "BRUN Ludovic / Jennifer",
    "lots": "",
    "tantiemes": 441,
    "categorie": "🔥 Top 20%",
    "statut": "POUVOIR",
    "mandataire": "BRUN Éric",
    "notes": "🔥 Top 20% | Représenté par CS (BRUN Éric)"
  },
  {
    "id": "c_38",
    "nom": "BRUN R. / CASANOVA T.",
    "lots": "",
    "tantiemes": 44,
    "categorie": "Standard",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "Standard"
  },
  {
    "id": "c_39",
    "nom": "BRUN Robert",
    "lots": "",
    "tantiemes": 395,
    "categorie": "Standard",
    "statut": "POUVOIR",
    "mandataire": "GUERRE Sylvie",
    "notes": "Standard | Représenté par CS (GUERRE Sylvie)"
  },
  {
    "id": "c_40",
    "nom": "BUGNARD Philippe",
    "lots": "",
    "tantiemes": 44,
    "categorie": "Standard",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "Standard"
  },
  {
    "id": "c_41",
    "nom": "CALVELO VAZQUEZ Fernando",
    "lots": "",
    "tantiemes": 436,
    "categorie": "🔥 Top 20%",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "🔥 Top 20%"
  },
  {
    "id": "c_42",
    "nom": "CANTON Gilles",
    "lots": "",
    "tantiemes": 422,
    "categorie": "Standard",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "Standard"
  },
  {
    "id": "c_43",
    "nom": "CAPRARA Anthony",
    "lots": "",
    "tantiemes": 409,
    "categorie": "Standard",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "Standard"
  },
  {
    "id": "c_44",
    "nom": "CAPRON Yvette",
    "lots": "",
    "tantiemes": 360,
    "categorie": "Standard",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "Standard"
  },
  {
    "id": "c_45",
    "nom": "CARATINI Yves",
    "lots": "",
    "tantiemes": 380,
    "categorie": "Standard",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "Standard"
  },
  {
    "id": "c_46",
    "nom": "CARELLA E.",
    "lots": "",
    "tantiemes": 409,
    "categorie": "Standard",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "Standard"
  },
  {
    "id": "c_47",
    "nom": "CARNEL Mauricette",
    "lots": "",
    "tantiemes": 360,
    "categorie": "Standard",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "Standard"
  },
  {
    "id": "c_48",
    "nom": "CARUSO Julien",
    "lots": "",
    "tantiemes": 376,
    "categorie": "Standard",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "Standard"
  },
  {
    "id": "c_49",
    "nom": "CASARI Jean-Paul",
    "lots": "",
    "tantiemes": 358,
    "categorie": "Standard",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "Standard"
  },
  {
    "id": "c_50",
    "nom": "CHALET Josiane",
    "lots": "",
    "tantiemes": 478,
    "categorie": "🔥 Top 20%",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "🔥 Top 20%"
  },
  {
    "id": "c_51",
    "nom": "CHANGEL Yvonne",
    "lots": "",
    "tantiemes": 436,
    "categorie": "🔥 Top 20%",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "🔥 Top 20%"
  },
  {
    "id": "c_52",
    "nom": "CHAPELIER Mickaël / Stéphanie",
    "lots": "",
    "tantiemes": 459,
    "categorie": "🔥 Top 20%",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "🔥 Top 20%"
  },
  {
    "id": "c_53",
    "nom": "CHAPPELET Alain",
    "lots": "",
    "tantiemes": 44,
    "categorie": "Standard",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "Standard"
  },
  {
    "id": "c_54",
    "nom": "CHAPPELET Stéphanie",
    "lots": "",
    "tantiemes": 417,
    "categorie": "Standard",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "Standard"
  },
  {
    "id": "c_55",
    "nom": "CHARDIN Bernard",
    "lots": "",
    "tantiemes": 427,
    "categorie": "Standard",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "Standard"
  },
  {
    "id": "c_56",
    "nom": "CHARRIN Noémie",
    "lots": "",
    "tantiemes": 360,
    "categorie": "Standard",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "Standard"
  },
  {
    "id": "c_57",
    "nom": "CHASTAING Landry",
    "lots": "",
    "tantiemes": 343,
    "categorie": "Standard",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "Standard"
  },
  {
    "id": "c_58",
    "nom": "CHATIOU Mohamed",
    "lots": "",
    "tantiemes": 363,
    "categorie": "Standard",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "Standard"
  },
  {
    "id": "c_59",
    "nom": "CHAVANCY / FERRANDO Philippe / Ingrid",
    "lots": "",
    "tantiemes": 434,
    "categorie": "Standard",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "Standard"
  },
  {
    "id": "c_60",
    "nom": "CHAVANCY Rudy",
    "lots": "",
    "tantiemes": 373,
    "categorie": "Standard",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "Standard"
  },
  {
    "id": "c_61",
    "nom": "CHETRY Laurent",
    "lots": "",
    "tantiemes": 420,
    "categorie": "Standard",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "Standard"
  },
  {
    "id": "c_62",
    "nom": "CHEVALME Florence",
    "lots": "",
    "tantiemes": 483,
    "categorie": "🔥 Top 20%",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "🔥 Top 20%"
  },
  {
    "id": "c_63",
    "nom": "CHIHI ET MME ABIDAT Saifeddine et Nawel",
    "lots": "",
    "tantiemes": 425,
    "categorie": "Standard",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "Standard"
  },
  {
    "id": "c_64",
    "nom": "CLARY Maud",
    "lots": "",
    "tantiemes": 363,
    "categorie": "Standard",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "Standard"
  },
  {
    "id": "c_65",
    "nom": "CLAVEL Marcel",
    "lots": "",
    "tantiemes": 356,
    "categorie": "Standard",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "Standard"
  },
  {
    "id": "c_66",
    "nom": "COLOTTO Nicaise",
    "lots": "",
    "tantiemes": 436,
    "categorie": "🔥 Top 20%",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "🔥 Top 20%"
  },
  {
    "id": "c_67",
    "nom": "CORBEL / MEDICI Chrystel / Sophie",
    "lots": "",
    "tantiemes": 360,
    "categorie": "Standard",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "Standard"
  },
  {
    "id": "c_68",
    "nom": "CORDEL Marc",
    "lots": "",
    "tantiemes": 415,
    "categorie": "Standard",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "Standard"
  },
  {
    "id": "c_69",
    "nom": "CORREIA MARIA FERNANDA",
    "lots": "",
    "tantiemes": 44,
    "categorie": "Standard",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "Standard"
  },
  {
    "id": "c_70",
    "nom": "CORRENOZ Florence",
    "lots": "",
    "tantiemes": 360,
    "categorie": "Standard",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "Standard"
  },
  {
    "id": "c_71",
    "nom": "CORRENOZ Marcel",
    "lots": "",
    "tantiemes": 415,
    "categorie": "Standard",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "Standard"
  },
  {
    "id": "c_72",
    "nom": "COSTE Jean-Claude",
    "lots": "",
    "tantiemes": 375,
    "categorie": "Standard",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "Standard"
  },
  {
    "id": "c_73",
    "nom": "COSTERG François",
    "lots": "",
    "tantiemes": 360,
    "categorie": "Standard",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "Standard"
  },
  {
    "id": "c_74",
    "nom": "COUDRY Émilie",
    "lots": "",
    "tantiemes": 363,
    "categorie": "Standard",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "Standard"
  },
  {
    "id": "c_75",
    "nom": "COURANT Daniel",
    "lots": "",
    "tantiemes": 466,
    "categorie": "🔥 Top 20%",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "🔥 Top 20%"
  },
  {
    "id": "c_76",
    "nom": "COUTAND David",
    "lots": "",
    "tantiemes": 420,
    "categorie": "Standard",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "Standard"
  },
  {
    "id": "c_77",
    "nom": "COYNEL Gilbert",
    "lots": "",
    "tantiemes": 417,
    "categorie": "Standard",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "Standard"
  },
  {
    "id": "c_78",
    "nom": "CRAPANZANO Angélo",
    "lots": "",
    "tantiemes": 422,
    "categorie": "Standard",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "Standard"
  },
  {
    "id": "c_79",
    "nom": "CRISPOLTI / PARADISO Mathilde / Julien",
    "lots": "",
    "tantiemes": 360,
    "categorie": "Standard",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "Standard"
  },
  {
    "id": "c_80",
    "nom": "CROCHON Jean-Louis",
    "lots": "",
    "tantiemes": 461,
    "categorie": "🔥 Top 20%",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "🔥 Top 20%"
  },
  {
    "id": "c_81",
    "nom": "CROIBIER MUSCAT Jean-Marie",
    "lots": "",
    "tantiemes": 444,
    "categorie": "🔥 Top 20%",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "🔥 Top 20%"
  },
  {
    "id": "c_82",
    "nom": "CULLIE ou CAMPS Francis ou Yvette",
    "lots": "",
    "tantiemes": 375,
    "categorie": "Standard",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "Standard"
  },
  {
    "id": "c_83",
    "nom": "CURCIO MONTESINOS Jean-Baptiste Kelly",
    "lots": "",
    "tantiemes": 356,
    "categorie": "Standard",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "Standard"
  },
  {
    "id": "c_84",
    "nom": "CUTILLAS Julien",
    "lots": "",
    "tantiemes": 402,
    "categorie": "Standard",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "Standard"
  },
  {
    "id": "c_85",
    "nom": "CUTILLAS Pascual",
    "lots": "",
    "tantiemes": 44,
    "categorie": "Standard",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "Standard"
  },
  {
    "id": "c_86",
    "nom": "DAIMO Danielle",
    "lots": "",
    "tantiemes": 363,
    "categorie": "Standard",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "Standard"
  },
  {
    "id": "c_87",
    "nom": "DARMAISIN Gérard",
    "lots": "",
    "tantiemes": 348,
    "categorie": "Standard",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "Standard"
  },
  {
    "id": "c_88",
    "nom": "DERBRE Michel",
    "lots": "",
    "tantiemes": 425,
    "categorie": "Standard",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "Standard"
  },
  {
    "id": "c_89",
    "nom": "DESBOIS Laurent / Pornpana",
    "lots": "",
    "tantiemes": 363,
    "categorie": "Standard",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "Standard"
  },
  {
    "id": "c_90",
    "nom": "DI CARO Roland",
    "lots": "",
    "tantiemes": 44,
    "categorie": "Standard",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "Standard"
  },
  {
    "id": "c_91",
    "nom": "DI TOMMASO Giuseppina",
    "lots": "",
    "tantiemes": 360,
    "categorie": "Standard",
    "statut": "POUVOIR",
    "mandataire": "SUZET",
    "notes": "Standard | Représenté par CS (SUZET)"
  },
  {
    "id": "c_92",
    "nom": "DIKYUVA Dilek",
    "lots": "",
    "tantiemes": 415,
    "categorie": "Standard",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "Standard"
  },
  {
    "id": "c_93",
    "nom": "DOLFINI Franck",
    "lots": "",
    "tantiemes": 351,
    "categorie": "Standard",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "Standard"
  },
  {
    "id": "c_94",
    "nom": "DONAT-REVERDY Odette",
    "lots": "",
    "tantiemes": 373,
    "categorie": "Standard",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "Standard"
  },
  {
    "id": "c_95",
    "nom": "DONDEYNE Noëlle",
    "lots": "",
    "tantiemes": 373,
    "categorie": "Standard",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "Standard"
  },
  {
    "id": "c_96",
    "nom": "DUCHEZ & MME DABOIN SOTO Kévin et Risobel",
    "lots": "",
    "tantiemes": 417,
    "categorie": "Standard",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "Standard"
  },
  {
    "id": "c_97",
    "nom": "DUMAS David",
    "lots": "",
    "tantiemes": 371,
    "categorie": "Standard",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "Standard"
  },
  {
    "id": "c_98",
    "nom": "DUMETZ Bastien",
    "lots": "",
    "tantiemes": 363,
    "categorie": "Standard",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "Standard"
  },
  {
    "id": "c_99",
    "nom": "DUMKE GERACI Anaïs ou Philippe",
    "lots": "",
    "tantiemes": 417,
    "categorie": "Standard",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "Standard"
  },
  {
    "id": "c_100",
    "nom": "E.P.F.L. - D",
    "lots": "",
    "tantiemes": 461,
    "categorie": "🔥 Top 20%",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "🔥 Top 20%"
  },
  {
    "id": "c_101",
    "nom": "FENARD Bernadette",
    "lots": "",
    "tantiemes": 419,
    "categorie": "Standard",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "Standard"
  },
  {
    "id": "c_102",
    "nom": "FERNANDES JOAQUIM",
    "lots": "",
    "tantiemes": 408,
    "categorie": "Standard",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "Standard"
  },
  {
    "id": "c_103",
    "nom": "FERRERA Auguste",
    "lots": "",
    "tantiemes": 439,
    "categorie": "🔥 Top 20%",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "🔥 Top 20%"
  },
  {
    "id": "c_104",
    "nom": "FILECCIA V.",
    "lots": "",
    "tantiemes": 378,
    "categorie": "Standard",
    "statut": "POUVOIR",
    "mandataire": "BRUN Éric",
    "notes": "Standard | Représenté par CS (BRUN Éric)"
  },
  {
    "id": "c_105",
    "nom": "FRAILE Victor",
    "lots": "",
    "tantiemes": 420,
    "categorie": "Standard",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "Standard"
  },
  {
    "id": "c_106",
    "nom": "FRAMINET ROGER",
    "lots": "",
    "tantiemes": 44,
    "categorie": "Standard",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "Standard"
  },
  {
    "id": "c_107",
    "nom": "FRANCOIS CLAUDINE",
    "lots": "",
    "tantiemes": 358,
    "categorie": "Standard",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "Standard"
  },
  {
    "id": "c_108",
    "nom": "GABUS Francisca",
    "lots": "",
    "tantiemes": 422,
    "categorie": "Standard",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "Standard"
  },
  {
    "id": "c_109",
    "nom": "GANET Chantal",
    "lots": "",
    "tantiemes": 464,
    "categorie": "🔥 Top 20%",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "🔥 Top 20%"
  },
  {
    "id": "c_110",
    "nom": "GARCIA F.-OSIOL F",
    "lots": "",
    "tantiemes": 409,
    "categorie": "Standard",
    "statut": "POUVOIR",
    "mandataire": "GUERRE Sylvie",
    "notes": "Standard | Représenté par CS (GUERRE Sylvie)"
  },
  {
    "id": "c_111",
    "nom": "GARCIA Rémy",
    "lots": "",
    "tantiemes": 88,
    "categorie": "Standard",
    "statut": "POUVOIR",
    "mandataire": "GUERRE Sylvie",
    "notes": "Standard | Représenté par CS (GUERRE Sylvie)"
  },
  {
    "id": "c_112",
    "nom": "GAUCH Claude",
    "lots": "",
    "tantiemes": 400,
    "categorie": "Standard",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "Standard"
  },
  {
    "id": "c_113",
    "nom": "GAUDE Julien",
    "lots": "",
    "tantiemes": 44,
    "categorie": "Standard",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "Standard"
  },
  {
    "id": "c_114",
    "nom": "GAUTHIER Jean-Paul",
    "lots": "",
    "tantiemes": 436,
    "categorie": "🔥 Top 20%",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "🔥 Top 20%"
  },
  {
    "id": "c_115",
    "nom": "GHANMI Souad",
    "lots": "",
    "tantiemes": 351,
    "categorie": "Standard",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "Standard"
  },
  {
    "id": "c_116",
    "nom": "GIBALDI Alfonso",
    "lots": "",
    "tantiemes": 392,
    "categorie": "Standard",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "Standard"
  },
  {
    "id": "c_117",
    "nom": "GIBALDI Antonino",
    "lots": "",
    "tantiemes": 422,
    "categorie": "Standard",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "Standard"
  },
  {
    "id": "c_118",
    "nom": "GIL ET SOLLAMI JOSE ET PATRICIA",
    "lots": "",
    "tantiemes": 402,
    "categorie": "Standard",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "Standard"
  },
  {
    "id": "c_119",
    "nom": "GINET Erwan",
    "lots": "",
    "tantiemes": 371,
    "categorie": "Standard",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "Standard"
  },
  {
    "id": "c_120",
    "nom": "GIOTTA Elisabeth",
    "lots": "",
    "tantiemes": 424,
    "categorie": "Standard",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "Standard"
  },
  {
    "id": "c_121",
    "nom": "GIRARD Laure",
    "lots": "",
    "tantiemes": 358,
    "categorie": "Standard",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "Standard"
  },
  {
    "id": "c_122",
    "nom": "GODFRIN Bernadette",
    "lots": "",
    "tantiemes": 378,
    "categorie": "Standard",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "Standard"
  },
  {
    "id": "c_123",
    "nom": "GOMEZ Corinne",
    "lots": "",
    "tantiemes": 436,
    "categorie": "🔥 Top 20%",
    "statut": "POUVOIR",
    "mandataire": "CASARI Jean-Paul",
    "notes": "🔥 Top 20% | Représenté par CS (CASARI Jean-Paul)"
  },
  {
    "id": "c_124",
    "nom": "GOUDET Valentin",
    "lots": "",
    "tantiemes": 360,
    "categorie": "Standard",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "Standard"
  },
  {
    "id": "c_125",
    "nom": "GRAMMATICA Jeanne",
    "lots": "",
    "tantiemes": 419,
    "categorie": "Standard",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "Standard"
  },
  {
    "id": "c_126",
    "nom": "GRISOLET Patrick",
    "lots": "",
    "tantiemes": 44,
    "categorie": "Standard",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "Standard"
  },
  {
    "id": "c_127",
    "nom": "GROEN Jérôme",
    "lots": "",
    "tantiemes": 366,
    "categorie": "Standard",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "Standard"
  },
  {
    "id": "c_128",
    "nom": "GUERRE Joël",
    "lots": "",
    "tantiemes": 461,
    "categorie": "🔥 Top 20%",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "🔥 Top 20%"
  },
  {
    "id": "c_129",
    "nom": "GUILLET Michel",
    "lots": "",
    "tantiemes": 400,
    "categorie": "Standard",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "Standard"
  },
  {
    "id": "c_130",
    "nom": "HADJ SAID Mohamed",
    "lots": "",
    "tantiemes": 343,
    "categorie": "Standard",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "Standard"
  },
  {
    "id": "c_131",
    "nom": "HAFSAOUI Zahra",
    "lots": "",
    "tantiemes": 415,
    "categorie": "Standard",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "Standard"
  },
  {
    "id": "c_132",
    "nom": "HEULINE Daniel / Véronique",
    "lots": "",
    "tantiemes": 417,
    "categorie": "Standard",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "Standard"
  },
  {
    "id": "c_133",
    "nom": "HUGON Francis",
    "lots": "",
    "tantiemes": 44,
    "categorie": "Standard",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "Standard"
  },
  {
    "id": "c_134",
    "nom": "IMBAULT-HUART Nathalie GX",
    "lots": "",
    "tantiemes": 419,
    "categorie": "Standard",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "Standard"
  },
  {
    "id": "c_135",
    "nom": "IZZO S.",
    "lots": "",
    "tantiemes": 464,
    "categorie": "🔥 Top 20%",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "🔥 Top 20%"
  },
  {
    "id": "c_136",
    "nom": "JARRAND-ALLIER / RICHTER Olivier / Audrey",
    "lots": "",
    "tantiemes": 436,
    "categorie": "🔥 Top 20%",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "🔥 Top 20%"
  },
  {
    "id": "c_137",
    "nom": "22",
    "lots": "",
    "tantiemes": 415,
    "categorie": "Standard",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "Standard"
  },
  {
    "id": "c_138",
    "nom": "JEANSELME Pierre",
    "lots": "",
    "tantiemes": 44,
    "categorie": "Standard",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "Standard"
  },
  {
    "id": "c_139",
    "nom": "JONAS Raymonde",
    "lots": "",
    "tantiemes": 44,
    "categorie": "Standard",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "Standard"
  },
  {
    "id": "c_140",
    "nom": "JULLIEN Franck",
    "lots": "",
    "tantiemes": 461,
    "categorie": "🔥 Top 20%",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "🔥 Top 20%"
  },
  {
    "id": "c_141",
    "nom": "KECK Joséphine",
    "lots": "",
    "tantiemes": 425,
    "categorie": "Standard",
    "statut": "POUVOIR",
    "mandataire": "CASARI Jean-Paul",
    "notes": "Standard | Représenté par CS (CASARI Jean-Paul)"
  },
  {
    "id": "c_142",
    "nom": "KERNEVEZ",
    "lots": "",
    "tantiemes": 44,
    "categorie": "Standard",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "Standard"
  },
  {
    "id": "c_143",
    "nom": "KERNOU Fodil ou Nadira",
    "lots": "",
    "tantiemes": 436,
    "categorie": "🔥 Top 20%",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "🔥 Top 20%"
  },
  {
    "id": "c_144",
    "nom": "KHALFI Rachid / Amel",
    "lots": "",
    "tantiemes": 415,
    "categorie": "Standard",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "Standard"
  },
  {
    "id": "c_145",
    "nom": "KIBARDINA Anastasia",
    "lots": "",
    "tantiemes": 417,
    "categorie": "Standard",
    "statut": "POUVOIR",
    "mandataire": "GUERRE Sylvie",
    "notes": "Standard | Représenté par CS (GUERRE Sylvie)"
  },
  {
    "id": "c_146",
    "nom": "KNEUSS Oria",
    "lots": "",
    "tantiemes": 373,
    "categorie": "Standard",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "Standard"
  },
  {
    "id": "c_147",
    "nom": "LA BOMBARDIERE (Mme MOREL Domi)",
    "lots": "",
    "tantiemes": 371,
    "categorie": "Standard",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "Standard"
  },
  {
    "id": "c_148",
    "nom": "LA GRECA Antonio",
    "lots": "",
    "tantiemes": 363,
    "categorie": "Standard",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "Standard"
  },
  {
    "id": "c_149",
    "nom": "LA LOGGIA Nunzia",
    "lots": "",
    "tantiemes": 375,
    "categorie": "Standard",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "Standard"
  },
  {
    "id": "c_150",
    "nom": "LAARIBIA Sid Ahmed",
    "lots": "",
    "tantiemes": 425,
    "categorie": "Standard",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "Standard"
  },
  {
    "id": "c_151",
    "nom": "LACAGNINA Geneviève",
    "lots": "",
    "tantiemes": 420,
    "categorie": "Standard",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "Standard"
  },
  {
    "id": "c_152",
    "nom": "LACAGNINA Lucia ou Concettina",
    "lots": "",
    "tantiemes": 405,
    "categorie": "Standard",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "Standard"
  },
  {
    "id": "c_153",
    "nom": "LACAGNINA Maurice G",
    "lots": "",
    "tantiemes": 371,
    "categorie": "Standard",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "Standard"
  },
  {
    "id": "c_154",
    "nom": "LACHGUER Ahmed",
    "lots": "",
    "tantiemes": 405,
    "categorie": "Standard",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "Standard"
  },
  {
    "id": "c_155",
    "nom": "LANVIN Nicolas",
    "lots": "",
    "tantiemes": 478,
    "categorie": "🔥 Top 20%",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "🔥 Top 20%"
  },
  {
    "id": "c_156",
    "nom": "LARDENOIS-ROBERT François-Louis",
    "lots": "",
    "tantiemes": 434,
    "categorie": "Standard",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "Standard"
  },
  {
    "id": "c_157",
    "nom": "LARGIER Serge et Aline",
    "lots": "",
    "tantiemes": 452,
    "categorie": "🔥 Top 20%",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "🔥 Top 20%"
  },
  {
    "id": "c_158",
    "nom": "LAROCHE René / Martine",
    "lots": "",
    "tantiemes": 375,
    "categorie": "Standard",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "Standard"
  },
  {
    "id": "c_159",
    "nom": "LAUREL Marie-Christine",
    "lots": "",
    "tantiemes": 425,
    "categorie": "Standard",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "Standard"
  },
  {
    "id": "c_160",
    "nom": "LAVERGNE Muriel",
    "lots": "",
    "tantiemes": 461,
    "categorie": "🔥 Top 20%",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "🔥 Top 20%"
  },
  {
    "id": "c_161",
    "nom": "LE FLOREAL CONCIERGERIE",
    "lots": "",
    "tantiemes": 407,
    "categorie": "Standard",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "Standard"
  },
  {
    "id": "c_162",
    "nom": "LE GAL Armand",
    "lots": "",
    "tantiemes": 363,
    "categorie": "Standard",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "Standard"
  },
  {
    "id": "c_163",
    "nom": "LEGRAND David",
    "lots": "",
    "tantiemes": 432,
    "categorie": "Standard",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "Standard"
  },
  {
    "id": "c_164",
    "nom": "LENOBLE Brigitte",
    "lots": "",
    "tantiemes": 44,
    "categorie": "Standard",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "Standard"
  },
  {
    "id": "c_165",
    "nom": "LEONE & MME GABUS Noel & Audrey",
    "lots": "",
    "tantiemes": 371,
    "categorie": "Standard",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "Standard"
  },
  {
    "id": "c_166",
    "nom": "LIAS Frédérique",
    "lots": "",
    "tantiemes": 420,
    "categorie": "Standard",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "Standard"
  },
  {
    "id": "c_167",
    "nom": "LO MONACO Christian",
    "lots": "",
    "tantiemes": 436,
    "categorie": "🔥 Top 20%",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "🔥 Top 20%"
  },
  {
    "id": "c_168",
    "nom": "LORINQUER J. OU RUIZ S.",
    "lots": "",
    "tantiemes": 44,
    "categorie": "Standard",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "Standard"
  },
  {
    "id": "c_169",
    "nom": "LOUIS Janick",
    "lots": "",
    "tantiemes": 439,
    "categorie": "🔥 Top 20%",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "🔥 Top 20%"
  },
  {
    "id": "c_170",
    "nom": "LOUIS Justin",
    "lots": "",
    "tantiemes": 363,
    "categorie": "Standard",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "Standard"
  },
  {
    "id": "c_171",
    "nom": "LUENGO Martine",
    "lots": "",
    "tantiemes": 439,
    "categorie": "🔥 Top 20%",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "🔥 Top 20%"
  },
  {
    "id": "c_172",
    "nom": "MARTINET Robert",
    "lots": "",
    "tantiemes": 498,
    "categorie": "🔥 Top 20%",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "🔥 Top 20%"
  },
  {
    "id": "c_173",
    "nom": "MAS Claude",
    "lots": "",
    "tantiemes": 399,
    "categorie": "Standard",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "Standard"
  },
  {
    "id": "c_174",
    "nom": "MAS Elodie",
    "lots": "",
    "tantiemes": 510,
    "categorie": "🔥 Top 20%",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "🔥 Top 20%"
  },
  {
    "id": "c_175",
    "nom": "MASCIAVE Louis",
    "lots": "",
    "tantiemes": 436,
    "categorie": "🔥 Top 20%",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "🔥 Top 20%"
  },
  {
    "id": "c_176",
    "nom": "MAUGIRONT Philippe",
    "lots": "",
    "tantiemes": 49,
    "categorie": "Standard",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "Standard"
  },
  {
    "id": "c_177",
    "nom": "MAZZOLENI Bertrand",
    "lots": "",
    "tantiemes": 402,
    "categorie": "Standard",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "Standard"
  },
  {
    "id": "c_178",
    "nom": "MELO & MME MANKA Mathieu et Laetitia",
    "lots": "",
    "tantiemes": 413,
    "categorie": "Standard",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "Standard"
  },
  {
    "id": "c_179",
    "nom": "MERITTO Kévin",
    "lots": "",
    "tantiemes": 128,
    "categorie": "Standard",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "Standard"
  },
  {
    "id": "c_180",
    "nom": "MESSINA S. & MME SAILLIER Stéphanie",
    "lots": "",
    "tantiemes": 434,
    "categorie": "Standard",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "Standard"
  },
  {
    "id": "c_181",
    "nom": "MEURANT David",
    "lots": "",
    "tantiemes": 420,
    "categorie": "Standard",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "Standard"
  },
  {
    "id": "c_182",
    "nom": "MINIAC Michèle",
    "lots": "",
    "tantiemes": 44,
    "categorie": "Standard",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "Standard"
  },
  {
    "id": "c_183",
    "nom": "MONACHINO-CALABRO Sandrine",
    "lots": "",
    "tantiemes": 478,
    "categorie": "🔥 Top 20%",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "🔥 Top 20%"
  },
  {
    "id": "c_184",
    "nom": "MONDINI Bernard",
    "lots": "",
    "tantiemes": 461,
    "categorie": "🔥 Top 20%",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "🔥 Top 20%"
  },
  {
    "id": "c_185",
    "nom": "MOREAU Alain",
    "lots": "",
    "tantiemes": 420,
    "categorie": "Standard",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "Standard"
  },
  {
    "id": "c_186",
    "nom": "MORIN Gisèle",
    "lots": "",
    "tantiemes": 422,
    "categorie": "Standard",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "Standard"
  },
  {
    "id": "c_187",
    "nom": "MORO Didier",
    "lots": "",
    "tantiemes": 478,
    "categorie": "🔥 Top 20%",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "🔥 Top 20%"
  },
  {
    "id": "c_188",
    "nom": "NAFFATI Samir / Inchirah",
    "lots": "",
    "tantiemes": 469,
    "categorie": "🔥 Top 20%",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "🔥 Top 20%"
  },
  {
    "id": "c_189",
    "nom": "NICOUD Colette",
    "lots": "",
    "tantiemes": 417,
    "categorie": "Standard",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "Standard"
  },
  {
    "id": "c_190",
    "nom": "NOVAT & MME LIOTIER Lionel et Christelle",
    "lots": "",
    "tantiemes": 461,
    "categorie": "🔥 Top 20%",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "🔥 Top 20%"
  },
  {
    "id": "c_191",
    "nom": "OSMANOVIC Midhet",
    "lots": "",
    "tantiemes": 405,
    "categorie": "Standard",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "Standard"
  },
  {
    "id": "c_192",
    "nom": "PADRINES Jennifer",
    "lots": "",
    "tantiemes": 358,
    "categorie": "Standard",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "Standard"
  },
  {
    "id": "c_193",
    "nom": "PAPIN ET MME VERVISCH REMY ET PATRICIA",
    "lots": "",
    "tantiemes": 415,
    "categorie": "Standard",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "Standard"
  },
  {
    "id": "c_194",
    "nom": "PARRINELLO Frédéric / Virginie",
    "lots": "",
    "tantiemes": 417,
    "categorie": "Standard",
    "statut": "POUVOIR",
    "mandataire": "SUZET",
    "notes": "Standard | Représenté par CS (SUZET)"
  },
  {
    "id": "c_195",
    "nom": "PEIS Patrice",
    "lots": "",
    "tantiemes": 5,
    "categorie": "Standard",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "Standard"
  },
  {
    "id": "c_196",
    "nom": "PEREIRA LEONARDA",
    "lots": "",
    "tantiemes": 371,
    "categorie": "Standard",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "Standard"
  },
  {
    "id": "c_197",
    "nom": "PERLI Eric",
    "lots": "",
    "tantiemes": 439,
    "categorie": "🔥 Top 20%",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "🔥 Top 20%"
  },
  {
    "id": "c_198",
    "nom": "PERONNET Jessica",
    "lots": "",
    "tantiemes": 363,
    "categorie": "Standard",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "Standard"
  },
  {
    "id": "c_199",
    "nom": "PICCARRETA",
    "lots": "",
    "tantiemes": 402,
    "categorie": "Standard",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "Standard"
  },
  {
    "id": "c_200",
    "nom": "PIGOIS Véronique",
    "lots": "",
    "tantiemes": 363,
    "categorie": "Standard",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "Standard"
  },
  {
    "id": "c_201",
    "nom": "POCARD Daniel",
    "lots": "",
    "tantiemes": 404,
    "categorie": "Standard",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "Standard"
  },
  {
    "id": "c_202",
    "nom": "PORCHIER Bernard",
    "lots": "",
    "tantiemes": 44,
    "categorie": "Standard",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "Standard"
  },
  {
    "id": "c_203",
    "nom": "PRESTI Lillo",
    "lots": "",
    "tantiemes": 449,
    "categorie": "🔥 Top 20%",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "🔥 Top 20%"
  },
  {
    "id": "c_204",
    "nom": "QUERCIA Rose",
    "lots": "",
    "tantiemes": 439,
    "categorie": "🔥 Top 20%",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "🔥 Top 20%"
  },
  {
    "id": "c_205",
    "nom": "REPENTIN André",
    "lots": "",
    "tantiemes": 363,
    "categorie": "Standard",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "Standard"
  },
  {
    "id": "c_206",
    "nom": "REYNARD Elisabeth",
    "lots": "",
    "tantiemes": 410,
    "categorie": "Standard",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "Standard"
  },
  {
    "id": "c_207",
    "nom": "RISSO Jean-Marc",
    "lots": "",
    "tantiemes": 373,
    "categorie": "Standard",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "Standard"
  },
  {
    "id": "c_208",
    "nom": "RIVAS Evelyne / Didier",
    "lots": "",
    "tantiemes": 457,
    "categorie": "🔥 Top 20%",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "🔥 Top 20%"
  },
  {
    "id": "c_209",
    "nom": "RODRIGUES DE OLIVEIRA Daniel / Arminda",
    "lots": "",
    "tantiemes": 452,
    "categorie": "🔥 Top 20%",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "🔥 Top 20%"
  },
  {
    "id": "c_210",
    "nom": "RODRIGUES Narcisse",
    "lots": "",
    "tantiemes": 44,
    "categorie": "Standard",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "Standard"
  },
  {
    "id": "c_211",
    "nom": "ROUX Corine",
    "lots": "",
    "tantiemes": 44,
    "categorie": "Standard",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "Standard"
  },
  {
    "id": "c_212",
    "nom": "ROUX Estelle",
    "lots": "",
    "tantiemes": 44,
    "categorie": "Standard",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "Standard"
  },
  {
    "id": "c_213",
    "nom": "ROUX Michel",
    "lots": "",
    "tantiemes": 402,
    "categorie": "Standard",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "Standard"
  },
  {
    "id": "c_214",
    "nom": "ROYBON Grégoire",
    "lots": "",
    "tantiemes": 420,
    "categorie": "Standard",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "Standard"
  },
  {
    "id": "c_215",
    "nom": "RUDD Caixia",
    "lots": "",
    "tantiemes": 378,
    "categorie": "Standard",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "Standard"
  },
  {
    "id": "c_216",
    "nom": "RUSSO Anna",
    "lots": "",
    "tantiemes": 427,
    "categorie": "Standard",
    "statut": "POUVOIR",
    "mandataire": "GUERRE Sylvie",
    "notes": "Standard | Représenté par CS (GUERRE Sylvie)"
  },
  {
    "id": "c_217",
    "nom": "RUSSO Thibaut",
    "lots": "",
    "tantiemes": 351,
    "categorie": "Standard",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "Standard"
  },
  {
    "id": "c_218",
    "nom": "SALERNO Indivision",
    "lots": "",
    "tantiemes": 410,
    "categorie": "Standard",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "Standard"
  },
  {
    "id": "c_219",
    "nom": "SANAA Hakim",
    "lots": "",
    "tantiemes": 436,
    "categorie": "🔥 Top 20%",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "🔥 Top 20%"
  },
  {
    "id": "c_220",
    "nom": "SANDRO",
    "lots": "",
    "tantiemes": 44,
    "categorie": "Standard",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "Standard"
  },
  {
    "id": "c_221",
    "nom": "SAUVENT Yolande",
    "lots": "",
    "tantiemes": 459,
    "categorie": "🔥 Top 20%",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "🔥 Top 20%"
  },
  {
    "id": "c_222",
    "nom": "SCANNELLA Pascal",
    "lots": "",
    "tantiemes": 432,
    "categorie": "Standard",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "Standard"
  },
  {
    "id": "c_223",
    "nom": "SCHRAMMEK & DUGLUE Julien et Morgane",
    "lots": "",
    "tantiemes": 417,
    "categorie": "Standard",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "Standard"
  },
  {
    "id": "c_224",
    "nom": "SELEK Martine",
    "lots": "",
    "tantiemes": 549,
    "categorie": "🔥 Top 20%",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "🔥 Top 20%"
  },
  {
    "id": "c_225",
    "nom": "SEOUD Nabil",
    "lots": "",
    "tantiemes": 464,
    "categorie": "🔥 Top 20%",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "🔥 Top 20%"
  },
  {
    "id": "c_226",
    "nom": "SERAPHIN Gilles",
    "lots": "",
    "tantiemes": 417,
    "categorie": "Standard",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "Standard"
  },
  {
    "id": "c_227",
    "nom": "SESTIER Hubert",
    "lots": "",
    "tantiemes": 420,
    "categorie": "Standard",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "Standard"
  },
  {
    "id": "c_228",
    "nom": "SIBUE David",
    "lots": "",
    "tantiemes": 375,
    "categorie": "Standard",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "Standard"
  },
  {
    "id": "c_229",
    "nom": "SICIGNANO / ABREUX Sandra et Fabrizio",
    "lots": "",
    "tantiemes": 439,
    "categorie": "🔥 Top 20%",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "🔥 Top 20%"
  },
  {
    "id": "c_230",
    "nom": "SIERRA Indivision",
    "lots": "",
    "tantiemes": 476,
    "categorie": "🔥 Top 20%",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "🔥 Top 20%"
  },
  {
    "id": "c_231",
    "nom": "SILVAGNI Alain",
    "lots": "",
    "tantiemes": 405,
    "categorie": "Standard",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "Standard"
  },
  {
    "id": "c_232",
    "nom": "SILVESTRI Renato / Dominique",
    "lots": "",
    "tantiemes": 44,
    "categorie": "Standard",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "Standard"
  },
  {
    "id": "c_233",
    "nom": "SIMONETTI Emmanuel",
    "lots": "",
    "tantiemes": 476,
    "categorie": "🔥 Top 20%",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "🔥 Top 20%"
  },
  {
    "id": "c_234",
    "nom": "SOLITRO Hélène",
    "lots": "",
    "tantiemes": 407,
    "categorie": "Standard",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "Standard"
  },
  {
    "id": "c_235",
    "nom": "SOUSA RODRIGUES Narciso",
    "lots": "",
    "tantiemes": 409,
    "categorie": "Standard",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "Standard"
  },
  {
    "id": "c_236",
    "nom": "STOCLET David",
    "lots": "",
    "tantiemes": 434,
    "categorie": "Standard",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "Standard"
  },
  {
    "id": "c_237",
    "nom": "SUZET & MME FALCON Jérémy et Laura",
    "lots": "",
    "tantiemes": 802,
    "categorie": "🔥 Top 20%",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "🔥 Top 20%"
  },
  {
    "id": "c_238",
    "nom": "TARDY Pascal",
    "lots": "",
    "tantiemes": 348,
    "categorie": "Standard",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "Standard"
  },
  {
    "id": "c_239",
    "nom": "TARRICONE V. - SOARES J.",
    "lots": "",
    "tantiemes": 439,
    "categorie": "🔥 Top 20%",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "🔥 Top 20%"
  },
  {
    "id": "c_240",
    "nom": "TASKIN Haci / Serap",
    "lots": "",
    "tantiemes": 375,
    "categorie": "Standard",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "Standard"
  },
  {
    "id": "c_241",
    "nom": "TINCHON Jean-Loup",
    "lots": "",
    "tantiemes": 459,
    "categorie": "🔥 Top 20%",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "🔥 Top 20%"
  },
  {
    "id": "c_242",
    "nom": "TISSEYRE André",
    "lots": "",
    "tantiemes": 478,
    "categorie": "🔥 Top 20%",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "🔥 Top 20%"
  },
  {
    "id": "c_243",
    "nom": "TOMAS CAMBERO Antonio",
    "lots": "",
    "tantiemes": 365,
    "categorie": "Standard",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "Standard"
  },
  {
    "id": "c_244",
    "nom": "TOMASINO",
    "lots": "",
    "tantiemes": 464,
    "categorie": "🔥 Top 20%",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "🔥 Top 20%"
  },
  {
    "id": "c_245",
    "nom": "TRAJILOVIC Olga",
    "lots": "",
    "tantiemes": 413,
    "categorie": "Standard",
    "statut": "POUVOIR",
    "mandataire": "BRUN Éric",
    "notes": "Standard | Représenté par CS (BRUN Éric)"
  },
  {
    "id": "c_246",
    "nom": "TRAPANI Felicia",
    "lots": "",
    "tantiemes": 413,
    "categorie": "Standard",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "Standard"
  },
  {
    "id": "c_247",
    "nom": "TREILLARD P.",
    "lots": "",
    "tantiemes": 400,
    "categorie": "Standard",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "Standard"
  },
  {
    "id": "c_248",
    "nom": "TRIBOULAT Frédéric / Virginie",
    "lots": "",
    "tantiemes": 417,
    "categorie": "Standard",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "Standard"
  },
  {
    "id": "c_249",
    "nom": "TRICOLI Indivision",
    "lots": "",
    "tantiemes": 425,
    "categorie": "Standard",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "Standard"
  },
  {
    "id": "c_250",
    "nom": "TRICOLI Luigi",
    "lots": "",
    "tantiemes": 363,
    "categorie": "Standard",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "Standard"
  },
  {
    "id": "c_251",
    "nom": "TRICOLI Luigina",
    "lots": "",
    "tantiemes": 44,
    "categorie": "Standard",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "Standard"
  },
  {
    "id": "c_252",
    "nom": "TROITSKY Gérald",
    "lots": "",
    "tantiemes": 461,
    "categorie": "🔥 Top 20%",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "🔥 Top 20%"
  },
  {
    "id": "c_253",
    "nom": "UN TOIT POUR TOUS DEV",
    "lots": "",
    "tantiemes": 2098,
    "categorie": "🔥 Top 20%",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "🔥 Top 20%"
  },
  {
    "id": "c_254",
    "nom": "VALLIER Frédéric / Virginie",
    "lots": "",
    "tantiemes": 408,
    "categorie": "Standard",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "Standard"
  },
  {
    "id": "c_255",
    "nom": "VARESANO Angèle & Corinne",
    "lots": "",
    "tantiemes": 351,
    "categorie": "Standard",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "Standard"
  },
  {
    "id": "c_256",
    "nom": "VOILQUE",
    "lots": "",
    "tantiemes": 378,
    "categorie": "Standard",
    "statut": "POUVOIR",
    "mandataire": "GUERRE Sylvie",
    "notes": "Standard | Représenté par CS (GUERRE Sylvie)"
  },
  {
    "id": "c_257",
    "nom": "ZANCO Florence",
    "lots": "",
    "tantiemes": 375,
    "categorie": "Standard",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "Standard"
  },
  {
    "id": "c_258",
    "nom": "ZARO Amandine",
    "lots": "",
    "tantiemes": 432,
    "categorie": "Standard",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "Standard"
  },
  {
    "id": "c_259",
    "nom": "ZEFI / SERGENT Agim / Alexandra",
    "lots": "",
    "tantiemes": 378,
    "categorie": "Standard",
    "statut": "ABSENT",
    "mandataire": "",
    "notes": "Standard"
  }
],

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
