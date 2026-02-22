import {
    BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
    ResponsiveContainer, PieChart, Pie, Cell, Legend,
    AreaChart, Area,
} from 'recharts';
import { BUDGET_USAGE_TIMELINE, BUSINESS_SPENDING_BY_USER } from '../store/mockData';
import { useApp } from '../context/AppContext';

export default function BusinessAnalyticsPage() {
    const { budgets } = useApp();

    const onIntentData = [
        { name: 'On-Intent', value: 14, color: '#34d399' },
        { name: 'Off-Intent (Blocked)', value: 2, color: '#f87171' },
    ];

    const categoryUsage = budgets.map(b => ({
        name: b.title.length > 15 ? b.title.slice(0, 15) + '...' : b.title,
        used: b.used,
        allocated: b.allocated,
        total: b.totalAmount,
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
                <h1 className="page-header-title">Business Analytics</h1>
                <p className="page-header-sub">Comprehensive insights into budget utilization and compliance</p>
            </div>

            <div className="grid-2" style={{ marginBottom: 'var(--space-8)' }}>
                {/* Spending Over Time */}
                <div className="card">
                    <h3 style={{ fontWeight: 700, fontSize: 'var(--text-lg)', marginBottom: 'var(--space-4)' }}>
                        Weekly Budget Utilization
                    </h3>
                    <div className="chart-container" style={{ height: 300 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={BUDGET_USAGE_TIMELINE}>
                                <defs>
                                    <linearGradient id="colorAI" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorCloud" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                <XAxis dataKey="week" tick={{ fontSize: 11 }} />
                                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `₹${v / 1000}k`} />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend wrapperStyle={{ fontSize: 12 }} />
                                <Area type="monotone" dataKey="aiTools" name="AI Tools" stroke="#6366f1" fillOpacity={1} fill="url(#colorAI)" />
                                <Area type="monotone" dataKey="cloud" name="Cloud" stroke="#0ea5e9" fillOpacity={1} fill="url(#colorCloud)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* On-Intent vs Off-Intent */}
                <div className="card">
                    <h3 style={{ fontWeight: 700, fontSize: 'var(--text-lg)', marginBottom: 'var(--space-4)' }}>
                        Intent Compliance
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-6)' }}>
                        <div className="chart-container" style={{ height: 220, width: 220, flexShrink: 0 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={onIntentData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={55}
                                        outerRadius={85}
                                        paddingAngle={3}
                                        dataKey="value"
                                    >
                                        {onIntentData.map((entry, i) => (
                                            <Cell key={i} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div style={{ flex: 1 }}>
                            {onIntentData.map((item, i) => (
                                <div key={i} style={{
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    padding: '12px 0', borderBottom: '1px solid var(--border-secondary)',
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <div style={{ width: 12, height: 12, borderRadius: '50%', background: item.color }} />
                                        <span style={{ fontSize: 'var(--text-sm)' }}>{item.name}</span>
                                    </div>
                                    <span style={{ fontSize: 'var(--text-2xl)', fontWeight: 800 }}>{item.value}</span>
                                </div>
                            ))}
                            <div style={{
                                marginTop: 'var(--space-4)', padding: 'var(--space-3)',
                                background: 'rgba(16,185,129,0.08)', borderRadius: 'var(--radius-md)',
                                fontSize: 'var(--text-sm)', color: 'var(--accent-400)', fontWeight: 600,
                                textAlign: 'center',
                            }}>
                                87.5% Compliance Rate
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Employee Usage */}
            <div className="card" style={{ marginBottom: 'var(--space-8)' }}>
                <h3 style={{ fontWeight: 700, fontSize: 'var(--text-lg)', marginBottom: 'var(--space-4)' }}>
                    Per-Employee Spending Distribution
                </h3>
                <div className="chart-container" style={{ height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={BUSINESS_SPENDING_BY_USER}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                            <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `₹${v / 1000}k`} />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend wrapperStyle={{ fontSize: 12 }} />
                            <Bar dataKey="aiTools" name="AI Tools" fill="#6366f1" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="cloud" name="Cloud" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Budget Utilization Table */}
            <div className="card">
                <h3 style={{ fontWeight: 700, fontSize: 'var(--text-lg)', marginBottom: 'var(--space-4)' }}>
                    Budget Utilization Summary
                </h3>
                <div className="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>Budget</th>
                                <th>Total</th>
                                <th>Allocated</th>
                                <th>Used</th>
                                <th>Utilization</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {budgets.map(b => {
                                const utilPct = Math.round((b.used / b.totalAmount) * 100);
                                return (
                                    <tr key={b.id}>
                                        <td style={{ fontWeight: 600 }}>{b.title}</td>
                                        <td>₹{b.totalAmount.toLocaleString()}</td>
                                        <td>₹{b.allocated.toLocaleString()}</td>
                                        <td style={{ fontWeight: 600 }}>₹{b.used.toLocaleString()}</td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <div className="progress-bar" style={{ height: 6, width: 80 }}>
                                                    <div className={`progress-bar-fill ${utilPct > 80 ? 'amber' : 'blue'}`} style={{ width: `${utilPct}%` }} />
                                                </div>
                                                <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600 }}>{utilPct}%</span>
                                            </div>
                                        </td>
                                        <td><span className="badge badge-success">Active</span></td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
