// Complete Game class with all logic including UI, music, random letter sequence puzzle, and transitions
import { EventBus } from '../EventBus';
import { Scene } from 'phaser';
import io from 'socket.io-client';
import { WebSocketService, webSocketService } from '../../services/websocket';
import { riddlesService } from '../../services/riddles';
import { roundsService } from '../../services/rounds';
import { brailleService } from '../../services/braille';
import { Riddle } from '../../interfaces/riddle.interface';
import { characters } from '../../helpers/caracteres';
import { brailleMap } from '../../helpers/brailleMap';

export class Game extends Scene {

    private background!: Phaser.GameObjects.Image;
    private titleLouise!: Phaser.GameObjects.Text;
    private timerText!: Phaser.GameObjects.Text;
    private player1Text!: Phaser.GameObjects.Text;
    private player2Text!: Phaser.GameObjects.Text;
    private header!: Phaser.GameObjects.Graphics;
    private leftClueText!: Phaser.GameObjects.Text;
    private dotsPuzzle!: Phaser.GameObjects.Graphics;
    private asciiPuzzleText!: Phaser.GameObjects.Text;
    private finishPhaseBtn!: Phaser.GameObjects.Text;
    private checkSolutionBtn!: Phaser.GameObjects.Text;
    private timeLeft: number = 60;
    private timerEvent!: Phaser.Time.TimerEvent;
    private boxLouise!: Phaser.GameObjects.Image;
    private boxTimer!: Phaser.GameObjects.Image;
    private boxPlayer1!: Phaser.GameObjects.Image;
    private boxPlayer2!: Phaser.GameObjects.Image;
    player1Progress!: Phaser.GameObjects.Graphics;
    player2Progress!: Phaser.GameObjects.Graphics;
    boxProgress1!: Phaser.GameObjects.Image;
    boxProgress2!: Phaser.GameObjects.Image;
    private player1ProgressValue: number = 0;
    private player2ProgressValue: number = 0;
    boxClueText!: Phaser.GameObjects.Image;
    boxPuzzle!: Phaser.GameObjects.Image;
    boxBraille!: Phaser.GameObjects.Image;
    bgMusic!: Phaser.Sound.BaseSound;

    private puzzleBoard: { id: number, hasDot: boolean }[] = [];
    private puzzleGroup!: Phaser.GameObjects.Container;
  
    private minMoves: { [key: string]: number} = {
        'A': 9, 'B': 8, 'C': 13, 'D': 3, 'E': 11, 'F': 6, 'G': 10, 'H': 7, 'I': 10, 'J': 3, 'K': 7, 'L': 9, 'M': 5, 
        'N': 7, 'O': 7, 'P': 7, 'Q': 3, 'R': 3, 'S': 6, 'T': 3, 'U': 7, 'V': 2, 'W': 4, 'X': 5, 'Y': 1, 'Z': 1
    };

    // private solutionClicks: { [key: string]: number[] } = {
    //     A: [1, 3, 5, 4, 2, 3, 1, 0, 2], B: [2, 4, 5, 3, 1, 0, 2, 4], C: [2, 4, 5, 3, 1, 0, 2, 4, 5, 3, 1, 0, 2], D: [1, 3, 5],
    //     E: [1, 3, 5, 4, 2, 3, 1, 0, 2, 3, 5], F: [1, 3, 5, 4, 2, 3], G: [2, 3, 1, 0, 2, 4, 5, 3, 2, 4], H: [1, 3, 2, 0, 1, 3, 5],
    //     I: [2, 4, 5, 3, 2, 0, 1, 3, 2, 4], J: [2, 3, 5], K: [2, 4, 5, 3, 1, 0, 2], L: [1, 3, 2, 4, 5, 3, 2, 0, 1], M: [1, 3, 2, 4, 5],
    //     N: [1, 3, 2, 0, 1, 3, 5], O: [1, 3, 2, 4, 5, 3, 1], P: [2, 3, 1, 0, 2, 4, 5], Q: [1, 3, 5], R: [2, 3, 5], S: [2, 3, 5, 4, 2, 3],
    //     T: [1, 3, 5], U: [2, 4, 5, 3, 2, 0, 1], V: [2, 3], W: [1, 3, 2, 4], X: [2, 3, 1, 0, 2], Y: [2], Z: [2]
    // };
      
