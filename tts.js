// Cloud Text-to-Speech for car mode
// Uses Google Cloud TTS API → plays via <audio> elements → routes through CarPlay/Bluetooth media channel
// To enable: go to Google Cloud Console for your project and enable "Cloud Text-to-Speech API"
// Falls back to browser speechSynthesis automatically if API is unavailable
// To revert: remove tts.js script tag from index.html — everything falls back to browser TTS

(function() {
    'use strict';

    const VOICE = 'en-GB-Neural2-C';
    const LANG = 'en-GB';
    const DB_NAME = 'spelling-tts';
    const DB_VER = 1;
    const STORE = 'audio';

    let db = null;
    let enabled = true;
    let currentAudio = null;
    let preCached = false;

    // ---- IndexedDB Cache ----
    function openDB() {
        return new Promise(resolve => {
            try {
                const req = indexedDB.open(DB_NAME, DB_VER);
                req.onupgradeneeded = e => {
                    const d = e.target.result;
                    if (!d.objectStoreNames.contains(STORE)) d.createObjectStore(STORE);
                };
                req.onsuccess = e => { db = e.target.result; resolve(); };
                req.onerror = () => resolve();
            } catch(e) { resolve(); }
        });
    }

    function getCache(key) {
        return new Promise(resolve => {
            if (!db) return resolve(null);
            try {
                const tx = db.transaction(STORE, 'readonly');
                const req = tx.objectStore(STORE).get(key);
                req.onsuccess = () => resolve(req.result || null);
                req.onerror = () => resolve(null);
            } catch(e) { resolve(null); }
        });
    }

    function setCache(key, val) {
        if (!db) return;
        try {
            const tx = db.transaction(STORE, 'readwrite');
            tx.objectStore(STORE).put(val, key);
        } catch(e) {}
    }

    // ---- Google Cloud TTS API ----
    async function fetchAudio(text) {
        if (!enabled) return null;
        const apiKey = (typeof firebaseConfig !== 'undefined') ? firebaseConfig.apiKey : null;
        if (!apiKey) { enabled = false; return null; }

        const key = VOICE + ':' + text;
        const cached = await getCache(key);
        if (cached) return cached;

        try {
            const resp = await fetch(
                'https://texttospeech.googleapis.com/v1/text:synthesize?key=' + encodeURIComponent(apiKey),
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        input: { text },
                        voice: { languageCode: LANG, name: VOICE },
                        audioConfig: { audioEncoding: 'MP3' }
                    })
                }
            );
            if (!resp.ok) {
                if (resp.status === 403 || resp.status === 401 || resp.status === 400) {
                    console.warn('Cloud TTS: API not enabled or key invalid. Using browser TTS.');
                    enabled = false;
                }
                return null;
            }
            const data = await resp.json();
            if (data.audioContent) {
                setCache(key, data.audioContent);
                return data.audioContent;
            }
            return null;
        } catch(e) {
            return null;
        }
    }

    // ---- Playback ----
    function play(base64, onDone) {
        stop();
        const audio = new Audio('data:audio/mp3;base64,' + base64);
        currentAudio = audio;
        let called = false;
        function done() {
            if (called) return; called = true;
            if (currentAudio === audio) currentAudio = null;
            if (onDone) onDone();
        }
        audio.onended = done;
        audio.onerror = done;
        audio.play().catch(done);
    }

    function stop() {
        if (currentAudio) {
            currentAudio.onended = null;
            currentAudio.onerror = null;
            try { currentAudio.pause(); } catch(e) {}
            currentAudio = null;
        }
    }

    // ---- Pre-cache letters & common phrases ----
    function preCache() {
        if (preCached || !enabled) return;
        preCached = true;
        const items = 'A B C D E F G H I J K L M N O P Q R S T U V W X Y Z'.split(' ');
        items.push('Correct!', 'Cleared.', "Let's go!", "OK, let's start for real!");
        let i = 0;
        function next() {
            if (i >= items.length || !enabled) return;
            fetchAudio(items[i++]).then(() => setTimeout(next, 30));
        }
        next(); next(); next();
    }

    // ---- Public API ----
    window.cloudTTS = {
        enabled: () => enabled,
        stop: stop,

        speak: async function(text, onDone) {
            if (!preCached) preCache();
            const b64 = await fetchAudio(text);
            if (b64) { play(b64, onDone); return true; }
            return false;
        },

        speakLetter: async function(letter, onDone) {
            return this.speak(letter.toUpperCase(), onDone);
        },

        init: async function() {
            await openDB();
        }
    };

    // Auto-init: open IndexedDB on load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => cloudTTS.init());
    } else {
        cloudTTS.init();
    }
})();
