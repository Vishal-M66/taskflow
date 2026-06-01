const express = require('express');
const db = require('./db');
const auth = require('./middleware');

const router = express.Router();

function generateId() {
  return require('crypto').randomUUID();
}

const VALID_STAGES = ['todo', 'progress', 'done'];

// GET /api/tasks — get all tasks for current user
router.get('/', auth, (req, res) => {
  try {
    const tasks = db.prepare(`
      SELECT id, user_id, title, description, stage, created_at, updated_at
      FROM tasks
      WHERE user_id = ?
      ORDER BY created_at DESC
    `).all(req.user.id);

    res.json({ tasks });
  } catch (err) {
    console.error('Get tasks error:', err);
    res.status(500).json({ error: 'Failed to fetch tasks.' });
  }
});

// GET /api/tasks/:id — get a single task
router.get('/:id', auth, (req, res) => {
  try {
    const task = db.prepare('SELECT * FROM tasks WHERE id = ? AND user_id = ?')
      .get(req.params.id, req.user.id);
    if (!task) return res.status(404).json({ error: 'Task not found.' });
    res.json({ task });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch task.' });
  }
});

// POST /api/tasks — create a new task
router.post('/', auth, (req, res) => {
  try {
    const { title, description = '', stage = 'todo' } = req.body;

    if (!title?.trim()) {
      return res.status(400).json({ error: 'Task title is required.' });
    }
    if (!VALID_STAGES.includes(stage)) {
      return res.status(400).json({ error: `Stage must be one of: ${VALID_STAGES.join(', ')}.` });
    }

    const id = generateId();
    const now = Date.now();

    db.prepare(`
      INSERT INTO tasks (id, user_id, title, description, stage, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(id, req.user.id, title.trim(), description.trim(), stage, now, now);

    const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
    res.status(201).json({ message: 'Task created.', task });
  } catch (err) {
    console.error('Create task error:', err);
    res.status(500).json({ error: 'Failed to create task.' });
  }
});

// PUT /api/tasks/:id — update a task
router.put('/:id', auth, (req, res) => {
  try {
    const existing = db.prepare('SELECT * FROM tasks WHERE id = ? AND user_id = ?')
      .get(req.params.id, req.user.id);
    if (!existing) return res.status(404).json({ error: 'Task not found.' });

    const title = req.body.title?.trim() ?? existing.title;
    const description = req.body.description?.trim() ?? existing.description;
    const stage = req.body.stage ?? existing.stage;

    if (!title) return res.status(400).json({ error: 'Task title cannot be empty.' });
    if (!VALID_STAGES.includes(stage)) {
      return res.status(400).json({ error: `Stage must be one of: ${VALID_STAGES.join(', ')}.` });
    }

    const now = Date.now();
    db.prepare(`
      UPDATE tasks SET title = ?, description = ?, stage = ?, updated_at = ?
      WHERE id = ? AND user_id = ?
    `).run(title, description, stage, now, req.params.id, req.user.id);

    const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id);
    res.json({ message: 'Task updated.', task });
  } catch (err) {
    console.error('Update task error:', err);
    res.status(500).json({ error: 'Failed to update task.' });
  }
});

// DELETE /api/tasks/:id — delete a task
router.delete('/:id', auth, (req, res) => {
  try {
    const existing = db.prepare('SELECT id FROM tasks WHERE id = ? AND user_id = ?')
      .get(req.params.id, req.user.id);
    if (!existing) return res.status(404).json({ error: 'Task not found.' });

    db.prepare('DELETE FROM tasks WHERE id = ? AND user_id = ?')
      .run(req.params.id, req.user.id);

    res.json({ message: 'Task deleted successfully.' });
  } catch (err) {
    console.error('Delete task error:', err);
    res.status(500).json({ error: 'Failed to delete task.' });
  }
});

// GET /api/tasks/stats/summary — task count summary
router.get('/stats/summary', auth, (req, res) => {
  try {
    const rows = db.prepare(`
      SELECT stage, COUNT(*) as count
      FROM tasks WHERE user_id = ?
      GROUP BY stage
    `).all(req.user.id);

    const summary = { todo: 0, progress: 0, done: 0, total: 0 };
    rows.forEach(r => { summary[r.stage] = r.count; summary.total += r.count; });

    res.json({ summary });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch summary.' });
  }
});

module.exports = router;
