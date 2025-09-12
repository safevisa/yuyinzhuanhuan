// Main Application Controller
class VoiceMorphApp {
    constructor() {
        this.audioManager = null;
        this.selectedEffect = null;
        this.availableEffects = {};
        this.currentStep = 'record'; // record, effects, processing, results
        
        // UI Elements
        this.elements = {};
        
        this.init();
    }

    async init() {
        try {
            // Initialize audio manager
            this.audioManager = new AudioManager();
            
            // Override audio manager callbacks
            this.audioManager.onRecordingComplete = () => this.onRecordingComplete();
            this.audioManager.onPlaybackComplete = () => this.onPlaybackComplete();
            
            // Get DOM elements
            this.getUIElements();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Load available effects
            await this.loadEffects();
            
            // Setup theme
            this.initTheme();
            
            console.log('✅ VoiceMorphApp initialized successfully');
        } catch (error) {
            console.error('❌ VoiceMorphApp initialization failed:', error);
            this.showError('Application failed to initialize');
        }
    }

    getUIElements() {
        this.elements = {
            // Recording controls
            recordBtn: document.getElementById('recordBtn'),
            stopBtn: document.getElementById('stopBtn'),
            playBtn: document.getElementById('playBtn'),
            audioFile: document.getElementById('audioFile'),
            recordingStatus: document.getElementById('recordingStatus'),
            
            // Sections
            effectsSection: document.getElementById('effectsSection'),
            processingSection: document.getElementById('processingSection'),
            resultsSection: document.getElementById('resultsSection'),
            
            // Effects
            effectsGrid: document.getElementById('effectsGrid'),
            
            // Processing
            progressFill: document.getElementById('progressFill'),
            
            // Results
            resultAudio: document.getElementById('resultAudio'),
            downloadBtn: document.getElementById('downloadBtn'),
            shareBtn: document.getElementById('shareBtn'),
            newRecordingBtn: document.getElementById('newRecordingBtn'),
            
            // Theme
            themeToggle: document.getElementById('themeToggle'),
            
            // Loading
            loadingOverlay: document.getElementById('loadingOverlay')
        };
    }

    setupEventListeners() {
        // Recording controls
        if (this.elements.recordBtn) {
            this.elements.recordBtn.addEventListener('click', () => this.toggleRecording());
        }
        
        if (this.elements.stopBtn) {
            this.elements.stopBtn.addEventListener('click', () => this.stopRecording());
        }
        
        if (this.elements.playBtn) {
            this.elements.playBtn.addEventListener('click', () => this.playRecording());
        }
        
        // File upload
        if (this.elements.audioFile) {
            this.elements.audioFile.addEventListener('change', (e) => this.handleFileUpload(e));
        }
        
        // Result actions
        if (this.elements.downloadBtn) {
            this.elements.downloadBtn.addEventListener('click', () => this.downloadResult());
        }
        
        if (this.elements.shareBtn) {
            this.elements.shareBtn.addEventListener('click', () => this.shareResult());
        }
        
        if (this.elements.newRecordingBtn) {
            this.elements.newRecordingBtn.addEventListener('click', () => this.startNewRecording());
        }
        
        // Theme toggle
        if (this.elements.themeToggle) {
            this.elements.themeToggle.addEventListener('click', () => this.toggleTheme());
        }

        // Hero buttons
        const heroStartBtn = document.getElementById('heroStartBtn');
        const heroDemoBtn = document.getElementById('heroDemoBtn');
        const ctaStartBtn = document.getElementById('ctaStartBtn');
        
        if (heroStartBtn) {
            heroStartBtn.addEventListener('click', () => this.scrollToRecorder());
        }
        
        if (heroDemoBtn) {
            heroDemoBtn.addEventListener('click', () => this.playDemo());
        }
        
        if (ctaStartBtn) {
            ctaStartBtn.addEventListener('click', () => this.scrollToRecorder());
        }

        // Global error handler
        window.addEventListener('error', (e) => {
            console.error('Global error:', e.error);
        });

        // Language change handler
        window.addEventListener('languageChanged', () => {
            this.updateUITexts();
        });
    }

