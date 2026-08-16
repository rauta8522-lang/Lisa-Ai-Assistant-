/**
 * Chandrapur District Welfare Schemes Database
 */

export interface StructuredScheme {
  id: string;
  name: string;
  shortName?: string;
  category: string;
  objective: string;
  eligibility: string[];
  exclusions: string[];
  financialBenefit: string;
  installments?: string;
  requiredDocuments: string[];
  applicationProcess: {
    onlinePortal?: string;
    offlineProcess?: string[];
  };
  helpline: string[];
  importantNotes?: string;
  sourceStatus: "source-provided";
}

export const CHANDRAPUR_SCHEMES: StructuredScheme[] = [
  {
    id: "majhi-ladki-bahin",
    name: "Mukhyamantri Majhi Ladki Bahin Yojana",
    shortName: "Ladki Bahin",
    category: "Women Welfare",
    objective: "Economic independence, dignity, health and nutrition for women in Maharashtra.",
    eligibility: [
      "Female resident of Maharashtra (minimum 5 years residency)",
      "Age: 21 to 65 years",
      "Annual family income <= ₹2,50,000 (Income certificate waived for Yellow and Orange Ration Cardholders)",
      "Married, Widowed, Divorced, Separated, Abandoned/destitute women, or 1 unmarried woman per family"
    ],
    exclusions: [
      "Family member is a government employee",
      "Income taxpayer in family",
      "Constitutional/elected post holder in family",
      "Family owns a 4-wheeler (except tractor)",
      "Applicant already receiving ₹1,500+ per month from another state welfare scheme"
    ],
    financialBenefit: "₹1,500 per month (₹18,000 per year) via Direct Benefit Transfer (DBT)",
    installments: "Monthly DBT directly into Aadhaar-linked bank account",
    requiredDocuments: [
      "Passport size photograph",
      "Aadhaar Card",
      "Maharashtra Domicile/Residency proof or Yellow/Orange Ration Card / Voter ID / Birth Certificate / Old School Leaving Certificate",
      "Income certificate (or Yellow/Orange Ration card)",
      "Aadhaar-linked & NPCI-mapped Bank Passbook",
      "Declaration / Affirmation form"
    ],
    applicationProcess: {
      onlinePortal: "ladakibahin.maharashtra.gov.in (also Nari Shakti Doot App)",
      offlineProcess: [
        "Visit local Anganwadi center desk",
        "Gram Panchayat Setu Kendra",
        "CSC (Common Service Center)",
        "Municipal Ward Office"
      ]
    },
    helpline: ["07172-251597 (WCD Branch ZP Chandrapur)"],
    importantNotes: "Mandatory e-KYC required on portal for installment releases.",
    sourceStatus: "source-provided"
  },
  {
    id: "magel-tyala-saur-krishi-pump",
    name: "Magel Tyala Saur Krishi Pump Yojana",
    shortName: "Solar Pump Scheme",
    category: "Agrarian / Renewable Energy",
    objective: "Provide off-grid solar irrigation pumps for farmers to ensure day-time reliable water supply.",
    eligibility: [
      "Resident farmer of Maharashtra",
      "Cultivable agricultural land in applicant's name with valid 7/12 extract",
      "Farmers having no electricity connection or on waitlist for conventional farm power",
      "Pump sizing: Up to 2.5 acres -> 3 HP; 2.5 to 5 acres -> 5 HP; More than 5 acres -> 7.5 HP"
    ],
    exclusions: [
      "Farmers already enjoying energized grid agricultural pump connections"
    ],
    financialBenefit: "General Category: ~90% subsidy (10% farmer share). SC/ST Category: ~95% subsidy (5% farmer share). Includes 5-year comprehensive repair and maintenance warranty.",
    requiredDocuments: [
      "Aadhaar Card",
      "7/12 extract and 8-A extract",
      "Caste certificate (for SC/ST subsidy)",
      "Aadhaar-linked Bank Passbook",
      "Electricity consumer number or waitlist slip (if applicable)",
      "Passport photograph"
    ],
    applicationProcess: {
      onlinePortal: "MSEDCL Renewable Energy Portal / Maharashtra Energy Dept portal",
      offlineProcess: ["MSEDCL Subdivision Office / Taluka Agriculture Office"]
    },
    helpline: ["07172-251597 (Agriculture Branch)"],
    importantNotes: "Includes 5-year comprehensive warranty and repair support from vendor.",
    sourceStatus: "source-provided"
  },
  {
    id: "mjpjay-health",
    name: "Mahatma Jyotirao Phule Jan Arogya Yojana",
    shortName: "MJPJAY",
    category: "Healthcare Coverage",
    objective: "Cashless secondary and tertiary hospitalization and surgical treatment for eligible families.",
    eligibility: [
      "Category A: Yellow, AAY, Annapurna, and Orange ration cardholders in Maharashtra",
      "Category B: White ration cardholders and domicile families without ration cards",
      "Category C: Orphans, shelter women, old age home seniors, journalists, registered construction workers",
      "Category D: Road traffic accident victims in Maharashtra",
      "Category E: Residents of 865 border villages along Maharashtra-Karnataka border"
    ],
    exclusions: [
      "Non-empanelled hospitals without pre-authorization"
    ],
    financialBenefit: "Categories A/B/C/E: ₹5,00,000 per family per year on floater basis (1,356 packages across 34 specialties). Category D (accident victims): ₹1,00,000 per person (184 accident packages).",
    requiredDocuments: [
      "Aadhaar Card or Aadhaar enrollment slip",
      "Ration Card (Yellow/Orange/Antyodaya/White) or Domicile Certificate",
      "Government photo ID proof",
      "Category-specific certificate (for journalists, construction workers, etc.)"
    ],
    applicationProcess: {
      onlinePortal: "mjpjay.maharashtra.gov.in",
      offlineProcess: [
        "Visit Arogyamitra Helpdesk at Civil Hospital Chandrapur or empanelled private hospitals",
        "Arogyamitra verifies documents and submits online pre-authorization request"
      ]
    },
    helpline: ["155388", "1800-233-2200"],
    importantNotes: "100% cashless treatment at empanelled hospitals upon pre-authorization.",
    sourceStatus: "source-provided"
  },
  {
    id: "sanjay-gandhi-niradhar",
    name: "Sanjay Gandhi Niradhar Anudan Yojana",
    shortName: "Sanjay Gandhi Pension",
    category: "Social Security Pensions",
    objective: "Monthly financial pension to destitute persons, widows, divorcees, deserted women, and Divyangjan.",
    eligibility: [
      "Maharashtra domicile resident",
      "Age 18 to 65 years",
      "Family annual income <= ₹21,000",
      "Target groups: Destitute persons, widows, divorcees, deserted women, orphans, Divyangjan (40%+ disability), terminally ill patients (TB, Cancer, HIV/AIDS)"
    ],
    exclusions: [
      "Family annual income exceeding ₹21,000"
    ],
    financialBenefit: "₹1,500 per month pension paid directly via DBT.",
    requiredDocuments: [
      "Aadhaar Card",
      "Maharashtra Domicile Certificate",
      "Income Certificate from Tehsildar (annual income <= ₹21,000)",
      "Category proof (Husband's death certificate for widow, 40%+ disability cert from Civil Surgeon for Divyang)",
      "Aadhaar-linked Bank Passbook"
    ],
    applicationProcess: {
      onlinePortal: "sas.mahait.org / MahaDBT Portal",
      offlineProcess: [
        "Submit application at Tehsil Revenue Desk / Setu Kendra",
        "Verification by Talathi / Circle Officer",
        "Sanction by Taluka Sanjay Gandhi Niradhar Committee chaired by Tehsildar"
      ]
    },
    helpline: ["07172-251597 (Social Welfare Cell)"],
    importantNotes: "Annual Life Certificate (Hayat Dakhla) submission required to maintain active pension.",
    sourceStatus: "source-provided"
  },
  {
    id: "cm-vayoshree",
    name: "Chief Minister Vayoshree Yojana",
    shortName: "Vayoshree Yojana",
    category: "Senior Citizen Welfare",
    objective: "Provide financial aid to senior citizens for purchasing assistive devices, physical therapy equipment, and mental health aids.",
    eligibility: [
      "Permanent resident of Maharashtra",
      "Age 65 years and above",
      "Annual family income <= ₹2,00,000",
      "Self-declaration confirming non-receipt of similar equipment or benefits in the previous 3 years"
    ],
    exclusions: [
      "Senior citizens who received similar assistive device grants in the last 3 years"
    ],
    financialBenefit: "One-time ₹3,000 Direct Benefit Transfer (DBT) into Aadhaar-linked bank account.",
    requiredDocuments: [
      "Aadhaar Card",
      "Age proof / Birth cert / Voter ID",
      "Income Certificate or Self-Declaration (income <= ₹2 Lakh)",
      "Declaration of non-receipt of benefits in past 3 years",
      "Bank Account details (Aadhaar linked)"
    ],
    applicationProcess: {
      onlinePortal: "cmvayoshree.mahait.org",
      offlineProcess: [
        "Assistant Commissioner, Social Welfare Office Chandrapur",
        "Tehsil Revenue Desk / Setu Kendra"
      ]
    },
    helpline: ["07172-251597 (Social Welfare Department)"],
    sourceStatus: "source-provided"
  },
  {
    id: "namo-shetkari",
    name: "Namo Shetkari Maha Samman Nidhi Yojana",
    shortName: "Namo Shetkari",
    category: "Agrarian Welfare",
    objective: "State top-up scheme providing additional financial support to landholder farmers alongside PM-KISAN.",
    eligibility: [
      "Active beneficiary of PM-KISAN in Maharashtra",
      "Landholding farmer with valid 7/12 & 8-A records",
      "Aadhaar e-KYC and NPCI bank account mapping active"
    ],
    exclusions: [
      "Income taxpayers, constitutional post holders, retired pensioners with pension > ₹10,000/month"
    ],
    financialBenefit: "₹6,000 per year paid in 3 equal installments of ₹2,000 each. Combined with PM-KISAN (₹6,000), total benefit is ₹12,000 per year.",
    requiredDocuments: [
      "Aadhaar Card",
      "7/12 and 8-A land extracts",
      "PM-KISAN Registration ID",
      "Aadhaar-linked & NPCI-seeded bank passbook"
    ],
    applicationProcess: {
      onlinePortal: "nsmny.mahait.org / pmkisan.gov.in",
      offlineProcess: ["Automated processing for verified PM-KISAN farmers; contact Talathi/Tehsildar for land seeding issues"]
    },
    helpline: ["07172-251597 (District Agriculture Office)"],
    sourceStatus: "source-provided"
  },
  {
    id: "yuva-karya-prashikshan",
    name: "Mukhyamantri Yuva Karya Prashikshan Yojana",
    shortName: "Youth Internship Scheme",
    category: "Youth & Employment Training",
    objective: "Enhance youth employability through 6-month hands-on industrial and practical training with monthly stipends.",
    eligibility: [
      "Unemployed youth residing in Maharashtra",
      "Educational qualification: 12th Pass, ITI, Diploma, Graduate, or Post-Graduate",
      "Age: 18 to 35 years"
    ],
    exclusions: [
      "Currently employed candidates or those already benefiting from similar state apprenticeship schemes"
    ],
    financialBenefit: "6-month stipend: 12th Pass / ITI: ₹6,000/month; Diploma holders: ₹8,000/month; Graduates / Post-Graduates: ₹10,000/month.",
    requiredDocuments: [
      "Educational marksheets & degree certificates",
      "Aadhaar Card",
      "Maharashtra Domicile Certificate",
      "Aadhaar-linked Bank Passbook"
    ],
    applicationProcess: {
      onlinePortal: "rojgar.mahaswayam.gov.in",
      offlineProcess: [
        "Register as job-seeker on Mahaswayam portal",
        "Upload education and domicile certificates",
        "Apply for available training vacancies posted by empanelled industries"
      ]
    },
    helpline: ["07172-251597 (District Skill Development Office)"],
    sourceStatus: "source-provided"
  }
];