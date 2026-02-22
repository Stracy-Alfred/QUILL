// ═══════════════════════════════════════
// QUILL Mock Data Store
// ═══════════════════════════════════════

export const MERCHANT_CATEGORIES = {
    food_delivery: { label: 'Food Delivery', icon: '🍔', color: '#f97316' },
    grocery: { label: 'Grocery', icon: '🛒', color: '#22c55e' },
    shopping: { label: 'Shopping', icon: '🛍️', color: '#ec4899' },
    travel: { label: 'Travel', icon: '✈️', color: '#3b82f6' },
    entertainment: { label: 'Entertainment', icon: '🎬', color: '#a855f7' },
    ai_subscription: { label: 'AI Tools', icon: '🤖', color: '#6366f1' },
    developer_tool: { label: 'Dev Tools', icon: '💻', color: '#14b8a6' },
    cloud: { label: 'Cloud Services', icon: '☁️', color: '#0ea5e9' },
    education: { label: 'Education', icon: '📚', color: '#f59e0b' },
    health: { label: 'Health', icon: '💊', color: '#ef4444' },
};

export const MERCHANTS = {
    SWIGGY: { name: 'Swiggy', category: 'food_delivery', upi: 'swiggy@upi', logo: '🧡' },
    ZOMATO: { name: 'Zomato', category: 'food_delivery', upi: 'zomato@upi', logo: '❤️' },
    AMAZON: { name: 'Amazon', category: 'shopping', upi: 'amazon@upi', logo: '📦' },
    FLIPKART: { name: 'Flipkart', category: 'shopping', upi: 'flipkart@upi', logo: '🛒' },
    OPENAI: { name: 'OpenAI', category: 'ai_subscription', upi: 'openai@pay', logo: '🤖' },
    ANTHROPIC: { name: 'Anthropic', category: 'ai_subscription', upi: 'anthropic@pay', logo: '🧠' },
    GITHUB: { name: 'GitHub', category: 'developer_tool', upi: 'github@pay', logo: '🐙' },
    HUGGINGFACE: { name: 'HuggingFace', category: 'ai_subscription', upi: 'hf@pay', logo: '🤗' },
    AWS: { name: 'AWS', category: 'cloud', upi: 'aws@pay', logo: '☁️' },
    MAKEMYTRIP: { name: 'MakeMyTrip', category: 'travel', upi: 'mmt@upi', logo: '✈️' },
    NETFLIX: { name: 'Netflix', category: 'entertainment', upi: 'netflix@pay', logo: '🎬' },
    UBER: { name: 'Uber', category: 'travel', upi: 'uber@upi', logo: '🚗' },
    BIGBASKET: { name: 'BigBasket', category: 'grocery', upi: 'bb@upi', logo: '🥦' },
};

