const fs = require('fs');
let code = fs.readFileSync('src/components/ProfileModal.tsx', 'utf8');

// 1. Update TabType
code = code.replace(
  'type TabType = "personal" | "memory" | "whatsapp" | "privacy" | "appearance" | "presentation" | "fingerprints" | "feedback" | "logout";',
  'type TabType = "personal" | "plan" | "memory" | "whatsapp" | "privacy" | "appearance" | "presentation" | "fingerprints" | "feedback" | "logout";'
);

// 2. Add icon import
code = code.replace(
  'import { X, Camera, Save, RefreshCw, Smartphone, Monitor, Brain, Fingerprint, Lock, Shield, EyeOff, FileText, Download, User, Database, Palette, Key, LogOut, MessageCircle, Presentation, PenTool, KeySquare, HardDrive, Trash2, ShieldCheck, Mail, Send, ChevronRight, MessageSquare, AlertCircle, Trash, Check, Crown } from "lucide-react";',
  'import { X, Camera, Save, RefreshCw, Smartphone, Monitor, Brain, Fingerprint, Lock, Shield, EyeOff, FileText, Download, User, Database, Palette, Key, LogOut, MessageCircle, Presentation, PenTool, KeySquare, HardDrive, Trash2, ShieldCheck, Mail, Send, ChevronRight, MessageSquare, AlertCircle, Trash, Check, Crown } from "lucide-react";\nimport { auth } from "../config/firebase";'
);

// wait, is auth imported? Let's check.
