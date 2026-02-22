import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { motion } from 'framer-motion';
import { parseBusinessBudgetIntent } from '../utils/intentParser';
import { Sparkles, Wand2, Check, ChevronDown, ChevronUp } from 'lucide-react';

export default function CreateBudgetPage() {
    const { addToast } = useApp();
    const [prompt, setPrompt] = useState('');
    const [parsed, setParsed] = useState(null);
    const [showJson, setShowJson] = useState(false);
    const [loading, setLoading] = useState(false);
    const [activated, setActivated] = useState(false);

    const suggestions = [
        'Create a budget of ₹50,000 for AI tools this month. Only allow vendors OpenAI, Anthropic, GitHub, HuggingFace. Every allocation must be approved by 2 client admins.',
        'Set up ₹2,00,000 cloud budget for AWS with dual admin approval.',
        'Monthly travel budget of ₹30,000 for MakeMyTrip and Uber.',
    ];

    const handleGenerate = () => {
        if (!prompt.trim()) return;
        setLoading(true);
        setActivated(false);
        setTimeout(() => {
            const result = parseBusinessBudgetIntent(prompt);
            setParsed(result);
            setLoading(false);
        }, 1500);
    };

    const handleActivate = () => {
        if (!parsed) return;
        addToast('Budget intent activated successfully!', 'success');
        setActivated(true);
        setTimeout(() => {
            setPrompt('');
            setParsed(null);
            setActivated(false);
        }, 2000);
    };

    return (
        <div className="animate-fade-in">
            <div className="page-header">
                <h1 className="page-header-title">Create Budget Intent</h1>
                <p className="page-header-sub">Define controlled budgets for your team using natural language</p>
            </div>

            <div className="prompt-box">
                <div className="prompt-box-header">
                    <div className="prompt-box-icon"><Sparkles size={18} /></div>
                    <div>
                        <div className="prompt-box-title">AI Budget Builder</div>
                        <div className="prompt-box-subtitle">Describe the budget, allowed vendors, approval rules — QUILL creates the policy</div>
                    </div>
                </div>

                <textarea
                    className="prompt-input"
                    placeholder="e.g., Create a budget of ₹50,000 for AI tools this month. Only allow vendors OpenAI, Anthropic, GitHub, HuggingFace. Every allocation must be approved by 2 client admins."
                    value={prompt}
                    onChange={e => setPrompt(e.target.value)}
                    rows={4}
                />

                <div className="prompt-suggestions">
                    {suggestions.map((s, i) => (
                        <button key={i} className="prompt-suggestion-chip" onClick={() => setPrompt(s)}>
                            {s.length > 60 ? s.slice(0, 60) + '...' : s}
                        </button>
                    ))}
                </div>

                <div className="prompt-actions">
                    <button className="btn btn-primary" onClick={handleGenerate} disabled={!prompt.trim() || loading}>
                        {loading ? (
                            <>
                                <div className="typing-indicator"><span /><span /><span /></div>
                                Generating...
                            </>
                        ) : (
                            <><Wand2 size={16} /> Generate Budget Intent</>
                        )}
                    </button>
                </div>
            </div>

            {parsed && (
                <motion.div
                    className="intent-preview"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 'var(--space-4)' }}>
                        <Check size={18} style={{ color: 'var(--accent-400)' }} />
                        <span style={{ fontWeight: 700, fontSize: 'var(--text-lg)' }}>Budget Intent Generated</span>
                    </div>

                    <div className="intent-preview-summary" style={{ marginBottom: 'var(--space-6)' }}>
                        {parsed.summary}
                    </div>

                    {/* Visual Breakdown */}
                    <div style={{
                        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: 'var(--space-4)', marginBottom: 'var(--space-4)',
                    }}>
                        <div style={{ padding: 'var(--space-4)', background: 'var(--bg-glass)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-secondary)' }}>
                            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginBottom: 4 }}>Total Budget</div>
                            <div style={{ fontWeight: 800, fontSize: 'var(--text-2xl)', color: 'var(--primary-400)' }}>
                                ₹{parsed.totalAmount.toLocaleString()}
                            </div>
                        </div>
                        <div style={{ padding: 'var(--space-4)', background: 'var(--bg-glass)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-secondary)' }}>
                            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginBottom: 4 }}>Category</div>
                            <div style={{ fontWeight: 700 }}>{parsed.category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</div>
                        </div>
                        <div style={{ padding: 'var(--space-4)', background: 'var(--bg-glass)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-secondary)' }}>
                            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginBottom: 4 }}>Approval</div>
                            <div style={{ fontWeight: 700, color: parsed.requiresDualApproval ? 'var(--rupee-gold)' : 'var(--accent-400)' }}>
                                {parsed.requiresDualApproval ? '🔐 Dual Admin' : 'Single Approval'}
                            </div>
                        </div>
                    </div>

                    {parsed.allowedMerchants.length > 0 && (
                        <div style={{ marginBottom: 'var(--space-4)' }}>
                            <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, marginBottom: 8, color: 'var(--text-secondary)' }}>Allowed Vendors</div>
                            <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                                {parsed.allowedMerchants.map(m => (
                                    <span key={m} className="badge badge-info">{m}</span>
                                ))}
                            </div>
                        </div>
                    )}

                    <button className="btn btn-ghost btn-sm" onClick={() => setShowJson(!showJson)} style={{ marginBottom: showJson ? 'var(--space-3)' : 0 }}>
                        {showJson ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        {showJson ? 'Hide' : 'Show'} Technical Policy
                    </button>

                    {showJson && (
                        <pre className="intent-preview-json">{JSON.stringify(parsed.policy, null, 2)}</pre>
                    )}

                    <div className="intent-preview-actions">
                        {activated ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--accent-400)', fontWeight: 700 }}>
                                <Check size={20} /> Budget Intent Activated!
                            </div>
                        ) : (
                            <>
                                <button className="btn btn-primary" onClick={handleActivate}><Check size={16} /> Activate Budget</button>
                                <button className="btn btn-secondary" onClick={() => setParsed(null)}>Discard</button>
                            </>
                        )}
                    </div>
                </motion.div>
            )}
        </div>
    );
}
