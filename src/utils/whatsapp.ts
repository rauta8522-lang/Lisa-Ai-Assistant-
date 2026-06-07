/**
 * WhatsApp Contact Mapping & Cross-Device Deep Link Generator for Lisa.
 */

export interface WhatsAppContact {
  id: string;
  name: string; // Dynamic screen name like "Soni", "Papa"
  phone: string; // Phone number with country code (e.g. "+919876543210")
}

// Default directory seeds so Soni is immediately present
const DEFAULT_CONTACTS: WhatsAppContact[] = [
  { id: "seed-1", name: "Soni", phone: "+919876543210" },
  { id: "seed-2", name: "Papa", phone: "" },
  { id: "seed-3", name: "Mummy", phone: "" },
  { id: "seed-4", name: "", phone: "" },
];

/**
 * Fetch list of registered WhatsApp contacts from Local Storage
 */
export function getWhatsAppContacts(email: string): WhatsAppContact[] {
  if (!email) return DEFAULT_CONTACTS;
  const raw = localStorage.getItem(`lisa_wa_contacts_${email.toLowerCase().trim()}`);
  if (!raw) {
    // Seed initial ones on first retrieval
    saveWhatsAppContacts(email, DEFAULT_CONTACTS);
    return DEFAULT_CONTACTS;
  }
  try {
    return JSON.parse(raw);
  } catch (e) {
    console.error("Failed to parse WhatsApp contacts", e);
    return DEFAULT_CONTACTS;
  }
}

/**
 * Save WhatsApp contact list to Local Storage
 */
export function saveWhatsAppContacts(email: string, contacts: WhatsAppContact[]): void {
  if (!email) return;
  localStorage.setItem(`lisa_wa_contacts_${email.toLowerCase().trim()}`, JSON.stringify(contacts));
}

/**
 * Add or update a WhatsApp contact mapped to a nickname
 */
export function linkWhatsAppContact(email: string, name: string, phone: string): WhatsAppContact[] {
  const contacts = getWhatsAppContacts(email);
  const targetName = name.trim().toLowerCase();
  
  // Clean phone input - strip spaces, keep + symbol
  const cleanedPhone = phone.trim().replace(/[\s\-]/g, "");

  const index = contacts.findIndex(c => c.name.toLowerCase() === targetName);
  if (index >= 0) {
    contacts[index].phone = cleanedPhone;
  } else {
    contacts.push({
      id: "contact-" + Date.now().toString(),
      name: name.trim(),
      phone: cleanedPhone
    });
  }
  saveWhatsAppContacts(email, contacts);
  return contacts;
}

/**
 * Parse Roman Hindi & English message intents regarding WhatsApp.
 * Handles inputs like: 
 * - "soni ko message bhejo ki khana kha liya"
 * - "whatsapp par papa ko send kro ki call me"
 * - "send message to mummy saying pick me up"
 * - "whatsapp soni meet me now"
 */
