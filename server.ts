import "dotenv/config";
import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs";
import multer from "multer";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));

  let initialKey = process.env.CUSTOM_API_KEY || process.env.GEMINI_API_KEY || "";
  initialKey = initialKey.trim();
  if (initialKey.startsWith('"') && initialKey.endsWith('"')) initialKey = initialKey.slice(1, -1);
  if (initialKey.startsWith("'") && initialKey.endsWith("'")) initialKey = initialKey.slice(1, -1);

  console.log("GEMINI_API_KEY present:", !!initialKey, "Length:", initialKey.length);

  const ai = new GoogleGenAI({ apiKey: initialKey || "dummy" });

  // Setup storage for STDs
  const uploadDir = path.join(process.cwd(), "uploads");
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
  }

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + "-" + file.originalname);
    },
  });

  const upload = multer({ storage });

  const stdsFilePath = path.join(process.cwd(), "stds.json");
  if (!fs.existsSync(stdsFilePath)) {
    fs.writeFileSync(stdsFilePath, JSON.stringify([]));
  }

  // API Routes
  app.get("/api/stds", (req, res) => {
    const stds = JSON.parse(fs.readFileSync(stdsFilePath, "utf8"));
    res.json(stds);
  });

  app.post("/api/stds/upload", upload.single("file"), (req, res) => {
    const { category, method, valueMin, valueMax, title } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const stds = JSON.parse(fs.readFileSync(stdsFilePath, "utf8"));
    const newStd = {
      id: Date.now().toString(),
      title: title || file.originalname,
      filename: file.filename,
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
    let stds = JSON.parse(fs.readFileSync(stdsFilePath, "utf8"));
    const stdToDelete = stds.find((s: any) => s.id === id);
    
    if (stdToDelete) {
      const filePath = path.join(uploadDir, stdToDelete.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      stds = stds.filter((s: any) => s.id !== id);
      fs.writeFileSync(stdsFilePath, JSON.stringify(stds, null, 2));
      res.json({ success: true });
    } else {
      res.status(404).json({ error: "STD not found" });
    }
  });

  // Helper to ensure API key is available
  const checkAI = () => {
    let key = process.env.CUSTOM_API_KEY || process.env.GEMINI_API_KEY;
    if (!key) throw new Error("Server missing GEMINI_API_KEY or CUSTOM_API_KEY environment variable.");
    key = key.trim();
    if (key.startsWith('"') && key.endsWith('"')) key = key.slice(1, -1);
    if (key.startsWith("'") && key.endsWith("'")) key = key.slice(1, -1);
    
    return new GoogleGenAI({ apiKey: key });
  };

  app.post("/api/ai/extract", async (req, res) => {
    try {
      const ai = checkAI();
      const { contents } = req.body;
      const response = await ai.models.generateContent({
        model: "gemini-flash-latest",
        contents,
        config: { responseMimeType: "application/json" }
      });
      res.json({ text: response.text, tokensUsed: response.usageMetadata?.totalTokenCount || 0 });
    } catch (e: any) {
      let key = process.env.CUSTOM_API_KEY || process.env.GEMINI_API_KEY || "";
      const maskedKey = key ? `${key.substring(0, 5)}...${key.substring(key.length - 4)} (Length: ${key.length})` : "NO KEY";
      console.error("API call failed! Error:", e.message);
      console.error("Key attempted:", maskedKey);
      res.status(500).json({ error: e.message || "Extraction failed" });
    }
  });

  app.post("/api/ai/analyze", async (req, res) => {
    try {
      const ai = checkAI();
      const { prompt } = req.body;
      const response = await ai.models.generateContent({
        model: "gemini-flash-latest",
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });
      res.json({ text: response.text, tokensUsed: response.usageMetadata?.totalTokenCount || 0 });
    } catch (e: any) {
      let key = process.env.CUSTOM_API_KEY || process.env.GEMINI_API_KEY || "";
      const maskedKey = key ? `${key.substring(0, 5)}...${key.substring(key.length - 4)} (Length: ${key.length})` : "NO KEY";
      console.error("API Analyze failed! Error:", e.message);
      console.error("Key attempted:", maskedKey);
      res.status(500).json({ error: e.message || "Analysis failed" });
    }
  });

  app.post("/api/ai/qa", async (req, res) => {
    try {
      const ai = checkAI();
      const { contents, systemInstruction } = req.body;
      const response = await ai.models.generateContent({
        model: "gemini-flash-latest",
        contents,
        config: { systemInstruction }
      });
      res.json({ text: response.text, tokensUsed: response.usageMetadata?.totalTokenCount || 0 });
    } catch (e: any) {
      let key = process.env.CUSTOM_API_KEY || process.env.GEMINI_API_KEY || "";
      const maskedKey = key ? `${key.substring(0, 5)}...${key.substring(key.length - 4)} (Length: ${key.length})` : "NO KEY";
      console.error("API QA failed! Error:", e.message);
      console.error("Key attempted:", maskedKey);
      res.status(500).json({ error: e.message || "QA failed" });
    }
  });

  app.post("/api/ai/foreign", async (req, res) => {
    try {
      const ai = checkAI();
      const { prompt } = req.body;
      const response = await ai.models.generateContent({
        model: "gemini-flash-latest",
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });
      res.json({ text: response.text, tokensUsed: response.usageMetadata?.totalTokenCount || 0 });
    } catch (e: any) {
      let key = process.env.CUSTOM_API_KEY || process.env.GEMINI_API_KEY || "";
      const maskedKey = key ? `${key.substring(0, 5)}...${key.substring(key.length - 4)} (Length: ${key.length})` : "NO KEY";
      console.error("API Foreign failed! Error:", e.message);
      console.error("Key attempted:", maskedKey);
      res.status(500).json({ error: e.message || "Foreign insights failed" });
    }
  });

  app.post("/api/support/send", async (req, res) => {
    try {
      const { userEmail, userName, subject, message } = req.body;

      if (!subject || !message) {
        return res.status(400).json({ error: "Subject and message are required" });
      }

      // Read from environment variables (fallback logic if missing)
      const host = process.env.SMTP_HOST;
      const user = process.env.SMTP_USER;
      const pass = process.env.SMTP_PASS;

      if (!host || !user || !pass) {
        // If not configured, just return success so the frontend doesn't break,
        // but log to console that email wasn't sent.
        console.warn("SMTP credentials not configured. Email not sent.");
        return res.json({ success: true, warning: "SMTP not configured" });
      }

      // dynamic import for nodemailer to avoid issues if not strictly needed
      const nodemailer = await import("nodemailer");

      const transporter = nodemailer.createTransport({
        host: host,
        port: Number(process.env.SMTP_PORT) || 465,
        secure: Number(process.env.SMTP_PORT) === 465 || !process.env.SMTP_PORT, // true for 465, false for other ports
        auth: {
          user: user,
          pass: pass,
        },
      });

      const mailOptions = {
        from: `"${userName || 'User'} via eGPTenderHub" <${user}>`,
        to: user, // Send to the support inbox itself
        replyTo: userEmail,
        subject: `[Support Ticket] ${subject}`,
        text: `From: ${userName || 'Unknown'} (${userEmail || 'No email'})\n\nSubject: ${subject}\n\nMessage:\n${message}`,
        html: `
          <div style="font-family: sans-serif; color: #333;">
            <h2>New Support Ticket</h2>
            <p><strong>From:</strong> ${userName || 'Unknown'} (${userEmail || 'No email'})</p>
            <p><strong>Subject:</strong> ${subject}</p>
            <hr />
            <p style="white-space: pre-wrap;">${message}</p>
          </div>
        `,
      };

      await transporter.sendMail(mailOptions);
      res.json({ success: true });
    } catch (error: any) {
      console.error("Error sending email:", error);
      res.status(500).json({ error: error.message || "Failed to send email" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
