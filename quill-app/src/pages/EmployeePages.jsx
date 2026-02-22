import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { parseUserRequest } from '../utils/intentParser';
import {
    Wallet, FileCheck, Target, Sparkles, Wand2, Check, ArrowRight,
} from 'lucide-react';

// ═══ Employee Dashboard ═══
export function EmployeeDashboard() {
    const { budgets, requests } = useApp();
    const navigate = useNavigate();

    // Simulated as employee BU001
    const userId = 'BU001';
    const myAllocations = budgets.flatMap(b =>
        b.allocations
            .filter(a => a.userId === userId)
            .map(a => ({ ...a, budgetTitle: b.title, budgetCategory: b.category }))
    );
    const myRequests = requests.filter(r => r.userId === userId);

    return (
        <div className="animate-fade-in">
            <div className="page-header">
                <h1 className="page-header-title">My Dashboard</h1>
                <p className="page-header-sub">Your allocated budgets and spending at a glance</p>
            </div>

            {/* Stats */}
            <div className="stat-cards" style={{ marginBottom: 'var(--space-8)' }}>
                <motion.div className="card stat-card" whileHover={{ y: -2 }}>
                    <div className="stat-card-icon purple"><Wallet size={22} /></div>
                    <div className="stat-card-label">My Allocations</div>
                    <div className="stat-card-value">{myAllocations.length}</div>
                </motion.div>
                <motion.div className="card stat-card" whileHover={{ y: -2 }}>
                    <div className="stat-card-icon gold"><Target size={22} /></div>
                    <div className="stat-card-label">Total Allocated</div>
                    <div className="stat-card-value">₹{myAllocations.reduce((s, a) => s + a.amount, 0).toLocaleString()}</div>
                </motion.div>
                <motion.div className="card stat-card" whileHover={{ y: -2 }}>
                    <div className="stat-card-icon green"><FileCheck size={22} /></div>
                    <div className="stat-card-label">Total Used</div>
                    <div className="stat-card-value">₹{myAllocations.reduce((s, a) => s + a.used, 0).toLocaleString()}</div>
                </motion.div>
            </div>

            {/* Allocations */}
            <div className="section-header">
                <h3 className="section-title">My Allocations</h3>
                <button className="btn btn-primary btn-sm" onClick={() => navigate('/employee/request')}>
                    Request Budget
                </button>
            </div>

            <div style={{ display: 'grid', gap: 'var(--space-4)', marginBottom: 'var(--space-8)' }}>
                {myAllocations.map((alloc, idx) => {
                    const pct = Math.round((alloc.used / alloc.amount) * 100);
                    const remaining = alloc.amount - alloc.used;
                    return (
                        <motion.div
                            key={alloc.id}
                            className="card"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
                                <div>
                                    <h4 style={{ fontWeight: 700 }}>{alloc.budgetTitle}</h4>
                                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginTop: 2 }}>{alloc.purpose}</p>
                                </div>
                                <span className="badge badge-success">Approved ✓</span>
                            </div>

                            <div className="progress-bar" style={{ height: 10, marginBottom: 8 }}>
                                <div className={`progress-bar-fill ${pct > 80 ? 'amber' : 'green'}`} style={{ width: `${pct}%` }} />
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-sm)' }}>
                                <span>₹{alloc.used.toLocaleString()} used</span>
                                <span style={{ color: 'var(--accent-400)', fontWeight: 600 }}>₹{remaining.toLocaleString()} remaining</span>
                                <span style={{ color: 'var(--text-secondary)' }}>of ₹{alloc.amount.toLocaleString()}</span>
                            </div>

                            {alloc.transactions?.length > 0 && (
                                <div style={{ marginTop: 'var(--space-4)', borderTop: '1px solid var(--border-secondary)', paddingTop: 'var(--space-3)' }}>
                                    <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>Transactions</div>
                                    {alloc.transactions.map(txn => (
                                        <div key={txn.id} style={{
                                            display: 'flex', justifyContent: 'space-between',
                                            padding: '6px 0', fontSize: 'var(--text-sm)',
                                        }}>
                                            <span>{txn.desc}</span>
                                            <span style={{ fontWeight: 600 }}>₹{txn.amount.toLocaleString()}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    );
                })}
            </div>

            {/* My Requests */}
            {myRequests.length > 0 && (
                <>
                    <h3 className="section-title" style={{ marginBottom: 'var(--space-4)' }}>My Requests</h3>
                    {myRequests.map(req => (
                        <div key={req.id} className="card" style={{ marginBottom: 'var(--space-3)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <div>
                                    <div style={{ fontWeight: 600 }}>{req.purpose}</div>
                                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginTop: 2 }}>
                                        ₹{req.amount.toLocaleString()} • {req.budgetTitle}
                                    </div>
                                </div>
                                <span className={`badge ${req.status === 'approved' ? 'badge-success' : req.status === 'rejected' ? 'badge-danger' : 'badge-warning'}`}>
                                    {req.status.replace(/_/g, ' ')}
                                </span>
                            </div>
                        </div>
                    ))}
                </>
            )}
        </div>
    );
}

// ═══ Employee Request Budget ═══
export function EmployeeRequestPage() {
    const { createRequest, budgets } = useApp();
    const [prompt, setPrompt] = useState('');
    const [parsed, setParsed] = useState(null);
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const suggestions = [
        'I need ₹4,000 for a ChatGPT Plus subscription for client project X.',
        'Requesting ₹12,000 for GitHub Copilot annual license for development.',
        'Need ₹8,000 for Claude Pro subscription for product research.',
    ];

    const handleGenerate = () => {
        if (!prompt.trim()) return;
        setLoading(true);
        setSubmitted(false);
        setTimeout(() => {
            const result = parseUserRequest(prompt);
            setParsed(result);
            setLoading(false);
        }, 1000);
    };

    const handleSubmit = () => {
        if (!parsed) return;
        const matchedBudget = budgets.find(b => b.id === parsed.suggestedBudget);
        createRequest({
            userId: 'BU001',
            userName: 'Rahul Verma',
            userAvatar: 'RV',
            amount: parsed.amount,
            purpose: parsed.purpose,
            budgetId: parsed.suggestedBudget || 'BUD001',
            budgetTitle: matchedBudget?.title || 'General Budget',
            category: parsed.category,
            justification: prompt,
        });
        setSubmitted(true);
        setTimeout(() => {
            setPrompt('');
            setParsed(null);
            setSubmitted(false);
        }, 2000);
    };

    return (
        <div className="animate-fade-in">
            <div className="page-header">
                <h1 className="page-header-title">Request Budget</h1>
                <p className="page-header-sub">Describe what you need and why — QUILL will route it for approval</p>
            </div>

            <div className="prompt-box">
                <div className="prompt-box-header">
                    <div className="prompt-box-icon"><Sparkles size={18} /></div>
                    <div>
                        <div className="prompt-box-title">Budget Request</div>
                        <div className="prompt-box-subtitle">Describe what you need and why — no forms required</div>
                    </div>
                </div>

                <textarea
                    className="prompt-input"
                    placeholder="e.g., I need ₹4,000 for a ChatGPT Plus subscription for 1 month for client project X."
                    value={prompt}
                    onChange={e => setPrompt(e.target.value)}
                    rows={3}
                />

                <div className="prompt-suggestions">
                    {suggestions.map((s, i) => (
                        <button key={i} className="prompt-suggestion-chip" onClick={() => setPrompt(s)}>
                            {s.length > 50 ? s.slice(0, 50) + '...' : s}
                        </button>
                    ))}
                </div>

                <div className="prompt-actions">
                    <button className="btn btn-primary" onClick={handleGenerate} disabled={!prompt.trim() || loading}>
                        {loading ? (
                            <><div className="typing-indicator"><span /><span /><span /></div> Parsing...</>
                        ) : (
                            <><Wand2 size={16} /> Parse Request</>
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
                    <h4 style={{ fontWeight: 700, marginBottom: 'var(--space-4)' }}>Request Summary</h4>
                    <div style={{
                        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                        gap: 'var(--space-4)', marginBottom: 'var(--space-4)',
                    }}>
                        <div style={{ padding: 'var(--space-4)', background: 'var(--bg-glass)', borderRadius: 'var(--radius-lg)' }}>
                            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginBottom: 4 }}>Amount</div>
                            <div style={{ fontWeight: 800, fontSize: 'var(--text-xl)', color: 'var(--primary-400)' }}>
                                ₹{parsed.amount.toLocaleString()}
                            </div>
                        </div>
                        <div style={{ padding: 'var(--space-4)', background: 'var(--bg-glass)', borderRadius: 'var(--radius-lg)' }}>
                            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginBottom: 4 }}>Purpose</div>
                            <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{parsed.purpose}</div>
                        </div>
                        <div style={{ padding: 'var(--space-4)', background: 'var(--bg-glass)', borderRadius: 'var(--radius-lg)' }}>
                            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginBottom: 4 }}>Suggested Budget</div>
                            <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>
                                {budgets.find(b => b.id === parsed.suggestedBudget)?.title || 'General'}
                            </div>
                        </div>
                    </div>

                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--space-4)' }}>
                        This request will be sent to all Client Admins for dual approval (2/2 required).
                    </p>

                    <div className="intent-preview-actions">
                        {submitted ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--accent-400)', fontWeight: 700 }}>
                                <Check size={20} /> Request Submitted Successfully!
                            </div>
                        ) : (
                            <>
                                <button className="btn btn-primary" onClick={handleSubmit}>
                                    <Check size={16} /> Submit Request
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

// ═══ Employee Allocations ═══
export function EmployeeAllocationsPage() {
    const { budgets, merchants } = useApp();
    const userId = 'BU001';

    const myAllocations = budgets.flatMap(b =>
        b.allocations
            .filter(a => a.userId === userId)
            .map(a => ({ ...a, budgetTitle: b.title, allowedMerchants: b.allowedMerchants }))
    );

    return (
        <div className="animate-fade-in">
            <div className="page-header">
                <h1 className="page-header-title">My Allocations</h1>
                <p className="page-header-sub">Your approved budget allocations and spending history</p>
            </div>

            {myAllocations.map((alloc, idx) => {
                const pct = Math.round((alloc.used / alloc.amount) * 100);
                return (
                    <motion.div
                        key={alloc.id}
                        className="card"
                        style={{ marginBottom: 'var(--space-6)' }}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
                            <div>
                                <h4 style={{ fontWeight: 700, fontSize: 'var(--text-lg)' }}>{alloc.budgetTitle}</h4>
                                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginTop: 2 }}>{alloc.purpose}</p>
                            </div>
                            <span className="badge badge-success">Active</span>
                        </div>

                        <div className="progress-bar" style={{ height: 12, marginBottom: 8 }}>
                            <div className={`progress-bar-fill ${pct > 80 ? 'amber' : 'green'}`} style={{ width: `${pct}%` }} />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-sm)', marginBottom: 'var(--space-4)' }}>
                            <span style={{ fontWeight: 600 }}>₹{alloc.used.toLocaleString()} used ({pct}%)</span>
                            <span style={{ color: 'var(--accent-400)' }}>₹{(alloc.amount - alloc.used).toLocaleString()} remaining</span>
                        </div>

                        <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap', marginBottom: 'var(--space-4)' }}>
                            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginRight: 4 }}>Allowed at:</span>
                            {alloc.allowedMerchants.map(m => (
                                <span key={m} className="badge badge-info" style={{ gap: 4 }}>
                                    {merchants[m]?.logo} {merchants[m]?.name}
                                </span>
                            ))}
                        </div>

                        {alloc.transactions?.length > 0 && (
                            <div className="table-wrapper" style={{ borderTop: '1px solid var(--border-secondary)', paddingTop: 'var(--space-3)' }}>
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Date</th>
                                            <th>Merchant</th>
                                            <th>Description</th>
                                            <th>Amount</th>
                                            <th>Compliance</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {alloc.transactions.map(txn => (
                                            <tr key={txn.id}>
                                                <td>{new Date(txn.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</td>
                                                <td>{merchants[txn.merchant]?.logo} {merchants[txn.merchant]?.name}</td>
                                                <td>{txn.desc}</td>
                                                <td style={{ fontWeight: 600 }}>₹{txn.amount.toLocaleString()}</td>
                                                <td>
                                                    <span className={`badge ${txn.status === 'on_intent' ? 'badge-success' : 'badge-danger'}`}>
                                                        {txn.status === 'on_intent' ? '✓ On-Intent' : '✗ Off-Intent'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </motion.div>
                );
            })}
        </div>
    );
}
