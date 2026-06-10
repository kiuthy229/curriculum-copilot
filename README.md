# Curriculum Copilot — Prototype

Minimal prototype for the Curriculum Copilot idea: upload syllabus files (PDF/DOCX) and get a small "drift" report comparing content to a sample set of emerging industry concepts.

Quick start

1. Install dependencies

```bash
cd curriculum-copilot
npm install
```

2. Run in dev mode

```bash
npm run dev
```

3. Test upload (example)

```bash
curl -F "file=@/path/to/syllabus.pdf" http://localhost:4000/upload
```

Files added

- `src/index.ts` — Express server with `/upload` endpoint
- `src/extract.ts` — simple PDF/DOCX text extractor
- `src/drift.ts` — naive drift detection using `data/frameworks.json`
- `docs/GOOGLE_DOCS_INTEGRATION.md` — guide and Apps Script snippet

Next steps

- Improve NLP topic extraction (embeddings or keyword extraction)
- Add richer industry datasets (job postings, certifications)
- Build Google Docs Add-on for live suggestions (see doc)
