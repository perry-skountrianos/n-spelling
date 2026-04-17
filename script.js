// The words list is loaded from words.js
const allWords = [...words]; // keep a copy of the full list
const defaultWords = [...words]; // immutable copy of the original Red Card Words

// Twemoji: render emoji as consistent images across platforms
function emojiToImg(emoji, size) {
    const cp = [...emoji].map(c => c.codePointAt(0).toString(16)).join('-');
    const px = size || 48;
    return `<img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/${cp}.svg" alt="${emoji}" width="${px}" height="${px}" style="display:block;" draggable="false">`;
}

// Profile management
let currentProfile = localStorage.getItem('currentProfile') || '';
let activeListName = 'Red Card Words';

function getProfileName() {
    return currentProfile.charAt(0).toUpperCase() + currentProfile.slice(1);
}

function profileKey(key) {
    return currentProfile + '_' + key;
}

function profileRef(path) {
    return path + '/' + currentProfile;
}

function updateProfileIndicator(profileId) {
    const avatarLabel = document.getElementById('profileAvatar');
    if (typeof db !== 'undefined') {
        db.ref('profiles/' + profileId).once('value').then(snap => {
            const p = snap.val();
            if (p && p.avatar) avatarLabel.innerHTML = emojiToImg(p.avatar, 36);
        });
    }
}

function updateListFooter() {
    const footer = document.getElementById('listFooter');
    if (footer) footer.innerHTML = activeListName ? '<span style="color:#ccc">Practicing:</span> ' + activeListName : '';
}

document.getElementById('profileIndicator').addEventListener('click', () => {
    showProfileScreen();
});

function loadProfileList() {
    const profileScreen = document.getElementById('profileScreen');
    const profileList = document.getElementById('profileList');
    profileList.innerHTML = '';

    if (typeof db !== 'undefined') {
        db.ref('profiles').once('value').then(snapshot => {
            const profiles = snapshot.val() || {};
            // Always include 'niko' as default
            if (!profiles['niko']) {
                profiles['niko'] = { name: 'Niko', avatar: '🦁' };
                db.ref('profiles/niko').set(profiles['niko']);
            }
            renderProfiles(profiles);
        }).catch(() => {
            renderProfiles({ niko: { name: 'Niko', avatar: '🦁' } });
        });
    } else {
        renderProfiles({ niko: { name: 'Niko', avatar: '🦁' } });
    }
}

function renderProfiles(profiles) {
    const profileList = document.getElementById('profileList');
    profileList.innerHTML = '';
    Object.entries(profiles).forEach(([id, profile]) => {
        const card = document.createElement('div');
        card.className = 'profile-card';
        card.innerHTML = `<span class="profile-avatar">${emojiToImg(profile.avatar || '🦁', 48)}</span><span class="profile-name">${profile.name}</span><button class="profile-card-edit" title="Edit"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg></button>`;
        card.querySelector('.profile-avatar').addEventListener('click', () => selectProfile(id));
        card.querySelector('.profile-name').addEventListener('click', () => selectProfile(id));
        card.querySelector('.profile-card-edit').addEventListener('click', (e) => {
            e.stopPropagation();
            openProfileEdit(id, profile);
        });
        profileList.appendChild(card);
    });
}

// Ensure "Red Card Words" default list exists in Firebase for the profile
async function ensureDefaultWordList(profileId) {
    if (typeof db === 'undefined') return;
    const ref = db.ref('wordlists/' + profileId);
    const snapshot = await ref.orderByChild('name').equalTo('Red Card Words').once('value');
    if (!snapshot.exists()) {
        await ref.child('default').set({ name: 'Red Card Words', words: defaultWords });
    } else {
        // Update default list if words.js changed (e.g. duplicates removed)
        const entry = Object.entries(snapshot.val())[0];
        const existing = firebaseToArray(entry[1].words);
        if (existing.length !== defaultWords.length) {
            await ref.child(entry[0]).set({ name: 'Red Card Words', words: defaultWords });
        }
    }
    // Ensure Basics list exists
    const basicsSnap = await ref.orderByChild('name').equalTo('Basics').once('value');
    if (!basicsSnap.exists()) {
        await ref.child('basics').set({ name: 'Basics', words: basicsWords });
    } else {
        const bEntry = Object.entries(basicsSnap.val())[0];
        const bExisting = firebaseToArray(bEntry[1].words);
        if (bExisting.length !== basicsWords.length) {
            await ref.child(bEntry[0]).set({ name: 'Basics', words: basicsWords });
        }
    }
    // Load the active list (saved preference) or default to Red Card Words
    let loadedWords = null;
    const activeIdSnap = await db.ref('activeWordList/' + profileId).once('value');
    const activeId = activeIdSnap.val();
    if (activeId) {
        const activeSnap = await ref.child(activeId).once('value');
        if (activeSnap.exists()) {
            loadedWords = firebaseToArray(activeSnap.val().words);
            activeListName = activeSnap.val().name || 'Word List';
        }
    }
    if (!loadedWords) {
        const defaultSnap = await ref.orderByChild('name').equalTo('Red Card Words').once('value');
        if (defaultSnap.exists()) {
            loadedWords = firebaseToArray(Object.values(defaultSnap.val())[0].words);
        }
    }
    if (loadedWords) {
        allWords.length = 0;
        loadedWords.forEach(w => allWords.push(w));
        words = [...allWords];
        // Clear stale session if its word count doesn't match
        try {
            const sessSnap = await db.ref('sessions/' + profileId).once('value');
            const sess = sessSnap.val();
            if (sess && sess.words && sess.words.length !== loadedWords.length) {
                await db.ref('sessions/' + profileId).remove();
                localStorage.removeItem(profileId + '_spellingSession');
                practiceScope = 'all';
                localStorage.setItem(profileId + '_practiceScope', 'all');
            } else if (!sess) {
                practiceScope = 'all';
                localStorage.setItem(profileId + '_practiceScope', 'all');
            }
        } catch(e) {}
    }
}

// Build/update "Red Card Words - Mistakes" list from all reports
async function updateMistakesList(profileId) {
    if (typeof db === 'undefined') return;
    const reportsSnap = await db.ref('reports/' + profileId).once('value');
    const reports = reportsSnap.val();
    if (!reports) return;

    // Collect unique wrong words from all reports
    const wrongSet = new Set();
    Object.values(reports).forEach(report => {
        (report.results || []).forEach(r => {
            if (!r.isCorrect) wrongSet.add(r.word.toLowerCase());
        });
    });
    if (wrongSet.size === 0) return;

    // Merge with existing mistakes list (don't lose manually added words)
    const listRef = db.ref('wordlists/' + profileId + '/mistakes');
    const existingSnap = await listRef.once('value');
    const existing = existingSnap.val();
    const existingWords = existing ? firebaseToArray(existing.words) : [];
    existingWords.forEach(w => wrongSet.add(w));

    const merged = [...wrongSet].sort();
    await listRef.set({ name: 'Red Card Words - Mistakes', words: merged });
}

function selectProfile(profileId) {
    currentProfile = profileId;
    localStorage.setItem('currentProfile', profileId);
    // Load profile-scoped settings
    practiceScope = 'all';
    flashcardMuted = localStorage.getItem(profileKey('flashcardMuted')) === 'true';
    updateMuteButton();
    // Update profile indicator
    updateProfileIndicator(profileId);
    // Hide profile screen, show app
    document.getElementById('profileScreen').style.display = 'none';
    document.getElementById('scoreDisplay').style.display = '';
    document.getElementById('gearMenuWrapper').style.display = '';
    document.querySelector('.container').style.display = '';
    ensureDefaultWordList(profileId)
        .then(() => updateMistakesList(profileId))
        .then(() => initApp())
        .catch(() => initApp());
}

function showProfileScreen() {
    document.getElementById('profileScreen').style.display = '';
    document.getElementById('scoreDisplay').style.display = 'none';
    document.getElementById('gearMenuWrapper').style.display = 'none';
    document.querySelector('.container').style.display = 'none';
    loadProfileList();
}

document.getElementById('addProfileBtn').addEventListener('click', () => {
    const password = prompt('Parent password:');
    if (password !== 'read123') {
        if (password !== null) alert('Incorrect password');
        return;
    }
    openProfileEdit(null, null);
});

let currentWordIndex = 0;
let hasAnswered = false;
let hasHeardWord = false;
let resultsArray = [];
let inputMode = 'type'; // 'type' or 'speak'
let recognition = null;
let isListening = false;
const hasSpeechRecognition = !!(window.SpeechRecognition || window.webkitSpeechRecognition);

