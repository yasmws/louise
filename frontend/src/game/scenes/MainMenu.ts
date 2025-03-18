import { GameObjects, Scene } from 'phaser';
import { EventBus } from '../EventBus';

export class MainMenu extends Scene {
    // Elementos de fundo
    background: GameObjects.Image;
    logo: GameObjects.Image;
    title: GameObjects.Text;
    logoTween: Phaser.Tweens.Tween | null;

    // Elementos do menu
    private menuBackground: GameObjects.Image;
    private playButton: GameObjects.Image;
    private instructionsButton: GameObjects.Image;
    private enterRoomButton: GameObjects.Image;
    private createRoomButton: GameObjects.Image;
    private playText: GameObjects.Text;
    private instructionsText: GameObjects.Text;
    private enterRoomText: GameObjects.Text;
    private createRoomText: GameObjects.Text;

    constructor() {
        super('MainMenu');
    }

    preload() {
        // Carrega os assets necessários caso ainda não tenham sido carregados
        this.load.setPath('assets');

        if (!this.textures.exists('main-bg')) {
            this.load.image('main-bg', 'main-bg.png');
        }
        if (!this.textures.exists('header-button')) {
            this.load.image('header-button', 'Header2.png');
        }
        if (!this.textures.exists('dialog-box')) {
            this.load.image('dialog-box', 'DialogBox1.png');
        }
        if (!this.textures.exists('menu-background')) {
            this.load.image('menu-background', 'Menu1.png');
        }
    }

    create() {
        // Adiciona o plano de fundo principal (biblioteca)
        this.background = this.add.image(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2,
            'background'
        );
        this.background.setDisplaySize(
            this.cameras.main.width,
            this.cameras.main.height
        );

        // Adiciona o título "Louise" na parte superior
        this.title = this.add
            .text(this.cameras.main.width / 2, 80, 'Louise.', {
                fontFamily: 'cursive',
                fontSize: '48px',
                color: '#ffffff',
                stroke: '#000000',
                strokeThickness: 1,
            })
            .setOrigin(0.5)
            .setDepth(100);

        // Adiciona o logo para compatibilidade com o método moveLogo
        // Tornamos o logo invisível para evitar que ele apareça na tela
        this.logo = this.add.image(512, 300, 'logo').setDepth(100);
        this.logo.setAlpha(0); // Torna o logo invisível

        // Adiciona o fundo do menu (Menu1.png)
        this.menuBackground = this.add.image(
            this.cameras.main.width / 2,
            400,
            'menu-background'
        );
        this.menuBackground.setScale(0.8);

        // Adiciona os botões de header (Jogar e Instruções)
        this.playButton = this.add
            .image(this.cameras.main.width / 2 - 150, 260, 'header-button')
            .setInteractive();
        this.instructionsButton = this.add
            .image(this.cameras.main.width / 2 + 90, 260, 'header-button')
            .setInteractive();

        // Adiciona os balões de diálogo para as opções
        this.enterRoomButton = this.add
            .image(this.cameras.main.width / 2 - 150, 400, 'dialog-box')
            .setInteractive();
        this.createRoomButton = this.add
            .image(this.cameras.main.width / 2 + 150, 350, 'dialog-box')
            .setInteractive();

        // Adiciona os textos para os botões
        this.playText = this.add
            .text(this.playButton.x, this.playButton.y, 'Jogar', {
                fontFamily: 'serif',
                fontSize: '24px',
                color: '#000000',
                fontStyle: 'bold',
            })
            .setOrigin(0.5);

        this.instructionsText = this.add
            .text(
                this.instructionsButton.x,
                this.instructionsButton.y,
                'Instruções',
                {
                    fontFamily: 'serif',
                    fontSize: '24px',
                    color: '#000000',
                    fontStyle: 'bold',
                }
            )
            .setOrigin(0.5);

        this.enterRoomText = this.add
            .text(
                this.enterRoomButton.x,
                this.enterRoomButton.y,
                'Entrar na sala',
                {
                    fontFamily: 'serif',
                    fontSize: '24px',
                    color: '#000000',
                    fontStyle: 'bold',
                }
            )
            .setOrigin(0.5);

        this.createRoomText = this.add
            .text(
                this.createRoomButton.x,
                this.createRoomButton.y,
                'Crie uma sala',
                {
                    fontFamily: 'serif',
                    fontSize: '24px',
                    color: '#000000',
                    fontStyle: 'bold',
                }
            )
            .setOrigin(0.5);

        // Configura eventos de interação para os botões
        this.setupButtonInteractions(this.playButton, () => this.changeScene());
        this.setupButtonInteractions(this.instructionsButton, () =>
            this.showInstructions()
        );
        this.setupButtonInteractions(this.enterRoomButton, () =>
            this.enterRoom()
        );
        this.setupButtonInteractions(this.createRoomButton, () =>
            this.createRoom()
        );

        // Remove qualquer texto "PHASER" da cena
        this.removePhaserText();

        // Notifica que a cena está pronta
        EventBus.emit('current-scene-ready', this);
    }

    // Este método procura e remove qualquer texto "PHASER" na cena
    removePhaserText() {
        // Procura por todos os objetos de texto na cena
        this.children.list.forEach((child) => {
            if (child instanceof Phaser.GameObjects.Text) {
                const text = child as Phaser.GameObjects.Text;
                // Se o texto contém "PHASER", remove-o
                if (text.text.includes('PHASER')) {
                    text.destroy();
                }
            }
        });

        // Também procura por imagens que podem ter o nome relacionado ao Phaser
        this.children.list.forEach((child) => {
            if (child instanceof Phaser.GameObjects.Image) {
                const image = child as Phaser.GameObjects.Image;
                // Se a textura tiver um nome relacionado ao Phaser
                if (image.texture.key.toLowerCase().includes('phaser')) {
                    image.setVisible(false);
                }
            }
        });
    }

    // Configuração de interações para botões
    private setupButtonInteractions(
        button: GameObjects.Image,
        callback: Function
    ) {
        button
            .on('pointerover', () => {
                button.setScale(1.05);
                this.input.setDefaultCursor('pointer');
            })
            .on('pointerout', () => {
                button.setScale(1);
                this.input.setDefaultCursor('default');
            })
            .on('pointerdown', () => {
                button.setScale(0.95);
            })
            .on('pointerup', () => {
                button.setScale(1);
                callback();
            });
    }

    // Método moveLogo para compatibilidade com app.component.ts
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
                    if (vueCallback) {
                        vueCallback({
                            x: Math.floor(this.logo.x),
                            y: Math.floor(this.logo.y),
                        });
                    }
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

    showInstructions() {
        console.log('Mostrando instruções');
        // Implementar lógica para mostrar instruções
    }

    enterRoom() {
        console.log('Entrando na sala');
        this.changeScene();
    }

    createRoom() {
        console.log('Criando uma sala');
        this.changeScene();
    }
}
