/**
 * POST /api/tts
 * Body: { text: string, lang: 'mr-IN' | 'hi-IN' | 'en-IN' }
 * Returns: audio/wav
 *
 * Uses Gemini 2.5 Flash TTS (gemini-2.5-flash-preview-tts) on the server.
 * The API key is never exposed to the browser.
 * Responses are cached in-memory keyed by (lang, text) to avoid duplicate API calls.
 */

const express = require('express');
const router = express.Router();

// ── In-memory audio cache ────────────────────────────────────────────────────
// Map<string, Buffer>  key = `${lang}::${text}`
const audioCache = new Map();
const CACHE_MAX = 200; // evict oldest when over limit

// ── Constants ────────────────────────────────────────────────────────────────
const GEMINI_TTS_MODEL = 'gemini-2.5-flash-preview-tts';
const MAX_TEXT_LENGTH  = 1500; // chars – hard cap per request

// Calm, natural female voice that works well for South-Asian languages.
// "Kore" is a warm, calm prebuilt voice in the Gemini voice library.
const VOICE_NAME = 'Kore';

// ── WAV builder (raw PCM → WAV) ───────────────────────────────────────────────
// Gemini TTS returns raw LINEAR16 (16-bit little-endian) PCM at 24000 Hz mono.
function buildWav(pcmBuffer, sampleRate = 24000, numChannels = 1, bitsPerSample = 16) {
  const byteRate     = sampleRate * numChannels * (bitsPerSample / 8);
  const blockAlign   = numChannels * (bitsPerSample / 8);
  const dataSize     = pcmBuffer.length;
  const header       = Buffer.alloc(44);

  header.write('RIFF',         0, 'ascii');
  header.writeUInt32LE(36 + dataSize, 4);
  header.write('WAVE',         8, 'ascii');
  header.write('fmt ',        12, 'ascii');
  header.writeUInt32LE(16,    16);          // PCM subchunk size
  header.writeUInt16LE(1,     20);          // AudioFormat = PCM
  header.writeUInt16LE(numChannels,  22);
  header.writeUInt32LE(sampleRate,   24);
  header.writeUInt32LE(byteRate,     28);
  header.writeUInt16LE(blockAlign,   32);
  header.writeUInt16LE(bitsPerSample, 34);
  header.write('data',        36, 'ascii');
  header.writeUInt32LE(dataSize, 40);

  return Buffer.concat([header, pcmBuffer]);
}

// ── Route ─────────────────────────────────────────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const { text, lang = 'mr-IN' } = req.body;

    if (!text || typeof text !== 'string' || !text.trim()) {
      return res.status(400).json({ error: 'text is required' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(503).json({ error: 'TTS service not configured (missing GEMINI_API_KEY)' });
    }

    // Truncate if over limit
    const safeText = text.trim().slice(0, MAX_TEXT_LENGTH);

    // Supported languages
    const supported = ['mr-IN', 'hi-IN', 'en-IN'];
    const safeLang  = supported.includes(lang) ? lang : 'mr-IN';

    const cacheKey = `${safeLang}::${safeText}`;

    // Return cached WAV if available
    if (audioCache.has(cacheKey)) {
      const cached = audioCache.get(cacheKey);
      res.set('Content-Type', 'audio/wav');
      res.set('Content-Length', cached.length);
      res.set('Cache-Control', 'private, max-age=3600');
      return res.send(cached);
    }

    // Build the prompt that instructs pacing
    const pacingPrompt =
      `Speak in a calm, slightly slow, clear and caring voice. ` +
      `Language: ${safeLang}. ` +
      safeText;

    // Call Gemini TTS REST API
    const geminiUrl =
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_TTS_MODEL}:generateContent` +
      `?key=${apiKey}`;

    const geminiPayload = {
      contents: [
        {
          parts: [{ text: pacingPrompt }]
        }
      ],
      generationConfig: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName: VOICE_NAME
            }
          }
        }
      }
    };

    const geminiResponse = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(geminiPayload)
    });

    if (!geminiResponse.ok) {
      const errText = await geminiResponse.text();
      console.error('[TTS] Gemini API error:', geminiResponse.status, errText);
      return res.status(502).json({
        error: `Gemini TTS error: ${geminiResponse.status}`,
        details: errText.slice(0, 400)
      });
    }

    const geminiData = await geminiResponse.json();

    // Extract base64-encoded inline audio data
    const audioPart = geminiData?.candidates?.[0]?.content?.parts?.find(
      (p) => p.inlineData?.mimeType?.startsWith('audio/')
    );

    if (!audioPart?.inlineData?.data) {
      console.error('[TTS] No audio in Gemini response:', JSON.stringify(geminiData).slice(0, 500));
      return res.status(502).json({ error: 'No audio returned by Gemini TTS' });
    }

    // Decode base64 PCM → WAV
    const pcmBuffer = Buffer.from(audioPart.inlineData.data, 'base64');
    const wavBuffer  = buildWav(pcmBuffer);

    // Cache (evict oldest if over limit)
    if (audioCache.size >= CACHE_MAX) {
      const firstKey = audioCache.keys().next().value;
      audioCache.delete(firstKey);
    }
    audioCache.set(cacheKey, wavBuffer);

    res.set('Content-Type', 'audio/wav');
    res.set('Content-Length', wavBuffer.length);
    res.set('Cache-Control', 'private, max-age=3600');
    return res.send(wavBuffer);

  } catch (err) {
    console.error('[TTS] Unexpected error:', err);
    return res.status(500).json({ error: 'Internal TTS error', details: err.message });
  }
});

module.exports = router;
