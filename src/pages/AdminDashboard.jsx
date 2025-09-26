import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  BarChart3,
  Eye,
  Trash2,
  Edit,
  Calendar,
  Mail,
  Phone,
  Shield,
  User,
  TrendingUp,
  Activity,
  Database,
  AlertCircle
} from 'lucide-react';
import { getAdminStats, getAllSurveysForAdmin, getAllUsersForAdmin } from '../services/adminAPI';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const { state } = useAuth();
  const [stats, setStats] = useState(null);
  const [surveys, setSurveys] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      published: { color: 'bg-green-100 text-green-800', text: 'Published' },
      draft: { color: 'bg-yellow-100 text-yellow-800', text: 'Draft' },
      archived: { color: 'bg-gray-100 text-gray-800', text: 'Archived' }
    };

    const config = statusConfig[status] || statusConfig.draft;
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  const getRoleBadge = (role) => {
    const roleConfig = {
      admin: { color: 'bg-red-100 text-red-800', text: 'Admin', icon: Shield },
      creator: { color: 'bg-blue-100 text-blue-800', text: 'Creator', icon: User }
    };

    const config = roleConfig[role] || roleConfig.creator;
    const Icon = config.icon;
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="h-3 w-3 mr-1" />
        {config.text}
      </span>
    );
  };

  useEffect(() => {
    async function fetchAdminData() {
      try {
        const [statsData, surveysData, usersData] = await Promise.all([
          getAdminStats(),
          getAllSurveysForAdmin(),
          getAllUsersForAdmin()
        ]);

        setStats(statsData);
        setSurveys(surveysData);
        setUsers(usersData);
        toast.success('Admin data loaded successfully');
      } catch (error) {
        console.error('Error fetching admin data:', error);
        if (error.response?.status === 403) {
          toast.error('Access denied. Admin privileges required.');
        } else {
          toast.error('Failed to load admin data');
        }
      } finally {
        setLoading(false);
      }
    }

    if (state.isAuthenticated && state.user?.role === 'admin') {
      fetchAdminData();
    }
  }, [state.isAuthenticated, state.user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (state.user?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">Access Denied</h3>
          <p className="mt-1 text-sm text-gray-500">Admin privileges required to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="mt-2 text-gray-600">System overview and user management</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
            <Shield className="h-4 w-4 mr-1" />
            Admin Access
          </span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', name: 'Overview', icon: BarChart3 },
            { id: 'surveys', name: 'All Surveys', icon: Database },
            { id: 'users', name: 'Users', icon: Users }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {tab.name}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && stats && (
        <div className="space-y-6">
          {/* System Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.users.total_users}</p>
                  <p className="text-xs text-gray-500">{stats.users.admin_count} admins, {stats.users.creator_count} creators</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Surveys</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.surveys.total_surveys}</p>
                  <p className="text-xs text-gray-500">{stats.surveys.published_surveys} published, {stats.surveys.draft_surveys} drafts</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Activity className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Responses</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.responses.total_responses}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">System Health</p>
                  <p className="text-2xl font-bold text-green-600">Good</p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Recent Surveys</h3>
              </div>
              <div className="divide-y divide-gray-200">
                {surveys.slice(0, 5).map((survey) => (
                  <div key={survey.id} className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{survey.title}</p>
                        <p className="text-sm text-gray-500">by {survey.creator_name}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(survey.status)}
                        <span className="text-sm text-gray-500">{survey.response_count} responses</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Recent Users</h3>
              </div>
              <div className="divide-y divide-gray-200">
                {users.slice(0, 5).map((user) => (
                  <div key={user.id} className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{user.name}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getRoleBadge(user.role)}
                        <span className="text-sm text-gray-500">{user.survey_count} surveys</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Surveys Tab */}
      {activeTab === 'surveys' && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">All Surveys</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {surveys.map((survey) => (
              <div key={survey.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3">
                      <h4 className="text-lg font-medium text-gray-900 truncate">{survey.title}</h4>
                      {getStatusBadge(survey.status)}
                    </div>
                    <p className="mt-1 text-sm text-gray-500 truncate">{survey.description}</p>
                    <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                      <span className="flex items-center">
                        <User className="h-4 w-4 mr-1" />
                        {survey.creator_name} ({survey.creator_email})
                      </span>
                      <span className="flex items-center">
                        <BarChart3 className="h-4 w-4 mr-1" />
                        {survey.response_count} responses
                      </span>
                      <span className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {formatDate(survey.created_at)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Link to={`/dashboard/survey/preview/${survey.id}`} className="p-2 text-gray-400 hover:text-gray-600" title="Preview">
                      <Eye className="h-5 w-5" />
                    </Link>
                    <Link to={`/dashboard/survey/analytics/${survey.id}`} className="p-2 text-gray-400 hover:text-gray-600" title="Analytics">
                      <BarChart3 className="h-5 w-5" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">All Users</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {users.map((user) => (
              <div key={user.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3">
                      <h4 className="text-lg font-medium text-gray-900">{user.name}</h4>
                      {getRoleBadge(user.role)}
                    </div>
                    <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                      <span className="flex items-center">
                        <Mail className="h-4 w-4 mr-1" />
                        {user.email}
                      </span>
                      <span className="flex items-center">
                        <Phone className="h-4 w-4 mr-1" />
                        {user.phone_number}
                      </span>
                      <span className="flex items-center">
                        <BarChart3 className="h-4 w-4 mr-1" />
                        {user.survey_count} surveys, {user.response_count} responses
                      </span>
                      <span className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        Joined {formatDate(user.created_at)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
