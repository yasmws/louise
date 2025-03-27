import { Scene } from 'phaser';

export class Preloader extends Scene {
    constructor() {
        super('Preloader');
    }

    init() {
     
        // Barra de carregamento - contorno
        this.add.rectangle(512, 384, 468, 32).setStrokeStyle(1, 0xffffff);

        // Barra de progresso
        const bar = this.add.rectangle(512 - 230, 384, 4, 28, 0xffffff);

        // Atualiza a barra de progresso
        this.load.on('progress', (progress: number) => {
            bar.width = 4 + 460 * progress;
        });
    }

    preload() {
        // Carrega os assets necessários para o jogo
        this.load.setPath('assets');

        // Assets originais
        this.load.image('logo', 'logo.png');
        this.load.image('star', 'star.png');

        // Novos assets
        this.load.image('main-bg', 'main-bg.png');
        this.load.image('header-button', 'Header2.png');
        this.load.image('dialog-box', 'DialogBox1.png');
        this.load.image('menu-background', 'Menu1.png');
        this.load.image('header-text', 'Header1.png');

    }

    create() {
        // Mensagem de carregamento concluído
        const text = this.add
            .text(512, 440, 'Carregamento concluído!', {
                fontFamily: 'Arial',
                fontSize: '24px',
                color: '#ffffff',
            })
            .setOrigin(0.5);

        // Espera um segundo e vai para o menu principal
        this.time.delayedCall(1000, () => {
            this.scene.start('MainMenu');
        });
    }
}
