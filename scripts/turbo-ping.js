import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch'; // Wir erzwingen das robuste node-fetch

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const KEY_FILE = path.resolve(__dirname, '../service-account.json');
const DOMAIN = process.env.VITE_SITE_URL || process.env.SITE_URL || 'https://example.com';

// HIER DEINE 10 URLS EINTRAGEN (Das ist Pflicht!)
const URLS_TO_INDEX = [
  '/hundekrankenversicherung-vergleich',
  '/pkv-beamte-vergleich',
'/unfallversicherung-vergleich',
'/lebensversicherung-vergleich',
'/rentenversicherung-vergleich',
'/berufsunfaehigkeit-versicherung-vergleich',
'/pkv-vollversicherung',
'/kreditkarten-vergleich',
'/baufinanzierung-vergleich',
'/stromvergleich',
'/forum/strompreisvergleich-2026-abzocke-stoppen',
'/gadgets-gegen-nackenschmerzen',
'/dsl-vergleich-standard-portal',
];

async function fastPin() {
  console.log('🔧 Portal Diagnose-Ping startet...');

  if (!fs.existsSync(KEY_FILE)) {
    console.error(`❌ FEHLER: Key fehlt unter: ${KEY_FILE}`);
    return;
  }

  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: KEY_FILE,
      scopes: ['https://www.googleapis.com/auth/indexing'],
    });

    const client = await auth.getClient();
    const tokenResponse = await client.getAccessToken();
    const accessToken = tokenResponse.token;

    for (const url of URLS_TO_INDEX) {
      const fullUrl = url.startsWith('http') ? url : `${DOMAIN}${url}`;
      
      const response = await fetch('https://indexing.googleapis.com/v3/urlNotifications:publish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          url: fullUrl,
          type: 'URL_UPDATED',
        }),
      });

      // Wir holen den Rohtext, egal ob JSON oder HTML
      const responseText = await response.text();

      if (response.ok) {
        console.log(`✅ Google hat die URL geschluckt: ${fullUrl}`);
      } else {
        console.error(`\n❌ GOOGLE BLOCKIERT: ${fullUrl}`);
        console.error(`Status Code: ${response.status}`);
        
        // Wir filtern die echte Fehlermeldung aus Googles HTML
        const titleMatch = responseText.match(/<title>(.*?)<\/title>/i);
        if (titleMatch) {
            console.error(`Google sagt: "${titleMatch[1]}"`);
        } else {
            console.error(`Rohdaten: ${responseText.substring(0, 150)}...`);
        }
      }
    }
    console.log('\n🏁 Diagnose abgeschlossen.');
  } catch (err) {
    console.error('❌ SYSTEMFEHLER:', err.message);
  }
}

fastPin();