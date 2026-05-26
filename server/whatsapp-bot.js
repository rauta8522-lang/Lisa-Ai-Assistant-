import express from 'express';
import puppeteer from 'puppeteer';
import path from 'path';

const app = express();
app.use(express.json());
let browser = null;

async function getBrowser() {
  if (browser) return browser;

  browser = await puppeteer.launch({
    headless: false,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--no-first-run',
      '--no-default-browser-check',
      '--disable-extensions',
      '--disable-popup-blocking',
    ],
    userDataDir: path.resolve(process.cwd(), 'whatsapp-profile'),
  });

  return browser;
}

async function openChat(page, phone, message) {
  const encodedText = encodeURIComponent(message || '');
  const url = `https://web.whatsapp.com/send?phone=${phone}&text=${encodedText}&app_absent=0`;
  console.log(`[Bot] Navigating to WhatsApp URL: ${url}`);

  await page.goto(url, { waitUntil: 'load', timeout: 120000 });

  // Wait for WhatsApp Web app shell or a chat editor to appear.
  await page.waitForSelector('div[contenteditable="true"], div[data-testid="conversation-panel-chat"]', {
    timeout: 120000,
  });

  // If WhatsApp asks to click a button to continue, click it.
  const continueButton = await page.$('a[href*="/send"]');
  if (continueButton) {
    console.log('[Bot] Clicking continue link on WhatsApp page.');
    await continueButton.click();
    await page.waitForTimeout(2000);
  }

  return url;
}

async function sendMessage(page, message) {
  if (!message) {
    return true;
  }

  const editorSelector = 'div[contenteditable="true"][data-tab], div[role="textbox"]';
  await page.waitForSelector(editorSelector, { timeout: 120000 });

  const editor = await page.$(editorSelector);
  if (!editor) {
    throw new Error('Could not find WhatsApp message editor');
  }

  await editor.focus();
  await page.keyboard.press('Enter');

  const sendButtonSelectors = [
    'button[data-testid="compose-btn-send"]',
    'button[aria-label*="Send"]',
    'span[data-icon="send"]',
    'div[role="button"][aria-label*="Send"]',
  ];

  for (const selector of sendButtonSelectors) {
    try {
      const button = await page.$(selector);
      if (button) {
        console.log(`[Bot] Clicking send button: ${selector}`);
        await button.click();
        return true;
      }
    } catch (error) {
      // Continue to next selector.
    }
  }

  console.warn('[Bot] No explicit send button found; pressing Enter in editor as fallback.');
  await page.keyboard.press('Enter');
  return true;
}

app.post('/send', async (req, res) => {
  const { phone, message } = req.body || {};
  if (!phone) {
    return res.status(400).json({ error: 'phone is required' });
  }

  let page = null;
  try {
    const b = await getBrowser();
    page = await b.newPage();
    await page.setViewport({ width: 1280, height: 900 });
    page.setDefaultNavigationTimeout(120000);
    page.setDefaultTimeout(120000);

    const whatsappUrl = await openChat(page, phone, message);

    const sent = await sendMessage(page, message);
    console.log(`[Bot] sendMessage result: ${sent}`);

    await page.waitForTimeout(2000);

    return res.json({ ok: true, sent, whatsappUrl });
  } catch (error) {
    console.error('[Bot] Error sending WhatsApp message:', error);
    return res.status(500).json({ error: String(error) });
  } finally {
    if (page) {
      try {
        await page.close();
      } catch (e) {
        console.warn('[Bot] Failed to close page:', e);
      }
    }
  }
});

process.on('SIGINT', async () => {
  if (browser) {
    try {
      await browser.close();
    } catch (e) {
      console.warn('[Bot] Error closing browser:', e);
    }
  }
  process.exit();
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`[Bot] WhatsApp bot listening on http://localhost:${PORT}`);
  console.log('[Bot] First run: open WhatsApp Web in the browser and scan QR if needed.');
});
