/**
 * Whitepaper: sync TOC active state with the section in view (scroll spy).
 * Runs only on pages with main.whitepaper-main. Styles live in whitepaper.css.
 */
(function () {
    /** Reading line: fraction of viewport height from top (heading is "current" once its top passes this line). */
    const READING_LINE_VIEWPORT_RATIO = 0.45;

    function init() {
        const main = document.querySelector('main.whitepaper-main');
        const article = document.querySelector('.whitepaper-body');
        if (!main || !article) {
            return;
        }

        const headings = Array.from(article.querySelectorAll('h2[id], h3[id]'));
        const links = Array.from(main.querySelectorAll('a.whitepaper-toc-link[href^="#"]'));
        if (!headings.length || !links.length) {
            return;
        }

        let ticking = false;

        function clearActive() {
            links.forEach((a) => {
                a.classList.remove('whitepaper-toc-link--active');
                a.removeAttribute('aria-current');
            });
        }

        /**
         * Keep the active item near the vertical center of the sticky TOC column
         * (standard doc UX; avoids pinning the highlight to the bottom edge).
         */
        function scrollActiveLinkToCenterInAside(aside, link, useSmooth) {
            if (!aside || !link || !aside.contains(link)) {
                return;
            }
            if (aside.clientHeight < 40) {
                return;
            }

            const asideRect = aside.getBoundingClientRect();
            const linkRect = link.getBoundingClientRect();
            if (linkRect.height < 1) {
                return;
            }

            const linkTopInAside = linkRect.top - asideRect.top + aside.scrollTop;
            const linkCenter = linkTopInAside + linkRect.height / 2;
            const targetScrollTop = linkCenter - aside.clientHeight / 2;
            const maxScroll = Math.max(0, aside.scrollHeight - aside.clientHeight);
            const nextTop = Math.max(0, Math.min(targetScrollTop, maxScroll));

            const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            const behavior = useSmooth && !reducedMotion ? 'smooth' : 'auto';
            aside.scrollTo({ top: nextTop, behavior });
        }

        function setActive(id, options) {
            const fromClick = options && options.fromClick === true;
            clearActive();
            if (!id) {
                return;
            }
            const matches = links.filter((a) => a.getAttribute('href') === `#${id}`);
            matches.forEach((a) => {
                a.classList.add('whitepaper-toc-link--active');
                a.setAttribute('aria-current', 'true');
            });

            const desktopAside = main.querySelector('.whitepaper-toc-aside');
            const firstDesktop = matches.find((a) => desktopAside && desktopAside.contains(a));
            if (firstDesktop && desktopAside) {
                window.requestAnimationFrame(() => {
                    scrollActiveLinkToCenterInAside(desktopAside, firstDesktop, fromClick);
                });
            }
        }

        function currentIdFromScroll() {
            const lineY =
                window.scrollY + Math.max(120, window.innerHeight * READING_LINE_VIEWPORT_RATIO);
            let id = null;
            for (const h of headings) {
                const top = h.getBoundingClientRect().top + window.scrollY;
                if (top <= lineY) {
                    id = h.id;
                } else {
                    break;
                }
            }
            return id;
        }

        let lastId = null;

        function onScrollOrResize() {
            if (ticking) {
                return;
            }
            ticking = true;
            window.requestAnimationFrame(() => {
                ticking = false;
                const id = currentIdFromScroll();
                if (id !== lastId) {
                    lastId = id;
                    setActive(id, { fromClick: false });
                }
            });
        }

        function recenterDesktopTocForResize() {
            const desktopAside = main.querySelector('.whitepaper-toc-aside');
            if (!desktopAside || desktopAside.clientHeight < 40) {
                return;
            }
            const active = desktopAside.querySelector('a.whitepaper-toc-link--active');
            if (active) {
                scrollActiveLinkToCenterInAside(desktopAside, active, false);
            }
        }

        window.addEventListener('scroll', onScrollOrResize, { passive: true });
        window.addEventListener('resize', onScrollOrResize, { passive: true });
        window.addEventListener('resize', () => {
            window.requestAnimationFrame(recenterDesktopTocForResize);
        });

        onScrollOrResize();

        document.addEventListener('click', (e) => {
            const a = e.target.closest('a.whitepaper-toc-link[href^="#"]');
            if (!a || !main.contains(a)) {
                return;
            }
            const hash = a.getAttribute('href');
            if (!hash || hash.length < 2) {
                return;
            }
            const id = hash.slice(1);
            window.requestAnimationFrame(() => {
                lastId = id;
                setActive(id, { fromClick: true });
            });
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
