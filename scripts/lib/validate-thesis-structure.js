'use strict';

/**
 * Validate thesis-structure.json: every h3 in sections[] must nest under its
 * document-order h2 parent in toc[] (same pattern as two-traps → respect-gap).
 */

function buildExpectedH3ByParent(sections) {
    const byParent = {};
    let currentH2 = null;

    for (let i = 0; i < sections.length; i++) {
        const sec = sections[i];
        if (sec.id === 'references') {
            continue;
        }
        if (sec.level === 2) {
            currentH2 = sec.id;
            if (!byParent[currentH2]) {
                byParent[currentH2] = [];
            }
        } else if (sec.level === 3) {
            if (!currentH2) {
                throw new Error(
                    'sections[]: h3 #' + sec.id + ' appears before any h2 parent',
                );
            }
            if (!byParent[currentH2]) {
                byParent[currentH2] = [];
            }
            byParent[currentH2].push(sec.id);
        }
    }
    return byParent;
}

function buildActualH3ByParent(toc) {
    const byParent = {};
    for (let i = 0; i < toc.length; i++) {
        const item = toc[i];
        if (item.level !== 2) {
            continue;
        }
        byParent[item.id] = (item.children || []).map(function (child) {
            return child.id;
        });
    }
    return byParent;
}

function validateTocNesting(structure) {
    const errors = [];
    const sections = structure.sections || [];
    const toc = structure.toc || [];
    const sectionById = {};

    let expected;
    try {
        expected = buildExpectedH3ByParent(sections);
    } catch (err) {
        return [err.message];
    }

    const actual = buildActualH3ByParent(toc);

    for (let i = 0; i < sections.length; i++) {
        const sec = sections[i];
        if (sec.level === 2 && sec.id !== 'references') {
            sectionById[sec.id] = sec;
        }
    }

    Object.keys(sectionById).forEach(function (h2Id) {
        const exp = expected[h2Id] || [];
        const act = actual[h2Id] || [];
        if (exp.length !== act.length || exp.some(function (id, idx) { return id !== act[idx]; })) {
            errors.push(
                'toc[] children for #' +
                    h2Id +
                    ': expected [' +
                    exp.join(', ') +
                    '], got [' +
                    act.join(', ') +
                    '] (sections[] document order is source of truth)',
            );
        }
    });

    for (let i = 0; i < toc.length; i++) {
        const item = toc[i];
        if (item.level === 3) {
            errors.push(
                'toc[] item #' +
                    item.id +
                    ' is a top-level h3; nest it under its h2 parent in children[]',
            );
        }
    }

    Object.keys(actual).forEach(function (h2Id) {
        actual[h2Id].forEach(function (childId) {
            const sec = sections.find(function (s) {
                return s.id === childId;
            });
            if (!sec) {
                errors.push('toc[] child #' + childId + ' is missing from sections[]');
            } else if (sec.level !== 3) {
                errors.push(
                    'toc[] child #' +
                        childId +
                        ' is level ' +
                        sec.level +
                        ' in sections[]; expected level 3',
                );
            }
        });
    });

    return errors;
}

module.exports = {
    buildExpectedH3ByParent,
    buildActualH3ByParent,
    validateTocNesting,
};
