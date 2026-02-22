// ═══════════════════════════════════════
// QUILL NLP Intent Parser (Simulated LLM)
// ═══════════════════════════════════════

const KEYWORD_MAP = {
    merchants: {
        swiggy: 'SWIGGY', zomato: 'ZOMATO', amazon: 'AMAZON', flipkart: 'FLIPKART',
        openai: 'OPENAI', 'chatgpt': 'OPENAI', anthropic: 'ANTHROPIC', claude: 'ANTHROPIC',
        github: 'GITHUB', huggingface: 'HUGGINGFACE', 'hugging face': 'HUGGINGFACE',
        aws: 'AWS', netflix: 'NETFLIX', uber: 'UBER', makemytrip: 'MAKEMYTRIP',
        bigbasket: 'BIGBASKET', midjourney: 'MIDJOURNEY',
    },
    categories: {
        food: 'food_delivery', 'food delivery': 'food_delivery', restaurant: 'food_delivery',
        shopping: 'shopping', travel: 'travel', entertainment: 'entertainment',
        ai: 'ai_subscription', 'ai tool': 'ai_subscription', 'ai tools': 'ai_subscription',
        cloud: 'cloud', 'developer': 'developer_tool', 'dev tool': 'developer_tool',
        education: 'education', health: 'health', grocery: 'grocery',
    },
};

// Category → vendor tag mapping (generic, not brand-locked)
const CATEGORY_VENDOR_TAG_MAP = {
    food_delivery: ['food_delivery'],
    shopping: ['shopping'],
    travel: ['travel'],
    entertainment: ['entertainment'],
    ai_subscription: ['ai_ml', 'software'],
    cloud: ['cloud'],
    developer_tool: ['developer_tools'],
    education: ['education'],
    health: ['health'],
    grocery: ['food'],
};

function extractAmount(text) {
    const patterns = [
        /₹\s?([\d,]+(?:\.\d+)?)/gi,
        /rs\.?\s?([\d,]+(?:\.\d+)?)/gi,
        /([\d,]+(?:\.\d+)?)\s?(?:rupees?|inr)/gi,
        /([\d]+)k\b/gi,
        /\b([\d,]+)\b/g,
    ];

    for (const pattern of patterns) {
        const matches = [...text.matchAll(pattern)];
        if (matches.length > 0) {
            const amounts = matches.map(m => {
                let val = m[1].replace(/,/g, '');
                if (text.includes('k') && val.length <= 3) val = String(Number(val) * 1000);
                return Number(val);
            }).filter(v => v >= 100);

            if (amounts.length > 0) return amounts;
        }
    }
    return [10000];
}

function extractMerchants(text) {
    const lower = text.toLowerCase();
    const found = [];
    for (const [key, value] of Object.entries(KEYWORD_MAP.merchants)) {
        if (lower.includes(key)) found.push(value);
    }
    return [...new Set(found)];
}

function extractCategories(text) {
    const lower = text.toLowerCase();
    const found = [];
    for (const [key, value] of Object.entries(KEYWORD_MAP.categories)) {
        if (lower.includes(key)) found.push(value);
    }
    return [...new Set(found)];
}

function extractPeriod(text) {
    const lower = text.toLowerCase();
    if (lower.includes('week')) return 'weekly';
    if (lower.includes('day') || lower.includes('daily')) return 'daily';
    if (lower.includes('quarter')) return 'quarterly';
    return 'monthly';
}

function extractDualApproval(text) {
    const lower = text.toLowerCase();
    return lower.includes('dual') || lower.includes('approval') || lower.includes('approve') || lower.includes('two admin');
}

