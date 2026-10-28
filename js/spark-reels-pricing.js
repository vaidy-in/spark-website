/*
  Spark Reels pricing and plan wizard. Edit cfg, save, and reload marketing/spark-reels.html.
  Founding 25% is one time and applies on every term. Discounts follow cfg.discountCombineMode.
  Page state lives in the URL hash (no browser storage). INR or USD at fxRateInrPerUsd.
  d= opens story, craft, plan, faq, or founding. No d means the first screen.
*/
(function (root) {
  function slide(num, filter, group, title, image, alt, story, on, off, partial, extra) {
    var row = {
      num: num, filter: filter, group: group, title: title,
      image: "images/spark-reels/" + image, alt: alt, story: story, on: on || ""
    };
    if (off) row.off = off;
    if (partial) row.partial = partial;
    if (extra) {
      row.items = extra.items;
      row.roles = extra.roles;
      row.discovery = extra.discovery;
    }
    return row;
  }

  var cfg = {
    fxRateInrPerUsd: 93.4,
    defaultCurrency: "inr",
    defaultReelsPerMonth: 0,
    postsPerWeekMax: 7,
    defaultDurationMonths: 12,
    defaultTierId: "reel_cover_caption",
    foundingDiscountPct: 25,
    foundingOneTime: true,
    applyFoundingToMonthly: true,
    discountCombineMode: "additive",
    reelsPerLectureHourMin: 3,
    lectureLimitBufferPct: 30,
    minLectureHours: 6,
    extraVideoHourInr: 500,
    guaranteeCopy: "Pro-rated money-back guarantee: if you are unhappy at any point, you get a pro-rated refund for the remainder of your term.",
    valueComparisonSlideNums: ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10"],
    whatsappPhone: "917899156587",
    durationMonthsOptions: [
      { months: 1, label: "1 month", termDiscountPct: 0, bestValue: false },
      { months: 3, label: "3 months", termDiscountPct: 5, bestValue: false },
      { months: 6, label: "6 months", termDiscountPct: 10, bestValue: false },
      { months: 12, label: "12 months", termDiscountPct: 20, bestValue: true }
    ],
    tiers: [
      {
        id: "reel_only", name: "Reel", fold: "reel", basePerReelInr: 1000, recommended: false,
        fits: "Edited classroom reels, ready to post.",
        craftSlideNums: ["13", "14", "15", "20"], craftHeading: "How the reel is built",
        benefits: ["Cut from your class recordings", "3-second pre-roll & complete story arc", "Sent on WhatsApp for 1-tap approval"]
      },
      {
        id: "reel_cover", name: "Reel + cover", fold: "cover", basePerReelInr: 1250, recommended: false,
        fits: "Profile grid with custom covers.",
        craftSlideNums: ["12", "18"], craftHeading: "How the cover is built",
        benefits: ["Everything in Reel, plus:", "Custom cover for 1:1 & 9:16 grids", "Scannable titles & studio color palette"]
      },
      {
        id: "reel_cover_caption", name: "Reel + cover + caption", fold: "caption", basePerReelInr: 1500, recommended: true, upcoming: "Carousels & Stories",
        fits: "Full non-follower reach in your voice.",
        craftSlideNums: ["16", "11", "21"], craftHeading: "How caption & reach work",
        benefits: ["Everything in Reel + cover, plus:", "Teacher-voice SEO caption & search tags", "Carousels & Stories from the same class"]
      }
    ],
    storySlides: [
      slide("01", "long", "The long game", "Attention or nurture.", "attention.jpg", "A megaphone scatters a cloud labeled Attention. An arrow points to a seedling watered by drops, labeled Nurture.", "A loud hook fades in a day. Real teaching from your actual classroom waters trust every week without turning you into a performer.", "Included: Your reels are cut from real classes with live students, not scripted solo takes."),
      slide("02", "long", "The long game", "Depth + consistency = trust.", "consistency.jpg", "An iceberg labeled Depth, plus a checked calendar labeled Consistency, equals a seedling labeled Trust.", "Posting 5 to 7 times a week usually burns a teacher out or thins the teaching. Because reels come from classes you already taught and arrive on WhatsApp ready to schedule, the calendar holds through festivals, batches, and travel.", "Included: Your pace keeps the weekly calendar full without a second filming job.", "At a lighter pace or a 1-month trial, the weekly habit is too brief or too sparse to compound."),
      slide("03", "long", "The long game", "About 7 hours before a serious yes.", "hours.jpg", "About 7 hours. Two reels a week takes 1 to 2 years to reach 90 reels. Seven a week reaches about 5 hours in 3 months and about 10 hours in 6 months.", "Google's research shows a high-trust buyer spends about 7 hours with your teaching before committing. Twice a week takes 1 to 2 years. At 5 to 7 reels a week, a prospective student can sit with 5 to 10 hours of your teaching in 3 to 6 months. A 12-month plan sustains that library across every intake.", "Included: Your term builds the multi-hour library a serious student needs.", "Shortfall: Fewer than 6 months or under 20 reels a month does not build enough hours on the page for a cold prospect to reach 7 hours."),
      slide("04", "long", "The long game", "Guide them before the first call.", "journey.jpg", "A guide points a traveler up free steps toward an open gate labeled Your program.", "Think of enrollment as a 1,000-step walk. Your page gives the first 200 steps generously for free so that when someone finally messages you, they already trust how you teach.", "Included: Enough runway for strangers to walk the first free steps on your page.", "Left out on 1 month: A single month puts out too few steps to guide a stranger before your next batch."),
      slide("05", "cover", "The cover & brand", "Three seconds on the grid.", "grid.jpg", "3 seconds. A nine-frame grid. One person leaves. Another stays and touches the grid.", "When someone taps your profile, they decide in about 3 seconds whether to leave or stay. Custom covers with short scannable titles turn nine frames into a menu of lessons.", "Included: Custom covers and short titles make your profile grid read as a menu of lessons.", "Left out on Reel only: Raw video frames look repetitive on the grid, so profile visitors cannot scan topics in 3 seconds."),
      slide("06", "cover", "The cover & brand", "A brand is trust, built on purpose.", "brand.jpg", "A brick wall with a path rising through it. A brand is trust. Built on purpose. Not by accident.", "Rotating colour palettes, subject framing, and multi-faculty variety make your studio look deliberate week after week, brick by brick.", "Included: Multi-month visual and curriculum coherence across your grid.", "Left out: Requires the Cover tier (Reel + cover or full tier) over at least 6 months so the visual system compounds."),
      slide("07", "cover", "The caption & reach", "Interest media reaches non-followers.", "interest.jpg", "Social media reaches people who already follow you. Interest media reaches people who care, even if they do not follow you yet.", "Followers already know you. Long-form SEO captions written in your lineage-accurate voice carry the lesson to people who care about the subject but do not follow you yet.", "Included: Teacher-voice SEO captions built for non-follower discovery and repeat reading.", "Left out without Caption: You get the video, but miss search discovery from non-followers and study-note captions in your voice."),
      slide("08", "cover", "The caption & reach", "Do it with intent: Carousels and Stories.", "intent.jpg", "A path through a field toward one person. The line reads: who it is for, what it is for, and the promise.", "Every piece states who it is for, what it teaches, and the promise. In the full column, the same class also gives you Carousels and Stories for learners who read and swipe.", "Included: Carousels and Stories cut from the same class, aligned to serious students.", "Left out without Caption: Carousels and Stories are only included in Reel + cover + caption."),
      slide("09", "roadmap", "Roadmap & founding window", "One class. More formats next.", "upcoming-formats.jpg", "One open book fans out to Quizzes, YouTube, multi-platform, and email nurture. Built from the same recording. Early access on 12 months.", "Because Spark maps your actual course rather than slicing a flat transcript, the same recording will soon power Interactive Quizzes, YouTube Chapters and Shorts, Multi-Platform Publishing, and Student Email Nurture.", "Included on 12 months: Early access to Quizzes, YouTube chapters, multi-platform publishing, and email nurture as they launch.", "12-month full-plan advantage missed: Early access to Quizzes, YouTube chapters, multi-platform publishing, and email nurture is included when you lock the full Reel + cover + caption plan for 12 months."),
      slide("10", "roadmap", "Roadmap & founding window", "Why the 25% Founding Partner price exists.", "founding-window.jpg", "Stairs rise from a locked 12-month rate and today's 25% Founding Partner discount toward full price as Quizzes and YouTube ship.", "The 25% Founding Partner discount is one time only, on your first plan, for any term. Paying for 12 months upfront stacks the 20% annual plan discount with that 25%, locking 45% off for the full year. Using the one-time 25% on a shorter term means renewals revert to the standard term rate.", "Locked for the year: 20% annual plan discount + 25% one-time Founding Partner discount = 45% off for all 12 months.", "One-time 25% Founding Partner discount on a shorter term means renewals revert to the standard term rate. 12 months locks 45% off for the full year.")
    ],
    craftSlides: [
      slide("11", "how", "Overview: Why manual fails", "Five craft jobs in every single reel - and all four discovery surfaces.", "reel-above-waterline.jpg", "A vertical classroom reel surrounded by 5 numbered callouts: 1. Pre-roll hook, 2. Pause-protected clip, 3. 3-second grid cover, 4. Studio end card, 5. Teacher-voice SEO caption.", "Doing this once is a project; doing it 5 to 7 times a week without dropping quality is why manual reel production breaks down. Every single post is five separate specialist jobs built around one goal: non-follower discovery without compromising your teaching.", "", "", "", { items: ["Four discovery surfaces in every post: (1) the cover image on the grid, (2) the 3-second pre-roll and teaching reel, (3) the on-screen title and synced captions inside the reel, and (4) the Instagram study-note caption and search tags.", "Every single reel goes through all five craft jobs and ~300 quality checks with zero compromise in quality."], roles: "Subject-matter expert, copywriter, video editor, visual designer, and SEO researcher", discovery: "Every surface - cover, reel, in-reel text, and caption - is engineered so serious students who do not follow you yet can discover and trust your teaching." }),
      slide("12", "how", "Part 1 of 5: The Cover Image", "Four elements on every cover - fitted to both the 1:1 Home grid and 9:16 Reels grid.", "craft-cover-anatomy.jpg", "Anatomy of the cover image showing a 9:16 vertical cover with an inner 1:1 Home grid safe zone and 4 numbered callouts: 1. Series name, 2. Capped lesson title, 3. Target-viewer hook, 4. Speaker portrait with blur-focus depth.", "A human team cannot write a real cover by glancing at a 90-second clip. Before writing a single word on the cover, someone who understands the domain has to go through the entire 60 to 90 minute class recording to know how this lesson fits the whole lecture.", "", "", "", { items: ["Series name: names the overarching thread from the full class recording, not just the clip.", "Capped lesson title: short, concrete, and scannable in under 3 seconds.", "Target-viewer hook message: written to stop the exact student this lesson is meant for.", "Speaker portrait with blur-focus depth: clear subject separation with rotating studio colour palettes week to week.", "Dual-grid safe zones: most covers get cut off on the 1:1 Home profile grid even when they fit the 9:16 Reels tab. Spark locks every title, badge, and face inside the shared safe zone so nothing is ever cropped on either grid."], roles: "Domain expert (full-video review), senior copywriter (series, title, hook), and brand designer (portrait depth & dual-grid layout)", discovery: "Turns a 3-second profile visit into a coherent menu of lessons on both the Home grid and the Reels grid." }),
      slide("13", "how", "Part 2 of 5: The 3-Second Pre-Roll", "Winning the 1-second scroll decision with the peak 3 seconds of the lesson.", "craft-preroll-hook.jpg", "Three-step diagram: 1. 1-second scroll test: Stay or swipe past, 2. Domain expert scans full reel for the peak 3-second insight, 3. Coming Up pre-roll + smooth transition into lesson.", "On a short-form feed like Instagram, viewers decide within 1 second whether to stay or scroll past. The 3-second Coming Up pre-roll is what earns that first second without turning a teacher into a loud performer.", "", "", "", { items: ["Domain-expert selection: only someone who understands the subject can scan the whole reel and spot the single most compelling 3-second teaching insight that fits cleanly.", "Clear speaker visibility: verifies the teacher's face is unobstructed and the audio lands cleanly in the opening second.", "Smooth transition: bridges from the 3-second pre-roll into the start of the full teaching arc."], roles: "Subject-matter expert (selects the peak 3-second insight) and video editor (cuts the pre-roll and transition)", discovery: "Stops non-followers in the first second with real teaching gravity, lifting watch-through and reach." }),
      slide("14", "how", "Part 3 of 5: The Teaching Reel & In-Reel Text", "Feed-scroll safe framing, protected teaching pauses, and searchable in-reel text.", "craft-reel-framing.jpg", "Smartphone showing top and bottom feed safe zones so nothing is cut off while scrolling, with 4 callouts: 1. On-screen lesson title, 2. Speaker framed in safe zone, 3. Teaching pauses kept in, 4. Synced Sanskrit and anatomy captions.", "As people scroll through the Instagram feed, top and bottom UI overlays cut off ordinary videos. Every Spark reel is constructed inside a strict feed-safe viewport so the whole lesson is always visible while scrolling.", "", "", "", { items: ["Never cut off at the top or bottom: the on-screen title, speaker framing, and burned-in captions stay inside the feed-scroll safe zone.", "In-reel text built for discovery: the persistent lesson title and synced captions keep exact Sanskrit and anatomical terms readable on mute and indexable by Instagram search.", "Teaching-aware cut: keeps pranayama holds, chanting, and demonstrations intact while cutting dead air, false starts, and class logistics."], roles: "Senior video editor, visual layout specialist, audio engineer, and domain proofreader", discovery: "On-screen titles and captions drive silent-scroll retention and platform topic indexing, earning 1.5x repeat watches." }),
      slide("15", "how", "Part 4 of 5: The Studio End Card", "A 'Check the caption' CTA and teacher attribution tailored to every faculty member.", "craft-end-card.jpg", "Studio end card diagram with Check the caption CTA button and 3 callouts: 1. Studio brand mark, 2. Check the caption CTA (drives to study notes), 3. Matched to the session's teacher (multi-faculty).", "When the teaching thought lands, the reel closes with a clean studio end card that points viewers straight to the written study note below.", "", "", "", { items: ["Explicit 'Check the caption' CTA: turns a passive viewer into a reader who spends another minute with your study notes.", "Multi-faculty aware: each video in a studio can feature a different teacher. The end card and framing adapt to the specific teacher on screen while holding one studio brand."], roles: "Brand designer and video editor", discovery: "Drives caption dwell time, Saves, and Shares - the strongest signals for non-follower reach." }),
      slide("16", "how", "Part 5 of 5: The Instagram Caption", "Teacher-voice study notes and researched tags that power interest-media search.", "craft-caption-discovery.jpg", "Caption and search discovery diagram showing 1. Teacher-voice study note, 2. Researched search tags and hashtags, 3. Carousels and Stories from same class, pointing to 50%+ non-follower discovery.", "In interest-based media, the caption is not an afterthought - it is how strangers who care about your subject find you through search and topic graphs, even when they do not follow you yet.", "", "", "", { items: ["Concise domain copywriting: short, to the point, and written in the teacher's own voice with Sanskrit and anatomical accuracy intact.", "Researched tags and hashtags: every post includes researched domain keywords and hashtags that would take a human writer dedicated research time on every reel.", "Carousels and Stories (in Reel + cover + caption): cut from the same lecture for learners who prefer to read and swipe."], roles: "Domain subject-matter writer, senior copywriter, and SEO / tag researcher", discovery: "Makes every lesson searchable across Instagram interest media, driving over 50% of views from non-followers." }),
      slide("17", "how", "Beneath the Waterline: Steps 1 to 4 of 11 (~110 of ~300 Checks)", "How a 90-minute class is understood before a single frame is cut.", "pipeline-steps-1-to-4.jpg", "2x2 grid of pipeline steps 1 to 4 (~110 checks): 1. Audio and speaker check (~15 checks, Audio ops), 2. Domain transcription (~35 checks, Transcriptionist), 3. Full-lecture course map (~35 checks, Instructional designer), 4. Standalone lesson pick (~25 checks, Domain expert).", "On the Spark homepage, turning a raw recording into a course takes 10+ specialist steps and 25 to 30 hours of human work per hour of video. For Spark Reels, Steps 1 to 4 run ~110 checks on the full lecture first:", "", "", "", { items: ["Step 1 - Audio & speaker diagnostics (~15 checks): verifies speaker-view framing, room echo contrast (19 dB+ floor), and background noise gates. Usually done by: Audio ops.", "Step 2 - Domain transcription & cleanup (~35 checks): word-level time-coded transcript preserving Sanskrit, pranayama counts, and anatomy. Usually done by: Transcriptionist & Content assistant.", "Step 3 - Full-lecture course map & chapters (~35 checks): maps modules and maker-checker chapter boundaries across the whole 60 to 90 minute class. Usually done by: Instructional designer & Subject-matter assistant.", "Step 4 - Standalone lesson selection (~25 checks): filters out class logistics, homework, and student-specific cues so each candidate stands alone for a stranger. Usually done by: Domain expert."], roles: "Audio ops, transcriptionist, instructional designer, and domain expert", discovery: "Ensures every clip carries a complete, accurate teaching arc grounded in the full lecture." }),
      slide("18", "how", "Beneath the Waterline: Steps 5 to 8 of 11 (~105 of ~300 Checks)", "Teaching-aware editing, pre-roll extraction, feed-safe framing, and dual-grid covers.", "pipeline-steps-5-to-8.jpg", "2x2 grid of pipeline steps 5 to 8 (~105 checks): 5. Teaching pause judge (~30 checks, Senior editor), 6. 3-second pre-roll cut (~25 checks, Creative director), 7. Feed-safe reframe and captions (~30 checks, Visual specialist), 8. Dual-grid cover design (~20 checks, Copywriter and designer).", "Once a candidate lesson is chosen, Steps 5 to 8 run another ~105 checks to craft the video, the 3-second hook, the feed-safe layout, and the cover:", "", "", "", { items: ["Step 5 - Teaching pause judge (~30 checks): acoustic + LLM judge protects pranayama holds and demonstrations while removing dead air and false starts. Usually done by: Senior video editor & Domain teacher.", "Step 6 - 3-second pre-roll cut (~25 checks): scans the finished lesson for the peak 3-second insight with a clear speaker face and cuts the transition. Usually done by: Creative director & Video editor.", "Step 7 - Feed-safe reframe & in-reel captions (~30 checks): portrait speaker tracking, blur-focus depth, on-screen title, and synced captions locked inside top and bottom feed safe zones. Usually done by: Video editor & Visual specialist.", "Step 8 - Dual-grid cover design (~20 checks): writes series name, capped title, and hook from the full lecture and fits both the 1:1 Home grid and 9:16 Reels grid. Usually done by: Copywriter & Graphic designer."], roles: "Senior video editor, creative director, visual specialist, copywriter, and graphic designer", discovery: "Protects 1-second scroll stop, full feed visibility, and 3-second profile grid scanning on every post." }),
      slide("19", "how", "Beneath the Waterline: Steps 9 to 11 of 11 (~85 Checks -> ~300 Total)", "Multi-faculty end card, SEO caption research, and the 300-check quality gate.", "pipeline-steps-9-to-11.jpg", "Pipeline steps 9 to 11 (~85 checks completing ~300 checks total): 9. Faculty end card and audio master (~20 checks, Brand designer), 10. Voice caption, tags and Carousels (~35 checks, Domain writer and SEO), 11. 9-gate rubric and WhatsApp (~30 checks, Quality evaluator), plus badge: ~300 checks = 25-30 hrs of specialist work replaced.", "Steps 9 to 11 complete the ~300 checks (110 + 105 + 85 = 300 checks), replacing ~25 to 30 hours of specialist work per lecture with a 3-minute approval on your phone:", "", "", "", { items: ["Step 9 - Multi-faculty end card & audio master (~20 checks): matches the teacher on screen, adds the 'Check the caption' CTA card, and levels studio/Zoom audio. Usually done by: Brand designer & Audio engineer.", "Step 10 - Teacher-voice caption, tags & Carousels (~35 checks): writes the concise study note, researches interest-media search tags and hashtags, and generates Carousels and Stories. Usually done by: Domain copywriter & SEO researcher.", "Step 11 - 9-gate rubric audit & WhatsApp delivery (~30 checks): grades every piece across 9 hard gates and 7 teaching axes so 9 of 10 arrive ready to post. Usually done by: Quality evaluator & Social media manager."], roles: "Brand designer, audio engineer, domain copywriter, SEO researcher, and quality evaluator", discovery: "Delivers all four discovery surfaces (cover, reel, in-reel text, and caption) on every single reel without compromise." }),
      slide("20", "how", "One-shot quality", "How a reel earns Recommended vs Okay.", "reel-grading-rubric.jpg", "Three-stage grading diagram: 9 Hard Gates filter out weak clips, 7 Teaching Axes score 0 to 100, sorting into Recommended (70+), Okay (50 to 69), or Retired.", "Why 9 out of 10 reels work on the first shot: every candidate chapter must first pass 9 hard gates (at most 150 seconds after dead air, dead air at most 30%, traffic/background noise below 4/5, room echo contrast at least 19 dB, real teaching rather than class logistics or homework, stands alone for a stranger, one finishable idea, right audience, and delivery floor). Passing clips are then scored 0 to 100 across 7 weighted teaching axes (Interest match 3x, One claim 3x, Delivery 3x, Mastery signal 2x, Complete arc 2x, Said not performed 2x, Cold standalone 1x) plus a peer respect test, slide-opening check, and other-speaker check.", ""),
      slide("21", "how", "Sustainable depth", "Nine layers of consistency held at once.", "consistency-nine-layers.jpg", "A 3x3 grid of 9 consistency layers (Weekly pace, Story arc, Grid cover, SEO caption, Live classroom, Full syllabus, Every teacher, Right student, Exact terms) feeding a Sustainable brand tree.", "Posting once a week is easy; posting 5 to 7 times a week usually forces a teacher to drop quality or burn out. Spark holds nine layers of consistency at the same time: (1) weekly frequency through festivals and travel, (2) complete story arcs, (3) 3-second grid cover variety, (4) interest-media SEO captions, (5) live classroom energy on home ground, (6) full syllabus breadth across modules, (7) every faculty member visible without solo camera acting, (8) 100% serious-student intent, and (9) exact Sanskrit and anatomical terminology.", ""),
      slide("22", "how", "Credits", "Credits, watermark, and lecture hours.", "faq-accuracy-buffer.jpg", "You approve every clip, with a 20% pass buffer. A watermarked draft goes to the teacher. Approve 9 of 10: watermark off, one credit used. Pass 1 in 5: retired free, zero credits used.", "A thumbs-up spends a credit and removes the watermark. A rejected clip is retired and cannot be downloaded clean. The whole term is paid upfront.", "")
    ],
    faqSlides: [
      slide("23", "faq", "FAQ", "Why not use a clipping app or a social media agency? (Done-For-You vs Done-With-You)", "faq-dfy-vs-dwy.jpg", "Done for you, from class you already taught. Clipping apps leave 70% of the work. Agencies wait on you to film. Spark is ready on WhatsApp, from daily practice, 130+ teachers, and a 5-year pipeline.", "AI clipping apps slice flat podcast transcripts: on a class they cut mid-thought, chop teaching pauses, and leave 70% of the work to you or your team (scrubbing 90-minute recordings, picking clips, making covers, writing captions) - so busy teachers quit in week 2. Agencies and editors are Done-With-You disguised as Done-For-You: they still wait on you to script and film solo camera videos every week, and general editors miss Sanskrit and anatomical nuances. Spark is built at the intersection of three circles - daily personal practice, 9 years alongside 130+ teachers, and 5 years of pipeline engineering - turning classes you already taught into finished posts on WhatsApp. For a family member or coordinator on your team, a 15-hour weekly editing burden becomes a 2-minute phone post.", ""),
      slide("24", "faq", "FAQ", "Which Instagram numbers actually matter, and when do enquiries convert?", "faq-quality-per-eyeball.jpg", "Quality per eyeball, two horizons. The metrics that matter are a 1.5x repeat watch, Saves, Shares, and over 50% non-followers. Months 1 to 3: warm enquiries convert. Months 3 to 6+: strangers trust and join.", "Instagram puts Views and Likes at the top to sell ads, while a generic viral reel can bring millions of views and zero serious students. For a high-trust course, look at Quality per Eyeball in Instagram Insights: a 1.5x repeat watch ratio (views vs viewers), Saves, Shares, and over 50% non-follower reach. At 20 to 30 reels a month, expect two distinct horizons: in Months 1 to 3 (about 90 reels / 5 hours of attention), warm referrals and enquiries who check your profile before your next batch see a deep library and stop hesitating. In Months 3 to 6+ (180+ reels / 10 hours of attention), complete strangers who discover one reel can binge hours of your teaching and apply.", ""),
      slide("25", "faq", "FAQ", "What if a clip has a student-specific modification or a verbal slip? How do credits work?", "faq-accuracy-buffer.jpg", "You approve every clip, with a 20% pass buffer. A watermarked draft goes to the teacher. Approve 9 of 10: watermark off, one credit used. Pass 1 in 5: retired free, zero credits used.", "In a real class, you might cue a modification for one wobbly student that looks wrong out of context, or a teacher may have a 3-second verbal slip. Nothing is ever published without your approval. Drafts arrive on WhatsApp with a preview watermark (and can be routed directly to the faculty member who taught that session). At least 9 out of 10 clips meet the bar. When you give a thumbs-up, 1 credit is used and the watermark comes off. If you pass on a clip (up to our 20% replacement buffer - 1 in 5), that file is permanently retired at zero credit cost and the next Recommended clip moves up.", ""),
      slide("26", "faq", "FAQ", "Should we run paid Meta ads or boost our reels right away?", "faq-paid-ads-library.jpg", "Fill the library before you boost. Paid ads on 6 reels leak out. At 60 to 90+ reels, every click lands on hours of teaching.", "Running paid ads when your page only has 6 reels (15 minutes of teaching) pours paid clicks into a leaky bucket: people tap your profile, see a thin grid, and leave. Once your page has 60 to 90+ classroom reels (3 to 5+ hours of teaching across your syllabus), every rupee of ad spend or boosting lands on a bingeable library that can actually earn a high-ticket enrolment.", "")
    ]
  };

  cfg.allSlides = cfg.storySlides.concat(cfg.craftSlides, cfg.faqSlides);
  var guaranteeSealMarkup = '<span class="reels-guarantee-mark" aria-hidden="true"><svg class="reels-trust-badge" viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg" focusable="false"><defs><linearGradient id="reelsSealGold" x1="0.2" y1="0" x2="0.85" y2="1"><stop offset="0%" stop-color="#fffbeb"/><stop offset="38%" stop-color="#fde047"/><stop offset="72%" stop-color="#f59e0b"/><stop offset="100%" stop-color="#b45309"/></linearGradient></defs><path fill="url(#reelsSealGold)" stroke="#92400e" stroke-width="1.75" d="M48 2l12.2 24.7 27.3 4-19.8 19.3 4.7 27.2L48 66.5 23.6 77.7l4.7-27.2L8.5 31.4l27.3-4L48 2z"/></svg></span>';

  function durationByMonths(months) {
    var i;
    for (i = 0; i < cfg.durationMonthsOptions.length; i++) {
      if (cfg.durationMonthsOptions[i].months === months) return cfg.durationMonthsOptions[i];
    }
    return cfg.durationMonthsOptions[0];
  }

  function tierById(id) {
    var i;
    for (i = 0; i < cfg.tiers.length; i++) {
      if (cfg.tiers[i].id === id) return cfg.tiers[i];
    }
    return cfg.tiers[cfg.tiers.length - 1];
  }

  function quoteTier(tier, reels, months) {
    var opt = durationByMonths(months);
    var termPct = opt ? opt.termDiscountPct : 0;
    var foundingPct = (cfg.applyFoundingToMonthly || months >= 3) ? cfg.foundingDiscountPct : 0;
    var factor = cfg.discountCombineMode === "additive" ? (1 - (termPct + foundingPct) / 100) : (1 - termPct / 100) * (1 - foundingPct / 100);
    var totalOffPct = Math.round((1 - factor) * 100);
    var perReelInr = Math.round(tier.basePerReelInr * factor);
    var baseMonthlyInr = tier.basePerReelInr * reels;
    var monthlyInr = Math.round(baseMonthlyInr * factor);
    return { perReelInr: perReelInr, baseMonthlyInr: baseMonthlyInr, monthlyInr: monthlyInr, baseUpfrontInr: baseMonthlyInr * months, upfrontInr: monthlyInr * months, termPct: termPct, foundingPct: foundingPct, totalOffPct: totalOffPct };
  }
  function includedHours(reels) {
    var minHrs = reels ? Math.round(reels / cfg.reelsPerLectureHourMin) : 0;
    return reels ? Math.max(minHrs + 1, Math.round(minHrs * (1 + cfg.lectureLimitBufferPct / 100))) : cfg.minLectureHours;
  }
  function minimumLectureHours(week) { return (week * 4) / cfg.reelsPerLectureHourMin; }
  function minLectureHoursRounded(week) { return Math.round(minimumLectureHours(week)); }

  function hasCover(tierId) {
    return tierId === "reel_cover" || tierId === "reel_cover_caption";
  }

  function pack(level, reason, actions) {
    return { level: level, reason: reason, actions: actions || [], pill: level ? pillFor(level) : "" };
  }

  function tieCraft(slideRow, ctx) {
    var caption = ctx.tierId === "reel_cover_caption";
    var cover = hasCover(ctx.tierId);
    var full = [{ label: "Select Reel + cover + caption", tierId: "reel_cover_caption" }];
    var gaps = [];
    var actions = [];
    var pace = ctx.reels >= 20 && ctx.months >= 6;
    if (slideRow.num === "11") {
      if (caption) return pack("included", "Included in your choice: All 5 craft jobs arrive together on WhatsApp, plus Carousels and Stories from the same class.");
      if (cover) return pack("partial", "Partially unlocked: Includes jobs 1, 2, 3, and 4 (reel + grid cover), but leaves out job 5 (teacher-voice SEO caption, Carousels, and Stories).", full);
      return pack("partial", "Partially unlocked: Includes jobs 1, 2, and 4 (the reel only), and leaves out job 3 (grid cover) and job 5 (SEO caption, Carousels, and Stories).", full);
    }
    if (slideRow.num === "12") {
      if (cover) return pack("included", "Included in your choice: Custom cover with series name, capped title, hook, and 1:1 + 9:16 safe-zone fit.");
      return pack("missed", "Left out on Reel only: Select Reel + cover or Reel + cover + caption to include the grid cover.", [{ label: "Select Reel + cover", tierId: "reel_cover" }]);
    }
    if (slideRow.num === "13" || slideRow.num === "14" || slideRow.num === "15") return pack("included", "Included in every plan: Built into every Spark reel.");
    if (slideRow.num === "16") {
      if (caption) return pack("included", "Included in your choice: Teacher-voice study note, researched tags, and Carousels and Stories.");
      return pack("missed", "Left out without Caption: Select Reel + cover + caption to include the SEO caption, tags, Carousels, and Stories.", full);
    }
    if (slideRow.num === "17" || slideRow.num === "18" || slideRow.num === "19") return pack("included", "Included in every plan: Built over 5 years (~250 to 300 automated checks, with 3 to 4 days of engineering invested per check) so posting takes under 3 minutes on your phone.");
    if (slideRow.num === "20") return pack("included", "Included in every plan: Clips scoring 70+ land in Recommended (sent first). Clips scoring 50 to 69 land in Okay (your backup library). Anything under 50 or failing a gate is retired before you ever see it.");
    if (slideRow.num !== "21") return { level: "included", reason: "", actions: [], pill: "" };
    if (caption && pace) return pack("included", "Included in your choice: All 9 layers of consistency hold across your page.");
    if (!cover) gaps.push("Layer 3 requires Cover");
    if (!caption) gaps.push("Layer 4 requires Caption");
    if (!pace) gaps.push("Layer 1 requires 5 posts a week for 6 to 12 months");
    if (!caption) actions.push(full[0]);
    if (ctx.reels < 20) actions.push({ label: "Set 5 posts a week", reels: 20 });
    if (ctx.months < 6) actions.push({ label: "Switch to 6 months", months: 6 });
    return pack("partial", "Partially unlocked: " + gaps.join("; ") + ".", actions);
  }

  function statusFor(slideRow, ctx) {
    var n = parseInt(slideRow.num, 10);
    var months = ctx.months;
    var reels = ctx.reels;
    var cover = hasCover(ctx.tierId);
    var caption = ctx.tierId === "reel_cover_caption";
    var level = "included";
    var reason = slideRow.on;
    var actions = [];
    if (n >= 22) return { level: "included", reason: "", actions: [], pill: "" };
    if (n >= 11) return tieCraft(slideRow, ctx);
    if (slideRow.num === "02" && !(reels >= 20 && months >= 3)) {
      level = "missed";
      reason = slideRow.off;
      if (reels < 20) actions.push({ label: "Set 5 posts a week", reels: 20 });
      if (months < 3) actions.push({ label: "Switch to 3 months", months: 3 });
    } else if (slideRow.num === "03" && !(months >= 6 && reels >= 20)) {
      level = "missed";
      reason = slideRow.off;
      if (months < 6) actions.push({ label: "Switch to 6 months", months: 6 });
      if (reels < 20) actions.push({ label: "Set 5 posts a week", reels: 20 });
    } else if (slideRow.num === "04" && months < 3) {
      level = "missed";
      reason = slideRow.off;
      actions.push({ label: "Switch to 3 months", months: 3 });
    } else if (slideRow.num === "05" && !cover) {
      level = "missed";
      reason = slideRow.off;
      actions.push({ label: "Select Reel + cover", tierId: "reel_cover" });
    } else if (slideRow.num === "06" && !(cover && months >= 6)) {
      level = "missed";
      reason = slideRow.off;
      if (!cover) actions.push({ label: "Select Reel + cover", tierId: "reel_cover" });
      if (months < 6) actions.push({ label: "Switch to 6 months", months: 6 });
    } else if ((slideRow.num === "07" || slideRow.num === "08") && !caption) {
      level = "missed";
      reason = slideRow.off;
      actions.push({ label: "Select Reel + cover + caption", tierId: "reel_cover_caption" });
    } else if (slideRow.num === "09" && !(months === 12 && caption)) {
      level = "missed";
      reason = slideRow.off;
      if (!caption) actions.push({ label: "Select Reel + cover + caption", tierId: "reel_cover_caption" });
      if (months !== 12) actions.push({ label: "Switch to 12 months", months: 12 });
    } else if (slideRow.num === "10") {
      if (months === 12) {
        level = "included";
        reason = slideRow.on;
      } else {
        level = "missed";
        reason = "One-time " + cfg.foundingDiscountPct + "% Founding Partner discount is spent on a " + months + "-month term (renewals revert to standard rate; 12 months locks " + quoteTier(cfg.tiers[0], 1, 12).totalOffPct + "% off for the full year).";
        actions = [{ label: "Switch to 12 months", months: 12 }];
      }
    }
    return { level: level, reason: reason, actions: actions, pill: pillFor(level) };
  }

  function pillFor(level) {
    if (level === "included") return "Included";
    if (level === "partial") return "Optional upgrade";
    return "Not in current choice";
  }

  function tone(level) {
    if (level === "included") return "in";
    if (level === "partial") return "part";
    return "out";
  }

  function pad(n) {
    return n < 10 ? "0" + n : String(n);
  }

  cfg.quoteTier = quoteTier;
  cfg.includedHours = includedHours;
  cfg.minimumLectureHours = minimumLectureHours;
  cfg.quotePerReelInr = function (tierId, months) { return quoteTier(tierById(tierId), 1, months).perReelInr; };
  cfg.statusFor = statusFor;
  root.SPARK_REELS_PRICING = cfg;

  function mount() {
    var missing = document.getElementById("pricing-missing");
    var state;
    var flashToken = 0;
    var step2Shown = false;
    var storySig = "";
    var craftSig = "";
    var faqDone = false;
    if (!cfg.tiers || cfg.storySlides.length !== 10 || cfg.craftSlides.length !== 12 || cfg.allSlides.length !== 26) {
      if (missing) missing.classList.remove("hidden");
      return;
    }
    state = {
      reels: cfg.defaultReelsPerMonth,
      months: cfg.defaultDurationMonths,
      currency: cfg.defaultCurrency === "usd" ? "usd" : "inr",
      tierId: cfg.defaultTierId,
      storyIndex: 0,
      craftIndex: 0,
      wizardStep: 1,
      planChosen: false,
      door: "story",
      lightbox: 0,
      summaryText: ""
    };
    function byId(id) { return document.getElementById(id); }
    function dbg(step, detail) {
      if (typeof console !== "undefined" && console.debug) console.debug("[SparkReels]", step, detail || "");
    }
    function esc(value) {
      return String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
    }
    function readHash() {
      var raw = String(window.location.hash || "").replace(/^#/, "");
      var bare = { story: "story", "how-it-works": "craft", prices: "plan", faq: "faq", roadmap: "founding" };
      var bits, i, pair, out;
      if (!raw) return null;
      if (raw.indexOf("=") === -1) {
        if (!bare[raw]) return null;
        return { d: bare[raw] };
      }
      bits = raw.split("&");
      out = {};
      for (i = 0; i < bits.length; i++) {
        pair = bits[i].split("=");
        out[decodeURIComponent(pair[0] || "")] = decodeURIComponent(pair.slice(1).join("="));
      }
      return out;
    }
    function applyHash() {
      var data = readHash();
      var tiers = { reel_only: 1, reel_cover: 1, reel_cover_caption: 1 };
      var monthOk = {};
      var doors = { story: 1, craft: 1, plan: 1, faq: 1, founding: 1 };
      var reels, months, story, step, mi;
      if (!data) { state.door = "story"; return; }
      for (mi = 0; mi < cfg.durationMonthsOptions.length; mi++) monthOk[cfg.durationMonthsOptions[mi].months] = 1;
      if (data.c === "inr" || data.c === "usd") state.currency = data.c;
      reels = parseInt(data.r, 10);
      if (String(reels) === data.r && reels >= 0 && reels <= 90) state.reels = reels === 0 ? 0 : snapWeekReels(reels);
      months = parseInt(data.m, 10);
      if (String(months) === data.m && monthOk[months]) state.months = months;
      if (tiers[data.t]) state.tierId = data.t;
      story = parseInt(data.s, 10);
      if (String(story) === data.s && story >= 1 && story <= 10) state.storyIndex = story - 1;
      step = parseInt(data.w, 10);
      if (String(step) === data.w && step >= 1 && step <= 3) {
        state.wizardStep = step > 2 ? 2 : step;
        if (state.wizardStep === 2) state.planChosen = true;
      }
      state.door = doors[data.d] ? data.d : "story";
    }
    function stateHash() {
      var hash = "#c=" + state.currency + "&r=" + state.reels + "&m=" + state.months + "&t=" + state.tierId + "&s=" + (state.storyIndex + 1) + "&w=" + state.wizardStep;
      if (state.door) hash += "&d=" + state.door;
      return hash;
    }
    function syncHash() {
      var next = stateHash();
      if (window.location.hash !== next) window.history.replaceState(null, "", next);
    }
    function formatInr(inr) { return "₹" + Math.round(inr).toLocaleString("en-IN"); }
    function formatUsd(inr, reel) {
      var usd = Math.round(inr) / cfg.fxRateInrPerUsd;
      if (reel || usd < 100) return "$" + usd.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      return "$" + Math.round(usd).toLocaleString("en-US");
    }
    function money(inr, reel) {
      if (state.currency === "usd") return formatUsd(inr, reel);
      return formatInr(inr);
    }
    function plural(n, one, many) { return n === 1 ? one : many; }
    function monthlyLectureLabel(hours) { return hourPhrase(Math.round(hours)); }
    function hoursText(hours) {
      var rounded = Math.round(hours * 10) / 10;
      if (Math.abs(rounded - Math.round(rounded)) < 0.001) return String(Math.round(rounded));
      return rounded.toFixed(1);
    }
    function hourPhrase(hours) {
      var label = hoursText(hours);
      return label + " " + plural(Number(label) === 1 ? 1 : 2, "hour", "hours");
    }
    function offPct(months) { return quoteTier(cfg.tiers[0], 1, months).totalOffPct; }
    function listRateNote(months) {
      var q = quoteTier(cfg.tiers[0], 1, months);
      if (q.termPct > 0) return q.totalOffPct + "% off list rate (" + q.termPct + "% term + " + q.foundingPct + "% one-time founding)";
      return q.totalOffPct + "% off list rate (one-time founding discount)";
    }
    function durationTermHeadline(months, boxTitle) {
      var opt = durationByMonths(months), off = offPct(months) + "% off", sep;
      if (!opt) return "";
      if (opt.bestValue) {
        sep = boxTitle ? " · Best value · " : " · Best value ";
        return opt.months + " " + plural(opt.months, "month", "months") + sep + off;
      }
      return opt.label + " · " + off;
    }
    function durationButtonLabel(opt) { return durationTermHeadline(opt.months, false); }
    function renderDurationDiscount() {
      var box = byId("duration-discount"), opt, q, html;
      if (!box || !(opt = durationByMonths(state.months))) { if (box) box.innerHTML = ""; return; }
      q = quoteTier(cfg.tiers[0], 1, state.months);
      html = '<p class="reels-duration-lead text-base font-semibold text-slate-900">' + esc(durationTermHeadline(state.months, true)) + '</p><ul class="reels-duration-break text-base text-slate-600 mt-2">';
      if (q.termPct) html += "<li>" + q.termPct + "% term discount</li>";
      box.innerHTML = html + "<li>" + q.foundingPct + "% founding customer discount*</li></ul><p class=\"reels-duration-foot text-base text-slate-600\">* The founding customer discount is a <strong>one-time offer</strong> for the <strong>first 5 customers</strong>.</p><div class=\"reels-guarantee-badge\" role=\"note\">" + guaranteeSealMarkup + "<p class=\"reels-guarantee-text\">" + esc(cfg.guaranteeCopy) + "</p></div>";
    }
    function buttonClass(on) {
      return on
        ? "px-4 py-2 rounded-full bg-brand-600 text-white text-base font-semibold cursor-pointer"
        : "px-4 py-2 rounded-full bg-white text-slate-800 text-base font-semibold border border-slate-300 hover:bg-slate-50 cursor-pointer";
    }
    function ctxNow() { return { tierId: state.tierId, reels: state.reels, months: state.months }; }
    function setText(id, text) {
      var node = byId(id);
      if (node) node.textContent = text;
    }
    function weekFromReels(reels) {
      var week = Number(reels) ? Math.round(Number(reels) / 4) : 0;
      if (week > cfg.postsPerWeekMax) week = cfg.postsPerWeekMax;
      return week < 1 && Number(reels) ? 1 : week;
    }
    function snapWeekReels(reels) { return weekFromReels(reels) * 4; }
    function sevenHourPace(reels) {
      var week = weekFromReels(reels), months, band, lead;
      if (!week) return { week: 0, months: 0, band: "", text: "" };
      months = Math.max(1, Math.round((7 * 60) / (week * 3.25) * 12 / 52));
      band = week >= 5 ? "green" : week >= 3 ? "yellow" : "red";
      lead = band === "green" ? "Recommended. " : band === "yellow" ? "Slower. " : "A long wait. ";
      return { week: week, months: months, band: band, text: "About " + months + " " + plural(months, "month", "months") + " to 7 hours.", signal: lead + "About " + months + " " + plural(months, "month", "months") + " to 7 hours." };
    }
    function paintPace() {
      var pace = sevenHourPace(state.reels);
      var result = byId("pace-result");
      var range = byId("posts-range");
      var monthsBox = byId("pace-months");
      var signal = byId("pace-signal");
      var lecture = byId("pace-lecture");
      var lectureText = byId("pace-lecture-text");
      var ticks = document.querySelectorAll(".reels-tick");
      var pct = (pace.week / cfg.postsPerWeekMax) * 100;
      var phrase = pace.week ? pace.week + " " + plural(pace.week, "post", "posts") + " a week" : "Choose posts a week";
      var i, d, html, cells, offset;
      if (result) result.hidden = !pace.week;
      if (monthsBox) {
        html = "";
        monthsBox.hidden = !pace.week;
        for (i = 1; i <= pace.months; i++) {
          offset = i % 7;
          cells = "";
          for (d = 0; d < 35; d++) cells += "<i" + (d < offset || d >= offset + 28 ? ' class="is-off"' : "") + "></i>";
          html += '<span class="reels-month"><span class="reels-month-top"><span class="reels-month-ring"></span><span class="reels-month-n">' + i + '</span><span class="reels-month-ring"></span></span><span class="reels-month-grid">' + cells + "</span></span>";
        }
        if (pace.week) { monthsBox.innerHTML = html; monthsBox.setAttribute("data-size", pace.months > 8 ? "sm" : "lg"); }
      }
      if (signal) {
        signal.hidden = !pace.week;
        if (pace.week) signal.setAttribute("data-band", pace.band);
        signal.textContent = pace.signal || "";
      }
      if (lecture) lecture.hidden = !pace.week;
      if (lectureText) lectureText.textContent = pace.week ? "Required: " + monthlyLectureLabel(minLectureHoursRounded(pace.week)) + " of lecture video per month." : "";
      if (range) {
        range.value = String(pace.week);
        range.style.setProperty("--fill", pct + "%");
        range.setAttribute("aria-valuenow", String(pace.week));
        range.setAttribute("aria-valuetext", phrase);
      }
      for (i = 0; i < ticks.length; i++) parseInt(ticks[i].getAttribute("data-week"), 10) === pace.week ? ticks[i].setAttribute("aria-current", "true") : ticks[i].removeAttribute("aria-current");
    }
    function shot(slideRow, index) {
      return '<button type="button" class="reels-shot" data-open-slide="' + index + '" aria-label="Open diagram ' + slideRow.num + ", " + esc(slideRow.title) + '"><img src="' + esc(slideRow.image) + '" width="1280" height="720" alt="' + esc(slideRow.alt) + '" loading="lazy"></button>';
    }
    function slideLead(num) {
      var leads = {
        "01": "A loud hook fades. A real class builds trust.",
        "02": "Five to seven posts a week holds when the reel comes from class.",
        "03": "A serious yes takes about 7 hours with your teaching.",
        "04": "The page gives the first free steps before anyone writes to you.",
        "05": "A profile visit is decided in about 3 seconds.",
        "06": "The grid has to look deliberate, week after week.",
        "07": "The caption reaches people who do not follow you yet.",
        "08": "The same class also becomes Carousels and Stories.",
        "09": "The same recording will power more formats as they ship.",
        "10": "Twelve months locks " + offPct(12) + "% off for the full year (" + durationByMonths(12).termDiscountPct + "% annual + " + cfg.foundingDiscountPct + "% one-time founding). A shorter term spends the one-time " + cfg.foundingDiscountPct + "%, and renewals revert to the standard term rate.",
        "11": "Five specialist jobs, on every reel, or the post stays in drafts.",
        "12": "The cover is written from the whole class, not from the clip.",
        "13": "People decide to stay or leave in the first second.",
        "14": "The lesson stays fully visible while someone scrolls the feed.",
        "15": "The end card sends them to the caption.",
        "16": "The caption is how strangers find the lesson.",
        "17": "The full class is understood before a frame is cut.",
        "18": "Then the cut, the hook, the frame, and the cover.",
        "19": "About 300 checks replace a day of specialist work.",
        "20": "Nine gates, then a score, before a reel is Recommended.",
        "21": "A full week only holds if all nine layers stay."
      };
      return leads[num] || "";
    }
    function stageBody(slideRow, index, navHtml, moreId) {
      var extra = "";
      var i;
      var preview = '<div class="reels-preview is-clamped" id="' + moreId + '-preview"><p>' + esc(slideRow.lead) + "</p><p>" + esc(slideRow.story) + "</p></div>";
      if (slideRow.items && slideRow.items.length) {
        extra += '<ul class="reels-benefits mt-3 space-y-2 text-base text-slate-700">';
        for (i = 0; i < slideRow.items.length; i++) extra += "<li>" + esc(slideRow.items[i]) + "</li>";
        extra += "</ul>";
      }
      if (slideRow.roles) extra += '<p class="mt-3 text-base text-slate-700"><span class="font-semibold text-slate-900">Specialists required every time:</span> ' + esc(slideRow.roles) + "</p>";
      if (slideRow.discovery) extra += '<p class="mt-2 text-base text-slate-700"><span class="font-semibold text-slate-900">Discovery impact:</span> ' + esc(slideRow.discovery) + "</p>";
      return '<div class="reels-stage reels-stage-anim"><div>' + shot(slideRow, index) + navHtml + '</div><div><p class="reels-kicker">' + esc(slideRow.group) + '</p><h3 class="text-2xl font-bold text-slate-900 mt-1">' + esc(slideRow.title) + "</h3>" + preview + '<div id="' + moreId + '-body" hidden>' + extra + '</div><p class="mt-3"><button type="button" class="reels-textlink" id="' + moreId + '" data-slide-more="1" data-preview="' + moreId + '-preview" aria-expanded="false" aria-controls="' + moreId + '-body">More</button></p></div></div>';
    }
    function settlePreview(moreId) {
      var preview = byId(moreId + "-preview");
      var body = byId(moreId + "-body");
      var btn = byId(moreId);
      var extra, overflow;
      if (!preview || !btn || btn.getAttribute("aria-expanded") === "true") return;
      if (!preview.getClientRects().length) return;
      extra = body && body.textContent.replace(/\s/g, "").length > 0;
      overflow = preview.scrollHeight > preview.clientHeight + 1;
      if (!extra && !overflow) {
        preview.classList.remove("is-clamped");
        btn.parentElement.hidden = true;
      }
    }
    function storyNav() {
      var html = '<div class="reels-navrow"><button type="button" class="reels-navbtn" id="story-prev"' + (state.storyIndex === 0 ? " disabled" : "") + ">Previous slide</button>";
      html += '<button type="button" class="reels-navbtn" id="story-next"' + (state.storyIndex === 9 ? " disabled" : "") + ">Next slide</button></div>";
      if (state.storyIndex === 9) html += '<p class="mt-4"><button type="button" class="reels-textlink" data-open-door="craft">Next: How a reel is made</button></p>';
      return html;
    }
    function craftLast() { return cfg.craftSlides.length - 1; }
    function craftNav() {
      return '<div class="reels-navrow"><button type="button" class="reels-navbtn" id="craft-prev"' + (state.craftIndex === 0 ? " disabled" : "") + '>Previous</button><button type="button" class="reels-navbtn" id="craft-next"' + (state.craftIndex === craftLast() ? " disabled" : "") + ">Next</button></div>";
    }
    function renderButtons(items, attr, idPrefix, pressed, labelFor) {
      var html = "";
      var i, on;
      for (i = 0; i < items.length; i++) {
        on = pressed(items[i]);
        html += '<button type="button" id="' + idPrefix + items[i].attr + '" class="' + buttonClass(on) + '" ' + attr + '="' + items[i].attr + '" aria-pressed="' + on + '">' + labelFor(items[i]) + "</button>";
      }
      return html;
    }
    function renderControls() {
      var currencies = [{ attr: "inr" }, { attr: "usd" }];
      var durations = [];
      var i;
      for (i = 0; i < cfg.durationMonthsOptions.length; i++) durations.push({ attr: cfg.durationMonthsOptions[i].months, opt: cfg.durationMonthsOptions[i] });
      byId("currency-switch").innerHTML = renderButtons(currencies, "data-currency", "currency-", function (item) { return state.currency === item.attr; }, function (item) { return item.attr === "usd" ? "USD" : "INR"; });
      byId("duration-controls").innerHTML = renderButtons(durations, "data-months", "months-opt-", function (item) { return state.months === item.opt.months; }, function (item) { return esc(durationButtonLabel(item.opt)); });
      paintPace();
    }
    function paceBridgeLine(week) {
      return "For " + week + " " + plural(week, "post", "posts") + " a week, that is " + state.reels + " " + plural(state.reels, "post", "posts") + " a month.";
    }
    function renderModes() {
      var panel1 = byId("wizard-panel-1");
      var panel2 = byId("wizard-panel-2");
      var bridge = byId("pace-bridge");
      var showRow = byId("show-step-2-row");
      var showBtn = byId("show-step-2");
      var week = weekFromReels(state.reels);
      var open = step2Shown && week > 0;
      if (panel1) panel1.hidden = false;
      if (panel2) panel2.hidden = !open;
      if (showBtn && week > 0) showBtn.textContent = "Confirm " + week + " " + plural(week, "post", "posts") + " a week";
      if (showRow) showRow.hidden = !(week > 0 && !open);
      if (bridge) bridge.textContent = week ? paceBridgeLine(week) : "";
    }
    function animate(node) {
      if (!node) return;
      node.classList.remove("reels-stage-anim");
      void node.offsetWidth;
      node.classList.add("reels-stage-anim");
    }
    function planPriceLine(q) { return money(q.upfrontInr, false) + " upfront for " + state.months + " " + plural(state.months, "month", "months"); }
    function slideIndexByNum(num) {
      for (var i = 0; i < cfg.allSlides.length; i++) if (cfg.allSlides[i].num === String(num)) return i;
      return -1;
    }
    function slideBtn(s, idx) {
      return '<button type="button" class="reels-card-slide" data-open-slide="' + idx + '" aria-label="Open diagram ' + s.num + ", " + esc(s.title) + '"><img src="' + esc(s.image) + '" width="320" height="180" alt="' + esc(s.alt) + '" loading="lazy"></button>';
    }
    function fixButtons(actions) {
      var html = "", i, a;
      for (i = 0; i < (actions || []).length; i++) {
        a = actions[i];
        html += '<button type="button" class="reels-fix" data-fix="1"' + (a.months ? ' data-months="' + a.months + '"' : "") + (a.reels ? ' data-reels="' + a.reels + '"' : "") + (a.tierId ? ' data-tier="' + esc(a.tierId) + '"' : "") + ">" + esc(a.label) + "</button> ";
      }
      return html;
    }
    function craftBlock(tier) {
      var nums = tier.craftSlideNums || [], html = '<div class="reels-card-slides mt-4"><p class="text-base font-semibold text-slate-900 mb-2">' + esc(tier.craftHeading || "") + "</p>", i, s, idx;
      for (i = 0; i < nums.length; i++) { idx = slideIndexByNum(nums[i]); s = cfg.allSlides[idx]; if (idx >= 0 && s) html += slideBtn(s, idx); }
      return html + "</div>";
    }
    function renderPlanValue() {
      var box = byId("plan-value"), nums, i, idx, row, st, got = "", lost = "", lostCount = 0, item, mark;
      if (!box) return;
      box.hidden = !state.planChosen;
      if (!state.planChosen) return;
      nums = cfg.valueComparisonSlideNums || [];
      for (i = 0; i < nums.length; i++) {
        idx = slideIndexByNum(nums[i]);
        row = idx < 0 ? null : cfg.allSlides[idx];
        if (!row) continue;
        st = statusFor(row, ctxNow());
        mark = st.level === "included";
        item = '<li class="reels-value-item"><button type="button" class="reels-value-shot" data-open-slide="' + idx + '" aria-label="Open diagram ' + row.num + ", " + esc(row.title) + '"><img src="' + esc(row.image) + '" width="176" height="99" alt="' + esc(row.alt) + '" loading="lazy"></button><div class="reels-value-copy"><span class="reels-value-mark ' + (mark ? "is-got" : "is-lost") + '">' + (mark ? "✓" : "✗") + '</span><p class="reels-value-title text-base font-semibold text-slate-900">Slide ' + row.num + " · " + esc(row.title) + '</p><p class="text-base text-slate-700">' + esc(st.reason || "") + "</p>" + (mark ? "" : fixButtons(st.actions)) + "</div></li>";
        if (mark) got += item; else { lost += item; lostCount += 1; }
      }
      dbg("renderPlanValue", { tier: state.tierId, months: state.months, reels: state.reels, lost: lostCount });
      box.innerHTML = '<h3 class="text-2xl font-bold text-slate-900">What this plan + term gives you (and what you leave on the table)</h3><div class="reels-value-cols mt-4"><section><h4 class="reels-value-h is-got">What you get (✓)</h4><ul class="reels-value-list">' + got + '</ul></section><section><h4 class="reels-value-h is-lost">What you lose (✗)</h4>' + (lostCount ? '<ul class="reels-value-list">' + lost + "</ul>" : '<p class="reels-value-clear">✓ Nothing left on the table - all 10 story advantages and the full ' + offPct(12) + '% 12-month rate lock are included.</p>') + "</section></div>";
    }
    function renderPlans() {
      var html = "";
      var i, j, tier, q, selected, monthlyLine, upfrontLine;
      for (i = 0; i < cfg.tiers.length; i++) {
        tier = cfg.tiers[i];
        q = quoteTier(tier, state.reels, state.months);
        selected = state.planChosen && tier.id === state.tierId;
        monthlyLine = '<p class="mt-4"><span class="text-4xl font-extrabold text-slate-900">' + esc(money(q.monthlyInr, false)) + '</span> <span class="text-base text-slate-600">/ month</span>';
        if (q.monthlyInr < q.baseMonthlyInr) monthlyLine += ' <span class="text-base reels-was">' + esc(money(q.baseMonthlyInr, false)) + "</span>";
        monthlyLine += "</p>";
        upfrontLine = '<p class="mt-1 text-base font-semibold text-slate-900">' + esc(planPriceLine(q));
        if (q.upfrontInr < q.baseUpfrontInr) upfrontLine += ' <span class="font-normal reels-was">' + esc(money(q.baseUpfrontInr, false)) + "</span>";
        upfrontLine += ' · <span class="text-brand-700">' + q.totalOffPct + "% off</span></p>";
        html += '<div class="reels-plan-col" data-tier="' + esc(tier.id) + '" data-recommended="' + (tier.recommended ? "true" : "false") + '">';
        html += '<article id="tier-' + esc(tier.id) + '" class="reels-plan-card rounded-2xl border p-6 flex flex-col ' + (selected ? "reels-chosen" : "border-slate-200") + '">';
        html += '<p class="reels-kicker reels-eyebrow mb-2">' + (tier.recommended ? "Recommended" : "") + "</p>";
        html += '<h3 class="text-2xl font-bold text-slate-900">' + esc(tier.name) + "</h3>" + (tier.upcoming ? '<p class="mt-1 text-base text-slate-600">' + esc(tier.upcoming) + ' <span class="reels-upcoming-pill">Upcoming</span></p>' : "");
        html += '<p class="mt-1 text-base text-slate-600">' + esc(tier.fits) + "</p>";
        html += monthlyLine + upfrontLine;
        html += '<p class="mt-2 text-base font-semibold text-slate-800">' + state.reels + " " + plural(state.reels, "post", "posts") + " / month · Up to " + esc(hourPhrase(includedHours(state.reels))) + " lecture video</p>";
        html += '<ul class="reels-benefits mt-3 space-y-1.5 text-base text-slate-700">';
        for (j = 0; j < tier.benefits.length; j++) html += "<li>" + esc(tier.benefits[j]) + "</li>";
        html += "</ul>" + craftBlock(tier) + "</article>";
        html += '<div class="reels-plan-choose"><button type="button" class="' + buttonClass(selected) + '" data-choose="1" data-tier="' + esc(tier.id) + '" aria-pressed="' + (selected ? "true" : "false") + '">' + (selected ? "Selected" : "Choose this plan") + "</button></div></div>";
      }
      byId("plan-grid").innerHTML = html;
    }
    function renderStory() {
      var row;
      if (state.storyIndex < 0 || state.storyIndex > 9) state.storyIndex = 0;
      if (String(state.storyIndex) === storySig) return;
      storySig = String(state.storyIndex);
      row = cfg.storySlides[state.storyIndex];
      byId("story-step-meta").textContent = "Slide " + (state.storyIndex + 1) + " of 10";
      row.lead = slideLead(row.num);
      byId("story-card-host").innerHTML = stageBody(row, state.storyIndex, storyNav(), "story-more");
    }
    function renderCraft() {
      var row, shown, sig;
      if (state.craftIndex < 0 || state.craftIndex > craftLast()) state.craftIndex = 0;
      sig = state.craftIndex + "|" + state.reels + "|" + state.currency;
      if (sig === craftSig) return;
      craftSig = sig;
      row = cfg.craftSlides[state.craftIndex];
      shown = { num: row.num, group: row.group, title: row.title, image: row.image, alt: row.alt, story: row.story, items: row.items, roles: row.roles, discovery: row.discovery, lead: row.num === "22" ? hoursSentences() : slideLead(row.num) };
      byId("craft-step-meta").textContent = "Diagram " + (state.craftIndex + 1) + " of " + cfg.craftSlides.length;
      byId("craft-stage").innerHTML = stageBody(shown, cfg.storySlides.length + state.craftIndex, craftNav(), "craft-more");
    }
    function accItem(title, body) {
      return '<div data-accordion-item class="border border-slate-200 rounded-xl overflow-hidden hover:border-slate-300 transition-colors"><button type="button" data-accordion-toggle aria-expanded="false" class="w-full flex items-center justify-between gap-4 p-5 text-left cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 rounded-xl min-h-[3rem] sm:min-h-0"><span class="text-base font-semibold text-slate-900">' + title + '</span><span class="material-symbols-rounded text-slate-400 flex-shrink-0" data-accordion-chevron>expand_more</span></button><div data-accordion-content class="hidden"><div class="px-5 pb-5">' + body + "</div></div></div>";
    }
    function renderFaq() {
      if (faqDone) return;
      faqDone = true;
      var takes = [
        "Spark finishes the post from classes you already taught, instead of leaving the weekly edit on you or an agency.",
        "Repeat watches, Saves, Shares, and non-follower reach matter more than likes, and serious enquiries show up after the library has hours of teaching.",
        "You approve every watermarked draft: a thumbs-up spends one credit, and a pass retires the clip for free.",
        "Fill the page to 60 to 90 classroom reels before you spend on ads, so each click lands on hours of teaching."
      ];
      var html = "";
      var i, row, index;
      var base = cfg.storySlides.length + cfg.craftSlides.length;
      for (i = 0; i < cfg.faqSlides.length; i++) {
        row = cfg.faqSlides[i];
        index = base + i;
        html += accItem(esc(row.title), '<p class="text-base text-slate-600 mb-4">' + esc(takes[i]) + "</p>" + shot(row, index));
      }
      byId("faq-grid").innerHTML = html;
    }
    function hoursLine() {
      var week = weekFromReels(state.reels);
      if (!state.reels) return "Included lecture time starts at " + hourPhrase(cfg.minLectureHours) + " a month and rises with the number of posts.";
      return "At " + state.reels + " " + plural(state.reels, "reel", "reels") + " a month, you need a minimum of " + monthlyLectureLabel(minLectureHoursRounded(week)) + " of lecture video per month, and your plan includes a limit of up to " + hourPhrase(includedHours(state.reels)) + " per month (+" + cfg.lectureLimitBufferPct + "% buffer).";
    }
    function hoursSentences() {
      return hoursLine() + " Extra video is " + money(cfg.extraVideoHourInr, true) + " an hour.";
    }
    function renderHours() {
      setText("included-hours", hoursLine());
      setText("extra-hour", "Extra video is " + money(cfg.extraVideoHourInr, true) + " an hour.");
    }
    function renderFounding() {
      var tier = tierById("reel_cover_caption");
      var reels = state.reels || 20;
      var year = quoteTier(tier, reels, 12);
      setText("founding-rate", "Two discounts stack on your first upfront plan: up to " + year.termPct + "% plan discount + " + year.foundingPct + "% one-time Founding Partner discount (" + year.totalOffPct + "% off on 12 months - " + money(year.monthlyInr, false) + " / month instead of " + money(year.baseMonthlyInr, false) + " for " + reels + " " + plural(reels, "post", "posts") + " a month).");
    }
    function renderDoors() {
      var tab = state.door === "craft" ? "craft" : (state.door === "plan" || state.door === "faq" || state.door === "founding") ? "plan" : "story";
      ["story", "craft", "plan"].forEach(function (name) { var btn = byId("tab-" + name); if (btn) btn.setAttribute("aria-selected", tab === name ? "true" : "false"); });
      byId("story").hidden = tab !== "story";
      byId("how-it-works").hidden = tab !== "craft";
      byId("prices").hidden = tab !== "plan";
      byId("faq").hidden = tab !== "plan" || !step2Shown;
    }
    function currentUrl() {
      var href = window.location.href;
      var cut = href.indexOf("#");
      return (cut === -1 ? href : href.slice(0, cut)) + stateHash();
    }
    function renderNudge() {
      var box = byId("checkout-nudge");
      var nowMonthly, nextMonthly, save, msg;
      if (!state.planChosen || (state.tierId === "reel_cover_caption" && state.months === 12)) { box.innerHTML = ""; return; }
      nowMonthly = quoteTier(tierById(state.tierId), state.reels, state.months).monthlyInr;
      nextMonthly = quoteTier(tierById("reel_cover_caption"), state.reels, 12).monthlyInr;
      save = nowMonthly - nextMonthly;
      if (save > 0) msg = "12 months on Reel + cover + caption is " + money(nextMonthly, false) + " / month (" + money(save, false) + " less per month).";
      else msg = "12 months on Reel + cover + caption is " + money(nextMonthly, false) + " / month, locking 45% off for the full year with early access as new formats ship.";
      box.innerHTML = '<p class="text-base text-slate-800 mt-3 mb-3">' + esc(msg) + '</p><p><button type="button" class="reels-fix" data-fix="1" data-from="checkout" data-months="12" data-tier="reel_cover_caption">Switch to 12 months, Reel + cover + caption</button></p>';
    }
    function renderCheckout() {
      var box = byId("checkout");
      var tier = tierById(state.tierId);
      var q = quoteTier(tier, state.reels, state.months);
      var week = weekFromReels(state.reels);
      var line1, line2, line3, text, subject;
      if (box) box.hidden = !state.planChosen;
      line1 = tier.name + " · " + week + " " + plural(week, "post", "posts") + " a week (" + state.reels + " / month) · " + state.months + " " + plural(state.months, "month", "months") + " - " + money(q.monthlyInr, false) + " / month (" + money(q.upfrontInr, false) + " upfront, was " + money(q.baseUpfrontInr, false) + ")";
      line2 = "Includes up to " + hourPhrase(includedHours(state.reels)) + " of lecture video / month (extra video " + money(cfg.extraVideoHourInr, true) + " / hour) · " + listRateNote(state.months) + ".";
      line3 = cfg.guaranteeCopy;
      text = line1 + "\n" + line2 + "\n" + line3 + "\nSetup link: " + currentUrl();
      state.summaryText = text;
      subject = "Spark Reels plan: " + tier.name + ", " + week + " posts a week, " + state.months + " " + plural(state.months, "month", "months");
      byId("checkout-summary").innerHTML = '<p class="text-base font-semibold text-slate-900">' + esc(line1) + '</p><p class="mt-1 text-base text-slate-600">' + esc(line2) + '</p><p class="reels-guarantee mt-3">' + esc(line3) + "</p>";
      byId("whatsapp-choice").href = "https://wa.me/" + cfg.whatsappPhone + "?text=" + encodeURIComponent(text);
      byId("email-choice").href = "mailto:support@sparktutor.ai?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(text);
      renderNudge();
    }
    function closeStep2() {
      step2Shown = false;
      state.wizardStep = 1;
      state.planChosen = false;
    }
    function render() {
      if (!weekFromReels(state.reels)) closeStep2();
      syncHash();
      renderDoors();
      renderControls();
      renderModes();
      renderDurationDiscount();
      renderPlans();
      renderPlanValue();
      renderStory();
      renderCraft();
      renderFaq();
      renderHours();
      renderFounding();
      renderCheckout();
      settlePreview("story-more");
      settlePreview("craft-more");
      if (!byId("story-lightbox").hidden) paintLightbox();
    }
    function setReels(n) {
      var prevWeek;
      if (!isFinite(n) || Math.floor(n) !== n || n < 0 || n > 90) return;
      prevWeek = weekFromReels(state.reels);
      state.reels = n === 0 ? 0 : snapWeekReels(n);
      if (weekFromReels(state.reels) !== prevWeek) closeStep2();
      render();
    }
    function openFold(id) {
      var node = byId(id);
      if (!node || node.tagName !== "DETAILS") return;
      node.open = true;
      node.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    function scrollToId(id) {
      var node = byId(id);
      if (node) node.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    function moveStory(delta) {
      var next = state.storyIndex + delta;
      if (next < 0 || next > 9) return;
      dbg("moveStory", { from: state.storyIndex, to: next });
      state.storyIndex = next;
      render();
    }
    function moveCraft(delta) {
      var next = state.craftIndex + delta;
      if (next < 0 || next > craftLast()) return;
      dbg("moveCraft", { from: state.craftIndex, to: next });
      state.craftIndex = next;
      render();
    }
    function applyFix(btn) {
      var patch = {};
      dbg("applyFix:before", state);
      step2Shown = true;
      state.planChosen = true;
      state.wizardStep = 2;
      if (btn.hasAttribute("data-months")) {
        patch.months = parseInt(btn.getAttribute("data-months"), 10);
        state.months = patch.months;
      }
      if (btn.hasAttribute("data-reels")) {
        patch.reels = parseInt(btn.getAttribute("data-reels"), 10);
        state.reels = snapWeekReels(patch.reels);
      }
      if (btn.hasAttribute("data-tier")) {
        patch.tierId = btn.getAttribute("data-tier");
        state.tierId = patch.tierId;
      }
      render();
      dbg("applyFix:after", patch);
      flash(patch);
    }
    function flash(patch) {
      var nodes = [];
      var token, i;
      function add(node) { if (node) nodes.push(node); }
      flashToken += 1;
      token = flashToken;
      if (patch.months) add(byId("months-opt-" + patch.months));
      if (patch.reels) add(byId("pace-bridge"));
      if (patch.tierId) add(byId("tier-" + patch.tierId));
      add(byId("plan-value"));
      for (i = 0; i < nodes.length; i++) nodes[i].classList.add("reels-flash");
      window.setTimeout(function () {
        var j;
        if (token !== flashToken) return;
        for (j = 0; j < nodes.length; j++) nodes[j].classList.remove("reels-flash");
      }, 1800);
    }
    function paintLightbox() {
      var slideRow = cfg.allSlides[state.lightbox];
      var st = statusFor(slideRow, ctxNow());
      var img = byId("lightbox-img");
      var status = byId("lightbox-status");
      img.src = slideRow.image;
      img.alt = slideRow.alt;
      byId("lightbox-step").textContent = slideRow.num + " / " + pad(cfg.allSlides.length) + " · " + slideRow.group;
      status.hidden = !st.pill;
      status.textContent = st.pill || "";
      status.className = "reels-status reels-status-" + tone(st.level);
      byId("lightbox-title").textContent = slideRow.title;
      byId("lightbox-story").textContent = (slideRow.num === "22" ? hoursSentences() + " " : "") + slideRow.story + (slideRow.roles ? " Specialists required every time: " + slideRow.roles + "." : "") + (slideRow.discovery ? " Discovery impact: " + slideRow.discovery : "");
      byId("lightbox-reason").textContent = st.reason || "";
    }
    function openLightbox(index) {
      var dlg = byId("story-lightbox");
      if (!cfg.allSlides[index]) return;
      state.lightbox = index;
      paintLightbox();
      dlg.hidden = false;
      dlg.setAttribute("aria-hidden", "false");
      byId("lightbox-close").focus();
    }
    function closeLightbox() {
      var dlg = byId("story-lightbox");
      dlg.hidden = true;
      dlg.setAttribute("aria-hidden", "true");
    }
    function stepLightbox(delta) {
      var n = cfg.allSlides.length;
      state.lightbox = (state.lightbox + delta + n) % n;
      paintLightbox();
    }
    function copyText(text, button, done) {
      var idle = button.getAttribute("data-idle") || button.textContent;
      var token = String(Date.now()) + Math.random();
      button.setAttribute("data-idle", idle);
      button.setAttribute("data-copy-token", token);
      function show(ok) {
        button.textContent = ok ? done : "Select the text and copy it";
        window.setTimeout(function () {
          if (button.getAttribute("data-copy-token") !== token) return;
          button.textContent = idle;
        }, 2000);
      }
      function fallback() {
        var area = document.createElement("textarea");
        var ok = false;
        area.value = text;
        document.body.appendChild(area);
        area.select();
        try { ok = document.execCommand("copy"); } catch (err) { ok = false; }
        document.body.removeChild(area);
        return ok;
      }
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(function () { show(true); }, function () { show(fallback()); });
      else show(fallback());
    }
    function panelFor(door) {
      if (door === "craft") return "how-it-works";
      if (door === "plan") return "prices";
      return door;
    }
    applyHash();
    byId("posts-range").addEventListener("input", function (e) {
      setReels(parseInt(e.target.value, 10) * 4);
    });
    document.addEventListener("click", function (e) {
      var origin = e.target;
      var btn, doorId, panel, opening, preview;
      if (origin && origin.nodeType !== 1) origin = origin.parentElement;
      if (!origin || !origin.closest) return;
      if (origin.id === "story-lightbox") { closeLightbox(); return; }
      if (origin.closest("#lightbox-close")) { closeLightbox(); return; }
      if (origin.closest("#lightbox-prev")) { stepLightbox(-1); return; }
      if (origin.closest("#lightbox-next")) { stepLightbox(1); return; }
      if (origin.closest("#copy-choice")) { copyText(state.summaryText || "", byId("copy-choice"), "Copied plan summary"); return; }
      if (origin.closest("#copy-link-choice")) { syncHash(); copyText(window.location.href, byId("copy-link-choice"), "Copied link"); return; }
      if (origin.closest("#show-step-2")) {
        if (!weekFromReels(state.reels)) return;
        step2Shown = true;
        render();
        scrollToId("wizard-panel-2");
        return;
      }
      if (origin.closest("#founding-build")) {
        state.months = 12;
        state.tierId = "reel_cover_caption";
        state.wizardStep = 2;
        state.planChosen = true;
        step2Shown = true;
        state.door = "plan";
        render();
        scrollToId("prices");
        return;
      }
      btn = origin.closest("[data-open-door]");
      if (btn) {
        state.door = btn.getAttribute("data-open-door");
        render();
        scrollToId(panelFor(state.door));
        return;
      }
      btn = origin.closest("#entry-doors [data-door]");
      if (btn) {
        doorId = btn.getAttribute("data-door");
        if (state.door === doorId) return;
        state.door = doorId;
        render();
        return;
      }
      btn = origin.closest("[data-scroll]");
      if (btn) { scrollToId(btn.getAttribute("data-scroll")); return; }
      btn = origin.closest("[data-story-index]");
      if (btn) { state.storyIndex = parseInt(btn.getAttribute("data-story-index"), 10); render(); return; }
      btn = origin.closest("[data-craft-index]");
      if (btn) { state.craftIndex = parseInt(btn.getAttribute("data-craft-index"), 10); render(); return; }
      btn = origin.closest("[data-slide-more]");
      if (btn) {
        panel = byId(btn.getAttribute("aria-controls"));
        preview = byId(btn.getAttribute("data-preview"));
        opening = btn.getAttribute("aria-expanded") !== "true";
        if (preview) preview.classList.toggle("is-clamped", !opening);
        if (panel) panel.hidden = !opening;
        btn.textContent = opening ? "Less" : "More";
        btn.setAttribute("aria-expanded", opening ? "true" : "false");
        return;
      }
      if (origin.closest("#story-prev")) { moveStory(-1); return; }
      if (origin.closest("#story-next")) { moveStory(1); return; }
      if (origin.closest("#craft-prev")) { moveCraft(-1); return; }
      if (origin.closest("#craft-next")) { moveCraft(1); return; }
      btn = origin.closest("[data-fix]");
      if (btn) { applyFix(btn); return; }
      btn = origin.closest("[data-open-slide]");
      if (btn) { openLightbox(parseInt(btn.getAttribute("data-open-slide"), 10)); return; }
      btn = origin.closest("button[data-choose]");
      if (btn) {
        var scrollY = window.scrollY;
        state.tierId = btn.getAttribute("data-tier");
        state.planChosen = true;
        state.wizardStep = 2;
        render();
        window.scrollTo(0, scrollY);
        return;
      }
      btn = origin.closest("[data-open-fold]");
      if (btn) { openFold(btn.getAttribute("data-open-fold")); return; }
      btn = origin.closest("button[data-currency]");
      if (btn) { state.currency = btn.getAttribute("data-currency") === "usd" ? "usd" : "inr"; render(); return; }
      btn = origin.closest(".reels-tick[data-week]");
      if (btn) { setReels(parseInt(btn.getAttribute("data-week"), 10) * 4); return; }
      btn = origin.closest("#duration-controls button[data-months]");
      if (btn) { state.months = parseInt(btn.getAttribute("data-months"), 10); render(); return; }
    });
    document.addEventListener("keydown", function (e) {
      var dlg = byId("story-lightbox");
      var stop = document.activeElement && document.activeElement.closest && document.activeElement.closest(".reels-tick");
      var week, nextStop;
      if (stop && (e.key === "ArrowRight" || e.key === "ArrowLeft")) {
        week = parseInt(stop.getAttribute("data-week"), 10) + (e.key === "ArrowRight" ? 1 : -1);
        if (week >= 0 && week <= cfg.postsPerWeekMax) {
          setReels(week * 4);
          nextStop = document.querySelector('.reels-tick[data-week="' + week + '"]');
          if (nextStop) nextStop.focus();
        }
        e.preventDefault();
        return;
      }
      if (!dlg || dlg.hidden) return;
      if (e.key === "Escape") { closeLightbox(); e.preventDefault(); }
      else if (e.key === "ArrowRight") { stepLightbox(1); e.preventDefault(); }
      else if (e.key === "ArrowLeft") { stepLightbox(-1); e.preventDefault(); }
    });
    step2Shown = weekFromReels(state.reels) > 0 && state.wizardStep === 2;
    render();
    if ((state.door === "faq" || state.door === "founding") && step2Shown) scrollToId("faq");
  }
  root.SparkReelsPage = { mount: mount };
})(typeof window !== "undefined" ? window : globalThis);
