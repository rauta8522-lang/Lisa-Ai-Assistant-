const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const statusEndpoint = `app.get("/api/subscription/status", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const token = authHeader.split("Bearer ")[1];
    const decodedToken = await getAuth().verifyIdToken(token);

    // Check firestore for plan
    const userDoc = await getFirestore().collection("users").doc(decodedToken.uid).get();
    const isPaid = userDoc.exists && userDoc.data()?.plan === "paid";

    res.json({ plan: isPaid ? "paid" : "free" });
  } catch (e) {
    res.json({ plan: "free" });
  }
});

`;

code = code.replace(
  '  app.get("/api/youtube/search", async (req, res) => {',
  statusEndpoint + '  app.get("/api/youtube/search", async (req, res) => {'
);

fs.writeFileSync('server.ts', code);
console.log("Subscription status endpoint added");
