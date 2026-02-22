// ═══════════════════════════════════════════════════
// QUILL Vendor Verification Service (Deterministic)
// ═══════════════════════════════════════════════════
//
// Pipeline: Normalize → Heuristic → LLM (simulated) → Deterministic Status
//
// Guarantees:
//   1. Same input always produces the same output (no Math.random).
//   2. "claude.ai", "www.CLaude.ai", "CLAUDE.AI" all resolve identically.
//   3. Results are cached by normalized domain so re-verification is instant.

// ── Known legitimate domains ──
const KNOWN_DOMAINS = new Map([
    ['openai.com', { canonical: 'OpenAI', category: 'ai_ml' }],
    ['anthropic.com', { canonical: 'Anthropic', category: 'ai_ml' }],
    ['claude.ai', { canonical: 'Claude (Anthropic)', category: 'ai_ml' }],
    ['github.com', { canonical: 'GitHub', category: 'developer_tools' }],
    ['huggingface.co', { canonical: 'Hugging Face', category: 'ai_ml' }],
    ['aws.amazon.com', { canonical: 'AWS', category: 'cloud' }],
    ['google.com', { canonical: 'Google', category: 'software' }],
    ['microsoft.com', { canonical: 'Microsoft', category: 'software' }],
    ['notion.so', { canonical: 'Notion', category: 'software' }],
    ['notion.com', { canonical: 'Notion', category: 'software' }],
    ['slack.com', { canonical: 'Slack', category: 'software' }],
    ['figma.com', { canonical: 'Figma', category: 'design' }],
    ['canva.com', { canonical: 'Canva', category: 'design' }],
    ['vercel.com', { canonical: 'Vercel', category: 'cloud' }],
    ['netlify.com', { canonical: 'Netlify', category: 'cloud' }],
    ['stripe.com', { canonical: 'Stripe', category: 'finance' }],
    ['razorpay.com', { canonical: 'Razorpay', category: 'finance' }],
    ['swiggy.com', { canonical: 'Swiggy', category: 'food' }],
    ['zomato.com', { canonical: 'Zomato', category: 'food' }],
    ['flipkart.com', { canonical: 'Flipkart', category: 'shopping' }],
    ['amazon.in', { canonical: 'Amazon India', category: 'shopping' }],
    ['amazon.com', { canonical: 'Amazon', category: 'shopping' }],
    ['netflix.com', { canonical: 'Netflix', category: 'entertainment' }],
    ['uber.com', { canonical: 'Uber', category: 'travel' }],
    ['ola.com', { canonical: 'Ola', category: 'travel' }],
    ['makemytrip.com', { canonical: 'MakeMyTrip', category: 'travel' }],
    ['bigbasket.com', { canonical: 'BigBasket', category: 'food' }],
    ['atlassian.com', { canonical: 'Atlassian', category: 'software' }],
    ['zoom.us', { canonical: 'Zoom', category: 'software' }],
    ['dropbox.com', { canonical: 'Dropbox', category: 'cloud' }],
    ['twilio.com', { canonical: 'Twilio', category: 'software' }],
    ['sendgrid.com', { canonical: 'SendGrid', category: 'software' }],
    ['mailchimp.com', { canonical: 'Mailchimp', category: 'marketing' }],
    ['shopify.com', { canonical: 'Shopify', category: 'shopping' }],
    ['freshworks.com', { canonical: 'Freshworks', category: 'software' }],
    ['zoho.com', { canonical: 'Zoho', category: 'software' }],
    ['hubspot.com', { canonical: 'HubSpot', category: 'marketing' }],
    ['salesforce.com', { canonical: 'Salesforce', category: 'software' }],
    ['linear.app', { canonical: 'Linear', category: 'software' }],
    ['loom.com', { canonical: 'Loom', category: 'software' }],
    ['miro.com', { canonical: 'Miro', category: 'design' }],
    ['airtable.com', { canonical: 'Airtable', category: 'software' }],
    ['midjourney.com', { canonical: 'Midjourney', category: 'ai_ml' }],
    ['firebase.google.com', { canonical: 'Firebase', category: 'cloud' }],
]);

