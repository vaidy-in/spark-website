/**
 * Blog RSS Feed Integration
 * Fetches and displays recent posts from beehiiv RSS feed
 */

const RSS_FEED_URL = 'https://rss.beehiiv.com/feeds/6nIx2YZ3cs.xml';
const CORS_PROXY = 'https://api.allorigins.win/get?url=';
const MAX_POSTS = 20;

// Store all posts globally for navigation
let allPosts = [];

/**
 * Format date string to readable format
 */
function formatDate(dateString) {
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
    } catch (e) {
        return dateString;
    }
}

/**
 * Calculate elapsed time (e.g., "2 days ago")
 */
function getElapsedTime(dateString) {
    try {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) {
            const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
            if (diffHours === 0) {
                const diffMins = Math.floor(diffMs / (1000 * 60));
                return diffMins <= 1 ? 'Just now' : `${diffMins} minutes ago`;
            }
            return diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`;
        } else if (diffDays === 1) {
            return '1 day ago';
        } else if (diffDays < 7) {
            return `${diffDays} days ago`;
        } else if (diffDays < 30) {
            const weeks = Math.floor(diffDays / 7);
            return weeks === 1 ? '1 week ago' : `${weeks} weeks ago`;
        } else if (diffDays < 365) {
            const months = Math.floor(diffDays / 30);
            return months === 1 ? '1 month ago' : `${months} months ago`;
        } else {
            const years = Math.floor(diffDays / 365);
            return years === 1 ? '1 year ago' : `${years} years ago`;
        }
    } catch (e) {
        return '';
    }
}

/**
 * Extract text content from HTML string (for excerpts)
 * Removes all HTML tags, style blocks, and script blocks
 */
function stripHtml(html) {
    if (!html) return '';
    
    // Remove style and script tags and their content
    let cleaned = html.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
    cleaned = cleaned.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
    
    // Remove HTML comments
    cleaned = cleaned.replace(/<!--[\s\S]*?-->/g, '');
    
    // Create temporary element to extract text
    const tmp = document.createElement('div');
    tmp.innerHTML = cleaned;
    
    // Get text content and clean up whitespace
    let text = tmp.textContent || tmp.innerText || '';
    
    // Remove excessive whitespace and newlines
    text = text.replace(/\s+/g, ' ').trim();
    
    return text;
}

/**
 * Clean HTML content for display (removes style/script but keeps structure)
 */
function cleanHtmlForDisplay(html) {
    if (!html) return '';
    
    // Remove style and script tags and their content
    let cleaned = html.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
    cleaned = cleaned.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
    
    // Remove HTML comments
    cleaned = cleaned.replace(/<!--[\s\S]*?-->/g, '');
    
    // Remove inline styles
    cleaned = cleaned.replace(/\s*style\s*=\s*["'][^"']*["']/gi, '');
    
    // Remove class attributes that might have beehiiv-specific styling
    cleaned = cleaned.replace(/\s*class\s*=\s*["'][^"']*bh__[^"']*["']/gi, '');
    
    return cleaned;
}

/**
 * Truncate text to specified length
 */
function truncateText(text, maxLength = 150) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
}

/**
 * Parse RSS XML and extract post data
 */
function parseRSSFeed(xmlText) {
    try {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
        
        // Check for parsing errors
        const parserError = xmlDoc.querySelector('parsererror');
        if (parserError) {
            console.error('[spark-marketing][blog] RSS parsing error:', parserError.textContent);
            return null;
        }

        const items = xmlDoc.querySelectorAll('item');
        const posts = [];

        items.forEach((item, index) => {
            if (index >= MAX_POSTS) return;

            const title = item.querySelector('title')?.textContent || 'Untitled';
            const link = item.querySelector('link')?.textContent || '';
            const pubDate = item.querySelector('pubDate')?.textContent || '';
            
            // Get author - handle dc:creator namespace
            const creatorEl = item.querySelector('dc\\:creator, creator');
            const author = creatorEl?.textContent?.trim() || 'Spark Team';
            console.log('[spark-marketing][blog][DEBUG] Post author extracted', {
                postIndex: index,
                title: title.substring(0, 50),
                author: author,
                hasCreatorEl: !!creatorEl
            });
            
            // Get description - handle CDATA sections
            let description = '';
            const descEl = item.querySelector('description');
            if (descEl) {
                description = descEl.textContent || descEl.innerHTML || '';
            }
            
            // Try to get content:encoded if available (more detailed)
            const contentEncodedEl = item.querySelector('content\\:encoded, encoded');
            let contentEncoded = '';
            if (contentEncodedEl) {
                contentEncoded = contentEncodedEl.textContent || contentEncodedEl.innerHTML || '';
            }
            
            // Use content:encoded if available, otherwise fall back to description
            const content = contentEncoded || description;
            
            // Store full HTML content (cleaned)
            const fullContent = cleanHtmlForDisplay(content);
            
            // Extract clean text for excerpt
            let cleanExcerpt = stripHtml(content);
            
            // If excerpt is still empty or too short, try to extract from first paragraph
            if (!cleanExcerpt || cleanExcerpt.length < 20) {
                const tmp = document.createElement('div');
                tmp.innerHTML = content;
                const firstP = tmp.querySelector('p');
                if (firstP) {
                    cleanExcerpt = stripHtml(firstP.innerHTML || firstP.textContent || '');
                }
            }
            
            // Final fallback: if still empty, use a default message
            if (!cleanExcerpt || cleanExcerpt.length < 10) {
                cleanExcerpt = 'Read the full article for more details.';
            }
            
            posts.push({
                title: stripHtml(title),
                link: link.trim(),
                date: pubDate,
                author: stripHtml(author),
                excerpt: truncateText(cleanExcerpt),
                fullContent: fullContent
            });
        });

        return posts;
    } catch (e) {
        console.error('[spark-marketing][blog] Error parsing RSS:', e);
        return null;
    }
}

/**
 * Render posts to the DOM
 */
function renderPosts(posts) {
    const contentContainer = document.getElementById('blog-content');
    const latestPostContainer = document.getElementById('blog-latest-post');
    const sidebarContainer = document.getElementById('blog-sidebar-posts');
    const mobilePostsContainer = document.getElementById('blog-mobile-posts');
    const loadingEl = document.getElementById('blog-loading');
    const errorEl = document.getElementById('blog-error');

    // Hide error and loading states FIRST, before any other logic
    console.log('[spark-marketing][blog][DEBUG] renderPosts called', {
        postsCount: posts ? posts.length : 0,
        hasContentContainer: !!contentContainer,
        hasErrorEl: !!errorEl,
        errorElDisplay: errorEl ? window.getComputedStyle(errorEl).display : 'N/A',
        errorElHidden: errorEl ? errorEl.classList.contains('hidden') : 'N/A',
        isMobile: window.innerWidth < 1024
    });
    
    if (errorEl) {
        errorEl.classList.add('hidden');
        errorEl.style.display = 'none';
        console.log('[spark-marketing][blog][DEBUG] Error element hidden', {
            display: errorEl.style.display,
            hasHiddenClass: errorEl.classList.contains('hidden')
        });
    }
    if (loadingEl) {
        loadingEl.classList.add('hidden');
        loadingEl.style.display = 'none';
    }

    if (!contentContainer || !latestPostContainer || !sidebarContainer || !mobilePostsContainer) {
        console.error('[spark-marketing][blog] Required containers not found');
        console.log('[spark-marketing][blog][DEBUG] Showing error - containers missing', {
            contentContainer: !!contentContainer,
            latestPostContainer: !!latestPostContainer,
            sidebarContainer: !!sidebarContainer,
            mobilePostsContainer: !!mobilePostsContainer
        });
        if (errorEl) {
            errorEl.classList.remove('hidden');
            errorEl.style.display = 'block';
        }
        return;
    }

    if (!posts || posts.length === 0) {
        console.log('[spark-marketing][blog][DEBUG] Showing error - no posts', {
            posts: posts,
            postsLength: posts ? posts.length : 0
        });
        if (errorEl) {
            errorEl.classList.remove('hidden');
            errorEl.style.display = 'block';
        }
        return;
    }

    // Store posts globally
    allPosts = posts;

    // Show content container
    contentContainer.classList.remove('hidden');
    console.log('[spark-marketing][blog][DEBUG] Content container shown', {
        hasHiddenClass: contentContainer.classList.contains('hidden'),
        display: window.getComputedStyle(contentContainer).display
    });

    // Clear existing content
    latestPostContainer.innerHTML = '';
    sidebarContainer.innerHTML = '';
    mobilePostsContainer.innerHTML = '';

    // Render all posts in sidebar and mobile (including latest)
    renderPostLists(posts, sidebarContainer, mobilePostsContainer);
    
    // Check if a specific post is requested via URL hash
    const hash = window.location.hash;
    const postMatch = hash.match(/^#post-(\d+)$/);
    if (postMatch) {
        const postIndex = parseInt(postMatch[1], 10);
        if (postIndex >= 0 && postIndex < posts.length) {
            handleHashChange();
            return;
        }
    }

    // Render latest post (first post) in full on desktop only
    if (window.innerWidth >= 1024) {
        const latestPost = posts[0];
        if (latestPost) {
            renderPostInMain(latestPost, latestPostContainer);
        }
    }
}

/**
 * Render a single post in the main content area
 */
function renderPostInMain(post, container) {
    if (!post || !container) return;

    const elapsed = getElapsedTime(post.date);
    const dateStr = formatDate(post.date);
    
    const postEl = document.createElement('article');
    postEl.className = 'bg-white rounded-xl border border-slate-200 overflow-hidden';
    
    postEl.innerHTML = `
        <div class="p-8 lg:p-12">
            <div class="text-sm text-slate-500 mb-4">
                <div class="flex items-center gap-2">
                    <span>${dateStr}</span>
                    ${elapsed ? `<span class="text-slate-400">•</span><span>${elapsed}</span>` : ''}
                </div>
                ${post.author ? `<div class="mt-1">${post.author}</div>` : ''}
            </div>
            <h1 class="text-3xl lg:text-4xl font-extrabold text-slate-900 mb-6">
                ${post.title}
            </h1>
            <div class="prose prose-lg max-w-none blog-post-content text-slate-700">
                ${post.fullContent || post.excerpt}
            </div>
            <div class="mt-8 pt-6 border-t border-slate-200">
                <a 
                    href="${post.link}" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    class="inline-flex items-center gap-2 text-brand-600 hover:text-brand-700 font-medium"
                >
                    Read on beehiiv
                    <span class="material-symbols-rounded text-[18px]">open_in_new</span>
                </a>
            </div>
        </div>
    `;

    container.innerHTML = '';
    container.appendChild(postEl);
}

/**
 * Render post lists for sidebar and mobile
 */
function renderPostLists(posts, sidebarContainer, mobilePostsContainer) {
    // Render all posts (including latest) in sidebar and mobile
    
    function renderPostItem(post, postIndex, isMobile = false) {
        const elapsed = getElapsedTime(post.date);
        const dateStr = formatDate(post.date);
        
        const postEl = document.createElement('div');
        postEl.setAttribute('data-post-index', postIndex);
        postEl.className = isMobile 
            ? 'bg-white rounded-lg border border-slate-200 p-4 hover:shadow-md transition-shadow cursor-pointer'
            : 'pb-6 border-b border-slate-200 last:border-0 last:pb-0 cursor-pointer';
        
        // Add click handler to open post within site
        postEl.addEventListener('click', (e) => {
            // Don't trigger if clicking on a link
            if (e.target.tagName === 'A') return;
            
            e.preventDefault();
            window.location.hash = `post-${postIndex}`;
            // Trigger hash change manually if already on the same hash
            if (window.location.hash === `#post-${postIndex}`) {
                window.dispatchEvent(new HashChangeEvent('hashchange'));
            }
        });
        
        postEl.innerHTML = `
            <div class="text-xs text-slate-500 mb-2">
                <div class="flex items-center gap-2">
                    <span>${dateStr}</span>
                    ${elapsed ? `<span class="text-slate-400">•</span><span>${elapsed}</span>` : ''}
                </div>
                ${post.author ? `<div class="mt-1">${post.author}</div>` : ''}
            </div>
            <h3 class="text-base font-bold text-slate-900 mb-2 ${isMobile ? '' : 'line-clamp-2'}">
                <a 
                    href="#post-${postIndex}" 
                    class="hover:text-brand-600 transition-colors"
                    onclick="event.stopPropagation(); return true;"
                >
                    ${post.title}
                </a>
            </h3>
            <p class="text-sm text-slate-600 ${isMobile ? 'line-clamp-3' : 'line-clamp-2'} mb-3">
                ${post.excerpt}
            </p>
            <a 
                href="#post-${postIndex}" 
                class="text-xs text-brand-600 hover:text-brand-700 font-medium"
                onclick="event.stopPropagation(); return true;"
            >
                Read more →
            </a>
        `;

        return postEl;
    }

    // Render for sidebar (desktop/tablet) - all posts including latest
    if (posts.length === 0) {
        sidebarContainer.innerHTML = '<p class="text-sm text-slate-500">No posts available.</p>';
    } else {
        posts.forEach((post, index) => {
            sidebarContainer.appendChild(renderPostItem(post, index, false));
        });
    }

    // Render for mobile - all posts including latest
    if (posts.length === 0) {
        mobilePostsContainer.innerHTML = '<p class="text-sm text-slate-500">No posts available.</p>';
    } else {
        posts.forEach((post, index) => {
            mobilePostsContainer.appendChild(renderPostItem(post, index, true));
        });
    }

    console.log('[spark-marketing][blog] Rendered posts', { 
        total: posts.length
    });
}

