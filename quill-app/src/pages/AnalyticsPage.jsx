import { useApp } from '../context/AppContext';
import {
    PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar,
    XAxis, YAxis, Tooltip, CartesianGrid, LineChart, Line, Legend,
} from 'recharts';
import { INDIVIDUAL_SPENDING_TIMELINE, CATEGORY_SPENDING } from '../store/mockData';

export default function AnalyticsPage() {
    const { intents } = useApp();

    const intentStats = intents.map(i => ({
        name: i.title.length > 20 ? i.title.slice(0, 20) + '...' : i.title,
        spent: i.currentSpend,
        cap: i.monthlyCap,
        remaining: Math.max(i.monthlyCap - i.currentSpend, 0),
    }));

    const complianceData = [
        { name: 'Allowed', value: 12, color: '#34d399' },
        { name: 'Warned', value: 5, color: '#fbbf24' },
        { name: 'Blocked', value: 1, color: '#f87171' },
    ];

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
                <h1 className="page-header-title">Analytics</h1>
                <p className="page-header-sub">Deep insights into your spending patterns and intent performance</p>
            </div>

            <div className="grid-2" style={{ marginBottom: 'var(--space-8)' }}>
                {/* Intent Performance */}
                <div className="card">
                    <h3 style={{ fontWeight: 700, fontSize: 'var(--text-lg)', marginBottom: 'var(--space-4)' }}>
                        Intent Performance
                    </h3>
                    <div className="chart-container" style={{ height: 300 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={intentStats} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                <XAxis type="number" tickFormatter={v => `₹${v / 1000}k`} tick={{ fontSize: 11 }} />
                                <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 11 }} />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend wrapperStyle={{ fontSize: 12 }} />
                                <Bar dataKey="spent" name="Spent" fill="#6366f1" radius={[0, 4, 4, 0]} />
                                <Bar dataKey="remaining" name="Remaining" fill="rgba(99,102,241,0.2)" radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Compliance */}
                <div className="card">
                    <h3 style={{ fontWeight: 700, fontSize: 'var(--text-lg)', marginBottom: 'var(--space-4)' }}>
                        Transaction Compliance
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-6)' }}>
                        <div className="chart-container" style={{ height: 220, width: 220, flexShrink: 0 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={complianceData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={55}
                                        outerRadius={85}
                                        paddingAngle={3}
                                        dataKey="value"
                                    >
                                        {complianceData.map((entry, i) => (
                                            <Cell key={i} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div style={{ flex: 1 }}>
                            {complianceData.map((item, i) => (
                                <div key={i} style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    padding: '10px 0', borderBottom: '1px solid var(--border-secondary)',
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <div style={{ width: 10, height: 10, borderRadius: '50%', background: item.color }} />
                                        <span style={{ fontSize: 'var(--text-sm)' }}>{item.name}</span>
                                    </div>
                                    <span style={{ fontSize: 'var(--text-xl)', fontWeight: 800 }}>{item.value}</span>
                                </div>
                            ))}
                            <div style={{ marginTop: 'var(--space-4)', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
                                Total: 18 transactions this month
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Spending Over Time */}
            <div className="card" style={{ marginBottom: 'var(--space-8)' }}>
                <h3 style={{ fontWeight: 700, fontSize: 'var(--text-lg)', marginBottom: 'var(--space-4)' }}>
                    Cumulative Spending Over Time
                </h3>
                <div className="chart-container" style={{ height: 320 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={INDIVIDUAL_SPENDING_TIMELINE}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                            <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                            <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `₹${v / 1000}k`} />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend wrapperStyle={{ fontSize: 12 }} />
                            <Line type="monotone" dataKey="food" name="Food" stroke="#f97316" strokeWidth={2} dot={{ r: 4 }} />
                            <Line type="monotone" dataKey="shopping" name="Shopping" stroke="#ec4899" strokeWidth={2} dot={{ r: 4 }} />
                            <Line type="monotone" dataKey="entertainment" name="Entertainment" stroke="#a855f7" strokeWidth={2} dot={{ r: 4 }} />
                            <Line type="monotone" dataKey="travel" name="Travel" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Category Breakdown */}
            <div className="card">
                <h3 style={{ fontWeight: 700, fontSize: 'var(--text-lg)', marginBottom: 'var(--space-4)' }}>
                    Category Breakdown
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 'var(--space-4)' }}>
                    {CATEGORY_SPENDING.map((cat, i) => {
                        const total = CATEGORY_SPENDING.reduce((a, b) => a + b.value, 0);
                        const pct = Math.round((cat.value / total) * 100);
                        return (
                            <div key={i} style={{
                                padding: 'var(--space-4)',
                                background: 'var(--bg-glass)',
                                borderRadius: 'var(--radius-lg)',
                                border: '1px solid var(--border-secondary)',
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                                    <div style={{ width: 12, height: 12, borderRadius: '50%', background: cat.color }} />
                                    <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>{cat.name}</span>
                                </div>
                                <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, marginBottom: 4 }}>
                                    ₹{cat.value.toLocaleString()}
                                </div>
                                <div className="progress-bar" style={{ height: 6 }}>
                                    <div style={{ height: '100%', borderRadius: 'var(--radius-full)', background: cat.color, width: `${pct}%` }} />
                                </div>
                                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginTop: 4 }}>{pct}% of total</div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
