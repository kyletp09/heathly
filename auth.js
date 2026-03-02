/* auth.js - Healthly shared auth, modal, and scan history */
(function () {
  'use strict';

  var BACKEND_URL = 'http://localhost:5001';
  var AUTH_KEY = 'hl_auth';
  var HISTORY_KEY = 'hl_history';

  // Storage helpers
  function getUser() {
    try {
      return JSON.parse(localStorage.getItem(AUTH_KEY));
    } catch (error) {
      return null;
    }
  }

  function setUser(userData) {
    localStorage.setItem(AUTH_KEY, JSON.stringify(userData));
  }

  function clearUser() {
    localStorage.removeItem(AUTH_KEY);
  }

  function getHistory() {
    try {
      return JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];
    } catch (error) {
      return [];
    }
  }

  function addToHistory(item) {
    var history = getHistory().filter(function (entry) {
      return entry.url !== item.url;
    });

    history.unshift({
      label: item.label,
      url: item.url,
      ts: Date.now()
    });

    localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 10)));
  }

  // Public API exposed to pages
  window.HLAuth = {
    getUser: getUser,
    isLoggedIn: function () {
      return !!getUser();
    },
    getHistory: getHistory,
    addToHistory: addToHistory,
    openModal: openModal,
    logout: function () {
      clearUser();
      updateNavState();

      if (typeof window.onAuthChange === 'function') {
        window.onAuthChange();
      }

      var currentPage = window.location.pathname.split('/').pop();
      if (currentPage === 'profile.html') {
        window.location.href = 'healthly.html';
      }
    },
    setProfileId: function (profileId) {
      var user = getUser();
      if (user) {
        user.profile_id = profileId;
        setUser(user);
      }
    },
    getProfileId: function () {
      var user = getUser();
      return user ? (user.profile_id || null) : null;
    }
  };

  // Reused inline styles for modal inputs/buttons
  var INPUT_STYLE = [
    'width:100%;',
    'padding:12px 14px;',
    'border:1px solid var(--border);',
    'border-radius:var(--radius-sm);',
    'background:var(--bg-elevated);',
    'color:var(--text);',
    'font-size:0.9rem;',
    'font-family:inherit;',
    'margin-bottom:10px;',
    'outline:none;',
    'box-sizing:border-box;'
  ].join('');

  var BUTTON_STYLE = [
    'width:100%;',
    'padding:13px;',
    'background:var(--primary);',
    'color:#000;',
    'font-weight:500;',
    'font-size:0.95rem;',
    'border:none;',
    'border-radius:var(--radius);',
    'cursor:pointer;',
    'font-family:inherit;',
    'transition:opacity 0.2s;'
  ].join('');

  // Builds the auth modal DOM as a single HTML string
  function buildModalHtml() {
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

      // Login form
      '<div id="hl-form-login">' +
      '<input id="hl-login-email" type="email" placeholder="Email" style="' + INPUT_STYLE + '" />' +
      '<input id="hl-login-pass" type="password" placeholder="Password" style="' + INPUT_STYLE + '" />' +
      '<div id="hl-login-err" style="color:#C02020;font-size:0.82rem;min-height:18px;margin-bottom:8px;"></div>' +
      '<button id="hl-login-btn" style="' + BUTTON_STYLE + '">Log in</button>' +
      '<div style="text-align:center;margin-top:12px;">' +
      '<a id="hl-forgot-link" href="#" style="font-size:0.82rem;color:var(--muted);text-decoration:underline;">Forgot password?</a>' +
      '</div>' +
      '</div>' +

      // Register form
      '<div id="hl-form-register" style="display:none;">' +
      '<input id="hl-reg-email" type="email" placeholder="Email" style="' + INPUT_STYLE + '" />' +
      '<input id="hl-reg-pass" type="password" placeholder="Password (min 6 chars)" style="' + INPUT_STYLE + '" />' +
      '<input id="hl-reg-pass2" type="password" placeholder="Confirm password" style="' + INPUT_STYLE + '" />' +
      '<div id="hl-reg-err" style="color:#C02020;font-size:0.82rem;min-height:18px;margin-bottom:8px;"></div>' +
      '<button id="hl-reg-btn" style="' + BUTTON_STYLE + '">Create account</button>' +
      '</div>' +

      // Reset password form
      '<div id="hl-form-reset" style="display:none;">' +
      '<p style="font-size:0.85rem;color:var(--muted);margin-bottom:16px;">Enter your email and choose a new password.</p>' +
      '<input id="hl-reset-email" type="email" placeholder="Email" style="' + INPUT_STYLE + '" />' +
      '<input id="hl-reset-pass" type="password" placeholder="New password (min 6 chars)" style="' + INPUT_STYLE + '" />' +
      '<input id="hl-reset-pass2" type="password" placeholder="Confirm new password" style="' + INPUT_STYLE + '" />' +
      '<div id="hl-reset-err" style="color:#C02020;font-size:0.82rem;min-height:18px;margin-bottom:8px;"></div>' +
      '<div id="hl-reset-ok" style="color:var(--primary);font-size:0.82rem;margin-bottom:8px;display:none;">Password reset! Redirecting to login...</div>' +
      '<button id="hl-reset-btn" style="' + BUTTON_STYLE + '">Reset password</button>' +
      '<div style="text-align:center;margin-top:12px;">' +
      '<a id="hl-back-login" href="#" style="font-size:0.82rem;color:var(--muted);text-decoration:underline;">&larr; Back to login</a>' +
      '</div>' +
      '</div>' +

      '</div></div>'
    );
  }

  function injectModal() {
    if (document.getElementById('hl-auth-overlay')) {
      return;
    }

    var container = document.createElement('div');
    container.innerHTML = buildModalHtml();
    document.body.appendChild(container.firstElementChild);
    wireModal();
  }

  function wireModal() {
    var overlay = document.getElementById('hl-auth-overlay');

    overlay.addEventListener('click', function (event) {
      if (event.target === overlay) {
        closeModal();
      }
    });

    document.getElementById('hl-modal-close').addEventListener('click', closeModal);

    document.querySelectorAll('.hl-tab').forEach(function (tabButton) {
      tabButton.addEventListener('click', function () {
        switchTab(tabButton.dataset.tab);
      });
    });

    document.getElementById('hl-login-btn').addEventListener('click', doLogin);
    document.getElementById('hl-reg-btn').addEventListener('click', doRegister);
    document.getElementById('hl-reset-btn').addEventListener('click', doReset);

    document.getElementById('hl-forgot-link').addEventListener('click', function (event) {
      event.preventDefault();
      showResetForm();
    });

    document.getElementById('hl-back-login').addEventListener('click', function (event) {
      event.preventDefault();
      showLoginForm();
    });

    ['hl-login-email', 'hl-login-pass'].forEach(function (id) {
      document.getElementById(id).addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
          doLogin();
        }
      });
    });

    ['hl-reg-email', 'hl-reg-pass', 'hl-reg-pass2'].forEach(function (id) {
      document.getElementById(id).addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
          doRegister();
        }
      });
    });

    ['hl-reset-email', 'hl-reset-pass', 'hl-reset-pass2'].forEach(function (id) {
      document.getElementById(id).addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
          doReset();
        }
      });
    });
  }

  function switchTab(tabName) {
    document.querySelectorAll('.hl-tab').forEach(function (tabButton) {
      var isActive = tabButton.dataset.tab === tabName;
      tabButton.style.background = isActive ? 'var(--primary)' : 'transparent';
      tabButton.style.color = isActive ? '#000' : 'var(--muted)';
    });

    document.getElementById('hl-form-login').style.display = tabName === 'login' ? '' : 'none';
    document.getElementById('hl-form-register').style.display = tabName === 'register' ? '' : 'none';
    document.getElementById('hl-form-reset').style.display = 'none';
  }

  function showResetForm() {
    document.getElementById('hl-form-login').style.display = 'none';
    document.getElementById('hl-form-reset').style.display = '';
    document.getElementById('hl-reset-err').textContent = '';
    document.getElementById('hl-reset-ok').style.display = 'none';

    // Prefill reset email if login email is already typed.
    var loginEmail = (document.getElementById('hl-login-email').value || '').trim();
    if (loginEmail) {
      document.getElementById('hl-reset-email').value = loginEmail;
    }
  }

  function showLoginForm() {
    document.getElementById('hl-form-reset').style.display = 'none';
    document.getElementById('hl-form-login').style.display = '';
  }

  function openModal(tabName) {
    document.getElementById('hl-auth-overlay').style.display = 'flex';
    if (tabName) {
      switchTab(tabName);
    }
  }

  function closeModal() {
    document.getElementById('hl-auth-overlay').style.display = 'none';
  }

  function setLoading(buttonId, isLoading) {
    var button = document.getElementById(buttonId);
    if (!button) {
      return;
    }

    button.disabled = isLoading;
    button.style.opacity = isLoading ? '0.6' : '1';
  }

  function createMockToken() {
    return 'mock_' + Math.random().toString(36).slice(2) + Date.now();
  }

  // Login flow
  async function doLogin() {
    var email = document.getElementById('hl-login-email').value.trim().toLowerCase();
    var password = document.getElementById('hl-login-pass').value;
    var errorNode = document.getElementById('hl-login-err');
    errorNode.textContent = '';

    if (!email || !email.includes('@')) {
      errorNode.textContent = 'Please enter a valid email.';
      return;
    }

    if (!password) {
      errorNode.textContent = 'Please enter your password.';
      return;
    }

    setLoading('hl-login-btn', true);

    try {
      var response = await fetch(BACKEND_URL + '/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email, password: password })
      });

      var data = await response.json();

      if (!response.ok) {
        errorNode.textContent = data.error || 'Login failed.';
        setLoading('hl-login-btn', false);
        return;
      }

      setUser({ email: data.email, token: data.token });
    } catch (error) {
      // Backend offline fallback for local demo use.
      setUser({ email: email, token: createMockToken() });
    }

    setLoading('hl-login-btn', false);
    closeModal();
    updateNavState();

    if (typeof window.onAuthChange === 'function') {
      window.onAuthChange();
    }
  }

  // Registration flow
  async function doRegister() {
    var email = document.getElementById('hl-reg-email').value.trim().toLowerCase();
    var password = document.getElementById('hl-reg-pass').value;
    var confirmPassword = document.getElementById('hl-reg-pass2').value;
    var errorNode = document.getElementById('hl-reg-err');
    errorNode.textContent = '';

    if (!email || !email.includes('@')) {
      errorNode.textContent = 'Please enter a valid email.';
      return;
    }

    if (password.length < 6) {
      errorNode.textContent = 'Password must be at least 6 chars.';
      return;
    }

    if (password !== confirmPassword) {
      errorNode.textContent = 'Passwords do not match.';
      return;
    }

    setLoading('hl-reg-btn', true);

    try {
      var response = await fetch(BACKEND_URL + '/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email, password: password })
      });

      var data = await response.json();

      if (!response.ok) {
        errorNode.textContent = data.error || 'Registration failed.';
        setLoading('hl-reg-btn', false);
        return;
      }

      setUser({ email: data.email, token: data.token });
    } catch (error) {
      // Backend offline fallback for local demo use.
      setUser({ email: email, token: createMockToken() });
    }

    setLoading('hl-reg-btn', false);
    closeModal();
    updateNavState();

    if (typeof window.onAuthChange === 'function') {
      window.onAuthChange();
    }
  }

  // Reset password flow
  async function doReset() {
    var email = document.getElementById('hl-reset-email').value.trim().toLowerCase();
    var newPassword = document.getElementById('hl-reset-pass').value;
    var confirmPassword = document.getElementById('hl-reset-pass2').value;
    var errorNode = document.getElementById('hl-reset-err');
    var successNode = document.getElementById('hl-reset-ok');

    errorNode.textContent = '';
    successNode.style.display = 'none';

    if (!email || !email.includes('@')) {
      errorNode.textContent = 'Please enter a valid email.';
      return;
    }

    if (newPassword.length < 6) {
      errorNode.textContent = 'Password must be at least 6 chars.';
      return;
    }

    if (newPassword !== confirmPassword) {
      errorNode.textContent = 'Passwords do not match.';
      return;
    }

    setLoading('hl-reset-btn', true);

    try {
      var response = await fetch(BACKEND_URL + '/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email, new_password: newPassword })
      });

      var data = await response.json();

      if (!response.ok) {
        errorNode.textContent = data.error || 'Reset failed.';
        setLoading('hl-reset-btn', false);
        return;
      }

      successNode.style.display = '';

      // Prefill login email and return to login after a short delay.
      setTimeout(function () {
        document.getElementById('hl-login-email').value = email;
        document.getElementById('hl-login-pass').value = '';
        showLoginForm();
      }, 2000);
    } catch (error) {
      errorNode.textContent = 'Backend offline - start `python app.py` to reset passwords.';
    }

    setLoading('hl-reset-btn', false);
  }

  // Update top-right nav button based on auth state
  function updateNavState() {
    var authButton = document.getElementById('nav-auth-btn');
    if (!authButton) {
      return;
    }

    var user = getUser();
    if (user) {
      authButton.textContent = 'Profile';
      authButton.href = 'profile.html';
      authButton.style.background = 'transparent';
      authButton.style.color = 'var(--text)';
      authButton.style.border = '1px solid var(--border)';
      authButton.style.boxShadow = 'none';
      authButton.onclick = null;
      return;
    }

    authButton.textContent = 'Sign in';
    authButton.href = '#';
    authButton.style.background = 'var(--primary)';
    authButton.style.color = '#000';
    authButton.style.border = 'none';
    authButton.style.boxShadow = '0 0 32px rgba(29,185,84,0.40)';
    authButton.onclick = function (event) {
      event.preventDefault();
      openModal('login');
    };
  }

  function ready(callback) {
    if (document.readyState !== 'loading') {
      callback();
      return;
    }

    document.addEventListener('DOMContentLoaded', callback);
  }

  ready(function () {
    injectModal();
    updateNavState();
  });
}());