    async loadEffects() {
        try {
            const response = await fetch('/api/effects');
            if (response.ok) {
                this.availableEffects = await response.json();
                this.renderEffects();
            } else {
                throw new Error('Failed to load effects');
            }
        } catch (error) {
            console.error('Error loading effects:', error);
            // Fallback effects
            this.availableEffects = {
                robot: { name: 'Robot', description: 'Robotic voice effect' },
                chipmunk: { name: 'Chipmunk', description: 'High-pitched voice' },
                deep: { name: 'Deep Voice', description: 'Lower pitch voice' },
                echo: { name: 'Echo', description: 'Echo effect' }
            };
            this.renderEffects();
        }
    }

    renderEffects() {
        if (!this.elements.effectsGrid) return;

        const effectIcons = {
            robot: 'fas fa-robot',
            chipmunk: 'fas fa-laugh-squint',
            deep: 'fas fa-volume-down',
            echo: 'fas fa-broadcast-tower',
            reverse: 'fas fa-backward'
        };

        this.elements.effectsGrid.innerHTML = '';
        
        Object.keys(this.availableEffects).forEach(effectKey => {
            const effect = this.availableEffects[effectKey];
            const effectCard = document.createElement('div');
            effectCard.className = 'effect-card';
            effectCard.setAttribute('data-effect', effectKey);
            
            effectCard.innerHTML = `
                <div class="effect-icon">
                    <i class="${effectIcons[effectKey] || 'fas fa-magic'}"></i>
                </div>
                <div class="effect-name">${effect.name}</div>
                <div class="effect-description">${effect.description}</div>
            `;
            
            effectCard.addEventListener('click', () => this.selectEffect(effectKey));
            this.elements.effectsGrid.appendChild(effectCard);
        });
    }

    selectEffect(effectKey) {
        // Remove previous selection
        const previouslySelected = this.elements.effectsGrid.querySelector('.effect-card.selected');
        if (previouslySelected) {
            previouslySelected.classList.remove('selected');
        }
        
        // Select new effect
        const effectCard = this.elements.effectsGrid.querySelector(`[data-effect="${effectKey}"]`);
        if (effectCard) {
            effectCard.classList.add('selected');
            this.selectedEffect = effectKey;
            
            // Auto-process if we have recorded audio
            if (this.audioManager.recordedBlob) {
                setTimeout(() => this.processAudio(), 500);
            }
        }
    }

    async toggleRecording() {
        try {
            if (!this.audioManager.isRecording) {
                await this.startRecording();
            } else {
                this.stopRecording();
            }
        } catch (error) {
            this.showError(error.message);
        }
    }

    async startRecording() {
        try {
            await this.audioManager.startRecording();
            this.updateRecordingUI(true);
            this.showMessage(window.i18n?.translate('messages.recording_started') || 'Recording started');
        } catch (error) {
            console.error('Recording error:', error);
            this.showError(error.message);
        }
    }

    stopRecording() {
        this.audioManager.stopRecording();
        this.updateRecordingUI(false);
        this.showMessage(window.i18n?.translate('messages.recording_stopped') || 'Recording stopped');
    }

    playRecording() {
        if (this.audioManager.recordedBlob) {
            this.audioManager.playRecordedAudio();
        }
    }

