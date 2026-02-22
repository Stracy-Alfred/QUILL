import { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { User, Building2, Eye, EyeOff, AlertCircle, CheckCircle2, Info } from 'lucide-react';

// ═══ Simulated User Store (for duplicate detection) ═══
const REGISTERED_USERS = [
    { email: 'danio@nxtgen.io', type: 'business', role: 'admin' },
    { email: 'priya@nxtgen.io', type: 'business', role: 'admin' },
    { email: 'arjun@nxtgen.io', type: 'business', role: 'admin' },
    { email: 'rahul@nxtgen.io', type: 'business', role: 'user' },
    { email: 'sneha@nxtgen.io', type: 'business', role: 'user' },
    { email: 'karan@nxtgen.io', type: 'business', role: 'user' },
    { email: 'aisha@nxtgen.io', type: 'business', role: 'user' },
    { email: 'vikram@nxtgen.io', type: 'business', role: 'user' },
    { email: 'demo@quill.app', type: 'individual', role: null },
];

// Runtime store for newly registered users (in-memory)
const runtimeUsers = [];

function isEmailRegistered(email) {
    const lower = email.toLowerCase().trim();
    return REGISTERED_USERS.some(u => u.email === lower) || runtimeUsers.some(u => u.email === lower);
}

function registerUser(email) {
    runtimeUsers.push({ email: email.toLowerCase().trim() });
}

// ═══ Validation Helpers ═══
function validateEmail(email) {
    if (!email) return { valid: false, error: '' };
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!re.test(email)) return { valid: false, error: 'Please enter a valid email address.' };
    return { valid: true, error: '' };
}

function getPasswordStrength(password) {
    if (!password) return { level: 'none', score: 0, label: '', color: '' };

    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[^a-zA-Z0-9]/.test(password);
    const isLong = password.length >= 12;
    const meetsMin = password.length >= 8 && hasLetter && hasNumber;

    if (!meetsMin) {
        return {
            level: 'weak',
            score: Math.min(password.length / 8, 0.33) * 100,
            label: 'Weak',
            color: 'var(--danger-400)',
            hints: [
                password.length < 8 ? 'At least 8 characters' : null,
                !hasLetter ? 'Include at least 1 letter' : null,
                !hasNumber ? 'Include at least 1 number' : null,
            ].filter(Boolean),
        };
    }

    if (meetsMin && !hasSpecial && !isLong) {
        return {
            level: 'ok',
            score: 60,
            label: 'OK',
            color: 'var(--warning-400)',
            hints: ['Add special characters or make it longer for stronger security.'],
        };
    }

    return {
        level: 'strong',
        score: 100,
        label: 'Strong',
        color: 'var(--accent-400)',
        hints: [],
    };
}

