const fs = require('fs');
let code = fs.readFileSync('src/components/ProfileModal.tsx', 'utf8');

if (!code.includes(', Crown')) {
  code = code.replace(
    '} from "lucide-react";',
    ', Crown } from "lucide-react";'
  );
}

fs.writeFileSync('src/components/ProfileModal.tsx', code);
console.log("Crown imported");
