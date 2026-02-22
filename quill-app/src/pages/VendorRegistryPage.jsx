import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { verifyVendor } from '../utils/vendorVerifier';
import { VENDOR_CATEGORIES } from '../store/mockData';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus, X, CheckCircle, AlertTriangle, XCircle,
    ShieldCheck, Clock, Globe, Search, UserCheck, Info,
} from 'lucide-react';

export default function VendorRegistryPage() {
    const { vendors, addVendor, approveVendor, rejectVendor, addToast } = useApp();
    const [showModal, setShowModal] = useState(false);
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [form, setForm] = useState({ name: '', website: '', category: 'software', country: '', description: '' });
    const [verifying, setVerifying] = useState(false);
    const [verifyResult, setVerifyResult] = useState(null);
    const [showConfirmReject, setShowConfirmReject] = useState(null); // vendorId to confirm reject override

    const filtered = vendors.filter(v => {
        if (filter !== 'all' && v.status !== filter) return false;
        if (search && !v.name.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
    });

    const pendingCount = vendors.filter(v => v.status === 'pending_review').length;

    const statusConfig = {
        verified: { icon: <CheckCircle size={14} />, badge: 'badge-success', label: 'Verified' },
        pending_review: { icon: <Clock size={14} />, badge: 'badge-warning', label: 'Under Review' },
        rejected: { icon: <XCircle size={14} />, badge: 'badge-danger', label: 'Rejected' },
    };

    const handleVerify = async () => {
        if (!form.name.trim()) return;
        setVerifying(true);
        setVerifyResult(null);
        const result = await verifyVendor(form);
        setVerifyResult(result);
        setVerifying(false);
    };

    const handleAdd = () => {
        if (!verifyResult) return;
        addVendor({
            name: verifyResult.normalizedName,
            website: form.website,
            category: verifyResult.normalizedCategory,
            country: form.country,
            description: form.description,
            status: verifyResult.status === 'approved' ? 'verified' : verifyResult.status === 'needs_manual_review' ? 'pending_review' : 'rejected',
            confidence: verifyResult.confidence,
            explanation: verifyResult.explanation,
            addedBy: 'CA001',
            addedByName: 'Admin',
            rejectionReason: verifyResult.status === 'rejected' ? verifyResult.reasons.join('. ') : undefined,
        });
        setShowModal(false);
        setForm({ name: '', website: '', category: 'software', country: '', description: '' });
        setVerifyResult(null);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setForm({ name: '', website: '', category: 'software', country: '', description: '' });
        setVerifyResult(null);
        setVerifying(false);
    };

    // Admins can override "needs review" but NOT "rejected" without confirmation dialog
    const handleOverrideApprove = (vendorId) => {
        const vendor = vendors.find(v => v.id === vendorId);
        if (vendor?.status === 'rejected') {
            // Rejected vendors need explicit confirmation
            setShowConfirmReject(vendorId);
        } else {
            approveVendor(vendorId);
        }
    };

    const handleConfirmOverride = () => {
        if (showConfirmReject) {
            approveVendor(showConfirmReject);
            setShowConfirmReject(null);
        }
    };

    // Helper to build verification explanation string for UI
    const getVerificationLine = (result) => {
        if (!result) return '';
        const { status, confidence, explanation } = result;
        if (status === 'approved') {
            return `Verified: ${explanation || 'Domain and name match.'} LLM confidence ${Math.round(confidence * 100)}%.`;
        }
        if (status === 'needs_manual_review') {
            return `Under review — Admin approval required. ${explanation || ''} LLM confidence ${Math.round(confidence * 100)}%.`;
        }
        return `Rejected: ${explanation || 'Domain pattern or LLM analysis suggests this is not a legitimate vendor.'}`;
    };

    return (
        <div className="animate-fade-in">
            <div className="page-header">
                <div>
                    <h1 className="page-header-title">Vendor Registry</h1>
                    <p className="page-header-sub">Manage verified vendors for all business intents & budgets</p>
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                    {pendingCount > 0 && (
                        <span className="badge badge-warning" style={{ fontSize: 'var(--text-sm)', padding: '6px 12px' }}>
                            ⏳ {pendingCount} pending review
                        </span>
                    )}
                    <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                        <Plus size={16} /> Add Vendor
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', gap: 'var(--space-3)', marginBottom: 'var(--space-6)', flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
                    <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
                    <input className="input" style={{ paddingLeft: 36 }} placeholder="Search vendors..." value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                {['all', 'verified', 'pending_review', 'rejected'].map(f => (
                    <button key={f} className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setFilter(f)}>
                        {f === 'all' ? 'All' : f === 'pending_review' ? 'Under Review' : f.charAt(0).toUpperCase() + f.slice(1)}
                        <span className="badge badge-info" style={{ marginLeft: 4, fontSize: 10 }}>
                            {vendors.filter(v => f === 'all' ? true : v.status === f).length}
                        </span>
                    </button>
                ))}
            </div>

            {/* Vendor Table */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div className="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>Vendor</th>
                                <th>Category</th>
                                <th>Status</th>
                                <th>Confidence</th>
                                <th>Added By</th>
                                <th>Used In</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((vendor, idx) => {
                                const sc = statusConfig[vendor.status] || statusConfig.pending_review;
                                return (
                                    <motion.tr
                                        key={vendor.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: idx * 0.03 }}
                                        style={vendor.status === 'pending_review' ? { background: 'rgba(251,191,36,0.04)' } : undefined}
                                    >
                                        <td>
                                            <div>
                                                <div style={{ fontWeight: 600 }}>{vendor.name}</div>
                                                {vendor.website && (
                                                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                                                        <Globe size={10} /> {vendor.website.replace('https://', '')}
                                                    </div>
                                                )}
                                                {!vendor.website && (
                                                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--danger-400)' }}>No URL</div>
                                                )}
                                            </div>
                                        </td>
                                        <td><span className="badge badge-purple">{vendor.category.replace(/_/g, ' ')}</span></td>
                                        <td><span className={`badge ${sc.badge}`} style={{ gap: 4 }}>{sc.icon} {sc.label}</span></td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <div className="progress-bar" style={{ height: 6, width: 60 }}>
                                                    <div
                                                        className={`progress-bar-fill ${vendor.confidence >= 0.8 ? 'green' : vendor.confidence >= 0.5 ? 'amber' : 'red'}`}
                                                        style={{ width: `${vendor.confidence * 100}%` }}
                                                    />
                                                </div>
                                                <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600 }}>{Math.round(vendor.confidence * 100)}%</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                {vendor.addedBy === 'system' ? (
                                                    <span className="badge badge-info" style={{ gap: 4 }}><ShieldCheck size={10} /> System</span>
                                                ) : (
                                                    <span className="badge badge-gold" style={{ gap: 4 }}><UserCheck size={10} /> {vendor.addedByName}</span>
                                                )}
                                            </div>
                                        </td>
                                        <td>
                                            <span style={{ fontWeight: 600 }}>{vendor.usedInIntents}</span>
                                            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}> intent{vendor.usedInIntents !== 1 ? 's' : ''}</span>
                                        </td>
                                        <td>
                                            {vendor.status === 'pending_review' && (
                                                <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                                                    <button className="btn btn-success btn-sm" onClick={() => handleOverrideApprove(vendor.id)}>
                                                        <CheckCircle size={12} /> Approve
                                                    </button>
                                                    <button className="btn btn-danger btn-sm" onClick={() => rejectVendor(vendor.id, 'Rejected by admin after manual review')}>
                                                        <XCircle size={12} /> Reject
                                                    </button>
                                                </div>
                                            )}
                                            {vendor.status === 'rejected' && (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--danger-400)' }} title={vendor.rejectionReason}>
                                                        ⓘ Reason
                                                    </span>
                                                    <button
                                                        className="btn btn-ghost btn-sm"
                                                        style={{ fontSize: 'var(--text-xs)' }}
                                                        onClick={() => handleOverrideApprove(vendor.id)}
                                                        title="Override rejection (requires confirmation)"
                                                    >
                                                        Override
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </motion.tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Confirm Override Dialog */}
            <AnimatePresence>
                {showConfirmReject && (
                    <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowConfirmReject(null)}>
                        <motion.div
                            className="modal-content"
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            onClick={e => e.stopPropagation()}
                            style={{ maxWidth: 440 }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 'var(--space-5)' }}>
                                <div style={{
                                    width: 44, height: 44, borderRadius: 'var(--radius-lg)',
                                    background: 'rgba(239,68,68,0.1)', display: 'flex',
                                    alignItems: 'center', justifyContent: 'center',
                                }}>
                                    <AlertTriangle size={22} style={{ color: 'var(--danger-400)' }} />
                                </div>
                                <div>
                                    <div style={{ fontWeight: 700, fontSize: 'var(--text-lg)' }}>Override Rejection?</div>
                                    <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                                        This vendor was rejected by the verification pipeline.
                                    </div>
                                </div>
                            </div>
                            <p style={{
                                fontSize: 'var(--text-sm)', color: 'var(--text-secondary)',
                                lineHeight: 1.6, marginBottom: 'var(--space-5)',
                                padding: 'var(--space-4)', background: 'rgba(239,68,68,0.04)',
                                borderRadius: 'var(--radius-md)', border: '1px solid rgba(239,68,68,0.15)',
                            }}>
                                Overriding a rejected vendor means bypassing the automated verification.
                                Only do this if you have independently verified the vendor's legitimacy.
                                This action will be logged.
                            </p>
                            <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                                <button className="btn btn-danger" onClick={handleConfirmOverride}>
                                    <CheckCircle size={16} /> Yes, Override & Approve
                                </button>
                                <button className="btn btn-ghost" onClick={() => setShowConfirmReject(null)}>
                                    Cancel
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Add Vendor Modal */}
            <AnimatePresence>
                {showModal && (
                    <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={handleCloseModal}>
                        <motion.div
                            className="modal-content"
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            onClick={e => e.stopPropagation()}
                            style={{ maxWidth: 560 }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
                                <h3 style={{ fontWeight: 700, fontSize: 'var(--text-xl)' }}>Add Vendor to Registry</h3>
                                <button className="btn btn-ghost btn-icon sm" onClick={handleCloseModal}><X size={18} /></button>
                            </div>

                            <div className="auth-form" style={{ gap: 'var(--space-4)' }}>
                                <div className="input-group">
                                    <label className="input-label">Vendor Name *</label>
                                    <input className="input" placeholder="e.g., Figma, Linear, Stripe" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                                </div>
                                <div className="input-group">
                                    <label className="input-label">Website URL (strongly recommended)</label>
                                    <input className="input" placeholder="https://vendor.com" value={form.website} onChange={e => setForm({ ...form, website: e.target.value })} />
                                </div>
                                <div className="grid-2" style={{ gap: 'var(--space-4)' }}>
                                    <div className="input-group">
                                        <label className="input-label">Category *</label>
                                        <select className="input" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                                            {VENDOR_CATEGORIES.map(c => (
                                                <option key={c} value={c}>{c.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="input-group">
                                        <label className="input-label">Country</label>
                                        <input className="input" placeholder="e.g., USA, India" value={form.country} onChange={e => setForm({ ...form, country: e.target.value })} />
                                    </div>
                                </div>
                                <div className="input-group">
                                    <label className="input-label">Description *</label>
                                    <textarea className="input" placeholder="Short description of what this vendor does..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} style={{ resize: 'vertical' }} />
                                </div>

                                <button className="btn btn-primary btn-lg" style={{ width: '100%' }} onClick={handleVerify} disabled={!form.name.trim() || !form.description.trim() || verifying}>
                                    {verifying ? (
                                        <><div className="typing-indicator"><span /><span /><span /></div> Verifying via QUILL AI...</>
                                    ) : (
                                        <><ShieldCheck size={16} /> Verify & Add</>
                                    )}
                                </button>

                                <AnimatePresence>
                                    {verifyResult && (
                                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                            style={{
                                                padding: 'var(--space-5)', borderRadius: 'var(--radius-lg)',
                                                border: `2px solid ${verifyResult.status === 'approved' ? 'var(--accent-400)' : verifyResult.status === 'needs_manual_review' ? 'var(--warning-400)' : 'var(--danger-400)'}`,
                                                background: verifyResult.status === 'approved' ? 'rgba(16,185,129,0.06)' : verifyResult.status === 'needs_manual_review' ? 'rgba(251,191,36,0.06)' : 'rgba(248,113,113,0.06)',
                                            }}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 'var(--space-3)' }}>
                                                {verifyResult.status === 'approved' && <CheckCircle size={20} style={{ color: 'var(--accent-400)' }} />}
                                                {verifyResult.status === 'needs_manual_review' && <AlertTriangle size={20} style={{ color: 'var(--warning-400)' }} />}
                                                {verifyResult.status === 'rejected' && <XCircle size={20} style={{ color: 'var(--danger-400)' }} />}
                                                <span style={{ fontWeight: 700 }}>
                                                    {verifyResult.status === 'approved' ? '✅ Vendor Verified' : verifyResult.status === 'needs_manual_review' ? '⚠️ Needs Manual Review' : '🚫 Verification Failed'}
                                                </span>
                                                <span style={{ marginLeft: 'auto', fontWeight: 700, fontSize: 'var(--text-sm)' }}>
                                                    {Math.round(verifyResult.confidence * 100)}%
                                                </span>
                                            </div>

                                            {/* Evidence-based explanation */}
                                            <div style={{
                                                fontSize: 'var(--text-sm)', color: 'var(--text-secondary)',
                                                padding: 'var(--space-3)', borderRadius: 'var(--radius-md)',
                                                background: 'rgba(255,255,255,0.03)',
                                                marginBottom: 'var(--space-3)', lineHeight: 1.5,
                                                display: 'flex', alignItems: 'flex-start', gap: 8,
                                            }}>
                                                <Info size={14} style={{ marginTop: 2, flexShrink: 0, color: 'var(--text-tertiary)' }} />
                                                {getVerificationLine(verifyResult)}
                                            </div>

                                            {/* Risk flags */}
                                            {verifyResult.llmOutput?.risk_flags?.length > 0 && (
                                                <div style={{
                                                    display: 'flex', flexWrap: 'wrap', gap: 4,
                                                    marginBottom: 'var(--space-3)',
                                                }}>
                                                    {verifyResult.llmOutput.risk_flags.map((flag, i) => (
                                                        <span key={i} className="badge badge-danger" style={{ fontSize: 10 }}>
                                                            ⚠ {flag.replace(/_/g, ' ')}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Normalized domain shown */}
                                            {verifyResult.normalizedDomain && (
                                                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginBottom: 'var(--space-3)' }}>
                                                    Normalized domain: <strong>{verifyResult.normalizedDomain}</strong>
                                                    {verifyResult.fromCache && <span className="badge badge-info" style={{ marginLeft: 8, fontSize: 9 }}>cached</span>}
                                                </div>
                                            )}

                                            <ul style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', listStyle: 'disc', paddingLeft: 20, marginBottom: 'var(--space-4)' }}>
                                                {verifyResult.reasons.map((r, i) => <li key={i}>{r}</li>)}
                                            </ul>

                                            {verifyResult.status !== 'rejected' && (
                                                <button className="btn btn-success" style={{ width: '100%' }} onClick={handleAdd}>
                                                    <CheckCircle size={16} /> {verifyResult.status === 'approved' ? 'Add to Registry' : 'Submit for Review'}
                                                </button>
                                            )}
                                            {verifyResult.status === 'rejected' && (
                                                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--danger-400)', fontWeight: 600, textAlign: 'center' }}>
                                                    Domain pattern or LLM analysis suggests this is not a legitimate vendor. Check URL and try again.
                                                </p>
                                            )}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
