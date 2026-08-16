/**
 * Tadoba-Andhari Tiger Reserve (TATR) - Fauna, Tigers, Leopards, Mammals, Reptiles & Birds
 */

export interface TadobaFauna {
  tigers: {
    widerLandscapePopulation: string;
    corePopulation: string;
    tigerDensity: string;
    referenceReport: string;
  };
  leopards: {
    count2019: number;
    count2024: number;
    density: string;
  };
  otherMammals: string[];
  reptiles: {
    waterSource: string;
    species: string[];
  };
  birds: {
    totalSpeciesCount: string;
    importantRaptors: string[];
    rareBird: {
      name: string;
      habitat: string;
      note: string;
    };
  };
  sourceDisclaimer: string;
}

export const TADOBA_FAUNA: TadobaFauna = {
  tigers: {
    widerLandscapePopulation: "More than 100 Bengal tigers",
    corePopulation: "More than 80 Bengal tigers inside the core area",
    tigerDensity: "Approximately 11.02 tigers per 100 sq km",
    referenceReport: "Status of Tigers, Co-Predators, and Prey in TATR (2024)"
  },
  leopards: {
    count2019: 106,
    count2024: 144,
    density: "Increased to more than 11 leopards per 100 sq km"
  },
  otherMammals: [
    "Sloth bear",
    "Dhole / Indian wild dog",
    "Gaur / Indian bison",
    "Nilgai",
    "Striped hyena",
    "Small Indian civet",
    "Jungle cat",
    "Sambar",
    "Barking deer",
    "Chital",
    "Four-horned antelope / Chausingha",
    "Honey badger"
  ],
  reptiles: {
    waterSource: "Tadoba Lake (perennial water source)",
    species: [
      "Mugger crocodile",
      "Indian rock python",
      "Common Indian monitor",
      "Indian star tortoise"
    ]
  },
  birds: {
    totalSpeciesCount: "More than 195 bird species",
    importantRaptors: [
      "Grey-headed fish eagle",
      "Crested serpent eagle",
      "Changeable hawk-eagle"
    ],
    rareBird: {
      name: "Lesser Florican",
      habitat: "Dry grasslands",
      note: "Rare sightings of the endangered Lesser Florican have occurred in the dry grasslands (rare visitor/sighting, not claimed as permanently resident)."
    }
  },
  sourceDisclaimer: "All wildlife population statistics are source-provided figures from official TATR census and status reports."
};