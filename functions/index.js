const { onRequest } = require("firebase-functions/v2/https");
const { onObjectFinalized } = require("firebase-functions/v2/storage");

let expressApp = null;

const getApp = () => {
  if (expressApp) return expressApp;

  const admin = require("firebase-admin");
  const { PROJECT_ID } = require("./database-config");
  if (!admin.apps.length) admin.initializeApp({ projectId: PROJECT_ID });
  const { getFirestore } = require("firebase-admin/firestore");

  const express = require("express");
  const cors = require("cors");
  const multer = require("multer");
  const fs = require("fs");
  const path = require("path");
  const os = require("os");

  const app = express();
  app.use(cors({ origin: true }));
  require("./tender-radar/routes").registerTenderRadarRoutes(app, { express, admin });
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
      const db = getFirestore(admin.app());
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
      const db = getFirestore(admin.app());
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
      const db = getFirestore(admin.app());
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
