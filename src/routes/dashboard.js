const express = require('express');
const router = express.Router();
const supabase = require('../supabase');
const { protect, restrictTo } = require('../middleware/auth');

// All routes below are protected and restricted to 'dinkes'
router.use(protect);
router.use(restrictTo('dinkes'));

// GET Dashboard Stats
router.get('/stats', async (req, res) => {
  try {
    // Total Bundles
    const { count: totalBundles, error: bundleError } = await supabase
      .from('bundles')
      .select('*', { count: 'exact', head: true });
    if (bundleError) throw bundleError;

    // Total Puskesmas
    const { count: totalPuskesmas, error: puskesmasError } = await supabase
      .from('puskesmas')
      .select('*', { count: 'exact', head: true });
    if (puskesmasError) throw puskesmasError;

    // Total Pending Verifications
    const { count: pendingVerifications, error: verificationError } = await supabase
      .from('indicator_progress')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');
    if (verificationError) throw verificationError;

    res.json({
      totalBundles,
      totalPuskesmas,
      pendingVerifications,
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;