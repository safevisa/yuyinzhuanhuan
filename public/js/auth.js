// Authentication Manager for Frontend
class AuthManager {
    constructor() {
        this.token = null;
        this.user = null;
        this.isAuthenticated = false;
        
        // Load token from localStorage
        this.loadToken();
        
        // UI Elements
        this.elements = {};
        
        this.init();
    }

    init() {
        this.getUIElements();
        this.setupEventListeners();
        this.updateAuthUI();
    }

    getUIElements() {
        this.elements = {
            // Auth buttons and menus
            authButtons: document.getElementById('authButtons'),
            userMenu: document.getElementById('userMenu'),
            loginBtn: document.getElementById('loginBtn'),
            registerBtn: document.getElementById('registerBtn'),
            logoutLink: document.getElementById('logoutLink'),
            userName: document.getElementById('userName'),
            userButton: document.getElementById('userButton'),
            userDropdown: document.getElementById('userDropdown'),
            
            // Modals
            authModal: document.getElementById('authModal'),
            authModalTitle: document.getElementById('authModalTitle'),
            authModalClose: document.getElementById('authModalClose'),
            
            // Forms
            loginForm: document.getElementById('loginForm'),
            registerForm: document.getElementById('registerForm'),
            showRegister: document.getElementById('showRegister'),
            showLogin: document.getElementById('showLogin'),
            
            // Dashboard
            dashboardLink: document.getElementById('dashboardLink'),
            dashboardSection: document.getElementById('dashboardSection'),
            recordingsGrid: document.getElementById('recordingsGrid')
        };
    }

