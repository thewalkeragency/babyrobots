import React, { useState, useEffect } from 'react';
import TaskList from './TaskList';
import TaskForm from './TaskForm';
import TaskDashboard from './TaskDashboard';
import { UserCircleIcon } from '@heroicons/react/24/outline';
import { Card, Select, Button } from './ui';

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
      <Card className="uk-card-body uk-theme-zinc dark uk-text-center">
        <div className="uk-flex uk-flex-center uk-flex-middle">
          <div className="uk-spinner uk-margin-small-right"></div>
          <span className="uk-text-muted">Loading tasks...</span>
        </div>
      </Card>
    );
  }

  return (
    <div className="uk-container uk-container-expand uk-margin-top">
      {/* Navigation */}
      <Card className="uk-card-body uk-theme-zinc dark uk-margin-bottom">
        <div className="uk-flex uk-flex-middle uk-flex-between">
          <h1 className="uk-card-title uk-text-white uk-margin-remove">Task Management</h1>
          <div className="uk-button-group">
            <Button
              onClick={() => setActiveView('dashboard')}
              variant={activeView === 'dashboard' ? 'primary' : 'default'}
              size="small"
            >
              Dashboard
            </Button>
            <Button
              onClick={() => setActiveView('list')}
              variant={activeView === 'list' ? 'primary' : 'default'}
              size="small"
            >
              Task List
            </Button>
            <Button
              onClick={() => setActiveView('create')}
              variant={activeView === 'create' ? 'primary' : 'success'}
              size="small"
            >
              Create Task
            </Button>
          </div>
        </div>
      </Card>

      {/* Filters */}
      {activeView !== 'create' && (
        <Card className="uk-card-body uk-theme-zinc dark uk-margin-bottom">
          <div className="uk-grid-small uk-child-width-auto" uk-grid="true">
            <div>
              <label className="uk-form-label uk-text-muted">Status</label>
              <div className="uk-form-controls">
                <Select
                  value={filters.status}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                  className="uk-form-small uk-form-width-small"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </Select>
              </div>
            </div>
            <div>
              <label className="uk-form-label uk-text-muted">Priority</label>
              <div className="uk-form-controls">
                <Select
                  value={filters.priority}
                  onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
                  className="uk-form-small uk-form-width-small"
                >
                  <option value="all">All Priority</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </Select>
              </div>
            </div>
            <div>
              <label className="uk-form-label uk-text-muted">Category</label>
              <div className="uk-form-controls">
                <Select
                  value={filters.category}
                  onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                  className="uk-form-small uk-form-width-small"
                >
                  <option value="all">All Categories</option>
                  <option value="release">Release</option>
                  <option value="marketing">Marketing</option>
                  <option value="collaboration">Collaboration</option>
                  <option value="general">General</option>
                </Select>
              </div>
            </div>
          </div>
        </Card>
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
