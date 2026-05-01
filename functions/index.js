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

  const checkAI = () => {
    const { GoogleGenAI } = require("@google/genai");
    let key = process.env.CUSTOM_API_KEY || process.env.GEMINI_API_KEY;
    if (!key) throw new Error("Missing GEMINI_API_KEY");
    key = key.trim();
    if (key.startsWith('"') && key.endsWith('"')) key = key.slice(1, -1);
    if (key.startsWith("'") && key.endsWith("'")) key = key.slice(1, -1);
    return new GoogleGenAI({ apiKey: key });
  };

  const getUploadDir = () => {
    const dir = path.join(os.tmpdir(), "uploads");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    return dir;
  };

  const getStdsFilePath = () => {
    const filepath = path.join(os.tmpdir(), "stds.json");
    if (!fs.existsSync(filepath)) fs.writeFileSync(filepath, JSON.stringify([]));
    return filepath;
  };

  const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, getUploadDir()),
    filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
  });
  const upload = multer({ storage });

  app.get("/api/stds", (req, res) => {
    res.json(JSON.parse(fs.readFileSync(getStdsFilePath(), "utf8")));
  });

  app.post("/api/stds/upload", upload.single("file"), (req, res) => {
    const { category, method, valueMin, valueMax, title } = req.body;
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    const stdsFilePath = getStdsFilePath();
    const stds = JSON.parse(fs.readFileSync(stdsFilePath, "utf8"));
    const newStd = {
      id: Date.now().toString(),
      title: title || req.file.originalname,
      filename: req.file.filename,
      category,
      method,
      valueMin: Number(valueMin),
      valueMax: Number(valueMax),
      uploadedAt: new Date().toISOString(),
    };
    stds.push(newStd);
    fs.writeFileSync(stdsFilePath, JSON.stringify(stds, null, 2));
    res.json(newStd);
  });

  app.delete("/api/stds/:id", (req, res) => {
    const { id } = req.params;
    const stdsFilePath = getStdsFilePath();
    let stds = JSON.parse(fs.readFileSync(stdsFilePath, "utf8"));
    const stdToDelete = stds.find((s) => s.id === id);
    if (stdToDelete) {
      const filePath = path.join(getUploadDir(), stdToDelete.filename);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      stds = stds.filter((s) => s.id !== id);
      fs.writeFileSync(stdsFilePath, JSON.stringify(stds, null, 2));
      res.json({ success: true });
    } else {
      res.status(404).json({ error: "STD not found" });
    }
  });

  app.post("/api/ai/extract", async (req, res) => {
    try {
      const ai = checkAI();
      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: req.body.contents,
        config: { responseMimeType: "application/json" },
      });
      res.json({ text: response.text, tokensUsed: response.usageMetadata?.totalTokenCount || 0 });
    } catch (e) {
      res.status(500).json({ error: e.message || "Extraction failed" });
    }
  });

  app.post("/api/ai/analyze", async (req, res) => {
    try {
      const ai = checkAI();
      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
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
        model: "gemini-3.1-pro-preview",
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
        model: "gemini-3.1-pro-preview",
        contents: req.body.prompt,
        config: { responseMimeType: "application/json" },
      });
      res.json({ text: response.text, tokensUsed: response.usageMetadata?.totalTokenCount || 0 });
    } catch (e) {
      res.status(500).json({ error: e.message || "Foreign insights failed" });
    }
  });

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

  app.post("/api/pdf/extract", upload.single("pdf"), async (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ error: "No PDF file uploaded" });
      const pdfParse = require("pdf-parse/lib/pdf-parse");
      const dataBuffer = fs.readFileSync(req.file.path);
      const data = await pdfParse(dataBuffer);
      fs.unlinkSync(req.file.path);
      res.json({ success: true, text: data.text });
    } catch (error) {
      res.status(500).json({ error: error.message || "Failed to extract PDF" });
    }
  });

  expressApp = app;
  return app;
};

exports.api = onRequest(
  { timeoutSeconds: 300, memory: "1GiB", region: "asia-south1" },
  (req, res) => getApp()(req, res)
);

exports.onPdfUploaded = onObjectFinalized(
  { timeoutSeconds: 300, memory: "1GiB", region: "asia-south1", bucket: "gen-lang-client-0089421810.firebasestorage.app" },
  async (event) => {
    const object = event.data;
    const admin = require("firebase-admin");
    if (!admin.apps.length) admin.initializeApp();
    const { getStorage } = require("firebase-admin/storage");
    const pdfParse = require("pdf-parse/lib/pdf-parse");
    const fs = require("fs"), path = require("path"), os = require("os");
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
