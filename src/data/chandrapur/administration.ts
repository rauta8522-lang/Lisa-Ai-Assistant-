/**
 * Chandrapur District Leadership, Executive Officers, Zilla Parishad & Municipal Directory
 */

export interface OfficerInfo {
  designation: string;
  name: string;
  cadre?: string;
  department?: string;
  phone?: string;
  email?: string;
  officeLocation?: string;
}

export const DISTRICT_LEADERSHIP: OfficerInfo[] = [
  {
    designation: "District Collector & District Magistrate",
    name: "Mrs. Vasumana Pant",
    cadre: "IAS",
    phone: "07172-255300",
    email: "collector.chandrapur@maharashtra.gov.in",
    officeLocation: "District Collectorate, Civil Lines, Chandrapur"
  },
  {
    designation: "Additional District Collector",
    name: "Dr. Nitin Vyawahare",
    phone: "07172-256101",
    email: "addcoll.chanda@gmail.com",
    officeLocation: "District Collectorate, Chandrapur"
  },
  {
    designation: "Resident Deputy Collector (RDC)",
    name: "Mr. D.S. Kumbhar",
    phone: "07172-255400",
    email: "chandrapur.rdc@gmail.com",
    officeLocation: "District Collectorate, Chandrapur"
  }
];

export const DEPARTMENTAL_OFFICERS: OfficerInfo[] = [
  {
    designation: "District Mining Officer (DMO)",
    name: "Mr. S.S. Naitam",
    phone: "07172-272690",
    email: "miningofficer.chanda@gmail.com",
    department: "District Mining Office",
    officeLocation: "Collector Office Complex, Chandrapur"
  },
  {
    designation: "Employment Guarantee Scheme (EGS) & Election Officer",
    name: "Mr. Shubham Dandekar",
    phone: "07172-251597",
    department: "EGS & Election Branch"
  },
  {
    designation: "Land Acquisition Officer",
    name: "Mr. Sanjay Pawar",
    phone: "07172-251597",
    department: "Land Acquisition Branch"
  },
  {
    designation: "District Rehabilitation Officer",
    name: "Mr. Atul Jatale",
    phone: "07172-251597",
    department: "Rehabilitation Branch"
  },
  {
    designation: "District Supply Officer",
    name: "Mr. R.R. Bahadurkar",
    phone: "07172-251597",
    department: "Food & Civil Supplies Branch"
  },
  {
    designation: "District Planning Officer",
    name: "Mr. Sanjay Kadu",
    phone: "07172-251597",
    department: "District Planning Committee (DPC)"
  },
  {
    designation: "District Nagar Palika Officer",
    name: "Smt. Vidya Gaikwad",
    phone: "07172-251597",
    department: "Municipal Administration Branch"
  }
];

export const ZILLA_PARISHAD_LEADERSHIP = {
  president: "Mrs. Sandhya Gurnule",
  vicePresident: "Mrs. Rekha Karekar",
  ceo: "Shri Pulkit Singh (IAS)",
  keyDepartments: [
    "Primary Education",
    "Secondary Education",
    "Women & Child Welfare (WCD Sakhi Center)",
    "Health Department",
    "National Health Mission (NHM)",
    "Rural Water Supply",
    "Soil & Water Conservation",
    "Finance Branch",
    "DRDA (District Rural Development Agency)"
  ],
  specialInitiatives: [
    "Chanda Jyoti Super-100 (Competitive exam guidance for talented rural students)",
    "Anganwadi recruitment & nutritional enhancement drive"
  ],
  panchayatSamitis: [
    "Ballarpur", "Bhadrawati", "Brahmapuri", "Nagbhid", "Jiwati", "Chandrapur",
    "Warora", "Chimur", "Sindewahi", "Mul", "Sawali", "Rajura", "Korpana",
    "Gondpipri", "Pombhurna"
  ]
};

export const MUNICIPAL_CORPORATION = {
  name: "Chandrapur Municipal Corporation (CMC)",
  mayor: "Mrs. Sangeeta Khandekar",
  deputyMayor: "Mr. Prashant Danav",
  commissioner: "Shri Akunuri Naresh (IAS)",
  officeLocation: "Gandhichowk Road, Chandrapur",
  mainTelephone: "07172-250220",
  tollFree: "1800-309-7040",
  whatsappChatbot: "8530006063",
  services: [
    "Property Tax payment & assessment",
    "Birth & Death Certificate issuance",
    "Temporary Hoarding License",
    "Stage / Mandap Permission",
    "Tree Cutting Permission",
    "Illegal Hoarding Complaint",
    "General Civic & Solid Waste Grievances",
    "Heat Mitigation Mandate (Mandatory outdoor labor rest 12:00-4:00 PM during Heatwave alerts)"
  ]
};