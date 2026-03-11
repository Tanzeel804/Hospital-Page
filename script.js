/**
 * MEDICARE PLUS HOSPITAL - MAIN JAVASCRIPT
 * Developer: Tanzeel Ahmed
 * Core features: Authentication, Theme Toggle, Animations, Form Validation
 */

// ============================================
// SCROLL PROGRESS BAR
// ============================================
function updateScrollProgress() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrolled = (scrollTop / docHeight) * 100;
    const progressBar = document.querySelector('.scroll-progress');
    if (progressBar) {
        progressBar.style.width = scrolled + '%';
    }
}

window.addEventListener('scroll', updateScrollProgress);

// ============================================
// THEME TOGGLE (Dark/Light)
// ============================================
class ThemeManager {
    constructor() {
        this.themeName = 'theme';
        this.defaultTheme = 'dark';
        this.init();
    }

    init() {
        const savedTheme = localStorage.getItem(this.themeName) || this.defaultTheme;
        this.setTheme(savedTheme);
        this.attachToggleListener();
    }

    setTheme(theme) {
        if (theme === 'light') {
            document.documentElement.setAttribute('data-theme', 'light');
            this.updateThemeIcon('light');
        } else {
            document.documentElement.removeAttribute('data-theme');
            this.updateThemeIcon('dark');
        }
        localStorage.setItem(this.themeName, theme);
    }

    toggleTheme() {
        const currentTheme = localStorage.getItem(this.themeName) || this.defaultTheme;
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        this.setTheme(newTheme);
    }

    updateThemeIcon(theme) {
        const themeBtn = document.querySelector('.theme-toggle');
        if (themeBtn) {
            themeBtn.innerHTML = theme === 'dark' 
                ? '<i class="fas fa-sun"></i>' 
                : '<i class="fas fa-moon"></i>';
        }
    }

    attachToggleListener() {
        const themeBtn = document.querySelector('.theme-toggle');
        if (themeBtn) {
            themeBtn.addEventListener('click', () => this.toggleTheme());
        }
    }
}

// ============================================
// AUTHENTICATION SYSTEM
// ============================================
class AuthManager {
    constructor() {
        this.usersKey = 'hospital_users';
        this.currentUserKey = 'currentUser';
        this.init();
    }

    init() {
        this.loadUsersFromStorage();
        this.checkCurrentUser();
        this.attachAuthListeners();
        this.updateNavbar();
    }

    loadUsersFromStorage() {
        const stored = localStorage.getItem(this.usersKey);
        this.users = stored ? JSON.parse(stored) : [];
    }

    saveUsersToStorage() {
        localStorage.setItem(this.usersKey, JSON.stringify(this.users));
    }

    signup(name, email, password, confirmPassword) {
        const errors = this.validateSignup(name, email, password, confirmPassword);
        
        if (errors.length > 0) {
            return { success: false, errors };
        }

        if (this.users.some(u => u.email === email)) {
            return { success: false, errors: ['Email already registered'] };
        }

        const newUser = {
            id: Date.now(),
            name,
            email,
            password: this.hashPassword(password)
        };

        this.users.push(newUser);
        this.saveUsersToStorage();
        return { success: true };
    }

    login(email, password) {
        const errors = this.validateLogin(email, password);
        
        if (errors.length > 0) {
            return { success: false, errors };
        }

        const user = this.users.find(u => u.email === email);
        
        if (!user) {
            return { success: false, errors: ['User not found'] };
        }

        if (user.password !== this.hashPassword(password)) {
            return { success: false, errors: ['Invalid password'] };
        }

        this.setCurrentUser(user);
        return { success: true };
    }

    logout() {
        localStorage.removeItem(this.currentUserKey);
        this.checkCurrentUser();
        this.updateNavbar();
    }

    setCurrentUser(user) {
        const userObj = {
            id: user.id,
            name: user.name,
            email: user.email
        };
        localStorage.setItem(this.currentUserKey, JSON.stringify(userObj));
        this.checkCurrentUser();
    }

    checkCurrentUser() {
        const stored = localStorage.getItem(this.currentUserKey);
        this.currentUser = stored ? JSON.parse(stored) : null;
    }

