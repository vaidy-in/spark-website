/**
 * Version check for marketing pages.
 * Fetches version.json, compares with window.APP_VERSION (set by app JS).
 * Shows modal if mismatch - user must refresh to get latest.
 * Runs after DOMContentLoaded so deferred app scripts have set APP_VERSION.
 */
(function () {
    'use strict';

    var LOG = '[version-check]';

    function runCheck() {
        var current = window.APP_VERSION;
        console.log(LOG, 'runCheck: APP_VERSION (current) =', current);
        if (!current) {
            console.log(LOG, 'runCheck: no APP_VERSION, skipping');
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
                    return;
                }
                console.log(LOG, 'runCheck: MISMATCH - showing modal (latest=' + latest + ' vs current=' + current + ')');
                showModal();
            })
            .catch(function (err) {
                console.warn(LOG, 'runCheck: fetch failed', err);
            });
    }

    function showModal() {
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
            '<p id="version-modal-desc" class="version-modal-desc">Please refresh to update.</p>' +
            '<div class="version-modal-actions">' +
            '<button type="button" class="version-modal-btn version-modal-btn--primary cursor-pointer">Refresh</button>' +
            '</div></div>';
        document.body.appendChild(modal);
        console.log(LOG, 'showModal: modal appended to body');

        var btn = modal.querySelector('.version-modal-btn');
        if (btn) {
            btn.addEventListener('click', function () {
                console.log(LOG, 'Refresh clicked - navigating with cache bust');
                var url = new URL(window.location.href);
                url.searchParams.set('_cb', Date.now());
                window.location.replace(url);
            });
        } else {
            console.warn(LOG, 'showModal: Refresh button not found');
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', runCheck);
    } else {
        runCheck();
    }
})();
