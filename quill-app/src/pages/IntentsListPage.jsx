import { useApp } from '../context/AppContext';
import { motion } from 'framer-motion';
import { Pause, Play, Trash2, Eye } from 'lucide-react';

export default function IntentsListPage() {
    const { intents, pauseIntent, deleteIntent, merchants } = useApp();

    const getProgressColor = (intent) => {
        const pct = (intent.currentSpend / intent.monthlyCap) * 100;
        if (pct >= 100) return 'red';
        if (pct >= 50) return 'amber';
        return 'green';
    };

    return (
        <div className="animate-fade-in">
            <div className="page-header">
                <h1 className="page-header-title">My Intents</h1>
                <p className="page-header-sub">Manage all your spending rules and view transaction history</p>
            </div>

            <div style={{ display: 'grid', gap: 'var(--space-6)' }}>
                {intents.map((intent, idx) => {
                    const pct = Math.round((intent.currentSpend / intent.monthlyCap) * 100);
                    return (
                        <motion.div
                            key={intent.id}
                            className="card"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.08 }}
                        >
                            {/* Header */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-4)' }}>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                                        <span style={{ fontSize: 'var(--text-xl)', fontWeight: 700 }}>{intent.title}</span>
                                        <span className={`badge ${intent.status === 'active' ? 'badge-success' : 'badge-warning'}`}>
                                            {intent.status}
                                        </span>
                                    </div>
                                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginTop: 4 }}>
                                        {intent.description}
                                    </p>
                                </div>
                                <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                                    <button className="btn btn-ghost btn-icon sm" onClick={() => pauseIntent(intent.id)}>
                                        {intent.status === 'paused' ? <Play size={16} /> : <Pause size={16} />}
                                    </button>
                                    <button className="btn btn-danger btn-icon sm" onClick={() => deleteIntent(intent.id)}>
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* Progress */}
                            <div style={{ marginBottom: 'var(--space-6)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-sm)', marginBottom: 8 }}>
                                    <span style={{ fontWeight: 600 }}>₹{intent.currentSpend.toLocaleString()} spent</span>
                                    <span style={{ color: 'var(--text-secondary)' }}>₹{intent.monthlyCap.toLocaleString()} cap</span>
                                </div>
                                <div className="progress-bar" style={{ height: 12 }}>
                                    <div
                                        className={`progress-bar-fill ${getProgressColor(intent)}`}
                                        style={{ width: `${Math.min(pct, 100)}%` }}
                                    />
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
                                        Warning at ₹{intent.warningThreshold.toLocaleString()}
                                    </span>
                                    <span style={{
                                        fontSize: 'var(--text-xs)', fontWeight: 700,
                                        color: pct >= 100 ? 'var(--danger-400)' : pct >= 50 ? 'var(--warning-400)' : 'var(--accent-400)',
                                    }}>
                                        {pct}% used
                                    </span>
                                </div>
                            </div>

                            {/* Merchants */}
                            <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap', marginBottom: 'var(--space-4)' }}>
                                {intent.merchants.map(m => {
                                    const merchant = merchants[m];
                                    return (
                                        <span key={m} className="badge badge-info" style={{ gap: 4 }}>
                                            {merchant?.logo} {merchant?.name || m}
                                        </span>
                                    );
                                })}
                            </div>

                            {/* Transaction History */}
                            {intent.transactions.length > 0 && (
                                <div>
                                    <h4 style={{ fontSize: 'var(--text-sm)', fontWeight: 700, marginBottom: 'var(--space-3)', color: 'var(--text-secondary)' }}>
                                        Recent Transactions
                                    </h4>
                                    <div className="table-wrapper">
                                        <table>
                                            <thead>
                                                <tr>
                                                    <th>Date</th>
                                                    <th>Merchant</th>
                                                    <th>Description</th>
                                                    <th>Amount</th>
                                                    <th>Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {intent.transactions.slice(0, 5).map(txn => (
                                                    <tr key={txn.id}>
                                                        <td>{new Date(txn.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</td>
                                                        <td>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                                {merchants[txn.merchant]?.logo} {merchants[txn.merchant]?.name}
                                                            </div>
                                                        </td>
                                                        <td>{txn.desc}</td>
                                                        <td style={{ fontWeight: 600 }}>₹{txn.amount.toLocaleString()}</td>
                                                        <td>
                                                            <span className={`badge ${txn.status === 'allowed' ? 'badge-success' : txn.status === 'warned' ? 'badge-warning' : 'badge-danger'}`}>
                                                                {txn.status}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
