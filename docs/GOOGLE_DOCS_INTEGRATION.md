# Google Docs Integration (Prototype)

This document shows two simple integration options so the Curriculum Copilot can receive document content from Google Docs: 1) Apps Script web request (recommended for quick prototypes) and 2) Google Docs API with OAuth (more robust).

Option A — Apps Script + Webhook (quick prototype)

1. Create a new Google Apps Script project (https://script.google.com)
2. Add the following script and deploy as a web app (execute as "Me", access "Anyone within domain" or "Anyone")

Apps Script snippet (do not paste OAuth credentials here):

```javascript
function onOpen() {
  DocumentApp.getUi().createMenu('Curriculum Copilot')
    .addItem('Send to Copilot', 'sendDoc')
    .addToUi();
}

function sendDoc() {
  const doc = DocumentApp.getActiveDocument();
  const body = doc.getBody().getText();
  const url = 'https://your-server.example.com/upload-from-doc'; // your backend

  const payload = {
    title: doc.getName(),
    content: body
  };

  const options = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };

  const res = UrlFetchApp.fetch(url, options);
  Logger.log(res.getContentText());
  DocumentApp.getUi().alert('Sent to Curriculum Copilot: ' + res.getResponseCode());
}
```

3. On your server, add an endpoint that accepts JSON with `title` and `content`. Example path: `/upload-from-doc`.

Notes:
- This approach is fast to prototype live suggestions. It uses the document body — for more structure you can parse headings, lists, and tables from the Apps Script `Body` object.

Option B — Google Docs API + OAuth (production)

- Use OAuth2 to authorize a backend to read Docs content via Google Docs API. This is more complex but supports larger organizations and fine-grained scopes.

Guidance for live suggestions while editing

- For real-time / live suggestions similar to Grammarly you need an Add-on that runs periodically or responds to explicit user actions (e.g., toolbar button). Google Docs Add-ons cannot arbitrarily stream suggestions while typing due to platform limits.
- Recommended UX:
  - Toolbar button: "Analyze curriculum"
  - Sidebar: show detected drift, missing competencies, and inline suggestions. Allow user to apply suggestions to document.

Security & Privacy

- Do not send student data. Only send instructor-provided materials.
- Use HTTPS and authenticate your webhooks. Consider adding an API key or signed payload from Apps Script.

Sidebar + periodic analysis (Apps Script prototype)

Use a sidebar to provide near-live feedback by sending the document body periodically (e.g., every 10s) or when the user clicks an action.

Apps Script server code (Code.gs):

```javascript
function onOpen() {
  DocumentApp.getUi().createMenu('Curriculum Copilot')
    .addItem('Open Copilot', 'showSidebar')
    .addToUi();
}

function showSidebar() {
  const html = HtmlService.createHtmlOutputFromFile('Sidebar')
    .setTitle('Curriculum Copilot');
  DocumentApp.getUi().showSidebar(html);
}

// called from client-side sidebar; forwards content to external backend
function sendDocToCopilot(payload) {
  const url = 'https://your-server.example.com/upload-from-doc';
  const options = {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };
  const resp = UrlFetchApp.fetch(url, options);
  return {
    code: resp.getResponseCode(),
    body: resp.getContentText()
  };
}
```

Sidebar HTML (Sidebar.html):

```html
<!doctype html>
<html>
  <head>
    <base target="_top">
    <style>body{font-family: Roboto, Arial; padding:8px;}</style>
  </head>
  <body>
    <h3>Curriculum Copilot</h3>
    <div id="status">Ready</div>
    <button id="analyze">Analyze now</button>
    <div style="margin-top:8px; font-size:13px; color:#444;">Auto-analyze every <select id="interval"><option value="0">off</option><option value="10">10s</option><option value="30">30s</option></select></div>
    <hr>
    <div id="results"></div>

    <script>
      const statusEl = document.getElementById('status');
      const resultsEl = document.getElementById('results');
      let timer = null;

      function send() {
        statusEl.textContent = 'Sending...';
        google.script.run.withSuccessHandler(showResp).withFailureHandler(err=>{statusEl.textContent='Error'; console.error(err)}).sendDocToCopilot(getPayload());
      }

      function getPayload(){
        const content = DocumentApp ? DocumentApp.getActiveDocument().getBody().getText() : '';
        // If calling DocumentApp from client is not allowed, server-side sendDocToCopilot can read via DocumentApp.
        return { title: '', content: content };
      }

      function showResp(r){
        try{
          const parsed = typeof r.body === 'string' ? JSON.parse(r.body) : r.body;
          resultsEl.innerHTML = `<pre>${JSON.stringify(parsed, null, 2)}</pre>`;
          statusEl.textContent = 'Last updated: ' + new Date().toLocaleTimeString();
        }catch(e){
          resultsEl.textContent = r.body || JSON.stringify(r);
          statusEl.textContent = 'Updated';
        }
      }

      document.getElementById('analyze').addEventListener('click', send);
      document.getElementById('interval').addEventListener('change', (e)=>{
        if(timer) clearInterval(timer);
        const v = Number(e.target.value);
        if(v>0) timer = setInterval(send, v*1000);
      });
    </script>
  </body>
</html>
```

Notes on the sidebar snippet:
- The `getPayload` function above demonstrates intent; in Apps Script the client-side cannot call `DocumentApp` directly, so either:
  - Move document read to a server-side Apps Script function (e.g., `sendDocToCopilot` reads `DocumentApp.getActiveDocument().getBody().getText()` before forwarding), or
  - Have the sidebar call a server-side Apps Script function that reads the document and forwards it.
- Use the server-side forwarding approach to avoid CORS and to let Apps Script hold any API keys.

