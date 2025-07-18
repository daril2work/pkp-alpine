const express = require('express');
const router = express.Router();
const supabase = require('../supabase');
const { protect, restrictTo } = require('../middleware/auth');

// All routes below are protected and restricted to 'dinkes'
router.use(protect);
router.use(restrictTo('dinkes'));

// --- BUNDLES ---
// GET all bundles
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase.from('bundles').select('*');
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// CREATE a new bundle
router.post('/', async (req, res) => {
  const { name, year } = req.body;
  try {
    const { data, error } = await supabase
      .from('bundles')
      .insert([{ name, year, created_by: req.user.id }])
      .select();
    if (error) throw error;
    res.status(201).json(data[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// UPDATE a bundle
router.put('/:id', async (req, res) => {
    const { name, year } = req.body;
    try {
        const { data, error } = await supabase
            .from('bundles')
            .update({ name, year })
            .eq('id', req.params.id)
            .select();
        if (error) throw error;
        if (!data.length) return res.status(404).json({ error: 'Bundle not found' });
        res.json(data[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE a bundle
router.delete('/:id', async (req, res) => {
    try {
        const { error } = await supabase.from('bundles').delete().eq('id', req.params.id);
        if (error) throw error;
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


module.exports = router;