import { RiddleService } from "../riddles/riddle-service";
import { User } from "./../user/user";
import { Room } from "./room";
// import { SpotifyService } from "../spotify/spotify-service";

// const spotifyService = new SpotifyService();

export class RoomsService {
    public Rooms: Room[] = [];

    constructor() {}

    /**
     * Creates a Room and add in Room list.
     * @param steps Steps quantity
     * @param owner Owner user instance
     * @param name Room name (identifier)
     * @param genre genre list
     * @returns Room instance
     */
    public async createRoom(steps: number, owner: User, name: string) {
        let newRoom = new Room(steps, owner, name);
        let riddleService = new RiddleService();

        newRoom.riddles = riddleService.sortRiddles(steps);

        newRoom.addPlayer(owner);

        this.addRoom(newRoom);

        return newRoom;
    }

    /**
     * Restart the specified room attributes
     * @param roomName Room identifier
     * @returns Room instance (reseted)
     */
    public async restartRoom(roomName: string) {
        let room = this.Rooms.find((room) => room.name == roomName);

        if (room) {
            // room.trackList = await spotifyService.getRecommendations();
            room.started = false;
            room.finished = false;
            room.resetPlayers();

            room.addPlayer(room.owner);
            return room;
        } else {
            throw new Error("Room not found");
        }
    }

    /**
     * Add the new room into the rooms list
     * @param room Room instance to be added on list
     */
    private addRoom(room: Room): void {
        this.Rooms.push(room);
    }

    /**
     * Fetch especific room by identifier
     * @param roomName find room by identifier
     * @returns Room instance | undefined
     */
    public getRoom(roomName: string): Room | undefined {
        return this.Rooms.find((room) => room.name === roomName);
    }

    /**
     * Fetch Rooms list
     * @returns Room list
     */
    public getRooms(): Room[] {
        return this.Rooms;
    }

    /**
     * Find room by userName
     * @param userName Username string
     * @returns Room instance | undefined
     */
    public getRoomsByUserName(userName: string): Room | undefined {
        return this.Rooms.find((room) => {
            room.players.some(
                (playerElement) => playerElement.name === userName
            );
        });
    }

    /**
     * Find room by userId
     * @param userId user identifier string
     * @returns Room instance | undefined if not found
     */
    public getRoomsByUserId(userId: string): Room | undefined {
        const room = this.Rooms.find((room) => {
            const hasPlayer = room.players.some(
                (playerElement) => playerElement.socketId === userId
            );
            const hasOwner = room.owner.socketId === userId;
            const functionReturn = hasPlayer || hasOwner;
            return functionReturn;
        });
        if (room) {
            return room;
        } else {
            return undefined;
        }
    }

    public addCrownToPlayer( userId: string, crowns: number): void {
        const room = this.getRoomsByUserId(userId);

        room?.players.forEach((player) => {
            if (player.socketId === userId) {
                player.crowns += crowns;
            }
        })
    
    }

    public addCrownToOderPlayers( userId: string, crowns: number): void {
        const room = this.getRoomsByUserId(userId);

        room?.players.forEach((player) => {
            if (player.socketId != userId) {
                player.crowns += crowns;
            }
        })
    
    }
}
