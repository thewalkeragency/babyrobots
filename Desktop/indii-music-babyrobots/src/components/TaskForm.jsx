import React, { useState } from 'react';
import { Card, Button, Badge, Input, Select } from './ui';

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
    { value: 'low', label: 'Low Priority', color: 'success' },
    { value: 'medium', label: 'Medium Priority', color: 'warning' },
    { value: 'high', label: 'High Priority', color: 'danger' }
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
    <Card className="uk-card-body uk-theme-zinc dark">
      <h2 className="uk-card-title uk-text-white">Create New Task</h2>
      <p className="uk-text-muted uk-margin-small-bottom">
        Add a new task to your {userRole} workflow
      </p>

      <form onSubmit={handleSubmit} className="uk-form-stacked uk-margin-top">
        {/* Title */}
        <div className="uk-margin">
          <label className="uk-form-label uk-text-muted">Task Title *</label>
          <div className="uk-form-controls">
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className={`uk-input uk-theme-zinc dark ${errors.title ? 'uk-form-danger' : ''}`}
              placeholder="Enter a clear, actionable task title..."
              maxLength={200}
            />
            {errors.title && (
              <p className="uk-text-danger uk-text-small uk-margin-small-top">{errors.title}</p>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="uk-margin">
          <label className="uk-form-label uk-text-muted">Description</label>
          <div className="uk-form-controls">
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="uk-textarea uk-theme-zinc dark"
              placeholder="Provide additional details, requirements, or context..."
              rows="4"
              maxLength={1000}
            />
            <p className="uk-text-small uk-text-muted uk-margin-small-top">
              {formData.description.length}/1000 characters
            </p>
          </div>
        </div>

        {/* Priority and Category Row */}
        <div className="uk-grid-small uk-child-width-1-2@s" uk-grid="true">
          {/* Priority */}
          <div>
            <label className="uk-form-label uk-text-muted">Priority Level</label>
            <div className="uk-form-controls uk-form-controls-text">
              {priorities.map((priority) => (
                <label key={priority.value} className="uk-margin-small-right">
                  <input
                    type="radio"
                    name="priority"
                    value={priority.value}
                    checked={formData.priority === priority.value}
                    onChange={(e) => handleInputChange('priority', e.target.value)}
                    className="uk-radio"
                  />
                  <Badge variant={priority.color} className="uk-margin-small-left">
                    {priority.label}
                  </Badge>
                </label>
              ))}
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="uk-form-label uk-text-muted">Category</label>
            <div className="uk-form-controls uk-form-controls-text">
              {categories.map((category) => (
                <label key={category.value} className="uk-margin-small-right">
                  <input
                    type="radio"
                    name="category"
                    value={category.value}
                    checked={formData.category === category.value}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    className="uk-radio"
                  />
                  <span className="uk-margin-small-left uk-text-muted">
                    {category.label}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Due Date */}
        <div className="uk-margin">
          <label className="uk-form-label uk-text-muted">Due Date (Optional)</label>
          <div className="uk-form-controls">
            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) => handleInputChange('dueDate', e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className={`uk-input uk-theme-zinc dark ${errors.dueDate ? 'uk-form-danger' : ''}`}
            />
            {errors.dueDate && (
              <p className="uk-text-danger uk-text-small uk-margin-small-top">{errors.dueDate}</p>
            )}
          </div>
        </div>

        {/* Tags */}
        <div className="uk-margin">
          <label className="uk-form-label uk-text-muted">Tags (Optional)</label>
          <div className="uk-form-controls">
            <div className="uk-flex uk-flex-middle uk-grid-small" uk-grid="true">
              <div className="uk-width-expand">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                  className="uk-input uk-theme-zinc dark"
                  placeholder="Add a tag and press Enter..."
                  maxLength={20}
                />
              </div>
              <div>
                <Button
                  type="button"
                  onClick={handleAddTag}
                  variant="primary" size="small"
                >
                  Add
                </Button>
              </div>
            </div>
            
            {formData.tags.length > 0 && (
              <div className="uk-flex uk-flex-wrap uk-grid-small uk-margin-small-top" uk-grid="true">
                {formData.tags.map((tag, index) => (
                  <Badge key={index} variant="primary" size="small">
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="uk-button-text uk-margin-small-left"
                    >
                      x
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Error Message */}
        {errors.submit && (
          <div className="uk-alert-danger" uk-alert="true">
            <p>{errors.submit}</p>
          </div>
        )}

        {/* Form Actions */}
        <div className="uk-margin-top uk-flex uk-flex-between">
          <Button
            type="button"
            onClick={onCancel}
            variant="default"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            variant={isSubmitting ? 'default' : 'primary'}
          >
            {isSubmitting ? 'Creating...' : 'Create Task'}
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default TaskForm;
