export interface ChandrapurOfficial {
  title: string;
  name: string;
  department: string;
  contact?: string;
}

export const CHANDRAPUR_ADMINISTRATIVE_BLUEPRINT = `
# KNOWLEDGE BASE: CHANDRAPUR DISTRICT ADMINISTRATIVE BLUEPRINT

## 1. Executive Leadership & Collectorate Hierarchy
- District Collector & Magistrate (DM): Mrs. Vasumana Pant (IAS)
- Additional District Collector: Dr. Nitin Vyawahare
- Resident Deputy Collector (RDC): Mr. D.S. Kumbhar
- Scale & Demographics: 2,194,962 residents | 11,443 sq km total area | 8 Sub-divisions | 15 Talukas.
- Sub-Divisions & Talukas Breakdown:
  * Chandrapur (Chandrapur: 84 villages, Ballarpur: 28 villages)
  * Warora (Warora: 162 villages, Bhadrawati: 148 villages)
  * Chimur (Chimur: 259 villages, Nagbhir: 114 villages)
  * Bramhapuri (Bramhapuri: 112 villages, Sindewahi: 102 villages)
  * Mul (Mul: 101 villages, Sawali: 98 villages)
  * Rajura (Rajura: 108 villages, Korpana: 94 villages, Jiwati: 82 villages)
  * Gondpipri (Gondpipri: 91 villages, Pombhurna: 64 villages)
- Key Collectorate Branches & Contacts:
  * Main Collectorate Office: 07172-251597 (General Admin & Land Acquisition under Act 2013 / Amendment 2008)
  * SP Office: 07172-273258
  * Civil Surgeon / District Hospital: 07172-253275
  * Other Branches (EGS/MGNREGA, Mining, Supply, Rehabilitation/PAP, Nagar Palika, Planning 2026-2030): 07172-251597.

## 2. Zilla Parishad (ZP) & Rural Governance
- ZP President: Mrs. Sandhya Gurnule
- Chief Executive Officer (CEO): Shri Pulkit Singh (IAS)
- 17 Line Departments: General Administration, Gram Panchayat, Animal Husbandry, MSRLM, Health, Education (Primary/Secondary), Finance & Accounts, PWD, Agriculture, Water Supply & Sanitation, Social Welfare, Women & Child Development (Sakhi One Stop Center), ICDS, Planning & Statistics, Minor Irrigation, Veterinary Services, DRDA.
- Gorewada Animal Adoption Scheme:
  * Tiger / Leopard: ₹1,500/day | ₹30,000/mo (Tiger) / ₹25,000/mo (Leopard) | ₹2,00,000/yr (Tiger) / ₹1,00,000/yr (Leopard)
  * Sloth Bear: ₹1,500/day | ₹20,000/mo | ₹75,000/yr
  * Birds (Bonelli's Eagle, Eurasian Owl, Reeve's Pheasant): ₹1,000/day | ₹5,000/mo | ₹25,000/yr.

## 3. Chandrapur Municipal Corporation (CMC - Urban Governance)
- Mayor: Sangeeta Khandekar | Municipal Commissioner: Sanjay Kakade / Vipin Paliwal
- Zones: 3 Administrative Zones (including Gandhichowk Road Office).
- Citizen Protocols:
  * Property Tax: Ward Offices / CMC Online Portal.
  * Public Amusement Licenses: Regulated under Rules for Licensing Places of Public Amusement 2026.
  * Solid Waste & Tree Cutting: Regulated under Solid Waste Management Rules 2026 (requires Municipal Garden Department inspection).
  * Heatwave Protocol: Enforce mandatory rest breaks for informal workers (12:00 PM to 4:00 PM) during Orange/Red alerts.

## 4. Police Administration & Jurisdiction
- Superintendent of Police (SP): 07172-273258 | 6 SDPOs | 34 Total Police Stations across district.
- Key Police Stations: Ramnagar (07172-252139), Ghugus, Bramhapuri, Rajura, Mul, Gondpipri, Jiwati, Sawali, City PS, Nagbhir, Bhadrawati, Warora, Ballarpur, Sindewahi, Korpana, Pombhurna, Chimur (Central line: 07172-251597).
- Emergency & FIR: 112 for immediate dispatch; e-FIR on Maharashtra Police Portal for non-cognizable theft.

## 5. Grievance Redressal, Helplines & Disaster Management
- Lokshahi Din: 1st Monday (Collectorate/ZP), 3rd Monday (Tehsil level).
- Aaple Sarkar Portal: Strict 21-day Turnaround Time (TAT).
- Emergency Numbers:
  * District Disaster Management: 1077
  * State Control Room (Mumbai): 022-22027990
  * SDRF Nagpur: 7507740400
  * TATR Wildlife Emergency: 18003033
  * Ambulance: 108 | Women Helpline: 181 / 1091 | Child: 1098 | Senior Citizen: 14567 | Voter: 1950
  * Illegal Moneylending Complaints: 1800-233-8691.
- Heat Action Plan SOP:
  * Yellow Alert: Initial alert & advisory.
  * Orange Alert: Water booths at major traffic junctions + ORS distribution via PHCs.
  * Red Alert: Emergency mode; ban on non-essential outdoor labor during peak hours.
`.trim();

export class ChandrapurKnowledgeEngine {
  private static KEYWORDS = [
    "chandrapur", "vasumana", "vyawahare", "kumbhar", "gurnule", "pulkit", "kakade", "paliwal",
    "khandekar", "collector", "zp", "zilla parishad", "cmc", "municipal", "ramnagar", "ballarpur",
    "warora", "bhadrawati", "chimur", "nagbhir", "bramhapuri", "sindewahi", "mul", "sawali",
    "rajura", "korpana", "jiwati", "gondpipri", "pombhurna", "ghugus", "lokshahi", "gorewada",
    "tatr", "heatwave", "heat action", "aaple sarkar", "disaster management", "sdrf", "moneylending"
  ];

  public static matchesQuery(query: string): boolean {
    if (!query) return false;
    const lower = query.toLowerCase();
    return this.KEYWORDS.some(kw => lower.includes(kw));
  }

  public static getKnowledgeContext(query: string): string | null {
    if (!this.matchesQuery(query)) {
      return null;
    }
    return `\n\nADMINISTRATIVE DOMAIN KNOWLEDGE (CHANDRAPUR DISTRICT BLUEPRINT):\n${CHANDRAPUR_ADMINISTRATIVE_BLUEPRINT}\n`;
  }
}
