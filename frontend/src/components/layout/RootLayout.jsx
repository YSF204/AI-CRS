import { Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ChatbotWidget from '../Employee/ChatbotWidget';

export default function RootLayout() {
  const { user } = useAuth();
  const location = useLocation();

  const showChatbot = user?.role === 'EMPLOYEE';

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--fg)]">
      {/* Outlet renders child routes - they handle their own padding via dashboard-shell */}
      <Outlet />

      {/* Chatbot Widget - Employee Only */}
      {showChatbot && <ChatbotWidget key={location.pathname} />}
    </div>
  );
}