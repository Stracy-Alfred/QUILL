import { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { parseBatchAllocation } from '../utils/intentParser';
import {
    Sparkles, Wand2, Check, ChevronDown, ChevronUp,
    Users, Edit3, Trash2, AlertTriangle, CheckCircle2,
    XCircle, UserCheck, DollarSign, Tag, Clock, ShieldAlert
} from 'lucide-react';

export default function BatchAllocationPage() {
    const { businessUsers, budgets, addToast, createRequest } = useApp();
    const [prompt, setPrompt] = useState('');
    const [parsed, setParsed] = useState(null);
    const [targets, setTargets] = useState([]);
    const [showJson, setShowJson] = useState(false);
    const [loading, setLoading] = useState(false);
    const [created, setCreated] = useState(false);
    const [editingIdx, setEditingIdx] = useState(null);

    const knownUsers = useMemo(() =>
        businessUsers.map(u => ({
            id: u.id,
            name: u.name,
            email: u.email,
            dept: u.dept,
            avatar: u.avatar,
        })),
        [businessUsers]
    );

    const suggestions = [
        'Allocate ₹3,000 for Rahul and ₹5,000 for Sneha for food this month and limit their food delivery apps.',
        'Give Vikram ₹20,000 and Rahul ₹15,000 for AI tools this month with dual approval.',
        'Set ₹10k for Karan and ₹8k for Aisha for cloud services this quarter.',
        'Allocate 5000 for Sneha, 3000 for Karan, and 7000 for Vikram for shopping.',
    ];

    const handleGenerate = () => {
        if (!prompt.trim()) return;
        setLoading(true);
        setCreated(false);
        setEditingIdx(null);

        setTimeout(() => {
            const result = parseBatchAllocation(prompt, {
                mode: 'business',
                knownUsers,
            });
            setParsed(result);
            setTargets(result.targets.map((t, i) => ({ ...t, enabled: true, key: i })));
            setLoading(false);
        }, 1500);
    };

    const handleToggle = (idx) => {
        setTargets(prev => prev.map((t, i) =>
            i === idx ? { ...t, enabled: !t.enabled } : t
        ));
    };

    const handleEditField = (idx, field, value) => {
        setTargets(prev => prev.map((t, i) =>
            i === idx ? { ...t, [field]: value } : t
        ));
    };

    const handleResolveUser = (idx, userId) => {
        const user = knownUsers.find(u => u.id === userId);
        if (!user) return;
        setTargets(prev => prev.map((t, i) =>
            i === idx ? {
                ...t,
                user_id: user.id,
                user_name: user.name,
                user_email: user.email,
                resolved: true,
            } : t
        ));
    };

    const handleRemoveTarget = (idx) => {
        setTargets(prev => prev.filter((_, i) => i !== idx));
    };

    const enabledTargets = targets.filter(t => t.enabled);

    // Validation status — derived from parsed result
    const validationFailed = parsed && parsed.validation && !parsed.validation.valid;
    const validationErrors = parsed?.validation?.errors || [];
    const validationWarnings = parsed?.validation?.warnings || [];

    const handleCreateAllocations = () => {
        // HARD BLOCK: never create if validation failed
        if (validationFailed) {
            addToast('Cannot create allocations — validation errors must be resolved first.', 'error');
            return;
        }
        if (enabledTargets.length === 0) return;

        const cats = parsed.global_parameters.category_tags;
        const matchingBudget = budgets.find(b =>
            cats.includes(b.category)
        );

        for (const target of enabledTargets) {
            createRequest({
                userId: target.user_id || 'UNKNOWN',
                userName: target.user_name,
                userAvatar: target.user_name?.split(' ').map(n => n[0]).join('') || '??',
                amount: target.amount,
                purpose: target.purpose_text,
                budgetId: matchingBudget?.id || 'BUD_NEW',
                budgetTitle: matchingBudget?.title || `${cats[0]?.replace(/_/g, ' ')} Budget`,
                category: cats[0] || 'general',
                justification: `Batch allocation from prompt: "${parsed.rawPrompt}"`,
            });
        }

        addToast(`${enabledTargets.length} allocation request${enabledTargets.length > 1 ? 's' : ''} created successfully!`, 'success');
        setCreated(true);

        setTimeout(() => {
            setPrompt('');
            setParsed(null);
            setTargets([]);
            setCreated(false);
        }, 3000);
    };

    return (
        <div className="animate-fade-in">
            <div className="page-header">
                <h1 className="page-header-title">Batch Allocation</h1>
                <p className="page-header-sub">
                    Create multiple allocations for different team members in one prompt — powered by QUILL NLP
                </p>
            </div>

            {/* Prompt Box */}
            <div className="prompt-box">
                <div className="prompt-box-header">
                    <div className="prompt-box-icon">
                        <Sparkles size={18} />
                    </div>
                    <div>
                        <div className="prompt-box-title">AI Multi-Allocation Builder</div>
                        <div className="prompt-box-subtitle">
                            Describe allocations for multiple people — QUILL extracts users, amounts, and categories
                        </div>
                    </div>
                </div>

                <textarea
                    id="batch-prompt-input"
                    className="prompt-input"
                    placeholder='e.g., "Allocate ₹3,000 for Rahul and ₹5,000 for Sneha for food this month and limit their food delivery apps."'
                    value={prompt}
                    onChange={e => setPrompt(e.target.value)}
                    rows={4}
                />

                <div className="prompt-suggestions">
                    {suggestions.map((s, i) => (
                        <button
                            key={i}
                            className="prompt-suggestion-chip"
                            onClick={() => setPrompt(s)}
                        >
                            {s.length > 70 ? s.slice(0, 70) + '...' : s}
                        </button>
                    ))}
                </div>

                <div className="prompt-actions">
                    <button
                        id="batch-generate-btn"
                        className="btn btn-primary"
                        onClick={handleGenerate}
                        disabled={!prompt.trim() || loading}
                    >
                        {loading ? (
                            <>
                                <div className="typing-indicator"><span /><span /><span /></div>
                                Parsing...
                            </>
                        ) : (
                            <>
                                <Wand2 size={16} /> Parse & Generate
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* ═══ Validation Error Banner ═══ */}
            <AnimatePresence>
                {validationFailed && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        style={{
                            marginTop: 'var(--space-4)',
                            padding: 'var(--space-5)',
                            background: 'rgba(239,68,68,0.06)',
                            border: '2px solid rgba(239,68,68,0.3)',
                            borderRadius: 'var(--radius-xl)',
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 'var(--space-3)' }}>
                            <ShieldAlert size={20} style={{ color: 'var(--danger-400)' }} />
                            <span style={{ fontWeight: 700, fontSize: 'var(--text-base)', color: 'var(--danger-400)' }}>
                                Validation Failed — No Allocations Created
                            </span>
                        </div>
                        <p style={{
                            fontSize: 'var(--text-sm)', color: 'var(--text-secondary)',
                            marginBottom: 'var(--space-3)', lineHeight: '1.6',
                        }}>
                            Could not reliably create intents for all mentioned people. Please check names/amounts and try again.
                        </p>
                        <ul style={{
                            listStyle: 'disc', paddingLeft: 20,
                            fontSize: 'var(--text-sm)', color: 'var(--danger-400)',
                            display: 'flex', flexDirection: 'column', gap: 4,
                        }}>
                            {validationErrors.map((e, i) => <li key={i}>{e}</li>)}
                        </ul>

                        {/* Show what WAS parsed (readonly) so the admin can see what's missing */}
                        {targets.length > 0 && (
                            <div style={{ marginTop: 'var(--space-4)' }}>
                                <div style={{
                                    fontSize: 'var(--text-xs)', fontWeight: 600,
                                    color: 'var(--text-tertiary)', marginBottom: 'var(--space-2)',
                                    textTransform: 'uppercase', letterSpacing: '0.05em',
                                }}>
                                    What was parsed (read-only):
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                    {targets.map((t, i) => (
                                        <div key={i} style={{
                                            display: 'flex', alignItems: 'center', gap: 8,
                                            padding: '6px 12px',
                                            background: 'rgba(255,255,255,0.03)',
                                            borderRadius: 'var(--radius-md)',
                                            fontSize: 'var(--text-sm)',
                                        }}>
                                            <span style={{ fontWeight: 600 }}>{t.user_name || '(unknown)'}</span>
                                            <span>= {t.amount ? `₹${t.amount.toLocaleString()}` : <em style={{ color: 'var(--danger-400)' }}>missing amount</em>}</span>
                                            {!t.resolved && (
                                                <span className="badge badge-warning" style={{ fontSize: 10 }}>
                                                    <AlertTriangle size={10} /> unresolved
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                {parsed?.validation?.missingNames?.length > 0 && (
                                    <div style={{
                                        marginTop: 'var(--space-2)',
                                        fontSize: 'var(--text-xs)', color: 'var(--danger-400)',
                                    }}>
                                        Missing from parse: {parsed.validation.missingNames.map(n => `"${n}"`).join(', ')}
                                    </div>
                                )}
                            </div>
                        )}

                        <button
                            className="btn btn-ghost btn-sm"
                            style={{ marginTop: 'var(--space-4)' }}
                            onClick={() => { setParsed(null); setTargets([]); }}
                        >
                            Dismiss & Retry
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ═══ Validation Warnings Banner ═══ */}
            <AnimatePresence>
                {parsed && !validationFailed && validationWarnings.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        style={{
                            marginTop: 'var(--space-4)',
                            padding: 'var(--space-4)',
                            background: 'rgba(251,191,36,0.06)',
                            border: '1px solid rgba(251,191,36,0.25)',
                            borderRadius: 'var(--radius-lg)',
                            display: 'flex', alignItems: 'flex-start', gap: 8,
                        }}
                    >
                        <AlertTriangle size={16} style={{ color: 'var(--warning-400)', marginTop: 2, flexShrink: 0 }} />
                        <div>
                            {validationWarnings.map((w, i) => (
                                <div key={i} style={{ fontSize: 'var(--text-sm)', color: 'var(--warning-400)', marginBottom: 2 }}>
                                    {w}
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Parsed Results – Review Table (only shown if validation passed) */}
            <AnimatePresence>
                {parsed && !validationFailed && targets.length > 0 && (
                    <motion.div
                        className="batch-results"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.4 }}
                    >
                        {/* Summary Header */}
                        <div className="batch-results-header">
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <CheckCircle2 size={18} style={{ color: 'var(--accent-400)' }} />
                                <span style={{ fontWeight: 700, fontSize: 'var(--text-lg)' }}>
                                    Allocations Parsed
                                </span>
                            </div>
                            <div className="batch-results-summary">
                                {parsed.summary}
                            </div>
                        </div>

                        {/* Global Parameters */}
                        <div className="batch-global-params">
                            <div className="batch-param-chip">
                                <Clock size={13} />
                                {parsed.global_parameters.period}
                            </div>
                            {parsed.global_parameters.category_tags.map(cat => (
                                <div key={cat} className="batch-param-chip">
                                    <Tag size={13} />
                                    {cat.replace(/_/g, ' ')}
                                </div>
                            ))}
                            {parsed.global_parameters.dual_approval && (
                                <div className="batch-param-chip gold">
                                    🔐 Dual Approval
                                </div>
                            )}
                            <div className="batch-param-chip">
                                ⚠️ Warning at {parsed.global_parameters.warnings.mid_threshold_percentage}%
                            </div>
                        </div>

                        {/* Review Table */}
                        <div className="batch-table-wrapper">
                            <table className="batch-table">
                                <thead>
                                    <tr>
                                        <th style={{ width: 40 }}>
                                            <input
                                                type="checkbox"
                                                checked={targets.every(t => t.enabled)}
                                                onChange={() => {
                                                    const allEnabled = targets.every(t => t.enabled);
                                                    setTargets(prev => prev.map(t => ({ ...t, enabled: !allEnabled })));
                                                }}
                                            />
                                        </th>
                                        <th>User</th>
                                        <th>Amount</th>
                                        <th>Category</th>
                                        <th>Vendors</th>
                                        <th>Warning</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {targets.map((target, idx) => (
                                        <tr key={idx} className={!target.enabled ? 'batch-row-disabled' : ''}>
                                            <td>
                                                <input
                                                    type="checkbox"
                                                    checked={target.enabled}
                                                    onChange={() => handleToggle(idx)}
                                                />
                                            </td>
                                            <td>
                                                {target.resolved ? (
                                                    <div className="batch-user-cell">
                                                        <div className="avatar sm">
                                                            {target.user_name?.split(' ').map(n => n[0]).join('')}
                                                        </div>
                                                        <div>
                                                            <div style={{ fontWeight: 600 }}>{target.user_name}</div>
                                                            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
                                                                {target.user_email}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="batch-user-unresolved">
                                                        <AlertTriangle size={14} style={{ color: 'var(--warning-400)' }} />
                                                        <select
                                                            className="input batch-user-select"
                                                            value={target.user_id || ''}
                                                            onChange={e => handleResolveUser(idx, e.target.value)}
                                                        >
                                                            <option value="">Select: "{target.user_name}"</option>
                                                            {knownUsers.map(u => (
                                                                <option key={u.id} value={u.id}>
                                                                    {u.name} ({u.dept})
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                )}
                                            </td>
                                            <td>
                                                {editingIdx === idx ? (
                                                    <input
                                                        className="input batch-edit-input"
                                                        type="number"
                                                        value={target.amount}
                                                        onChange={e => handleEditField(idx, 'amount', Number(e.target.value))}
                                                        onBlur={() => setEditingIdx(null)}
                                                        autoFocus
                                                    />
                                                ) : (
                                                    <span
                                                        className="batch-amount"
                                                        onClick={() => setEditingIdx(idx)}
                                                        title="Click to edit"
                                                    >
                                                        ₹{target.amount.toLocaleString()}
                                                    </span>
                                                )}
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                                                    {(target.category_tags || []).map(c => (
                                                        <span key={c} className="badge badge-info">
                                                            {c.replace(/_/g, ' ')}
                                                        </span>
                                                    ))}
                                                </div>
                                            </td>
                                            <td>
                                                <span className="badge badge-purple">
                                                    {target.vendor_tags?.length > 0
                                                        ? `${target.vendor_tags.join(', ')} vendors`
                                                        : 'all vendors'}
                                                </span>
                                            </td>
                                            <td>
                                                <span style={{ fontSize: 'var(--text-sm)', color: 'var(--warning-400)' }}>
                                                    ₹{target.warning_threshold?.toLocaleString()}
                                                </span>
                                            </td>
                                            <td>
                                                {target.resolved ? (
                                                    <span className="badge badge-success">
                                                        <UserCheck size={12} /> Resolved
                                                    </span>
                                                ) : (
                                                    <span className="badge badge-warning">
                                                        <AlertTriangle size={12} /> Ambiguous
                                                    </span>
                                                )}
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', gap: 4 }}>
                                                    <button
                                                        className="btn btn-ghost btn-sm"
                                                        onClick={() => setEditingIdx(editingIdx === idx ? null : idx)}
                                                        title="Edit amount"
                                                    >
                                                        <Edit3 size={14} />
                                                    </button>
                                                    <button
                                                        className="btn btn-ghost btn-sm"
                                                        onClick={() => handleRemoveTarget(idx)}
                                                        title="Remove"
                                                        style={{ color: 'var(--danger-400)' }}
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Total summary */}
                        <div className="batch-total-bar">
                            <div>
                                <span style={{ color: 'var(--text-secondary)' }}>
                                    {enabledTargets.length} of {targets.length} allocations selected
                                </span>
                            </div>
                            <div style={{ fontWeight: 800, fontSize: 'var(--text-xl)' }}>
                                Total: ₹{enabledTargets.reduce((s, t) => s + t.amount, 0).toLocaleString()}
                            </div>
                        </div>

                        {/* JSON toggle */}
                        <button
                            className="btn btn-ghost btn-sm"
                            onClick={() => setShowJson(!showJson)}
                            style={{ marginTop: 'var(--space-3)', marginBottom: showJson ? 'var(--space-3)' : 0 }}
                        >
                            {showJson ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                            {showJson ? 'Hide' : 'Show'} NLP Output
                        </button>

                        {showJson && (
                            <pre className="intent-preview-json">
                                {JSON.stringify({
                                    targets: enabledTargets.map(t => ({
                                        user_name_or_id: t.user_name,
                                        amount: t.amount,
                                        category_tags: t.category_tags,
                                        purpose_text: t.purpose_text,
                                        vendor_tags: t.vendor_tags,
                                    })),
                                    global_parameters: parsed.global_parameters,
                                    validation: parsed.validation,
                                }, null, 2)}
                            </pre>
                        )}

                        {/* Action Buttons */}
                        <div className="intent-preview-actions" style={{ marginTop: 'var(--space-4)' }}>
                            {created ? (
                                <div style={{
                                    display: 'flex', alignItems: 'center', gap: 8,
                                    color: 'var(--accent-400)', fontWeight: 700,
                                }}>
                                    <Check size={20} /> Allocations Created! Pending approval.
                                </div>
                            ) : (
                                <>
                                    <button
                                        id="batch-create-btn"
                                        className="btn btn-primary"
                                        onClick={handleCreateAllocations}
                                        disabled={enabledTargets.length === 0 || enabledTargets.some(t => !t.resolved)}
                                    >
                                        <Check size={16} /> Create {enabledTargets.length} Request{enabledTargets.length !== 1 ? 's' : ''}
                                    </button>
                                    <button
                                        className="btn btn-secondary"
                                        onClick={() => { setParsed(null); setTargets([]); }}
                                    >
                                        Discard
                                    </button>
                                    {enabledTargets.some(t => !t.resolved) && (
                                        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--warning-400)', display: 'flex', alignItems: 'center', gap: 4 }}>
                                            <AlertTriangle size={13} /> Resolve all users before creating
                                        </span>
                                    )}
                                </>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
