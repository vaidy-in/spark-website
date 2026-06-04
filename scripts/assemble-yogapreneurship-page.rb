#!/usr/bin/env ruby
# frozen_string_literal: true

require 'json'

ROOT = File.expand_path('../..', __dir__)
curriculum = File.read(File.join(ROOT, 'marketing/data/yogapreneurship-curriculum-fragment.html'), encoding: 'UTF-8')
program_map = File.read(File.join(ROOT, 'marketing/data/yogapreneurship-program-map-fragment.html'), encoding: 'UTF-8')
manifest = JSON.parse(File.read(File.join(ROOT, 'marketing/data/yogapreneurship-curriculum.json'), encoding: 'UTF-8'))
t = manifest['totals']

def slide_carousel(id, label, slides)
  figures = slides.each_with_index.map do |src, idx|
    active = idx.zero? ? ' is-active' : ''
    alt = File.basename(src, '.*').tr('-', ' ')
    <<~FIG.strip
      <figure data-carousel-slide class="min-w-full snap-center carousel-snap-stop"><div class="course-landing-slide-frame#{active}"><div class="course-landing-slide-frame__media"><img src="#{src}" alt="#{alt}"></div></div></figure>
    FIG
  end.join("\n")
  dots = slides.each_index.map { |i| %(<button type="button" data-carousel-dot="#{i}" aria-label="Go to slide #{i + 1}"></button>) }.join("\n")

  <<~HTML
            <div class="mb-12">
                <p class="course-landing-slide-carousel-label">#{label}</p>
                <div id="#{id}" data-carousel data-carousel-fullscreen class="course-landing-slide-carousel relative">
                    <div data-carousel-track class="overflow-x-auto scroll-smooth snap-x snap-mandatory no-scrollbar">
                        <div class="flex gap-3">
                                #{figures}
                        </div>
                    </div>
                    <div class="course-landing-slide-carousel__controls">
                        <button type="button" data-carousel-prev aria-label="Previous slide" class="course-landing-slide-carousel__btn">←</button>
                        <div data-carousel-dots class="flex items-center justify-center gap-2">#{dots}</div>
                        <button type="button" data-carousel-next aria-label="Next slide" class="course-landing-slide-carousel__btn">→</button>
                    </div>
                </div>
            </div>
  HTML
end

slides_s1 = (1..4).map { |i| format('../images/courses/yogapreneurship/slides/session-01/slide-%02d.jpg', i) }
slides_s6 = (1..4).map { |i| format('../images/courses/yogapreneurship/slides/session-06/slide-%02d.jpg', i) }
slides_s10 = (1..4).map { |i| format('../images/courses/yogapreneurship/slides/session-10/slide-%02d.jpg', i) }

slide_section = [
  slide_carousel('yoga-slides-session-1', 'Session 1 · Student base and credibility', slides_s1),
  slide_carousel('yoga-slides-session-6', 'Session 6 · Investment and pricing', slides_s6),
  slide_carousel('yoga-slides-session-10', 'Session 10 · Energy and consistency', slides_s10)
].join

html = <<~HTML
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Yogapreneurship - Vikas Shenoy · Pancha Yoga</title>
    <meta name="description" content="The complete yoga-teacher entrepreneurship program: #{t['sessions']} live-session recordings, #{t['chapters']} chapters, slides, quizzes, and AI tutor on Spark. Built by Vikas Shenoy (Pancha Yoga).">
    <meta property="og:title" content="Yogapreneurship - Build and scale your yoga teaching practice">
    <meta property="og:description" content="#{t['sessions']} sessions · #{t['chapters']} chapters · #{t['hoursLabel']} of structured teaching for yoga entrepreneurs.">
    <meta property="og:image" content="../images/courses/yogapreneurship/thumbnail.jpg">
    <link rel="icon" href="../images/courses/yogapreneurship/favicon.svg" type="image/svg+xml">
    <link rel="stylesheet" href="../css/tailwind.css">
    <link rel="stylesheet" href="../css/components/accordion.css">
    <link rel="stylesheet" href="../css/components/course-landing.css">
    <link rel="stylesheet" href="../css/components/course-landing-panchayoga.css">
    <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,400,0,0" rel="stylesheet">
