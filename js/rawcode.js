// rawcode.js - Pega o conteúdo do campo "code" do Firebase

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBrkKTDKcKA16a1fL4mR3VKjArmxBUb8ho",
  authDomain: "coderaw-2025.firebaseapp.com",
  databaseURL: "https://coderaw-2025-default-rtdb.firebaseio.com",
  projectId: "coderaw-2025",
  storageBucket: "coderaw-2025.firebasestorage.app",
  messagingSenderId: "134498624143",
  appId: "1:134498624143:web:706e250b656061732046fa",
  measurementId: "G-GV2X7STJQD"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);

// Pegar ID da URL
const urlParams = new URLSearchParams(window.location.search);
const codeId = urlParams.get('id');

console.log('Procurando código com ID:', codeId);

if (!codeId) {
    document.write('Erro: ID não especificado na URL');
} else {
    const database = firebase.database();
    
    // Buscar no Firebase Realtime Database
    database.ref('raws/' + codeId).once('value')
        .then((snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                console.log('Dados encontrados:', data);
                
                // MOSTRAR O CONTEÚDO DO CAMPO "code"
                const codeContent = data.code || 'Código vazio';
                console.log('Conteúdo do code:', codeContent);
                
                // Escrever APENAS o texto do campo "code"
                document.write(codeContent);
                
                // Atualizar visualizações
                const currentViews = data.views || 0;
                database.ref('raws/' + codeId + '/views').set(currentViews + 1);
                
            } else {
                console.log('Código não encontrado no Firebase');
                document.write('Erro: Código não encontrado');
            }
        })
        .catch((error) => {
            console.error('Erro Firebase:', error);
            document.write('Erro: Não foi possível carregar o código');
        });
}