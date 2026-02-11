/**
 * Eve Dev Tools - Chrome Extension
 * Popup script for quick actions and tool navigation.
 *
 * All tools open at: https://lbartoszcze.github.io/eve-ai-agent/
 */

(function () {
  'use strict';

  const BASE_URL = 'https://lbartoszcze.github.io/eve-ai-agent';
  const SITE_URL = BASE_URL + '/';
  const SUPPORT_URL = 'https://buy.stripe.com/8x23cvfBd7g61mu6Aod3i0S';

  // ── Tool URL mapping ──────────────────────────────────────────────
  // Tools with dedicated pages use their filename.
  // Tools that are inline modals on the index page use a hash fragment.
  const TOOL_URLS = {
    json:       `${BASE_URL}/json.html`,
    base64:     `${BASE_URL}/base64.html`,
    'url-encode': `${BASE_URL}/url-encode.html`,
    markdown:   `${BASE_URL}/markdown.html`,
    color:      `${BASE_URL}/color.html`,
    cron:       `${BASE_URL}/cron.html`,
    password:   `${BASE_URL}/password.html`,
    regex:      `${BASE_URL}/regex.html`,
    hash:       `${BASE_URL}/hash.html`,
    diff:       `${BASE_URL}/diff.html`,
    jwt:        `${SITE_URL}#jwt`,
    uuid:       `${SITE_URL}#uuid`,
    gradient:   `${SITE_URL}#gradient`,
    timestamp:  `${SITE_URL}#timestamp`,
  };

  // ── Helper: copy text to clipboard ────────────────────────────────
  function copyToClipboard(text, feedbackBtn) {
    navigator.clipboard.writeText(text).then(function () {
      if (feedbackBtn) {
        var original = feedbackBtn.textContent;
        feedbackBtn.textContent = 'Copied!';
        feedbackBtn.classList.add('copied');
        setTimeout(function () {
          feedbackBtn.textContent = original;
          feedbackBtn.classList.remove('copied');
        }, 1200);
      }
    }).catch(function () {
      // Fallback for older browsers / restricted contexts
      var textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      if (feedbackBtn) {
        var original = feedbackBtn.textContent;
        feedbackBtn.textContent = 'Copied!';
        feedbackBtn.classList.add('copied');
        setTimeout(function () {
          feedbackBtn.textContent = original;
          feedbackBtn.classList.remove('copied');
        }, 1200);
      }
    });
  }

  // ── Helper: open URL in a new tab ─────────────────────────────────
  function openInNewTab(url) {
    chrome.tabs.create({ url: url });
  }

  // ── UUID generation ───────────────────────────────────────────────
  function generateUUID() {
    // Use crypto.randomUUID if available, otherwise fallback
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
    // RFC 4122 v4 fallback
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = (Math.random() * 16) | 0;
      var v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  // ── Password generation ───────────────────────────────────────────
  function generatePassword(length) {
    length = length || 20;
    var charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()-_=+[]{}|;:,.<>?';
    var password = '';
    var array = new Uint32Array(length);
    crypto.getRandomValues(array);

    // Ensure at least one character from each category
    var lower = 'abcdefghijklmnopqrstuvwxyz';
    var upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    var digits = '0123456789';
    var symbols = '!@#$%^&*()-_=+[]{}|;:,.<>?';

    var guaranteed = [
      lower[Math.floor(Math.random() * lower.length)],
      upper[Math.floor(Math.random() * upper.length)],
      digits[Math.floor(Math.random() * digits.length)],
      symbols[Math.floor(Math.random() * symbols.length)],
    ];

    for (var i = 0; i < length; i++) {
      if (i < guaranteed.length) {
        password += guaranteed[i];
      } else {
        password += charset[array[i] % charset.length];
      }
    }

    // Shuffle the password so guaranteed chars are not always at the start
    var arr = password.split('');
    for (var j = arr.length - 1; j > 0; j--) {
      var k = Math.floor(Math.random() * (j + 1));
      var temp = arr[j];
      arr[j] = arr[k];
      arr[k] = temp;
    }
    return arr.join('');
  }

  // ── Current Unix timestamp ────────────────────────────────────────
  function getCurrentTimestamp() {
    return Math.floor(Date.now() / 1000).toString();
  }

  // ── DOM references ────────────────────────────────────────────────
  var uuidValue = document.getElementById('uuidValue');
  var uuidBtn = document.getElementById('uuidBtn');
  var passwordValue = document.getElementById('passwordValue');
  var passwordBtn = document.getElementById('passwordBtn');
  var timestampValue = document.getElementById('timestampValue');
  var timestampBtn = document.getElementById('timestampBtn');
  var openSiteLink = document.getElementById('openSiteLink');
  var supportLink = document.getElementById('supportLink');

  // ── Quick action: UUID ────────────────────────────────────────────
  function handleUUID() {
    var uuid = generateUUID();
    uuidValue.textContent = uuid;
    uuidValue.title = uuid;
    copyToClipboard(uuid, uuidBtn);
  }

  uuidBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    handleUUID();
  });
  document.getElementById('uuidAction').addEventListener('click', handleUUID);

  // ── Quick action: Password ────────────────────────────────────────
  function handlePassword() {
    var pw = generatePassword(20);
    passwordValue.textContent = pw;
    passwordValue.title = pw;
    copyToClipboard(pw, passwordBtn);
  }

  passwordBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    handlePassword();
  });
  document.getElementById('passwordAction').addEventListener('click', handlePassword);

  // ── Quick action: Timestamp ───────────────────────────────────────
  function updateTimestamp() {
    timestampValue.textContent = getCurrentTimestamp();
  }

  function handleTimestampCopy() {
    var ts = getCurrentTimestamp();
    timestampValue.textContent = ts;
    copyToClipboard(ts, timestampBtn);
  }

  // Update timestamp every second
  updateTimestamp();
  setInterval(updateTimestamp, 1000);

  timestampBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    handleTimestampCopy();
  });
  document.getElementById('timestampAction').addEventListener('click', handleTimestampCopy);

  // ── Tool grid buttons ─────────────────────────────────────────────
  var toolBtns = document.querySelectorAll('.tool-btn[data-tool]');
  toolBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var tool = btn.getAttribute('data-tool');
      var url = TOOL_URLS[tool];
      if (url) {
        openInNewTab(url);
      }
    });
  });

  // ── Footer links ──────────────────────────────────────────────────
  openSiteLink.addEventListener('click', function () {
    openInNewTab(SITE_URL);
  });

  supportLink.addEventListener('click', function () {
    openInNewTab(SUPPORT_URL);
  });

})();
