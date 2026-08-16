import React, { useState } from "react";
import { X, Search, Phone, Building, ShieldAlert, Heart, Users, FileText, Landmark, Sparkles, MapPin, ChevronRight, CheckCircle2 } from "lucide-react";
import {
  CHANDRAPUR_SCHEMES,
  DISTRICT_LEADERSHIP,
  DEPARTMENTAL_OFFICERS,
  ZILLA_PARISHAD_LEADERSHIP,
  MUNICIPAL_CORPORATION,
  DISTRICT_MINING_OFFICE,
  DMFT_TRUST,
  MAJOR_MINERALS,
  POLICE_DIRECTORY,
  PUBLIC_GRIEVANCES,
  ILLEGAL_MONEYLENDING_COMPLAINTS,
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
  TADOBA_COMPLETE_BIODIVERSITY
} from "../knowledge/chandrapurKnowledge";
import { CHANDRAPUR_COLLECTORS_AND_OFFICERS_DOSSIER } from "../data/chandrapur/collectors";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  onAskLisa?: (question: string) => void;
}

export default function ChandrapurCitizenServicesModal({ isOpen, onClose, isDarkMode, onAskLisa }: Props) {
  const [activeTab, setActiveTab] = useState<"overview" | "schemes" | "admin" | "mining" | "police" | "grievance" | "municipal" | "wildlife">("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedScheme, setSelectedScheme] = useState<string | null>("majhi-ladki-bahin");

  if (!isOpen) return null;

  const filteredSchemes = CHANDRAPUR_SCHEMES.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.objective.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentScheme = CHANDRAPUR_SCHEMES.find(s => s.id === selectedScheme) || CHANDRAPUR_SCHEMES[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <div className={`w-full max-w-5xl h-[88vh] rounded-2xl flex flex-col overflow-hidden shadow-2xl border ${
        isDarkMode ? "bg-slate-900 text-slate-100 border-slate-700" : "bg-white text-slate-800 border-slate-200"
      }`}>
        
        {/* Modal Header */}
        <div className={`p-4 sm:p-6 border-b flex items-center justify-between ${
          isDarkMode ? "bg-slate-800/80 border-slate-700" : "bg-slate-50 border-slate-200"
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-white shadow-md">
              <Landmark className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight">Chandrapur District Information & Citizen Services</h2>
              <p className="text-xs text-slate-400">Black Gold City Knowledge Base & District Administration Portal</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-xl transition-colors ${
              isDarkMode ? "hover:bg-slate-700 text-slate-300" : "hover:bg-slate-200 text-slate-600"
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className={`flex items-center gap-1 p-2 overflow-x-auto border-b text-sm font-medium ${
          isDarkMode ? "bg-slate-900 border-slate-800" : "bg-slate-100/60 border-slate-200"
        }`}>
          {[
            { id: "overview", label: "🏛 Overview & Helplines" },
            { id: "wildlife", label: "🐅 TATR Wildlife & Tourism" },
            { id: "schemes", label: "👩‍🌾 Welfare Schemes" },
            { id: "admin", label: "🏢 District Admin & ZP" },
            { id: "mining", label: "⛏ Mining (DMO & DMFT)" },
            { id: "municipal", label: "🏙 Municipal Services (CMC)" },
            { id: "police", label: "👮 Police Directory" },
            { id: "grievance", label: "📢 Grievance Redressal" },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-2 rounded-lg whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? "bg-amber-500 text-white font-semibold shadow-sm"
                  : isDarkMode
                  ? "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Main Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Quick Prompt Bar */}
              <div className={`p-4 rounded-xl border flex flex-col sm:flex-row items-center justify-between gap-4 ${
                isDarkMode ? "bg-amber-950/20 border-amber-800/40 text-amber-200" : "bg-amber-50 border-amber-200 text-amber-900"
              }`}>
                <div className="flex items-center gap-3">
                  <Sparkles className="w-6 h-6 text-amber-500 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-sm">Ask Lisa Voice Assistant Anything about Chandrapur!</h4>
                    <p className="text-xs opacity-80">Ask in Hindi, English, Hinglish or Marathi. e.g., "DMO ka number kya hai?", "Ladki Bahin me kitna paisa milta hai?"</p>
                  </div>
                </div>
                {onAskLisa && (
                  <button
                    onClick={() => {
                      onClose();
                      onAskLisa("Chandrapur me Ladki Bahin Yojana aur DMO details batao");
                    }}
                    className="px-4 py-2 text-xs font-semibold rounded-lg bg-amber-500 text-white hover:bg-amber-600 transition-colors shadow-sm whitespace-nowrap"
                  >
                    Ask Lisa Now
                  </button>
                )}
              </div>

              {/* District Highlights */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className={`p-4 rounded-xl border ${isDarkMode ? "bg-slate-800/50 border-slate-700" : "bg-slate-50 border-slate-200"}`}>
                  <h3 className="font-bold text-base mb-1 text-amber-500">Black Gold City</h3>
                  <p className="text-xs text-slate-400">Famous for Wardha Valley Coalfields, 3,340 MW CSTPS Power Plant, and extensive limestone reserves.</p>
                </div>
                <div className={`p-4 rounded-xl border ${isDarkMode ? "bg-slate-800/50 border-slate-700" : "bg-slate-50 border-slate-200"}`}>
                  <h3 className="font-bold text-base mb-1 text-amber-500">Geological Museum</h3>
                  <p className="text-xs text-slate-400">Rich rock formations, ancient fossils, Dongargaon Fluorite, and iron ore deposits in Gunjewah & Sindewahi.</p>
                </div>
                <div className={`p-4 rounded-xl border ${isDarkMode ? "bg-slate-800/50 border-slate-700" : "bg-slate-50 border-slate-200"}`}>
                  <h3 className="font-bold text-base mb-1 text-amber-500">Tadoba & Gond Heritage</h3>
                  <p className="text-xs text-slate-400">1,727 sq km TATR Tiger Reserve, ancient Gond Dynasty Fort Wall built by King Khandkia Ballal Sah & Rani Hirai.</p>
                </div>
              </div>

              {/* Key Helplines Grid */}
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-amber-500" /> Key Emergency & Office Helplines
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    { label: "District Collector Office", number: EMERGENCY_CONTACTS.disasterSecondaryPhone, sub: "Mrs. Vasumana Pant (IAS)" },
                    { label: "District Mining Officer (DMO)", number: EMERGENCY_CONTACTS.dmoOfficePhone, sub: "Mr. S.S. Naitam" },
                    { label: "SP Office Police Dispatch", number: EMERGENCY_CONTACTS.districtPoliceSP, sub: "Emergency 112" },
                    { label: "District Disaster Control Room", number: EMERGENCY_CONTACTS.districtDisasterControlRoom, sub: "24x7 Helpline 1077" },
                    { label: "TATR Wildlife Emergency", number: EMERGENCY_CONTACTS.tatrWildlifeEmergency, sub: "Forest Helpline 1926" },
                    { label: "MJPJAY Health Assurance", number: EMERGENCY_CONTACTS.mjpjayHealthTollFree, sub: "24x7 Toll-Free" },
                    { label: "Illegal Moneylender Grievance", number: EMERGENCY_CONTACTS.illegalMoneylenderGrievance, sub: "Cooperative Dept Toll-Free" },
                    { label: "CMC Municipal Toll-Free", number: EMERGENCY_CONTACTS.cmcTollFree, sub: "WhatsApp: " + EMERGENCY_CONTACTS.cmcWhatsappChatbot },
                    { label: "State Grievance Portal", number: "1800-120-8040", sub: "grievances.maharashtra.gov.in" },
                  ].map((item, idx) => (
                    <div key={idx} className={`p-3 rounded-xl border flex items-start gap-3 ${
                      isDarkMode ? "bg-slate-800/40 border-slate-700/80" : "bg-white border-slate-200 shadow-sm"
                    }`}>
                      <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
                        <Phone className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs text-slate-400">{item.label}</div>
                        <div className="font-mono font-bold text-sm text-amber-500">{item.number}</div>
                        <div className="text-[10px] text-slate-500">{item.sub}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: WELFARE SCHEMES */}
          {activeTab === "schemes" && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search schemes (e.g. Ladki Bahin, Solar)..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className={`w-full pl-9 pr-3 py-1.5 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                      isDarkMode ? "bg-slate-800 border-slate-700 text-white" : "bg-white border-slate-300 text-slate-900"
                    }`}
                  />
                </div>
                <div className="text-xs text-slate-400">
                  Showing {filteredSchemes.length} verified schemes
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                {/* Scheme List */}
                <div className="lg:col-span-5 space-y-2 max-h-[55vh] overflow-y-auto pr-1">
                  {filteredSchemes.map(s => (
                    <button
                      key={s.id}
                      onClick={() => setSelectedScheme(s.id)}
                      className={`w-full text-left p-3 rounded-xl border transition-all ${
                        selectedScheme === s.id
                          ? "bg-amber-500 text-white border-amber-500 shadow-sm"
                          : isDarkMode
                          ? "bg-slate-800/50 border-slate-700 hover:bg-slate-800"
                          : "bg-white border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-md ${
                          selectedScheme === s.id ? "bg-white/20 text-white" : "bg-amber-500/10 text-amber-500"
                        }`}>{s.category}</span>
                        <ChevronRight className="w-4 h-4 opacity-60" />
                      </div>
                      <h4 className="font-bold text-sm leading-snug">{s.name}</h4>
                      <p className={`text-xs mt-1 line-clamp-1 ${selectedScheme === s.id ? "text-amber-100" : "text-slate-400"}`}>{s.financialBenefit}</p>
                    </button>
                  ))}
                </div>

                {/* Scheme Details Card */}
                <div className={`lg:col-span-7 p-5 rounded-2xl border overflow-y-auto max-h-[55vh] space-y-4 ${
                  isDarkMode ? "bg-slate-800/40 border-slate-700" : "bg-slate-50 border-slate-200"
                }`}>
                  <div>
                    <span className="text-xs font-semibold text-amber-500 uppercase tracking-wider">{currentScheme.category}</span>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">{currentScheme.name}</h3>
                    <p className="text-xs text-slate-400 mt-1">{currentScheme.objective}</p>
                  </div>

                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                    <span className="text-xs font-bold text-amber-500 uppercase">Financial Benefit</span>
                    <p className="text-sm font-semibold mt-0.5">{currentScheme.financialBenefit}</p>
                  </div>

                  <div className="space-y-2">
                    <h5 className="text-xs font-bold uppercase text-slate-400">Eligibility Criteria</h5>
                    <ul className="text-xs space-y-1">
                      {currentScheme.eligibility.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {currentScheme.exclusions.length > 0 && (
                    <div className="space-y-2">
                      <h5 className="text-xs font-bold uppercase text-slate-400">Exclusions</h5>
                      <ul className="text-xs space-y-1 text-slate-400">
                        {currentScheme.exclusions.map((item, idx) => (
                          <li key={idx}>• {item}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="space-y-2">
                    <h5 className="text-xs font-bold uppercase text-slate-400">Required Documents</h5>
                    <div className="flex flex-wrap gap-1.5">
                      {currentScheme.requiredDocuments.map((doc, idx) => (
                        <span key={idx} className={`text-[11px] px-2.5 py-1 rounded-lg border ${
                          isDarkMode ? "bg-slate-800 border-slate-700 text-slate-300" : "bg-white border-slate-200 text-slate-700"
                        }`}>
                          {doc}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-700/40 text-xs flex flex-col sm:flex-row justify-between gap-2 text-slate-400">
                    <div>
                      <span className="font-semibold text-slate-300">Portal: </span>
                      <span className="font-mono text-amber-500">{currentScheme.applicationProcess.onlinePortal || "Offline / Tehsil Desk"}</span>
                    </div>
                    {currentScheme.helpline.length > 0 && (
                      <div>
                        <span className="font-semibold text-slate-300">Helpline: </span>
                        <span>{currentScheme.helpline.join(", ")}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: DISTRICT ADMIN & ZILLA PARISHAD */}
          {activeTab === "admin" && (
            <div className="space-y-6">
              {/* Single Merged Knowledge Card: Chandrapur District Collectors & Collectorate Officers */}
              <div className={`p-5 rounded-2xl border ${isDarkMode ? "bg-slate-800/60 border-amber-500/30" : "bg-white border-amber-200 shadow-sm"}`}>
                <div className="border-b border-amber-500/20 pb-3 mb-4">
                  <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-md bg-amber-500 text-white">
                    Collectorate Directory
                  </span>
                  <h3 className="text-lg font-bold text-amber-500 mt-1">
                    {CHANDRAPUR_COLLECTORS_AND_OFFICERS_DOSSIER.title}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {CHANDRAPUR_COLLECTORS_AND_OFFICERS_DOSSIER.subtitle}
                  </p>
                </div>

                {/* Section 1: Current Collector */}
                <div className="mb-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-2">1. Current District Collector & Magistrate</h4>
                  <div className={`p-4 rounded-xl border ${isDarkMode ? "bg-slate-900/60 border-slate-700" : "bg-amber-50/50 border-amber-200"}`}>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-2">
                      <div>
                        <div className="text-base font-bold text-amber-500">
                          {CHANDRAPUR_COLLECTORS_AND_OFFICERS_DOSSIER.currentCollector.name}
                        </div>
                        <div className="text-xs text-slate-300">
                          {CHANDRAPUR_COLLECTORS_AND_OFFICERS_DOSSIER.currentCollector.hindiName} • {CHANDRAPUR_COLLECTORS_AND_OFFICERS_DOSSIER.currentCollector.designation}
                        </div>
                      </div>
                      <span className="px-2.5 py-1 text-[10px] font-bold uppercase rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        Active In Charge
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-mono text-slate-300 mt-2 pt-2 border-t border-slate-700/40">
                      <div><span className="text-slate-400 font-sans">Phone: </span><span className="text-amber-400 font-bold">{CHANDRAPUR_COLLECTORS_AND_OFFICERS_DOSSIER.currentCollector.phone}</span></div>
                      <div><span className="text-slate-400 font-sans">Fax: </span><span>{CHANDRAPUR_COLLECTORS_AND_OFFICERS_DOSSIER.currentCollector.fax}</span></div>
                      <div><span className="text-slate-400 font-sans">Email: </span><span className="truncate block">{CHANDRAPUR_COLLECTORS_AND_OFFICERS_DOSSIER.currentCollector.email}</span></div>
                    </div>
                  </div>
                </div>

                {/* Section 2: Previous Collectors */}
                <div className="mb-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-2">2. Previous District Collectors (Recorded in Source)</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    {CHANDRAPUR_COLLECTORS_AND_OFFICERS_DOSSIER.formerCollectors.map((fc, idx) => (
                      <div key={idx} className={`p-3 rounded-xl border ${isDarkMode ? "bg-slate-900/40 border-slate-700" : "bg-slate-50 border-slate-200"}`}>
                        <div className="font-bold text-amber-400">{fc.name}</div>
                        <div className="text-[11px] text-slate-400">{fc.hindiName}</div>
                        <div className="text-xs font-semibold text-emerald-400 mt-1">Tenure: {fc.tenure}</div>
                        <div className="text-[10px] text-slate-500 mt-1">{fc.notes}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Section 3: Key Officers */}
                <div className="mb-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-2">3. Key Collectorate Officers</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                    {CHANDRAPUR_COLLECTORS_AND_OFFICERS_DOSSIER.keyOfficers.map((off, idx) => (
                      <div key={idx} className={`p-3 rounded-xl border ${isDarkMode ? "bg-slate-900/40 border-slate-700" : "bg-slate-50 border-slate-200"}`}>
                        <div className="text-[10px] font-bold text-slate-400 uppercase">{off.designation}</div>
                        <div className="font-bold text-amber-500 mt-0.5">{off.name} ({off.hindiName})</div>
                        {off.phone && <div className="text-[11px] font-mono text-slate-300 mt-1">📞 {off.phone}</div>}
                        {off.email && <div className="text-[10px] font-mono text-slate-400 truncate">✉️ {off.email}</div>}
                        {off.responsibilities && (
                          <div className="text-[10px] text-slate-400 mt-1">{off.responsibilities.join(", ")}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Section 4: Contact Directory */}
                <div className="mb-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-2">4. Official Collectorate Contact Directory</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left border-collapse">
                      <thead>
                        <tr className={`border-b ${isDarkMode ? "bg-slate-900 border-slate-700 text-slate-400" : "bg-slate-100 border-slate-200 text-slate-600"}`}>
                          <th className="p-2 font-bold">Office / Role</th>
                          <th className="p-2 font-bold">Officer Name</th>
                          <th className="p-2 font-bold">Phone Number</th>
                          <th className="p-2 font-bold">Email Address</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-700/40">
                        {CHANDRAPUR_COLLECTORS_AND_OFFICERS_DOSSIER.contactDirectory.map((cd, idx) => (
                          <tr key={idx} className={isDarkMode ? "hover:bg-slate-900/40" : "hover:bg-slate-50"}>
                            <td className="p-2 font-semibold text-amber-400">{cd.role}</td>
                            <td className="p-2 font-bold">{cd.name}</td>
                            <td className="p-2 font-mono">{cd.phone}</td>
                            <td className="p-2 font-mono text-slate-400">{cd.email}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Section 5: Historical Limitation Note */}
                <div className={`p-3 rounded-xl border text-xs ${isDarkMode ? "bg-slate-900/80 border-slate-700 text-slate-400" : "bg-slate-100 border-slate-200 text-slate-600"}`}>
                  <div className="font-bold text-amber-400 mb-0.5">📌 Historical Data Coverage: {CHANDRAPUR_COLLECTORS_AND_OFFICERS_DOSSIER.historicalDataLimitation.historical_data_coverage}</div>
                  <p>{CHANDRAPUR_COLLECTORS_AND_OFFICERS_DOSSIER.historicalDataLimitation.coverage_note}</p>
                </div>
              </div>

              {/* Zilla Parishad Section */}
              <div className={`p-4 rounded-2xl border ${isDarkMode ? "bg-slate-800/30 border-slate-700" : "bg-slate-50 border-slate-200"}`}>
                <h3 className="text-sm font-bold text-amber-500 mb-2">Zilla Parishad (ZP) Governance & Chanda Jyoti Super-100</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs mb-3">
                  <div><span className="text-slate-400">President: </span><span className="font-bold">{ZILLA_PARISHAD_LEADERSHIP.president}</span></div>
                  <div><span className="text-slate-400">Vice President: </span><span className="font-bold">{ZILLA_PARISHAD_LEADERSHIP.vicePresident}</span></div>
                  <div><span className="text-slate-400">CEO: </span><span className="font-bold text-amber-500">{ZILLA_PARISHAD_LEADERSHIP.ceo}</span></div>
                </div>
                <div className="text-xs space-y-1">
                  <span className="font-semibold text-slate-300">15 Panchayat Samitis: </span>
                  <span className="text-slate-400">{ZILLA_PARISHAD_LEADERSHIP.panchayatSamitis.join(", ")}</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: MINING (DMO & DMFT) */}
          {activeTab === "mining" && (
            <div className="space-y-6">
              {/* DMO Section */}
              <div className={`p-5 rounded-2xl border ${isDarkMode ? "bg-slate-800/40 border-slate-700" : "bg-slate-50 border-slate-200"}`}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2.5 rounded-xl bg-amber-500 text-white font-bold">DMO</div>
                  <div>
                    <h3 className="text-base font-bold">{DISTRICT_MINING_OFFICE.designation}: {DISTRICT_MINING_OFFICE.name}</h3>
                    <p className="text-xs text-slate-400">{DISTRICT_MINING_OFFICE.office}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-4 text-xs font-mono text-amber-500 mb-3">
                  <span>Phone: {DISTRICT_MINING_OFFICE.phone}</span>
                  <span>Email: {DISTRICT_MINING_OFFICE.email}</span>
                </div>
                <h5 className="text-xs font-bold uppercase text-slate-400 mb-1">Key Responsibilities</h5>
                <ul className="text-xs space-y-1 text-slate-300">
                  {DISTRICT_MINING_OFFICE.responsibilities.map((r, i) => (
                    <li key={i}>• {r}</li>
                  ))}
                </ul>
              </div>

              {/* DMFT Section */}
              <div className={`p-5 rounded-2xl border ${isDarkMode ? "bg-slate-800/40 border-slate-700" : "bg-slate-50 border-slate-200"}`}>
                <h3 className="text-base font-bold text-amber-500 mb-1">{DMFT_TRUST.title}</h3>
                <p className="text-xs text-slate-400 mb-3">{DMFT_TRUST.framework}</p>
                <p className="text-xs leading-relaxed text-slate-300 mb-3">{DMFT_TRUST.purpose}</p>
                <div className="text-xs text-slate-400">
                  <span className="font-semibold text-slate-200">Leadership: </span>{DMFT_TRUST.leadership}
                </div>
              </div>

              {/* Major Minerals */}
              <div>
                <h3 className="text-sm font-bold uppercase text-amber-500 mb-3">Major Mineral Operations</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className={`p-4 rounded-xl border ${isDarkMode ? "bg-slate-800/30 border-slate-700" : "bg-white border-slate-200 shadow-sm"}`}>
                    <h4 className="font-bold text-amber-500 text-sm mb-1">Wardha Valley Coalfield (WCL)</h4>
                    <p className="text-slate-400">WCL Mines: {MAJOR_MINERALS.coal.wclMines.join(", ")}</p>
                  </div>
                  <div className={`p-4 rounded-xl border ${isDarkMode ? "bg-slate-800/30 border-slate-700" : "bg-white border-slate-200 shadow-sm"}`}>
                    <h4 className="font-bold text-amber-500 text-sm mb-1">Limestone (Korpana & Rajura)</h4>
                    <p className="text-slate-400">Ambuja Cements Maratha Limestone Mines (ML-I, ML-II, ML-III), UltraTech Manikgarh & Awalpur, Dalmia, RCCPL Persoda.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: MUNICIPAL SERVICES */}
          {activeTab === "municipal" && (
            <div className="space-y-6">
              <div className={`p-5 rounded-2xl border ${isDarkMode ? "bg-slate-800/40 border-slate-700" : "bg-slate-50 border-slate-200"}`}>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
                  <div>
                    <h3 className="text-lg font-bold">{MUNICIPAL_CORPORATION.name}</h3>
                    <p className="text-xs text-slate-400">{MUNICIPAL_CORPORATION.officeLocation}</p>
                  </div>
                  <div className="text-right font-mono text-xs">
                    <div className="text-amber-500 font-bold">Tel: {MUNICIPAL_CORPORATION.mainTelephone}</div>
                    <div className="text-emerald-500">Toll-Free: {MUNICIPAL_CORPORATION.tollFree}</div>
                    <div className="text-blue-400">WhatsApp: {MUNICIPAL_CORPORATION.whatsappChatbot}</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs mb-4">
                  <div><span className="text-slate-400">Mayor: </span><span className="font-bold">{MUNICIPAL_CORPORATION.mayor}</span></div>
                  <div><span className="text-slate-400">Deputy Mayor: </span><span className="font-bold">{MUNICIPAL_CORPORATION.deputyMayor}</span></div>
                  <div><span className="text-slate-400">Commissioner: </span><span className="font-bold text-amber-500">{MUNICIPAL_CORPORATION.commissioner}</span></div>
                </div>

                <h5 className="text-xs font-bold uppercase text-slate-400 mb-2">Available Civic Services & Permissions</h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {MUNICIPAL_CORPORATION.services.map((srv, idx) => (
                    <div key={idx} className={`p-2.5 rounded-lg border ${isDarkMode ? "bg-slate-800/60 border-slate-700" : "bg-white border-slate-200 shadow-sm"}`}>
                      ✓ {srv}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: POLICE DIRECTORY */}
          {activeTab === "police" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className={`p-4 rounded-xl border ${isDarkMode ? "bg-slate-800/50 border-slate-700" : "bg-white border-slate-200 shadow-sm"}`}>
                  <h4 className="font-bold text-amber-500">{POLICE_DIRECTORY.spOffice.office}</h4>
                  <div className="text-sm font-mono font-bold mt-1 text-emerald-500">{POLICE_DIRECTORY.spOffice.phone}</div>
                </div>
                <div className={`p-4 rounded-xl border ${isDarkMode ? "bg-slate-800/50 border-slate-700" : "bg-white border-slate-200 shadow-sm"}`}>
                  <h4 className="font-bold text-amber-500">{POLICE_DIRECTORY.additionalSP.office}</h4>
                  <div className="text-sm font-mono font-bold mt-1 text-emerald-500">{POLICE_DIRECTORY.additionalSP.phone}</div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold uppercase text-amber-500 mb-2">Key Police Stations</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 text-xs">
                  {POLICE_DIRECTORY.keyPoliceStations.map((ps, idx) => (
                    <div key={idx} className={`p-2.5 rounded-lg border ${isDarkMode ? "bg-slate-800/40 border-slate-700" : "bg-slate-50 border-slate-200"}`}>
                      <div className="font-semibold text-slate-200">{ps.office}</div>
                      <div className="font-mono text-amber-500 text-[11px] mt-0.5">{ps.phone}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: GRIEVANCE REDRESSAL */}
          {activeTab === "grievance" && (
            <div className="space-y-6">
              <div className={`p-5 rounded-2xl border ${isDarkMode ? "bg-slate-800/40 border-slate-700" : "bg-slate-50 border-slate-200"}`}>
                <h3 className="text-base font-bold text-amber-500 mb-1">{PUBLIC_GRIEVANCES.maharashtraCentralPortal.name}</h3>
                <p className="text-xs text-slate-400 mb-2">Portal: <span className="font-mono text-amber-500">{PUBLIC_GRIEVANCES.maharashtraCentralPortal.url}</span> | Toll-Free: <span className="font-mono font-bold text-emerald-500">{PUBLIC_GRIEVANCES.maharashtraCentralPortal.tollFree}</span></p>
                <div className="text-xs text-slate-300 font-semibold">Resolution Timeline: {PUBLIC_GRIEVANCES.maharashtraCentralPortal.resolutionTimeline}</div>
              </div>

              <div className={`p-5 rounded-2xl border ${isDarkMode ? "bg-slate-800/40 border-slate-700" : "bg-slate-50 border-slate-200"}`}>
                <h3 className="text-base font-bold text-amber-500 mb-1">{ILLEGAL_MONEYLENDING_COMPLAINTS.description}</h3>
                <p className="text-xs text-slate-300 mb-3">{ILLEGAL_MONEYLENDING_COMPLAINTS.guidance}</p>
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs font-mono font-bold text-amber-500">
                  Cooperative Department Toll-Free: {ILLEGAL_MONEYLENDING_COMPLAINTS.cooperativeTollFree}
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: TATR WILDLIFE & TOURISM */}
          {activeTab === "wildlife" && (
            <div className="space-y-6">
              
              {/* Overview & Legend */}
              <div className={`p-5 rounded-2xl border ${isDarkMode ? "bg-slate-800/40 border-slate-700" : "bg-slate-50 border-slate-200"}`}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-bold text-amber-500">🐅 Tadoba-Andhari Tiger Reserve (TATR)</h3>
                  <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20">The Pride of Vidarbha</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed mb-4">{TADOBA_OVERVIEW.commonDescription}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div className={`p-3 rounded-xl border ${isDarkMode ? "bg-slate-800/60 border-slate-700" : "bg-white border-slate-200"}`}>
                    <div className="font-bold text-amber-500 mb-1">🌿 Legend of Taru (Etymology)</div>
                    <p className="text-slate-400 text-[11px] leading-normal">{TADOBA_OVERVIEW.etymologyLegend.story}</p>
                  </div>
                  <div className={`p-3 rounded-xl border ${isDarkMode ? "bg-slate-800/60 border-slate-700" : "bg-white border-slate-200"}`}>
                    <div className="font-bold text-amber-500 mb-1">🌊 Andhari River</div>
                    <p className="text-slate-400 text-[11px] leading-normal">{TADOBA_OVERVIEW.andhariRiver.description}</p>
                  </div>
                  <div className={`p-3 rounded-xl border ${isDarkMode ? "bg-slate-800/60 border-slate-700" : "bg-white border-slate-200"}`}>
                    <div className="font-bold text-amber-500 mb-1">📐 Protected Area Stats</div>
                    <div className="text-[11px] text-slate-300 space-y-0.5">
                      <div>Total: <span className="font-mono font-bold text-emerald-400">{TADOBA_OVERVIEW.areaData.totalAreaSqKm} sq km</span></div>
                      <div>Core: <span className="font-mono text-amber-400">{TADOBA_OVERVIEW.areaData.coreAreaSqKm} sq km</span></div>
                      <div>Buffer: <span className="font-mono text-blue-400">{TADOBA_OVERVIEW.areaData.bufferAreaSqKm} sq km</span> ({TADOBA_OVERVIEW.areaData.bufferVillagesCount} villages)</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Complete Biodiversity & Wildlife Overview */}
              <div className={`p-5 rounded-2xl border ${isDarkMode ? "bg-slate-800/50 border-amber-500/30" : "bg-amber-50/60 border-amber-200"}`}>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-md bg-amber-500 text-white">
                      Complete Wildlife Dossier
                    </span>
                    <h3 className="text-base font-bold text-amber-500 mt-1">
                      {TADOBA_COMPLETE_BIODIVERSITY.title}
                    </h3>
                    <p className="text-xs text-slate-400">{TADOBA_COMPLETE_BIODIVERSITY.hindiTitle}</p>
                  </div>
                  <div className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-500/20">
                    Category: {TADOBA_COMPLETE_BIODIVERSITY.categoryPath}
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4 text-xs">
                  <div className={`p-2.5 rounded-xl border ${isDarkMode ? "bg-slate-900/60 border-slate-700" : "bg-white border-slate-200"}`}>
                    <div className="text-[10px] text-slate-400">Predators & Big Cats</div>
                    <div className="font-bold text-amber-400 text-sm mt-0.5">5 Key Species</div>
                    <div className="text-[10px] text-slate-500 truncate">Tiger, Leopard, Black Panther, Jungle/Rusty Cat</div>
                  </div>
                  <div className={`p-2.5 rounded-xl border ${isDarkMode ? "bg-slate-900/60 border-slate-700" : "bg-white border-slate-200"}`}>
                    <div className="text-[10px] text-slate-400">Wild Canids & Pack Hunters</div>
                    <div className="font-bold text-amber-400 text-sm mt-0.5">5 Species</div>
                    <div className="text-[10px] text-slate-500 truncate">Dhole (20-35 pop), Hyena, Jackal, Wolf, Fox</div>
                  </div>
                  <div className={`p-2.5 rounded-xl border ${isDarkMode ? "bg-slate-900/60 border-slate-700" : "bg-white border-slate-200"}`}>
                    <div className="text-[10px] text-slate-400">Herbivore Guild</div>
                    <div className="font-bold text-emerald-400 text-sm mt-0.5">&gt;53% Recorded Wildlife</div>
                    <div className="text-[10px] text-slate-500 truncate">Gaur, Nilgai, Sambar, Chital, Langur, Boar</div>
                  </div>
                  <div className={`p-2.5 rounded-xl border ${isDarkMode ? "bg-slate-900/60 border-slate-700" : "bg-white border-slate-200"}`}>
                    <div className="text-[10px] text-slate-400">Avian & Butterflies</div>
                    <div className="font-bold text-blue-400 text-sm mt-0.5">195-280+ Birds | 66-134 Butterflies</div>
                    <div className="text-[10px] text-slate-500 truncate">Nymphalidae, Schedule II Eggfly, Spiders (26)</div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1">
                  {TADOBA_COMPLETE_BIODIVERSITY.tags.map((tag, idx) => (
                    <span key={idx} className={`text-[10px] px-2 py-0.5 rounded-md border ${
                      isDarkMode ? "bg-slate-800 border-slate-700 text-slate-300" : "bg-white border-slate-200 text-slate-600"
                    }`}>
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Safari Zones & Gates */}
              <div className={`p-5 rounded-2xl border ${isDarkMode ? "bg-slate-800/40 border-slate-700" : "bg-slate-50 border-slate-200"}`}>
                <h3 className="text-sm font-bold uppercase tracking-wider text-amber-500 mb-3">
                  🚙 Safari Zones & Gates ({TADOBA_SAFARI_ZONES.totalCoreGates} Core Gates, {TADOBA_SAFARI_ZONES.totalBufferGates} Buffer Gates)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {TADOBA_SAFARI_ZONES.zones.map(z => (
                    <div key={z.id} className={`p-3.5 rounded-xl border ${isDarkMode ? "bg-slate-800/60 border-slate-700" : "bg-white border-slate-200 shadow-sm"}`}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-amber-500">{z.name}</span>
                        <span className="text-[10px] font-mono text-slate-400">{z.location}</span>
                      </div>
                      <p className="text-[11px] text-slate-300 mb-2">{z.character}</p>
                      <div className="space-y-1 text-[11px]">
                        <div><span className="text-amber-400 font-semibold">Core: </span>{z.coreGates.join(", ")}</div>
                        <div><span className="text-blue-400 font-semibold">Buffer: </span>{z.bufferGates.join(", ")}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Flora & Fauna Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className={`p-4 rounded-xl border ${isDarkMode ? "bg-slate-800/40 border-slate-700" : "bg-white border-slate-200 shadow-sm"}`}>
                  <h4 className="font-bold text-amber-500 text-sm mb-2">🐯 Tiger & Wildlife Population (2024 Status)</h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between border-b border-slate-700/40 pb-1">
                      <span className="text-slate-400">Landscape Tigers:</span>
                      <span className="font-bold text-amber-400">{TADOBA_FAUNA.tigers.widerLandscapePopulation}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-700/40 pb-1">
                      <span className="text-slate-400">Core Tigers:</span>
                      <span className="font-bold text-amber-400">{TADOBA_FAUNA.tigers.corePopulation}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-700/40 pb-1">
                      <span className="text-slate-400">Tiger Density:</span>
                      <span className="font-mono font-bold text-emerald-400">{TADOBA_FAUNA.tigers.tigerDensity}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-700/40 pb-1">
                      <span className="text-slate-400">Leopards (2024):</span>
                      <span className="font-bold text-amber-400">{TADOBA_FAUNA.leopards.count2024} (Up from {TADOBA_FAUNA.leopards.count2019})</span>
                    </div>
                    <div className="text-[11px] text-slate-400 pt-1">
                      <span className="font-semibold text-slate-300">Birds: </span>{TADOBA_FAUNA.birds.totalSpeciesCount} (including rare <span className="text-amber-400 font-semibold">{TADOBA_FAUNA.birds.rareBird.name}</span> sightings in dry grasslands).
                    </div>
                  </div>
                </div>

                <div className={`p-4 rounded-xl border ${isDarkMode ? "bg-slate-800/40 border-slate-700" : "bg-white border-slate-200 shadow-sm"}`}>
                  <h4 className="font-bold text-amber-500 text-sm mb-2">👑 Famous Tigers of Tadoba</h4>
                  <div className="space-y-2 text-xs">
                    {FAMOUS_TIGERS_2026.map(t => (
                      <div key={t.id} className="border-b border-slate-700/40 pb-1.5 last:border-0">
                        <div className="font-bold text-slate-200 flex items-center justify-between">
                          <span>{t.name} {t.nickname ? `("${t.nickname}")` : ""}</span>
                        </div>
                        <div className="text-[11px] text-slate-400">{t.description}</div>
                        <div className="text-[10px] text-amber-400/80 font-mono">Range: {t.sourceAssociatedTerritory.join(", ")}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Monitoring & Tourism Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className={`p-4 rounded-xl border ${isDarkMode ? "bg-slate-800/40 border-slate-700" : "bg-white border-slate-200 shadow-sm"}`}>
                  <h4 className="font-bold text-amber-500 text-sm mb-2">📡 Machan Census 2026 & AI Warning System</h4>
                  <div className="space-y-2 text-xs">
                    <div className="p-2 rounded bg-amber-500/10 border border-amber-500/20 text-[11px]">
                      <div className="font-bold text-amber-400">Machan Census (May 1, 2026 - Buddha Purnima)</div>
                      <div className="text-slate-300">{MACHAN_CENSUS_2026.totalAnimalsTracked} total animals tracked. 42 tiger sightings recorded ({MACHAN_CENSUS_2026.tigerSightings.core} Core, {MACHAN_CENSUS_2026.tigerSightings.buffer} Buffer).</div>
                    </div>
                    <div className="p-2 rounded bg-emerald-500/10 border border-emerald-500/20 text-[11px]">
                      <div className="font-bold text-emerald-400">AI Tiger Warning System ({AI_TIGER_WARNING_SYSTEM.deploymentDate})</div>
                      <div className="text-slate-300">Deployed across 20 high-risk buffer villages using AI camera traps and localized loudspeaker alerts for early warning.</div>
                    </div>
                  </div>
                </div>

                <div className={`p-4 rounded-xl border ${isDarkMode ? "bg-slate-800/40 border-slate-700" : "bg-white border-slate-200 shadow-sm"}`}>
                  <h4 className="font-bold text-amber-500 text-sm mb-2">🚂 VANDARSHAN Tourism Package (2026)</h4>
                  <div className="text-xs space-y-1.5">
                    <div className="text-slate-300"><span className="font-semibold text-amber-400">Launch: </span>{VANDARSHAN_TOURISM_2026.launchDate} ({VANDARSHAN_TOURISM_2026.occasion})</div>
                    <div className="text-slate-300"><span className="font-semibold text-amber-400">Partners: </span>{VANDARSHAN_TOURISM_2026.partnerOrganizations.join(" & ")}</div>
                    <div className="text-slate-300"><span className="font-semibold text-amber-400">Train: </span>{VANDARSHAN_TOURISM_2026.dedicatedTrain}</div>
                    <p className="text-[11px] text-slate-400 mt-1">{VANDARSHAN_TOURISM_2026.concept}</p>
                  </div>
                </div>
              </div>

              {/* Tiger Shroff Disambiguation Card */}
              <div className={`p-4 rounded-xl border ${isDarkMode ? "bg-slate-800/30 border-slate-700" : "bg-amber-50/50 border-amber-200"}`}>
                <h4 className="font-bold text-amber-500 text-sm mb-1">🎬 Tiger Shroff Wildlife & Sports Advocacy (Disambiguation)</h4>
                <p className="text-xs text-slate-300 mb-2">{TIGER_SHROFF_ADVOCACY.disambiguationStatement}</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
                  <div className="p-2 rounded bg-slate-800/40 border border-slate-700">
                    <div className="font-bold text-amber-400">PETA Letter (2016)</div>
                    <div className="text-slate-400">Letter to Union Minister urging protection of natural tiger forests.</div>
                  </div>
                  <div className="p-2 rounded bg-slate-800/40 border border-slate-700">
                    <div className="font-bold text-amber-400">Tigress Lee Adoption (2014)</div>
                    <div className="text-slate-400">Adopted 4-yr-old tigress Lee at Maharajbagh Zoo, Nagpur.</div>
                  </div>
                  <div className="p-2 rounded bg-slate-800/40 border border-slate-700">
                    <div className="font-bold text-amber-400">Maha-Deva Football (2025)</div>
                    <div className="text-slate-400">Brand ambassador for 5-yr tribal youth sports program with CM Fadnavis.</div>
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className={`p-4 border-t flex items-center justify-between text-xs text-slate-400 ${
          isDarkMode ? "bg-slate-800/80 border-slate-700" : "bg-slate-50 border-slate-200"
        }`}>
          <div>Integrated Lisa AI Knowledge Base • Source Status: Verified</div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-amber-500 text-white font-semibold hover:bg-amber-600 transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
