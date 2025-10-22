const ffmpeg = require('fluent-ffmpeg');
const ffmpegStatic = require('ffmpeg-static');
const ffprobeStatic = require('ffprobe-static');
const path = require('path');
const fs = require('fs');

// Set FFmpeg and FFprobe paths (with error handling for serverless)
try {
  ffmpeg.setFfmpegPath(ffmpegStatic);
  ffmpeg.setFfprobePath(ffprobeStatic.path);
} catch (error) {
  console.warn('FFmpeg setup failed (serverless environment):', error.message);
}

class AudioProcessor {
  constructor() {
    // 优化后的音频效果滤镜链
    this.effects = {
      robot: {
        name: 'Robot Voice',
        description: 'Transform voice into robotic sound',
        icon: 'fas fa-robot',
        filters: [ 
          'aresample=8000',       // 降低采样率模拟机器人声音
          'vibrato=f=30:d=0.5',  // 添加颤音效果
          'aresample=44100'       // 恢复标准采样率
        ]
      },
      chipmunk: {
        name: 'Chipmunk Voice',
        description: 'High-pitched cartoon-like voice',
        icon: 'fas fa-laugh-squint',
        filters: [ 
          'atempo=1.5'  // 使用单一变速参数，避免冲突
        ]
      },
      deep: {
        name: 'Deep Voice',
        description: 'Lower and deeper voice tone',
        icon: 'fas fa-volume-down',
        filters: [ 
          'atempo=0.8'  // 使用单一变速参数，避免冲突
        ]
      },
      echo: {
        name: 'Echo Effect',
        description: 'Add echo and reverb to voice',
        icon: 'fas fa-broadcast-tower',
        filters: [ 
          'aecho=0.8:0.88:60:0.4'  // 标准回声参数
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
          'highpass=f=300',    // 高通滤波保留中高频
          'lowpass=f=3000',    // 低通滤波模拟电话频段
          'volume=1.2'         // 适当提升音量
        ]
      },
      alien: {
        name: 'Alien Voice',
        description: 'Otherworldly voice effect',
        icon: 'fas fa-user-astronaut',
        filters: [ 
          'atempo=1.2',                // 轻微加速
          'tremolo=f=20:d=0.5',        // 颤音效果
          'chorus=0.7:0.9:55:0.4:0.25:2' // 合唱效果增强空间感
        ]
      },
      monster: {
        name: 'Monster Voice',
        description: 'Scary monster voice',
        icon: 'fas fa-dragon',
        filters: [ 
          'atempo=0.7',         // 降低速度
          'vibrato=f=10:d=0.8'  // 低频颤音
        ]
      },
      whisper: {
        name: 'Whisper Effect',
        description: 'Soft whisper-like voice',
        icon: 'fas fa-comment',
        filters: [ 
          'highpass=f=1000',    // 高通滤波模拟耳语
          'lowpass=f=4000', 
          'volume=0.3'          // 降低音量
        ]
      },
      radio: {
        name: 'Radio Voice',
        description: 'Old radio broadcast effect',
        icon: 'fas fa-radio',
        filters: [ 
          'highpass=f=500',     // 模拟收音机频段
          'lowpass=f=2000',
          'volume=1.5',
          'tremolo=f=6:d=0.3'   // 轻微颤抖模拟信号不稳
        ]
      }
    };
  }

  getAvailableEffects() {
    return this.effects;
  }

  async processAudio(inputPath, outputPath, effectType, options = {}) {
    return new Promise(async (resolve, reject) => {
      // 检查serverless环境
      if (process.env.NODE_ENV === 'production' && process.env.VERCEL) {
        reject(new Error('Audio processing not available in serverless environment. Please use local deployment for full functionality.'));
        return;
      }

      const effect = this.effects[effectType];
      if (!effect) {
        reject(new Error(`Unknown effect type: ${effectType}`));
        return;
      }

      // 检查输入文件
      if (!fs.existsSync(inputPath)) {
        reject(new Error('Input file does not exist'));
        return;
      }

      // 获取音频信息用于安全计算
      let audioInfo;
      try {
        audioInfo = await this.getAudioInfo(inputPath);
      } catch (err) {
        reject(new Error(`Failed to get audio info: ${err.message}`));
        return;
      }

      // 安全计算淡入淡出时间
      const safeDuration = Math.max(audioInfo.duration || 0, 0.2); // 确保最小0.2秒
      const fadeOutStart = Math.max(safeDuration - 0.1, 0); // 防止负数

      let command = ffmpeg(inputPath)
        .format('wav')
        .audioFrequency(44100)
        .audioChannels(1)
        .audioBitrate('128k');

      // 应用效果滤镜
      if (effect.filters && effect.filters.length > 0) {
        const filterString = effect.filters.join(',');
        command = command.audioFilters(filterString);
      }

      // 应用安全的淡入淡出效果
      command = command.audioFilters([
        'afade=t=in:ss=0:d=0.1',          // 淡入0.1秒
        `afade=t=out:st=${fadeOutStart}:d=0.1`  // 安全计算淡出开始时间
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
          resolve({ outputPath, effectType, effectName: effect.name });
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

  cleanupFile(filePath) {
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
        console.log(`🗑️ Cleaned up file: ${filePath}`);
      } catch (err) {
        console.error(`Error cleaning up file ${filePath}:`, err);
      }
    }
  }

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