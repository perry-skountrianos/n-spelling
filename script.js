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
    showCelebration = localStorage.getItem(profileKey('showCelebration')) !== 'false';
    flashcardMuted = localStorage.getItem(profileKey('flashcardMuted')) === 'true';
    updateCelebrationToggleLabel();
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
let showCelebration = localStorage.getItem('showCelebration') !== 'false';
let flashcardMuted = localStorage.getItem('flashcardMuted') === 'true';

// Initialize speech synthesis
const synth = window.speechSynthesis;

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
        'ay': 'a', 'eh': 'a',
        'bee': 'b', 'be': 'b',
        'see': 'c', 'sea': 'c', 'cee': 'c',
        'dee': 'd',
        'ee': 'e',
        'ef': 'f', 'eff': 'f',
        'gee': 'g',
        'aitch': 'h', 'age': 'h', 'ach': 'h', 'each': 'h', 'h.': 'h',
        'eye': 'i', 'aye': 'i',
        'jay': 'j',
        'kay': 'k', 'okay': 'k',
        'el': 'l', 'ell': 'l',
        'em': 'm',
        'en': 'n',
        'oh': 'o',
        'pee': 'p',
        'queue': 'q', 'cue': 'q', 'kew': 'q', 'que': 'q',
        'are': 'r', 'ar': 'r',
        'es': 's', 'ess': 's', 'ass': 's',
        'tee': 't', 'tea': 't',
        'you': 'u', 'yu': 'u',
        'vee': 'v',
        'double you': 'w', 'doubleyou': 'w', 'dub': 'w',
        'ex': 'x',
        'why': 'y', 'wie': 'y', 'wye': 'y',
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
        synth.cancel();
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

function getVoice() {
    const voices = synth.getVoices();
    if (voices.length === 0) return null;
    const enGBVoices = voices.filter(v => v.lang === 'en-GB' || v.lang === 'en_GB');
    const britFemaleNames = [
        'Martha', 'Kate', 'Stephanie',
        'Hazel', 'Susan', 'Libby', 'Maisie', 'Sonia',
        'Google UK English Female'
    ];
    let selected = enGBVoices.find(v =>
        britFemaleNames.some(name => v.name.includes(name))
    );
    if (!selected) selected = enGBVoices[0];
    if (!selected) selected = voices.find(v => v.name.includes('Google UK English Female'));
    if (!selected) {
        const enVoices = voices.filter(v => v.lang.startsWith('en'));
        selected = enVoices.find(v => britFemaleNames.some(n => v.name.includes(n))) || enVoices[0] || voices[0];
    }
    return selected;
}

function speakWord() {
    // Cancel any ongoing speech
    synth.cancel();
    
    const word = getCurrentWord();
    
    // Visual feedback - show word is speaking
    spellingInput.placeholder = "Listening...";
    
    // Speak the word
    const wordUtterance = new SpeechSynthesisUtterance(word);
    wordUtterance.rate = 0.85;
    wordUtterance.pitch = 1.0;
    wordUtterance.volume = 1;
    const voice = getVoice();
    if (voice) wordUtterance.voice = voice;

    // On desktop, allow typing immediately while word is being spoken
    if (!isMobile) {
        hasHeardWord = true;
        updatePlaceholder();
        spellingInput.focus();
    }

    // Speak the sentence after the word
    const sentence = wordSentences[word];
    if (sentence) {
        wordUtterance.onend = () => {
            const sentenceUtterance = new SpeechSynthesisUtterance(sentence);
            sentenceUtterance.rate = 0.9;
            sentenceUtterance.pitch = 1.0;
            sentenceUtterance.volume = 1;
            if (voice) sentenceUtterance.voice = voice;

            sentenceUtterance.onend = () => {
                hasHeardWord = true;
                updatePlaceholder();
                spellingInput.focus();
                if (inputMode === 'speak' && !isMobile) startListening();
            };
            sentenceUtterance.onerror = (event) => {
                console.error('Speech error:', event.error);
            };
            synth.speak(sentenceUtterance);
        };
    } else {
        wordUtterance.onend = () => {
            hasHeardWord = true;
            updatePlaceholder();
            spellingInput.focus();
            if (inputMode === 'speak' && !isMobile) startListening();
        };
    }
    
    wordUtterance.onerror = (event) => {
        console.error('Speech error:', event.error);
    };
    
    synth.speak(wordUtterance);
}