/**
 * Fetch RSS feed with CORS proxy fallback
 */
async function fetchRSSFeed() {
    const loadingEl = document.getElementById('blog-loading');
    const errorEl = document.getElementById('blog-error');

    try {
        // Try direct fetch first
        let response;
        try {
            response = await fetch(RSS_FEED_URL);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
        } catch (directError) {
            console.log('[spark-marketing][blog] Direct fetch failed, trying CORS proxy:', directError);
            // Fallback to CORS proxy
            const proxyUrl = `${CORS_PROXY}${encodeURIComponent(RSS_FEED_URL)}`;
            response = await fetch(proxyUrl);
            if (!response.ok) throw new Error(`Proxy HTTP ${response.status}`);
            
            const proxyData = await response.json();
            const xmlText = proxyData.contents || proxyData;
            const posts = parseRSSFeed(xmlText);
            renderPosts(posts);
            return;
        }

        const xmlText = await response.text();
        const posts = parseRSSFeed(xmlText);
        renderPosts(posts);

    } catch (error) {
        console.error('[spark-marketing][blog] Error fetching RSS feed:', error);
        console.log('[spark-marketing][blog][DEBUG] Showing error - fetch failed', {
            error: error.message,
            isMobile: window.innerWidth < 1024
        });
        if (loadingEl) {
            loadingEl.classList.add('hidden');
            loadingEl.style.display = 'none';
        }
        if (errorEl) {
            errorEl.classList.remove('hidden');
            errorEl.style.display = 'block';
            console.log('[spark-marketing][blog][DEBUG] Error element displayed', {
                display: errorEl.style.display,
                hasHiddenClass: errorEl.classList.contains('hidden'),
                computedDisplay: window.getComputedStyle(errorEl).display
            });
        }
    }
}