// ── Category keywords for LLM simulation ──
const CATEGORY_KEYWORDS = {
    software: ['saas', 'tool', 'app', 'platform', 'software', 'workspace', 'productivity'],
    food: ['food', 'delivery', 'restaurant', 'dining', 'grocery', 'kitchen'],
    travel: ['travel', 'flight', 'hotel', 'booking', 'ride', 'taxi', 'cab'],
    cloud: ['cloud', 'hosting', 'infrastructure', 'server', 'compute', 'storage'],
    developer_tools: ['code', 'developer', 'programming', 'git', 'ci/cd', 'ide', 'copilot'],
    ai_ml: ['ai', 'machine learning', 'neural', 'llm', 'gpt', 'model', 'inference'],
    design: ['design', 'ui', 'ux', 'graphics', 'image', 'creative', 'mockup'],
    marketing: ['marketing', 'seo', 'analytics', 'ads', 'campaign', 'social media'],
    services: ['consulting', 'service', 'outsource', 'agency', 'freelance'],
    education: ['course', 'learn', 'education', 'training', 'tutorial', 'academy'],
    entertainment: ['stream', 'video', 'music', 'game', 'entertainment', 'media'],
    shopping: ['shop', 'store', 'ecommerce', 'marketplace', 'retail'],
    health: ['health', 'medical', 'pharmacy', 'fitness', 'wellness'],
    finance: ['finance', 'accounting', 'invoice', 'payment', 'banking', 'tax'],
};

const GOOD_TLDS = ['.com', '.io', '.co', '.org', '.so', '.app', '.dev', '.in', '.ai', '.us', '.net'];
const BAD_TLDS = ['.xyz', '.tk', '.ml', '.ga', '.cf', '.buzz', '.click', '.top', '.icu', '.work', '.gq'];
const MAX_SUBDOMAINS = 3; // e.g. a.b.c.example.com → reject

// ═══════════════════════════
// STEP 1 — NORMALIZATION
// ═══════════════════════════

/**
 * Normalize a vendor's raw inputs into a stable, comparable record.
 * This is the FIRST step of the pipeline — everything downstream uses the normalized values.
 */
