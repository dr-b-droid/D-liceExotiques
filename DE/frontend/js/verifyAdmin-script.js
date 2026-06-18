let attemptCount = 0;
        const MAX_ATTEMPTS = 5;

        const form = document.getElementById('verificationForm');
        const codeInput = document.getElementById('adminCode');
        const statusMessage = document.getElementById('statusMessage');
        const submitBtn = document.getElementById('submitBtn');

        // Initialisation des icones
        feather.replace();

        // Vérifier le statut admin au chargement
        checkAdminStatus();

        async function checkAdminStatus() {
            try {
                const response = await fetch('/api/admin/auth/status', {
                    credentials: 'include'
                });
                const data = await response.json();

                if (data.authenticated) {
                    // Déjà authentifié, rediriger
                    window.location.href = '/admin';
                }
            } catch (error) {
                console.error('Erreur lors de la vérification du statut:', error);
            }
        }

        // Focus automatique sur l'input
        codeInput.focus();

        // Gestion de la soumission du formulaire
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const enteredCode = codeInput.value.trim();

            // Vérifier si l'input est vide
            if (!enteredCode) {
                showError('Veuillez entrer un code');
                return;
            }

            // Vérifier le nombre de tentatives
            if (attemptCount >= MAX_ATTEMPTS) {
                showError('Trop de tentatives échouées. Veuillez réessayer plus tard.');
                codeInput.disabled = true;
                submitBtn.disabled = true;
                return;
            }

            // Désactiver le bouton pendant la vérification
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span>Vérification...</span>';

            try {
                const response = await fetch('/api/admin/auth/verify', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    credentials: 'include',
                    body: JSON.stringify({ code: enteredCode })
                });

                const data = await response.json();

                if (data.success) {
                    // Code correct
                    hideError();
                    showSuccess(data.name, data.role);
                    
                    // Redirection après 1.5s
                    setTimeout(() => {
                        window.location.href = '/admin';
                    }, 1500);
                } else {
                    // Code incorrect
                    attemptCount++;
                    const remainingAttempts = MAX_ATTEMPTS - attemptCount;
                    
                    if (remainingAttempts > 0) {
                        showError(`Code incorrect. Il vous reste ${remainingAttempts} tentative(s)`);
                    } else {
                        showError('Trop de tentatives échouées. Accès bloqué.');
                        codeInput.disabled = true;
                        submitBtn.disabled = true;
                    }
                    
                    // Animation de secousse
                    codeInput.classList.add('shake');
                    setTimeout(() => {
                        codeInput.classList.remove('shake');
                    }, 500);
                    
                    // Vider l'input
                    codeInput.value = '';
                    codeInput.focus();
                    
                    // Réactiver le bouton
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = `
                        <span>Accéder au Dashboard</span>
                        <i data-feather="arrow-right" width="24" height="24"></i>
                    `;
                    feather.replace();
                }
            } catch (error) {
                console.error('Erreur lors de la vérification:', error);
                showError('Erreur de connexion. Veuillez réessayer.');
                
                // Réactiver le bouton
                submitBtn.disabled = false;
                submitBtn.innerHTML = `
                    <span>Accéder au Dashboard</span>
                    <i data-feather="arrow-right" width="24" height="24"></i>
                `;
                feather.replace();
            }
        });

        // Fonction pour afficher une erreur
        function showError(message) {
            statusMessage.innerHTML = `
                <div class="bg-africanred/10 border border-africanred/30 rounded-xl p-4 flex items-center gap-3">
                    <i data-feather="alert-circle" class="text-africanred flex-shrink-0" width="20" height="20"></i>
                    <p class="text-africanred text-sm">${message}</p>
                </div>
            `;
            statusMessage.classList.remove('hidden');
            codeInput.classList.add('pulse-error');
            feather.replace();
        }

        // Fonction pour masquer l'erreur
        function hideError() {
            statusMessage.classList.add('hidden');
            codeInput.classList.remove('pulse-error');
        }

        // Fonction pour afficher le succès
        function showSuccess(name, role) {
            codeInput.classList.remove('pulse-error');
            codeInput.classList.add('border-emerald');
            codeInput.disabled = true;
            
            // Changer l'icone
            const lockIcon = document.getElementById("lock");
            lockIcon.outerHTML = '<i data-feather="unlock" class="text-emerald" width="24" height="24"></i>';
            feather.replace();
            
            // Message de succès
            statusMessage.innerHTML = `
                <div class="bg-emerald/10 border border-emerald/30 rounded-xl p-4 flex items-center gap-3">
                    <i data-feather="check-circle" class="text-emerald flex-shrink-0" width="20" height="20"></i>
                    <div class="text-emerald text-sm">
                        <p class="font-medium">Authentification réussie !</p>
                        <p class="text-emerald/80 mt-1">Bienvenue!</p>
                        <p class="text-emerald/60 text-xs mt-1">Redirection en cours...</p>
                    </div>
                </div>
            `;
            statusMessage.classList.remove('hidden');
            feather.replace();
            
            // Mettre à jour le bouton
            submitBtn.innerHTML = `
                <span>Authentifié</span>
                <i data-feather="check" width="24" height="24"></i>
            `;
            submitBtn.classList.remove('from-gold', 'to-gold/80');
            submitBtn.classList.add('from-emerald', 'to-emerald/80');
            feather.replace();
        }

        // Empêcher le copier-coller
        codeInput.addEventListener('paste', (e) => {
            e.preventDefault();
            showError('Le copier-coller est désactivé pour des raisons de sécurité');
        });

        // Réinitialiser l'erreur quand l'utilisateur tape
        codeInput.addEventListener('input', () => {
            if (!statusMessage.innerHTML.includes('Authentification réussie')) {
                hideError();
            }
        });