    validateSignup(name, email, password, confirmPassword) {
        const errors = [];
        
        if (!name.trim()) errors.push('Name is required');
        if (!email.trim()) errors.push('Email is required');
        if (!this.isValidEmail(email)) errors.push('Invalid email format');
        if (password.length < 6) errors.push('Password must be at least 6 characters');
        if (password !== confirmPassword) errors.push('Passwords do not match');
        
        return errors;
    }

    validateLogin(email, password) {
        const errors = [];
        
        if (!email.trim()) errors.push('Email is required');
        if (!password.trim()) errors.push('Password is required');
        
        return errors;
    }

    isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    hashPassword(password) {
        // Simple hash for demo (use bcrypt in production)
        return btoa(password);
    }

    attachAuthListeners() {
        this.attachSignupListener();
        this.attachLoginListener();
        this.attachLogoutListener();
    }

    attachSignupListener() {
        const signupForm = document.querySelector('#signupForm');
        if (signupForm) {
            signupForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleSignup();
            });
        }
    }

    attachLoginListener() {
        const loginForm = document.querySelector('#loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin();
            });
        }
    }

    attachLogoutListener() {
        const logoutBtn = document.querySelector('#logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.logout();
            });
        }
    }

    handleSignup() {
        const name = document.querySelector('#signupName').value;
        const email = document.querySelector('#signupEmail').value;
        const password = document.querySelector('#signupPassword').value;
        const confirmPassword = document.querySelector('#signupConfirmPassword').value;

        const result = this.signup(name, email, password, confirmPassword);
        const messagesDiv = document.querySelector('#signupMessages');

        if (result.success) {
            messagesDiv.innerHTML = '<div class="alert alert-success">Signup successful! Please log in.</div>';
            document.querySelector('#signupForm').reset();
            setTimeout(() => {
                bootstrap.Modal.getInstance(document.querySelector('#signupModal')).hide();
                document.querySelector('#loginModal').focus();
                new bootstrap.Modal(document.querySelector('#loginModal')).show();
            }, 2000);
        } else {
            messagesDiv.innerHTML = '<div class="alert alert-danger">' 
                + result.errors.map(e => '<div>• ' + e + '</div>').join('') 
                + '</div>';
        }
    }

    handleLogin() {
        const email = document.querySelector('#loginEmail').value;
        const password = document.querySelector('#loginPassword').value;

        const result = this.login(email, password);
        const messagesDiv = document.querySelector('#loginMessages');

        if (result.success) {
            messagesDiv.innerHTML = '<div class="alert alert-success">Login successful! Redirecting...</div>';
            document.querySelector('#loginForm').reset();
            setTimeout(() => {
                bootstrap.Modal.getInstance(document.querySelector('#loginModal')).hide();
                this.updateNavbar();
            }, 1500);
        } else {
            messagesDiv.innerHTML = '<div class="alert alert-danger">' 
                + result.errors.map(e => '<div>• ' + e + '</div>').join('') 
                + '</div>';
        }
    }

    updateNavbar() {
        const authButtons = document.querySelector('#authButtons');
        const userInfo = document.querySelector('#userInfo');

        if (this.currentUser && authButtons && userInfo) {
            authButtons.style.display = 'none';
            userInfo.style.display = 'flex';
            userInfo.innerHTML = `
                <span class="navbar-user-info">Welcome, ${this.currentUser.name}!</span>
                <button id="logoutBtn" class="btn btn-light" style="padding: 0.5rem 1rem; font-size: 0.85rem;">
                    <i class="fas fa-sign-out-alt"></i> Logout
                </button>
            `;
            this.attachLogoutListener();
        } else if (!this.currentUser && authButtons && userInfo) {
            authButtons.style.display = 'flex';
            userInfo.style.display = 'none';
        }
    }
}

// ============================================
// MODAL HELPERS
// ============================================
function openSignupModal() {
    const modal = new bootstrap.Modal(document.querySelector('#signupModal'));
    modal.show();
}

function openLoginModal() {
    const modal = new bootstrap.Modal(document.querySelector('#loginModal'));
    modal.show();
}

function clearAuthMessages() {
    const signupMessages = document.querySelector('#signupMessages');
    const loginMessages = document.querySelector('#loginMessages');
    if (signupMessages) signupMessages.innerHTML = '';
    if (loginMessages) loginMessages.innerHTML = '';
}

