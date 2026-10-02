const fs = require('fs');
let code = fs.readFileSync('src/components/ProfileModal.tsx', 'utf8');

if (!code.includes('import { auth } from "../config/firebase";')) {
  code = code.replace(
    'import { db } from "../config/firebase";',
    'import { db, auth } from "../config/firebase";'
  );
}

// 1. Update TabType
if (!code.includes('"plan"')) {
  code = code.replace(
    'type TabType = "personal"',
    'type TabType = "personal" | "plan"'
  );
}

fs.writeFileSync('src/components/ProfileModal.tsx', code);
console.log("Profile patched auth and tabtype");