// Load words based on practiceScope setting
async function loadWordsForScope() {
    if (practiceScope === 'all') {
        words = [...allWords];
        return;
    }
    // Wrong words only — fetch from latest report
    if (typeof db !== 'undefined') {
        try {
            const snapshot = await db.ref(profileRef('reports')).orderByKey().limitToLast(1).once('value');
            const data = snapshot.val();
            if (data) {
                const report = Object.values(data)[0];
                const wrongWords = (report.results || []).filter(r => !r.isCorrect).map(r => r.word);
                if (wrongWords.length > 0) {
                    words = wrongWords;
                    return;
                }
            }
        } catch (e) {
            console.warn('Failed to load wrong words:', e);
        }
    }
    // Fallback to all words if no report or no wrong words
    words = [...allWords];
}

// Shuffle array function
function shuffleArray(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

const spellingInput = document.getElementById('spellingInput');
const mainContent = document.getElementById('mainContent');
const resultsSection = document.getElementById('resultsSection');
const incorrectSection = document.getElementById('incorrectSection');
const incorrectWordsDisplay = document.getElementById('incorrectWords');
const finalScoreDisplay = document.getElementById('finalScore');
const restartBtn2 = document.getElementById('restartBtn2');

const resultsDisplay = document.getElementById('resultsDisplay');
const scoreDisplay = document.getElementById('scoreDisplay');
const resetBtn = document.getElementById('resetBtn');
const gearBtn = document.getElementById('gearBtn');
const gearDropdown = document.getElementById('gearDropdown');
const viewReportsBtn = document.getElementById('viewReportsBtn');
const reportsOverlay = document.getElementById('reportsOverlay');
const reportsList = document.getElementById('reportsList');
const reportsCloseBtn = document.getElementById('reportsCloseBtn');
const practiceModeBtn = document.getElementById('modeToggleBtn');
const testContent = document.getElementById('testContent');
const practiceContent = document.getElementById('practiceContent');
const hearBtn = document.getElementById('hearBtn');
const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
let appMode = 'test'; // 'test' or 'practice'
let practiceScope = 'all';
let flashcardMuted = localStorage.getItem('flashcardMuted') === 'true';

// Initialize speech synthesis
const synth = window.speechSynthesis;

// ---- Unified TTS: Cloud TTS with browser fallback ----
let _ttsCloudActive = false; // true while cloudTTS is playing

function ttsCancel() {
    synth.cancel();
    if (window.cloudTTS) cloudTTS.stop();
    _ttsCloudActive = false;
}

function ttsSpeaking() {
    return synth.speaking || _ttsCloudActive;
}

// Speak text via Cloud TTS (if available), else browser speechSynthesis.
// opts: { rate, pitch, volume, onend, onerror }
function ttsSpeak(text, opts) {
    opts = opts || {};
    if (window.cloudTTS && cloudTTS.enabled()) {
        _ttsCloudActive = true;
        cloudTTS.speak(text, () => {
            _ttsCloudActive = false;
            if (opts.onend) opts.onend();
        }).then(ok => {
            if (!ok) {
                // Cloud TTS failed — fall back to browser
                _ttsCloudActive = false;
                _ttsBrowserSpeak(text, opts);
            }
        });
    } else {
        _ttsBrowserSpeak(text, opts);
    }
}

function _ttsBrowserSpeak(text, opts) {
    const u = new SpeechSynthesisUtterance(text);
    u.rate = opts.rate || 0.9;
    u.pitch = opts.pitch || 1.0;
    u.volume = opts.volume || 1;
    u.lang = 'en-GB';
    const v = getVoice();
    if (v) u.voice = v;
    if (opts.onend) u.onend = opts.onend;
    if (opts.onerror) u.onerror = opts.onerror;
    synth.speak(u);
}

// Unlock iOS audio on first user interaction
document.addEventListener('click', function _unlockTTS() {
    if (window.cloudTTS) cloudTTS.unlockAudio();
    document.removeEventListener('click', _unlockTTS);
}, { once: true });

// Initialize speech recognition
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-GB';

    recognition.onresult = (event) => {
        for (let i = event.resultIndex; i < event.results.length; i++) {
            if (!event.results[i].isFinal) continue;
            const transcript = event.results[i][0].transcript.trim().toLowerCase();
            const parts = transcript.split(/[\s,]+/);
            for (const part of parts) {
                if (part === 'enter' || part === 'submit' || part === 'done') {
                    handleInputAction();
                    return;
                }
                // Only add letters when ready for input
                if (!hasHeardWord || hasAnswered) continue;
                if (part === 'delete' || part === 'backspace') {
                    spellingInput.value = spellingInput.value.slice(0, -1);
                } else if (part === 'clear' || part === 'reset') {
                    spellingInput.value = '';
                } else if (part === 'space') {
                    spellingInput.value += ' ';
                } else if (part.length === 1 && /[a-z]/.test(part)) {
                    spellingInput.value += part;
                } else {
                    const letter = spokenToLetter(part);
                    if (letter) {
                        spellingInput.value += letter;
                    }
                }
            }
        }
    };

    recognition.onend = () => {
        // Always restart if in speak mode to keep mic permission alive
        if (inputMode === 'speak' && isListening) {
            try { recognition.start(); } catch(e) {}
        } else {
            isListening = false;
            updateMicIndicator();
        }
    };

    recognition.onerror = (event) => {
        if (event.error === 'no-speech' || event.error === 'aborted') return;
        console.error('Speech recognition error:', event.error);
    };
}

function spokenToLetter(word) {
    const map = {
        'ay': 'a', 'eh': 'a', 'hey': 'a',
        'bee': 'b', 'be': 'b',
        'see': 'c', 'sea': 'c', 'cee': 'c',
        'dee': 'd', 'de': 'd',
        'ee': 'e', 'he': 'e',
        'ef': 'f', 'eff': 'f',
        'gee': 'g',
        'aitch': 'h', 'age': 'h', 'ach': 'h', 'each': 'h', 'h.': 'h', 'eight': 'h', 'ache': 'h', 'etch': 'h',
        'eye': 'i', 'aye': 'i',
        'jay': 'j', 'jade': 'j',
        'kay': 'k', 'okay': 'k', 'cape': 'k',
        'el': 'l', 'ell': 'l', 'ale': 'l',
        'em': 'm',
        'en': 'n',
        'oh': 'o',
        'pee': 'p', 'pe': 'p',
        'queue': 'q', 'cue': 'q', 'kew': 'q', 'que': 'q',
        'are': 'r', 'ar': 'r', 'our': 'r',
        'es': 's', 'ess': 's', 'ass': 's',
        'tee': 't', 'tea': 't',
        'you': 'u', 'yu': 'u', 'new': 'u',
        'vee': 'v', 've': 'v',
        'double you': 'w', 'doubleyou': 'w', 'dub': 'w',
        'ex': 'x', 'eggs': 'x',
        'why': 'y', 'wie': 'y', 'wye': 'y', 'white': 'y',
        'zed': 'z', 'zee': 'z', 'set': 'z', 'said': 'z',
    };
    return map[word] || null;
}

function startListening() {
    if (!recognition || inputMode !== 'speak') return;
    if (isListening) return;
    try {
        isListening = true;
        recognition.start();
        updateMicIndicator();
    } catch(e) {}
}

function stopListening() {
    if (!recognition) return;
    isListening = false;
    try { recognition.stop(); } catch(e) {}
    updateMicIndicator();
}

function updateMicIndicator() {
    spellingInput.classList.toggle('mic-active', isListening);
}

function setMode(mode) {
    inputMode = mode;
    if (mode === 'type') {
        stopListening();
    } else {
        if (hasSpeechRecognition && !isMobile) {
            startListening();
        }
    }
    updatePlaceholder();
    updateHearBtn();
    if (mode === 'type') spellingInput.focus();
}

function setAppMode(mode) {
    appMode = mode;
    practiceModeBtn.innerHTML = mode === 'test'
        ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg> Practice Mode'
        : '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg> Test Mode';
    testContent.style.display = mode === 'test' ? '' : 'none';
    practiceContent.style.display = mode === 'practice' ? '' : 'none';
    scoreDisplay.style.display = mode === 'test' ? '' : 'none';
    if (mode === 'practice') {
        stopListening();
        loadPracticeCards();
    } else {
        slideshowPlaying = false;
        updatePlayButton();
        ttsCancel();
        spellingInput.focus();
        if (inputMode === 'speak' && !isMobile) startListening();
    }
}

