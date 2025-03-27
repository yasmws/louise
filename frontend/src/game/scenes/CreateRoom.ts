import { Scene, GameObjects } from 'phaser';
import { WebSocketService } from '../../services/websocket';

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

    constructor() {
        super('CreateRoom');
    }

    create() {
        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;

        this.socket = WebSocketService.getInstance();
        this.socket.connect('ws://localhost:3000');

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

        // Botão "Criar Nome"
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

        // Caixa de loading (DialogBox1)
        this.loadingBox = this.add.image(centerX, centerY + 220, 'dialog-box')
            .setDisplaySize(300, 80)
            .setVisible(false);

        // Texto de loading
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

        const box = this.add.rectangle(centerX, centerY, 350, 200, 0x000000, 0.7)
            .setStrokeStyle(2, 0xffffff)
            .setOrigin(0.5);

        const title = this.add.text(centerX, centerY - 70, 'Digite um nome para sala', {
            fontFamily: 'serif',
            fontSize: '20px',
            color: '#ffffff'
        }).setOrigin(0.5);

        const inputBox = this.add.rectangle(centerX, centerY - 20, 250, 40, 0xffffff)
            .setStrokeStyle(2, 0x999999)
            .setOrigin(0.5);

        const inputText = this.add.text(centerX - 115, centerY - 30, '', {
            fontFamily: 'serif',
            fontSize: '18px',
            color: '#000000',
            wordWrap: { width: 240 }
        });

        this.input.keyboard!.on('keydown', (event: KeyboardEvent) => {
            if (!this.nameDialog) return;

            if (event.key === 'Backspace') {
                this.roomName = this.roomName.slice(0, -1);
            } else if (event.key === 'Enter') {
                this.confirmRoomName();
            } else if (event.key.length === 1) {
                this.roomName += event.key;
            }

            inputText.setText(this.roomName);
        });

        const confirmBtn = this.add.image(centerX, centerY + 50, 'header-button')
            .setScale(2)
            .setInteractive();

        const confirmText = this.add.text(centerX, centerY + 50, 'Confirmar', {
            fontFamily: 'serif',
            fontSize: '18px',
            color: '#000000'
        }).setOrigin(0.5);

        confirmBtn.on('pointerup', () => this.confirmRoomName());

        this.nameDialog = this.add.container(0, 0, [
            box, title, inputBox, inputText, confirmBtn, confirmText
        ]);
    }

    private confirmRoomName() {
        if (!this.roomName || this.roomName.trim().length === 0) {
            alert('Digite um nome válido!');
            return;
        }

        // Oculta os elementos de entrada
        this.nameDialog.destroy();
        this.nameButton.setVisible(false);
        this.nameButtonText.setVisible(false);
        this.roundButtons.forEach(btn => btn.setVisible(false));
        this.roundTexts.forEach(txt => txt.setVisible(false));

        this.loadingBox.setVisible(true);
        this.loadingText.setVisible(true);

        this.socket.emit('createRoom', {
            name: this.roomName,
            rounds: this.selectedRounds
        });

        setTimeout(() => {
           this.scene.start('WaitingRoom')
        }, 600)

        // this.socket.on('roomCreated', (data) => {
        //     this.loadingBox.setVisible(false);
        //     this.loadingText.setVisible(false);
        //     this.scene.start('Game', {
        //         roomName: this.roomName,
        //         rounds: this.selectedRounds,
        //         roomId: data.roomId
        //     });
        // });
    }

    shutdown() {
        this.nameDialog?.destroy();
    }
}
