const path = require('path');
const express = require('express');
const mysql = require('mysql2/promise');
require('dotenv').config();

const app = express();
const port = Number(process.env.PORT || 3000);
const pool = mysql.createPool({
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'detona',
    password: process.env.DB_PASSWORD || 'detona',
    database: process.env.DB_NAME || 'detona_ralph',
    waitForConnections: true,
    connectionLimit: 10,
});

app.use(express.json());
app.use(express.static(__dirname));

app.post('/api/players', async (request, response) => {
    const name = typeof request.body.name === 'string' ? request.body.name.trim() : '';
    if (!name || name.length > 80) {
        return response.status(400).json({ error: 'Informe um nome entre 1 e 80 caracteres.' });
    }

    try {
        const [result] = await pool.execute(
            'INSERT INTO players (name) VALUES (?) ON DUPLICATE KEY UPDATE id = LAST_INSERT_ID(id)',
            [name],
        );
        return response.status(201).json({ player: { id: result.insertId, name } });
    } catch (error) {
        console.error(error);
        return response.status(500).json({ error: 'Não foi possível cadastrar o jogador.' });
    }
});

app.post('/api/scores', async (request, response) => {
    const playerId = Number(request.body.playerId);
    const score = Number(request.body.score);
    if (!Number.isInteger(playerId) || !Number.isInteger(score) || playerId < 1 || score < 0) {
        return response.status(400).json({ error: 'Jogador ou pontuação inválidos.' });
    }

    try {
        await pool.execute('INSERT INTO scores (player_id, score) VALUES (?, ?)', [playerId, score]);
        return response.status(201).json({ saved: true });
    } catch (error) {
        console.error(error);
        return response.status(500).json({ error: 'Não foi possível salvar a pontuação.' });
    }
});

app.get('/api/ranking', async (_request, response) => {
    try {
        const [rows] = await pool.execute(
            'SELECT players.name, MAX(scores.score) AS score FROM scores JOIN players ON players.id = scores.player_id GROUP BY players.id, players.name ORDER BY score DESC LIMIT 10',
        );
        return response.json(rows);
    } catch (error) {
        console.error(error);
        return response.status(500).json({ error: 'Não foi possível carregar o ranking.' });
    }
});

app.listen(port, () => console.log(`Jogo disponível em http://localhost:${port}`));