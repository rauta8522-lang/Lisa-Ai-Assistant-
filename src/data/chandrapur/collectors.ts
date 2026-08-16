/**
 * Chandrapur District Collectors & Collectorate Officers Module
 * Source-Derived Administrative Dossier
 */

export interface CollectorInfo {
  name: string;
  hindiName: string;
  designation: string;
  hindiDesignation: string;
  office: string;
  isCurrent: boolean;
  tenure?: string;
  phone?: string;
  fax?: string;
  email?: string;
  notes?: string;
}

export interface CollectorateOfficer {
  name: string;
  hindiName: string;
  designation: string;
  department?: string;
  phone?: string;
  email?: string;
  responsibilities?: string[];
  aliases?: string[];
}

export const CURRENT_COLLECTOR: CollectorInfo = {
  name: "Mrs. Vasumana Pant, IAS",
  hindiName: "श्रीमती वसुमाना पंत (IAS)",
  designation: "District Collector & District Magistrate, Chandrapur",
  hindiDesignation: "जिला कलेक्टर और जिला मजिस्ट्रेट, चंद्रपुर",
  office: "Collector Office, Chandrapur",
  isCurrent: true,
  phone: "07172-255300",
  fax: "07172-255500",
  email: "collector.chandrapur@maharashtra.gov.in",
  notes: "The available source does not provide detailed information about Mrs. Vasumana Pant's previous administrative postings, career history, or personal background."
};

export const FORMER_COLLECTORS: CollectorInfo[] = [
  {
    name: "Shri Ajay Gulhane, IAS",
    hindiName: "श्री अजय गुल्हाने, IAS",
    designation: "Former District Collector, Chandrapur",
    hindiDesignation: "पूर्व जिला कलेक्टर, चंद्रपुर",
    office: "Collector Office, Chandrapur",
    isCurrent: false,
    tenure: "2020–2022",
    notes: "Ajay Gulhane served as District Collector of Chandrapur from 2020 to 2022."
  },
  {
    name: "G.C. Vinay Gowda, IAS",
    hindiName: "जी. सी. विनय गौड़ा, IAS",
    designation: "Former District Collector, Chandrapur",
    hindiDesignation: "पूर्व जिला कलेक्टर, चंद्रपुर",
    office: "Collector Office, Chandrapur",
    isCurrent: false,
    tenure: "2022 onward, until Mrs. Vasumana Pant assumed charge",
    notes: "Served from 2022 until Mrs. Vasumana Pant assumed charge."
  }
];

export const HISTORICAL_DATA_LIMITATION = {
  historical_data_coverage: "Partial",
  coverage_note: "The supplied sources do not contain a complete list of all Chandrapur District Collectors for the last 15 years.",
  hindiResponse: "उपलब्ध स्रोत में पिछले 15 वर्षों के सभी कलेक्टरों की पूरी सूची नहीं है। स्रोत में निम्न कलेक्टर दर्ज हैं:\n1. Ajay Gulhane, IAS – 2020–2022\n2. G.C. Vinay Gowda, IAS – 2022 से Vasumana Pant के पदभार संभालने तक\n3. Vasumana Pant, IAS – वर्तमान जिला कलेक्टर के रूप में स्रोत में दर्ज",
  englishResponse: "The supplied source does not contain a complete 15-year list. It records Ajay Gulhane, G.C. Vinay Gowda and the current Collector Vasumana Pant."
};

