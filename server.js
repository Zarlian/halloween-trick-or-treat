require('dotenv').config();
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
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

// Very light admin protection via HTTP Basic Auth
function basicAuth(req, res, next) {
    const adminUser = process.env.ADMIN_USER || 'admin';
    const adminPass = process.env.ADMIN_PASS || '';

    if (!adminPass) {
        console.warn('[WARN] ADMIN_PASS not set. Admin protection is effectively disabled.');
        return next();
    }

    const authHeader = req.headers['authorization'] || '';
    const [scheme, encoded] = authHeader.split(' ');
    if (scheme !== 'Basic' || !encoded) {
        res.setHeader('WWW-Authenticate', 'Basic realm="Admin Area"');
        return res.status(401).send('Authentication required');
    }

    let decoded = '';
    try {
        decoded = Buffer.from(encoded, 'base64').toString('utf8');
    } catch (e) {
        res.setHeader('WWW-Authenticate', 'Basic realm="Admin Area"');
        return res.status(401).send('Invalid authentication header');
    }

    const sepIndex = decoded.indexOf(':');
    const user = sepIndex >= 0 ? decoded.slice(0, sepIndex) : '';
    const pass = sepIndex >= 0 ? decoded.slice(sepIndex + 1) : '';

    if (user === adminUser && pass === adminPass) {
        return next();
    }

    res.setHeader('WWW-Authenticate', 'Basic realm="Admin Area"');
    return res.status(401).send('Invalid credentials');
}

// Set view engine
app.use(expressLayouts);
app.set('view engine', 'ejs');
app.set('layout', 'layouts/main');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(methodOverride('_method'));
app.use(fileUpload({
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    createParentPath: true
}));

// Routes
// Language selection (cookie-based, default NL)
app.use((req, res, next) => {
    const supported = ['nl', 'fr', 'en'];
    let lang = req.cookies.lang;
    if (!supported.includes(lang)) lang = 'nl';
    res.locals.lang = lang;
    next();
});

app.use('/', indexRoutes);
app.use('/admin', basicAuth, adminRoutes);
app.use('/api', basicAuth, apiRoutes);
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
