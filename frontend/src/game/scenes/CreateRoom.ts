import { Scene, GameObjects } from 'phaser';
import { webSocketService, WebSocketService } from '../../services/websocket';
import { userService } from '../../services/user';
import { roomService } from '../../services/room';
import { roundsService } from '../../services/rounds';

export class CreateRoom extends Scene {
    private createRoomButton: GameObjects.Image;
    private createRoomText: GameObjects.Text;
    private loadingText: Phaser.GameObjects.Text;
    private loadingBox!: Phaser.GameObjects.Image;

    private selectedRounds: number = 3;
    private roundButtons: GameObjects.Image[] = [];
    private roundTexts: GameObjects.Text[] = [];
    private socket: WebSocketService;

    private nameDialog!: Phaser.GameObjects.Container;
    private roomName: string = '';

    private nameButton!: GameObjects.Image;
    private nameButtonText!: GameObjects.Text;
    private playerName: string = '';
    private nameInput!: HTMLInputElement;
    private roomInput!: HTMLInputElement;

    constructor(

    ) {
        super('CreateRoom');
    }

    create() {
        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;

        this.socket = webSocketService;
     
       // Fundo do título
        this.add.image(centerX, 80, 'header-button').setScale(6);

        // Título
        this.add.text(centerX, 80, 'Criação de Sala', {
            fontFamily: 'cursive',
            fontSize: '40px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 1,
        }).setOrigin(0.5);

        // Botões de rodada
        const options = [3, 6, 9];
        options.forEach((num, index) => {
            const btnX = centerX;
            const btnY = 250 + index * 70;

            const button = this.add.image(btnX, btnY, 'header-button')
                .setScale(3)
                .setInteractive()
                .setData('value', num);

            const text = this.add.text(btnX, btnY, `${num} rodadas`, {
                fontFamily: 'serif',
                fontSize: '15px',
                color: '#000000',
                fontStyle: 'bold',
            }).setOrigin(0.5);

            button.on('pointerup', () => this.selectRounds(num));

            this.roundButtons.push(button);
            this.roundTexts.push(text);
        });

        this.selectRounds(this.selectedRounds);

        this.nameButton = this.add.image(centerX, centerY + 140, 'header-button')
            .setScale(3)
            .setInteractive();

        this.nameButtonText = this.add.text(centerX, centerY + 140, 'Criar Sala', {
            fontFamily: 'serif',
            fontSize: '20px',
            color: '#000000',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        this.nameButton.on('pointerover', () => {
            this.nameButton.setScale(3.2);
            this.input.setDefaultCursor('pointer');
        });
        this.nameButton.on('pointerout', () => {
            this.nameButton.setScale(3);
            this.input.setDefaultCursor('default');
        });
        this.nameButton.on('pointerdown', () => {
            this.nameButton.setScale(2.9);
        });
        this.nameButton.on('pointerup', () => {
            this.nameButton.setScale(3);
            this.openNameDialog();
        });

        this.loadingBox = this.add.image(centerX, centerY + 220, 'dialog-box')
            .setDisplaySize(300, 80)
            .setVisible(false);

        this.loadingText = this.add.text(centerX, centerY + 220, 'Criando sala...', {
            fontSize: '20px',
            color: '#ffffff',
        }).setOrigin(0.5).setVisible(false);
    }

    private selectRounds(value: number) {
        this.selectedRounds = value;
        this.roundButtons.forEach((btn) => {
            const isSelected = btn.getData('value') === value;
            btn.setTint(isSelected ? 0x00ff00 : 0xffffff);
        });
    }

    private openNameDialog() {
        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;
    
        const blocker = this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0x000000, 0.001)
            .setOrigin(0)
            .setInteractive();
    
        const box = this.add.rectangle(centerX, centerY, 400, 300, 0x000000, 0.7)
            .setStrokeStyle(2, 0xffffff)
            .setOrigin(0.5);
    
        const title = this.add.text(centerX, centerY - 110, 'Criação da Sala', {
            fontFamily: 'serif',
            fontSize: '22px',
            color: '#ffffff'
        }).setOrigin(0.5);
    
        const confirmBtn = this.add.image(centerX, centerY + 90, 'header-button')
            .setScale(2)
            .setInteractive();
    
        const confirmText = this.add.text(centerX, centerY + 90, 'Confirmar', {
            fontFamily: 'serif',
            fontSize: '18px',
            color: '#000000'
        }).setOrigin(0.5);
    
        confirmBtn.on('pointerup', () => {
            this.roomInput?.remove();
            this.nameInput?.remove();
            this.nameDialog?.destroy();
            blocker.destroy();
            this.confirmRoomName();
        });
    
        this.nameDialog = this.add.container(0, 0, [
            box, title, confirmBtn, confirmText
        ]);
    
        const canvasRect = this.game.canvas.getBoundingClientRect();

        this.nameInput = document.createElement('input');
        this.nameInput.type = 'text';
        this.nameInput.placeholder = 'Seu nome';
        Object.assign(this.nameInput.style, {
            position: 'fixed',
            left: `${canvasRect.left + centerX - 125}px`,
            top: `${canvasRect.top + centerY - 50}px`,
            width: '250px',
            padding: '10px',
            fontSize: '18px',
            borderRadius: '8px',
            border: '2px solid #999',
            textAlign: 'center',
            zIndex: '1000',
        });
        document.body.appendChild(this.nameInput);
    
        this.roomInput = document.createElement('input');
        this.roomInput.type = 'text';
        this.roomInput.placeholder = 'Codigo da sala';
        Object.assign(this.roomInput.style, {
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
        document.body.appendChild(this.roomInput);
    }

    private confirmRoomName() {
        const roomName = this.roomInput?.value.trim();
        const playerName = this.nameInput?.value.trim();
    
        if (!roomName || !playerName) {
            alert('Preencha o nome da sala e do jogador!');
            return;
        }
    
        this.roomName = roomName;
        this.playerName = playerName;
    
        this.loadingBox.setVisible(true);
        this.loadingText.setVisible(true);
    
        this.nameButton.setVisible(false);
        this.nameButtonText.setVisible(false);
        this.roundButtons.forEach(btn => btn.setVisible(false));
        this.roundTexts.forEach(txt => txt.setVisible(false));

        userService
        .createUser(this.playerName);

        roomService
        .createRoom(this.selectedRounds, userService.getUser(), this.roomName)
        .subscribe({
            next: (res) => {
                roundsService.rounds = this.selectedRounds;
                this.scene.start('WaitingRoom');
            },
            error:(err) => {
                alert('Erro ao criar sala: ' + err.message);
                this.returnToStart();
            } 
        });
    }

    
    returnToStart () {
        this.loadingBox.setVisible(false);
        this.loadingText.setVisible(false);
    
        this.nameButton.setVisible(true);
        this.nameButtonText.setVisible(true);
        this.roundButtons.forEach(btn => btn.setVisible(true));
        this.roundTexts.forEach(txt => txt.setVisible(true));

    }


    shutdown() {
        this.nameDialog?.destroy();
    }
}
