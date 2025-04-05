import { Observable, throwError } from 'rxjs';
import { Room } from "../interfaces/room.interface";
import { User } from "../interfaces/user.interface";
import { webSocketService } from "./websocket";

export class room {
  private room?: Room;

  public getRoom(): Room {
    if (!this.room) {
      throw new Error('Room not created');
    }
    return this.room;
  }

  public createRoom(steps: number, owner: User, name: string): Observable<any> {
    return new Observable(subscriber => {
      webSocketService.emit('create-room', name, owner.name, steps, (response: any) => {
        if (response === 'room already exists') {
          subscriber.error(new Error('Sala já existe'));
          return;
        }

        this.room = new Room(response);
        subscriber.next(response);
        subscriber.complete();
      });
    });
  }

  public joinRoom(user: User, name: string): Observable<any> {
    return new Observable(subscriber => {
      webSocketService.emit('join-room', name, user.name, (response: string | string[]) => {

        if (typeof response === 'string') {

          if (response === 'room already exists') {
            subscriber.error(new Error('Sala já existe'));
            return;
          } else if (response === 'room dos not exist') {
            subscriber.error(new Error('Sala não encontrada'));
            return;
          } else {
            subscriber.error(new Error('Aconteceu um erro inesperado'));
            return;
          }
        }  

        this.room = new Room(name);
        this.room.adversary = response[0];

        subscriber.next(response);
        subscriber.complete();
      });
    });
  }

  public setAdversary(adversary: string): void {
    this.room!.adversary = adversary;
  }
}

export const roomService = new room();