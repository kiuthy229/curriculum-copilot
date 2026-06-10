import fs from "fs";
import pdf from "pdf-parse";
import mammoth from "mammoth";

export async function extractTextFromFile(path: string, mime?: string): Promise<string> {
  const buf = await fs.promises.readFile(path);
  if (mime === "application/pdf" || path.toLowerCase().endsWith(".pdf")) {
    const data = await pdf(buf);
    return data.text || "";
  }

  if (
    mime === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    path.toLowerCase().endsWith(".docx")
  ) {
    const result = await mammoth.extractRawText({ buffer: buf });
    return result.value || "";
  }

  // fallback: try to treat as utf-8 text
  return buf.toString("utf8");
}
