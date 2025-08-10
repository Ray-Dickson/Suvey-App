// src/pages/SurveyPreview.jsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Check, Send, ArrowLeft } from 'lucide-react';
import API from '../services/api';
import toast from 'react-hot-toast';

const SurveyPreview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [survey, setSurvey] = useState(null);
  const [responses, setResponses] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const fetchSurvey = async () => {
      try {
        setLoading(true);
        const response = await API.get(`/surveys/${id}`);
        
        // Transform API response to match template structure
        const transformedSurvey = {
          ...response.data,
          questions: response.data.questions.map(question => ({
            id: question.id,
            question: question.question_text,
            type: question.type,
            required: question.is_required,
            options: question.options.map(option => option.option_text),
            displayOrder: question.display_order
          }))
        };

        setSurvey(transformedSurvey);
        
        // Initialize responses object
        const initialResponses = {};
        transformedSurvey.questions.forEach(question => {
          if (question.type === 'checkbox') {
            initialResponses[question.id] = [];
          } else {
            initialResponses[question.id] = '';
          }
        });
        setResponses(initialResponses);
      } catch (err) {
        console.error('Error fetching survey:', err);
        toast.error('Failed to load survey');
      } finally {
        setLoading(false);
      }
    };

    fetchSurvey();
  }, [id]);

  const handleResponseChange = (questionId, value) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleCheckboxChange = (questionId, option, checked) => {
    setResponses(prev => {
      const currentValues = prev[questionId] || [];
      if (checked) {
        return {
          ...prev,
          [questionId]: [...currentValues, option]
        };
      } else {
        return {
          ...prev,
          [questionId]: currentValues.filter(val => val !== option)
        };
      }
    });
  };

  const validateResponses = () => {
    if (!survey) return ['Survey not loaded'];
    
    const errors = [];
    survey.questions.forEach(question => {
      if (question.required) {
        const response = responses[question.id];
        if (!response || (Array.isArray(response) && response.length === 0)) {
          errors.push(`"${question.question}" is required`);
        }
      }
    });
    
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const errors = validateResponses();
    if (errors.length > 0) {
      errors.forEach(error => toast.error(error));
      return;
    }

    try {
      setSubmitting(true);
      await API.post(`/surveys/${id}/responses`, {
        survey_id: id,
        responses: Object.entries(responses).map(([questionId, response]) => ({
          question_id: questionId,
          response_value: Array.isArray(response) ? response.join(',') : response
        }))
      });
      setSubmitted(true);
      toast.success('Thank you for your response!');
    } catch (error) {
      console.error('Error submitting response:', error);
      toast.error('Failed to submit response');
    } finally {
      setSubmitting(false);
    }
  };

  const renderQuestion = (question) => {
    const response = responses[question.id];

    switch (question.type) {
      case 'text':
        return (
          <input
            type="text"
            value={response}
            onChange={(e) => handleResponseChange(question.id, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter your answer"
            required={question.required}
          />
        );
      
      case 'textarea':
        return (
          <textarea
            value={response}
            onChange={(e) => handleResponseChange(question.id, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            rows={4}
            placeholder="Enter your answer"
            required={question.required}
          />
        );
      
      case 'radio':
        return (
          <div className="space-y-3">
            {question.options.map((option, index) => (
              <label key={index} className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name={question.id}
                  value={option}
                  checked={response === option}
                  onChange={(e) => handleResponseChange(question.id, e.target.value)}
                  className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  required={question.required}
                />
                <span className="text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        );
      
      case 'checkbox':
        return (
          <div className="space-y-3">
            {question.options.map((option, index) => (
              <label key={index} className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  value={option}
                  checked={response.includes(option)}
                  onChange={(e) => handleCheckboxChange(question.id, option, e.target.checked)}
                  className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  required={question.required && response.length === 0}
                />
                <span className="text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        );
      
      case 'dropdown':
        return (
          <select
            value={response}
            onChange={(e) => handleResponseChange(question.id, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            required={question.required}
          >
            <option value="">Select an option</option>
            {question.options.map((option, index) => (
              <option key={index} value={option}>{option}</option>
            ))}
          </select>
        );
      
      case 'rating':
        return (
          <div className="flex items-center space-x-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => handleResponseChange(question.id, star)}
                className={`text-3xl transition-colors duration-200 ${
                  response >= star ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-200'
                }`}
              >
                ⭐
              </button>
            ))}
            {response && (
              <span className="ml-3 text-sm text-gray-600">
                {response} out of 5
              </span>
            )}
          </div>
        );
      
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!survey) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Survey Not Found</h1>
        <p className="text-gray-600 mb-6">The survey you're looking for doesn't exist or has been removed.</p>
        <button
          onClick={() => navigate('/')}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Go Home
        </button>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <div className="mb-6">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
            <Check className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Thank You!</h1>
          <p className="text-gray-600">Your response has been submitted successfully.</p>
        </div>
        <button
          onClick={() => navigate('/')}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Return to Home
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center text-gray-600 hover:text-gray-800 transition-colors duration-200 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </button>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{survey.title}</h1>
          {survey.description && (
            <p className="text-gray-600">{survey.description}</p>
          )}
        </div>
      </div>

      {/* Survey Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {survey.questions.sort((a, b) => a.displayOrder - b.displayOrder).map((question, index) => (
          <div key={question.id} className="bg-white p-6 rounded-lg shadow">
            <div className="mb-4">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {index + 1}. {question.question}
                {question.required && (
                  <span className="text-red-500 ml-1">*</span>
                )}
              </h3>
            </div>
            
            <div>
              {renderQuestion(question)}
            </div>
          </div>
        ))}

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center"
          >
            {submitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Submitting...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Submit Response
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SurveyPreview;