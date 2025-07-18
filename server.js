require('dotenv').config();
const express = require('express');
const cors = require('cors');
const supabase = require('./src/supabase');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public')); // Serve static files

// Basic Route


// Test Supabase Connection
app.get('/test-supabase', async (req, res) => {
  try {
    const { data, error } = await supabase.from('users').select('id').limit(1);
    if (error) throw error;
    res.json({
      message: 'Supabase connection successful!',
      data: data,
    });
  } catch (err) {
    console.error('Supabase connection error', err);
    res.status(500).json({ error: 'Failed to connect to Supabase.' });
  }
});

// API Routes
const authRoutes = require('./src/routes/auth');
const userRoutes = require('./src/routes/users');
const bundleRoutes = require('./src/routes/bundles');
const clusterRoutes = require('./src/routes/clusters');
const indicatorRoutes = require('./src/routes/indicators');

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/bundles', bundleRoutes);
app.use('/api/clusters', clusterRoutes);
app.use('/api/indicators', indicatorRoutes);
app.use('/api/assignments', require('./src/routes/assignments'));
app.use('/api/dashboard', require('./src/routes/dashboard'));
app.use('/api/verifications', require('./src/routes/verifications'));
app.use('/api/reports', require('./src/routes/reports'));
app.use('/api/progress', require('./src/routes/progress'));


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});