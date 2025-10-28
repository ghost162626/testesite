// admin-main.js - Admin panel logic (Realtime Database)
document.addEventListener('DOMContentLoaded', function() {
    const auth = firebase.auth();
    const database = firebase.database();
    
    const adminUser = document.getElementById('adminUser');
    const adminLogout = document.getElementById('adminLogout');
    const adminTotalRaws = document.getElementById('adminTotalRaws');
    const adminTotalUsers = document.getElementById('adminTotalUsers');
    const adminTotalViews = document.getElementById('adminTotalViews');
    const adminPrivateRaws = document.getElementById('adminPrivateRaws');
    
    // Check admin access
    auth.onAuthStateChanged(async (user) => {
        if (!user) {
            window.location.href = '../auth/login.html';
            return;
        }
        
        const userSnapshot = await database.ref('users/' + user.uid).once('value');
        const userData = userSnapshot.val();
        
        if (!userData || !userData.isAdmin) {
            alert('Acesso negado. Apenas administradores podem acessar esta página.');
            window.location.href = '../index.html';
            return;
        }
        
        adminUser.textContent = user.displayName || user.email;
        loadAdminStats();
    });
    
    // Logout
    adminLogout.addEventListener('click', () => {
        auth.signOut();
        window.location.href = '../index.html';
    });
    
    // Load stats
    async function loadAdminStats() {
        try {
            // Total raws
            const rawsSnapshot = await database.ref('raws').once('value');
            const totalRaws = rawsSnapshot.numChildren();
            adminTotalRaws.textContent = totalRaws;
            
            // Total users
            const usersSnapshot = await database.ref('users').once('value');
            const totalUsers = usersSnapshot.numChildren();
            adminTotalUsers.textContent = totalUsers;
            
            // Total views and private raws
            let totalViews = 0;
            let privateRaws = 0;
            
            rawsSnapshot.forEach((childSnapshot) => {
                const raw = childSnapshot.val();
                totalViews += raw.views || 0;
                if (raw.visibility === 'private') {
                    privateRaws++;
                }
            });
            
            adminTotalViews.textContent = totalViews;
            adminPrivateRaws.textContent = privateRaws;
            
        } catch (error) {
            console.error('Erro ao carregar estatísticas:', error);
        }
    }
});
