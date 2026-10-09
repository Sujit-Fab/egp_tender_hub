const { onRequest } = require("firebase-functions/v2/https");
const { onObjectFinalized } = require("firebase-functions/v2/storage");

let expressApp = null;

const getApp = () => {
  if (expressApp) return expressApp;

  const admin = require("firebase-admin");
  if (!admin.apps.length) admin.initializeApp();

  const express = require("express");
  const cors = require("cors");
  const multer = require("multer");
  const fs = require("fs");
  const path = require("path");
  const os = require("os");

  const app = express();
  app.use(cors({ origin: true }));
  app.use(express.json({ limit: "50mb" }));

  const Parser = require("rss-parser");
  const cheerio = require("cheerio");
  const axios = require("axios");

  let cachedNotices = [];
  let cacheTimestamp = 0;
  const CACHE_DURATION = 1000 * 60 * 30;

  app.get("/api/notices", async (req, res) => {
    try {
      if (Date.now() - cacheTimestamp < CACHE_DURATION && cachedNotices.length > 0) {
        return res.json(cachedNotices);
      }
      const notices = [];
      const parser = new Parser({
        customFields: { item: ["description", "pubDate", "link", "title"] },
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
        },
      });

      try {
        const dailyFeeds = await parser.parseURL("https://www.eprocure.gov.bd/RSS/DailyTender.xml");
        dailyFeeds.items.forEach((item) => {
          notices.push({
            id: "daily-" + item.guid,
            title: item.title,
            source: "e-GP (Daily)",
            date: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
            link: item.link || "https://www.eprocure.gov.bd",
            snippet: item.contentSnippet || "No description provided.",
          });
        });
      } catch (err) {
        console.warn("Could not fetch e-GP Daily RSS");
      }

      try {
        const weeklyFeeds = await parser.parseURL("https://www.eprocure.gov.bd/RSS/WeeklyTender.xml");
        weeklyFeeds.items.forEach((item) => {
          notices.push({
            id: "weekly-" + item.guid,
            title: item.title,
            source: "e-GP (Weekly)",
            date: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
            link: item.link || "https://www.eprocure.gov.bd",
            snippet: item.contentSnippet || "No description provided.",
          });
        });
      } catch (err) {
        console.warn("Could not fetch e-GP Weekly RSS");
      }

      try {
        const bppaResponse = await axios.get("https://www.bppa.gov.bd/media-communication/news.html");
        const $ = cheerio.load(bppaResponse.data);
        $("table tbody tr").each((i, el) => {
          const cols = $(el).find("td");
          if (cols.length >= 3) {
            const title = $(cols[0]).text().trim();
            const rawDate = $(cols[2]).text().trim();
            let isoDate = new Date().toISOString();
            if (rawDate) {
              const parts = rawDate.split("/");
              if (parts.length === 3) {
                isoDate = new Date(`${parts[2]}-${parts[1]}-${parts[0]}T00:00:00Z`).toISOString();
              }
            }
            const readMoreLink = $(cols[1]).find("a").attr("href");
            const link = readMoreLink
              ? readMoreLink.startsWith("http") ? readMoreLink : `https://www.bppa.gov.bd${readMoreLink}`
              : "https://www.bppa.gov.bd/media-communication/news.html";
            notices.push({
              id: "bppa-news-" + i,
              title,
              source: "BPPA News",
              date: isoDate,
              link,
              snippet: "Important procurement policy or board news from BPPA.",
            });
          }
        });
      } catch (err) {
        console.warn("Could not scrape BPPA News");
      }

      notices.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      cachedNotices = notices;
      cacheTimestamp = Date.now();
      res.json(cachedNotices);
    } catch (error) {
      console.error("Failed to fetch notices:", error);
      res.status(500).json({ error: "Failed to fetch notices." });
    }
  });

  // ── AI key helper ────────────────────────────────────────────────────────────
  const getApiKey = () => {
    let key = process.env.CUSTOM_API_KEY || process.env.GEMINI_API_KEY;
    if (!key) throw new Error("Missing GEMINI_API_KEY environment variable.");
    key = key.trim();
    if ((key.startsWith('"') && key.endsWith('"')) || (key.startsWith("'") && key.endsWith("'"))) {
      key = key.slice(1, -1);
    }
    return key;
  };

  const checkAI = () => {
    const { GoogleGenAI } = require("@google/genai");
    return new GoogleGenAI({ apiKey: getApiKey() });
  };

    // ── multer memoryStorage for other file uploads ──────────────────────────────
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 20 * 1024 * 1024 },
  });

 // ── STD routes (Firestore) ───────────────────────────────────────────────────
  app.get("/api/stds", async (req, res) => {
    try {
      const db = admin.firestore();
      const snapshot = await db.collection("stds").orderBy("uploadedAt", "desc").get();
      const stds = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      res.json(stds);
    } catch (e) {
      res.status(500).json({ error: e.message || "Failed to fetch STDs" });
    }
  });

  app.post("/api/stds/upload", upload.single("file"), async (req, res) => {
    try {
      const { category, method, valueMin, valueMax, title } = req.body;
      if (!req.file) return res.status(400).json({ error: "No file uploaded" });
      const db = admin.firestore();
      const newStd = {
        title: title || req.file.originalname,
        filename: req.file.originalname,
        category,
        method,
        valueMin: Number(valueMin),
        valueMax: Number(valueMax),
        uploadedAt: new Date().toISOString(),
      };
      const docRef = await db.collection("stds").add(newStd);
      res.json({ id: docRef.id, ...newStd });
    } catch (e) {
      res.status(500).json({ error: e.message || "Failed to upload STD" });
    }
  });

  app.delete("/api/stds/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const db = admin.firestore();
      const docRef = db.collection("stds").doc(id);
      const doc = await docRef.get();
      if (!doc.exists) return res.status(404).json({ error: "STD not found" });
      await docRef.delete();
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: e.message || "Failed to delete STD" });
    }
  });
  // ── AI text routes ───────────────────────────────────────────────────────────
  app.post("/api/ai/extract", async (req, res) => {
    try {
      const ai = checkAI();
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: req.body.contents,
        config: { responseMimeType: "application/json" },
      });
      res.json({ text: response.text, tokensUsed: response.usageMetadata?.totalTokenCount || 0 });
    } catch (e) {
      res.status(500).json({ error: e.message || "Extraction failed" });
    }
  });

  // ── FIX: extract-file now accepts JSON with base64 — NO multipart ────────────
  app.post("/api/ai/extract-file", async (req, res) => {
    try {
      const { fileData, mimeType, prompt } = req.body;

      if (!fileData) {
        console.error("No fileData in request body");
        return res.status(400).json({ error: "No file data provided" });
      }
      if (!prompt) {
        return res.status(400).json({ error: "No prompt provided" });
      }

      console.log(`File received as base64, type: ${mimeType}, size: ~${Math.round(fileData.length * 0.75 / 1024)}KB`);

      const { GoogleGenAI } = require("@google/genai");
      const ai = new GoogleGenAI({ apiKey: getApiKey() });

      const result = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          {
            parts: [
              {
                inlineData: {
                  mimeType: mimeType,
                  data: fileData,
                },
              },
              { text: prompt },
            ],
          },
        ],
      });

      console.log("Gemini response received successfully");

      // Also extract the COMPLETE verbatim text layer via pdf-parse on the SAME base64 buffer (no multipart).
      // Gemini's JSON output truncates/paraphrases long PDFs and drops clause numbers; pdf-parse keeps them all.
      let rawText = "";
      if (mimeType === "application/pdf") {
        try {
          const pdfParse = require("pdf-parse/lib/pdf-parse");
          const buffer = Buffer.from(fileData, "base64");
          const pdfData = await pdfParse(buffer);
          rawText = pdfData.text || "";
        } catch (pdfErr) {
          console.warn("pdf-parse failed in extract-file:", pdfErr.message);
        }
      }

      res.json({
        text: result.text,
        rawText: rawText,
        tokensUsed: result.usageMetadata?.totalTokenCount || 0,
      });
    } catch (e) {
      console.error("File extraction failed:", e.message, e.stack);
      res.status(500).json({ error: e.message || "File extraction failed" });
    }
  });

  app.post("/api/ai/analyze", async (req, res) => {
    try {
      const ai = checkAI();
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: req.body.prompt,
        config: { responseMimeType: "application/json" },
      });
      res.json({ text: response.text, tokensUsed: response.usageMetadata?.totalTokenCount || 0 });
    } catch (e) {
      res.status(500).json({ error: e.message || "Analysis failed" });
    }
  });

  app.post("/api/ai/qa", async (req, res) => {
    try {
      const ai = checkAI();
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: req.body.contents,
        config: { systemInstruction: req.body.systemInstruction },
      });
      res.json({ text: response.text, tokensUsed: response.usageMetadata?.totalTokenCount || 0 });
    } catch (e) {
      res.status(500).json({ error: e.message || "QA failed" });
    }
  });

  app.post("/api/ai/foreign", async (req, res) => {
    try {
      const ai = checkAI();
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: req.body.prompt,
        config: { responseMimeType: "application/json" },
      });
      res.json({ text: response.text, tokensUsed: response.usageMetadata?.totalTokenCount || 0 });
    } catch (e) {
      res.status(500).json({ error: e.message || "Foreign insights failed" });
    }
  });

  // ── Support email ────────────────────────────────────────────────────────────
  app.post("/api/support/send", async (req, res) => {
    try {
      const nodemailer = require("nodemailer");
      const { userEmail, userName, subject, message } = req.body;
      if (!subject || !message) return res.status(400).json({ error: "Subject and message are required" });
      const user = process.env.SMTP_USER;
      const pass = process.env.SMTP_PASS;
      if (!user || !pass) return res.status(500).json({ error: "SMTP credentials not configured." });
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || "smtp.egptenderhub.com",
        port: Number(process.env.SMTP_PORT) || 465,
        secure: Number(process.env.SMTP_PORT) === 465 || !process.env.SMTP_PORT,
        auth: { user, pass },
      });
      await transporter.sendMail({
        from: `"${userName || "eGPTenderHub User"}" <${user}>`,
        to: user,
        replyTo: userEmail || user,
        subject: `[Support form] ${subject}`,
        text: `From: ${userName || "Unknown"}\n\n${message}`,
      });
      res.json({ success: true, message: "Email sent successfully" });
    } catch (error) {
      res.status(500).json({ error: error.message || "Failed to send email" });
    }
  });

  // ── pdf/extract uses buffer directly ─────────────────────────────────────────
  app.post("/api/pdf/extract", upload.single("pdf"), async (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ error: "No PDF file uploaded" });
      const pdfParse = require("pdf-parse/lib/pdf-parse");
      const data = await pdfParse(req.file.buffer);
      res.json({ success: true, text: data.text });
    } catch (error) {
      res.status(500).json({ error: error.message || "Failed to extract PDF" });
    }
  });

  expressApp = app;
  return app;
};