export const INDIVIDUAL_INTENTS = [
    {
        id: 'INT001',
        title: 'Swiggy/Zomato Monthly Cap',
        description: 'Cap food delivery spending at ₹10,000 per month',
        type: 'spending_limit',
        status: 'active',
        merchants: ['SWIGGY', 'ZOMATO'],
        categories: ['food_delivery'],
        monthlyCap: 10000,
        warningThreshold: 5000,
        currentSpend: 6200,
        period: 'monthly',
        actions: {
            below_warning: 'allow',
            warning_to_cap: 'warn_and_allow',
            above_cap: 'block',
        },
        createdAt: '2026-02-01T10:00:00',
        transactions: [
            { id: 'TXN001', merchant: 'SWIGGY', amount: 450, date: '2026-02-03', status: 'allowed', desc: 'Dinner order' },
            { id: 'TXN002', merchant: 'ZOMATO', amount: 680, date: '2026-02-05', status: 'allowed', desc: 'Family lunch' },
            { id: 'TXN003', merchant: 'SWIGGY', amount: 320, date: '2026-02-07', status: 'allowed', desc: 'Breakfast' },
            { id: 'TXN004', merchant: 'SWIGGY', amount: 890, date: '2026-02-09', status: 'allowed', desc: 'Weekend order' },
            { id: 'TXN005', merchant: 'ZOMATO', amount: 1200, date: '2026-02-11', status: 'allowed', desc: 'Party order' },
            { id: 'TXN006', merchant: 'SWIGGY', amount: 560, date: '2026-02-14', status: 'warned', desc: 'Valentine dinner' },
            { id: 'TXN007', merchant: 'ZOMATO', amount: 780, date: '2026-02-16', status: 'warned', desc: 'Weekend brunch' },
            { id: 'TXN008', merchant: 'SWIGGY', amount: 1320, date: '2026-02-19', status: 'warned', desc: 'Office lunch' },
        ],
    },
    {
        id: 'INT002',
        title: 'Amazon Shopping Tracker',
        description: 'Track shopping on Amazon with ₹15,000 monthly limit',
        type: 'spending_limit',
        status: 'active',
        merchants: ['AMAZON'],
        categories: ['shopping'],
        monthlyCap: 15000,
        warningThreshold: 10000,
        currentSpend: 4500,
        period: 'monthly',
        actions: {
            below_warning: 'allow',
            warning_to_cap: 'warn_and_allow',
            above_cap: 'block',
        },
        createdAt: '2026-02-01T10:00:00',
        transactions: [
            { id: 'TXN010', merchant: 'AMAZON', amount: 2500, date: '2026-02-02', status: 'allowed', desc: 'Electronics purchase' },
            { id: 'TXN011', merchant: 'AMAZON', amount: 2000, date: '2026-02-15', status: 'allowed', desc: 'Books and accessories' },
        ],
    },
    {
        id: 'INT003',
        title: 'Entertainment Budget',
        description: 'Entertainment spending capped at ₹3,000/month',
        type: 'spending_limit',
        status: 'active',
        merchants: ['NETFLIX'],
        categories: ['entertainment'],
        monthlyCap: 3000,
        warningThreshold: 2000,
        currentSpend: 799,
        period: 'monthly',
        actions: {
            below_warning: 'allow',
            warning_to_cap: 'warn_and_allow',
            above_cap: 'block',
        },
        createdAt: '2026-02-01T10:00:00',
        transactions: [
            { id: 'TXN020', merchant: 'NETFLIX', amount: 799, date: '2026-02-01', status: 'allowed', desc: 'Monthly subscription' },
        ],
    },
];

export const INDIVIDUAL_SPENDING_TIMELINE = [
    { day: 'Feb 1', food: 0, shopping: 0, entertainment: 799, travel: 0 },
    { day: 'Feb 3', food: 450, shopping: 2500, entertainment: 0, travel: 0 },
    { day: 'Feb 5', food: 680, shopping: 0, entertainment: 0, travel: 500 },
    { day: 'Feb 7', food: 320, shopping: 0, entertainment: 0, travel: 0 },
    { day: 'Feb 9', food: 890, shopping: 0, entertainment: 0, travel: 0 },
    { day: 'Feb 11', food: 1200, shopping: 0, entertainment: 0, travel: 0 },
    { day: 'Feb 14', food: 560, shopping: 0, entertainment: 0, travel: 1200 },
    { day: 'Feb 15', food: 0, shopping: 2000, entertainment: 0, travel: 0 },
    { day: 'Feb 16', food: 780, shopping: 0, entertainment: 0, travel: 0 },
    { day: 'Feb 19', food: 1320, shopping: 0, entertainment: 0, travel: 0 },
];

export const CATEGORY_SPENDING = [
    { name: 'Food', value: 6200, color: '#f97316' },
    { name: 'Shopping', value: 4500, color: '#ec4899' },
    { name: 'Travel', value: 1700, color: '#3b82f6' },
    { name: 'Entertainment', value: 799, color: '#a855f7' },
    { name: 'Grocery', value: 2100, color: '#22c55e' },
];

