// Internationalization (i18n) Module
class I18n {
    constructor() {
        this.currentLang = localStorage.getItem('language') || 'en';
        this.translations = {};
        this.loadTranslations();
    }

    loadTranslations() {
        this.translations = {
            en: {
                title: "Voice Morph - AI Voice Transformation",
                brand: "VoiceMorph",
                
                // Hero section
                'hero.powered': "Powered by Advanced AI",
                'hero.title': "Transform Your Voice Instantly",
                'hero.subtitle': "Convert any voice to any voice with our cutting-edge AI technology. Upload your audio, choose your target voice, and get professional results in seconds.",
                'hero.start': "Start Converting Now",
                'hero.demo': "Watch Demo",
                'hero.free_trial': "Free trial available",
                'hero.instant': "Instant results",
                'hero.secure': "Secure processing",
                
                // Recorder section
                'recorder.title': "Voice Recorder",
                'recorder.ready': "Ready to record",
                'recorder.recording': "Recording...",
                'recorder.start': "Start Recording",
                'recorder.stop': "Stop",
                'recorder.play': "Play",
                
                // Upload section
                'upload.or': "OR",
                'upload.button': "Upload Audio File",
                'upload.info': "Max 10MB • MP3, WAV, WEBM supported",
                
                // Effects section
                'effects.title': "Choose Voice Effect",
                
                // Processing section
                'processing.title': "Transforming Your Voice...",
                'processing.subtitle': "Please wait while we apply the voice effect",
                
                // Results section
                'results.title': "Transformation Complete!",
                'results.no_support': "Your browser doesn't support audio playback.",
                'results.download': "Download",
                'results.share': "Share",
                'results.new': "New Recording",
                
                // Footer
                'footer.copyright': "© 2024 VoiceMorph. All rights reserved.",
                
                // Loading
                'loading.text': "Loading...",
                
                // Messages
                'messages.recording_started': "Recording started",
                'messages.recording_stopped': "Recording stopped",
                'messages.processing_started': "Processing audio...",
                'messages.processing_complete': "Processing complete!",
                'messages.error_no_microphone': "Microphone access denied or not available",
                'messages.error_upload_failed': "Upload failed. Please try again.",
                'messages.error_processing_failed': "Processing failed. Please try again.",
                'messages.success_download': "File ready for download",
                'messages.login_success': "Login successful!",
                'messages.register_success': "Registration successful!",
                'messages.logout_success': "Logged out successfully",
                
                // Authentication
                'auth.login': "Login",
                'auth.register': "Register",
                'auth.logout': "Logout",
                'auth.email': "Email",
                'auth.password': "Password",
                'auth.username': "Username",
                'auth.confirm_password': "Confirm Password",
                'auth.no_account': "Don't have an account?",
                'auth.have_account': "Already have an account?",
                'auth.username_placeholder': "e.g. john_doe123",
                'auth.email_placeholder': "your@email.com",
                'auth.password_placeholder': "••••••••",
                'auth.username_hint': "3-20 characters, letters, numbers and underscores only",
                'auth.password_hint': "At least 6 characters",
                'auth.confirm_hint': "Repeat your password",
                
                // User menu
                'user.dashboard': "Dashboard",
                'user.profile': "Profile",
                'user.logout': "Logout",
                
                // Dashboard
                'dashboard.title': "My Recordings",
                'dashboard.no_recordings': "No recordings yet",
                'dashboard.create_first': "Create your first voice transformation!",
                
                // Share
                'share.title': "Share Recording",
                'share.description': "Share your voice transformation with others!",
                
                // Effect names (will be overridden by server data)
                'effects.robot': "Robot Voice",
                'effects.chipmunk': "Chipmunk",
                'effects.deep': "Deep Voice",
                'effects.echo': "Echo Effect",
                'effects.reverse': "Reverse Audio",
                
                // How It Works
                'how.title': "How It Works",
                'how.subtitle': "Convert your voice in three simple steps",
                'how.step1.title': "Upload Audio",
                'how.step1.desc': "Upload your audio file or record directly using your microphone. We support all major audio formats.",
                'how.step2.title': "Choose Voice",
                'how.step2.desc': "Select from our library of premium voices or upload a sample to create a custom voice profile.",
                'how.step3.title': "Download Result",
                'how.step3.desc': "Get your converted audio in seconds. Download in your preferred format with studio-quality results.",
                
                // Why Choose
                'why.title': "Why Choose VoiceMorph?",
                'why.subtitle': "Industry-leading voice conversion technology with unmatched quality",
                'features.speed.title': "Lightning Fast",
                'features.speed.desc': "Convert your voice in seconds with our advanced AI technology",
                'features.security.title': "Secure & Private",
                'features.security.desc': "Your audio files are processed securely and never stored permanently",
                'features.languages.title': "Multiple Languages",
                'features.languages.desc': "Support for over 50 languages and dialects worldwide",
                'features.quality.title': "Studio Quality",
                'features.quality.desc': "Professional-grade audio output with crystal clear results",
                
                // Pricing
                'pricing.title': "Simple, Transparent Pricing",
                'pricing.subtitle': "Choose the plan that fits your needs",
                'pricing.period': "/month",
                'pricing.get_started': "Get Started",
                'pricing.most_popular': "Most Popular",
                'pricing.starter.name': "Starter",
                'pricing.starter.f1': "10 voice conversions per month",
                'pricing.starter.f2': "Basic voice options",
                'pricing.starter.f3': "Standard quality output",
                'pricing.starter.f4': "Email support",
                'pricing.pro.name': "Professional",
                'pricing.pro.f1': "100 voice conversions per month",
                'pricing.pro.f2': "Premium voice library",
                'pricing.pro.f3': "HD quality output",
                'pricing.pro.f4': "Priority support",
                'pricing.pro.f5': "API access",
                'pricing.enterprise.name': "Enterprise",
                'pricing.enterprise.f1': "Unlimited conversions",
                'pricing.enterprise.f2': "Custom voice training",
                'pricing.enterprise.f3': "Ultra HD quality",
                'pricing.enterprise.f4': "24/7 dedicated support",
                'pricing.enterprise.f5': "Full API access",
                'pricing.enterprise.f6': "Custom integrations",
                
                // CTA
                'cta.title': "Ready to Transform Your Voice?",
                'cta.subtitle': "Join thousands of creators, businesses, and individuals who trust VoiceMorph for their voice conversion needs.",
                'cta.start': "Start Converting Now",
                'cta.rating': "4.9/5 from 2,000+ users",
                
                // Footer
                'footer.description': "Advanced AI-powered voice conversion technology that transforms your audio with professional quality results.",
                'footer.product': "Product",
                'footer.voice_conversion': "Voice Conversion",
                'footer.api_access': "API Access",
                'footer.pricing': "Pricing",
                'footer.support': "Support",
                'footer.documentation': "Documentation",
                'footer.contact': "Contact Us",
                'footer.privacy': "Privacy Policy",
                'footer.terms': "T&C",
                'footer.refund': "Return & Refund Policy",
                
                // Demo
                'demo.title': "Voice Transformation Demo",
                'demo.description': "Listen to these sample voice transformations:",
                'demo.try_now': "Ready to transform your own voice?",
                'demo.start_recording': "Start Recording Now"
            },
            
            zh: {
                title: "变声器 - AI语音变换",
                brand: "变声器",
                
                // Hero section
                'hero.powered': "由先进AI驱动",
                'hero.title': "立即变换您的声音",
                'hero.subtitle': "使用我们尖端的AI技术，将任何声音转换为任何声音。上传您的音频，选择目标声音，几秒钟内获得专业级结果。",
                'hero.start': "立即开始转换",
                'hero.demo': "观看演示",
                'hero.free_trial': "免费试用",
                'hero.instant': "即时结果",
                'hero.secure': "安全处理",
                
                // Recorder section
                'recorder.title': "语音录制器",
                'recorder.ready': "准备录制",
                'recorder.recording': "录制中...",
                'recorder.start': "开始录制",
                'recorder.stop': "停止",
                'recorder.play': "播放",
                
                // Upload section
                'upload.or': "或者",
                'upload.button': "上传音频文件",
                'upload.info': "最大10MB • 支持MP3, WAV, WEBM格式",
                
                // Effects section
                'effects.title': "选择语音效果",
                
                // Processing section
                'processing.title': "正在变换您的声音...",
                'processing.subtitle': "请稍候，我们正在应用语音效果",
                
                // Results section
                'results.title': "变换完成！",
                'results.no_support': "您的浏览器不支持音频播放。",
                'results.download': "下载",
                'results.share': "分享",
                'results.new': "新录音",
                
                // Footer
                'footer.copyright': "© 2024 变声器。保留所有权利。",
                
                // Loading
                'loading.text': "加载中...",
                
                // Authentication
                'auth.login': "登录",
                'auth.register': "注册",
                'auth.logout': "登出",
                'auth.email': "邮箱",
                'auth.password': "密码",
                'auth.username': "用户名",
                'auth.confirm_password': "确认密码",
                'auth.no_account': "还没有账号？",
                'auth.have_account': "已经有账号？",
                'auth.username_placeholder': "例如: zhang_san123",
                'auth.email_placeholder': "您的邮箱@example.com",
                'auth.password_placeholder': "••••••••",
                'auth.username_hint': "3-20个字符，只能包含字母、数字和下划线",
                'auth.password_hint': "至少6个字符",
                'auth.confirm_hint': "重复您的密码",
                
                // User menu
                'user.dashboard': "个人中心",
                'user.profile': "个人资料",
                'user.logout': "退出登录",
                
                // Dashboard
                'dashboard.title': "我的录音",
                'dashboard.no_recordings': "还没有录音",
                'dashboard.create_first': "创建您的第一个声音变换！",
                
                // Share
                'share.title': "分享录音",
                'share.description': "与他人分享您的声音变换！",
                
                // Messages
                'messages.recording_started': "开始录制",
                'messages.recording_stopped': "停止录制",
                'messages.processing_started': "处理音频中...",
                'messages.processing_complete': "处理完成！",
                'messages.error_no_microphone': "麦克风访问被拒绝或不可用",
                'messages.error_upload_failed': "上传失败，请重试。",
                'messages.error_processing_failed': "处理失败，请重试。",
                'messages.success_download': "文件已准备好下载",
                'messages.login_success': "登录成功！",
                'messages.register_success': "注册成功！",
                'messages.logout_success': "已成功退出登录",
                
                // Effect names
                'effects.robot': "机器人声音",
                'effects.chipmunk': "花栗鼠声音",
                'effects.deep': "低沉声音",
                'effects.echo': "回声效果",
                'effects.reverse': "倒放音频",
                
                // How It Works
                'how.title': "工作原理",
                'how.subtitle': "三个简单步骤转换您的声音",
                'how.step1.title': "上传音频",
                'how.step1.desc': "上传您的音频文件或直接使用麦克风录制。我们支持所有主要音频格式。",
                'how.step2.title': "选择声音",
                'how.step2.desc': "从我们的优质语音库中选择，或上传样本创建自定义语音配置文件。",
                'how.step3.title': "下载结果",
                'how.step3.desc': "几秒钟内获得转换后的音频。以您首选的格式下载，获得录音室品质的结果。",
                
                // Why Choose
                'why.title': "为什么选择变声器？",
                'why.subtitle': "行业领先的语音转换技术，品质无与伦比",
                'features.speed.title': "闪电般快速",
                'features.speed.desc': "使用我们先进的AI技术，几秒钟内转换您的声音",
                'features.security.title': "安全和私密",
                'features.security.desc': "您的音频文件被安全处理，绝不永久存储",
                'features.languages.title': "多种语言",
                'features.languages.desc': "支持全球50多种语言和方言",
                'features.quality.title': "录音室品质",
                'features.quality.desc': "专业级音频输出，结果清晰透亮",
                
                // Pricing
                'pricing.title': "简单透明的定价",
                'pricing.subtitle': "选择适合您需求的计划",
                'pricing.period': "/月",
                'pricing.get_started': "开始使用",
                'pricing.most_popular': "最受欢迎",
                'pricing.starter.name': "入门版",
                'pricing.starter.f1': "每月10次语音转换",
                'pricing.starter.f2': "基础语音选项",
                'pricing.starter.f3': "标准品质输出",
                'pricing.starter.f4': "邮件支持",
                'pricing.pro.name': "专业版",
                'pricing.pro.f1': "每月100次语音转换",
                'pricing.pro.f2': "优质语音库",
                'pricing.pro.f3': "高清品质输出",
                'pricing.pro.f4': "优先支持",
                'pricing.pro.f5': "API访问",
                'pricing.enterprise.name': "企业版",
                'pricing.enterprise.f1': "无限转换",
                'pricing.enterprise.f2': "自定义语音训练",
                'pricing.enterprise.f3': "超高清品质",
                'pricing.enterprise.f4': "24/7专属支持",
                'pricing.enterprise.f5': "完整API访问",
                'pricing.enterprise.f6': "自定义集成",
                
                // CTA
                'cta.title': "准备好变换您的声音了吗？",
                'cta.subtitle': "加入数千名创作者、企业和个人，他们信任变声器满足其语音转换需求。",
                'cta.start': "立即开始转换",
                'cta.rating': "2000多名用户评分4.9/5",
                
                // Footer
                'footer.description': "先进的AI驱动语音转换技术，以专业品质结果转换您的音频。",
                'footer.product': "产品",
                'footer.voice_conversion': "语音转换",
                'footer.api_access': "API访问",
                'footer.pricing': "定价",
                'footer.support': "支持",
                'footer.documentation': "文档",
                'footer.contact': "联系我们",
                'footer.privacy': "隐私政策",
                'footer.terms': "条款",
                'footer.refund': "退款政策"
            },
            
            es: {
                title: "Voice Morph - Transformación de Voz IA",
                brand: "VoiceMorph",
                
                // Hero section
                'hero.powered': "Impulsado por IA Avanzada",
                'hero.title': "Transforma tu Voz Instantáneamente",
                'hero.subtitle': "Convierte cualquier voz en cualquier voz con nuestra tecnología IA de vanguardia. Sube tu audio, elige tu voz objetivo y obtén resultados profesionales en segundos.",
                'hero.start': "Comenzar Conversión Ahora",
                'hero.demo': "Ver Demo",
                'hero.free_trial': "Prueba gratuita disponible",
                'hero.instant': "Resultados instantáneos",
                'hero.secure': "Procesamiento seguro",
                
                // Recorder section
                'recorder.title': "Grabadora de Voz",
                'recorder.ready': "Listo para grabar",
                'recorder.recording': "Grabando...",
                'recorder.start': "Comenzar Grabación",
                'recorder.stop': "Detener",
                'recorder.play': "Reproducir",
                
                // Upload section
                'upload.or': "O",
                'upload.button': "Subir Archivo de Audio",
                'upload.info': "Máx 10MB • Compatible con MP3, WAV, WEBM",
                
                // Effects section
                'effects.title': "Elige Efecto de Voz",
                
                // Processing section
                'processing.title': "Transformando tu Voz...",
                'processing.subtitle': "Por favor espera mientras aplicamos el efecto de voz",
                
                // Results section
                'results.title': "¡Transformación Completa!",
                'results.no_support': "Tu navegador no soporta reproducción de audio.",
                'results.download': "Descargar",
                'results.share': "Compartir",
                'results.new': "Nueva Grabación",
                
                // Footer
                'footer.copyright': "© 2024 VoiceMorph. Todos los derechos reservados.",
                
                // Loading
                'loading.text': "Cargando...",
                
                // Messages
                'messages.recording_started': "Grabación iniciada",
                'messages.recording_stopped': "Grabación detenida",
                'messages.processing_started': "Procesando audio...",
                'messages.processing_complete': "¡Procesamiento completo!",
                'messages.error_no_microphone': "Acceso al micrófono denegado o no disponible",
                'messages.error_upload_failed': "Subida fallida. Intenta de nuevo.",
                'messages.error_processing_failed': "Procesamiento fallido. Intenta de nuevo.",
                'messages.success_download': "Archivo listo para descargar",
                'messages.login_success': "¡Inicio de sesión exitoso!",
                'messages.register_success': "¡Registro exitoso!",
                'messages.logout_success': "Sesión cerrada exitosamente",
                
                // Effect names
                'effects.robot': "Voz de Robot",
                'effects.chipmunk': "Ardilla",
                'effects.deep': "Voz Profunda",
                'effects.echo': "Efecto Eco",
                'effects.reverse': "Audio Reverso",
                
                // How It Works
                'how.title': "Cómo Funciona",
                'how.subtitle': "Convierte tu voz en tres simples pasos",
                'how.step1.title': "Subir Audio",
                'how.step1.desc': "Sube tu archivo de audio o graba directamente usando tu micrófono. Apoyamos todos los formatos de audio principales.",
                'how.step2.title': "Elegir Voz",
                'how.step2.desc': "Selecciona de nuestra biblioteca de voces premium o sube una muestra para crear un perfil de voz personalizado.",
                'how.step3.title': "Descargar Resultado",
                'how.step3.desc': "Obtén tu audio convertido en segundos. Descarga en tu formato preferido con resultados de calidad de estudio.",
                
                // Why Choose
                'why.title': "¿Por qué Elegir VoiceMorph?",
                'why.subtitle': "Tecnología de conversión de voz líder en la industria con calidad inigualable",
                'features.speed.title': "Rápido como el Rayo",
                'features.speed.desc': "Convierte tu voz en segundos con nuestra tecnología IA avanzada",
                'features.security.title': "Seguro y Privado",
                'features.security.desc': "Tus archivos de audio se procesan de forma segura y nunca se almacenan permanentemente",
                'features.languages.title': "Múltiples Idiomas",
                'features.languages.desc': "Soporte para más de 50 idiomas y dialectos en todo el mundo",
                'features.quality.title': "Calidad de Estudio",
                'features.quality.desc': "Salida de audio de grado profesional con resultados cristalinos",
                
                // Pricing
                'pricing.title': "Precios Simples y Transparentes",
                'pricing.subtitle': "Elige el plan que se adapte a tus necesidades",
                'pricing.period': "/mes",
                'pricing.get_started': "Comenzar",
                'pricing.most_popular': "Más Popular",
                'pricing.starter.name': "Inicial",
                'pricing.starter.f1': "10 conversiones de voz por mes",
                'pricing.starter.f2': "Opciones básicas de voz",
                'pricing.starter.f3': "Salida de calidad estándar",
                'pricing.starter.f4': "Soporte por email",
                'pricing.pro.name': "Profesional",
                'pricing.pro.f1': "100 conversiones de voz por mes",
                'pricing.pro.f2': "Biblioteca de voces premium",
                'pricing.pro.f3': "Salida de calidad HD",
                'pricing.pro.f4': "Soporte prioritario",
                'pricing.pro.f5': "Acceso API",
                'pricing.enterprise.name': "Empresarial",
                'pricing.enterprise.f1': "Conversiones ilimitadas",
                'pricing.enterprise.f2': "Entrenamiento de voz personalizado",
                'pricing.enterprise.f3': "Calidad Ultra HD",
                'pricing.enterprise.f4': "Soporte dedicado 24/7",
                'pricing.enterprise.f5': "Acceso completo API",
                'pricing.enterprise.f6': "Integraciones personalizadas",
                
                // CTA
                'cta.title': "¿Listo para Transformar tu Voz?",
                'cta.subtitle': "Únete a miles de creadores, empresas e individuos que confían en VoiceMorph para sus necesidades de conversión de voz.",
                'cta.start': "Comenzar Conversión Ahora",
                'cta.rating': "4.9/5 de más de 2,000 usuarios",
                
                // Footer
                'footer.description': "Tecnología avanzada de conversión de voz impulsada por IA que transforma tu audio con resultados de calidad profesional.",
                'footer.product': "Producto",
                'footer.voice_conversion': "Conversión de Voz",
                'footer.api_access': "Acceso API",
                'footer.pricing': "Precios",
                'footer.support': "Soporte",
                'footer.documentation': "Documentación",
                'footer.contact': "Contactanos",
                'footer.privacy': "Política de Privacidad",
                'footer.terms': "Términos",
                'footer.refund': "Política de Reembolso"
            }
        };
    }

