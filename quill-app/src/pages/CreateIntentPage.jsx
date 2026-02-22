import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { motion } from 'framer-motion';
import { parseIndividualIntent } from '../utils/intentParser';
import { Sparkles, Wand2, Check, ChevronDown, ChevronUp } from 'lucide-react';

export default function CreateIntentPage() {
    const { createIntent } = useApp();
    const [prompt, setPrompt] = useState('');
    const [parsed, setParsed] = useState(null);
    const [showJson, setShowJson] = useState(false);
    const [loading, setLoading] = useState(false);
    const [activated, setActivated] = useState(false);

    const suggestions = [
        'Set a monthly limit of ₹10,000 for Swiggy and Zomato.',
        'Warn me when I\'ve spent ₹5,000 on Amazon this month.',
        'Block Netflix if I spend more than ₹1,000 per month.',
        'Cap food delivery spending at ₹8,000 weekly.',
    ];

    const handleGenerate = () => {
        if (!prompt.trim()) return;
        setLoading(true);
        setActivated(false);
        // Simulate LLM processing time
        setTimeout(() => {
            const result = parseIndividualIntent(prompt);
            setParsed(result);
            setLoading(false);
        }, 1200);
    };

    const handleActivate = () => {
        if (!parsed) return;
        createIntent(parsed);
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
                <h1 className="page-header-title">Create Intent</h1>
                <p className="page-header-sub">Describe how you want your money to behave — in plain English</p>
            </div>

            {/* Prompt Box */}
            <div className="prompt-box">
                <div className="prompt-box-header">
                    <div className="prompt-box-icon">
                        <Sparkles size={18} />
                    </div>
                    <div>
                        <div className="prompt-box-title">AI Intent Builder</div>
                        <div className="prompt-box-subtitle">Type your spending rule naturally — QUILL will parse it into a smart intent</div>
                    </div>
                </div>

                <textarea
                    className="prompt-input"
                    placeholder="e.g., Set a monthly limit of ₹10,000 for Swiggy and Zomato. Warn me at ₹5,000."
                    value={prompt}
                    onChange={e => setPrompt(e.target.value)}
                    rows={3}
                />

                <div className="prompt-suggestions">
                    {suggestions.map((s, i) => (
                        <button
                            key={i}
                            className="prompt-suggestion-chip"
                            onClick={() => setPrompt(s)}
                        >
                            {s}
                        </button>
                    ))}
                </div>

                <div className="prompt-actions">
                    <button
                        className="btn btn-primary"
                        onClick={handleGenerate}
                        disabled={!prompt.trim() || loading}
                    >
                        {loading ? (
                            <>
                                <div className="typing-indicator">
                                    <span /><span /><span />
                                </div>
                                Parsing...
                            </>
                        ) : (
                            <>
                                <Wand2 size={16} /> Generate Intent
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Generated Preview */}
            {parsed && (
                <motion.div
                    className="intent-preview"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 'var(--space-4)' }}>
                        <Check size={18} style={{ color: 'var(--accent-400)' }} />
                        <span style={{ fontWeight: 700, fontSize: 'var(--text-lg)' }}>Intent Generated</span>
                    </div>

                    <div className="intent-preview-summary">
                        {parsed.summary}
                    </div>

                    {/* Visual breakdown */}
                    <div style={{
                        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                        gap: 'var(--space-4)', marginBottom: 'var(--space-4)',
                    }}>
                        {parsed.policy.actions.map((action, i) => (
                            <div key={i} style={{
                                padding: 'var(--space-4)',
                                background: 'var(--bg-glass)',
                                borderRadius: 'var(--radius-lg)',
                                border: '1px solid var(--border-secondary)',
                            }}>
                                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginBottom: 4 }}>
                                    {action.condition}
                                </div>
                                <div style={{
                                    fontWeight: 700,
                                    color: action.action === 'Allow' ? 'var(--accent-400)' :
                                        action.action === 'Warn & Allow' ? 'var(--warning-400)' : 'var(--danger-400)',
                                }}>
                                    {action.action === 'Allow' ? '✅' : action.action === 'Warn & Allow' ? '⚠️' : '🚫'} {action.action}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* JSON toggle */}
                    <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => setShowJson(!showJson)}
                        style={{ marginBottom: showJson ? 'var(--space-3)' : 0 }}
                    >
                        {showJson ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        {showJson ? 'Hide' : 'Show'} Technical Policy
                    </button>

                    {showJson && (
                        <pre className="intent-preview-json">
                            {JSON.stringify(parsed.policy, null, 2)}
                        </pre>
                    )}

                    <div className="intent-preview-actions">
                        {activated ? (
                            <div style={{
                                display: 'flex', alignItems: 'center', gap: 8,
                                color: 'var(--accent-400)', fontWeight: 700,
                            }}>
                                <Check size={20} /> Intent Activated Successfully!
                            </div>
                        ) : (
                            <>
                                <button className="btn btn-primary" onClick={handleActivate}>
                                    <Check size={16} /> Activate Intent
                                </button>
                                <button className="btn btn-secondary" onClick={() => setParsed(null)}>
                                    Discard
                                </button>
                            </>
                        )}
                    </div>
                </motion.div>
            )}
        </div>
    );
}
