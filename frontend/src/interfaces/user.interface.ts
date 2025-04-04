export class User {
    private _name: string;
    private _socketId: string;
  
    constructor(name: string, socketId: string, crowns?: number) {
      this._name = name;
      this._socketId = socketId;
    }
  
    get name(): string {
      return this._name;
    }
  
    get socketId(): string {
      return this._socketId;
    }

  }