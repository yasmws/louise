import { Room } from "../interfaces/room.interface";
import { User } from "../interfaces/user.interface";
import { webSocketService } from "./websocket";

export class room {

    private room?: Room;

    public getRoom(): Room {
        if (!this.room) {
            throw new Error('Room not created')
        }

        return this.room;
    }
    
    public createRoom(steps: number, owner: User, name: string): Promise<any> {
    
        return new Promise((resolve, reject) => {
            webSocketService.emit(
                'create-room',
                name,
                owner.name,
                steps,
                (response: any) => {
                    if (response === 'room already exists') {
                        return reject(new Error('Sala já existe'));
                    }

                    this.room = new Room(response)
    
                    resolve(response);
                }
            );
        });
    }

    public joinRoom(user: User, name: string): Promise<any> {
    
        return new Promise((resolve, reject) => {
            webSocketService.emit(
                'join-room',
                name,
                user.name,
                (response: any) => {
                    // se quiser, você pode validar a resposta aqui antes de resolver
                    if (response === 'room already exists') {
                        return reject(new Error('Sala já existe'));
                    }

                    this.room = new Room(response)
    
                    resolve(response);
                }
            );
        });
    }
}

export const roomService = new room();