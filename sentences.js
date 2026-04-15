// sentences.js — Sentence Builder logic
// Drag-and-drop word tiles from the bank into the drop zone to build the sentence.
// Supports both mouse and touch (iPad-friendly).

(function () {
    var items = [];
    var index = 0;
    var correct = 0;
    var wrong = 0;
    var ROUND_SIZE = 10;

    // DOM refs
    var pictureImg = document.getElementById('pictureImg');
    var dropArea = document.getElementById('dropArea');
    var wordBank = document.getElementById('wordBank');
    var placeholderText = document.getElementById('placeholderText');
    var progressEl = document.getElementById('progress');
    var scoreEl = document.getElementById('score');
    var checkBtn = document.getElementById('checkBtn');
    var clearBtn = document.getElementById('clearBtn');
    var feedback = document.getElementById('feedback');
    var feedbackIcon = document.getElementById('feedbackIcon');
    var feedbackText = document.getElementById('feedbackText');
    var nextBtn = document.getElementById('nextBtn');
    var endScreen = document.getElementById('endScreen');
    var endScore = document.getElementById('endScore');
    var againBtn = document.getElementById('againBtn');
    var homeBtn = document.getElementById('homeBtn');
    var backBtn = document.getElementById('backBtn');

    // --- Shuffle helper ---
    function shuffle(arr) {
        var a = arr.slice();
        for (var i = a.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var t = a[i]; a[i] = a[j]; a[j] = t;
        }
        return a;
    }

    // --- Start game ---
    function startGame() {
        items = shuffle(SENTENCE_DATA).slice(0, ROUND_SIZE);
        index = 0;
        correct = 0;
        wrong = 0;
        endScreen.style.display = 'none';
        feedback.style.display = 'none';
        presentSentence();
    }

    // --- Present a sentence ---
    function presentSentence() {
        var item = items[index];
        pictureImg.src = item.image;
        pictureImg.alt = item.words.filter(function(w) { return w !== '.'; }).join(' ');

        // Build shuffled word list (correct words + distractors)
        var allWords = item.words.concat(item.distractors || []);
        var shuffled = shuffle(allWords);

        // Clear areas
        dropArea.innerHTML = '';
        wordBank.innerHTML = '';
        dropArea.appendChild(placeholderText);
        placeholderText.style.display = '';
        dropArea.className = 'drop-area';

        // Create tiles in bank
        shuffled.forEach(function (word) {
            var tile = createTile(word);
            wordBank.appendChild(tile);
        });

        updateProgress();
    }

    // --- Create a draggable word tile ---
    function createTile(word) {
        var tile = document.createElement('div');
        tile.className = 'word-tile';
        tile.textContent = word;
        tile.setAttribute('data-word', word);
        if (word === '.' || word === '!' || word === '?') {
            tile.classList.add('punctuation');
        }

        // Desktop: drag events
        tile.draggable = true;
        tile.addEventListener('dragstart', function (e) {
            e.dataTransfer.setData('text/plain', word);
            tile.classList.add('dragging');
            setTimeout(function () { tile.style.opacity = '0.4'; }, 0);
        });
        tile.addEventListener('dragend', function () {
            tile.classList.remove('dragging');
            tile.style.opacity = '';
        });

        // Touch: custom drag
        var touchData = null;
        tile.addEventListener('touchstart', function (e) {
            if (e.touches.length !== 1) return;
            var touch = e.touches[0];
            var rect = tile.getBoundingClientRect();
            touchData = {
                el: tile,
                clone: null,
                offsetX: touch.clientX - rect.left,
                offsetY: touch.clientY - rect.top,
                startX: touch.clientX,
                startY: touch.clientY,
                moved: false
            };
        }, { passive: true });

        tile.addEventListener('touchmove', function (e) {
            if (!touchData) return;
            e.preventDefault();
            var touch = e.touches[0];

            if (!touchData.moved) {
                var dx = touch.clientX - touchData.startX;
                var dy = touch.clientY - touchData.startY;
                if (Math.abs(dx) < 5 && Math.abs(dy) < 5) return;
                touchData.moved = true;

                // Create floating clone
                var clone = tile.cloneNode(true);
                clone.style.position = 'fixed';
                clone.style.zIndex = '9999';
                clone.style.pointerEvents = 'none';
                clone.style.transform = 'scale(1.1)';
                clone.style.boxShadow = '0 6px 20px rgba(0,0,0,0.15)';
                document.body.appendChild(clone);
                touchData.clone = clone;
                tile.style.opacity = '0.3';
            }

            if (touchData.clone) {
                touchData.clone.style.left = (touch.clientX - touchData.offsetX) + 'px';
                touchData.clone.style.top = (touch.clientY - touchData.offsetY) + 'px';
            }

            // Highlight drop zone
            var dropRect = dropArea.getBoundingClientRect();
            if (touch.clientX >= dropRect.left && touch.clientX <= dropRect.right &&
                touch.clientY >= dropRect.top && touch.clientY <= dropRect.bottom) {
                dropArea.classList.add('drag-over');
            } else {
                dropArea.classList.remove('drag-over');
            }
        }, { passive: false });

        tile.addEventListener('touchend', function (e) {
            if (!touchData) return;
            dropArea.classList.remove('drag-over');

            if (touchData.clone) {
                document.body.removeChild(touchData.clone);
            }
            tile.style.opacity = '';

            if (touchData.moved) {
                var touch = e.changedTouches[0];
                var dropRect = dropArea.getBoundingClientRect();
                if (touch.clientX >= dropRect.left && touch.clientX <= dropRect.right &&
                    touch.clientY >= dropRect.top && touch.clientY <= dropRect.bottom) {
                    addToDropZone(tile);
                }
            } else {
                // Tap = add to drop zone (or remove if already there)
                if (tile.parentNode === dropArea) {
                    removeFromDropZone(tile);
                } else {
                    addToDropZone(tile);
                }
            }
            touchData = null;
        });

        // Click to toggle (desktop fallback)
        tile.addEventListener('click', function () {
            if (tile.parentNode === dropArea) {
                removeFromDropZone(tile);
            } else if (tile.parentNode === wordBank) {
                addToDropZone(tile);
            }
        });

        return tile;
    }

    // --- Drop zone management ---
    function addToDropZone(tile) {
        dropArea.appendChild(tile);
        tile.classList.add('in-drop');
        placeholderText.style.display = 'none';
    }

    function removeFromDropZone(tile) {
        wordBank.appendChild(tile);
        tile.classList.remove('in-drop');
        if (dropArea.querySelectorAll('.word-tile').length === 0) {
            placeholderText.style.display = '';
        }
    }

    // --- Drop area: desktop drag-and-drop ---
    dropArea.addEventListener('dragover', function (e) {
        e.preventDefault();
        dropArea.classList.add('drag-over');
    });
    dropArea.addEventListener('dragleave', function () {
        dropArea.classList.remove('drag-over');
    });
    dropArea.addEventListener('drop', function (e) {
        e.preventDefault();
        dropArea.classList.remove('drag-over');
        var word = e.dataTransfer.getData('text/plain');
        // Find the dragging tile in the bank
        var tiles = wordBank.querySelectorAll('.word-tile.dragging');
        if (tiles.length > 0) {
            addToDropZone(tiles[0]);
            tiles[0].classList.remove('dragging');
        }
    });

    // --- Check answer ---
    function getDroppedWords() {
        var tiles = dropArea.querySelectorAll('.word-tile');
        var words = [];
        tiles.forEach(function (t) { words.push(t.getAttribute('data-word')); });
        return words;
    }

    function checkAnswer() {
        var item = items[index];
        var dropped = getDroppedWords();
        var isCorrect = dropped.length === item.words.length &&
            dropped.every(function (w, i) { return w === item.words[i]; });

        if (isCorrect) {
            correct++;
            dropArea.className = 'drop-area correct';
            feedbackIcon.textContent = '⭐';
            feedbackText.textContent = 'Great job!';
        } else {
            wrong++;
            dropArea.className = 'drop-area wrong';
            feedbackIcon.textContent = '🤔';
            var correctSentence = item.words.join(' ').replace(' .', '.').replace(' !', '!').replace(' ?', '?');
            feedbackText.textContent = 'The answer is: ' + correctSentence;
        }

        updateProgress();
        setTimeout(function () {
            feedback.style.display = '';
        }, 600);
    }

    // --- Next sentence ---
    function nextSentence() {
        feedback.style.display = 'none';
        index++;
        if (index >= items.length) {
            showEnd();
        } else {
            presentSentence();
        }
    }

    // --- End screen ---
    function showEnd() {
        endScreen.style.display = '';
        endScore.textContent = correct + ' out of ' + items.length + ' correct';
    }

    // --- Clear drop zone ---
    function clearDrop() {
        var tiles = Array.from(dropArea.querySelectorAll('.word-tile'));
        tiles.forEach(function (t) { removeFromDropZone(t); });
        dropArea.className = 'drop-area';
    }

    // --- Update progress display ---
    function updateProgress() {
        progressEl.textContent = (index + 1) + ' / ' + items.length;
        var total = correct + wrong;
        scoreEl.textContent = total > 0 ? correct + ' ✓  ' + wrong + ' ✗' : '';
    }

    // --- Wire up buttons ---
    checkBtn.addEventListener('click', checkAnswer);
    clearBtn.addEventListener('click', clearDrop);
    nextBtn.addEventListener('click', nextSentence);
    againBtn.addEventListener('click', startGame);
    homeBtn.addEventListener('click', function () { window.location.href = 'index.html'; });
    backBtn.addEventListener('click', function () { window.location.href = 'index.html'; });

    // --- Start ---
    startGame();
})();