export const KEY_COLLECTORATE_OFFICERS: CollectorateOfficer[] = [
  {
    name: "Dr. Nitin Vyawahare",
    hindiName: "डॉ. नितिन व्यवहारे",
    designation: "Additional District Collector",
    phone: "07172-256101",
    email: "addcoll.chanda@gmail.com",
    aliases: ["Dr. Nitin Vyawahare", "डॉ. नितिन व्यवहारे", "Additional Collector Chandrapur", "अपर जिला कलेक्टर"]
  },
  {
    name: "Mr. D. S. Kumbhar",
    hindiName: "श्री डी. एस. कुंभार",
    designation: "Resident Deputy Collector (RDC)",
    phone: "07172-255400",
    email: "chandrapur.rdc@gmail.com",
    aliases: ["D. S. Kumbhar", "श्री डी. एस. कुंभार", "RDC Chandrapur", "निवासी उपजिल्हाधिकारी"]
  },
  {
    name: "Mr. Shubham Dandekar",
    hindiName: "श्री शुभम दांडेकर",
    designation: "Sub-Divisional Officer (SDO)",
    department: "Employment Guarantee Scheme (EGS) & Election Branch",
    responsibilities: ["Employment Guarantee Scheme (EGS)", "Election Branch Administration"],
    aliases: ["Shubham Dandekar", "शुभम दांडेकर", "EGS Officer", "Election Branch Officer", "उपजिल्हाधिकारी EGS", "उपजिल्हाधिकारी चुनाव शाखा"]
  },
  {
    name: "Mr. Sanjay Pawar",
    hindiName: "श्री संजय पवार",
    designation: "Sub-Divisional Officer (SDO) / Land Acquisition Officer",
    department: "Land Acquisition Branch",
    responsibilities: ["Land Acquisition"],
    aliases: ["Sanjay Pawar", "संजय पवार", "Land Acquisition Officer", "भूमि संपादन अधिकारी"]
  },
  {
    name: "Mr. S. S. Naitam",
    hindiName: "श्री एस. एस. नैताम",
    designation: "District Mining Officer (DMO)",
    department: "District Mining Department",
    phone: "07172-272690",
    email: "miningofficer.chanda@gmail.com",
    responsibilities: [
      "Assists District Collector in mineral administration",
      "Survey & regulation of coal, limestone, iron ore & fluorite mining",
      "DMFT & PMKKKY project coordination"
    ],
    aliases: ["S. S. Naitam", "श्री एस. एस. नैताम", "District Mining Officer", "DMO Chandrapur", "जिला खनन अधिकारी"]
  }
];

export const COLLECTORATE_CONTACT_DIRECTORY = [
  { role: "CURRENT DISTRICT COLLECTOR", name: "Vasumana Pant, IAS", phone: "07172-255300", email: "collector.chandrapur@maharashtra.gov.in" },
  { role: "FAX", name: "Collector Office Fax", phone: "07172-255500", email: "-" },
  { role: "ADDITIONAL DISTRICT COLLECTOR", name: "Dr. Nitin Vyawahare", phone: "07172-256101", email: "addcoll.chanda@gmail.com" },
  { role: "RESIDENT DEPUTY COLLECTOR", name: "D. S. Kumbhar", phone: "07172-255400", email: "chandrapur.rdc@gmail.com" },
  { role: "DISTRICT MINING OFFICER", name: "S. S. Naitam", phone: "07172-272690", email: "miningofficer.chanda@gmail.com" },
  { role: "SDO (EGS & ELECTION)", name: "Shubham Dandekar", phone: "07172-255300", email: "-" },
  { role: "SDO (LAND ACQUISITION)", name: "Sanjay Pawar", phone: "07172-255300", email: "-" }
];

export const CHANDRAPUR_COLLECTORS_AND_OFFICERS_DOSSIER = {
  id: "chandrapur_collectors_and_officers",
  title: "Chandrapur District Collectors & Collectorate Officers",
  hindiTitle: "चंद्रपुर जिला कलेक्टर एवं कलेक्ट्रेट अधिकारी",
  subtitle: "Current Collector, Former Collectors, Key Collectorate Officers & Official Contacts",
  categoryPath: "Chandrapur → District Administration → Collectorate → District Collectors & Officers",
  tags: [
    "Chandrapur Collector",
    "District Collector Chandrapur",
    "District Magistrate Chandrapur",
    "DM Chandrapur",
    "Collector Office Chandrapur",
    "Collectorate Chandrapur",
    "Vasumana Pant",
    "Ajay Gulhane",
    "Vinay Gowda",
    "Nitin Vyawahare",
    "D.S. Kumbhar",
    "Shubham Dandekar",
    "Sanjay Pawar",
    "S.S. Naitam",
    "District Mining Officer"
  ],
  currentCollector: CURRENT_COLLECTOR,
  formerCollectors: FORMER_COLLECTORS,
  historicalDataLimitation: HISTORICAL_DATA_LIMITATION,
  keyOfficers: KEY_COLLECTORATE_OFFICERS,
  contactDirectory: COLLECTORATE_CONTACT_DIRECTORY
};
