export class RoundsService {

    private _rounds: number;
    private _currentRound: number;

    constructor(rounds: number) {
        this._rounds = rounds;
        this._currentRound = 0;
    }

    get rounds(): number {
        return this._rounds;
    }

    set rounds(rounds: number) {
        this._rounds = rounds;
        this._currentRound = 1;
    }

    get currentRound(): number {
        return this._currentRound;
    }
}

export const roundsService = new RoundsService(0);