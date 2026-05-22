/**
 * Waitlist form handler for Spark Marketing Site
 * Typeform-style multi-step flow: role, role-specific, email, name
 * Submits to Firebase Cloud Function
 */

(function() {
    'use strict';

    const WAITLIST_FUNCTION_URL = 'https://us-central1-spark-website-waitlist-d1cf5.cloudfunctions.net/subscribeToWaitlist';

    let formData = {};
    let currentStep = 1;
    const SELECTED_CLS = 'waitlist-selected ring-2 ring-brand-500 bg-brand-100';

    function getSteps() {
        return document.getElementById('waitlist-steps');
    }

    function getProgressEl() {
        return document.getElementById('waitlist-progress');
    }

    function getModal() {
        return document.getElementById('waitlist-modal');
    }

    function goToStep(n) {
        currentStep = n;
        const steps = getSteps();
        if (!steps) return;

        steps.querySelectorAll('.waitlist-step').forEach(el => {
            el.classList.add('hidden');
        });
        const stepEl = steps.querySelector('[data-waitlist-step="' + n + '"]');
        if (stepEl) {
            stepEl.classList.remove('hidden');
        }

        if (n === 2 && formData.role) {
            steps.querySelectorAll('.waitlist-step2-panel').forEach(p => p.classList.add('hidden'));
            const panel = steps.querySelector('[data-waitlist-step2-role="' + formData.role + '"]');
            if (panel) panel.classList.remove('hidden');
        }

        const prog = getProgressEl();
        if (prog) prog.textContent = 'Step ' + n + ' of 4';
    }

    function resetWaitlistSteps() {
        formData = {};
        currentStep = 1;
        goToStep(1);
        document.querySelectorAll('.waitlist-choice').forEach(el => {
            el.classList.remove(...SELECTED_CLS.split(' '));
        });
        const steps = getSteps();
        if (steps) {
            const emailInp = steps.querySelector('input[name="email"]');
            const nameInp = steps.querySelector('input[name="name"]');
            const ytInp = steps.querySelector('input[name="youtube_channel_url"]');
            const addInp = steps.querySelector('input[name="additional_info"]');
            const submitBtn = steps.querySelector('#waitlist-submit-btn');
            if (emailInp) { emailInp.value = ''; emailInp.disabled = false; }
            if (nameInp) { nameInp.value = ''; nameInp.disabled = false; }
            if (ytInp) ytInp.value = '';
            if (addInp) addInp.value = '';
            if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Join list'; }
        }
    }

    function collectStep2() {
        const steps = getSteps();
        if (!steps) return;
        const panel = steps.querySelector('[data-waitlist-step="2"] .waitlist-step2-panel:not(.hidden)');
        if (!panel) return;
        const role = formData.role;
        if (role === 'enterprise') {
            const sel = panel.querySelector('[data-field="employee_range"].waitlist-selected');
            formData.employee_range = sel ? (sel.getAttribute('data-value') || null) : null;
        } else if (role === 'independent_coach') {
            const sel = panel.querySelector('[data-field="subscriber_range"].waitlist-selected');
            formData.subscriber_range = sel ? (sel.getAttribute('data-value') || null) : null;
            const yt = panel.querySelector('input[name="youtube_channel_url"]');
            formData.youtube_channel_url = (yt && yt.value) ? yt.value.trim() : null;
        } else if (role === 'university') {
            const sel = panel.querySelector('[data-field="course_type"].waitlist-selected');
            formData.course_type = sel ? (sel.getAttribute('data-value') || null) : null;
        } else if (role === 'other') {
            const inp = panel.querySelector('input[name="additional_info"]');
            formData.additional_info = (inp && inp.value) ? inp.value.trim() : null;
        }
    }

    function isValidYoutubeUrl(v) {
        if (!v || typeof v !== 'string') return true;
        const s = v.trim();
        return s.length === 0 || /youtube\.com|youtu\.be/i.test(s);
    }

    function showSuccessModal() {
        const modal = getModal();
        const steps = getSteps();
        if (!modal || !steps) return;

        const successHtml = '<div class="waitlist-success-block text-center py-4">' +
            '<div class="mb-4"><svg class="w-16 h-16 mx-auto text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg></div>' +
            '<h4 class="text-xl font-bold text-slate-900 mb-2">You\'re on the list!</h4>' +
            '<p class="text-slate-600 text-base">We\'ll notify you when Spark opens up for new educators.</p></div>';

        steps.classList.add('hidden');
        steps.insertAdjacentHTML('afterend', successHtml);

        setTimeout(function() {
            closeWaitlistModal();
            setTimeout(function() {
                const succ = modal.querySelector('.waitlist-success-block');
                if (succ) succ.remove();
                steps.classList.remove('hidden');
            }, 300);
        }, 3000);
    }

    function showErrorModal(message) {
        const modal = getModal();
        const steps = getSteps();
        if (!modal || !steps) return;

        let err = steps.querySelector('.waitlist-error');
        if (!err) {
            err = document.createElement('div');
            err.className = 'waitlist-error mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-base';
            steps.insertBefore(err, steps.firstChild);
        }
        err.textContent = message;
        err.classList.remove('hidden');
        setTimeout(function() {
            if (err.parentNode) err.remove();
        }, 5000);
    }

    function closeWaitlistModal() {
        const modal = getModal();
        if (modal) modal.classList.add('hidden');
        resetWaitlistSteps();
    }

    function openWaitlistModal() {
        const modal = getModal();
        if (modal) modal.classList.remove('hidden');
    }

    async function doSubmit() {
        const steps = getSteps();
        const emailInp = steps ? steps.querySelector('input[name="email"]') : null;
        const nameInp = steps ? steps.querySelector('input[name="name"]') : null;
        const submitBtn = steps ? steps.querySelector('#waitlist-submit-btn') : null;

        const email = (emailInp && emailInp.value) ? emailInp.value.trim() : (formData.email || '');
        const name = (nameInp && nameInp.value) ? nameInp.value.trim() : null;

        if (!email) {
            showErrorModal('Please enter a valid email address');
            return;
        }

        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Joining...';
        }
        if (emailInp) emailInp.disabled = true;
        if (nameInp) nameInp.disabled = true;

        const existingErr = steps ? steps.querySelector('.waitlist-error') : null;
        if (existingErr) existingErr.remove();

        const liteInterest = (typeof window.sparkPricingGetLiteInterest === 'function')
            ? window.sparkPricingGetLiteInterest()
            : false;
        let additionalInfo = formData.additional_info || null;
        if (liteInterest) {
            const liteNote = 'Also interested in Spark Lite: Yes';
            additionalInfo = additionalInfo ? (additionalInfo + '\n' + liteNote) : liteNote;
        }

        const payload = {
            email: email,
            role: formData.role || null,
            name: name || null,
            employee_range: formData.employee_range || null,
            subscriber_range: formData.subscriber_range || null,
            youtube_channel_url: formData.youtube_channel_url || null,
            course_type: formData.course_type || null,
            additional_info: additionalInfo,
            interested_in_spark_lite: liteInterest || false,
            source_page: document.body.getAttribute('data-page') || null
        };

        try {
            const response = await fetch(WAITLIST_FUNCTION_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || data.error || 'Failed to join waitlist');
            }
            showSuccessModal();
        } catch (e) {
            console.error('[waitlist] Submission error:', e);
            showErrorModal(e.message || 'Something went wrong. Please try again later.');
            if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Join list'; }
            if (emailInp) emailInp.disabled = false;
            if (nameInp) nameInp.disabled = false;
        }
    }

    function onStep1Choice(el) {
        const val = el.getAttribute('data-value');
        if (!val) return;
        formData.role = val;
        const step1 = getSteps().querySelector('[data-waitlist-step="1"]');
        if (step1) {
            step1.querySelectorAll('.waitlist-choice').forEach(c => {
                c.classList.remove(...SELECTED_CLS.split(' '));
            });
        }
        el.classList.add(...SELECTED_CLS.split(' '));
        goToStep(2);
    }

    function onStep2Choice(el) {
        const field = el.getAttribute('data-field');
        const val = el.getAttribute('data-value');
        if (!field) return;
        const panel = el.closest('.waitlist-step2-panel');
        if (panel) {
            panel.querySelectorAll('[data-field="' + field + '"]').forEach(c => {
                c.classList.remove(...SELECTED_CLS.split(' '));
            });
        }
        el.classList.add(...SELECTED_CLS.split(' '));
        formData[field] = val || null;
    }

    function onStep2NextOrSkip() {
        collectStep2();
        if (formData.role === 'independent_coach' && formData.youtube_channel_url && !isValidYoutubeUrl(formData.youtube_channel_url)) {
            showErrorModal('Please enter a valid YouTube channel URL (e.g. youtube.com or youtu.be)');
            return;
        }
        goToStep(3);
    }

    function onBackFrom2() {
        formData.employee_range = null;
        formData.subscriber_range = null;
        formData.youtube_channel_url = null;
        formData.course_type = null;
        formData.additional_info = null;
        getSteps().querySelectorAll('[data-waitlist-step="2"] .waitlist-choice').forEach(c => {
            c.classList.remove(...SELECTED_CLS.split(' '));
        });
        const panel = getSteps().querySelector('[data-waitlist-step="2"] .waitlist-step2-panel:not(.hidden)');
        if (panel) {
            const yt = panel.querySelector('input[name="youtube_channel_url"]');
            const add = panel.querySelector('input[name="additional_info"]');
            if (yt) yt.value = '';
            if (add) add.value = '';
        }
        goToStep(1);
    }

    function onStep3Next() {
        const steps = getSteps();
        const emailInp = steps ? steps.querySelector('[data-waitlist-step="3"] input[name="email"]') : null;
        const v = (emailInp && emailInp.value) ? emailInp.value.trim() : '';
        if (!v) {
            showErrorModal('Please enter a valid email address');
            return;
        }
        formData.email = v;
        goToStep(4);
    }

    function initWaitlistForm() {
        console.log('[waitlist] initWaitlistForm called');
        const modal = getModal();
        console.log('[waitlist] modal element:', modal);
        if (!modal) {
            console.log('[waitlist] No modal found, retrying in 100ms');
            setTimeout(initWaitlistForm, 100);
            return;
        }
        const steps = getSteps();
        console.log('[waitlist] steps element:', steps);
        if (!steps) {
            console.log('[waitlist] No steps found, retrying in 100ms');
            setTimeout(initWaitlistForm, 100);
            return;
        }
        if (steps.getAttribute('data-waitlist-inited') === '1') {
            console.log('[waitlist] Already initialized, skipping');
            return;
        }
        steps.setAttribute('data-waitlist-inited', '1');
        console.log('[waitlist] Initializing waitlist form');

        goToStep(1);

        steps.addEventListener('click', function(e) {
            const choice = e.target.closest('[data-waitlist-choice]');
            if (choice) {
                if (choice.getAttribute('data-field')) {
                    onStep2Choice(choice);
                } else {
                    onStep1Choice(choice);
                }
                return;
            }
            if (e.target.closest('.waitlist-skip') || e.target.closest('.waitlist-step2-next')) {
                onStep2NextOrSkip();
                return;
            }
        });

        steps.querySelectorAll('.waitlist-back-2').forEach(btn => {
            btn.addEventListener('click', onBackFrom2);
        });
        document.getElementById('waitlist-back-3')?.addEventListener('click', function() { goToStep(2); });
        document.getElementById('waitlist-back-4')?.addEventListener('click', function() { goToStep(3); });
        document.getElementById('waitlist-next-3')?.addEventListener('click', onStep3Next);
        document.getElementById('waitlist-submit-btn')?.addEventListener('click', doSubmit);

        var waitlistTriggers = document.querySelectorAll('button[onclick*="waitlist-modal"], a[href="#waitlist"], [data-open-waitlist]');
        console.log('[waitlist] Found waitlist triggers:', waitlistTriggers.length, waitlistTriggers);
        waitlistTriggers.forEach(function(btn) {
            console.log('[waitlist] Attaching click handler to:', btn.tagName, btn.className, btn.getAttribute('data-open-waitlist'));
            btn.addEventListener('click', function(ev) {
                console.log('[waitlist] Button clicked, opening modal');
                ev.preventDefault();
                openWaitlistModal();
            });
            if (btn.onclick) btn.removeAttribute('onclick');
            if (btn.getAttribute('href') === '#waitlist') btn.href = 'javascript:void(0)';
        });

        modal.querySelector('.backdrop-blur-sm')?.addEventListener('click', closeWaitlistModal);
        // Close button: use positional selector since onclick may have been removed earlier
        const closeBtn = modal.querySelector('.relative > button.absolute');
        console.log('[waitlist] Close button found:', closeBtn);
        if (closeBtn) {
            closeBtn.addEventListener('click', closeWaitlistModal);
            if (closeBtn.onclick) closeBtn.removeAttribute('onclick');
        }
    }

    function initWhenReady() {
        console.log('[waitlist] initWhenReady called, readyState:', document.readyState);
        if (document.readyState === 'loading') {
            console.log('[waitlist] Document still loading, adding DOMContentLoaded listener');
            document.addEventListener('DOMContentLoaded', function() { 
                console.log('[waitlist] DOMContentLoaded fired, scheduling initWaitlistForm in 200ms');
                setTimeout(initWaitlistForm, 200); 
            });
        } else {
            console.log('[waitlist] Document already loaded, scheduling initWaitlistForm in 200ms');
            setTimeout(initWaitlistForm, 200);
        }
    }
    console.log('[waitlist] waitlist.js loaded');
    initWhenReady();
})();
