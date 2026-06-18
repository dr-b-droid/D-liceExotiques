// Initialize feather icons
feather.replace();

// Show/hide other reason field
document.getElementById('deleteReason').addEventListener('change', function(e) {
    const otherDiv = document.getElementById('otherReasonDiv');
    if (e.target.value === 'other') {
        otherDiv.style.display = 'block';
    } else {
        otherDiv.style.display = 'none';
    }
});

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

// Handle form submission
async function handleDeleteAccount(event) {
    event.preventDefault();
    
    const finalConfirmation = document.getElementById('finalConfirmation').value;
    
    if (finalConfirmation !== 'SUPPRIMER MON COMPTE') {
        const input = document.getElementById('finalConfirmation');
        input.classList.add('shake');
        if (typeof notify !== 'undefined') {
            notify.warning('Veuillez taper exactement "SUPPRIMER MON COMPTE"');
        } else {
            alert('Veuillez taper exactement "SUPPRIMER MON COMPTE"');
        }
        setTimeout(() => input.classList.remove('shake'), 500);
        return;
    }
    
    // Show final confirmation modal
    document.getElementById('confirmModal').classList.remove('hidden');
    document.getElementById('confirmModal').classList.add('flex');
}

// Close modal
function closeModal() {
    document.getElementById('confirmModal').classList.add('hidden');
    document.getElementById('confirmModal').classList.remove('flex');
}

// Confirm deletion
async function confirmDeletion() {
    const password = document.getElementById('confirmPassword').value;
    const reason = document.getElementById('deleteReason').value;
    const otherReason = document.getElementById('otherReason').value;
    
    const deleteButton = document.getElementById('deleteButton');
    deleteButton.disabled = true;
    deleteButton.innerHTML = '<i data-feather="loader" class="animate-spin" width="20" height="20"></i> Suppression...';
    feather.replace();

    try {
        const response = await window.api.deleteAccount({
            password: password,
            reason: reason,
            otherReason: reason === 'other' ? otherReason : null
        });

        if (response.success) {
            if (typeof notify !== 'undefined') {
                notify.success('Votre compte a été supprimé avec succès');
            } else {
                alert('Votre compte a été supprimé avec succès');
            }
            
            // Déconnecter l'utilisateur
            if (window.authManager) {
                window.authManager.currentUser = null;
            }
            
            setTimeout(() => {
                window.location.href = '/';
            }, 2000);
        } else {
            throw new Error(response.message || 'Erreur lors de la suppression');
        }
    } catch (error) {
        console.error('Error deleting account:', error);
        if (typeof notify !== 'undefined') {
            notify.error(error.message || 'Une erreur est survenue. Veuillez réessayer.');
        } else {
            alert(error.message || 'Une erreur est survenue. Veuillez réessayer.');
        }
        deleteButton.disabled = false;
        deleteButton.innerHTML = '<i data-feather="trash-2" width="20" height="20"></i> Supprimer définitivement';
        feather.replace();
        closeModal();
    }
}

// Check if user is authenticated
document.addEventListener('DOMContentLoaded', async function() {
    if (window.authManager) {
        const isAuth = await window.authManager.checkAuthStatus();
        if (!isAuth) {
            if (typeof notify !== 'undefined') {
                notify.warning('Vous devez être connecté pour accéder à cette page');
            }
            setTimeout(() => {
                window.location.href = '/auth?redirect=/deleteAccount';
            }, 1500);
        }
    }
    feather.replace();
});

// Export functions for global access
window.togglePassword = togglePassword;
window.handleDeleteAccount = handleDeleteAccount;
window.closeModal = closeModal;
window.confirmDeletion = confirmDeletion;