// src/router/index.jsx
import { createBrowserRouter, Navigate } from 'react-router-dom';
import Login from '../pages/login';
import Register from '../pages/register';
import Dashboard from '../pages/dashboard';
import PrivateRoute from '../components/PrivateRoute';
import DashboardLayout from '../components/DashboardLayout';
import CreateSurveyWrapper from '../pages/CreateSurvey';
import MySurveys from '../pages/MySurveys';
import Analytics from '../pages/Analytics';
import SurveyPreview from '../pages/SurveyPreview';
import PublicSurvey from '../pages/PublicSurvey';
import AdminDashboard from '../pages/AdminDashboard';
//import SurveyEdit from '../pages/SurveyEdit'; 

const router = createBrowserRouter([
  {
    path: '/',
    element: <PrivateRoute />,
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />
      },
      {
        path: 'dashboard',
        element: <DashboardLayout />,
        children: [
          { index: true, element: <Dashboard /> },
          { path: 'create', element: <CreateSurveyWrapper /> },
          { path: 'mysurveys', element: <MySurveys /> },
          { path: 'survey/preview/:id', element: <SurveyPreview /> },
          { path: 'survey/edit/:id', element: <CreateSurveyWrapper /> },
          { path: 'survey/analytics/:id', element: <Analytics /> },
          { path: 'admin', element: <AdminDashboard /> },
          
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
  {
    path: '/survey/:id',
    element: <PublicSurvey />,
  },
]);

export default router;


