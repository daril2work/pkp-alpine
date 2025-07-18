const express = require('express');
const router = express.Router();
const supabase = require('../supabase');
const { protect, restrictTo } = require('../middleware/auth');

// All routes below are protected and restricted to 'dinkes'
router.use(protect);
router.use(restrictTo('dinkes'));

// GET all indicators for a specific cluster
router.get('/cluster/:clusterId', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('indicators')
      .select('*')
      .eq('cluster_id', req.params.clusterId)
      .order('order');
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// CREATE a new indicator
router.post('/', async (req, res) => {
  const { cluster_id, name, target_value, unit, order } = req.body;
  try {
    const { data, error } = await supabase
      .from('indicators')
      .insert([{ cluster_id, name, target_value, unit, order }])
      .select();
    if (error) throw error;
    res.status(201).json(data[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// UPDATE an indicator
router.put('/:id', async (req, res) => {
    const { name, target_value, unit, order } = req.body;
    try {
        const { data, error } = await supabase
            .from('indicators')
            .update({ name, target_value, unit, order })
            .eq('id', req.params.id)
            .select();
        if (error) throw error;
        if (!data.length) return res.status(404).json({ error: 'Indicator not found' });
        res.json(data[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE an indicator
router.delete('/:id', async (req, res) => {
    try {
        const { error } = await supabase.from('indicators').delete().eq('id', req.params.id);
        if (error) throw error;
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;