// ═══════════════════════════
// SIGNUP PAGE
// ═══════════════════════════
export function SignupPage() {
    const { login } = useApp();
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [form, setForm] = useState({ email: '', password: '' });
    const [accountType, setAccountType] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});

    const emailValidation = useMemo(() => validateEmail(form.email), [form.email]);
    const passwordStrength = useMemo(() => getPasswordStrength(form.password), [form.password]);
    const emailTaken = useMemo(() => form.email && emailValidation.valid && isEmailRegistered(form.email), [form.email, emailValidation]);

    const handleBlur = (field) => {
        setTouched(prev => ({ ...prev, [field]: true }));
    };

    const handleSignup = (e) => {
        e.preventDefault();

        if (step === 1) {
            // Validate before going to step 2
            const newErrors = {};
            if (!emailValidation.valid) newErrors.email = emailValidation.error || 'Valid email is required.';
            if (emailTaken) newErrors.email = 'This email is already registered.';
            if (passwordStrength.level === 'weak' || passwordStrength.level === 'none') {
                newErrors.password = 'Password must be at least 8 characters with 1 letter and 1 number.';
            }
            if (Object.keys(newErrors).length > 0) {
                setErrors(newErrors);
                setTouched({ email: true, password: true });
                return;
            }
            setErrors({});
            setStep(2);
            return;
        }

        if (!accountType) return;

        // Register for duplicate detection
        registerUser(form.email);

        if (accountType === 'individual') {
            login(form.email, form.password, 'individual');
            navigate('/dashboard');
        } else {
            login(form.email, form.password, 'business', 'admin');
            navigate('/business-onboarding');
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
                        <form className="auth-form" onSubmit={handleSignup} noValidate>
                            {/* Email */}
                            <div className="input-group">
                                <label className="input-label">Email</label>
                                <input
                                    id="signup-email"
                                    className={`input ${(touched.email && (!emailValidation.valid || emailTaken)) ? 'input-error' : ''}`}
                                    type="email"
                                    placeholder="you@example.com"
                                    value={form.email}
                                    onChange={e => setForm({ ...form, email: e.target.value })}
                                    onBlur={() => handleBlur('email')}
                                    required
                                    autoComplete="email"
                                />
                                {touched.email && !emailValidation.valid && form.email && (
                                    <div className="input-hint error">
                                        <AlertCircle size={13} />
                                        {emailValidation.error}
                                    </div>
                                )}
                                {touched.email && emailTaken && (
                                    <div className="input-hint error">
                                        <AlertCircle size={13} />
                                        This email is already registered.{' '}
                                        <Link to="/login" style={{ fontWeight: 700 }}>Login instead?</Link>
                                    </div>
                                )}
                                {touched.email && emailValidation.valid && !emailTaken && form.email && (
                                    <div className="input-hint success">
                                        <CheckCircle2 size={13} />
                                        Email looks good!
                                    </div>
                                )}
                            </div>

                            {/* Password */}
                            <div className="input-group">
                                <label className="input-label">Password</label>
                                <div className="input-password-wrapper">
                                    <input
                                        id="signup-password"
                                        className={`input ${(touched.password && passwordStrength.level === 'weak') ? 'input-error' : ''}`}
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="Create a strong password"
                                        value={form.password}
                                        onChange={e => setForm({ ...form, password: e.target.value })}
                                        onBlur={() => handleBlur('password')}
                                        required
                                        autoComplete="new-password"
                                    />
                                    <button
                                        type="button"
                                        className="input-password-toggle"
                                        onClick={() => setShowPassword(!showPassword)}
                                        tabIndex={-1}
                                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                                    >
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>

                                {/* Strength Indicator */}
                                {form.password && (
                                    <div className="password-strength">
                                        <div className="password-strength-bar">
                                            <div
                                                className="password-strength-fill"
                                                style={{
                                                    width: `${passwordStrength.score}%`,
                                                    background: passwordStrength.color,
                                                }}
                                            />
                                        </div>
                                        <div className="password-strength-label" style={{ color: passwordStrength.color }}>
                                            {passwordStrength.label}
                                        </div>
                                    </div>
                                )}

                                {touched.password && passwordStrength.hints?.length > 0 && (
                                    <div className="password-hints">
                                        {passwordStrength.hints.map((hint, i) => (
                                            <div key={i} className="input-hint info">
                                                <Info size={12} />
                                                {hint}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {errors.email && !touched.email && (
                                <div className="input-hint error"><AlertCircle size={13} />{errors.email}</div>
                            )}
                            {errors.password && !touched.password && (
                                <div className="input-hint error"><AlertCircle size={13} />{errors.password}</div>
                            )}

                            <button
                                id="signup-submit"
                                type="submit"
                                className="btn btn-primary btn-lg"
                                style={{ width: '100%' }}
                            >
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
                                    id="account-type-individual"
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
                                    id="account-type-business"
                                >
                                    <div className="account-type-card-icon" style={{ background: 'rgba(16,185,129,0.12)', color: 'var(--accent-400)' }}>
                                        <Building2 size={24} />
                                    </div>
                                    <div className="account-type-card-title">Small Business</div>
                                    <div className="account-type-card-desc">Budget control and employee allocations</div>
                                </div>
                            </div>
                            <button
                                id="signup-continue"
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

// ═══════════════════════════
// LOGIN PAGE
// ═══════════════════════════
export function LoginPage() {
    const { login } = useApp();
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: '', password: '' });
    const [loginAs, setLoginAs] = useState('individual');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // Simulate auth delay
        setTimeout(() => {
            // Basic validation
            const emailCheck = validateEmail(form.email);
            if (!emailCheck.valid) {
                setError('Please enter a valid email address.');
                setLoading(false);
                return;
            }
            if (!form.password || form.password.length < 1) {
                setError('Please enter your password.');
                setLoading(false);
                return;
            }

            // For hackathon: accept any valid-looking credentials
            // In production: match against hashed passwords + issue JWT
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
            setLoading(false);
        }, 600);
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

                    {error && (
                        <div className="auth-error-banner">
                            <AlertCircle size={16} />
                            <span>{error}</span>
                        </div>
                    )}

                    <form className="auth-form" onSubmit={handleLogin} noValidate>
                        <div className="input-group">
                            <label className="input-label" htmlFor="login-email">Email</label>
                            <input
                                id="login-email"
                                className="input"
                                type="email"
                                placeholder="you@example.com"
                                value={form.email}
                                onChange={e => { setForm({ ...form, email: e.target.value }); setError(''); }}
                                required
                                autoComplete="email"
                            />
                        </div>
                        <div className="input-group">
                            <label className="input-label" htmlFor="login-password">Password</label>
                            <div className="input-password-wrapper">
                                <input
                                    id="login-password"
                                    className="input"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Your password"
                                    value={form.password}
                                    onChange={e => { setForm({ ...form, password: e.target.value }); setError(''); }}
                                    required
                                    autoComplete="current-password"
                                />
                                <button
                                    type="button"
                                    className="input-password-toggle"
                                    onClick={() => setShowPassword(!showPassword)}
                                    tabIndex={-1}
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                            <div style={{ textAlign: 'right', marginTop: 2 }}>
                                <button
                                    type="button"
                                    className="auth-forgot-link"
                                    onClick={() => alert('Password reset is not available in this demo. Contact your administrator.')}
                                >
                                    Forgot password?
                                </button>
                            </div>
                        </div>
                        <div className="input-group">
                            <label className="input-label" htmlFor="login-role">Login as</label>
                            <select
                                id="login-role"
                                className="input"
                                value={loginAs}
                                onChange={e => setLoginAs(e.target.value)}
                            >
                                <option value="individual">Individual</option>
                                <option value="admin">Business - Client Admin</option>
                                <option value="user">Business - Employee</option>
                            </select>
                        </div>
                        <button
                            id="login-submit"
                            type="submit"
                            className="btn btn-primary btn-lg"
                            style={{ width: '100%' }}
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <div className="typing-indicator"><span /><span /><span /></div>
                                    Signing in...
                                </>
                            ) : (
                                'Sign In'
                            )}
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
