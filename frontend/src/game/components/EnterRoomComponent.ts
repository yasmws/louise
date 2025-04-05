import { GameObjects, Scene } from 'phaser';
import { EnterRoom } from '../../interfaces/enter-room.interface';
import { Observable } from 'rxjs';


export class EnterRoomComponent {
    
    private scene: Scene;
    private centerX: number;
    private centerY: number;

    private confirmBtn: GameObjects.Image;
    private cancelBtn: GameObjects.Image;
    private confirmText: GameObjects.Text;
    private cancelText: GameObjects.Text;
    private joinRoomDialog: GameObjects.Container;
    private blocker: GameObjects.Rectangle;
    private title: GameObjects.Text;
    private nameInput: HTMLInputElement;
    private codeInput: HTMLInputElement;
    private room: GameObjects.Rectangle;
    private roomCode: string;
    private roomName: string;
    private roomNameText: GameObjects.Text;
    private roomCodeText: GameObjects.Text;
    private roomNameInput: HTMLInputElement;
    private roomCodeInput: HTMLInputElement;
    private roomNameTextInput: HTMLInputElement;
    private roomCodeTextInput: HTMLInputElement;
    private canvasRect: DOMRect;
    private box: GameObjects.Rectangle;

    constructor(
        scene: Scene,
    ) {
        this.scene = scene;

        this.centerX = this.scene.cameras.main.width / 2;
        this.centerY = this.scene.cameras.main.height / 2;
    }

    show(): Observable<EnterRoom | null> {
        return new Observable<EnterRoom | null>((subscriber) => {

            this.createBox();
        
            this.canvasRect = this.scene.game.canvas.getBoundingClientRect();
        
            this.nameInput = document.createElement('input');
            this.nameInput.type = 'text';
            this.nameInput.placeholder = 'Seu nome';

            Object.assign(this.nameInput.style, {
                position: 'fixed',
                left: `${this.canvasRect.left + this.centerX - 125}px`,
                top: `${this.canvasRect.top + this.centerY - 45}px`,
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
                left: `${this.canvasRect.left + this.centerX - 125}px`,
                top: `${this.canvasRect.top + this.centerY + 10}px`,
                width: '250px',
                padding: '10px',
                fontSize: '18px',
                borderRadius: '8px',
                border: '2px solid #999',
                textAlign: 'center',
                zIndex: '1000',
            });
            document.body.appendChild(this.codeInput);
        
        
            this.confirmBtn.on('pointerup', () => {
                const name = this.nameInput.value.trim();
                const code = this.codeInput.value.trim();
            
                if (!name || !code) {
                    alert('Preencha seu nome e código da sala!');
                    return;
                }
            
                this.cleanup();
                subscriber.next({ name, code });
                subscriber.complete();
            });
        
            this.cancelBtn.on('pointerup', () => {
                this.cleanup();
                subscriber.next(null);
                subscriber.complete();
            });
            
            return () => {
                this.cleanup();
            };
        });
    }

    private createBox() {

        this.blocker = this.scene.add.rectangle(0, 0, this.scene.cameras.main.width, this.scene.cameras.main.height, 0x000000, 0.001)
            .setOrigin(0)
            .setInteractive();

        this.box = this.scene.add.rectangle(this.centerX, this.centerY - 10, 400, 400, 0x000000, 0.7)
            .setStrokeStyle(2, 0xffffff)
            .setOrigin(0.5);

        this.title = this.scene.add.text(this.centerX, this.centerY - 100, 'Entrar na Sala', {
            fontFamily: 'serif',
            fontSize: '22px',
            color: '#ffffff'
        }).setOrigin(0.5);

        this.confirmBtn = this.scene.add.image(this.centerX, this.centerY + 90, 'header-button')
            .setScale(2)
            .setInteractive();

        this.confirmText = this.scene.add.text(this.centerX, this.centerY + 90, 'Confirmar', {
            fontFamily: 'serif',
            fontSize: '18px',
            color: '#000000'
        }).setOrigin(0.5);

        this.cancelBtn = this.scene.add.image(this.centerX, this.centerY + 130, 'header-button')
            .setScale(2)
            .setInteractive();

        this.cancelText = this.scene.add.text(this.centerX, this.centerY + 130, 'Cancelar', {
            fontFamily: 'serif',
            fontSize: '18px',
            color: '#000000'
        }).setOrigin(0.5);

        this.joinRoomDialog = this.scene.add.container(0, 0, [
            this.box, this.title, this.confirmBtn, this.confirmText, this.cancelBtn, this.cancelText
        ]);

    }

    private cleanup() {
        this.nameInput.remove();
        this.codeInput.remove();
        this.joinRoomDialog.destroy();
        this.blocker.destroy();
        this.cancelBtn.destroy();
        this.cancelText.destroy();
    }
  

}
