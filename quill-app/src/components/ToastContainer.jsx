import { useApp } from '../context/AppContext';
import { CheckCircle, AlertTriangle, XCircle, X, Info } from 'lucide-react';

export default function ToastContainer() {
    const { toasts } = useApp();

    const getIcon = (type) => {
        switch (type) {
            case 'success': return <CheckCircle size={18} />;
            case 'warning': return <AlertTriangle size={18} />;
            case 'error': return <XCircle size={18} />;
            default: return <Info size={18} />;
        }
    };

    if (toasts.length === 0) return null;

    return (
        <div className="toast-container">
            {toasts.map(toast => (
                <div key={toast.id} className={`toast ${toast.type}`}>
                    {getIcon(toast.type)}
                    <span style={{ fontSize: 'var(--text-sm)', flex: 1 }}>{toast.message}</span>
                </div>
            ))}
        </div>
    );
}
