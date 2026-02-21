/**
 * Version check for marketing pages.
 * Fetches version.json, compares with embedded version in HTML.
 * Shows banner if mismatch - user must refresh to get latest.
 */
(function () {
    'use strict';

    var embedded = document.querySelector('meta[name="app-version"]');
    if (!embedded) return;

    var current = embedded.getAttribute('content');
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
})();
