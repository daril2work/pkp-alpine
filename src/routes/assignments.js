const express = require('express');
const router = express.Router();
const supabase = require('../supabase');
const { protect, restrictTo } = require('../middleware/auth');

// All routes below are protected and restricted to 'dinkes'
router.use(protect);
router.use(restrictTo('dinkes'));

// Assign a bundle to a puskesmas
router.post('/', async (req, res) => {
  const { bundle_id, puskesmas_id } = req.body;
  try {
    const { data, error } = await supabase
      .from('bundle_assignments')
      .insert([{ bundle_id, puskesmas_id }])
      .select();
    if (error) {
        // Handle unique constraint violation
        if (error.code === '23505') {
            return res.status(409).json({ error: 'This bundle is already assigned to the puskesmas.' });
        }
        throw error;
    }
    res.status(201).json(data[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all assignments for a specific bundle
router.get('/bundle/:bundleId', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('bundle_assignments')
            .select('*, puskesmas:puskesmas_id(name)')
            .eq('bundle_id', req.params.bundleId);
        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Remove an assignment
router.delete('/:id', async (req, res) => {
    try {
        const { error } = await supabase.from('bundle_assignments').delete().eq('id', req.params.id);
        if (error) throw error;
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;