/**
 * Chandrapur District Mining, Minerals & Environmental Safety Dossier
 */

export interface MiningOfficer {
  designation: string;
  name: string;
  office: string;
  phone: string;
  email: string;
  responsibilities: string[];
}

export const DISTRICT_MINING_OFFICE: MiningOfficer = {
  designation: "District Mining Officer (DMO)",
  name: "Mr. S.S. Naitam",
  office: "Collector Office, Chandrapur",
  phone: "07172-272690",
  email: "miningofficer.chanda@gmail.com",
  responsibilities: [
    "Assists District Collector in mineral administration",
    "Mineral exploration and survey management",
    "Regulation of major and minor mining activities",
    "Collection of mineral royalties and revenue tracking",
    "Inter-departmental mineral administrative coordination"
  ]
};

export const DMFT_TRUST = {
  title: "District Mineral Foundation Trust (DMFT)",
  framework: "Section 9(B) of MMDR Act, 1957 & Maharashtra DMFT Rules 2016",
  leadership: "Headed by District Collector, assisted by District Mining Officer (Mr. S.S. Naitam)",
  funding: "Mandatory leaseholder contributions (10% post-2015 leases; 30% older leases) in addition to normal mineral royalties",
  purpose: "Implement Pradhan Mantri Khanij Kshetra Kalyan Yojana (PMKKKY), develop mining-affected areas, promote welfare of affected communities, reduce environmental/health/socio-economic impacts, and support sustainable long-term livelihoods."
};

export const MAJOR_MINERALS = {
  overview: "Chandrapur is known as the 'Black Gold City' and a 'geological museum' due to its extensive rock formations, fossils, and rich commercial mineral deposits.",
  coal: {
    field: "Wardha Valley Coalfield (Thermal Grade Coal)",
    wclMines: ["Bhatadi", "Durgapur", "Hindustan Lalpeth", "Nandgaon", "Mahakali", "Sasti", "Pouni", "Dhoptala"],
    privateCaptiveOperators: [
      "Sunflag Iron & Steel - Belgaon Mine",
      "Aurobindo Realty - Takli, Jena, Bellora blocks",
      "KPCL - Baranj Mine"
    ]
  },
  limestone: {
    concentrations: ["Korpana Tehsil", "Rajura Tehsil"],
    majorCompaniesAndMines: [
      "Ambuja Cements - Maratha Limestone Mines (ML-I, ML-II, ML-III)",
      "UltraTech Cement - Manikgarh and Awalpur",
      "Dalmia Cement",
      "RCCPL - Persoda"
    ]
  },
  otherMinerals: {
    fluorite: "Dongargaon Fluorite Mine (Operated by MSMC - Maharashtra State Mining Corporation)",
    ironOre: ["Gunjewah", "Waghalpeth", "Sindewahi"]
  }
};

export const ENVIRONMENTAL_HEALTH_IMPACTS = {
  concerns: [
    "Air pollution (PM2.5 regularly exceeding WHO safe limits)",
    "Water pollution & groundwater quality degradation (localized WQI > 300)",
    "Soil pollution & deforestation",
    "Wildlife habitat fragmentation & corridor loss",
    "Occupational health risks for miners & surrounding communities"
  ],
  sourceSurveyData: {
    lungFunctionLoss: "43.75% of surveyed miners reported reduced lung capacity.",
    occupationalDiseases: ["Coal Workers' Pneumoconiosis (CWP)", "COPD", "Asthma", "Silicosis"],
    fungalExposureRisks: ["Aspergillus", "Trichophyton", "Candida"],
    pauniMineStudy: "80% miners reported itching/redness, 45% confirmed active fungal infections."
  },
  disclaimer: "These health/environment figures are source-provided survey data and should be cited as available source findings."
};

export const ABANDONED_MINE_SAFETY = {
  risks: "Abandoned or outdated coal pits can fill with water, becoming hazardous reservoirs with drowning risks and public safety threats.",
  closureMandates: [
    "Mandatory mine closure plan enforcement",
    "Backfilling and perimeter safety barriers",
    "Conversion of suitable pit reservoirs into community assets (rainwater harvesting, aquaculture, eco-tourism)"
  ]
};