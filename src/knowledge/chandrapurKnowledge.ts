/**
 * Chandrapur District Administrative Knowledge Base & Citizen Services Engine
 *
 * Source Title: Chandrapur District Administrative, Disaster Management, Tribal Governance, Revenue,
 * Industrial, Historical, Ecological, Mining & Welfare Dossier
 * Source Region: Chandrapur, Maharashtra, India
 *
 * TO DISABLE OR REMOVE LATER:
 * Set `IS_CHANDRAPUR_DEMO_ENABLED = false` below, or delete this file
 * and remove its import in `server.ts`.
 */

import { CHANDRAPUR_SCHEMES, StructuredScheme } from "../data/chandrapur/schemes";
import {
  DISTRICT_LEADERSHIP,
  DEPARTMENTAL_OFFICERS,
  ZILLA_PARISHAD_LEADERSHIP,
  MUNICIPAL_CORPORATION
} from "../data/chandrapur/administration";
import { CHANDRAPUR_COLLECTORS_AND_OFFICERS_DOSSIER } from "../data/chandrapur/collectors";
import {
  DISTRICT_MINING_OFFICE,
  DMFT_TRUST,
  MAJOR_MINERALS,
  ENVIRONMENTAL_HEALTH_IMPACTS,
  ABANDONED_MINE_SAFETY
} from "../data/chandrapur/minerals";
import {
  POWER_GENERATION,
  CEMENT_INDUSTRY,
  PAPER_INDUSTRY,
  FERRO_ALLOYS,
  FUTURE_ENERGY_INFRASTRUCTURE
} from "../data/chandrapur/industries";
import { POLICE_DIRECTORY, normalizePoliceStationName } from "../data/chandrapur/police";
import { PUBLIC_GRIEVANCES, ILLEGAL_MONEYLENDING_COMPLAINTS } from "../data/chandrapur/grievances";
import { DISTRICT_OVERVIEW, EMERGENCY_CONTACTS } from "../data/chandrapur/district";
import {
  TADOBA_OVERVIEW,
  TADOBA_HISTORY,
  TADOBA_FLORA,
  TADOBA_FAUNA,
  TADOBA_SAFARI_ZONES,
  FAMOUS_TIGERS_2026,
  MACHAN_CENSUS_2026,
  AI_TIGER_WARNING_SYSTEM,
  VANDARSHAN_TOURISM_2026,
  TIGER_SHROFF_ADVOCACY,
  TADOBA_COMPLETE_BIODIVERSITY,
  PREDATORS_BIG_CATS,
  WILD_CANIDS_CARNIVORES,
  FOREST_GIANTS_GROUND_FORAGERS,
  HERBIVORE_GUILD,
  REPTILES_AQUATIC_FAUNA,
  BIRDS_AVIAN_DIVERSITY,
  BUTTERFLIES_MICRO_FAUNA,
  ECOLOGICAL_FOOD_WEB
} from "../data/chandrapur/tadoba";

export const IS_CHANDRAPUR_DEMO_ENABLED = true;

// Re-export structured modules for application-wide UI and data access
export {
  CHANDRAPUR_SCHEMES,
  DISTRICT_LEADERSHIP,
  DEPARTMENTAL_OFFICERS,
  ZILLA_PARISHAD_LEADERSHIP,
  MUNICIPAL_CORPORATION,
  DISTRICT_MINING_OFFICE,
  DMFT_TRUST,
  MAJOR_MINERALS,
  ENVIRONMENTAL_HEALTH_IMPACTS,
  ABANDONED_MINE_SAFETY,
  POWER_GENERATION,
  CEMENT_INDUSTRY,
  PAPER_INDUSTRY,
  FERRO_ALLOYS,
  FUTURE_ENERGY_INFRASTRUCTURE,
  POLICE_DIRECTORY,
  PUBLIC_GRIEVANCES,
  ILLEGAL_MONEYLENDING_COMPLAINTS,
  DISTRICT_OVERVIEW,
  EMERGENCY_CONTACTS,
  TADOBA_OVERVIEW,
  TADOBA_HISTORY,
  TADOBA_FLORA,
  TADOBA_FAUNA,
  TADOBA_SAFARI_ZONES,
  FAMOUS_TIGERS_2026,
  MACHAN_CENSUS_2026,
  AI_TIGER_WARNING_SYSTEM,
  VANDARSHAN_TOURISM_2026,
  TIGER_SHROFF_ADVOCACY,
  TADOBA_COMPLETE_BIODIVERSITY,
  PREDATORS_BIG_CATS,
  WILD_CANIDS_CARNIVORES,
  FOREST_GIANTS_GROUND_FORAGERS,
  HERBIVORE_GUILD,
  REPTILES_AQUATIC_FAUNA,
  BIRDS_AVIAN_DIVERSITY,
  BUTTERFLIES_MICRO_FAUNA,
  ECOLOGICAL_FOOD_WEB
};

export interface ChandrapurKnowledgeRecord {
  id: string;
  title: string;
  category: string;
  subcategory: string;
  location: string;
  sourceName: string;
  content: string;
  keywords: string[];
  entities: string[];
  contacts: string[];
  schemes: string[];
  departments: string[];
  officers: string[];
  deadlines: string[];
  amounts: string[];
  eligibility: string[];
  workflow: string[];
  sourceConfidence: number;
}

