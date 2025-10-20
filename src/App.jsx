// src/App.jsx
import { Outlet } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';

const App = () => {
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-100">
        <Outlet />
      </div>
    </ErrorBoundary>
  );
};

export default App;
