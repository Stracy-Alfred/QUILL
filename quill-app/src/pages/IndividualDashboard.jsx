import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area,
    XAxis, YAxis, Tooltip, CartesianGrid, Legend,
} from 'recharts';
import { INDIVIDUAL_SPENDING_TIMELINE, CATEGORY_SPENDING } from '../store/mockData';
import {
    Wallet, Target, AlertTriangle, TrendingUp,
    ArrowRight, Plus,
} from 'lucide-react';

export default function IndividualDashboard() {
    const { intents } = useApp();
    const navigate = useNavigate();

    const totalSpend = CATEGORY_SPENDING.reduce((a, b) => a + b.value, 0);
    const activeIntents = intents.filter(i => i.status === 'active').length;
    const warnings = intents.filter(i => i.currentSpend > i.warningThreshold).length;

    const getProgressColor = (intent) => {
        const pct = (intent.currentSpend / intent.monthlyCap) * 100;
        if (pct >= 100) return 'red';
        if (pct >= 50) return 'amber';
        return 'green';
    };

    const CustomTooltip = ({ active, payload, label }) => {
        if (!active || !payload) return null;
        return (
            <div style={{
                background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)',
                borderRadius: 'var(--radius-lg)', padding: '12px 16px', fontSize: 'var(--text-xs)',
            }}>
                <div style={{ fontWeight: 600, marginBottom: 4 }}>{label}</div>
                {payload.map((p, i) => (
                    <div key={i} style={{ color: p.color, display: 'flex', justifyContent: 'space-between', gap: 16 }}>
                        <span>{p.name}</span>
                        <span style={{ fontWeight: 600 }}>₹{p.value?.toLocaleString()}</span>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="animate-fade-in">
            <div className="page-header">
                <h1 className="page-header-title">Dashboard</h1>
                <p className="page-header-sub">Your spending overview for February 2026</p>
            </div>

            {/* Stat Cards */}
            <div className="stat-cards" style={{ marginBottom: 'var(--space-8)' }}>
                <motion.div className="card stat-card" whileHover={{ y: -2 }}>
                    <div className="stat-card-icon gold">
                        <Wallet size={22} />
                    </div>
                    <div className="stat-card-label">Total Spending</div>
                    <div className="stat-card-value">₹{totalSpend.toLocaleString()}</div>
                    <div className="stat-card-change up">↑ 12% vs last month</div>
                </motion.div>

                <motion.div className="card stat-card" whileHover={{ y: -2 }}>
                    <div className="stat-card-icon purple">
                        <Target size={22} />
                    </div>
                    <div className="stat-card-label">Active Intents</div>
                    <div className="stat-card-value">{activeIntents}</div>
                </motion.div>

                <motion.div className="card stat-card" whileHover={{ y: -2 }}>
                    <div className="stat-card-icon amber">
                        <AlertTriangle size={22} />
                    </div>
                    <div className="stat-card-label">Warnings</div>
                    <div className="stat-card-value">{warnings}</div>
                    <div className="stat-card-change down">Thresholds triggered</div>
                </motion.div>

                <motion.div className="card stat-card" whileHover={{ y: -2 }}>
                    <div className="stat-card-icon green">
                        <TrendingUp size={22} />
                    </div>
                    <div className="stat-card-label">Top Category</div>
                    <div className="stat-card-value" style={{ fontSize: 'var(--text-xl)' }}>Food</div>
                    <div className="stat-card-change down">₹6,200 this month</div>
                </motion.div>
            </div>

            {/* Charts Row */}
            <div className="grid-2" style={{ marginBottom: 'var(--space-8)' }}>
                {/* Spending Timeline */}
                <div className="card">
                    <div className="section-header" style={{ marginBottom: 'var(--space-4)' }}>
                        <div>
                            <h3 className="section-title" style={{ fontSize: 'var(--text-lg)' }}>Spending Timeline</h3>
                            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>Daily spending by category</p>
                        </div>
                    </div>
                    <div className="chart-container" style={{ height: 280 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={INDIVIDUAL_SPENDING_TIMELINE}>
                                <defs>
                                    <linearGradient id="colorFood" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorShopping" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#ec4899" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `₹${v / 1000}k`} />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend wrapperStyle={{ fontSize: 12 }} />
                                <Area type="monotone" dataKey="food" name="Food" stroke="#f97316" fillOpacity={1} fill="url(#colorFood)" />
                                <Area type="monotone" dataKey="shopping" name="Shopping" stroke="#ec4899" fillOpacity={1} fill="url(#colorShopping)" />
                                <Area type="monotone" dataKey="entertainment" name="Entertainment" stroke="#a855f7" fillOpacity={0.1} fill="#a855f7" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Category Pie */}
                <div className="card">
                    <div className="section-header" style={{ marginBottom: 'var(--space-4)' }}>
                        <div>
                            <h3 className="section-title" style={{ fontSize: 'var(--text-lg)' }}>Category Split</h3>
                            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>Where your money goes</p>
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-6)' }}>
                        <div className="chart-container" style={{ height: 220, width: 220, flexShrink: 0 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={CATEGORY_SPENDING}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={90}
                                        paddingAngle={3}
                                        dataKey="value"
                                    >
                                        {CATEGORY_SPENDING.map((entry, i) => (
                                            <Cell key={i} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={v => `₹${v.toLocaleString()}`} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div style={{ flex: 1 }}>
                            {CATEGORY_SPENDING.map((cat, i) => (
                                <div key={i} style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    padding: '8px 0', borderBottom: '1px solid var(--border-secondary)',
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <div style={{ width: 10, height: 10, borderRadius: '50%', background: cat.color }} />
                                        <span style={{ fontSize: 'var(--text-sm)' }}>{cat.name}</span>
                                    </div>
                                    <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>₹{cat.value.toLocaleString()}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Intent Cards */}
            <div className="section-header">
                <div>
                    <h3 className="section-title">Active Intents</h3>
                    <p className="section-subtitle">Your spending rules at a glance</p>
                </div>
                <button className="btn btn-primary" onClick={() => navigate('/create-intent')}>
                    <Plus size={16} /> Create Intent
                </button>
            </div>

            <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
                {intents.filter(i => i.status === 'active').map((intent, idx) => {
                    const pct = Math.round((intent.currentSpend / intent.monthlyCap) * 100);
                    return (
                        <motion.div
                            key={intent.id}
                            className="card intent-card"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            whileHover={{ y: -2 }}
                        >
                            <div className="intent-card-header">
                                <div>
                                    <div className="intent-card-title">{intent.title}</div>
                                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginTop: 4 }}>
                                        {intent.description}
                                    </div>
                                </div>
                                <span className={`badge ${pct >= 100 ? 'badge-danger' : pct >= 50 ? 'badge-warning' : 'badge-success'}`}>
                                    {pct >= 100 ? 'Limit Reached' : pct >= 50 ? 'Warning Zone' : 'On Track'}
                                </span>
                            </div>

                            <div className="intent-card-progress">
                                <div className="progress-bar" style={{ height: 10 }}>
                                    <div
                                        className={`progress-bar-fill ${getProgressColor(intent)}`}
                                        style={{ width: `${Math.min(pct, 100)}%` }}
                                    />
                                </div>
                                <div className="intent-card-amounts">
                                    <span className="intent-card-amount-used">₹{intent.currentSpend.toLocaleString()} spent</span>
                                    <span className="intent-card-amount-total">of ₹{intent.monthlyCap.toLocaleString()}</span>
                                </div>
                            </div>

                            <div className="intent-card-actions">
                                <button className="btn btn-secondary btn-sm" onClick={() => navigate('/intents')}>
                                    View Details <ArrowRight size={14} />
                                </button>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
