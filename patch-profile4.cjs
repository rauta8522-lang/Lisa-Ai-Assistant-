const fs = require('fs');
let code = fs.readFileSync('src/components/ProfileModal.tsx', 'utf8');

const planTabButton = `              <button
                onClick={() => setActiveTab("plan")}
                className={\`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-medium transition-all text-left cursor-pointer \${
                  activeTab === "plan"
                    ? \`bg-white/10 text-white font-semibold \${palette.accentBorder} border-l-2\`
                    : "text-white/60 hover:bg-white/5 hover:text-white"
                }\`}
              >
                <Crown size={14} className={activeTab === "plan" ? "text-yellow-400" : "opacity-60"} />
                <span>Lisa Plan</span>
              </button>
`;

code = code.replace(
  '              <button\n                onClick={() => setActiveTab("personal")}',
  planTabButton + '              <button\n                onClick={() => setActiveTab("personal")}'
);

const planTabContent = `            {activeTab === "plan" && (
              <motion.div
                key="plan-details"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-6"
              >
                <div className="space-y-1">
                  <h3 className="text-lg font-serif font-bold text-white flex items-center gap-2">
                    <Crown size={18} className="text-yellow-400" />
                    Lisa AI Plan
                  </h3>
                  <p className="text-xs text-white/50 font-medium">Manage your subscription and AI provider.</p>
                </div>

                {lisaPlan === "loading" ? (
                  <div className="p-6 bg-white/5 border border-white/10 rounded-2xl flex justify-center items-center">
                    <RefreshCw size={24} className="text-white/50 animate-spin" />
                  </div>
                ) : lisaPlan === "free" ? (
                  <div className="p-6 bg-white/5 border border-white/10 rounded-2xl space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-xl font-bold text-white">Lisa Free</h4>
                        <p className="text-xs text-[#10b981] font-medium mt-1">Powered by Gemini</p>
                      </div>
                      <div className="px-2 py-1 rounded bg-white/10 text-white/70 text-[10px] font-bold uppercase tracking-wider">Current</div>
                    </div>
                    <p className="text-sm text-white/70 leading-relaxed">
                      Gemini powers Lisa's AI conversations. Enjoy natural text chats and Lisa's responsive voice capabilities.
                    </p>
                    <button className="w-full mt-4 py-3 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white font-bold text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-lg shadow-violet-500/20">
                      <Crown size={16} /> Upgrade to Lisa Pro 💎
                    </button>
                  </div>
                ) : (
                  <div className="p-6 bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 border border-violet-500/30 rounded-2xl space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-xl font-bold text-white flex items-center gap-2">
                          Lisa Pro <Check size={18} className="text-[#10b981]" />
                        </h4>
                        <p className="text-xs text-fuchsia-400 font-medium mt-1">Powered by DeepSeek + Gemini Voice</p>
                      </div>
                      <div className="px-2 py-1 rounded bg-violet-500/20 text-violet-300 text-[10px] font-bold uppercase tracking-wider border border-violet-500/30">Active</div>
                    </div>
                    <p className="text-sm text-white/80 leading-relaxed">
                      DeepSeek powers Lisa's advanced text reasoning, while Lisa's existing Gemini voice remains unchanged. You have access to our most capable reasoning models.
                    </p>
                  </div>
                )}
              </motion.div>
            )}
`;

code = code.replace(
  '            {activeTab === "personal" && (',
  planTabContent + '            {activeTab === "personal" && ('
);

fs.writeFileSync('src/components/ProfileModal.tsx', code);
console.log("Plan tab added");
