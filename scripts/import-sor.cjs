const admin = require('firebase-admin');
const { parse } = require('csv-parse/sync');
const fs = require('fs');
const path = require('path');

<<<<<<< HEAD
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
=======
// ============================================================================
// CONFIGURATION
// ============================================================================

// 1. Download your Firebase Admin Service Account Key from:
//    Firebase Console -> Project Settings -> Service Accounts -> Generate New Private Key
// 2. Place the downloaded JSON file in this 'scripts' folder and rename it to 'service-account.json'
const SERVICE_ACCOUNT_PATH = path.join(__dirname, 'service-account.json');

// 3. Place your converted CSV file in this 'scripts' folder
const EXCEL_FILE_PATH = path.join(__dirname, 'pwd_data.csv');

// 4. Set the name of the Firestore collection
const TARGET_COLLECTION = 'globalSorItems';

// ============================================================================
// SCRIPT
// ============================================================================

async function main() {
  console.log('--- SoR Database Master Import Script ---');

  // Verify files exist
  if (!fs.existsSync(SERVICE_ACCOUNT_PATH)) {
    console.error(`❌ Missing Service Account Key! Please place it at: ${SERVICE_ACCOUNT_PATH}`);
    process.exit(1);
  }
  if (!fs.existsSync(EXCEL_FILE_PATH)) {
    console.error(`❌ Missing CSV File! Please place it at: ${EXCEL_FILE_PATH}`);
    process.exit(1);
  }

  // Initialize Firebase Admin
  const serviceAccount = require(SERVICE_ACCOUNT_PATH);
  const config = JSON.parse(fs.readFileSync(path.join(__dirname, '../firebase-applet-config.json'), 'utf8'));
  
  const app = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  const { getFirestore } = require('firebase-admin/firestore');
  const db = getFirestore(app, config.firestoreDatabaseId || '(default)');
  console.log('✅ Connected to Firebase Admin (DB: ' + config.firestoreDatabaseId + ')');

  // Read Excel/CSV
  console.log(`Loading CSV file from ${EXCEL_FILE_PATH}...`);
  const fileContent = fs.readFileSync(EXCEL_FILE_PATH, 'utf8');
  const rawRows = parse(fileContent, { skip_empty_lines: true, relax_column_count: true });
  console.log(`✅ Loaded ${rawRows.length} rows.`);

  const validItems = [];

  console.log(`Preview of rawRows[10] to rawRows[15]:`);
  console.log(JSON.stringify(rawRows.slice(10, 15), null, 2));

  // ==========================================================================
  // CUSTOM PARSING LOGIC FOR THE EXACT PWD SoR PDF/CSV FORMAT
  // ==========================================================================
  
  for (let i = 0; i < rawRows.length; i++) {
    const row = rawRows[i];
    
    // In the PWD CSV, columns typically map as:
    // row[0] = Item No (e.g. "04.1")
    // row[1] = Description
    // row[2] = Unit (e.g. "cum", "sqm")
    // row[3] = Dhaka Rate
    // row[4] = Chattogram Rate
    // row[5] = Khulna Rate
    // row[6] = Rajshahi Rate
    
    // Quick safety check
>>>>>>> 17554a00c6c5ef461b03f7885a73ad10676f9328
    if (!row || row.length < 4) continue;

    const itemNo = String(row[0] || '').trim();
    const description = String(row[1] || '').trim();
<<<<<<< HEAD
    if (!itemNo || itemNo.toLowerCase().includes('item') || !/^[0-9.]+$/.test(itemNo)) continue;

    const rateDhaka = parseFloat(String(row[3]).replace(/[^\d.-]/g, ''));
    if (description && !isNaN(rateDhaka) && rateDhaka > 0) {
      validItems.push({
        item_no: itemNo, description: description, unit: String(row[2]).trim() || 'Nos',
        chapter: `Chapter ${itemNo.split('.')[0]}`, category: 'PWD DB',
        rates: { Dhaka_Mymensingh: rateDhaka } // Truncated rate parsing for simplicity in this copy
=======
    const unit = String(row[2] || '').trim();

    // Skip empty rows or header rows
    if (!itemNo || itemNo.toLowerCase().includes('item') || itemNo.toLowerCase().includes('chapter')) continue;

    // A valid row must start with numbers (or dot) like "12.1"
    if (!/^[0-9.]+$/.test(itemNo)) continue;

    const rateDhaka = parseFloat(String(row[3] || '').replace(/[^\d.-]/g, ''));
    const rateChattogram = parseFloat(String(row[4] || '').replace(/[^\d.-]/g, ''));
    const rateKhulna = parseFloat(String(row[5] || '').replace(/[^\d.-]/g, ''));
    const rateRajshahi = parseFloat(String(row[6] || '').replace(/[^\d.-]/g, ''));

    if (itemNo && description && !isNaN(rateDhaka) && rateDhaka > 0) {
      // Determine a rough chapter or category based on parsing (optional)
      const chapterPrefix = itemNo.split('.')[0];

      validItems.push({
        item_no: itemNo,
        description: description,
        unit: unit || 'Nos',
        chapter: `Chapter ${chapterPrefix}`,
        category: 'PWD DB',
        rates: {
          Dhaka_Mymensingh: rateDhaka,
          Chattogram_Sylhet: isNaN(rateChattogram) ? rateDhaka : rateChattogram,
          Khulna_Barisal_Gopalgonj: isNaN(rateKhulna) ? rateDhaka : rateKhulna,
          Rajshahi_Rangpur: isNaN(rateRajshahi) ? rateDhaka : rateRajshahi
        }
>>>>>>> 17554a00c6c5ef461b03f7885a73ad10676f9328
      });
    }
  }

<<<<<<< HEAD
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
=======
  console.log(`✅ Extracted ${validItems.length} valid SoR items.`);

  if (validItems.length === 0) {
    console.error('❌ No valid items found! You may need to tweak the CUSTOM PARSING LOGIC based on your Excel format.');
    process.exit(1);
  }

  // Upload to Firestore in Batches
  console.log(`Commencing upload to Firestore collection: /${TARGET_COLLECTION} ...`);
  const BATCH_SIZE = 400;
  let batch = db.batch();
  let operationCounter = 0;
  let batchCounter = 0;

  for (const item of validItems) {
    const docRef = db.collection(TARGET_COLLECTION).doc(); // auto-ID
    
    // Ensure ID is saved within the document
    batch.set(docRef, { ...item, id: docRef.id });
    operationCounter++;

    if (operationCounter === BATCH_SIZE) {
      await batch.commit();
      batchCounter++;
      console.log(`✅ Committed batch ${batchCounter} (${operationCounter} documents)`);
      batch = db.batch();
      operationCounter = 0;
    }
  }

  if (operationCounter > 0) {
    await batch.commit();
    batchCounter++;
    console.log(`✅ Committed final batch ${batchCounter} (${operationCounter} documents)`);
  }

  console.log(`🎉 Success! Uploaded ${validItems.length} items to Firebase.`);
  process.exit(0);
}

main().catch(console.error);
>>>>>>> 17554a00c6c5ef461b03f7885a73ad10676f9328
