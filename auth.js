// auth.js — Simple password gate using SHA-256 hash comparison
// Password is never stored in plaintext; only the hash is checked client-side.
// Session persists in sessionStorage (cleared when browser tab closes).

(function () {
    var HASH = 'e09ea2d58c40230fffc8da9d52b5d1e69ea399f7a53939954bdeceb1daad46f6';
    var TOKEN_KEY = 'sk_auth';

    function isAuthenticated() {
        return sessionStorage.getItem(TOKEN_KEY) === HASH;
    }

    function showContent() {
        var gate = document.getElementById('authGate');
        var main = document.getElementById('appWrapper');
        if (gate) gate.style.display = 'none';
        if (main) main.style.display = '';
    }

    function hideContent() {
        var gate = document.getElementById('authGate');
        var main = document.getElementById('appWrapper');
        if (gate) gate.style.display = '';
        if (main) main.style.display = 'none';
    }

    // If already authenticated, show content immediately
    if (isAuthenticated()) {
        showContent();
        return;
    }

    // If there's no auth gate on this page (e.g. spelling.html), redirect to login
    if (!document.getElementById('authGate')) {
        if (!isAuthenticated()) {
            window.location.href = 'index.html';
            return;
        }
        return;
    }

    // Wire up the login form
    hideContent();
    var input = document.getElementById('authPassword');
    var btn = document.getElementById('authSubmit');
    var err = document.getElementById('authError');

    function attempt() {
        var pw = input.value;
        if (!pw) return;
        crypto.subtle.digest('SHA-256', new TextEncoder().encode(pw)).then(function (buf) {
            var hash = Array.from(new Uint8Array(buf)).map(function (b) {
                return b.toString(16).padStart(2, '0');
            }).join('');
            if (hash === HASH) {
                sessionStorage.setItem(TOKEN_KEY, HASH);
                err.textContent = '';
                showContent();
            } else {
                err.textContent = 'Wrong password';
                input.value = '';
                input.focus();
            }
        });
    }

    btn.addEventListener('click', attempt);
    input.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') attempt();
    });
    input.focus();
})();
