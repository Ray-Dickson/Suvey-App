import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Eye,
  Edit,
  Trash2,
  Share2,
  BarChart3,
  Calendar,
  Users,
  Copy,
  Check
} from 'lucide-react';
import { getUserSurveys } from '../services/surveyAPI'; // ✅ real API

export default function Dashboard() {
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [shareModal, setShareModal] = useState({ open: false, survey: null, copied: false });

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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleDeleteSurvey = async (surveyId) => {
    if (window.confirm('Are you sure you want to delete this survey?')) {
      try {
        setSurveys(surveys.filter(survey => survey.id !== surveyId));
        // You can call your deleteSurvey endpoint here if needed
      } catch (error) {
        console.error('Error deleting survey:', error);
      }
    }
  };

  const handleShareSurvey = (survey) => {
    const surveyUrl = `${window.location.origin}/survey/${survey.id}`;
    setShareModal({ open: true, survey, copied: false, url: surveyUrl });
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareModal.url);
      setShareModal(prev => ({ ...prev, copied: true }));
      setTimeout(() => {
        setShareModal(prev => ({ ...prev, copied: false }));
      }, 2000);
    } catch (error) {
      console.error('Failed to copy link');
    }
  };

  useEffect(() => {
    async function fetchSurveys() {
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user?.id) throw new Error('User ID not found');
        
        const data = await getUserSurveys(user.id);
        setSurveys(data);
        
      } catch (error) {
        console.error('Failed to fetch surveys:', error.message);
      } finally {
        setLoading(false);
      }
    }

    fetchSurveys();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-gray-600">Manage your surveys and view responses</p>
        </div>
        <Link
          to="/builder"
          className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200"
        >
          <Plus className="h-5 w-5 mr-2" />
          Create Survey
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-primary-100 rounded-lg">
              <BarChart3 className="h-6 w-6 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Surveys</p>
              <p className="text-2xl font-bold text-gray-900">{surveys.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Responses</p>
              <p className="text-2xl font-bold text-gray-900">
                {surveys.reduce((total, s) => total + (s.responses || 0), 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Published</p>
              <p className="text-2xl font-bold text-gray-900">
                {surveys.filter(s => s.status === 'published').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Surveys List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Your Surveys</h2>
        </div>

        {surveys.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No surveys yet</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating your first survey.</p>
            <div className="mt-6">
              <Link
                to="/builder"
                className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200"
              >
                <Plus className="h-5 w-5 mr-2" />
                Create Survey
              </Link>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {surveys.map((survey) => (
              <div key={survey.id} className="px-6 py-4 hover:bg-gray-50 transition-colors duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-lg font-medium text-gray-900 truncate">{survey.title}</h3>
                      {getStatusBadge(survey.status)}
                    </div>
                    <p className="mt-1 text-sm text-gray-500 truncate">{survey.description}</p>
                    <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                      <span className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        {survey.responses || 0} responses
                      </span>
                      <span className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {survey.last_edited ? formatDate(survey.last_edited) : 'N/A'}
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
                    <Link to={`/dashboard/survey/edit/${survey.id}`} className="p-2 text-gray-400 hover:text-gray-600" title="Edit">
                      <Edit className="h-5 w-5" />
                    </Link>
                    <button onClick={() => handleShareSurvey(survey)} className="p-2 text-gray-400 hover:text-gray-600" title="Share">
                      <Share2 className="h-5 w-5" />
                    </button>
                    <button onClick={() => handleDeleteSurvey(survey.id)} className="p-2 text-gray-400 hover:text-red-600" title="Delete">
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Share Modal */}
      {shareModal.open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
             onClick={() => setShareModal({ open: false, survey: null, copied: false })}>
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Share Survey</h3>
            </div>
            <div className="px-6 py-4">
              <p className="text-sm text-gray-600 mb-4">
                Share this link to collect responses for "{shareModal.survey?.title}"
              </p>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={shareModal.url}
                  readOnly
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
                <button
                  onClick={copyToClipboard}
                  className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                >
                  {shareModal.copied ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
                  {shareModal.copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setShareModal({ open: false, survey: null, copied: false })}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
