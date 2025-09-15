const ffmpeg = require('fluent-ffmpeg');
const ffmpegStatic = require('ffmpeg-static');
const ffprobeStatic = require('ffprobe-static');
const path = require('path');
const fs = require('fs');

// Set FFmpeg and FFprobe paths
ffmpeg.setFfmpegPath(ffmpegStatic);
ffmpeg.setFfprobePath(ffprobeStatic.path);

class AudioProcessor {
    constructor() {
        // Enhanced voice effects with real FFmpeg parameters
        this.effects = {
            robot: {
                name: 'Robot Voice',
                description: 'Transform voice into robotic sound',
                icon: 'fas fa-robot',
                filters: [
                    'aresample=8000',
                    'aformat=sample_rates=8000',
                    'aresample=44100',
                    'vibrato=f=30:d=0.5'
                ]
            },
            chipmunk: {
                name: 'Chipmunk Voice',
                description: 'High-pitched cartoon-like voice',
                icon: 'fas fa-laugh-squint',
                filters: [
                    'asetrate=44100*1.8',
                    'aresample=44100',
                    'atempo=0.8'
                ]
            },
            deep: {
                name: 'Deep Voice',
                description: 'Lower and deeper voice tone',
                icon: 'fas fa-volume-down',
                filters: [
                    'asetrate=44100*0.7',
                    'aresample=44100',
                    'atempo=1.3'
                ]
            },
            echo: {
                name: 'Echo Effect',
                description: 'Add echo and reverb to voice',
                icon: 'fas fa-broadcast-tower',
                filters: [
                    'aecho=0.8:0.88:60:0.4'
                ]
            },
            reverse: {
                name: 'Reverse Audio',
                description: 'Play audio in reverse',
                icon: 'fas fa-backward',
                filters: [
                    'areverse'
                ]
            },
            phone: {
                name: 'Phone Call',
                description: 'Simulate phone call quality',
                icon: 'fas fa-phone',
                filters: [
                    'highpass=f=300',
                    'lowpass=f=3000',
                    'volume=1.2'
                ]
            },
            alien: {
                name: 'Alien Voice',
                description: 'Otherworldly voice effect',
                icon: 'fas fa-user-astronaut',
                filters: [
                    'asetrate=44100*1.2',
                    'aresample=44100',
                    'tremolo=f=20:d=0.5',
                    'chorus=0.7:0.9:55:0.4:0.25:2'
                ]
            },
            monster: {
                name: 'Monster Voice',
                description: 'Scary monster voice',
                icon: 'fas fa-dragon',
                filters: [
                    'asetrate=44100*0.5',
                    'aresample=44100',
                    'atempo=1.8',
                    'vibrato=f=10:d=0.8'
                ]
            },
            whisper: {
                name: 'Whisper Effect',
                description: 'Soft whisper-like voice',
                icon: 'fas fa-comment',
                filters: [
                    'volume=0.3',
                    'highpass=f=1000',
                    'lowpass=f=4000'
                ]
            },
            radio: {
                name: 'Radio Voice',
                description: 'Old radio broadcast effect',
                icon: 'fas fa-radio',
                filters: [
                    'highpass=f=500',
                    'lowpass=f=2000',
                    'volume=1.5',
                    'tremolo=f=6:d=0.3'
                ]
            }
        };
    }

    getAvailableEffects() {
        return this.effects;
    }

    async processAudio(inputPath, outputPath, effectType, options = {}) {
        return new Promise((resolve, reject) => {
            const effect = this.effects[effectType];
            if (!effect) {
                reject(new Error(`Unknown effect type: ${effectType}`));
                return;
            }

            // Check if input file exists
            if (!fs.existsSync(inputPath)) {
                reject(new Error('Input file does not exist'));
                return;
            }

            let command = ffmpeg(inputPath)
                .format('wav')
                .audioFrequency(44100)
                .audioChannels(1)
                .audioBitrate('128k');

            // Apply effect filters
            if (effect.filters && effect.filters.length > 0) {
                const filterString = effect.filters.join(',');
                command = command.audioFilters(filterString);
            }

            // Add fade in/out for smooth audio
            command = command.audioFilters([
                'afade=t=in:ss=0:d=0.1',
                'afade=t=out:st=' + (options.duration - 0.1 || 10) + ':d=0.1'
            ]);

            command
                .on('start', (commandLine) => {
                    console.log('🎵 Processing audio with command:', commandLine);
                })
                .on('progress', (progress) => {
                    console.log(`🎵 Processing progress: ${progress.percent?.toFixed(2) || 0}%`);
                })
                .on('end', () => {
                    console.log('✅ Audio processing completed');
                    resolve({
                        outputPath,
                        effectType,
                        effectName: effect.name
                    });
                })
                .on('error', (err) => {
                    console.error('❌ Audio processing error:', err);
                    reject(err);
                })
                .save(outputPath);
        });
    }

    async getAudioInfo(filePath) {
        return new Promise((resolve, reject) => {
            ffmpeg.ffprobe(filePath, (err, metadata) => {
                if (err) {
                    reject(err);
                    return;
                }

                const audioStream = metadata.streams.find(s => s.codec_type === 'audio');
                if (!audioStream) {
                    reject(new Error('No audio stream found'));
                    return;
                }

                resolve({
                    duration: parseFloat(metadata.format.duration || 0),
                    size: parseInt(metadata.format.size || 0),
                    bitrate: parseInt(audioStream.bit_rate || 0),
                    sampleRate: parseInt(audioStream.sample_rate || 44100),
                    channels: parseInt(audioStream.channels || 1),
                    codec: audioStream.codec_name || 'unknown'
                });
            });
        });
    }

    async normalizeAudio(inputPath, outputPath) {
        return new Promise((resolve, reject) => {
            ffmpeg(inputPath)
                .audioFilters('loudnorm')
                .format('wav')
                .on('end', () => resolve(outputPath))
                .on('error', reject)
                .save(outputPath);
        });
    }

    async convertToMp3(inputPath, outputPath, quality = 192) {
        return new Promise((resolve, reject) => {
            ffmpeg(inputPath)
                .format('mp3')
                .audioBitrate(quality)
                .on('end', () => resolve(outputPath))
                .on('error', reject)
                .save(outputPath);
        });
    }

    // Clean up temporary files
    cleanupFile(filePath) {
        if (fs.existsSync(filePath)) {
            try {
                fs.unlinkSync(filePath);
                console.log(`🗑️  Cleaned up file: ${filePath}`);
            } catch (err) {
                console.error(`Error cleaning up file ${filePath}:`, err);
            }
        }
    }

    // Generate audio waveform data for visualization
    async generateWaveform(filePath) {
        return new Promise((resolve, reject) => {
            ffmpeg(filePath)
                .format('null')
                .audioFilters('showwavespic=s=800x200:colors=0x667eea')
                .on('end', () => resolve('Waveform generated'))
                .on('error', reject)
                .save('-');
        });
    }

    // Batch process multiple files
    async batchProcess(files, effectType, outputDir) {
        const results = [];
        
        for (const file of files) {
            try {
                const outputPath = path.join(outputDir, `processed_${path.basename(file)}`);
                const result = await this.processAudio(file, outputPath, effectType);
                results.push({ success: true, file, result });
            } catch (error) {
                results.push({ success: false, file, error: error.message });
            }
        }
        
        return results;
    }
}

module.exports = AudioProcessor;
