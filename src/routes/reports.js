const express = require('express');
const router = express.Router();
const supabase = require('../supabase');
const { protect, restrictTo } = require('../middleware/auth');

// All routes below are protected
router.use(protect);

// GET summary report for a specific puskesmas and bundle
router.get('/puskesmas-summary', restrictTo('puskesmas'), async (req, res) => {
    const { bundle_id } = req.query;
    if (!bundle_id) {
        return res.status(400).json({ error: 'bundle_id query parameter is required.' });
    }

    try {
        // 1. Get user's puskesmas_id
        const { data: user, error: userError } = await supabase
            .from('users')
            .select('puskesmas_id')
            .eq('id', req.user.id)
            .single();

        if (userError || !user || !user.puskesmas_id) {
            return res.status(404).json({ error: 'Puskesmas not found for this user.' });
        }
        const puskesmasId = user.puskesmas_id;

        // 2. Get all indicators for the given bundle_id, including their target
        const { data: indicators, error: indicatorsError } = await supabase
            .from('indicators')
            .select('id, name, target, cluster_id')
            .in('cluster_id', (
                (await supabase.from('clusters').select('id').eq('bundle_id', bundle_id)).data || []
            ).map(c => c.id));

        if (indicatorsError) throw indicatorsError;
        if (!indicators || indicators.length === 0) {
            return res.json([]); // No indicators for this bundle
        }

        // 3. Get all *approved* progress for these indicators for the specific puskesmas
        const indicatorIds = indicators.map(i => i.id);
        const { data: progress, error: progressError } = await supabase
            .from('indicator_progress')
            .select('indicator_id, value')
            .eq('puskesmas_id', puskesmasId)
            .in('indicator_id', indicatorIds);
            // .eq('status', 'approved'); // Temporarily disabled for testing

        if (progressError) throw progressError;

        // 4. Calculate achievements
        const achievements = progress.reduce((acc, p) => {
            if (!acc[p.indicator_id]) {
                acc[p.indicator_id] = 0;
            }
            acc[p.indicator_id] += p.value || 0; // Sum up values for the year
            return acc;
        }, {});

        // 5. Combine data and calculate final scores
        const reportData = indicators.map(indicator => {
            const achievement = achievements[indicator.id] || 0;
            const target = indicator.target || 0;
            const final_score = target > 0 ? (achievement / target) * 100 : 0;

            return {
                indicator_id: indicator.id,
                indicator_name: indicator.name,
                target: target,
                achievement: achievement,
                final_score: final_score
            };
        });

        res.json(reportData);

    } catch (error) {
        console.error('Error generating puskesmas summary report:', error);
        res.status(500).json({ error: error.message });
    }
});
// GET generated report data
// Accessible by both 'dinkes' and 'puskesmas'
// Filters can be passed as query parameters (e.g., /?bundle_id=...&year=...&month=...&puskesmas_id=...)
router.get('/', async (req, res) => {
  try {
    let query = supabase
      .from('indicator_progress')
      .select(`
        *,
        indicator:indicator_id(name, unit, cluster:cluster_id(name, bundle:bundle_id(name, year))),
        puskesmas:puskesmas_id(name, region)
      `)
      .eq('status', 'approved');

    // Apply filters from query params
    if (req.query.puskesmas_id) {
        query = query.eq('puskesmas_id', req.query.puskesmas_id);
    }
    if (req.query.year) {
        query = query.eq('year', req.query.year);
    }
    if (req.query.month) {
        query = query.eq('month', req.query.month);
    }
    // A more complex filter would be needed for bundle_id, involving a join or a function.
    // This is a good starting point.

    const { data, error } = await query;

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;