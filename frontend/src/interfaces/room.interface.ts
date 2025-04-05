export class Room {
    private _id: string;
    private _adversary?: string;
  
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
}