// The words list is loaded from words.js

let currentWordIndex = 0;
let hasAnswered = false;
let hasHeardWord = false;
let resultsArray = [];
let inputMode = 'type'; // 'type' or 'speak'
let recognition = null;
let isListening = false;
const hasSpeechRecognition = !!(window.SpeechRecognition || window.webkitSpeechRecognition);
const tapKeyboard = document.getElementById('tapKeyboard');

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
const typeModeBtn = document.getElementById('typeModeBtn');
const speakModeBtn = document.getElementById('speakModeBtn');
const hearBtn = document.getElementById('hearBtn');
const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

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
    typeModeBtn.classList.toggle('active', mode === 'type');
    speakModeBtn.classList.toggle('active', mode === 'speak');

    if (mode === 'type') {
        stopListening();
        tapKeyboard.style.display = 'none';
        spellingInput.readOnly = false;
    } else {
        if (hasSpeechRecognition) {
            startListening();
        }
        tapKeyboard.style.display = 'block';
        if (isMobile) {
            spellingInput.readOnly = true; // prevent native keyboard on mobile
        }
    }
    updatePlaceholder();
    updateHearBtn();
    if (mode === 'type') spellingInput.focus();
}

typeModeBtn.addEventListener('click', () => setMode('type'));
speakModeBtn.addEventListener('click', () => setMode('speak'));

// Label the speak button appropriately
if (!hasSpeechRecognition) {
    speakModeBtn.textContent = 'Tap';
}

// Hear button
hearBtn.addEventListener('click', () => {
    handleInputAction();
});

function updateHearBtn() {
    if (!isMobile) {
        hearBtn.style.display = 'none';
        return;
    }
    hearBtn.style.display = 'block';
    if (!hasHeardWord) {
        hearBtn.textContent = '🔊 Hear Word';
    } else if (!hasAnswered) {
        hearBtn.textContent = '🔊 Repeat';
    } else {
        hearBtn.textContent = '▶ Next Word';
    }
}

// Tap keyboard handler
tapKeyboard.addEventListener('click', (e) => {
    const key = e.target.closest('.tap-key');
    if (!key) return;
    if (!hasHeardWord) {
        handleInputAction();
        return;
    }
    if (hasAnswered) {
        handleInputAction();
        return;
    }
    const letter = key.dataset.letter;
    const action = key.dataset.action;
    if (letter) {
        spellingInput.value += letter;
    } else if (action === 'delete') {
        spellingInput.value = spellingInput.value.slice(0, -1);
    } else if (action === 'enter') {
        handleInputAction();
    }
});

function getCurrentWord() {
    return words[currentWordIndex];
}

function updatePlaceholder() {
    if (!hasHeardWord) {
        spellingInput.placeholder = isMobile ? "Tap Hear Word ☝️" : "Hit Enter";
    } else if (!hasAnswered) {
        if (inputMode === 'speak') {
            spellingInput.placeholder = hasSpeechRecognition ? "Speak or type..." : "Tap the letters";
        } else {
            spellingInput.placeholder = "Type it";
        }
    } else {
        spellingInput.placeholder = isMobile ? "Tap Next Word ☝️" : "Enter for next";
    }
    updateHearBtn();
}

function updateScoreDisplay() {
    const answered = resultsArray.length;
    const correct = resultsArray.filter(r => r.isCorrect).length;
    const wrong = answered - correct;
    const total = words.length;

    // Update donut charts
    const correctPct = total > 0 ? (correct / total) * 100 : 0;
    const wrongPct = total > 0 ? (wrong / total) * 100 : 0;

    document.getElementById('donutCorrect').setAttribute('stroke-dasharray', `${correctPct} ${100 - correctPct}`);
    document.getElementById('donutWrong').setAttribute('stroke-dasharray', `${wrongPct} ${100 - wrongPct}`);
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
        resultsDisplay.appendChild(div);
    });
}

function saveProgress() {
    const sessionData = {
        resultsArray: resultsArray,
        currentWordIndex: currentWordIndex,
        words: words,
        timestamp: new Date().toISOString()
    };
    localStorage.setItem('spellingSession', JSON.stringify(sessionData));
    // Sync to Firebase
    if (typeof db !== 'undefined') {
        db.ref('sessions/niko').set(sessionData).catch(e => console.warn('Firebase save failed:', e));
    }
}

