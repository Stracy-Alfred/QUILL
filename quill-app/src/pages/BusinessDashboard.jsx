import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
    ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';
import { BUDGET_USAGE_TIMELINE, BUSINESS_SPENDING_BY_USER } from '../store/mockData';
import {
    Wallet, Users, FileCheck, Target, ArrowRight,
    TrendingUp, AlertCircle, Plus,
} from 'lucide-react';

export default function BusinessDashboard() {
    const { businessProfile, budgets, requests, clientAdmins, businessUsers } = useApp();
    const navigate = useNavigate();

    const pendingCount = requests.filter(r => r.status === 'pending' || r.status === 'pending_second_approval').length;

    const budgetPie = budgets.map(b => ({
        name: b.title,
        value: b.used,
        color: b.category === 'ai_subscription' ? '#6366f1' : '#0ea5e9',
    }));

    const CustomTooltip = ({ active, payload, label }) => {
        if (!active || !payload) return null;
        return (
            <div style={{
                background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)',
                borderRadius: 'var(--radius-lg)', padding: '12px 16px', fontSize: 'var(--text-xs)',
            }}>
                <div style={{ fontWeight: 600, marginBottom: 4 }}>{label}</div>
                {payload.map((p, i) => (
                    <div key={i} style={{ color: p.color }}>
                        {p.name}: ₹{p.value?.toLocaleString()}
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="animate-fade-in">
            <div className="page-header">
                <h1 className="page-header-title">{businessProfile.name}</h1>
                <p className="page-header-sub">Client Admin Dashboard • {businessProfile.sector}</p>
            </div>

            {/* Stat Cards */}
            <div className="stat-cards" style={{ marginBottom: 'var(--space-8)' }}>
                <motion.div className="card stat-card" whileHover={{ y: -2 }}>
                    <div className="stat-card-icon gold"><Wallet size={22} /></div>
                    <div className="stat-card-label">Monthly Budget</div>
                    <div className="stat-card-value">₹{(businessProfile.monthlyBudget / 100000).toFixed(1)}L</div>
                </motion.div>

                <motion.div className="card stat-card" whileHover={{ y: -2 }}>
                    <div className="stat-card-icon purple"><Target size={22} /></div>
                    <div className="stat-card-label">Allocated</div>
                    <div className="stat-card-value">₹{(businessProfile.allocated / 1000).toFixed(0)}K</div>
                    <div className="stat-card-change up">{Math.round(businessProfile.allocated / businessProfile.monthlyBudget * 100)}% of budget</div>
                </motion.div>

                <motion.div className="card stat-card" whileHover={{ y: -2 }}>
                    <div className="stat-card-icon amber"><AlertCircle size={22} /></div>
                    <div className="stat-card-label">Open Requests</div>
                    <div className="stat-card-value">{pendingCount}</div>
                    <div className="stat-card-change down">Awaiting approval</div>
                </motion.div>

                <motion.div className="card stat-card" whileHover={{ y: -2 }}>
                    <div className="stat-card-icon green"><Users size={22} /></div>
                    <div className="stat-card-label">Team</div>
                    <div className="stat-card-value">{clientAdmins.length + businessUsers.length}</div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginTop: 4 }}>
                        {clientAdmins.length} admins • {businessUsers.length} users
                    </div>
                </motion.div>
            </div>

            {/* Charts */}
            <div className="grid-2" style={{ marginBottom: 'var(--space-8)' }}>
                <div className="card">
                    <h3 style={{ fontWeight: 700, fontSize: 'var(--text-lg)', marginBottom: 'var(--space-4)' }}>
                        Budget Usage Over Time
                    </h3>
                    <div className="chart-container" style={{ height: 280 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={BUDGET_USAGE_TIMELINE}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                <XAxis dataKey="week" tick={{ fontSize: 11 }} />
                                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `₹${v / 1000}k`} />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend wrapperStyle={{ fontSize: 12 }} />
                                <Bar dataKey="aiTools" name="AI Tools" fill="#6366f1" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="cloud" name="Cloud" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="card">
                    <h3 style={{ fontWeight: 700, fontSize: 'var(--text-lg)', marginBottom: 'var(--space-4)' }}>
                        Spending by Employee
                    </h3>
                    <div className="chart-container" style={{ height: 280 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={BUSINESS_SPENDING_BY_USER} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={v => `₹${v / 1000}k`} />
                                <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 11 }} />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend wrapperStyle={{ fontSize: 12 }} />
                                <Bar dataKey="aiTools" name="AI Tools" fill="#6366f1" radius={[0, 4, 4, 0]} stackId="a" />
                                <Bar dataKey="cloud" name="Cloud" fill="#0ea5e9" radius={[0, 4, 4, 0]} stackId="a" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Budget Cards */}
            <div className="section-header">
                <div>
                    <h3 className="section-title">Active Budgets</h3>
                    <p className="section-subtitle">Project and category budgets with intent enforcement</p>
                </div>
                <button className="btn btn-primary" onClick={() => navigate('/business/create-budget')}>
                    <Plus size={16} /> Create Budget
                </button>
            </div>

            <div style={{ display: 'grid', gap: 'var(--space-4)', marginBottom: 'var(--space-8)' }}>
                {budgets.map((budget, idx) => {
                    const pct = Math.round((budget.used / budget.totalAmount) * 100);
                    return (
                        <motion.div
                            key={budget.id}
                            className="card"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-4)' }}>
                                <div>
                                    <h4 style={{ fontWeight: 700, fontSize: 'var(--text-lg)' }}>{budget.title}</h4>
                                    <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 4 }}>
                                        <span className="badge badge-purple">{budget.period}</span>
                                        {budget.requiresDualApproval && <span className="badge badge-gold">Dual Approval</span>}
                                        <span className="badge badge-success">{budget.status}</span>
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 800 }}>₹{(budget.used / 1000).toFixed(0)}K</div>
                                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>of ₹{(budget.totalAmount / 1000).toFixed(0)}K</div>
                                </div>
                            </div>

                            <div className="progress-bar" style={{ height: 10, marginBottom: 'var(--space-4)' }}>
                                <div
                                    className={`progress-bar-fill ${pct > 80 ? 'amber' : 'blue'}`}
                                    style={{ width: `${pct}%` }}
                                />
                            </div>

                            <div style={{ display: 'flex', gap: 'var(--space-6)', fontSize: 'var(--text-sm)' }}>
                                <div>
                                    <span style={{ color: 'var(--text-secondary)' }}>Allocated: </span>
                                    <span style={{ fontWeight: 600 }}>₹{budget.allocated.toLocaleString()}</span>
                                </div>
                                <div>
                                    <span style={{ color: 'var(--text-secondary)' }}>Remaining: </span>
                                    <span style={{ fontWeight: 600, color: 'var(--accent-400)' }}>
                                        ₹{(budget.totalAmount - budget.allocated).toLocaleString()}
                                    </span>
                                </div>
                                <div>
                                    <span style={{ color: 'var(--text-secondary)' }}>Allocations: </span>
                                    <span style={{ fontWeight: 600 }}>{budget.allocations.length}</span>
                                </div>
                            </div>

                            <div style={{
                                display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap', marginTop: 'var(--space-3)',
                            }}>
                                {budget.allowedMerchants.map(m => (
                                    <span key={m} className="badge badge-info" style={{ fontSize: 11 }}>
                                        {m}
                                    </span>
                                ))}
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Pending Requests Preview */}
            {pendingCount > 0 && (
                <div className="card" style={{ borderLeft: '3px solid var(--warning-500)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h4 style={{ fontWeight: 700 }}>⏳ {pendingCount} Pending Request{pendingCount > 1 ? 's' : ''}</h4>
                            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginTop: 4 }}>
                                Allocation requests awaiting your approval
                            </p>
                        </div>
                        <button className="btn btn-primary btn-sm" onClick={() => navigate('/business/requests')}>
                            Review <ArrowRight size={14} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
