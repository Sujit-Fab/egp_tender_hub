const admin = require('firebase-admin');
const { parse } = require('csv-parse/sync');
const fs = require('fs');
const path = require('path');

// 1. Download your Firebase Admin Service Account Key and name it 'service-account.json'
const SERVICE_ACCOUNT_PATH = path.join(__dirname, 'service-account.json');
const EXCEL_FILE_PATH = path.join(__dirname, 'pwd_data.csv');
const TARGET_COLLECTION = 'globalSorItems';

async function main() {
  console.log('--- SoR Database Master Import Script ---');
  if (!fs.existsSync(SERVICE_ACCOUNT_PATH)) {
    console.error(`❌ Missing Service Account Key!`); process.exit(1);
  }
  if (!fs.existsSync(EXCEL_FILE_PATH)) {
    console.error(`❌ Missing CSV File!`); process.exit(1);
  }

  const serviceAccount = require(SERVICE_ACCOUNT_PATH);
  const config = JSON.parse(fs.readFileSync(path.join(__dirname, '../firebase-applet-config.json'), 'utf8'));
  const app = admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
  const { getFirestore } = require('firebase-admin/firestore');
  const db = getFirestore(app, config.firestoreDatabaseId || '(default)');
  
  console.log(`Loading CSV file from ${EXCEL_FILE_PATH}...`);
  const rawRows = parse(fs.readFileSync(EXCEL_FILE_PATH, 'utf8'), { skip_empty_lines: true, relax_column_count: true });
  
  const validItems = [];
  for (let i = 0; i < rawRows.length; i++) {
    const row = rawRows[i];
    if (!row || row.length < 4) continue;

    const itemNo = String(row[0] || '').trim();
    const description = String(row[1] || '').trim();
    if (!itemNo || itemNo.toLowerCase().includes('item') || !/^[0-9.]+$/.test(itemNo)) continue;

    const rateDhaka = parseFloat(String(row[3]).replace(/[^\d.-]/g, ''));
    if (description && !isNaN(rateDhaka) && rateDhaka > 0) {
      validItems.push({
        item_no: itemNo, description: description, unit: String(row[2]).trim() || 'Nos',
        chapter: `Chapter ${itemNo.split('.')[0]}`, category: 'PWD DB',
        rates: { Dhaka_Mymensingh: rateDhaka } // Truncated rate parsing for simplicity in this copy
      });
    }
  }

  // Batch upload logic...
  const BATCH_SIZE = 400;
  let batch = db.batch(), counter = 0;
  for (const item of validItems) {
    const docRef = db.collection(TARGET_COLLECTION).doc();
    batch.set(docRef, { ...item, id: docRef.id });
    if (++counter === BATCH_SIZE) { await batch.commit(); batch = db.batch(); counter = 0; }
  }
  if (counter > 0) await batch.commit();
  console.log(`🎉 Success! Uploaded items.`); process.exit(0);
}
main().catch(console.error);