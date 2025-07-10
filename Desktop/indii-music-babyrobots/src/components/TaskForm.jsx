import React, { useState } from 'react';

const TaskForm = ({ onCreateTask, onCancel, userRole }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    category: 'general',
    dueDate: '',
    tags: []
  });
  const [tagInput, setTagInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const categories = [
    { value: 'general', label: '📝 General', icon: '📝' },
    { value: 'release', label: '🎵 Release', icon: '🎵' },
    { value: 'marketing', label: '📈 Marketing', icon: '📈' },
    { value: 'collaboration', label: '🤝 Collaboration', icon: '🤝' }
  ];

  const priorities = [
    { value: 'low', label: 'Low Priority', color: 'bg-green-100 text-green-800' },
    { value: 'medium', label: 'Medium Priority', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'high', label: 'High Priority', color: 'bg-red-100 text-red-800' }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (formData.dueDate && new Date(formData.dueDate) < new Date()) {
      newErrors.dueDate = 'Due date cannot be in the past';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await onCreateTask({
        title: formData.title.trim(),
        description: formData.description.trim(),
        priority: formData.priority,
        category: formData.category,
        dueDate: formData.dueDate || null,
        tags: formData.tags
      });

      if (result.success) {
        // Reset form
        setFormData({
          title: '',
          description: '',
          priority: 'medium',
          category: 'general',
          dueDate: '',
          tags: []
        });
        setTagInput('');
        onCancel(); // Navigate back to dashboard
      } else {
        setErrors({ submit: result.error || 'Failed to create task' });
      }
    } catch (error) {
      setErrors({ submit: 'Failed to create task' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">Create New Task</h2>
        <p className="text-sm text-gray-600 mt-1">
          Add a new task to your {userRole} workflow
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Task Title *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.title ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Enter a clear, actionable task title..."
            maxLength={200}
          />
          {errors.title && (
            <p className="text-red-600 text-xs mt-1">{errors.title}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Provide additional details, requirements, or context..."
            rows={4}
            maxLength={1000}
          />
          <p className="text-xs text-gray-500 mt-1">
            {formData.description.length}/1000 characters
          </p>
        </div>

        {/* Priority and Category Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Priority */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Priority Level
            </label>
            <div className="space-y-2">
              {priorities.map((priority) => (
                <label key={priority.value} className="flex items-center">
                  <input
                    type="radio"
                    name="priority"
                    value={priority.value}
                    checked={formData.priority === priority.value}
                    onChange={(e) => handleInputChange('priority', e.target.value)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${priority.color}`}>
                    {priority.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <div className="space-y-2">
              {categories.map((category) => (
                <label key={category.value} className="flex items-center">
                  <input
                    type="radio"
                    name="category"
                    value={category.value}
                    checked={formData.category === category.value}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm">
                    {category.label}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Due Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Due Date (Optional)
          </label>
          <input
            type="date"
            value={formData.dueDate}
            onChange={(e) => handleInputChange('dueDate', e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.dueDate ? 'border-red-300' : 'border-gray-300'
            }`}
          />
          {errors.dueDate && (
            <p className="text-red-600 text-xs mt-1">{errors.dueDate}</p>
          )}
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tags (Optional)
          </label>
          <div className="flex space-x-2 mb-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Add a tag and press Enter..."
              maxLength={20}
            />
            <button
              type="button"
              onClick={handleAddTag}
              className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
            >
              Add
            </button>
          </div>
          
          {formData.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-1 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Error Message */}
        {errors.submit && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-red-600 text-sm">{errors.submit}</p>
          </div>
        )}

        {/* Form Actions */}
        <div className="flex justify-between pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-6 py-2 text-sm font-medium text-white rounded-lg ${
              isSubmitting
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isSubmitting ? 'Creating...' : 'Create Task'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TaskForm;