export const CHANDRAPUR_KNOWLEDGE_BASE: ChandrapurKnowledgeRecord[] = [
  {
    id: "chandrapur_jharkhand_disambiguation",
    title: "Geographic Entity Disambiguation: Chandrapur (Maharashtra) vs Chandrapura (Jharkhand)",
    category: "Geographic & Entity Disambiguation",
    subcategory: "Administrative Boundary",
    location: "Chandrapur, Maharashtra / Bokaro, Jharkhand",
    sourceName: "Chandrapur District Administrative Knowledge Base",
    content: `
CRITICAL ENTITY DISAMBIGUATION RULE:
- ENTITY A: Chandrapur District, Maharashtra, India (Default Target). Features: Collectorate, TATR, CSTPS 3340 MW, WCL Wardha Valley Coalfield, Gond Dynasty, Chanda Fort.
- ENTITY B: Chandrapura CD Block, Bokaro District, Jharkhand, India. Features: DVC Thermal Power Station, Bermo Coal Mines, Dhanbad-Chandrapura Railway line.

STRICT DISAMBIGUATION POLICY:
1. All queries for "Chandrapur" default exclusively to Chandrapur District, Maharashtra.
2. Records for DVC thermal power, Bermo coal fields, or Dhanbad-Chandrapura railway MUST NOT be returned as Chandrapur Maharashtra information unless the user explicitly asks about Jharkhand.
    `,
    keywords: ["jharkhand", "bokaro", "dvc", "bermo", "dhanbad", "chandrapura block", "entity disambiguation"],
    entities: ["Chandrapur District (Maharashtra)", "Chandrapura CD Block (Jharkhand)"],
    contacts: [],
    schemes: [],
    departments: ["Revenue Department"],
    officers: [],
    deadlines: [],
    amounts: [],
    eligibility: [],
    workflow: ["Disambiguate entity prior to retrieval"],
    sourceConfidence: 1.0
  },
  {
    id: "chandrapur_disaster_tiger_sop",
    title: "Human-Wildlife Conflict & Tiger Attack Emergency Response SOP",
    category: "Emergency & Crisis Management",
    subcategory: "Human-Wildlife Conflict",
    location: "Chandrapur District, Maharashtra (TATR Buffer & Forest Fringe Villages)",
    sourceName: "Chandrapur District Administrative Knowledge Base",
    content: `
SOP FOR TIGER ATTACK / HUMAN-WILDLIFE CONFLICT IN CHANDRAPUR:
1. Immediate Medical Dispatch: Call 108 for emergency ambulance to transport victims to Civil Hospital / Sub-District Hospital.
2. Forest Department Emergency Alert: Inform Forest Helpline 1926 or TATR Emergency Call Center 18003033 / local Range Forest Officer (RFO).
3. Immediate Interim Compensation Processing: Forest Department processes interim monetary ex-gratia compensation as per Maharashtra Forest Department rules for death or severe injury.
4. AI Early Warning System Activation: Automated camera traps and speaker warnings activated across 20 high-risk fringe villages in TATR buffer zone.
5. Police & Legal Documentation: Call 112 to register Accidental Death Report (ADR) or incident report at local Police Station for formal panchnama and forensic verification.
    `,
    keywords: ["tiger attack", "wildlife attack", "human wildlife conflict", "tiger", "बाघ हमला", "वाघाचा हल्ला", "tatr emergency", "compensation", "1926", "18003033"],
    entities: ["Tadoba-Andhari Tiger Reserve (TATR)", "Forest Department Chandrapur", "Civil Hospital Chandrapur"],
    contacts: ["1926 (Forest Helpline)", "18003033 (TATR Wildlife Call)", "108 (Ambulance)", "112 (Police Emergency)"],
    schemes: ["Forest Department Human-Wildlife Ex-gratia Compensation Scheme"],
    departments: ["Forest Department", "Police Department", "Health Department"],
    officers: ["Deputy Conservator of Forests (DCF)", "Range Forest Officer (RFO)", "Civil Surgeon"],
    deadlines: ["Immediate response within 30 minutes"],
    amounts: ["Ex-gratia interim compensation per Govt rules"],
    eligibility: ["Victims of human-wildlife conflict in forest/buffer zones"],
    workflow: ["108 Medical Dispatch", "1926 Forest Alert", "Police Panchnama via 112", "Ex-gratia claim processing", "AI Warning System activation"],
    sourceConfidence: 1.0
  },
  {
    id: "chandrapur_flood_disaster_matrix",
    title: "Monsoon Flood Disaster Management & Water Evacuation Matrix",
    category: "Emergency & Crisis Management",
    subcategory: "Monsoon Flood Management",
    location: "Wardha, Wainganga, Erai & Andhari River Basins, Chandrapur",
    sourceName: "Chandrapur District Administrative Knowledge Base",
    content: `
MONSOON FLOOD DISASTER MANAGEMENT SOP:
1. Disaster Control Rooms:
   - District Disaster Control Room Chandrapur: 1077 / 07172-250077 / 07172-251597.
   - SDRF Regional Support (Nagpur): 7507740400.
   - State Control Room (Mumbai): 022-22027990.
2. River Basin Monitoring: Continuous discharge monitoring for Erai Dam, Asola Mendha Dam, Wardha River, and Wainganga River.
3. Evacuation Workflow: Low-lying village evacuation to designated ZP school/community shelters upon reaching warning levels.
    `,
    keywords: ["flood", "monsoon flood", "erai dam", "wardha river", "wainganga", "disaster control room", "1077", "07172-250077", "evacuation", "बाढ", "पूर"],
    entities: ["District Disaster Management Authority (DDMA)", "SDRF Nagpur", "Erai Dam Administration"],
    contacts: ["1077 (Disaster Emergency)", "07172-250077 (District Control Room)", "7507740400 (SDRF Nagpur)", "022-22027990 (State Control Room)"],
    schemes: ["State Disaster Response Fund (SDRF) Evacuation & Relief"],
    departments: ["District Disaster Management Authority", "Irrigation Department", "Revenue Department"],
    officers: ["District Collector / DDMA Chair", "Resident Deputy Collector (RDC)", "Executive Engineer Irrigation"],
    deadlines: ["Continuous 24x7 monitoring"],
    amounts: ["Emergency shelter and relief kit distribution"],
    eligibility: ["Residents of flood-prone low-lying villages"],
    workflow: ["Dam discharge alert", "DDMA 1077 trigger", "Low-lying evacuation to shelters", "SDRF deployment"],
    sourceConfidence: 1.0
  },
  {
    id: "chandrapur_industrial_disaster_sop",
    title: "Industrial Disaster Management & CSTPS Chemical/Fly Ash Emergency SOP",
    category: "Emergency & Crisis Management",
    subcategory: "Industrial Disaster Management",
    location: "CSTPS Urjanagar, WCL Mining Belt, MIDC Tadali & Warora, Chandrapur",
    sourceName: "Chandrapur District Administrative Knowledge Base",
    content: `
INDUSTRIAL DISASTER MANAGEMENT SOP:
1. Hazard Zone: Chandrapur Super Thermal Power Station (CSTPS - 3,340 MW), WCL Coal Mines, Cement Plants (Ambuja, UltraTech), Chemical plants in MIDC Tadali/Warora.
2. Emergency Response:
   - On-Site Emergency Plan: Managed by Factory Manager and Safety Officers.
   - Off-Site Emergency Plan: Chaired by District Collector & DDMA. Contact 1077 / 07172-250077.
3. Specific Hazard SOPs:
   - Fly Ash Slurry Spill / Dam Breach: Immediate shutoff of ash slurry pipelines into Erai River, community alert, containment dyke construction.
   - Toxic Gas / Chemical Leak: Immediate evacuation upwind, District Industrial Safety & Health (DISH) inspection, sirens activated.
    `,
    keywords: ["cstps", "industrial disaster", "fly ash", "chemical leak", "wcl mine emergency", "midc tadali", "midc warora", "dish", "07172-250077"],
    entities: ["CSTPS Urjanagar", "WCL Rescue Station Ballarpur", "Directorate of Industrial Safety & Health (DISH)", "DDMA Chandrapur"],
    contacts: ["1077 (District Disaster Emergency)", "07172-250077 (DDMA Control Room)", "07172-273258 (Police SP Office)"],
    schemes: ["Off-Site Industrial Disaster Relief Plan"],
    departments: ["Directorate of Industrial Safety & Health", "DDMA", "Police", "Pollution Control Board (MPCB)"],
    officers: ["District Collector / DDMA Chair", "Chief Safety Officer CSTPS", "General Manager WCL"],
    deadlines: ["Immediate Off-Site Plan trigger within 15 mins"],
    amounts: ["Industrial compensation per Factory Act & Environmental Protection Act"],
    eligibility: ["Industrial workers and surrounding population"],
    workflow: ["On-site siren trigger", "DDMA 1077 notification", "Off-site evacuation", "MPCB & DISH inspection"],
    sourceConfidence: 1.0
  },
  {
    id: "chandrapur_dmo_mining_office",
    title: "District Mining Office (DMO) & Mineral Administration",
    category: "Mining & Mineral Administration",
    subcategory: "District Mining Office (DMO)",
    location: "Collector Office Complex, Chandrapur",
    sourceName: "Chandrapur District Administrative Knowledge Base",
    content: `
DISTRICT MINING OFFICE (DMO) CHANDRAPUR:
- District Mining Officer (DMO): Mr. S.S. Naitam
- Office Location: District Collectorate Complex, Chandrapur
- Contact Phone: 07172-272690
- Contact Email: miningofficer.chanda@gmail.com
- Key Responsibilities:
  1. Assists the District Collector in mineral governance and revenue administration.
  2. Supervision of mineral exploration and field surveys across major and minor mineral leases.
  3. Regulation and monitoring of coal, limestone, fluorite, and iron ore extraction activities.
  4. Assessment and collection of mineral royalties and statutory revenues.
  5. Administrative coordination for mining leases, environmental clearances, and DMFT operations.
    `,
    keywords: ["dmo", "district mining officer", "s.s. naitam", "naitam", "07172-272690", "miningofficer.chanda@gmail.com", "mining office", "mineral administration"],
    entities: ["District Mining Office Chandrapur", "Collectorate Chandrapur"],
    contacts: ["07172-272690", "miningofficer.chanda@gmail.com"],
    schemes: ["Mineral Royalty Administration & Revenue Tracking"],
    departments: ["Mining Department", "Revenue Department"],
    officers: ["District Mining Officer (Mr. S.S. Naitam)", "District Collector"],
    deadlines: ["Monthly mineral royalty collection and audit"],
    amounts: ["District mineral royalty collections"],
    eligibility: ["Mining leaseholders, concessionaires, and citizens requesting mining clearances"],
    workflow: ["Lease application review", "Field inspection by DMO", "Royalty collection", "Clearance recommendation to Collector"],
    sourceConfidence: 1.0
  },
  {
    id: "chandrapur_dmft_trust",
    title: "District Mineral Foundation Trust (DMFT) & PMKKKY Mandate",
    category: "Mining & Mineral Administration",
    subcategory: "District Mineral Foundation Trust (DMFT)",
    location: "Chandrapur District",
    sourceName: "Chandrapur District Administrative Knowledge Base",
    content: `
DISTRICT MINERAL FOUNDATION TRUST (DMFT) DOSSIER:
- Statutory Origin: Established under Section 9(B) of the MMDR Act, 1957 and Maharashtra DMFT Rules 2016.
- Leadership: Chaired by the District Collector (Mrs. Vasumana Pant, IAS), assisted by District Mining Officer Mr. S.S. Naitam.
- Funding Mechanism: Mandatory contributions paid by mining leaseholders in addition to standard mineral royalties (10% for leases granted post-Jan 12, 2015; 30% for older leases).
- Primary Objective: Implements Pradhan Mantri Khanij Kshetra Kalyan Yojana (PMKKKY) for:
  1. Holistic development of mining-affected villages and communities.
  2. Mitigating adverse environmental, health, and socio-economic impacts of mining operations.
  3. Allocating funds (minimum 60% high-priority sectors: drinking water, healthcare, education, pollution control, women/child welfare, skill development).
  4. Creating long-term sustainable livelihood assets for affected populations.
    `,
    keywords: ["dmft", "dmf trust", "district mineral foundation", "pmkkky", "mining royalty", "60 percent high priority", "collector dmf", "naitam"],
    entities: ["District Mineral Foundation Trust Chandrapur", "Collectorate Mining Branch"],
    contacts: ["07172-272690 (DMO Office)", "07172-251597 (Collectorate Cell)"],
    schemes: ["Pradhan Mantri Khanij Kshetra Kalyan Yojana (PMKKKY) / DMFT"],
    departments: ["Mining Department", "Planning Department", "District Administration"],
    officers: ["District Collector (DMFT Chair)", "District Mining Officer (Mr. S.S. Naitam)"],
    deadlines: ["Annual DMFT action plan sanction by Governing Council"],
    amounts: ["Min 60% allocation reserved for High Priority sectors"],
    eligibility: ["Residents of mining-affected villages and displaced communities"],
    workflow: ["Royalty top-up collection", "Village development proposals", "DMFT Governing Council sanction", "Execution"],
    sourceConfidence: 1.0
  },
  {
    id: "chandrapur_major_minerals_coal_limestone",
    title: "Major Minerals: Wardha Valley Coalfield, Limestone & Ore Reserves",
    category: "Industrial & Mining Profile",
    subcategory: "Major Minerals Directory",
    location: "Chandrapur District Mining Belts",
    sourceName: "Chandrapur District Administrative Knowledge Base",
    content: `
CHANDRAPUR MAJOR MINERALS & MINES DIRECTORY:
- Overview: Known as the 'Black Gold City' and a 'geological museum' due to its vast rock formations, fossils, and commercial mineral deposits.
1. Coal (Wardha Valley Coalfield):
   - High-grade thermal coal reserves supplying power plants across Western India.
   - WCL (Western Coalfields Limited) Active Mines: Bhatadi (OC), Durgapur (UG & OC), Hindustan Lalpeth (OC), Nandgaon (UG), Mahakali (UG), Sasti (UG & OC), Pouni (OC), Dhoptala (OC), Padmapur, Ballarpur, New Majri.
   - Private / Captive Coal Lease Operators: Sunflag Iron & Steel (Belgaon Mine), Aurobindo Realty (Takli, Jena, Bellora coal blocks), KPCL (Baranj Mine).
2. Limestone:
   - Concentrated heavily in Korpana and Rajura Tehsils.
   - Major Companies & Mines: Ambuja Cements (Maratha Limestone Mines ML-I, ML-II, ML-III), UltraTech Cement (Manikgarh and Awalpur deposits), Dalmia Cement, RCCPL (Persoda).
3. Fluorite & Iron Ore:
   - Fluorite: Dongargaon Fluorite Mine operated by Maharashtra State Mining Corporation (MSMC).
   - Iron Ore Deposits: Gunjewah, Waghalpeth, and Sindewahi belts.
    `,
    keywords: ["coal", "limestone", "fluorite", "iron ore", "black gold city", "geological museum", "wcl", "bhatadi", "durgapur", "hindustan lalpeth", "nandgaon", "mahakali", "sasti", "pouni", "dhoptala", "sunflag", "belgaon", "aurobindo", "ambuja", "maratha limestone", "ultratech", "manikgarh", "awalpur", "dalmia", "rccpl", "dongargaon", "msmc", "gunjewah", "waghalpeth", "sindewahi"],
    entities: ["Western Coalfields Limited (WCL)", "Ambuja Cements", "UltraTech Cement", "MSMC", "Sunflag Iron & Steel", "Aurobindo Realty"],
    contacts: ["07172-272690 (DMO Office)"],
    schemes: ["District Mineral Mining Concessions"],
    departments: ["Mining Department", "Industries Department"],
    officers: ["District Mining Officer (Mr. S.S. Naitam)", "WCL General Manager"],
    deadlines: ["Statutory mining lease compliance"],
    amounts: ["Millions of tonnes thermal coal & cement-grade limestone extracted annually"],
    eligibility: ["Industrial consumers, cement manufacturers, thermal power producers"],
    workflow: ["Exploration", "Environmental & Forest Clearances", "Mining Lease Sanction", "Royalty Disbursement"],
    sourceConfidence: 1.0
  },
  {
    id: "chandrapur_environmental_health_mine_safety",
    title: "Mining Environmental Impacts, Occupational Health & Abandoned Mine Safety",
    category: "Mining & Environmental Health",
    subcategory: "Environmental Health & Mine Safety",
    location: "Chandrapur Mining Belts & Pauni Mine Corridor",
    sourceName: "Chandrapur District Administrative Knowledge Base",
    content: `
ENVIRONMENTAL & OCCUPATIONAL HEALTH DOSSIER (SOURCE-DERIVED):
1. Environmental Concerns:
   - Widespread air pollution (PM2.5 regularly exceeding WHO safe limits), water quality degradation, soil contamination, deforestation, and wildlife corridor fragmentation.
   - Localized areas exhibit Groundwater Quality Index (WQI) values exceeding 300.
2. Miner Occupational Health Survey Findings (Provided Source Data):
   - Reduced Lung Capacity: 43.75% of surveyed miners showed significantly reduced lung function.
   - Respiratory Diseases: High incidence of Coal Workers' Pneumoconiosis (CWP), COPD, Asthma, and Silicosis.
   - Fungal Infections & Exposure: Fungal risks from Aspergillus, Trichophyton, and Candida. Pauni-II opencast mine survey reported 80% miners with skin itching/redness and 45% active fungal infections.
   - Source Disclaimer: These figures represent specific survey findings from the provided source document.
3. Abandoned Mine Pits & Safety SOP:
   - Abandoned/outdated coal pits can fill with rainwater, creating hazardous deep reservoirs with severe drowning risks.
   - Statutory Mine Closure Mandates: Leaseholders must execute systematic backfilling, construct high safety barriers, and convert viable pits into community assets such as rainwater harvesting reservoirs, aquaculture ponds, or eco-tourism sites.
    `,
    keywords: ["environmental impact", "occupational health", "pneumoconiosis", "cwp", "copd", "asthma", "silicosis", "fungal infection", "fungus", "aspergillus", "trichophyton", "candida", "pauni mine", "itching", "43.75 percent lung", "wqi 300", "pm2.5", "abandoned mine", "mine pit drowning", "backfilling", "mine closure"],
    entities: ["Directorate General of Mines Safety (DGMS)", "Maharashtra Pollution Control Board (MPCB)", "Pauni-II Mine Survey Team"],
    contacts: ["07172-272690 (DMO Office)", "07172-250077 (Disaster Control)"],
    schemes: ["Mine Closure Plan & DMFT Environmental Restoration"],
    departments: ["Mining Department", "Health Department", "MPCB"],
    officers: ["District Mining Officer", "Civil Surgeon", "Regional Officer MPCB"],
    deadlines: ["Mandatory mine closure plan submission prior to lease expiry"],
    amounts: ["DMFT health & environmental restoration funds"],
    eligibility: ["Mine workers and residents of mining-affected villages"],
    workflow: ["Environmental monitoring", "Worker health checkups", "Closure plan execution & barrier fencing"],
    sourceConfidence: 1.0
  },
  {
    id: "chandrapur_key_industries_cstps_future_energy",
    title: "CSTPS, Cement, Paper, Ferro-Alloys & August 2026 Coal Gasification",
    category: "Industrial & Economic Profile",
    subcategory: "Heavy Industries & Future Energy",
    location: "CSTPS Urjanagar, MIDC Tadali, Warora & Ballarpur, Chandrapur",
    sourceName: "Chandrapur District Administrative Knowledge Base",
    content: `
KEY INDUSTRIES & CLEAN ENERGY INFRASTRUCTURE:
1. CSTPS (Chandrapur Super Thermal Power Station):
   - Owner: MSPGCL / MAHAGENCO. Total Installed Capacity: 3,340 MW.
   - Footprint: Over 12,000 hectares with ~3,460 staff.
   - Power Contribution: Generates >25% of Maharashtra's total electricity. Water supplied via Erai River dedicated masonry dam.
2. Cement, Paper & Ferro Alloys:
   - Cement: Ambuja Cements Maratha Cement Works Upparwahi (2.85 MTPA raw-material capacity), UltraTech (Manikgarh Nokari & Kusumbi), Dalmia Bharat, RCCPL Persoda.
   - Paper: Ballarpur Industries Limited (BILT, founded 1956) using bamboo, wood, and agricultural residues.
   - Ferro-Alloys: Chandrapur Ferro Alloy Plant (SAIL CFP / MEL) producing manganese ferro-alloys.
3. August 2026 Coal Gasification & Clean Energy Projects:
   - Total Investment: ₹10,000 crore coal gasification initiative.
   - Featured Projects: Integrated steel plant by Greta Energy, 1,490 tonnes/day carbon capture & utilisation system, chemical conversion facility by New Era Cleantech. Expected to create 2,000+ direct jobs.
    `,
    keywords: ["cstps", "3340 mw", "mahagenco", "mspgcl", "ambuja", "upparwahi", "2.85 mtpa", "bilt", "ballarpur industries", "sail cfp", "manganese ferro alloy", "coal gasification", "greta energy", "1490 tonnes carbon capture", "new era cleantech", "10000 crore", "2000 jobs"],
    entities: ["MAHAGENCO / MSPGCL", "CSTPS", "Ambuja Cements", "BILT", "SAIL CFP", "Greta Energy", "New Era Cleantech"],
    contacts: ["07172-251597 (DIC Office / Collectorate)"],
    schemes: ["Maharashtra Industrial Policy & Clean Energy Subsidies"],
    departments: ["Industries Department", "Energy Department", "MIDC"],
    officers: ["General Manager DIC", "Chief Engineer CSTPS", "District Collector"],
    deadlines: ["August 2026 project milestone targets"],
    amounts: ["₹10,000 Cr investment; 3,340 MW thermal capacity"],
    eligibility: ["Industrial investors, power grid, MSME suppliers"],
    workflow: ["MIDC land allotment", "Environmental clearances", "Plant commissioning"],
    sourceConfidence: 1.0
  },
  {
    id: "chandrapur_collectorate_and_administration",
    title: "Chandrapur District Collectors & Collectorate Officers",
    category: "Chandrapur → District Administration → Collectorate → District Collectors & Officers",
    subcategory: "Executive Leadership & Collectorate Officers",
    location: "Collector Office, Civil Lines, Chandrapur, Maharashtra",
    sourceName: "Chandrapur District Administrative Knowledge Base",
    content: `
MODULE: Chandrapur District Collectors & Collectorate Officers
HINDI TITLE: चंद्रपुर जिला कलेक्टर एवं कलेक्ट्रेट अधिकारी

1. CURRENT DISTRICT COLLECTOR / DISTRICT MAGISTRATE:
- Name: Mrs. Vasumana Pant, IAS
- Hindi: श्रीमती वसुमाना पंत (IAS)
- Designation: District Collector & District Magistrate, Chandrapur (जिला कलेक्टर और जिला मजिस्ट्रेट, चंद्रपुर)
- Office: Collector Office, Chandrapur
- Official Contact:
  * Phone: 07172-255300
  * Fax: 07172-255500
  * Email: collector.chandrapur@maharashtra.gov.in (also listed as collector.chandrapur[at]maharashtra[dot]gov[dot]in)

IMPORTANT SOURCE LIMITATION & STRICT BOUNDARY RULE FOR VASUMANA PANT:
- Lisa MUST NOT invent or provide unsupported information about Mrs. Vasumana Pant's previous administrative postings, career history, previous departments, current/future postings, education, or personal background because the supplied source does NOT provide it.
- If asked about her previous postings, career history, or background (e.g., "Vasumana Pant pehle kaha posted thin?", "Vasumana Pant ka career history batao"):
  * Hindi: "मेरे उपलब्ध स्रोत में श्रीमती वसुमाना पंत के पिछले प्रशासनिक करियर, पूर्व पोस्टिंग्स या व्यक्तिगत पृष्ठभूमि की विस्तृत जानकारी उपलब्ध नहीं है।"
  * English: "The available source does not provide detailed information about Mrs. Vasumana Pant's previous administrative postings, career history, or personal background."

2. PREVIOUS DISTRICT COLLECTORS RECORDED IN THE SOURCE:
- Shri Ajay Gulhane, IAS (श्री अजय गुल्हाने, IAS):
  * Former District Collector, Chandrapur
  * Tenure: 2020–2022
  * Exact Record: "Ajay Gulhane served as District Collector of Chandrapur from 2020 to 2022."
- G.C. Vinay Gowda, IAS (जी. सी. विनय गौड़ा, IAS):
  * Former District Collector, Chandrapur
  * Tenure: 2022 onward, until Mrs. Vasumana Pant assumed charge.
- Limitation: Do NOT invent previous postings, current postings, or career details for former Collectors.

3. HISTORICAL DATA COVERAGE & LIMITATIONS:
- historical_data_coverage: Partial
- coverage_note: The supplied sources do not contain a complete list of all Chandrapur District Collectors for the last 15 years.
- Response pattern when asked for a complete 15-year list (e.g., "2011 se 2020 tak saare collectors ki list do" / "Last 15 years collectors list"):
  * Hindi: "उपलब्ध स्रोत में पिछले 15 वर्षों के सभी कलेक्टरों की पूरी सूची नहीं है। स्रोत में निम्न कलेक्टर दर्ज हैं:
  1. Ajay Gulhane, IAS – 2020–2022
  2. G.C. Vinay Gowda, IAS – 2022 से Vasumana Pant के पदभार संभालने तक
  3. Vasumana Pant, IAS – वर्तमान जिला कलेक्टर के रूप में स्रोत में दर्ज"
  * English: "The supplied source does not contain a complete 15-year list. It records Ajay Gulhane, G.C. Vinay Gowda and the current Collector Vasumana Pant."

4. OTHER CURRENT COLLECTORATE OFFICERS:
- Additional District Collector: Dr. Nitin Vyawahare (डॉ. नितिन व्यवहारे)
  * Phone: 07172-256101
  * Email: addcoll.chanda@gmail.com
- Resident Deputy Collector (RDC): Mr. D. S. Kumbhar (श्री डी. एस. कुंभार)
  * Phone: 07172-255400
  * Email: chandrapur.rdc@gmail.com
- Sub-Divisional Officer – EGS & Election: Mr. Shubham Dandekar (श्री शुभम दांडेकर)
  * Responsibilities: Employment Guarantee Scheme (EGS), Election Branch
- Land Acquisition Officer: Mr. Sanjay Pawar (श्री संजय पवार)
  * Sub-Divisional Officer responsible for Land Acquisition
- District Mining Officer (DMO): Mr. S. S. Naitam (श्री एस. एस. नैताम)
  * Phone: 07172-272690
  * Email: miningofficer.chanda@gmail.com
  * Department: District Mining Department / DMFT & Mineral Administration
- District Rehabilitation Officer: Mr. Atul Jatale
- District Supply Officer: Mr. R.R. Bahadurkar
- District Planning Officer: Mr. Sanjay Kadu
- District Nagar Palika Officer: Smt. Vidya Gaikwad

5. COLLECTORATE DIRECTORY QUICK-REFERENCE TABLE:
- CURRENT DISTRICT COLLECTOR: Mrs. Vasumana Pant, IAS | Phone: 07172-255300 | Fax: 07172-255500 | Email: collector.chandrapur@maharashtra.gov.in
- ADDITIONAL DISTRICT COLLECTOR: Dr. Nitin Vyawahare | Phone: 07172-256101 | Email: addcoll.chanda@gmail.com
- RESIDENT DEPUTY COLLECTOR (RDC): Mr. D. S. Kumbhar | Phone: 07172-255400 | Email: chandrapur.rdc@gmail.com
- DISTRICT MINING OFFICER (DMO): Mr. S. S. Naitam | Phone: 07172-272690 | Email: miningofficer.chanda@gmail.com
- EGS & ELECTION OFFICER: Mr. Shubham Dandekar
- LAND ACQUISITION OFFICER: Mr. Sanjay Pawar
    `,
    keywords: [
      "chandrapur collector", "district collector chandrapur", "district magistrate chandrapur", "dm chandrapur",
      "collector office chandrapur", "collectorate chandrapur", "vasumana pant", "वसुमाना पंत",
      "ajay gulhane", "अजय गुल्हाने", "vinay gowda", "विनय गौड़ा", "nitin vyawahare", "नितिन व्यवहारे",
      "d.s. kumbhar", "डी. एस. कुंभार", "shubham dandekar", "शुभम दांडेकर", "sanjay pawar", "संजय पवार",
      "s.s. naitam", "एस. एस. नैताम", "district mining officer", "dmo", "07172-255300", "07172-255500",
      "07172-256101", "07172-255400", "07172-272690", "collector.chandrapur@maharashtra.gov.in",
      "addcoll.chanda@gmail.com", "chandrapur.rdc@gmail.com", "miningofficer.chanda@gmail.com",
      "egs officer", "election branch officer", "land acquisition officer", "rdc", "previous collector", "former collector"
    ],
    entities: [
      "Mrs. Vasumana Pant, IAS", "Shri Ajay Gulhane, IAS", "G.C. Vinay Gowda, IAS",
      "Dr. Nitin Vyawahare", "Mr. D. S. Kumbhar", "Mr. Shubham Dandekar",
      "Mr. Sanjay Pawar", "Mr. S. S. Naitam"
    ],
    contacts: [
      "07172-255300 (Collector Office)",
      "07172-255500 (Fax)",
      "07172-256101 (Addl Collector Dr. Nitin Vyawahare)",
      "07172-255400 (RDC D.S. Kumbhar)",
      "07172-272690 (DMO S.S. Naitam)",
      "collector.chandrapur@maharashtra.gov.in",
      "addcoll.chanda@gmail.com",
      "chandrapur.rdc@gmail.com",
      "miningofficer.chanda@gmail.com"
    ],
    schemes: ["District Administration & Citizen Revenue Services"],
    departments: ["Revenue Department", "Collectorate", "General Administration", "Mining Branch"],
    officers: [
      "Mrs. Vasumana Pant (District Collector)",
      "Dr. Nitin Vyawahare (Additional Collector)",
      "Mr. D. S. Kumbhar (RDC)",
      "Mr. Shubham Dandekar (SDO EGS & Election)",
      "Mr. Sanjay Pawar (SDO Land Acquisition)",
      "Mr. S. S. Naitam (DMO)"
    ],
    deadlines: ["Public services SLA compliance"],
    amounts: [],
    eligibility: [],
    workflow: ["Public grievance submission", "Collectorate department routing", "Action disposal"],
    sourceConfidence: 1.0
  },
  {
    id: "chandrapur_zilla_parishad",
    title: "Zilla Parishad Governance, Chanda Jyoti Super-100 & Panchayat Samitis",
    category: "Chandrapur District Administration",
    subcategory: "Zilla Parishad Rural Governance",
    location: "Zilla Parishad Building, Chandrapur",
    sourceName: "Chandrapur District Administrative Knowledge Base",
    content: `
ZILLA PARISHAD (ZP) CHANDRAPUR BLUEPRINT:
1. Executive Leadership:
   - ZP President: Mrs. Sandhya Gurnule
   - ZP Vice President: Mrs. Rekha Karekar
   - Chief Executive Officer (CEO): Shri Pulkit Singh (IAS)
2. Core ZP Departments: Primary Education, Secondary Education, Women & Child Welfare (WCD Sakhi Center), Health Department, National Health Mission (NHM), Rural Water Supply, Soil & Water Conservation, Finance, DRDA.
3. Special Education Initiative: 'Chanda Jyoti Super-100' - Specialized coaching and guidance program for talented rural students preparing for competitive entrance examinations.
4. 15 Panchayat Samitis: Ballarpur, Bhadrawati, Brahmapuri, Nagbhid, Jiwati, Chandrapur, Warora, Chimur, Sindewahi, Mul, Sawali, Rajura, Korpana, Gondpipri, Pombhurna.
    `,
    keywords: ["zilla parishad", "zp", "sandhya gurnule", "rekha karekar", "pulkit singh", "chanda jyoti super-100", "super 100", "panchayat samiti", "ballarpur", "bhadrawati", "brahmapuri", "nagbhid", "jiwati"],
    entities: ["Zilla Parishad Chandrapur", "Panchayat Samitis Chandrapur"],
    contacts: ["07172-251597 (ZP Office)"],
    schemes: ["Chanda Jyoti Super-100", "Rural Development Schemes"],
    departments: ["Zilla Parishad", "Rural Development Department", "Education Department"],
    officers: ["ZP CEO (Shri Pulkit Singh)", "ZP President (Mrs. Sandhya Gurnule)"],
    deadlines: ["Academic and scheme execution calendar"],
    amounts: ["ZP rural infrastructure grants"],
    eligibility: ["Rural residents, students, and farmers of Chandrapur district"],
    workflow: ["Gram Panchayat proposal", "Panchayat Samiti review", "ZP approval"],
    sourceConfidence: 1.0
  },
  {
    id: "chandrapur_municipal_corporation_cmc",
    title: "Chandrapur Municipal Corporation (CMC) Leadership & Civic Services",
    category: "Chandrapur District Administration",
    subcategory: "Municipal Civic Services",
    location: "CMC Office, Gandhichowk Road, Chandrapur",
    sourceName: "Chandrapur District Administrative Knowledge Base",
    content: `
CHANDRAPUR MUNICIPAL CORPORATION (CMC) BLUEPRINT:
1. Executive Leadership:
   - Mayor: Mrs. Sangeeta Khandekar
   - Deputy Mayor: Mr. Prashant Danav
   - Municipal Commissioner: Shri Akunuri Naresh (IAS)
2. Contact Channels:
   - Office Address: Gandhichowk Road, Chandrapur
   - Main Telephone: 07172-250220
   - Toll-Free Helpline: 1800-309-7040
   - Official WhatsApp Chatbot: 8530006063
3. Key Civic Services & Permissions:
   - Property Tax payment and building plan approvals
   - Birth and Death Certificate issuance
   - Temporary Hoarding License & Stage/Mandap Permission
   - Tree Cutting Permission
   - Complaint against Illegal Hoardings & General Civic Grievances
   - Heat Mitigation Action Mandate (Enforces mandatory outdoor labor rest between 12:00 PM and 4:00 PM during Orange/Red heatwave alerts)
    `,
    keywords: ["cmc", "chandrapur municipal corporation", "sangeeta khandekar", "prashant danav", "akunuri naresh", "07172-250220", "1800-309-7040", "8530006063", "hoarding license", "illegal hoarding", "mandap permission", "tree cutting", "property tax", "gandhichowk"],
    entities: ["Chandrapur Municipal Corporation (CMC)"],
    contacts: ["07172-250220", "1800-309-7040", "8530006063 (WhatsApp Chatbot)"],
    schemes: ["CMC Digital Civic Services Portal"],
    departments: ["Urban Local Body", "Municipal Corporation"],
    officers: ["Municipal Commissioner (Shri Akunuri Naresh)", "Mayor (Mrs. Sangeeta Khandekar)"],
    deadlines: ["7 to 15 days TAT for civic permissions"],
    amounts: ["Municipal user fees & property tax rates"],
    eligibility: ["Urban residents and commercial establishments in Chandrapur city"],
    workflow: ["Online/offline application to CMC", "Field inspection", "Permission license issuance"],
    sourceConfidence: 1.0
  },
  {
    id: "chandrapur_police_admin_directory",
    title: "Chandrapur Police Headquarters, SDPOs & 34 Police Stations Directory",
    category: "Police Administration & Legal",
    subcategory: "Police Directory & Phonetic Aliases",
    location: "SP Office & Police Stations, Chandrapur District",
    sourceName: "Chandrapur District Administrative Knowledge Base",
    content: `
POLICE DIRECTORY & PHONETIC TRANSCRIPTION MAP:
1. Executive Police Command:
   - Superintendent of Police (SP) Office: 07172-255100 / 07172-273258
   - Additional SP Office: 07172-255102
   - Emergency Response Control Room: 112 / 07172-255100
2. Sub-Divisional Police Officers (SDPOs):
   - SDPO Chandrapur, SDPO Rajura, SDPO Bramhapuri, SDPO Mul, SDPO Warora, SDPO Gadchandur.
3. Key Police Stations:
   - Ramnagar PS: 07172-252139
   - City PS, Ghugus PS, Ballarpur PS, Bhadrawati PS, Warora PS, Bramhapuri PS, Rajura PS, Korpana PS, Sawali PS, Nagbhid PS, Chimur PS, Gondpipri PS, Pombhurna PS, Jiwati PS, Mul PS, Sindewahi PS.
4. Voice Phonetic Normalization Map (Normalizes STT mishearings):
   - "coating" -> Korpana Police Station
   - "shadow" -> Sawali Police Station
   - "boghugus" -> Ghugus Police Station
   - "Nagbudd" -> Nagbhid Police Station
   - "Bhadgavati" -> Bhadravati Police Station
    `,
    keywords: ["police", "sp office", "07172-255100", "07172-273258", "07172-252139", "ramnagar ps", "coating", "korpana", "shadow", "sawali", "boghugus", "ghugus", "nagbudd", "nagbhid", "bhadgavati", "bhadrawati", "sdpo"],
    entities: ["Chandrapur Police Department", "SP Office Chandrapur"],
    contacts: ["112 (Police Emergency)", "07172-255100 (SP Office)", "07172-252139 (Ramnagar PS)"],
    schemes: ["Maharashtra Police Citizen Portal"],
    departments: ["Police Department", "Home Department"],
    officers: ["Superintendent of Police", "Addl SP", "SDPO", "SHO"],
    deadlines: ["Immediate response via 112"],
    amounts: ["Free copy of FIR under Sec 154 CrPC"],
    eligibility: ["Citizens requiring law and order assistance"],
    workflow: ["Call 112 / Visit PS", "Statement recording", "FIR / e-FIR registration"],
    sourceConfidence: 1.0
  },
  {
    id: "chandrapur_grievance_redressal_portal",
    title: "Aaple Sarkar Grievance Portal & Hello Chanda District Support",
    category: "Land Revenue & Grievance Redressal",
    subcategory: "Public Grievance Portals",
    location: "Chandrapur District & State Portals",
    sourceName: "Chandrapur District Administrative Knowledge Base",
    content: `
PUBLIC GRIEVANCE REDRESSAL MECHANISMS:
1. Centralized Maharashtra Portal (Aaple Sarkar):
   - Official Web Portal: grievances.maharashtra.gov.in
   - Toll-Free Support: 1800-120-8040
   - Features: Online complaint filing against any state government department, real-time SMS tracking, and a mandatory statutory 21-day legal resolution timeline.
2. District Local Portal (Hello Chanda):
   - Web Address: hellochanda.in
   - Purpose: Direct district-level citizen support center for lodging grievances regarding municipal, revenue, and rural administration services in Chandrapur district.
    `,
    keywords: ["grievance", "complaint", "aaple sarkar", "grievances.maharashtra.gov.in", "1800-120-8040", "21 day timeline", "hello chanda", "hellochanda.in"],
    entities: ["Aaple Sarkar Portal", "District Grievance Redressal Cell"],
    contacts: ["1800-120-8040 (State Grievance Toll-Free)", "07172-251597 (Collectorate Cell)"],
    schemes: ["Aaple Sarkar Citizen Services & Grievances"],
    departments: ["General Administration Department"],
    officers: ["District Collector", "District Nodal Officer"],
    deadlines: ["Mandatory 21-day resolution TAT"],
    amounts: ["Free public service"],
    eligibility: ["All citizens with unresolved administrative issues"],
    workflow: ["Lodge complaint online", "System routes to Nodal Officer", "21-day resolution & SMS feedback"],
    sourceConfidence: 1.0
  },
  {
    id: "chandrapur_illegal_moneylending_complaint",
    title: "Illegal Moneylending Harassment Complaint SOP & Cooperative Helpline",
    category: "Land Revenue & Grievance Redressal",
    subcategory: "Illegal Moneylender Complaint",
    location: "Collectorate & Cooperative Dept, Chandrapur",
    sourceName: "Chandrapur District Administrative Knowledge Base",
    content: `
ILLEGAL MONEYLENDER HARASSMENT COMPLAINT SOP:
1. Protection Mechanism: Safeguards farmers and vulnerable citizens against exorbitant interest rates and extortionate harassment by unauthorized/unlicensed moneylenders.
2. Official Complaint Registration Channels:
   - District Collector Office (Grievance Cell)
   - Respective Tehsil Revenue Office (Tehsildar)
   - Cooperative Department (Office of District Special Auditor / Assistant Registrar of Co-operative Societies)
3. Cooperative Department Dedicated Toll-Free Helpline: 1800-233-8691
4. Guidance Note: Lisa explains the formal complaint registration procedure under the Maharashtra Money-Lending (Regulation) Act and guides victims to the Cooperative Department / Tehsil Office without acting as a judicial/executive authority.
    `,
    keywords: ["moneylender", "illegal moneylender", "sahukar", "harassment", "cooperative department", "1800-233-8691", "18002338691", "exorbitant interest", "extortion"],
    entities: ["Cooperative Department Chandrapur", "District Collectorate Chandrapur"],
    contacts: ["1800-233-8691 (Cooperative Toll-Free)", "07172-251597 (Collectorate)"],
    schemes: ["Maharashtra Money-Lending (Regulation) Protection"],
    departments: ["Cooperative Department", "Revenue Department", "Police Department"],
    officers: ["Assistant Registrar Cooperative Societies", "District Special Auditor", "Tehsildar"],
    deadlines: ["Immediate enquiry initiation upon formal complaint"],
    amounts: ["Legal limits on interest under Money-Lending Regulation Act"],
    eligibility: ["Any victim of unlicensed or exorbitant moneylender harassment in Chandrapur"],
    workflow: ["Submit written complaint with proof to Cooperative Dept / Tehsildar", "1800-233-8691 helpline log", "Joint enquiry & legal action"],
    sourceConfidence: 1.0
  },
  {
    id: "chandrapur_welfare_ladki_bahin",
    title: "Mukhyamantri Majhi Ladki Bahin Yojana Eligibility & Application SOP",
    category: "Welfare Schemes",
    subcategory: "Women Welfare",
    location: "Chandrapur District, Maharashtra",
    sourceName: "Chandrapur District Administrative Knowledge Base",
    content: `
MUKHYAMANTRI MAJHI LADKI BAHIN YOJANA SOP:
1. Objective: Direct monthly financial independence for women in Maharashtra.
2. Financial Benefit: ₹1,500 per month (₹18,000 per year) via Direct Benefit Transfer (DBT) to Aadhaar-linked bank account.
3. Eligibility Criteria:
   - Target Group: Women aged 21 to 65 years.
   - Income Limit: Family annual income <= ₹2,50,000 (Income certificate condition WAIVED for Yellow and Orange Ration Cardholders).
   - Domicile: Permanent resident/domicile of Maharashtra (minimum 5 years residency).
   - Status: Married, Widowed, Divorced, Separated, Abandoned/destitute, or 1 unmarried woman per family.
4. Exclusions: Family member is a government employee, income taxpayer, constitutional/elected post holder, owns a 4-wheeler (except tractor), or receiving ₹1,500+ monthly from another state scheme.
5. Required Documents: Passport photo, Aadhaar Card, Maharashtra Domicile Certificate / Yellow or Orange Ration Card / Voter ID / Birth Cert, Income certificate (where applicable), Aadhaar-linked & NPCI-mapped Bank Passbook.
6. Application Channels: Ladki Bahin Portal (ladakibahin.maharashtra.gov.in), Nari Shakti Doot App, Anganwadi Desks, Gram Panchayat Setu Kendra, CSC.
    `,
    keywords: ["ladki bahin", "majhi ladki bahin", "लाडकी बहीण", "1500", "ladakibahin.maharashtra.gov.in", "nari shakti doot", "women welfare", "250000 income"],
    entities: ["Department of Women and Child Development (WCD)", "Gram Panchayat / Anganwadi Desks"],
    contacts: ["07172-251597 (WCD Branch ZP Chandrapur)"],
    schemes: ["Mukhyamantri Majhi Ladki Bahin Yojana"],
    departments: ["Women and Child Development Department"],
    officers: ["District Programme Officer WCD", "Anganwadi Workers"],
    deadlines: ["Mandatory e-KYC on portal"],
    amounts: ["₹1,500 per month (₹18,000 per year)"],
    eligibility: ["Women aged 21-65 years with family income <= ₹2.5 Lakh or Yellow/Orange ration card"],
    workflow: ["Portal/App registration", "Aadhaar e-KYC verification", "Tehsil WCD scrutiny", "Monthly DBT payment"],
    sourceConfidence: 1.0
  },
  {
    id: "chandrapur_welfare_saur_krishi_pump",
    title: "Magel Tyala Saur Krishi Pump Yojana (Solar Irrigation Pump) SOP",
    category: "Welfare Schemes",
    subcategory: "Agrarian / Solar Energy",
    location: "Chandrapur District, Maharashtra",
    sourceName: "Chandrapur District Administrative Knowledge Base",
    content: `
MAGEL TYALA SAUR KRISHI PUMP YOJANA SOP:
1. Objective: Off-grid solar photovoltaic irrigation pumps for farmers to ensure reliable daytime farm watering.
2. Pump Sizing Slabs:
   - Up to 2.5 acres land -> 3 HP Solar Pump
   - 2.5 to 5.0 acres land -> 5 HP Solar Pump
   - More than 5.0 acres land -> 7.5 HP Solar Pump
3. Subsidy & Share:
   - General Category Farmers: ~90% State/Central Subsidy (10% farmer contribution).
   - SC / ST Category Farmers: ~95% Subsidy (5% farmer contribution).
   - Warranty: 5-year comprehensive repair & maintenance warranty included.
4. Eligibility: Maharashtra farmer with land in applicant's name (valid 7/12) without existing grid agricultural pump connection or on official waitlist.
5. Required Documents: Aadhaar Card, 7/12 extract & 8-A extract, Caste cert (for SC/ST subsidy), Aadhaar-linked Bank Passbook, photo.
6. Application Portal: MSEDCL Renewable Energy Portal / Maharashtra Energy Dept portal.
    `,
    keywords: ["solar pump", "saur krishi pump", "magel tyala saur krishi pump", "3 hp", "5 hp", "7.5 hp", "msedcl", "solar subsidy", "90 percent subsidy", "95 percent subsidy", "5 year warranty"],
    entities: ["MSEDCL (Mahadiscom)", "Department of Energy Maharashtra", "Agriculture Department"],
    contacts: ["07172-251597 (Agriculture Branch ZP)"],
    schemes: ["Magel Tyala Saur Krishi Pump Yojana"],
    departments: ["Energy Department", "Agriculture Department", "MSEDCL"],
    officers: ["Executive Engineer MSEDCL", "District Agriculture Officer"],
    deadlines: ["Application windows announced on MSEDCL portal"],
    amounts: ["90% to 95% solar pump subsidy"],
    eligibility: ["Farmers with valid 7/12 land records without grid pumps"],
    workflow: ["Online portal application", "7/12 land verification", "Farmer share payment", "Solar pump installation & 5-yr warranty"],
    sourceConfidence: 1.0
  },
  {
    id: "chandrapur_welfare_mjpjay_health",
    title: "Mahatma Jyotirao Phule Jan Arogya Yojana (MJPJAY) Cashless Healthcare SOP",
    category: "Welfare Schemes",
    subcategory: "Healthcare Coverage",
    location: "Empanelled Hospitals in Chandrapur District",
    sourceName: "Chandrapur District Administrative Knowledge Base",
    content: `
MAHATMA JYOTIRAO PHULE JAN AROGYA YOJANA (MJPJAY) SOP:
1. Overview: Integrated cashless health assurance scheme in Maharashtra.
2. Financial Coverage:
   - Categories A, B, C, E: ₹5,00,000 per family per year on floater basis (1,356 medical/surgical packages across 34 specialties).
   - Category D (Road Traffic Accidents in Maharashtra): ₹1,00,000 per person (184 accident packages).
3. Eligible Categories:
   - Category A: Yellow, AAY, Annapurna, Orange ration cardholder families.
   - Category B: White ration cardholders / domiciles without ration cards.
   - Category C: Orphans, shelter home women, old age home seniors, journalists, registered construction workers.
   - Category D: Road traffic accident victims in Maharashtra.
   - Category E: Residents of 865 border villages along Maharashtra-Karnataka border.
4. Application / Treatment Workflow:
   - Visit Arogyamitra Helpdesk at Civil Hospital Chandrapur or empanelled private hospitals.
   - Present Ration Card / Domicile & Aadhaar Card. Arogyamitra initiates online pre-authorization for 100% cashless treatment.
5. Helplines: 155388 / 1800-233-2200 (24x7 Toll Free).
    `,
    keywords: ["mjpjay", "mahatma jyotirao phule jan arogya", "5 lakh health cover", "cashless treatment", "arogyamitra", "155388", "1800-233-2200", "road accident 1 lakh", "1356 packages"],
    entities: ["State Health Assurance Society", "Civil Hospital Chandrapur", "Empanelled Hospitals"],
    contacts: ["155388 (MJPJAY Helpline)", "1800-233-2200 (MJPJAY Toll Free)", "07172-253275 (Civil Surgeon Office)"],
    schemes: ["Mahatma Jyotirao Phule Jan Arogya Yojana (MJPJAY)"],
    departments: ["Public Health Department"],
    officers: ["Civil Surgeon Chandrapur", "District Coordinator MJPJAY", "Arogyamitra"],
    deadlines: ["Immediate pre-authorization at hospital admission"],
    amounts: ["Up to ₹5,00,000 cashless cover per family per year"],
    eligibility: ["Ration cardholder families, domiciles, accident victims in Maharashtra"],
    workflow: ["Arogyamitra desk verification", "Online pre-authorization", "Cashless treatment & surgery"],
    sourceConfidence: 1.0
  },
  {
    id: "chandrapur_welfare_sanjay_gandhi_shravanbal",
    title: "Sanjay Gandhi Niradhar Anudan Yojana & Shravanbal Seva Yojana SOP",
    category: "Welfare Schemes",
    subcategory: "Social Security Pensions",
    location: "Chandrapur District, Maharashtra",
    sourceName: "Chandrapur District Administrative Knowledge Base",
    content: `
SANJAY GANDHI NIRADHAR & SHRAVANBAL SEVA YOJANA SOP:
1. Benefits: ₹1,500 per month via DBT into Aadhaar-linked bank account.
2. Sanjay Gandhi Niradhar Anudan Yojana: Age 18 to 65 years. Destitute persons, widows, orphans, divorcees, deserted women, Divyangjan (40%+ disability), and terminally ill patients. Family annual income <= ₹21,000.
3. Shravanbal Seva Rajya Nivruttivetan Yojana: Destitute senior citizens aged 65 years and above with family annual income <= ₹21,000.
4. Required Documents: Aadhaar, Maharashtra Domicile, Income Certificate from Tehsildar (<= ₹21,000), Aadhaar-seeded Bank Passbook, Category proof.
5. Online System & Offline Desk: sas.mahait.org / MahaDBT; Tehsil Revenue Desk -> Sanction by Taluka Sanjay Gandhi Committee.
    `,
    keywords: ["sanjay gandhi niradhar", "shravanbal", "pension", "widow pension", "divyang pension", "1500 pension", "21000 income", "tehsildar income cert", "sas.mahait.org"],
    entities: ["Social Justice and Special Assistance Department", "Taluka Sanjay Gandhi Niradhar Committee"],
    contacts: ["07172-251597 (Social Welfare Department)"],
    schemes: ["Sanjay Gandhi Niradhar Anudan Yojana", "Shravanbal Seva Rajya Nivruttivetan Yojana"],
    departments: ["Social Justice Department", "Revenue Department"],
    officers: ["Tehsildar", "Sub-Divisional Officer (SDO)", "District Social Welfare Officer"],
    deadlines: ["Annual Life Certificate (Hayat Dakhla) due annually"],
    amounts: ["₹1,500 per month pension"],
    eligibility: ["Destitute, widows, 40%+ Divyang, terminally ill (18-65 yrs) or destitute seniors (65+ yrs) with family income <= ₹21,000"],
    workflow: ["Tehsil dossier submission", "Talathi field inquiry", "Tehsildar review", "Committee sanction", "Monthly DBT"],
    sourceConfidence: 1.0
  },
  {
    id: "chandrapur_welfare_cm_vayoshree",
    title: "Chief Minister Vayoshree Yojana (Senior Citizen Grant) SOP",
    category: "Welfare Schemes",
    subcategory: "Senior Citizen Welfare",
    location: "Chandrapur District, Maharashtra",
    sourceName: "Chandrapur District Administrative Knowledge Base",
    content: `
CHIEF MINISTER VAYOSHREE YOJANA SOP:
1. Objective: Support senior citizens with assistive devices, physical therapy equipment, and mental health aids.
2. Eligibility:
   - Permanent resident of Maharashtra aged 65 years and above.
   - Annual family income <= ₹2,00,000 (₹2 Lakh).
   - Self-declaration confirming non-receipt of similar equipment/grants in the past 3 years.
3. Financial Benefit: One-time ₹3,000 Direct Benefit Transfer (DBT) into Aadhaar-linked bank account.
4. Required Documents: Aadhaar Card, Age proof, Income certificate/self-declaration, Non-receipt declaration, Bank account details.
5. Online Portal: cmvayoshree.mahait.org / Assistant Commissioner Social Welfare Office Chandrapur.
    `,
    keywords: ["vayoshree", "cm vayoshree", "chief minister vayoshree", "cmvayoshree.mahait.org", "senior citizen 65", "65 saal", "3000 dbt", "assistive device"],
    entities: ["Social Justice Department Maharashtra", "Assistant Commissioner Social Welfare Chandrapur"],
    contacts: ["07172-251597 (Social Welfare Desk)"],
    schemes: ["Chief Minister Vayoshree Yojana"],
    departments: ["Social Justice and Special Assistance Department"],
    officers: ["Assistant Commissioner Social Welfare", "District Collector"],
    deadlines: ["Portal application window"],
    amounts: ["One-time ₹3,000 DBT"],
    eligibility: ["Seniors aged 65+ with family income <= ₹2 Lakh"],
    workflow: ["Online registration on cmvayoshree.mahait.org", "Document verification", "DBT disbursement"],
    sourceConfidence: 1.0
  },
  {
    id: "chandrapur_welfare_namo_shetkari",
    title: "Namo Shetkari Maha Samman Nidhi & PM-KISAN Top-Up SOP",
    category: "Welfare Schemes",
    subcategory: "Agrarian Welfare",
    location: "Chandrapur District, Maharashtra",
    sourceName: "Chandrapur District Administrative Knowledge Base",
    content: `
NAMO SHETKARI MAHA SAMMAN NIDHI YOJANA SOP:
1. Benefits: State top-up of ₹6,000 per year (3 installments of ₹2,000 each) alongside Central PM-KISAN (₹6,000 per year). Total combined benefit is ₹12,000 per year.
2. Eligibility: Active beneficiary of PM-KISAN in Maharashtra with land records (7/12 & 8-A), active Aadhaar e-KYC, and NPCI-mapped bank account. Non-income taxpayer.
3. Portal & Verification: pmkisan.gov.in / nsmny.mahait.org. No separate registration required for verified PM-KISAN farmers. For land seeding or e-KYC issues, visit Talathi / Agriculture Officer.
    `,
    keywords: ["namo shetkari", "pm kisan", "12000 farmer", "nsmny.mahait.org", "land seeding", "2000 installment", "6000 top up"],
    entities: ["PM-KISAN Portal", "Agriculture Department Chandrapur"],
    contacts: ["07172-251597 (District Agriculture Office)"],
    schemes: ["Namo Shetkari Maha Samman Nidhi Yojana", "PM-KISAN"],
    departments: ["Agriculture Department", "Revenue Department"],
    officers: ["District Agriculture Officer", "Tehsildar", "Talathi"],
    deadlines: ["Active land seeding and e-KYC"],
    amounts: ["₹6,000 Namo Shetkari + ₹6,000 PM-KISAN = ₹12,000/year"],
    eligibility: ["Landholding farmer families active on PM-KISAN"],
    workflow: ["Land seeding verification", "Aadhaar e-KYC", "NPCI bank mapping", "Automated DBT"],
    sourceConfidence: 1.0
  },
  {
    id: "chandrapur_welfare_yuva_karya_prashikshan",
    title: "Mukhyamantri Yuva Karya Prashikshan Yojana (Youth Internship & Stipend) SOP",
    category: "Welfare Schemes",
    subcategory: "Youth & Employment Training",
    location: "Chandrapur District, Maharashtra",
    sourceName: "Chandrapur District Administrative Knowledge Base",
    content: `
MUKHYAMANTRI YUVA KARYA PRASHIKSHAN YOJANA SOP:
1. Objective: 6-month hands-on industrial and practical job training to improve youth employability.
2. Monthly Stipend Slabs:
   - 12th Pass / ITI Candidates: ₹6,000 per month
   - Diploma Holders: ₹8,000 per month
   - Graduates / Post-Graduates: ₹10,000 per month
3. Eligibility: Unemployed youth residing in Maharashtra aged 18 to 35 years.
4. Application Portal: rojgar.mahaswayam.gov.in (Mahaswayam Portal).
5. Workflow: Register as job seeker -> Upload education & domicile certificates -> Apply to employer training vacancies -> Complete 6-month internship with monthly DBT stipend.
    `,
    keywords: ["yuva karya prashikshan", "youth internship", "stipend", "rojgar.mahaswayam.gov.in", "mahaswayam", "10000 stipend", "8000 stipend", "6000 stipend", "graduate internship"],
    entities: ["Skill Development, Employment and Entrepreneurship Department", "Mahaswayam Portal"],
    contacts: ["07172-251597 (District Skill Development Office)"],
    schemes: ["Mukhyamantri Yuva Karya Prashikshan Yojana"],
    departments: ["Skill Development Department"],
    officers: ["District Skill Development Officer"],
    deadlines: ["Ongoing vacancy applications"],
    amounts: ["Stipend ₹6k, ₹8k, ₹10k per month"],
    eligibility: ["Unemployed youth (12th/ITI/Diploma/Graduate/PG) aged 18-35"],
    workflow: ["Mahaswayam registration", "Profile completion & document upload", "Vacancy application", "6-month internship"],
    sourceConfidence: 1.0
  },
  {
    id: "chandrapur_welfare_mahadbt_scholarships",
    title: "MahaDBT Post-Matric Scholarships & Youth Yuva Karya Prashikshan SOP",
    category: "Welfare Schemes",
    subcategory: "Education & Youth Welfare",
    location: "Chandrapur District, Maharashtra",
    sourceName: "Chandrapur District Administrative Knowledge Base",
    content: `
MAHADBT SCHOLARSHIPS & YUVA KARYA PRASHIKSHAN SOP:
1. MahaDBT Post-Matric Scholarships: Full tuition and examination fee waivers + maintenance allowance (₹160 to ₹1,200/month) for SC, ST, OBC, VJNT, SBC, and EBC students studying in post-secondary institutions. Apply via mahadbt.maharashtra.gov.in.
2. Dr. Panjabrao Deshmukh Hostel Maintenance Allowance: Up to ₹38,000 per year for students staying in private/approved hostels whose parents are registered farmers or low-income workers.
3. Mukhyamantri Yuva Karya Prashikshan Yojana: 6-month practical internship stipend for youth (12th/ITI: ₹6k; Diploma: ₹8k; Graduates/PG: ₹10k).
    `,
    keywords: ["mahadbt", "scholarship", "post matric scholarship", "panjabrao deshmukh hostel", "yuva karya prashikshan", "stipend"],
    entities: ["MahaDBT Portal", "Social Justice / Tribal Development Department"],
    contacts: ["07172-251597 (Social Welfare / ITDP Desk)"],
    schemes: ["MahaDBT Post-Matric Scholarship", "Dr. Panjabrao Deshmukh Hostel Allowance", "Mukhyamantri Yuva Karya Prashikshan Yojana"],
    departments: ["Higher Education Department", "Social Justice Department"],
    officers: ["District Social Welfare Officer", "Project Officer ITDP"],
    deadlines: ["MahaDBT annual registration deadlines"],
    amounts: ["Hostel allowance up to ₹38,000/yr; Internship stipend ₹6k-₹10k/month"],
    eligibility: ["Eligible SC/ST/OBC/VJNT/EBC students enrolled in recognized courses"],
    workflow: ["Online registration on MahaDBT", "College verification", "Department scrutiny", "Direct DBT"],
    sourceConfidence: 1.0
  },
  {
    id: "chandrapur_welfare_pik_vima_crop_insurance",
    title: "Pradhan Mantri Fasal Bima Yojana (Pik Vima / ₹1 Crop Insurance) SOP",
    category: "Welfare Schemes",
    subcategory: "Crop Insurance",
    location: "Chandrapur District, Maharashtra",
    sourceName: "Chandrapur District Administrative Knowledge Base",
    content: `
PRADHAN MANTRI FASAL BIMA YOJANA (PIK VIMA) SOP:
1. Overview: Popularly known as the "₹1 Crop Insurance Scheme" in Maharashtra. Farmers enroll their crops by paying a nominal token fee of ₹1.
2. Coverage: Financial protection against localized crop damage caused by drought, unseasonal heavy rainfall, hail, flood inundation, or pest attacks.
3. Intimation Workflow for Crop Loss:
   - MANDATORY DEADLINE: Crop loss MUST be reported within 72 hours of occurrence.
   - Reporting Channels: Crop Insurance Mobile App (PMFBY App) / Toll-free number of empanelled insurance company / Intimation form submitted to Taluka Agriculture Officer or bank branch.
   - Survey & Sanction: Joint survey conducted by Insurance Company Representative, Agriculture Officer, and Talathi followed by direct compensation transfer.
    `,
    keywords: ["pik vima", "1 rupee crop insurance", "crop insurance", "pmfby", "72 hours crop loss", "crop loss intimation", "fasal bima"],
    entities: ["Empanelled Crop Insurance Company", "Agriculture Department Chandrapur"],
    contacts: ["18001801551 (PMFBY Toll Free)", "07172-251597 (District Agriculture Office)"],
    schemes: ["Pradhan Mantri Fasal Bima Yojana (Pik Vima)"],
    departments: ["Agriculture Department"],
    officers: ["District Agriculture Officer", "Taluka Agriculture Officer (TAO)"],
    deadlines: ["Loss reporting MANDATORY within 72 hours"],
    amounts: ["₹1 enrollment fee; Compensation calculated per loss assessment"],
    eligibility: ["All farmers (owner or tenant) cultivating notified crops in Chandrapur"],
    workflow: ["₹1 portal enrollment", "72-hour loss intimation", "Joint field survey", "Direct claim settlement"],
    sourceConfidence: 1.0
  },
  {
    id: "chandrapur_welfare_pmay_housing",
    title: "PMAY (Gramin & Urban) & Ramai Awas Housing Assistance SOP",
    category: "Welfare Schemes",
    subcategory: "Housing",
    location: "Chandrapur District, Maharashtra",
    sourceName: "Chandrapur District Administrative Knowledge Base",
    content: `
PMAY & RAMAI AWAS HOUSING SCHEMES SOP:
1. Pradhan Mantri Awas Yojana Gramin (PMAY-G) & Urban (PMAY-U): Financial assistance from ₹1.20 Lakh (Rural) to ₹2.50 Lakh (Urban) released in 4 construction stage-wise installments linked to geo-tagged progress.
2. Ramai Awas Yojana: Target Group: Scheduled Caste (SC) and Neo-Buddhist houseless families. Assistance: ₹1.32 Lakh (rural); ₹1.42 Lakh (hilly); ₹2.50 Lakh (urban). Additional Benefit: Mandatory ₹12,000 toilet construction grant under Swachh Bharat Mission + MGNREGA 90-day labor wages.
3. Atal Ghar Aawaas Yojana: Interest subsidy up to ₹1.80 Lakh on home loans under PMAY 2.0 convergence.
4. NOTICE ON MHADA: Detailed operational criteria/income brackets for MHADA lottery are not available in this demo source.
    `,
    keywords: ["pmay", "pmay gramin", "pmay urban", "ramai awas", "housing assistance", "12000 toilet grant", "atal ghar"],
    entities: ["Zilla Parishad DRDA Branch", "Chandrapur Municipal Corporation (CMC)"],
    contacts: ["07172-251597 (DRDA Housing Cell)"],
    schemes: ["PMAY-G", "PMAY-U", "Ramai Awas Yojana", "Atal Ghar Aawaas Yojana"],
    departments: ["Rural Development Department", "Urban Development Department"],
    officers: ["Project Director DRDA", "Municipal Commissioner CMC", "Block Development Officer (BDO)"],
    deadlines: ["Stage-wise geo-tagging approvals required for installment releases"],
    amounts: ["₹1.20L to ₹2.50L housing grant + ₹12k toilet grant"],
    eligibility: ["Houseless / kutcha house families listed in SECC / Awas Plus survey"],
    workflow: ["Gram Sabha list verification", "Sanction letter issuance", "Foundation geo-tagging", "Installment DBT"],
    sourceConfidence: 1.0
  },
  {
    id: "chandrapur_pesa_tribal_governance",
    title: "PESA Act Implementation & Gram Sabha Tribal Autonomy in Chandrapur",
    category: "Tribal Welfare & Governance",
    subcategory: "PESA Act 1996",
    location: "Scheduled Area Villages (Rajura, Jiwati, Korpana, Sawali, Chimur, etc.)",
    sourceName: "Chandrapur District Administrative Knowledge Base",
    content: `
PESA (PANCHAYATS EXTENSION TO SCHEDULED AREAS) IMPLEMENTATION:
1. Statutory Authority: Provisions of the Panchayats (Extension to Scheduled Areas) Act, 1996 in Scheduled Villages of Chandrapur district.
2. Gram Sabha Powers:
   - Ownership and management of Minor Forest Produce (MFP) including Bamboo and Tendupatta.
   - Mandatory prior consultation before land acquisition for development projects.
   - Control over local plans, tribal sub-plan funds, and beneficiary selection.
   - Mandatory recommendation before granting prospective mining licenses or leases for minor minerals.
   - Power to enforce prohibition or regulate/restrict the sale and consumption of liquor.
   - Power to prevent land alienation and restore unlawfully alienated land of Scheduled Tribes.
    `,
    keywords: ["pesa", "pesa act", "gram sabha", "tribal governance", "minor forest produce", "mfp", "bamboo", "tendupatta", "land alienation", "scheduled area"],
    entities: ["Gram Sabhas of Scheduled Villages", "Integrated Tribal Development Project (ITDP) Chandrapur"],
    contacts: ["07172-251597 (Collectorate Tribal Cell)"],
    schemes: ["PESA Gram Sabha Mobilization Fund"],
    departments: ["Tribal Development Department", "Revenue Department", "Forest Department"],
    officers: ["Project Officer ITDP Chandrapur", "District Collector", "Tehsildar"],
    deadlines: ["Gram Sabha resolution prior to project approvals"],
    amounts: ["100% MFP revenue retained by Gram Sabha"],
    eligibility: ["Scheduled Tribe residents in PESA notified villages"],
    workflow: ["Gram Sabha meeting quorum", "Resolution drafting for MFP / Land", "Submission to Tehsildar/ITDP"],
    sourceConfidence: 1.0
  },
  {
    id: "chandrapur_fra_forest_rights",
    title: "Forest Rights Act (FRA 2006) Workflow & Title Deed Issuance",
    category: "Tribal Welfare & Governance",
    subcategory: "Forest Rights Act (FRA)",
    location: "Forest Villages & Tribal Settlements, Chandrapur District",
    sourceName: "Chandrapur District Administrative Knowledge Base",
    content: `
FOREST RIGHTS ACT (FRA 2006) WORKFLOW:
1. Framework: Scheduled Tribes and Other Traditional Forest Dwellers (Recognition of Forest Rights) Act, 2006.
2. Claim Types:
   - Individual Forest Rights (IFR): Agricultural land cultivated prior to December 13, 2005.
   - Community Forest Rights (CFR / CFRR): Rights over community forest resources, grazing grounds, water bodies, and fuel-wood collection.
3. 3-Tier Approval Workflow:
   Step 1: Gram Sabha Forest Rights Committee (FRC) receives claims, verifies boundaries, passes resolution.
   Step 2: Sub-Divisional Level Committee (SDLC) chaired by SDO examines claims and prepares draft records.
   Step 3: District Level Committee (DLC) chaired by District Collector gives final sanction and issues formal title deeds (Patta).
    `,
    keywords: ["fra", "forest rights act", "ifr", "cfr", "patta", "title deed", "forest rights committee", "sdlc", "dlc", "van hakk"],
    entities: ["District Level Committee (DLC)", "Sub-Divisional Level Committee (SDLC)", "Forest Rights Committee (FRC)"],
    contacts: ["07172-251597 (Collectorate FRA Branch)"],
    schemes: ["FRA Title Deed Recognition Scheme"],
    departments: ["Tribal Development Department", "Forest Department", "Revenue Department"],
    officers: ["District Collector (DLC Chair)", "Sub-Divisional Officer (SDO / SDLC Chair)", "Deputy Conservator of Forests (DCF)"],
    deadlines: ["Statutory review timelines at SDLC and DLC"],
    amounts: ["Title deed granted up to 4 hectares for eligible IFR claims"],
    eligibility: ["Scheduled Tribes and Other Traditional Forest Dwellers (3 generations / 75 yrs residence) residing prior to Dec 13, 2005"],
    workflow: ["FRC resolution at Gram Sabha", "SDLC scrutiny", "DLC final approval by Collector", "Patta distribution"],
    sourceConfidence: 1.0
  },
  {
    id: "chandrapur_bamboo_brtc_chichpalli",
    title: "Bamboo Research and Training Centre (BRTC) Chichpalli Profile",
    category: "Tribal Welfare & Skill Development",
    subcategory: "BRTC Chichpalli",
    location: "Chichpalli, Chandrapur District",
    sourceName: "Chandrapur District Administrative Knowledge Base",
    content: `
BAMBOO RESEARCH AND TRAINING CENTRE (BRTC) CHICHPALLI:
1. Overview: State-of-the-art institute established near Chandrapur to promote bamboo-based crafts, structural engineering, and industrial applications.
2. Key Functions:
   - Livelihood Training: Artisanal training for local tribal youth in bamboo furniture, handicrafts, and structural construction.
   - Innovation & Design: Product design in collaboration with national design institutes.
   - Resource Center: Propagation of high-yielding bamboo species for commercial farming.
3. Public & Tribal Benefit: Direct employment generation, MSME setup assistance, and market linkage for tribal bamboo artisans.
    `,
    keywords: ["brtc", "brtc chichpalli", "bamboo research", "bamboo training", "chichpalli", "bamboo handicraft", "tribal skill"],
    entities: ["Bamboo Research and Training Centre (BRTC) Chichpalli", "Forest Department Maharashtra"],
    contacts: ["07172-251597 (BRTC Office / Forest Department)"],
    schemes: ["BRTC Skill Development & Livelihood Program"],
    departments: ["Forest Department", "Skill Development Department"],
    officers: ["Director BRTC Chichpalli", "Chief Conservator of Forests (CCF) Chandrapur"],
    deadlines: ["Regular batch admissions announced annually"],
    amounts: ["Subsidized/free training with stipend for tribal candidates"],
    eligibility: ["Local tribal youth and artisans of Chandrapur district"],
    workflow: ["Application to BRTC", "Selection & skill module training", "MSME startup toolkit distribution"],
    sourceConfidence: 1.0
  },
  {
    id: "chandrapur_land_revenue_712_ferfar",
    title: "Land Revenue Administration, Online 7/12 (Satbara) & e-Ferfar Mutation SOP",
    category: "Land Revenue Administration",
    subcategory: "e-Ferfar & 7/12 Mutation",
    location: "Tehsil Offices & Revenue Circles, Chandrapur District",
    sourceName: "Chandrapur District Administrative Knowledge Base",
    content: `
LAND REVENUE & e-FERFAR MUTATION SOP:
1. Online 7/12 (Satbara / सातबारा): Digitally signed 7/12 & 8A extracts available via Mahabhulekh portal / Aaple Sarkar.
2. e-Ferfar (Online Mutation) Workflow:
   - Step 1: Registration of Sale Deed/Will/Heirship at Sub-Registrar Office automatically triggers online mutation entry to Talathi.
   - Step 2: Talathi issues Form 9 Notice to all interested parties.
   - Step 3: Mandatory 15-day objection window.
   - Step 4: If no objection, Circle Officer verifies and approves e-Ferfar mutation. Updated 7/12 generated.
3. 7/12 Error Correction: Submit application with supporting old revenue records to Tehsildar Office / Setu Kendra.
4. Land Dispute Escalation Hierarchy: Talathi / Circle Officer -> Tehsildar -> Sub-Divisional Officer (SDO) -> Additional District Collector -> Divisional Commissioner Nagpur.
    `,
    keywords: ["7/12", "satbara", "सातबारा", "ferfar", "फेरफार", "mutation", "e-ferfar", "land dispute", "talathi", "tehsildar", "sdo", "mahabhulekh"],
    entities: ["Revenue Department Chandrapur", "Mahabhulekh Portal", "Sub-Registrar Office"],
    contacts: ["07172-251597 (Collectorate Revenue Desk)"],
    schemes: ["e-Ferfar Digital Land Records Modernization"],
    departments: ["Revenue and Land Records Department"],
    officers: ["Talathi", "Circle Officer", "Tehsildar", "Sub-Divisional Officer (SDO)"],
    deadlines: ["15-day notice period for e-Ferfar objections; 30-day overall TAT"],
    amounts: ["Statutory fee as per Maharashtra Land Revenue Code"],
    eligibility: ["Landholders and property buyers in Chandrapur district"],
    workflow: ["Deed registration", "Automated e-Ferfar trigger to Talathi", "Form 9 notice", "15-day objection period", "Circle Officer approval", "Updated 7/12"],
    sourceConfidence: 1.0
  },
  {
    id: "chandrapur_lokshahi_din_sop",
    title: "Lokshahi Din Public Grievance Redressal SOP & Timelines",
    category: "Land Revenue & Grievance Redressal",
    subcategory: "Lokshahi Din",
    location: "Collectorate, Zilla Parishad & Tehsil Offices, Chandrapur",
    sourceName: "Chandrapur District Administrative Knowledge Base",
    content: `
LOKSHAHI DIN (DEMOCRACY DAY) GRIEVANCE REDRESSAL SOP:
1. Schedule:
   - District Collectorate Lokshahi Din: 1st Monday of every month (Chaired by District Collector).
   - Zilla Parishad Lokshahi Din: 1st Monday of every month (Chaired by ZP CEO).
   - Tehsil Lokshahi Din: 3rd Monday of every month at Tehsildar Office (Chaired by Tehsildar).
2. Prerequisites: Citizen MUST have previously submitted the grievance to the concerned line department at least 15 days prior and received no satisfactory response.
3. Turnaround Time (TAT): Strict 21-day TAT on Aaple Sarkar Grievance Portal.
4. Exclusions: Matters sub-judice in court, service matters of government employees, second appeals without primary application.
    `,
    keywords: ["lokshahi din", "लोकशाही दिन", "grievance", "complaint", "collector lokshahi din", "tehsil lokshahi din", "aaple sarkar", "21 day tat"],
    entities: ["District Collectorate Chandrapur", "Zilla Parishad Chandrapur", "Tehsil Revenue Offices"],
    contacts: ["07172-251597 (Grievance Cell Collectorate)"],
    schemes: ["Aaple Sarkar Grievance Redressal System"],
    departments: ["General Administration Department", "Revenue Department"],
    officers: ["District Collector", "Zilla Parishad CEO", "Tehsildar"],
    deadlines: ["Held 1st Mon (Collectorate/ZP) and 3rd Mon (Tehsil); 21-day resolution TAT"],
    amounts: ["Free public service"],
    eligibility: ["Citizens of Chandrapur district with pending administrative grievances"],
    workflow: ["Primary department application (15 days prior)", "Lokshahi Din application submission", "Hearing on designated Monday", "21-day TAT resolution"],
    sourceConfidence: 1.0
  },
  {
    id: "chandrapur_history_gond_dynasty_heritage",
    title: "Chandrapur Historical Dossier, Gond Dynasty Chronology & Chanda Fort",
    category: "History & Cultural Heritage",
    subcategory: "Gond Dynasty & Fort Architecture",
    location: "Chandrapur City & Heritage Fort Circuit",
    sourceName: "Chandrapur District Administrative Knowledge Base",
    content: `
CHANDRAPUR HISTORICAL & HERITAGE DOSSIER:
1. Gond Dynasty Legacy:
   - Founded by Bhim Ballal Sing (1200s).
   - King Khandkia Ballal Sah (1400s) founded Chanda City & Chanda Fort after being cured of a skin condition by the sacred water spring at Mahakali Temple site.
   - Queen Rani Hirai (regent queen) constructed the iconic Mahakali Temple and completed the magnificent 11 km Chanda Fort stone wall.
2. Maratha Era & British Period: Annexed by the Maratha Bhonsles of Nagpur; later integrated under British Central Provinces.
3. Key Heritage Monuments:
   - Chanda Fort Wall: 11 km perimeter with 4 primary gates (Jatpura, Anchaleshwar, Pathanpura, Binba) and samadhi tombs of Gond Kings.
   - Mahakali Temple: Primary spiritual center of Chandrapur, annual Fair during Chaitra month.
   - Anchaleshwar Temple: Ancient Shiva shrine adjacent to Anchaleshwar Gate.
    `,
    keywords: ["history", "gond dynasty", "khandkia ballal sah", "rani hirai", "chanda fort", "mahakali temple", "anchaleshwar", "jatpura gate", "pathanpura"],
    entities: ["Gond Kingdom of Chanda", "Mahakali Temple Trust", "Archaeological Survey of India (ASI)"],
    contacts: ["07172-251597 (District Culture/Tourism Branch)"],
    schemes: ["Maharashtra Heritage & Fort Conservation Policy"],
    departments: ["Tourism Department", "Archaeology Department"],
    officers: ["District Collector", "District Cultural Officer"],
    deadlines: ["Chaitra Fair celebrated annually in March-April"],
    amounts: ["Heritage conservation grants"],
    eligibility: ["Tourists and heritage researchers"],
    workflow: ["Heritage circuit protection", "Annual Mahakali Fair management"],
    sourceConfidence: 1.0
  },
  {
    id: "chandrapur_tatr_ecology_botanical_garden",
    title: "Tadoba-Andhari Tiger Reserve (TATR) & Visapur Botanical Garden Ecotourism",
    category: "Ecology & Ecotourism",
    subcategory: "TATR & Visapur Botanical Garden",
    location: "TATR (Moharli/Kolara/Navegaon) & Visapur Botanical Garden, Chandrapur",
    sourceName: "Chandrapur District Administrative Knowledge Base",
    content: `
TATR & ECOTOURISM DOSSIER:
1. Tadoba-Andhari Tiger Reserve (TATR):
   - Total Area: 1,727.59 sq km (Southern Tropical Dry Deciduous Teak Forest).
   - Management Zones: Core, Buffer, Adjoining, and Eco-Tourism.
   - Tiger Population: Over 100 tigers in core/buffer; 80+ buffer villages. Famous tigers: Maya, Chota Matka.
   - Research & AI Systems: DNA Metabarcoding for Dhole diets (NCBS-TIFR), AI camera & speaker warning system in 20 high-risk villages, Buddha Purnima Machan Census.
   - Safari Gates: Moharli, Kolara, Navegaon, Pangdi, Zari, Agarzari.
2. Shradheya Shri Atal Bihari Vajpayee Botanical Garden Visapur: Area: 108 hectares on NH 930. Recreation Zone & Conservation Zone.
3. Gorewada Animal Adoption Scheme (FDCM Rates): Tiger: ₹2,00,000/year; Leopard: ₹1,00,000/year; Sloth Bear: ₹75,000/year; Eagle/Owl: ₹25,000/year.
    `,
    keywords: ["tatr", "tadoba", "tadoba tiger reserve", "moharli", "kolara", "visapur botanical garden", "gorewada adoption", "maya tiger", "chota matka", "ecotourism"],
    entities: ["Tadoba-Andhari Tiger Reserve (TATR)", "FDCM Ltd", "Visapur Botanical Garden"],
    contacts: ["18003033 (TATR Emergency Wildlife)", "1926 (Forest Helpline)", "07172-251597"],
    schemes: ["TATR Ecotourism & Gorewada Animal Adoption Scheme"],
    departments: ["Forest Department", "FDCM Ltd"],
    officers: ["Field Director TATR", "Deputy Conservator of Forests (DCF)"],
    deadlines: ["Online safari booking via official portal"],
    amounts: ["Tiger adoption ₹2 Lakh/year; Leopard ₹1 Lakh/year"],
    eligibility: ["Wildlife enthusiasts, tourists, animal adopters"],
    workflow: ["Online safari reservation", "Gate entry verification", "Guide assignment"],
    sourceConfidence: 1.0
  },
  {
    id: "chandrapur_contacts_and_helplines",
    title: "Chandrapur Dedicated Contact & Emergency Helpline Matrix",
    category: "Emergency & District Helplines",
    subcategory: "Searchable Contact Index",
    location: "Chandrapur District, Maharashtra",
    sourceName: "Chandrapur District Administrative Knowledge Base",
    content: `
CHANDRAPUR DEDICATED CONTACT & HELPLINE MATRIX:
- Emergency Police Dispatch: 112
- District Police Headquarters (SP Office): 07172-255100 / 07172-273258
- Ramnagar Police Station: 07172-252139
- Forest Emergency Helpline: 1926
- TATR Emergency Wildlife Call Center: 18003033
- District Disaster Control Room: 1077 / 07172-250077 / 07172-251597
- Emergency Medical Ambulance: 108
- Women Helpline: 1091 / 181
- Childline Emergency: 1098
- MJPJAY Health Assurance Toll-Free: 155388 / 1800-233-2200
- Illegal Moneylending Harassment Grievance Helpline: 1800-233-8691
- District Mining Officer (DMO Mr. S.S. Naitam): 07172-272690 / miningofficer.chanda@gmail.com
- Chandrapur Municipal Corporation (CMC Main): 07172-250220 / Toll-Free: 1800-309-7040 / WhatsApp: 8530006063
- District Collectorate Main Switchboard: 07172-251597
- Civil Surgeon / Civil Hospital Chandrapur: 07172-253275
- State Grievance Redressal (Aaple Sarkar): 1800-120-8040
    `,
    keywords: ["contact", "helpline", "phone number", "mobile", "call", "112", "1926", "1077", "07172-250077", "07172-272690", "18003033", "108", "1091", "1098", "155388", "1800-233-2200", "1800-233-8691", "1800-309-7040", "8530006063", "07172-251597", "1800-120-8040"],
    entities: ["Chandrapur District Administration", "Police Department", "Forest Department", "Health Department"],
    contacts: [
      "112 (Police)", "1926 (Forest)", "18003033 (TATR)", "1077 / 07172-250077 (Disaster)",
      "108 (Ambulance)", "1091 (Women)", "1098 (Child)", "155388 / 1800-233-2200 (MJPJAY)",
      "1800-233-8691 (Moneylender Grievance)", "07172-272690 (DMO)", "1800-309-7040 (CMC)",
      "07172-251597 (Collectorate)", "1800-120-8040 (Aaple Sarkar)"
    ],
    schemes: ["Chandrapur Public Citizen Emergency Helplines"],
    departments: ["All Line Departments Chandrapur"],
    officers: ["District Collector", "SP", "DMO", "Civil Surgeon"],
    deadlines: ["24x7 Emergency availability"],
    amounts: ["Toll-free emergency numbers"],
    eligibility: ["All citizens of Chandrapur district"],
    workflow: ["Direct toll-free call dispatch"],
    sourceConfidence: 1.0
  },
  {
    id: "tatr_overview_and_legend",
    title: "Tadoba-Andhari Tiger Reserve (TATR): Identity, Legend of Taru & River",
    category: "Wildlife & Tourism",
    subcategory: "Tadoba-Andhari Tiger Reserve",
    location: "Chandrapur District, Maharashtra",
    sourceName: "Chandrapur District Administrative Knowledge Base",
    content: `
TADOBA-ANDHARI TIGER RESERVE (TATR) OVERVIEW & ETYMOLOGY:
- Name: Tadoba-Andhari Tiger Reserve (TATR), popularly known as "The Pride of Vidarbha". Located in Chandrapur District, Maharashtra.
- Legend of Taru / Why called Tadoba: "Tadoba" is named after Taru (or Tadoba), a mythological Gond tribal village chief who was tragically killed in a heroic battle with a wild tiger. Local indigenous communities deified him and built a sacred shrine beneath a large tree on the banks of Tadoba Lake. Note: This is a local legend/traditional Gond cultural account rather than scientifically verified history.
- Andhari River: "Andhari" refers to the Andhari River winding through the dense woodland of the reserve.
- Total Area (Source-Provided Data): Total protected area 1,727.59 sq km. Core area: 625.40 sq km. Buffer area: 1,101.77 sq km across 79 villages.
    `,
    keywords: ["tadoba", "tatr", "taru", "andhari", "pride of vidarbha", "tadoba lake", "gond chief", "legend of taru", "shrine", "why is tadoba called tadoba", "who was tadoba", "andhari river", "core area", "buffer area", "total area"],
    entities: ["Tadoba-Andhari Tiger Reserve (TATR)", "Taru (Tadoba Chief)", "Andhari River", "Tadoba Lake"],
    contacts: ["1926 (Forest Helpline)", "18003033 (TATR Call Center)"],
    schemes: ["Project Tiger / Critical Tiger Habitat"],
    departments: ["Maharashtra Forest Department", "TATR Management"],
    officers: ["Field Director TATR", "Deputy Conservator of Forests"],
    deadlines: [],
    amounts: ["1,727.59 sq km total", "625.40 sq km core", "1,101.77 sq km buffer"],
    eligibility: [],
    workflow: ["Taru Shrine visit at Tadoba Lake"],
    sourceConfidence: 1.0
  },
  {
    id: "tatr_conservation_history",
    title: "Tadoba Conservation History & Timeline (1879 - 2010)",
    category: "Wildlife & Tourism",
    subcategory: "Conservation Timeline",
    location: "Chandrapur District, Maharashtra",
    sourceName: "Chandrapur District Administrative Knowledge Base",
    content: `
TADOBA CONSERVATION TIMELINE:
- 1879: Forests designated as Reserved Forest primarily to secure timber.
- 1935: 45 sq mile (~116.55 sq km) sanctuary formed around Tadoba Lake.
- 1955: Tadoba National Park formally established across ~116.54 sq km (Maharashtra's oldest national park).
- 1986: Andhari Wildlife Sanctuary created in adjacent forests across ~508.85 sq km.
- 1995: Tadoba National Park and Andhari Wildlife Sanctuary merged to form Tadoba-Andhari Tiger Reserve (TATR).
- 2007: 625.40 sq km central core declared Critical Tiger Habitat.
- 2010: 1,101.77 sq km surrounding area designated as buffer zone containing 79 villages. Total area: 1,727.59 sq km.
    `,
    keywords: ["history", "timeline", "1879", "1935", "1955", "1986", "1995", "2007", "2010", "reserved forest", "national park", "andhari sanctuary", "critical tiger habitat"],
    entities: ["Tadoba National Park", "Andhari Wildlife Sanctuary", "TATR"],
    contacts: ["1926"],
    schemes: ["Project Tiger"],
    departments: ["Forest Department"],
    officers: [],
    deadlines: [],
    amounts: ["116.54 sq km (1955)", "508.85 sq km (1986)", "625.40 sq km core (2007)", "1101.77 sq km buffer (2010)"],
    eligibility: [],
    workflow: [],
    sourceConfidence: 1.0
  },
  {
    id: "tatr_flora_and_fauna",
    title: "TATR Flora, Fauna, Tiger Population, Leopards & Wildlife Density",
    category: "Wildlife & Tourism",
    subcategory: "Flora & Fauna",
    location: "Tadoba-Andhari Tiger Reserve, Chandrapur",
    sourceName: "Chandrapur District Administrative Knowledge Base",
    content: `
TATR FLORA & FAUNA SPECIES:
- Forest Type: Southern Tropical Dry Deciduous Forest.
- Canopy: According to the provided source, Teak (Tectona grandis) represents ~87% of the protected canopy. Other trees: Ain (crocodile bark), Bija, Dhauda, Salai, Tendu, Semal, Arjun (associated with Panchadhara freshwater springs).
- Tiger Population (2024 Source Report 'Status of Tigers, Co-Predators, and Prey in TATR'):
  - More than 100 Bengal tigers in wider landscape
  - More than 80 inside the core area
  - Tiger density approximately 11.02 tigers per 100 sq km.
- Leopard Population: Increased from 106 (2019) to 144 (2024) with density >11 per 100 sq km.
- Other Mammals: Sloth bear, Dhole (wild dog), Gaur (bison), Nilgai, Striped hyena, Small Indian civet, Jungle cat, Sambar, Barking deer, Chital, Four-horned antelope (Chausingha), Honey badger.
- Reptiles: Tadoba Lake perennial water source; Mugger crocodile, Indian rock python, Common Indian monitor, Indian star tortoise.
- Birds: >195 species including Grey-headed fish eagle, Crested serpent eagle, Changeable hawk-eagle. Endangered Lesser Florican seen in dry grasslands (rare visitor/sighting).
    `,
    keywords: ["flora", "fauna", "trees", "teak", "87%", "panchadhara", "arjun", "tiger population", "how many tigers", "tiger density", "core tigers", "leopard", "144 leopards", "sloth bear", "gaur", "mugger crocodile", "birds", "lesser florican", "eagles"],
    entities: ["Tadoba Flora & Fauna", "Bengal Tiger", "Indian Leopard", "Lesser Florican", "Panchadhara Springs"],
    contacts: ["1926"],
    schemes: ["Tiger & Wildlife Status Survey 2024"],
    departments: ["Forest Department", "TATR Research Cell"],
    officers: [],
    deadlines: [],
    amounts: [">100 tigers in landscape", ">80 core tigers", "11.02 tigers/100 sq km", "144 leopards", ">195 bird species"],
    eligibility: [],
    workflow: [],
    sourceConfidence: 1.0
  },
  {
    id: "tatr_safari_zones_and_gates",
    title: "TATR Safari Zones, Core Gates & Buffer Gates Directory",
    category: "Wildlife & Tourism",
    subcategory: "Safari Structure & Gates",
    location: "Tadoba-Andhari Tiger Reserve, Chandrapur",
    sourceName: "Chandrapur District Administrative Knowledge Base",
    content: `
TATR SAFARI ZONES & GATES (6 Core Gates, 16 Buffer Gates):
1. MOHARLI ZONE (Southwest):
   - Character: Oldest and most popular hub, active waterholes.
   - Core Gates: Moharli, Khutwanda.
   - Buffer Gates: Devada, Agarzari, Junona, Adegaon, Mamla, Ramdegi-Navegaon.
2. KOLARA ZONE (North):
   - Character: Remote, rugged wilderness offering a core safari experience.
   - Core Gate: Kolara.
   - Buffer Gates: Madnapur, Alizanza, Sirkada, Palasgaon, Chauradeo, Belara.
3. NAVEGAON ZONE (Northern remote reaches):
   - Character: Quieter, remote northern landscape.
   - Core Gate: Navegaon.
   - Buffer Gate: Nimdela/Navegaon Ramdegi.
4. KOLSA ZONE (South):
   - Character: Relaxed trail area recommended for sloth bears and birdwatching.
   - Core Gates: Pangadi, Zari.
   - Buffer Gates: Pangadi Aswal Chuha, Kesalghat, Zari Peth.
    `,
    keywords: ["safari", "zone", "gate", "core gate", "buffer gate", "moharli", "khutwanda", "devada", "agarzari", "junona", "adegaon", "mamla", "ramdegi", "kolara", "madnapur", "alizanza", "sirkada", "palasgaon", "chauradeo", "belara", "navegaon", "nimdela", "kolsa", "pangadi", "zari", "kesalghat", "zari peth", "best safari zone", "sloth bear zone", "birdwatching zone"],
    entities: ["Moharli Zone", "Kolara Zone", "Navegaon Zone", "Kolsa Zone"],
    contacts: ["Official Forest Booking Portal"],
    schemes: ["Safari Permits"],
    departments: ["Forest Department TATR"],
    officers: ["Forest Gate Officers"],
    deadlines: [],
    amounts: ["6 Core Gates", "16 Buffer Gates"],
    eligibility: ["Safari permit holders"],
    workflow: ["Online permit booking -> Gate entry verification"],
    sourceConfidence: 1.0
  },
  {
    id: "tatr_famous_tigers_2026",
    title: "Tadoba Famous Tigers (Maya, Chota Matka, Bajrang, Matkasur, Choti Tara)",
    category: "Wildlife & Tourism",
    subcategory: "Famous Tigers (2026 Source Data)",
    location: "Tadoba-Andhari Tiger Reserve, Chandrapur",
    sourceName: "Chandrapur District Administrative Knowledge Base",
    content: `
FAMOUS TIGERS OF TADOBA (2026 Source Data):
- MAYA ("Queen of Tadoba"): Famous resident tigress known for bold, close-range appearances. Source-associated territory: Kolara core and Navegaon core.
- CHOTA MATKA: Powerful dominant young male. Associated territory: Nimdhela, Alizanza, Navegaon buffer, Kaala Ambaa core.
- BAJRANG: Iconic wide-ranging male. Associated range: Moharli range (core and buffer sections).
- MATKASUR: Aging legendary male. Historically associated with Belara and Madnapur.
- CHOTI TARA: Frequently spotted with cubs in Kolara core and buffer.

SAFETY/ACCURACY DISCLAIMER:
Tigers are wild animals with fluid movement. No tiger presence can be guaranteed at any specific gate or date. Locations reflect source-associated territories.
    `,
    keywords: ["famous tigers", "maya", "queen of tadoba", "chota matka", "bajrang", "matkasur", "choti tara", "cubs", "kolara core", "navegaon core", "nimdhela", "alizanza", "belara", "madnapur", "moharli range", "maya tigress"],
    entities: ["Maya (Tigress)", "Chota Matka (Tiger)", "Bajrang (Tiger)", "Matkasur (Tiger)", "Choti Tara (Tigress)"],
    contacts: [],
    schemes: [],
    departments: ["TATR Wildlife Research"],
    officers: [],
    deadlines: [],
    amounts: [],
    eligibility: [],
    workflow: [],
    sourceConfidence: 1.0
  },
  {
    id: "tatr_machan_census_and_ai_warning",
    title: "Tadoba Machan Census 2026 & AI-Enabled Tiger Warning System",
    category: "Wildlife & Tourism",
    subcategory: "Wildlife Monitoring & Technology",
    location: "Tadoba-Andhari Tiger Reserve, Chandrapur",
    sourceName: "Chandrapur District Administrative Knowledge Base",
    content: `
MACHAN CENSUS 2026 & AI TIGER WARNING SYSTEM:
1. MACHAN CENSUS (May 1, 2026):
   - Occasion: Buddha Purnima full moon night to track animals around waterholes.
   - Results: Total 5,765 animals tracked.
   - Tiger Sightings: 42 tiger sightings recorded (19 in Core, 23 in Buffer). Notable observation: More tiger sightings in buffer areas than core areas.
   - Leopard Sightings: 13 leopards.
2. AI-ENABLED TIGER WARNING SYSTEM (July 2025):
   - Deployment: Installed across 20 high-risk buffer villages in Tadoba landscape.
   - Mechanism: AI camera traps monitor tiger movements near human settlements and connect to localized loudspeakers to automatically broadcast warning announcements to villagers.
   - Purpose: Human-wildlife conflict mitigation, early warning, and community safety.
    `,
    keywords: ["machan census", "buddha purnima", "may 2026", "5765 animals", "42 tigers", "19 core", "23 buffer", "13 leopards", "ai tiger warning", "camera trap", "loudspeaker alert", "buffer villages", "conflict mitigation"],
    entities: ["Machan Census 2026", "AI Tiger Warning System", "Buddha Purnima Waterhole Tracking"],
    contacts: ["1926 (Forest Helpline)", "18003033"],
    schemes: ["AI Wildlife Conflict Mitigation Project"],
    departments: ["Maharashtra Forest Department"],
    officers: [],
    deadlines: [],
    amounts: ["5,765 animals tracked", "42 tiger sightings", "13 leopard sightings", "20 buffer villages"],
    eligibility: ["Buffer zone residents"],
    workflow: ["AI camera trap triggers automated speaker announcement"],
    sourceConfidence: 1.0
  },
  {
    id: "tatr_vandarshan_tourism_2026",
    title: "VANDARSHAN Integrated Rail & Safari Tourism Package (2026)",
    category: "Wildlife & Tourism",
    subcategory: "Integrated Tourism Packages",
    location: "Chandrapur & Vidarbha Tiger Circuit",
    sourceName: "Chandrapur District Administrative Knowledge Base",
    content: `
VANDARSHAN INTEGRATED TOURISM PACKAGE (2026):
- Launch Date: July 29, 2026 (International Tiger Day).
- Partners: IRCTC & Maharashtra Forest Department.
- Transport: Vidarbha Express.
- Concept: Integrated rail-based wildlife tourism package combining train travel, core safari permit bookings, and luxury accommodation.
- Integrated Circuit: Tadoba-Andhari, Pench, Bor, Navegaon-Nagzira, Umred-Karhandla, and Tipeshwar.
- Note: Specific pricing and departure schedules should be checked via official IRCTC / Forest booking platforms.
    `,
    keywords: ["vandarshan", "irctc", "vidarbha express", "july 29 2026", "international tiger day", "rail tourism", "safari package", "pench", "bor", "navegaon nagzira", "umred karhandla", "tipeshwar"],
    entities: ["VANDARSHAN Package", "IRCTC", "Vidarbha Express", "Maharashtra Forest Department"],
    contacts: ["IRCTC Helpline", "Forest Tourism Portal"],
    schemes: ["Vandarshan Eco-Tourism Circuit"],
    departments: ["Forest Department", "Indian Railways / IRCTC"],
    officers: [],
    deadlines: [],
    amounts: ["6 Wildlife Destinations"],
    eligibility: ["Tourists & Wildlife Enthusiasts"],
    workflow: ["IRCTC rail + safari combined booking"],
    sourceConfidence: 1.0
  },
  {
    id: "tiger_shroff_advocacy_disambiguation",
    title: "Tiger Shroff Wildlife Conservation Advocacy & Youth Sports Disambiguation",
    category: "Wildlife & Tourism",
    subcategory: "Entity Disambiguation & Advocacy",
    location: "Maharashtra (PETA India, Nagpur & Mumbai)",
    sourceName: "Chandrapur District Administrative Knowledge Base",
    content: `
TIGER SHROFF DISAMBIGUATION & CONSERVATION ADVOCACY:
- CRITICAL DISAMBIGUATION: Tiger Shroff (Bollywood actor) has NO direct tiger-residency or biological connection to Tadoba wild tigers. He is not a tiger in Tadoba nor related to Maya or any wild tiger.
- Source-Provided Advocacy & Initiatives:
  1. PETA India Forest Advocacy (July 29, 2016): On International Tiger Day 2016, Tiger Shroff wrote an official letter on behalf of PETA India to Union Minister Anil Madhav Dave urging forest habitat protection, conservation resources, and stricter tiger safeguards.
  2. Adoption of Tigress "Lee" (2014): Adopted a 4-year-old tigress named "Lee" housed at Maharajbagh Zoo, Nagpur. Travelled to Nagpur, visited her regularly, and funded fresh meat, care, and monsoon shelter upgrades.
  3. Maha-Deva Football Talent Initiative (November 2025): Appointed Brand Ambassador by Maharashtra Government for 5-year "Maha-Deva" Football Talent Development Initiative for underprivileged tribal and rural youth. Signed alongside Chief Minister Devendra Fadnavis at Varsha residence.
    `,
    keywords: ["tiger shroff", "peta", "peta india", "anil madhav dave", "lee", "tigress lee", "maharajbagh zoo", "nagpur", "maha deva", "football", "devendra fadnavis", "varsha", "brand ambassador", "tiger shroff tadoba connection", "is tiger shroff a tiger"],
    entities: ["Tiger Shroff", "PETA India", "Tigress Lee (Maharajbagh Zoo)", "Maha-Deva Football Initiative", "Devendra Fadnavis"],
    contacts: [],
    schemes: ["Maha-Deva Youth Sports Scheme"],
    departments: ["Sports & Youth Welfare Dept", "Maharashtra Government"],
    officers: ["Brand Ambassador Tiger Shroff"],
    deadlines: ["5 year sports program"],
    amounts: [],
    eligibility: ["Underprivileged tribal & rural youth"],
    workflow: [],
    sourceConfidence: 1.0
  },
  {
    id: "tatr_complete_wildlife_and_biodiversity",
    title: "Tadoba-Andhari Tiger Reserve – Complete Wildlife & Biodiversity",
    category: "Chandrapur → Tadoba → Wildlife & Biodiversity",
    subcategory: "Fauna, Predators, Herbivores, Birds, Reptiles & Food Web",
    location: "Tadoba-Andhari Tiger Reserve (TATR), Chandrapur, Maharashtra",
    sourceName: "Tadoba-Andhari Tiger Reserve (TATR) – Complete Wildlife & Biodiversity Dossier",
    content: `
TADOBA-ANDHARI TIGER RESERVE – COMPLETE WILDLIFE & BIODIVERSITY DOSSIER:

1. PREDATORS & BIG CATS:
   • Royal Bengal Tiger (Panthera tigris): Flagship apex predator. Core area population: approx 90–100 tigers; over 200 tigers across the wider Vidarbha landscape (according to provided source reports). 2024 density: 11.02 tigers per 100 sq km. Ambush hunting strategy using 4–5 feet tall khus/vetiver grass (Vetiveria zizanioides). Iconic individuals: Maya ('Queen of Tadoba'), Chota Matka, Balram, Bajrang, Choti Tara.
   • Indian Leopard (Panthera pardus): Population increased from 106 in 2019 to 144 in 2024 (density: ~11.02/100 sq km). Known for stealth and camouflage; inhabits rocky slopes, secondary forest paths, dense bamboo thickets, forest edges, and shaded ravines.
   • Black Panther (Melanistic Leopard): Rare melanistic leopard variant recorded in Tadoba in May 2018 (unusual as melanistic leopards are typically associated with humid evergreen forests).
   • Jungle Cat (Felis chaus): Small, secretive nocturnal feline encountered during buffer/night safaris.
   • Rusty-Spotted Cat (Prionailurus rubiginosus): World's smallest wild cat species, nocturnal and elusive.

2. WILD CANIDS & PACK HUNTERS:
   • Dhole / Indian Wild Dog (Cuon alpinus): Endangered species. Estimated Tadoba population: 20–35 individuals in packs of 5–15. Communicates via high-pitched whistles and clucks. Coursing predator chasing prey at 45–55 km/h with 50–70% hunting success rate. Large packs defend against sub-adult tigers; tigers may steal dhole kills.
   • Striped Hyena (Hyaena hyaena): Nocturnal scavenger/predator crushing bone scavenger.
   • Golden Jackal (Canis aureus), Indian Wolf (Canis lupus pallipes), Bengal Fox (Vulpes bengalensis).

3. FOREST GIANTS & GROUND FORAGERS:
   • Sloth Bear (Melursus ursinus): Strong population. Omnivorous feeding on termites, ants, Mahua flowers (Madhuca longifolia), and Ber fruits (Ziziphus). Uses curved claws to break termite mounds and suction to extract insects. Peak activity March–June in open Mahua areas (Moharli & Navegaon buffers). Highly defensive: stands on hind legs, aggressive guttural roars, confronts tigers.
   • Honey Badger / Ratel (Mellivora capensis): Fearless nocturnal carnivore, recorded during May 2026 Machan Census and night safaris.
   • Indian Pangolin (Manis crassicaudata): Endangered scaly insectivore eating ants/termites.

4. HERBIVORE GUILD (>53% of recorded wildlife):
   • Indian Gaur / Indian Bison (Bos gaurus): Largest wild cattle. Herds feed on Mothi Marvel, Kusal/Kushal, and Moshan grass.
   • Nilgai / Blue Bull (Boselaphus tragocamelus): Largest Asian antelope in open grasslands feeding on Lahan Marvel and Moshan grass.
   • Sambar Deer (Rusa unicolor): Large deer in wetlands/lakes (Tadoba & Telia lakes), active evening water holes, key tiger prey.
   • Chital / Spotted Deer (Axis axis): Most abundant mammal, depends heavily on Harali grass (Cynodon dactylon), primary prey for tigers and dholes.
   • Four-Horned Antelope / Chausingha (Tetracerus quadricornis): Rare diurnal antelope with 4 horns.
   • Barking Deer / Muntjac (Muntiacus muntjak): Dense bamboo thickets, dog-like alarm bark.
   • Mouse Deer (Moschiola indica): Small, secretive primitive herbivore.
   • Indian Wild Boar (Sus scrofa): Common omnivorous sounders digging for roots/tubers.
   • Common Langur (Semnopithecus entellus): Arboreal primate sentinel. Alarm calls ('Khok-Khok') warn all herbivores when big cats approach; drops fruits for deer.
   • Indian Giant Flying Squirrel (Petaurista philippensis): Glides between tree canopies at dusk/night.

5. REPTILES & AQUATIC FAUNA:
   • Mugger / Marsh Crocodile (Crocodylus palustris): Basks on muddy shorelines of Tadoba Lake and Telia Lake.
   • Indian Rock Python (Python molurus): Large constrictor snake crossing safari tracks.
   • Spectacled Cobra (Naja naja), Russell's Viper (Daboia russelii), Common Krait (Bungarus caeruleus).
   • Common Indian Monitor Lizard (Varanus bengalensis), Indian Star Tortoise, Indian Flapshell Turtle.

6. BIRDS / AVIAN DIVERSITY (195 to 280+ species in source records):
   • Raptors: Grey-Headed Fish Eagle (lakes), Crested Serpent Eagle, Changeable Hawk-Eagle.
   • Owls: Mottled Wood Owl, Brown Fish Owl, Jungle Owlet, Spotted Owlet.
   • Grassland: Lesser Florican (Sypheotides indicus) - rare/endangered grassland visitor according to source.
   • Forest Birds: Orange-Headed Thrush, Indian Pitta ('Navrang'), Asian Paradise Flycatcher, Black-Naped Monarch, Black-Rumped Flameback Woodpecker.
   • Nightbirds: Savanna Nightjar, Indian Nightjar, Grey Nightjar, Large-Tailed Nightjar.

7. BUTTERFLIES & MICRO-FAUNA:
   • Butterflies: 66 to 134 species in source records. Richest family: Nymphalidae (Blue Pansy, Chocolate Pansy, Blue Tiger, Common Crow, Plain Tiger). Papilionidae (Common Mormon, Crimson Rose, Lime Butterfly).
   • Schedule II Protection (Wildlife Protection Act, 1972): Danaid Eggfly (Hypolimnas misippus) and Great Eggfly (Hypolimnas bolina).
   • Spiders: 26 species (Signature Spider, Giant Wood Spider, Red Wood Spider; monsoon web peak). Insects: Praying mantises, Stick insects, Jewel beetles.

8. ECOLOGICAL FOOD WEB & INTERACTIONS:
   • Apex Tiger (preys on Chital, Sambar, Gaur, Boar; uses 4-5 ft Khus grass for ambush) ↔ Stealth Leopard (bamboo, rocky terrain, hoists kills) ↔ Pack Dhole (coursing predator at 45-55 km/h, 50-70% success).
   • Sloth Bear (termites, Mahua, Ber; defensive roars against tigers).
   • Langur (sentinel alarm calls alert herbivores) ↔ Chital (depends on Harali grass) ↔ Water Bodies (Tadoba & Telia lakes support Crocodiles & water holes).
    `,
    keywords: [
      "tadoba wildlife", "complete biodiversity", "predators", "royal bengal tiger", "indian leopard", "black panther",
      "jungle cat", "rusty spotted cat", "dhole", "indian wild dog", "striped hyena", "golden jackal", "indian wolf",
      "fox", "sloth bear", "honey badger", "ratel", "indian pangolin", "herbivores", "gaur", "indian bison", "nilgai",
      "blue bull", "sambar deer", "chital", "spotted deer", "chausingha", "barking deer", "muntjac", "mouse deer",
      "wild boar", "langur", "flying squirrel", "harali grass", "khus grass", "reptiles", "mugger crocodile",
      "indian rock python", "spectacled cobra", "russells viper", "common krait", "monitor lizard", "star tortoise",
      "flapshell turtle", "birds of tadoba", "grey headed fish eagle", "crested serpent eagle", "lesser florican",
      "indian pitta", "paradise flycatcher", "nightjar", "butterflies", "nymphalidae", "danaid eggfly", "great eggfly",
      "schedule ii", "spiders", "signature spider", "giant wood spider", "food web", "food chain", "nocturnal animals",
      "endangered species", "जानवर", "शिकारी", "हिरण", "पक्षी", "तितली", "सांप", "ढोल", "स्लॉथ बीयर"
    ],
    entities: ["Tadoba Wildlife & Biodiversity", "Royal Bengal Tiger", "Indian Leopard", "Black Panther (2018)", "Dhole Pack", "Sloth Bear", "Chital & Harali Grass", "Langur Sentinel System", "Mugger Crocodile", "Lesser Florican", "Danaid & Great Eggfly (Schedule II)"],
    contacts: ["1926 (Forest Helpline)"],
    schemes: ["Project Tiger", "Wildlife Protection Act 1972 Schedule II"],
    departments: ["Maharashtra Forest Department", "TATR Field Directorate"],
    officers: [],
    deadlines: [],
    amounts: ["90-100 core tigers", ">200 landscape tigers", "144 leopards", "20-35 dholes", "195-280+ bird species", "66-134 butterfly species", "26 spider species"],
    eligibility: ["Protected Wildlife Spectrum"],
    workflow: ["Ecological food web balance"],
    sourceConfidence: 1.0
  }
];

