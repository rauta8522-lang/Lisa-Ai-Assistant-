const admin = require('firebase-admin');
const { getFirestore } = require('firebase-admin/firestore');
require('dotenv').config();
admin.initializeApp({ projectId: process.env.VITE_FIREBASE_PROJECT_ID || 'dummy-project-id' });
async function test() {
  try {
    const db = getFirestore();
    await db.collection("users").doc("test").get();
    console.log("Firestore works");
  } catch(e) {
    console.error("Firestore err", e.message);
  }
}
test();