    private charSequence: string[] = [];
    private currentCharIndex: number = 0;
    private currentChar: string = '';
    private moveCount: number = 0;
    private points: number = 0;


    private puzzleSequence: string[] = [];
    private brailleArray: string[] = [];
    private originalBrailleArray: string[] = [];
    private missingBraillePositions: { [key: string]: number } = {};

    private chosenClue: string = '';
    private brailleTranslation: string = '';

    private tryAgainText!: Phaser.GameObjects.Text;
    private clueTextGroup!: Phaser.GameObjects.Container;
    private socket: WebSocketService;


    constructor() {
        super('Game');
        this.initSocket();
    }

    initSocket() {
        this.socket = webSocketService;
        this.socket.connect('ws://localhost:3000');
    }

    // DESIGN
    preload() {
        this.load.audio('backgroundMusic', 'assets/audio/background.m4a');
        this.load.image('background', 'assets/background.png');
        this.load.image('dotsPuzzle', 'assets/dotsPuzzle.png');
        this.load.image('header1', 'assets/Header1.png');
        this.load.image('header2', 'assets/Header2.png');
        this.load.image('Behind', 'assets/Behind 1.png');
        this.load.image('Menu3CategF', 'assets/Menu3CategoriesFront.png');
        this.load.image('Menu3CategB', 'assets/Menu3CategoriesBehind.png');
        this.load.image('Menu2', 'assets/Menu2.png');
        this.load.image('Menu1', 'assets/Menu1.png');
        this.load.font('Jacques Francois', 'assets/fonts/JacquesFrancois-Regular.ttf');
        this.load.font('Love Light', 'assets/fonts/LoveLight-Regular.ttf');
    }

    create() {
        this.background = this.add.image(512, 384, 'background');
        this.bgMusic = this.sound.add('backgroundMusic', { loop: true, volume: 0.1 });
        this.bgMusic.play();

        this.header = this.add.graphics();
        const headerWidth = 1080, headerHeight = 100, dotSpacing = 10, dotRadius = 3;
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

        this.titleLouise = this.add.text(512, 100, 'Louise', {
            fontFamily: 'Love Light', fontSize: '150px', color: '#C2A385', stroke: '#ffffff', strokeThickness: 5,
            shadow: { color: '#000000', fill: true, offsetX: 5, offsetY: 5, blur: 5 }, letterSpacing: 5
        }).setOrigin(0.5);

        this.boxTimer = this.add.image(512, 200, 'header1').setDisplaySize(192, 60).setOrigin(0.5);
        this.timerText = this.add.text(512, 200, '01:00', {
            fontFamily: 'Love Light', fontSize: '50px', color: '#000000' }).setOrigin(0.5);
        this.startTimer();

        this.boxPlayer1 = this.add.image(124, 30, 'header2').setDisplaySize(150, 40).setOrigin(0.5);
        this.player1Text = this.add.text(124, 30, 'Jogador 1', {
            fontFamily: 'Jacques Francois', fontSize: '20px', color: '#000000' }).setOrigin(0.5);

        this.boxPlayer2 = this.add.image(924, 30, 'header2').setDisplaySize(150, 40).setOrigin(0.5);
        this.player2Text = this.add.text(924, 30, 'Jogador 2', {
            fontFamily: 'Jacques Francois', fontSize: '20px', color: '#000000' }).setOrigin(0.5);

        this.boxProgress1 = this.add.image(174, 65, 'Behind').setDisplaySize(300, 50).setOrigin(0.5);
        this.player1Progress = this.add.graphics();
        this.updateProgressBar(this.player1Progress, 174, 80, this.player1ProgressValue);

        this.boxProgress2 = this.add.image(874, 65, 'Behind').setDisplaySize(300, 50).setOrigin(0.5);
        this.player2Progress = this.add.graphics();
        this.updateProgressBarReverse(this.player2Progress, 774, 60, this.player2ProgressValue);


 
        this.tryAgainText = this.add.text(512, 290, 'Try again!', {
            fontSize: '24px',
            color: '#ff0000'
        }).setOrigin(0.5).setVisible(false).setDepth(10); // Make sure it's higher than the image's depth
        ;

        const riddle = riddlesService.getCurrentRiddle(
            roundsService.currentRound
        )

        if(!riddle) {
            throw new Error('Riddle not found');
        }

        this.chosenClue = riddle.text;
    
        //this.generateCharSequence();
   
        // Generate Braille translation, removing spaces and line breaks
        this.brailleTranslation = this.translateToBraille(riddle);
    
        // Render images first to set up the layout
        this.boxClueText = this.add.image(200, 330, 'Menu1').setDisplaySize(303.8, 308.7).setOrigin(0.5);
        this.boxPuzzle = this.add.image(512, 375, 'Menu2').setDisplaySize(209.3, 247.8).setOrigin(0.5);
        this.boxBraille = this.add.image(844, 330, 'Menu1').setDisplaySize(303.8, 308.7).setOrigin(0.5);
    

        this.renderClueText();
        this.renderBrailleTranslation();
        this.currentChar = this.puzzleSequence[0];

        // Initialize first puzzle
        this.initializePuzzleBoard();
        this.renderPuzzleBoard();

        
        this.checkSolutionBtn = this.add.text(512, 550, 'Check Solution', {
            fontFamily: 'Arial', fontSize: '28px', color: '#ffffff', backgroundColor: '#6f4e37', padding: { x: 10, y: 5 }
        })
        .setOrigin(0.5).setInteractive({ useHandCursor: true }).on('pointerdown', () => this.checkPuzzleSolution());

        this.finishPhaseBtn = this.add.text(512, 610, 'Finalizar Rodada', {
            fontFamily: 'Arial', fontSize: '28px', color: '#ffffff', backgroundColor: '#6f4e37', padding: { x: 10, y: 5 }
        })
        .setOrigin(0.5).setInteractive({ useHandCursor: true })
        .on('pointerdown', () => this.finishPhase());

        EventBus.emit('current-scene-ready', this);

    }

