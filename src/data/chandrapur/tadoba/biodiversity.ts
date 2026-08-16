/**
 * Tadoba-Andhari Tiger Reserve (TATR) - Complete Wildlife & Biodiversity
 * Comprehensive species catalog, population figures, habitat behaviors,
 * protection statuses, and ecological food web relationships.
 */

export interface PredatorBigCat {
  id: string;
  commonName: string;
  hindiName: string;
  scientificName: string;
  populationStatus: string;
  density: string;
  habitatAndBehavior: string;
  keyDetails: string[];
}

export interface WildCanid {
  id: string;
  commonName: string;
  hindiName: string;
  scientificName: string;
  populationStatus: string;
  huntingStrategyAndBehavior: string;
  keyDetails: string[];
}

export interface ForestGiantGroundForager {
  id: string;
  commonName: string;
  hindiName: string;
  scientificName: string;
  dietAndForaging: string;
  behaviorAndDefense: string;
  sightingLocations: string[];
}

export interface HerbivoreSpecies {
  id: string;
  commonName: string;
  hindiName: string;
  scientificName: string;
  sizeAndCategory: string;
  dietaryGrassPreference: string[];
  ecologicalRole: string;
}

export interface ReptileAquaticSpecies {
  id: string;
  commonName: string;
  hindiName: string;
  scientificName: string;
  habitat: string;
  category: "Crocodilian" | "Snake" | "Lizard" | "Tortoise/Turtle";
  keyNotes: string;
}

export interface AvianDiversity {
  totalSpeciesCountRange: string;
  raptors: { name: string; scientificName: string; note: string }[];
  owls: { name: string; scientificName: string; note: string }[];
  grasslandBirds: { name: string; scientificName: string; status: string; note: string }[];
  colourfulForestBirds: { name: string; scientificName: string }[];
  nightbirds: { name: string; scientificName: string }[];
}

export interface MicroFaunaAndButterflies {
  butterflySpeciesRange: string;
  richestFamily: string;
  nymphalidaeExamples: string[];
  papilionidaeExamples: string[];
  otherFamilies: string[];
  scheduleIIProtectedSpecies: { name: string; scientificName: string; actNote: string }[];
  spiderCount: number;
  featuredSpiders: string[];
  monsoonWebNote: string;
  otherInsects: string[];
}

export interface FoodWebNode {
  species: string;
  role: string;
  preysOnOrEats: string[];
  predatorsOrCompetitors: string[];
  ecologicalInteractions: string;
}

