# Curriculum Copilot — UI

Run the UI (Vite + React):

```bash
cd curriculum-copilot/ui
npm install
npm run dev
```

Open `http://localhost:5173` and choose a PDF/DOCX file to upload. The UI posts to `http://localhost:4000/upload`.

Notes:
- Backend must be running and allow CORS (the prototype server includes `cors()` already).
- Adjust the upload URL in `src/App.tsx` if the backend is hosted elsewhere.

Server deployed at https://curriculum-copilot.onrender.com