const CHANDRAPUR_ALIASES: Record<string, string[]> = {
  "land": ["7/12", "satbara", "सातबारा", "ferfar", "फेऱफार", "mutation", "land mutation", "land dispute", "zamin", "जमीन"],
  "tiger": ["tiger attack", "बाघ हमला", "वाघाचा हल्ला", "wildlife attack", "human wildlife conflict", "tatr", "tadoba", "maya", "chota matka", "bajrang", "matkasur", "choti tara", "machan census", "vandarshan", "tiger shroff"],
  "scheme": ["ladki bahin", "लाडकी बहीण", "sanjay gandhi", "shravanbal", "pm kisan", "namo shetkari", "pik vima", "pmay", "mjpjay", "mahadbt", "vayoshree", "solar pump", "saur krishi", "yuva karya"],
  "governance": ["collector", "tehsildar", "sdo", "talathi", "lokshahi din", "pesa", "fra", "gram sabha", "dmo", "mining officer", "dmft", "cmc", "zilla parishad"],
  "industry": ["cstps", "wcl", "coal", "limestone", "cement", "midc", "fly ash", "dmf", "bilt", "ferro alloy", "gasification"],
  "wildlife": ["janwar", "जानवर", "predator", "शिकारी", "herbivore", "शाकाहारी", "biodiversity", "जैव विविधता", "food chain", "food web", "wildlife", "fauna", "animals", "endangered", "nocturnal"],
  "bigcats": ["panther", "black panther", "ब्लैक पैंथर", "leopard", "तेंदुआ", "jungle cat", "rusty spotted cat", "maya", "chota matka", "balram", "bajrang"],
  "canids": ["dhole", "ढोल", "wild dog", "जंगली कुत्ता", "hyena", "लकड़बग्घा", "jackal", "wolf", "fox"],
  "herbivores": ["gaur", "bison", "गौर", "nilgai", "blue bull", "नीलगाय", "sambar", "सांभर", "chital", "spotted deer", "चितल", "chausingha", "barking deer", "muntjac", "mouse deer", "wild boar", "langur", "लंगूर", "flying squirrel"],
  "reptiles": ["crocodile", "mugger", "मगरमच्छ", "python", "अजगर", "cobra", "नाग", "viper", "krait", "monitor lizard", "ghorpad", "tortoise", "turtle", "सांप"],
  "birds": ["birds", "पक्षी", "raptors", "eagle", "owl", "lesser florican", "pitta", "flycatcher", "woodpecker", "nightjar"],
  "microfauna": ["butterfly", "butterflies", "तितली", "nymphalidae", "papilionidae", "eggfly", "spider", "मकड़ी", "mantis"]
};

