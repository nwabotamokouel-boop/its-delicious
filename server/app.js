const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const path = require('path');

const authRoutes = require('./routes/auth');
const orderRoutes = require('./routes/orders');

const app = express();

// MongoDB connection
async function connectDB() {
  try {
    await mongoose.connect('mongodb+srv://nwabotamokouel_db_user:ftG8l1FEa31XO9Dw@cluster0.peuoinu.mongodb.net/its-delicious?retryWrites=true&w=majority');
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.error('❌ MongoDB error:', err);
  }
}
connectDB();
// View engine
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));
app.use(session({
  secret: 'itsdelicioussecret',
  resave: false,
  saveUninitialized: false
}));

// Routes
app.use('/', authRoutes);
app.use('/orders', orderRoutes);

app.get('/', (req, res) => {
  res.render('index', { user: req.session.user });
});

app.listen(3000, () => {
  console.log("🍪 IT'S DELICIOUS running on http://localhost:3000");
});
