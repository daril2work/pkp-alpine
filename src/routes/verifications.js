const express = require('express');
const router = express.Router();
const supabase = require('../supabase');
const { protect, restrictTo } = require('../middleware/auth');

// All routes below are protected and restricted to 'dinkes'
router.use(protect);
router.use(restrictTo('dinkes'));

// GET all indicator progress data that is pending verification
router.get('/pending', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('indicator_progress')
      .select(`
        id,
        value,
        note,
        month,
        year,
        indicator:indicator_id(name),
        puskesmas:puskesmas_id(name)
      `)
      .eq('status', 'pending');
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// UPDATE the status of an indicator progress entry
router.put('/:id', async (req, res) => {
  const { status, verification_note } = req.body;
  if (!['approved', 'rejected'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status.' });
  }

  try {
    const { data, error } = await supabase
      .from('indicator_progress')
      .update({
        status,
        verification_note,
        verified_by: req.user.id,
        verified_at: new Date(),
      })
      .eq('id', req.params.id)
      .select();
      
    if (error) throw error;
    if (!data.length) return res.status(404).json({ error: 'Progress entry not found' });
    res.json(data[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;