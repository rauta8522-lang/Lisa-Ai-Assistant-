const admin = require('firebase-admin');
const fs = require('fs');
require('dotenv').config();

async function deploy() {
  const serviceAccountEnv = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!serviceAccountEnv) {
    console.error("Missing FIREBASE_SERVICE_ACCOUNT_KEY");
    process.exit(1);
  }
  const serviceAccount = JSON.parse(serviceAccountEnv);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: process.env.VITE_FIREBASE_PROJECT_ID
  });

  const source = fs.readFileSync('firestore.rules', 'utf8');
  try {
    const rules = admin.securityRules();
    const ruleset = await rules.createRuleset({
      source: {
        files: [{
          name: 'firestore.rules',
          content: source
        }]
      }
    });
    console.log("Created ruleset:", ruleset.name);
    await rules.releaseFirestoreRuleset(ruleset.name);
    console.log("Successfully deployed firestore.rules!");
  } catch (e) {
    console.error("Failed to deploy rules:", e);
  }
}
deploy();