</head>
<body class="course-landing-page course-landing-page--panchayoga course-landing-page-with-sidebar antialiased">

<header class="course-landing-header fixed top-0 inset-x-0 z-40">
    <div class="cl-container h-full flex items-center justify-between gap-4">
        <a href="#top" class="min-w-0">
            <p class="course-landing-header__title truncate">Yogapreneurship</p>
            <p class="course-landing-header__sub truncate">Vikas Shenoy · Pancha Yoga</p>
        </a>
        <a href="#pricing" class="course-landing-cta course-landing-cta--outline hidden sm:inline-flex items-center justify-center px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap">View pricing</a>
        <a href="#pricing" class="course-landing-cta sm:hidden inline-flex items-center justify-center px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap">Pricing</a>
    </div>
</header>

<main id="top">
    <section class="course-landing-hero course-landing-section-anchor">
        <div class="course-landing-hero__bg" aria-hidden="true">
            <div class="course-landing-hero__bg-image"></div>
            <div class="course-landing-hero__bg-gradient"></div>
            <div class="course-landing-hero__grain"></div>
        </div>
        <div class="course-landing-hero__inner cl-container">
            <div class="course-landing-hero-layout-with-sidebar">
                <div class="course-landing-hero__layout">
                    <div>
                        <p class="course-landing-eyebrow mb-3">Pancha Yoga · Yoga teacher entrepreneurship</p>
                        <h1 class="course-landing-hero__headline">Build the yoga teaching business your students already need from you</h1>
                        <p class="course-landing-hero__sub">Yogapreneurship is Vikas Shenoy's full program for teachers who want more students, sharper positioning, professional systems, and income stability - not another generic "business tips" playlist. On Spark you get #{t['sessions']} live-session recordings (#{t['hoursLabel']}), #{t['chapters']} chapterized lessons, presentation slides on #{t['sessionsWithSlides']} sessions, scenario quizzes, study notes, and an AI tutor grounded in Vikas's teaching.</p>
                        <div class="course-landing-mega-stats">
                            <span class="course-landing-mega-stat"><strong>#{t['sessions']}</strong> sessions</span>
                            <span class="course-landing-mega-stat"><strong>#{t['chapters']}</strong> chapters</span>
                            <span class="course-landing-mega-stat"><strong>#{t['hoursLabel']}</strong> video</span>
                            <span class="course-landing-mega-stat"><strong>~90–120 min</strong> per session</span>
                        </div>
                        <div class="flex flex-col sm:flex-row gap-3 mb-2 mt-6">
                            <a href="#curriculum" class="course-landing-cta inline-flex items-center justify-center px-6 py-3 rounded-full text-base font-semibold">View full program</a>
                            <a href="#pricing" class="course-landing-cta-secondary inline-flex items-center justify-center px-6 py-3 rounded-full text-base font-semibold">Pricing</a>
                        </div>
                        <div class="course-landing-hero__instructor-row lg:hidden">
                            <img src="../images/courses/yogapreneurship/vikas-shenoy.jpg" alt="Vikas Shenoy" class="w-12 h-12 rounded-full object-cover border-2 border-[var(--cl-gold)]">
                            <div>
                                <p class="course-landing-hero__instructor-name">Vikas Shenoy</p>
                                <p class="course-landing-hero__instructor-role">Founder, Pancha Yoga · Yogapreneurship mentor</p>
                            </div>
                        </div>
                    </div>
                    <div class="course-landing-hero__visual">
                        <div class="course-landing-hero__thumb">
                            <img src="../images/courses/yogapreneurship/thumbnail.jpg" alt="Yogapreneurship course">
                        </div>
                        <img src="../images/courses/yogapreneurship/vikas-shenoy.jpg" alt="Vikas Shenoy" class="course-landing-hero__portrait course-landing-instructor-photo">
                    </div>
                </div>
                <aside class="course-landing-sidebar-wrap" aria-label="Program summary">
                    <div id="course-landing-sidebar" class="course-landing-sidebar" aria-hidden="true">
                        <p class="course-landing-eyebrow mb-2">The program</p>
                        <p class="course-landing-sidebar__price" style="font-size:1.25rem">Pricing TBD</p>
                        <p class="course-landing-sidebar__note">Full mega-course · async on Spark</p>
                        <a href="#pricing" class="course-landing-cta w-full inline-flex items-center justify-center px-5 py-3 rounded-full text-sm font-semibold mb-3">View pricing</a>
                        <ul class="course-landing-sidebar__list">
                            <li><span style="color:var(--cl-cyan)">✓</span><span>#{t['sessions']} sessions · #{t['chapters']} chapters</span></li>
                            <li><span style="color:var(--cl-cyan)">✓</span><span>Slides, notes, quizzes, AI tutor</span></li>
                            <li><span style="color:var(--cl-cyan)">✓</span><span>#{t['hoursLabel']} structured video</span></li>
                        </ul>
                        <p class="course-landing-sidebar__guarantee">Niche program for practicing yoga teachers building a real studio or online practice.</p>
                    </div>
                </aside>
            </div>
        </div>
    </section>

    <section class="course-landing-trust-strip course-landing-section--dark">
        <div class="cl-container">
            <div class="course-landing-trust-pills">
                <span class="course-landing-trust-pill"><span class="course-landing-trust-pill__dot"></span><strong>#{t['sessions']}</strong> sessions</span>
                <span class="course-landing-trust-pill"><span class="course-landing-trust-pill__dot"></span><strong>#{t['chapters']}</strong> chapters</span>
                <span class="course-landing-trust-pill"><span class="course-landing-trust-pill__dot"></span><strong>#{t['hoursLabel']}</strong> video</span>
                <span class="course-landing-trust-pill"><span class="course-landing-trust-pill__dot"></span><strong>Slides</strong> on #{t['sessionsWithSlides']}/#{t['sessions']}</span>
            </div>
        </div>
    </section>

    <section id="learn" class="course-landing-section--dark py-14 sm:py-16">
        <div class="cl-container">
            <div class="max-w-3xl mb-10">
                <p class="course-landing-eyebrow mb-3">Outcomes</p>
                <h2 class="course-landing-section-title mb-4">What you will build across the program</h2>
                <p class="course-landing-section-lead">Each session is a full live recording (typically 90–120 minutes), chapterized for navigation. This is operator-level teaching for teachers who already teach yoga and need the business layer.</p>
            </div>
            <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <article class="course-landing-learn-card"><h3 class="course-landing-learn-card__title">Student base and credibility</h3><p class="course-landing-learn-card__text">Marketing pillars, trust-building, and economics of group vs personal classes.</p></article>
                <article class="course-landing-learn-card"><h3 class="course-landing-learn-card__title">Roles and niche</h3><p class="course-landing-learn-card__text">The three entrepreneurial roles and how to niche without shrinking your impact.</p></article>
                <article class="course-landing-learn-card"><h3 class="course-landing-learn-card__title">Strategy and tools</h3><p class="course-landing-learn-card__text">Synergy across offerings, social media that converts, and systems that scale time.</p></article>
                <article class="course-landing-learn-card"><h3 class="course-landing-learn-card__title">Pricing and investment</h3><p class="course-landing-learn-card__text">Overcome price resistance, use inquiry-based sales, and model studio economics.</p></article>
                <article class="course-landing-learn-card"><h3 class="course-landing-learn-card__title">Professional operations</h3><p class="course-landing-learn-card__text">Policies, professionalism, and systems that protect you and your students.</p></article>
                <article class="course-landing-learn-card"><h3 class="course-landing-learn-card__title">Sustainable ambition</h3><p class="course-landing-learn-card__text">Energy, credibility, consistency, and holistic growth without burnout.</p></article>
            </div>
        </div>
    </section>

    <section id="program-map" class="course-landing-section--dark py-14 sm:py-16 border-t border-white/5">
        <div class="cl-container">
            <div class="max-w-3xl mb-8">
                <p class="course-landing-eyebrow mb-3">Program map</p>
                <h2 class="course-landing-section-title mb-4">Course → Session → Chapters</h2>
                <p class="course-landing-section-lead">Tap a session to jump to its full chapter list below. Inside Spark, the same structure carries through: one program, eleven sessions, hundreds of navigable chapters.</p>
            </div>
            <div class="course-landing-program-map">