    // makes the text translation to braille, keeping an original array and creating an empty slots one
    private translateToBraille(riddle: Riddle): string {

        this.originalBrailleArray = brailleService.translate(riddle.text);
        this.brailleArray = brailleService.translate(riddle.riddle_easy);  

        this.puzzleSequence = riddle.riddle_easy
        .split('')
        .map((char, index) => char === '_' ? riddle.text[index].toUpperCase() : null)
        .filter((char): char is string => char !== null);
    
        return this.brailleArray.join('');
    }
    
    // sentence text space
    private renderClueText(): void {
        this.add.text(200, 330, this.chosenClue, {
            fontFamily: 'Love Light',
            fontSize: '40px',
            color: '#000000',
            wordWrap: { width: 280, useAdvancedWrap: true },
            align: 'center'
        }).setOrigin(0.5);
    }   
    
    // braille text space
    private renderBrailleTranslation(): void {
        const startX = 755, startY = 250, charWidth = 25, charHeight = 40;
        const maxColumns = 8;
        const brailleChars = this.brailleTranslation.split('');
    
        brailleChars.forEach((char, index) => {
            const x = startX + (index % maxColumns) * charWidth;
            const y = startY + Math.floor(index / maxColumns) * charHeight;
    
            this.add.text(x, y, char, {
                fontSize: '18px',
                color: char === ' ' ? '#888888' : '#000000',
                fontFamily: 'Love Light'
            }).setOrigin(0.5);
        });
    }
    
    // puzzle board styling
    private renderPuzzleBoard(): void {
        if (this.puzzleGroup) this.puzzleGroup.destroy(true);
        this.puzzleGroup = this.add.container(this.boxPuzzle.x - 50, this.boxPuzzle.y - 60);
        const tileWidth = 40, tileHeight = 40, gap = 5;

        for (let i = 0; i < 6; i++) {
            const col = i % 2, row = Math.floor(i / 2);
            const x = col * (tileWidth + gap), y = row * (tileHeight + gap);
            
            const isEmpty = this.puzzleBoard[i].id === 0;

            if (!isEmpty) {
                const rect = this.add.rectangle(x + tileWidth / 2, y + tileHeight / 2, tileWidth, tileHeight, 0xC2A385).setOrigin(0.5);
                rect.setInteractive().on('pointerdown', () => this.movePuzzleTile(i));
                this.puzzleGroup.add(rect);
                
                if (this.puzzleBoard[i].hasDot) {
                    const dot = this.add.text(x + tileWidth / 2, y + tileHeight / 2, '●', { fontSize: '24px', color: '#000000' }).setOrigin(0.5);
                    this.puzzleGroup.add(dot);
                }
            }
        }
    }

