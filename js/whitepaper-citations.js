/**
 * Citation buttons: hover preview (fine pointer), click to pin, source link inside panel.
 * Position via CSS custom properties; styles in whitepaper.css.
 */
(function () {
    var DEBUG = false;
    function log() {
        if (DEBUG && typeof console !== 'undefined' && console.log) {
            console.log.apply(console, ['[whitepaper-cite]'].concat([].slice.call(arguments)));
        }
    }

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

    function prefersFinePointerHover() {
        return window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    }

    function prefersViewportCenteredCiteTip() {
        return window.matchMedia('(max-width: 1023px)').matches;
    }

    function init() {
        var dataEl = document.getElementById('whitepaper-cite-data');
        if (!dataEl) {
            log('no cite data element');
            return;
        }

        var map;
        try {
            map = JSON.parse(dataEl.textContent || '{}');
        } catch {
            log('cite JSON parse failed');
            return;
        }

        var tip = document.createElement('div');
        tip.id = 'whitepaper-cite-tooltip';
        tip.className = 'whitepaper-cite-tooltip';
        tip.setAttribute('role', 'dialog');
        tip.setAttribute('aria-modal', 'false');
        tip.hidden = true;
        document.body.appendChild(tip);

        var hideTimer = null;
        var pinnedTrigger = null;
        var lastFocusTrigger = null;

        function clearHideTimer() {
            if (hideTimer !== null) {
                window.clearTimeout(hideTimer);
                hideTimer = null;
            }
        }

        function scheduleEphemeralHide() {
            clearHideTimer();
            hideTimer = window.setTimeout(function () {
                hideTimer = null;
                if (pinnedTrigger) {
                    return;
                }
                hidePanel();
            }, 180);
        }

        function setExpandedFor(trigger, expanded) {
            document.querySelectorAll('button.whitepaper-cite-ref[data-cite-id]').forEach(function (b) {
                b.setAttribute('aria-expanded', b === trigger && expanded ? 'true' : 'false');
            });
        }

        function positionTip(anchor) {
            var r = anchor.getBoundingClientRect();
            var margin = 8;
            var pad = 12;
            var centerX = prefersViewportCenteredCiteTip();
            tip.classList.toggle('whitepaper-cite-tooltip--center-x', centerX);
            tip.hidden = false;
            tip.style.visibility = 'hidden';
            
            // Force layout so offsetWidth/Height are accurate
            void tip.offsetWidth; 

            var th = tip.offsetHeight || 120;
            var tw = tip.offsetWidth || 280;
            var vw = window.innerWidth;
            var vh = window.innerHeight;
            var left;
            if (centerX) {
                // On mobile, we force the width in CSS to vw - 1.5rem
                // but we still calculate left to be safe.
                left = (vw - tw) / 2;
                if (left < pad) {
                    left = pad;
                }
            } else {
                left = r.left;
                if (left + tw > vw - pad) {
                    left = vw - tw - pad;
                }
                if (left < pad) {
                    left = pad;
                }
            }
            var top = r.bottom + margin;
            if (top + th > vh - pad && r.top > th + margin) {
                top = r.top - th - margin;
            }
            tip.style.setProperty('--whitepaper-cite-tip-left', String(Math.round(left)) + 'px');
            tip.style.setProperty('--whitepaper-cite-tip-top', String(Math.round(Math.max(8, top))) + 'px');
            tip.style.visibility = '';
        }

        function fillTipContent(id, entry) {
            var host = hostname(entry.url);
            var safeUrl = escapeHtml(entry.url);
            var safeTitle = escapeHtml(entry.title);
            var safeHost = escapeHtml(host);
            var safeId = escapeHtml(id);
            tip.innerHTML =
                '<div class="whitepaper-cite-tooltip-head">' +
                '<span class="whitepaper-cite-tooltip-line"><strong class="whitepaper-cite-tooltip-num">[' +
                safeId +
                ']</strong> <span class="whitepaper-cite-tooltip-title">' +
                safeTitle +
                '</span></span>' +
                '<a class="whitepaper-cite-tooltip-link" href="' +
                safeUrl +
                '" target="_blank" rel="noopener noreferrer" aria-label="Open citation source in new tab">' +
                '<span class="material-symbols-rounded whitepaper-cite-tooltip-ext-icon" aria-hidden="true">open_in_new</span>' +
                '</a>' +
                '</div>' +
                (host ? '<span class="whitepaper-cite-tooltip-host">' + safeHost + '</span>' : '');
        }

        function showPanel(trigger, options) {
            var opts = options || {};
            var id = trigger.getAttribute('data-cite-id');
            var entry = map[id];
            if (!entry) {
                log('no entry for id', id);
                return;
            }
            lastFocusTrigger = trigger;
            fillTipContent(id, entry);
            positionTip(trigger);
            tip.hidden = false;
            setExpandedFor(trigger, true);
            log('show', id, opts);
            if (opts.focusLink) {
                window.requestAnimationFrame(function () {
                    var link = tip.querySelector('a.whitepaper-cite-tooltip-link');
                    if (link) {
                        link.focus();
                    }
                });
            }
        }

        function hidePanel() {
            clearHideTimer();
            tip.hidden = true;
            pinnedTrigger = null;
            setExpandedFor(null, false);
            log('hide');
        }

        var triggers = document.querySelectorAll('button.whitepaper-cite-ref[data-cite-id]');
        triggers.forEach(function (btn) {
            btn.setAttribute('aria-controls', 'whitepaper-cite-tooltip');
            btn.addEventListener('mouseenter', function () {
                if (!prefersFinePointerHover()) {
                    return;
                }
                clearHideTimer();
                if (pinnedTrigger) {
                    return;
                }
                showPanel(btn, { ephemeral: true });
            });

            btn.addEventListener('mouseleave', function () {
                if (!prefersFinePointerHover()) {
                    return;
                }
                if (pinnedTrigger) {
                    return;
                }
                scheduleEphemeralHide();
            });

            btn.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                clearHideTimer();
                if (pinnedTrigger === btn && !tip.hidden) {
                    hidePanel();
                    log('click toggle off');
                    return;
                }
                pinnedTrigger = btn;
                var fromKeyboard = e.detail === 0;
                showPanel(btn, { focusLink: fromKeyboard });
                log('click pin', fromKeyboard ? 'keyboard' : 'pointer');
            });
        });

        tip.addEventListener('mouseenter', function () {
            clearHideTimer();
        });
        tip.addEventListener('mouseleave', function () {
            if (pinnedTrigger) {
                return;
            }
            scheduleEphemeralHide();
        });

        document.addEventListener(
            'pointerdown',
            function (e) {
                if (tip.hidden) {
                    return;
                }
                if (tip.contains(e.target)) {
                    return;
                }
                if (e.target.closest && e.target.closest('button.whitepaper-cite-ref')) {
                    return;
                }
                hidePanel();
            },
            true,
        );

        document.addEventListener('keydown', function (e) {
            if (e.key !== 'Escape' || tip.hidden) {
                return;
            }
            hidePanel();
            if (lastFocusTrigger && typeof lastFocusTrigger.focus === 'function') {
                lastFocusTrigger.focus();
            }
        });

        window.addEventListener(
            'scroll',
            function () {
                if (tip.hidden) {
                    return;
                }
                if (pinnedTrigger) {
                    positionTip(pinnedTrigger);
                    return;
                }
                hidePanel();
            },
            true,
        );

        window.addEventListener(
            'resize',
            function () {
                if (tip.hidden) {
                    return;
                }
                var anchor = pinnedTrigger || lastFocusTrigger;
                if (anchor) {
                    positionTip(anchor);
                }
            },
            { passive: true },
        );
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
