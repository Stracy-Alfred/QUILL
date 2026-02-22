import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertTriangle, XCircle, CreditCard } from 'lucide-react';

export default function BusinessCheckoutPage() {
    const { evaluateBusinessTransaction, merchants } = useApp();
    const [selectedMerchant, setSelectedMerchant] = useState('OPENAI');
    const [amount, setAmount] = useState('3900');
    const [description, setDescription] = useState('');
    const [step, setStep] = useState('select');
    const [result, setResult] = useState(null);

    const merchantList = ['OPENAI', 'ANTHROPIC', 'GITHUB', 'HUGGINGFACE', 'AWS', 'NETFLIX'];

    const handlePay = () => {
        if (!description.trim()) return;
        setStep('evaluating');
        const merchant = merchants[selectedMerchant];
        setTimeout(() => {
            const res = evaluateBusinessTransaction({
                userId: 'BU001',
                merchant: selectedMerchant,
                amount: Number(amount),
                category: merchant.category,
            });
            setResult(res);
            setStep('result');
        }, 1500);
    };

    const handleReset = () => {
        setStep('select');
        setResult(null);
        setDescription('');
    };

    const merchant = merchants[selectedMerchant];

    return (
        <div className="animate-fade-in">
            <div className="page-header">
                <h1 className="page-header-title">Business Checkout</h1>
                <p className="page-header-sub">Simulate employee spending with intent-verified payment</p>
            </div>

            <div className="checkout-page">
                <AnimatePresence mode="wait">
                    {step === 'select' && (
                        <motion.div key="select" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                            <div className="card">
                                <h3 style={{ fontWeight: 700, marginBottom: 'var(--space-5)' }}>
                                    🏢 Business Purchase (Simulated)
                                </h3>

                                <div className="input-group" style={{ marginBottom: 'var(--space-5)' }}>
                                    <label className="input-label">Select Vendor</label>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-3)' }}>
                                        {merchantList.map(m => {
                                            const merch = merchants[m];
                                            return (
                                                <div key={m} onClick={() => setSelectedMerchant(m)} style={{
                                                    padding: 'var(--space-4)', textAlign: 'center', cursor: 'pointer',
                                                    background: selectedMerchant === m ? 'rgba(59,78,255,0.1)' : 'var(--bg-glass)',
                                                    border: `2px solid ${selectedMerchant === m ? 'var(--primary-500)' : 'var(--border-primary)'}`,
                                                    borderRadius: 'var(--radius-lg)', transition: 'all var(--transition-fast)',
                                                }}>
                                                    <div style={{ fontSize: 24, marginBottom: 4 }}>{merch.logo}</div>
                                                    <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>{merch.name}</div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="input-group" style={{ marginBottom: 'var(--space-4)' }}>
                                    <label className="input-label">Amount (₹)</label>
                                    <input className="input input-lg" type="number" value={amount} onChange={e => setAmount(e.target.value)} min="1" />
                                </div>

                                <div className="input-group" style={{ marginBottom: 'var(--space-5)' }}>
                                    <label className="input-label">What are you buying? (required)</label>
                                    <input className="input" placeholder="e.g., ChatGPT Plus for client ABC project" value={description} onChange={e => setDescription(e.target.value)} />
                                </div>

                                <div style={{
                                    padding: 'var(--space-4)', background: 'var(--bg-glass)', borderRadius: 'var(--radius-lg)',
                                    marginBottom: 'var(--space-5)', display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-sm)',
                                }}>
                                    <span style={{ color: 'var(--text-secondary)' }}>Total</span>
                                    <span style={{ fontWeight: 800, fontSize: 'var(--text-xl)' }}>₹{Number(amount).toLocaleString()}</span>
                                </div>

                                <div className="quill-payment-option" onClick={handlePay} style={{ opacity: description.trim() ? 1 : 0.5, pointerEvents: description.trim() ? 'auto' : 'none' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                        <div style={{
                                            width: 44, height: 44, borderRadius: 'var(--radius-lg)',
                                            background: 'linear-gradient(135deg, var(--primary-500), var(--primary-700))',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontWeight: 800, color: 'white', fontSize: 'var(--text-lg)',
                                        }}>Q</div>
                                        <div>
                                            <div style={{ fontWeight: 700 }}>Pay via QUILL (Business)</div>
                                            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
                                                Intent-verified • Budget-controlled payment
                                            </div>
                                        </div>
                                        <CreditCard size={20} style={{ marginLeft: 'auto', color: 'var(--primary-400)' }} />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {step === 'evaluating' && (
                        <motion.div key="evaluating" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="card" style={{ textAlign: 'center', padding: 'var(--space-12)' }}>
                            <div style={{
                                width: 80, height: 80, margin: '0 auto var(--space-6)',
                                borderRadius: '50%', border: '3px solid var(--primary-500)',
                                borderTopColor: 'transparent', animation: 'spin 1s linear infinite',
                            }} />
                            <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
                            <h3 style={{ fontWeight: 700, marginBottom: 8 }}>Verifying Against Budget Intent...</h3>
                            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
                                Checking merchant, category, and remaining allocation
                            </p>
                        </motion.div>
                    )}

                    {step === 'result' && result && (
                        <motion.div key="result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                            <div className={`card eval-result ${result.outcome === 'allow' ? 'allow' : 'block'}`}>
                                <div className="eval-result-icon">
                                    {result.outcome === 'allow' ? <CheckCircle size={32} /> : <XCircle size={32} />}
                                </div>
                                <h3 style={{ fontWeight: 800, fontSize: 'var(--text-xl)', marginBottom: 8 }}>
                                    {result.outcome === 'allow' ? 'Purchase Approved ✅' : 'Purchase Blocked 🚫'}
                                </h3>
                                <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', maxWidth: 400, margin: '0 auto', lineHeight: 1.6 }}>
                                    {result.message}
                                </p>

                                {result.budget && result.outcome === 'allow' && (
                                    <div style={{ marginTop: 'var(--space-4)', fontSize: 'var(--text-sm)' }}>
                                        <span style={{ color: 'var(--text-secondary)' }}>Remaining allocation: </span>
                                        <span style={{ fontWeight: 700, color: 'var(--accent-400)' }}>₹{result.remaining?.toLocaleString()}</span>
                                    </div>
                                )}

                                <div style={{ marginTop: 'var(--space-6)', display: 'flex', gap: 'var(--space-3)', justifyContent: 'center' }}>
                                    <button className="btn btn-secondary" onClick={handleReset}>Try Another</button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