// ============================================
// FORM VALIDATION
// ============================================
class FormValidator {
    static setupValidation(formId, config) {
        const form = document.querySelector(formId);
        if (!form) return;

        form.addEventListener('submit', (e) => {
            e.preventDefault();

            const errors = [];
            
            for (const [fieldId, rules] of Object.entries(config)) {
                const field = document.querySelector(fieldId);
                const value = field.value.trim();
                const fieldErrors = [];

                if (rules.required && !value) {
                    fieldErrors.push(`${rules.label} is required`);
                }

                if (rules.email && value && !this.isValidEmail(value)) {
                    fieldErrors.push(`${rules.label} must be valid`);
                }

                if (rules.minLength && value && value.length < rules.minLength) {
                    fieldErrors.push(`${rules.label} must be at least ${rules.minLength} characters`);
                }

                if (fieldErrors.length > 0) {
                    errors.push(...fieldErrors);
                }
            }

            const messagesDiv = form.querySelector('.form-messages');
            if (messagesDiv) {
                if (errors.length > 0) {
                    messagesDiv.innerHTML = '<div class="alert alert-danger">' 
                        + errors.map(e => '<div>• ' + e + '</div>').join('') 
                        + '</div>';
                } else {
                    messagesDiv.innerHTML = '<div class="alert alert-success">Form submitted successfully!</div>';
                    form.reset();
                }
            }
        });
    }

    static isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }
}

// ============================================
// DOCTOR FILTER
// ============================================
class DoctorFilter {
    constructor() {
        this.init();
    }

    init() {
        const searchInput = document.querySelector('#doctorSearch');
        const specialtyFilter = document.querySelector('#specialtyFilter');

        if (searchInput) {
            searchInput.addEventListener('input', () => this.filterDoctors());
        }

        if (specialtyFilter) {
            specialtyFilter.addEventListener('change', () => this.filterDoctors());
        }
    }

    filterDoctors() {
        const searchValue = document.querySelector('#doctorSearch')?.value.toLowerCase() || '';
        const specialtyValue = document.querySelector('#specialtyFilter')?.value || '';
        const cards = document.querySelectorAll('.doctor-card');

        cards.forEach(card => {
            const name = card.querySelector('.doctor-name').textContent.toLowerCase();
            const specialty = card.querySelector('.doctor-specialty').textContent;
            const matchesSearch = name.includes(searchValue);
            const matchesSpecialty = !specialtyValue || specialty.includes(specialtyValue);

            card.style.display = (matchesSearch && matchesSpecialty) ? 'block' : 'none';
        });
    }
}

// ============================================
// COUNTER ANIMATION
// ============================================
class CounterAnimation {
    constructor(selector, duration = 2000) {
        this.elements = document.querySelectorAll(selector);
        this.duration = duration;
        this.init();
    }

    init() {
        if (this.elements.length === 0) return;

        const options = {
            threshold: 0.5,
            rootMargin: '0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !entry.target.classList.contains('animated')) {
                    this.animateCounter(entry.target);
                    entry.target.classList.add('animated');
                }
            });
        }, options);

        this.elements.forEach(el => observer.observe(el));
    }

    animateCounter(element) {
        const target = parseInt(element.getAttribute('data-target')) || parseInt(element.textContent);
        const increment = target / (this.duration / 16);
        let current = 0;

        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                element.textContent = target + (element.getAttribute('data-suffix') || '');
                clearInterval(timer);
            } else {
                element.textContent = Math.floor(current) + (element.getAttribute('data-suffix') || '');
            }
        }, 16);
    }
}

// ============================================
// SMOOTH SCROLL FOR ANCHOR LINKS
// ============================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href !== '#' && document.querySelector(href)) {
            e.preventDefault();
            document.querySelector(href).scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});

// ============================================
// BACK TO TOP BUTTON
// ============================================
function handleBackToTop() {
    const backToTopBtn = document.querySelector('.back-to-top');
    if (!backToTopBtn) return;

    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            backToTopBtn.classList.add('active');
        } else {
            backToTopBtn.classList.remove('active');
        }
    });

    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// ============================================