export const PREDATORS_BIG_CATS: PredatorBigCat[] = [
  {
    id: "royal-bengal-tiger",
    commonName: "Royal Bengal Tiger",
    hindiName: "रॉयल बंगाल टाइगर (बाघ)",
    scientificName: "Panthera tigris",
    populationStatus: "Approximately 90–100 tigers in the core area and more than 200 tigers across the wider Vidarbha landscape (according to provided source reports).",
    density: "2024 Tiger Density: 11.02 tigers per 100 sq km.",
    habitatAndBehavior: "Apex predator utilizing 4–5 feet tall khus/vetiver grass (Vetiveria zizanioides) along water bodies and dry forest corridors for ambush hunting.",
    keyDetails: [
      "Tadoba's primary flagship species.",
      "Famous iconic individuals: Maya ('Queen of Tadoba'), Chota Matka, Balram, Bajrang, Choti Tara.",
      "Preys on large herbivores like Chital, Sambar, Gaur, and Wild Boar.",
      "Maintains apex ecological balance in the Vidarbha forest landscape."
    ]
  },
  {
    id: "indian-leopard",
    commonName: "Indian Leopard",
    hindiName: "भारतीय तेंदुआ (लेपर्ड)",
    scientificName: "Panthera pardus",
    populationStatus: "Population increased from 106 in 2019 to 144 in 2024 according to official status reports.",
    density: "Approximately 11.02 leopards per 100 sq km.",
    habitatAndBehavior: "Master of stealth and camouflage, inhabiting rocky slopes, secondary forest paths, dense bamboo thickets, forest edges, and shaded ravines.",
    keyDetails: [
      "Co-exists alongside tigers by utilizing trees and dense bamboo cover for resting and hoisting kills.",
      "Highly adaptable, active during dusk, dawn, and night safaris.",
      "Overlaps with tiger territory in both core and buffer zones."
    ]
  },
  {
    id: "black-panther",
    commonName: "Black Panther (Melanistic Leopard)",
    hindiName: "ब्लैक पैंथर (दुर्लभ कृष्ण तेंदुआ)",
    scientificName: "Panthera pardus (Melanistic variant)",
    populationStatus: "Rare melanistic leopard; official source records a documented sighting in Tadoba in May 2018.",
    density: "Extremely rare melanistic variant.",
    habitatAndBehavior: "Melanism is caused by a recessive gene. The May 2018 sighting was noted as unusual because melanistic leopards are typically associated with dense, humid evergreen forests rather than dry deciduous forests.",
    keyDetails: [
      "Unique sighting record in TATR history.",
      "Shares stealth and hunting behavior with the standard Indian leopard."
    ]
  },
  {
    id: "jungle-cat",
    commonName: "Jungle Cat",
    hindiName: "जंगली बिल्ली (जंगल कैट)",
    scientificName: "Felis chaus",
    populationStatus: "Stable population across buffer and secondary forests.",
    density: "Moderate density across dry deciduous scrub and forest fringes.",
    habitatAndBehavior: "Small, secretive feline; primarily nocturnal and crepuscular. Prefers tall grass, reed beds, and scrub forest fringes.",
    keyDetails: [
      "Frequently encountered during night/buffer safaris.",
      "Feeds on small rodents, birds, lizards, and frogs."
    ]
  },
  {
    id: "rusty-spotted-cat",
    commonName: "Rusty-Spotted Cat",
    hindiName: "रूस्टी-स्पॉटेड कैट (दुनिया की सबसे छोटी जंगली बिल्ली)",
    scientificName: "Prionailurus rubiginosus",
    populationStatus: "Secretive, elusive, and protected under Schedule I of Wildlife Protection Act.",
    density: "Low density, rarely observed due to tiny size and nocturnal habits.",
    habitatAndBehavior: "One of the smallest wild cat species in the world. Nocturnal and arboreal in dry deciduous scrub and bamboo thickets.",
    keyDetails: [
      "Highly elusive small feline.",
      "Preys on small rodents, insects, and small birds."
    ]
  }
];

export const WILD_CANIDS_CARNIVORES: WildCanid[] = [
  {
    id: "dhole-indian-wild-dog",
    commonName: "Dhole / Indian Wild Dog",
    hindiName: "ढोल / जंगली कुत्ता (डोल)",
    scientificName: "Cuon alpinus",
    populationStatus: "Endangered species. Estimated Tadoba population: 20–35 individuals across the reserve.",
    huntingStrategyAndBehavior: "Pack hunter / coursing predator. Chases prey over long distances at speeds of approximately 45–55 km/h according to source. Hunting success rate: 50–70%.",
    keyDetails: [
      "Pack size ranges between 5 to 15 individuals.",
      "Communicates using high-pitched whistles, clucks, and squeaks.",
      "Large packs can successfully defend themselves against sub-adult tigers.",
      "Tigers occasionally steal kills from dhole packs (kleptoparasitism)."
    ]
  },
  {
    id: "striped-hyena",
    commonName: "Striped Hyena",
    hindiName: "लकड़बग्घा (स्ट्राइप्ड हायना)",
    scientificName: "Hyaena hyaena",
    populationStatus: "Present across buffer zones and open scrub areas.",
    huntingStrategyAndBehavior: "Nocturnal scavenger and opportunist predator; plays a key role in cleaning carcass remains and maintaining forest hygiene.",
    keyDetails: [
      "Important part of Tadoba's predator/scavenger guild.",
      "Possesses extremely powerful jaws capable of crushing large bones."
    ]
  },
  {
    id: "golden-jackal",
    commonName: "Golden Jackal",
    hindiName: "गीदड़ / सियार (गोल्डन जैकाल)",
    scientificName: "Canis aureus",
    populationStatus: "Common in buffer areas and agricultural fringes.",
    huntingStrategyAndBehavior: "Adaptable, opportunist small carnivore and scavenger. Operates individually or in pairs.",
    keyDetails: [
      "Feeds on small mammals, poultry, fruits, and carrion.",
      "Acts as a vocal messenger with evening howling."
    ]
  },
  {
    id: "indian-wolf",
    commonName: "Indian Wolf",
    hindiName: "भारतीय भेड़िया (इंडियन वुल्फ)",
    scientificName: "Canis lupus pallipes",
    populationStatus: "Occasional sightings in open scrubland and outer buffer areas.",
    huntingStrategyAndBehavior: "Pack hunter in open grassland and scrub habitats.",
    keyDetails: [
      "Adapted to dry plains and open scrub borders surrounding the reserve."
    ]
  },
  {
    id: "bengal-fox",
    commonName: "Bengal Fox / Indian Fox",
    hindiName: "लोमड़ी (बंगाल फॉक्स)",
    scientificName: "Vulpes bengalensis",
    populationStatus: "Present in grassland patches and buffer zone clearings.",
    huntingStrategyAndBehavior: "Small nocturnal/crepuscular omnivore and rodent predator.",
    keyDetails: [
      "Recognizable by its bushy tail with a distinctive black tip."
    ]
  }
];

