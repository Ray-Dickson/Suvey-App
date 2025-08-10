// src/pages/CreateSurvey.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DndProvider, useDrop, useDrag } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import API from '../services/api';
import { 
  Plus, 
  GripVertical, 
  Trash2, 
  Save, 
  Eye,
  Settings,
  ArrowLeft
} from 'lucide-react';
import toast from 'react-hot-toast';
import QuestionEditor from '../components/QuestionEditor';

const CreateSurveyWrapper = () => {
  return (
    <DndProvider backend={HTML5Backend}>
      <CreateSurvey />
    </DndProvider>
  );
};

const CreateSurvey = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [survey, setSurvey] = useState({
    title: '',
    description: '',
    is_public: true,
    allow_multiple_submissions: false,
    requires_login: false,
    status: 'draft',
    questions: []
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (id) {
      const fetchSurvey = async () => {
        setLoading(true);
        try {
          const response = await API.get(`/surveys/${id}`);
          const surveyData = response.data;
          
          setSurvey({
            ...surveyData,
            questions: surveyData.questions.sort((a, b) => a.display_order - b.display_order)
          });
        } catch (error) {
          toast.error('Failed to fetch survey');
          console.error('Error fetching survey:', error);
        } finally {
          setLoading(false);
        }
      };
      
      fetchSurvey();
    }
  }, [id]);

  const addQuestion = (type) => {
    const newQuestion = {
      id: `temp-${Date.now()}`,
      question_text: '',
      type,
      is_required: false,
      display_order: survey.questions.length + 1,
      options: ['radio', 'checkbox', 'dropdown'].includes(type) 
        ? [{ 
            id: `opt-${Date.now()}`, 
            option_text: 'Option 1', 
            display_order: 1 
          }] 
        : []
    };
    
    setSurvey(prev => ({
      ...prev,
      questions: [...prev.questions, newQuestion]
    }));
    setIsEditing(true);
  };

  const updateQuestion = (questionId, updates) => {
    setSurvey(prev => ({
      ...prev,
      questions: prev.questions.map(q => 
        q.id === questionId ? { ...q, ...updates } : q
      )
    }));
  };

  const deleteQuestion = async (questionId) => {
    if (!questionId.startsWith('temp-')) {
      try {
        await API.delete(`/questions/${questionId}`);
        toast.success('Question deleted');
      } catch (error) {
        toast.error('Failed to delete question');
        console.error('Error deleting question:', error);
        return;
      }
    }
    
    setSurvey(prev => ({
      ...prev,
      questions: prev.questions
        .filter(q => q.id !== questionId)
        .map((q, index) => ({ ...q, display_order: index + 1 }))
    }));
  };

  const moveQuestion = (dragIndex, hoverIndex) => {
    const draggedQuestion = survey.questions[dragIndex];
    const newQuestions = [...survey.questions];
    newQuestions.splice(dragIndex, 1);
    newQuestions.splice(hoverIndex, 0, draggedQuestion);
    
    const updatedQuestions = newQuestions.map((q, index) => ({
      ...q,
      display_order: index + 1
    }));
    
    setSurvey(prev => ({
      ...prev,
      questions: updatedQuestions
    }));
  };

  const saveSurvey = async (publish = false) => {
    if (!survey.title.trim()) {
      toast.error('Please enter a survey title');
      return;
    }

    if (survey.questions.length === 0) {
      toast.error('Please add at least one question');
      return;
    }

    try {
      setSaving(true);
      const surveyData = {
        ...survey,
        status: publish ? 'published' : survey.status,
        questions: survey.questions.map(question => ({
          id: question.id.startsWith('temp-') ? null : question.id,
          question_text: question.question_text,
          type: question.type,
          is_required: question.is_required,
          display_order: question.display_order,
          options: question.options?.map(option => ({
            id: option.id.startsWith('temp-') ? null : option.id,
            option_text: option.option_text,
            display_order: option.display_order
          })) || []
        }))
      };

      let response;
      if (id) {
        response = await API.put(`/surveys/${id}`, surveyData);
        toast.success(`Survey ${publish ? 'published' : 'updated'} successfully`);
      } else {
        response = await API.post('/surveys', surveyData);
        toast.success(`Survey ${publish ? 'published' : 'created'} successfully`);
      }

      if (publish) {
        navigate('/dashboard');
      } else if (!id) {
        navigate(`/builder/${response.data.id}`);
      }
    } catch (error) {
      toast.error(`Failed to ${id ? 'update' : 'create'} survey`);
      console.error('Error saving survey:', error);
    } finally {
      setSaving(false);
    }
  };

  const publishSurvey = () => saveSurvey(true);

  const questionTypes = [
    { type: 'text', label: 'Text Input', icon: '📝' },
    { type: 'textarea', label: 'Text Area', icon: '📄' },
    { type: 'radio', label: 'Radio Buttons', icon: '🔘' },
    { type: 'checkbox', label: 'Checkboxes', icon: '☑️' },
    { type: 'dropdown', label: 'Dropdown', icon: '📋' },
    { type: 'rating', label: 'Rating (1-5)', icon: '⭐' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div className="flex items-center space-x-4 mb-4 md:mb-0">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              {id ? 'Edit Survey' : 'Create Survey'}
            </h1>
            <p className="text-gray-600">Design your survey with questions and logic</p>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          {id && (
            <button
              onClick={() => navigate(`/dashboard/survey/preview/${id}`)}
              className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50"
            >
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </button>
          )}
          <button
            onClick={() => saveSurvey()}
            disabled={saving}
            className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-70"
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save'}
          </button>
          {survey.status === 'draft' && (
            <button
              onClick={publishSurvey}
              disabled={saving}
              className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-70"
            >
              <Eye className="h-4 w-4 mr-2" />
              Publish
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Survey Settings */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
            <div className="flex items-center space-x-2">
              <Settings className="h-5 w-5 text-gray-500" />
              <h2 className="text-lg font-semibold text-gray-800">Survey Settings</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Survey Title *
                </label>
                <input
                  type="text"
                  value={survey.title}
                  onChange={(e) => setSurvey(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter survey title"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={survey.description}
                  onChange={(e) => setSurvey(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  placeholder="Enter survey description"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_public"
                  checked={survey.is_public}
                  onChange={(e) => setSurvey(prev => ({ ...prev, is_public: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="is_public" className="ml-2 block text-sm text-gray-700">
                  Make survey public
                </label>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
            <h2 className="text-lg font-semibold text-gray-800">Question Types</h2>
            <div className="grid grid-cols-1 gap-3">
              {questionTypes.map((type) => (
                <button
                  key={type.type}
                  onClick={() => addQuestion(type.type)}
                  className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
                >
                  <span className="text-xl mr-3">{type.icon}</span>
                  <span className="text-sm font-medium text-gray-800 flex-grow">{type.label}</span>
                  <Plus className="h-4 w-4 text-gray-400" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Questions Panel */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800">
                Questions ({survey.questions.length})
              </h2>
            </div>
            
            {survey.questions.length === 0 ? (
              <div className="p-12 text-center">
                <div className="text-5xl mb-4">📝</div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">No questions yet</h3>
                <p className="text-gray-500 mb-6">Add questions from the panel on the left to get started.</p>
              </div>
            ) : (
              <div className="p-6 space-y-4">
                {survey.questions.map((question, index) => (
                  <DraggableQuestion
                    key={question.id}
                    question={question}
                    index={index}
                    moveQuestion={moveQuestion}
                    updateQuestion={updateQuestion}
                    deleteQuestion={deleteQuestion}
                    isEditing={isEditing}
                    setIsEditing={setIsEditing}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const DraggableQuestion = ({ question, index, moveQuestion, updateQuestion, deleteQuestion, isEditing, setIsEditing }) => {
  const [{ isDragging }, drag, dragPreview] = useDrag({
    type: 'QUESTION',
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: 'QUESTION',
    hover: (item, monitor) => {
      if (!dragPreview) return;
      const dragIndex = item.index;
      const hoverIndex = index;
      if (dragIndex === hoverIndex) return;
      moveQuestion(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  return (
    <div
      ref={(node) => drag(drop(node))}
      className={`bg-white rounded-lg border border-gray-200 p-4 ${isDragging ? 'opacity-50' : 'opacity-100'} shadow-xs`}
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 pt-1 cursor-move" ref={drag}>
          <GripVertical className="h-5 w-5 text-gray-400" />
        </div>
        
        <div className="flex-grow">
          <QuestionEditor
            question={question}
            updateQuestion={updateQuestion}
            isEditing={isEditing}
            setIsEditing={setIsEditing}
          />
        </div>
        
        <div className="flex-shrink-0">
          <button
            onClick={() => deleteQuestion(question.id)}
            className="p-1 text-gray-400 hover:text-red-500 transition-colors"
            title="Delete question"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateSurveyWrapper;