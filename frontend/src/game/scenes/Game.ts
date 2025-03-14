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
    private dotsPuzzle!: Phaser.GameObjects.Graphics;  // ou um grupo de círculos
    private asciiPuzzleText!: Phaser.GameObjects.Text;

    // Botão de finalizar fase
    private finishPhaseBtn!: Phaser.GameObjects.Text;

    // Timer
    private timeLeft: number = 60;
    private timerEvent!: Phaser.Time.TimerEvent;

    // Boxes
    private boxLouise!: Phaser.GameObjects.Image;
    private boxTimer!: Phaser.GameObjects.Image;
    private boxPlayer1!: Phaser.GameObjects.Image;
    private boxPlayer2!: Phaser.GameObjects.Image;
    player1Progress!: Phaser.GameObjects.Graphics;
    player2Progress!: Phaser.GameObjects.Graphics;
    boxProgress1!: Phaser.GameObjects.Image;
    boxProgress2!: Phaser.GameObjects.Image;

    // Progresso dos jogadores
    private player1ProgressValue: number = 0; // Progresso inicial do Jogador 1
    private player2ProgressValue: number = 0; // Progresso inicial do Jogador 2

    // --- Lógica do Puzzle deslizante (3x2) ---
    private puzzleBoard: { id: number, hasDot: boolean }[] = [];
    private puzzleGroup!: Phaser.GameObjects.Container;
    // Usaremos a mesma lógica de caractere para definir quais posições devem ter o "dot"
    private inputedChar: string = '';  
    private sizeOfArray: number = 0;
    private characters: { [key: string]: number[] } = {
        'A': [0],
        'B': [0, 2],
        'C': [0, 1],
        'D': [0, 1, 3],
        'E': [0, 3],
        'F': [0, 1, 2],
        'G': [0, 1, 2, 3],
        'H': [0, 2, 3],
        'I': [1, 2],
        'J': [1, 2, 3],
        'K': [0, 4],
        'L': [0, 2, 4],
        'M': [0, 1, 4],
        'N': [0, 1, 3, 4],
        'O': [0, 3, 4],
        'P': [0, 1, 2, 4],
        'Q': [0, 1, 2, 3, 4],
        'R': [0, 2, 3, 4],
        'S': [1, 2, 4],
        'T': [1, 2, 3, 4],
        'U': [0, 4, 5],
        'V': [0, 2, 4, 5],
        'W': [1, 2, 3, 5],
        'X': [0, 1, 4, 5],
        'Y': [0, 1, 3, 4, 5],
        'Z': [0, 3, 4, 5]
    };
    boxClueText: Phaser.GameObjects.Image;
    boxPuzzle: Phaser.GameObjects.Image;
    boxBraille: Phaser.GameObjects.Image;

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
        this.boxTimer = this.add.image(512, 200, 'header1')
            .setDisplaySize(192, 60)
            .setOrigin(0.5, 0.5);
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
        this.updateProgressBarReverse(this.player2Progress, 774, 60, this.player2ProgressValue);

        // --- Enigma / Clue ---
        const clues = [
            'Siga onde as folhas\ncontam histórias\ne os sussurros\nsão de papel.',
            'Procure onde o sol\nbeija a terra\ne as sombras\ndançam.',
            'Va onde as estrelas\nbrilham mais forte\ne os sonhos\nganham vida.'
        ];
        const randomClue = clues[Math.floor(Math.random() * clues.length)];

        this.boxClueText = this.add.image(200, 330, 'Menu1')
            .setDisplaySize(303.8, 308.7)
            .setOrigin(0.5, 0.5);
        this.leftClueText = this.add.text(200, 330, randomClue, {
            fontFamily: 'Love Light',
            fontSize: '36px',
            color: '#000000',
            padding: { x: 10, y: 10 },
            align: 'center'
        }).setOrigin(0.5);

        // --- Puzzle Deslizante (3x2) ---
        // Exibe a caixa do puzzle (fundo)
        this.boxPuzzle = this.add.image(512, 375, 'Menu2')
            .setDisplaySize(209.3, 247.8)
            .setOrigin(0.5);
        // Inicializa e renderiza o puzzle
        // Aqui, para exemplo, definimos um caractere de entrada; na prática, você pode receber esse dado via input
        this.inputedChar = 'A'; // ou qualquer outro caractere válido
        this.sizeOfArray = this.characters[this.inputedChar].length;
        this.initializePuzzleBoard();
        this.renderPuzzleBoard();

        // --- Enigma Braille ---
        const asciiPuzzle = this.translateToBraille(randomClue);
        this.boxBraille = this.add.image(844, 330, 'Menu1')
            .setDisplaySize(303.8, 308.7)
            .setOrigin(0.5, 0.5);
        const brailleChars = asciiPuzzle.split('');
        const charWidth = 20;
        const charHeight = 30;
        const startX = 824 - (charWidth * 8) / 2;
        const startY = 300 - charHeight / 2;
        brailleChars.forEach((char, index) => {
            const x = startX + (index % 8) * charWidth;
            const y = startY + Math.floor(index / 8) * charHeight;
            this.add.graphics()
                .fillRect(x, y, charWidth, charHeight)
                .lineStyle(1, 0x000000, 1)
                .strokeRect(x, y, charWidth, charHeight);
            this.add.text(x + charWidth / 2, y + charHeight / 2, char, {
                fontFamily: 'Love Light',
                fontSize: '16px',
                color: '#000000'
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
    private translateToBraille(randomClue: string): string {
        // Implement the translation logic here
        // For now, let's return a dummy string for demonstration purposes
        return "⠠⠎⠊⠛⠁ ⠕⠝⠙⠑ ⠁⠎ ⠋⠕⠇⠊⠁⠎";
    }

    // ---------------- Puzzle (Sliding Puzzle) Lógica ---------------- //

    private boardSelectionPuzzle(size: number): number[] {
        switch (size) {
            case 1:
                return [5];
            case 2:
                return [4, 5];
            case 3:
                return [1, 3, 5];
            case 4:
                return [2, 3, 4, 5];
            case 5:
                return [1, 2, 3, 4, 5];
            default:
                return [];
        }
    }

    private initializePuzzleBoard(): void {
        const selectedTiles = this.boardSelectionPuzzle(this.sizeOfArray);
        this.puzzleBoard = Array.from({ length: 6 }, (_, index) => ({
            id: index,
            hasDot: selectedTiles.includes(index)
        }));
    }

    private renderPuzzleBoard(): void {
        // Se já existir um container de puzzle, destrua-o para recriar
        if (this.puzzleGroup) {
            this.puzzleGroup.destroy(true);
        }
        // Cria um container para agrupar os elementos do puzzle; posicione-o conforme desejado
        this.puzzleGroup = this.add.container(this.boxPuzzle.x - 50, this.boxPuzzle.y - 60);
        
        const dotRadius = 20, gap = 5;
        for (let i = 0; i < 6; i++) {
            const col = i % 2;
            const row = Math.floor(i / 2);
            const posX = col * (dotRadius * 2 + gap);
            const posY = row * (dotRadius * 2 + gap);
            // Cor do tile: se for o tile vazio (id === 0) usa cor clara
            const dotColor = (this.puzzleBoard[i].id === 0) ? 0x4A8EA5 : 0xC2A385;
            const dot = this.add.circle(posX + dotRadius, posY + dotRadius, dotRadius, dotColor)
            .setOrigin(0.5);
            
            // Torna o tile interativo para que o jogador possa movê-lo
            dot.setInteractive();
            dot.on('pointerdown', () => {
                this.movePuzzleTile(i);
            });
            this.puzzleGroup.add(dot);
        }
    }

    private movePuzzleTile(index: number): void {
        const emptyIndex = this.puzzleBoard.findIndex(tile => tile.id === 0);
        const validMoves: { [key: number]: number[] } = {
            0: [1, 2],
            1: [0, 3],
            2: [0, 3, 4],
            3: [1, 2, 5],
            4: [2, 5],
            5: [3, 4]
        };
        if (validMoves[emptyIndex].includes(index)) {
            // Troca os tiles
            [this.puzzleBoard[emptyIndex], this.puzzleBoard[index]] = [this.puzzleBoard[index], this.puzzleBoard[emptyIndex]];
            this.renderPuzzleBoard();
        }
    }

    private checkPuzzleSolution(): void {
        if (!this.inputedChar) {
            console.log("Nenhum caractere informado para verificação.");
            return;
        }
        const correctPositions = this.characters[this.inputedChar];
        const currentDotPositions = this.puzzleBoard
            .map((tile, index) => tile.hasDot ? index : -1)
            .filter(index => index !== -1);
        const isCorrect = JSON.stringify(correctPositions.sort()) === JSON.stringify(currentDotPositions.sort());
        alert(isCorrect ? "Correct solution!" : "Try again.");
    }

    // ---------------- Fim da lógica do Puzzle ---------------- //

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
        const progressWidth = (width * progressValue) / 100;
    
        progressBar.clear();
        progressBar.fillStyle(0xC2A385, 1);
        progressBar.fillRect(x - width / 2, y - 10, progressWidth, 20);
    }

    private updateProgressBarReverse(progressBar: Phaser.GameObjects.Graphics, x: number, y: number, progressValue: number) {
        const width = 250;
        const progressWidth = (width * progressValue) / 100;
    
        progressBar.clear();
        progressBar.fillStyle(0xC2A385, 1);
        progressBar.fillRect(x + width / 2 - progressWidth, y - 10, progressWidth, 20);
    }

    override update () {
        // Simulação de progresso dos jogadores
        if (this.player1ProgressValue < 100) {
            this.player1ProgressValue += 0.5;
        }
        if (this.player2ProgressValue < 100) {
            this.player2ProgressValue += 0.3;
        }

        this.updateProgressBar(this.player1Progress, 120, 60, this.player1ProgressValue);
        this.updateProgressBarReverse(this.player2Progress, 774, 60, this.player2ProgressValue);
    }

    private finishPhase(): void
    {
        this.scene.start('GameOver');
    }
}
