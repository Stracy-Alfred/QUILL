import { useApp } from '../context/AppContext';
import { motion } from 'framer-motion';
import { Wallet } from 'lucide-react';

export default function BudgetsPage() {
    const { budgets, merchants } = useApp();

    return (
        <div className="animate-fade-in">
            <div className="page-header">
                <h1 className="page-header-title">Budgets & Intents</h1>
                <p className="page-header-sub">Detailed view of all company budgets and their allocations</p>
            </div>

            {budgets.map((budget, bIdx) => {
                const pct = Math.round((budget.used / budget.totalAmount) * 100);
                return (
                    <motion.div
                        key={budget.id}
                        className="card"
                        style={{ marginBottom: 'var(--space-6)' }}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: bIdx * 0.1 }}
                    >
                        {/* Budget Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-5)' }}>
                            <div style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'center' }}>
                                <div className="stat-card-icon purple"><Wallet size={22} /></div>
                                <div>
                                    <h3 style={{ fontWeight: 800, fontSize: 'var(--text-xl)' }}>{budget.title}</h3>
                                    <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 4 }}>
                                        {budget.requiresDualApproval && <span className="badge badge-gold">🔐 Dual Approval</span>}
                                        <span className="badge badge-success">{budget.status}</span>
                                        <span className="badge badge-purple">{budget.period}</span>
                                    </div>
                                </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: 'var(--text-3xl)', fontWeight: 800 }}>₹{budget.used.toLocaleString()}</div>
                                <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>of ₹{budget.totalAmount.toLocaleString()}</div>
                            </div>
                        </div>

                        {/* Progress */}
                        <div className="progress-bar" style={{ height: 12, marginBottom: 'var(--space-3)' }}>
                            <div className={`progress-bar-fill ${pct > 80 ? 'amber' : 'blue'}`} style={{ width: `${pct}%` }} />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginBottom: 'var(--space-6)' }}>
                            <span>Used: ₹{budget.used.toLocaleString()}</span>
                            <span>Allocated: ₹{budget.allocated.toLocaleString()}</span>
                            <span style={{ color: 'var(--accent-400)' }}>Available: ₹{(budget.totalAmount - budget.allocated).toLocaleString()}</span>
                        </div>

                        {/* Allowed Merchants */}
                        <div style={{ marginBottom: 'var(--space-6)' }}>
                            <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>
                                Allowed Merchants
                            </div>
                            <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                                {budget.allowedMerchants.map(m => {
                                    const merch = merchants[m];
                                    return (
                                        <span key={m} className="badge badge-info" style={{ gap: 4 }}>
                                            {merch?.logo} {merch?.name || m}
                                        </span>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Allocations */}
                        <div>
                            <h4 style={{ fontWeight: 700, fontSize: 'var(--text-base)', marginBottom: 'var(--space-4)' }}>
                                Allocations ({budget.allocations.length})
                            </h4>
                            <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
                                {budget.allocations.map(alloc => {
                                    const allocPct = Math.round((alloc.used / alloc.amount) * 100);
                                    return (
                                        <div
                                            key={alloc.id}
                                            style={{
                                                padding: 'var(--space-4)',
                                                background: 'var(--bg-glass)',
                                                borderRadius: 'var(--radius-lg)',
                                                border: '1px solid var(--border-secondary)',
                                            }}
                                        >
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                                                    <div className="avatar">{alloc.userName.split(' ').map(n => n[0]).join('')}</div>
                                                    <div>
                                                        <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{alloc.userName}</div>
                                                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>{alloc.purpose}</div>
                                                    </div>
                                                </div>
                                                <div style={{ textAlign: 'right' }}>
                                                    <div style={{ fontWeight: 700 }}>₹{alloc.used.toLocaleString()}</div>
                                                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>of ₹{alloc.amount.toLocaleString()}</div>
                                                </div>
                                            </div>

                                            <div className="progress-bar" style={{ height: 6 }}>
                                                <div className={`progress-bar-fill ${allocPct > 90 ? 'amber' : 'green'}`} style={{ width: `${allocPct}%` }} />
                                            </div>

                                            {/* Allocation Transactions */}
                                            {alloc.transactions && alloc.transactions.length > 0 && (
                                                <div style={{ marginTop: 'var(--space-3)' }}>
                                                    {alloc.transactions.map(txn => (
                                                        <div
                                                            key={txn.id}
                                                            style={{
                                                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                                                padding: '6px 0', borderBottom: '1px solid var(--border-secondary)',
                                                                fontSize: 'var(--text-xs)',
                                                            }}
                                                        >
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                                <span>{merchants[txn.merchant]?.logo}</span>
                                                                <span>{txn.desc}</span>
                                                            </div>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                                <span style={{ fontWeight: 600 }}>₹{txn.amount.toLocaleString()}</span>
                                                                <span className={`badge ${txn.status === 'on_intent' ? 'badge-success' : 'badge-danger'}`}>
                                                                    {txn.status === 'on_intent' ? '✓' : '✗'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
}
