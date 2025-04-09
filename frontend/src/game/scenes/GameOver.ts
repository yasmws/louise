import { EventBus } from '../EventBus';
import { Scene } from 'phaser';
import { userService } from '../../services/user';
import { roomService } from '../../services/room';
import { roundsService } from '../../services/rounds';

type GameSound = Phaser.Sound.NoAudioSound | Phaser.Sound.HTML5AudioSound | Phaser.Sound.WebAudioSound;

export class GameOver extends Scene {
    bgMusic: GameSound;
    winSound: GameSound;
    drawSound: GameSound;
    loseSound: GameSound;
    gameOverText: Phaser.GameObjects.Text;
    backButton: Phaser.GameObjects.Text;

    constructor() {
        super('GameOver');
    }

    preload() {
        this.load.audio('backgroundMusic', 'assets/audio/background.m4a');
        this.load.audio('winSound', 'assets/audio/winSound.mp3');
        
        this.load.font('Jacques Francois', 'assets/fonts/JacquesFrancois-Regular.ttf');
        this.load.font('Love Light', 'assets/fonts/LoveLight-Regular.ttf');
    }

    create() {
        // Toca a música de fundo
        if (!this.bgMusic) {
            this.bgMusic = this.sound.add('backgroundMusic', { loop: true, volume: 0.1 });
            this.bgMusic.play();
        }

        // Sons de vitória, empate e derrota
        this.winSound = this.sound.add('winSound');

        // Texto de Game Over
        this.gameOverText = this.add.text(512, 150, 'E quem ganhou foi...', {
            fontFamily: 'Jacques Francois',
            fontSize: '50px',
            color: '#C2A385',
            stroke: '#000000',
            strokeThickness: 5,
            shadow: { color: '#000000', fill: true, offsetX: 2, offsetY: 2, blur: 5 },
            letterSpacing: 5
        }).setOrigin(0.5).setDepth(100);

        // Pontuações dos jogadores
        const player1Score = roomService.getRoom().userPoints;
        const player2Score = roomService.getRoom().adversaryPoints;

        // Mostra os nomes e pontuações dos jogadores
        this.showPlayerScore(userService.getUser()?.name ?? "Jogador 1", player1Score, 300);
        this.showPlayerScore(roomService.getRoom().adversary ?? "Jogador 2", player2Score, 400);

        // Após 3 segundos, exibe o vencedor
        this.time.delayedCall(3000, () => {
            this.showWinner(player1Score, player2Score);
        });

        // Botão para voltar ao menu
        this.backButton = this.add.text(512, 600, 'Voltar ao Menu', {
            fontFamily: 'Jacques Francois',
            fontSize: 32,
            color: '#C2A385',
            stroke: '#000000',
            strokeThickness: 4,
            align: 'center',
            shadow: { color: '#000000', fill: true, offsetX: 2, offsetY: 2, blur: 2 }
        }).setOrigin(0.5).setInteractive();

        this.backButton.on('pointerdown', () => {
            this.changeScene();
        });

        this.backButton.on('pointerover', () => {
            this.backButton.setStyle({ color: '#E3B595' }); // Tom mais claro
        });

        this.backButton.on('pointerout', () => {
            this.backButton.setStyle({ color: '#C2A385' }); // Cor original
        });

        EventBus.emit('current-scene-ready', this);
    }

    private showPlayerScore(playerName: string, score: number, yPos: number) {
        // Adiciona o nome do jogador com um fundo decorativo
        const nameBackground = this.add.graphics();
        nameBackground.fillStyle(0xC2A385, 0.3);
        nameBackground.fillRoundedRect(512 - 200, yPos - 25, 400, 100, 15);
        nameBackground.setDepth(98);

        // Adiciona o nome do jogador
        this.add.text(512, yPos, playerName, {
            fontFamily: 'Jacques Francois',
            fontSize: '36px',
            color: '#6f4e37',
            stroke: '#ffffff',
            strokeThickness: 4,
            shadow: { color: '#000000', fill: true, offsetX: 2, offsetY: 2, blur: 2 },
            align: 'center'
        }).setOrigin(0.5).setDepth(99);

        // Adiciona a pontuação total
        this.add.text(512, yPos + 40, `${score} pontos em ${roundsService.rounds} rodadas`, {
            fontFamily: 'Jacques Francois',
            fontSize: '28px',
            color: '#000000',
            stroke: '#ffffff',
            strokeThickness: 3,
            align: 'center'
        }).setOrigin(0.5).setDepth(99);
    }

    private showWinner(player1Score: number, player2Score: number) {
        let winnerText: string;

        if (player1Score > player2Score) {
            winnerText = userService.getUser()?.name ?? "Jogador 1";
        } else if (player1Score < player2Score) {
            winnerText = roomService.getRoom().adversary ?? "Jogador 2";
        } else {
            winnerText = "Empate!";
        }

        this.gameOverText.setText(winnerText === "Empate!" ? winnerText : `${winnerText} venceu!`);

        if (winnerText === "Empate!") {
            if (this.drawSound) this.drawSound.play();
        } else if (winnerText === userService.getUser()?.name) {
            this.playWinSound();
        } else {
            this.playLoseSound();
        }
    }

    private playWinSound() {
        if (this.winSound) {
            this.winSound.play();
        }
    }

    private playLoseSound() {
        if (this.loseSound) {
            this.loseSound.play();
        }
    }

    private changeScene() {
        this.scene.start('MainMenu');
    }
}
