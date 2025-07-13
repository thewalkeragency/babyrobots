import React, { useState } from 'react';
import { Card, Badge, Button, Progress } from './ui';
import {
  MusicalNoteIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  PlayIcon,
  CheckIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

const TaskDashboard = ({ tasks, stats, onUpdateTask, userRole }) => {
  const [quickActionLoading, setQuickActionLoading] = useState(null);

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
    <div className="uk-child-width-1-1 uk-grid-small" uk-grid="true">
      {/* Stats Overview */}
      <div className="uk-child-width-1-4@m uk-grid-small" uk-grid="true">
        <Card className="uk-card-body uk-theme-zinc dark uk-card-hover">
          <div className="uk-flex uk-flex-middle uk-grid-small" uk-grid="true">
            <div>
              <div className="uk-border-circle uk-background-primary uk-flex uk-flex-center uk-flex-middle" style={{width: '40px', height: '40px'}}>
                <MusicalNoteIcon style={{width: '20px', height: '20px', color: 'white'}} />
              </div>
            </div>
            <div className="uk-width-expand">
              <div className="uk-text-large uk-text-bold uk-text-white">{stats.total}</div>
              <div className="uk-text-small uk-text-muted">Total Tasks</div>
            </div>
          </div>
        </Card>

        <Card className="uk-card-body uk-theme-zinc dark uk-card-hover">
          <div className="uk-flex uk-flex-middle uk-grid-small" uk-grid="true">
            <div>
              <div className="uk-border-circle uk-background-secondary uk-flex uk-flex-center uk-flex-middle" style={{width: '40px', height: '40px'}}>
                <ClockIcon style={{width: '20px', height: '20px', color: 'white'}} />
              </div>
            </div>
            <div className="uk-width-expand">
              <div className="uk-text-large uk-text-bold uk-text-white">{stats.inProgress}</div>
              <div className="uk-text-small uk-text-muted">In Progress</div>
            </div>
          </div>
        </Card>

        <Card className="uk-card-body uk-theme-zinc dark uk-card-hover">
          <div className="uk-flex uk-flex-middle uk-grid-small" uk-grid="true">
            <div>
              <div className="uk-border-circle uk-flex uk-flex-center uk-flex-middle" style={{width: '40px', height: '40px', backgroundColor: '#f0ad4e'}}>
                <CheckCircleIcon style={{width: '20px', height: '20px', color: 'white'}} />
              </div>
            </div>
            <div className="uk-width-expand">
              <div className="uk-text-large uk-text-bold uk-text-white">{stats.completed}</div>
              <div className="uk-text-small uk-text-muted">Completed</div>
            </div>
          </div>
        </Card>

        <Card className="uk-card-body uk-theme-zinc dark uk-card-hover">
          <div className="uk-flex uk-flex-middle uk-grid-small" uk-grid="true">
            <div>
              <div className="uk-border-circle uk-flex uk-flex-center uk-flex-middle" style={{width: '40px', height: '40px', backgroundColor: '#8b5cf6'}}>
                <ExclamationCircleIcon style={{width: '20px', height: '20px', color: 'white'}} />
              </div>
            </div>
            <div className="uk-width-expand">
              <div className="uk-text-large uk-text-bold uk-text-white">{stats.overdue}</div>
              <div className="uk-text-small uk-text-muted">Overdue</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Progress Chart */}
      <Card className="uk-card-body uk-theme-zinc dark uk-margin-top">
        <h3 className="uk-card-title uk-text-white uk-margin-bottom">Progress Overview</h3>
        <div className="uk-grid-small uk-child-width-1-3@m" uk-grid="true">
          <div>
            <div className="uk-text-center">
              <div className="uk-text-large uk-text-bold uk-text-white">{stats.pending}</div>
              <div className="uk-text-small uk-text-muted">Pending</div>
            </div>
          </div>
          <div>
            <div className="uk-text-center">
              <div className="uk-text-large uk-text-bold uk-text-white">{stats.inProgress}</div>
              <div className="uk-text-small uk-text-muted">In Progress</div>
            </div>
          </div>
          <div>
            <div className="uk-text-center">
              <div className="uk-text-large uk-text-bold uk-text-white">{stats.completed}</div>
              <div className="uk-text-small uk-text-muted">Completed</div>
            </div>
          </div>
        </div>
        <div className="uk-margin-top">
          <Progress value={getCompletionRate()} max={100} variant="primary" />
          <div className="uk-text-right uk-text-small uk-text-muted">{getCompletionRate()}% Completed</div>
        </div>
      </Card>

      <div className="uk-child-width-1-2@l uk-grid-small uk-margin-top" uk-grid="true">
        {/* Upcoming Deadlines */}
        <Card className="uk-card-body uk-theme-zinc dark">
          <h3 className="uk-card-title uk-text-white uk-margin-bottom">Upcoming Deadlines</h3>
          <ul className="uk-list uk-list-divider">
            {getUpcomingTasks().length === 0 ? (
              <li className="uk-text-muted">No upcoming deadlines</li>
            ) : (
              getUpcomingTasks().map(task => (
                <li key={task.id}>
                  <div className="uk-flex uk-flex-middle uk-flex-between">
                    <div>
                      <h4 className="uk-h4 uk-margin-remove uk-text-white">{task.title}</h4>
                      <p className="uk-text-small uk-text-muted uk-margin-remove">{formatDate(task.due_date)}</p>
                    </div>
                    <div className="uk-flex uk-flex-middle uk-grid-small" uk-grid="true">
                      <div>
                        <Badge variant={priorityColors[task.priority]}>
                          {task.priority}
                        </Badge>
                      </div>
                      {task.status === 'pending' && (
                        <div>
                          <Button
                            onClick={() => handleQuickAction(task.id, 'start')}
                            disabled={quickActionLoading === task.id}
                            variant="primary" size="small"
                          >
                            <PlayIcon className="uk-icon uk-margin-small-right" style={{width: '16px', height: '16px'}} /> Start
                          </Button>
                        </div>
                      )}
                      {task.status === 'in_progress' && (
                        <div>
                          <Button
                            onClick={() => handleQuickAction(task.id, 'complete')}
                            disabled={quickActionLoading === task.id}
                            variant="success" size="small"
                          >
                            <CheckIcon className="uk-icon uk-margin-small-right" style={{width: '16px', height: '16px'}} /> Complete
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </li>
              ))
            )}
          </ul>
        </Card>

        {/* High Priority Tasks */}
        <Card className="uk-card-body uk-theme-zinc dark">
          <h3 className="uk-card-title uk-text-white uk-margin-bottom">High Priority Tasks</h3>
          <ul className="uk-list uk-list-divider">
            {getHighPriorityTasks().length === 0 ? (
              <li className="uk-text-muted">No high priority tasks</li>
            ) : (
              getHighPriorityTasks().map(task => (
                <li key={task.id}>
                  <div className="uk-flex uk-flex-middle uk-flex-between">
                    <div>
                      <h4 className="uk-h4 uk-margin-remove uk-text-white">{task.title}</h4>
                      <div className="uk-flex uk-flex-middle uk-grid-small uk-margin-small-top" uk-grid="true">
                        <div>
                          <Badge variant={statusColors[task.status]}>
                            {task.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        {task.category && (
                          <div>
                            <span className="uk-text-small uk-text-muted">{task.category}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="uk-flex uk-flex-middle uk-grid-small" uk-grid="true">
                      {task.status === 'pending' && (
                        <div>
                          <Button
                            onClick={() => handleQuickAction(task.id, 'start')}
                            disabled={quickActionLoading === task.id}
                            variant="primary" size="small"
                          >
                            <PlayIcon className="uk-icon uk-margin-small-right" style={{width: '16px', height: '16px'}} /> Start
                          </Button>
                        </div>
                      )}
                      {task.status === 'in_progress' && (
                        <div>
                          <Button
                            onClick={() => handleQuickAction(task.id, 'complete')}
                            disabled={quickActionLoading === task.id}
                            variant="success" size="small"
                          >
                            <CheckIcon className="uk-icon uk-margin-small-right" style={{width: '16px', height: '16px'}} /> Complete
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </li>
              ))
            )}
          </ul>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="uk-card-body uk-theme-zinc dark uk-margin-top">
        <h3 className="uk-card-title uk-text-white uk-margin-bottom">Recent Tasks</h3>
        <ul className="uk-list uk-list-divider">
          {tasks.slice(0, 5).map(task => (
            <li key={task.id}>
              <div className="uk-flex uk-flex-middle uk-flex-between">
                <div>
                  <h4 className="uk-h4 uk-margin-remove uk-text-white">{task.title}</h4>
                  <p className="uk-text-small uk-text-muted uk-margin-remove">
                    Created {new Date(task.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="uk-flex uk-flex-middle uk-grid-small" uk-grid="true">
                  <div>
                    <Badge variant={priorityColors[task.priority]}>
                      {task.priority}
                    </Badge>
                  </div>
                  <div>
                    <Badge variant={statusColors[task.status]}>
                      {task.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
};

export default TaskDashboard;