export function normalizeVendorInput(rawName, rawUrl) {
    // ── Name ──
    const normalizedName = (rawName || '').trim().replace(/\s+/g, ' ');
    const nameKey = normalizedName.toLowerCase().replace(/[^a-z0-9]/g, '');

    // ── URL / Domain ──
    let normalizedDomain = null;
    let inputUrl = (rawUrl || '').trim();

    if (inputUrl) {
        try {
            // Ensure a protocol so URL() can parse it
            const withProto = inputUrl.match(/^https?:\/\//i) ? inputUrl : `https://${inputUrl}`;
            const parsed = new URL(withProto);
            // Strip "www." and lowercase
            normalizedDomain = parsed.hostname.toLowerCase().replace(/^www\./, '');
        } catch {
            // Unparseable — leave null, heuristic check will catch it
            normalizedDomain = null;
        }
    }

    return {
        input_name: rawName,
        input_url: rawUrl,
        normalized_name: normalizedName,
        name_key: nameKey,                                    // lowercase alphanumeric only
        normalized_domain: normalizedDomain,
        domain_root: normalizedDomain?.split('.')[0] || null,    // e.g. "claude"
    };
}

// ═══════════════════════════
// STEP 2 — HEURISTIC CHECKS
// ═══════════════════════════

/**
 * Fast, deterministic, rule-based checks. Returns pass/fail and reason list.
 */
function runHeuristicChecks(norm) {
    const results = { pass: true, reasons: [] };

    // 2a. No domain at all
    if (!norm.normalized_domain) {
        results.reasons.push('No valid website URL provided — unable to verify domain.');
        // Not an outright fail since name-only vendors may be valid, but reduces score
    }

    // 2b. Domain format validation
    if (norm.normalized_domain) {
        // Reject nonsense TLDs
        const hasBadTLD = BAD_TLDS.some(tld => norm.normalized_domain.endsWith(tld));
        if (hasBadTLD) {
            results.pass = false;
            results.reasons.push(`Domain uses a suspicious top-level domain (${norm.normalized_domain.split('.').pop()}).`);
        }

        // Reject too many subdomains (phishing pattern: login.paypal.fakesite.tk)
        const parts = norm.normalized_domain.split('.');
        if (parts.length > MAX_SUBDOMAINS) {
            results.pass = false;
            results.reasons.push('Domain has an unusual number of subdomains — possible phishing.');
        }

        // Check TLD is recognized
        const hasGoodTLD = GOOD_TLDS.some(tld => norm.normalized_domain.endsWith(tld));
        if (!hasGoodTLD && !hasBadTLD) {
            results.reasons.push(`Uncommon TLD (.${parts[parts.length - 1]}); manual review may be needed.`);
        }
    }

    // 2c. Name quality
    if (!norm.normalized_name || norm.name_key.length < 2) {
        results.pass = false;
        results.reasons.push('Vendor name is missing or too short.');
    }

    return results;
}

// ═══════════════════════════
// STEP 3 — SIMULATED LLM CHECK
// ═══════════════════════════

/**
 * Simulates the structured LLM evaluation.
 * In production, this would call an actual LLM endpoint. Here we use deterministic rules
 * that ALWAYS produce the same output for the same normalized input.
 *
 * Returns the structured schema from the spec:
 * { plausible_business_name_match, plausible_domain_for_business, risk_flags, confidence_score, explanation }
 */
function simulateLLMEvaluation(norm, category, description) {
    const riskFlags = [];
    let nameMatch = false;
    let domainPlausible = false;
    let confidenceScore = 0;
    const explanationParts = [];

    // 3a. Known domain shortcut — deterministic, highest confidence
    if (norm.normalized_domain && KNOWN_DOMAINS.has(norm.normalized_domain)) {
        const known = KNOWN_DOMAINS.get(norm.normalized_domain);
        nameMatch = true;
        domainPlausible = true;
        confidenceScore = 0.95;
        explanationParts.push(`Domain ${norm.normalized_domain} is a known, legitimate vendor (${known.canonical}).`);

        // Bonus: if user-selected category matches the known category
        if (category && known.category === category) {
            confidenceScore = 0.97;
            explanationParts.push(`Category "${category.replace(/_/g, ' ')}" matches known vendor classification.`);
        }

        return {
            plausible_business_name_match: nameMatch,
            plausible_domain_for_business: domainPlausible,
            risk_flags: riskFlags,
            confidence_score: confidenceScore,
            explanation: explanationParts.join(' '),
        };
    }

    // 3b. Name ↔ domain consistency check
    if (norm.normalized_domain && norm.name_key) {
        const domainRoot = norm.domain_root;
        if (norm.name_key.includes(domainRoot) || domainRoot.includes(norm.name_key)) {
            nameMatch = true;
            confidenceScore += 0.30;
            explanationParts.push('Vendor name matches the domain root.');
        } else if (norm.name_key.length > 3 && domainRoot.includes(norm.name_key.slice(0, 4))) {
            nameMatch = true;
            confidenceScore += 0.20;
            explanationParts.push('Partial name match detected with domain.');
            riskFlags.push('partial_name_match');
        } else {
            confidenceScore += 0.05;
            explanationParts.push('Vendor name does not match the domain — possible mismatch.');
            riskFlags.push('name_domain_mismatch');
        }
    } else if (norm.name_key && !norm.normalized_domain) {
        // Name only, no domain
        confidenceScore += 0.10;
        explanationParts.push('No domain provided; cannot verify web presence.');
        riskFlags.push('no_domain');
    }

    // 3c. Domain TLD quality
    if (norm.normalized_domain) {
        const hasGoodTLD = GOOD_TLDS.some(tld => norm.normalized_domain.endsWith(tld));
        if (hasGoodTLD) {
            domainPlausible = true;
            confidenceScore += 0.20;
            explanationParts.push('Domain uses a standard, reputable TLD.');
        } else {
            confidenceScore += 0.05;
            explanationParts.push('Domain TLD is uncommon.');
        }
    }

    // 3d. Category ↔ description alignment
    if (description && category) {
        const keywords = CATEGORY_KEYWORDS[category] || [];
        const lower = description.toLowerCase();
        const matchCount = keywords.filter(kw => lower.includes(kw)).length;

        if (matchCount >= 2) {
            confidenceScore += 0.25;
            explanationParts.push(`Description strongly matches the "${category.replace(/_/g, ' ')}" category.`);
        } else if (matchCount === 1) {
            confidenceScore += 0.15;
            explanationParts.push(`Description partially matches the "${category.replace(/_/g, ' ')}" category.`);
        } else {
            confidenceScore += 0.05;
            explanationParts.push('Description does not clearly match the selected category.');
            riskFlags.push('category_mismatch');
        }
    } else if (!description || description.length < 10) {
        confidenceScore += 0.02;
        explanationParts.push('Description is missing or too short for confident verification.');
        riskFlags.push('insufficient_description');
    }

    // 3e. Description quality bonus
    if (description && description.length >= 20) {
        confidenceScore += 0.10;
    }

    // Clamp to [0, 1]
    confidenceScore = Math.round(Math.min(1, Math.max(0, confidenceScore)) * 100) / 100;

    // 3f. Typo-squatting detection (check if domain is suspiciously close to a known domain)
    if (norm.normalized_domain && !KNOWN_DOMAINS.has(norm.normalized_domain)) {
        for (const [knownDomain] of KNOWN_DOMAINS) {
            const knownRoot = knownDomain.split('.')[0];
            const testRoot = norm.domain_root;
            if (testRoot && testRoot !== knownRoot && levenshtein(testRoot, knownRoot) <= 2 && testRoot.length > 3) {
                riskFlags.push(`typo_squatting:${knownDomain}`);
                explanationParts.push(`Domain "${norm.normalized_domain}" is suspiciously similar to known domain "${knownDomain}" — possible typo-squatting.`);
                confidenceScore = Math.max(0, confidenceScore - 0.25);
                break;
            }
        }
    }

    return {
        plausible_business_name_match: nameMatch,
        plausible_domain_for_business: domainPlausible,
        risk_flags: riskFlags,
        confidence_score: Math.round(Math.min(1, Math.max(0, confidenceScore)) * 100) / 100,
        explanation: explanationParts.join(' ') || 'Insufficient data for confident evaluation.',
    };
}

/**
 * Simple Levenshtein distance for typo-squatting detection.
 */
function levenshtein(a, b) {
    const m = a.length, n = b.length;
    const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;
    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            dp[i][j] = a[i - 1] === b[j - 1]
                ? dp[i - 1][j - 1]
                : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
        }
    }
    return dp[m][n];
}

