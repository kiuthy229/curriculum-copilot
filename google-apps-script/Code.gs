// Google Apps Script server-side code for Curriculum Copilot reviewer
// Update `COPILOT_ENDPOINT` to your backend URL, e.g. 'https://curriculum-copilot.onrender.com/upload-from-doc'
const COPILOT_ENDPOINT = 'https://curriculum-copilot.onrender.com/upload-from-doc';

function onOpen(e) {
  // Guard `onOpen` because calling DocumentApp.getUi() from the Apps Script editor
  // (a standalone project) will throw: "Cannot call DocumentApp.getUi() from this context.".
  // This function should be triggered by opening a Google Doc that the script is bound to.
  try {
    const ui = DocumentApp.getUi();
    ui.createMenu('Curriculum Copilot')
      .addItem('Open Reviewer', 'showSidebar')
      .addToUi();
  } catch (err) {
    // Likely running in the script editor or non-container context. Log and ignore.
    console.log('onOpen: not running in a container-bound Google Doc context. Menu not created.');
  }
}

function showSidebar() {
  const html = HtmlService.createHtmlOutputFromFile('Sidebar')
    .setTitle('Curriculum Copilot');
  DocumentApp.getUi().showSidebar(html);
}

// Reads the active document body and forwards to external backend
function sendDocToCopilot() {
  const doc = DocumentApp.getActiveDocument();
  const title = doc.getName();
  const content = doc.getBody().getText();

  const payload = JSON.stringify({ title: title, content: content });

  // Read API key from Script Properties, if configured
  const key = PropertiesService.getScriptProperties().getProperty('COPILOT_KEY');

  const options = {
    method: 'post',
    contentType: 'application/json',
    payload: payload,
    muteHttpExceptions: true,
    // timeout: 30000 // optional
    headers: key ? { Authorization: 'Bearer ' + key } : {}
  };

  try {
    const resp = UrlFetchApp.fetch(COPILOT_ENDPOINT, options);
    const code = resp.getResponseCode();
    const body = resp.getContentText();
    let parsed = null;
    try { parsed = JSON.parse(body); } catch(e) { parsed = { raw: body }; }
    return { code: code, body: parsed };
  } catch (e) {
    return { code: 0, error: String(e) };
  }
}

// Apply a suggestion into the document by inserting a paragraph at cursor or end
function applySuggestion(suggestion) {
  const doc = DocumentApp.getActiveDocument();
  try {
    const cursor = doc.getCursor();
    if (cursor) {
      // Insert text at cursor position
      const element = cursor.insertText('\n' + suggestion + '\n');
      if (!element) doc.getBody().appendParagraph(suggestion);
    } else {
      doc.getBody().appendParagraph(suggestion);
    }
    return { success: true };
  } catch (e) {
    return { success: false, error: String(e) };
  }
}
