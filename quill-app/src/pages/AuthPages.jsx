import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { User, Building2 } from 'lucide-react';

export function SignupPage() {
    const { login } = useApp();
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [form, setForm] = useState({ email: '', password: '', name: '' });
    const [accountType, setAccountType] = useState(null);

    const handleSignup = (e) => {
        e.preventDefault();
        if (step === 1) {
            setStep(2);
            return;
        }
        if (!accountType) return;
        if (accountType === 'individual') {
            login(form.email, form.password, 'individual');
            navigate('/dashboard');
        } else {
            navigate('/business-onboarding');
            login(form.email, form.password, 'business', 'admin');
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-container animate-fade-in">
                <div className="auth-logo">
                    <div className="auth-logo-icon">Q</div>
                    <div className="auth-logo-name">QUILL</div>
                    <div className="auth-logo-tagline">Programmable Digital ₹ Intent Layer</div>
                </div>

                <div className="auth-card">
                    <h2>{step === 1 ? 'Create Account' : 'Choose Account Type'}</h2>

                    {step === 1 ? (
                        <form className="auth-form" onSubmit={handleSignup}>
                            <div className="input-group">
                                <label className="input-label">Full Name</label>
                                <input
                                    className="input"
                                    placeholder="Enter your full name"
                                    value={form.name}
                                    onChange={e => setForm({ ...form, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="input-group">
                                <label className="input-label">Email</label>
                                <input
                                    className="input"
                                    type="email"
                                    placeholder="you@example.com"
                                    value={form.email}
                                    onChange={e => setForm({ ...form, email: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="input-group">
                                <label className="input-label">Password</label>
                                <input
                                    className="input"
                                    type="password"
                                    placeholder="Create a strong password"
                                    value={form.password}
                                    onChange={e => setForm({ ...form, password: e.target.value })}
                                    required
                                />
                            </div>
                            <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }}>
                                Continue
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleSignup}>
                            <p style={{ textAlign: 'center', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--space-6)' }}>
                                What type of account is this?
                            </p>
                            <div className="account-type-grid">
                                <div
                                    className={`account-type-card ${accountType === 'individual' ? 'selected' : ''}`}
                                    onClick={() => setAccountType('individual')}
                                >
                                    <div className="account-type-card-icon" style={{ background: 'rgba(59,78,255,0.12)', color: 'var(--primary-400)' }}>
                                        <User size={24} />
                                    </div>
                                    <div className="account-type-card-title">Individual</div>
                                    <div className="account-type-card-desc">Personal spending guardrails and insights</div>
                                </div>
                                <div
                                    className={`account-type-card ${accountType === 'business' ? 'selected' : ''}`}
                                    onClick={() => setAccountType('business')}
                                >
                                    <div className="account-type-card-icon" style={{ background: 'rgba(16,185,129,0.12)', color: 'var(--accent-400)' }}>
                                        <Building2 size={24} />
                                    </div>
                                    <div className="account-type-card-title">Small Business</div>
                                    <div className="account-type-card-desc">Budget control and employee allocations</div>
                                </div>
                            </div>
                            <button
                                type="submit"
                                className="btn btn-primary btn-lg"
                                style={{ width: '100%', marginTop: 'var(--space-4)' }}
                                disabled={!accountType}
                            >
                                {accountType === 'individual' ? 'Enter QUILL' : 'Set Up Business'}
                            </button>
                        </form>
                    )}
                </div>

                <div className="auth-footer">
                    Already have an account? <Link to="/login">Sign in</Link>
                </div>
            </div>
        </div>
    );
}

export function LoginPage() {
    const { login } = useApp();
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: '', password: '' });
    const [loginAs, setLoginAs] = useState('individual');

    const handleLogin = (e) => {
        e.preventDefault();
        if (loginAs === 'individual') {
            login(form.email, form.password, 'individual');
            navigate('/dashboard');
        } else if (loginAs === 'admin') {
            login(form.email, form.password, 'business', 'admin');
            navigate('/business/dashboard');
        } else {
            login(form.email, form.password, 'business', 'user');
            navigate('/employee/dashboard');
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-container animate-fade-in">
                <div className="auth-logo">
                    <div className="auth-logo-icon">Q</div>
                    <div className="auth-logo-name">QUILL</div>
                    <div className="auth-logo-tagline">Programmable Digital ₹ Intent Layer</div>
                </div>

                <div className="auth-card">
                    <h2>Welcome Back</h2>
                    <form className="auth-form" onSubmit={handleLogin}>
                        <div className="input-group">
                            <label className="input-label">Email</label>
                            <input
                                className="input"
                                type="email"
                                placeholder="you@example.com"
                                value={form.email}
                                onChange={e => setForm({ ...form, email: e.target.value })}
                                required
                            />
                        </div>
                        <div className="input-group">
                            <label className="input-label">Password</label>
                            <input
                                className="input"
                                type="password"
                                placeholder="Your password"
                                value={form.password}
                                onChange={e => setForm({ ...form, password: e.target.value })}
                                required
                            />
                        </div>
                        <div className="input-group">
                            <label className="input-label">Login as</label>
                            <select
                                className="input"
                                value={loginAs}
                                onChange={e => setLoginAs(e.target.value)}
                            >
                                <option value="individual">Individual</option>
                                <option value="admin">Business - Client Admin</option>
                                <option value="user">Business - Employee</option>
                            </select>
                        </div>
                        <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }}>
                            Sign In
                        </button>
                    </form>
                </div>

                <div className="auth-footer">
                    Don't have an account? <Link to="/signup">Create one</Link>
                </div>
            </div>
        </div>
    );
}
