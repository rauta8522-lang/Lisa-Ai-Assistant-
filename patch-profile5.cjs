const fs = require('fs');
let code = fs.readFileSync('src/components/ProfileModal.tsx', 'utf8');

code = code.replace(
  'import { \n  User, Mail, Lock, Brain, Shield, Palette, \n  Eye, EyeOff, LogOut, Trash2, Check, X, Sparkles, AlertTriangle,\n  Database, Key, HardDrive, ShieldCheck, Download, RefreshCw, FileText, LockKeyhole,\n  Camera, Upload, Image as ImageIcon, MessageCircle, Plus, Smartphone, Presentation, Fingerprint, MessageSquare\n} from "lucide-react";',
  'import { \n  User, Mail, Lock, Brain, Shield, Palette, \n  Eye, EyeOff, LogOut, Trash2, Check, X, Sparkles, AlertTriangle,\n  Database, Key, HardDrive, ShieldCheck, Download, RefreshCw, FileText, LockKeyhole,\n  Camera, Upload, Image as ImageIcon, MessageCircle, Plus, Smartphone, Presentation, Fingerprint, MessageSquare, Crown\n} from "lucide-react";'
);

fs.writeFileSync('src/components/ProfileModal.tsx', code);
console.log("Imported Crown");
