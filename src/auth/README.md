# `src/auth/` — Reusable Auth Module

A small, opinionated wrapper around Firebase Auth designed to be extracted into
a private package (`@yourorg/auth-kit`) once a second app needs it.

## Design contract (do not break)

1. **No DOM access in `auth-core.js`.** DOM helpers live in `auth-ui.js` and are optional.
2. **No app-specific logic.** No references to profiles, families, word lists, etc.
3. **No hardcoded redirects.** Callers decide where to send signed-out users.
4. **No app-side data writes.** Use the `onAfterSignUp` / `onAfterSignIn` hooks.
5. **Firebase Auth is injected, never imported.** Today we pass `firebase.auth()` (compat SDK). Tomorrow we can pass a modular `getAuth(app)` instance, or a different provider's adapter, without changing app code.
6. **Public API lives in `index.js`.** Internal files (`auth-core.js`, `auth-ui.js`) may change.

## Quick start

```html
<!-- 1. Load Firebase compat SDK (until we migrate to modular + bundler) -->
<script src="https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.12.0/firebase-auth-compat.js"></script>
<script src="firebase-config.js"></script>

<!-- 2. Boot the auth module -->
<script type="module">
  import { initAuth, onUser, signOut } from './src/auth/index.js';

  initAuth(firebase.auth(), {
    useGoogleProvider: true,
    onAfterSignUp: async (user) => {
      // App-specific: create a family doc, default profile, etc.
    },
  });

  onUser((user) => {
    if (user) console.log('signed in as', user.email);
    else console.log('signed out');
  });
</script>
```

## Page guard pattern

```js
import { whenAuthReady } from './src/auth/index.js';

whenAuthReady().then((user) => {
  if (!user) window.location.href = '/login.html';
});
```

## Public API

| Function | Purpose |
|---|---|
| `initAuth(firebaseAuth, opts)` | Boot the module. Call once. |
| `onUser(cb)` | Subscribe to auth state. Returns unsubscribe. |
| `getCurrentUser()` | Synchronous current user (or `null`). |
| `whenAuthReady()` | Promise resolving after first auth state observed. |
| `requireUser()` | Promise resolving to user, rejecting with `auth/not-signed-in`. |
| `signUpWithEmail(email, password)` | Create account. |
| `signInWithEmail(email, password)` | Sign in. |
| `signInWithGoogle()` | Popup sign-in. |
| `signOut()` | Sign out. |
| `sendPasswordReset(email)` | Trigger reset email. |
| `sendEmailVerification()` | Send verification to current user. |
| `describeError(err)` | Map Firebase error to user-friendly message. |

## `AuthUser` shape

```ts
{
  uid: string,
  email: string | null,
  displayName: string | null,
  emailVerified: boolean,
  photoURL: string | null,
  providerId: string | null
}
```

Apps never see raw Firebase user objects. This decouples app code from the SDK.

## Extraction checklist (when you start app #2)

- [ ] Move `src/auth/` → its own repo `auth-kit`
- [ ] Add `package.json`, `main`/`module`/`types`, semver `0.1.0`
- [ ] Replace path imports (`./auth-core.js`) with package imports
- [ ] Publish to GitHub Packages or Verdaccio (private registry)
- [ ] Update n-spelling to consume the package
- [ ] Update app #2 to consume the package

Until then: copy this folder verbatim into the second app and see what you change. The diff *is* the real shared API.
