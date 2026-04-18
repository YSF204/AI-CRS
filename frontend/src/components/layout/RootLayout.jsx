import { Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ChatbotWidget from '../Employee/ChatbotWidget';

export default function RootLayout() {
  const { user } = useAuth();
  const location = useLocation();

  const showChatbot = user?.role === 'EMPLOYEE';

  return (
    <>
      <Outlet />
      {showChatbot && <ChatbotWidget key={location.pathname} />}
    </>
  );
}