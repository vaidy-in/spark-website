/**
 * Version check for marketing pages.
 * Fetches version.json, compares with window.APP_VERSION (set by app JS).
 * Shows banner if mismatch - user must refresh to get latest.
 * Runs after DOMContentLoaded so deferred app scripts have set APP_VERSION.
 */
(function () {
    'use strict';

    function runCheck() {
        var current = window.APP_VERSION;
        if (!current) return;

        var url = new URL('version.json', window.location.href).href;

        fetch(url, { cache: 'no-store' })
            .then(function (r) { return r.json(); })
            .then(function (data) {
                var latest = data && data.version;
                if (!latest || latest === current) return;
                showBanner();
            })
            .catch(function () { /* ignore */ });
    }

    function showBanner() {
        var banner = document.createElement('div');
        banner.id = 'version-banner';
        banner.className = 'version-banner';
        banner.setAttribute('role', 'alert');
        banner.innerHTML = '<span class="version-banner-text">A new version is available. Please refresh to update.</span><button type="button" class="version-banner-btn cursor-pointer">Refresh</button>';
        document.body.insertBefore(banner, document.body.firstChild);

        var btn = banner.querySelector('.version-banner-btn');
        if (btn) btn.addEventListener('click', function () { location.reload(); });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', runCheck);
    } else {
        runCheck();
    }
})();
