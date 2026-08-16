/**
 * TEMPORARY DEMO MODULE: Maharashtra State Policy, Schemes, Budget & Economic Knowledge
 * Created for live demo to the District Magistrate (DM) of Chandrapur.
 *
 * TO DISABLE OR REMOVE LATER:
 * Set `IS_MAHARASHTRA_DEMO_ENABLED = false` below, or delete this file
 * and remove its import in `server.ts`.
 */

export const IS_MAHARASHTRA_DEMO_ENABLED = true;

export const MAHARASHTRA_KNOWLEDGE_SECTIONS = {
  MHADA_HOUSING: `
=== MHADA & HOUSING INFORMATION ===
- IMPORTANT NOTICE ON MHADA LOTTERY: Detailed operational parameters, income brackets, or IHLMS portal workflows for the MHADA Lottery Scheme are NOT available in this demo knowledge base. If asked about detailed MHADA lottery criteria/IHLMS workflows, clearly state: "Is information ka detailed operational data mere current demo knowledge base mein available nahi hai."
- Pradhan Mantri Awas Yojana (PMAY):
  * 8.75 lakh urban housing units completed across Maharashtra.
  * 16.05 lakh rural housing units completed across Maharashtra.
- Ramai Awas Yojana:
  * Financial assistance: ₹1.32 lakh for rural areas, ₹1.42 lakh for hilly areas, ₹2.50 lakh for urban areas.
  * Includes ₹12,000 toilet construction grant.
  * Targeted at Scheduled Caste (SC) and Neo-Buddhist families.
- Atal Ghar Aawaas Yojana:
  * Interest subsidy up to ₹1.80 lakh on home loans under PMAY 2.0 convergence.
`,

  SANJAY_GANDHI_AND_SHRAVANBAL: `
=== SANJAY GANDHI NIRADHAR ANUDAN YOJANA & SHRAVANBAL SEVA YOJANA ===
- Nodal Department: Social Justice and Special Assistance Department, Government of Maharashtra.
- Objective: Financial security and basic livelihood to vulnerable/destitute people lacking family support.
- Target Beneficiaries: Destitute elderly citizens, orphans, widows, divorcees, deserted/separated women, Divyangjan, and persons suffering from terminal physical illnesses (Cancer, Tuberculosis, HIV/AIDS).
- Eligibility:
  * Sanjay Gandhi Niradhar Anudan Yojana: Age 18 to 65 years for applicable destitute, sick, and disabled categories.
  * Shravanbal Seva Rajya Nivruttivetan Yojana: Senior citizens aged 65 years and above.
  * Annual Family Income: Must NOT exceed ₹21,000.
  * Domicile: Permanent resident/domicile of Maharashtra.
  * Disability: Divyang applicants must have certified disability of 40% or higher.
- Financial Assistance: ₹1,500 per month paid in monthly installments via Direct Benefit Transfer (DBT) to registered Aadhaar-linked bank account.
- Required Documents: Aadhaar Card, Maharashtra Domicile Certificate, Income Certificate from Tehsildar confirming family income ≤ ₹21,000, Aadhaar-seeded & NPCI-mapped bank passbook. Category specific: Husband's Death Certificate (Widow), Disability Certificate 40%+ (Divyang), Govt medical reports (Terminal illness), Court divorce decree or Gram Panchayat/Municipal desertion certificate (Divorced/deserted).
- Application Workflow:
  * Offline: Obtain form from sas.mahait.org or local Tehsildar/Naib Tehsildar/Talathi office. Complete form & attach self-attested documents. Submit dossier to Revenue Desk at Tehsil office.
  * Online/MahaDBT: Access MahaDBT portal, authenticate via Aadhaar-linked OTP, fill details, upload scanned documents, submit.
  * Verification: Talathi/Circle Inspector physical inquiry -> Tehsildar Office review -> Sanjay Gandhi Niradhar Committee at taluka level reviews vetted list and issues final sanction.
- Grievances & Appeals:
  * Annual Existence Certificate (हयात दाखला) must be submitted annually to Tehsildar office or biometric authentication done at Setu Kendra.
  * For DBT failure: Verify individual account ownership, Aadhaar seeding, and NPCI mapping at bank branch.
  * Wrongful rejection can be appealed to the Sub-Divisional Officer (SDO).
`,

  VAYOSHREE_YOJANA: `
=== CHIEF MINISTER VAYOSHREE YOJANA ===
- Nodal Department: Social Justice and Special Assistance Department, Government of Maharashtra.
- Objective: Assist senior citizens with medical aids, orthopaedic equipment, physical assistive devices, mental health support, physical therapy, and yoga training.
- Eligibility:
  * Age: 65 years and above as of 31 December 2023.
  * Family Income: ≤ ₹2,00,000 per annum.
  * Domicile: Maharashtra domicile/residence.
  * Restriction: Must NOT have received similar free medical assistive equipment from another government department, municipal body, or state trust during the previous 3 years.
- Financial Assistance: One-time ₹3,000 paid via DBT to Aadhaar-linked, NPCI-mapped bank account.
- Required Documents: Aadhaar, Maharashtra Domicile/Residence proof, Income certificate or signed family income self-declaration, Aadhaar-linked/NPCI-seeded bank details, Declaration confirming no similar free equipment received in past 3 years.
- Application Workflow:
  * Online: cmvayoshree.mahait.org -> Register using Aadhaar & mobile -> Fill details -> Upload declarations, bank details & domicile proof.
  * Offline: Download form -> Submit with documents to Assistant Commissioner, Social Welfare of respective district.
- Verification & Sanction: Scrutiny by District Social Welfare Office & database verification; sanction within 30 days of registration.
- Grievances: Correct incomplete docs; for payment failure, complete e-KYC and NPCI mapping through bank.
`,

  BUDGET_AND_ECONOMY: `
=== MAHARASHTRA BUDGET 2026-27 & ECONOMIC OVERVIEW ===
- Presentation: Maharashtra Budget 2026-27 and Economic Survey 2025-26 presented to State Legislature on March 5–6, 2026.
- Policy Framework: Maharashtra Industries, Investment and Services Policy (MIISP) 2025.
- Strategic Goal: $1 trillion state economy by 2030.
- Budget Size (FY 2026-27 BE): Total net expenditure of ₹7,69,467 crore (excluding debt repayment of ₹64,526 crore).
- Major Sectoral Allocations:
  * Education, Sports, Arts & Culture: ₹1,08,467 crore (includes ₹10,128 crore for non-govt colleges, ₹2,608 crore for Samagra Shiksha Abhiyan).
  * Road Infrastructure & Transport: ₹53,928 crore (includes ₹38,699 crore capital outlay for roads and bridges).
  * Social Welfare & Nutrition: ₹53,430 crore (includes ₹26,500 crore for Mukhyamantri Mazi Ladaki Bahin Yojana - 2.53 crore women benefited).
  * Agriculture & Allied Activities: ₹39,160 crore (includes ₹6,060 crore for Namo Shetkari Mahasanmaan Nidhi).
  * Health & Family Welfare: ₹37,456 crore (includes ₹3,824 crore for National Rural Health Mission / NRHM).
  * Welfare of SC, ST, OBC & Minorities: ₹32,580 crore (includes ₹1,330 crore for Bharat Ratna Dr. Babasaheb Ambedkar Social Development Scheme).
- Economic & Fiscal Indicators:
  * Real GSDP Growth: 7.9% in FY 2025-26 (compared to 7.4% national real GDP). FY 2024-25 state growth was 7.3% (India 6.5%).
  * FY 2026-27 Nominal GSDP: ₹54,08,594 crore. Maharashtra share of national GSDP: 14.3%.
  * Per Capita GSDP: ₹3,61,308 (National average: ₹2,34,859).
  * Fiscal Deficit: ₹1,50,491 crore (2.8% of GSDP). Revenue Deficit: ₹40,552 crore (0.7% of GSDP).
  * Debt & Guarantees: Outstanding liabilities at 20.4% of GSDP (revised 19.1% for FY 2025-26, projection 18.3% / ₹9.32 lakh crore). State guarantees: ₹1,29,458 crore (2.8% of GSDP).
`,

  FDI_IT_AND_INDUSTRY: `
=== FDI, IT/ITES & INDUSTRIAL CLUSTERS ===
- Foreign Direct Investment (FDI):
  * Cumulative FDI Equity Inflow: US$107.09 billion / ₹8,59,196.43 crore (Oct 2019 to March 2026).
  * Ranked No. 1 nationally, capturing 31% share of India's total FDI. Single-year record in FY 2024-25: ₹1.65 lakh crore.
- IT / ITeS Sector:
  * Contribution: US$40 billion output (19% of India's US$210 billion IT/ITeS sector).
  * Generates 28% of India's software exports and accounts for 9% of Maharashtra GSDP. ~1 million employees.
  * Over 90% of the state's 205 operational private IT parks are concentrated in Mumbai and Pune.
- Regional Growth & MIISP 2025 Zonal Incentives:
  * 7 districts contribute 54% of GSDP (Mumbai, Thane, Pune, Nagpur, Raigad, Kolhapur, Sindhudurg). 27 of 35 districts are below state per-capita average.
  * MIISP 2025 Zonal Framework (Zones A to D+): Less-developed Vidarbha and Marathwada districts receive up to 100% capital subsidies, power tariff subsidies, and stamp duty waivers.
- Major Industrial Clusters:
  * Automotive & Engineering: Pune / Chakan / Talegaon, Mumbai, Nashik, Aurangabad.
  * IT/Data: Pune, Navi Mumbai.
  * Textiles: Solapur, Ichalkaranji, Karanja (Ghadge) in Wardha.
  * Chemical: Thane-Belapur Zone.
  * Mining & Power: Vidarbha (including Chandrapur).
- MIISP 2025 Investment Targets:
  * Target: ₹40 lakh crore investment and 50 lakh new jobs.
  * Thrust sectors: EVs, Semiconductors, Aerospace/Defence, Green Hydrogen, RE equipment (50%-100% capital subsidy).
- MSME & Startups:
  * 63.85 lakh registered MSMEs employing 2.52 crore people. Capital subsidy 20%-40% FCI, interest subsidy up to 5% (capped at ₹1 crore), power tariff subsidy ₹1/unit for 3 years.
  * Maharashtra holds 17% share of active Indian startups as of Feb 2026. Target: 50,000 startups and 1.25 lakh entrepreneurs. Maha-Fund: ₹500 crore.
- Renewable Energy Policy 2025-2035: Target 100 GW renewable capacity. BESS mandate for commercial & industrial solar >100 kW.
`,

  INFRASTRUCTURE_PORTS_WATER: `
=== INFRASTRUCTURE, LOGISTICS & WATER BASINS ===
- Samruddhi Mahamarg (Hindu Hrudaysamrat Balasaheb Thackeray Maharashtra Samruddhi Mahamarg):
  * 701 km, 8 lanes, 120m width connecting Nagpur to Mumbai. Cost: ₹55,335.32 crore.
  * Attracted ₹2.02 lakh crore sector-specific investments to eastern & central districts.
- Ports & Logistics:
  * JNPT / Nhava Sheva: 2025 exports cited at US$67,764.01 million (~17% of India's total exports).
  * Vadhavan Port: Major port connectivity project.
  * Container Manufacturing Scheme: ₹10,000 crore promotion scheme in 2026 Budget.
  * Maritime Acts 2025: Merchant Shipping Act, Coastal Shipping Act, Indian Ports Act 2025, One Nation One Port (ONOP).
  * Logistics Policy: Up to 50% rental assistance, 100% electricity duty exemption for eligible warehousing units.
  * Navi Mumbai International Airport: International cargo operations commenced Aug 16, 2026 (first Airbus A330-200F freighter from Hong Kong, targeting 13 weekly freighter services).
- Water & Irrigation Management:
  * Godavari Basin Projects: Jayakwadi Dam, Majalgaon Dam, Upper Wardha Dam, Upper Dudhana Dam, Tummidihetti Barrage, Sammakka Barrage, Sadarmat Barrage.
  * Water Equity: Sugarcane historically consumed ~70% of state irrigation water. Current focus on rainwater harvesting, check dams, drip/sprinkler systems, and subsidized micro-irrigation via MahaDBT.
`,

  HERITAGE_TOURISM_WILDLIFE: `
=== HERITAGE, TOURISM & WILDLIFE ===
- UNESCO World Heritage Portfolio:
  * Ajanta Caves (1983), Ellora Caves (1983), Elephanta Caves (1987), CST (2004), Victorian & Art Deco Ensembles of Mumbai (2018), Western Ghats (2012), Maratha Military Landscapes (2025).
  * Maratha Military Landscapes: 12 serial nomination fortifications (11 in Maharashtra): Raigad, Shivneri, Sindhudurg, Pratapgad, Lohagad, Panhala, Suvarnadurg, Vijaydurg, Daulatabad/Devagiri, Shaniwar Wada, Janjira.
- Tourism Policy 2024 & MahaSTRIDE:
  * Tourism Policy 2024: Target to double tourist inflow, ₹1 lakh crore private investment, 18 lakh jobs, SGST refunds, stamp duty exemptions.
  * MahaSTRIDE: World Bank supported $188.28M program for eco-friendly, low-carbon responsible tourism.
- Wildlife & Tiger Reserves:
  * State Tiger Population: 444 tigers in 2022 All India Tiger Estimation (up from 103 in 2006).
  * Tiger Reserves:
    1. Tadoba-Andhari (1,727.59 sq km, Chandrapur/Nagpur connectivity, Moharli/Kolara/Navegaon gates, famous tigers Maya & Chota Matka).
    2. Melghat (2,768 sq km, Amravati).
    3. Navegaon-Nagzira (1,895 sq km, Gondia/Bhandara).
    4. Bor (816 sq km / 138 sq km core, Wardha/Nagpur).
    5. Pench (741 sq km, Nagpur/MP border).
    6. Sahyadri (1,166 sq km, Karad/Satara, Western Ghats).
- IRCTC Vandarshan 2026:
  * Launched July 29, 2026 (International Tiger Day). Joint venture between IRCTC West Zone & Forest Department.
  * 4-night / 5-day package from Mumbai CSMT via Vidarbha Express (terminating at Gondia).
  * Covers: Tadoba-Andhari, Pench, Bor, Navegaon-Nagzira, Umred-Karhandla, Tipeshwar.
`,

  STATE_WELFARE_SCHEMES_SUMMARY: `
=== SUMMARY OF MAHARASHTRA STATE WELFARE SCHEMES ===
- Mukhyamantri Majhi Ladki Bahin Yojana: ₹1,500/month (₹18,000/year) for women aged 21-65 with family income ≤ ₹2.5 lakh (income cert waived for Yellow/Orange ration cards). eKYC deadline: March 31, 2026.
- Lek Ladki Yojana: Progressive support for girls from birth to 18 years, total support up to ₹1,01,000.
- Punyashlok Ahilyadevi Holkar Scheme: Support for women-led startups.
- UMED Bachat Gat Loan Scheme: Loans up to ₹20 lakh at 4% subsidized interest.
- Maharashtra Women Farmers Empowerment Act 2026: State Fund, Woman Farmer Database & Certificates.
- Namo Shetkari Maha Samman Nidhi: ₹6,000/year (3x ₹2,000) top-up to PM-KISAN (total ₹12,000/year combined benefit) for over 90 lakh farmers.
- Magel Tyala Saur Krishi Pump: 3, 5, 7.5 HP solar pumps. General farmers pay 10% (90% subsidy), SC/ST pay 5% (95% subsidy). 5-year warranty.
- Other Agrarian Schemes: ₹1 crop insurance (Pik Vima), Gopinath Munde Shetkari Suraksha Sanugrah, Mahatma Jyotiba Phule Shetkari Karj Mukti.
- MahaDBT Post-Matric Scholarships: Fee waivers and maintenance allowance up to ₹1,200/month for SC/ST/OBC/VJNT/SBC students.
- Dr. Panjabrao Deshmukh Hostel Allowance: Up to ₹38,000/year.
- Mukhyamantri Yuva Karya Prashikshan Yojana: 6-month training. Monthly stipend: 12th/ITI ₹6,000, Diploma ₹8,000, Graduate/PG ₹10,000.
- Mahatma Jyotirao Phule Jan Arogya Yojana (MJPJAY): Integrated with Ayushman Bharat. Cashless health cover up to ₹5 lakh per family per year for 1,356 packages.
`
};

