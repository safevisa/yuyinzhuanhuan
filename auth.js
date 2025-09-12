const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');

// JWT secret key (in production, use environment variable)
const JWT_SECRET = process.env.JWT_SECRET || 'voice-morph-secret-key-change-in-production';
const JWT_EXPIRES_IN = '7d';

// Rate limiting for auth endpoints
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 requests per windowMs
    message: 'Too many authentication attempts, please try again later',
    standardHeaders: true,
    legacyHeaders: false,
});

const registerLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // limit each IP to 10 registration attempts per 15 minutes
    message: 'Too many registration attempts, please try again later',
    standardHeaders: true,
    legacyHeaders: false,
});

class AuthManager {
    constructor(database) {
        this.db = database;
    }

    // Generate JWT token
    generateToken(user) {
        return jwt.sign(
            { 
                userId: user.id, 
                email: user.email, 
                username: user.username 
            },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );
    }

    // Verify JWT token
    verifyToken(token) {
        try {
            return jwt.verify(token, JWT_SECRET);
        } catch (error) {
            throw new Error('Invalid token');
        }
    }

    // Middleware to authenticate requests
    authenticateToken(req, res, next) {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({ 
                error: 'Access token required',
                code: 'TOKEN_REQUIRED'
            });
        }

        try {
            const decoded = this.verifyToken(token);
            req.user = decoded;
            next();
        } catch (error) {
            return res.status(403).json({ 
                error: 'Invalid or expired token',
                code: 'INVALID_TOKEN'
            });
        }
    }

    // Optional authentication (user may or may not be logged in)
    optionalAuth(req, res, next) {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (token) {
            try {
                const decoded = this.verifyToken(token);
                req.user = decoded;
            } catch (error) {
                // Token invalid but continue anyway
                req.user = null;
            }
        } else {
            req.user = null;
        }
        
        next();
    }

    // Validate email format
    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Validate username format
    validateUsername(username) {
        // Username: 3-20 characters, alphanumeric and underscores only
        const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
        return usernameRegex.test(username);
    }

    // Validate password strength
    validatePassword(password) {
        // Password: minimum 6 characters
        return password && password.length >= 6;
    }

    // Register user
    async register(req, res) {
        try {
            const { username, email, password, confirmPassword } = req.body;

            // Validation
            if (!username || !email || !password || !confirmPassword) {
                return res.status(400).json({ 
                    error: 'All fields are required',
                    code: 'MISSING_FIELDS'
                });
            }

            if (password !== confirmPassword) {
                return res.status(400).json({ 
                    error: 'Passwords do not match',
                    code: 'PASSWORD_MISMATCH'
                });
            }

            if (!this.validateEmail(email)) {
                return res.status(400).json({ 
                    error: 'Invalid email format',
                    code: 'INVALID_EMAIL'
                });
            }

            if (!this.validateUsername(username)) {
                return res.status(400).json({ 
                    error: 'Username must be 3-20 characters, letters, numbers and underscores only',
                    code: 'INVALID_USERNAME'
                });
            }

            if (!this.validatePassword(password)) {
                return res.status(400).json({ 
                    error: 'Password must be at least 6 characters long',
                    code: 'WEAK_PASSWORD'
                });
            }

            // Check if user already exists
            const existingUser = await this.db.getUserByEmail(email);
            if (existingUser) {
                return res.status(409).json({ 
                    error: 'User with this email already exists',
                    code: 'USER_EXISTS'
                });
            }

            // Create user
            const newUser = await this.db.createUser(username, email, password);
            
            // Generate token
            const token = this.generateToken(newUser);

            res.status(201).json({
                success: true,
                message: 'User registered successfully',
                user: {
                    id: newUser.id,
                    username: newUser.username,
                    email: newUser.email
                },
                token
            });

        } catch (error) {
            console.error('Registration error:', error);
            res.status(500).json({ 
                error: 'Registration failed',
                code: 'REGISTRATION_ERROR'
            });
        }
    }

    // Login user
    async login(req, res) {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({ 
                    error: 'Email and password are required',
                    code: 'MISSING_CREDENTIALS'
                });
            }

            // Find user
            const user = await this.db.getUserByEmail(email);
            if (!user) {
                return res.status(401).json({ 
                    error: 'Invalid credentials',
                    code: 'INVALID_CREDENTIALS'
                });
            }

            // Verify password
            const validPassword = await this.db.verifyPassword(password, user.password_hash);
            if (!validPassword) {
                return res.status(401).json({ 
                    error: 'Invalid credentials',
                    code: 'INVALID_CREDENTIALS'
                });
            }

            // Generate token
            const token = this.generateToken(user);

            res.json({
                success: true,
                message: 'Login successful',
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    display_name: user.display_name,
                    avatar_url: user.avatar_url
                },
                token
            });

        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({ 
                error: 'Login failed',
                code: 'LOGIN_ERROR'
            });
        }
    }

    // Get current user profile
    async getProfile(req, res) {
        try {
            const user = await this.db.getUserById(req.user.userId);
            if (!user) {
                return res.status(404).json({ 
                    error: 'User not found',
                    code: 'USER_NOT_FOUND'
                });
            }

            res.json({
                success: true,
                user
            });

        } catch (error) {
            console.error('Profile fetch error:', error);
            res.status(500).json({ 
                error: 'Failed to fetch profile',
                code: 'PROFILE_ERROR'
            });
        }
    }

    // Logout (client-side token removal, server-side could implement token blacklist)
    logout(req, res) {
        res.json({
            success: true,
            message: 'Logged out successfully'
        });
    }

    // Refresh token
    async refreshToken(req, res) {
        try {
            const user = await this.db.getUserById(req.user.userId);
            if (!user) {
                return res.status(404).json({ 
                    error: 'User not found',
                    code: 'USER_NOT_FOUND'
                });
            }

            const newToken = this.generateToken(user);
            
            res.json({
                success: true,
                token: newToken
            });

        } catch (error) {
            console.error('Token refresh error:', error);
            res.status(500).json({ 
                error: 'Failed to refresh token',
                code: 'REFRESH_ERROR'
            });
        }
    }
}

module.exports = {
    AuthManager,
    authLimiter,
    registerLimiter
};
