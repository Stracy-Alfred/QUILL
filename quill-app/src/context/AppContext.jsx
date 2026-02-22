import { createContext, useContext, useState, useCallback } from 'react';
import {
    INDIVIDUAL_INTENTS,
    PENDING_REQUESTS,
    NOTIFICATIONS,
    BUSINESS_BUDGETS,
    BUSINESS_PROFILE,
    CLIENT_ADMINS,
    BUSINESS_USERS,
    MERCHANTS,
    MERCHANT_CATEGORIES,
    INITIAL_VENDORS,
    ACTIVITY_LOGS,
} from '../store/mockData';

const AppContext = createContext(null);

export function AppProvider({ children }) {
    // Auth & user state
    const [user, setUser] = useState(null);
    const [accountType, setAccountType] = useState(null); // 'individual' | 'business'
    const [businessRole, setBusinessRole] = useState(null); // 'admin' | 'user'
    const [theme, setTheme] = useState('dark');

    // Data state
    const [intents, setIntents] = useState(INDIVIDUAL_INTENTS);
    const [budgets, setBudgets] = useState(BUSINESS_BUDGETS);
    const [requests, setRequests] = useState(PENDING_REQUESTS);
    const [notifications, setNotifications] = useState(NOTIFICATIONS);
    const [toasts, setToasts] = useState([]);
    const [vendors, setVendors] = useState(INITIAL_VENDORS);
    const [activityLogs, setActivityLogs] = useState(ACTIVITY_LOGS);

    // ═══ Theme ═══
    const toggleTheme = useCallback(() => {
        setTheme(prev => {
            const newTheme = prev === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', newTheme);
            return newTheme;
        });
    }, []);

    // ═══ Activity Log Helper ═══
    const addLog = useCallback((log) => {
        const entry = {
            ...log,
            id: 'LOG' + Date.now(),
            timestamp: new Date().toISOString(),
        };
        setActivityLogs(prev => [entry, ...prev]);
        return entry;
    }, []);

    // ═══ Auth ═══
    const login = useCallback((email, password, type, role) => {
        setUser({ email, name: email.split('@')[0] });
        setAccountType(type);
        setBusinessRole(role || null);
    }, []);

    const logout = useCallback(() => {
        setUser(null);
        setAccountType(null);
        setBusinessRole(null);
    }, []);

    // ═══ Toast ═══
    const addToast = useCallback((message, type = 'info') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
    }, []);

    // ═══ Intent CRUD ═══
    const createIntent = useCallback((intentData) => {
        const newIntent = {
            ...intentData,
            id: 'INT' + Date.now(),
            status: 'active',
            currentSpend: 0,
            createdAt: new Date().toISOString(),
            transactions: [],
        };
        setIntents(prev => [newIntent, ...prev]);
        addToast('Intent activated successfully!', 'success');
        addLog({
            type: 'intent', action: 'created',
            userId: 'individual', userName: 'You',
            details: `Created intent "${intentData.title}" – ₹${intentData.monthlyCap?.toLocaleString()}/month cap`,
            intentId: newIntent.id,
        });
        return newIntent;
    }, [addToast, addLog]);

    const pauseIntent = useCallback((intentId) => {
        let newStatus = '';
        setIntents(prev => prev.map(i => {
            if (i.id !== intentId) return i;
            newStatus = i.status === 'paused' ? 'active' : 'paused';
            return { ...i, status: newStatus };
        }));
        addToast('Intent status updated', 'info');
        addLog({
            type: 'intent', action: newStatus === 'paused' ? 'paused' : 'resumed',
            userId: 'individual', userName: 'You',
            details: `Intent ${intentId} ${newStatus === 'paused' ? 'paused' : 'resumed'}`,
            intentId,
        });
    }, [addToast, addLog]);

    const deleteIntent = useCallback((intentId) => {
        setIntents(prev => prev.filter(i => i.id !== intentId));
        addToast('Intent deleted', 'info');
        addLog({
            type: 'intent', action: 'deleted',
            userId: 'individual', userName: 'You',
            details: `Deleted intent ${intentId}`,
            intentId,
        });
    }, [addToast, addLog]);

    // ═══ Transaction evaluation ═══
    const evaluateTransaction = useCallback((transaction) => {
        const { merchant, amount, category } = transaction;

        const matchingIntents = intents.filter(intent =>
            intent.status === 'active' &&
            (intent.merchants.includes(merchant) || intent.categories.includes(category))
        );

        let result;
        if (matchingIntents.length === 0) {
            result = { outcome: 'allow', message: 'No active intent for this transaction.', matchedIntent: null };
        } else {
            const intent = matchingIntents[0];
            const newTotal = intent.currentSpend + amount;

            if (newTotal > intent.monthlyCap) {
                result = {
                    outcome: 'block',
                    message: `${intent.title} limit of ₹${intent.monthlyCap.toLocaleString()}/month exceeded. Current: ₹${intent.currentSpend.toLocaleString()}, attempted: ₹${amount.toLocaleString()}.`,
                    matchedIntent: intent, newTotal,
                };
            } else if (newTotal > intent.warningThreshold) {
                setIntents(prev => prev.map(i =>
                    i.id === intent.id ? { ...i, currentSpend: newTotal } : i
                ));
                result = {
                    outcome: 'warn_and_allow',
                    message: `You've reached ${Math.round((newTotal / intent.monthlyCap) * 100)}% of your ${intent.title} (₹${newTotal.toLocaleString()} of ₹${intent.monthlyCap.toLocaleString()}).`,
                    matchedIntent: intent, newTotal,
                };
            } else {
                setIntents(prev => prev.map(i =>
                    i.id === intent.id ? { ...i, currentSpend: newTotal } : i
                ));
                result = {
                    outcome: 'allow',
                    message: 'Transaction approved. Within your spending intent.',
                    matchedIntent: intent, newTotal,
                };
            }
        }

        // Log the transaction
        addLog({
            type: 'transaction', action: result.outcome === 'allow' ? 'allowed' : result.outcome === 'warn_and_allow' ? 'warned' : 'blocked',
            userId: 'individual', userName: 'You',
            details: `${MERCHANTS[merchant]?.name || merchant} – ₹${amount.toLocaleString()} – ${result.message}`,
            merchant, amount, outcome: result.outcome,
            intentId: result.matchedIntent?.id,
        });

        return result;
    }, [intents, addLog]);

    // ═══ Business: evaluate ═══
    const evaluateBusinessTransaction = useCallback((transaction) => {
        const { userId, merchant, amount, category } = transaction;

        for (const budget of budgets) {
            const allocation = budget.allocations?.find(a =>
                a.userId === userId && a.status === 'approved'
            );
            if (!allocation) continue;

            const merchantAllowed = budget.allowedMerchants.includes(merchant);
            const categoryMatch = budget.category === category;
            const remaining = allocation.amount - allocation.used;

            if (!merchantAllowed || !categoryMatch) {
                addLog({
                    type: 'transaction', action: 'blocked',
                    userId, userName: allocation.userName,
                    details: `${MERCHANTS[merchant]?.name} – ₹${amount.toLocaleString()} – BLOCKED: not in ${budget.title} allowed list`,
                    merchant, amount, outcome: 'blocked', budgetId: budget.id, onIntent: false,
                });
                return {
                    outcome: 'block',
                    message: `This purchase does not match the ${budget.title} intent. Merchant or category not in allowed list.`,
                    budget, allocation,
                };
            }

            if (amount > remaining) {
                addLog({
                    type: 'transaction', action: 'blocked',
                    userId, userName: allocation.userName,
                    details: `${MERCHANTS[merchant]?.name} – ₹${amount.toLocaleString()} – BLOCKED: insufficient allocation (₹${remaining.toLocaleString()} remaining)`,
                    merchant, amount, outcome: 'blocked', budgetId: budget.id, onIntent: false,
                });
                return {
                    outcome: 'block',
                    message: `Insufficient allocation. Remaining: ₹${remaining.toLocaleString()}, Attempted: ₹${amount.toLocaleString()}.`,
                    budget, allocation,
                };
            }

            setBudgets(prev => prev.map(b =>
                b.id === budget.id
                    ? {
                        ...b, used: b.used + amount,
                        allocations: b.allocations.map(a =>
                            a.id === allocation.id ? { ...a, used: a.used + amount } : a
                        ),
                    }
                    : b
            ));

            addLog({
                type: 'transaction', action: 'allowed',
                userId, userName: allocation.userName,
                details: `${MERCHANTS[merchant]?.name} – ₹${amount.toLocaleString()} – approved within ${budget.title}`,
                merchant, amount, outcome: 'allowed', budgetId: budget.id, onIntent: true,
            });

            return {
                outcome: 'allow',
                message: 'Transaction approved. Within your allocated budget.',
                budget, allocation, remaining: remaining - amount,
            };
        }

        return { outcome: 'block', message: 'No matching budget allocation found.', budget: null, allocation: null };
    }, [budgets, addLog]);

    // ═══ Approval flow ═══
    const approveRequest = useCallback((requestId, adminId) => {
        setRequests(prev => prev.map(r => {
            if (r.id !== requestId) return r;
            const newApprovals = [...r.approvals, adminId];
            const newStatus = newApprovals.length >= 2 ? 'approved' : 'pending_second_approval';

            if (newApprovals.length >= 2) {
                addToast(`Request from ${r.userName} approved! Allocation created.`, 'success');
                setBudgets(prev => prev.map(b =>
                    b.id === r.budgetId
                        ? {
                            ...b, allocated: b.allocated + r.amount,
                            allocations: [...b.allocations, {
                                id: 'ALLOC' + Date.now(), userId: r.userId, userName: r.userName,
                                amount: r.amount, used: 0, purpose: r.purpose,
                                status: 'approved', approvals: newApprovals, approvalCount: 2, transactions: [],
                            }],
                        }
                        : b
                ));
            } else {
                addToast(`First approval given for ${r.userName}'s request. Awaiting second.`, 'info');
            }

            addLog({
                type: 'request', action: 'approved',
                userId: adminId, userName: CLIENT_ADMINS.find(a => a.id === adminId)?.name || adminId,
                details: `${newApprovals.length >= 2 ? 'Final' : 'First'} approval for ${r.userName}'s request (₹${r.amount.toLocaleString()})`,
                requestId,
            });

            return { ...r, approvals: newApprovals, approvalCount: newApprovals.length, status: newStatus };
        }));
    }, [addToast, addLog]);

    const rejectRequest = useCallback((requestId) => {
        setRequests(prev => prev.map(r => {
            if (r.id !== requestId) return r;
            addLog({
                type: 'request', action: 'rejected',
                userId: 'admin', userName: 'Admin',
                details: `Rejected ${r.userName}'s request (₹${r.amount.toLocaleString()})`,
                requestId,
            });
            return { ...r, status: 'rejected' };
        }));
        addToast('Request rejected.', 'error');
    }, [addToast, addLog]);

    const createRequest = useCallback((requestData) => {
        const newRequest = {
            ...requestData,
            id: 'REQ' + Date.now(),
            status: 'pending', approvalCount: 0, approvals: [],
            createdAt: new Date().toISOString(),
        };
        setRequests(prev => [newRequest, ...prev]);
        addToast('Allocation request submitted!', 'success');
        addLog({
            type: 'request', action: 'submitted',
            userId: requestData.userId, userName: requestData.userName,
            details: `Requested ₹${requestData.amount.toLocaleString()} from ${requestData.budgetTitle} for ${requestData.purpose}`,
            requestId: newRequest.id,
        });
        return newRequest;
    }, [addToast, addLog]);

    // ═══ Notification ═══
    const markNotificationRead = useCallback((id) => {
        setNotifications(prev => prev.map(n =>
            n.id === id ? { ...n, read: true } : n
        ));
    }, []);

    // ═══ Vendor Management ═══
    const addVendor = useCallback((vendorData) => {
        const newVendor = {
            ...vendorData,
            id: 'V' + Date.now(),
            createdAt: new Date().toISOString(),
            usedInIntents: 0,
            merchantKey: null,
        };
        setVendors(prev => [newVendor, ...prev]);
        addLog({
            type: 'vendor', action: 'added',
            userId: vendorData.addedBy, userName: vendorData.addedByName,
            details: `${vendorData.status === 'verified' ? 'Verified and added' : vendorData.status === 'pending_review' ? 'Submitted for review' : 'Rejected'} vendor "${vendorData.name}" (${vendorData.category}) – confidence: ${Math.round(vendorData.confidence * 100)}%`,
        });
        return newVendor;
    }, [addLog]);

    const approveVendor = useCallback((vendorId) => {
        setVendors(prev => prev.map(v => {
            if (v.id !== vendorId) return v;
            addLog({
                type: 'vendor', action: 'approved',
                userId: 'admin', userName: 'Admin',
                details: `Admin approved vendor "${v.name}" – status changed to verified`,
            });
            return { ...v, status: 'verified' };
        }));
        addToast('Vendor approved and added to registry.', 'success');
    }, [addToast, addLog]);

    const rejectVendor = useCallback((vendorId, reason) => {
        setVendors(prev => prev.map(v => {
            if (v.id !== vendorId) return v;
            addLog({
                type: 'vendor', action: 'rejected',
                userId: 'admin', userName: 'Admin',
                details: `Admin rejected vendor "${v.name}" – ${reason}`,
            });
            return { ...v, status: 'rejected', rejectionReason: reason };
        }));
        addToast('Vendor rejected.', 'error');
    }, [addToast, addLog]);

    const value = {
        // Auth
        user, accountType, businessRole, theme,
        login, logout, toggleTheme, setAccountType, setBusinessRole,
        // Data
        intents, budgets, requests, notifications, toasts,
        vendors, activityLogs,
        merchants: MERCHANTS,
        merchantCategories: MERCHANT_CATEGORIES,
        businessProfile: BUSINESS_PROFILE,
        clientAdmins: CLIENT_ADMINS,
        businessUsers: BUSINESS_USERS,
        // Actions
        createIntent, pauseIntent, deleteIntent,
        evaluateTransaction, evaluateBusinessTransaction,
        approveRequest, rejectRequest, createRequest,
        markNotificationRead, addToast,
        addVendor, approveVendor, rejectVendor,
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
    const ctx = useContext(AppContext);
    if (!ctx) throw new Error('useApp must be used within AppProvider');
    return ctx;
}
