import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../services/api';
import { 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';
import { 
  ArrowLeft, 
  Download, 
  Users, 
  TrendingUp, 
  Calendar,
  BarChart3
} from 'lucide-react';
import toast from 'react-hot-toast';

const Analytics = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [survey, setSurvey] = useState(null);
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuestion, setSelectedQuestion] = useState(null);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await API.get(`/analytics/surveys/${id}`);
      
      // Transform questions to match frontend schema (text -> question)
      const transformedSurvey = {
        ...response.data,
        questions: response.data.questions.map(q => ({
          ...q,
          question: q.text, // Map text field to question field
          options: q.options || [] // Ensure options exists
        }))
      };
      
      setSurvey(transformedSurvey);
      setResponses(response.data.responses);
      
      if (transformedSurvey.questions.length > 0) {
        setSelectedQuestion(transformedSurvey.questions[0]);
      }
    } catch (error) {
      toast.error('Failed to fetch analytics data');
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getQuestionStats = (question) => {
    const questionResponses = responses.map(response => response.answers[question.id]).filter(Boolean);
    
    if (question.type === 'rating') {
      const ratings = questionResponses.map(r => parseInt(r));
      const avgRating = ratings.length > 0 
  ? (ratings.reduce((a, b) => a + b, 0) / ratings.length) 
  : 0;
      const ratingDistribution = [1, 2, 3, 4, 5].map(rating => ({
        rating,
        count: ratings.filter(r => r === rating).length
      }));
      
      return {
        type: 'rating',
        total: questionResponses.length,
        average: avgRating.toFixed(1),
        distribution: ratingDistribution
      };
    }
    
    if (question.type === 'radio' || question.type === 'dropdown') {
      const optionCounts = {};
      questionResponses.forEach(response => {
        optionCounts[response] = (optionCounts[response] || 0) + 1;
      });
      
      const chartData = question.options.map(option => ({
        option,
        count: optionCounts[option] || 0,
        percentage: questionResponses.length > 0 ? 
          ((optionCounts[option] || 0) / questionResponses.length * 100).toFixed(1) : 0
      }));
      
      return {
        type: 'choice',
        total: questionResponses.length,
        distribution: chartData
      };
    }
    
    if (question.type === 'checkbox') {
      const optionCounts = {};
      questionResponses.forEach(responseArray => {
        if (Array.isArray(responseArray)) {
          responseArray.forEach(option => {
            optionCounts[option] = (optionCounts[option] || 0) + 1;
          });
        }
      });
      
      const chartData = question.options.map(option => ({
        option,
        count: optionCounts[option] || 0,
        percentage: questionResponses.length > 0 ? 
          ((optionCounts[option] || 0) / questionResponses.length * 100).toFixed(1) : 0
      }));
      
      return {
        type: 'multiple',
        total: questionResponses.length,
        distribution: chartData
      };
    }
    
    if (question.type === 'text' || question.type === 'textarea') {
      return {
        type: 'text',
        total: questionResponses.length,
        responses: questionResponses
      };
    }
    
    return {
      type: 'unknown',
      total: questionResponses.length
    };
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  const renderChart = (question, stats) => {
    if (stats.type === 'rating') {
      return (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="card p-4 text-center">
              <div className="text-2xl font-bold text-primary-600">{stats.total}</div>
              <div className="text-sm text-gray-600">Total Responses</div>
            </div>
            <div className="card p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{stats.average}</div>
              <div className="text-sm text-gray-600">Average Rating</div>
            </div>
            <div className="card p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {stats.distribution.reduce((max, item) => item.count > max ? item.count : max, 0)}
              </div>
              <div className="text-sm text-gray-600">Most Common</div>
            </div>
          </div>
          
          <div className="card p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Rating Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.distribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="rating" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      );
    }
    
    if (stats.type === 'choice' || stats.type === 'multiple') {
      return (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Response Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.distribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="option" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            <div className="card p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Percentage Breakdown</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={stats.distribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ option, percentage }) => `${option}: ${percentage}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {stats.distribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="card p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Detailed Breakdown</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Option
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Count
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Percentage
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {stats.distribution.map((item, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {item.option}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.count}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.percentage}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      );
    }
    
    if (stats.type === 'text') {
      return (
        <div className="space-y-6">
          <div className="card p-4 text-center">
            <div className="text-2xl font-bold text-primary-600">{stats.total}</div>
            <div className="text-sm text-gray-600">Text Responses</div>
          </div>
          
          <div className="card p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">All Responses</h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {stats.responses.map((response, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-900">{response}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }
    
    return (
      <div className="card p-6 text-center">
        <p className="text-gray-500">No data available for this question type</p>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!survey) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Survey Not Found</h1>
        <p className="text-gray-600 mb-6">The survey you're looking for doesn't exist.</p>
        <button
          onClick={() => navigate('/dashboard')}
          className="btn btn-primary"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
            <p className="mt-1 text-gray-600">{survey.title}</p>
          </div>
        </div>
        
        <button
          onClick={() => window.print()}
          className="btn btn-secondary flex items-center"
        >
          <Download className="h-4 w-4 mr-2" />
          Export
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-2 bg-primary-100 rounded-lg">
              <Users className="h-6 w-6 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Responses</p>
              <p className="text-2xl font-bold text-gray-900">{responses.length}</p>
            </div>
          </div>
        </div>
        
        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <BarChart3 className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Questions</p>
              <p className="text-2xl font-bold text-gray-900">{survey.questions.length}</p>
            </div>
          </div>
        </div>
        
        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Response Rate</p>
              <p className="text-2xl font-bold text-gray-900">
                {responses.length > 0 ? 'Active' : 'No responses'}
              </p>
            </div>
          </div>
        </div>
        
        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Calendar className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Last Response</p>
              <p className="text-2xl font-bold text-gray-900">
                {responses.length > 0 ? 
                  new Date(responses[responses.length - 1].submittedAt).toLocaleDateString() : 
                  'N/A'
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Question Selector */}
      {survey.questions.length > 0 && (
        <div className="card p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Select Question to Analyze</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {survey.questions.map((question, index) => (
              <button
                key={question.id}
                onClick={() => setSelectedQuestion(question)}
                className={`p-3 text-left rounded-lg border transition-colors duration-200 ${
                  selectedQuestion?.id === question.id
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="text-sm font-medium truncate">
                  {index + 1}. {question.question}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {question.type} • {getQuestionStats(question).total} responses
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Question Analytics */}
      {selectedQuestion && (
        <div className="space-y-6">
          <div className="card p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              {survey.questions.findIndex(q => q.id === selectedQuestion.id) + 1}. {selectedQuestion.question}
            </h2>
            <p className="text-gray-600 mb-4">
              {selectedQuestion.type} • {getQuestionStats(selectedQuestion).total} responses
            </p>
            
            {renderChart(selectedQuestion, getQuestionStats(selectedQuestion))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;