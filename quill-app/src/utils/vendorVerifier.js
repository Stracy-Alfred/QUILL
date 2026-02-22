// ═══════════════════════════════════════
// QUILL Vendor Verification Service (Simulated LLM)
// ═══════════════════════════════════════

// Known legitimate domains/patterns
const KNOWN_DOMAINS = [
    'openai.com', 'anthropic.com', 'github.com', 'huggingface.co',
    'aws.amazon.com', 'google.com', 'microsoft.com', 'notion.so',
    'slack.com', 'figma.com', 'canva.com', 'vercel.com', 'netlify.com',
    'stripe.com', 'razorpay.com', 'swiggy.com', 'zomato.com',
    'flipkart.com', 'amazon.in', 'amazon.com', 'netflix.com',
    'uber.com', 'ola.com', 'makemytrip.com', 'bigbasket.com',
    'atlassian.com', 'jira.com', 'confluence.com', 'zoom.us',
    'dropbox.com', 'twilio.com', 'sendgrid.com', 'mailchimp.com',
    'shopify.com', 'freshworks.com', 'zoho.com', 'hubspot.com',
    'salesforce.com', 'notion.com', 'linear.app', 'loom.com',
    'miro.com', 'airtable.com', 'firebase.google.com',
];

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

function extractDomain(url) {
    if (!url) return null;
    try {
        const u = new URL(url.startsWith('http') ? url : `https://${url}`);
        return u.hostname.replace('www.', '');
    } catch {
        return null;
    }
}

function checkDomainLegitimacy(domain) {
    if (!domain) return { score: 0, reason: 'No website URL provided' };

    // Check exact match
    if (KNOWN_DOMAINS.includes(domain)) {
        return { score: 0.95, reason: 'Domain matches a known legitimate vendor' };
    }

    // Check TLD patterns
    const suspiciousTLDs = ['.xyz', '.tk', '.ml', '.ga', '.cf', '.buzz', '.click'];
    if (suspiciousTLDs.some(tld => domain.endsWith(tld))) {
        return { score: 0.15, reason: 'Domain uses a suspicious top-level domain' };
    }

    // Check for common legitimate TLDs
    const goodTLDs = ['.com', '.io', '.co', '.org', '.so', '.app', '.dev', '.in', '.ai'];
    if (goodTLDs.some(tld => domain.endsWith(tld))) {
        return { score: 0.65, reason: 'Domain uses a standard TLD; manual review recommended' };
    }

    return { score: 0.4, reason: 'Domain format is unusual' };
}

function checkCategoryMatch(category, description) {
    if (!description || !category) return { match: false, score: 0 };

    const keywords = CATEGORY_KEYWORDS[category] || [];
    const lower = description.toLowerCase();
    const matches = keywords.filter(kw => lower.includes(kw));

    if (matches.length >= 2) return { match: true, score: 0.9 };
    if (matches.length === 1) return { match: true, score: 0.7 };

    // Check if description has ANY category keywords
    const allKeywords = Object.values(CATEGORY_KEYWORDS).flat();
    const anyMatch = allKeywords.filter(kw => lower.includes(kw));
    if (anyMatch.length > 0) {
        return { match: false, score: 0.4, reason: 'Description doesn\'t match selected category well' };
    }

    return { match: false, score: 0.3, reason: 'Cannot determine category from description' };
}

function checkNameConsistency(name, domain) {
    if (!domain || !name) return { consistent: false, score: 0.3 };

    const nameClean = name.toLowerCase().replace(/[^a-z0-9]/g, '');
    const domainName = domain.split('.')[0].toLowerCase();

    if (nameClean.includes(domainName) || domainName.includes(nameClean)) {
        return { consistent: true, score: 0.9 };
    }

    // Partial match
    if (nameClean.length > 3 && domainName.includes(nameClean.slice(0, 4))) {
        return { consistent: true, score: 0.7 };
    }

    return { consistent: false, score: 0.4, reason: 'Vendor name doesn\'t match domain' };
}

/**
 * Verify a vendor – simulated LLM/NLP verification
 * @param {{ name: string, website: string, category: string, country: string, description: string }} vendor
 * @returns {Promise<{ status: 'approved'|'needs_manual_review'|'rejected', confidence: number, reasons: string[], normalizedName: string, normalizedCategory: string }>}
 */
export function verifyVendor(vendor) {
    return new Promise((resolve) => {
        // Simulate processing delay
        setTimeout(() => {
            const { name, website, category, description } = vendor;
            const reasons = [];
            let totalScore = 0;
            let checks = 0;

            // 1. Domain check
            const domain = extractDomain(website);
            const domainResult = checkDomainLegitimacy(domain);
            totalScore += domainResult.score;
            checks++;
            if (domainResult.score < 0.5) reasons.push(domainResult.reason);

            // 2. Category match
            const catResult = checkCategoryMatch(category, description);
            totalScore += catResult.score;
            checks++;
            if (!catResult.match && catResult.reason) reasons.push(catResult.reason);

            // 3. Name-domain consistency
            const nameResult = checkNameConsistency(name, domain);
            totalScore += nameResult.score;
            checks++;
            if (!nameResult.consistent && nameResult.reason) reasons.push(nameResult.reason);

            // 4. Description quality
            if (description && description.length > 15) {
                totalScore += 0.8;
            } else if (description && description.length > 5) {
                totalScore += 0.5;
                reasons.push('Description is too short for confident verification');
            } else {
                totalScore += 0.1;
                reasons.push('Missing or very short description');
            }
            checks++;

            // 5. Name quality
            if (name && name.length >= 3 && name.length <= 50 && /^[A-Z]/.test(name)) {
                totalScore += 0.8;
            } else if (name && name.length >= 2) {
                totalScore += 0.5;
            } else {
                totalScore += 0.1;
                reasons.push('Vendor name is too short or improperly formatted');
            }
            checks++;

            const confidence = Math.round((totalScore / checks) * 100) / 100;

            // Normalize
            const normalizedName = name?.trim().replace(/\s+/g, ' ') || 'Unknown';
            const normalizedCategory = category || 'other';

            let status;
            if (confidence >= 0.75) {
                status = 'approved';
                if (reasons.length === 0) reasons.push('All verification checks passed');
            } else if (confidence >= 0.45) {
                status = 'needs_manual_review';
                if (reasons.length === 0) reasons.push('Some checks need manual review');
            } else {
                status = 'rejected';
                if (reasons.length === 0) reasons.push('Vendor information seems invalid or inconsistent');
            }

            resolve({
                status,
                confidence,
                reasons,
                normalizedName,
                normalizedCategory,
            });
        }, 1800); // Simulate LLM processing time
    });
}
