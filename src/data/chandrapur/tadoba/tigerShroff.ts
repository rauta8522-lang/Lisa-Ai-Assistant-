/**
 * Tiger Shroff - Wildlife & Sports Advocacy (Disambiguation & Source Entity)
 */

export interface TigerShroffAdvocacy {
  entityName: string;
  directTadobaTigerConnection: boolean;
  disambiguationStatement: string;
  petaForestAdvocacy2016: {
    date: string;
    occasion: string;
    recipient: string;
    message: string;
  };
  tigressLeeAdoption2014: {
    year: number;
    tigressName: string;
    zooLocation: string;
    actions: string[];
  };
  footballInitiative2025: {
    date: string;
    programName: string;
    role: string;
    duration: string;
    targetGroup: string;
    goal: string;
    signatoryContext: string;
  };
}

export const TIGER_SHROFF_ADVOCACY: TigerShroffAdvocacy = {
  entityName: "Tiger Shroff (Bollywood Actor & Youth Icon)",
  directTadobaTigerConnection: false,
  disambiguationStatement: "Tiger Shroff has NO direct tiger-residency or biological connection to Tadoba wild tigers. He is not a tiger in Tadoba nor related to Maya or any wild tiger. His connection in the provided source relates to Maharashtra wildlife conservation advocacy and sports development initiatives.",
  petaForestAdvocacy2016: {
    date: "July 29, 2016",
    occasion: "International Tiger Day",
    recipient: "Union Minister of State for Environment, Anil Madhav Dave",
    message: "Wrote an official letter on behalf of PETA India urging protection of remaining natural forest habitats, strengthening conservation resources, and implementing stricter safeguards for endangered tigers."
  },
  tigressLeeAdoption2014: {
    year: 2014,
    tigressName: "Lee (4-year-old tigress)",
    zooLocation: "Maharajbagh Zoo, Nagpur",
    actions: [
      "Travelled to Nagpur for legal adoption formalities",
      "Visited Lee regularly",
      "Funded fresh meat, care, and monsoon shelter upgrades"
    ]
  },
  footballInitiative2025: {
    date: "November 2025",
    programName: "Maha-Deva Football Talent Development Initiative",
    role: "Brand Ambassador",
    duration: "5 years",
    targetGroup: "Underprivileged tribal and rural youth of Maharashtra",
    goal: "Identify, support, and train youth for higher-level/international sports opportunities.",
    signatoryContext: "MoU signed at Varsha government residence alongside Maharashtra Chief Minister Devendra Fadnavis."
  }
};