#{program_map}
            </div>
        </div>
    </section>

    <section id="slides" class="course-landing-section-anchor course-landing-slide-band course-landing-section--theater">
        <div class="cl-container">
            <div class="max-w-3xl mb-8">
                <p class="course-landing-eyebrow mb-3">Inside the classroom</p>
                <h2 class="course-landing-section-title mb-4">Real slides from Vikas's live sessions</h2>
                <p class="course-landing-section-lead">Most sessions include presentation decks synced to chapterized video. Samples below are from Sessions 1, 6, and 10.</p>
            </div>
#{slide_section}
            <div class="mt-4 text-center">
                <a href="#curriculum" class="course-landing-cta inline-flex items-center justify-center px-6 py-3 rounded-full text-base font-semibold">Explore all sessions</a>
            </div>
        </div>
    </section>

    <section id="curriculum" class="course-landing-section-anchor course-landing-section--cream py-14 sm:py-16">
        <div class="cl-container">
            <div class="max-w-3xl mb-8">
                <p class="course-landing-eyebrow mb-3" style="color:#8a6520">Full curriculum</p>
                <h2 class="course-landing-section-title mb-4" style="color:var(--cl-ink)">Eleven sessions · #{t['chapters']} chapters</h2>
                <p class="course-landing-section-lead" style="color:var(--cl-ink-soft)">Expand any session to see every chapter title from production. Module groupings mirror how Vikas structured the live teaching.</p>
            </div>
            <div class="course-landing-curriculum-wrap"><div id="yogapreneurship-curriculum-accordion" data-accordion class="space-y-3">