practiceModeBtn.addEventListener('click', () => {
    if (appMode === 'practice') {
        setAppMode('test');
        gearDropdown.classList.remove('show');
        return;
    }
    // If test is in progress, require parent password to prevent peeking
    if (appMode === 'test' && resultsArray.length > 0 && currentWordIndex < words.length - 1) {
        const password = prompt('Parent password to switch during a test:');
        if (password !== 'read123') {
            if (password !== null) alert('Incorrect password');
            return;
        }
    }
    setAppMode('practice');
    gearDropdown.classList.remove('show');
});

// Hear button
hearBtn.addEventListener('click', () => {
    hearBtn.classList.remove('hear-pulse');
    handleInputAction();
});

function updateHearBtn() {
    // Show checkmark if there's text to check, speaker otherwise
    if (hasHeardWord && !hasAnswered && spellingInput.value.trim().length > 0) {
        hearBtn.innerHTML = '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';
        hearBtn.title = 'Check Spelling';
    } else {
        hearBtn.innerHTML = '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>';
        if (!hasHeardWord) {
            hearBtn.title = 'Hear Word';
        } else if (!hasAnswered) {
            hearBtn.title = 'Repeat';
        } else {
            hearBtn.title = 'Next Word';
        }
    }
}

function getCurrentWord() {
    return words[currentWordIndex];
}

function updatePlaceholder() {
    if (!hasHeardWord) {
        spellingInput.placeholder = isMobile ? "Tap the speaker" : "Hit Enter";
    } else if (!hasAnswered) {
        if (inputMode === 'speak' && !isMobile) {
            spellingInput.placeholder = hasSpeechRecognition ? "Speak or type..." : "Type...";
        } else {
            spellingInput.placeholder = "Type...";
        }
    } else {
        spellingInput.placeholder = isMobile ? "Tap Next Word" : "Enter for next";
    }
    updateHearBtn();
}

function updateScoreDisplay() {
    const answered = resultsArray.length;
    const correct = resultsArray.filter(r => r.isCorrect).length;
    const wrong = answered - correct;
    const total = words.length;
    const remaining = Math.max(0, total - answered);

    // Update donut charts
    const correctPct = total > 0 ? (correct / total) * 100 : 0;
    const wrongPct = total > 0 ? (wrong / total) * 100 : 0;
    const remainingPct = total > 0 ? (remaining / total) * 100 : 100;

    document.getElementById('donutRemaining').setAttribute('stroke-dasharray', `${remainingPct} ${100 - remainingPct}`);
    document.getElementById('donutCorrect').setAttribute('stroke-dasharray', `${correctPct} ${100 - correctPct}`);
    document.getElementById('donutWrong').setAttribute('stroke-dasharray', `${wrongPct} ${100 - wrongPct}`);
    document.getElementById('remainingCount').textContent = remaining;
    document.getElementById('correctCount').textContent = correct;
    document.getElementById('wrongCount').textContent = wrong;
}

function explainMistake(typed, correct) {
    const t = typed.toLowerCase();
    const c = correct.toLowerCase();

    // Check for swapped letters
    if (t.length === c.length) {
        const diffs = [];
        for (let i = 0; i < c.length; i++) {
            if (t[i] !== c[i]) diffs.push(i);
        }
        if (diffs.length === 2 && t[diffs[0]] === c[diffs[1]] && t[diffs[1]] === c[diffs[0]]) {
            return `Swapped '${c[diffs[0]]}' and '${c[diffs[1]]}'.`;
        }
    }

    // Find missing, extra, and wrong letters by simple diff
    const missing = [];
    const extra = [];
    let ci = 0, ti = 0;
    while (ci < c.length || ti < t.length) {
        if (ci < c.length && ti < t.length && c[ci] === t[ti]) {
            ci++; ti++;
        } else if (ci < c.length && (ti >= t.length || c.slice(ci + 1).includes(t[ti]))) {
            missing.push(c[ci]);
            ci++;
        } else if (ti < t.length) {
            extra.push(t[ti]);
            ti++;
        } else {
            break;
        }
    }

    const parts = [];
    if (missing.length > 0) {
        parts.push(`missing '${missing.join("', '")}'`);
    }
    if (extra.length > 0) {
        parts.push(`extra '${extra.join("', '")}'`);
    }
    if (parts.length > 0) {
        return parts.join(', ') + '.';
    }

    // Fallback
    return `You wrote '${typed}' instead of '${correct}'.`;
}

function displayResults() {
    // Display only wrong answers
    resultsDisplay.innerHTML = '';
    
    const wrongResults = resultsArray.filter(r => !r.isCorrect);
    if (wrongResults.length === 0) return;

    // Wrap wrong words in a collapsible dropdown
    let container = resultsDisplay;
    const details = document.createElement('details');
    details.className = 'wrong-words-dropdown';
    const summary = document.createElement('summary');
    summary.textContent = `Wrong words (${wrongResults.length})`;
    details.appendChild(summary);
    resultsDisplay.appendChild(details);
    container = details;
    
    wrongResults.forEach((result, index) => {
        const div = document.createElement('div');
        div.className = 'result-item';
        
        const wordDiv = document.createElement('div');
        wordDiv.className = 'result-word';
        
        const numberSpan = document.createElement('span');
        numberSpan.className = 'result-number';
        numberSpan.textContent = (index + 1) + '.';
        
        const wordSpan = document.createElement('span');
        wordSpan.textContent = result.word;
        
        wordDiv.appendChild(numberSpan);
        wordDiv.appendChild(wordSpan);
        
        const statusDiv = document.createElement('div');
        statusDiv.className = 'result-status';
        
        const typed = document.createElement('div');
        typed.className = 'result-typed';
        typed.textContent = result.typed;
        statusDiv.appendChild(typed);
        
        const hint = document.createElement('div');
        hint.className = 'result-hint';
        hint.textContent = explainMistake(result.typed, result.word);
        statusDiv.appendChild(hint);
        
        const x = document.createElement('div');
        x.className = 'result-x';
        x.textContent = '✗';
        statusDiv.appendChild(x);
        
        div.appendChild(wordDiv);
        div.appendChild(statusDiv);
        container.appendChild(div);
    });
}

function saveProgress() {
    const sessionData = {
        resultsArray: resultsArray,
        currentWordIndex: currentWordIndex,
        words: words,
        practiceScope: practiceScope,
        timestamp: new Date().toISOString()
    };
    localStorage.setItem(profileKey('spellingSession'), JSON.stringify(sessionData));
    // Sync to Firebase
    if (typeof db !== 'undefined') {
        db.ref(profileRef('sessions')).set(sessionData).catch(e => console.warn('Firebase save failed:', e));
    }
}

function clearProgress() {
    localStorage.removeItem(profileKey('spellingSession'));
    if (typeof db !== 'undefined') {
        db.ref(profileRef('sessions')).remove().catch(e => console.warn('Firebase clear failed:', e));
    }
}

async function loadProgress() {
    // Try Firebase first (cross-device), fall back to localStorage
    if (typeof db !== 'undefined') {
        try {
            const snapshot = await db.ref(profileRef('sessions')).once('value');
            const sessionData = snapshot.val();
            if (sessionData && sessionData.words && sessionData.resultsArray) {
                // Discard if scope changed
                if ((sessionData.practiceScope || 'all') !== practiceScope) {
                    clearProgress();
                    return false;
                }
                resultsArray = sessionData.resultsArray;
                currentWordIndex = sessionData.currentWordIndex;
                words = sessionData.words;
                // Sync to localStorage
                localStorage.setItem(profileKey('spellingSession'), JSON.stringify(sessionData));
                return true;
            } else {
                // Firebase has no session — clear any stale localStorage too
                localStorage.removeItem(profileKey('spellingSession'));
                return false;
            }
        } catch(e) {
            console.warn('Firebase load failed, trying localStorage:', e);
        }
    }
    const saved = localStorage.getItem(profileKey('spellingSession'));
    if (saved) {
        const sessionData = JSON.parse(saved);
        // Discard if scope changed
        if ((sessionData.practiceScope || 'all') !== practiceScope) {
            clearProgress();
            return false;
        }
        resultsArray = sessionData.resultsArray;
        currentWordIndex = sessionData.currentWordIndex;
        words = sessionData.words;
        return true;
    }
    return false;
}

let cachedVoice = null;
let voicesLoaded = false;

