import express from 'express';
import twilio from 'twilio';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());

// Get credentials from environment variables
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_WHATSAPP_NUMBER = process.env.TWILIO_WHATSAPP_NUMBER; // e.g., "whatsapp:+14155552671"

// Validate required env vars
if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_WHATSAPP_NUMBER) {
  console.error('[Bot] Missing required Twilio credentials in environment variables:');
  console.error('  - TWILIO_ACCOUNT_SID');
  console.error('  - TWILIO_AUTH_TOKEN');
  console.error('  - TWILIO_WHATSAPP_NUMBER');
  process.exit(1);
}

const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

app.post('/send', async (req, res) => {
  const { phone, message } = req.body || {};

  if (!phone) {
    return res.status(400).json({ error: 'phone is required' });
  }

  if (!message) {
    return res.status(400).json({ error: 'message is required' });
  }

  try {
    // Format phone number: ensure it starts with '+' and country code
    let formattedPhone = phone.toString().trim();
    if (!formattedPhone.startsWith('+')) {
      formattedPhone = '+' + formattedPhone;
    }

    console.log(`[Bot] Sending message to ${formattedPhone}: "${message}"`);

    // Send WhatsApp message via Twilio
    const result = await client.messages.create({
      from: TWILIO_WHATSAPP_NUMBER,
      to: `whatsapp:${formattedPhone}`,
      body: message,
    });

    console.log(`[Bot] Message sent successfully. SID: ${result.sid}`);

    return res.json({
      ok: true,
      sent: true,
      messageSid: result.sid,
    });
  } catch (error) {
    console.error('[Bot] Error sending WhatsApp message:', error.message);
    return res.status(500).json({
      error: error.message || 'Failed to send message',
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'WhatsApp Twilio Bot' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`[Bot] WhatsApp Twilio bot listening on http://localhost:${PORT}`);
  console.log(`[Bot] Service: Ready to send messages`);
});