/**
 * RAG Retrieval Engine for Chandrapur District Knowledge Base.
 */
export function searchChandrapurKnowledge(userQuery?: string): {
  matchedRecords: ChandrapurKnowledgeRecord[];
  formattedContext: string;
} {
  if (!IS_CHANDRAPUR_DEMO_ENABLED || !userQuery || userQuery.trim() === "") {
    const defaultRecords = CHANDRAPUR_KNOWLEDGE_BASE.filter(r =>
      r.id === "chandrapur_collectorate_and_administration" ||
      r.id === "chandrapur_contacts_and_helplines"
    );
    return {
      matchedRecords: defaultRecords,
      formattedContext: formatContext(defaultRecords)
    };
  }

  // Pre-process user query with phonetic police/station normalization
  let queryNorm = normalizePoliceStationName(userQuery.toLowerCase().trim());

  // Geographic Disambiguation check
  const mentionsJharkhand = ["jharkhand", "bokaro", "dvc", "bermo", "dhanbad"].some(k => queryNorm.includes(k));

  let recordsToSearch = CHANDRAPUR_KNOWLEDGE_BASE;
  if (mentionsJharkhand) {
    const jharkhandRecord = CHANDRAPUR_KNOWLEDGE_BASE.find(r => r.id === "chandrapur_jharkhand_disambiguation");
    if (jharkhandRecord) {
      return {
        matchedRecords: [jharkhandRecord],
        formattedContext: formatContext([jharkhandRecord])
      };
    }
  } else {
    recordsToSearch = CHANDRAPUR_KNOWLEDGE_BASE.filter(r => r.id !== "chandrapur_jharkhand_disambiguation");
  }

  // Calculate semantic + keyword match scores for each record
  const scored = recordsToSearch.map(record => {
    let score = 0;

    const fullText = `${record.title} ${record.category} ${record.subcategory} ${record.keywords.join(" ")} ${record.content} ${record.entities.join(" ")} ${record.contacts.join(" ")}`.toLowerCase();

    const terms = queryNorm.split(/\s+/).filter(t => t.length > 2);
    for (const term of terms) {
      if (record.keywords.some(k => k.toLowerCase().includes(term))) score += 5;
      if (record.title.toLowerCase().includes(term)) score += 4;
      if (record.category.toLowerCase().includes(term) || record.subcategory.toLowerCase().includes(term)) score += 3;
      if (fullText.includes(term)) score += 1;
    }

    // Alias matches
    for (const [key, aliases] of Object.entries(CHANDRAPUR_ALIASES)) {
      if (aliases.some(a => queryNorm.includes(a))) {
        if (record.keywords.some(k => aliases.some(a => k.toLowerCase().includes(a)))) score += 6;
      }
    }

    // Specific high-priority query phrases & target questions
    if ((queryNorm.includes("dmo") || queryNorm.includes("mining officer") || queryNorm.includes("naitam")) && record.id === "chandrapur_dmo_mining_office") score += 20;
    if ((queryNorm.includes("dmft") || queryNorm.includes("district mineral foundation") || queryNorm.includes("pmkkky")) && record.id === "chandrapur_dmft_trust") score += 20;
    if ((queryNorm.includes("minerals") || queryNorm.includes("coal mines") || queryNorm.includes("limestone") || queryNorm.includes("fluorite") || queryNorm.includes("bhatadi") || queryNorm.includes("durgapur")) && record.id === "chandrapur_major_minerals_coal_limestone") score += 20;
    if ((queryNorm.includes("solar pump") || queryNorm.includes("saur krishi") || queryNorm.includes("magel tyala")) && record.id === "chandrapur_welfare_saur_krishi_pump") score += 20;
    if ((queryNorm.includes("vayoshree") || queryNorm.includes("vayoshri") || queryNorm.includes("65 saal") || queryNorm.includes("senior citizen")) && record.id === "chandrapur_welfare_cm_vayoshree") score += 20;
    if ((queryNorm.includes("yuva karya") || queryNorm.includes("stipend") || queryNorm.includes("graduate")) && record.id === "chandrapur_welfare_yuva_karya_prashikshan") score += 20;
    if ((queryNorm.includes("moneylender") || queryNorm.includes("sahukar") || queryNorm.includes("harassment") || queryNorm.includes("cooperative")) && record.id === "chandrapur_illegal_moneylending_complaint") score += 20;
    if ((queryNorm.includes("cmc") || queryNorm.includes("municipal corporation") || queryNorm.includes("hoarding") || queryNorm.includes("sangeeta khandekar") || queryNorm.includes("akunuri")) && record.id === "chandrapur_municipal_corporation_cmc") score += 20;
    if ((queryNorm.includes("sp number") || queryNorm.includes("police station") || queryNorm.includes("sp office") || queryNorm.includes("korpana") || queryNorm.includes("sawali") || queryNorm.includes("ghugus") || queryNorm.includes("nagbhid") || queryNorm.includes("bhadravati")) && record.id === "chandrapur_police_admin_directory") score += 20;
    if ((queryNorm.includes("grievance") || queryNorm.includes("aaple sarkar") || queryNorm.includes("hello chanda")) && record.id === "chandrapur_grievance_redressal_portal") score += 20;
    if ((queryNorm.includes("health impact") || queryNorm.includes("fungal") || queryNorm.includes("lung") || queryNorm.includes("pauni") || queryNorm.includes("abandoned mine")) && record.id === "chandrapur_environmental_health_mine_safety") score += 20;
    if ((queryNorm.includes("cstps") || queryNorm.includes("gasification") || queryNorm.includes("bilt") || queryNorm.includes("ferro alloy")) && record.id === "chandrapur_key_industries_cstps_future_energy") score += 20;
    if ((queryNorm.includes("tiger attack") || queryNorm.includes("वाघाचा हल्ला") || queryNorm.includes("attack")) && record.id === "chandrapur_disaster_tiger_sop") score += 25;
    if ((queryNorm.includes("flood") || queryNorm.includes("बाढ") || queryNorm.includes("पूर")) && record.id === "chandrapur_flood_disaster_matrix") score += 15;
    if ((queryNorm.includes("7/12") || queryNorm.includes("satbara") || queryNorm.includes(" सातबारा") || queryNorm.includes("ferfar")) && record.id === "chandrapur_land_revenue_712_ferfar") score += 15;
    if ((queryNorm.includes("lokshahi") || queryNorm.includes("लोकशाही")) && record.id === "chandrapur_lokshahi_din_sop") score += 15;
    if ((queryNorm.includes("ladki bahin") || queryNorm.includes("लाडकी बहीण")) && record.id === "chandrapur_welfare_ladki_bahin") score += 15;
    if ((queryNorm.includes("helpline") || queryNorm.includes("number") || queryNorm.includes("phone") || queryNorm.includes("contact")) && record.id === "chandrapur_contacts_and_helplines") score += 15;
    if ((queryNorm.includes("sanjay gandhi") || queryNorm.includes("shravanbal") || queryNorm.includes("pension")) && record.id === "chandrapur_welfare_sanjay_gandhi_shravanbal") score += 15;
    if ((queryNorm.includes("namo shetkari") || queryNorm.includes("pm kisan")) && record.id === "chandrapur_welfare_namo_shetkari") score += 15;
    if ((
      queryNorm.includes("collector") || queryNorm.includes("कलेक्टर") || queryNorm.includes("magistrate") || queryNorm.includes("dm") ||
      queryNorm.includes("vasumana pant") || queryNorm.includes("वसुमाना पंत") || queryNorm.includes("pant") ||
      queryNorm.includes("ajay gulhane") || queryNorm.includes("अजय गुल्हाने") || queryNorm.includes("gulhane") ||
      queryNorm.includes("vinay gowda") || queryNorm.includes("विनय गौड़ा") || queryNorm.includes("gowda") ||
      queryNorm.includes("nitin vyawahare") || queryNorm.includes("नितिन व्यवहारे") || queryNorm.includes("vyawahare") ||
      queryNorm.includes("kumbhar") || queryNorm.includes("कुंभार") || queryNorm.includes("rdc") ||
      queryNorm.includes("shubham dandekar") || queryNorm.includes("शुभम दांडेकर") || queryNorm.includes("dandekar") || queryNorm.includes("egs") || queryNorm.includes("election branch") ||
      queryNorm.includes("sanjay pawar") || queryNorm.includes("संजय पवार") || queryNorm.includes("land acquisition") || queryNorm.includes("भूमि संपादन") ||
      queryNorm.includes("naitam") || queryNorm.includes("नैताम") || queryNorm.includes("dmo") || queryNorm.includes("mining officer")
    ) && record.id === "chandrapur_collectorate_and_administration") score += 35;

    // Tadoba boosters
    if ((queryNorm.includes("taru") || queryNorm.includes("legend") || queryNorm.includes("why is tadoba called") || queryNorm.includes("who was tadoba") || queryNorm.includes("andhari river") || queryNorm.includes("pride of vidarbha") || queryNorm.includes("area of tadoba") || queryNorm.includes("sq km")) && record.id === "tatr_overview_and_legend") score += 25;
    if ((queryNorm.includes("history") || queryNorm.includes("timeline") || queryNorm.includes("1879") || queryNorm.includes("1935") || queryNorm.includes("1955") || queryNorm.includes("1986") || queryNorm.includes("1995") || queryNorm.includes("2007") || queryNorm.includes("2010")) && record.id === "tatr_conservation_history") score += 25;
    if ((queryNorm.includes("flora") || queryNorm.includes("fauna") || queryNorm.includes("teak") || queryNorm.includes("canopy") || queryNorm.includes("panchadhara") || queryNorm.includes("population") || queryNorm.includes("density") || queryNorm.includes("leopard") || queryNorm.includes("lesser florican") || queryNorm.includes("crocodile") || queryNorm.includes("how many tigers")) && record.id === "tatr_flora_and_fauna") score += 25;
    if ((queryNorm.includes("safari") || queryNorm.includes("gate") || queryNorm.includes("zone") || queryNorm.includes("moharli") || queryNorm.includes("kolara") || queryNorm.includes("navegaon") || queryNorm.includes("kolsa") || queryNorm.includes("khutwanda") || queryNorm.includes("agarzari") || queryNorm.includes("madnapur") || queryNorm.includes("pangadi") || queryNorm.includes("zari") || queryNorm.includes("buffer gate")) && record.id === "tatr_safari_zones_and_gates") score += 25;
    if ((queryNorm.includes("maya") || queryNorm.includes("chota matka") || queryNorm.includes("bajrang") || queryNorm.includes("matkasur") || queryNorm.includes("choti tara") || queryNorm.includes("famous tigers")) && record.id === "tatr_famous_tigers_2026") score += 25;
    if ((queryNorm.includes("machan") || queryNorm.includes("census") || queryNorm.includes("buddha purnima") || queryNorm.includes("ai warning") || queryNorm.includes("camera trap") || queryNorm.includes("loudspeaker") || queryNorm.includes("5765")) && record.id === "tatr_machan_census_and_ai_warning") score += 25;
    if ((queryNorm.includes("vandarshan") || queryNorm.includes("irctc") || queryNorm.includes("vidarbha express") || queryNorm.includes("tourist package")) && record.id === "tatr_vandarshan_tourism_2026") score += 25;
    if ((queryNorm.includes("tiger shroff") || queryNorm.includes("peta") || queryNorm.includes("tigress lee") || queryNorm.includes("maha deva") || queryNorm.includes("football") || queryNorm.includes("fadnavis")) && record.id === "tiger_shroff_advocacy_disambiguation") score += 25;
    if ((
      queryNorm.includes("janwar") || queryNorm.includes("जानवर") || queryNorm.includes("animal") ||
      queryNorm.includes("predator") || queryNorm.includes("शिकारी") || queryNorm.includes("herbivore") || queryNorm.includes("शाकाहारी") ||
      queryNorm.includes("deer") || queryNorm.includes("हिरण") || queryNorm.includes("bird") || queryNorm.includes("पक्षी") ||
      queryNorm.includes("butterfly") || queryNorm.includes("तितली") || queryNorm.includes("snake") || queryNorm.includes("सांप") ||
      queryNorm.includes("dhole") || queryNorm.includes("ढोल") || queryNorm.includes("black panther") || queryNorm.includes("ब्लैक पैंथर") ||
      queryNorm.includes("sloth bear") || queryNorm.includes("स्लॉथ बीयर") || queryNorm.includes("भालू") || queryNorm.includes("honey badger") || queryNorm.includes("ratel") ||
      queryNorm.includes("pangolin") || queryNorm.includes("gaur") || queryNorm.includes("bison") || queryNorm.includes("nilgai") ||
      queryNorm.includes("sambar") || queryNorm.includes("chital") || queryNorm.includes("chausingha") || queryNorm.includes("muntjac") ||
      queryNorm.includes("mouse deer") || queryNorm.includes("wild boar") || queryNorm.includes("langur") || queryNorm.includes("flying squirrel") ||
      queryNorm.includes("crocodile") || queryNorm.includes("python") || queryNorm.includes("cobra") || queryNorm.includes("viper") ||
      queryNorm.includes("krait") || queryNorm.includes("monitor lizard") || queryNorm.includes("tortoise") || queryNorm.includes("turtle") ||
      queryNorm.includes("lesser florican") || queryNorm.includes("pitta") || queryNorm.includes("nightjar") || queryNorm.includes("nymphalidae") ||
      queryNorm.includes("eggfly") || queryNorm.includes("spider") || queryNorm.includes("food web") || queryNorm.includes("food chain") ||
      queryNorm.includes("biodiversity") || queryNorm.includes("जैव विविधता") || queryNorm.includes("nocturnal") || queryNorm.includes("endangered")
    ) && record.id === "tatr_complete_wildlife_and_biodiversity") score += 30;

    return { record, score };
  });

  scored.sort((a, b) => b.score - a.score);

  const matched = scored.filter(s => s.score > 0).map(s => s.record).slice(0, 4);

  if (matched.length === 0) {
    const fallback = CHANDRAPUR_KNOWLEDGE_BASE.filter(r =>
      r.id === "chandrapur_collectorate_and_administration" ||
      r.id === "chandrapur_contacts_and_helplines"
    );
    return {
      matchedRecords: fallback,
      formattedContext: formatContext(fallback)
    };
  }

  return {
    matchedRecords: matched,
    formattedContext: formatContext(matched)
  };
}

