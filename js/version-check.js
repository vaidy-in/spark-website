/**
 * Version check for marketing pages.
 * Fetches version.json, compares with the page version (APP_VERSION or meta tag).
 * Shows modal if mismatch - user must refresh to get latest.
 * Runs after DOMContentLoaded so deferred app scripts have set APP_VERSION.
 */
(function () {
    'use strict';

    var LOG = '[version-check]';
    var SESSION_ACK_KEY = 'spark_marketing_version_ack';

    function isLocalDevHost() {
        var host = window.location.hostname;
        return host === 'localhost' || host === '127.0.0.1' || host === '[::1]';
    }

    function getPageVersion() {
        if (window.APP_VERSION) {
            return String(window.APP_VERSION);
        }
        var meta = document.querySelector('meta[name="app-version"]');
        if (meta && meta.getAttribute('content')) {
            return String(meta.getAttribute('content'));
        }
        return null;
    }

    function runCheck() {
        if (isLocalDevHost()) {
            console.log(LOG, 'runCheck: local dev host, skipping version modal');
            return;
        }

        var current = getPageVersion();
        console.log(LOG, 'runCheck: page version (current) =', current);
        if (!current) {
            console.log(LOG, 'runCheck: no page version, skipping');
            return;
        }

        var url = new URL('version.json', window.location.href).href;
        console.log(LOG, 'runCheck: fetching', url);

        fetch(url, { cache: 'no-store' })
            .then(function (r) {
                console.log(LOG, 'runCheck: fetch status', r.status, r.url);
                return r.json();
            })
            .then(function (data) {
                var latest = data && data.version;
                console.log(LOG, 'runCheck: version.json says latest =', latest, 'current =', current);
                if (!latest) {
                    console.log(LOG, 'runCheck: no latest in response, skipping');
                    return;
                }
                if (latest === current) {
                    console.log(LOG, 'runCheck: versions match, no modal');
                    try {
                        sessionStorage.removeItem(SESSION_ACK_KEY);
                    } catch (_) {}
                    return;
                }

                var ack = null;
                try {
                    ack = sessionStorage.getItem(SESSION_ACK_KEY);
                } catch (_) {}
                if (ack === latest) {
                    console.log(LOG, 'runCheck: user already refreshed for', latest, ', not re-showing modal');
                    return;
                }

                console.log(LOG, 'runCheck: MISMATCH - showing modal (latest=' + latest + ' vs current=' + current + ')');
                showModal(latest);
            })
            .catch(function (err) {
                console.warn(LOG, 'runCheck: fetch failed', err);
            });
    }

    function showModal(latest) {
        if (document.getElementById('version-modal')) {
            return;
        }

        console.log(LOG, 'showModal: creating modal');
        var modal = document.createElement('div');
        modal.id = 'version-modal';
        modal.className = 'version-modal';
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');
        modal.setAttribute('aria-labelledby', 'version-modal-title');
        modal.setAttribute('aria-describedby', 'version-modal-desc');
        modal.innerHTML = '<div class="version-modal-backdrop"></div>' +
            '<div class="version-modal-dialog">' +
            '<h2 id="version-modal-title" class="version-modal-title">A new version is available</h2>' +
            '<p id="version-modal-desc" class="version-modal-desc">Please refresh to load the latest version of this page.</p>' +
            '<div class="version-modal-actions">' +
            '<button type="button" class="version-modal-btn version-modal-btn--primary cursor-pointer">Refresh</button>' +
            '</div></div>';
        document.body.appendChild(modal);
        console.log(LOG, 'showModal: modal appended to body');

        var btn = modal.querySelector('.version-modal-btn');
        if (btn) {
            btn.addEventListener('click', function () {
                console.log(LOG, 'Refresh clicked - hard reload');
                try {
                    sessionStorage.setItem(SESSION_ACK_KEY, latest);
                } catch (_) {}
                var url = new URL(window.location.href);
                url.searchParams.set('_cb', String(Date.now()));
                window.location.replace(url.href);
            });
        } else {
            console.warn(LOG, 'showModal: Refresh button not found');
        }
    }

    function scheduleCheck() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', runCheck);
        } else {
            runCheck();
        }
    }

    scheduleCheck();
})();
