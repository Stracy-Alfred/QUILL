import { NavLink, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
    LayoutDashboard, Target, CreditCard, BarChart3, Settings,
    Users, Wallet, FileCheck, ShieldCheck, Store, LogOut,
    Sun, Moon, Bell, ClipboardList, Building2,
} from 'lucide-react';

export default function Sidebar() {
    const { accountType, businessRole, theme, toggleTheme, logout, notifications } = useApp();
    const navigate = useNavigate();

    const unreadCount = notifications.filter(n => !n.read).length;

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const individualLinks = [
        { to: '/dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
        { to: '/intents', icon: <Target size={20} />, label: 'My Intents' },
        { to: '/create-intent', icon: <ShieldCheck size={20} />, label: 'Create Intent' },
        { to: '/vendors', icon: <Building2 size={20} />, label: 'Vendors' },
        { to: '/checkout', icon: <CreditCard size={20} />, label: 'Pay via QUILL' },
        { to: '/analytics', icon: <BarChart3 size={20} />, label: 'Analytics' },
        { to: '/activity', icon: <ClipboardList size={20} />, label: 'My Activity' },
    ];

    const adminLinks = [
        { to: '/business/dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
        { to: '/business/budgets', icon: <Wallet size={20} />, label: 'Budgets & Intents' },
        { to: '/business/create-budget', icon: <Target size={20} />, label: 'Create Budget' },
        { to: '/business/requests', icon: <FileCheck size={20} />, label: 'Requests' },
        { to: '/business/vendors', icon: <Building2 size={20} />, label: 'Vendor Registry' },
        { to: '/business/team', icon: <Users size={20} />, label: 'Team & Roles' },
        { to: '/business/analytics', icon: <BarChart3 size={20} />, label: 'Analytics' },
        { to: '/business/logs', icon: <ClipboardList size={20} />, label: 'Logs & Audit' },
        { to: '/business/checkout', icon: <Store size={20} />, label: 'Mock Checkout' },
    ];

    const userLinks = [
        { to: '/employee/dashboard', icon: <LayoutDashboard size={20} />, label: 'My Dashboard' },
        { to: '/employee/request', icon: <FileCheck size={20} />, label: 'Request Budget' },
        { to: '/employee/allocations', icon: <Wallet size={20} />, label: 'My Allocations' },
        { to: '/employee/checkout', icon: <Store size={20} />, label: 'Pay via QUILL' },
        { to: '/employee/activity', icon: <ClipboardList size={20} />, label: 'My Activity' },
    ];

    const links = accountType === 'individual'
        ? individualLinks
        : businessRole === 'admin'
            ? adminLinks
            : userLinks;

    return (
        <aside className="sidebar">
            <div className="sidebar-logo">
                <div className="sidebar-logo-icon">Q</div>
                <div>
                    <div className="sidebar-logo-text">QUILL</div>
                    <div className="sidebar-logo-sub">Digital ₹ Intent Layer</div>
                </div>
            </div>

            <nav className="sidebar-nav">
                <div className="sidebar-section">
                    <div className="sidebar-section-title">
                        {accountType === 'individual' ? 'Personal' : businessRole === 'admin' ? 'Admin Panel' : 'Employee'}
                    </div>
                    {links.map(link => (
                        <NavLink
                            key={link.to}
                            to={link.to}
                            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                        >
                            {link.icon}
                            <span>{link.label}</span>
                        </NavLink>
                    ))}
                </div>
            </nav>

            <div className="sidebar-footer">
                <button
                    className="sidebar-link"
                    onClick={toggleTheme}
                    style={{ marginBottom: '4px' }}
                >
                    {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                    <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
                </button>
                <button className="sidebar-link" onClick={handleLogout}>
                    <LogOut size={20} />
                    <span>Sign Out</span>
                </button>
            </div>
        </aside>
    );
}
