import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, Zap, Target, Users, ArrowRight, Sparkles } from 'lucide-react';

export default function LandingPage() {
    const navigate = useNavigate();

    const features = [
        {
            icon: <Target size={24} />,
            title: 'No-Code Intent Builder',
            desc: 'Define spending rules in plain English. Just describe how you want your money to behave — QUILL handles the rest.',
            color: 'var(--primary-500)',
            bg: 'rgba(59, 78, 255, 0.12)',
        },
        {
            icon: <ShieldCheck size={24} />,
            title: 'Real-Time Enforcement',
            desc: 'Every transaction is verified against your intents instantly. Warnings, blocks, and approvals happen at millisecond speed.',
            color: 'var(--accent-400)',
            bg: 'rgba(16, 185, 129, 0.12)',
        },
        {
            icon: <Zap size={24} />,
            title: 'Automated Clawbacks',
            desc: 'Expired or misused funds are automatically recovered. No manual tracking, no fund diversion.',
            color: 'var(--warning-400)',
            bg: 'rgba(245, 158, 11, 0.12)',
        },
        {
            icon: <Users size={24} />,
            title: 'Business Governance',
            desc: 'Multi-admin approval, employee budget allocation, and on/off-intent tracking for complete financial control.',
            color: '#a78bfa',
            bg: 'rgba(139, 92, 246, 0.12)',
        },
    ];

    return (
        <div style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}>
            {/* Hero */}
            <div className="landing-hero">
                {/* Floating orbs */}
                <div style={{
                    position: 'absolute', width: 400, height: 400,
                    background: 'radial-gradient(circle, rgba(59,78,255,0.08) 0%, transparent 70%)',
                    top: '10%', left: '10%', borderRadius: '50%',
                    animation: 'float 6s ease-in-out infinite',
                }} />
                <div style={{
                    position: 'absolute', width: 300, height: 300,
                    background: 'radial-gradient(circle, rgba(16,185,129,0.06) 0%, transparent 70%)',
                    bottom: '20%', right: '15%', borderRadius: '50%',
                    animation: 'float 8s ease-in-out infinite reverse',
                }} />

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7 }}
                    style={{ position: 'relative', zIndex: 1 }}
                >
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: 8,
                        padding: '6px 16px', background: 'rgba(59,78,255,0.1)',
                        border: '1px solid rgba(59,78,255,0.2)', borderRadius: 'var(--radius-full)',
                        marginBottom: 'var(--space-6)', fontSize: 'var(--text-sm)',
                        color: 'var(--primary-400)', fontWeight: 600,
                    }}>
                        <Sparkles size={16} />
                        Programmable Digital Rupee
                    </div>

                    <h1 className="landing-hero-title">
                        Your Money,<br />
                        <span className="gradient-text">Your Rules.</span>
                    </h1>

                    <p className="landing-hero-sub">
                        QUILL transforms Digital Rupee into intent-driven programmable money.
                        Define spending conditions, enforce them in real-time, and take control
                        of every transaction — no code required.
                    </p>

                    <div style={{ display: 'flex', gap: 'var(--space-4)', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <button
                            className="btn btn-primary btn-xl"
                            onClick={() => navigate('/signup')}
                            style={{ gap: 12 }}
                        >
                            Get Started <ArrowRight size={20} />
                        </button>
                        <button
                            className="btn btn-secondary btn-xl"
                            onClick={() => navigate('/login')}
                        >
                            Sign In
                        </button>
                    </div>
                </motion.div>

                {/* Mock transaction card floating */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.3 }}
                    style={{
                        marginTop: 'var(--space-16)', maxWidth: 480, width: '100%',
                        background: 'var(--bg-card)', border: '1px solid var(--border-primary)',
                        borderRadius: 'var(--radius-2xl)', padding: 'var(--space-6)',
                        backdropFilter: 'blur(24px)', position: 'relative', zIndex: 1,
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                        <div style={{
                            width: 40, height: 40, borderRadius: 'var(--radius-lg)',
                            background: 'rgba(249,115,22,0.15)', display: 'flex',
                            alignItems: 'center', justifyContent: 'center', fontSize: 20,
                        }}>🧡</div>
                        <div>
                            <div style={{ fontWeight: 700, fontSize: 'var(--text-sm)' }}>Swiggy • ₹1,200</div>
                            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>Pay via QUILL (Digital ₹)</div>
                        </div>
                    </div>

                    <div style={{
                        padding: '12px 16px', borderRadius: 'var(--radius-lg)',
                        background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)',
                        display: 'flex', alignItems: 'center', gap: 12,
                    }}>
                        <div style={{ color: 'var(--warning-400)' }}>⚠️</div>
                        <div>
                            <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--warning-400)' }}>
                                Intent Warning
                            </div>
                            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
                                You've reached 62% of your Swiggy/Zomato limit (₹6,200 of ₹10,000)
                            </div>
                        </div>
                    </div>

                    <div style={{ marginTop: 16 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-xs)', marginBottom: 6 }}>
                            <span style={{ color: 'var(--text-secondary)' }}>Monthly usage</span>
                            <span style={{ fontWeight: 600 }}>₹6,200 / ₹10,000</span>
                        </div>
                        <div className="progress-bar">
                            <div className="progress-bar-fill amber" style={{ width: '62%' }} />
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Features */}
            <div className="landing-features">
                {features.map((f, i) => (
                    <motion.div
                        key={i}
                        className="card landing-feature-card"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: i * 0.1 }}
                    >
                        <div className="landing-feature-icon" style={{ background: f.bg, color: f.color }}>
                            {f.icon}
                        </div>
                        <h3 className="landing-feature-title">{f.title}</h3>
                        <p className="landing-feature-desc">{f.desc}</p>
                    </motion.div>
                ))}
            </div>

            {/* Footer */}
            <div style={{
                textAlign: 'center', padding: 'var(--space-16) var(--space-8)',
                borderTop: '1px solid var(--border-secondary)',
            }}>
                <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)' }}>
                    Built for the International Hackathon 2026 • QUILL – Programmable Intent Layer for Digital ₹
                </div>
            </div>
        </div>
    );
}
