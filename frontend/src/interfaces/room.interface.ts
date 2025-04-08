export class Room {
    private _id: string;
    private _adversary?: string;

    userPoints: number = 0;
    adversaryPoints: number = 0;
  
    constructor(id: string) {
      this._id = id;
    }
  
    get id(): string {
      return this._id;
    }

    set adversary(adversary: string) {
        this._adversary = adversary;
    }

    get adversary(): string | undefined {
      return this._adversary;
    }
    
    addPointToUser(countPoints: number): void {
        this.userPoints += countPoints;
    }

    addPointsToAdversary(countPoints: number): void {
      this.adversaryPoints += countPoints;
    }

    resetPoints(): void {
        this.userPoints = 0;
        this.adversaryPoints = 0;
    }
}