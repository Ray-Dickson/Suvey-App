import { useState } from 'react';
import { Plus, Trash2, Settings, Copy } from 'lucide-react';

const QuestionEditor = ({ question, updateQuestion, isEditing, setIsEditing }) => {
  const [showConditional, setShowConditional] = useState(false);

  const handleQuestionChange = (field, value) => {
    updateQuestion(question.id, { [field]: value });
  };

  const addOption = () => {
    const newOptions = [...(question.options || []), `Option ${(question.options?.length || 0) + 1}`];
    updateQuestion(question.id, { options: newOptions });
  };

  const updateOption = (index, value) => {
    const newOptions = [...(question.options || [])];
    newOptions[index] = value;
    updateQuestion(question.id, { options: newOptions });
  };

  const removeOption = (index) => {
    const newOptions = (question.options || []).filter((_, i) => i !== index);
    updateQuestion(question.id, { options: newOptions });
  };

  const getQuestionTypeLabel = (type) => {
    const types = {
      text: 'Text Input',
      textarea: 'Text Area',
      radio: 'Radio Buttons',
      checkbox: 'Checkboxes',
      dropdown: 'Dropdown',
      rating: 'Rating (1-5)'
    };
    return types[type] || type;
  };

  const renderQuestionPreview = () => {
    switch (question.type) {
      case 'text':
        return (
          <input
            type="text"
            placeholder="Text input"
            className="input"
            disabled
          />
        );
      
      case 'textarea':
        return (
          <textarea
            placeholder="Text area"
            className="input"
            rows={3}
            disabled
          />
        );
      
      case 'radio':
        return (
          <div className="space-y-2">
            {(question.options || []).map((option, index) => (
              <label key={index} className="flex items-center">
                <input
                  type="radio"
                  name={`preview-${question.id}`}
                  className="mr-2"
                  disabled
                />
                <span className="text-sm text-gray-600">{option}</span>
              </label>
            ))}
          </div>
        );
      
      case 'checkbox':
        return (
          <div className="space-y-2">
            {(question.options || []).map((option, index) => (
              <label key={index} className="flex items-center">
                <input
                  type="checkbox"
                  className="mr-2"
                  disabled
                />
                <span className="text-sm text-gray-600">{option}</span>
              </label>
            ))}
          </div>
        );
      
      case 'dropdown':
        return (
          <select className="input" disabled>
            <option>Select an option</option>
            {(question.options || []).map((option, index) => (
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
                className="text-2xl text-gray-300 hover:text-yellow-400"
                disabled
              >
                ⭐
              </button>
            ))}
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {/* Question Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <span className="text-sm font-medium text-gray-500">
            {getQuestionTypeLabel(question.type)}
          </span>
          {question.required && (
            <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
              Required
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors duration-200"
            title="Toggle edit mode"
          >
            <Settings className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Question Text */}
      <div>
        <input
          type="text"
          value={question.question}
          onChange={(e) => handleQuestionChange('question', e.target.value)}
          className="input font-medium"
          placeholder="Enter your question"
        />
      </div>

      {/* Question Options (for radio, checkbox, dropdown) */}
      {(question.type === 'radio' || question.type === 'checkbox' || question.type === 'dropdown') && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Options</label>
          {(question.options || []).map((option, index) => (
            <div key={index} className="flex items-center space-x-2">
              <input
                type="text"
                value={option}
                onChange={(e) => updateOption(index, e.target.value)}
                className="input flex-1 text-sm"
                placeholder={`Option ${index + 1}`}
              />
              <button
                onClick={() => removeOption(index)}
                className="p-1 text-red-400 hover:text-red-600 transition-colors duration-200"
                title="Remove option"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
          <button
            onClick={addOption}
            className="flex items-center text-sm text-primary-600 hover:text-primary-700 transition-colors duration-200"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Option
          </button>
        </div>
      )}

      {/* Question Settings */}
      {isEditing && (
        <div className="space-y-3 pt-3 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">Required</label>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={question.required}
                onChange={(e) => handleQuestionChange('required', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>

          {/* Conditional Logic */}
          <div>
            <button
              onClick={() => setShowConditional(!showConditional)}
              className="flex items-center text-sm text-gray-600 hover:text-gray-800 transition-colors duration-200"
            >
              <Settings className="h-4 w-4 mr-1" />
              Conditional Logic
            </button>
            
            {showConditional && (
              <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 mb-2">
                  Show this question only if a previous question has a specific answer
                </p>
                <div className="space-y-2">
                  <select className="input text-sm">
                    <option>Select a question</option>
                    <option>Question 1</option>
                    <option>Question 2</option>
                  </select>
                  <select className="input text-sm">
                    <option>Select condition</option>
                    <option>equals</option>
                    <option>contains</option>
                    <option>not equals</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Value"
                    className="input text-sm"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Question Preview */}
      <div className="pt-3 border-t border-gray-200">
        <label className="block text-sm font-medium text-gray-700 mb-2">Preview</label>
        <div className="p-3 bg-gray-50 rounded-lg">
          {renderQuestionPreview()}
        </div>
      </div>
    </div>
  );
};

export default QuestionEditor; 