export const FOREST_GIANTS_GROUND_FORAGERS: ForestGiantGroundForager[] = [
  {
    id: "sloth-bear",
    commonName: "Sloth Bear",
    hindiName: "भालू (स्लॉथ बीयर)",
    scientificName: "Melursus ursinus",
    dietAndForaging: "Omnivorous. Major natural foods include termites, ants, Mahua flowers (Madhuca longifolia), and ripe Ber fruits (Ziziphus). Uses long curved claws to rip open termite mounds and creates powerful suction noise to extract insects.",
    behaviorAndDefense: "March to June peak activity when fallen Mahua flowers and Ber fruits ripen. Highly defensive: can stand on hind legs, emit loud aggressive/guttural vocalizations, and aggressively confront large predators like tigers to defend cubs or self.",
    sightingLocations: [
      "Moharli Buffer Zone",
      "Navegaon Buffer Zone",
      "Kolsa Zone termite mounds and Mahua trees",
      "Junona & Agarzari Buffer Routes"
    ]
  },
  {
    id: "honey-badger-ratel",
    commonName: "Honey Badger / Ratel",
    hindiName: "हनी बैडजर / राटेल",
    scientificName: "Mellivora capensis",
    dietAndForaging: "Extremely tough, fearless nocturnal carnivore and opportunist. Feeds on honey, bee larvae, small reptiles, rodents, and roots.",
    behaviorAndDefense: "Famous for thick skin and fearless temperament. Rarely seen, but detected during night safaris and specifically recorded during the May 2026 Machan Census.",
    sightingLocations: [
      "Night safari buffer zones",
      "Dense dry deciduous scrub during May Machan Census"
    ]
  },
  {
    id: "indian-pangolin",
    commonName: "Indian Pangolin",
    hindiName: "भारतीय पैंगोलिन (चींटीखोर)",
    scientificName: "Manis crassicaudata",
    dietAndForaging: "Myrmecophage feeding strictly on ants and termites using a long sticky tongue.",
    behaviorAndDefense: "Extremely rare, endangered scaly mammal. Rolls into a tight armored ball when threatened. Priority high-conservation species in TATR.",
    sightingLocations: [
      "Undisturbed core forest floor",
      "Protected termite mounds in core zone"
    ]
  }
];