// ═══ Business Data ═══

export const BUSINESS_PROFILE = {
    name: 'NxtGen Solutions Pvt Ltd',
    sector: 'Technology',
    size: '11-20',
    monthlyBudget: 500000,
    allocated: 350000,
    used: 185000,
};

export const CLIENT_ADMINS = [
    { id: 'CA001', name: 'Danio Stracy', email: 'danio@nxtgen.io', role: 'CEO', avatar: 'DS' },
    { id: 'CA002', name: 'Priya Sharma', email: 'priya@nxtgen.io', role: 'CFO', avatar: 'PS' },
    { id: 'CA003', name: 'Arjun Mehta', email: 'arjun@nxtgen.io', role: 'CTO', avatar: 'AM' },
];

export const BUSINESS_USERS = [
    { id: 'BU001', name: 'Rahul Verma', email: 'rahul@nxtgen.io', dept: 'Engineering', avatar: 'RV' },
    { id: 'BU002', name: 'Sneha Iyer', email: 'sneha@nxtgen.io', dept: 'Product', avatar: 'SI' },
    { id: 'BU003', name: 'Karan Patel', email: 'karan@nxtgen.io', dept: 'Design', avatar: 'KP' },
    { id: 'BU004', name: 'Aisha Khan', email: 'aisha@nxtgen.io', dept: 'Marketing', avatar: 'AK' },
    { id: 'BU005', name: 'Vikram Singh', email: 'vikram@nxtgen.io', dept: 'Engineering', avatar: 'VS' },
];

export const BUSINESS_BUDGETS = [
    {
        id: 'BUD001',
        title: 'AI Tool Subscriptions',
        totalAmount: 100000,
        allocated: 54000,
        used: 38900,
        category: 'ai_subscription',
        allowedMerchants: ['OPENAI', 'ANTHROPIC', 'GITHUB', 'HUGGINGFACE'],
        requiresDualApproval: true,
        status: 'active',
        period: 'monthly',
        allocations: [
            {
                id: 'ALLOC001', userId: 'BU001', userName: 'Rahul Verma',
                amount: 20000, used: 15900, purpose: 'ChatGPT Team + GitHub Copilot',
                status: 'approved', approvals: ['CA001', 'CA002'], approvalCount: 2,
                transactions: [
                    { id: 'BTX001', merchant: 'OPENAI', amount: 3900, date: '2026-02-05', desc: 'ChatGPT Team monthly', status: 'on_intent' },
                    { id: 'BTX002', merchant: 'GITHUB', amount: 12000, date: '2026-02-06', desc: 'GitHub Copilot annual', status: 'on_intent' },
                ],
            },
            {
                id: 'ALLOC002', userId: 'BU002', userName: 'Sneha Iyer',
                amount: 15000, used: 7800, purpose: 'Anthropic Claude Pro for product research',
                status: 'approved', approvals: ['CA001', 'CA003'], approvalCount: 2,
                transactions: [
                    { id: 'BTX003', merchant: 'ANTHROPIC', amount: 3900, date: '2026-02-08', desc: 'Claude Pro monthly', status: 'on_intent' },
                    { id: 'BTX004', merchant: 'OPENAI', amount: 3900, date: '2026-02-10', desc: 'ChatGPT Plus monthly', status: 'on_intent' },
                ],
            },
            {
                id: 'ALLOC003', userId: 'BU005', userName: 'Vikram Singh',
                amount: 19000, used: 15200, purpose: 'HuggingFace Pro + GitHub Copilot',
                status: 'approved', approvals: ['CA002', 'CA003'], approvalCount: 2,
                transactions: [
                    { id: 'BTX005', merchant: 'HUGGINGFACE', amount: 3200, date: '2026-02-12', desc: 'HuggingFace Pro', status: 'on_intent' },
                    { id: 'BTX006', merchant: 'GITHUB', amount: 12000, date: '2026-02-13', desc: 'GitHub Copilot annual', status: 'on_intent' },
                ],
            },
        ],
    },
    {
        id: 'BUD002',
        title: 'Cloud Infrastructure',
        totalAmount: 200000,
        allocated: 150000,
        used: 95000,
        category: 'cloud',
        allowedMerchants: ['AWS'],
        requiresDualApproval: true,
        status: 'active',
        period: 'monthly',
        allocations: [
            {
                id: 'ALLOC004', userId: 'BU001', userName: 'Rahul Verma',
                amount: 80000, used: 52000, purpose: 'Production AWS infrastructure',
                status: 'approved', approvals: ['CA001', 'CA003'], approvalCount: 2,
                transactions: [
                    { id: 'BTX007', merchant: 'AWS', amount: 52000, date: '2026-02-01', desc: 'Monthly AWS bill', status: 'on_intent' },
                ],
            },
            {
                id: 'ALLOC005', userId: 'BU005', userName: 'Vikram Singh',
                amount: 70000, used: 43000, purpose: 'Development & staging environments',
                status: 'approved', approvals: ['CA001', 'CA002'], approvalCount: 2,
                transactions: [
                    { id: 'BTX008', merchant: 'AWS', amount: 43000, date: '2026-02-01', desc: 'Dev environment charges', status: 'on_intent' },
                ],
            },
        ],
    },
];

