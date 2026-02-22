import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import ToastContainer from './components/ToastContainer';

// Pages
import LandingPage from './pages/LandingPage';
import { SignupPage, LoginPage } from './pages/AuthPages';
import BusinessOnboarding from './pages/BusinessOnboarding';
import IndividualDashboard from './pages/IndividualDashboard';
import CreateIntentPage from './pages/CreateIntentPage';
import IntentsListPage from './pages/IntentsListPage';
import CheckoutPage from './pages/CheckoutPage';
import AnalyticsPage from './pages/AnalyticsPage';
import VendorsPage from './pages/VendorsPage';
import ActivityPage from './pages/ActivityPage';
import BusinessDashboard from './pages/BusinessDashboard';
import CreateBudgetPage from './pages/CreateBudgetPage';
import RequestsPage from './pages/RequestsPage';
import TeamPage from './pages/TeamPage';
import BudgetsPage from './pages/BudgetsPage';
import BusinessAnalyticsPage from './pages/BusinessAnalyticsPage';
import BusinessCheckoutPage from './pages/BusinessCheckoutPage';
import VendorRegistryPage from './pages/VendorRegistryPage';
import AdminLogsPage from './pages/AdminLogsPage';
import BatchAllocationPage from './pages/BatchAllocationPage';
import { EmployeeDashboard, EmployeeRequestPage, EmployeeAllocationsPage } from './pages/EmployeePages';

// Layout with Sidebar
function AppLayout({ title }) {
  return (
    <div className="app-layout">
      <Sidebar />
      <Header title={title} />
      <main className="main-content">
        <Outlet />
      </main>
      <ToastContainer />
    </div>
  );
}

// Route guard
function RequireAuth({ children }) {
  const { user } = useApp();
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/business-onboarding" element={<BusinessOnboarding />} />

      {/* Individual */}
      <Route element={<RequireAuth><AppLayout title="Dashboard" /></RequireAuth>}>
        <Route path="/dashboard" element={<IndividualDashboard />} />
      </Route>
      <Route element={<RequireAuth><AppLayout title="My Intents" /></RequireAuth>}>
        <Route path="/intents" element={<IntentsListPage />} />
      </Route>
      <Route element={<RequireAuth><AppLayout title="Create Intent" /></RequireAuth>}>
        <Route path="/create-intent" element={<CreateIntentPage />} />
      </Route>
      <Route element={<RequireAuth><AppLayout title="Vendors & Merchants" /></RequireAuth>}>
        <Route path="/vendors" element={<VendorsPage />} />
      </Route>
      <Route element={<RequireAuth><AppLayout title="Pay via QUILL" /></RequireAuth>}>
        <Route path="/checkout" element={<CheckoutPage />} />
      </Route>
      <Route element={<RequireAuth><AppLayout title="Analytics" /></RequireAuth>}>
        <Route path="/analytics" element={<AnalyticsPage />} />
      </Route>
      <Route element={<RequireAuth><AppLayout title="My Activity" /></RequireAuth>}>
        <Route path="/activity" element={<ActivityPage />} />
      </Route>

      {/* Business Admin */}
      <Route element={<RequireAuth><AppLayout title="Admin Dashboard" /></RequireAuth>}>
        <Route path="/business/dashboard" element={<BusinessDashboard />} />
      </Route>
      <Route element={<RequireAuth><AppLayout title="Budgets & Intents" /></RequireAuth>}>
        <Route path="/business/budgets" element={<BudgetsPage />} />
      </Route>
      <Route element={<RequireAuth><AppLayout title="Create Budget" /></RequireAuth>}>
        <Route path="/business/create-budget" element={<CreateBudgetPage />} />
      </Route>
      <Route element={<RequireAuth><AppLayout title="Batch Allocation" /></RequireAuth>}>
        <Route path="/business/batch-allocation" element={<BatchAllocationPage />} />
      </Route>
      <Route element={<RequireAuth><AppLayout title="Requests" /></RequireAuth>}>
        <Route path="/business/requests" element={<RequestsPage />} />
      </Route>
      <Route element={<RequireAuth><AppLayout title="Vendor Registry" /></RequireAuth>}>
        <Route path="/business/vendors" element={<VendorRegistryPage />} />
      </Route>
      <Route element={<RequireAuth><AppLayout title="Team & Roles" /></RequireAuth>}>
        <Route path="/business/team" element={<TeamPage />} />
      </Route>
      <Route element={<RequireAuth><AppLayout title="Business Analytics" /></RequireAuth>}>
        <Route path="/business/analytics" element={<BusinessAnalyticsPage />} />
      </Route>
      <Route element={<RequireAuth><AppLayout title="Logs & Audit Trail" /></RequireAuth>}>
        <Route path="/business/logs" element={<AdminLogsPage />} />
      </Route>
      <Route element={<RequireAuth><AppLayout title="Mock Checkout" /></RequireAuth>}>
        <Route path="/business/checkout" element={<BusinessCheckoutPage />} />
      </Route>

      {/* Employee */}
      <Route element={<RequireAuth><AppLayout title="Employee Dashboard" /></RequireAuth>}>
        <Route path="/employee/dashboard" element={<EmployeeDashboard />} />
      </Route>
      <Route element={<RequireAuth><AppLayout title="Request Budget" /></RequireAuth>}>
        <Route path="/employee/request" element={<EmployeeRequestPage />} />
      </Route>
      <Route element={<RequireAuth><AppLayout title="My Allocations" /></RequireAuth>}>
        <Route path="/employee/allocations" element={<EmployeeAllocationsPage />} />
      </Route>
      <Route element={<RequireAuth><AppLayout title="Pay via QUILL" /></RequireAuth>}>
        <Route path="/employee/checkout" element={<BusinessCheckoutPage />} />
      </Route>
      <Route element={<RequireAuth><AppLayout title="My Activity" /></RequireAuth>}>
        <Route path="/employee/activity" element={<ActivityPage />} />
      </Route>

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <AppRoutes />
      </AppProvider>
    </BrowserRouter>
  );
}
