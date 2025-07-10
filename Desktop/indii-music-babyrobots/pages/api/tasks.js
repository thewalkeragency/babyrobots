import { query, run } from '../../lib/db';

/**
 * Task Management API
 * Handles CRUD operations for tasks including creation, tracking, and updates
 * POST: Create new task
 * GET: Retrieve tasks (with filtering options)
 * PUT: Update task status/details
 * DELETE: Remove task
 */

export default async function handler(req, res) {
  const { method } = req;

  try {
    switch (method) {
      case 'POST':
        return await createTask(req, res);
      case 'GET':
        return await getTasks(req, res);
      case 'PUT':
        return await updateTask(req, res);
      case 'DELETE':
        return await deleteTask(req, res);
      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (error) {
    console.error('Task API error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Internal server error',
      message: error.message 
    });
  }
}

/**
 * Create a new task
 */
async function createTask(req, res) {
  const { 
    title, 
    description, 
    priority = 'medium', 
    category = 'general',
    dueDate,
    assignedTo,
    userId,
    projectId,
    tags = []
  } = req.body;

  // Validation
  if (!title || !userId) {
    return res.status(400).json({
      success: false,
      error: 'Title and userId are required'
    });
  }

  try {
    // Insert new task
    const result = await run(`
      INSERT INTO tasks (
        title, description, priority, category, status, 
        due_date, assigned_to, user_id, project_id, 
        tags, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `, [
      title,
      description || null,
      priority,
      category,
      'pending', // default status
      dueDate || null,
      assignedTo || null,
      userId,
      projectId || null,
      JSON.stringify(tags)
    ]);

    // Retrieve the created task
    const task = await query('SELECT * FROM tasks WHERE id = ?', [result.lastID]);
    
    return res.status(201).json({
      success: true,
      data: {
        ...task[0],
        tags: JSON.parse(task[0].tags || '[]')
      }
    });
  } catch (error) {
    console.error('Create task error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to create task'
    });
  }
}

/**
 * Get tasks with filtering options
 */
async function getTasks(req, res) {
  const { 
    userId, 
    status, 
    priority, 
    category, 
    projectId,
    assignedTo,
    limit = 50,
    offset = 0
  } = req.query;

  if (!userId) {
    return res.status(400).json({
      success: false,
      error: 'userId is required'
    });
  }

  try {
    let whereClause = 'WHERE user_id = ?';
    let params = [userId];

    // Build dynamic where clause
    if (status) {
      whereClause += ' AND status = ?';
      params.push(status);
    }
    if (priority) {
      whereClause += ' AND priority = ?';
      params.push(priority);
    }
    if (category) {
      whereClause += ' AND category = ?';
      params.push(category);
    }
    if (projectId) {
      whereClause += ' AND project_id = ?';
      params.push(projectId);
    }
    if (assignedTo) {
      whereClause += ' AND assigned_to = ?';
      params.push(assignedTo);
    }

    const tasks = await query(`
      SELECT * FROM tasks 
      ${whereClause}
      ORDER BY 
        CASE priority 
          WHEN 'high' THEN 1 
          WHEN 'medium' THEN 2 
          WHEN 'low' THEN 3 
        END,
        created_at DESC
      LIMIT ? OFFSET ?
    `, [...params, parseInt(limit), parseInt(offset)]);

    // Parse tags for each task
    const formattedTasks = tasks.map(task => ({
      ...task,
      tags: JSON.parse(task.tags || '[]')
    }));

    return res.status(200).json({
      success: true,
      data: formattedTasks
    });
  } catch (error) {
    console.error('Get tasks error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve tasks'
    });
  }
}

/**
 * Update a task
 */
async function updateTask(req, res) {
  const { id } = req.query;
  const updates = req.body;

  if (!id) {
    return res.status(400).json({
      success: false,
      error: 'Task ID is required'
    });
  }

  try {
    // Check if task exists
    const existingTask = await query('SELECT * FROM tasks WHERE id = ?', [id]);
    if (existingTask.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }

    // Build update query dynamically
    const allowedFields = [
      'title', 'description', 'priority', 'category', 'status', 
      'due_date', 'assigned_to', 'tags', 'completed_at'
    ];
    
    const updateFields = [];
    const params = [];

    Object.keys(updates).forEach(key => {
      if (allowedFields.includes(key)) {
        updateFields.push(`${key} = ?`);
        if (key === 'tags') {
          params.push(JSON.stringify(updates[key]));
        } else if (key === 'completed_at' && updates.status === 'completed') {
          params.push(new Date().toISOString());
        } else {
          params.push(updates[key]);
        }
      }
    });

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No valid fields to update'
      });
    }

    // Add updated_at timestamp
    updateFields.push('updated_at = datetime(\'now\')');
    params.push(id);

    await run(`
      UPDATE tasks 
      SET ${updateFields.join(', ')}
      WHERE id = ?
    `, params);

    // Retrieve updated task
    const updatedTask = await query('SELECT * FROM tasks WHERE id = ?', [id]);
    
    return res.status(200).json({
      success: true,
      data: {
        ...updatedTask[0],
        tags: JSON.parse(updatedTask[0].tags || '[]')
      }
    });
  } catch (error) {
    console.error('Update task error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to update task'
    });
  }
}

/**
 * Delete a task
 */
async function deleteTask(req, res) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({
      success: false,
      error: 'Task ID is required'
    });
  }

  try {
    // Check if task exists
    const existingTask = await query('SELECT * FROM tasks WHERE id = ?', [id]);
    if (existingTask.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }

    await run('DELETE FROM tasks WHERE id = ?', [id]);

    return res.status(200).json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    console.error('Delete task error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to delete task'
    });
  }
}
