// Initialize feather icons
        feather.replace();

        // Form switching
        function switchForm(formType) {
            const loginForm = document.getElementById('loginForm');
            const signupForm = document.getElementById('signupForm');
            const loginTab = document.getElementById('loginTab');
            const signupTab = document.getElementById('signupTab');

            if (formType === 'login') {
                loginForm.classList.remove('form-hidden');
                loginForm.classList.add('form-visible');
                signupForm.classList.remove('form-visible');
                signupForm.classList.add('form-hidden');
                
                loginTab.classList.add('bg-gold', 'text-deepblack');
                loginTab.classList.remove('text-white/70');
                signupTab.classList.remove('bg-gold', 'text-deepblack');
                signupTab.classList.add('text-white/70');
            } else {
                signupForm.classList.remove('form-hidden');
                signupForm.classList.add('form-visible');
                loginForm.classList.remove('form-visible');
                loginForm.classList.add('form-hidden');
                
                signupTab.classList.add('bg-gold', 'text-deepblack');
                signupTab.classList.remove('text-white/70');
                loginTab.classList.remove('bg-gold', 'text-deepblack');
                loginTab.classList.add('text-white/70');
            }

            feather.replace();
        }

        // Toggle password visibility
        function togglePassword(inputId, button) {
            const input = document.getElementById(inputId);
            const icon = button.querySelector('i');
            
            if (input.type === 'password') {
                input.type = 'text';
                icon.setAttribute('data-feather', 'eye-off');
            } else {
                input.type = 'password';
                icon.setAttribute('data-feather', 'eye');
            }
            
            feather.replace();
        }

        // Password strength checker
        function checkPasswordStrength(password) {
            const strengthFill = document.getElementById('strengthFill');
            const strengthText = document.getElementById('strengthText');
            
            if (!strengthFill || !strengthText) return;

            let strength = 0;
            let message = '';
            
            // Reset classes
            strengthFill.className = 'strength-fill';
            
            if (password.length === 0) {
                strengthText.textContent = '';
                return;
            }
            
            // Check length
            if (password.length >= 8) strength++;
            if (password.length >= 12) strength++;
            
            // Check for numbers
            if (/\d/.test(password)) strength++;
            
            // Check for lowercase and uppercase
            if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
            
            // Check for special characters
            if (/[^A-Za-z0-9]/.test(password)) strength++;
            
            // Set strength level
            if (strength <= 2) {
                strengthFill.classList.add('strength-weak');
                message = 'Mot de passe faible';
            } else if (strength <= 4) {
                strengthFill.classList.add('strength-medium');
                message = 'Mot de passe moyen';
            } else {
                strengthFill.classList.add('strength-strong');
                message = 'Mot de passe fort';
            }
            
            strengthText.textContent = message;
        }

        // Handle login
        async function handleLogin(event) {
            event.preventDefault();
            const data = {
            email: document.getElementById('login-email').value,
            password: document.getElementById('login-password').value
            };
            const result = await authManager.login(data);
            if (!result.success) {
                notify.info(result.message || 'Identifiants incorrects');
                return;
            }

            notify.info('Connexion réussie');
            const urlParams = new URLSearchParams(window.location.search)
            setTimeout(()=>{
                window.location.href = urlParams.get("redirect")?urlParams.get("redirect"):'/';
            },2000)
        }

        // Handle signup
        async function handleSignup(event) {
            event.preventDefault();
            
            const firstname = document.getElementById('signup-firstname').value;
            const lastname = document.getElementById('signup-lastname').value;
            const email = document.getElementById('signup-email').value;
            const phone = document.getElementById('signup-phone').value;
            const password = document.getElementById('signup-password').value;
            const confirmPassword = document.getElementById('signup-confirm-password').value;
            
            const data = {
                firstName: document.getElementById('signup-firstname').value,
                lastName: document.getElementById('signup-lastname').value,
                email: document.getElementById('signup-email').value,
                phone: document.getElementById('signup-phone').value,
                password: document.getElementById('signup-password').value,
                confirmPassword: document.getElementById('signup-confirm-password').value
            };
            // Validate passwords match
            if (password !== confirmPassword) {
                notify.info('Les mots de passe ne correspondent pas !');
                return;
            }
            
            // Validate password strength
            if (password.length < 8) {
                notify.info('Le mot de passe doit contenir au moins 8 caractères !');
                return;
            }
            const result = await authManager.signup(data);

            if (!result.success) {
                notify.info(result.message);
                return;
            }
            notify.info('Inscription réussie ');
            const urlParams = new URLSearchParams(window.location.search)
            setTimeout(()=>{
                window.location.href = urlParams.get("redirect")?urlParams.get("redirect"):'/';
            },2000)
        }

        document.addEventListener('DOMContentLoaded', function() {
            const urlParams = new URLSearchParams(window.location.search);
            const formType = urlParams.get('form');
            
            if (formType === 'signup') {
                switchForm('signup');
            }
        });