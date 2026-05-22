import React, { useState, useEffect } from "react";
import { Plus, Trash2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export interface Contact {
  id: string;
  name: string;
  phone: string;
}

interface ContactsManagerProps {
  onClose: () => void;
}

const STORAGE_KEY = "lisa_contacts";

export function getStoredContacts(): Contact[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error("Failed to parse stored contacts", e);
  }
  // Default contact
  return [{ id: "1", name: "soni", phone: "919999999999" }];
}

export function saveContacts(contacts: Contact[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(contacts));
  } catch (e) {
    console.error("Failed to save contacts", e);
  }
}

export default function ContactsManager({ onClose }: ContactsManagerProps) {
  const [contacts, setContacts] = useState<Contact[]>(getStoredContacts);
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    saveContacts(contacts);
  }, [contacts]);

  const addContact = () => {
    if (newName.trim() && newPhone.trim()) {
      const newContact: Contact = {
        id: Date.now().toString(),
        name: newName.trim().toLowerCase(),
        phone: newPhone.trim().replace(/\D/g, ""),
      };
      setContacts([...contacts, newContact]);
      setNewName("");
      setNewPhone("");
    }
  };

  const deleteContact = (id: string) => {
    setContacts(contacts.filter((c) => c.id !== id));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      addContact();
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="fixed inset-0 bg-black/50 flex items-end z-50"
      >
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          className="w-full bg-white rounded-t-2xl p-6 max-h-[90vh] overflow-y-auto"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Manage Contacts</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Add New Contact */}
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Add New Contact</h3>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Contact name (e.g., soni, amit)"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="tel"
                placeholder="Phone number (e.g., 919999999999)"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value.replace(/\D/g, ""))}
                onKeyPress={handleKeyPress}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={addContact}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Add Contact
              </button>
            </div>
          </div>

          {/* Existing Contacts */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Your Contacts</h3>
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {contacts.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No contacts yet</p>
              ) : (
                contacts.map((contact) => (
                  <motion.div
                    key={contact.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="flex items-center justify-between bg-gray-50 p-3 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800 capitalize">{contact.name}</p>
                      <p className="text-sm text-gray-600">{contact.phone}</p>
                    </div>
                    <button
                      onClick={() => deleteContact(contact.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </motion.div>
                ))
              )}
            </div>
          </div>

          {/* Usage Info */}
          <div className="mt-6 bg-blue-50 rounded-xl p-4">
            <p className="text-sm text-gray-700">
              <strong>How to use:</strong> Say <code className="bg-white px-2 py-1 rounded text-blue-600">"{contacts[0]?.name || 'contact'} ko message karo ki khana kha liya"</code>
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