    // Loads the puzzle board for the current CHAR
    private initializePuzzleBoard(): void {
        this.moveCount = 0;
        console.log('Current char:', this.currentChar);     
        console.log('Current char index:', characters[this.currentChar].length);
        const dots = this.boardSelectionPuzzle(characters[this.currentChar].length);
        this.puzzleBoard = Array.from({ length: 6 }, (_, index) => ({ id: index, hasDot: dots.includes(index) }));
    }

    // Array of valid moves and calculation of movements made by the player in each CHAR
    private movePuzzleTile(index: number): void {
        const emptyIndex = this.puzzleBoard.findIndex(tile => tile.id === 0);
        const validMoves: { [key: number]: number[] } = {
            0: [1, 2], 1: [0, 3], 2: [0, 3, 4], 3: [1, 2, 5], 4: [2, 5], 5: [3, 4]
        };
    
        if (validMoves[emptyIndex].includes(index)) {
            [this.puzzleBoard[emptyIndex], this.puzzleBoard[index]] = 
            [this.puzzleBoard[index], this.puzzleBoard[emptyIndex]];
    
            this.moveCount++;    
            this.renderPuzzleBoard();
        }
    }    

    // Check the puzzle solution
    private checkPuzzleSolution(): void {    
        // the correct char solution
        const correct = characters[this.currentChar] ? [...characters[this.currentChar]].sort() : [];

        // current board
        const current = this.puzzleBoard
            .map((t, i) => (t.hasDot ? i : -1))
            .filter(i => i !== -1)
            .sort();
        
        // check if correct = current
        const success = correct.length === current.length && correct.every((val, idx) => val === current[idx]);
    
        // correct = current
        if (success) {
            // takes possible try again text off the screen
            this.tryAgainText.setVisible(false);
    
            // remakes the braille array to fill the current empty char
            for (let i = 0; i < this.brailleArray.length; i++) {
                if (this.brailleArray[i] === '_' && this.originalBrailleArray[i] === brailleMap[this.currentChar]) {
                    this.brailleArray[i] = this.originalBrailleArray[i];
                    this.brailleTranslation = this.brailleArray.join('');
                    break;
                }
            }
            this.renderBrailleTranslation();
    
            // Add the points for solving the char, being the time left/amount of moves made over the minimum amount
            this.points += this.timeLeft / ((this.moveCount - (this.minMoves[this.currentChar])));

            // loads the next char if there is any
            if (this.currentCharIndex < (this.puzzleSequence.length - 1)) {
                this.currentCharIndex++;
                this.currentChar = this.puzzleSequence[this.currentCharIndex];
    
                this.initializePuzzleBoard();
                this.renderPuzzleBoard();
            
            // No next char, end of game
            } else {
                // PUXAR CODIGO DE FIM DE JOGO
                this.checkSolutionBtn.setText('Complete!');
                this.checkSolutionBtn.disableInteractive();
            }
        // wrong solution, try again text is displayed
        } else {
            this.tryAgainText.setVisible(true);
        }
    }
    

    // Puzzle board generation based on the amount of Dots there is in the CHAR
    private boardSelectionPuzzle(size: number): number[] {
        switch (size) {
            case 1: return [5];
            case 2: return [4, 5];
            case 3: return [1, 3, 5];
            case 4: return [2, 3, 4, 5];
            case 5: return [1, 2, 3, 4, 5];
            default: return [];
        }
    }  

    // ---------------- Fim da lógica do Puzzle ---------------- //

    private startTimer(): void
    {
        this.timeLeft = 120;
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
        const width = 250;
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

    private gameOver(): void
    {
        this.timerEvent.remove(false);
        this.bgMusic.stop();
        this.scene.start('GameOver');
    }

    private finishPhase(): void
    {
        this.gameOver();
    }
}
