const express = require('express');
const router = express.Router();
const supabase = require('../supabase');
const { protect, restrictTo } = require('../middleware/auth');

// All routes below are protected
router.use(protect);

// GET the assigned bundle and its full structure for the logged-in puskesmas user
router.get('/my-bundle', restrictTo('puskesmas'), async (req, res) => {
  try {
    // The 'protect' middleware now provides the full user object, including puskesmas_id.
    if (!req.user || !req.user.puskesmas_id) {
        return res.status(404).json({ error: 'Puskesmas not found for this user.' });
    }

    // Find the latest bundle assigned to the user's puskesmas
    const { data: assignment, error: assignmentError } = await supabase
        .from('bundle_assignments')
        .select('bundle_id')
        .eq('puskesmas_id', req.user.puskesmas_id)
        .order('assigned_at', { ascending: false })
        .limit(1)
        .single();

    if (assignmentError || !assignment) {
        return res.status(404).json({ error: 'No bundle assigned to this puskesmas.' });
    }

    // Fetch the full bundle structure
    const { data: bundle, error: bundleError } = await supabase
        .from('bundles')
        .select(`
            *,
            clusters:clusters(
                *,
                indicators:indicators(*)
            )
        `)
        .eq('id', assignment.bundle_id)
        .single();

    if (bundleError) throw bundleError;

    res.json(bundle);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET progress data for the logged-in puskesmas for a specific year
router.get('/my-progress', restrictTo('puskesmas'), async (req, res) => {
    const { year } = req.query;

    if (!year) {
        return res.status(400).json({ error: 'Year query parameter is required.' });
    }

    try {
        // The 'protect' middleware now provides the full user object.
        if (!req.user || !req.user.puskesmas_id) {
            return res.status(404).json({ error: 'Puskesmas not found for this user.' });
        }

        // Fetch progress data
        const { data: progressData, error: progressError } = await supabase
            .from('indicator_progress')
            .select('indicator_id, month, value')
            .eq('puskesmas_id', req.user.puskesmas_id)
            .eq('year', year);

        if (progressError) throw progressError;

        // Format the data for easier use on the frontend
        const formattedProgress = progressData.reduce((acc, item) => {
            if (!acc[item.indicator_id]) {
                acc[item.indicator_id] = {};
            }
            acc[item.indicator_id][item.month] = item.value;
            return acc;
        }, {});

        res.json(formattedProgress);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// POST or UPDATE indicator progress data
router.post('/', restrictTo('puskesmas'), async (req, res) => {
    const { indicator_id, month, year, value, note } = req.body;
    
    // The 'protect' middleware now provides the full user object.
    if (!req.user || !req.user.puskesmas_id) {
        return res.status(403).json({ error: 'User is not associated with a puskesmas.' });
    }

    try {
        const { data, error } = await supabase
            .from('indicator_progress')
            .upsert({
                indicator_id,
                puskesmas_id: req.user.puskesmas_id,
                month,
                year,
                value,
                note,
                status: 'pending' // Always set to pending on new submission/update
            }, {
                onConflict: 'indicator_id, puskesmas_id, year, month'
            })
            .select();

        if (error) throw error;
        res.status(201).json(data[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;