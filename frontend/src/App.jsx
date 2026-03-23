import { BrowserRouter } from 'react-router-dom';
import AnimatedRoutes from './components/UI/PageTransition';

function App() {
  return (
    <BrowserRouter>
      <AnimatedRoutes />
    </BrowserRouter>
  );
}

export default App;