export function parseWhatsAppCommand(transcript: string): { name: string; message: string } | null {
  const norm = transcript.toLowerCase().trim();

  // 1. Match Roman Hindi: "[name] ko message bhejo/bhej do/bhejna ki/bol ki [message]"
  // e.g., "soni ko message bhejo ki khana kha liya"
  // e.g., "soni ko whatsapp message bhejo ki..."
  const raHindi1 = norm.match(/(?:whatsapp\s+(?:par|pe|pe\s+bhi)\s+)?([a-z0-0\s]+?)\s+ko\s+(?:whatsapp\s+)?(?:message\s+|msg\s+)?(?:bhejo|bhej\s+do|bhejna|send\s+kro|send\s+karo)(?:\s+ki|\s+bol\s+ki|\s+bolna\s+ki)?\s+(.+)$/i);
  if (raHindi1 && raHindi1[1] && raHindi1[2]) {
    const name = cleanExtraneousConnectorWords(raHindi1[1]);
    const message = raHindi1[2].trim();
    if (name && message) {
      return { name, message };
    }
  }

  // 2. Match: "whatsapp par/pe [name] ko message bhejo: [message]"
  const raHindi2 = norm.match(/(?:whatsapp\s+(?:par|pe|pe\s+bhi))\s+([a-z0-9\s]+?)\s+ko\s+(.+)$/i);
  if (raHindi2 && raHindi2[1] && raHindi2[2]) {
    const name = cleanExtraneousConnectorWords(raHindi2[1]);
    // Strip verbs at the start of the message like "bhejo ki", "message krna"
    const message = raHindi2[2].trim().replace(/^(?:message|msg|bhejo|send|bolna)\s*(?:ki|ko)?\s*/gi, "");
    if (name && message) {
      return { name, message };
    }
  }

  // 3. Match English: "send a whatsapp message to [name] saying/telling [message]"
  const raEng1 = norm.match(/(?:send\s+a\s+)?(?:whatsapp|wa)\s+(?:message|msg)?\s+to\s+([a-z0-9\s]+?)\s+(?:saying|telling|ki)\s+(.+)$/i);
  if (raEng1 && raEng1[1] && raEng1[2]) {
    const name = cleanExtraneousConnectorWords(raEng1[1]);
    const message = raEng1[2].trim();
    if (name && message) {
      return { name, message };
    }
  }

  // 4. Match short English/Roman hybrid: "whatsapp [name]: [message]" or "whatsapp [name] [message]"
  // Requires starting with whatsapp / message
  const raEng2 = norm.match(/^(?:whatsapp|message|msg)\s+([a-z0-9]+)\s+(?:ko\s+)?(.+)$/i);
  if (raEng2 && raEng2[1] && raEng2[2]) {
    const name = raEng2[1].trim();
    // Prevent false matching on keywords
    if (!["par", "pe", "pe bhi", "to", "message", "a", "group"].includes(name)) {
      const message = raEng2[2].trim().replace(/^(?:saying|telling|bhejo|ki)\s+/i, "");
      return { name, message };
    }
  }

  return null;
}

function cleanExtraneousConnectorWords(name: string): string {
  return name.replace(/\b(par|pe|ko|to|a|msg|message|whatsapp|the)\b/g, "").replace(/\s+/g, " ").trim();
}

/**
 * Generates the optimal direct deep link URL for WhatsApp.
 * Supports cross-platform dispatch including iPhone, Android, Linux, Windows, macOS, and iPad.
 * Using 'https://api.whatsapp.com/send' is globally supported and launches the native app on mobiles,
 * while falling back gracefully to Desktop app or WhatsApp Web on desktop browsers.
 */
export function getWhatsAppUrl(phone: string, text: string): string {
  const encText = encodeURIComponent(text);
  if (!phone) {
    // If no phone is provided, return standard Universal Share link allowing contact-picker inside WhatsApp
    return `https://api.whatsapp.com/send?text=${encText}`;
  }
  
  // Strip non-numeric characters for absolute robust dialing, but preserve +
  const cleanedPhone = phone.trim().replace(/[^\d\+]/g, "").replace(/^\+/, "");
  return `https://api.whatsapp.com/send?phone=${cleanedPhone}&text=${encText}`;
}

/**
 * Simulates fetching contacts from a shared browser storage/service.
 */
export function syncWhatsAppContacts(email: string): WhatsAppContact[] {
  // Mock data representing a fetched sync list
  const MOCK_SYNCED_CONTACTS: WhatsAppContact[] = [
    { id: "sync-1", name: "Soni", phone: "+919876543210" },
    { id: "sync-2", name: "Papa", phone: "+919999999999" },
    { id: "sync-3", name: "Mummy", phone: "+918888888888" },
    { id: "sync-4", name: "Friend", phone: "+917777777777" },
  ];

  saveWhatsAppContacts(email, MOCK_SYNCED_CONTACTS);
  return MOCK_SYNCED_CONTACTS;
}