// ── Firebase exports ──────────────────────────────────────────────────────────
exports.api = onRequest(
  {
    timeoutSeconds: 300,
    memory: "1GiB",
    region: "asia-south1",
  },
  (req, res) => getApp()(req, res)
);

exports.onPdfUploaded = onObjectFinalized(
  {
    timeoutSeconds: 300,
    memory: "1GiB",
    region: "asia-south1",
    bucket: "gen-lang-client-0089421810.firebasestorage.app",
  },
  async (event) => {
    const object = event.data;
    const admin = require("firebase-admin");
    if (!admin.apps.length) admin.initializeApp();
    const { getStorage } = require("firebase-admin/storage");
    const pdfParse = require("pdf-parse/lib/pdf-parse");
    const fs = require("fs"),
      path = require("path"),
      os = require("os");
    if (!object.contentType || !object.contentType.includes("pdf")) return;
    const file = getStorage().bucket(object.bucket).file(object.name);
    const tmp = path.join(os.tmpdir(), path.basename(object.name));
    try {
      await file.download({ destination: tmp });
      await pdfParse(fs.readFileSync(tmp));
      fs.unlinkSync(tmp);
    } catch (e) {
      if (fs.existsSync(tmp)) fs.unlinkSync(tmp);
      throw e;
    }
  }
);

