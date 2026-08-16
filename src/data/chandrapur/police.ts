/**
 * Chandrapur District Police Directory & Phonetic Normalization
 */

export interface PoliceContact {
  office: string;
  phone: string;
  location?: string;
}

export const POLICE_DIRECTORY = {
  spOffice: {
    office: "Superintendent of Police (SP) Office",
    phone: "07172-255100",
    altPhone: "07172-273258"
  },
  additionalSP: {
    office: "Additional Superintendent of Police",
    phone: "07172-255102"
  },
  controlRoom: "112 / 07172-255100",
  sdpos: [
    { office: "SDPO Chandrapur", phone: "07172-255100" },
    { office: "SDPO Rajura", phone: "07172-255100" },
    { office: "SDPO Bramhapuri", phone: "07172-255100" },
    { office: "SDPO Mul", phone: "07172-255100" },
    { office: "SDPO Warora", phone: "07172-255100" },
    { office: "SDPO Gadchandur", phone: "07172-255100" }
  ],
  keyPoliceStations: [
    { office: "Ramnagar Police Station", phone: "07172-252139" },
    { office: "Chandrapur City Police Station", phone: "07172-255100" },
    { office: "Ghugus Police Station", phone: "07172-255100" },
    { office: "Ballarpur Police Station", phone: "07172-255100" },
    { office: "Bhadrawati Police Station", phone: "07172-255100" },
    { office: "Warora Police Station", phone: "07172-255100" },
    { office: "Bramhapuri Police Station", phone: "07172-255100" },
    { office: "Rajura Police Station", phone: "07172-255100" },
    { office: "Korpana Police Station", phone: "07172-255100" },
    { office: "Sawali Police Station", phone: "07172-255100" },
    { office: "Nagbhid Police Station", phone: "07172-255100" },
    { office: "Chimur Police Station", phone: "07172-255100" },
    { office: "Gondpipri Police Station", phone: "07172-255100" },
    { office: "Pombhurna Police Station", phone: "07172-255100" },
    { office: "Jiwati Police Station", phone: "07172-255100" },
    { office: "Mul Police Station", phone: "07172-255100" },
    { office: "Sindewahi Police Station", phone: "07172-255100" }
  ],
  phoneticAliases: {
    "coating": "Korpana",
    "shadow": "Sawali",
    "boghugus": "Ghugus",
    "nagbudd": "Nagbhid",
    "bhadgavati": "Bhadravati"
  }
};

/**
 * Normalizes common voice transcription speech-to-text mishearings into proper police station/location names.
 */
export function normalizePoliceStationName(input: string): string {
  const norm = input.toLowerCase().trim();
  for (const [misheard, correct] of Object.entries(POLICE_DIRECTORY.phoneticAliases)) {
    if (norm.includes(misheard)) {
      return correct;
    }
  }
  return input;
}