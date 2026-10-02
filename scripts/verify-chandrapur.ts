import { ChandrapurKnowledgeEngine, CHANDRAPUR_ADMINISTRATIVE_BLUEPRINT } from "../src/core/knowledge/ChandrapurKnowledge";
import { KnowledgeEngine } from "../src/core/knowledge/KnowledgeEngine";

console.log("=== VERIFYING CHANDRAPUR ADMINISTRATIVE KNOWLEDGE INTEGRATION ===");

// Test 1: Content check
console.log("Test 1: Blueprint content exists and contains key entities");
if (!CHANDRAPUR_ADMINISTRATIVE_BLUEPRINT.includes("Vasumana Pant")) {
  throw new Error("Missing Collector name in blueprint");
}
if (!CHANDRAPUR_ADMINISTRATIVE_BLUEPRINT.includes("Pulkit Singh")) {
  throw new Error("Missing CEO name in blueprint");
}
if (!CHANDRAPUR_ADMINISTRATIVE_BLUEPRINT.includes("Sandhya Gurnule")) {
  throw new Error("Missing ZP President in blueprint");
}
if (!CHANDRAPUR_ADMINISTRATIVE_BLUEPRINT.includes("Gorewada Animal Adoption Scheme")) {
  throw new Error("Missing Gorewada Scheme in blueprint");
}
if (!CHANDRAPUR_ADMINISTRATIVE_BLUEPRINT.includes("Aaple Sarkar Portal")) {
  throw new Error("Missing Aaple Sarkar Portal in blueprint");
}
console.log("✓ Test 1 Passed: All primary administrative entities verified.");

// Test 2: Matcher function
console.log("Test 2: Matcher triggers on relevant queries");
const sampleQueries = [
  "Who is the District Collector of Chandrapur?",
  "What is the contact number of SP office in Chandrapur?",
  "How much does it cost to adopt a tiger in Gorewada?",
  "What is the SOP for red alert heatwave in Chandrapur?",
  "Tell me about Vasumana Pant IAS"
];

for (const q of sampleQueries) {
  if (!ChandrapurKnowledgeEngine.matchesQuery(q)) {
    throw new Error(`Query failed to match: "${q}"`);
  }
}
console.log("✓ Test 2 Passed: Query matcher works correctly.");

// Test 3: Static domain knowledge integration
console.log("Test 3: KnowledgeEngine.getStaticDomainKnowledge() injects blueprint");
const staticCtx = KnowledgeEngine.getStaticDomainKnowledge("Chandrapur disaster helpline");
if (!staticCtx || !staticCtx.includes("1077")) {
  throw new Error("Disaster helpline 1077 not found in extracted context");
}
console.log("✓ Test 3 Passed: KnowledgeEngine static domain integration works.");

// Test 4: Temporal context
console.log("Test 4: KnowledgeEngine.getCurrentDateContext()");
const dateCtx = KnowledgeEngine.getCurrentDateContext();
if (!dateCtx.includes("2026")) {
  throw new Error("Date context does not include 2026");
}
console.log("✓ Test 4 Passed: Date context contains 2026.");

console.log("\nALL CHANDRAPUR KNOWLEDGE TESTS PASSED SUCCESSFULLY! 🎉");
