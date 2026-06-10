import React, { useState } from 'react'

function App() {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  async function upload() {
    if (!file) return setError('Please choose a file')
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('https://curriculum-copilot.onrender.com/upload', {
        method: 'POST',
        body: fd
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Upload failed')
      setResult(data)
    } catch (e: any) {
      setError(e.message || String(e))
    } finally {
      setLoading(false)
    }
  }

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files && e.target.files[0]
    if (f) setFile(f)
  }

  return (
    <div className="container">
      <h1>Curriculum Copilot — Upload</h1>
      <div className="card">
        <input type="file" onChange={onFile} />
        <div style={{ marginTop: 8 }}>
          <button onClick={upload} disabled={loading}> {loading ? 'Uploading…' : 'Upload'}</button>
        </div>
        {error && <div className="error">{error}</div>}
      </div>

      {result && (
        <div className="card">
          <h3>Review</h3>
          <div style={{ marginBottom: 12 }}><strong>Freshness:</strong> {result.report?.freshness ?? '—'}%</div>

          {result.report?.present?.length ? (
            <div style={{ marginBottom: 8 }}>
              <strong>Detected topics:</strong>
              <ul>
                {result.report.present.map((p: string) => <li key={p}>{p}</li>)}
              </ul>
            </div>
          ) : null}

          {result.report?.missingEmerging?.length ? (
            <div style={{ marginBottom: 8 }}>
              <strong>Missing emerging topics (recommendations):</strong>
              <ul>
                {result.report.suggestions.map((s: any) => (
                  <li key={s.topic}>
                    <div><strong>{s.topic}</strong></div>
                    <div style={{ marginLeft: 8 }}>{s.suggestion}</div>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div style={{ marginBottom: 8 }}><em>No missing emerging topics detected.</em></div>
          )}

          {result.snippet ? (
            <div style={{ marginTop: 8 }}>
              <strong>Document snippet:</strong>
              <pre className="result">{result.snippet}</pre>
            </div>
          ) : null}

          {result.report?.textReport && (
            <div style={{ marginTop: 12 }}>
              <strong>Summary</strong>
              <div style={{ whiteSpace: 'pre-wrap', marginTop: 8 }}>{result.report.textReport}</div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default App
