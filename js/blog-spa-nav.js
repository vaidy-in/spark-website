/**
 * Blog post pages: swap main article via fetch so the sidebar scroller stays put.
 * Falls back to full navigation on errors or modified clicks.
 */
(function () {
    const SIDEBAR_INACTIVE =
        'pb-6 border-b border-slate-200 last:border-0 last:pb-0';
    const SIDEBAR_ACTIVE =
        'pb-6 border-b-2 border-brand-500 last:border-0 last:pb-0';
    const MOBILE_INACTIVE =
        'bg-white rounded-lg border border-slate-200 p-4 hover:shadow-md transition-shadow';
    const MOBILE_ACTIVE =
        'bg-white rounded-lg border ring-2 ring-brand-500 border-brand-500 p-4 hover:shadow-md transition-shadow';

    function isBlogPostPath(pathname) {
        return /\/blog\/[^/]+\.html$/.test(pathname || '');
    }

    function slugFromPostPath(pathname) {
        const m = (pathname || '').match(/\/blog\/([^/]+)\.html$/);
        return m ? m[1] : null;
    }

    function shouldEnhance() {
        return Boolean(
            document.getElementById('blog-latest-post') &&
                document.getElementById('blog-sidebar-posts'),
        );
    }

    function shouldInterceptClick(event, anchor) {
        if (event.defaultPrevented) return false;
        if (event.button !== 0) return false;
        if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) {
            return false;
        }
        if (anchor.target === '_blank') return false;
        if (anchor.hasAttribute('download')) return false;
        const hrefAttr = anchor.getAttribute('href');
        if (!hrefAttr || hrefAttr.startsWith('#')) return false;
        return true;
    }

    function resolvesToBlogPost(anchor) {
        let url;
        try {
            url = new URL(anchor.getAttribute('href'), window.location.href);
        } catch {
            return null;
        }
        if (url.origin !== window.location.origin) return null;
        if (!isBlogPostPath(url.pathname)) return null;
        return url;
    }

    function setLoading(on) {
        const article = document.getElementById('blog-latest-post');
        const desktop = document.getElementById('blog-article-loading-desktop');
        const mobile = document.getElementById('blog-article-loading-mobile');
        [desktop, mobile].forEach((el) => {
            if (!el) return;
            el.dataset.visible = on ? 'true' : 'false';
            el.setAttribute('aria-hidden', on ? 'false' : 'true');
        });
        if (article) {
            article.setAttribute('aria-busy', on ? 'true' : 'false');
        }
    }

    function updateActiveSlug(slug) {
        if (!slug) return;
        const sidebar = document.getElementById('blog-sidebar-posts');
        if (sidebar) {
            sidebar.querySelectorAll('[data-blog-slug]').forEach((el) => {
                const active = el.getAttribute('data-blog-slug') === slug;
                el.className = active ? SIDEBAR_ACTIVE : SIDEBAR_INACTIVE;
            });
        }
        const mobilePosts = document.getElementById('blog-mobile-posts');
        if (mobilePosts) {
            mobilePosts.querySelectorAll('[data-blog-slug]').forEach((el) => {
                const active = el.getAttribute('data-blog-slug') === slug;
                el.className = active ? MOBILE_ACTIVE : MOBILE_INACTIVE;
            });
        }
    }

    function updateHeadFromDoc(newDoc) {
        const newTitle = newDoc.querySelector('title');
        if (newTitle && newTitle.textContent) {
            document.title = newTitle.textContent;
        }

        const syncMeta = (selector, attr, value) => {
            if (!value) return;
            const cur = document.head.querySelector(selector);
            if (cur) cur.setAttribute(attr, value);
        };

        const desc = newDoc.querySelector('meta[name="description"]');
        if (desc) {
            syncMeta('meta[name="description"]', 'content', desc.getAttribute('content') || '');
        }

        const canonical = newDoc.querySelector('link[rel="canonical"]');
        if (canonical) {
            syncMeta('link[rel="canonical"]', 'href', canonical.getAttribute('href') || '');
        }

        ['og:title', 'og:description', 'og:url', 'twitter:title', 'twitter:description'].forEach(
            (prop) => {
                const isTwitter = prop.startsWith('twitter:');
                const sel = isTwitter
                    ? `meta[name="${prop}"]`
                    : `meta[property="${prop}"]`;
                const node = newDoc.head.querySelector(sel);
                if (node) {
                    syncMeta(sel, 'content', node.getAttribute('content') || '');
                }
            },
        );

        const oldLd = document.querySelector('script[type="application/ld+json"]');
        const newLd = newDoc.querySelector('script[type="application/ld+json"]');
        if (oldLd && newLd && newLd.textContent) {
            oldLd.textContent = newLd.textContent;
        }
    }

    function focusArticleHeading() {
        const h1 = document.querySelector('#blog-latest-post h1');
        if (!h1) return;
        h1.setAttribute('tabindex', '-1');
        h1.focus({ preventScroll: false });
    }

    function scrollMobileArticleIntoView() {
        if (!window.matchMedia('(max-width: 1023px)').matches) return;
        const target = document.getElementById('blog-mobile-selected-post');
        if (!target || !target.querySelector('article')) return;
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            });
        });
    }

    let inFlight = false;

    async function navigateToPostUrl(url, options) {
        const opts = options || {};
        const skipHistory = Boolean(opts.skipHistory);
        if (inFlight) return;
        const urlObj = typeof url === 'string' ? new URL(url, window.location.href) : url;
        if (urlObj.pathname === window.location.pathname && !skipHistory) {
            return;
        }

        inFlight = true;
        setLoading(true);

        try {
            const res = await fetch(urlObj.href, { credentials: 'same-origin' });
            if (!res.ok) {
                throw new Error(`HTTP ${res.status}`);
            }
            const html = await res.text();
            const doc = new DOMParser().parseFromString(html, 'text/html');
            const latest = doc.getElementById('blog-latest-post');
            const mobileBlock = doc.getElementById('blog-mobile-selected-post');
            if (!latest || !mobileBlock) {
                throw new Error('Missing blog article in response');
            }

            const targetLatest = document.getElementById('blog-latest-post');
            const targetMobile = document.getElementById('blog-mobile-selected-post');
            if (!targetLatest || !targetMobile) {
                throw new Error('Missing blog article mount');
            }

            targetLatest.innerHTML = latest.innerHTML;
            targetMobile.innerHTML = mobileBlock.innerHTML;
            updateHeadFromDoc(doc);

            const slug = slugFromPostPath(urlObj.pathname);
            updateActiveSlug(slug);

            if (!skipHistory) {
                history.pushState({ blogSpa: true }, '', urlObj.href);
            }

            focusArticleHeading();
            scrollMobileArticleIntoView();
        } catch (err) {
            console.warn('[spark-marketing][blog-spa-nav] fallback to full navigation', err);
            window.location.assign(urlObj.href);
        } finally {
            setLoading(false);
            inFlight = false;
        }
    }

    function onDocumentClick(event) {
        if (!shouldEnhance()) return;
        const anchor = event.target.closest('a');
        if (!anchor || !document.getElementById('blog-content')?.contains(anchor)) {
            return;
        }
        if (!shouldInterceptClick(event, anchor)) return;
        const url = resolvesToBlogPost(anchor);
        if (!url) return;
        event.preventDefault();
        navigateToPostUrl(url);
    }

    function onPopState() {
        if (!shouldEnhance()) return;
        const url = window.location.href;
        const path = new URL(url).pathname;
        if (!isBlogPostPath(path)) {
            window.location.reload();
            return;
        }
        navigateToPostUrl(url, { skipHistory: true });
    }

    function initBlogSpaNav() {
        if (!shouldEnhance()) {
            return;
        }
        document.addEventListener('click', onDocumentClick);
        window.addEventListener('popstate', onPopState);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initBlogSpaNav);
    } else {
        initBlogSpaNav();
    }
})();