const MAHARASHTRA_KEYWORDS = [
  "mhada", "pmay", "ramai awas", "atal ghar", "housing", "sanjay gandhi niradhar",
  "shravanbal", "vayoshree", "vayoshri", "maharashtra budget", "economic survey",
  "gsdp", "miisp", "fdi", "it park", "samruddhi mahamarg", "jnpt", "vadhavan",
  "navi mumbai airport", "jayakwadi", "upper wardha", "godavari", "unesco",
  "ajanta", "ellora", "elephanta", "maratha military", "vandarshan", "melghat",
  "navegaon", "nagzira", "bor", "pench", "sahyadri", "ladki bahin", "lek ladki",
  "namo shetkari", "saur krishi", "mahastride", "mahadbt", "panjabrao deshmukh",
  "yuva karya", "mjpjay", "ayushman", "pik vima", "umed", "ahilyadevi holkar"
];

/**
 * Determines if a query is related to Maharashtra State policies, schemes, budget, or infrastructure.
 */
export function isMaharashtraQuery(userQuery?: string): boolean {
  if (!IS_MAHARASHTRA_DEMO_ENABLED || !userQuery) return false;
  const norm = userQuery.toLowerCase();
  return MAHARASHTRA_KEYWORDS.some(kw => norm.includes(kw));
}

