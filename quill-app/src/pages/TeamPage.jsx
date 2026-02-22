import { useApp } from '../context/AppContext';
import { motion } from 'framer-motion';
import { ShieldCheck, User } from 'lucide-react';

export default function TeamPage() {
    const { clientAdmins, businessUsers } = useApp();

    return (
        <div className="animate-fade-in">
            <div className="page-header">
                <h1 className="page-header-title">Team & Roles</h1>
                <p className="page-header-sub">Manage your organization's QUILL users and their roles</p>
            </div>

            {/* Client Admins */}
            <div className="section-header">
                <div>
                    <h3 className="section-title" style={{ fontSize: 'var(--text-lg)' }}>
                        <ShieldCheck size={20} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 8 }} />
                        Client Admins
                    </h3>
                    <p className="section-subtitle">Can create budgets, approve allocations, and view all reports</p>
                </div>
                <span className="badge badge-purple">{clientAdmins.length}/5 slots used</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--space-4)', marginBottom: 'var(--space-10)' }}>
                {clientAdmins.map((admin, idx) => (
                    <motion.div
                        key={admin.id}
                        className="card"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.08 }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                            <div className="avatar lg">{admin.avatar}</div>
                            <div>
                                <div style={{ fontWeight: 700 }}>{admin.name}</div>
                                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>{admin.email}</div>
                                <span className="badge badge-gold" style={{ marginTop: 4 }}>{admin.role}</span>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Business Users */}
            <div className="section-header">
                <div>
                    <h3 className="section-title" style={{ fontSize: 'var(--text-lg)' }}>
                        <User size={20} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 8 }} />
                        Business Users
                    </h3>
                    <p className="section-subtitle">Can request allocations and spend against approved budgets</p>
                </div>
                <span className="badge badge-info">{businessUsers.length} members</span>
            </div>

            <div className="table-wrapper">
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    <table>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Department</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {businessUsers.map(user => (
                                <tr key={user.id}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                                            <div className="avatar">{user.avatar}</div>
                                            <span style={{ fontWeight: 600 }}>{user.name}</span>
                                        </div>
                                    </td>
                                    <td style={{ color: 'var(--text-secondary)' }}>{user.email}</td>
                                    <td><span className="badge badge-info">{user.dept}</span></td>
                                    <td><span className="badge badge-success">Active</span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
