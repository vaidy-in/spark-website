/**
 * Hover preview for inline citation links on the whitepaper (data from #whitepaper-cite-data).
 */
(function () {
    function escapeHtml(s) {
        return String(s)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/"/g, '&quot;');
    }

    function hostname(url) {
        try {
            return new URL(url).hostname;
        } catch {
            return '';
        }
    }

    function init() {
        const dataEl = document.getElementById('whitepaper-cite-data');
        if (!dataEl) return;

        let map;
        try {
            map = JSON.parse(dataEl.textContent || '{}');
        } catch {
            return;
        }

        const tip = document.createElement('div');
        tip.id = 'whitepaper-cite-tooltip';
        tip.className = 'whitepaper-cite-tooltip';
        tip.setAttribute('role', 'tooltip');
        tip.hidden = true;
        document.body.appendChild(tip);

        let hideTimer;

        function positionTip(anchor) {
            const r = anchor.getBoundingClientRect();
            const margin = 6;
            tip.style.left = `${Math.round(r.left)}px`;
            let top = r.bottom + margin;
            tip.hidden = false;
            const th = tip.offsetHeight || 0;
            if (top + th > window.innerHeight - 8 && r.top > th + margin) {
                top = r.top - th - margin;
            }
            tip.style.top = `${Math.round(Math.max(8, top))}px`;
        }

        function scheduleHide() {
            hideTimer = window.setTimeout(function () {
                tip.hidden = true;
            }, 150);
        }

        document.querySelectorAll('a.whitepaper-cite-ref[data-cite-id]').forEach(function (a) {
            a.addEventListener('mouseenter', function () {
                window.clearTimeout(hideTimer);
                const id = a.getAttribute('data-cite-id');
                const entry = map[id];
                if (!entry) return;
                const host = hostname(entry.url);
                tip.innerHTML =
                    '<span class="whitepaper-cite-tooltip-line"><strong class="whitepaper-cite-tooltip-num">[' +
                    escapeHtml(id) +
                    ']</strong> ' +
                    '<span class="whitepaper-cite-tooltip-title">' +
                    escapeHtml(entry.title) +
                    '</span></span>' +
                    (host
                        ? '<span class="whitepaper-cite-tooltip-host">' + escapeHtml(host) + '</span>'
                        : '');
                positionTip(a);
            });

            a.addEventListener('mouseleave', scheduleHide);
        });

        window.addEventListener(
            'scroll',
            function () {
                if (!tip.hidden) tip.hidden = true;
            },
            true,
        );
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
