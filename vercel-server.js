const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
            scriptSrc: ["'self'"],
            fontSrc: ["'self'", "https://cdnjs.cloudflare.com"],
            imgSrc: ["'self'", "data:"],
            mediaSrc: ["'self'", "blob:"]
        }
    }
}));

// CORS configuration
app.use(cors({
    origin: process.env.FRONTEND_URL || ['http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Serve CSS files
app.get('/css/style.css', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'css', 'style.css'));
});

// Serve JS files
app.get('/js/:filename', (req, res) => {
    const filename = req.params.filename;
    res.sendFile(path.join(__dirname, 'public', 'js', filename));
});

// Basic routes for Vercel deployment
app.get('/', (req, res) => {
    console.log('Serving index.html from:', path.join(__dirname, 'public', 'index.html'));
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Debug route for static files
app.get('/debug', (req, res) => {
    res.json({
        __dirname: __dirname,
        publicPath: path.join(__dirname, 'public'),
        files: require('fs').readdirSync(path.join(__dirname, 'public'))
    });
});

// API routes (simplified for Vercel)
app.get('/api/effects', (req, res) => {
    res.json({
        effects: {
            robot: {
                name: 'Robot Voice',
                description: 'Transform voice into robotic sound',
                icon: 'fas fa-robot'
            },
            chipmunk: {
                name: 'Chipmunk Voice',
                description: 'High-pitched chipmunk voice',
                icon: 'fas fa-paw'
            },
            deep: {
                name: 'Deep Voice',
                description: 'Low-pitched deep voice',
                icon: 'fas fa-male'
            },
            echo: {
                name: 'Echo Effect',
                description: 'Add echo to your voice',
                icon: 'fas fa-volume-up'
            }
        }
    });
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        environment: process.env.NODE_ENV || 'development',
        platform: 'vercel',
        message: 'VoiceMorph API is running (Vercel version)'
    });
});

// Audio processing endpoint (disabled for Vercel)
app.post('/api/transform', (req, res) => {
    res.status(503).json({
        error: 'Audio processing not available in Vercel deployment',
        message: 'Please use local deployment for full audio processing functionality',
        suggestion: 'Run "npm start" locally to use all features'
    });
});

// Purchase endpoints (simplified)
app.post('/api/purchase', (req, res) => {
    res.json({
        success: true,
        message: 'Purchase simulation completed (Vercel demo mode)',
        purchase: {
            planType: req.body.planType || 'monthly',
            status: 'completed',
            demo: true
        }
    });
});

app.get('/api/purchase/status', (req, res) => {
    res.json({
        hasPurchased: true,
        purchaseExpired: false,
        demo: true
    });
});

// Auth endpoints (simplified)
app.post('/api/auth/register', (req, res) => {
    res.json({
        success: true,
        message: 'Registration simulation completed (Vercel demo mode)',
        user: {
            id: 1,
            username: req.body.username || 'demo',
            email: req.body.email || 'demo@example.com',
            hasPurchased: true,
            demo: true
        },
        token: 'demo-token'
    });
});

app.post('/api/auth/login', (req, res) => {
    res.json({
        success: true,
        message: 'Login simulation completed (Vercel demo mode)',
        user: {
            id: 1,
            username: req.body.email || 'demo',
            email: req.body.email || 'demo@example.com',
            hasPurchased: true,
            demo: true
        },
        token: 'demo-token'
    });
});

// Catch all handler
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Export for Vercel
module.exports = app;

// For local development
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`🎙️ VoiceMorph Server (Vercel) running on http://localhost:${PORT}`);
        console.log('📝 Note: This is a simplified version for Vercel deployment');
        console.log('🔧 For full functionality, use "npm start" locally');
    });
}
