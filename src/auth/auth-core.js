// auth-core.js
// Framework-agnostic auth engine. Wraps Firebase Auth behind a stable, app-neutral API.
//
// Design contract:
//  - No DOM access. No window.location redirects. No app-specific data writes.
//  - Firebase Auth instance is injected, never imported, so this module is
//    portable across compat SDK, modular SDK, or a future replacement (Clerk,
//    Supabase, custom backend) by swapping the adapter layer.
//  - All callbacks receive a plain `AuthUser` shape — never a raw Firebase user.
//
// Public API (see index.js for the barrel):
//   initAuth(firebaseAuth, options?)
//   signUpWithEmail(email, password)
//   signInWithEmail(email, password)
//   signInWithGoogle()
//   signOut()
//   onUser(callback) -> unsubscribe
//   getCurrentUser()
//   requireUser() -> Promise<AuthUser>           (resolves once auth state is known)
//   sendPasswordReset(email)
//   sendEmailVerification()
//
// Lifecycle hooks (set via initAuth options):
//   onAfterSignUp(user)   — called once after a new account is created
//   onAfterSignIn(user)   — called on every successful sign-in (incl. signup)
//   onSignOut()           — called after sign-out completes

/** @typedef {{ uid: string, email: string|null, displayName: string|null, emailVerified: boolean, photoURL: string|null, providerId: string|null }} AuthUser */

const state = {
    /** @type {any} */ auth: null,
    /** @type {any} */ googleProvider: null,
    /** @type {AuthUser|null} */ currentUser: null,
    /** @type {boolean} */ ready: false,
    /** @type {Array<(user: AuthUser|null) => void>} */ listeners: [],
    /** @type {Array<() => void>} */ readyResolvers: [],
    hooks: {
        /** @type {(user: AuthUser) => void|Promise<void>} */ onAfterSignUp: null,
        /** @type {(user: AuthUser) => void|Promise<void>} */ onAfterSignIn: null,
        /** @type {() => void|Promise<void>} */ onSignOut: null,
    },
    // Tracks UIDs we've seen in this browser to distinguish signup from sign-in.
    knownUidsKey: 'authkit:knownUids',
};

function toAuthUser(firebaseUser) {
    if (!firebaseUser) return null;
    const provider = (firebaseUser.providerData && firebaseUser.providerData[0]) || null;
    return Object.freeze({
        uid: firebaseUser.uid,
        email: firebaseUser.email || null,
        displayName: firebaseUser.displayName || null,
        emailVerified: !!firebaseUser.emailVerified,
        photoURL: firebaseUser.photoURL || null,
        providerId: provider ? provider.providerId : null,
    });
}

function readKnownUids() {
    try {
        const raw = localStorage.getItem(state.knownUidsKey);
        return raw ? JSON.parse(raw) : [];
    } catch (_) {
        return [];
    }
}

function rememberUid(uid) {
    try {
        const known = readKnownUids();
        if (!known.includes(uid)) {
            known.push(uid);
            localStorage.setItem(state.knownUidsKey, JSON.stringify(known));
        }
    } catch (_) { /* localStorage may be unavailable */ }
}

function notifyListeners(user) {
    state.listeners.slice().forEach((cb) => {
        try { cb(user); } catch (e) { console.error('[auth] listener error', e); }
    });
}

function ensureInitialized() {
    if (!state.auth) {
        throw new Error('[auth] initAuth(firebaseAuth) must be called before any other auth API.');
    }
}

/**
 * Initialize the auth module. Must be called exactly once at app boot.
 * @param {any} firebaseAuth - A Firebase Auth instance (e.g. `firebase.auth()` or `getAuth(app)`).
 * @param {object} [options]
 * @param {(user: AuthUser) => void|Promise<void>} [options.onAfterSignUp]
 * @param {(user: AuthUser) => void|Promise<void>} [options.onAfterSignIn]
 * @param {() => void|Promise<void>} [options.onSignOut]
 * @param {boolean} [options.useGoogleProvider=false] - If true, prepares Google provider for signInWithGoogle().
 */
export function initAuth(firebaseAuth, options = {}) {
    if (state.auth) {
        console.warn('[auth] initAuth called more than once; ignoring.');
        return;
    }
    if (!firebaseAuth || typeof firebaseAuth.onAuthStateChanged !== 'function') {
        throw new Error('[auth] initAuth requires a Firebase Auth instance.');
    }
    state.auth = firebaseAuth;
    state.hooks.onAfterSignUp = options.onAfterSignUp || null;
    state.hooks.onAfterSignIn = options.onAfterSignIn || null;
    state.hooks.onSignOut = options.onSignOut || null;

    if (options.useGoogleProvider) {
        // Compat SDK exposes provider classes on the global `firebase.auth` namespace.
        // Modular SDK callers can pre-construct a provider and assign it via setGoogleProvider().
        const fbGlobal = (typeof window !== 'undefined') ? window.firebase : null;
        if (fbGlobal && fbGlobal.auth && fbGlobal.auth.GoogleAuthProvider) {
            state.googleProvider = new fbGlobal.auth.GoogleAuthProvider();
        }
    }

    state.auth.onAuthStateChanged(async (fbUser) => {
        const user = toAuthUser(fbUser);
        const wasReady = state.ready;
        const prevUid = state.currentUser ? state.currentUser.uid : null;
        state.currentUser = user;
        state.ready = true;

        // Resolve any pending requireUser() promises that were waiting for first emission.
        if (!wasReady) {
            state.readyResolvers.splice(0).forEach((fn) => fn());
        }

        // Detect signup vs sign-in. A UID we've never seen before in this browser
        // && was just created (within the last 60s) is treated as a fresh signup.
        if (user && user.uid !== prevUid) {
            const known = readKnownUids();
            const isNewlyKnown = !known.includes(user.uid);
            const creationTime = fbUser.metadata && fbUser.metadata.creationTime
                ? Date.parse(fbUser.metadata.creationTime)
                : 0;
            const recentlyCreated = creationTime && (Date.now() - creationTime) < 60_000;

            if (isNewlyKnown && recentlyCreated && state.hooks.onAfterSignUp) {
                try { await state.hooks.onAfterSignUp(user); } catch (e) { console.error('[auth] onAfterSignUp threw', e); }
            }
            rememberUid(user.uid);

            if (state.hooks.onAfterSignIn) {
                try { await state.hooks.onAfterSignIn(user); } catch (e) { console.error('[auth] onAfterSignIn threw', e); }
            }
        }

        notifyListeners(user);
    });
}

