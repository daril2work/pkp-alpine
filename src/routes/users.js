const express = require('express');
const router = express.Router();
const supabase = require('../supabase');
const { protect, restrictTo } = require('../middleware/auth');

// All routes below are protected and restricted to 'dinkes'
router.use(protect);
router.use(restrictTo('dinkes'));

// GET all users
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase.from('users').select('*');
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET a single user by ID
router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase.from('users').select('*').eq('id', req.params.id).single();
    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'User not found' });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// UPDATE a user
router.put('/:id', async (req, res) => {
  const { name, role, is_active, puskesmas_id } = req.body;
  try {
    const { data, error } = await supabase
      .from('users')
      .update({ name, role, is_active, puskesmas_id })
      .eq('id', req.params.id)
      .select();
      
    if (error) throw error;
    if (!data.length) return res.status(404).json({ error: 'User not found' });
    res.json(data[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE a user (soft delete by deactivating)
// For a hard delete, you would need to also remove the user from Supabase Auth which is more complex.
router.delete('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .update({ is_active: false })
      .eq('id', req.params.id)
      .select();

    if (error) throw error;
    if (!data.length) return res.status(404).json({ error: 'User not found' });
    res.status(200).json({ message: 'User deactivated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;