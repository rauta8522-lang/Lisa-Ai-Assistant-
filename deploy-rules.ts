import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getSecurityRules } from "firebase-admin/security-rules";
import fs from "fs";
import dotenv from "dotenv";
dotenv.config();

async function deploy() {
  const serviceAccountEnv = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!serviceAccountEnv) {
    console.error("Missing FIREBASE_SERVICE_ACCOUNT_KEY");
    return;
  }
  let serviceAccount: any;
  try {
    serviceAccount = JSON.parse(serviceAccountEnv);
  } catch {
    serviceAccount = JSON.parse(Buffer.from(serviceAccountEnv, "base64").toString("utf8"));
  }

  const app = getApps().length === 0
    ? initializeApp({
        credential: cert(serviceAccount),
        projectId: process.env.VITE_FIREBASE_PROJECT_ID
      })
    : getApps()[0];

  const source = fs.readFileSync("firestore.rules", "utf8");
  try {
    const rules = getSecurityRules(app);
    const file = rules.createRulesFileFromSource("firestore.rules", source);
    const ruleset = await rules.createRuleset(file);
    console.log("Created ruleset:", ruleset.name);
    await rules.releaseFirestoreRuleset(ruleset.name);
    console.log("Successfully deployed firestore.rules!");
  } catch (e) {
    console.error("Failed to deploy rules:", e);
  }
}

deploy();