    setLanguage(lang) {
        if (this.translations[lang]) {
            this.currentLang = lang;
            localStorage.setItem('language', lang);
            this.updateDOM();
            
            // Update HTML lang attribute
            document.documentElement.lang = lang;
            
            // Dispatch language change event
            window.dispatchEvent(new CustomEvent('languageChanged', {
                detail: { language: lang }
            }));
        }
    }

    translate(key, params = {}) {
        let translation = this.translations[this.currentLang]?.[key] || 
                         this.translations['en']?.[key] || 
                         key;
        
        // Replace parameters in translation
        Object.keys(params).forEach(param => {
            translation = translation.replace(`{${param}}`, params[param]);
        });
        
        return translation;
    }

    updateDOM() {
        // Update all elements with data-i18n attribute
        const elements = document.querySelectorAll('[data-i18n]');
        elements.forEach(element => {
            const key = element.getAttribute('data-i18n');
            element.textContent = this.translate(key);
        });

        // Update placeholders
        const placeholderElements = document.querySelectorAll('[data-i18n-placeholder]');
        placeholderElements.forEach(element => {
            const key = element.getAttribute('data-i18n-placeholder');
            element.placeholder = this.translate(key);
        });

        // Update title attributes
        const titleElements = document.querySelectorAll('[data-i18n-title]');
        titleElements.forEach(element => {
            const key = element.getAttribute('data-i18n-title');
            element.title = this.translate(key);
        });
    }

