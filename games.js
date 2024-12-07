// 游戏状态管理
export class GameManager {
    constructor() {
        this.currentGame = null;
        this.scores = {
            snake: [],
            minesweeper: []
        };
        this.gameState = {
            difficulty: 'normal'
        };
        
        this.loadHighScores();
    }

    updateScore(game, score) {
        this.scores[game].push({
            score,
            date: new Date().toISOString(),
            difficulty: this.gameState.difficulty
        });
        this.scores[game].sort((a, b) => b.score - a.score);
        this.scores[game] = this.scores[game].slice(0, 10); // 保留前10名
        this.saveHighScores();
        this.updateScoreDisplay(game);
    }

    loadHighScores() {
        const savedScores = localStorage.getItem('gameHighScores');
        if (savedScores) {
            this.scores = JSON.parse(savedScores);
        }
    }

    saveHighScores() {
        localStorage.setItem('gameHighScores', JSON.stringify(this.scores));
    }

    updateScoreDisplay(game) {
        const scoreboardDiv = document.querySelector(`#${game}Scoreboard`);
        if (!scoreboardDiv) return;

        const scoresList = this.scores[game]
            .map((score, index) => `
                <li>
                    ${index + 1}. ${score.score}分 
                    [${score.difficulty}] 
                    ${new Date(score.date).toLocaleDateString()}
                </li>
            `)
            .join('');

        scoreboardDiv.innerHTML = `
            <h3>排行榜</h3>
            <ul>${scoresList}</ul>
        `;
    }
} 