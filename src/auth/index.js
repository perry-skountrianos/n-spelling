// src/auth/index.js
// Public barrel for the auth module. Apps should import from here only —
// internal file layout may change without notice.

export {
    initAuth,
    setGoogleProvider,
    onUser,
    getCurrentUser,
    whenAuthReady,
    requireUser,
    signUpWithEmail,
    signInWithEmail,
    signInWithGoogle,
    signOut,
    sendPasswordReset,
    sendEmailVerification,
    describeError,
} from './auth-core.js';

export {
    bindLoginForm,
    bindSignupForm,
    bindGoogleButton,
    bindResetForm,
} from './auth-ui.js';
