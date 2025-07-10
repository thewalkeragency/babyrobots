import React, { useState } from 'react';

const TaskList = ({ tasks, onUpdateTask, onDeleteTask, loading }) => {
  const [selectedTasks, setSelectedTasks] = useState(new Set());
  const [editingTask, setEditingTask] = useState(null);
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');

  const priorityColors = {
    high: 'bg-red-100 text-red-800 border-red-200',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    low: 'bg-green-100 text-green-800 border-green-200'
  };

  const statusColors = {
    pending: 'bg-gray-100 text-gray-800',
    in_progress: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800'
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
      <div className="bg-white rounded-lg shadow-sm border p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2">Loading tasks...</span>
        </div>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
        <div className="text-gray-400 text-6xl mb-4">📝</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks yet</h3>
        <p className="text-gray-600">Create your first task to get started!</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      {/* List Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={selectedTasks.size === tasks.length && tasks.length > 0}
                onChange={handleSelectAll}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-600">
                {selectedTasks.size > 0 ? `${selectedTasks.size} selected` : 'Select all'}
              </span>
            </div>

            {selectedTasks.size > 0 && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleBulkAction('start')}
                  className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Start
                </button>
                <button
                  onClick={() => handleBulkAction('complete')}
                  className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Complete
                </button>
                <button
                  onClick={() => handleBulkAction('pause')}
                  className="px-3 py-1 text-xs bg-yellow-600 text-white rounded hover:bg-yellow-700"
                >
                  Pause
                </button>
                <button
                  onClick={() => handleBulkAction('delete')}
                  className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-sm border border-gray-300 rounded-md px-2 py-1"
            >
              <option value="created_at">Created Date</option>
              <option value="due_date">Due Date</option>
              <option value="priority">Priority</option>
              <option value="status">Status</option>
              <option value="title">Title</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="p-1 text-gray-400 hover:text-gray-600"
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>
      </div>

      {/* Task List */}
      <div className="divide-y divide-gray-200">
        {getSortedTasks().map(task => (
          <div key={task.id} className={`p-4 hover:bg-gray-50 transition-colors ${isOverdue(task) ? 'bg-red-50' : ''}`}>
            {editingTask && editingTask.id === task.id ? (
              // Edit Mode
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <input
                    type="text"
                    value={editingTask.title}
                    onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                    className="text-lg font-medium border border-gray-300 rounded px-2 py-1 flex-1 mr-4"
                  />
                  <div className="flex space-x-2">
                    <button
                      onClick={handleSaveEdit}
                      className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      Save
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Priority</label>
                    <select
                      value={editingTask.priority}
                      onChange={(e) => setEditingTask({ ...editingTask, priority: e.target.value })}
                      className="w-full text-sm border border-gray-300 rounded px-2 py-1"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Status</label>
                    <select
                      value={editingTask.status}
                      onChange={(e) => setEditingTask({ ...editingTask, status: e.target.value })}
                      className="w-full text-sm border border-gray-300 rounded px-2 py-1"
                    >
                      <option value="pending">Pending</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Category</label>
                    <select
                      value={editingTask.category}
                      onChange={(e) => setEditingTask({ ...editingTask, category: e.target.value })}
                      className="w-full text-sm border border-gray-300 rounded px-2 py-1"
                    >
                      <option value="general">General</option>
                      <option value="release">Release</option>
                      <option value="marketing">Marketing</option>
                      <option value="collaboration">Collaboration</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Due Date</label>
                    <input
                      type="date"
                      value={editingTask.due_date ? editingTask.due_date.split('T')[0] : ''}
                      onChange={(e) => setEditingTask({ ...editingTask, due_date: e.target.value })}
                      className="w-full text-sm border border-gray-300 rounded px-2 py-1"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Description</label>
                  <textarea
                    value={editingTask.description || ''}
                    onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })}
                    className="w-full text-sm border border-gray-300 rounded px-2 py-1"
                    rows={2}
                  />
                </div>
              </div>
            ) : (
              // View Mode
              <div className="flex items-start">
                <input
                  type="checkbox"
                  checked={selectedTasks.has(task.id)}
                  onChange={() => handleSelectTask(task.id)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
                />
                
                <div className="ml-3 flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-lg">{categoryIcons[task.category] || '📝'}</span>
                        <h3 className="text-sm font-medium text-gray-900 truncate">{task.title}</h3>
                        {isOverdue(task) && (
                          <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
                            Overdue
                          </span>
                        )}
                      </div>
                      
                      {task.description && (
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">{task.description}</p>
                      )}
                      
                      <div className="flex items-center space-x-3 text-xs text-gray-500">
                        <span>Created {formatDate(task.created_at)}</span>
                        {task.due_date && (
                          <span>Due {formatDate(task.due_date)}</span>
                        )}
                        {task.completed_at && (
                          <span>Completed {formatDate(task.completed_at)}</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityColors[task.priority]}`}>
                        {task.priority}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[task.status]}`}>
                        {task.status.replace('_', ' ')}
                      </span>
                      
                      <div className="flex space-x-1">
                        <button
                          onClick={() => handleQuickEdit(task)}
                          className="p-1 text-gray-400 hover:text-blue-600"
                          title="Edit task"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        
                        <button
                          onClick={() => onDeleteTask(task.id)}
                          className="p-1 text-gray-400 hover:text-red-600"
                          title="Delete task"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {task.tags && task.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {task.tags.map((tag, index) => (
                        <span key={index} className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TaskList;
