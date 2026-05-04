const router = require('express').Router();
const User = require('../models/User');
const bcrypt = require('bcrypt');

router.get('/login', (req, res) => res.render('login', { user: req.session.user }));
router.get('/register', (req, res) => res.render('register', { user: req.session.user }));

router.post('/register', async (req, res) => {
  try {
    await new User(req.body).save();
    res.redirect('/login');
  } catch (err) {
    res.render('register', { error: 'Email already exists', user: null });
  }
});

router.post('/login', async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (user && await bcrypt.compare(req.body.password, user.password)) {
    req.session.user = user;
    res.redirect('/');
  } else {
    res.render('login', { error: 'Invalid email or password', user: null });
  }
});

router.get('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/'));
});

module.exports = router;