export const HERBIVORE_GUILD: HerbivoreSpecies[] = [
  {
    id: "indian-gaur-bison",
    commonName: "Indian Gaur / Indian Bison",
    hindiName: "भारतीय गौर / बायसन",
    scientificName: "Bos gaurus",
    sizeAndCategory: "Massive forest bovine; largest wild cattle species.",
    dietaryGrassPreference: ["Mothi Marvel grass", "Kusal / Kushal grass", "Moshan grass"],
    ecologicalRole: "Forms large herds around water sources and grassy clearings; acts as a major bulk grazer shaping forest understory vegetation."
  },
  {
    id: "nilgai-blue-bull",
    commonName: "Nilgai / Blue Bull",
    hindiName: "नीलगाय (ब्लू बुल)",
    scientificName: "Boselaphus tragocamelus",
    sizeAndCategory: "Largest Asian antelope according to source.",
    dietaryGrassPreference: ["Lahan Marvel grass", "Moshan grass", "Agricultural crops on buffer edges"],
    ecologicalRole: "Thrives in dry open forests, scrubland, and grassland patches."
  },
  {
    id: "sambar-deer",
    commonName: "Sambar Deer",
    hindiName: "सांभर हिरण",
    scientificName: "Rusa unicolor",
    sizeAndCategory: "Large woodland deer species.",
    dietaryGrassPreference: ["Aquatic grasses", "Tadoba lake weeds", "Forest shrubs"],
    ecologicalRole: "Highly associated with wetlands, deep water, and lakes (Tadoba & Telia lakes); active and visible around evening water holes. Key prey for tigers."
  },
  {
    id: "chital-spotted-deer",
    commonName: "Chital / Spotted Deer",
    hindiName: "चितल / स्पॉटेड डियर",
    scientificName: "Axis axis",
    sizeAndCategory: "Medium-sized deer; most abundant and commonly seen mammal in TATR.",
    dietaryGrassPreference: ["Harali grass (Cynodon dactylon)", "Fresh shoots", "Fallen flowers"],
    ecologicalRole: "Primary prey base for tigers, leopards, and dholes. Forms close foraging associations with langurs."
  },
  {
    id: "four-horned-antelope-chausingha",
    commonName: "Four-Horned Antelope / Chausingha",
    hindiName: "चौसिंगा (फोर-हॉर्न्ड एंटीलोप)",
    scientificName: "Tetracerus quadricornis",
    sizeAndCategory: "Rare small Indian antelope; unique male with four distinct horns.",
    dietaryGrassPreference: ["Tender forest grasses", "Herbs", "Fallen leaves"],
    ecologicalRole: "Primarily diurnal; prefers undulating dry forest clearings."
  },
  {
    id: "barking-deer-muntjac",
    commonName: "Barking Deer / Muntjac",
    hindiName: "भोंकने वाला हिरण / काकड़ (मुंटजैक)",
    scientificName: "Muntiacus muntjak",
    sizeAndCategory: "Small, shy deer with short antlers.",
    dietaryGrassPreference: ["Forest herbs", "Fallen fruits", "Young shoots"],
    ecologicalRole: "Inhabits dense bamboo thickets and forest cover; emits a dog-like barking call when startled by predators."
  },
  {
    id: "mouse-deer",
    commonName: "Mouse Deer / Indian Spotted Chevrotain",
    hindiName: "माउस डियर / पिसोरी",
    scientificName: "Moschiola indica",
    sizeAndCategory: "Extremely small, nocturnal, secretive primitive herbivore.",
    dietaryGrassPreference: ["Fallen berries", "Forest floor seeds", "Tender leaves"],
    ecologicalRole: "Inhabits dense forest understory and hollow fallen logs."
  },
  {
    id: "indian-wild-boar",
    commonName: "Indian Wild Boar",
    hindiName: "जंगली सूअर (वाइल्ड बोर)",
    scientificName: "Sus scrofa",
    sizeAndCategory: "Abundant omnivorous ungulate.",
    dietaryGrassPreference: ["Roots", "Tubers", "Insects", "Fallen fruits"],
    ecologicalRole: "Travels in social groups called sounders; roots up forest soil aiding seed germination."
  },
  {
    id: "common-langur",
    commonName: "Common Langur / Hanuman Langur",
    hindiName: "लंगूर (हनुमान लंगूर)",
    scientificName: "Semnopithecus entellus",
    sizeAndCategory: "Arboreal primate.",
    dietaryGrassPreference: ["Leaves", "Flowers", "Fruits", "Tender shoots"],
    ecologicalRole: "Serves as Tadoba's primary sentinel/alarm system. Drops fruits for deer on the ground and emits loud warning calls ('Khok-Khok') that alert all forest prey when tigers or leopards are nearby."
  },
  {
    id: "flying-squirrel",
    commonName: "Indian Giant Flying Squirrel",
    hindiName: "उड़न गिलहरी (फ्लाइंग स्क्विरल)",
    scientificName: "Petaurista philippensis",
    sizeAndCategory: "Noctoreal, tree-dwelling gliding mammal.",
    dietaryGrassPreference: ["Tree bark", "Resin", "Fruits", "Leaves"],
    ecologicalRole: "Glides between high canopy Mahua and Teak trees at dusk and night."
  }
];