// -- TENDER RADAR -------------------------------------------------------------
const { onSchedule } = require("firebase-functions/v2/scheduler");

// Category keywords (mirrors src/lib/tender-radar/categorizer.ts)
function categorizeTender(tender) {
  const title = (tender.title || "").toLowerCase();
  const org   = ((tender.organization || "") + " " + (tender.procuring_entity || "") + " " + (tender.ministry || "")).toLowerCase();

  const rules = [
    { cat: "Road & Highway",       tk: ["road","highway","pavement","bituminous","asphalt","bitumen","shoulder","seal coat","wearing course","uni-block","HBB"], ok: ["RHD","Roads & Highways","Road Division"] },
    { cat: "Building & Civil",     tk: ["building","construction","renovation","repair","floor","hostel","college","school","madrasa","boundary wall","foundation","storied","auditorium","mosque","bhaban","waterproofing"], ok: ["PWD","Public Works","Education Engineering","EED","PWD Division"] },
    { cat: "Medical & Hospital",   tk: ["medicine","medical","surgical","hospital","health","MSR","linen","gauze","patient","diet","bandage","instrument","reagent","pacemaker","stent","valve","dialysis","syrup"], ok: ["DGHS","Health Services","HED","UHC","Health Complex","Hospital","Medical College","NICVD"] },
    { cat: "IT & Equipment",       tk: ["computer","laptop","software","ICT","printer","UPS","scanner","digital","bandwidth","internet","network","LAN","attendance","camera","LED","meter","electricity bill form"], ok: ["ICT","Information Technology","Meteorological"] },
    { cat: "Water & Drainage",     tk: ["water","drain","culvert","dredging","river","flood","irrigation","pump","tube well","aquifer","recharge","pontoon","bank protection","regulator","canal","navigability"], ok: ["BWDB","DWASA","Water Resources","WD Division","Water Supply","Sewerage"] },
    { cat: "Power & Electrical",   tk: ["power","electrical","transformer","generator","solar","grid","feeder","meter","substation","conductor","insulator","line repair","pole","cable","gas turbine","compressor"], ok: ["BPDB","REB","Power Grid","WZPDCL","Palli Bidyut","Power Division","Electricity Generation"] },
    { cat: "Vehicles & Spare Parts", tk: ["vehicle","truck","jeep","pickup","microbus","ferry","locomotive","spare parts","engine","bearing","gear","pump assembly","fuel filter","hydraulic","crank shaft","piston","sleeper","railway track"], ok: ["Bangladesh Railway","RHD Workshop","BIWTC","Workshop Division","Works Manager"] },
    { cat: "Food & Ration",        tk: ["food","rice","lentil","dal","oil","soybean","ration","grocery","diet","masur","polao","edible oil","grain","firewood","flour","wheat"], ok: ["Bangladesh Police","Police Superintendent","PSTS","SMP Ration"] },
  ];

  for (const rule of rules) {
    if (rule.tk.some(k => title.includes(k.toLowerCase())) || rule.ok.some(k => org.includes(k.toLowerCase()))) {
      return rule.cat;
    }
  }
  return "Others";
}