// ── Parse Individual Intent ──
export function parseIndividualIntent(prompt) {
    const merchants = extractMerchants(prompt);
    const categories = extractCategories(prompt);
    const amounts = extractAmount(prompt);
    const period = extractPeriod(prompt);

    const monthlyCap = amounts[0] || 10000;
    const warningThreshold = amounts.length > 1 ? amounts[1] : Math.round(monthlyCap * 0.5);

    const merchantNames = merchants.map(m => {
        const merchMap = {
            SWIGGY: 'Swiggy', ZOMATO: 'Zomato', AMAZON: 'Amazon', FLIPKART: 'Flipkart',
            OPENAI: 'OpenAI', ANTHROPIC: 'Anthropic', GITHUB: 'GitHub', HUGGINGFACE: 'HuggingFace',
            NETFLIX: 'Netflix', UBER: 'Uber', MAKEMYTRIP: 'MakeMyTrip',
        };
        return merchMap[m] || m;
    });

    const title = merchants.length > 0
        ? `${merchantNames.join('/')} ${period.charAt(0).toUpperCase() + period.slice(1)} Cap`
        : categories.length > 0
            ? `${categories[0].replace(/_/g, ' ')} Spending Cap`
            : 'Custom Spending Cap';

    return {
        title,
        description: `Cap ${merchantNames.join(', ')} spending at ₹${monthlyCap.toLocaleString()} per ${period}`,
        type: 'spending_limit',
        merchants,
        categories: categories.length > 0 ? categories : ['general'],
        monthlyCap,
        warningThreshold,
        period,
        actions: {
            below_warning: 'allow',
            warning_to_cap: 'warn_and_allow',
            above_cap: 'block',
        },
        policy: {
            targets: merchantNames.length > 0 ? merchantNames : ['All merchants in ' + (categories[0] || 'selected category')],
            monthly_cap: monthlyCap,
            warning_threshold: warningThreshold,
            period,
            actions: [
                { condition: `≤ ₹${warningThreshold.toLocaleString()}`, action: 'Allow' },
                { condition: `₹${warningThreshold.toLocaleString()} – ₹${monthlyCap.toLocaleString()}`, action: 'Warn & Allow' },
                { condition: `> ₹${monthlyCap.toLocaleString()}`, action: 'Block' },
            ],
        },
        summary: `You're capping ${merchantNames.length > 0 ? merchantNames.join(', ') : 'selected category'} spend at ₹${monthlyCap.toLocaleString()}/${period}. Warning after ₹${warningThreshold.toLocaleString()}. Transactions beyond the cap will be blocked.`,
    };
}

// ── Parse Business Budget Intent (Admin) ──
export function parseBusinessBudgetIntent(prompt) {
    const merchants = extractMerchants(prompt);
    const categories = extractCategories(prompt);
    const amounts = extractAmount(prompt);
    const period = extractPeriod(prompt);
    const dualApproval = extractDualApproval(prompt);

    const totalAmount = amounts[0] || 50000;
    const categoryLabel = categories.length > 0
        ? categories[0].replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
        : 'General';
    const merchantNames = merchants.map(m => {
        const merchMap = {
            OPENAI: 'OpenAI', ANTHROPIC: 'Anthropic', GITHUB: 'GitHub', HUGGINGFACE: 'HuggingFace',
            AWS: 'AWS', SWIGGY: 'Swiggy', ZOMATO: 'Zomato',
        };
        return merchMap[m] || m;
    });

    return {
        title: `${categoryLabel} Budget`,
        totalAmount,
        category: categories[0] || 'general',
        allowedMerchants: merchants,
        requiresDualApproval: dualApproval,
        period,
        policy: {
            scope: `wallet = "${categoryLabel} Budget", type=project`,
            allowed_categories: categories,
            allowed_recipients: merchantNames,
            monthly_cap: totalAmount,
            risk_rules: {
                on_match: 'allow',
                off_intent: dualApproval ? 'require_approval' : 'block',
            },
            dual_approval: dualApproval,
        },
        summary: `Budget: ₹${totalAmount.toLocaleString()} for ${categoryLabel} (${period}). ${merchantNames.length > 0 ? `Vendors: ${merchantNames.join(', ')}.` : ''} ${dualApproval ? 'Allocations require dual admin approval.' : ''}`.trim(),
    };
}

