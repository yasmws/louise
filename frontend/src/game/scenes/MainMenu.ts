import { GameObjects, Scene } from 'phaser';

export class MainMenu extends Scene {
    background: GameObjects.Image;
    logo: GameObjects.Image;
    title: GameObjects.Text;
    logoTween: Phaser.Tweens.Tween | null = null;

    private menuBackground: GameObjects.Image;
    private playButton: GameObjects.Image;
    private instructionsButton: GameObjects.Image;
    private enterRoomButton: GameObjects.Image;
    private createRoomButton: GameObjects.Image;
    private instructionsText: GameObjects.Text;
    private enterRoomText: GameObjects.Text;
    private createRoomText: GameObjects.Text;

    private instructionsDialog!: GameObjects.Container;
    private joinRoomDialog!: GameObjects.Container;
    private playerName: string = '';
    private roomCode: string = '';
    private nameInput!: HTMLInputElement;
    private codeInput!: HTMLInputElement;

    constructor() {
        super('MainMenu');
    }

    preload() {
        this.load.setPath('assets');
        this.load.image('main-bg', 'main-bg.png');
        this.load.image('header-button', 'Header2.png');
        this.load.image('dialog-box', 'DialogBox1.png');
    }

    create() {
        const centerX = this.cameras.main.width / 2;

        this.title = this.add.text(centerX, 80, 'Louise.', {
            fontFamily: 'cursive',
            fontSize: '48px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 1,
        }).setOrigin(0.5).setDepth(100);

        this.logo = this.add.image(centerX, 300, 'logo').setDepth(100);
        this.logo.setAlpha(0);

        this.instructionsButton = this.add.image(centerX, 200, 'header-button').setScale(4).setInteractive();
        this.enterRoomButton = this.add.image(centerX, 300, 'header-button').setScale(4).setInteractive();
        this.createRoomButton = this.add.image(centerX, 400, 'header-button').setScale(4).setInteractive();

        this.instructionsText = this.add.text(centerX, 200, 'Instruções', this.buttonTextStyle()).setOrigin(0.5);
        this.enterRoomText = this.add.text(centerX, 300, 'Entrar na sala', this.buttonTextStyle(24)).setOrigin(0.5);
        this.createRoomText = this.add.text(centerX, 400, 'Crie uma sala', this.buttonTextStyle(24)).setOrigin(0.5);

        this.setupButtonInteractions(this.instructionsButton, () => this.showInstructions());
        this.setupButtonInteractions(this.enterRoomButton, () => this.enterRoom());
        this.setupButtonInteractions(this.createRoomButton, () => this.createRoom());

        this.removePhaserText();
    }

    private buttonTextStyle(size = 20) {
        return {
            fontFamily: 'serif',
            fontSize: `${size}px`,
            color: '#000000',
            fontStyle: 'bold'
        };
    }

    private setupButtonInteractions(button: GameObjects.Image, callback: Function) {
        const normalScale = 4;
        const hoverScale = 4.2;
        const pressedScale = 3.9;

        button
            .on('pointerover', () => {
                button.setScale(hoverScale);
                this.input.setDefaultCursor('pointer');
            })
            .on('pointerout', () => {
                button.setScale(normalScale);
                this.input.setDefaultCursor('default');
            })
            .on('pointerdown', () => {
                button.setScale(pressedScale);
            })
            .on('pointerup', () => {
                button.setScale(hoverScale);
                callback();
            });
    }

    removePhaserText() {
        this.children.list.forEach((child) => {
            if (child instanceof Phaser.GameObjects.Text && child.text.includes('PHASER')) {
                child.destroy();
            }
        });
    }

    moveLogo(vueCallback: ({ x, y }: { x: number; y: number }) => void) {
        if (this.logoTween) {
            if (this.logoTween.isPlaying()) {
                this.logoTween.pause();
            } else {
                this.logoTween.play();
            }
        } else {
            this.logoTween = this.tweens.add({
                targets: this.logo,
                x: { value: 750, duration: 3000, ease: 'Back.easeInOut' },
                y: { value: 80, duration: 1500, ease: 'Sine.easeOut' },
                yoyo: true,
                repeat: -1,
                onUpdate: () => {
                    vueCallback?.({
                        x: Math.floor(this.logo.x),
                        y: Math.floor(this.logo.y),
                    });
                },
            });
        }
    }

    changeScene() {
        if (this.logoTween) {
            this.logoTween.stop();
            this.logoTween = null;
        }
        this.scene.start('Game');
    }

    createRoom() {
        if (this.logoTween) this.logoTween.stop();
        this.scene.start('CreateRoom');
    }