// ═══════════════════════════
// STEP 4 — DETERMINISTIC STATUS
// ═══════════════════════════

/**
 * Map heuristic + LLM results to a final status. No randomness.
 */
function determineStatus(heuristics, llm) {
    // Hard reject if heuristics failed
    if (!heuristics.pass) {
        return 'rejected';
    }

    // LLM-driven thresholds (from spec)
    if (llm.risk_flags.some(f => f.startsWith('typo_squatting'))) {
        return 'rejected';
    }

    if (llm.plausible_business_name_match && llm.plausible_domain_for_business && llm.confidence_score >= 0.8) {
        return 'approved';
    }

    if (llm.confidence_score >= 0.5) {
        return 'needs_manual_review';
    }

    return 'rejected';
}

// ═══════════════════════════
// VERIFICATION CACHE
// ═══════════════════════════

const verificationCache = new Map();

function getCacheKey(norm) {
    // Cache by normalized domain + name key. Identical normalized inputs → identical results.
    return `${norm.normalized_domain || 'nodomain'}__${norm.name_key}`;
}

// ═══════════════════════════
// PUBLIC API
// ═══════════════════════════

/**
 * Verify a vendor — deterministic, evidence-based pipeline.
 *
 * @param {{ name: string, website: string, category: string, country: string, description: string }} vendor
 * @returns {Promise<{
 *   status: 'approved'|'needs_manual_review'|'rejected',
 *   confidence: number,
 *   reasons: string[],
 *   explanation: string,
 *   normalizedName: string,
 *   normalizedDomain: string|null,
 *   normalizedCategory: string,
 *   llmOutput: object,
 *   heuristicsPassed: boolean,
 *   fromCache: boolean
 * }>}
 */