    async handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        try {
            await this.audioManager.handleFileUpload(file);
            this.onRecordingComplete();
            this.showMessage('File uploaded successfully');
        } catch (error) {
            this.showError(error.message);
            event.target.value = ''; // Reset file input
        }
    }

    onRecordingComplete() {
        // Update UI state
        if (this.elements.playBtn) {
            this.elements.playBtn.disabled = false;
        }
        
        // Show save section if user is logged in
        const saveSection = document.getElementById('saveSection');
        if (saveSection) {
            const isLoggedIn = window.authManager && window.authManager.isLoggedIn();
            saveSection.style.display = isLoggedIn ? 'block' : 'none';
        }
        
        // Show effects section
        this.showSection('effects');
        
        // Scroll to effects
        if (this.elements.effectsSection) {
            this.elements.effectsSection.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start' 
            });
        }
    }

    onPlaybackComplete() {
        // Handle playback completion if needed
        console.log('Playback completed');
    }

    async processAudio() {
        if (!this.audioManager.recordedBlob || !this.selectedEffect) {
            this.showError('Please record audio and select an effect');
            return;
        }

        try {
            this.showSection('processing');
            this.showMessage(window.i18n?.translate('messages.processing_started') || 'Processing audio...');
            
            // Animate progress bar
            this.animateProgress();
            
            const formData = this.audioManager.getRecordedAudioFormData();
            formData.append('effect', this.selectedEffect);
            
            // Add title if user is logged in
            const titleInput = document.getElementById('recordingTitle');
            if (titleInput && titleInput.value.trim()) {
                formData.append('title', titleInput.value.trim());
            }
            
            // Include auth header if user is logged in
            const headers = {};
            if (window.authManager && window.authManager.isLoggedIn()) {
                Object.assign(headers, window.authManager.getAuthHeader());
            }
            
            const response = await fetch('/api/transform', {
                method: 'POST',
                headers,
                body: formData
            });
            
            if (response.ok) {
                const result = await response.json();
                this.showResults(result);
            } else {
                const error = await response.json();
                throw new Error(error.error || 'Processing failed');
            }
            
        } catch (error) {
            console.error('Processing error:', error);
            this.showError(error.message);
            this.showSection('effects');
        }
    }

    animateProgress() {
        if (!this.elements.progressFill) return;
        
        let width = 0;
        const interval = setInterval(() => {
            width += Math.random() * 10;
            if (width >= 95) {
                width = 95;
                clearInterval(interval);
            }
            this.elements.progressFill.style.width = width + '%';
        }, 200);
        
        // Store interval for cleanup
        this.progressInterval = interval;
    }

    showResults(result) {
        if (this.progressInterval) {
            clearInterval(this.progressInterval);
        }
        
        if (this.elements.progressFill) {
            this.elements.progressFill.style.width = '100%';
        }
        
        setTimeout(() => {
            // Set up result audio
            if (this.elements.resultAudio && result.downloadUrl) {
                this.elements.resultAudio.src = result.downloadUrl;
                this.resultDownloadUrl = result.downloadUrl;
            }
            
            // Store result data
            this.currentResult = result;
            
            // Show/hide share button based on auth status
            if (this.elements.shareBtn) {
                const isLoggedIn = window.authManager && window.authManager.isLoggedIn();
                this.elements.shareBtn.style.display = (isLoggedIn && result.recordingId) ? 'flex' : 'none';
            }
            
            this.showSection('results');
            this.showMessage(window.i18n?.translate('messages.processing_complete') || 'Processing complete!');
            
            // Scroll to results
            if (this.elements.resultsSection) {
                this.elements.resultsSection.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'start' 
                });
            }
        }, 1000);
    }

    downloadResult() {
        if (this.resultDownloadUrl) {
            this.audioManager.downloadAudio(this.resultDownloadUrl);
            this.showMessage(window.i18n?.translate('messages.success_download') || 'File ready for download');
        }
    }

    shareResult() {
        if (this.currentResult && this.currentResult.recordingId && window.authManager && window.authManager.isLoggedIn()) {
            // Share via server (for logged in users)
            window.authManager.shareRecording(this.currentResult.recordingId);
        } else if (navigator.share && this.resultDownloadUrl) {
            // Native sharing
            navigator.share({
                title: 'Voice Morph Result',
                text: 'Check out my voice transformation!',
                url: window.location.origin + this.resultDownloadUrl
            }).catch(console.error);
        } else {
            // Fallback - copy URL to clipboard
            const url = window.location.origin + (this.resultDownloadUrl || '');
            navigator.clipboard.writeText(url).then(() => {
                this.showMessage('Link copied to clipboard!');
            }).catch(() => {
                this.showMessage('Sharing not supported');
            });
        }
    }

    startNewRecording() {
        // Reset state
        this.selectedEffect = null;
        this.currentResult = null;
        this.resultDownloadUrl = null;
        
        // Reset UI
        this.showSection('record');
        this.updateRecordingUI(false);
        
        // Clear audio
        if (this.elements.resultAudio) {
            this.elements.resultAudio.src = '';
        }
        
        if (this.elements.audioFile) {
            this.elements.audioFile.value = '';
        }
        
        // Clear recording title
        const titleInput = document.getElementById('recordingTitle');
        if (titleInput) {
            titleInput.value = '';
        }
        
        // Clear selected effect
        const selectedEffect = this.elements.effectsGrid?.querySelector('.effect-card.selected');
        if (selectedEffect) {
            selectedEffect.classList.remove('selected');
        }
        
        // Hide save section
        const saveSection = document.getElementById('saveSection');
        if (saveSection) {
            saveSection.style.display = 'none';
        }
        
        // Cleanup audio manager
        this.audioManager.cleanup();
        this.audioManager = new AudioManager();
        this.audioManager.onRecordingComplete = () => this.onRecordingComplete();
        this.audioManager.onPlaybackComplete = () => this.onPlaybackComplete();
    }

    updateRecordingUI(isRecording) {
        if (this.elements.recordBtn) {
            this.elements.recordBtn.disabled = isRecording;
            this.elements.recordBtn.classList.toggle('recording', isRecording);
            
            const span = this.elements.recordBtn.querySelector('span');
            const icon = this.elements.recordBtn.querySelector('i');
            
            if (isRecording) {
                if (span) span.textContent = window.i18n?.translate('recorder.recording') || 'Recording...';
                if (icon) icon.className = 'fas fa-circle';
            } else {
                if (span) span.textContent = window.i18n?.translate('recorder.start') || 'Start Recording';
                if (icon) icon.className = 'fas fa-microphone';
            }
        }
        
        if (this.elements.stopBtn) {
            this.elements.stopBtn.disabled = !isRecording;
        }
        
        if (this.elements.recordingStatus) {
            const span = this.elements.recordingStatus.querySelector('span');
            if (span) {
                span.textContent = isRecording 
                    ? (window.i18n?.translate('recorder.recording') || 'Recording...')
                    : (window.i18n?.translate('recorder.ready') || 'Ready to record');
            }
            this.elements.recordingStatus.classList.toggle('recording', isRecording);
        }
    }

    showSection(sectionName) {
        const sections = ['effectsSection', 'processingSection', 'resultsSection'];
        
        sections.forEach(section => {
            if (this.elements[section]) {
                this.elements[section].style.display = 
                    section === `${sectionName}Section` ? 'block' : 'none';
            }
        });
        
        this.currentStep = sectionName;
    }

    initTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        this.updateThemeIcon(savedTheme);
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        this.updateThemeIcon(newTheme);
    }

    updateThemeIcon(theme) {
        if (this.elements.themeToggle) {
            const icon = this.elements.themeToggle.querySelector('i');
            if (icon) {
                icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
            }
        }
    }

    updateUITexts() {
        // Update dynamic text content when language changes
        if (this.audioManager && !this.audioManager.isRecording) {
            this.updateRecordingUI(false);
        }
    }
    
    // Called when authentication state changes
    onAuthStateChange() {
        // Update UI based on auth state
        this.onRecordingComplete(); // Refresh save section visibility
        
        // If showing results, update share button visibility
        if (this.currentStep === 'results') {
            const isLoggedIn = window.authManager && window.authManager.isLoggedIn();
            if (this.elements.shareBtn) {
                this.elements.shareBtn.style.display = (isLoggedIn && this.currentResult?.recordingId) ? 'flex' : 'none';
            }
        }
    }
    
    // Scroll to recorder section
    scrollToRecorder() {
        const recorderSection = document.querySelector('.recorder-section');
        if (recorderSection) {
            recorderSection.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start' 
            });
        }
    }
    
    // Play demo
    playDemo() {
        // Create demo modal with sample audio previews
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.id = 'demoModal';
        
        modal.innerHTML = `
            <div class="modal demo-modal">
                <div class="modal-header">
                    <h2 data-i18n="demo.title">Voice Transformation Demo</h2>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="modal-body">
                    <div class="demo-content">
                        <p data-i18n="demo.description">Listen to these sample voice transformations:</p>
                        
                        <div class="demo-samples">
                            <div class="demo-sample">
                                <h4><i class="fas fa-microphone"></i> Original Voice</h4>
                                <div class="demo-player">
                                    <button class="demo-play-btn" onclick="this.nextElementSibling.play()">
                                        <i class="fas fa-play"></i> Play Original
                                    </button>
                                    <audio controls style="width: 100%; margin-top: 0.5rem;">
                                        <source src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAECAD0SAAA+EgAAAgAQAGRhdGE" type="audio/wav">
                                        Sample audio not available
                                    </audio>
                                </div>
                            </div>
                            
                            <div class="demo-sample">
                                <h4><i class="fas fa-robot"></i> Robot Voice</h4>
                                <div class="demo-player">
                                    <button class="demo-play-btn" onclick="this.nextElementSibling.play()">
                                        <i class="fas fa-play"></i> Play Robot
                                    </button>
                                    <audio controls style="width: 100%; margin-top: 0.5rem;">
                                        <source src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAECAD0SAAA+EgAAAgAQAGRhdGE" type="audio/wav">
                                        Sample audio not available
                                    </audio>
                                </div>
                            </div>
                            
                            <div class="demo-sample">
                                <h4><i class="fas fa-laugh-squint"></i> Chipmunk Voice</h4>
                                <div class="demo-player">
                                    <button class="demo-play-btn" onclick="this.nextElementSibling.play()">
                                        <i class="fas fa-play"></i> Play Chipmunk
                                    </button>
                                    <audio controls style="width: 100%; margin-top: 0.5rem;">
                                        <source src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAECAD0SAAA+EgAAAgAQAGRhdGE" type="audio/wav">
                                        Sample audio not available
                                    </audio>
                                </div>
                            </div>
                            
                            <div class="demo-sample">
                                <h4><i class="fas fa-volume-down"></i> Deep Voice</h4>
                                <div class="demo-player">
                                    <button class="demo-play-btn" onclick="this.nextElementSibling.play()">
                                        <i class="fas fa-play"></i> Play Deep Voice
                                    </button>
                                    <audio controls style="width: 100%; margin-top: 0.5rem;">
                                        <source src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAECAD0SAAA+EgAAAgAQAGRhdGE" type="audio/wav">
                                        Sample audio not available
                                    </audio>
                                </div>
                            </div>
                        </div>
                        
                        <div class="demo-cta">
                            <p data-i18n="demo.try_now">Ready to transform your own voice?</p>
                            <button class="demo-start-btn" onclick="this.closest('.modal-overlay').remove(); window.voiceMorphApp.scrollToRecorder();">
                                <i class="fas fa-microphone"></i>
                                <span data-i18n="demo.start_recording">Start Recording Now</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Close modal when clicking outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
        
        // Update translations if i18n is available
        if (window.i18n) {
            window.i18n.updateDOM();
        }
    }

    showMessage(message, type = 'info') {
        // Simple toast notification
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--primary-color);
            color: white;
            padding: 1rem 1.5rem;
            border-radius: var(--border-radius);
            z-index: 10000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            box-shadow: 0 4px 12px var(--shadow-lg);
        `;
        
        document.body.appendChild(toast);
        
        // Animate in
        requestAnimationFrame(() => {
            toast.style.transform = 'translateX(0)';
        });
        
        // Remove after 3 seconds
        setTimeout(() => {
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }

    showError(message) {
        this.showMessage(message, 'error');
        console.error(message);
    }

    showLoading(show = true) {
        if (this.elements.loadingOverlay) {
            this.elements.loadingOverlay.style.display = show ? 'flex' : 'none';
        }
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.voiceMorphApp = new VoiceMorphApp();
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (window.voiceMorphApp?.audioManager) {
        window.voiceMorphApp.audioManager.cleanup();
    }
});