function buildEmailHtml(userName, date, groupedTenders) {
  const categoryColors = {
    "Road & Highway":        "#1D4ED8",
    "Building & Civil":      "#7C3AED",
    "Medical & Hospital":    "#059669",
    "IT & Equipment":        "#0891B2",
    "Water & Drainage":      "#0284C7",
    "Power & Electrical":    "#D97706",
    "Vehicles & Spare Parts":"#DC2626",
    "Food & Ration":         "#65A30D",
    "Others":                "#6B7280",
  };

  let categorySections = "";
  for (const [cat, tenders] of Object.entries(groupedTenders)) {
    const color = categoryColors[cat] || "#6B7280";
    const rows = tenders.map(t => `
      <tr style="border-bottom:1px solid #F3F4F6;">
        <td style="padding:10px 8px;font-size:12px;color:#6B7280;font-family:monospace;">${t.tender_id}</td>
        <td style="padding:10px 8px;font-size:13px;color:#111827;">${t.title.substring(0, 80)}${t.title.length > 80 ? "�" : ""}</td>
        <td style="padding:10px 8px;font-size:12px;color:#374151;">${t.procuring_entity.substring(0, 40)}</td>
        <td style="padding:10px 8px;font-size:12px;color:#EF4444;font-weight:600;">${t.closing_datetime}</td>
      </tr>`).join("");

    categorySections += `
      <div style="margin-bottom:24px;">
        <div style="background:${color};color:#fff;padding:8px 16px;border-radius:6px 6px 0 0;font-size:13px;font-weight:700;">
          ${cat} &nbsp;�&nbsp; ${tenders.length} tender${tenders.length > 1 ? "s" : ""}
        </div>
        <table style="width:100%;border-collapse:collapse;background:#fff;border:1px solid #E5E7EB;border-top:none;border-radius:0 0 6px 6px;">
          <thead>
            <tr style="background:#F9FAFB;">
              <th style="padding:8px;text-align:left;font-size:11px;color:#6B7280;width:100px;">Tender ID</th>
              <th style="padding:8px;text-align:left;font-size:11px;color:#6B7280;">Title</th>
              <th style="padding:8px;text-align:left;font-size:11px;color:#6B7280;width:160px;">Procuring Entity</th>
              <th style="padding:8px;text-align:left;font-size:11px;color:#6B7280;width:130px;">Closing Date</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>`;
  }

  const total = Object.values(groupedTenders).reduce((s, arr) => s + arr.length, 0);

  return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F3F4F6;font-family:Arial,sans-serif;">
  <div style="max-width:700px;margin:24px auto;background:#fff;border-radius:10px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.08);">
    <div style="background:#111827;padding:24px 28px;">
      <div style="font-size:20px;font-weight:800;color:#fff;">??? eGP TenderHub</div>
      <div style="font-size:13px;color:#9CA3AF;margin-top:4px;">Daily Tender Radar � ${date}</div>
    </div>
    <div style="padding:20px 28px;background:#1A56DB;">
      <div style="color:#fff;font-size:15px;">Hello <strong>${userName}</strong> ??</div>
      <div style="color:#BFDBFE;font-size:13px;margin-top:4px;">
        Today's e-GP portal has <strong style="color:#fff;">${total} new tenders</strong> matching your selected categories.
      </div>
    </div>
    <div style="padding:24px 28px;">
      ${categorySections}
    </div>
    <div style="padding:16px 28px;background:#F9FAFB;border-top:1px solid #E5E7EB;font-size:11px;color:#9CA3AF;text-align:center;">
      eGPTenderHub � PPR 2025 Compliant � 
      <a href="https://egptenderhub.com/settings" style="color:#1A56DB;">Manage Categories</a> � 
      <a href="https://egptenderhub.com/unsubscribe" style="color:#6B7280;">Unsubscribe</a>
    </div>
  </div>
</body>
</html>`;
}

// Scheduled: every day at 8:00 AM Bangladesh time (BST = UTC+6 = 02:00 UTC)
exports.tenderRadarDailyEmail = onSchedule(
  { schedule: "0 2 * * *", timeZone: "Asia/Dhaka", region: "asia-south1" },
  async () => {
    const admin  = require("firebase-admin");
    if (!admin.apps.length) admin.initializeApp();
    const db       = admin.firestore();
    const nodemailer = require("nodemailer");

    // 1. Get today's parsed tender JSON from Firestore
    const today     = new Date().toISOString().split("T")[0];
    const radarSnap = await db.collection("tenderRadarUploads").doc(today).get();

    if (!radarSnap.exists) {
      console.log("No tender radar upload found for", today);
      return;
    }

    const { tenders } = radarSnap.data();
    if (!tenders || !tenders.length) {
      console.log("Empty tenders array for", today);
      return;
    }

    // 2. Categorize all tenders
    const categorized = tenders.map(t => ({ ...t, category: categorizeTender(t) }));

    // 3. Get all Pro/Enterprise users with tenderCategories set
    const usersSnap = await db.collection("users")
      .where("subscriptionTier", "in", ["pro", "enterprise"])
      .get();

    if (usersSnap.empty) {
      console.log("No pro/enterprise users found");
      return;
    }

    // 4. Setup SMTP
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    if (!user || !pass) { console.error("SMTP not configured"); return; }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.egptenderhub.com",
      port: Number(process.env.SMTP_PORT) || 465,
      secure: true,
      auth: { user, pass },
    });

    // 5. Send personalised email to each user
    let sent = 0, skipped = 0;
    for (const doc of usersSnap.docs) {
      const userData = doc.data();
      const { email, displayName, tenderCategories } = userData;

      if (!email || !tenderCategories || !tenderCategories.length) {
        skipped++;
        continue;
      }

      // Filter tenders to user's chosen categories
      const filtered = categorized.filter(t => tenderCategories.includes(t.category));
      if (!filtered.length) { skipped++; continue; }

      // Group by category
      const grouped = {};
      for (const t of filtered) {
        if (!grouped[t.category]) grouped[t.category] = [];
        grouped[t.category].push(t);
      }

      const html = buildEmailHtml(displayName || "Contractor", today, grouped);
      const totalCount = filtered.length;

      try {
        await transporter.sendMail({
          from: `"eGP TenderHub" <${user}>`,
          to: email,
          subject: `??? ${totalCount} New Tenders Today � ${today} | eGP TenderHub`,
          html,
        });
        sent++;
        console.log(`Email sent to ${email} (${totalCount} tenders)`);
      } catch (err) {
        console.error(`Failed to send to ${email}:`, err.message);
      }
    }

    console.log(`Tender Radar complete: ${sent} sent, ${skipped} skipped`);
  }
);

// Manual trigger endpoint (for testing without waiting for schedule)
app.post("/api/tender-radar/trigger", async (req, res) => {
  try {
    const admin = require("firebase-admin");
    if (!admin.apps.length) admin.initializeApp();
    const db = admin.firestore();
    const { date } = req.body;
    const targetDate = date || new Date().toISOString().split("T")[0];

    const snap = await db.collection("tenderRadarUploads").doc(targetDate).get();
    if (!snap.exists) return res.status(404).json({ error: `No upload found for ${targetDate}` });

    res.json({ success: true, message: `Trigger received for ${targetDate}. Check logs.` });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Upload parsed tender JSON to Firestore (called after PDF parse)
app.post("/api/tender-radar/upload", async (req, res) => {
  try {
    const admin = require("firebase-admin");
    if (!admin.apps.length) admin.initializeApp();
    const db = admin.firestore();

    const { tenders, date, diagnostics } = req.body;
    if (!tenders || !Array.isArray(tenders)) {
      return res.status(400).json({ error: "tenders array required" });
    }

    const targetDate = date || new Date().toISOString().split("T")[0];
    await db.collection("tenderRadarUploads").doc(targetDate).set({
      tenders,
      diagnostics: diagnostics || [],
      uploadedAt: new Date().toISOString(),
      totalCount: tenders.length,
    });

    res.json({ success: true, date: targetDate, totalCount: tenders.length });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
