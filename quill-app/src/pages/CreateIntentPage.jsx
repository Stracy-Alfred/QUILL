import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { parseIndividualIntent, parseBatchAllocation } from '../utils/intentParser';
import {
    Sparkles, Wand2, Check, ChevronDown, ChevronUp,
    Layers, Target, Trash2, Edit3, Tag
} from 'lucide-react';

export default function CreateIntentPage() {
    const { createIntent } = useApp();
    const [prompt, setPrompt] = useState('');
    const [parsed, setParsed] = useState(null);
    const [batchTargets, setBatchTargets] = useState(null);
    const [showJson, setShowJson] = useState(false);
    const [loading, setLoading] = useState(false);
    const [activated, setActivated] = useState(false);
    const [editingIdx, setEditingIdx] = useState(null);

    const suggestions = [
        'Set a monthly limit of ₹10,000 for Swiggy and Zomato.',
        'Warn me when I\'ve spent ₹5,000 on Amazon this month.',
        'Block Netflix if I spend more than ₹1,000 per month.',
        'Cap food delivery spending at ₹8,000 weekly.',
        'Set a 5k limit for groceries and 3k for travel this month.',
        'Limit entertainment to ₹2,000 and shopping to ₹10,000 monthly.',
    ];

    const handleGenerate = () => {
        if (!prompt.trim()) return;
        setLoading(true);
        setActivated(false);
        setBatchTargets(null);
        setParsed(null);

        setTimeout(() => {
            // Try batch parsing first to detect multi-category intents
            const batchResult = parseBatchAllocation(prompt, { mode: 'individual' });

            if (batchResult.targets.length > 1) {
                // Multi-category batch mode
                setBatchTargets(batchResult.targets.map((t, i) => ({ ...t, enabled: true, key: i })));
                setParsed(batchResult);
            } else {
                // Single intent mode (existing)
                const result = parseIndividualIntent(prompt);
                setParsed(result);
                setBatchTargets(null);
            }
            setLoading(false);
        }, 1200);
    };

    const handleActivate = () => {
        if (!parsed) return;

        if (batchTargets) {
            // Create multiple intents
            const enabled = batchTargets.filter(t => t.enabled);
            for (const target of enabled) {
                createIntent({
                    title: `${target.category_label} Spending Cap`,
                    description: `Cap ${target.category_label} spending at ₹${target.amount.toLocaleString()} per ${target.period}`,
                    type: 'spending_limit',
                    merchants: [],
                    categories: [target.category],
                    monthlyCap: target.amount,
                    warningThreshold: target.warning_threshold,
                    period: target.period,
                    actions: {
                        below_warning: 'allow',
                        warning_to_cap: 'warn_and_allow',
                        above_cap: 'block',
                    },
                });
            }
        } else {
            // Single intent
            createIntent(parsed);
        }

        setActivated(true);
        setTimeout(() => {
            setPrompt('');
            setParsed(null);
            setBatchTargets(null);
            setActivated(false);
        }, 2000);
    };

    const handleToggleBatch = (idx) => {
        setBatchTargets(prev => prev.map((t, i) =>
            i === idx ? { ...t, enabled: !t.enabled } : t
        ));
    };

    const handleEditBatchAmount = (idx, value) => {
        setBatchTargets(prev => prev.map((t, i) =>
            i === idx ? {
                ...t,
                amount: Number(value),
                warning_threshold: Math.round(Number(value) * 0.5),
            } : t
        ));
    };

    const handleRemoveBatch = (idx) => {
        setBatchTargets(prev => prev.filter((_, i) => i !== idx));
    };

    const isBatchMode = batchTargets && batchTargets.length > 1;
    const enabledBatch = batchTargets?.filter(t => t.enabled) || [];

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
                        <div className="prompt-box-subtitle">
                            Type your spending rules naturally — create single or multiple intents in one go
                        </div>
                    </div>
                </div>

                <textarea
                    id="intent-prompt-input"
                    className="prompt-input"
                    placeholder="e.g., Set a monthly limit of ₹10,000 for Swiggy and Zomato. Warn me at ₹5,000.

You can also create multiple intents: 'Set 5k limit for groceries and 3k for travel this month.'"
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
                        id="intent-generate-btn"
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

            {/* ─── SINGLE INTENT Preview ─── */}
            {parsed && !isBatchMode && (
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
                        {parsed.policy?.actions?.map((action, i) => (
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

            {/* ─── BATCH INTENT Preview (multi-category) ─── */}
            <AnimatePresence>
                {isBatchMode && (
                    <motion.div
                        className="batch-results"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.4 }}
                    >
                        <div className="batch-results-header">
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <Layers size={18} style={{ color: 'var(--primary-400)' }} />
                                <span style={{ fontWeight: 700, fontSize: 'var(--text-lg)' }}>
                                    Multiple Intents Detected
                                </span>
                                <span className="badge badge-info" style={{ marginLeft: 8 }}>
                                    {batchTargets.length} intents
                                </span>
                            </div>
                            <div className="batch-results-summary" style={{ marginTop: 'var(--space-2)' }}>
                                QUILL detected multiple spending categories in your prompt and split them into separate intents.
                            </div>
                        </div>

                        {/* Batch Intent Cards */}
                        <div className="batch-intent-grid">
                            {batchTargets.map((target, idx) => (
                                <div
                                    key={idx}
                                    className={`batch-intent-card ${!target.enabled ? 'disabled' : ''}`}
                                >
                                    <div className="batch-intent-card-header">
                                        <input
                                            type="checkbox"
                                            checked={target.enabled}
                                            onChange={() => handleToggleBatch(idx)}
                                        />
                                        <div className="batch-intent-card-category">
                                            <Tag size={14} />
                                            {target.category_label}
                                        </div>
                                        <button
                                            className="btn btn-ghost btn-sm"
                                            onClick={() => handleRemoveBatch(idx)}
                                            style={{ marginLeft: 'auto', color: 'var(--danger-400)' }}
                                        >
                                            <Trash2 size={13} />
                                        </button>
                                    </div>

                                    <div className="batch-intent-card-body">
                                        <div className="batch-intent-card-amount">
                                            {editingIdx === idx ? (
                                                <input
                                                    className="input batch-edit-input"
                                                    type="number"
                                                    value={target.amount}
                                                    onChange={e => handleEditBatchAmount(idx, e.target.value)}
                                                    onBlur={() => setEditingIdx(null)}
                                                    autoFocus
                                                    style={{ maxWidth: 120 }}
                                                />
                                            ) : (
                                                <span
                                                    onClick={() => setEditingIdx(idx)}
                                                    style={{ cursor: 'pointer' }}
                                                    title="Click to edit"
                                                >
                                                    ₹{target.amount.toLocaleString()}
                                                    <Edit3 size={12} style={{ marginLeft: 4, opacity: 0.5 }} />
                                                </span>
                                            )}
                                        </div>
                                        <div className="batch-intent-card-meta">
                                            <span>Period: {target.period}</span>
                                            <span>Warning: ₹{target.warning_threshold.toLocaleString()}</span>
                                        </div>
                                        <div style={{ marginTop: 'var(--space-2)' }}>
                                            <span className="badge badge-purple" style={{ fontSize: '0.65rem' }}>
                                                {target.vendor_tags?.join(', ') || 'all'} vendors
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Total */}
                        <div className="batch-total-bar">
                            <div>
                                <span style={{ color: 'var(--text-secondary)' }}>
                                    {enabledBatch.length} of {batchTargets.length} intents selected
                                </span>
                            </div>
                            <div style={{ fontWeight: 800, fontSize: 'var(--text-xl)' }}>
                                Total limits: ₹{enabledBatch.reduce((s, t) => s + t.amount, 0).toLocaleString()}/{parsed?.global_parameters?.period || 'month'}
                            </div>
                        </div>

                        {/* JSON */}
                        <button
                            className="btn btn-ghost btn-sm"
                            onClick={() => setShowJson(!showJson)}
                            style={{ marginTop: 'var(--space-3)' }}
                        >
                            {showJson ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                            {showJson ? 'Hide' : 'Show'} NLP Output
                        </button>

                        {showJson && (
                            <pre className="intent-preview-json">
                                {JSON.stringify({
                                    targets: enabledBatch.map(t => ({
                                        category: t.category,
                                        amount: t.amount,
                                        vendor_tags: t.vendor_tags,
                                        period: t.period,
                                    })),
                                    global_parameters: parsed.global_parameters,
                                }, null, 2)}
                            </pre>
                        )}

                        {/* Actions */}
                        <div className="intent-preview-actions" style={{ marginTop: 'var(--space-4)' }}>
                            {activated ? (
                                <div style={{
                                    display: 'flex', alignItems: 'center', gap: 8,
                                    color: 'var(--accent-400)', fontWeight: 700,
                                }}>
                                    <Check size={20} /> {enabledBatch.length} Intent{enabledBatch.length > 1 ? 's' : ''} Activated!
                                </div>
                            ) : (
                                <>
                                    <button
                                        className="btn btn-primary"
                                        onClick={handleActivate}
                                        disabled={enabledBatch.length === 0}
                                    >
                                        <Check size={16} /> Activate {enabledBatch.length} Intent{enabledBatch.length !== 1 ? 's' : ''}
                                    </button>
                                    <button
                                        className="btn btn-secondary"
                                        onClick={() => { setParsed(null); setBatchTargets(null); }}
                                    >
                                        Discard
                                    </button>
                                </>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
