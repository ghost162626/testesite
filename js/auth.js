// auth.js - Authentication logic (Realtime Database)
document.addEventListener('DOMContentLoaded', function() {
    const auth = firebase.auth();
    const database = firebase.database();
    
    // Login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            try {
                await auth.signInWithEmailAndPassword(email, password);
                window.location.href = '../index.html';
            } catch (error) {
                alert('Erro ao fazer login: ' + error.message);
            }
        });
    }
    
    // Register form
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const displayName = document.getElementById('displayName').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            
            if (password !== confirmPassword) {
                alert('As senhas não coincidem.');
                return;
            }
            
            try {
                const userCredential = await auth.createUserWithEmailAndPassword(email, password);
                const user = userCredential.user;
                
                // Update profile
                await user.updateProfile({
                    displayName: displayName
                });
                
                // Create user in Realtime Database
                await database.ref('users/' + user.uid).set({
                    displayName: displayName,
                    email: email,
                    createdAt: Date.now(),
                    isAdmin: false
                });
                
                window.location.href = '../index.html';
            } catch (error) {
                alert('Erro ao criar conta: ' + error.message);
            }
        });
    }
});