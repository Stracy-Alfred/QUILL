import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, AlertTriangle, XCircle, CheckCircle, CreditCard } from 'lucide-react';

export default function CheckoutPage() {
    const { evaluateTransaction, merchants } = useApp();
    const [selectedMerchant, setSelectedMerchant] = useState('SWIGGY');
    const [amount, setAmount] = useState('1200');
    const [step, setStep] = useState('select'); // select | evaluating | result
    const [result, setResult] = useState(null);

    const merchantList = ['SWIGGY', 'ZOMATO', 'AMAZON', 'NETFLIX', 'UBER', 'BIGBASKET'];

    const handlePay = () => {
        setStep('evaluating');
        const merchant = merchants[selectedMerchant];
        setTimeout(() => {
            const res = evaluateTransaction({
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
    };

    const merchant = merchants[selectedMerchant];

    return (
        <div className="animate-fade-in">
            <div className="page-header">
                <h1 className="page-header-title">Pay via QUILL</h1>
                <p className="page-header-sub">Simulate a merchant checkout with real-time intent evaluation</p>
            </div>

            <div className="checkout-page">
                <AnimatePresence mode="wait">
                    {step === 'select' && (
                        <motion.div
                            key="select"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                        >
                            <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
                                <h3 style={{ fontWeight: 700, marginBottom: 'var(--space-5)' }}>
                                    🛒 Merchant Checkout (Simulated)
                                </h3>

                                {/* Merchant Selector */}
                                <div className="input-group" style={{ marginBottom: 'var(--space-5)' }}>
                                    <label className="input-label">Select Merchant</label>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-3)' }}>
                                        {merchantList.map(m => {
                                            const merch = merchants[m];
                                            return (
                                                <div
                                                    key={m}
                                                    onClick={() => setSelectedMerchant(m)}
                                                    style={{
                                                        padding: 'var(--space-4)',
                                                        background: selectedMerchant === m ? 'rgba(59,78,255,0.1)' : 'var(--bg-glass)',
                                                        border: `2px solid ${selectedMerchant === m ? 'var(--primary-500)' : 'var(--border-primary)'}`,
                                                        borderRadius: 'var(--radius-lg)',
                                                        textAlign: 'center',
                                                        cursor: 'pointer',
                                                        transition: 'all var(--transition-fast)',
                                                    }}
                                                >
                                                    <div style={{ fontSize: 24, marginBottom: 4 }}>{merch.logo}</div>
                                                    <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>{merch.name}</div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Amount */}
                                <div className="input-group" style={{ marginBottom: 'var(--space-5)' }}>
                                    <label className="input-label">Amount (₹)</label>
                                    <input
                                        className="input input-lg"
                                        type="number"
                                        value={amount}
                                        onChange={e => setAmount(e.target.value)}
                                        placeholder="Enter amount"
                                        min="1"
                                    />
                                </div>

                                {/* Order Summary */}
                                <div style={{
                                    padding: 'var(--space-4)',
                                    background: 'var(--bg-glass)',
                                    borderRadius: 'var(--radius-lg)',
                                    marginBottom: 'var(--space-5)',
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-sm)', marginBottom: 8 }}>
                                        <span style={{ color: 'var(--text-secondary)' }}>Order from</span>
                                        <span style={{ fontWeight: 600 }}>{merchant?.logo} {merchant?.name}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-sm)' }}>
                                        <span style={{ color: 'var(--text-secondary)' }}>Total</span>
                                        <span style={{ fontWeight: 800, fontSize: 'var(--text-xl)' }}>₹{Number(amount).toLocaleString()}</span>
                                    </div>
                                </div>

                                {/* QUILL Payment Option */}
                                <div className="quill-payment-option" onClick={handlePay}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                        <div style={{
                                            width: 44, height: 44, borderRadius: 'var(--radius-lg)',
                                            background: 'linear-gradient(135deg, var(--primary-500), var(--primary-700))',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontWeight: 800, color: 'white', fontSize: 'var(--text-lg)',
                                        }}>Q</div>
                                        <div>
                                            <div style={{ fontWeight: 700 }}>Pay via QUILL (Digital ₹)</div>
                                            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
                                                Intent-protected payment • Real-time verification
                                            </div>
                                        </div>
                                        <CreditCard size={20} style={{ marginLeft: 'auto', color: 'var(--primary-400)' }} />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {step === 'evaluating' && (
                        <motion.div
                            key="evaluating"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            className="card"
                            style={{ textAlign: 'center', padding: 'var(--space-12)' }}
                        >
                            <div style={{
                                width: 80, height: 80, margin: '0 auto var(--space-6)',
                                borderRadius: '50%', border: '3px solid var(--primary-500)',
                                borderTopColor: 'transparent',
                                animation: 'spin 1s linear infinite',
                            }} />
                            <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
                            <h3 style={{ fontWeight: 700, marginBottom: 8 }}>Evaluating Transaction...</h3>
                            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
                                Checking active intents for {merchant?.name} • ₹{Number(amount).toLocaleString()}
                            </p>
                        </motion.div>
                    )}

                    {step === 'result' && result && (
                        <motion.div
                            key="result"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <div className={`card eval-result ${result.outcome === 'allow' ? 'allow' : result.outcome === 'warn_and_allow' ? 'warn' : 'block'}`}>
                                <div className="eval-result-icon">
                                    {result.outcome === 'allow' && <CheckCircle size={32} />}
                                    {result.outcome === 'warn_and_allow' && <AlertTriangle size={32} />}
                                    {result.outcome === 'block' && <XCircle size={32} />}
                                </div>
                                <h3 style={{ fontWeight: 800, fontSize: 'var(--text-xl)', marginBottom: 8 }}>
                                    {result.outcome === 'allow' ? 'Transaction Approved ✅' :
                                        result.outcome === 'warn_and_allow' ? 'Warning ⚠️ Proceed with Caution' :
                                            'Transaction Blocked 🚫'}
                                </h3>
                                <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', maxWidth: 400, margin: '0 auto', lineHeight: 1.6 }}>
                                    {result.message}
                                </p>

                                {result.matchedIntent && (
                                    <div style={{
                                        marginTop: 'var(--space-6)', padding: 'var(--space-4)',
                                        background: 'var(--bg-glass)', borderRadius: 'var(--radius-lg)',
                                        display: 'inline-block',
                                    }}>
                                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginBottom: 4 }}>Matched Intent</div>
                                        <div style={{ fontWeight: 700, fontSize: 'var(--text-sm)' }}>{result.matchedIntent.title}</div>
                                        {result.newTotal && (
                                            <div style={{ marginTop: 8 }}>
                                                <div className="progress-bar" style={{ width: 200, margin: '0 auto' }}>
                                                    <div
                                                        className={`progress-bar-fill ${result.outcome === 'block' ? 'red' :
                                                                result.outcome === 'warn_and_allow' ? 'amber' : 'green'
                                                            }`}
                                                        style={{ width: `${Math.min((result.newTotal / result.matchedIntent.monthlyCap) * 100, 100)}%` }}
                                                    />
                                                </div>
                                                <div style={{ fontSize: 'var(--text-xs)', marginTop: 4, color: 'var(--text-secondary)' }}>
                                                    ₹{result.newTotal?.toLocaleString()} / ₹{result.matchedIntent.monthlyCap.toLocaleString()}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div style={{ marginTop: 'var(--space-6)', display: 'flex', gap: 'var(--space-3)', justifyContent: 'center' }}>
                                    {result.outcome !== 'block' && (
                                        <button className="btn btn-success" onClick={handleReset}>
                                            <CheckCircle size={16} /> {result.outcome === 'warn_and_allow' ? 'Proceed Anyway' : 'Done'}
                                        </button>
                                    )}
                                    <button className="btn btn-secondary" onClick={handleReset}>
                                        Try Another
                                    </button>
                                </div>
                            </div>

                            {/* API Response Preview */}
                            <div className="card" style={{ marginTop: 'var(--space-6)' }}>
                                <h4 style={{ fontWeight: 700, fontSize: 'var(--text-sm)', marginBottom: 'var(--space-3)', color: 'var(--text-secondary)' }}>
                                    QUILL /evaluate API Response
                                </h4>
                                <pre className="intent-preview-json">
                                    {JSON.stringify({
                                        quill_user_id: "U123",
                                        merchant: selectedMerchant,
                                        amount: Number(amount),
                                        outcome: result.outcome,
                                        ui_message: result.message,
                                        new_total: result.newTotal || null,
                                        matched_intent: result.matchedIntent?.id || null,
                                    }, null, 2)}
                                </pre>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
