// Shared profile module used across the app suite.
// Stores the profiles list in localStorage and the currently-selected profile
// id under the same `currentProfile` key already used by the spelling app.
(function (global) {
    const PROFILES_KEY = 'profilesList';
    const CURRENT_KEY  = 'currentProfile';

    const DEFAULT_PROFILES = [
        { id: 'nicholas',    name: 'Nicholas',    avatar: '🦁' },
        { id: 'constantine', name: 'Constantine', avatar: '🐯' }
    ];

    function loadList() {
        try {
            const raw = localStorage.getItem(PROFILES_KEY);
            if (raw) {
                const arr = JSON.parse(raw);
                if (Array.isArray(arr) && arr.length) return arr;
            }
        } catch (e) { /* ignore */ }
        localStorage.setItem(PROFILES_KEY, JSON.stringify(DEFAULT_PROFILES));
        return DEFAULT_PROFILES.slice();
    }

    function saveList(list) {
        localStorage.setItem(PROFILES_KEY, JSON.stringify(list));
    }

    function getCurrentId() {
        return localStorage.getItem(CURRENT_KEY) || '';
    }

    function setCurrentId(id) {
        if (id) localStorage.setItem(CURRENT_KEY, id);
        else    localStorage.removeItem(CURRENT_KEY);
    }

    function getCurrent() {
        const id = getCurrentId();
        if (!id) return null;
        return loadList().find(p => p.id === id) || null;
    }

    function clearCurrent() {
        localStorage.removeItem(CURRENT_KEY);
    }

    // Renders a profile selection screen into `container`.
    // onSelect(profile) is called when the user picks a profile.
    function renderGate(container, onSelect) {
        const list = loadList();
        container.innerHTML = `
            <div class="profile-gate-inner">
                <h1 class="profile-gate-title">Who's playing?</h1>
                <div class="profile-gate-list"></div>
            </div>
        `;
        const listEl = container.querySelector('.profile-gate-list');
        list.forEach(profile => {
            const card = document.createElement('button');
            card.type = 'button';
            card.className = 'profile-gate-card';
            card.dataset.profile = profile.id;
            card.innerHTML = `
                <div class="profile-gate-circle">
                    <span class="profile-gate-avatar">${profile.avatar}</span>
                </div>
                <div class="profile-gate-name">${profile.name}</div>
            `;
            card.addEventListener('click', () => {
                setCurrentId(profile.id);
                if (typeof onSelect === 'function') onSelect(profile);
            });
            listEl.appendChild(card);
        });
    }

    // If no profile selected, redirect to index.html (where the gate lives).
    function requireProfile() {
        if (!getCurrentId()) {
            window.location.href = 'index.html';
            return false;
        }
        return true;
    }

    global.Profiles = {
        list: loadList,
        save: saveList,
        getCurrent,
        getCurrentId,
        setCurrent: setCurrentId,
        clearCurrent,
        renderGate,
        requireProfile
    };
})(window);