export function verifyVendor(vendor) {
    return new Promise((resolve) => {
        const { name, website, category, description } = vendor;

        // STEP 1: Normalize
        const norm = normalizeVendorInput(name, website);
        const cacheKey = getCacheKey(norm);

        // Check cache
        if (verificationCache.has(cacheKey)) {
            const cached = verificationCache.get(cacheKey);
            // Resolve immediately (no delay) for cached results
            resolve({ ...cached, fromCache: true });
            return;
        }

        // Simulate LLM processing delay (only on first verification)
        setTimeout(() => {
            // STEP 2: Heuristic checks
            const heuristics = runHeuristicChecks(norm);

            // STEP 3: LLM evaluation (simulated)
            const llm = simulateLLMEvaluation(norm, category, description);

            // STEP 4: Deterministic status
            const status = determineStatus(heuristics, llm);

            // Build reasons list
            const reasons = [...heuristics.reasons];
            if (llm.risk_flags.length > 0) {
                for (const flag of llm.risk_flags) {
                    if (flag.startsWith('typo_squatting')) {
                        reasons.push(`⚠️ Possible typo-squatting detected (similar to ${flag.split(':')[1]}).`);
                    } else if (flag === 'name_domain_mismatch') {
                        reasons.push('Vendor name does not closely match the website domain.');
                    } else if (flag === 'category_mismatch') {
                        reasons.push('Description does not clearly match the selected category.');
                    } else if (flag === 'no_domain') {
                        reasons.push('No website URL was provided for verification.');
                    } else if (flag === 'insufficient_description') {
                        reasons.push('Description is too short for confident verification.');
                    }
                }
            }

            if (status === 'approved' && reasons.length === 0) {
                reasons.push('All verification checks passed. Domain and name are consistent.');
            }
            if (status === 'needs_manual_review' && reasons.length === 0) {
                reasons.push('Some checks need human review before approval.');
            }

            // Summary explanation
            const explanation = llm.explanation;

            // Normalized category — prefer known domain category if matched
            let normalizedCategory = category || 'other';
            if (norm.normalized_domain && KNOWN_DOMAINS.has(norm.normalized_domain)) {
                const knownCat = KNOWN_DOMAINS.get(norm.normalized_domain).category;
                normalizedCategory = knownCat || normalizedCategory;
            }

            const result = {
                status,
                confidence: llm.confidence_score,
                reasons,
                explanation,
                normalizedName: norm.normalized_name || 'Unknown',
                normalizedDomain: norm.normalized_domain,
                normalizedCategory,
                llmOutput: llm,
                heuristicsPassed: heuristics.pass,
                fromCache: false,
            };

            // Cache the result
            verificationCache.set(cacheKey, result);

            resolve(result);
        }, 1600);
    });
}

/**
 * Clear the verification cache (for testing or admin reset).
 */
export function clearVerificationCache() {
    verificationCache.clear();
}

export { KNOWN_DOMAINS, CATEGORY_KEYWORDS, normalizeVendorInput as _normalizeForTest };
