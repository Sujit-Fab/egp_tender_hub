# PWD SoR Database Import Script

This folder contains the master scripts to securely and effectively import messy Schedule of Rates (SoR) data directly into your Firebase standard global database.

## Why this approach?

Converting government PDFs to Excel often results in merged cells, missing headers, and shifted columns. Trying to write a web-interface to "guess" every possible messy PDF format is nearly impossible and leads to a frustrating user experience.

By using a standalone script (like `import-sor.js`), you can:
1. Examine the exact way your PDF-to-Excel converter grouped the columns.
2. Edit the parsing logic loops (`colA`, `colB`, etc.) to perfectly extract the data.
3. Automatically correct typos (e.g. standardizing rates for all regions) before upload.
4. Run it directly locally using Firebase Admin privileges to bypass standard web UI limits.

## Setup Instructions

### 1. Requirements

Ensure you have Node.js installed on your computer.

### 2. Install Packages

If running locally on your computer, navigate to this `scripts/` folder in your terminal and install the prerequisites:

```bash
cd scripts
npm install firebase-admin xlsx
```

### 3. Get your Firebase Admin Credentials

Because this script bypasses your standard app's login to inject thousands of rows seamlessly, it requires a master key:
1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Select your Project.
3. Go to **Project Settings** (gear icon) -> **Service Accounts**.
4. Click **Generate New Private Key**.
5. Save the downloaded JSON file into this `scripts` folder and rename it exactly to: `service-account.json`.

*(Note: Never commit `service-account.json` to GitHub!)*

### 4. Prepare your Excel File

Rename your converted CSV file to `pwd_data.csv` and place it in this folder.

### 5. Adjust the Code Structure (If needed)

Open `import-sor.js` in a code editor. Look at the **"CUSTOM PARSING LOGIC"** section. 
The script treats the CSV file as an array of raw rows. 
- `row[0]` is Column A (Item No)
- `row[1]` is Column B (Description)
- `row[2]` is Column C (Unit)
- `row[3]` to `row[6]` correspond to the 4 district rates.

If your PDF converter put the "Rate" into Column E instead of Column D, just change the script!

Example:
```javascript
const rate = parseFloat(row[4].replace(/[^\d.-]/g, '')); // Grabs Column E
```

### 6. Run the Script

Run the script from your terminal:

```bash
node import-sor.js
```

You will see the output confirming how many items were extracted, and it will batch-upload them sequentially directly into your `/globalSorItems` Firestore collection. 
When your users open the web-app, they will immediately see the updated database!
