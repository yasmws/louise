import { Riddle } from "../interfaces/riddle.interface";

export class RiddlesService {

    private _riddles: Riddle[] = [];

    constructor(riddles: Riddle[]) {
        this._riddles = riddles;
    }

    getCurrentRiddle(currentRound: number): Riddle | null {
        return this._riddles[currentRound];
    }

    set riddles(riddles: Riddle[]) {
        this._riddles = riddles;
    }
    
}

export const riddlesService = new RiddlesService([])    