const state = {
    view: {
        squares: document.querySelectorAll('.square'),
        enemy: document.querySelector('.enemy'),
        timeLeft: document.querySelector('#time-left'),
        score: document.querySelector('#score'),
        lives: document.querySelector('#lives'), // Adiciona o elemento para exibir as vidas
    },
    values: {
        timerId: null,
        gameVelocity: 1000,
        countDownTimerId: null,
        velocityTimerId: null,
        hitPosition: 0,
        result: 0,
        currentTime: 60,
        lives: 3, // Adiciona o número inicial de vidas
        running: false,
        enemyTimer: null,
        lockEnemy: false,
        player: null,
        scoreSaved: false,
    }

};
//Corrigir todo o sistema de tempo do jogo.
//Corrigir a contagem regressiva.
//Impedir que o tempo fique negativo.
//Encerrar o jogo automaticamente quando chegar em 00.
//Garantir que o setInterval seja limpo (clearInterval) ao finalizar a partida.
//Exibir o tempo corretamente (ex.: 30, 29, 28... ou 00:30, 00:29).
//Não alterar nenhuma outra mecânica do jogo.
//Critérios de aceitação
//O tempo nunca fica abaixo de 0.
//O jogo termina exatamente quando o tempo chega a 0.
//O cronômetro para de executar após o Game Over.
function countDown() {
    if (state.values.currentTime > 0) {
        state.values.currentTime--;
        state.view.timeLeft.textContent = state.values.currentTime;
    } else {
    state.values.running = false;

    clearInterval(state.values.countDownTimerId);
    clearTimeout(state.values.enemyTimer);

    state.view.timeLeft.textContent = 0;

    setTimeout(() => {
        showGameOverModal();
    }, 300);
}
}
/*Revisar toda a lógica de perda de vidas.
Garantir que apenas uma vida seja perdida por erro.
Atualizar imediatamente o indicador de vidas na interface.
Exibir um feedback visual ao perder uma vida (ex.: coração piscando, animação ou efeito de dano).
Impedir que as vidas fiquem negativas.
Encerrar a partida automaticamente quando as vidas chegarem a zero.
Exibir uma tela de Game Over com opção de reiniciar.
Critérios de aceitação
Cada erro reduz exatamente uma vida.
As vidas nunca ficam abaixo de zero.
O jogador recebe um feedback visual claro ao perder uma vida.
O jogo termina corretamente quando não restarem vidas.*/
// fazer o som de perda de vida tocar antes do alerta
function decreaseLife() {
    if (state.values.lives > 0) {
        state.values.lives--;
        state.view.lives.textContent = `x${state.values.lives}`;
        playSound('lost');

        if (state.values.lives === 0) {
            state.values.running = false;
            clearInterval(state.values.countDownTimerId);
            clearInterval(state.values.velocityTimerId);
            clearTimeout(state.values.enemyTimer);

            setTimeout(() => {
                showGameOverModal();
            }, 300);
        }
    }
}


function resetGame() {

    // Para tudo
    state.values.running = false;

        clearTimeout(state.values.enemyTimer);
        clearInterval(state.values.countDownTimerId);
        clearInterval(state.values.velocityTimerId);

    // Limpa as imagens
    state.view.squares.forEach(square => {
        square.classList.remove(
            'enemy',
            'square-hit',
            'square-error'
        );
    });

    // Reseta os valores
    state.values.lives = 3;
    state.values.result = 0;
    state.values.currentTime = 60;
    state.values.gameVelocity = 1000;
    state.values.hitPosition = 0;
    state.values.lockEnemy = false;
    state.values.scoreSaved = false;

    // Atualiza a interface
    state.view.lives.textContent = `x${state.values.lives}`;
    state.view.score.textContent = state.values.result;
    state.view.timeLeft.textContent = state.values.currentTime;

    // Reinicia o jogo
    state.values.running = true;

    moveEnemy();

        state.values.countDownTimerId = setInterval(countDown, 1000);
        state.values.velocityTimerId = setInterval(increaseGameVelocity, 1000);
}
/* Corrigir a lógica que controla a velocidade de aparecimento do Ralph.

Escopo
Identificar por que a velocidade aumenta continuamente.
Remover incrementos sem critério.
Definir uma regra clara de progressão.

Exemplo:

Tempo restante	Intervalo
60–41 s	1000 ms
40–21 s	800 ms
20–11 s	600 ms
10–0 s	450 ms */
function increaseGameVelocity() {
    let oldVelocity = state.values.gameVelocity;

    if (state.values.currentTime <= 40 && state.values.currentTime > 20) {
        state.values.gameVelocity = 800;
    } else if (state.values.currentTime <= 20 && state.values.currentTime > 10) {
        state.values.gameVelocity = 600;
    } else if (state.values.currentTime <= 10) {
        state.values.gameVelocity = 450;
    }

    if (oldVelocity !== state.values.gameVelocity) {
        moveEnemy(); // reinicia com nova velocidade
    }
}

function playSound(audioname) {
    let audio = new Audio(`./src/audios/${audioname}.mp3`);
    audio.volume = 0.2;
    audio.play();
}

