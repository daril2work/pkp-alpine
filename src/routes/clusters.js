const express = require('express');
const router = express.Router();
const supabase = require('../supabase');
const { protect, restrictTo } = require('../middleware/auth');

// All routes below are protected and restricted to 'dinkes'
router.use(protect);
router.use(restrictTo('dinkes'));

// GET all clusters for a specific bundle
router.get('/bundle/:bundleId', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('clusters')
      .select('*')
      .eq('bundle_id', req.params.bundleId)
      .order('order');
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// CREATE a new cluster
router.post('/', async (req, res) => {
  const { bundle_id, name, order } = req.body;
  try {
    const { data, error } = await supabase
      .from('clusters')
      .insert([{ bundle_id, name, order }])
      .select();
    if (error) throw error;
    res.status(201).json(data[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// UPDATE a cluster
router.put('/:id', async (req, res) => {
    const { name, order } = req.body;
    try {
        const { data, error } = await supabase
            .from('clusters')
            .update({ name, order })
            .eq('id', req.params.id)
            .select();
        if (error) throw error;
        if (!data.length) return res.status(404).json({ error: 'Cluster not found' });
        res.json(data[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE a cluster
router.delete('/:id', async (req, res) => {
    try {
        const { error } = await supabase.from('clusters').delete().eq('id', req.params.id);
        if (error) throw error;
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;