/**
 * Provide a Google provider instance manually (useful when running with the modular SDK).
 * @param {any} provider
 */
export function setGoogleProvider(provider) {
    state.googleProvider = provider;
}

/**
 * Subscribe to auth state changes. Fires immediately with current state if known,
 * then on every subsequent change. Returns an unsubscribe function.
 * @param {(user: AuthUser|null) => void} callback
 */
export function onUser(callback) {
    if (typeof callback !== 'function') throw new TypeError('onUser requires a function');
    state.listeners.push(callback);
    if (state.ready) {
        try { callback(state.currentUser); } catch (e) { console.error('[auth] listener error', e); }
    }
    return function unsubscribe() {
        const i = state.listeners.indexOf(callback);
        if (i >= 0) state.listeners.splice(i, 1);
    };
}

/** Returns the current user synchronously, or null if signed out / unknown. */
export function getCurrentUser() {
    return state.currentUser;
}

/**
 * Resolves once the first auth state has been observed.
 * Resolves to the current user (or null if signed out).
 * Use this in page guards to avoid race conditions on cold load.
 * @returns {Promise<AuthUser|null>}
 */
export function whenAuthReady() {
    ensureInitialized();
    if (state.ready) return Promise.resolve(state.currentUser);
    return new Promise((resolve) => {
        state.readyResolvers.push(() => resolve(state.currentUser));
    });
}

/**
 * Resolves to the current user if signed in, otherwise rejects with an Error
 * whose `code` is 'auth/not-signed-in'. Apps typically call this and on rejection
 * redirect to their login page (the redirect URL is the app's responsibility).
 * @returns {Promise<AuthUser>}
 */
export async function requireUser() {
    const user = await whenAuthReady();
    if (!user) {
        const err = new Error('Not signed in');
        err.code = 'auth/not-signed-in';
        throw err;
    }
    return user;
}

/**
 * Create a new account with email/password. Triggers onAfterSignUp + onAfterSignIn.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<AuthUser>}
 */
export async function signUpWithEmail(email, password) {
    ensureInitialized();
    const cred = await state.auth.createUserWithEmailAndPassword(email, password);
    return toAuthUser(cred.user);
}

/** @param {string} email @param {string} password @returns {Promise<AuthUser>} */
export async function signInWithEmail(email, password) {
    ensureInitialized();
    const cred = await state.auth.signInWithEmailAndPassword(email, password);
    return toAuthUser(cred.user);
}

/** @returns {Promise<AuthUser>} */
export async function signInWithGoogle() {
    ensureInitialized();
    if (!state.googleProvider) {
        throw new Error('[auth] Google provider not configured. Pass useGoogleProvider:true to initAuth or call setGoogleProvider().');
    }
    const cred = await state.auth.signInWithPopup(state.googleProvider);
    return toAuthUser(cred.user);
}

export async function signOut() {
    ensureInitialized();
    await state.auth.signOut();
    if (state.hooks.onSignOut) {
        try { await state.hooks.onSignOut(); } catch (e) { console.error('[auth] onSignOut threw', e); }
    }
}

/** @param {string} email */
export async function sendPasswordReset(email) {
    ensureInitialized();
    await state.auth.sendPasswordResetEmail(email);
}

export async function sendEmailVerification() {
    ensureInitialized();
    const fbUser = state.auth.currentUser;
    if (!fbUser) throw new Error('[auth] No user to send verification to.');
    await fbUser.sendEmailVerification();
}

/**
 * Normalize Firebase auth error codes into shorter app-friendly strings.
 * Apps decide how to render these.
 * @param {unknown} err
 * @returns {{ code: string, message: string }}
 */
export function describeError(err) {
    const code = (err && err.code) || 'auth/unknown';
    const map = {
        'auth/email-already-in-use': 'That email is already registered. Try signing in instead.',
        'auth/invalid-email': 'That email address looks invalid.',
        'auth/weak-password': 'Password should be at least 6 characters.',
        'auth/wrong-password': 'Wrong email or password.',
        'auth/user-not-found': 'Wrong email or password.',
        'auth/too-many-requests': 'Too many attempts. Please wait a minute and try again.',
        'auth/popup-closed-by-user': 'Sign-in was cancelled.',
        'auth/network-request-failed': 'Network error. Check your connection.',
        'auth/not-signed-in': 'You need to sign in to continue.',
    };
    return { code, message: map[code] || (err && err.message) || 'Something went wrong.' };
}