function getVoice() {
    if (cachedVoice && voicesLoaded) return cachedVoice;
    const voices = synth.getVoices();
    if (voices.length === 0) return null;
    voicesLoaded = true;

    // Prefer female en-GB voices, prioritize enhanced/premium
    const enGBVoices = voices.filter(v => v.lang === 'en-GB' || v.lang === 'en_GB');
    const avoidNames = ['Daniel', 'Arthur', 'Oliver', 'Thomas', 'Gordon', 'Malcolm', 'Aaron', 'Albert'];

    // 1. Try enhanced/premium female en-GB voices first (best quality on iOS)
    let selected = enGBVoices.find(v =>
        (v.name.includes('Enhanced') || v.name.includes('Premium')) &&
        !avoidNames.some(n => v.name.includes(n))
    );

    // 2. Specific preferred female names
    const preferredNames = [
        'Martha', 'Kate', 'Stephanie', 'Serena', 'Fiona',
        'Hazel', 'Susan', 'Libby', 'Maisie', 'Sonia',
        'Google UK English Female'
    ];
    if (!selected) {
        selected = enGBVoices.find(v => preferredNames.some(name => v.name.includes(name)));
    }

    // 3. Any non-male en-GB
    if (!selected) {
        selected = enGBVoices.find(v => !avoidNames.some(n => v.name.includes(n)));
    }
    if (!selected) selected = enGBVoices[0];

    // 4. Fall back to any English female
    if (!selected) {
        selected = voices.find(v => v.name.includes('Google UK English Female'));
    }
    if (!selected) {
        const enVoices = voices.filter(v => v.lang.startsWith('en'));
        selected = enVoices.find(v => preferredNames.some(n => v.name.includes(n)));
        if (!selected) selected = enVoices.find(v => v.name.includes('Samantha'));
        if (!selected) selected = enVoices.find(v => !avoidNames.some(n => v.name.includes(n)));
        if (!selected) selected = enVoices[0] || voices[0];
    }

    cachedVoice = selected;
    console.log('Selected voice:', selected ? selected.name + ' (' + selected.lang + ')' : 'none');
    return selected;
}

// Pre-load voices (needed for iOS Safari)
synth.getVoices();
if (synth.onvoiceschanged !== undefined) {
    synth.onvoiceschanged = () => {
        cachedVoice = null;
        voicesLoaded = false;
        getVoice();
    };
}

function speakWord() {
    // Cancel any ongoing speech
    ttsCancel();
    
    const word = getCurrentWord();
    
    // Visual feedback - show word is speaking
    spellingInput.placeholder = "Listening...";

    // On desktop, allow typing immediately while word is being spoken
    if (!isMobile) {
        hasHeardWord = true;
        updatePlaceholder();
        spellingInput.focus();
    }

    function afterWord() {
        hasHeardWord = true;
        updatePlaceholder();
        spellingInput.focus();
        if (inputMode === 'speak' && !isMobile) startListening();
    }

    // Speak the word, then the sentence
    const sentence = wordSentences[word];
    ttsSpeak(word, {
        rate: 0.85,
        onend: () => {
            if (sentence) {
                ttsSpeak(sentence, { rate: 0.9, onend: afterWord, onerror: afterWord });
            } else {
                afterWord();
            }
        },
        onerror: afterWord
    });
}

function checkSpelling() {
    stopListening();
    const userInput = spellingInput.value.trim();
    const correctWord = getCurrentWord();
    
    if (!userInput) {
        return;
    }
    
    // Case-sensitive for words with capitals (days, months), case-insensitive otherwise
    const isCorrect = correctWord !== correctWord.toLowerCase()
        ? userInput === correctWord
        : userInput.toLowerCase() === correctWord;
    
    // Store result
    const result = {
        word: correctWord,
        typed: userInput,
        isCorrect: isCorrect
    };
    resultsArray.push(result);
    saveProgress();
    displayResults();
    updateScoreDisplay();
    
    // Show feedback
    if (isCorrect) {
        spellingInput.classList.add('correct');
        spellingInput.classList.remove('incorrect');
        hasAnswered = true;
        updatePlaceholder();
        spellingInput.disabled = true;
        setTimeout(() => {
            spellingInput.disabled = false;
            spellingInput.focus();
        }, 2000);
    } else {
        spellingInput.classList.add('incorrect');
        spellingInput.classList.remove('correct');
        spellingInput.value = correctWord;
        hasAnswered = true;
        updatePlaceholder();
        spellingInput.disabled = true;

        // Speak the explanation
        ttsCancel();
        const explanation = explainMistake(userInput, correctWord);
        const spellOut = `The correct spelling is: ${correctWord.toLowerCase().split('').join(', ')}. ${explanation}`;
        function feedbackDone() {
            spellingInput.disabled = false;
            spellingInput.focus();
        }
        ttsSpeak(spellOut, { rate: 0.9, onend: feedbackDone, onerror: feedbackDone });
    }
}

function nextWord() {
    stopListening();
    if (currentWordIndex < words.length - 1) {
        currentWordIndex++;
        hasAnswered = false;
        hasHeardWord = false;
        spellingInput.value = '';
        spellingInput.classList.remove('correct', 'incorrect');
        updatePlaceholder();
        saveProgress();
        spellingInput.focus();
    } else {
        saveProgress();
        showCompletionReport();
    }
}

function showCompletionReport() {
    mainContent.style.display = 'none';
    resultsSection.style.display = 'block';
    
    // Calculate statistics
    const totalAttempts = resultsArray.length;
    const correctCount = resultsArray.filter(r => r.isCorrect).length;
    const percentage = totalAttempts > 0 ? Math.round((correctCount / totalAttempts) * 100) : 0;

    // Update final score display
    finalScoreDisplay.textContent = `${correctCount} / ${totalAttempts}`;

    const today = new Date();
    const dateString = today.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    
    // Build report HTML
    let reportHTML = `<h2>Practice Complete!</h2><p><strong>Date:</strong> ${dateString}</p>`;
    reportHTML += `<p><strong>Score:</strong> ${correctCount} / ${totalAttempts} (${percentage}%)</p>`;
    reportHTML += `<h3>Results:</h3>`;
    
    // Sort: wrong answers first, then correct
    const sortedResults = [...resultsArray].sort((a, b) => {
        if (a.isCorrect === b.isCorrect) return 0;
        return a.isCorrect ? 1 : -1;
    });
    
    sortedResults.forEach((result, index) => {
        if (result.isCorrect) {
            reportHTML += `<div class="result-item"><div class="result-word"><span class="result-number">${index + 1}.</span><span>${result.word}</span></div><div class="result-status"><div class="result-checkmark">✓</div></div></div>`;
        } else {
            reportHTML += `<div class="result-item"><div class="result-word"><span class="result-number">${index + 1}.</span><span>${result.word}</span></div><div class="result-status"><div class="result-typed">${result.typed}</div><div style="color: #4caf50; font-weight: 600; font-size: 24px;">${result.word}</div><div class="result-x">✗</div></div></div>`;
        }
    });
    
    incorrectSection.innerHTML = reportHTML;
    incorrectSection.style.display = 'block';

    // Auto-save report to Firebase
    saveReport();
}

function restartGame() {
    // Clear saved progress
    clearProgress();
    
    // Reload words for current scope then shuffle
    loadWordsForScope().then(() => {
        const shuffledWords = shuffleArray(words);
        for (let i = 0; i < words.length; i++) {
            words[i] = shuffledWords[i];
        }
        
        currentWordIndex = 0;
        hasAnswered = false;
        hasHeardWord = false;
        resultsArray = [];
        spellingInput.value = '';
        spellingInput.classList.remove('correct', 'incorrect');
        mainContent.style.display = 'block';
        resultsSection.style.display = 'none';
        updatePlaceholder();
        updateScoreDisplay();
        spellingInput.focus();
        speakWord();
    });
}

// Handle Enter key and blur (tap outside)
const handleInputAction = () => {
    if (!hasHeardWord) {
        // Haven't heard the word yet - speak it
        speakWord();
    } else if (!hasAnswered) {
        // Heard word - check if there's text
        if (spellingInput.value.trim().length > 0) {
            // Has text - check spelling
            checkSpelling();
        } else {
            // No text - repeat the word
            ttsCancel();
            hasHeardWord = false;
            spellingInput.placeholder = "Listening...";
            speakWord();
        }
    } else if (hasAnswered) {
        // Already answered - move to next word
        nextWord();
    }
};

spellingInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        if (appMode === 'practice') return;
        handleInputAction();
    }
});

spellingInput.addEventListener('blur', () => {
    // Trigger action on blur if there's text
    if (spellingInput.value.trim().length > 0) {
        setTimeout(handleInputAction, 100);
    }
});

// Prevent typing before hearing word (but allow Enter)
spellingInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') return;
    if (!hasHeardWord && !hasAnswered) {
        e.preventDefault();
    }
});

spellingInput.addEventListener('input', (e) => {
    if (!hasHeardWord) {
        spellingInput.value = '';
        return;
    }
    updateHearBtn();
});

