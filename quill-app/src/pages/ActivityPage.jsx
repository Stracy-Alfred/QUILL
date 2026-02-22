import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { motion } from 'framer-motion';
import {
    Filter, FileText, CreditCard, Target, Store,
    CheckCircle, AlertTriangle, XCircle, Clock, Eye,
} from 'lucide-react';

export default function ActivityPage() {
    const { activityLogs, merchants } = useApp();
    const [tab, setTab] = useState('all');
    const [expandedId, setExpandedId] = useState(null);

    // Filter only individual-relevant logs
    const myLogs = activityLogs.filter(l =>
        l.userId === 'individual' || l.type === 'intent' && l.userId === 'individual'
    ).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    const filteredLogs = tab === 'all' ? myLogs : myLogs.filter(l => l.type === tab);

    const typeConfig = {
        transaction: { icon: <CreditCard size={16} />, color: 'var(--primary-400)', label: 'Transaction' },
        intent: { icon: <Target size={16} />, color: 'var(--accent-400)', label: 'Intent' },
        vendor: { icon: <Store size={16} />, color: 'var(--rupee-gold)', label: 'Vendor' },
    };

    const actionIcons = {
        allowed: <CheckCircle size={14} style={{ color: 'var(--accent-400)' }} />,
        warned: <AlertTriangle size={14} style={{ color: 'var(--warning-400)' }} />,
        blocked: <XCircle size={14} style={{ color: 'var(--danger-400)' }} />,
        created: <CheckCircle size={14} style={{ color: 'var(--primary-400)' }} />,
        paused: <Clock size={14} style={{ color: 'var(--warning-400)' }} />,
        resumed: <CheckCircle size={14} style={{ color: 'var(--accent-400)' }} />,
        deleted: <XCircle size={14} style={{ color: 'var(--danger-400)' }} />,
    };

    const tabs = [
        { key: 'all', label: 'All Activity' },
        { key: 'transaction', label: 'Transactions' },
        { key: 'intent', label: 'Intents' },
    ];

    return (
        <div className="animate-fade-in">
            <div className="page-header">
                <h1 className="page-header-title">My Activity</h1>
                <p className="page-header-sub">Complete history of your transactions, intents, and invoices</p>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-6)', borderBottom: '1px solid var(--border-secondary)', paddingBottom: 'var(--space-2)' }}>
                {tabs.map(t => (
                    <button
                        key={t.key}
                        className={`btn btn-sm ${tab === t.key ? 'btn-primary' : 'btn-ghost'}`}
                        onClick={() => setTab(t.key)}
                    >
                        {t.label}
                        <span className="badge badge-info" style={{ marginLeft: 4, fontSize: 10 }}>
                            {t.key === 'all' ? myLogs.length : myLogs.filter(l => l.type === t.key).length}
                        </span>
                    </button>
                ))}
            </div>

            {/* Log List */}
            <div style={{ display: 'grid', gap: 'var(--space-3)' }}>
                {filteredLogs.map((log, idx) => {
                    const tc = typeConfig[log.type] || typeConfig.transaction;
                    const expanded = expandedId === log.id;

                    return (
                        <motion.div
                            key={log.id}
                            className="card"
                            style={{ padding: 'var(--space-4)', cursor: 'pointer' }}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.02 }}
                            onClick={() => setExpandedId(expanded ? null : log.id)}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                                <div style={{
                                    width: 36, height: 36, borderRadius: 'var(--radius-lg)',
                                    background: `${tc.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: tc.color, flexShrink: 0,
                                }}>
                                    {tc.icon}
                                </div>

                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                                        {actionIcons[log.action]}
                                        <span style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{log.details}</span>
                                    </div>
                                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginTop: 2 }}>
                                        {new Date(log.timestamp).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexShrink: 0 }}>
                                    <span className={`badge ${log.type === 'transaction' ? (log.outcome === 'allowed' ? 'badge-success' : log.outcome === 'warn_and_allow' ? 'badge-warning' : 'badge-danger') : 'badge-info'}`}>
                                        {log.type === 'transaction' ? log.outcome?.replace(/_/g, ' ') : log.action}
                                    </span>
                                    {log.amount && (
                                        <span style={{ fontWeight: 700, fontSize: 'var(--text-sm)' }}>₹{log.amount.toLocaleString()}</span>
                                    )}
                                    <Eye size={14} style={{ color: 'var(--text-tertiary)' }} />
                                </div>
                            </div>

                            {/* Expanded Details */}
                            {expanded && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    style={{ marginTop: 'var(--space-4)', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--border-secondary)' }}
                                >
                                    <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>Invoice / Details</div>
                                    <pre className="intent-preview-json" style={{ fontSize: 11 }}>
                                        {JSON.stringify({
                                            id: log.id,
                                            type: log.type,
                                            action: log.action,
                                            timestamp: log.timestamp,
                                            ...(log.merchant && { merchant: merchants[log.merchant]?.name || log.merchant }),
                                            ...(log.amount && { amount: `₹${log.amount.toLocaleString()}` }),
                                            ...(log.outcome && { outcome: log.outcome }),
                                            ...(log.intentId && { intent_id: log.intentId }),
                                            status: log.outcome || log.action,
                                            quill_verified: true,
                                        }, null, 2)}
                                    </pre>
                                </motion.div>
                            )}
                        </motion.div>
                    );
                })}

                {filteredLogs.length === 0 && (
                    <div className="empty-state">
                        <div className="empty-state-icon">📋</div>
                        <h3>No activity yet</h3>
                        <p>Your transactions and intent changes will appear here</p>
                    </div>
                )}
            </div>
        </div>
    );
}