// Handle hash changes to show different posts
function handleHashChange() {
    if (!allPosts || allPosts.length === 0) return;
    
    // Ensure error element is hidden when showing content
    const errorEl = document.getElementById('blog-error');
    if (errorEl) {
        errorEl.classList.add('hidden');
        errorEl.style.display = 'none';
    }
    
    const hash = window.location.hash;
    const postMatch = hash.match(/^#post-(\d+)$/);
    const latestPostContainer = document.getElementById('blog-latest-post');
    const mobilePostContainer = document.getElementById('blog-mobile-selected-post');
    const mobilePostsContainer = document.getElementById('blog-mobile-posts');
    const sidebarContainer = document.getElementById('blog-sidebar-posts');
    
    if (!latestPostContainer) return;
    
    if (postMatch) {
        const postIndex = parseInt(postMatch[1], 10);
        if (postIndex >= 0 && postIndex < allPosts.length) {
            const post = allPosts[postIndex];
            
            // Show on desktop
            renderPostInMain(post, latestPostContainer);
            
            // Show on mobile
            if (mobilePostContainer) {
                renderPostInMain(post, mobilePostContainer);
                mobilePostContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
            
            // Highlight active post in lists
            const highlightActive = (container) => {
                if (!container) return;
                const items = container.querySelectorAll('[data-post-index]');
                items.forEach((item) => {
                    const idx = parseInt(item.getAttribute('data-post-index'), 10);
                    if (idx === postIndex) {
                        item.classList.add('ring-2', 'ring-brand-500', 'border-brand-500');
                    } else {
                        item.classList.remove('ring-2', 'ring-brand-500', 'border-brand-500');
                    }
                });
            };
            
            highlightActive(mobilePostsContainer);
            highlightActive(sidebarContainer);
            
            return;
        }
    }
    
    // Default: show latest post (only on desktop)
    if (window.innerWidth >= 1024) {
        const latestPost = allPosts[0];
        if (latestPost) {
            renderPostInMain(latestPost, latestPostContainer);
        }
    } else {
        // On mobile, clear the main content areas
        latestPostContainer.innerHTML = '';
        if (mobilePostContainer) {
            mobilePostContainer.innerHTML = '';
        }
    }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    // Only run on blog page
    if (window.location.pathname.includes('blog.html') || window.location.pathname.endsWith('/blog')) {
        console.log('[spark-marketing][blog] Initializing blog feed');
        fetchRSSFeed();
        
        // Listen for hash changes
        window.addEventListener('hashchange', handleHashChange);
        
        // Handle initial hash if present
        setTimeout(() => {
            if (window.location.hash) {
                handleHashChange();
            }
        }, 100);
    }
});

