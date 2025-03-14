import { EventBus } from '../EventBus';
import { Scene } from 'phaser';

export class Game extends Scene
{
    private background!: Phaser.GameObjects.Image;

    // Textos / elementos de interface
    private titleLouise!: Phaser.GameObjects.Text;
    private timerText!: Phaser.GameObjects.Text;
    private player1Text!: Phaser.GameObjects.Text;
    private player2Text!: Phaser.GameObjects.Text;
    private header!: Phaser.GameObjects.Graphics;
  
    // Enigmas
    private leftClueText!: Phaser.GameObjects.Text;
    private dotsPuzzle!: Phaser.GameObjects.Image;  // ou um grupo de círculos
    private asciiPuzzleText!: Phaser.GameObjects.Text;

    // Botão de finalizar fase
    private finishPhaseBtn!: Phaser.GameObjects.Text;

    // Timer
    private timeLeft: number = 60;
    private timerEvent!: Phaser.Time.TimerEvent;

    // Boxes
    private boxLouise!: Phaser.GameObjects.Image;
    private boxTimer: Phaser.GameObjects.Image;
    private boxPlayer1: Phaser.GameObjects.Image;
    private boxPlayer2: Phaser.GameObjects.Image;
    player1Progress: Phaser.GameObjects.Graphics;
    player2Progress: Phaser.GameObjects.Graphics;
    boxProgress1: Phaser.GameObjects.Image;
    boxProgress2: Phaser.GameObjects.Image;

    // Progresso dos jogadores
    private player1ProgressValue: number = 0; // Progresso inicial do Jogador 1
    private player2ProgressValue: number = 0; // Progresso inicial do Jogador 2
    boxClueText: Phaser.GameObjects.Image;
    boxBraille: Phaser.GameObjects.Image;
    textBraille: Phaser.GameObjects.Text;

    constructor ()
    {
        super('Game');
    }

    preload ()
    {
        // Carregue seus assets
        this.load.image('background', 'assets/background.png');
        this.load.image('dotsPuzzle', 'assets/dotsPuzzle.png');
        this.load.image('header1', 'assets/Header1.png');
        this.load.image('header2', 'assets/Header2.png');
        this.load.image('Behind', 'assets/Behind 1.png');
        this.load.image('Menu3CategF', 'assets/Menu3CategoriesFront.png');
        this.load.image('Menu3CategB', 'assets/Menu3CategoriesBehind.png');
        this.load.image('Menu2', 'assets/Menu2.png');
        this.load.image('Menu1', 'assets/Menu1.png');
        // Fonts
        this.load.font('Jacques Francois', 'assets/fonts/JacquesFrancois-Regular.ttf');
        this.load.font('Love Light', 'assets/fonts/LoveLight-Regular.ttf');
    }

