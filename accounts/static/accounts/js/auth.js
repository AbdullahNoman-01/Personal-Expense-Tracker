/**
 * Personal Expense Tracker - Authentication Scripts (auth.js)
 * Features:
 *  - Dynamic 3-Scene Carousel: Swaps completely different financial widgets per slide
 *  - Slide 1: Balance & 34% Food Donut Chart
 *  - Slide 2: Weekly Spending Bar Chart & Savings Goal Ring
 *  - Slide 3: Virtual Debit Card & Recent Activity Feed
 *  - Show / Hide Password Toggle
 *  - Forgot Password Modal
 *  - Toast Notifications for Social Buttons
 */

document.addEventListener('DOMContentLoaded', () => {
    // =========================================================================
    // 1. Dynamic 3-Scene Showcase Slider
    // =========================================================================
    const slidesData = [
        {
            title: "Welcome back!",
            subtitle: "Start managing your finance faster and better. Track your daily expenses and reach your savings goals with ease."
        },
        {
            title: "Smart Analytics!",
            subtitle: "Visualize your weekly cash flow and reach your personal savings goals with automated insights."
        },
        {
            title: "Instant Control!",
            subtitle: "Manage your virtual cards, track recurring subscriptions, and stay informed on every penny spent."
        }
    ];

    let currentSlide = 0;
    let autoPlayTimer = null;

    const captionTitle = document.getElementById('captionTitle');
    const captionSubtitle = document.getElementById('captionSubtitle');
    const dots = document.querySelectorAll('.carousel-dots .dot');
    const prevBtn = document.getElementById('carouselPrevBtn');
    const nextBtn = document.getElementById('carouselNextBtn');
    const scenes = document.querySelectorAll('.showcase-scene');

    function showSlide(index) {
        if (index < 0) {
            currentSlide = slidesData.length - 1;
        } else if (index >= slidesData.length) {
            currentSlide = 0;
        } else {
            currentSlide = index;
        }

        const data = slidesData[currentSlide];

        // 1. Switch Visual Scenes (Different card designs per slide!)
        scenes.forEach((scene, i) => {
            if (i === currentSlide) {
                scene.classList.add('active');
            } else {
                scene.classList.remove('active');
            }
        });

        // 2. Animate caption transition
        if (captionTitle && captionSubtitle) {
            captionTitle.style.opacity = '0';
            captionSubtitle.style.opacity = '0';
            captionTitle.style.transform = 'translateY(6px)';
            captionSubtitle.style.transform = 'translateY(6px)';

            setTimeout(() => {
                captionTitle.textContent = data.title;
                captionSubtitle.textContent = data.subtitle;
                captionTitle.style.opacity = '1';
                captionSubtitle.style.opacity = '1';
                captionTitle.style.transform = 'translateY(0)';
                captionSubtitle.style.transform = 'translateY(0)';
            }, 180);
        }

        // 3. Update active dot
        dots.forEach((dot, i) => {
            if (i === currentSlide) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
    }

    function startAutoPlay() {
        stopAutoPlay();
        autoPlayTimer = setInterval(() => {
            showSlide(currentSlide + 1);
        }, 5000);
    }

    function stopAutoPlay() {
        if (autoPlayTimer) {
            clearInterval(autoPlayTimer);
            autoPlayTimer = null;
        }
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', (e) => {
            e.preventDefault();
            stopAutoPlay();
            showSlide(currentSlide - 1);
            startAutoPlay();
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', (e) => {
            e.preventDefault();
            stopAutoPlay();
            showSlide(currentSlide + 1);
            startAutoPlay();
        });
    }

    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            stopAutoPlay();
            showSlide(index);
            startAutoPlay();
        });
    });

    if (scenes.length > 0) {
        startAutoPlay();
    }

    // =========================================================================
    // 2. Show / Hide Password Toggle
    // =========================================================================
    const passwordToggles = document.querySelectorAll('.btn-password-toggle');
    passwordToggles.forEach(btn => {
        btn.addEventListener('click', () => {
            const wrapper = btn.closest('.input-icon-wrapper');
            const input = wrapper ? wrapper.querySelector('input') : null;
            if (!input) return;

            const isPassword = input.getAttribute('type') === 'password';
            input.setAttribute('type', isPassword ? 'text' : 'password');

            if (isPassword) {
                btn.innerHTML = `
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                        <line x1="1" y1="1" x2="23" y2="23"></line>
                    </svg>
                `;
            } else {
                btn.innerHTML = `
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                `;
            }
        });
    });

    // =========================================================================
    // 3. Toast Notification Helper
    // =========================================================================
    function showToast(message, type = 'info') {
        let toastContainer = document.getElementById('authToastContainer');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.id = 'authToastContainer';
            toastContainer.className = 'auth-toast-container';
            document.body.appendChild(toastContainer);
        }

        const toast = document.createElement('div');
        toast.className = `auth-toast ${type}`;
        toast.innerHTML = `
            <span class="toast-dot"></span>
            <span class="toast-text">${message}</span>
        `;
        toastContainer.appendChild(toast);

        setTimeout(() => toast.classList.add('show'), 10);

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 250);
        }, 3500);
    }

    // =========================================================================
    // 4. Social Buttons (Google & Facebook) - Direct Working Login
    // =========================================================================
    const socialButtons = document.querySelectorAll('.btn-social');
    socialButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            const provider = this.classList.contains('btn-google') ? 'Google' : 'Facebook';
            showToast(`Logging in with ${provider}... Please wait.`, 'success');
            this.style.opacity = '0.7';
            this.style.pointerEvents = 'none';
            // Allow default link navigation to /accounts/social-login/<provider>/
        });
    });

    // =========================================================================
    // 4.1 Demo Cards Click Interactivity (Left Showcase)
    // =========================================================================
    const demoTxCard = document.querySelector('.float-card-transaction');
    if (demoTxCard) {
        demoTxCard.style.cursor = 'pointer';
        demoTxCard.setAttribute('title', 'Click to try quick login demo');
        demoTxCard.addEventListener('click', () => {
            const usernameInput = document.querySelector('input[name="username_or_email"]') || document.querySelector('input[name="username"]');
            const passwordInput = document.querySelector('input[name="password"]');
            if (usernameInput && passwordInput) {
                usernameInput.value = 'demouser';
                passwordInput.value = 'Demo@1234';
                showToast('Demo credentials filled! Click Login to enter.', 'info');
            } else {
                showToast('Create an account or login to record transactions!', 'info');
            }
        });
    }

    const balanceCard = document.querySelector('.float-card-balance');
    if (balanceCard) {
        balanceCard.style.cursor = 'pointer';
        balanceCard.addEventListener('click', () => {
            showToast('Live balance tracking active. Sign in to access your dashboard.', 'info');
        });
    }

    // =========================================================================
    // 5. Forgot Password Modal
    // =========================================================================
    const forgotPasswordLink = document.getElementById('forgotPasswordLink');
    const forgotModal = document.getElementById('forgotPasswordModal');
    const closeModalBtn = document.getElementById('closeForgotModalBtn');
    const forgotForm = document.getElementById('forgotPasswordForm');

    if (forgotPasswordLink && forgotModal) {
        forgotPasswordLink.addEventListener('click', (e) => {
            e.preventDefault();
            forgotModal.classList.add('active');
        });

        if (closeModalBtn) {
            closeModalBtn.addEventListener('click', () => {
                forgotModal.classList.remove('active');
            });
        }

        forgotModal.addEventListener('click', (e) => {
            if (e.target === forgotModal) {
                forgotModal.classList.remove('active');
            }
        });

        if (forgotForm) {
            forgotForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const resetEmail = document.getElementById('resetEmailInput').value;
                if (resetEmail) {
                    forgotModal.classList.remove('active');
                    showToast(`A password reset link has been sent to ${resetEmail}!`, 'success');
                    forgotForm.reset();
                }
            });
        }
    }
});