// ── Parse Business User Request ──
export function parseUserRequest(prompt) {
    const merchants = extractMerchants(prompt);
    const categories = extractCategories(prompt);
    const amounts = extractAmount(prompt);

    const amount = amounts[0] || 5000;
    const category = categories[0] || 'general';

    const purposeMatch = prompt.match(/for\s+(.+?)(?:\.|$)/i);
    const purpose = purposeMatch ? purposeMatch[1].trim() : prompt.slice(0, 80);

    return {
        amount,
        purpose,
        category,
        suggestedBudget: category === 'ai_subscription' ? 'BUD001' : category === 'cloud' ? 'BUD002' : null,
        summary: `Request ₹${amount.toLocaleString()} from ${category.replace(/_/g, ' ')} budget for: ${purpose}`,
    };
}

// ═══════════════════════════════════════════════
// Multi-Entity Batch Intent/Allocation Parser
// ═══════════════════════════════════════════════

/**
 * Extracts named entities (person names) and their associated amounts from a prompt.
 *
 * IMPORTANT: All strategies run and their results are MERGED, not short-circuited.
 * This prevents partial matches like "Give Vikram ₹20,000 and Rahul ₹15,000"
 * where Strategy 3 catches Vikram but misses Rahul behind "and".
 */
function extractUserAmountPairs(text, knownUsers) {
    const lower = text.toLowerCase();
    const allPairs = [];

    const userNameMap = {};
    for (const u of knownUsers) {
        const firstName = u.name.split(' ')[0].toLowerCase();
        userNameMap[firstName] = u;
        userNameMap[u.name.toLowerCase()] = u;
    }

    const knownFirstNames = knownUsers.map(u => u.name.split(' ')[0].toLowerCase());

    const addPair = (name, amount, rawName) => {
        if (amount >= 100 && knownFirstNames.includes(name.toLowerCase())) {
            allPairs.push({ user: userNameMap[name.toLowerCase()], amount, rawName });
        }
    };

    // Strategy 1: "₹AMOUNT for NAME"
    for (const m of text.matchAll(/(?:₹|rs\.?\s?)([\d,]+k?)\s+(?:for|to)\s+([a-zA-Z]+)/gi)) {
        addPair(m[2], parseAmountStr(m[1]), m[2]);
    }

    // Strategy 2: "NAME gets/receives AMOUNT"
    for (const m of text.matchAll(/([a-zA-Z]+)\s+(?:gets?|receives?)\s+(?:₹|rs\.?\s?)?([\d,]+k?)/gi)) {
        addPair(m[1], parseAmountStr(m[2]), m[1]);
    }

    // Strategy 3: "give/allocate NAME ₹AMOUNT"
    for (const m of text.matchAll(/(?:give|allocate|assign|set)\s+([a-zA-Z]+)\s+(?:₹|rs\.?\s?)?([\d,]+k?)/gi)) {
        addPair(m[1], parseAmountStr(m[2]), m[1]);
    }

    // Strategy 3b: "and/,/then NAME ₹AMOUNT" (conjunction continuations)
    for (const m of text.matchAll(/(?:and|,|then)\s+([a-zA-Z]+)\s+(?:₹|rs\.?\s?)?([\d,]+k?)/gi)) {
        addPair(m[1], parseAmountStr(m[2]), m[1]);
    }

    // Strategy 4: "AMOUNT for NAME" without currency prefix
    for (const m of text.matchAll(/([\d,]+k?)\s+(?:for|to)\s+([a-zA-Z]+)/gi)) {
        addPair(m[2], parseAmountStr(m[1]), m[2]);
    }

    // Strategy 4b: "and/,/then [₹]AMOUNT for NAME" (conjunction + amount-for-name)
    for (const m of text.matchAll(/(?:and|,|then)\s+(?:₹|rs\.?\s?)?([\d,]+k?)\s+(?:for|to)\s+([a-zA-Z]+)/gi)) {
        addPair(m[2], parseAmountStr(m[1]), m[2]);
    }

    // Strategy 5: "NAME ₹AMOUNT" (name directly followed by amount, no verb needed)
    for (const m of text.matchAll(/\b([a-zA-Z]+)\s+(?:₹|rs\.?\s?)([\d,]+k?)\b/gi)) {
        addPair(m[1], parseAmountStr(m[2]), m[1]);
    }

    // If strategies found pairs, return them (merged + deduped)
    if (allPairs.length > 0) return deduplicatePairs(allPairs);

    // Strategy 6 (fallback): Zip known names with found amounts in text order
    const foundNames = knownFirstNames.filter(n => lower.includes(n));
    const amounts = extractAmount(text);
    if (foundNames.length > 0 && amounts.length > 0) {
        for (let i = 0; i < foundNames.length; i++) {
            const amount = amounts[i] || amounts[amounts.length - 1];
            allPairs.push({ user: userNameMap[foundNames[i]], amount, rawName: foundNames[i] });
        }
    }

    return deduplicatePairs(allPairs);
}