function clearProgress() {
    localStorage.removeItem('spellingSession');
    if (typeof db !== 'undefined') {
        db.ref('sessions/niko').remove().catch(e => console.warn('Firebase clear failed:', e));
    }
}

async function loadProgress() {
    // Try Firebase first (cross-device), fall back to localStorage
    if (typeof db !== 'undefined') {
        try {
            const snapshot = await db.ref('sessions/niko').once('value');
            const sessionData = snapshot.val();
            if (sessionData && sessionData.words && sessionData.resultsArray) {
                resultsArray = sessionData.resultsArray;
                currentWordIndex = sessionData.currentWordIndex;
                words = sessionData.words;
                return true;
            }
        } catch(e) {
            console.warn('Firebase load failed, trying localStorage:', e);
        }
    }
    const saved = localStorage.getItem('spellingSession');
    if (saved) {
        const sessionData = JSON.parse(saved);
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
    const enGBVoices = voices.filter(v => v.lang === 'en-GB');
    const britFemaleNames = [
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
        selected = enVoices[0] || voices[0];
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
                if (inputMode === 'speak') startListening();
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
            if (inputMode === 'speak') startListening();
        };
    }
    
    wordUtterance.onerror = (event) => {
        console.error('Speech error:', event.error);
    };
    
    synth.speak(wordUtterance);
}

function getRandomEncouragement() {
    const phrases = [
        "You're so smart Niko!",
        "Your brain is amazing!",
        "You should be so proud!",
        "Look at you go Niko!",
        "You never give up and it shows!",
        "That was brilliant!",
        "Wow Niko, you're getting better every time!",
        "You worked so hard for that one!",
        "I knew you could do it!",
        "Niko the spelling superstar!",
        "Your hard work is paying off!",
        "That's what practice looks like!",
        "Absolutely perfect Niko!",
        "You make it look easy!",
        "Nothing can stop you!",
        "You're unstoppable Niko!",
        "Every word you learn makes you stronger!",
        "Incredible effort Niko!",
    ];
    return phrases[Math.floor(Math.random() * phrases.length)];
}

function showSnakeCelebration() {
    const message = getRandomEncouragement();
    const overlay = document.createElement('div');
    overlay.className = 'snake-overlay';
    overlay.innerHTML = `
        <div class="snake-container">
            <div class="snake-body">
                <span class="snake-segment" style="animation-delay:0s">🟢</span><span class="snake-segment" style="animation-delay:0.05s">🟢</span><span class="snake-segment" style="animation-delay:0.1s">🟢</span><span class="snake-segment" style="animation-delay:0.15s">🟢</span><span class="snake-segment" style="animation-delay:0.2s">🟢</span><span class="snake-segment" style="animation-delay:0.25s">🟢</span><span class="snake-segment" style="animation-delay:0.3s">🟢</span><span class="snake-segment" style="animation-delay:0.35s">🟢</span><span class="snake-segment" style="animation-delay:0.4s">🐍</span>
            </div>
            <div class="snake-speech">${message}</div>
        </div>
    `;
    document.body.appendChild(overlay);

    // Speak the encouragement
    synth.cancel();
    const utterance = new SpeechSynthesisUtterance(message);
    utterance.rate = 1.0;
    utterance.pitch = 1.2;
    utterance.volume = 1;
    const voice = getVoice();
    if (voice) utterance.voice = voice;
    synth.speak(utterance);

    setTimeout(() => {
        overlay.classList.add('fade-out');
        setTimeout(() => overlay.remove(), 400);
    }, 1800);
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
        showSnakeCelebration();
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
        const spellOut = `The correct spelling is: ${correctWord.split('').join(', ')}. ${explanation}`;
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
}

function restartGame() {
    // Clear saved progress
    clearProgress();
    
    // Shuffle words for next round
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
});

// Global Enter key handler (works even if textbox not focused)
document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        spellingInput.focus();
        handleInputAction();
    }
});

// Shuffle/load words on page load
window.addEventListener('load', async () => {
    const hasSession = await loadProgress();
    
    if (!hasSession) {
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
    spellingInput.focus();

    // Auto-select tap mode on mobile
    if (isMobile) {
        setMode('speak');
    }
});

// Restart button
restartBtn2.addEventListener('click', restartGame);

// Reset button (parents only)
resetBtn.addEventListener('click', () => {
    const password = prompt('Parent password to reset all progress:');
    if (password === 'read123') {
        clearProgress();
        location.reload();
    } else if (password !== null) {
        alert('Incorrect password');
    }
});
