// server.js
import express from 'express';
import pkg from 'youtube-transcript';
const { getTranscript } = pkg;

const app = express();
app.use(express.json());

// Root endpoint (optional; shows it’s running)
app.get('/', (_req, res) => {
  res.send('YouTube Transcript MCP Server is running.');
});

// Serve the plugin manifest
app.get('/.well-known/ai-plugin.json', (req, res) => {
  res.sendFile(__dirname + '/.well-known/ai-plugin.json');
});

// Serve the OpenAPI spec
app.get('/openapi.yaml', (req, res) => {
  res.sendFile(__dirname + '/openapi.yaml');
});

// The actual transcript endpoint
app.post('/get_transcript', async (req, res) => {
  const { url, lang } = req.body;
  try {
    // Fetch the transcript array (each item has .text)
    const transcriptArray = await getTranscript(url, {
      lang: lang || 'en',
      timeout: 30000
    });
    // Concatenate all text segments
    const text = transcriptArray.map((seg) => seg.text).join(' ');
    res.json({ transcript: text });
  } catch (err) {
    console.error('Error fetching transcript:', err);
    res.status(500).json({ error: 'Failed to fetch transcript' });
  }
});

// Bind to the assigned port or fallback to 10000
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`YouTube Transcript server listening on port ${PORT}`);
});
