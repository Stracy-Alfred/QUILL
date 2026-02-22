import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Building2, Users, ChevronRight } from 'lucide-react';

export default function BusinessOnboarding() {
    const { login } = useApp();
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [form, setForm] = useState({
        businessName: '',
        sector: 'Technology',
        companySize: '11-20',
        adminEmails: [''],
    });

    const sectors = ['Technology', 'Finance', 'Healthcare', 'Education', 'Retail', 'Manufacturing', 'Services'];
    const sizes = ['1–10', '11–20', '21–30', '31–50'];

    const handleComplete = () => {
        login(form.businessName + '@admin.io', 'password', 'business', 'admin');
        navigate('/business/dashboard');
    };

    return (
        <div className="auth-page">
            <div className="auth-container animate-fade-in" style={{ maxWidth: 520 }}>
                <div className="auth-logo">
                    <div className="auth-logo-icon">Q</div>
                    <div className="auth-logo-name">QUILL</div>
                    <div className="auth-logo-tagline">Business Setup</div>
                </div>

                <div className="auth-card">
                    {/* Progress */}
                    <div style={{
                        display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-6)',
                        justifyContent: 'center',
                    }}>
                        {[1, 2].map(s => (
                            <div key={s} style={{
                                width: 80, height: 4, borderRadius: 'var(--radius-full)',
                                background: step >= s ? 'var(--primary-500)' : 'var(--bg-glass)',
                                transition: 'background var(--transition-base)',
                            }} />
                        ))}
                    </div>

                    {step === 1 && (
                        <>
                            <h2 style={{ marginBottom: 'var(--space-2)' }}>
                                <Building2 size={20} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 8 }} />
                                Business Profile
                            </h2>
                            <p style={{ textAlign: 'center', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--space-6)' }}>
                                Tell us about your organization
                            </p>

                            <div className="auth-form">
                                <div className="input-group">
                                    <label className="input-label">Business Name</label>
                                    <input className="input" placeholder="Your company name" value={form.businessName}
                                        onChange={e => setForm({ ...form, businessName: e.target.value })} required />
                                </div>
                                <div className="input-group">
                                    <label className="input-label">Sector</label>
                                    <select className="input" value={form.sector} onChange={e => setForm({ ...form, sector: e.target.value })}>
                                        {sectors.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                                <div className="input-group">
                                    <label className="input-label">Company Size</label>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-2)' }}>
                                        {sizes.map(s => (
                                            <div key={s} onClick={() => setForm({ ...form, companySize: s })} style={{
                                                padding: 'var(--space-3)', textAlign: 'center', cursor: 'pointer',
                                                background: form.companySize === s ? 'rgba(59,78,255,0.1)' : 'var(--bg-glass)',
                                                border: `2px solid ${form.companySize === s ? 'var(--primary-500)' : 'var(--border-primary)'}`,
                                                borderRadius: 'var(--radius-md)', fontSize: 'var(--text-sm)', fontWeight: 600,
                                                transition: 'all var(--transition-fast)',
                                            }}>
                                                {s}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <button className="btn btn-primary btn-lg" style={{ width: '100%' }} onClick={() => setStep(2)}
                                    disabled={!form.businessName.trim()}>
                                    Continue <ChevronRight size={18} />
                                </button>
                            </div>
                        </>
                    )}

                    {step === 2 && (
                        <>
                            <h2 style={{ marginBottom: 'var(--space-2)' }}>
                                <Users size={20} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 8 }} />
                                Invite Client Admins
                            </h2>
                            <p style={{ textAlign: 'center', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--space-6)' }}>
                                You're the default first admin. Invite up to 4 more.
                            </p>

                            <div className="auth-form">
                                <div style={{
                                    padding: 'var(--space-4)', background: 'var(--bg-glass)',
                                    borderRadius: 'var(--radius-lg)', marginBottom: 'var(--space-2)',
                                    display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
                                }}>
                                    <div className="avatar">YO</div>
                                    <div>
                                        <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>You (CEO)</div>
                                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>Default Admin</div>
                                    </div>
                                    <span className="badge badge-gold" style={{ marginLeft: 'auto' }}>Admin</span>
                                </div>

                                {form.adminEmails.map((email, i) => (
                                    <div className="input-group" key={i}>
                                        <label className="input-label">Admin {i + 2} Email</label>
                                        <input className="input" type="email" placeholder="colleague@company.com"
                                            value={email}
                                            onChange={e => {
                                                const emails = [...form.adminEmails];
                                                emails[i] = e.target.value;
                                                setForm({ ...form, adminEmails: emails });
                                            }} />
                                    </div>
                                ))}

                                {form.adminEmails.length < 4 && (
                                    <button className="btn btn-ghost btn-sm"
                                        onClick={() => setForm({ ...form, adminEmails: [...form.adminEmails, ''] })}>
                                        + Add another admin
                                    </button>
                                )}

                                <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                                    <button className="btn btn-secondary btn-lg" style={{ flex: 1 }} onClick={() => setStep(1)}>
                                        Back
                                    </button>
                                    <button className="btn btn-primary btn-lg" style={{ flex: 2 }} onClick={handleComplete}>
                                        Launch QUILL 🚀
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
