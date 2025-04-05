import { GameObjects, Scene } from 'phaser';
import { userService } from '../../services/user';
import { roomService } from '../../services/room';
import { EnterRoomComponent } from '../components/EnterRoomComponent';
import { of, switchMap } from 'rxjs';

export class MainMenu extends Scene {
    background: GameObjects.Image;
    logo: GameObjects.Image;
    title: GameObjects.Text;
    logoTween: Phaser.Tweens.Tween | null = null;

    private instructionsButton: GameObjects.Image;
    private enterRoomButton: GameObjects.Image;
    private createRoomButton: GameObjects.Image;
    private instructionsText: GameObjects.Text;
    private enterRoomText: GameObjects.Text;
    private createRoomText: GameObjects.Text;

    private instructionsDialog!: GameObjects.Container;

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

        const enterRoomComponent = new EnterRoomComponent(this);

        enterRoomComponent.show()
        .pipe(
            switchMap( (result: any) => {
                if (!result) {
                    console.log('Usuário cancelou');
                    return of(null)
                } 

                const { name, code } = result;

                userService
                .createUser(name);
    
                return (
                    roomService
                    .joinRoom(userService.getUser(), code)
                )
            })
        )
        .subscribe({
            next: result => {
                this.scene.start('WaitingEnterRoom');
            },
            error: error => {
                alert(error.message)
            }
        });
    }

}