export const REPTILES_AQUATIC_FAUNA: ReptileAquaticSpecies[] = [
  {
    id: "mugger-crocodile",
    commonName: "Mugger / Marsh Crocodile",
    hindiName: "मगरमच्छ (मगर)",
    scientificName: "Crocodylus palustris",
    habitat: "Tadoba Lake, Telia Lake, and perennial water holes",
    category: "Crocodilian",
    keyNotes: "Large aquatic predator frequently seen basking along muddy lake shorelines during sunny morning hours."
  },
  {
    id: "indian-rock-python",
    commonName: "Indian Rock Python",
    hindiName: "भारतीय अजगर (रॉक पायथन)",
    scientificName: "Python molurus",
    habitat: "Rocky outcrops, stream beds, and jungle tracks",
    category: "Snake",
    keyNotes: "Massive non-venomous constrictor snake; occasionally seen crossing safari tracks near water bodies."
  },
  {
    id: "spectacled-cobra",
    commonName: "Spectacled Cobra",
    hindiName: "नाग / स्पेक्टेकल्ड कोबरा",
    scientificName: "Naja naja",
    habitat: "Forest floor, termite mounds, and abandoned burrows",
    category: "Snake",
    keyNotes: "Highly venomous elapid snake with trademark hood spectacled marking."
  },
  {
    id: "russells-viper",
    commonName: "Russell's Viper",
    hindiName: "घोणस / रसेल वाइपर",
    scientificName: "Daboia russelii",
    habitat: "Dry scrub, open grass, and rocky terrain",
    category: "Snake",
    keyNotes: "Venomous viper known for loud warning hiss like a pressure cooker."
  },
  {
    id: "common-krait",
    commonName: "Common Krait",
    hindiName: "मनेर / कॉमन क्रेट",
    scientificName: "Bungarus caeruleus",
    habitat: "Dry leaves, burrows, and buffer settlements",
    category: "Snake",
    keyNotes: "Highly neurotoxic nocturnal elapid snake."
  },
  {
    id: "common-indian-monitor",
    commonName: "Common Indian Monitor Lizard",
    hindiName: "घोरपड़ / मॉनिटर लिजार्ड",
    scientificName: "Varanus bengalensis",
    habitat: "Tree trunks, termite mounds, and rock crevices",
    category: "Lizard",
    keyNotes: "Large reptile frequently seen basking on sunny rocks and climbing tree trunks."
  },
  {
    id: "indian-star-tortoise",
    commonName: "Indian Star Tortoise",
    hindiName: "इंडियन स्टार कछुआ",
    scientificName: "Geochelone elegans",
    habitat: "Dry deciduous scrub and grass clearings",
    category: "Tortoise/Turtle",
    keyNotes: "Terrestrial tortoise with beautiful star patterns on shell."
  },
  {
    id: "indian-flapshell-turtle",
    commonName: "Indian Flapshell Turtle",
    hindiName: "भारतीय फ्लैपशेल कछुआ",
    scientificName: "Lissemys punctata",
    habitat: "Tadoba Lake, streams, and seasonal ponds",
    category: "Tortoise/Turtle",
    keyNotes: "Freshwater turtle found in muddy pond beds."
  }
];

