// server.js
import express from 'express';
import path from 'path';
import pkg from 'youtube-transcript';
const { getTranscript } = pkg;

const app = express();
app.use(express.json());

// ---------------------------------------------------
// 1) Serve any file in the .well-known folder
// ---------------------------------------------------
// This makes "GET /.well-known/ai-plugin.json" simply return that file.
app.use(
  '/.well-known',
  express.static(path.join(process.cwd(), '.well-known'))
);

// ---------------------------------------------------
// 2) Serve openapi.yaml from the repo root
// ---------------------------------------------------
// This makes "GET /openapi.yaml" simply return "openapi.yaml" in project root.
app.use(
  '/',
  express.static(path.join(process.cwd()), {
    extensions: ['yaml'],        // so /openapi.yaml works
    index: false,                // don’t try /index.html
    setHeaders: (res, filePath) => {
      // Ensure correct content-type for YAML
      if (filePath.endsWith('.yaml')) {
        res.type('yaml');
      }
    }
  })
);

// ---------------------------------------------------
// 3) Health Check (optional)
// ---------------------------------------------------
app.get('/', (_req, res) => {
  res.send('YouTube Transcript MCP Server is up.');
});

// ---------------------------------------------------
// 4) The transmit-transcript endpoint
// ---------------------------------------------------
app.post('/get_transcript', async (req, res) => {
  const { url, lang } = req.body;
  try {
    const transcriptArray = await getTranscript(url, {
      lang: lang || 'en',
      timeout: 30000
    });
    const text = transcriptArray.map((seg) => seg.text).join(' ');
    res.json({ transcript: text });
  } catch (err) {
    console.error('Error fetching transcript:', err);
    res.status(500).json({ error: 'Failed to fetch transcript' });
  }
});

// ---------------------------------------------------
// 5) Start the server on the environment’s port
// ---------------------------------------------------
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`YouTube Transcript server listening on port ${PORT}`);
});