function ramdomSquare() {
    if (state.values.lockEnemy) return;

    state.view.squares.forEach((square) => {
        square.classList.remove(
            'enemy',
            'square-hit',
            'square-error'
        );
    });

    let randomSquare = Math.floor(Math.random() * 9);
    let square = state.view.squares[randomSquare];

    square.classList.add('enemy');
    state.values.hitPosition = square.id;
}

function moveEnemy() {
    clearTimeout(state.values.enemyTimer);

    if (!state.values.running) return;

    state.values.enemyTimer = setTimeout(() => {
        ramdomSquare();
        moveEnemy();
    }, state.values.gameVelocity);
}
/*
Evitar pontuação duplicada.
Garantir um único ponto por acerto.
Atualizar corretamente a interface.
Centralizar a lógica de pontuação.
Critérios de aceitação
Cada inimigo só pode ser pontuado uma vez.
O placar permanece consistente durante toda a partida.
*/
function addListenerHitBox() {
    state.view.squares.forEach((square) => {
        square.addEventListener('mousedown', () => {
            if (!state.values.running || state.values.lockEnemy) return;

            if (square.id === state.values.hitPosition) {
                state.values.lockEnemy = true;

                square.classList.remove('enemy');
                square.classList.add('square-hit');

                state.values.result++;
                state.view.score.textContent = state.values.result;

                playSound('hit');

                state.values.hitPosition = 0;

                setTimeout(() => {
                    square.classList.remove('square-hit');
                    state.values.lockEnemy = false;
                }, 300);
            } else {

                state.values.lockEnemy = true;

                square.classList.add('square-error');

                setTimeout(() => {
                    square.classList.remove('square-error');
                    state.values.lockEnemy = false;
                }, 500);

                decreaseLife();
            }
        });
    });
}

function init() {
    state.values.running = true;

    state.view.lives.textContent = `x${state.values.lives}`;
    state.view.timeLeft.textContent = state.values.currentTime;

    moveEnemy();

    addListenerHitBox();

    state.values.countDownTimerId =
        setInterval(countDown, 1000);

    state.values.velocityTimerId = setInterval(increaseGameVelocity, 1000);
}
async function showGameOverModal() {
    const modal = document.getElementById('gameOverModal');
    const scoreText = document.getElementById('finalScore');
    const music = document.getElementById('gameOverMusic');

    scoreText.textContent = `Pontuação final: ${state.values.result}`;

    await saveScore();

    modal.classList.remove('hidden');
    music.play();

    document.getElementById('restartBtn').onclick = () => {
        music.pause();
        music.currentTime = 0;
        modal.classList.add('hidden');
        resetGame();
    };

    document.getElementById('rankingBtn').onclick = showRanking;
    document.getElementById('backToGameOverBtn').onclick = () => {
        document.querySelector('#rankingView').classList.add('hidden');
        document.querySelector('#gameOverView').classList.remove('hidden');
    };

    document.getElementById('changePlayerBtn').onclick = () => {
        music.pause();
        music.currentTime = 0;
        modal.classList.add('hidden');
        document.querySelector('#playerError').textContent = '';
        document.querySelector('#playerName').value = '';
        document.querySelector('#playerModal').classList.remove('hidden');
    };
}

async function saveScore() {
    if (!state.values.player || state.values.scoreSaved) return true;

    state.values.scoreSaved = true;
    try {
        const response = await fetch('/api/scores', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                playerId: state.values.player.id,
                score: state.values.result,
            }),
        });

        if (!response.ok) throw new Error('Falha ao salvar pontuação');
        return true;
    } catch (error) {
        state.values.scoreSaved = false;
        console.error('Não foi possível salvar a pontuação:', error);
        return false;
    }
}

async function showRanking() {
    const list = document.querySelector('#rankingList');
    const error = document.querySelector('#rankingError');
    list.innerHTML = '';
    error.textContent = '';

    try {
        const response = await fetch('/api/ranking');
        const ranking = await response.json();
        if (!response.ok) throw new Error(ranking.error || 'Não foi possível carregar o ranking');

        ranking.forEach((entry) => {
            const item = document.createElement('li');
            item.textContent = `${entry.name} - ${entry.score} pontos`;
            list.appendChild(item);
        });

        if (!ranking.length) list.innerHTML = '<li>Nenhuma pontuação registrada.</li>';
        document.querySelector('#gameOverView').classList.add('hidden');
        document.querySelector('#rankingView').classList.remove('hidden');
    } catch (requestError) {
        error.textContent = requestError.message;
    }
}

async function registerPlayer(event) {
    event.preventDefault();
    const input = document.querySelector('#playerName');
    const error = document.querySelector('#playerError');
    const hasCurrentPlayer = Boolean(state.values.player);

    try {
        const response = await fetch('/api/players', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: input.value.trim() }),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Não foi possível cadastrar o jogador');

        state.values.player = data.player;
        document.querySelector('#playerModal').classList.add('hidden');
        if (hasCurrentPlayer) {
            resetGame();
        } else {
            init();
        }
    } catch (requestError) {
        error.textContent = requestError.message;
    }
}

document.querySelector('#playerForm').addEventListener('submit', registerPlayer);