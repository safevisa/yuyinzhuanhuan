const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const helmet = require('helmet');
const session = require('express-session');

// Custom modules
const Database = require('./database');
const AudioProcessor = require('./audio-processor');
const { AuthManager, authLimiter, registerLimiter } = require('./auth');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize database and services
const database = new Database();
const audioProcessor = new AudioProcessor();
const authManager = new AuthManager(database);

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
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Session middleware
app.use(session({
    secret: process.env.SESSION_SECRET || 'voice-morph-session-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    }
}));

// Static files
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'audio-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        const allowedMimes = ['audio/wav', 'audio/mp3', 'audio/mpeg', 'audio/webm'];
        if (allowedMimes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Please upload an audio file.'));
        }
    }
});

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Authentication routes
app.post('/api/auth/register', registerLimiter, authManager.register.bind(authManager));
app.post('/api/auth/login', authLimiter, authManager.login.bind(authManager));
app.post('/api/auth/logout', authManager.logout.bind(authManager));
app.get('/api/auth/profile', authManager.authenticateToken.bind(authManager), authManager.getProfile.bind(authManager));
app.post('/api/auth/refresh', authManager.authenticateToken.bind(authManager), authManager.refreshToken.bind(authManager));

// Purchase routes
app.post('/api/purchase', authManager.authenticateToken.bind(authManager), async (req, res) => {
    try {
        const { planType } = req.body;
        const userId = req.user.userId;
        
        if (!planType || !['monthly', 'yearly'].includes(planType)) {
            return res.status(400).json({ error: 'Invalid plan type' });
        }
        
        // In a real app, you would integrate with a payment processor like Stripe
        // For now, we'll simulate a successful purchase
        const purchaseData = {
            planType,
            price: planType === 'monthly' ? 9.99 : 99.99,
            currency: 'USD',
            status: 'completed',
            purchaseDate: new Date().toISOString(),
            expiresAt: planType === 'monthly' 
                ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
                : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
        };
        
        // Update user's purchase status in database
        await database.updateUserPurchase(userId, purchaseData);
        
        res.json({
            success: true,
            message: 'Purchase completed successfully',
            purchase: purchaseData
        });
        
    } catch (error) {
        console.error('Purchase error:', error);
        res.status(500).json({ error: 'Purchase failed' });
    }
});

// Check purchase status
app.get('/api/purchase/status', authManager.authenticateToken.bind(authManager), async (req, res) => {
    try {
        const userId = req.user.userId;
        const user = await database.getUserById(userId);
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        const hasPurchased = user.hasPurchased || false;
        const purchaseExpired = user.purchaseExpiresAt ? new Date(user.purchaseExpiresAt) < new Date() : false;
        
        res.json({
            hasPurchased: hasPurchased && !purchaseExpired,
            purchaseExpired,
            purchaseInfo: user.purchaseInfo ? JSON.parse(user.purchaseInfo) : null
        });
        
    } catch (error) {
        console.error('Purchase status error:', error);
        res.status(500).json({ error: 'Failed to check purchase status' });
    }
});

// Get available voice effects
app.get('/api/effects', (req, res) => {
    try {
        const effects = audioProcessor.getAvailableEffects();
        res.json(effects);
    } catch (error) {
        console.error('Error getting effects:', error);
        res.status(500).json({ error: 'Failed to load effects' });
    }
});

// Upload and process audio (with optional authentication)
app.post('/api/transform', authManager.optionalAuth.bind(authManager), upload.single('audio'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No audio file provided' });
    }

    const { effect, title } = req.body;
    const availableEffects = audioProcessor.getAvailableEffects();
    
    if (!effect || !availableEffects[effect]) {
        return res.status(400).json({ error: 'Invalid or missing effect parameter' });
    }

    const inputPath = req.file.path;
    const outputFilename = 'processed-' + Date.now() + '-' + path.parse(req.file.filename).name + '.wav';
    const outputPath = path.join('uploads', outputFilename);

    try {
        // Get audio info
        const audioInfo = await audioProcessor.getAudioInfo(inputPath);
        
        // Process audio with FFmpeg
        const result = await audioProcessor.processAudio(inputPath, outputPath, effect, {
            duration: audioInfo.duration
        });

        let recordingId = null;
        
        // Save to database if user is logged in
        if (req.user) {
            const recordingTitle = title || `${availableEffects[effect].name} Effect`;
            const dbResult = await database.createRecording(
                req.user.userId,
                recordingTitle,
                req.file.filename,
                effect,
                req.file.size,
                audioInfo.duration
            );
            recordingId = dbResult.id;
            
            // Update with processed filename
            await database.updateRecordingProcessed(recordingId, outputFilename);
        }

        res.json({
            success: true,
            downloadUrl: `/uploads/${outputFilename}`,
            effect: availableEffects[effect].name,
            recordingId,
            audioInfo: {
                duration: audioInfo.duration,
                size: req.file.size
            }
        });
        
        // Clean up original file after a delay
        setTimeout(() => {
            audioProcessor.cleanupFile(inputPath);
        }, 5000);
        
    } catch (error) {
        console.error('Processing error:', error);
        // Clean up files on error
        audioProcessor.cleanupFile(inputPath);
        audioProcessor.cleanupFile(outputPath);
        
        res.status(500).json({ error: 'Audio processing failed: ' + error.message });
    }
});

