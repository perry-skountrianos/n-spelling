// auth-ui.js
// Optional, unstyled DOM helpers. Use these for quick wiring or write your own.
// The core module (auth-core.js) has zero DOM dependencies — these helpers are
// purely a convenience and can be deleted without affecting the auth engine.

import {
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    sendPasswordReset,
    describeError,
} from './auth-core.js';

/**
 * Bind a login form. Form must contain inputs named `email` and `password`
 * and a submit button. Optionally include an element with `data-auth-error`
 * for inline error messages.
 *
 * @param {HTMLFormElement} form
 * @param {object} [options]
 * @param {() => void} [options.onSuccess]
 */
export function bindLoginForm(form, options = {}) {
    if (!(form instanceof HTMLFormElement)) throw new TypeError('bindLoginForm requires a <form> element');
    const errEl = form.querySelector('[data-auth-error]');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (errEl) errEl.textContent = '';
        const email = (form.elements.namedItem('email')?.value || '').trim();
        const password = form.elements.namedItem('password')?.value || '';
        if (!email || !password) {
            if (errEl) errEl.textContent = 'Email and password are required.';
            return;
        }
        try {
            await signInWithEmail(email, password);
            options.onSuccess && options.onSuccess();
        } catch (err) {
            const { message } = describeError(err);
            if (errEl) errEl.textContent = message;
            else console.error('[auth] sign-in failed', err);
        }
    });
}

/**
 * Bind a signup form. Form must contain inputs named `email` and `password`.
 * Optional input named `confirmPassword` will be validated for match.
 *
 * @param {HTMLFormElement} form
 * @param {object} [options]
 * @param {() => void} [options.onSuccess]
 */
export function bindSignupForm(form, options = {}) {
    if (!(form instanceof HTMLFormElement)) throw new TypeError('bindSignupForm requires a <form> element');
    const errEl = form.querySelector('[data-auth-error]');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (errEl) errEl.textContent = '';
        const email = (form.elements.namedItem('email')?.value || '').trim();
        const password = form.elements.namedItem('password')?.value || '';
        const confirmEl = form.elements.namedItem('confirmPassword');
        const confirm = confirmEl ? confirmEl.value : password;
        if (!email || !password) {
            if (errEl) errEl.textContent = 'Email and password are required.';
            return;
        }
        if (password.length < 8) {
            if (errEl) errEl.textContent = 'Password must be at least 8 characters.';
            return;
        }
        if (password !== confirm) {
            if (errEl) errEl.textContent = 'Passwords do not match.';
            return;
        }
        try {
            await signUpWithEmail(email, password);
            options.onSuccess && options.onSuccess();
        } catch (err) {
            const { message } = describeError(err);
            if (errEl) errEl.textContent = message;
            else console.error('[auth] sign-up failed', err);
        }
    });
}

/**
 * Bind any button to start a Google sign-in popup.
 * @param {HTMLElement} button
 * @param {object} [options]
 * @param {() => void} [options.onSuccess]
 * @param {(message: string) => void} [options.onError]
 */
export function bindGoogleButton(button, options = {}) {
    button.addEventListener('click', async () => {
        try {
            await signInWithGoogle();
            options.onSuccess && options.onSuccess();
        } catch (err) {
            const { message } = describeError(err);
            options.onError ? options.onError(message) : console.error('[auth] google sign-in failed', err);
        }
    });
}

/**
 * Bind a "forgot password" form. Expects an `email` input.
 * @param {HTMLFormElement} form
 * @param {object} [options]
 * @param {() => void} [options.onSuccess]
 */
export function bindResetForm(form, options = {}) {
    if (!(form instanceof HTMLFormElement)) throw new TypeError('bindResetForm requires a <form> element');
    const errEl = form.querySelector('[data-auth-error]');
    const okEl = form.querySelector('[data-auth-success]');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (errEl) errEl.textContent = '';
        if (okEl) okEl.textContent = '';
        const email = (form.elements.namedItem('email')?.value || '').trim();
        if (!email) {
            if (errEl) errEl.textContent = 'Enter your email address.';
            return;
        }
        try {
            await sendPasswordReset(email);
            if (okEl) okEl.textContent = 'Password reset email sent. Check your inbox.';
            options.onSuccess && options.onSuccess();
        } catch (err) {
            const { message } = describeError(err);
            if (errEl) errEl.textContent = message;
        }
    });
}