#{curriculum}
            </div></div>
        </div>
    </section>

    <section id="instructor" class="course-landing-section--dark py-14 sm:py-16">
        <div class="cl-container">
            <div class="course-landing-instructor-grid">
                <img src="../images/courses/yogapreneurship/vikas-shenoy.jpg" alt="Vikas Shenoy" class="course-landing-instructor-photo w-full max-w-sm rounded-2xl object-cover border border-[var(--cl-border-dark)]">
                <div>
                    <p class="course-landing-eyebrow mb-3">Your mentor</p>
                    <h2 class="course-landing-section-title mb-4">Vikas Shenoy</h2>
                    <p class="course-landing-section-lead mb-6">NIT graduate and former engineer at Microsoft and D.E. Shaw. Vikas left corporate work in 2011 to teach yoga full-time. He is among the first Level 4 certified teachers from Indea Yoga Mysore (Bharath Shetty lineage), with 17,500+ teaching hours and students across India, Singapore, Australia, the Middle East, and the US.</p>
                    <ul class="space-y-3 text-base" style="color:var(--cl-cream-muted)">
                        <li>Founder of <a href="https://panchayoga.com" target="_blank" rel="noopener" class="underline" style="color:var(--cl-gold)">Pancha Yoga</a>, Hyderabad</li>
                        <li>Hatha and Ashtanga · integrated pancha kosha approach</li>
                        <li>Creator of Yogapreneurship - yoga teacher entrepreneurship at scale</li>
                        <li>Long-standing PracticeNow customer; early Spark pilot partner</li>
                    </ul>
                </div>
            </div>
        </div>
    </section>

    <section id="experience" class="course-landing-section--cream py-14 sm:py-16">
        <div class="cl-container">
            <h2 class="course-landing-section-title mb-8" style="color:var(--cl-ink)">How you learn on Spark</h2>
            <div class="course-landing-bento">
                <div class="course-landing-bento__tile course-landing-bento__tile--large">
                    <div class="course-landing-bento__content">
                        <h3>Mega-course navigation</h3>
                        <p>Program → session → chapter - the same hierarchy on this page and inside the course player.</p>
                    </div>
                </div>
                <div class="course-landing-bento__tile"><h3>#{t['chapters']} micro-chapters</h3><p>Jump to the business concept you need instead of scrubbing two-hour recordings.</p></div>
                <div class="course-landing-bento__tile"><h3>Slides + video</h3><p>Presentation decks on most sessions, synced to teaching moments.</p></div>
                <div class="course-landing-bento__tile"><h3>Quizzes and notes</h3><p>Scenario-based quizzes and study notes generated from Vikas's words.</p></div>
                <div class="course-landing-bento__tile"><h3>AI tutor</h3><p>Ask questions grounded in the session you are studying.</p></div>
            </div>
        </div>
    </section>

    <section id="pricing" class="course-landing-section-anchor course-landing-section--dark py-14 sm:py-16">
        <div class="cl-container">
            <div class="max-w-3xl mx-auto text-center mb-8">
                <p class="course-landing-eyebrow mb-3">Pricing</p>
                <h2 class="course-landing-section-title mb-4">Pricing to be announced</h2>
                <p class="course-landing-section-lead">This is a premium, niche program. Checkout and final price will be published when enrollment opens on Spark.</p>
            </div>
            <div class="course-landing-pricing-tbd">
                <p class="course-landing-pricing-tbd__label">Coming soon</p>
                <p class="course-landing-pricing-tbd__title">Enrollment opens on Spark</p>
                <p class="course-landing-pricing-tbd__text">#{t['sessions']} sessions · #{t['chapters']} chapters · #{t['hoursLabel']} of structured content. No checkout link on this page yet.</p>
            </div>
        </div>
    </section>

    <section id="faq" class="course-landing-section-anchor course-landing-section--cream py-14 sm:py-16">
        <div class="cl-container">
            <p class="course-landing-eyebrow mb-3" style="color:#8a6520">FAQ</p>
            <h2 class="course-landing-section-title mb-8" style="color:var(--cl-ink)">Questions</h2>
            <div id="course-faq-accordion" data-accordion data-accordion-multiple class="space-y-3">
                <div class="course-landing-faq-item" data-accordion-item data-accordion-open>
                    <button type="button" data-accordion-toggle class="w-full flex items-center justify-between gap-4 p-5 text-left cursor-pointer"><span class="font-semibold text-slate-900">Who is Yogapreneurship for?</span><span class="material-symbols-rounded text-slate-400" data-accordion-chevron>expand_more</span></button>
                    <div data-accordion-content class="hidden border-t border-slate-100 p-5 pt-0"><p class="text-base leading-relaxed">Practicing yoga teachers and teacher-entrepreneurs who want students, positioning, pricing, and systems - not hobbyists looking for a short motivation talk.</p></div>
                </div>
                <div class="course-landing-faq-item" data-accordion-item>
                    <button type="button" data-accordion-toggle class="w-full flex items-center justify-between gap-4 p-5 text-left cursor-pointer"><span class="font-semibold text-slate-900">How long is each session?</span><span class="material-symbols-rounded text-slate-400" data-accordion-chevron>expand_more</span></button>
                    <div data-accordion-content class="hidden border-t border-slate-100 p-5 pt-0"><p class="text-base leading-relaxed">Each live recording is typically 90–120 minutes, then chapterized into many shorter lessons inside Spark so you can study in passes.</p></div>
                </div>
                <div class="course-landing-faq-item" data-accordion-item>
                    <button type="button" data-accordion-toggle class="w-full flex items-center justify-between gap-4 p-5 text-left cursor-pointer"><span class="font-semibold text-slate-900">Do all sessions include slides?</span><span class="material-symbols-rounded text-slate-400" data-accordion-chevron>expand_more</span></button>
                    <div data-accordion-content class="hidden border-t border-slate-100 p-5 pt-0"><p class="text-base leading-relaxed">#{t['sessionsWithSlides']} of #{t['sessions']} sessions include presentation slides in the Spark player, synced to video.</p></div>
                </div>
                <div class="course-landing-faq-item" data-accordion-item>
                    <button type="button" data-accordion-toggle class="w-full flex items-center justify-between gap-4 p-5 text-left cursor-pointer"><span class="font-semibold text-slate-900">Is this live or self-paced?</span><span class="material-symbols-rounded text-slate-400" data-accordion-chevron>expand_more</span></button>
                    <div data-accordion-content class="hidden border-t border-slate-100 p-5 pt-0"><p class="text-base leading-relaxed">Self-paced async access to recorded sessions. You move session by session, chapter by chapter, with quizzes and an AI tutor on Spark.</p></div>
                </div>
                <div class="course-landing-faq-item" data-accordion-item>
                    <button type="button" data-accordion-toggle class="w-full flex items-center justify-between gap-4 p-5 text-left cursor-pointer"><span class="font-semibold text-slate-900">How does pricing work?</span><span class="material-symbols-rounded text-slate-400" data-accordion-chevron>expand_more</span></button>
                    <div data-accordion-content class="hidden border-t border-slate-100 p-5 pt-0"><p class="text-base leading-relaxed">Pricing is not published on this landing page yet. When enrollment opens, checkout will be on Spark with a single published price for this program.</p></div>
                </div>
                <div class="course-landing-faq-item" data-accordion-item>
                    <button type="button" data-accordion-toggle class="w-full flex items-center justify-between gap-4 p-5 text-left cursor-pointer"><span class="font-semibold text-slate-900">How is this different from Vikas's live cohort?</span><span class="material-symbols-rounded text-slate-400" data-accordion-chevron>expand_more</span></button>
                    <div data-accordion-content class="hidden border-t border-slate-100 p-5 pt-0"><p class="text-base leading-relaxed">This page markets the structured Spark course built from live session recordings. Live Yogapreneurship cohorts through Pancha Yoga are separate; Spark gives you replayable, chapterized access with slides, quizzes, and tutor support.</p></div>
                </div>
            </div>
        </div>
    </section>

    <section class="course-landing-final-cta">
        <div class="cl-container">
            <h2>The yoga entrepreneurship program teachers reference for years</h2>
            <p>#{t['sessions']} sessions · #{t['chapters']} chapters · #{t['hoursLabel']} · slides, quizzes, notes, and AI tutor on Spark.</p>
            <a href="#pricing" class="course-landing-cta inline-flex items-center justify-center px-8 py-3 rounded-full text-base font-semibold">View pricing</a>
        </div>
    </section>