    // Method to get available languages
    getLanguages() {
        return [
            { code: 'en', name: 'English', nativeName: 'English' },
            { code: 'zh', name: 'Chinese', nativeName: '中文' },
            { code: 'es', name: 'Spanish', nativeName: 'Español' }
        ];
    }

    // Method to get current language info
    getCurrentLanguage() {
        const languages = this.getLanguages();
        return languages.find(lang => lang.code === this.currentLang) || languages[0];
    }

    // Initialize i18n
    init() {
        // Set initial language
        const urlParams = new URLSearchParams(window.location.search);
        const urlLang = urlParams.get('lang');
        
        if (urlLang && this.translations[urlLang]) {
            this.setLanguage(urlLang);
        } else {
            // Detect browser language
            const browserLang = navigator.language?.split('-')[0];
            if (browserLang && this.translations[browserLang]) {
                this.setLanguage(browserLang);
            } else {
                this.updateDOM();
            }
        }

        // Setup language selector
        this.setupLanguageSelector();
    }

    setupLanguageSelector() {
        const languageSelect = document.getElementById('languageSelect');
        if (languageSelect) {
            languageSelect.value = this.currentLang;
            
            languageSelect.addEventListener('change', (e) => {
                this.setLanguage(e.target.value);
            });
        }
    }
}

// Create global i18n instance
window.i18n = new I18n();

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.i18n.init();
    });
} else {
    window.i18n.init();
}
