import { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { motion } from 'framer-motion';
import {
    Search, Filter, CreditCard, Target, Store, FileCheck,
    CheckCircle, AlertTriangle, XCircle, Clock, Eye, Download,
} from 'lucide-react';

export default function AdminLogsPage() {
    const { activityLogs, merchants, businessUsers, budgets } = useApp();
    const [tab, setTab] = useState('all');
    const [userFilter, setUserFilter] = useState('all');
    const [outcomeFilter, setOutcomeFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [expandedId, setExpandedId] = useState(null);

    // All logs, sorted newest first
    const allLogs = useMemo(() =>
        [...activityLogs].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)),
        [activityLogs]
    );

    const filteredLogs = allLogs.filter(l => {
        if (tab !== 'all' && l.type !== tab) return false;
        if (userFilter !== 'all' && l.userId !== userFilter) return false;
        if (outcomeFilter !== 'all') {
            if (outcomeFilter === 'allowed' && l.outcome !== 'allowed') return false;
            if (outcomeFilter === 'blocked' && l.outcome !== 'blocked') return false;
            if (outcomeFilter === 'warned' && l.outcome !== 'warn_and_allow' && l.action !== 'warned') return false;
        }
        if (search && !l.details.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
    });

    const typeConfig = {
        transaction: { icon: <CreditCard size={16} />, color: 'var(--primary-400)', label: 'Transaction' },
        intent: { icon: <Target size={16} />, color: 'var(--accent-400)', label: 'Intent' },
        vendor: { icon: <Store size={16} />, color: 'var(--rupee-gold)', label: 'Vendor' },
        request: { icon: <FileCheck size={16} />, color: 'var(--info-400)', label: 'Request' },
    };

    const actionBadge = (log) => {
        if (log.type === 'transaction') {
            if (log.outcome === 'allowed') return 'badge-success';
            if (log.outcome === 'blocked') return 'badge-danger';
            if (log.outcome === 'warn_and_allow') return 'badge-warning';
        }
        if (log.action === 'approved') return 'badge-success';
        if (log.action === 'rejected') return 'badge-danger';
        if (log.action === 'submitted') return 'badge-info';
        if (log.action === 'added') return 'badge-purple';
        return 'badge-info';
    };

    const tabs = [
        { key: 'all', label: 'All Logs' },
        { key: 'transaction', label: 'Transactions' },
        { key: 'request', label: 'Requests' },
        { key: 'vendor', label: 'Vendors' },
        { key: 'intent', label: 'Intents' },
    ];

    const uniqueUsers = [...new Set(allLogs.map(l => l.userId))].map(uid => ({
        id: uid,
        name: allLogs.find(l => l.userId === uid)?.userName || uid,
    }));

    // Stats
    const txnLogs = allLogs.filter(l => l.type === 'transaction');
    const totalAllowed = txnLogs.filter(l => l.outcome === 'allowed').length;
    const totalBlocked = txnLogs.filter(l => l.outcome === 'blocked').length;
    const totalWarned = txnLogs.filter(l => l.action === 'warned' || l.outcome === 'warn_and_allow').length;

    return (
        <div className="animate-fade-in">
            <div className="page-header">
                <div>
                    <h1 className="page-header-title">Logs & Audit Trail</h1>
                    <p className="page-header-sub">Complete audit trail of all business activity</p>
                </div>
            </div>

            {/* Stats Row */}
            <div className="stat-cards" style={{ marginBottom: 'var(--space-6)' }}>
                <div className="card stat-card" style={{ padding: 'var(--space-4)' }}>
                    <div className="stat-card-label">Total Events</div>
                    <div className="stat-card-value" style={{ fontSize: 'var(--text-2xl)' }}>{allLogs.length}</div>
                </div>
                <div className="card stat-card" style={{ padding: 'var(--space-4)' }}>
                    <div className="stat-card-label" style={{ color: 'var(--accent-400)' }}>✓ Allowed</div>
                    <div className="stat-card-value" style={{ fontSize: 'var(--text-2xl)' }}>{totalAllowed}</div>
                </div>
                <div className="card stat-card" style={{ padding: 'var(--space-4)' }}>
                    <div className="stat-card-label" style={{ color: 'var(--warning-400)' }}>⚠ Warned</div>
                    <div className="stat-card-value" style={{ fontSize: 'var(--text-2xl)' }}>{totalWarned}</div>
                </div>
                <div className="card stat-card" style={{ padding: 'var(--space-4)' }}>
                    <div className="stat-card-label" style={{ color: 'var(--danger-400)' }}>✗ Blocked</div>
                    <div className="stat-card-value" style={{ fontSize: 'var(--text-2xl)' }}>{totalBlocked}</div>
                </div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-4)', borderBottom: '1px solid var(--border-secondary)', paddingBottom: 'var(--space-2)' }}>
                {tabs.map(t => (
                    <button key={t.key} className={`btn btn-sm ${tab === t.key ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setTab(t.key)}>
                        {t.label}
                        <span className="badge badge-info" style={{ marginLeft: 4, fontSize: 10 }}>
                            {t.key === 'all' ? allLogs.length : allLogs.filter(l => l.type === t.key).length}
                        </span>
                    </button>
                ))}
            </div>

            {/* Filters Row */}
            <div style={{ display: 'flex', gap: 'var(--space-3)', marginBottom: 'var(--space-6)', flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
                    <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
                    <input className="input" style={{ paddingLeft: 36 }} placeholder="Search logs..." value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <select className="input" style={{ width: 'auto' }} value={userFilter} onChange={e => setUserFilter(e.target.value)}>
                    <option value="all">All Users</option>
                    {uniqueUsers.map(u => (
                        <option key={u.id} value={u.id}>{u.name}</option>
                    ))}
                </select>
                <select className="input" style={{ width: 'auto' }} value={outcomeFilter} onChange={e => setOutcomeFilter(e.target.value)}>
                    <option value="all">All Outcomes</option>
                    <option value="allowed">Allowed</option>
                    <option value="warned">Warned</option>
                    <option value="blocked">Blocked</option>
                </select>
            </div>

            {/* Log Table */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div className="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>Time</th>
                                <th>User</th>
                                <th>Type</th>
                                <th>Details</th>
                                <th>Amount</th>
                                <th>Status</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredLogs.map((log, idx) => {
                                const tc = typeConfig[log.type] || typeConfig.transaction;
                                const expanded = expandedId === log.id;

                                return (
                                    <>
                                        <motion.tr
                                            key={log.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: idx * 0.02 }}
                                            onClick={() => setExpandedId(expanded ? null : log.id)}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            <td style={{ fontSize: 'var(--text-xs)', whiteSpace: 'nowrap' }}>
                                                {new Date(log.timestamp).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                    <div className="avatar sm">{log.userName?.slice(0, 2).toUpperCase()}</div>
                                                    <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>{log.userName}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <span className="badge badge-purple" style={{ gap: 4, fontSize: 11 }}>
                                                    {tc.icon} {tc.label}
                                                </span>
                                            </td>
                                            <td style={{ fontSize: 'var(--text-sm)', maxWidth: 300 }}>
                                                <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{log.details}</div>
                                            </td>
                                            <td style={{ fontWeight: 600 }}>
                                                {log.amount ? `₹${log.amount.toLocaleString()}` : '—'}
                                            </td>
                                            <td>
                                                <span className={`badge ${actionBadge(log)}`}>
                                                    {log.type === 'transaction' ? (log.outcome?.replace(/_/g, ' ') || log.action) : log.action}
                                                </span>
                                            </td>
                                            <td>
                                                <Eye size={14} style={{ color: 'var(--text-tertiary)' }} />
                                            </td>
                                        </motion.tr>
                                        {expanded && (
                                            <tr key={log.id + '-detail'}>
                                                <td colSpan={7} style={{ padding: 0 }}>
                                                    <div style={{ padding: 'var(--space-4)', background: 'var(--bg-glass)' }}>
                                                        <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>
                                                            Full Audit Record
                                                        </div>
                                                        <pre className="intent-preview-json" style={{ fontSize: 11, margin: 0 }}>
                                                            {JSON.stringify({
                                                                event_id: log.id,
                                                                type: log.type,
                                                                action: log.action,
                                                                timestamp: log.timestamp,
                                                                user: { id: log.userId, name: log.userName },
                                                                ...(log.merchant && { merchant: { key: log.merchant, name: merchants[log.merchant]?.name } }),
                                                                ...(log.amount && { amount: log.amount, currency: 'INR' }),
                                                                ...(log.outcome && { outcome: log.outcome }),
                                                                ...(log.intentId && { intent_id: log.intentId }),
                                                                ...(log.budgetId && { budget_id: log.budgetId }),
                                                                ...(log.requestId && { request_id: log.requestId }),
                                                                ...(log.onIntent !== undefined && { on_intent: log.onIntent }),
                                                                quill_audit: true,
                                                                immutable: true,
                                                            }, null, 2)}
                                                        </pre>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {filteredLogs.length === 0 && (
                <div className="empty-state" style={{ marginTop: 'var(--space-6)' }}>
                    <div className="empty-state-icon">🔍</div>
                    <h3>No matching logs</h3>
                    <p>Try adjusting your filters</p>
                </div>
            )}
        </div>
    );
}