export const PENDING_REQUESTS = [
    {
        id: 'REQ001',
        userId: 'BU003',
        userName: 'Karan Patel',
        userAvatar: 'KP',
        amount: 4000,
        purpose: 'Midjourney subscription for design team',
        budgetId: 'BUD001',
        budgetTitle: 'AI Tool Subscriptions',
        category: 'ai_subscription',
        status: 'pending',
        approvalCount: 0,
        approvals: [],
        createdAt: '2026-02-21T14:30:00',
        justification: 'Need Midjourney for client presentation assets and product mockups',
    },
    {
        id: 'REQ002',
        userId: 'BU004',
        userName: 'Aisha Khan',
        userAvatar: 'AK',
        amount: 8000,
        purpose: 'ChatGPT Team for marketing content generation',
        budgetId: 'BUD001',
        budgetTitle: 'AI Tool Subscriptions',
        category: 'ai_subscription',
        status: 'pending_second_approval',
        approvalCount: 1,
        approvals: ['CA001'],
        createdAt: '2026-02-20T11:00:00',
        justification: 'We need AI assistance for campaign copy and social media content',
    },
];

export const NOTIFICATIONS = [
    {
        id: 'N001',
        type: 'warning',
        title: 'Spending Alert',
        message: 'You\'ve reached 62% of your Swiggy/Zomato limit (₹6,200 of ₹10,000)',
        time: '2 hours ago',
        read: false,
        forRole: 'individual',
    },
    {
        id: 'N002',
        type: 'info',
        title: 'New Allocation Request',
        message: 'Karan Patel requested ₹4,000 from AI Tool Subscriptions for Midjourney',
        time: '5 hours ago',
        read: false,
        forRole: 'admin',
    },
    {
        id: 'N003',
        type: 'success',
        title: 'Allocation Approved',
        message: 'Aisha Khan\'s ChatGPT Team request received first approval from CEO',
        time: '1 day ago',
        read: true,
        forRole: 'admin',
    },
    {
        id: 'N004',
        type: 'warning',
        title: 'Budget Alert',
        message: 'AI Tool Subscriptions budget is 54% allocated (₹54,000 of ₹1,00,000)',
        time: '1 day ago',
        read: true,
        forRole: 'admin',
    },
    {
        id: 'N005',
        type: 'blocked',
        title: 'Transaction Blocked',
        message: 'Off-intent purchase attempt by Rahul Verma at Netflix – not in AI Tools allowed list',
        time: '2 days ago',
        read: true,
        forRole: 'admin',
    },
];