/** Deduplicate user-amount pairs by user name (keep first occurrence) */
function deduplicatePairs(pairs) {
    const seen = new Set();
    return pairs.filter(p => {
        const key = (p.user?.id || p.rawName || '').toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
}

function parseAmountStr(str) {
    let val = str.replace(/,/g, '').replace(/₹|rs\.?\s?/gi, '').trim();
    if (val.toLowerCase().endsWith('k')) {
        val = String(Number(val.slice(0, -1)) * 1000);
    }
    return Number(val) || 0;
}

function getVendorTagsForCategories(categories) {
    const tags = new Set();
    for (const cat of categories) {
        const mapped = CATEGORY_VENDOR_TAG_MAP[cat] || [];
        mapped.forEach(t => tags.add(t));
    }
    return [...tags];
}

/**
 * Multi-entity Batch Allocation Parser
 *
 * HARD RULES (per spec):
 *   1. LLM always returns an ARRAY of targets (even if only one).
 *   2. Post-parse strict validation runs BEFORE any creation.
 *   3. If validation fails → structured error, NO partial allocations.
 *   4. Never silently drops users.
 *
 * @param {string} prompt
 * @param {Object} options - { mode: 'business'|'individual', knownUsers: [...] }
 * @returns {Object} { targets, global_parameters, validation, rawPrompt, mode, summary }
 */
export function parseBatchAllocation(prompt, options = {}) {
    const { mode = 'business', knownUsers = [] } = options;
    const categories = extractCategories(prompt);
    const period = extractPeriod(prompt);
    const dualApproval = extractDualApproval(prompt);
    const vendorTags = getVendorTagsForCategories(categories);

    const categoryLabel = categories.length > 0
        ? categories[0].replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
        : 'General';

    const warningPct = extractWarningThreshold(prompt);

    const global_parameters = {
        period,
        category_tags: categories.length > 0 ? categories : ['general'],
        vendor_tags: vendorTags,
        dual_approval: dualApproval,
        warnings: { mid_threshold_percentage: warningPct },
    };

    let targets = [];

    if (mode === 'business') {
        const pairs = extractUserAmountPairs(prompt, knownUsers);

        if (pairs.length > 0) {
            targets = pairs.map(p => ({
                user_id: p.user?.id || null,
                user_name: p.user?.name || p.rawName,
                user_email: p.user?.email || null,
                amount: p.amount,
                category_tags: categories.length > 0 ? categories : ['general'],
                vendor_tags: vendorTags,
                purpose_text: `${categoryLabel} budget`,
                warning_threshold: Math.round(p.amount * warningPct / 100),
                resolved: !!p.user?.id,
            }));
        } else {
            const amounts = extractAmount(prompt);
            targets = [{
                user_id: null,
                user_name: 'Unspecified',
                user_email: null,
                amount: amounts[0] || 5000,
                category_tags: categories.length > 0 ? categories : ['general'],
                vendor_tags: vendorTags,
                purpose_text: `${categoryLabel} budget`,
                warning_threshold: Math.round((amounts[0] || 5000) * warningPct / 100),
                resolved: false,
            }];
        }
    } else {
        const categoryAmountPairs = extractCategoryAmountPairs(prompt);

        if (categoryAmountPairs.length > 0) {
            targets = categoryAmountPairs.map(p => ({
                category: p.category,
                category_label: p.category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                amount: p.amount,
                vendor_tags: getVendorTagsForCategories([p.category]),
                warning_threshold: Math.round(p.amount * warningPct / 100),
                period,
            }));
        } else {
            const amounts = extractAmount(prompt);
            targets = [{
                category: categories[0] || 'general',
                category_label: categoryLabel,
                amount: amounts[0] || 10000,
                vendor_tags: vendorTags,
                warning_threshold: Math.round((amounts[0] || 10000) * warningPct / 100),
                period,
            }];
        }
    }

    // ═══════════════════════════════════════════════
    // POST-LLM STRICT VALIDATION (NEVER silently drop)
    // ═══════════════════════════════════════════════
    const validation = validateBatchResult(prompt, targets, mode, knownUsers);

    return {
        targets,
        global_parameters,
        rawPrompt: prompt,
        mode,
        validation,
        summary: mode === 'business'
            ? `Found ${targets.length} allocation target${targets.length > 1 ? 's' : ''} for ${categoryLabel} (${period}).`
            : `Found ${targets.length} intent${targets.length > 1 ? 's' : ''} across categories (${period}).`,
    };
}

// ═══════════════════════════════════════════════
// STRICT POST-LLM VALIDATION
// ═══════════════════════════════════════════════

/**
 * Validates that the LLM parse is complete and consistent.
 * Compares name-tokens found in the prompt with actual targets.
 *
 * Checks (business mode):
 *   1. At least 2 targets when text clearly mentions multiple names.
 *   2. Each target has: user_name_or_id, amount, at least 1 category_tag.
 *   3. All names in the prompt must appear in targets — no silent drops.
 *
 * @returns {{ valid, errors[], warnings[], expectedCount, actualCount, detectedNames[], missingNames[] }}
 */
export function validateBatchResult(prompt, targets, mode, knownUsers = []) {
    const errors = [];
    const warnings = [];

    if (mode === 'business') {
        const detectedNames = detectNameTokensInPrompt(prompt, knownUsers);
        const actualCount = targets.length;
        const expectedCount = detectedNames.length;

        // Check 1: Name count mismatch (HARD FAIL)
        if (expectedCount >= 2 && actualCount < expectedCount) {
            const parsedNames = targets.map(t => (t.user_name || '').toLowerCase());
            const missingNames = detectedNames.filter(n =>
                !parsedNames.some(pn => pn.includes(n))
            );
            if (missingNames.length > 0) {
                errors.push(
                    `Could not reliably create intents for all mentioned people. ` +
                    `Detected ${expectedCount} name(s) in prompt but only parsed ${actualCount} target(s). ` +
                    `Missing: ${missingNames.map(n => `"${n}"`).join(', ')}. ` +
                    `Please check names/amounts and try again.`
                );
                return { valid: false, errors, warnings, expectedCount, actualCount, detectedNames, missingNames };
            }
        }

        // Check 2: Every target must have user_name_or_id and amount
        const incomplete = [];
        targets.forEach((t, i) => {
            const issues = [];
            if (!t.user_name || t.user_name === 'Unspecified') issues.push('missing user name');
            if (!t.amount || t.amount <= 0) issues.push('missing or zero amount');
            if (issues.length > 0) {
                incomplete.push({ index: i, name: t.user_name || '(unknown)', amount: t.amount, issues });
            }
        });
        if (incomplete.length > 0) {
            for (const item of incomplete) {
                errors.push(`Target #${item.index + 1} "${item.name}": ${item.issues.join(', ')}.`);
            }
            return { valid: false, errors, warnings, expectedCount, actualCount, detectedNames, missingNames: [], incompleteTargets: incomplete };
        }

        // Check 3: Unresolved users → warning (admin can resolve via dropdown)
        const unresolved = targets.filter(t => !t.resolved);
        if (unresolved.length > 0) {
            warnings.push(
                `${unresolved.length} user(s) could not be auto-matched: ` +
                unresolved.map(t => `"${t.user_name}"`).join(', ') +
                `. Please map them manually before creating.`
            );
        }

        return { valid: true, errors, warnings, expectedCount, actualCount, detectedNames, missingNames: [] };

    } else {
        // Individual mode
        targets.forEach((t, i) => {
            if (!t.amount || t.amount <= 0) {
                errors.push(`Intent #${i + 1} (${t.category_label || 'unknown'}): missing amount.`);
            }
        });
        return {
            valid: errors.length === 0, errors, warnings,
            expectedCount: targets.length, actualCount: targets.length,
            detectedNames: [], missingNames: [],
        };
    }
}

/**
 * Detect distinct "name tokens" in a prompt.
 * Core of the consistency check: count how many distinct people the prompt mentions.
 */
function detectNameTokensInPrompt(prompt, knownUsers) {
    const lower = prompt.toLowerCase();
    const knownFirstNames = knownUsers.map(u => u.name.split(' ')[0].toLowerCase());
    const found = new Set();

    const NON_NAME_WORDS = new Set([
        'food', 'cloud', 'travel', 'education', 'health', 'grocery', 'groceries',
        'shopping', 'entertainment', 'software', 'tools', 'services', 'review',
        'monthly', 'weekly', 'daily', 'quarterly', 'this', 'that', 'their', 'them',
        'with', 'dual', 'approval', 'limit', 'apps', 'delivery', 'budget',
    ]);

    // Strategy A: Known user name mentions (most reliable)
    for (const name of knownFirstNames) {
        if (lower.includes(name)) found.add(name);
    }

    // Strategy B: Capitalized words after "for/to/give/allocate"
    for (const m of prompt.matchAll(/(?:for|to|give|allocate|assign)\s+([A-Z][a-z]{2,})/g)) {
        const c = m[1].toLowerCase();
        if (!NON_NAME_WORDS.has(c)) found.add(c);
    }

    // Strategy C: "NAME gets/receives"
    for (const m of prompt.matchAll(/([A-Z][a-z]{2,})\s+(?:gets?|receives?)/g)) {
        const c = m[1].toLowerCase();
        if (!NON_NAME_WORDS.has(c)) found.add(c);
    }

    // Strategy D: Comma/and-separated name lists
    const listMatch = prompt.match(/(?:for|to)\s+([A-Z][a-z]+(?:\s*,\s*[A-Z][a-z]+)*(?:\s*,?\s*and\s+[A-Z][a-z]+)?)/g);
    if (listMatch) {
        for (const seg of listMatch) {
            const cleaned = seg.replace(/^(?:for|to)\s+/i, '');
            for (const n of cleaned.split(/\s*,\s*|\s+and\s+/i)) {
                const c = n.trim().toLowerCase();
                if (c.length >= 3 && !NON_NAME_WORDS.has(c)) found.add(c);
            }
        }
    }

    return [...found];
}

// ── Category+Amount pair extraction (individual mode) ──
function extractCategoryAmountPairs(text) {
    const pairs = [];

    const pattern = /(?:₹|rs\.?\s?)?([\d,]+k?)\s+(?:for|on|limit\s+(?:for|on)?)\s+([a-zA-Z\s]+?)(?:\s+and\s+|,\s*|\.|\s+this\s+|\s+per\s+|$)/gi;
    for (const m of text.matchAll(pattern)) {
        const amount = parseAmountStr(m[1]);
        const catText = m[2].trim();
        const cats = extractCategories(catText);
        if (cats.length > 0 && amount >= 100) {
            pairs.push({ category: cats[0], amount });
        }
    }
    if (pairs.length > 0) return pairs;

    const categories = extractCategories(text);
    const amounts = extractAmount(text);
    if (categories.length > 1 && amounts.length >= categories.length) {
        for (let i = 0; i < categories.length; i++) {
            pairs.push({ category: categories[i], amount: amounts[i] });
        }
    }

    return pairs;
}

function extractWarningThreshold(text) {
    const match = text.match(/(\d+)\s*%/);
    if (match) {
        const pct = Number(match[1]);
        if (pct > 0 && pct < 100) return pct;
    }
    return 50;
}

// ═══ Export helpers ═══
export { extractMerchants, extractCategories, CATEGORY_VENDOR_TAG_MAP };