    create ()
    {
        // --- Fundo da biblioteca ---
        this.background = this.add.image(512, 384, 'background');

        // --- Cabeçalho com pontinhos em degradê ---
        this.header = this.add.graphics();
        const headerWidth = 1080;
        const headerHeight = 100;
        const dotSpacing = 10;
        const dotRadius = 3;
        const rows = Math.floor(headerHeight / dotSpacing);
        const startColor = new Phaser.Display.Color(200, 150, 100);
        const endColor = new Phaser.Display.Color(111, 78, 55);

        for (let y = dotSpacing / 2, rowIndex = 0; y < headerHeight; y += dotSpacing, rowIndex++) {
            const interpolated = Phaser.Display.Color.Interpolate.ColorWithColor(startColor, endColor, rows - 1, rowIndex);
            const colorHex = Phaser.Display.Color.GetColor(interpolated.r, interpolated.g, interpolated.b);
            const alpha = Phaser.Math.Linear(1, 0, rowIndex / (rows - 1));

            for (let x = dotSpacing / 2; x < headerWidth; x += dotSpacing) {
                this.header.fillStyle(colorHex, alpha);
                this.header.fillCircle(x, y, dotRadius);
            }
        }
        this.header.setPosition(0, 0);

        // --- Título "Louise" ---
        this.titleLouise = this.add.text(512, 100, 'Louise', {
            fontFamily: 'Love Light',
            fontSize: '150px',
            color: '#C2A385',
            stroke: '#fffffff',
            strokeThickness: 5,
            shadow: { color: '#000000', fill: true, offsetX: 5, offsetY: 5, blur: 5 },
            letterSpacing: 5
        }).setOrigin(0.5);

        // --- Timer ---
        this.boxTimer = this.add.image(512, 200, 'header1').setDisplaySize(192, 60).setOrigin(0.5, 0.5);
        this.timerText = this.add.text(512, 200, '00:60', {
            fontFamily: 'Love Light',
            fontSize: '50px',
            color: '#000000',
        }).setOrigin(0.5);
        this.startTimer();

        // --- Textos de Jogadores ---
        this.boxPlayer1 = this.add.image(124, 30, 'header2')
            .setDisplaySize(150, 40)
            .setOrigin(0.5, 0.5);
        this.player1Text = this.add.text(124, 30, 'Jogador 1', {
            fontFamily: 'Jacques Francois',
            fontSize: '20px',
            color: '#000000'
        }).setOrigin(0.5);

        this.boxPlayer2 = this.add.image(924, 30, 'header2')
            .setDisplaySize(150, 40)
            .setOrigin(0.5, 0.5);
        this.player2Text = this.add.text(924, 30, 'Jogador 2', {
            fontFamily: 'Jacques Francois',
            fontSize: '20px',
            color: '#000000'
        }).setOrigin(0.5);

        // --- Barras de Progresso ---
        this.boxProgress1 = this.add.image(174, 65, 'Behind')
            .setDisplaySize(300, 50)
            .setOrigin(0.5, 0.5);
        this.player1Progress = this.add.graphics();
        this.updateProgressBar(this.player1Progress, 174, 80, this.player1ProgressValue);

        this.boxProgress2 = this.add.image(874, 65, 'Behind')
            .setDisplaySize(300, 50)
            .setOrigin(0.5, 0.5);
        this.player2Progress = this.add.graphics();
        this.updateProgressBar(this.player2Progress, 674, 10, this.player2ProgressValue);

        // --- Enigma ---
        const clues = [
            'Siga onde as folhas\ncontam histórias\ne os sussurros\nsão de papel.',
            'Procure onde o sol\nbeija a terra\ne as sombras\ndançam.',
            'Va onde as estrelas\nbrilham mais forte\ne os sonhos\nganham vida.'
        ];

        const randomClue = clues[Math.floor(Math.random() * clues.length)];

        this.boxClueText = this.add.image(200, 330, 'Menu1')
            .setDisplaySize(303.8, 308.7) // 434 441
            .setOrigin(0.5, 0.5);

        this.leftClueText = this.add.text(200, 330, randomClue, {
            fontFamily: 'Love Light',
            fontSize: '36px',
            color: '#000000',
            padding: { x: 10, y: 10 },
            align: 'center'
        }).setOrigin(0.5);

        this.dotsPuzzle = this.add.image(512, 375, 'Menu2')
            .setDisplaySize(209.3, 247.8) // 434 441
            .setOrigin(0.5);

        // --- Enigma ASCII ---
        const asciiPuzzle = this.translateToBraille(randomClue);

        this.boxBraille = this.add.image(844, 330, 'Menu1')
            .setDisplaySize(303.8, 308.7) // 434 441
            .setOrigin(0.5, 0.5);

        const brailleChars = asciiPuzzle.split('');
        const charWidth = 20;
        const charHeight = 30;
        const startX = 824 - (charWidth * 8) / 2;
        const startY = 300 - charHeight / 2;

        brailleChars.forEach((char, index) => {
            const x = startX + (index % 8) * charWidth;
            const y = startY + Math.floor(index / 8) * charHeight;

            // Draw rectangle
            this.add.graphics()
            .fillRect(x, y, charWidth, charHeight)
            .lineStyle(1, 0x000000, 1)
            .strokeRect(x, y, charWidth, charHeight);

            // Add text
            this.add.text(x + charWidth / 2, y + charHeight / 2, char, {
            fontFamily: 'Love Light',
            fontSize: '16px',
            color: '#000000',
            }).setOrigin(0.5);
        });



        // --- Botão "Finalizar Fase" ---
        this.finishPhaseBtn = this.add.text(512, 550, 'Finalizar Fase', {
            fontFamily: 'Arial',
            fontSize: '28px',
            color: '#ffffff',
            backgroundColor: '#6f4e37',
            padding: { x: 10, y: 5 }
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true })
        .on('pointerover', () => {
            this.finishPhaseBtn.setStyle({ backgroundColor: '#865b47' });
        })
        .on('pointerout', () => {
            this.finishPhaseBtn.setStyle({ backgroundColor: '#6f4e37' });
        })
        .on('pointerdown', () => {
            this.finishPhase();
        });

        EventBus.emit('current-scene-ready', this);
    }

