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

function extractAmount(text) {
    // Match patterns like ₹10,000 or 10000 or 10k or Rs 10,000
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
    return [10000]; // default
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

    // Try to extract purpose
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
