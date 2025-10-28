// app.js - Main application logic (Realtime Database)
document.addEventListener('DOMContentLoaded', function() {
    const auth = firebase.auth();
    const database = firebase.database();
    
    // UI Elements
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const createRawBtn = document.getElementById('createRawBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const userInfo = document.getElementById('userInfo');
    const userName = document.getElementById('userName');
    const userBadge = document.getElementById('userBadge');
    const adminLink = document.getElementById('adminLink');
    const heroCreateBtn = document.getElementById('heroCreateBtn');
    const communityCreateBtn = document.getElementById('communityCreateBtn');
    
    // Create Raw Section
    const createRawSection = document.getElementById('createRawSection');
    const rawForm = document.getElementById('rawForm');
    const cancelCreateBtn = document.getElementById('cancelCreateBtn');
    const privateKeyGroup = document.getElementById('privateKeyGroup');
    const copyCodeBtn = document.getElementById('copyCodeBtn');
    
    // Raw List
    const rawList = document.getElementById('rawList');
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    
    // Stats
    const totalRaws = document.getElementById('totalRaws');
    const totalUsers = document.getElementById('totalUsers');
    const privatePercentage = document.getElementById('privatePercentage');
    const communityUsers = document.getElementById('communityUsers');
    const communityRaws = document.getElementById('communityRaws');
    const communityViews = document.getElementById('communityViews');
    
    // Auth state listener
    auth.onAuthStateChanged((user) => {
        if (user) {
            // User is signed in
            loginBtn.style.display = 'none';
            registerBtn.style.display = 'none';
            createRawBtn.style.display = 'inline-block';
            logoutBtn.style.display = 'inline-block';
            userInfo.style.display = 'flex';
            userName.textContent = user.displayName || user.email;
            
            // Check if user is admin
            database.ref('users/' + user.uid).once('value').then((snapshot) => {
                const userData = snapshot.val();
                if (userData && userData.isAdmin) {
                    userBadge.style.display = 'inline-block';
                    adminLink.style.display = 'block';
                }
            });
            
            // Update create buttons
            heroCreateBtn.onclick = showCreateRaw;
            communityCreateBtn.onclick = showCreateRaw;
        } else {
            // User is signed out
            loginBtn.style.display = 'inline-block';
            registerBtn.style.display = 'inline-block';
            createRawBtn.style.display = 'none';
            logoutBtn.style.display = 'none';
            userInfo.style.display = 'none';
            adminLink.style.display = 'none';
            
            // Update create buttons to redirect to login
            heroCreateBtn.onclick = function() {
                window.location.href = 'auth/login.html';
            };
            communityCreateBtn.onclick = function() {
                window.location.href = 'auth/login.html';
            };
        }
        
        loadRaws();
        updateStats();
    });
    
    // Logout handler
    logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        auth.signOut();
    });
    
    // Create Raw handlers
    createRawBtn.addEventListener('click', showCreateRaw);
    
    function showCreateRaw(e) {
        if (e) e.preventDefault();
        createRawSection.style.display = 'block';
        createRawSection.scrollIntoView({ behavior: 'smooth' });
    }
    
    cancelCreateBtn.addEventListener('click', () => {
        createRawSection.style.display = 'none';
    });
    
    // Visibility radio buttons
    document.querySelectorAll('input[name="visibility"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            privateKeyGroup.style.display = e.target.value === 'private' ? 'block' : 'none';
        });
    });
    
    // Copy code button
    copyCodeBtn.addEventListener('click', () => {
        const codeTextarea = document.getElementById('rawCode');
        codeTextarea.select();
        document.execCommand('copy');
        alert('Código copiado!');
    });
    
    // Form submission
    rawForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const user = auth.currentUser;
        if (!user) {
            alert('Você precisa estar logado para criar um raw.');
            return;
        }
        
        const title = document.getElementById('rawTitle').value;
        const description = document.getElementById('rawDescription').value;
        const code = document.getElementById('rawCode').value;
        const visibility = document.querySelector('input[name="visibility"]:checked').value;
        const privateKey = document.getElementById('privateKey').value;
        
        if (!title || !code) {
            alert('Título e código são obrigatórios.');
            return;
        }
        
        try {
            const rawId = database.ref().child('raws').push().key;
            const rawData = {
                title: title,
                description: description,
                code: code,
                visibility: visibility,
                privateKey: visibility === 'private' ? privateKey : '',
                authorId: user.uid,
                authorName: user.displayName || user.email,
                createdAt: Date.now(),
                views: 0
            };
            
            await database.ref('raws/' + rawId).set(rawData);
            
            alert('Raw criado com sucesso! ID: ' + rawId);
            rawForm.reset();
            createRawSection.style.display = 'none';
            loadRaws();
            updateStats();
            
        } catch (error) {
            console.error('Erro ao criar raw:', error);
            alert('Erro ao criar raw. Tente novamente.');
        }
    });
    
    // Load raws
    async function loadRaws() {
        try {
            const snapshot = await database.ref('raws').orderByChild('createdAt').limitToLast(10).once('value');
            
            if (!snapshot.exists()) {
                rawList.innerHTML = '<div class="text-center"><p class="text-muted">Nenhum raw encontrado.</p></div>';
                loadMoreBtn.style.display = 'none';
                return;
            }
            
            rawList.innerHTML = '';
            const raws = [];
            
            snapshot.forEach((childSnapshot) => {
                raws.push({
                    id: childSnapshot.key,
                    ...childSnapshot.val()
                });
            });
            
            // Ordenar por data (mais recentes primeiro)
            raws.sort((a, b) => b.createdAt - a.createdAt);
            
            raws.forEach(raw => {
                if (raw.visibility === 'public') {
                    const rawElement = createRawElement(raw.id, raw);
                    rawList.appendChild(rawElement);
                }
            });
            
            if (raws.length === 0) {
                rawList.innerHTML = '<div class="text-center"><p class="text-muted">Nenhum raw público encontrado.</p></div>';
            }
            
        } catch (error) {
            console.error('Erro ao carregar raws:', error);
            rawList.innerHTML = '<div class="text-center"><p class="text-muted">Erro ao carregar raws.</p></div>';
        }
    }
    
    function createRawElement(id, raw) {
        const div = document.createElement('div');
        div.className = 'raw-item';
        div.innerHTML = `
            <div class="raw-header">
                <h3 class="raw-title">${escapeHtml(raw.title)}</h3>
                <span class="raw-visibility ${raw.visibility}">
                    <i class="fas ${raw.visibility === 'private' ? 'fa-lock' : 'fa-globe'}"></i>
                    ${raw.visibility === 'private' ? 'Privado' : 'Público'}
                </span>
            </div>
            <p class="raw-description">${escapeHtml(raw.description || 'Sem descrição')}</p>
            <div class="raw-meta">
                <span class="raw-author"><i class="fas fa-user"></i> ${escapeHtml(raw.authorName)}</span>
                <span class="raw-views"><i class="fas fa-eye"></i> ${raw.views || 0} visualizações</span>
                <span class="raw-date"><i class="fas fa-calendar"></i> ${formatDate(raw.createdAt)}</span>
            </div>
            <div class="raw-actions">
                <a href="api/raw?id=${id}" class="btn btn-outline btn-sm" target="_blank">
                    <i class="fas fa-external-link-alt"></i> Ver Raw
                </a>
                <button class="btn btn-outline btn-sm copy-raw-btn" data-id="${id}">
                    <i class="fas fa-copy"></i> Copiar Loadstring
                </button>
            </div>
        `;
        
        // Add copy link functionality
        div.querySelector('.copy-raw-btn').addEventListener('click', function() {
            const rawUrl = `${window.location.origin}/api/raw?id=${id}`;
            
            // Copia o loadstring COMPLETO
            const loadstringCode = `loadstring(game:HttpGet("${rawUrl}"))()`;
            
            navigator.clipboard.writeText(loadstringCode).then(() => {
                alert('Loadstring copiado! Cole no executor.');
            }).catch(err => {
                // Fallback para navegadores que não suportam clipboard API
                const textArea = document.createElement('textarea');
                textArea.value = loadstringCode;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                alert('Loadstring copiado! Cole no executor.');
            });
        });
        
        return div;
    }
    
    // Load more button (simplificado para Realtime Database)
    loadMoreBtn.addEventListener('click', (e) => {
        e.preventDefault();
        loadRaws();
    });
    
    // Update stats
    async function updateStats() {
        try {
            // Total raws
            const rawsSnapshot = await database.ref('raws').once('value');
            const totalRawsCount = rawsSnapshot.numChildren();
            totalRaws.textContent = totalRawsCount;
            communityRaws.textContent = totalRawsCount;
            
            // Private percentage
            let privateRaws = 0;
            let totalViews = 0;
            
            rawsSnapshot.forEach((childSnapshot) => {
                const raw = childSnapshot.val();
                if (raw.visibility === 'private') {
                    privateRaws++;
                }
                totalViews += raw.views || 0;
            });
            
            const privatePercent = totalRawsCount > 0 ? Math.round((privateRaws / totalRawsCount) * 100) : 0;
            privatePercentage.textContent = `${privatePercent}%`;
            communityViews.textContent = totalViews;
            
            // Total users
            const usersSnapshot = await database.ref('users').once('value');
            const totalUsersCount = usersSnapshot.numChildren();
            totalUsers.textContent = totalUsersCount;
            communityUsers.textContent = totalUsersCount;
            
        } catch (error) {
            console.error('Erro ao carregar estatísticas:', error);
        }
    }
    
    // Utility functions
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    function formatDate(timestamp) {
        if (!timestamp) return 'Data desconhecida';
        const date = new Date(timestamp);
        return date.toLocaleDateString('pt-BR');
    }
});