// ═══ Budget Usage Over Time (for charts) ═══
export const BUDGET_USAGE_TIMELINE = [
    { week: 'Week 1', aiTools: 7800, cloud: 52000, total: 59800 },
    { week: 'Week 2', aiTools: 19600, cloud: 72000, total: 91600 },
    { week: 'Week 3', aiTools: 34700, cloud: 85000, total: 119700 },
    { week: 'Week 4', aiTools: 38900, cloud: 95000, total: 133900 },
];

export const BUSINESS_SPENDING_BY_USER = [
    { name: 'Rahul V.', aiTools: 15900, cloud: 52000 },
    { name: 'Sneha I.', aiTools: 7800, cloud: 0 },
    { name: 'Vikram S.', aiTools: 15200, cloud: 43000 },
];

// ═══ Vendor Registry ═══

export const VENDOR_CATEGORIES = [
    'software', 'food', 'travel', 'cloud', 'developer_tools',
    'ai_ml', 'design', 'marketing', 'services', 'education',
    'entertainment', 'shopping', 'health', 'finance', 'other',
];

export const INITIAL_VENDORS = [
    {
        id: 'V001', name: 'OpenAI', website: 'https://openai.com', category: 'ai_ml',
        country: 'USA', description: 'AI research company, maker of ChatGPT and GPT APIs',
        status: 'verified', confidence: 0.97, addedBy: 'system', addedByName: 'System',
        usedInIntents: 3, merchantKey: 'OPENAI', createdAt: '2026-01-15T10:00:00',
    },
    {
        id: 'V002', name: 'Anthropic', website: 'https://anthropic.com', category: 'ai_ml',
        country: 'USA', description: 'AI safety company building Claude assistant',
        status: 'verified', confidence: 0.95, addedBy: 'system', addedByName: 'System',
        usedInIntents: 2, merchantKey: 'ANTHROPIC', createdAt: '2026-01-15T10:00:00',
    },
    {
        id: 'V003', name: 'GitHub', website: 'https://github.com', category: 'developer_tools',
        country: 'USA', description: 'Code hosting and collaboration platform, offers Copilot AI',
        status: 'verified', confidence: 0.99, addedBy: 'system', addedByName: 'System',
        usedInIntents: 2, merchantKey: 'GITHUB', createdAt: '2026-01-15T10:00:00',
    },
    {
        id: 'V004', name: 'HuggingFace', website: 'https://huggingface.co', category: 'ai_ml',
        country: 'USA', description: 'Open-source ML model hub and inference platform',
        status: 'verified', confidence: 0.93, addedBy: 'system', addedByName: 'System',
        usedInIntents: 1, merchantKey: 'HUGGINGFACE', createdAt: '2026-01-15T10:00:00',
    },
    {
        id: 'V005', name: 'Swiggy', website: 'https://swiggy.com', category: 'food',
        country: 'India', description: 'Food delivery and instant commerce platform',
        status: 'verified', confidence: 0.98, addedBy: 'system', addedByName: 'System',
        usedInIntents: 1, merchantKey: 'SWIGGY', createdAt: '2026-01-15T10:00:00',
    },
    {
        id: 'V006', name: 'Zomato', website: 'https://zomato.com', category: 'food',
        country: 'India', description: 'Food delivery and restaurant discovery platform',
        status: 'verified', confidence: 0.98, addedBy: 'system', addedByName: 'System',
        usedInIntents: 1, merchantKey: 'ZOMATO', createdAt: '2026-01-15T10:00:00',
    },
    {
        id: 'V007', name: 'AWS', website: 'https://aws.amazon.com', category: 'cloud',
        country: 'USA', description: 'Amazon Web Services cloud computing platform',
        status: 'verified', confidence: 0.99, addedBy: 'system', addedByName: 'System',
        usedInIntents: 1, merchantKey: 'AWS', createdAt: '2026-01-15T10:00:00',
    },
    {
        id: 'V008', name: 'Notion', website: 'https://notion.so', category: 'software',
        country: 'USA', description: 'Team workspace and notes collaboration tool',
        status: 'pending_review', confidence: 0.82, addedBy: 'BU003', addedByName: 'Karan Patel',
        usedInIntents: 0, merchantKey: null, createdAt: '2026-02-20T16:00:00',
    },
    {
        id: 'V009', name: 'QuickBooksIndia', website: '', category: 'finance',
        country: 'India', description: 'accounting software for invoicing',
        status: 'rejected', confidence: 0.31, addedBy: 'BU004', addedByName: 'Aisha Khan',
        usedInIntents: 0, merchantKey: null, createdAt: '2026-02-18T09:00:00',
        rejectionReason: 'No website provided; vendor name doesn\'t match known entities. Please verify and resubmit with a valid URL.',
    },
];

