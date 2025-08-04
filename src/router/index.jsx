// src/router/index.jsx
import { createBrowserRouter } from 'react-router-dom';
import App from '../App';
import Login from '../pages/login';
import Register from '../pages/register';
import Dashboard from '../pages/dashboard';
import PrivateRoute from '../components/PrivateRoute';
import DashboardLayout from '../components/DashboardLayout';
import CreateSurveyWrapper from '../pages/CreateSurvey';
import MySurveys from '../pages/MySurveys';
import Analytics from '../pages/Analytics';

const router = createBrowserRouter([
  {
    path: '/',
    element: <PrivateRoute />,
    children: [
      {
        path: 'dashboard',
        element: <DashboardLayout />,
        children: [
          { index: true, element: <Dashboard /> },
          { path: 'create', element: <CreateSurveyWrapper /> },
          { path: 'mysurveys', element: <MySurveys /> },
          { path: 'analytics', element: <Analytics /> },
        ],
      },
    ],
  },
  {
    path: '/register',
    element: <Register />,
  },
  {
    path: '/login',
    element: <Login />,
  },
]);

export default router;


