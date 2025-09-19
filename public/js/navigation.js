// Navigation and Page Management Module
class NavigationManager {
    constructor() {
        this.currentSection = 'home';
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupSmoothScrolling();
    }

    setupEventListeners() {
        // Footer links navigation
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a[href^="#"]');
            if (link) {
                e.preventDefault();
                const target = link.getAttribute('href').substring(1);
                this.scrollToSection(target);
            }
        });

        // Pricing plan buttons
        document.addEventListener('click', (e) => {
            if (e.target.closest('.plan-button')) {
                e.preventDefault();
                const planCard = e.target.closest('.pricing-card');
                const planType = this.getPlanType(planCard);
                this.handlePlanSelection(planType);
            }
        });

        // Contact and support links
        document.addEventListener('click', (e) => {
            const linkText = e.target.textContent || '';
            
            // Handle specific footer links
            if (e.target.matches('[data-i18n="footer.contact"]') || linkText.includes('Contact')) {
                e.preventDefault();
                this.showContactModal();
            }
            
            if (e.target.matches('[data-i18n="footer.documentation"]') || linkText.includes('Documentation')) {
                e.preventDefault();
                this.showDocumentationModal();
            }
            
            if (e.target.matches('[data-i18n="footer.privacy"]') || linkText.includes('Privacy')) {
                e.preventDefault();
                this.showPrivacyModal();
            }
            
            if (e.target.matches('[data-i18n="footer.terms"]') || linkText.includes('T&C')) {
                e.preventDefault();
                this.showTermsModal();
            }
            
            if (e.target.matches('[data-i18n="footer.refund"]') || linkText.includes('Refund') || linkText.includes('退款')) {
                e.preventDefault();
                this.showRefundModal();
            }
            
            // Handle product menu links
            if (e.target.matches('[data-i18n="footer.voice_conversion"]') || linkText.includes('Voice Conversion') || linkText.includes('语音转换')) {
                e.preventDefault();
                this.scrollToSection('voice-recorder');
            }
            
            if (e.target.matches('[data-i18n="footer.api_access"]') || linkText.includes('API Access') || linkText.includes('API访问')) {
                e.preventDefault();
                this.showApiAccessModal();
            }
            
            if (e.target.matches('[data-i18n="footer.pricing"]') || linkText.includes('Pricing') || linkText.includes('定价')) {
                e.preventDefault();
                this.scrollToSection('pricing');
            }
        });
    }

    setupSmoothScrolling() {
        // Add smooth scrolling to all internal links
        const links = document.querySelectorAll('a[href^="#"]');
        links.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href').substring(1);
                this.scrollToSection(targetId);
            });
        });
    }

    scrollToSection(sectionId) {
        // Validate sectionId
        if (!sectionId || sectionId.trim() === '' || sectionId === '.') {
            console.warn('Invalid sectionId provided to scrollToSection:', sectionId);
            return;
        }
        
        let targetElement;
        
        switch(sectionId) {
            case 'home':
                targetElement = document.querySelector('.hero');
                break;
            case 'how-it-works':
                targetElement = document.querySelector('.how-it-works');
                break;
            case 'features':
            case 'why-choose':
                targetElement = document.querySelector('.why-choose');
                break;
            case 'pricing':
                targetElement = document.querySelector('.pricing');
                break;
            case 'voice-recorder':
            case 'recorder':
                targetElement = document.querySelector('.recorder-section');
                break;
            case 'contact':
                this.showContactModal();
                return;
            default:
                // First try to find by ID
                targetElement = document.getElementById(sectionId);
                // If not found by ID and sectionId doesn't start with a dot, try class selector
                if (!targetElement && !sectionId.startsWith('.')) {
                    targetElement = document.querySelector(`.${sectionId}`);
                } else if (!targetElement && sectionId.startsWith('.')) {
                    targetElement = document.querySelector(sectionId);
                }
        }

        if (targetElement) {
            targetElement.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
            this.currentSection = sectionId;
        }
    }

    getPlanType(planCard) {
        if (planCard.querySelector('[data-i18n*="starter"]')) return 'starter';
        if (planCard.querySelector('[data-i18n*="pro"]') || planCard.classList.contains('popular')) return 'professional';
        if (planCard.querySelector('[data-i18n*="enterprise"]')) return 'enterprise';
        return 'unknown';
    }

    handlePlanSelection(planType) {
        // Check if user is logged in
        const isLoggedIn = window.authManager && window.authManager.isLoggedIn();
        
        if (!isLoggedIn) {
            // Show registration modal with plan info
            this.showRegistrationForPlan(planType);
        } else {
            // Show payment modal
            this.showPaymentModal(planType);
        }
    }

    showRegistrationForPlan(planType) {
        // Store selected plan for after registration
        localStorage.setItem('selectedPlan', planType);
        
        // Show auth modal with registration form
        if (window.authManager) {
            window.authManager.showRegisterModal();
            
            // Show message about plan selection
            setTimeout(() => {
                this.showMessage(
                    `Please register to continue with the ${planType} plan.`,
                    'info'
                );
            }, 500);
        }
    }

    showPaymentModal(planType) {
        const planDetails = this.getPlanDetails(planType);
        
        // Create payment modal
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.id = 'paymentModal';
        
        modal.innerHTML = `
            <div class="modal payment-modal">
                <div class="modal-header">
                    <h2>Complete Your Purchase</h2>
                    <button class="modal-close" id="paymentModalClose">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="modal-body">
                    <div class="plan-summary">
                        <h3>${planDetails.name} Plan</h3>
                        <div class="price-display">
                            <span class="currency">$</span>
                            <span class="amount">${planDetails.price}</span>
                            <span class="period">/month</span>
                        </div>
                        <ul class="features-summary">
                            ${planDetails.features.map(f => `<li><i class="fas fa-check"></i> ${f}</li>`).join('')}
                        </ul>
                    </div>
                    
                    <div class="payment-form">
                        <h4>Payment Information</h4>
                        <div class="payment-methods">
                            <button class="payment-method active" data-method="card">
                                <i class="fas fa-credit-card"></i> Credit Card
                            </button>
                            <button class="payment-method" data-method="paypal">
                                <i class="fab fa-paypal"></i> PayPal
                            </button>
                        </div>
                        
                        <div class="card-form">
                            <div class="form-group">
                                <label>Card Number</label>
                                <input type="text" placeholder="1234 5678 9012 3456" maxlength="19">
                            </div>
                            
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Expiry Date</label>
                                    <input type="text" placeholder="MM/YY" maxlength="5">
                                </div>
                                <div class="form-group">
                                    <label>CVV</label>
                                    <input type="text" placeholder="123" maxlength="4">
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <label>Cardholder Name</label>
                                <input type="text" placeholder="John Doe">
                            </div>
                        </div>
                        
                        <button class="payment-submit-btn" onclick="navigationManager.processPayment('${planType}')">
                            <i class="fas fa-lock"></i>
                            Complete Payment - $${planDetails.price}/month
                        </button>
                        
                        <div class="payment-security">
                            <i class="fas fa-shield-alt"></i>
                            <span>Your payment information is secure and encrypted</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Setup event listeners
        const closeBtn = modal.querySelector('#paymentModalClose');
        closeBtn.addEventListener('click', () => this.closeModal(modal));
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) this.closeModal(modal);
        });
        
        // Payment method switcher
        const methodBtns = modal.querySelectorAll('.payment-method');
        methodBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                methodBtns.forEach(b => b.classList.remove('active'));
                e.target.closest('.payment-method').classList.add('active');
                
                const method = e.target.dataset.method;
                if (method === 'paypal') {
                    modal.querySelector('.card-form').style.display = 'none';
                    modal.querySelector('.payment-submit-btn').innerHTML = 
                        '<i class="fab fa-paypal"></i> Continue with PayPal';
                } else {
                    modal.querySelector('.card-form').style.display = 'block';
                    modal.querySelector('.payment-submit-btn').innerHTML = 
                        `<i class="fas fa-lock"></i> Complete Payment - $${planDetails.price}/month`;
                }
            });
        });
        
        // Card number formatting
        const cardInput = modal.querySelector('input[placeholder*="1234"]');
        cardInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\s/g, '').replace(/[^0-9]/gi, '');
            let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
            e.target.value = formattedValue;
        });
        
        // Expiry date formatting
        const expiryInput = modal.querySelector('input[placeholder="MM/YY"]');
        expiryInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length >= 2) {
                value = value.substring(0, 2) + '/' + value.substring(2, 4);
            }
            e.target.value = value;
        });
    }

    getPlanDetails(planType) {
        const plans = {
            starter: {
                name: 'Starter',
                price: 9,
                features: [
                    '10 voice conversions per month',
                    'Basic voice options',
                    'Standard quality output',
                    'Email support'
                ]
            },
            professional: {
                name: 'Professional',
                price: 29,
                features: [
                    '100 voice conversions per month',
                    'Premium voice library',
                    'HD quality output',
                    'Priority support',
                    'API access'
                ]
            },
            enterprise: {
                name: 'Enterprise',
                price: 99,
                features: [
                    'Unlimited conversions',
                    'Custom voice training',
                    'Ultra HD quality',
                    '24/7 dedicated support',
                    'Full API access',
                    'Custom integrations'
                ]
            }
        };
        
        return plans[planType] || plans.starter;
    }

    processPayment(planType) {
        // Simulate payment processing
        this.showMessage('Processing payment...', 'info');
        
        // Show loading state
        const submitBtn = document.querySelector('.payment-submit-btn');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
        submitBtn.disabled = true;
        
        // Simulate API call
        setTimeout(() => {
            // Close payment modal
            const paymentModal = document.getElementById('paymentModal');
            if (paymentModal) this.closeModal(paymentModal);
            
            // Show success message
            this.showSuccessModal(planType);
        }, 3000);
    }

    showSuccessModal(planType) {
        const planDetails = this.getPlanDetails(planType);
        
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        
        modal.innerHTML = `
            <div class="modal success-modal">
                <div class="modal-body">
                    <div class="success-content">
                        <div class="success-icon">
                            <i class="fas fa-check-circle"></i>
                        </div>
                        <h2>Payment Successful!</h2>
                        <p>Welcome to VoiceMorph ${planDetails.name}!</p>
                        <p>You now have access to all ${planDetails.name} features.</p>
                        
                        <div class="success-actions">
                            <button class="success-btn primary" id="successStartConverting">
                                Start Converting Now
                            </button>
                            <button class="success-btn secondary" id="successViewDashboard">
                                View Dashboard
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Add event listeners for buttons
        const startConvertingBtn = modal.querySelector('#successStartConverting');
        if (startConvertingBtn) {
            startConvertingBtn.addEventListener('click', () => {
                this.closeModal(modal);
                this.scrollToSection('voice-recorder');
            });
        }
        
        const viewDashboardBtn = modal.querySelector('#successViewDashboard');
        if (viewDashboardBtn) {
            viewDashboardBtn.addEventListener('click', () => {
                if (window.authManager) {
                    window.authManager.showDashboard();
                }
                this.closeModal(modal);
            });
        }
        
        // Auto close after 10 seconds
        setTimeout(() => {
            if (modal.parentNode) {
                this.closeModal(modal);
            }
        }, 10000);
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) this.closeModal(modal);
        });
    }

    showContactModal() {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.id = 'contactModal';
        
        modal.innerHTML = `
            <div class="modal">
                <div class="modal-header">
                    <h2>Contact Us</h2>
                    <button class="modal-close" id="contactModalClose">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="modal-body">
                    <div class="contact-info">
                        <div class="contact-item">
                            <i class="fas fa-envelope"></i>
                            <div>
                                <h4>Email Support</h4>
                                <a href="mailto:support@voicecworkshop.com">support@voicecworkshop.com</a>
                            </div>
                        </div>
                        
                        <div class="contact-item">
                            <i class="fas fa-phone"></i>
                            <div>
                                <h4>Phone Support</h4>
                                <span>Available for Enterprise customers</span>
                            </div>
                        </div>
                        
                        <div class="contact-item">
                            <i class="fas fa-map-marker-alt"></i>
                            <div>
                                <h4>Address</h4>
                                <p>NEXREALM SOLUTIONS., LTD<br>
                                5 South Charlotte Street<br>
                                Edinburgh, EH2 4AN<br>
                                United Kingdom</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="contact-form">
                        <h3>Send us a message</h3>
                        <form id="contactForm">
                            <div class="form-group">
                                <label>Name</label>
                                <input type="text" required>
                            </div>
                            
                            <div class="form-group">
                                <label>Email</label>
                                <input type="email" required>
                            </div>
                            
                            <div class="form-group">
                                <label>Subject</label>
                                <select>
                                    <option>General Inquiry</option>
                                    <option>Technical Support</option>
                                    <option>Billing Question</option>
                                    <option>Feature Request</option>
                                    <option>Bug Report</option>
                                </select>
                            </div>
                            
                            <div class="form-group">
                                <label>Message</label>
                                <textarea rows="4" required></textarea>
                            </div>
                            
                            <button type="submit" class="contact-submit-btn">
                                <i class="fas fa-paper-plane"></i>
                                Send Message
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Add event listener for close button
        const closeBtn = modal.querySelector('#contactModalClose');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeModal(modal));
        }
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) this.closeModal(modal);
        });
        
        // Handle form submission
        const contactForm = modal.querySelector('#contactForm');
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.showMessage('Message sent successfully! We\'ll get back to you soon.', 'success');
            this.closeModal(modal);
        });
    }

    showDocumentationModal() {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        
        modal.innerHTML = `
            <div class="modal documentation-modal">
                <div class="modal-header">
                    <h2>Documentation</h2>
                    <button class="modal-close" id="docModalClose">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="modal-body">
                    <div class="doc-sections">
                        <div class="doc-section">
                            <h3><i class="fas fa-rocket"></i> Getting Started</h3>
                            <ul>
                                <li><a href="#">Quick Start Guide</a></li>
                                <li><a href="#">API Introduction</a></li>
                                <li><a href="#">Authentication</a></li>
                            </ul>
                        </div>
                        
                        <div class="doc-section">
                            <h3><i class="fas fa-code"></i> API Reference</h3>
                            <ul>
                                <li><a href="#">Voice Conversion API</a></li>
                                <li><a href="#">Voice Models</a></li>
                                <li><a href="#">Rate Limits</a></li>
                                <li><a href="#">Error Codes</a></li>
                            </ul>
                        </div>
                        
                        <div class="doc-section">
                            <h3><i class="fas fa-book"></i> Guides & Tutorials</h3>
                            <ul>
                                <li><a href="#">Best Practices</a></li>
                                <li><a href="#">Audio Quality Tips</a></li>
                                <li><a href="#">Troubleshooting</a></li>
                            </ul>
                        </div>
                        
                        <div class="doc-section">
                            <h3><i class="fas fa-question-circle"></i> FAQ</h3>
                            <ul>
                                <li><a href="#">Common Questions</a></li>
                                <li><a href="#">Billing & Plans</a></li>
                                <li><a href="#">Technical Issues</a></li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Add event listener for close button
        const closeBtn = modal.querySelector('#docModalClose');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeModal(modal));
        }
        
        // Add event listeners for documentation links
        const docLinks = modal.querySelectorAll('.doc-section a');
        docLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const linkText = link.textContent.trim();
                this.showMessage(`Opening: ${linkText}`, 'info');
                // Here you can add actual functionality for each link
                setTimeout(() => {
                    this.closeModal(modal);
                }, 1500);
            });
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) this.closeModal(modal);
        });
    }

    showPrivacyModal() {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.id = 'privacyModal';
        
        modal.innerHTML = `
            <div class="modal">
                <div class="modal-header">
                    <h2>Privacy Policy</h2>
                    <button class="modal-close" id="privacyModalClose">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="modal-body">
                    <div class="policy-content">
                        <section>
                            <h3>Data Collection</h3>
                            <p>We collect minimal personal information necessary to provide our voice conversion services, including email address, usage statistics, and uploaded audio files.</p>
                        </section>
                        
                        <section>
                            <h3>Audio Processing</h3>
                            <p>Audio files are processed on our secure servers and automatically deleted within 24 hours. We do not store your audio content permanently unless explicitly requested.</p>
                        </section>
                        
                        <section>
                            <h3>Data Security</h3>
                            <p>All data transmission is encrypted using industry-standard SSL/TLS protocols. Our servers are protected by enterprise-grade security measures.</p>
                        </section>
                        
                        <section>
                            <h3>Third-Party Services</h3>
                            <p>We use trusted third-party services for payment processing and analytics. These services have their own privacy policies which we recommend reviewing.</p>
                        </section>
                        
                        <section>
                            <h3>Contact</h3>
                            <p>For privacy concerns or data deletion requests, contact us at privacy@voicecworkshop.com</p>
                        </section>
                        
                        <div class="policy-footer">
                            <p><small>Last updated: January 2024</small></p>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Add event listener for close button
        const closeBtn = modal.querySelector('#privacyModalClose');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeModal(modal));
        }
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) this.closeModal(modal);
        });
    }

    showTermsModal() {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        
        modal.innerHTML = `
            <div class="modal">
                <div class="modal-header">
                    <h2>Terms & Conditions</h2>
                    <button class="modal-close" id="termsModalClose">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="modal-body">
                    <div class="terms-content">
                        <section>
                            <h3>Service Agreement</h3>
                            <p>By using VoiceMorph, you agree to these terms and conditions. Our service provides AI-powered voice conversion technology for legitimate purposes only.</p>
                        </section>
                        
                        <section>
                            <h3>Acceptable Use</h3>
                            <ul>
                                <li>Do not use the service for illegal activities</li>
                                <li>Do not impersonate others without consent</li>
                                <li>Respect intellectual property rights</li>
                                <li>Do not generate harmful or offensive content</li>
                            </ul>
                        </section>
                        
                        <section>
                            <h3>Subscription & Billing</h3>
                            <p>Subscriptions renew automatically. You may cancel anytime through your dashboard. Refunds are available within 30 days of purchase.</p>
                        </section>
                        
                        <section>
                            <h3>Service Availability</h3>
                            <p>We strive for 99.9% uptime but cannot guarantee uninterrupted service. Planned maintenance will be announced in advance.</p>
                        </section>
                        
                        <section>
                            <h3>Limitation of Liability</h3>
                            <p>Our liability is limited to the amount you paid for the service. We are not responsible for indirect damages or loss of data.</p>
                        </section>
                        
                        <div class="terms-footer">
                            <p><small>Last updated: January 2024</small></p>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Add event listener for close button
        const closeBtn = modal.querySelector('#termsModalClose');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeModal(modal));
        }
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) this.closeModal(modal);
        });
    }

    showRefundModal() {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        
        modal.innerHTML = `
            <div class="modal">
                <div class="modal-header">
                    <h2>Return & Refund Policy</h2>
                    <button class="modal-close" id="refundModalClose">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="modal-body">
                    <div class="refund-content">
                        <section>
                            <h3>Refund Eligibility</h3>
                            <p>We offer a 30-day money-back guarantee for all premium subscriptions. If you're not satisfied with our service, you can request a full refund within 30 days of your initial purchase.</p>
                        </section>
                        
                        <section>
                            <h3>How to Request a Refund</h3>
                            <ol>
                                <li>Contact our support team at support@voicecworkshop.com</li>
                                <li>Include your order number and reason for the refund</li>
                                <li>We'll process your refund within 5-7 business days</li>
                            </ol>
                        </section>
                        
                        <section>
                            <h3>Refund Processing</h3>
                            <p>Refunds will be issued to the original payment method used for the purchase. Processing time may vary depending on your bank or payment provider.</p>
                        </section>
                        
                        <section>
                            <h3>Non-Refundable Items</h3>
                            <ul>
                                <li>Refunds requested after 30 days</li>
                                <li>Usage-based charges (per-conversion fees)</li>
                                <li>Custom voice training services</li>
                                <li>Enterprise custom integrations</li>
                            </ul>
                        </section>
                        
                        <section>
                            <h3>Contact Information</h3>
                            <p>For refund requests or questions about this policy, please contact us at:</p>
                            <p><strong>Email:</strong> support@voicecworkshop.com</p>
                            <p><strong>Response Time:</strong> Within 24 hours during business days</p>
                        </section>
                        
                        <div class="refund-footer">
                            <p><small>Last updated: January 2024</small></p>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Add event listener for close button
        const closeBtn = modal.querySelector('#refundModalClose');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeModal(modal));
        }
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) this.closeModal(modal);
        });
    }

    showApiAccessModal() {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        
        modal.innerHTML = `
            <div class="modal api-modal">
                <div class="modal-header">
                    <h2>API Access</h2>
                    <button class="modal-close" id="apiModalClose">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="modal-body">
                    <div class="api-content">
                        <div class="api-intro">
                            <h3><i class="fas fa-code"></i> VoiceMorph API</h3>
                            <p>Integrate our powerful voice transformation technology into your applications with our RESTful API.</p>
                        </div>
                        
                        <div class="api-features">
                            <div class="feature-item">
                                <i class="fas fa-rocket"></i>
                                <div>
                                    <h4>Easy Integration</h4>
                                    <p>Simple REST API with comprehensive documentation</p>
                                </div>
                            </div>
                            
                            <div class="feature-item">
                                <i class="fas fa-shield-alt"></i>
                                <div>
                                    <h4>Secure & Reliable</h4>
                                    <p>Enterprise-grade security with 99.9% uptime</p>
                                </div>
                            </div>
                            
                            <div class="feature-item">
                                <i class="fas fa-tachometer-alt"></i>
                                <div>
                                    <h4>High Performance</h4>
                                    <p>Fast processing with real-time response</p>
                                </div>
                            </div>
                        </div>
                        
                        <div class="api-endpoints">
                            <h3>API Endpoints</h3>
                            <div class="endpoint-list">
                                <div class="endpoint-item">
                                    <span class="method post">POST</span>
                                    <span class="url">/api/v1/transform</span>
                                    <span class="description">Transform voice audio</span>
                                </div>
                                
                                <div class="endpoint-item">
                                    <span class="method get">GET</span>
                                    <span class="url">/api/v1/effects</span>
                                    <span class="description">Get available voice effects</span>
                                </div>
                                
                                <div class="endpoint-item">
                                    <span class="method get">GET</span>
                                    <span class="url">/api/v1/status</span>
                                    <span class="description">Check API status</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="api-pricing">
                            <h3>API Pricing</h3>
                            <div class="pricing-tiers">
                                <div class="tier">
                                    <h4>Starter</h4>
                                    <div class="price">$0.10 <span>per request</span></div>
                                    <ul>
                                        <li>1,000 requests/month</li>
                                        <li>Basic support</li>
                                    </ul>
                                </div>
                                
                                <div class="tier featured">
                                    <h4>Professional</h4>
                                    <div class="price">$0.05 <span>per request</span></div>
                                    <ul>
                                        <li>10,000 requests/month</li>
                                        <li>Priority support</li>
                                        <li>Custom voice models</li>
                                    </ul>
                                </div>
                                
                                <div class="tier">
                                    <h4>Enterprise</h4>
                                    <div class="price">Custom</div>
                                    <ul>
                                        <li>Unlimited requests</li>
                                        <li>Dedicated support</li>
                                        <li>Custom integrations</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                        
                        <div class="api-actions">
                            <button class="api-btn primary" onclick="window.navigationManager.scrollToSection('pricing'); this.closest('.modal-overlay').remove();">
                                <i class="fas fa-credit-card"></i>
                                View Pricing Plans
                            </button>
                            <button class="api-btn secondary" onclick="window.navigationManager.showDocumentationModal(); this.closest('.modal-overlay').remove();">
                                <i class="fas fa-book"></i>
                                View Documentation
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Add event listener for close button
        const closeBtn = modal.querySelector('#apiModalClose');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                modal.remove();
            });
        }
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) this.closeModal(modal);
        });
    }

    closeModal(modal) {
        if (modal && modal.parentNode) {
            modal.remove();
        }
    }

    showMessage(message, type = 'info') {
        if (window.voiceMorphApp && window.voiceMorphApp.showMessage) {
            window.voiceMorphApp.showMessage(message, type);
        } else {
            // Fallback notification
            console.log(`${type.toUpperCase()}: ${message}`);
        }
    }
}

// Initialize navigation manager
window.navigationManager = new NavigationManager();

// Handle registration completion for plan selection
window.addEventListener('DOMContentLoaded', () => {
    window.addEventListener('languageChanged', () => {
        // Re-initialize navigation after language change
        if (window.navigationManager) {
            window.navigationManager.setupSmoothScrolling();
        }
    });
});
