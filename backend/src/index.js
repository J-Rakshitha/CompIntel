const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const salaryRoutes = require('./routes/salary');
const companyRoutes = require('./routes/company');
const compareRoutes = require('./routes/compare');

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api', salaryRoutes);
app.use('/api', companyRoutes);
app.use('/api', compareRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
});

app.listen(PORT, () => {
  console.log(`🚀 CompIntel backend running on http://localhost:${PORT}`);
});

module.exports = app;
