import { User } from "../interfaces/user.interface";
import { webSocketService } from "./websocket";

export class UserService {

    constructor(
    ) {}

    private user?: User;

    createUser(name: string): void {

        if (!webSocketService) {
            throw new Error('Socket not initialized');
        }   

        const socketId = webSocketService.getSocketId();

        if (!socketId) {
            throw new Error('Socket ID not available');
        }

        this.user = new User(name, socketId);
    }
    
    getUser(): User {

        if (!this.user) {
            throw new Error('User not created');
        }
        return this.user;

    }

}

export const userService = new UserService(); 