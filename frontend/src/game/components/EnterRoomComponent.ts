import { Scene } from 'phaser';
import { EnterRoom } from '../../interfaces/enter-room.interface';
import { Observable } from 'rxjs';

export class EnterRoomComponent {
    private readonly scene: Scene;
    private readonly centerX: number;
    private readonly centerY: number;

    private nameInput: HTMLInputElement;
    private codeInput: HTMLInputElement;

    constructor(scene: Scene) {
        this.scene = scene;
        this.centerX = this.scene.cameras.main.width / 2;
        this.centerY = this.scene.cameras.main.height / 2;
    }

    show(): Observable<EnterRoom | null> {
        return new Observable<EnterRoom | null>((subscriber) => {
            const blocker = this.scene.add.rectangle(0, 0, this.scene.cameras.main.width, this.scene.cameras.main.height, 0x000000, 0.001)
                .setOrigin(0)
                .setInteractive();

            const box = this.scene.add.rectangle(this.centerX, this.centerY, 400, 300, 0x000000, 0.7)
                .setStrokeStyle(2, 0xffffff)
                .setOrigin(0.5);

            const title = this.scene.add.text(this.centerX, this.centerY - 110, 'Entrar na Sala', {
                fontFamily: 'serif',
                fontSize: '22px',
                color: '#ffffff'
            }).setOrigin(0.5);

            const canvasRect = this.scene.game.canvas.getBoundingClientRect();

            this.nameInput = document.createElement('input');
            this.nameInput.type = 'text';
            this.nameInput.placeholder = 'Seu nome';
            Object.assign(this.nameInput.style, {
                position: 'fixed',
                left: `${canvasRect.left + this.centerX - 125}px`,
                top: `${canvasRect.top + this.centerY - 45}px`,
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
                left: `${canvasRect.left + this.centerX - 125}px`,
                top: `${canvasRect.top + this.centerY + 10}px`,
                width: '250px',
                padding: '10px',
                fontSize: '18px',
                borderRadius: '8px',
                border: '2px solid #999',
                textAlign: 'center',
                zIndex: '1000',
            });
            document.body.appendChild(this.codeInput);

            const confirmBtn = this.scene.add.image(this.centerX, this.centerY + 70, 'header-button')
                .setScale(2)
                .setInteractive();

            const confirmText = this.scene.add.text(this.centerX, this.centerY + 70, 'Confirmar', {
                fontFamily: 'serif',
                fontSize: '18px',
                color: '#000000'
            }).setOrigin(0.5);

            const cancelBtn = this.scene.add.image(this.centerX, this.centerY + 120, 'header-button')
                .setScale(2)
                .setInteractive();

            const cancelText = this.scene.add.text(this.centerX, this.centerY + 120, 'Cancelar', {
                fontFamily: 'serif',
                fontSize: '18px',
                color: '#000000'
            }).setOrigin(0.5);

            confirmBtn.on('pointerup', () => {
                const name = this.nameInput.value.trim();
                const code = this.codeInput.value.trim();

                if (!name || !code) {
                    alert('Preencha seu nome e código da sala!');
                    return;
                }

                this.nameInput?.remove();
                this.codeInput?.remove();
                container?.destroy();
                blocker?.destroy();
                
                subscriber.next({ name, code });
                subscriber.complete();
            });

            cancelBtn.on('pointerup', () => {
                this.nameInput?.remove();
                this.codeInput?.remove();
                container?.destroy();
                blocker?.destroy();
                
                subscriber.next(null);
                subscriber.complete();
            });

            const container = this.scene.add.container(0, 0, [
                box, title, confirmBtn, confirmText, cancelBtn, cancelText
            ]);

            return () => {
                this.nameInput?.remove();
                this.codeInput?.remove();
                container?.destroy();
                blocker?.destroy();
            };
        });
    }
}