function formatContext(records: ChandrapurKnowledgeRecord[]): string {
  const sections = records.map(r => `
Source: Chandrapur District Administrative Knowledge Base
Section: ${r.title}
Category: ${r.category} (${r.subcategory})
Content:
${r.content.trim()}
${r.contacts.length > 0 ? `Contacts: ${r.contacts.join(", ")}` : ""}
${r.workflow.length > 0 ? `Workflow Steps: ${r.workflow.join(" -> ")}` : ""}
`).join("\n---\n");

  return `
[CHANDRAPUR DISTRICT ADMINISTRATIVE KNOWLEDGE BASE]
Official source material retrieved for user query.

${sections}

STRICT INSTRUCTIONS FOR LISA VOICE ASSISTANT:
1. Answer the user's question accurately using the retrieved source material above.
2. Maintain your Lisa persona (helpful, intelligent, witty, conversational in Hindi/English/Hinglish/Marathi).
3. Do NOT invent facts, phone numbers, officers, or procedures not found in the source.
4. If a user asks a Chandrapur-related question whose answer is NOT present in this knowledge source, clearly say: "Available Chandrapur source data me iski complete information nahi hai." (or "I don't have that information in my Chandrapur knowledge source.").
5. Present high-level conversational answers first. If the user asks for more ("aur detail batao"), expand with the workflow/eligibility details provided above.
6. Clearly distinguish Chandrapur District (Maharashtra) from Chandrapura (Jharkhand).
7. For health/environment figures (like lung capacity or fungal survey stats), clearly present them as findings from the provided source.
`;
}

