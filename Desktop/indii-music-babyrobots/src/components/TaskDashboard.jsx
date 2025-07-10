import React, { useState } from 'react';

const TaskDashboard = ({ tasks, stats, onUpdateTask, userRole }) => {
  const [quickActionLoading, setQuickActionLoading] = useState(null);

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

  const getUpcomingTasks = () => {
    return tasks
      .filter(task => task.status !== 'completed' && task.due_date)
      .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
      .slice(0, 5);
  };

  const getHighPriorityTasks = () => {
    return tasks
      .filter(task => task.priority === 'high' && task.status !== 'completed')
      .slice(0, 5);
  };

  const getCompletionRate = () => {
    if (stats.total === 0) return 0;
    return Math.round((stats.completed / stats.total) * 100);
  };

  const handleQuickAction = async (taskId, action) => {
    setQuickActionLoading(taskId);
    try {
      let updates = {};
      switch (action) {
        case 'start':
          updates = { status: 'in_progress' };
          break;
        case 'complete':
          updates = { status: 'completed', completed_at: new Date().toISOString() };
          break;
        case 'pause':
          updates = { status: 'pending' };
          break;
        default:
          break;
      }
      
      if (Object.keys(updates).length > 0) {
        await onUpdateTask(taskId, updates);
      }
    } catch (error) {
      console.error('Quick action failed:', error);
    } finally {
      setQuickActionLoading(null);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No due date';
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = date - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return `Overdue by ${Math.abs(diffDays)} day${Math.abs(diffDays) !== 1 ? 's' : ''}`;
    } else if (diffDays === 0) {
      return 'Due today';
    } else if (diffDays === 1) {
      return 'Due tomorrow';
    } else {
      return `Due in ${diffDays} days`;
    }
  };

  return (
    <div className="task-dashboard space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Tasks</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">In Progress</p>
              <p className="text-2xl font-bold text-gray-900">{stats.inProgress}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Overdue</p>
              <p className="text-2xl font-bold text-gray-900">{stats.overdue}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Chart */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Progress Overview</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Completion Rate</span>
            <span className="text-sm font-medium text-gray-900">{getCompletionRate()}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${getCompletionRate()}%` }}
            ></div>
          </div>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-700">{stats.pending}</div>
              <div className="text-gray-500">Pending</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-blue-600">{stats.inProgress}</div>
              <div className="text-gray-500">In Progress</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-green-600">{stats.completed}</div>
              <div className="text-gray-500">Completed</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Deadlines */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Deadlines</h3>
          <div className="space-y-3">
            {getUpcomingTasks().length === 0 ? (
              <p className="text-gray-500 text-sm">No upcoming deadlines</p>
            ) : (
              getUpcomingTasks().map(task => (
                <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900 truncate">{task.title}</h4>
                    <p className="text-xs text-gray-600 mt-1">{formatDate(task.due_date)}</p>
                  </div>
                  <div className="flex items-center space-x-2 ml-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityColors[task.priority]}`}>
                      {task.priority}
                    </span>
                    {task.status === 'pending' && (
                      <button
                        onClick={() => handleQuickAction(task.id, 'start')}
                        disabled={quickActionLoading === task.id}
                        className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                      >
                        Start
                      </button>
                    )}
                    {task.status === 'in_progress' && (
                      <button
                        onClick={() => handleQuickAction(task.id, 'complete')}
                        disabled={quickActionLoading === task.id}
                        className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                      >
                        Complete
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* High Priority Tasks */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">High Priority Tasks</h3>
          <div className="space-y-3">
            {getHighPriorityTasks().length === 0 ? (
              <p className="text-gray-500 text-sm">No high priority tasks</p>
            ) : (
              getHighPriorityTasks().map(task => (
                <div key={task.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-100">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900 truncate">{task.title}</h4>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[task.status]}`}>
                        {task.status.replace('_', ' ')}
                      </span>
                      {task.category && (
                        <span className="text-xs text-gray-500">{task.category}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-3">
                    {task.status === 'pending' && (
                      <button
                        onClick={() => handleQuickAction(task.id, 'start')}
                        disabled={quickActionLoading === task.id}
                        className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                      >
                        Start
                      </button>
                    )}
                    {task.status === 'in_progress' && (
                      <button
                        onClick={() => handleQuickAction(task.id, 'complete')}
                        disabled={quickActionLoading === task.id}
                        className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                      >
                        Complete
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Tasks</h3>
        <div className="space-y-3">
          {tasks.slice(0, 5).map(task => (
            <div key={task.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-gray-900 truncate">{task.title}</h4>
                <p className="text-xs text-gray-600 mt-1">
                  Created {new Date(task.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center space-x-2 ml-3">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityColors[task.priority]}`}>
                  {task.priority}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[task.status]}`}>
                  {task.status.replace('_', ' ')}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TaskDashboard;
