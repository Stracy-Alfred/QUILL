import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Bell, X, AlertTriangle, CheckCircle, Info, ShieldX } from 'lucide-react';

export default function Header({ title }) {
    const { notifications, markNotificationRead, user, accountType, businessRole } = useApp();
    const [showPanel, setShowPanel] = useState(false);

    const unreadCount = notifications.filter(n => !n.read).length;

    const roleLabel = accountType === 'individual'
        ? 'Individual'
        : businessRole === 'admin'
            ? 'Client Admin'
            : 'Business User';

    const getIcon = (type) => {
        switch (type) {
            case 'warning': return <AlertTriangle size={16} style={{ color: 'var(--warning-400)' }} />;
            case 'success': return <CheckCircle size={16} style={{ color: 'var(--accent-400)' }} />;
            case 'blocked': return <ShieldX size={16} style={{ color: 'var(--danger-400)' }} />;
            default: return <Info size={16} style={{ color: 'var(--primary-400)' }} />;
        }
    };

    return (
        <>
            <header className="header">
                <div className="header-left">
                    <h1 className="header-title">{title}</h1>
                    <span className="badge badge-purple">{roleLabel}</span>
                </div>
                <div className="header-right">
                    <button
                        className="btn btn-ghost btn-icon notification-btn"
                        onClick={() => setShowPanel(!showPanel)}
                    >
                        <Bell size={20} />
                        {unreadCount > 0 && (
                            <span className="notification-badge">{unreadCount}</span>
                        )}
                    </button>
                    <div className="avatar">
                        {user?.name?.slice(0, 2).toUpperCase() || 'QU'}
                    </div>
                </div>
            </header>

            {showPanel && (
                <div className="notification-panel animate-slide-right">
                    <div style={{ padding: 'var(--space-5)', borderBottom: '1px solid var(--border-primary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ fontWeight: 700 }}>Notifications</h3>
                        <button className="btn btn-ghost btn-icon sm" onClick={() => setShowPanel(false)}>
                            <X size={18} />
                        </button>
                    </div>
                    {notifications.length === 0 ? (
                        <div style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--text-tertiary)' }}>
                            No notifications
                        </div>
                    ) : (
                        notifications.map(n => (
                            <div
                                key={n.id}
                                className={`notification-item ${n.read ? '' : 'unread'}`}
                                onClick={() => markNotificationRead(n.id)}
                            >
                                <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'flex-start' }}>
                                    {getIcon(n.type)}
                                    <div>
                                        <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)', marginBottom: '2px' }}>{n.title}</div>
                                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{n.message}</div>
                                        <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '4px' }}>{n.time}</div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </>
    );
}