// Global Enter key handler (works even if textbox not focused)
document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        // Don't interfere when modals are open
        if (document.getElementById('wordlistsOverlay').style.display !== 'none' ||
            document.getElementById('wordlistEditOverlay').style.display !== 'none' ||
            document.getElementById('reportsOverlay').style.display !== 'none') return;
        if (appMode === 'practice') return;
        e.preventDefault();
        spellingInput.focus();
        handleInputAction();
    }
});

// App initialization (called after profile selection)
async function initApp() {
    // Reset state
    currentWordIndex = 0;
    hasAnswered = false;
    hasHeardWord = false;
    resultsArray = [];
    mainContent.style.display = '';
    resultsSection.style.display = 'none';
    spellingInput.value = '';
    spellingInput.classList.remove('correct', 'incorrect');
    setAppMode('test');

    const hasSession = await loadProgress();
    
    if (!hasSession) {
        await loadWordsForScope();
        // New session - shuffle words
        const shuffledWords = shuffleArray(words);
        for (let i = 0; i < words.length; i++) {
            words[i] = shuffledWords[i];
        }
    }
    
    // Display current results (empty on fresh session, populated on resumed)
    displayResults();
    
    updatePlaceholder();
    updateScoreDisplay();
    updateHearBtn();
    updateListFooter();
    // Flash speaker on mobile to guide user
    if (isMobile) {
        hearBtn.classList.add('hear-pulse');
        setTimeout(() => hearBtn.classList.remove('hear-pulse'), 3000);
    }
    spellingInput.focus();
}

// On page load - show profile selector or go to last profile
window.addEventListener('load', () => {
    if (currentProfile) {
        selectProfile(currentProfile);
    } else {
        showProfileScreen();
    }
});

// Restart button
restartBtn2.addEventListener('click', restartGame);

function saveReport() {
    const totalAttempts = resultsArray.length;
    const correctCount = resultsArray.filter(r => r.isCorrect).length;
    const wrongCount = totalAttempts - correctCount;
    const percentage = totalAttempts > 0 ? Math.round((correctCount / totalAttempts) * 100) : 0;
    const now = new Date();

    const reportData = {
        date: now.toISOString(),
        totalWords: totalAttempts,
        correct: correctCount,
        wrong: wrongCount,
        percentage: percentage,
        results: resultsArray.map(r => ({
            word: r.word,
            typed: r.typed,
            isCorrect: r.isCorrect
        }))
    };

    if (typeof db !== 'undefined') {
        const reportId = now.getTime().toString();
        db.ref(profileRef('reports') + '/' + reportId).set(reportData)
            .then(() => {
                console.log('Report saved automatically.');
                updateMistakesList(currentProfile);
            })
            .catch(e => {
                console.warn('Firebase report save failed:', e);
            });
    }
}

// Gear menu
gearBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    gearDropdown.classList.toggle('show');
});

document.addEventListener('click', () => {
    gearDropdown.classList.remove('show');
});

gearDropdown.addEventListener('click', (e) => {
    e.stopPropagation();
});

// View reports
viewReportsBtn.addEventListener('click', () => {
    gearDropdown.classList.remove('show');
    reportsOverlay.style.display = 'flex';
    loadReports();
});

reportsCloseBtn.addEventListener('click', () => {
    reportsOverlay.style.display = 'none';
});

function loadReports() {
    reportsList.innerHTML = '<p class="reports-loading">Loading reports...</p>';

    if (typeof db === 'undefined') {
        reportsList.innerHTML = '<p class="reports-loading">Firebase not available.</p>';
        return;
    }

    db.ref(profileRef('reports')).orderByKey().once('value')
        .then(snapshot => {
            const data = snapshot.val();
            if (!data) {
                reportsList.innerHTML = '<p class="reports-loading">No reports saved yet.</p>';
                return;
            }

            const reports = Object.entries(data).sort((a, b) => b[0] - a[0]);
            reportsList.innerHTML = '';

            reports.forEach(([id, report]) => {
                const date = new Date(report.date);
                const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                const timeStr = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

                const card = document.createElement('div');
                card.className = 'report-card';
                card.innerHTML = `
                    <div class="report-card-header">
                        <div class="report-date">${dateStr} at ${timeStr}</div>
                        <div class="report-score ${report.percentage >= 80 ? 'report-score-good' : report.percentage >= 50 ? 'report-score-ok' : 'report-score-low'}">${report.percentage}%</div>
                    </div>
                    <div class="report-summary">${report.correct} correct, ${report.wrong} wrong out of ${report.totalWords} words</div>
                `;

                if (report.results) {
                    const wrongWords = report.results.filter(r => !r.isCorrect);
                    if (wrongWords.length > 0) {
                        const details = document.createElement('details');
                        details.className = 'report-details';
                        const summary = document.createElement('summary');
                        summary.textContent = `Wrong words (${wrongWords.length})`;
                        details.appendChild(summary);

                        const wordsList = document.createElement('div');
                        wordsList.className = 'report-words';
                        wrongWords.forEach(w => {
                            wordsList.innerHTML += `<div class="report-word-item"><span class="report-word-correct">${w.word}</span> <span class="report-word-typed">typed: ${w.typed}</span></div>`;
                        });
                        details.appendChild(wordsList);
                        card.appendChild(details);
                    }
                }

                reportsList.appendChild(card);
            });
        })
        .catch(e => {
            console.warn('Failed to load reports:', e);
            reportsList.innerHTML = '<p class="reports-loading">Failed to load reports.</p>';
        });
}

// Reset button (parents only)
resetBtn.addEventListener('click', () => {
    gearDropdown.classList.remove('show');
    const password = prompt('Parent password to reset all progress:');
    if (password === 'read123') {
        clearProgress();
        location.reload();
    } else if (password !== null) {
        alert('Incorrect password');
    }
});

// Switch player
document.getElementById('switchProfileBtn').addEventListener('click', () => {
    gearDropdown.classList.remove('show');
    ttsCancel();
    showProfileScreen();
});

// ===== PRACTICE MODE (Flashcards) =====

const wordFamilies = {
    'Silent K': ['know', 'knew'],
    'Silent W': ['write', 'who', 'whose'],
    'Silent L': ['walk', 'talk', 'could', 'should', 'would'],
    'Homophones': ['their', 'there', 'your', 'yours', 'here', 'knew', 'new', 'by', 'for', 'four', 'two', 'one'],
    'Double Letters': ['all', 'full', 'pull', 'off', 'been', 'good', 'little', 'pretty'],
    'Tricky Vowels': ['said', 'does', 'once', 'because', 'again', 'many'],
    'Unusual Sounds': ['laugh', 'pretty', 'come', 'some', 'done', 'give', 'live', 'have'],
};

