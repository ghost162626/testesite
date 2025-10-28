// api/raw.js - API route do Vercel
const { default: fetch } = require('node-fetch');

export default async function handler(req, res) {
    // Permitir CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');

    const { id } = req.query;

    if (!id) {
        return res.status(400).send('print("ERRO: ID não especificado")');
    }

    try {
        // Buscar do Firebase Realtime Database
        const firebaseUrl = `https://coderaw-2025-default-rtdb.firebaseio.com/raws/${id}.json`;
        
        const response = await fetch(firebaseUrl);
        const data = await response.json();

        if (!data || data === null) {
            return res.status(404).send('print("ERRO: Código não encontrado")');
        }

        // Retornar APENAS O TEXTO do campo "code"
        const code = data.code || 'print("Código vazio")';
        
        // Atualizar views (opcional)
        const currentViews = data.views || 0;
        await fetch(firebaseUrl, {
            method: 'PATCH',
            body: JSON.stringify({ views: currentViews + 1 }),
            headers: { 'Content-Type': 'application/json' }
        });

        res.send(code);

    } catch (error) {
        console.error('Erro:', error);
        res.status(500).send('print("ERRO: Não foi possível carregar o código")');
    }
}
