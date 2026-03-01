/* auth.js — Healthly shared auth, modal & scan history */
(function () {
  'use strict';

  var BACKEND     = 'http://localhost:5001';
  var AUTH_KEY    = 'hl_auth';
  var HISTORY_KEY = 'hl_history';

  /* ── Storage ─────────────────────────────────────────── */
  function getUser() {
    try { return JSON.parse(localStorage.getItem(AUTH_KEY)); }
    catch (e) { return null; }
  }
  function setUser(d) { localStorage.setItem(AUTH_KEY, JSON.stringify(d)); }
  function clearUser() { localStorage.removeItem(AUTH_KEY); }

  function getHistory() {
    try { return JSON.parse(localStorage.getItem(HISTORY_KEY)) || []; }
    catch (e) { return []; }
  }
  function addToHistory(item) {
    var h = getHistory().filter(function (x) { return x.url !== item.url; });
    h.unshift({ label: item.label, url: item.url, ts: Date.now() });
    localStorage.setItem(HISTORY_KEY, JSON.stringify(h.slice(0, 10)));
  }

  /* ── Public API ──────────────────────────────────────── */
  window.HLAuth = {
    getUser: getUser,
    isLoggedIn: function () { return !!getUser(); },
    getHistory: getHistory,
    addToHistory: addToHistory,
    openModal: openModal,
    logout: function () {
      clearUser();
      updateNavState();
      if (typeof window['onAuthChange'] === 'function') window['onAuthChange']();
      var page = window.location.pathname.split('/').pop();
      if (page === 'profile.html') window.location.href = 'healthly.html';
    },
    setProfileId: function (pid) {
      var u = getUser();
      if (u) { u.profile_id = pid; setUser(u); }
    },
    getProfileId: function () {
      var u = getUser();
      return u ? (u.profile_id || null) : null;
    }
  };

  /* ── Modal styles ────────────────────────────────────── */
  var SI = [
    'width:100%;', 'padding:12px 14px;',
    'border:1px solid var(--border);', 'border-radius:var(--radius-sm);',
    'background:var(--bg-elevated);', 'color:var(--text);',
    'font-size:0.9rem;', 'font-family:inherit;',
    'margin-bottom:10px;', 'outline:none;', 'box-sizing:border-box;'
  ].join('');

  var SB = [
    'width:100%;', 'padding:13px;',
    'background:var(--primary);', 'color:#000;',
    'font-weight:500;', 'font-size:0.95rem;',
    'border:none;', 'border-radius:var(--radius);',
    'cursor:pointer;', 'font-family:inherit;', 'transition:opacity 0.2s;'
  ].join('');

  /* ── Modal HTML ──────────────────────────────────────── */
  function buildModalHTML() {
    return (
      '<div id="hl-auth-overlay" style="display:none;position:fixed;inset:0;z-index:9000;' +
      'background:rgba(0,0,0,0.55);align-items:center;justify-content:center;">' +
      '<div style="background:var(--bg-card);border:1px solid var(--border);' +
      'border-radius:var(--radius);padding:36px 32px;width:100%;max-width:420px;' +
      'margin:16px;position:relative;box-shadow:0 8px 40px rgba(0,0,0,0.3);box-sizing:border-box;">' +
      '<button id="hl-modal-close" aria-label="Close" style="position:absolute;top:14px;' +
      'right:16px;font-size:1.3rem;line-height:1;color:var(--muted);background:none;' +
      'border:none;cursor:pointer;">&#10005;</button>' +
      '<div style="font-family:\'Playfair Display\',Georgia,serif;font-size:1.5rem;' +
      'font-weight:600;margin-bottom:4px;">health<span style="color:var(--primary)">ly</span></div>' +
      '<p style="color:var(--muted);font-size:0.88rem;margin-bottom:24px;">' +
      'Your personalized ingredient scanner.</p>' +
      '<div style="display:flex;margin-bottom:24px;border:1px solid var(--border);' +
      'border-radius:var(--radius-sm);overflow:hidden;">' +
      '<button class="hl-tab" data-tab="login" style="flex:1;padding:10px;font-weight:500;' +
      'font-size:0.88rem;background:var(--primary);color:#000;border:none;cursor:pointer;' +
      'font-family:inherit;">Log in</button>' +
      '<button class="hl-tab" data-tab="register" style="flex:1;padding:10px;font-weight:500;' +
      'font-size:0.88rem;background:transparent;color:var(--muted);border:none;cursor:pointer;' +
      'font-family:inherit;">Create account</button>' +
      '</div>' +

      /* ── Login form ── */
      '<div id="hl-form-login">' +
      '<input id="hl-login-email" type="email" placeholder="Email" style="' + SI + '" />' +
      '<input id="hl-login-pass" type="password" placeholder="Password" style="' + SI + '" />' +
      '<div id="hl-login-err" style="color:#C02020;font-size:0.82rem;min-height:18px;margin-bottom:8px;"></div>' +
      '<button id="hl-login-btn" style="' + SB + '">Log in</button>' +
      '<div style="text-align:center;margin-top:12px;">' +
      '<a id="hl-forgot-link" href="#" style="font-size:0.82rem;color:var(--muted);text-decoration:underline;">Forgot password?</a>' +
      '</div>' +
      '</div>' +

      /* ── Register form ── */
      '<div id="hl-form-register" style="display:none;">' +
      '<input id="hl-reg-email" type="email" placeholder="Email" style="' + SI + '" />' +
      '<input id="hl-reg-pass" type="password" placeholder="Password (min 6 chars)" style="' + SI + '" />' +
      '<input id="hl-reg-pass2" type="password" placeholder="Confirm password" style="' + SI + '" />' +
      '<div id="hl-reg-err" style="color:#C02020;font-size:0.82rem;min-height:18px;margin-bottom:8px;"></div>' +
      '<button id="hl-reg-btn" style="' + SB + '">Create account</button>' +
      '</div>' +

      /* ── Reset password form ── */
      '<div id="hl-form-reset" style="display:none;">' +
      '<p style="font-size:0.85rem;color:var(--muted);margin-bottom:16px;">Enter your email and choose a new password.</p>' +
      '<input id="hl-reset-email" type="email" placeholder="Email" style="' + SI + '" />' +
      '<input id="hl-reset-pass" type="password" placeholder="New password (min 6 chars)" style="' + SI + '" />' +
      '<input id="hl-reset-pass2" type="password" placeholder="Confirm new password" style="' + SI + '" />' +
      '<div id="hl-reset-err" style="color:#C02020;font-size:0.82rem;min-height:18px;margin-bottom:8px;"></div>' +
      '<div id="hl-reset-ok" style="color:var(--primary);font-size:0.82rem;margin-bottom:8px;display:none;">Password reset! Redirecting to login…</div>' +
      '<button id="hl-reset-btn" style="' + SB + '">Reset password</button>' +
      '<div style="text-align:center;margin-top:12px;">' +
      '<a id="hl-back-login" href="#" style="font-size:0.82rem;color:var(--muted);text-decoration:underline;">← Back to login</a>' +
      '</div>' +
      '</div>' +

      '</div></div>'
    );
  }

  function injectModal() {
    if (document.getElementById('hl-auth-overlay')) return;
    var wrap = document.createElement('div');
    wrap.innerHTML = buildModalHTML();
    document.body.appendChild(wrap.firstElementChild);
    wireModal();
  }

  function wireModal() {
    var overlay = document.getElementById('hl-auth-overlay');
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) closeModal();
    });
    document.getElementById('hl-modal-close').addEventListener('click', closeModal);
    document.querySelectorAll('.hl-tab').forEach(function (t) {
      t.addEventListener('click', function () { switchTab(t.dataset.tab); });
    });
    document.getElementById('hl-login-btn').addEventListener('click', doLogin);
    document.getElementById('hl-reg-btn').addEventListener('click', doRegister);
    document.getElementById('hl-reset-btn').addEventListener('click', doReset);

    document.getElementById('hl-forgot-link').addEventListener('click', function (e) {
      e.preventDefault(); showResetForm();
    });
    document.getElementById('hl-back-login').addEventListener('click', function (e) {
      e.preventDefault(); showLoginForm();
    });

    ['hl-login-email', 'hl-login-pass'].forEach(function (id) {
      document.getElementById(id).addEventListener('keydown', function (e) {
        if (e.key === 'Enter') doLogin();
      });
    });
    ['hl-reg-email', 'hl-reg-pass', 'hl-reg-pass2'].forEach(function (id) {
      document.getElementById(id).addEventListener('keydown', function (e) {
        if (e.key === 'Enter') doRegister();
      });
    });
    ['hl-reset-email', 'hl-reset-pass', 'hl-reset-pass2'].forEach(function (id) {
      document.getElementById(id).addEventListener('keydown', function (e) {
        if (e.key === 'Enter') doReset();
      });
    });
  }

  function switchTab(name) {
    document.querySelectorAll('.hl-tab').forEach(function (t) {
      var on = t.dataset.tab === name;
      t.style.background = on ? 'var(--primary)' : 'transparent';
      t.style.color      = on ? '#000' : 'var(--muted)';
    });
    document.getElementById('hl-form-login').style.display    = name === 'login'    ? '' : 'none';
    document.getElementById('hl-form-register').style.display = name === 'register' ? '' : 'none';
    document.getElementById('hl-form-reset').style.display    = 'none';
  }

  function showResetForm() {
    document.getElementById('hl-form-login').style.display = 'none';
    document.getElementById('hl-form-reset').style.display = '';
    document.getElementById('hl-reset-err').textContent    = '';
    document.getElementById('hl-reset-ok').style.display   = 'none';
    /* pre-fill email if already typed in login form */
    var email = (document.getElementById('hl-login-email').value || '').trim();
    if (email) document.getElementById('hl-reset-email').value = email;
  }

  function showLoginForm() {
    document.getElementById('hl-form-reset').style.display = 'none';
    document.getElementById('hl-form-login').style.display = '';
  }

  function openModal(tab) {
    document.getElementById('hl-auth-overlay').style.display = 'flex';
    if (tab) switchTab(tab);
  }

  function closeModal() {
    document.getElementById('hl-auth-overlay').style.display = 'none';
  }

  function setLoading(btnId, on) {
    var btn = document.getElementById(btnId);
    if (!btn) return;
    btn.disabled      = on;
    btn.style.opacity = on ? '0.6' : '1';
  }

  /* ── Login ───────────────────────────────────────────── */
  async function doLogin() {
    var email = document.getElementById('hl-login-email').value.trim().toLowerCase();
    var pass  = document.getElementById('hl-login-pass').value;
    var err   = document.getElementById('hl-login-err');
    err.textContent = '';

    if (!email || !email.includes('@')) { err.textContent = 'Please enter a valid email.'; return; }
    if (!pass)                          { err.textContent = 'Please enter your password.';  return; }

    setLoading('hl-login-btn', true);
    try {
      var resp = await fetch(BACKEND + '/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email, password: pass })
      });
      var data = await resp.json();
      if (!resp.ok) {
        err.textContent = data.error || 'Login failed.';
        setLoading('hl-login-btn', false);
        return;
      }
      setUser({ email: data.email, token: data.token });
    } catch (e) {
      /* Backend offline — fall back to local mock token */
      setUser({ email: email, token: 'mock_' + Math.random().toString(36).slice(2) + Date.now() });
    }

    setLoading('hl-login-btn', false);
    closeModal();
    updateNavState();
    if (typeof window['onAuthChange'] === 'function') window['onAuthChange']();
  }

  /* ── Register ────────────────────────────────────────── */
  async function doRegister() {
    var email = document.getElementById('hl-reg-email').value.trim().toLowerCase();
    var pass  = document.getElementById('hl-reg-pass').value;
    var pass2 = document.getElementById('hl-reg-pass2').value;
    var err   = document.getElementById('hl-reg-err');
    err.textContent = '';

    if (!email || !email.includes('@'))  { err.textContent = 'Please enter a valid email.';          return; }
    if (pass.length < 6)                 { err.textContent = 'Password must be at least 6 chars.';   return; }
    if (pass !== pass2)                  { err.textContent = 'Passwords do not match.';               return; }

    setLoading('hl-reg-btn', true);
    try {
      var resp = await fetch(BACKEND + '/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email, password: pass })
      });
      var data = await resp.json();
      if (!resp.ok) {
        err.textContent = data.error || 'Registration failed.';
        setLoading('hl-reg-btn', false);
        return;
      }
      setUser({ email: data.email, token: data.token });
    } catch (e) {
      /* Backend offline — local mock */
      setUser({ email: email, token: 'mock_' + Math.random().toString(36).slice(2) + Date.now() });
    }

    setLoading('hl-reg-btn', false);
    closeModal();
    updateNavState();
    if (typeof window['onAuthChange'] === 'function') window['onAuthChange']();
  }

  /* ── Reset password ──────────────────────────────────── */
  async function doReset() {
    var email = document.getElementById('hl-reset-email').value.trim().toLowerCase();
    var pass  = document.getElementById('hl-reset-pass').value;
    var pass2 = document.getElementById('hl-reset-pass2').value;
    var err   = document.getElementById('hl-reset-err');
    var ok    = document.getElementById('hl-reset-ok');
    err.textContent = ''; ok.style.display = 'none';

    if (!email || !email.includes('@')) { err.textContent = 'Please enter a valid email.';         return; }
    if (pass.length < 6)               { err.textContent = 'Password must be at least 6 chars.';  return; }
    if (pass !== pass2)                { err.textContent = 'Passwords do not match.';              return; }

    setLoading('hl-reset-btn', true);
    try {
      var resp = await fetch(BACKEND + '/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email, new_password: pass })
      });
      var data = await resp.json();
      if (!resp.ok) {
        err.textContent = data.error || 'Reset failed.';
        setLoading('hl-reset-btn', false);
        return;
      }
      ok.style.display = '';
      /* Pre-fill login form and switch back after 2 s */
      setTimeout(function () {
        document.getElementById('hl-login-email').value = email;
        document.getElementById('hl-login-pass').value  = '';
        showLoginForm();
      }, 2000);
    } catch (e) {
      err.textContent = 'Backend offline — start `python app.py` to reset passwords.';
    }
    setLoading('hl-reset-btn', false);
  }

  /* ── Nav state ───────────────────────────────────────── */
  function updateNavState() {
    var btn = document.getElementById('nav-auth-btn');
    if (!btn) return;
    var user = getUser();
    if (user) {
      btn.textContent       = 'Profile';
      btn.href              = 'profile.html';
      btn.style.background  = 'transparent';
      btn.style.color       = 'var(--text)';
      btn.style.border      = '1px solid var(--border)';
      btn.style.boxShadow   = 'none';
      btn.onclick = null;
    } else {
      btn.textContent       = 'Sign in';
      btn.href              = '#';
      btn.style.background  = 'var(--primary)';
      btn.style.color       = '#000';
      btn.style.border      = 'none';
      btn.style.boxShadow   = '0 0 32px rgba(29,185,84,0.40)';
      btn.onclick = function (e) { e.preventDefault(); openModal('login'); };
    }
  }

  /* ── Init ────────────────────────────────────────────── */
  function ready(fn) {
    if (document.readyState !== 'loading') { fn(); }
    else { document.addEventListener('DOMContentLoaded', fn); }
  }

  ready(function () {
    injectModal();
    updateNavState();
  });
}());