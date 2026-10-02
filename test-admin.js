const admin = require('firebase-admin');
admin.initializeApp({ projectId: process.env.VITE_FIREBASE_PROJECT_ID || 'dummy-project-id' });
async function test() {
  try {
    const t = await admin.auth().createCustomToken("test-uid");
    console.log("Auth works");
  } catch(e) {
    console.error("Auth err", e.message);
  }
}
test();