// ═══ Activity Logs ═══

export const ACTIVITY_LOGS = [
    // Intent logs
    { id: 'LOG001', type: 'intent', action: 'created', timestamp: '2026-02-01T10:00:00', userId: 'individual', userName: 'You', details: 'Created intent "Swiggy/Zomato Monthly Cap" – ₹10,000/month cap', intentId: 'INT001' },
    { id: 'LOG002', type: 'intent', action: 'created', timestamp: '2026-02-01T10:05:00', userId: 'individual', userName: 'You', details: 'Created intent "Amazon Shopping Tracker" – ₹15,000/month cap', intentId: 'INT002' },
    { id: 'LOG003', type: 'intent', action: 'created', timestamp: '2026-02-01T10:10:00', userId: 'individual', userName: 'You', details: 'Created intent "Entertainment Budget" – ₹3,000/month cap', intentId: 'INT003' },

    // Transaction logs
    { id: 'LOG004', type: 'transaction', action: 'allowed', timestamp: '2026-02-03T12:30:00', userId: 'individual', userName: 'You', details: 'Swiggy – ₹450 – Dinner order', merchant: 'SWIGGY', amount: 450, outcome: 'allowed', intentId: 'INT001' },
    { id: 'LOG005', type: 'transaction', action: 'allowed', timestamp: '2026-02-05T13:15:00', userId: 'individual', userName: 'You', details: 'Zomato – ₹680 – Family lunch', merchant: 'ZOMATO', amount: 680, outcome: 'allowed', intentId: 'INT001' },
    { id: 'LOG006', type: 'transaction', action: 'allowed', timestamp: '2026-02-07T08:45:00', userId: 'individual', userName: 'You', details: 'Swiggy – ₹320 – Breakfast', merchant: 'SWIGGY', amount: 320, outcome: 'allowed', intentId: 'INT001' },
    { id: 'LOG007', type: 'transaction', action: 'allowed', timestamp: '2026-02-09T19:00:00', userId: 'individual', userName: 'You', details: 'Swiggy – ₹890 – Weekend order', merchant: 'SWIGGY', amount: 890, outcome: 'allowed', intentId: 'INT001' },
    { id: 'LOG008', type: 'transaction', action: 'warned', timestamp: '2026-02-14T20:30:00', userId: 'individual', userName: 'You', details: 'Swiggy – ₹560 – Valentine dinner (warning: 56% of limit)', merchant: 'SWIGGY', amount: 560, outcome: 'warn_and_allow', intentId: 'INT001' },
    { id: 'LOG009', type: 'transaction', action: 'warned', timestamp: '2026-02-16T12:00:00', userId: 'individual', userName: 'You', details: 'Zomato – ₹780 – Weekend brunch (warning: 64% of limit)', merchant: 'ZOMATO', amount: 780, outcome: 'warn_and_allow', intentId: 'INT001' },
    { id: 'LOG010', type: 'transaction', action: 'allowed', timestamp: '2026-02-02T10:00:00', userId: 'individual', userName: 'You', details: 'Amazon – ₹2,500 – Electronics purchase', merchant: 'AMAZON', amount: 2500, outcome: 'allowed', intentId: 'INT002' },
    { id: 'LOG011', type: 'transaction', action: 'allowed', timestamp: '2026-02-01T00:01:00', userId: 'individual', userName: 'You', details: 'Netflix – ₹799 – Monthly subscription', merchant: 'NETFLIX', amount: 799, outcome: 'allowed', intentId: 'INT003' },

    // Vendor logs
    { id: 'LOG012', type: 'vendor', action: 'added', timestamp: '2026-02-20T16:00:00', userId: 'BU003', userName: 'Karan Patel', details: 'Suggested vendor "Notion" (software) – pending review, confidence: 82%' },
    { id: 'LOG013', type: 'vendor', action: 'rejected', timestamp: '2026-02-18T09:05:00', userId: 'system', userName: 'QUILL Verifier', details: 'Vendor "QuickBooksIndia" rejected – no URL, name mismatch, confidence: 31%' },

    // Business request logs
    { id: 'LOG014', type: 'request', action: 'submitted', timestamp: '2026-02-21T14:30:00', userId: 'BU003', userName: 'Karan Patel', details: 'Requested ₹4,000 from AI Tool Subscriptions for Midjourney', requestId: 'REQ001' },
    { id: 'LOG015', type: 'request', action: 'submitted', timestamp: '2026-02-20T11:00:00', userId: 'BU004', userName: 'Aisha Khan', details: 'Requested ₹8,000 from AI Tool Subscriptions for ChatGPT Team', requestId: 'REQ002' },
    { id: 'LOG016', type: 'request', action: 'approved', timestamp: '2026-02-20T14:00:00', userId: 'CA001', userName: 'Danio Stracy', details: 'First approval for Aisha Khan\'s ChatGPT Team request (₹8,000)', requestId: 'REQ002' },

    // Business transaction logs
    { id: 'LOG017', type: 'transaction', action: 'allowed', timestamp: '2026-02-05T10:00:00', userId: 'BU001', userName: 'Rahul Verma', details: 'OpenAI – ₹3,900 – ChatGPT Team monthly', merchant: 'OPENAI', amount: 3900, outcome: 'allowed', budgetId: 'BUD001', onIntent: true },
    { id: 'LOG018', type: 'transaction', action: 'allowed', timestamp: '2026-02-06T11:00:00', userId: 'BU001', userName: 'Rahul Verma', details: 'GitHub – ₹12,000 – GitHub Copilot annual', merchant: 'GITHUB', amount: 12000, outcome: 'allowed', budgetId: 'BUD001', onIntent: true },
    { id: 'LOG019', type: 'transaction', action: 'blocked', timestamp: '2026-02-07T15:30:00', userId: 'BU001', userName: 'Rahul Verma', details: 'Netflix – ₹499 – BLOCKED: merchant not in AI Tools allowed list', merchant: 'NETFLIX', amount: 499, outcome: 'blocked', budgetId: 'BUD001', onIntent: false },
    { id: 'LOG020', type: 'transaction', action: 'allowed', timestamp: '2026-02-08T09:00:00', userId: 'BU002', userName: 'Sneha Iyer', details: 'Anthropic – ₹3,900 – Claude Pro monthly', merchant: 'ANTHROPIC', amount: 3900, outcome: 'allowed', budgetId: 'BUD001', onIntent: true },
    { id: 'LOG021', type: 'transaction', action: 'allowed', timestamp: '2026-02-01T08:00:00', userId: 'BU001', userName: 'Rahul Verma', details: 'AWS – ₹52,000 – Monthly AWS bill', merchant: 'AWS', amount: 52000, outcome: 'allowed', budgetId: 'BUD002', onIntent: true },
];
