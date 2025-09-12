// Audio Module - Handles recording, playback, and visualization
class AudioManager {
    constructor() {
        this.mediaRecorder = null;
        this.audioStream = null;
        this.audioContext = null;
        this.analyser = null;
        this.recordedChunks = [];
        this.recordedBlob = null;
        this.isRecording = false;
        this.visualizerData = null;
        this.animationFrame = null;
        
        // Canvas setup
        this.canvas = null;
        this.canvasCtx = null;
        
        // Audio elements
        this.audioElement = null;
        
        this.init();
    }

    async init() {
        try {
            // Initialize canvas
            this.canvas = document.getElementById('visualizerCanvas');
            this.canvasCtx = this.canvas?.getContext('2d');
            
            if (this.canvas) {
                this.resizeCanvas();
                window.addEventListener('resize', () => this.resizeCanvas());
                this.drawIdleState();
            }
            
        } catch (error) {
            console.error('AudioManager initialization error:', error);
        }
    }

    resizeCanvas() {
        if (!this.canvas) return;
        
        const rect = this.canvas.parentElement.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
    }

    async requestMicrophoneAccess() {
        try {
            this.audioStream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true,
                    sampleRate: 44100
                }
            });
            
            // Setup audio context for visualization
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = 256;
            
            const source = this.audioContext.createMediaStreamSource(this.audioStream);
            source.connect(this.analyser);
            
            return true;
        } catch (error) {
            console.error('Microphone access error:', error);
            throw new Error(window.i18n?.translate('messages.error_no_microphone') || 'Microphone access denied');
        }
    }

    async startRecording() {
        try {
            if (!this.audioStream) {
                await this.requestMicrophoneAccess();
            }

            this.recordedChunks = [];
            
            // Setup MediaRecorder
            const options = {
                mimeType: this.getSupportedMimeType(),
                audioBitsPerSecond: 128000
            };
            
            this.mediaRecorder = new MediaRecorder(this.audioStream, options);
            
            this.mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    this.recordedChunks.push(event.data);
                }
            };

            this.mediaRecorder.onstop = () => {
                this.recordedBlob = new Blob(this.recordedChunks, {
                    type: this.getSupportedMimeType()
                });
                this.onRecordingComplete();
            };

            this.mediaRecorder.start(100); // Collect data every 100ms
            this.isRecording = true;
            this.startVisualization();
            
            return true;
        } catch (error) {
            console.error('Recording start error:', error);
            throw error;
        }
    }

    stopRecording() {
        if (this.mediaRecorder && this.isRecording) {
            this.mediaRecorder.stop();
            this.isRecording = false;
            this.stopVisualization();
        }
    }

    getSupportedMimeType() {
        const types = [
            'audio/webm;codecs=opus',
            'audio/webm',
            'audio/mp4',
            'audio/wav'
        ];
        
        return types.find(type => MediaRecorder.isTypeSupported(type)) || 'audio/webm';
    }

    playRecordedAudio() {
        if (!this.recordedBlob) return;

        if (this.audioElement) {
            this.audioElement.pause();
            this.audioElement = null;
        }

        this.audioElement = new Audio();
        this.audioElement.src = URL.createObjectURL(this.recordedBlob);
        this.audioElement.controls = false;
        
        this.audioElement.addEventListener('ended', () => {
            this.onPlaybackComplete();
        });
        
        this.audioElement.play();
    }

    stopPlayback() {
        if (this.audioElement) {
            this.audioElement.pause();
            this.audioElement.currentTime = 0;
        }
    }

    // Visualization methods
    startVisualization() {
        if (!this.analyser || !this.canvas) return;
        
        this.visualizerData = new Uint8Array(this.analyser.frequencyBinCount);
        this.drawVisualization();
    }

    stopVisualization() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }
        this.drawIdleState();
    }

    drawVisualization() {
        if (!this.analyser || !this.canvasCtx || !this.visualizerData) return;

        this.animationFrame = requestAnimationFrame(() => this.drawVisualization());
        
        this.analyser.getByteFrequencyData(this.visualizerData);
        
        const { width, height } = this.canvas;
        const centerY = height / 2;
        
        // Clear canvas
        this.canvasCtx.clearRect(0, 0, width, height);
        
        // Draw waveform
        const barCount = 64;
        const barWidth = width / barCount;
        const maxBarHeight = height * 0.8;
        
        // Create gradient
        const gradient = this.canvasCtx.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, '#667eea');
        gradient.addColorStop(0.5, '#764ba2');
        gradient.addColorStop(1, '#f093fb');
        
        this.canvasCtx.fillStyle = gradient;
        
        for (let i = 0; i < barCount; i++) {
            const dataIndex = Math.floor(i * (this.visualizerData.length / barCount));
            const amplitude = this.visualizerData[dataIndex] / 255;
            const barHeight = amplitude * maxBarHeight;
            
            const x = i * barWidth;
            const y = centerY - barHeight / 2;
            
            this.canvasCtx.fillRect(x, y, barWidth - 2, barHeight);
        }
    }

    drawIdleState() {
        if (!this.canvasCtx || !this.canvas) return;
        
        const { width, height } = this.canvas;
        const centerY = height / 2;
        
        this.canvasCtx.clearRect(0, 0, width, height);
        
        // Draw idle waveform
        this.canvasCtx.strokeStyle = '#e5e7eb';
        this.canvasCtx.lineWidth = 2;
        this.canvasCtx.beginPath();
        
        const segments = 50;
        const segmentWidth = width / segments;
        
        for (let i = 0; i <= segments; i++) {
            const x = i * segmentWidth;
            const amplitude = Math.sin(i * 0.3) * 10;
            const y = centerY + amplitude;
            
            if (i === 0) {
                this.canvasCtx.moveTo(x, y);
            } else {
                this.canvasCtx.lineTo(x, y);
            }
        }
        
        this.canvasCtx.stroke();
        
        // Add microphone icon
        this.drawMicrophoneIcon(width / 2, centerY);
    }

    drawMicrophoneIcon(x, y) {
        if (!this.canvasCtx) return;
        
        this.canvasCtx.fillStyle = '#9ca3af';
        this.canvasCtx.font = '24px FontAwesome';
        this.canvasCtx.textAlign = 'center';
        this.canvasCtx.textBaseline = 'middle';
        this.canvasCtx.fillText('🎤', x, y);
    }

    // File upload handling
    handleFileUpload(file) {
        return new Promise((resolve, reject) => {
            if (!file) {
                reject(new Error('No file provided'));
                return;
            }

            // Validate file type
            const validTypes = ['audio/wav', 'audio/mp3', 'audio/mpeg', 'audio/webm', 'audio/ogg'];
            if (!validTypes.includes(file.type)) {
                reject(new Error('Invalid file type. Please upload an audio file.'));
                return;
            }

            // Validate file size (10MB)
            const maxSize = 10 * 1024 * 1024;
            if (file.size > maxSize) {
                reject(new Error('File too large. Maximum size is 10MB.'));
                return;
            }

            this.recordedBlob = file;
            resolve(file);
        });
    }

    // Get recorded audio as FormData
    getRecordedAudioFormData() {
        if (!this.recordedBlob) return null;

        const formData = new FormData();
        formData.append('audio', this.recordedBlob, 'recording.webm');
        
        return formData;
    }

    // Download processed audio
    downloadAudio(audioUrl, filename = 'voice_morph_result.wav') {
        const link = document.createElement('a');
        link.href = audioUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    // Cleanup methods
    cleanup() {
        this.stopRecording();
        this.stopPlayback();
        this.stopVisualization();
        
        if (this.audioStream) {
            this.audioStream.getTracks().forEach(track => track.stop());
            this.audioStream = null;
        }
        
        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }
        
        if (this.audioElement) {
            this.audioElement.pause();
            URL.revokeObjectURL(this.audioElement.src);
            this.audioElement = null;
        }
        
        if (this.recordedBlob) {
            URL.revokeObjectURL(URL.createObjectURL(this.recordedBlob));
            this.recordedBlob = null;
        }
    }

    // Event callbacks (to be overridden by app)
    onRecordingComplete() {
        console.log('Recording completed');
    }

    onPlaybackComplete() {
        console.log('Playback completed');
    }
}

// Export for use in other modules
window.AudioManager = AudioManager;
