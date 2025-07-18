const express = require('express');
const router = express.Router();
const supabase = require('../supabase');

// Sign Up
router.post('/signup', async (req, res) => {
  const { email, password, name, role, puskesmas_id } = req.body;

  // Basic validation
  if (!email || !password || !name || !role) {
    return res.status(400).json({ error: 'Email, password, name, and role are required.' });
  }
  if (role === 'puskesmas' && !puskesmas_id) {
    return res.status(400).json({ error: 'Puskesmas ID is required for puskesmas role.' });
  }

  try {
    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error('User not created in Supabase Auth.');

    // Insert user details into our public 'users' table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert([
        { id: authData.user.id, name, email, role, puskesmas_id: role === 'puskesmas' ? puskesmas_id : null },
      ])
      .select();

    if (userError) throw userError;

    res.status(201).json({ message: 'User created successfully.', user: userData[0] });

  } catch (error) {
    console.error('Sign up error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Sign In
router.post('/signin', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  try {
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) throw authError;

    // Fetch the full user profile from our public 'users' table
    const { data: userProfile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authData.user.id)
        .single();
    
    if (profileError) throw profileError;

    // Combine auth data with profile data
    const responseData = {
        message: 'Signed in successfully.',
        user: userProfile,
        session: authData.session
    };

    res.status(200).json(responseData);

  } catch (error) {
    console.error('Sign in error:', error);
    res.status(500).json({ error: error.message });
  }
});


module.exports = router;