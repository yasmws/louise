import { Scene } from 'phaser';

export class WaitingRoom extends Scene {
    private messageText!: Phaser.GameObjects.Text;
    private countdownText!: Phaser.GameObjects.Text;

    constructor() {
        super('WaitingRoom');
    }

    create() {
        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;

        // Texto inicial de espera
        this.messageText = this.add.text(centerX, centerY, 'Aguardando outros jogadores...', {
            fontFamily: 'serif',
            fontSize: '28px',
            color: '#ffffff'
        }).setOrigin(0.5);

        // Texto de contagem regressiva (inicialmente invisível)
        this.countdownText = this.add.text(centerX, centerY + 80, '', {
            fontFamily: 'serif',
            fontSize: '64px',
            color: '#ffffff'
        }).setOrigin(0.5);

        // Aguarda 3 segundos antes de iniciar a contagem regressiva
        this.time.delayedCall(3000, () => this.startCountdown(), [], this);
    }

    private startCountdown() {
        this.messageText.setText('Iniciando rodada...');

        const countdownNumbers = ['5', '4','3', '2', '1'];
        let index = 0;

        const next = () => {
            if (index >= countdownNumbers.length) {
                this.scene.start('Game');
                return;
            }

            this.countdownText.setText(countdownNumbers[index]);
            this.countdownText.setScale(0);
            this.tweens.add({
                targets: this.countdownText,
                scale: 1,
                ease: 'Bounce.easeOut',
                duration: 500
            });

            index++;
            this.time.delayedCall(1000, next, [], this);
        };

        next();
    }
}