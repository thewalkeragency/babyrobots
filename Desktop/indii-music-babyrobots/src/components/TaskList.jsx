import React, { useState } from 'react';
import { Card, Badge, Button } from './ui';
import {
  PencilIcon,
  TrashIcon,
  PlayIcon,
  CheckIcon,
  PauseIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

const TaskList = ({ tasks, onUpdateTask, onDeleteTask, loading }) => {
  const [selectedTasks, setSelectedTasks] = useState(new Set());
  const [editingTask, setEditingTask] = useState(null);
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');

  const priorityColors = {
    high: 'danger',
    medium: 'warning',
    low: 'success'
  };

  const statusColors = {
    pending: 'default',
    in_progress: 'primary',
    completed: 'success'
  };

  const categoryIcons = {
    release: '🎵',
    marketing: '📈',
    collaboration: '🤝',
    general: '📝'
  };

  const getSortedTasks = () => {
    return [...tasks].sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      // Handle priority sorting
      if (sortBy === 'priority') {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        aValue = priorityOrder[aValue];
        bValue = priorityOrder[bValue];
      }

      // Handle date sorting
      if (sortBy === 'created_at' || sortBy === 'due_date') {
        aValue = new Date(aValue || 0);
        bValue = new Date(bValue || 0);
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  };

  const handleSelectTask = (taskId) => {
    const newSelected = new Set(selectedTasks);
    if (newSelected.has(taskId)) {
      newSelected.delete(taskId);
    } else {
      newSelected.add(taskId);
    }
    setSelectedTasks(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedTasks.size === tasks.length) {
      setSelectedTasks(new Set());
    } else {
      setSelectedTasks(new Set(tasks.map(task => task.id)));
    }
  };

  const handleBulkAction = async (action) => {
    const updates = {};
    switch (action) {
      case 'complete':
        updates.status = 'completed';
        updates.completed_at = new Date().toISOString();
        break;
      case 'start':
        updates.status = 'in_progress';
        break;
      case 'pause':
        updates.status = 'pending';
        break;
      case 'delete':
        for (const taskId of selectedTasks) {
          await onDeleteTask(taskId);
        }
        setSelectedTasks(new Set());
        return;
      default:
        return;
    }

    // Apply updates to selected tasks
    for (const taskId of selectedTasks) {
      await onUpdateTask(taskId, updates);
    }
    setSelectedTasks(new Set());
  };

  const handleQuickEdit = (task) => {
    setEditingTask({ ...task });
  };

  const handleSaveEdit = async () => {
    if (editingTask) {
      await onUpdateTask(editingTask.id, {
        title: editingTask.title,
        description: editingTask.description,
        priority: editingTask.priority,
        category: editingTask.category,
        status: editingTask.status,
        due_date: editingTask.due_date
      });
      setEditingTask(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingTask(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString();
  };

  const isOverdue = (task) => {
    if (!task.due_date || task.status === 'completed') return false;
    return new Date(task.due_date) < new Date();
  };

  if (loading) {
    return (
      <Card className="uk-card-body uk-theme-zinc dark uk-text-center">
        <div className="uk-flex uk-flex-center uk-flex-middle">
          <div className="uk-spinner uk-margin-small-right"></div>
          <span className="uk-text-muted">Loading tasks...</span>
        </div>
      </Card>
    );
  }

  if (tasks.length === 0) {
    return (
      <Card className="uk-card-body uk-theme-zinc dark uk-text-center">
        <div className="uk-text-muted uk-text-large uk-margin-small-bottom">📝</div>
        <h3 className="uk-card-title uk-text-white uk-margin-remove">No tasks yet</h3>
        <p className="uk-text-muted">Create your first task to get started!</p>
      </Card>
    );
  }

  return (
    <Card className="uk-card-body uk-theme-zinc dark">
      {/* List Header */}
      <div className="uk-flex uk-flex-middle uk-flex-between uk-margin-bottom">
        <div className="uk-flex uk-flex-middle uk-grid-small" uk-grid="true">
          <div className="uk-form-controls">
            <label>
              <input
                type="checkbox"
                checked={selectedTasks.size === tasks.length && tasks.length > 0}
                onChange={handleSelectAll}
                className="uk-checkbox"
              />
              <span className="uk-margin-small-left uk-text-muted">
                {selectedTasks.size > 0 ? `${selectedTasks.size} selected` : 'Select all'}
              </span>
            </label>
          </div>

          {selectedTasks.size > 0 && (
            <div className="uk-button-group">
              <Button
                onClick={() => handleBulkAction('start')}
                variant="primary" size="small"
              >
                <PlayIcon className="uk-icon uk-margin-small-right" style={{width: '16px', height: '16px'}} /> Start
              </Button>
              <Button
                onClick={() => handleBulkAction('complete')}
                variant="success" size="small"
              >
                <CheckIcon className="uk-icon uk-margin-small-right" style={{width: '16px', height: '16px'}} /> Complete
              </Button>
              <Button
                onClick={() => handleBulkAction('pause')}
                variant="warning" size="small"
              >
                <PauseIcon className="uk-icon uk-margin-small-right" style={{width: '16px', height: '16px'}} /> Pause
              </Button>
              <Button
                onClick={() => handleBulkAction('delete')}
                variant="danger" size="small"
              >
                <TrashIcon className="uk-icon uk-margin-small-right" style={{width: '16px', height: '16px'}} /> Delete
              </Button>
            </div>
          )}
        </div>

        <div className="uk-flex uk-flex-middle uk-grid-small" uk-grid="true">
          <div className="uk-form-controls">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="uk-select uk-form-small uk-form-width-small uk-theme-zinc dark"
            >
              <option value="created_at">Created Date</option>
              <option value="due_date">Due Date</option>
              <option value="priority">Priority</option>
              <option value="status">Status</option>
              <option value="title">Title</option>
            </select>
          </div>
          <div>
            <Button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              variant="text" size="small"
            >
              <ArrowPathIcon className="uk-icon" style={{width: '16px', height: '16px'}} />
            </Button>
          </div>
        </div>
      </div>

      {/* Task List */}
      <ul className="uk-list uk-list-divider">
        {getSortedTasks().map(task => (
          <li key={task.id} className={isOverdue(task) ? 'uk-background-danger-light' : ''}>
            {editingTask && editingTask.id === task.id ? (
              // Edit Mode
              <div className="uk-padding-small uk-card uk-card-default uk-theme-zinc dark">
                <div className="uk-margin-small-bottom">
                  <input
                    type="text"
                    value={editingTask.title}
                    onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                    className="uk-input uk-form-small uk-theme-zinc dark"
                  />
                </div>
                
                <div className="uk-grid-small uk-child-width-1-2@s uk-margin-small-bottom" uk-grid="true">
                  <div>
                    <label className="uk-form-label uk-text-muted">Priority</label>
                    <select
                      value={editingTask.priority}
                      onChange={(e) => setEditingTask({ ...editingTask, priority: e.target.value })}
                      className="uk-select uk-form-small uk-theme-zinc dark"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="uk-form-label uk-text-muted">Status</label>
                    <select
                      value={editingTask.status}
                      onChange={(e) => setEditingTask({ ...editingTask, status: e.target.value })}
                      className="uk-select uk-form-small uk-theme-zinc dark"
                    >
                      <option value="pending">Pending</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                </div>
                
                <div className="uk-margin-small-bottom">
                  <label className="uk-form-label uk-text-muted">Category</label>
                  <select
                    value={editingTask.category}
                    onChange={(e) => setEditingTask({ ...editingTask, category: e.target.value })}
                    className="uk-select uk-form-small uk-theme-zinc dark"
                  >
                      <option value="general">General</option>
                      <option value="release">Release</option>
                      <option value="marketing">Marketing</option>
                      <option value="collaboration">Collaboration</option>
                    </select>
                  </div>
                  
                  <div className="uk-margin-small-bottom">
                    <label className="uk-form-label uk-text-muted">Due Date</label>
                    <input
                      type="date"
                      value={editingTask.due_date ? editingTask.due_date.split('T')[0] : ''}
                      onChange={(e) => setEditingTask({ ...editingTask, due_date: e.target.value })}
                      className="uk-input uk-form-small uk-theme-zinc dark"
                    />
                  </div>
                  
                  <div className="uk-margin-small-bottom">
                    <label className="uk-form-label uk-text-muted">Description</label>
                    <textarea
                      value={editingTask.description || ''}
                      onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })}
                      className="uk-textarea uk-form-small uk-theme-zinc dark"
                      rows="2"
                    />
                  </div>

                  <div className="uk-flex uk-flex-right uk-grid-small" uk-grid="true">
                    <div>
                      <Button onClick={handleSaveEdit} variant="success" size="small">Save</Button>
                    </div>
                    <div>
                      <Button onClick={handleCancelEdit} variant="default" size="small">Cancel</Button>
                    </div>
                  </div>
                </div>
              ) : (
                // View Mode
                <div className="uk-flex uk-flex-middle uk-grid-small" uk-grid="true">
                  <div className="uk-width-auto">
                    <label>
                      <input
                        type="checkbox"
                        checked={selectedTasks.has(task.id)}
                        onChange={() => handleSelectTask(task.id)}
                        className="uk-checkbox"
                      />
                    </label>
                  </div>
                  
                  <div className="uk-width-expand">
                    <div className="uk-flex uk-flex-middle uk-flex-between">
                      <div className="uk-flex uk-flex-middle uk-grid-small" uk-grid="true">
                        <span className="uk-text-large">{categoryIcons[task.category] || '📝'}</span>
                        <h3 className="uk-h3 uk-margin-remove uk-text-white">{task.title}</h3>
                        {isOverdue(task) && (
                          <Badge variant="danger">Overdue</Badge>
                        )}
                      </div>
                      
                      <div className="uk-flex uk-flex-middle uk-grid-small" uk-grid="true">
                        <Badge variant={priorityColors[task.priority]}>
                          {task.priority}
                        </Badge>
                        <Badge variant={statusColors[task.status]}>
                          {task.status.replace('_', ' ')}
                        </Badge>
                        
                        <Button onClick={() => handleQuickEdit(task)} variant="text" size="small">
                          <PencilIcon className="uk-icon" style={{width: '16px', height: '16px'}} />
                        </Button>
                        <Button onClick={() => onDeleteTask(task.id)} variant="text" size="small">
                          <TrashIcon className="uk-icon" style={{width: '16px', height: '16px'}} />
                        </Button>
                      </div>
                    </div>
                    
                    {task.description && (
                      <p className="uk-text-muted uk-margin-small-top uk-text-small">{task.description}</p>
                    )}
                    
                    <div className="uk-flex uk-flex-middle uk-grid-small uk-margin-small-top uk-text-small uk-text-muted" uk-grid="true">
                      <span>Created {formatDate(task.created_at)}</span>
                      {task.due_date && (
                        <span>Due {formatDate(task.due_date)}</span>
                      )}
                      {task.completed_at && (
                        <span>Completed {formatDate(task.completed_at)}</span>
                      )}
                    </div>
                    
                    {task.tags && task.tags.length > 0 && (
                      <div className="uk-flex uk-flex-wrap uk-grid-small uk-margin-small-top" uk-grid="true">
                        {task.tags.map((tag, index) => (
                          <Badge key={index} variant="primary" size="small">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      </Card>
    );
  };

export default TaskList;
