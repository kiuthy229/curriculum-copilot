import express from "express";
import cors from "cors";
import multer from "multer";
import path from "path";
import { extractTextFromFile } from "./extract";
import { detectDrift } from "./drift";

const upload = multer({ dest: "./uploads" });
const app = express();
app.use(cors());
app.use(express.json());

app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "file required" });
    const filePath = path.resolve(req.file.path);
    const text = await extractTextFromFile(filePath, req.file.mimetype);
    const report = detectDrift(text);
    return res.json({ report, snippet: text.slice(0, 300) });
  } catch (e: any) {
    console.error(e);
    return res.status(500).json({ error: e.message || String(e) });
  }
});

// Accept JSON payload from Google Apps Script (title + content)
app.post("/upload-from-doc", async (req, res) => {
  try {
    const { title, content } = req.body as { title?: string; content?: string };
    if (!content) return res.status(400).json({ error: "content required" });
    const report = detectDrift(content);
    return res.json({ title: title || null, report, snippet: content.slice(0, 300) });
  } catch (e: any) {
    console.error(e);
    return res.status(500).json({ error: e.message || String(e) });
  }
});

app.get("/health", (req, res) => res.json({ ok: true }));

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Curriculum Copilot prototype listening on http://localhost:${port}`);
});