    showInstructions() {
        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;

        const box = this.add.rectangle(centerX, centerY, 500, 250, 0x000000, 0.7)
            .setStrokeStyle(2, 0xffffff).setOrigin(0.5);

        const text = this.add.text(centerX, centerY - 50,
            'Resolva os enigmas de braille\ne complete a tradução da frase!',
            {
                fontFamily: 'serif',
                fontSize: '18px',
                color: '#ffffff',
                align: 'center'
            }).setOrigin(0.5);

        const closeButton = this.add.image(centerX, centerY + 80, 'header-button')
            .setScale(2).setInteractive();

        const closeText = this.add.text(centerX, centerY + 80, 'Fechar', {
            fontFamily: 'serif',
            fontSize: '18px',
            color: '#000000'
        }).setOrigin(0.5);

        closeButton.on('pointerup', () => this.instructionsDialog?.destroy());

        this.instructionsDialog = this.add.container(0, 0, [box, text, closeButton, closeText]);
    }

    enterRoom() {
        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;

        const blocker = this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0x000000, 0.001)
        .setOrigin(0)
        .setInteractive();
    
        // Cria a caixa visual do dialog
        const box = this.add.rectangle(centerX, centerY - 10, 400, 400, 0x000000, 0.7)
            .setStrokeStyle(2, 0xffffff)
            .setOrigin(0.5);
    
        const title = this.add.text(centerX, centerY - 100, 'Entrar na Sala', {
            fontFamily: 'serif',
            fontSize: '22px',
            color: '#ffffff'
        }).setOrigin(0.5);
    
        // Botão de confirmar
        const confirmBtn = this.add.image(centerX, centerY + 90, 'header-button')
            .setScale(2)
            .setInteractive();
    
        const confirmText = this.add.text(centerX, centerY + 90, 'Confirmar', {
            fontFamily: 'serif',
            fontSize: '18px',
            color: '#000000'
        }).setOrigin(0.5);
    
        confirmBtn.on('pointerup', () => {
            this.nameInput?.remove();
            this.codeInput?.remove();
            this.joinRoomDialog?.destroy();
            blocker.destroy(); 
            this.confirmJoinRoom()
        });
    
        this.joinRoomDialog = this.add.container(0, 0, [
            box, title, confirmBtn, confirmText
        ]);
    
        // Inputs HTML reais
        const canvasRect = this.game.canvas.getBoundingClientRect();
    
        this.nameInput = document.createElement('input');
        this.nameInput.type = 'text';
        this.nameInput.placeholder = 'Seu nome';
        Object.assign(this.nameInput.style, {
            position: 'fixed',
            left: `${canvasRect.left + centerX - 125}px`,
            top: `${canvasRect.top + centerY - 45}px`,
            width: '250px',
            padding: '10px',
            fontSize: '18px',
            borderRadius: '8px',
            border: '2px solid #999',
            textAlign: 'center',
            zIndex: '1000',
        });
        document.body.appendChild(this.nameInput);
    
        this.codeInput = document.createElement('input');
        this.codeInput.type = 'text';
        this.codeInput.placeholder = 'Código da sala';
        Object.assign(this.codeInput.style, {
            position: 'fixed',
            left: `${canvasRect.left + centerX - 125}px`,
            top: `${canvasRect.top + centerY + 10}px`,
            width: '250px',
            padding: '10px',
            fontSize: '18px',
            borderRadius: '8px',
            border: '2px solid #999',
            textAlign: 'center',
            zIndex: '1000',
        });
        document.body.appendChild(this.codeInput);

        const cancelBtn = this.add.image(centerX, centerY + 130, 'header-button')
        .setScale(2)
        .setInteractive();
        const cancelText = this.add.text(centerX , centerY + 130, 'Cancelar', {
            fontFamily: 'serif',
            fontSize: '18px',
            color: '#000000'
        }).setOrigin(0.5);

        cancelBtn.on('pointerup', () => {
            this.nameInput?.remove();
            this.codeInput?.remove();
            this.joinRoomDialog?.destroy();
            cancelBtn.destroy();
            cancelText.destroy();
            blocker.destroy();
        });
    }

    private confirmJoinRoom() {
        const playerName = this.nameInput?.value.trim();
        const roomCode = this.codeInput?.value.trim();
    
        if (!playerName || !roomCode) {
            alert('Preencha seu nome e código da sala!');
            return;
        }
    
        this.nameInput?.remove();
        this.codeInput?.remove();
        this.joinRoomDialog?.destroy();
    
        this.scene.start('Game', {
            playerName,
            roomCode
        });
    }

}