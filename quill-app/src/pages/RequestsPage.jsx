import { useApp } from '../context/AppContext';
import { motion } from 'framer-motion';
import { Check, X, Clock, UserCheck } from 'lucide-react';

export default function RequestsPage() {
    const { requests, approveRequest, rejectRequest, clientAdmins } = useApp();

    const getStatusStyle = (status) => {
        switch (status) {
            case 'pending': return 'badge-warning';
            case 'pending_second_approval': return 'badge-gold';
            case 'approved': return 'badge-success';
            case 'rejected': return 'badge-danger';
            default: return 'badge-info';
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'pending': return 'Pending (0/2)';
            case 'pending_second_approval': return 'Awaiting 2nd (1/2)';
            case 'approved': return 'Approved (2/2)';
            case 'rejected': return 'Rejected';
            default: return status;
        }
    };

    // Current admin for demo
    const currentAdmin = 'CA002';

    return (
        <div className="animate-fade-in">
            <div className="page-header">
                <h1 className="page-header-title">Allocation Requests</h1>
                <p className="page-header-sub">Review and approve budget allocation requests from team members</p>
            </div>

            <div style={{ display: 'grid', gap: 'var(--space-6)' }}>
                {requests.map((req, idx) => {
                    const canApprove = !req.approvals.includes(currentAdmin) && req.status !== 'rejected' && req.status !== 'approved';

                    return (
                        <motion.div
                            key={req.id}
                            className={`card approval-card ${req.status === 'approved' ? 'approved' : req.status === 'rejected' ? 'rejected' : ''}`}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'flex-start' }}>
                                    <div className="avatar lg">{req.userAvatar}</div>
                                    <div>
                                        <h4 style={{ fontWeight: 700, fontSize: 'var(--text-lg)' }}>{req.userName}</h4>
                                        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginTop: 2 }}>
                                            {req.purpose}
                                        </p>
                                        <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 8, flexWrap: 'wrap' }}>
                                            <span className="badge badge-purple">{req.budgetTitle}</span>
                                            <span className={`badge ${getStatusStyle(req.status)}`}>
                                                {getStatusLabel(req.status)}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 800 }}>
                                        ₹{req.amount.toLocaleString()}
                                    </div>
                                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginTop: 4 }}>
                                        <Clock size={12} style={{ display: 'inline', verticalAlign: 'middle' }} />{' '}
                                        {new Date(req.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </div>
                                </div>
                            </div>

                            {/* Justification */}
                            <div style={{
                                margin: 'var(--space-4) 0',
                                padding: 'var(--space-3) var(--space-4)',
                                background: 'var(--bg-glass)',
                                borderRadius: 'var(--radius-md)',
                                borderLeft: '3px solid var(--primary-500)',
                            }}>
                                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginBottom: 2 }}>Justification</div>
                                <div style={{ fontSize: 'var(--text-sm)' }}>"{req.justification}"</div>
                            </div>

                            {/* Approval Progress */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
                                <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-secondary)' }}>
                                    Approvals:
                                </div>
                                <div className="approval-dots">
                                    <div className={`approval-dot ${req.approvalCount >= 1 ? 'filled' : ''}`} />
                                    <div className={`approval-dot ${req.approvalCount >= 2 ? 'filled' : ''}`} />
                                </div>
                                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
                                    {req.approvalCount}/2 required
                                </span>
                                {req.approvals.length > 0 && (
                                    <div style={{ display: 'flex', gap: 'var(--space-1)' }}>
                                        {req.approvals.map(adminId => {
                                            const admin = clientAdmins.find(a => a.id === adminId);
                                            return (
                                                <span key={adminId} className="badge badge-success" style={{ gap: 4 }}>
                                                    <UserCheck size={12} /> {admin?.name || adminId}
                                                </span>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* Actions */}
                            {req.status !== 'approved' && req.status !== 'rejected' && (
                                <div style={{ display: 'flex', gap: 'var(--space-3)', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--border-secondary)' }}>
                                    <button
                                        className="btn btn-success"
                                        onClick={() => approveRequest(req.id, currentAdmin)}
                                        disabled={!canApprove}
                                    >
                                        <Check size={16} /> {canApprove ? 'Approve' : 'Already Submitted'}
                                    </button>
                                    <button
                                        className="btn btn-danger"
                                        onClick={() => rejectRequest(req.id)}
                                    >
                                        <X size={16} /> Reject
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    );
                })}

                {requests.length === 0 && (
                    <div className="empty-state">
                        <div className="empty-state-icon">📋</div>
                        <h3>No pending requests</h3>
                        <p>Allocation requests from team members will appear here</p>
                    </div>
                )}
            </div>
        </div>
    );
}