export const BIRDS_AVIAN_DIVERSITY: AvianDiversity = {
  totalSpeciesCountRange: "According to provided source records, TATR hosts approximately 195 to 280+ bird species.",
  raptors: [
    { name: "Grey-Headed Fish Eagle", scientificName: "Haliaeetus ichthyaetus", note: "Perches near Tadoba Lake and Telia Lake hunting fish." },
    { name: "Crested Serpent Eagle", scientificName: "Spilornis cheela", note: "Common woodland eagle preying on snakes and lizards." },
    { name: "Changeable Hawk-Eagle", scientificName: "Nisaetus cirrhatus", note: "Powerful forest raptor perching high in Teak canopies." }
  ],
  owls: [
    { name: "Mottled Wood Owl", scientificName: "Strix ocellata", note: "Nocturnal owl in mature woodland groves." },
    { name: "Brown Fish Owl", scientificName: "Ketupa zeylonensis", note: "Perches near stream edges hunting fish and frogs." },
    { name: "Jungle Owlet", scientificName: "Glaucidium radiatum", note: "Small diurnal/crepuscular forest owlet." },
    { name: "Spotted Owlet", scientificName: "Athene brama", note: "Common around forest rest houses and buffer zones." }
  ],
  grasslandBirds: [
    {
      name: "Lesser Florican",
      scientificName: "Sypheotides indicus",
      status: "Rare / Endangered",
      note: "Rare visitor/sighting in dry grassland areas of Tadoba according to source records."
    }
  ],
  colourfulForestBirds: [
    { name: "Orange-Headed Thrush", scientificName: "Geokichla citrina" },
    { name: "Indian Pitta ('Navrang')", scientificName: "Pitta brachyura" },
    { name: "Asian Paradise Flycatcher", scientificName: "Terpsiphone paradisi" },
    { name: "Black-Naped Monarch", scientificName: "Hypothymis azurea" },
    { name: "Black-Rumped Flameback Woodpecker", scientificName: "Dinopium benghalense" }
  ],
  nightbirds: [
    { name: "Savanna Nightjar", scientificName: "Caprimulgus affinis" },
    { name: "Indian Nightjar", scientificName: "Caprimulgus asiaticus" },
    { name: "Grey Nightjar", scientificName: "Caprimulgus jotaka" },
    { name: "Large-Tailed Nightjar", scientificName: "Caprimulgus macrurus" }
  ]
};

export const BUTTERFLIES_MICRO_FAUNA: MicroFaunaAndButterflies = {
  butterflySpeciesRange: "According to provided source records, Tadoba hosts approximately 66 to 134 butterfly species.",
  richestFamily: "Nymphalidae (Brush-footed butterflies) is recorded as the richest family.",
  nymphalidaeExamples: ["Blue Pansy", "Chocolate Pansy", "Blue Tiger", "Common Crow", "Plain Tiger"],
  papilionidaeExamples: ["Common Mormon", "Crimson Rose", "Lime Butterfly"],
  otherFamilies: ["Lycaenidae (Blues & Coppers)", "Pieridae (Whites & Yellows)", "Hesperiidae (Skippers)"],
  scheduleIIProtectedSpecies: [
    {
      name: "Danaid Eggfly",
      scientificName: "Hypolimnas misippus",
      actNote: "Protected under Schedule II of the Wildlife (Protection) Act, 1972."
    },
    {
      name: "Great Eggfly",
      scientificName: "Hypolimnas bolina",
      actNote: "Protected under Schedule II of the Wildlife (Protection) Act, 1972."
    }
  ],
  spiderCount: 26,
  featuredSpiders: [
    "Signature Spider (Argiope anasuja)",
    "Giant Wood Spider (Nephila pilipes)",
    "Red Wood Spider"
  ],
  monsoonWebNote: "Monsoon and post-monsoon periods (July to October) show peak spider web activity across forest pathways.",
  otherInsects: [
    "Praying Mantises",
    "Stick Insects",
    "Jewel Beetles",
    "Termites (harvested by Sloth Bears)"
  ]
};