/**
 * Retrieves relevant Maharashtra State context based on user query keywords.
 */
export function getMaharashtraContext(userQuery?: string): string {
  if (!IS_MAHARASHTRA_DEMO_ENABLED) return "";

  let selectedSections: string[] = [];

  if (userQuery) {
    const norm = userQuery.toLowerCase();

    if (!isMaharashtraQuery(norm)) {
      return "";
    }

    if (norm.includes("mhada") || norm.includes("pmay") || norm.includes("ramai") || norm.includes("atal ghar") || norm.includes("housing") || norm.includes("makaan") || norm.includes("ghar")) {
      selectedSections.push(MAHARASHTRA_KNOWLEDGE_SECTIONS.MHADA_HOUSING);
    }
    if (norm.includes("sanjay gandhi") || norm.includes("niradhar") || norm.includes("shravanbal") || norm.includes("pension") || norm.includes("widow") || norm.includes("divyang") || norm.includes("hayat")) {
      selectedSections.push(MAHARASHTRA_KNOWLEDGE_SECTIONS.SANJAY_GANDHI_AND_SHRAVANBAL);
    }
    if (norm.includes("vayoshree") || norm.includes("vayoshri") || norm.includes("senior citizen") || norm.includes("3000")) {
      selectedSections.push(MAHARASHTRA_KNOWLEDGE_SECTIONS.VAYOSHREE_YOJANA);
    }
    if (norm.includes("budget") || norm.includes("economy") || norm.includes("gsdp") || norm.includes("expenditure") || norm.includes("per capita") || norm.includes("trillion")) {
      selectedSections.push(MAHARASHTRA_KNOWLEDGE_SECTIONS.BUDGET_AND_ECONOMY);
    }
    if (norm.includes("fdi") || norm.includes("it park") || norm.includes("cluster") || norm.includes("miisp") || norm.includes("msme") || norm.includes("incentive") || norm.includes("startup")) {
      selectedSections.push(MAHARASHTRA_KNOWLEDGE_SECTIONS.FDI_IT_AND_INDUSTRY);
    }
    if (norm.includes("samruddhi") || norm.includes("port") || norm.includes("jnpt") || norm.includes("vadhavan") || norm.includes("airport") || norm.includes("highway") || norm.includes("water") || norm.includes("dam") || norm.includes("godavari") || norm.includes("irrigation")) {
      selectedSections.push(MAHARASHTRA_KNOWLEDGE_SECTIONS.INFRASTRUCTURE_PORTS_WATER);
    }
    if (norm.includes("unesco") || norm.includes("tourism") || norm.includes("fort") || norm.includes("ajanta") || norm.includes("ellora") || norm.includes("tiger") || norm.includes("reserve") || norm.includes("vandarshan") || norm.includes("mahastride") || norm.includes("melghat") || norm.includes("pench") || norm.includes("bor")) {
      selectedSections.push(MAHARASHTRA_KNOWLEDGE_SECTIONS.HERITAGE_TOURISM_WILDLIFE);
    }
    if (norm.includes("scheme") || norm.includes("yojana") || norm.includes("ladki bahin") || norm.includes("shetkari") || norm.includes("saur krishi") || norm.includes("stipend") || norm.includes("mjpjay") || norm.includes("scholarship")) {
      selectedSections.push(MAHARASHTRA_KNOWLEDGE_SECTIONS.STATE_WELFARE_SCHEMES_SUMMARY);
    }

    if (selectedSections.length === 0) {
      selectedSections = [
        MAHARASHTRA_KNOWLEDGE_SECTIONS.STATE_WELFARE_SCHEMES_SUMMARY,
        MAHARASHTRA_KNOWLEDGE_SECTIONS.BUDGET_AND_ECONOMY
      ];
    }
  } else {
    // Broad/Live Voice Session: Provide all sections
    selectedSections = Object.values(MAHARASHTRA_KNOWLEDGE_SECTIONS);
  }

  return `
[TEMPORARY DEMO KNOWLEDGE: MAHARASHTRA STATE POLICIES, SCHEMES & ECONOMY]
The user is asking a question related to Maharashtra State policies, welfare schemes, budget, or infrastructure. Use the following official data to answer accurately and naturally in your Lisa persona.

${selectedSections.join("\n")}

STRICT SOURCE LIMITATION & RESPONSE RULES FOR MAHARASHTRA KNOWLEDGE:
1. Answer the question directly and naturally using the facts supplied above.
2. If the user asks about MHADA lottery operational criteria/income brackets/IHLMS workflows or any specific scheme workflow/amount NOT present in this supplied knowledge, DO NOT invent information. Explicitly state: "Is information ka detailed operational data mere current demo knowledge base mein available nahi hai."
3. Maintain your Lisa persona (helpful, witty, empathetic, conversational in Hinglish/English).
4. Do NOT invent missing details, phone numbers, or deadlines.
`;
}