</main>

<footer class="course-landing-footer">
    <div class="cl-container flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
        <p>© Vikas Shenoy · Pancha Yoga. Course hosted on Spark.</p>
        <p>Yogapreneurship · Async mega-course</p>
    </div>
</footer>

<div id="course-landing-sticky-cta" class="course-landing-sticky-cta fixed inset-x-0 bottom-0 md:hidden px-4 py-3" aria-hidden="true">
    <div class="cl-container flex items-center gap-3">
        <div class="min-w-0 flex-1">
            <p class="course-landing-sticky-cta__price truncate">Pricing TBD</p>
            <p class="course-landing-sticky-cta__note truncate">Yogapreneurship on Spark</p>
        </div>
        <a href="#pricing" class="course-landing-cta inline-flex items-center justify-center px-5 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap">Pricing</a>
    </div>
</div>

<script src="../js/components/carousel.js" defer></script>
<script src="../js/components/accordion.js" defer></script>
<script src="../js/components/course-landing.js" defer></script>
<script src="../js/components/course-landing-mega-curriculum.js" defer></script>
</body>
</html>
HTML

out = File.join(ROOT, 'marketing/courses/yogapreneurship.html')
File.write(out, html)
puts "Wrote #{out} (#{html.bytesize} bytes)"
