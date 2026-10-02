const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  'import * as admin from "firebase-admin";',
  'import { initializeApp, getApps, cert } from "firebase-admin/app";'
);
code = code.replace(
  'admin.apps.length',
  'getApps().length'
);
code = code.replace(
  'admin.credential.cert(serviceAccount)',
  'cert(serviceAccount)'
);
code = code.replace(
  /admin\.initializeApp/g,
  'initializeApp'
);

const oldDeepSeek = `const deepSeekMessages = [
          {
            role: "system",
            content: dynamicSystemInstruction,
          },
        ];`;
const newDeepSeek = `const deepSeekMessages: Array<{ role: "system" | "user" | "assistant"; content: string; }> = [
          {
            role: "system",
            content: dynamicSystemInstruction,
          },
        ];`;
code = code.replace(oldDeepSeek, newDeepSeek);

fs.writeFileSync('server.ts', code);
console.log("Lint fixed");