    setupEventListeners() {
        // Auth buttons
        if (this.elements.loginBtn) {
            this.elements.loginBtn.addEventListener('click', () => this.showLoginModal());
        }
        
        // Setup form validation
        this.setupFormValidation();
        
        if (this.elements.registerBtn) {
            this.elements.registerBtn.addEventListener('click', () => this.showRegisterModal());
        }
        
        // Logout
        if (this.elements.logoutLink) {
            this.elements.logoutLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.logout();
            });
        }
        
        // User menu dropdown
        if (this.elements.userButton) {
            this.elements.userButton.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleUserDropdown();
            });
        }
        
        // Dashboard link
        if (this.elements.dashboardLink) {
            this.elements.dashboardLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.showDashboard();
            });
        }
        
        // Profile link
        const profileLink = document.getElementById('profileLink');
        if (profileLink) {
            profileLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.showProfile();
            });
        }
        
        // Modal close
        if (this.elements.authModalClose) {
            this.elements.authModalClose.addEventListener('click', () => this.hideAuthModal());
        }
        
        // Modal overlay close
        if (this.elements.authModal) {
            this.elements.authModal.addEventListener('click', (e) => {
                if (e.target === this.elements.authModal) {
                    this.hideAuthModal();
                }
            });
        }
        
        // Form switching
        if (this.elements.showRegister) {
            this.elements.showRegister.addEventListener('click', (e) => {
                e.preventDefault();
                this.showRegisterForm();
            });
        }
        
        if (this.elements.showLogin) {
            this.elements.showLogin.addEventListener('click', (e) => {
                e.preventDefault();
                this.showLoginForm();
            });
        }
        
        // Form submissions
        if (this.elements.loginForm) {
            this.elements.loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }
        
        if (this.elements.registerForm) {
            this.elements.registerForm.addEventListener('submit', (e) => this.handleRegister(e));
        }
        
        // Close dropdown when clicking outside
        document.addEventListener('click', () => {
            if (this.elements.userDropdown) {
                this.elements.userDropdown.classList.remove('show');
            }
        });
    }

    // Token management
    loadToken() {
        const token = localStorage.getItem('voiceMorphToken');
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                // Check if token is expired
                if (payload.exp * 1000 > Date.now()) {
                    this.token = token;
                    this.user = {
                        id: payload.userId,
                        email: payload.email,
                        username: payload.username || payload.display_name
                    };
                    this.isAuthenticated = true;
                } else {
                    // Token expired, remove it
                    this.clearToken();
                }
            } catch (error) {
                // this.clearToken();
                const payload = JSON.parse(atob(token))
                if (payload.exp * 1000 > Date.now()) {
                    this.token = token;
                    this.user = {
                        id: payload.userId,
                        email: payload.email,
                        username: payload.username || payload.display_name
                    };
                    this.isAuthenticated = true;
                } else {
                    // Token expired, remove it
                    this.clearToken();
                }
            }
        }
    }

    saveToken(token) {
        localStorage.setItem('voiceMorphToken', token);
        this.token = token;
        this.loadToken(); // Parse the token
    }

    clearToken() {
        localStorage.removeItem('voiceMorphToken');
        this.token = null;
        this.user = null;
        this.isAuthenticated = false;
    }

    // Authentication methods
    async handleLogin(event) {
        event.preventDefault();
        const formData = new FormData(event.target);
        const email = formData.get('email');
        const password = formData.get('password');

        try {
            this.setAuthButtonLoading(true);
            
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const result = await response.json();

            if (response.ok) {
                this.saveToken(result.token);
                this.user = result.user;
                this.isAuthenticated = true;
                this.updateAuthUI();
                this.hideAuthModal();
                this.showMessage(window.i18n?.translate('messages.login_success') || 'Login successful!', 'success');
                
                // Refresh current view if needed
                if (window.voiceMorphApp) {
                    window.voiceMorphApp.onAuthStateChange();
                }
            } else {
                this.showMessage(result.error || 'Login failed', 'error');
            }
        } catch (error) {
            console.error('Login error:', error);
            this.showMessage('Login failed. Please try again.', 'error');
        } finally {
            this.setAuthButtonLoading(false);
        }
    }

    async handleRegister(event) {
        event.preventDefault();
        const formData = new FormData(event.target);
        const username = formData.get('username');
        const email = formData.get('email');
        const password = formData.get('password');
        const confirmPassword = formData.get('confirmPassword');

        // Comprehensive front-end validation
        const errors = [];
        
        // Username validation
        if (!username || username.trim().length === 0) {
            errors.push('Username is required');
        } else if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
            if (username.includes('@')) {
                errors.push('Username cannot contain @ symbol. Please use letters, numbers, and underscores only.');
            } else if (username.includes('.')) {
                errors.push('Username cannot contain dots. Please use letters, numbers, and underscores only.');
            } else if (username.length < 3) {
                errors.push('Username must be at least 3 characters long');
            } else if (username.length > 20) {
                errors.push('Username cannot exceed 20 characters');
            } else {
                errors.push('Username can only contain letters, numbers, and underscores');
            }
        }
        
        // Email validation
        if (!email || email.trim().length === 0) {
            errors.push('Email is required');
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            errors.push('Please enter a valid email address');
        }
        
        // Password validation
        if (!password || password.length === 0) {
            errors.push('Password is required');
        } else if (password.length < 6) {
            errors.push('Password must be at least 6 characters long');
        }
        
        // Confirm password validation
        if (password !== confirmPassword) {
            errors.push('Passwords do not match');
        }
        
        // Show errors if any
        if (errors.length > 0) {
            this.showMessage(errors.join('. '), 'error');
            return;
        }

        try {
            this.setAuthButtonLoading(true);
            
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, email, password, confirmPassword })
            });

            const result = await response.json();

            if (response.ok) {
                this.saveToken(result.token);
                this.user = result.user;
                this.isAuthenticated = true;
                this.updateAuthUI();
                this.hideAuthModal();
                this.showMessage(window.i18n?.translate('messages.register_success') || 'Registration successful!', 'success');
                
                // Refresh current view if needed
                if (window.voiceMorphApp) {
                    window.voiceMorphApp.onAuthStateChange();
                }
            } else {
                this.showMessage(result.error || 'Registration failed', 'error');
            }
        } catch (error) {
            console.error('Registration error:', error);
            this.showMessage('Registration failed. Please try again.', 'error');
        } finally {
            this.setAuthButtonLoading(false);
        }
    }

    logout() {
        this.clearToken();
        this.updateAuthUI();
        this.showMessage(window.i18n?.translate('messages.logout_success') || 'Logged out successfully', 'success');
        
        // Refresh current view
        if (window.voiceMorphApp) {
            window.voiceMorphApp.onAuthStateChange();
        }
        
        // Hide dashboard if showing
        if (this.elements.dashboardSection) {
            this.elements.dashboardSection.style.display = 'none';
        }
    }

    // UI management
    updateAuthUI() {
        if (this.isAuthenticated && this.user) {
            // Show user menu, hide auth buttons
            if (this.elements.authButtons) {
                this.elements.authButtons.style.display = 'none';
            }
            if (this.elements.userMenu) {
                this.elements.userMenu.style.display = 'flex';
            }
            if (this.elements.userName) {
                this.elements.userName.textContent = this.user.display_name || this.user.username;
            }
        } else {
            // Show auth buttons, hide user menu
            if (this.elements.authButtons) {
                this.elements.authButtons.style.display = 'flex';
            }
            if (this.elements.userMenu) {
                this.elements.userMenu.style.display = 'none';
            }
        }
    }

    // Modal management
    showLoginModal() {
        this.showAuthModal('login');
    }

    showRegisterModal() {
        this.showAuthModal('register');
    }

    showAuthModal(mode = 'login') {
        if (!this.elements.authModal) return;
        
        this.elements.authModal.style.display = 'flex';
        
        if (mode === 'login') {
            this.showLoginForm();
        } else {
            this.showRegisterForm();
        }
    }

    hideAuthModal() {
        if (this.elements.authModal) {
            this.elements.authModal.style.display = 'none';
        }
        // Reset forms
        if (this.elements.loginForm) {
            this.elements.loginForm.reset();
        }
        if (this.elements.registerForm) {
            this.elements.registerForm.reset();
        }
    }

    showLoginForm() {
        if (this.elements.loginForm) {
            this.elements.loginForm.style.display = 'flex';
        }
        if (this.elements.registerForm) {
            this.elements.registerForm.style.display = 'none';
        }
        if (this.elements.authModalTitle) {
            this.elements.authModalTitle.textContent = window.i18n?.translate('auth.login') || 'Login';
        }
    }

    showRegisterForm() {
        if (this.elements.loginForm) {
            this.elements.loginForm.style.display = 'none';
        }
        if (this.elements.registerForm) {
            this.elements.registerForm.style.display = 'flex';
        }
        if (this.elements.authModalTitle) {
            this.elements.authModalTitle.textContent = window.i18n?.translate('auth.register') || 'Register';
        }
    }

    toggleUserDropdown() {
        if (this.elements.userDropdown) {
            this.elements.userDropdown.classList.toggle('show');
        }
    }

    // Dashboard
    async showDashboard() {
        if (!this.isAuthenticated) return;
        
        // Show profile modal instead of dashboard section
        this.showProfile('dashboard');
    }

    // Profile
    async showProfile(type = 'profile') {
        if (!this.isAuthenticated) return;
        
        // Create profile modal
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.id = 'profileModal';
        
        // Load user statistics
        let stats = { recordings: 0, shared: 0, downloads: 0 };
        try {
            const response = await fetch('/api/recordings', {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });
            
            if (response.ok) {
                const result = await response.json();
                stats.recordings = result.recordings ? result.recordings.length : 0;
                // Calculate shared and downloads from recordings
                if (result.recordings) {
                    stats.shared = result.recordings.filter(r => r.share_token).length;
                    stats.downloads = result.recordings.reduce((sum, r) => sum + (r.download_count || 0), 0);
                }
            }
        } catch (error) {
            console.error('Error loading profile stats:', error);
        }
        
        modal.innerHTML = `
            <div class="modal">
                <div class="modal-header">
                    <h2 data-i18n="${type === 'dashboard' ? 'dashboard.title' : 'profile.title'}">Personal Profile</h2>
                    <button class="modal-close" id="profileModalClose">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="modal-body">
                    <div class="profile-content">
                        ${type === 'dashboard' ? `
                            <div class="profile-stats">
                            <div class="stat-item">
                                <i class="fas fa-microphone"></i>
                                <div>
                                    <span class="stat-number">${stats.recordings}</span>
                                    <span class="stat-label">Recordings</span>
                                </div>
                            </div>
                            <div class="stat-item">
                                <i class="fas fa-share"></i>
                                <div>
                                    <span class="stat-number">${stats.shared}</span>
                                    <span class="stat-label">Shared</span>
                                </div>
                            </div>
                            <div class="stat-item">
                                <i class="fas fa-download"></i>
                                <div>
                                    <span class="stat-number">${stats.downloads}</span>
                                    <span class="stat-label">Downloads</span>
                                </div>
                            </div>
                        </div>
                        ` : `
                        <div class="profile-info">
                            <div class="profile-avatar">
                                <i class="fas fa-user-circle"></i>
                            </div>
                            <div class="profile-details">
                                <h3>${this.user.display_name || this.user.username}</h3>
                                <p>${this.user.email}</p>
                                <p class="member-since">Member since ${new Date().toLocaleDateString()}</p>
                            </div>
                        </div>`}
                        
                        ${ type === 'dashboard' ? 
                            `<div class="profile-actions">
                                <button class="profile-btn" id="profileWorkspace">
                                    <i class="fas fa-briefcase"></i>
                                    <span data-i18n="profile.workspace">My Workspace</span>
                                </button>
                            </div>`
                            : 
                            `<div class="profile-actions">
                                <button class="profile-btn" id="profileViewDashboard">
                                    <i class="fas fa-tachometer-alt"></i>
                                    <span data-i18n="profile.view_dashboard">View Dashboard</span>
                                </button>
                                <button class="profile-btn" id="profileEditProfile">
                                    <i class="fas fa-edit"></i>
                                    <span data-i18n="profile.edit_profile">Edit Profile</span>
                                </button>
                                <button class="profile-btn" id="profileWorkspace">
                                    <i class="fas fa-briefcase"></i>
                                    <span data-i18n="profile.workspace">My Workspace</span>
                                </button>
                            </div>`
                         }
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Add event listener for close button
        const closeBtn = modal.querySelector('#profileModalClose');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                modal.remove();
            });
        }
        
        // Add event listeners for action buttons
        const viewDashboardBtn = modal.querySelector('#profileViewDashboard');
        if (viewDashboardBtn) {
            viewDashboardBtn.addEventListener('click', () => {
                this.showDashboard();
                modal.remove();
            });
        }
        
        const editProfileBtn = modal.querySelector('#profileEditProfile');
        if (editProfileBtn) {
            editProfileBtn.addEventListener('click', () => {
                this.showEditProfile();
                modal.remove();
            });
        }
        
        const workspaceBtn = modal.querySelector('#profileWorkspace');
        if (workspaceBtn) {
            workspaceBtn.addEventListener('click', () => {
                this.showWorkspace();
                modal.remove();
            });
        }
        
        const logoutBtn = modal.querySelector('#profileLogout');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                this.logout();
                modal.remove();
            });
        }
        
        // Close modal when clicking outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
        
        // Hide dropdown
        if (this.elements.userDropdown) {
            this.elements.userDropdown.classList.remove('show');
        }
        
        // Update translations if available
        if (window.i18n) {
            window.i18n.updateDOM();
        }
    }

    async loadUserRecordings() {
        try {
            const response = await fetch('/api/recordings', {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });

            const result = await response.json();

            if (response.ok) {
                this.renderRecordings(result.recordings);
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            console.error('Error loading recordings:', error);
            if (this.elements.recordingsGrid) {
                this.elements.recordingsGrid.innerHTML = '<p>Failed to load recordings</p>';
            }
        }
    }

    renderRecordings(recordings) {
        if (!this.elements.recordingsGrid) return;
        
        if (!recordings || recordings.length === 0) {
            this.elements.recordingsGrid.innerHTML = `
                <div class="no-recordings">
                    <p>${window.i18n?.translate('dashboard.no_recordings') || 'No recordings yet'}</p>
                    <p>${window.i18n?.translate('dashboard.create_first') || 'Create your first voice transformation!'}</p>
                </div>
            `;
            return;
        }

        this.elements.recordingsGrid.innerHTML = recordings.map(recording => `
            <div class="recording-card">
                <h3>${recording.title || 'Untitled'}</h3>
                <div class="meta">
                    <span>${recording.effect_type}</span> • 
                    <span>${new Date(recording.created_at).toLocaleDateString()}</span>
                    ${recording.play_count ? ` • ${recording.play_count} plays` : ''}
                </div>
                ${recording.processed_filename ? `
                    <audio controls style="width: 100%; margin: 1rem 0;">
                        <source src="/uploads/${recording.processed_filename}" type="audio/wav">
                    </audio>
                ` : ''}
                <div class="recording-actions">
                    ${recording.processed_filename ? `
                        <button onclick="authManager.downloadRecording('${recording.processed_filename}')">
                            <i class="fas fa-download"></i> Download
                        </button>
                    ` : ''}
                    <button onclick="authManager.shareRecording(${recording.id})">
                        <i class="fas fa-share"></i> Share
                    </button>
                </div>
            </div>
        `).join('');
    }

    async shareRecording(recordingId) {
        try {
            const response = await fetch(`/api/recordings/${recordingId}/share`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });

            const result = await response.json();

            if (response.ok) {
                // Show share URL
                this.showShareModal(result.shareUrl);
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            console.error('Error sharing recording:', error);
            this.showMessage('Failed to share recording', 'error');
        }
    }

    showShareModal(shareUrl) {
        const shareModal = document.getElementById('shareModal');
        const shareUrlInput = document.getElementById('shareUrl');
        
        if (shareModal && shareUrlInput) {
            shareUrlInput.value = shareUrl;
            shareModal.style.display = 'flex';
        }
    }

    downloadRecording(filename) {
        const link = document.createElement('a');
        link.href = `/uploads/${filename}`;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    // Helper methods
    setAuthButtonLoading(loading) {
        const buttons = document.querySelectorAll('.auth-submit-btn');
        buttons.forEach(button => {
            button.disabled = loading;
            if (loading) {
                button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
            }
        });
    }

    showMessage(message, type = 'info') {
        // Use the same message system as the main app
        if (window.voiceMorphApp && window.voiceMorphApp.showMessage) {
            window.voiceMorphApp.showMessage(message, type);
        } else {
            // Fallback
            console.log(`${type.toUpperCase()}: ${message}`);
        }
    }

    // Get auth header for API requests
    getAuthHeader() {
        return this.token ? { 'Authorization': `Bearer ${this.token}` } : {};
    }

    // Check if user is authenticated
    isLoggedIn() {
        return this.isAuthenticated;
    }

    // Get current user
    getCurrentUser() {
        return this.user;
    }
    
    // Setup form validation
    setupFormValidation() {
        // Wait for DOM to be ready
        setTimeout(() => {
            this.setupUsernameValidation();
            this.setupPasswordValidation();
            this.setupEmailValidation();
        }, 500);
    }
    
    setupUsernameValidation() {
        const usernameInput = document.getElementById('registerUsername');
        if (!usernameInput) return;
        
        usernameInput.addEventListener('input', (e) => {
            const username = e.target.value;
            const isValid = /^[a-zA-Z0-9_]{3,20}$/.test(username);
            const hintElement = usernameInput.parentNode.querySelector('.input-hint');
            
            if (username.length === 0) {
                // Empty input - show normal hint
                usernameInput.classList.remove('valid', 'invalid');
                if (hintElement) {
                    hintElement.className = 'input-hint';
                    hintElement.innerHTML = `<i class="fas fa-info-circle"></i> ${window.i18n?.translate('auth.username_hint') || '3-20 characters, letters, numbers and underscores only'}`;
                }
            } else if (isValid) {
                // Valid input
                usernameInput.classList.remove('invalid');
                usernameInput.classList.add('valid');
                if (hintElement) {
                    hintElement.className = 'input-hint valid';
                    hintElement.innerHTML = `<i class="fas fa-check-circle"></i> Username is valid`;
                }
            } else {
                // Invalid input
                usernameInput.classList.remove('valid');
                usernameInput.classList.add('invalid');
                if (hintElement) {
                    hintElement.className = 'input-hint invalid';
                    let errorMsg = 'Invalid username format';
                    
                    if (username.length < 3) {
                        errorMsg = 'Username too short (minimum 3 characters)';
                    } else if (username.length > 20) {
                        errorMsg = 'Username too long (maximum 20 characters)';
                    } else if (username.includes('@')) {
                        // Suggest a valid username based on email-like input
                        const suggestion = this.generateUsernameSuggestion(username);
                        errorMsg = `Username cannot contain @ symbol. Try: "${suggestion}"`;
                    } else if (username.includes('.')) {
                        const suggestion = this.generateUsernameSuggestion(username);
                        errorMsg = `Username cannot contain dots. Try: "${suggestion}"`;
                    } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
                        errorMsg = 'Username can only contain letters, numbers, and underscores';
                    }
                    
                    hintElement.innerHTML = `<i class="fas fa-exclamation-triangle"></i> ${errorMsg}`;
                }
            }
            
            this.updateSubmitButtonState();
        });
        
        // Clear validation on focus
        usernameInput.addEventListener('focus', () => {
            const hintElement = usernameInput.parentNode.querySelector('.input-hint');
            if (hintElement && usernameInput.value.length === 0) {
                usernameInput.classList.remove('valid', 'invalid');
                hintElement.className = 'input-hint';
                hintElement.innerHTML = `<i class="fas fa-info-circle"></i> ${window.i18n?.translate('auth.username_hint') || '3-20 characters, letters, numbers and underscores only'}`;
            }
        });
    }
    
    setupPasswordValidation() {
        const passwordInput = document.getElementById('registerPassword');
        const confirmPasswordInput = document.getElementById('confirmPassword');
        
        if (!passwordInput || !confirmPasswordInput) return;
        
        const validatePasswords = () => {
            const password = passwordInput.value;
            const confirmPassword = confirmPasswordInput.value;
            const passwordHint = passwordInput.parentNode.querySelector('.input-hint');
            const confirmHint = confirmPasswordInput.parentNode.querySelector('.input-hint') || 
                               this.createHintElement(confirmPasswordInput.parentNode);
            
            // Validate password strength
            if (password.length === 0) {
                passwordInput.classList.remove('valid', 'invalid');
                if (passwordHint) {
                    passwordHint.className = 'input-hint';
                    passwordHint.innerHTML = `<i class="fas fa-info-circle"></i> ${window.i18n?.translate('auth.password_hint') || 'At least 6 characters'}`;
                }
            } else if (password.length >= 6) {
                passwordInput.classList.remove('invalid');
                passwordInput.classList.add('valid');
                if (passwordHint) {
                    passwordHint.className = 'input-hint valid';
                    passwordHint.innerHTML = '<i class="fas fa-check-circle"></i> Password is strong enough';
                }
            } else {
                passwordInput.classList.remove('valid');
                passwordInput.classList.add('invalid');
                if (passwordHint) {
                    passwordHint.className = 'input-hint invalid';
                    passwordHint.innerHTML = `<i class="fas fa-exclamation-triangle"></i> Password too short (minimum 6 characters)`;
                }
            }
            
            // Validate password match
            if (confirmPassword.length === 0) {
                confirmPasswordInput.classList.remove('valid', 'invalid');
                confirmHint.className = 'input-hint';
                confirmHint.innerHTML = '<i class="fas fa-info-circle"></i> Repeat your password';
            } else if (password === confirmPassword && password.length >= 6) {
                confirmPasswordInput.classList.remove('invalid');
                confirmPasswordInput.classList.add('valid');
                confirmHint.className = 'input-hint valid';
                confirmHint.innerHTML = '<i class="fas fa-check-circle"></i> Passwords match';
            } else if (password !== confirmPassword) {
                confirmPasswordInput.classList.remove('valid');
                confirmPasswordInput.classList.add('invalid');
                confirmHint.className = 'input-hint invalid';
                confirmHint.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Passwords do not match';
            }
        };
        
        passwordInput.addEventListener('input', () => {
            validatePasswords();
            this.updateSubmitButtonState();
        });
        confirmPasswordInput.addEventListener('input', () => {
            validatePasswords();
            this.updateSubmitButtonState();
        });
    }
    
    setupEmailValidation() {
        const emailInputs = [
            document.getElementById('registerEmail'),
            document.getElementById('loginEmail')
        ].filter(input => input);
        
        emailInputs.forEach(emailInput => {
            emailInput.addEventListener('input', (e) => {
                const email = e.target.value;
                const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
                
                if (email.length === 0) {
                    emailInput.classList.remove('valid', 'invalid');
                } else if (isValid) {
                    emailInput.classList.remove('invalid');
                    emailInput.classList.add('valid');
                } else {
                    emailInput.classList.remove('valid');
                    emailInput.classList.add('invalid');
                }
                
                // Update submit button state for register form
                if (emailInput.id === 'registerEmail') {
                    this.updateSubmitButtonState();
                }
            });
        });
    }
    
    createHintElement(parentNode) {
        const hint = document.createElement('div');
        hint.className = 'input-hint';
        parentNode.appendChild(hint);
        return hint;
    }
    
    updateSubmitButtonState() {
        const submitBtn = document.querySelector('#registerForm .auth-submit-btn');
        if (!submitBtn) return;
        
        const usernameInput = document.getElementById('registerUsername');
        const emailInput = document.getElementById('registerEmail');
        const passwordInput = document.getElementById('registerPassword');
        const confirmPasswordInput = document.getElementById('confirmPassword');
        
        if (!usernameInput || !emailInput || !passwordInput || !confirmPasswordInput) return;
        
        const username = usernameInput.value;
        const email = emailInput.value;
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;
        
        // Check if all fields are valid
        const isUsernameValid = /^[a-zA-Z0-9_]{3,20}$/.test(username);
        const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        const isPasswordValid = password.length >= 6;
        const doPasswordsMatch = password === confirmPassword && password.length > 0;
        
        const allValid = isUsernameValid && isEmailValid && isPasswordValid && doPasswordsMatch;
        
        submitBtn.disabled = !allValid;
        
        if (allValid) {
            submitBtn.classList.remove('disabled');
            submitBtn.innerHTML = '<span data-i18n="auth.register">Register</span>';
        } else {
            submitBtn.classList.add('disabled');
            
            let disabledReason = 'Please complete all fields correctly';
            if (!isUsernameValid && username.length > 0) {
                disabledReason = 'Fix username format';
            } else if (!isEmailValid && email.length > 0) {
                disabledReason = 'Enter valid email address';
            } else if (!isPasswordValid && password.length > 0) {
                disabledReason = 'Password too short';
            } else if (!doPasswordsMatch && confirmPassword.length > 0) {
                disabledReason = 'Passwords do not match';
            }
            
            submitBtn.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${disabledReason}`;
        }
        
        // Update translations if available
        if (window.i18n && allValid) {
            const span = submitBtn.querySelector('span[data-i18n]');
            if (span) {
                span.textContent = window.i18n.translate('auth.register');
            }
        }
    }
    
    generateUsernameSuggestion(input) {
        // Convert email-like input to valid username
        let suggestion = input
            .replace(/@.*$/, '')  // Remove @ and everything after
            .replace(/\./g, '_')  // Replace dots with underscores
            .replace(/[^a-zA-Z0-9_]/g, '')  // Remove invalid characters
            .toLowerCase();
        
        // Ensure it meets length requirements
        if (suggestion.length < 3) {
            suggestion += '_user';
        }
        if (suggestion.length > 20) {
            suggestion = suggestion.substring(0, 17) + '123';
        }
        
        return suggestion;
    }

    showEditProfile() {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.id = 'editProfileModal';
        
        modal.innerHTML = `
            <div class="modal">
                <div class="modal-header">
                    <h2>Edit Profile</h2>
                    <button class="modal-close" id="editProfileModalClose">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="modal-body">
                    <form id="editProfileForm" class="profile-form">
                        <div class="form-group">
                            <label for="editDisplayName">Display Name</label>
                            <input type="text" id="editDisplayName" value="${this.user.display_name || this.user.username}" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="editEmail">Email</label>
                            <input type="email" id="editEmail" value="${this.user.email}" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="editBio">Bio</label>
                            <textarea id="editBio" rows="3" placeholder="Tell us about yourself...">${this.user.bio || ''}</textarea>
                        </div>
                        
                        <div class="form-group">
                            <label for="editAvatar">Avatar</label>
                            <input type="file" id="editAvatar" accept="image/\*" style="display:none">
                            <button data-i18n="auth.uploadAvatar" style="width: 100%; height: 40px;" id="uploadAvatarBtn" class="custom-upload-btn">
                                upload avatar
                            </button>
                            <div class="avatar-preview">
                                <img src="${this.user.avatar || '/assets/default-avatar.png'}" alt="Avatar Preview" id="avatarPreview">
                            </div>
                        </div>
                        
                        <div class="form-actions">
                            <button type="button" class="btn secondary" id="cancelEditProfile">Cancel</button>
                            <button type="submit" class="btn primary">Save Changes</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Add event listeners
        const closeBtn = modal.querySelector('#editProfileModalClose');
        const cancelBtn = modal.querySelector('#cancelEditProfile');
        const form = modal.querySelector('#editProfileForm');
        const avatarInput = modal.querySelector('#editAvatar');
        const avatarPreview = modal.querySelector('#avatarPreview');
        const uploadAvatarBtn = modal.querySelector('#uploadAvatarBtn');

        if (uploadAvatarBtn) {
            uploadAvatarBtn.addEventListener('click', () => {
                avatarInput.click();
            });
        }
        
        if (closeBtn) {
            closeBtn.addEventListener('click', () => modal.remove());
        }
        
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => modal.remove());
        }
        
        if (avatarInput) {
            avatarInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        avatarPreview.src = e.target.result;
                    };
                    reader.readAsDataURL(file);
                }
            });
        }
        
        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const formData = new FormData();
                formData.append('display_name', document.getElementById('editDisplayName').value);
                formData.append('email', document.getElementById('editEmail').value);
                formData.append('bio', document.getElementById('editBio').value);
                
                if (avatarInput.files[0]) {
                    formData.append('avatar', avatarInput.files[0]);
                }
                
                try {
                    const response = await fetch('/api/profile/update', {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${this.token}`
                        },
                        body: formData
                    });
                    
                    if (response.ok) {
                        const result = await response.json();
                        this.user = { ...this.user, ...result.user };
                        this.showMessage('Profile updated successfully!', 'success');
                    } else {
                        // this.showMessage('Failed to update profile. Please try again.', 'error');
                        let voiceMorphToken = {};
                        if (voiceMorphToken) {
                            voiceMorphToken.displayName = document.getElementById('editDisplayName').value;
                            voiceMorphToken.display_name = document.getElementById('editDisplayName').value,
                            voiceMorphToken.email = document.getElementById('editEmail').value;
                            voiceMorphToken.bio = document.getElementById('editBio').value;
                            voiceMorphToken.avatar_url = avatarInput.files[0] ? URL.createObjectURL(avatarInput.files[0]) : this.user.avatar;
                            voiceMorphToken.avatar = avatarInput.files[0] ? URL.createObjectURL(avatarInput.files[0]) : this.user.avatar;
                            voiceMorphToken.exp = Date.now() + 1000 * 60 * 60 * 24 * 7 // 7 days
                            voiceMorphToken.useId = this.user.id
                            username = voiceMorphToken.displayName
                        } else {
                            voiceMorphToken = {
                                display_name: document.getElementById('editDisplayName').value,
                                displayName: document.getElementById('editDisplayName').value,
                                email: document.getElementById('editEmail').value,
                                bio: document.getElementById('editBio').value,
                                avatar_url: avatarInput.files[0] ? URL.createObjectURL(avatarInput.files[0]) : this.user.avatar,
                                avatar: avatarInput.files[0] ? URL.createObjectURL(avatarInput.files[0]) : this.user.avatar,
                                exp: Date.now() + 1000 * 60 * 60 * 24 * 7, // 7 days
                                useId: this.user.id,
                                username: voiceMorphToken.displayName
                            };
                        }
                        this.user = voiceMorphToken;
                        // decoded 加密存储
                        localStorage.setItem('voiceMorphToken', btoa(JSON.stringify(voiceMorphToken)));
                    }
                } catch (error) {
                    console.error('Error updating profile:', error);
                    // this.showMessage('An error occurred. Please try again.', 'error');
                    // 将修改的信息同步保存到voiceMorphToken
                    if (voiceMorphToken) {
                            voiceMorphToken.displayName = document.getElementById('editDisplayName').value;
                            voiceMorphToken.display_name = document.getElementById('editDisplayName').value,
                            voiceMorphToken.email = document.getElementById('editEmail').value;
                            voiceMorphToken.bio = document.getElementById('editBio').value;
                            voiceMorphToken.avatar_url = avatarInput.files[0] ? URL.createObjectURL(avatarInput.files[0]) : this.user.avatar;
                            voiceMorphToken.avatar = avatarInput.files[0] ? URL.createObjectURL(avatarInput.files[0]) : this.user.avatar;
                            voiceMorphToken.exp = Date.now() + 1000 * 60 * 60 * 24 * 7 // 7 days
                            voiceMorphToken.useId = this.user.id;
                            username = voiceMorphToken.displayName
                    } else {
                        voiceMorphToken = {
                            display_name: document.getElementById('editDisplayName').value,
                            displayName: document.getElementById('editDisplayName').value,
                            email: document.getElementById('editEmail').value,
                            bio: document.getElementById('editBio').value,
                            avatar_url: avatarInput.files[0] ? URL.createObjectURL(avatarInput.files[0]) : this.user.avatar,
                            avatar: avatarInput.files[0] ? URL.createObjectURL(avatarInput.files[0]) : this.user.avatar,
                            exp: Date.now() + 1000 * 60 * 60 * 24 * 7, // 7 days
                            useId: this.user.id,
                            username: voiceMorphToken.displayName
                        };
                    }
                    this.user = voiceMorphToken;
                    // decoded 加密存储
                    localStorage.setItem('voiceMorphToken', btoa(JSON.stringify(voiceMorphToken)));
                } finally {
                    modal.remove();
                    this.updateUserInterface();
                }
            });
        }
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
        if (window.i18n) {
            window.i18n.updateDOM();
        }
    }
    updateUserInterface() {
        const displayName = document.getElementById('userName');
        displayName.textContent = this.user.displayName;
    }

    showWorkspace() {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.id = 'workspaceModal';
        
        modal.innerHTML = `
            <div class="modal workspace-modal">
                <div class="modal-header">
                    <h2>My Workspace</h2>
                    <button class="modal-close" id="workspaceModalClose">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="modal-body">
                    <div class="workspace-content">
                        <div class="workspace-tabs">
                            <button class="tab-btn active" data-tab="recordings">My Recordings</button>
                            <button class="tab-btn" data-tab="projects">Projects</button>
                            <button class="tab-btn" data-tab="settings">Settings</button>
                        </div>
                        
                        <div class="tab-content">
                            <div class="tab-panel active" id="recordings-tab">
                                <div class="recordings-list" id="workspaceRecordings">
                                    <div class="loading">Loading recordings...</div>
                                </div>
                            </div>
                            
                            <div class="tab-panel" id="projects-tab">
                                <div class="projects-list">
                                    <div class="project-item">
                                        <h4>Voice Collection #1</h4>
                                        <p>Collection of robot voice transformations</p>
                                        <div class="project-actions">
                                            <button class="btn small secondary" id="deleteProjectBtn">Delete</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="tab-panel" id="settings-tab">
                                <div class="settings-content">
                                    <h3>Workspace Settings</h3>
                                    <div class="setting-item">
                                        <label>
                                            <input type="checkbox" checked>
                                            Auto-save recordings
                                        </label>
                                    </div>
                                    <div class="setting-item">
                                        <label>
                                            <input type="checkbox">
                                            Email notifications
                                        </label>
                                    </div>
                                    <div class="setting-item">
                                        <label>
                                            <input type="checkbox" checked>
                                            Share by default
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Add event listeners
        const closeBtn = modal.querySelector('#workspaceModalClose');
        const tabBtns = modal.querySelectorAll('.tab-btn');
        const tabPanels = modal.querySelectorAll('.tab-panel');
        const deleteProjectBtn = modal.querySelector('#deleteProjectBtn');
        const projectItem = modal.querySelector('.project-item');

        if (deleteProjectBtn) {
            deleteProjectBtn.addEventListener('click', () => {
                if (projectItem) {
                    projectItem.remove();
                }
            });
        }

        
        if (closeBtn) {
            closeBtn.addEventListener('click', () => modal.remove());
        }
        
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const tabId = btn.dataset.tab;
                
                // Update active tab
                tabBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                // Update active panel
                tabPanels.forEach(p => p.classList.remove('active'));
                document.getElementById(`${tabId}-tab`).classList.add('active');
                
                // Load content if needed
                if (tabId === 'recordings') {
                    this.loadWorkspaceRecordings();
                }
            });
        });
        
        // Load initial content
        this.loadWorkspaceRecordings();
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
    }

    async loadWorkspaceRecordings() {
        const recordingsContainer = document.getElementById('workspaceRecordings');
        if (!recordingsContainer) return;
        
        try {
            const response = await fetch('/api/recordings', {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });
            
            if (response.ok) {
                const result = await response.json();
                const recordings = result.recordings || [];
                
                if (recordings.length === 0) {
                    recordingsContainer.innerHTML = '<div class="empty-state">No recordings yet. Start creating some!</div>';
                } else {
                    recordingsContainer.innerHTML = recordings.map(recording => `
                        <div class="recording-item">
                            <div class="recording-info">
                                <h4>${recording.original_filename || 'Recording'}</h4>
                                <p>Effect: ${recording.effect || 'no effect'}</p>
                                <p>Created: ${new Date(recording.created_at).toLocaleDateString()}</p>
                            </div>
                            <div class="recording-actions">
                                <button class="btn small" onclick="this.playRecording('${recording.id}')">Play</button>
                                <button class="btn small secondary" onclick="this.downloadRecording('${recording.id}')">Download</button>
                                <button class="btn small danger" onclick="this.deleteRecording('${recording.id}')">Delete</button>
                            </div>
                        </div>
                    `).join('');
                }
            } else {
                recordingsContainer.innerHTML = '<div class="error-state">Failed to load recordings</div>';
            }
        } catch (error) {
            console.error('Error loading workspace recordings:', error);
            recordingsContainer.innerHTML = '<div class="error-state">Error loading recordings</div>';
        }
    }

    showMessage(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            z-index: 10000;
            font-size: 14px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 3000);
    }
}

// Create global auth manager instance
window.authManager = new AuthManager();

// Setup share modal close handlers
document.addEventListener('DOMContentLoaded', () => {
    const shareModal = document.getElementById('shareModal');
    const shareModalClose = document.getElementById('shareModalClose');
    const copyShareUrl = document.getElementById('copyShareUrl');

    if (shareModalClose) {
        shareModalClose.addEventListener('click', () => {
            shareModal.style.display = 'none';
        });
    }

    if (shareModal) {
        shareModal.addEventListener('click', (e) => {
            if (e.target === shareModal) {
                shareModal.style.display = 'none';
            }
        });
    }

    if (copyShareUrl) {
        copyShareUrl.addEventListener('click', () => {
            const shareUrl = document.getElementById('shareUrl');
            if (shareUrl) {
                shareUrl.select();
                document.execCommand('copy');
                
                // Visual feedback
                const icon = copyShareUrl.querySelector('i');
                if (icon) {
                    icon.className = 'fas fa-check';
                    setTimeout(() => {
                        icon.className = 'fas fa-copy';
                    }, 2000);
                }
            }
        });
    }
});
