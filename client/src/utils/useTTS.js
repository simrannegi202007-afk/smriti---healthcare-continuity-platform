/**
 * useTTS – React hook for Gemini server-side Text-to-Speech.
 *
 * Features:
 *  - Calls /api/tts (server keeps the API key hidden from the browser)
 *  - Caches generated audio in a module-level Map so repeated clicks are instant
 *  - Shows a loading state while audio is being generated
 *  - Provides a stop() function and an isSpeaking flag
 *  - Falls back to browser speechSynthesis if /api/tts fails
 *  - Sets fallbackUsed=true so callers can show a note to the user
 */

import { useState, useRef, useCallback, useEffect } from 'react';

// Module-level audio cache: Map<`${lang}::${text}`, string (objectURL)>
// ObjectURLs survive component unmounts; we revoke them when the map is pruned.
const _audioCache = new Map();
const CACHE_MAX = 150;

function getCacheKey(text, lang) {
  return `${lang}::${text.trim().slice(0, 1500)}`;
}

function cacheSet(key, url) {
  if (_audioCache.size >= CACHE_MAX) {
    // Evict oldest entry
    const oldest = _audioCache.keys().next().value;
    const oldUrl = _audioCache.get(oldest);
    try { URL.revokeObjectURL(oldUrl); } catch (_) {}
    _audioCache.delete(oldest);
  }
  _audioCache.set(key, url);
}

export function useTTS() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading]   = useState(false);
  const [fallbackUsed, setFallbackUsed] = useState(false);

  const audioRef    = useRef(null);   // current Audio element
  const abortRef    = useRef(null);   // AbortController for in-flight requests

  // Stop any playing audio
  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsLoading(false);
  }, []);

  // Cleanup on hook unmount
  useEffect(() => () => stop(), [stop]);

  /**
   * speak(text, lang)
   * lang: 'mr-IN' | 'hi-IN' | 'en-IN'
   */
  const speak = useCallback(async (text, lang = 'mr-IN') => {
    if (!text || !text.trim()) return;

    // If already speaking same text, stop it (toggle)
    if (isSpeaking || isLoading) {
      stop();
      return;
    }

    setFallbackUsed(false);

    const safeText = text.trim().slice(0, 1500);
    const key = getCacheKey(safeText, lang);

    // ── Try cached object URL first ──────────────────────────────────────────
    if (_audioCache.has(key)) {
      const cachedUrl = _audioCache.get(key);
      _playUrl(cachedUrl);
      return;
    }

    // ── Call /api/tts ─────────────────────────────────────────────────────────
    setIsLoading(true);
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const resp = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: safeText, lang }),
        signal: controller.signal
      });

      if (!resp.ok) throw new Error(`TTS API ${resp.status}`);

      const blob    = await resp.blob();
      const url     = URL.createObjectURL(blob);
      cacheSet(key, url);
      setIsLoading(false);
      _playUrl(url);

    } catch (err) {
      setIsLoading(false);
      if (err.name === 'AbortError') return;

      // ── Fallback: browser speechSynthesis ────────────────────────────────
      console.warn('[TTS] Server TTS failed, falling back to browser:', err.message);
      setFallbackUsed(true);
      _browserFallback(safeText, lang);
    }

    function _playUrl(url) {
      stop();
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onplay  = () => setIsSpeaking(true);
      audio.onended = () => { setIsSpeaking(false); audioRef.current = null; };
      audio.onerror = () => { setIsSpeaking(false); audioRef.current = null; };
      audio.play().catch((e) => {
        console.warn('[TTS] Audio play error:', e);
        setIsSpeaking(false);
      });
    }

    function _browserFallback(text, lang) {
      if (!window.speechSynthesis) return;
      window.speechSynthesis.cancel();

      // Try mr-IN first if Marathi, else use the requested lang, then en-IN
      const langOrder = lang === 'mr-IN'
        ? ['mr-IN', 'hi-IN', 'en-IN']
        : lang === 'hi-IN'
        ? ['hi-IN', 'en-IN']
        : ['en-IN'];

      const voices = window.speechSynthesis.getVoices();
      let chosenVoice = null;
      for (const l of langOrder) {
        chosenVoice = voices.find((v) => v.lang === l || v.lang.startsWith(l.split('-')[0]));
        if (chosenVoice) break;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      if (chosenVoice) utterance.voice = chosenVoice;
      utterance.rate = 0.88;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend   = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  }, [isSpeaking, isLoading, stop]);

  return { speak, stop, isSpeaking, isLoading, fallbackUsed };
}
