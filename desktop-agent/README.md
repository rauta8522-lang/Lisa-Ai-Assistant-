# Lisa AI - Windows Desktop Agent 🖥️

Official local desktop automation bridge for Lisa AI. Enables real-time, verified execution of OS tasks like launching and controlling Visual Studio Code, Chrome, Terminal, running code, creating projects, and inspecting screen states.

---

## 🚀 Quick Setup on Windows

### Prerequisites
- Node.js 18+ or 20+ installed on your Windows PC.
- Visual Studio Code installed (optional, recommended for coding workflows).

### Step 1: Clone or Copy the `desktop-agent` folder to your Windows PC
Place the `desktop-agent` folder anywhere on your computer (e.g. `C:\LisaAgent` or `C:\Users\<You>\desktop-agent`).

### Step 2: Install Dependencies
Open **Command Prompt** or **PowerShell** inside the `desktop-agent` directory:
```bash
npm install
```

### Step 3: Get Your Pairing Code
1. Open the **Lisa Web Application** in your browser.
2. Go to **Settings** (Profile modal) -> **Computer Devices**.
3. Click **"Pair New Windows PC"** to generate a 6-digit pairing code.

### Step 4: Start the Agent
In PowerShell, run:
```bash
npm start
```
Follow the prompt to enter your 6-digit Pairing Code. Once paired, the agent automatically connects via an encrypted WebSocket bridge.

---

## 🎙️ Testing Voice Commands

Once the agent shows `🟢 [STATUS] AGENT ONLINE`:
1. Speak to Lisa: **"Lisa, VS Code kholo"**
2. Lisa verifies the real Windows process, launches VS Code, and responds:
   > *"Ho gaya boss, VS Code open ho gaya."*
3. Speak: **"VS Code me ek simple calculator banao aur run karo"**
4. The agent creates the project in `Documents\LisaProjects`, writes the code, runs it in PowerShell, inspects the output, and reports completion!

---

## 🔒 Security & Privacy Model
- **Isolated Workspace**: Operates strictly within `%USERPROFILE%\Documents\LisaProjects`.
- **Zero Raw Input Exposure**: No arbitrary OS input or keyboard snooping.
- **Strict Guardrails**: Formats, system changes, credentials, and destructive deletes are permanently blocked.
- **Revocation**: Devices can be disconnected at any time from Lisa Settings.