const spellingTips = {
    'know': 'Silent K — say "no" but write K-N-O-W.',
    'knew': 'Silent K — like "know" in the past. K-N-E-W.',
    'write': 'Silent W — you don\'t hear it but it\'s there! W-R-I-T-E.',
    'who': 'Silent W — sounds like "hoo" but starts with W-H.',
    'whose': 'Silent W — W-H-O-S-E. Think: who + se.',
    'walk': 'Silent L — you don\'t say the L! W-A-L-K.',
    'talk': 'Silent L — same family as walk. T-A-L-K.',
    'could': 'Silent L — C-O-U-L-D. Remember: O-U-L-D family.',
    'should': 'Silent L — S-H-O-U-L-D. Same pattern as could/would.',
    'would': 'Silent L — W-O-U-L-D. Same pattern as could/should.',
    'their': 'Means "belonging to them." T-H-E-I-R has "heir" in it.',
    'there': 'A place. T-H-E-R-E has "here" in it!',
    'your': 'Belongs to you. Y-O-U-R has "you" in it.',
    'yours': 'Your + S. Y-O-U-R-S.',
    'here': 'A place — "here" has "her" in it but means a place.',
    'by': 'Just two letters: B-Y. Short and sweet!',
    'for': 'Three letters: F-O-R. Not "four" the number!',
    'four': 'The number 4. F-O-U-R has a U in it.',
    'two': 'The number 2. T-W-O — silent W!',
    'one': 'The number 1. O-N-E — sounds like "wun."',
    'new': 'N-E-W. Rhymes with "few."',
    'all': 'Double L — A-L-L.',
    'full': 'Double L — F-U-L-L.',
    'pull': 'Double L — P-U-L-L. Like "full" but with P.',
    'off': 'Double F — O-F-F.',
    'been': 'Double E — B-E-E-N. Has "bee" in it!',
    'good': 'Double O — G-O-O-D.',
    'little': 'Double T — L-I-T-T-L-E.',
    'pretty': 'P-R-E-T-T-Y. Double T! The E sounds like "ih."',
    'said': 'S-A-I-D. The AI sounds like "eh" — tricky!',
    'does': 'D-O-E-S. The OE sounds like "uh."',
    'once': 'O-N-C-E. Sounds like "wunce" but starts with O.',
    'because': 'B-E-C-A-U-S-E. Big Elephants Can Always Understand Small Elephants!',
    'again': 'A-G-A-I-N. The AI sounds like "eh."',
    'many': 'M-A-N-Y. The A sounds like "eh."',
    'laugh': 'L-A-U-G-H. The GH sounds like F!',
    'come': 'C-O-M-E. The O sounds like "uh."',
    'some': 'S-O-M-E. Same pattern as come.',
    'done': 'D-O-N-E. Same sound pattern as come/some.',
    'give': 'G-I-V-E. Short I sound.',
    'live': 'L-I-V-E. Same pattern as give.',
    'have': 'H-A-V-E. Ends with silent E.',
    'they': 'T-H-E-Y. The EY says "ay."',
    'just': 'Rhymes with must and bust.',
    'you': 'Y-O-U. Three letters for "yoo."',
    'only': 'O-N-L-Y. Sounds like "own-lee."',
    'always': 'A-L-W-A-Y-S. All + ways!',
    'under': 'Starts with "un" like undo.',
    'say': 'S-A-Y. Rhymes with day, play, way.',
    'and': 'A-N-D. Nice and short!',
    'look': 'L-O-O-K. Double O!',
    'see': 'S-E-E. Double E!',
    'like': 'L-I-K-E. Silent E at the end.',
    'put': 'P-U-T. Sounds like "poot" — rhymes with foot!',
    'those': 'T-H-O-S-E. Like "the" + "ose."',
    'after': 'Rhymes with laughter without the L.',
    'first': 'Starts with "fir" like a fir tree.',
    'far': 'F-A-R. Just three letters.',
    'down': 'D-O-W-N. Rhymes with town.',
    'she': 'S-H-E. Just three letters.',
    'not': 'N-O-T. Short and simple!',
    'thank': 'T-H-A-N-K. Starts with TH.',
    'the': 'T-H-E. Most common word!',
    'was': 'W-A-S. Sounds like "woz."',
    'please': 'P-L-E-A-S-E. Ends with silent E.',
    'start': 'S-T-A-R-T. Starts and ends with T/ST.',
    "don't": "D-O-N-'-T. Don + apostrophe + T.",
    'want': 'Rhymes with font, not went.',
    'think': 'T-H-I-N-K. TH + ink!',
    'why': 'W-H-Y. Starts with WH.',
    'play': 'P-L-A-Y. Rhymes with say, day.',
    'has': 'H-A-S. Just three letters.',
    'go': 'G-O. Just two letters!',
    'cold': 'C-O-L-D. Rhymes with old, gold.',
    'find': 'F-I-N-D. Rhymes with kind, mind.',
    'every': 'E-V-E-R-Y. Starts with "ever."',
    'soon': 'S-O-O-N. Double O!',
    'where': 'W-H-E-R-E. Has "here" in it + W.',
    'got': 'G-O-T. Rhymes with hot, not.',
    'hurt': 'Rhymes with dirt and shirt.',
    'now': 'N-O-W. Rhymes with how, cow.',
    'way': 'W-A-Y. Rhymes with say, play, day.',
    'be': 'B-E. Just two letters!',
    'had': 'H-A-D. Rhymes with sad, dad.',
    'help': 'Rhymes with yelp.',
    'these': 'T-H-E-S-E. Like "the" + S + E.',
    'how': 'H-O-W. Rhymes with now, cow.',
    'his': 'H-I-S. Just three letters.',
    'three': 'T-H-R-E-E. Double E!',
    'words': 'Like "word" plus S. Sounds like "wurdz".',
    'any': 'A-N-Y. The A sounds like "eh."',
    'her': 'H-E-R. Just three letters.',
    'on': 'O-N. Just two letters!',
    'use': 'U-S-E. Silent E at the end.',
    'work': 'W-O-R-K. Sounds like "wurk."',
    'were': 'W-E-R-E. Sounds like "wur."',
    'old': 'O-L-D. Rhymes with cold, gold.',
    'very': 'Ends in Y, not E.',
    'from': 'Starts with FR like frog.',
    'over': 'Starts with O, rhymes with clover.',
    'what': 'W-H-A-T. Starts with WH.',
};

let practiceCards = [];
let practiceIndex = 0;
let slideshowPlaying = false;

function getFamilyForWord(word) {
    for (const [family, members] of Object.entries(wordFamilies)) {
        if (members.includes(word)) return { name: family, words: members };
    }
    return null;
}

function loadPracticeCards() {
    const flashcard = document.getElementById('flashcard');
    const flashcardNav = document.getElementById('flashcardNav');
    const flashcardEmpty = document.getElementById('flashcardEmpty');
    const flashcardFamily = document.getElementById('flashcardFamily');

    function showCards(cards) {
        if (cards.length === 0) {
            flashcardEmpty.innerHTML = `<p>No wrong words!</p><p>Great job, ${getProfileName()}! 🎉</p>`;
            flashcardEmpty.style.display = '';
            flashcard.style.display = 'none';
            flashcardNav.style.display = 'none';
            flashcardFamily.style.display = 'none';
            return;
        }
        practiceCards = cards;
        practiceIndex = 0;
        flashcardEmpty.style.display = 'none';
        flashcard.style.display = '';
        flashcardNav.style.display = cards.length > 1 ? 'flex' : 'none';
        showFlashcard();
    }

    // "All words" mode
    if (practiceScope === 'all') {
        const allCards = words.map(w => ({ word: w, typed: null }));
        showCards(allCards);
        return;
    }

    // "Wrong words" mode — try current session first
    const wrongFromSession = resultsArray.filter(r => !r.isCorrect);
    if (wrongFromSession.length > 0) {
        showCards(wrongFromSession);
        return;
    }

    // Fall back to latest report from Firebase
    if (typeof db !== 'undefined') {
        db.ref(profileRef('reports')).orderByKey().limitToLast(1).once('value')
            .then(snapshot => {
                const data = snapshot.val();
                if (!data) {
                    flashcardEmpty.innerHTML = '<p>No wrong words to practice yet.</p><p>Complete a test first!</p>';
                    flashcardEmpty.style.display = '';
                    flashcard.style.display = 'none';
                    flashcardNav.style.display = 'none';
                    flashcardFamily.style.display = 'none';
                    return;
                }
                const report = Object.values(data)[0];
                const wrongWords = (report.results || []).filter(r => !r.isCorrect);
                showCards(wrongWords);
            })
            .catch(() => {
                flashcardEmpty.style.display = '';
                flashcard.style.display = 'none';
                flashcardNav.style.display = 'none';
                flashcardFamily.style.display = 'none';
            });
    } else {
        flashcardEmpty.style.display = '';
        flashcard.style.display = 'none';
        flashcardNav.style.display = 'none';
        flashcardFamily.style.display = 'none';
    }
}

function showFlashcard() {
    const card = practiceCards[practiceIndex];
    const word = card.word;
    const typed = card.typed;

    // Word with individual letter spans
    const wordEl = document.getElementById('flashcardWord');
    wordEl.innerHTML = word.split('').map(l => `<span class="letter">${l}</span>`).join('');

    // Update mute button
    updateMuteButton();

    // Sentence with word highlighted
    const sentenceEl = document.getElementById('flashcardSentence');
    const sentence = wordSentences[word] || '';
    if (sentence) {
        const regex = new RegExp(`(${word})`, 'gi');
        sentenceEl.innerHTML = sentence.replace(regex, '<span class="word-highlight">$1</span>');
    } else {
        sentenceEl.innerHTML = '';
    }

    // Mistake
    const mistakeEl = document.getElementById('flashcardMistake');
    mistakeEl.textContent = typed ? `You typed: "${typed}"` : '';

    // Tip
    const tipEl = document.getElementById('flashcardTip');
    tipEl.textContent = spellingTips[word] || (typed ? explainMistake(typed, word) : '');

    // Counter
    document.getElementById('flashcardCounter').textContent = `${practiceIndex + 1} / ${practiceCards.length}`;

    // Nav buttons
    document.getElementById('flashcardPrev').disabled = practiceIndex === 0;
    document.getElementById('flashcardNext').disabled = practiceIndex === practiceCards.length - 1;

    // Word family
    const familyEl = document.getElementById('flashcardFamily');
    const family = getFamilyForWord(word);
    if (family) {
        familyEl.style.display = '';
        familyEl.innerHTML = `<div class="flashcard-family-label">${family.name}</div><div class="flashcard-family-words">${family.words.map(w => `<span class="flashcard-family-word">${w}</span>`).join('')}</div>`;
    } else {
        familyEl.style.display = 'none';
    }

    // Auto-speak and animate (unless muted)
    if (!flashcardMuted) {
        speakFlashcard(word);
    }
}