/**
 * Determines if a query is related to Chandrapur District.
 */
export function isChandrapurQuery(userQuery?: string): boolean {
  if (!IS_CHANDRAPUR_DEMO_ENABLED || !userQuery) return false;
  const norm = normalizePoliceStationName(userQuery.toLowerCase());
  const keywords = [
    "chandrapur", "chanda", "चंद्रपुर", "collector", "vasumana", "vyawahare", "kumbhar",
    "zilla parishad", "sandhya gurnule", "pulkit singh", "taluka", "subdivision",
    "warora", "bhadrawati", "chimur", "nagbhir", "bramhapuri", "sindewahi", "mul", "sawali",
    "rajura", "korpana", "jiwati", "gondpipri", "pombhurna", "ballarpur", "police station",
    "ramnagar", "ghugus", "sp office", "tatr", "tadoba", "visapur", "cstps", "wcl", "pauni",
    "fir", "lokshahi din", "7/12", "satbara", "सातबारा", "ferfar", "फेऱफार", "pesa", "fra",
    "brtc", "tiger attack", "baagh", "बाघ", "ladki bahin", "sanjay gandhi niradhar",
    "shravanbal", "pm kisan", "namo shetkari", "pik vima", "pmay", "mjpjay", "dmf", "dmft",
    "dmo", "mining officer", "naitam", "solar pump", "saur krishi", "vayoshree", "vayoshri",
    "yuva karya", "moneylender", "sahukar", "cmc", "hoarding", "helpline", "hellochanda",
    "taru", "andhari", "moharli", "kolara", "navegaon", "kolsa", "maya", "chota matka",
    "bajrang", "matkasur", "choti tara", "machan census", "vandarshan", "tiger shroff",
    "safari", "khutwanda", "agarzari", "madnapur", "alizanza", "pangadi", "zari", "devada",
    "junona", "lesser florican", "panchadhara"
  ];
  return keywords.some(kw => norm.includes(kw));
}

/**
 * Main context retrieval entry point used by server.ts
 */
export function getChandrapurContext(userQuery?: string): string {
  if (!IS_CHANDRAPUR_DEMO_ENABLED) return "";
  const { formattedContext } = searchChandrapurKnowledge(userQuery);
  return formattedContext;
}
