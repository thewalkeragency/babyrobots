import React, { useState, useEffect } from 'react';
import TaskList from './TaskList';
import TaskForm from './TaskForm';
import TaskDashboard from './TaskDashboard';

const TaskManager = ({ userId, userRole = 'artist' }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState('dashboard');
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    category: 'all'
  });

  // Fetch tasks on component mount and when filters change
  useEffect(() => {
    fetchTasks();
  }, [userId, filters]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        userId,
        ...Object.fromEntries(
          Object.entries(filters).filter(([key, value]) => value !== 'all')
        )
      });

      const response = await fetch(`/api/tasks?${queryParams}`);
      const data = await response.json();

      if (data.success) {
        setTasks(data.data);
      } else {
        console.error('Failed to fetch tasks:', data.error);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const createTask = async (taskData) => {
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...taskData,
          userId
        }),
      });

      const data = await response.json();

      if (data.success) {
        setTasks(prev => [data.data, ...prev]);
        return { success: true, data: data.data };
      } else {
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error('Error creating task:', error);
      return { success: false, error: 'Failed to create task' };
    }
  };

  const updateTask = async (taskId, updates) => {
    try {
      const response = await fetch(`/api/tasks?id=${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      const data = await response.json();

      if (data.success) {
        setTasks(prev => 
          prev.map(task => 
            task.id === taskId ? data.data : task
          )
        );
        return { success: true, data: data.data };
      } else {
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error('Error updating task:', error);
      return { success: false, error: 'Failed to update task' };
    }
  };

  const deleteTask = async (taskId) => {
    try {
      const response = await fetch(`/api/tasks?id=${taskId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        setTasks(prev => prev.filter(task => task.id !== taskId));
        return { success: true };
      } else {
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error('Error deleting task:', error);
      return { success: false, error: 'Failed to delete task' };
    }
  };

  const getTaskStats = () => {
    const stats = {
      total: tasks.length,
      pending: tasks.filter(t => t.status === 'pending').length,
      inProgress: tasks.filter(t => t.status === 'in_progress').length,
      completed: tasks.filter(t => t.status === 'completed').length,
      overdue: tasks.filter(t => {
        if (!t.due_date || t.status === 'completed') return false;
        return new Date(t.due_date) < new Date();
      }).length
    };
    return stats;
  };

  if (loading && tasks.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading tasks...</span>
      </div>
    );
  }

  return (
    <div className="task-manager">
      {/* Navigation */}
      <div className="bg-white shadow-sm border-b mb-6">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Task Management</h1>
            <div className="flex space-x-2">
              <button
                onClick={() => setActiveView('dashboard')}
                className={`px-4 py-2 rounded-lg font-medium ${
                  activeView === 'dashboard'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setActiveView('list')}
                className={`px-4 py-2 rounded-lg font-medium ${
                  activeView === 'list'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Task List
              </button>
              <button
                onClick={() => setActiveView('create')}
                className={`px-4 py-2 rounded-lg font-medium ${
                  activeView === 'create'
                    ? 'bg-blue-600 text-white'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                Create Task
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      {activeView !== 'create' && (
        <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority
              </label>
              <select
                value={filters.priority}
                onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm"
              >
                <option value="all">All Priority</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                value={filters.category}
                onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm"
              >
                <option value="all">All Categories</option>
                <option value="release">Release</option>
                <option value="marketing">Marketing</option>
                <option value="collaboration">Collaboration</option>
                <option value="general">General</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="task-content">
        {activeView === 'dashboard' && (
          <TaskDashboard 
            tasks={tasks}
            stats={getTaskStats()}
            onUpdateTask={updateTask}
            userRole={userRole}
          />
        )}
        
        {activeView === 'list' && (
          <TaskList
            tasks={tasks}
            onUpdateTask={updateTask}
            onDeleteTask={deleteTask}
            loading={loading}
          />
        )}
        
        {activeView === 'create' && (
          <TaskForm
            onCreateTask={createTask}
            onCancel={() => setActiveView('dashboard')}
            userRole={userRole}
          />
        )}
      </div>
    </div>
  );
};

export default TaskManager;
