const express = require('express');
const path = require('path');
const fileUpload = require('express-fileupload');
const methodOverride = require('method-override');
const expressLayouts = require('express-ejs-layouts');

// Import routes
const indexRoutes = require('./routes/index');
const adminRoutes = require('./routes/admin');
const apiRoutes = require('./routes/api');
const storyRoutes = require('./routes/stories');

const app = express();
const PORT = process.env.PORT || 3000;

// Set view engine
app.use(expressLayouts);
app.set('view engine', 'ejs');
app.set('layout', 'layouts/main');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));
app.use(fileUpload({
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    createParentPath: true
}));

// Routes
app.use('/', indexRoutes);
app.use('/admin', adminRoutes);
app.use('/api', apiRoutes);
app.use('/stories', storyRoutes);

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('error', { error: err });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