// NAVBAR SCROLL EFFECT
// ============================================
function handleNavbarScroll() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.style.boxShadow = '0 4px 20px var(--shadow-color)';
        } else {
            navbar.style.boxShadow = '0 2px 20px var(--shadow-color)';
        }
    });
}

// ============================================
// ACTIVE NAV LINK ON PAGE LOAD
// ============================================
function setActiveNavLink() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-link');

    navLinks.forEach(link => {
        let href = link.getAttribute('href');
        if (href === currentPage || (currentPage === '' && href === 'index.html')) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

// ============================================
// TYPEWRITER EFFECT
// ============================================
class TypeWriter {
    constructor(selector, strings, speed = 100, delay = 2000) {
        this.element = document.querySelector(selector);
        this.strings = strings;
        this.speed = speed;
        this.delay = delay;
        this.currentString = 0;
        this.currentChar = 0;
        this.isDeleting = false;

        if (this.element) {
            this.type();
        }
    }

    type() {
        const current = this.strings[this.currentString];
        
        if (this.isDeleting) {
            this.element.textContent = current.substring(0, this.currentChar - 1);
            this.currentChar--;
        } else {
            this.element.textContent = current.substring(0, this.currentChar + 1);
            this.currentChar++;
        }

        let typeSpeed = this.speed;

        if (this.isDeleting) {
            typeSpeed /= 2;
        }

        if (!this.isDeleting && this.currentChar === current.length) {
            typeSpeed = this.delay;
            this.isDeleting = true;
        } else if (this.isDeleting && this.currentChar === 0) {
            this.currentString = (this.currentString + 1) % this.strings.length;
            this.isDeleting = false;
            typeSpeed = 500;
        }

        setTimeout(() => this.type(), typeSpeed);
    }
}

// ============================================
// EMAIL VALIDATION
// ============================================
function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ============================================
// INITIALIZE ON DOM READY
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    // Initialize theme manager
    const themeManager = new ThemeManager();

    // Initialize auth manager
    const authManager = new AuthManager();

    // Handle back to top button
    handleBackToTop();

    // Handle navbar scroll effect
    handleNavbarScroll();

    // Set active nav link
    setActiveNavLink();

    // Clear auth messages when modals are shown
    const signupModal = document.querySelector('#signupModal');
    const loginModal = document.querySelector('#loginModal');

    if (signupModal) {
        signupModal.addEventListener('show.bs.modal', () => {
            clearAuthMessages();
        });
    }

    if (loginModal) {
        loginModal.addEventListener('show.bs.modal', () => {
            clearAuthMessages();
        });
    }

    // Initialize AOS if available
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 800,
            offset: 100,
            once: false,
            easing: 'ease-in-out'
        });
    }

    // Initialize counters
    new CounterAnimation('.stat-number', 2000);

    // Initialize doctor filter
    new DoctorFilter();

    // Setup contact form validation
    FormValidator.setupValidation('#contactForm', {
        '#contactName': { required: true, label: 'Name' },
        '#contactEmail': { required: true, email: true, label: 'Email' },
        '#contactSubject': { required: true, label: 'Subject' },
        '#contactMessage': { required: true, minLength: 10, label: 'Message' }
    });

    // Setup appointment form validation
    FormValidator.setupValidation('#appointmentForm', {
        '#appointmentName': { required: true, label: 'Name' },
        '#appointmentEmail': { required: true, email: true, label: 'Email' },
        '#appointmentPhone': { required: true, label: 'Phone' },
        '#appointmentDate': { required: true, label: 'Date' },
        '#appointmentDepartment': { required: true, label: 'Department' }
    });

    console.log('✅ Hospital Website Initialized Successfully');
    console.log('👨‍💻 Developer: Tanzeel Ahmed');
    console.log('🔗 GitHub: https://github.com/Tanzeel804');
});

// ============================================
// EXPORT FOR EXTERNAL USE
// ============================================
window.AuthManager = AuthManager;
window.ThemeManager = ThemeManager;
window.DoctorFilter = DoctorFilter;
window.CounterAnimation = CounterAnimation;
window.TypeWriter = TypeWriter;
window.validateEmail = validateEmail;
window.openSignupModal = openSignupModal;
window.openLoginModal = openLoginModal;
window.FormValidator = FormValidator;