    private translateToBraille(text: string): string
    {
        const brailleMap = {
            'a': '⠁', 'b': '⠃', 'c': '⠉', 'd': '⠙', 'e': '⠑', 'f': '⠋', 'g': '⠛', 'h': '⠓',
            'i': '⠊', 'j': '⠚', 'k': '⠅', 'l': '⠇', 'm': '⠍', 'n': '⠝', 'o': '⠕', 'p': '⠏',
            'q': '⠟', 'r': '⠗', 's': '⠎', 't': '⠞', 'u': '⠥', 'v': '⠧', 'w': '⠺', 'x': '⠭',
            'y': '⠽', 'z': '⠵', ' ': '⠀', '\n': '\n'
        };

        return text.split('').map((char: string) => brailleMap[char.toLowerCase() as keyof typeof brailleMap] || char).join('');
    }

    private startTimer(): void
    {
        this.timeLeft = 60;
        this.timerEvent = this.time.addEvent({
            delay: 1000,
            callback: () => {
                this.timeLeft--;
                if (this.timeLeft < 0) {
                    this.timeLeft = 0;
                    this.timerEvent.remove(false);
                    this.finishPhase();
                }
                this.updateTimerText();
            },
            loop: true
        });
    }

    private updateTimerText(): void
    {
        const minutes = Math.floor(this.timeLeft / 60);
        const seconds = this.timeLeft % 60;
        const formatted = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        this.timerText.setText(formatted);
    }

    private updateProgressBar(progressBar: Phaser.GameObjects.Graphics, x: number, y: number, progressValue: number) {
        const width = 250; // Largura total da barra
        const progressWidth = (width * progressValue) / 100; // Calcula a largura com base no progresso
    
        progressBar.clear(); // Limpa o gráfico anterior
        progressBar.fillStyle(0xC2A385, 1); // Cor da barra
        progressBar.fillRect(x - width / 2, y - 10, progressWidth, 20); // Preenche a barra
    }

    private updateProgressBarReverse(progressBar: Phaser.GameObjects.Graphics, x: number, y: number, progressValue: number) {
        const width = 250; // Largura total da barra
        const progressWidth = (width * progressValue) / 100; // Calcula a largura com base no progresso
    
        progressBar.clear(); // Limpa o gráfico anterior
        progressBar.fillStyle(0xC2A385, 1); // Cor da barra do Player 2
        progressBar.fillRect(x + width / 2 - progressWidth, y - 10, progressWidth, 20); // Preenche a barra da direita para a esquerda
    }

    override update () {
        // Simulando progresso dos jogadores
        if (this.player1ProgressValue < 100) {
            this.player1ProgressValue += 0.5; // Velocidade de progresso do Jogador 1
        }
        if (this.player2ProgressValue < 100) {
            this.player2ProgressValue += 0.3; // Velocidade de progresso do Jogador 2
        }

        // Atualizando as barras de progresso
        this.updateProgressBar(this.player1Progress, 120, 60, this.player1ProgressValue);
        this.updateProgressBarReverse(this.player2Progress, 774, 60, this.player2ProgressValue);
    }

    private finishPhase(): void
    {
        this.scene.start('GameOver');
    }

}