export const ECOLOGICAL_FOOD_WEB: FoodWebNode[] = [
  {
    species: "Royal Bengal Tiger",
    role: "Apex Predator",
    preysOnOrEats: ["Chital", "Sambar", "Wild Boar", "Gaur", "Nilgai"],
    predatorsOrCompetitors: ["Competes with Indian Leopard and Dhole packs"],
    ecologicalInteractions: "Maintains prey population balance. Uses tall Khus/vetiver grass near water holes for ambush."
  },
  {
    species: "Indian Leopard",
    role: "Stealth Predator",
    preysOnOrEats: ["Chital", "Barking Deer", "Langur", "Peafowl", "Rodents"],
    predatorsOrCompetitors: ["Competes with Tiger (avoids open tiger trails by utilizing trees and dense bamboo thickets)"],
    ecologicalInteractions: "Hoists kills up trees to prevent scavengers and tigers from stealing."
  },
  {
    species: "Dhole (Indian Wild Dog)",
    role: "Pack Predator",
    preysOnOrEats: ["Chital", "Sambar", "Nilgai", "Wild Boar"],
    predatorsOrCompetitors: ["Tigers may steal dhole kills; large dhole packs can defend against sub-adult tigers"],
    ecologicalInteractions: "Chases prey over long distances at 45–55 km/h with 50–70% hunting success."
  },
  {
    species: "Sloth Bear",
    role: "Omnivorous Forager",
    preysOnOrEats: ["Termites", "Ants", "Mahua flowers", "Ripe Ber fruits"],
    predatorsOrCompetitors: ["Tigers are potential predators of cubs/adults"],
    ecologicalInteractions: "Confronts predators defensively by standing on hind legs and uttering loud guttural roars."
  },
  {
    species: "Common Langur",
    role: "Arboreal Sentinel",
    preysOnOrEats: ["Leaves", "Fruits", "Flowers", "Shoots"],
    predatorsOrCompetitors: ["Preyed upon by Leopards and Tigers"],
    ecologicalInteractions: "Emits sharp alarm calls from tree canopies warning Chital and Sambar when big cats move."
  },
  {
    species: "Chital (Spotted Deer)",
    role: "Primary Herbivore / Prey Base",
    preysOnOrEats: ["Harali grass (Cynodon dactylon)", "Forest herbs", "Dropped tree fruits"],
    predatorsOrCompetitors: ["Preyed upon by Tigers, Leopards, and Dhole packs"],
    ecologicalInteractions: "Forms close foraging partnerships with Langurs under tree canopies."
  },
  {
    species: "Water Bodies (Tadoba & Telia Lakes)",
    role: "Aquatic Ecosystem Hub",
    preysOnOrEats: ["Supports Mugger Crocodiles, Fish, Turtles, and Water Birds"],
    predatorsOrCompetitors: ["Critical drinking source for all herbivores and big cats"],
    ecologicalInteractions: "Concentrates wildlife activity during dry summer months."
  }
];

export const TADOBA_COMPLETE_BIODIVERSITY = {
  title: "Tadoba-Andhari Tiger Reserve – Complete Wildlife & Biodiversity",
  hindiTitle: "ताडोबा-अंधारी टाइगर रिजर्व – संपूर्ण वन्यजीव एवं जैव विविधता",
  englishTitle: "Tadoba-Andhari Tiger Reserve – Complete Wildlife & Biodiversity",
  categoryPath: "Chandrapur → Tadoba → Wildlife & Biodiversity",
  tags: [
    "Tadoba", "TATR", "Chandrapur", "Tiger", "Leopard", "Black Panther", "Dhole",
    "Sloth Bear", "Gaur", "Chital", "Sambar", "Nilgai", "Birds", "Reptiles",
    "Butterflies", "Spiders", "Biodiversity", "Wildlife", "Vidarbha"
  ],
  predators: PREDATORS_BIG_CATS,
  canids: WILD_CANIDS_CARNIVORES,
  groundForagers: FOREST_GIANTS_GROUND_FORAGERS,
  herbivores: HERBIVORE_GUILD,
  reptiles: REPTILES_AQUATIC_FAUNA,
  birds: BIRDS_AVIAN_DIVERSITY,
  microFauna: BUTTERFLIES_MICRO_FAUNA,
  foodWeb: ECOLOGICAL_FOOD_WEB
};