function getRandomEncouragement() {
    const name = getProfileName();
    const phrases = [
        `You're so smart ${name}!`,
        "Your brain is amazing!",
        "You should be so proud!",
        `Look at you go ${name}!`,
        "You never give up and it shows!",
        "That was brilliant!",
        `Wow ${name}, you're getting better every time!`,
        "You worked so hard for that one!",
        "I knew you could do it!",
        `${name} the spelling superstar!`,
        "Your hard work is paying off!",
        "That's what practice looks like!",
        `Absolutely perfect ${name}!`,
        "You make it look easy!",
        "Nothing can stop you!",
        `You're unstoppable ${name}!`,
        "Every word you learn makes you stronger!",
        `Incredible effort ${name}!`,
    ];
    return phrases[Math.floor(Math.random() * phrases.length)];
}

function getRandomSnakeQuiz() {
    return animalQuizzes[Math.floor(Math.random() * animalQuizzes.length)];
}

function showSnakeCelebration() {
    const message = getRandomEncouragement();
    const quiz = getRandomSnakeQuiz();
    const overlay = document.createElement('div');
    overlay.className = 'snake-overlay';
    overlay.innerHTML = `
        <div class="snake-container">
            <div class="snake-body">
                <span class="snake-segment" style="animation-delay:0s">🟢</span><span class="snake-segment" style="animation-delay:0.05s">🟢</span><span class="snake-segment" style="animation-delay:0.1s">🟢</span><span class="snake-segment" style="animation-delay:0.15s">🟢</span><span class="snake-segment" style="animation-delay:0.2s">🟢</span><span class="snake-segment" style="animation-delay:0.25s">🟢</span><span class="snake-segment" style="animation-delay:0.3s">🟢</span><span class="snake-segment" style="animation-delay:0.35s">🟢</span><span class="snake-segment" style="animation-delay:0.4s">🐍</span>
            </div>
            <div class="snake-speech">${message}</div>
            <div class="snake-quiz">
                <div class="quiz-question">🐍 ${quiz.question}</div>
                <div class="quiz-options">
                    ${quiz.options.map((opt, i) => `<button class="quiz-option" data-index="${i}">${opt}</button>`).join('')}
                </div>
                <div class="quiz-feedback"></div>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);

    // Speak the encouragement, question, and options in one utterance
    synth.cancel();
    const optionsText = quiz.options.map((opt, i) => `${i + 1}: ${opt}`).join('. ');
    const fullSpeech = message + '. ' + quiz.question + ' ' + optionsText;
    const utterance = new SpeechSynthesisUtterance(fullSpeech);
    utterance.rate = 0.95;
    utterance.pitch = 1.1;
    utterance.volume = 1;
    const voice = getVoice();
    if (voice) utterance.voice = voice;
    synth.speak(utterance);

    // Handle quiz option clicks
    const optionBtns = overlay.querySelectorAll('.quiz-option');
    const feedbackDiv = overlay.querySelector('.quiz-feedback');
    let quizAnswered = false;

    optionBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            if (quizAnswered) return;
            quizAnswered = true;

            const chosen = parseInt(btn.dataset.index);
            const correct = chosen === quiz.answer;

            // Highlight correct/wrong
            optionBtns.forEach(b => {
                const idx = parseInt(b.dataset.index);
                if (idx === quiz.answer) {
                    b.classList.add('quiz-correct');
                } else if (idx === chosen && !correct) {
                    b.classList.add('quiz-wrong');
                }
                b.disabled = true;
            });

            // Show explanation
            feedbackDiv.innerHTML = `<span class="${correct ? 'quiz-right' : 'quiz-not-right'}">${correct ? '✓ Correct!' : '✗ Not quite!'}</span> ${quiz.explanation}`;
            feedbackDiv.style.display = 'block';

            // Speak the result
            synth.cancel();
            const resultText = correct ? "Correct! " + quiz.explanation : "Not quite. " + quiz.explanation;
            const resultUtterance = new SpeechSynthesisUtterance(resultText);
            resultUtterance.rate = 0.95;
            resultUtterance.pitch = 1.0;
            resultUtterance.volume = 1;
            if (voice) resultUtterance.voice = voice;
            synth.speak(resultUtterance);

            // Dismiss after reading explanation
            let dismissed = false;
            function dismiss() {
                if (dismissed) return;
                dismissed = true;
                overlay.classList.add('fade-out');
                setTimeout(() => overlay.remove(), 400);
            }
            resultUtterance.onend = () => setTimeout(dismiss, 1000);
            resultUtterance.onerror = dismiss;
            setTimeout(dismiss, 12000);
        });
    });
}

function checkSpelling() {
    stopListening();
    const userInput = spellingInput.value.trim().toLowerCase();
    const correctWord = getCurrentWord();
    
    if (!userInput) {
        return;
    }
    
    const isCorrect = userInput === correctWord;
    
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
        if (showCelebration) {
            showSnakeCelebration();
        }
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
        synth.cancel();
        const explanation = explainMistake(userInput, correctWord);
        const spellOut = `The correct spelling is: ${correctWord.toLowerCase().split('').join(', ')}. ${explanation}`;
        const feedbackUtterance = new SpeechSynthesisUtterance(spellOut);
        feedbackUtterance.rate = 0.9;
        feedbackUtterance.pitch = 1.0;
        feedbackUtterance.volume = 1;
        const voice = getVoice();
        if (voice) feedbackUtterance.voice = voice;
        feedbackUtterance.onend = () => {
            spellingInput.disabled = false;
            spellingInput.focus();
        };
        feedbackUtterance.onerror = () => {
            spellingInput.disabled = false;
            spellingInput.focus();
        };
        synth.speak(feedbackUtterance);
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
            synth.cancel();
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
    synth.cancel();
    showProfileScreen();
});

// Celebration toggle
const celebrationToggle = document.getElementById('celebrationToggle');
function updateCelebrationToggleLabel() {
    const checkIcon = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5.8 11.3 2 22l10.7-3.8"/><path d="M4 3h.01"/><path d="M22 8h.01"/><path d="M15 2h.01"/><path d="M22 20h.01"/><path d="m22 2-2.24.75a2.9 2.9 0 0 0-1.96 3.12v0c.1.86-.57 1.63-1.45 1.63h-.38c-.86 0-1.6.6-1.76 1.44L14 10"/><path d="m22 13-.82-.33c-.86-.34-1.82.2-1.98 1.11v0c-.11.7-.72 1.22-1.43 1.22H17"/><path d="m11 2 .33.82c.34.86-.2 1.82-1.11 1.98v0C9.52 4.9 9 5.52 9 6.23V7"/><path d="M11 13c1.93 1.93 2.83 4.17 2 5-.83.83-3.07-.07-5-2-1.93-1.93-2.83-4.17-2-5 .83-.83 3.07.07 5 2Z"/></svg>';
    celebrationToggle.innerHTML = showCelebration
        ? checkIcon + ' Celebration ✓'
        : checkIcon + ' Celebration';
}
updateCelebrationToggleLabel();
celebrationToggle.addEventListener('click', () => {
    showCelebration = !showCelebration;
    localStorage.setItem(profileKey('showCelebration'), showCelebration);
    updateCelebrationToggleLabel();
    gearDropdown.classList.remove('show');
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
    synth.cancel();
    const letters = document.querySelectorAll('#flashcardWord .letter');
    const voice = getVoice();

    // Speak the word first
    const wordUtterance = new SpeechSynthesisUtterance(word);
    wordUtterance.rate = 0.8;
    wordUtterance.pitch = 1.0;
    if (voice) wordUtterance.voice = voice;

    wordUtterance.onend = () => {
        // Spell letter by letter, chained via onend
        letters.forEach(l => l.classList.remove('highlight'));
        speakLetterAt(0);
    };

    function speakLetterAt(i) {
        if (i >= letters.length) {
            // All letters done — remove highlights, all black
            letters.forEach(l => l.classList.remove('highlight'));
            // Speak the word again
            setTimeout(() => {
                const again = new SpeechSynthesisUtterance(word);
                again.rate = 0.85;
                if (voice) again.voice = voice;
                again.onend = () => {
                    // Speak the sentence
                    const sentence = wordSentences[word];
                    const tip = spellingTips[word];
                    const speakTip = () => {
                        if (tip) {
                            const tipUtterance = new SpeechSynthesisUtterance(tip);
                            tipUtterance.rate = 0.9;
                            if (voice) tipUtterance.voice = voice;
                            tipUtterance.onend = () => advanceSlideshow();
                            synth.speak(tipUtterance);
                        } else {
                            advanceSlideshow();
                        }
                    };
                    if (sentence) {
                        const sentenceUtterance = new SpeechSynthesisUtterance(sentence);
                        sentenceUtterance.rate = 0.9;
                        if (voice) sentenceUtterance.voice = voice;
                        sentenceUtterance.onend = speakTip;
                        synth.speak(sentenceUtterance);
                    } else {
                        speakTip();
                    }
                };
                synth.speak(again);
            }, 300);
            return;
        }
        // Highlight current letter
        letters.forEach(l => l.classList.remove('highlight'));
        letters[i].classList.add('highlight');
        // Speak the letter
        const letterUtterance = new SpeechSynthesisUtterance(word[i].toLowerCase());
        letterUtterance.rate = 0.7;
        if (voice) letterUtterance.voice = voice;
        letterUtterance.onend = () => speakLetterAt(i + 1);
        synth.speak(letterUtterance);
    }

    synth.speak(wordUtterance);
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
        if (!synth.speaking) {
            showFlashcard();
        }
    } else {
        synth.cancel();
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
        synth.cancel();
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

// ===== CAR MODE =====
let carActive = false;
let carWords = [];
let carIndex = 0;
let carLetters = '';
let carCorrect = 0;
let carWrong = 0;
let carRecognition = null;
let carListening = false;
let carSpeaking = false;

function carSpeak(text, rate, onDone) {
    synth.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = rate || 0.9;
    u.pitch = 1.0;
    u.volume = 1;
    const voice = getVoice();
    if (voice) u.voice = voice;
    carSpeaking = true;
    let called = false;
    function done() { if (called) return; called = true; carSpeaking = false; if (onDone) onDone(); }
    u.onend = done;
    u.onerror = done;
    synth.speak(u);
}

// Quick echo without stopping recognition
function carEcho(letter) {
    const u = new SpeechSynthesisUtterance(letter);
    u.rate = 1.1;
    u.pitch = 1.0;
    u.volume = 1;
    const voice = getVoice();
    if (voice) u.voice = voice;
    synth.speak(u);
}

function carSpeakLetters(word, onDone) {
    const letters = word.split('');
    let i = 0;
    function next() {
        if (i >= letters.length) { if (onDone) onDone(); return; }
        const u = new SpeechSynthesisUtterance(letters[i]);
        u.rate = 0.7;
        u.pitch = 1.0;
        u.volume = 1;
        const voice = getVoice();
        if (voice) u.voice = voice;
        u.onend = () => { i++; next(); };
        u.onerror = () => { i++; next(); };
        synth.speak(u);
    }
    next();
}

function carUpdateUI() {
    const el = document.getElementById('carLetters');
    const prog = document.getElementById('carProgress');
    const status = document.getElementById('carStatus');
    const score = document.getElementById('carScore');
    el.textContent = carLetters.toUpperCase();
    el.className = 'car-letters';
    prog.textContent = (carIndex + 1) + ' / ' + carWords.length;
    status.textContent = carSpeaking ? '' : 'Listening...';
    const done = carCorrect + carWrong;
    score.textContent = done > 0 ? carCorrect + ' correct, ' + carWrong + ' wrong' : '';
}

function carStartRecognition() {
    if (!SpeechRecognition) return;
    carStopRecognition();

    const rec = new SpeechRecognition();
    carRecognition = rec;
    rec.continuous = !isMobile;
    rec.interimResults = !isMobile;
    rec.lang = 'en-GB';

    rec.onresult = (event) => {
        if (carSpeaking || !carActive || carRecognition !== rec) return;
        for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript.trim().toLowerCase();
            const isFinal = event.results[i].isFinal;
            if (!isFinal && isMobile) continue; // Mobile: only process final results
            document.getElementById('carStatus').textContent = transcript;

            const parts = transcript.split(/[\s,.\-]+/);
            let hasCommand = false;
            let newLetters = [];
            for (const part of parts) {
                // Commands
                if (part === 'check' || part === 'done' || part === 'submit') {
                    carCheck(); return;
                }
                if (part === 'repeat' || part === 'again') {
                    carPresentWord(); return;
                }
                if (part === 'clear' || part === 'reset') {
                    carLetters = '';
                    carUpdateUI();
                    carSpeak('Cleared.', 0.9);
                    return;
                }
                if (part === 'skip' || part === 'next') {
                    carSkip(); return;
                }
                if (part === 'score') {
                    carAnnounceScore(); return;
                }
                if (part === 'stop' || part === 'exit' || part === 'quit') {
                    carExit(); return;
                }
                // Letters
                let letter = null;
                if (part.length === 1 && /[a-z]/.test(part)) {
                    letter = part;
                } else {
                    letter = spokenToLetter(part);
                }
                if (letter) newLetters.push(letter);
            }
            // Add all recognized letters at once
            if (newLetters.length > 0) {
                if (isMobile) {
                    // Mobile: batch — replace with all letters from this utterance
                    carLetters += newLetters.join('');
                } else {
                    // Desktop: incremental
                    carLetters += newLetters.join('');
                }
                carUpdateUI();
            }
        }
    };

    rec.onend = () => {
        if (carActive && carRecognition === rec) {
            // Auto-restart — immediately on mobile for quick turnaround
            const delay = isMobile ? 50 : 200;
            setTimeout(() => {
                if (carActive && carRecognition === rec) {
                    try { rec.start(); } catch(e) {}
                }
            }, delay);
        }
    };

    rec.onerror = (event) => {
        if (event.error === 'no-speech' || event.error === 'aborted') return;
    };

    try { rec.start(); carListening = true; } catch(e) {}
    document.getElementById('carMicRing').classList.add('listening');
}

function carStopRecognition() {
    carListening = false;
    document.getElementById('carMicRing').classList.remove('listening');
    if (carRecognition) {
        carRecognition.onend = null;
        carRecognition.onresult = null;
        carRecognition.onerror = null;
        try { carRecognition.abort(); } catch(e) {}
        carRecognition = null;
    }
}

function carPresentWord() {
    if (carIndex >= carWords.length) { carFinish(); return; }
    const word = carWords[carIndex];
    const sentence = wordSentences[word] || '';
    carLetters = '';
    carUpdateUI();
    document.getElementById('carWord').textContent = '';
    carStopRecognition();

    let speech = word + '. ';
    if (sentence) speech += sentence;

    carSpeak(speech, 0.9, () => {
        document.getElementById('carStatus').textContent = 'Listening...';
        carStartRecognition();
    });
}

function carCheck() {
    if (!carActive) return;
    const word = carWords[carIndex];
    const attempt = carLetters.toLowerCase();
    const el = document.getElementById('carLetters');

    carStopRecognition();

    if (attempt === word) {
        carCorrect++;
        el.className = 'car-letters correct';
        carSpeak('Correct! ' + word + '.', 0.95, () => {
            carAdvance();
        });
    } else {
        carWrong++;
        el.className = 'car-letters wrong';
        const correctSpelling = word.split('').join(', ');
        carSpeak('Wrong. The correct spelling is', 0.9, () => {
            carSpeakLetters(word, () => {
                carSpeak(word, 0.85, () => {
                    carAdvance();
                });
            });
        });
    }
    // Save result to main session too
    resultsArray.push({ word: word, typed: attempt, isCorrect: attempt === word });
    saveProgress();
    updateScoreDisplay();
    displayResults();
}

function carSkip() {
    if (!carActive) return;
    const word = carWords[carIndex];
    carWrong++;
    document.getElementById('carLetters').className = 'car-letters wrong';
    resultsArray.push({ word: word, typed: '', isCorrect: false });
    saveProgress();
    updateScoreDisplay();
    displayResults();
    carStopRecognition();
    carSpeak('Skipped. The word was ' + word + '.', 0.9, () => {
        carAdvance();
    });
}

function carAdvance() {
    carIndex++;
    if (carIndex >= carWords.length) { carFinish(); return; }
    // Announce score every 5 words
    if (carIndex % 5 === 0) {
        const done = carCorrect + carWrong;
        carSpeak(carCorrect + ' correct, ' + carWrong + ' wrong, ' + (carWords.length - done) + ' remaining.', 0.9, () => {
            carPresentWord();
        });
    } else {
        carPresentWord();
    }
}

function carAnnounceScore() {
    const done = carCorrect + carWrong;
    const remaining = carWords.length - done;
    carSpeak(carCorrect + ' correct, ' + carWrong + ' wrong, ' + remaining + ' remaining.', 0.9);
}

function carFinish() {
    carStopRecognition();
    const total = carCorrect + carWrong;
    carSpeak('All done! You got ' + carCorrect + ' out of ' + total + ' correct. Great job ' + getProfileName() + '!', 0.95, () => {
        carExit();
    });
}

function carExit() {
    carActive = false;
    synth.cancel();
    carStopRecognition();
    carRecognition = null;
    document.getElementById('carOverlay').style.display = 'none';
    // Restore main UI
    if (currentWordIndex < words.length) {
        currentWordIndex = resultsArray.length;
    }
}

function startCarMode() {
    // Stop the main speech recognition so it doesn't compete
    stopListening();
    if (recognition) { try { recognition.abort(); } catch(e) {} }

    // Use the current word list, shuffled fresh
    carWords = [...words];
    shuffleArray(carWords);
    carIndex = 0;
    carLetters = '';
    carCorrect = 0;
    carWrong = 0;
    carActive = true;
    carSpeaking = false;

    // Reset main session for car mode results
    resultsArray = [];
    currentWordIndex = 0;

    document.getElementById('carOverlay').style.display = 'flex';
    document.getElementById('carWord').textContent = '';
    document.getElementById('carScore').textContent = '';
    carUpdateUI();
    saveProgress();
    updateScoreDisplay();

    // Welcome message then start
    carSpeak("Car Mode. I'll read each word and a sentence. Say all the letters, then say check. Say repeat to hear again, skip to skip, or stop to exit.", 0.95, () => {
        carPresentWord();
    });
}

document.getElementById('carStopBtn').addEventListener('click', () => {
    carExit();
});

// Tap anywhere on car screen to repeat word
document.getElementById('carScreen').addEventListener('click', (e) => {
    if (e.target.closest('.car-stop')) return;
    if (carActive && !carSpeaking) carPresentWord();
});

document.getElementById('carModeBtn').addEventListener('click', () => {
    gearDropdown.classList.remove('show');
    startCarMode();
});

document.getElementById('carCircleBtn').addEventListener('click', () => {
    startCarMode();
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