function speakFlashcard(word) {
    if (flashcardMuted) return;
    ttsCancel();
    const letters = document.querySelectorAll('#flashcardWord .letter');

    // Speak the word first
    ttsSpeak(word, {
        rate: 0.8,
        onend: () => {
            // Spell letter by letter, chained via callbacks
            letters.forEach(l => l.classList.remove('highlight'));
            speakLetterAt(0);
        }
    });

    function speakLetterAt(i) {
        if (i >= letters.length) {
            // All letters done — remove highlights, all black
            letters.forEach(l => l.classList.remove('highlight'));
            // Speak the word again
            setTimeout(() => {
                ttsSpeak(word, {
                    rate: 0.85,
                    onend: () => {
                        // Speak the sentence
                        const sentence = wordSentences[word];
                        const tip = spellingTips[word];
                        const speakTip = () => {
                            if (tip) {
                                ttsSpeak(tip, { rate: 0.9, onend: () => advanceSlideshow() });
                            } else {
                                advanceSlideshow();
                            }
                        };
                        if (sentence) {
                            ttsSpeak(sentence, { rate: 0.9, onend: speakTip });
                        } else {
                            speakTip();
                        }
                    }
                });
            }, 300);
            return;
        }
        // Highlight current letter
        letters.forEach(l => l.classList.remove('highlight'));
        letters[i].classList.add('highlight');
        // Speak the letter
        ttsSpeak(word[i].toLowerCase(), { rate: 0.7, onend: () => speakLetterAt(i + 1) });
    }
}

// Flashcard navigation
document.getElementById('flashcardPrev').addEventListener('click', () => {
    slideshowPlaying = false;
    updatePlayButton();
    if (practiceIndex > 0) {
        practiceIndex--;
        showFlashcard();
    }
});

document.getElementById('flashcardNext').addEventListener('click', () => {
    slideshowPlaying = false;
    updatePlayButton();
    if (practiceIndex < practiceCards.length - 1) {
        practiceIndex++;
        showFlashcard();
    }
});

// Slideshow play/pause
function advanceSlideshow() {
    if (!slideshowPlaying) return;
    if (practiceIndex < practiceCards.length - 1) {
        setTimeout(() => {
            if (!slideshowPlaying) return;
            practiceIndex++;
            showFlashcard();
        }, 1500);
    } else {
        // Reached end
        slideshowPlaying = false;
        updatePlayButton();
    }
}

function updatePlayButton() {
    const btn = document.getElementById('flashcardPlay');
    btn.textContent = slideshowPlaying ? '❚❚' : '▶';
    btn.title = slideshowPlaying ? 'Pause' : 'Auto-play';
}

document.getElementById('flashcardPlay').addEventListener('click', () => {
    slideshowPlaying = !slideshowPlaying;
    updatePlayButton();
    if (slideshowPlaying) {
        // If speech is not currently playing, start the current card
        if (!ttsSpeaking()) {
            showFlashcard();
        }
    } else {
        ttsCancel();
    }
});

// Mute/unmute toggle
function updateMuteButton() {
    const btn = document.getElementById('flashcardSpeaker');
    btn.innerHTML = flashcardMuted
        ? '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>'
        : '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>';
    btn.title = flashcardMuted ? 'Unmute' : 'Mute';
}
updateMuteButton();

document.getElementById('flashcardSpeaker').addEventListener('click', () => {
    flashcardMuted = !flashcardMuted;
    localStorage.setItem(profileKey('flashcardMuted'), flashcardMuted);
    updateMuteButton();
    if (flashcardMuted) {
        ttsCancel();
    } else {
        // Unmuted — speak current card
        const card = practiceCards[practiceIndex];
        if (card) speakFlashcard(card.word);
    }
});

const wordListsBtn = document.getElementById('wordListsBtn');
const wordlistsOverlay = document.getElementById('wordlistsOverlay');
const wordlistsCloseBtn = document.getElementById('wordlistsCloseBtn');
const wordlistsList = document.getElementById('wordlistsList');
const addWordListBtn = document.getElementById('addWordListBtn');

wordListsBtn.addEventListener('click', () => {
    gearDropdown.classList.remove('show');
    wordlistsOverlay.style.display = 'flex';
    loadWordLists();
});
wordlistsCloseBtn.addEventListener('click', () => {
    wordlistsOverlay.style.display = 'none';
});

function loadWordLists() {
    wordlistsList.innerHTML = '<p>Loading...</p>';
    if (typeof db === 'undefined' || !currentProfile) {
        wordlistsList.innerHTML = '<p>Not available offline.</p>';
        return;
    }
    db.ref('wordlists/' + currentProfile).once('value').then(snapshot => {
        const lists = snapshot.val() || {};
        renderWordLists(lists);
    });
}

function firebaseToArray(val) {
    if (Array.isArray(val)) return val;
    if (val && typeof val === 'object') return Object.values(val);
    return [];
}

function renderWordLists(lists) {
    wordlistsList.innerHTML = '';

    const entries = Object.entries(lists);
    if (entries.length === 0) {
        wordlistsList.innerHTML = '<p style="text-align:center;color:#999;padding:20px 0;">No word lists yet.</p>';
        return;
    }
    entries.forEach(([id, list]) => {
        const wordsArr = firebaseToArray(list.words);
        const card = document.createElement('div');
        card.className = 'wordlist-card';
        card.innerHTML = `
            <div class="wordlist-info">
                <div class="wordlist-name">${list.name}</div>
                <div class="wordlist-count">${wordsArr.length} word${wordsArr.length === 1 ? '' : 's'}</div>
            </div>
            <div class="wordlist-actions"></div>
        `;
        const actions = card.querySelector('.wordlist-actions');

        const loadBtn = document.createElement('button');
        loadBtn.textContent = 'Load';
        loadBtn.addEventListener('click', () => doLoadWordList(id));
        actions.appendChild(loadBtn);

        const editBtn = document.createElement('button');
        editBtn.textContent = 'Edit';
        editBtn.addEventListener('click', () => doEditWordList(id));
        actions.appendChild(editBtn);

        const delBtn = document.createElement('button');
        delBtn.textContent = 'Delete';
        delBtn.className = 'danger';
        delBtn.addEventListener('click', () => doDeleteWordList(id));
        actions.appendChild(delBtn);

        wordlistsList.appendChild(card);
    });
}


// ===== WORD LISTS CRUD =====
const wordlistEditOverlay = document.getElementById('wordlistEditOverlay');
const wordlistEditTitle = document.getElementById('wordlistEditTitle');
const wordlistEditCloseBtn = document.getElementById('wordlistEditCloseBtn');
const wordlistNameInput = document.getElementById('wordlistNameInput');
const wordlistWordsList = document.getElementById('wordlistWordsList');
const newWordInput = document.getElementById('newWordInput');
const addWordBtn = document.getElementById('addWordBtn');
const cancelWordListBtn = document.getElementById('cancelWordListBtn');
const saveWordListBtn = document.getElementById('saveWordListBtn');

let editingWordListId = null;
let editingWordListWords = [];
let editingWordListMode = 'create';

function showWordListEditModal(mode, listId, listData) {
    editingWordListMode = mode;
    editingWordListId = listId || null;
    wordlistEditOverlay.style.display = 'flex';
    if (mode === 'edit' && listData) {
        wordlistEditTitle.textContent = 'Edit Word List';
        wordlistNameInput.value = listData.name || '';
        editingWordListWords = [...firebaseToArray(listData.words)];
    } else {
        wordlistEditTitle.textContent = 'Create Word List';
        wordlistNameInput.value = '';
        editingWordListWords = [];
    }
    renderEditWords();
    newWordInput.value = '';
    setTimeout(() => wordlistNameInput.focus(), 100);
}

function hideWordListEditModal() {
    wordlistEditOverlay.style.display = 'none';
    editingWordListId = null;
    editingWordListWords = [];
}

