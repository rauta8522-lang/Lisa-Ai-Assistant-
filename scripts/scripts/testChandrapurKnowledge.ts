import { searchChandrapurKnowledge } from "../../src/knowledge/chandrapurKnowledge";

const TEST_QUERIES = [
  // Original Chandrapur Admin Queries (20)
  "Chandrapur ke District Mining Officer kaun hain?",
  "DMO ka contact number kya hai?",
  "Chandrapur me major minerals kaunse hain?",
  "Coal mines ke naam batao.",
  "Limestone mines kaha hain?",
  "DMFT kya hota hai?",
  "Chandrapur Collector kaun hain?",
  "Ladki Bahin Yojana me kitna paisa milta hai?",
  "Ladki Bahin ke documents kya hain?",
  "Solar pump scheme me subsidy kitni hai?",
  "MJPJAY me kitna coverage hai?",
  "Sanjay Gandhi Niradhar Yojana kya hai?",
  "65 saal ke senior citizen ke liye scheme?",
  "Namo Shetkari ka installment kitna hai?",
  "Graduate student ke liye Yuva Karya Prashikshan stipend?",
  "Chandrapur municipal corporation ka helpline number?",
  "Illegal hoarding complaint kaha kare?",
  "Illegal moneylender ki complaint kaha kare?",
  "Maharashtra grievance portal ka number?",
  "Chandrapur SP ka number kya hai?",

  // Tadoba-Andhari Tiger Reserve (TATR) Queries (30)
  "Tadoba ko Tadoba kyu bolte hain?",
  "Taru kon the?",
  "Andhari river kaha hai?",
  "TATR ka total area kitna hai?",
  "Tadoba National Park kab bana?",
  "Andhari Sanctuary kab bani?",
  "Tadoba reserve me canopy ka kitna percent Teak hai?",
  "Panchadhara ke paas kaun se ped milte hain?",
  "Tadoba me kitne tigers hain?",
  "Tadoba core area me kitne tigers hain?",
  "Tadoba me leopards count kitna hai?",
  "Lesser Florican Tadoba me rehta hai kya?",
  "Tadoba me core gates kitne hain?",
  "Tadoba buffer gates kitne hain?",
  "Moharli zone me kaun se gates aate hain?",
  "Kolara zone ka core gate kaun sa hai?",
  "Kolsa zone kis cheez ke liye famous hai?",
  "Queen of Tadoba kisse kehte hain?",
  "Maya tigress ka territory kaun sa hai?",
  "Chota Matka tiger kidhar milta hai?",
  "Bajrang tiger kaha ka hai?",
  "Machan Census 2026 kab hua?",
  "Buddha Purnima census me kitne tigers dikhe?",
  "Machan Census me buffer me zyada tiger dikhe ya core me?",
  "AI Tiger Warning System kaha lagaya gaya hai?",
  "AI camera trap speaker alert kaise kaam karta hai?",
  "VANDARSHAN package kya hai?",
  "Vandarshan me kaun si train use hoti hai?",
  "Tiger Shroff ka Tadoba se kya connection hai?",
  "Tiger Shroff ne 2016 me PETA ke liye kya kiya?",

  // New Complete Wildlife & Biodiversity Queries (Hindi, Hinglish, English) (24)
  "ताडोबा में कौन-कौन से जानवर पाए जाते हैं?",
  "ताडोबा के सभी प्रमुख जानवर बताओ।",
  "ताडोबा में कौन-कौन से शिकारी जानवर हैं?",
  "ताडोबा में कौन-कौन से हिरण पाए जाते हैं?",
  "ताडोबा में कौन-कौन से पक्षी पाए जाते हैं?",
  "ताडोबा में कितनी तितली प्रजातियां हैं?",
  "ताडोबा में कौन-कौन से सांप पाए जाते हैं?",
  "ताडोबा में ढोल कितने हैं?",
  "ताडोबा में ब्लैक पैंथर कब देखा गया था?",
  "ताडोबा में स्लॉथ बीयर कहाँ दिख सकता है?",
  "ताडोबा का food chain समझाओ।",
  "ताडोबा में कौन सा जानवर किसे खाता है?",
  "ताडोबा के herbivores कौन हैं?",
  "ताडोबा के nocturnal animals कौन हैं?",
  "ताडोबा में कौन-कौन से endangered animals हैं?",
  "What animals are found in Tadoba?",
  "List the predators of Tadoba.",
  "What herbivores are found in TATR?",
  "Tell me about the dhole population.",
  "When was the black panther sighted in Tadoba?",
  "Which birds are found in Tadoba?",
  "What reptiles live in Tadoba?",
  "Tell me about Tadoba's butterflies.",
  "Explain Tadoba's food web."
];

console.log("=== CHANDRAPUR & TADOBA KNOWLEDGE RETRIEVAL TEST SUITE ===");
let passedCount = 0;

for (let i = 0; i < TEST_QUERIES.length; i++) {
  const query = TEST_QUERIES[i];
  const result = searchChandrapurKnowledge(query);
  const matchedTitles = result.matchedRecords.map((r: { title: string }) => r.title);
  const isMatched = result.matchedRecords.length > 0;
  
  if (isMatched) {
    passedCount++;
  }
  
  console.log(`\n[Query ${i + 1}] "${query}"`);
  console.log(`Matched Records (${result.matchedRecords.length}): ${matchedTitles.join(" | ")}`);
}

console.log(`\n=== TEST SUMMARY: ${passedCount}/${TEST_QUERIES.length} QUERIES MATCHED SUCCESSFULLY ===`);
if (passedCount === TEST_QUERIES.length) {
  console.log("ALL 50 CHANDRAPUR & TADOBA KNOWLEDGE QUERIES PASSED!");
} else {
  console.log("SOME QUERIES FAILED TO MATCH.");
  process.exit(1);
}