// Download processed audio
app.get('/api/download/:filename', (req, res) => {
    const filename = req.params.filename;
    const filepath = path.join(__dirname, 'uploads', filename);
    
    if (fs.existsSync(filepath)) {
        res.download(filepath);
    } else {
        res.status(404).json({ error: 'File not found' });
    }
});

// Serve shared recording page
app.get('/share/:token', async (req, res) => {
    try {
        const { token } = req.params;
        const recording = await database.getRecordingByShareToken(token);
        
        if (!recording) {
            return res.status(404).send('Shared recording not found');
        }
        
        // Serve a simple share page (you might want to create a separate template)
        res.send(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>${recording.title} - VoiceMorph</title>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; }
                    .audio-player { margin: 20px 0; }
                    .info { background: #f5f5f5; padding: 15px; border-radius: 8px; }
                </style>
            </head>
            <body>
                <h1>🎙️ Shared Voice Recording</h1>
                <div class="info">
                    <h2>${recording.title}</h2>
                    <p><strong>Effect:</strong> ${recording.effect_type}</p>
                    <p><strong>By:</strong> ${recording.display_name || recording.username}</p>
                    <p><strong>Created:</strong> ${new Date(recording.created_at).toLocaleDateString()}</p>
                    <p><strong>Plays:</strong> ${recording.play_count}</p>
                </div>
                <div class="audio-player">
                    <audio controls style="width: 100%;">
                        <source src="/uploads/${recording.processed_filename}" type="audio/wav">
                        Your browser does not support the audio element.
                    </audio>
                </div>
                <p><a href="/">← Create your own voice transformation</a></p>
            </body>
            </html>
        `);
    } catch (error) {
        console.error('Error loading share page:', error);
        res.status(500).send('Error loading shared recording');
    }
});

// User recordings management
app.get('/api/recordings', authManager.authenticateToken.bind(authManager), async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const offset = (page - 1) * limit;
        
        const recordings = await database.getUserRecordings(req.user.userId, limit, offset);
        
        res.json({
            success: true,
            recordings,
            page: parseInt(page),
            limit: parseInt(limit)
        });
    } catch (error) {
        console.error('Error fetching recordings:', error);
        res.status(500).json({ error: 'Failed to fetch recordings' });
    }
});

// Share recording
app.post('/api/recordings/:id/share', authManager.authenticateToken.bind(authManager), async (req, res) => {
    try {
        const { id } = req.params;
        const result = await database.shareRecording(id, req.user.userId);
        
        res.json({
            success: true,
            message: 'Recording shared successfully',
            shareToken: result.shareToken,
            shareUrl: `${req.protocol}://${req.get('host')}/share/${result.shareToken}`
        });
    } catch (error) {
        console.error('Error sharing recording:', error);
        res.status(500).json({ error: 'Failed to share recording' });
    }
});

// Get shared recording
app.get('/api/share/:token', async (req, res) => {
    try {
        const { token } = req.params;
        const recording = await database.getRecordingByShareToken(token);
        
        if (!recording) {
            return res.status(404).json({ error: 'Shared recording not found' });
        }
        
        // Increment play count
        await database.incrementPlayCount(recording.id);
        
        res.json({
            success: true,
            recording: {
                title: recording.title,
                effect_type: recording.effect_type,
                duration: recording.duration,
                created_at: recording.created_at,
                play_count: recording.play_count + 1,
                username: recording.username,
                display_name: recording.display_name,
                audioUrl: `/uploads/${recording.processed_filename}`
            }
        });
    } catch (error) {
        console.error('Error fetching shared recording:', error);
        res.status(500).json({ error: 'Failed to load shared recording' });
    }
});

// Get public recordings feed
app.get('/api/public', async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const offset = (page - 1) * limit;
        
        const recordings = await database.getPublicRecordings(limit, offset);
        
        res.json({
            success: true,
            recordings,
            page: parseInt(page),
            limit: parseInt(limit)
        });
    } catch (error) {
        console.error('Error fetching public recordings:', error);
        res.status(500).json({ error: 'Failed to fetch public recordings' });
    }
});

// Clean up old files
function cleanupOldFiles() {
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours
    const now = Date.now();

    fs.readdir('uploads', (err, files) => {
        if (err) return;
        
        files.forEach(file => {
            const filePath = path.join('uploads', file);
            fs.stat(filePath, (err, stats) => {
                if (err) return;
                
                if (now - stats.mtime.getTime() > maxAge) {
                    fs.unlink(filePath, (err) => {
                        if (err) console.error('Error deleting old file:', err);
                    });
                }
            });
        });
    });
}

// Run cleanup every hour
setInterval(cleanupOldFiles, 60 * 60 * 1000);

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down gracefully...');
    database.close();
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n🛑 Shutting down gracefully...');
    database.close();
    process.exit(0);
});

app.listen(PORT, () => {
    console.log(`🎙️ Voice Morph Server running on http://localhost:${PORT}`);
    console.log('📁 Upload directory:', uploadsDir);
    console.log('🗃️  Database initialized');
    console.log('🔐 Authentication system enabled');
    console.log('🎵 Advanced audio processing ready');
    console.log('🔗 Audio sharing features available');
});

module.exports = app;