function renderEditWords() {
    wordlistWordsList.innerHTML = '';
    editingWordListWords.sort((a, b) => a.localeCompare(b));
    editingWordListWords.forEach((w, i) => {
        const chip = document.createElement('span');
        chip.className = 'wordlist-word-chip';

        const text = document.createElement('span');
        text.className = 'chip-text';
        text.textContent = w;
        chip.appendChild(text);

        // Edit button — replaces text with inline input
        const editBtn = document.createElement('button');
        editBtn.textContent = '✎';
        editBtn.title = 'Edit';
        editBtn.addEventListener('click', () => {
            const input = document.createElement('input');
            input.type = 'text';
            input.className = 'chip-edit-input';
            input.value = w;
            input.maxLength = 24;
            input.addEventListener('blur', () => {
                const val = input.value.trim().toLowerCase();
                if (val && val !== w && !editingWordListWords.includes(val)) {
                    editingWordListWords[i] = val;
                }
                renderEditWords();
            });
            input.addEventListener('keydown', ev => {
                if (ev.key === 'Enter') { ev.preventDefault(); input.blur(); }
                ev.stopPropagation();
            });
            chip.replaceChild(input, text);
            editBtn.style.display = 'none';
            input.focus();
        });
        chip.appendChild(editBtn);

        // Delete button
        const delBtn = document.createElement('button');
        delBtn.textContent = '✕';
        delBtn.title = 'Remove';
        delBtn.addEventListener('click', () => {
            editingWordListWords.splice(i, 1);
            renderEditWords();
        });
        chip.appendChild(delBtn);

        wordlistWordsList.appendChild(chip);
    });
}

// Add word button
addWordBtn.addEventListener('click', () => {
    const val = newWordInput.value.trim().toLowerCase();
    if (val && !editingWordListWords.includes(val)) {
        editingWordListWords.push(val);
        renderEditWords();
        newWordInput.value = '';
        newWordInput.focus();
    }
});

// Enter in word input adds the word
newWordInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
        e.preventDefault();
        e.stopPropagation();
        addWordBtn.click();
    }
});

// Enter in name input — don't let it bubble
wordlistNameInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
        e.preventDefault();
        e.stopPropagation();
        newWordInput.focus();
    }
});

wordlistEditCloseBtn.addEventListener('click', hideWordListEditModal);
cancelWordListBtn.addEventListener('click', hideWordListEditModal);

// Save word list
saveWordListBtn.addEventListener('click', () => {
    const name = wordlistNameInput.value.trim();
    if (!name) { wordlistNameInput.focus(); return; }
    if (editingWordListWords.length === 0) { newWordInput.focus(); return; }

    if (typeof db === 'undefined' || !currentProfile) return;

    const listData = { name: name, words: editingWordListWords };
    const ref = db.ref('wordlists/' + currentProfile);

    if (editingWordListMode === 'edit' && editingWordListId) {
        ref.child(editingWordListId).set(listData).then(() => {
            hideWordListEditModal();
            loadWordLists();
        }).catch(err => alert('Save failed: ' + err.message));
    } else {
        const id = Date.now().toString();
        ref.child(id).set(listData).then(() => {
            hideWordListEditModal();
            loadWordLists();
        }).catch(err => alert('Save failed: ' + err.message));
    }
});

// CRUD actions
function doEditWordList(id) {
    if (typeof db === 'undefined' || !currentProfile) return;
    db.ref('wordlists/' + currentProfile + '/' + id).once('value').then(snapshot => {
        const list = snapshot.val();
        if (!list) return;
        showWordListEditModal('edit', id, list);
    });
}

function doDeleteWordList(id) {
    if (!confirm('Delete this word list?')) return;
    if (typeof db === 'undefined' || !currentProfile) return;
    db.ref('wordlists/' + currentProfile + '/' + id).remove().then(() => {
        loadWordLists();
    }).catch(err => alert('Delete failed: ' + err.message));
}

function doLoadWordList(id) {
    if (typeof db === 'undefined' || !currentProfile) return;
    db.ref('wordlists/' + currentProfile + '/' + id).once('value').then(snapshot => {
        const list = snapshot.val();
        if (!list) return;
        const loadedWords = firebaseToArray(list.words);
        words = [...loadedWords];
        allWords.length = 0;
        loadedWords.forEach(w => allWords.push(w));
        activeListName = list.name || 'Word List';
        practiceScope = 'all';
        localStorage.setItem(profileKey('practiceScope'), 'all');
        // Remember active list for next login
        db.ref('activeWordList/' + currentProfile).set(id);
        clearProgress();
        restartGame();
        updateListFooter();
        wordlistsOverlay.style.display = 'none';
    });
}

addWordListBtn.addEventListener('click', () => {
    showWordListEditModal('create');
});

// ===== PROFILE DELETION =====
document.getElementById('deleteProfileBtn').addEventListener('click', () => {
    const password = prompt('Parent password:');
    if (password !== 'read123') {
        if (password !== null) alert('Incorrect password');
        return;
    }
    const name = prompt('Enter player name to delete:');
    if (!name || !name.trim()) return;
    const id = name.trim().toLowerCase();
    if (id === 'niko') {
        alert('Cannot delete the default profile.');
        return;
    }
    // Verify profile exists
    if (typeof db !== 'undefined') {
        db.ref('profiles/' + id).once('value').then(snapshot => {
            if (!snapshot.exists()) {
                alert('Profile not found.');
                return;
            }
            if (!confirm('Delete player "' + name.trim() + '" and all their data?')) return;
            db.ref('profiles/' + id).remove();
            db.ref('reports/' + id).remove();
            db.ref('sessions/' + id).remove();
            db.ref('wordlists/' + id).remove();
            db.ref('activeWordList/' + id).remove();
            // Clean localStorage
            Object.keys(localStorage).forEach(k => {
                if (k.startsWith(id + '_')) localStorage.removeItem(k);
            });
            if (localStorage.getItem('currentProfile') === id) {
                localStorage.removeItem('currentProfile');
                currentProfile = '';
            }
            loadProfileList();
        });
    }
});


// ===== PROFILE EDIT MODAL =====
const allAvatars = ['🦁', '🐱', '🐶', '🦊', '🐻', '🐼', '🐸', '🦄', '🐝', '🦋', '🐯', '🐰', '🐨', '🐵', '🐧', '🐙', '🦈', '🦉', '🐺', '🦖'];
let editingProfileId = null;
let selectedAvatar = '🦁';

function openProfileEdit(id, profile) {
    editingProfileId = id;
    const overlay = document.getElementById('profileEditOverlay');
    const nameInput = document.getElementById('profileEditName');
    const title = document.getElementById('profileEditTitle');
    const picker = document.getElementById('avatarPicker');

    title.textContent = id ? 'Edit Player' : 'New Player';
    nameInput.value = profile ? profile.name : '';
    selectedAvatar = profile ? (profile.avatar || '🦁') : '🦁';

    // Render avatar picker
    picker.innerHTML = '';
    allAvatars.forEach(a => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'avatar-option' + (a === selectedAvatar ? ' selected' : '');
        btn.innerHTML = emojiToImg(a, 28);
        btn.addEventListener('click', () => {
            selectedAvatar = a;
            picker.querySelectorAll('.avatar-option').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
        });
        picker.appendChild(btn);
    });

    overlay.style.display = '';
    nameInput.focus();
}

document.getElementById('profileEditCloseBtn').addEventListener('click', () => {
    document.getElementById('profileEditOverlay').style.display = 'none';
});

document.getElementById('cancelProfileEditBtn').addEventListener('click', () => {
    document.getElementById('profileEditOverlay').style.display = 'none';
});

document.getElementById('saveProfileEditBtn').addEventListener('click', () => {
    const name = document.getElementById('profileEditName').value.trim();
    if (!name) { alert('Please enter a name'); return; }
    if (typeof db === 'undefined') return;

    if (editingProfileId) {
        // Update existing profile
        db.ref('profiles/' + editingProfileId).update({ name: name, avatar: selectedAvatar }).then(() => {
            document.getElementById('profileEditOverlay').style.display = 'none';
            loadProfileList();
            if (editingProfileId === currentProfile) {
                updateProfileIndicator(currentProfile);
            }
        });
    } else {
        // Create new profile
        const id = name.toLowerCase().replace(/[^a-z0-9]/g, '');
        if (!id) { alert('Invalid name'); return; }
        db.ref('profiles/' + id).set({ name: name, avatar: selectedAvatar }).then(() => {
            document.getElementById('profileEditOverlay').style.display = 'none';
            loadProfileList();
        });
    }
});

document.getElementById('profileEditOverlay').addEventListener('click', (e) => {
    if (e.target === document.getElementById('profileEditOverlay')) {
        document.getElementById('profileEditOverlay').style.display = 'none';
    }
});
