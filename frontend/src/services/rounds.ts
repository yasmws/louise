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

    incrementRound(): void {
        this._currentRound++;
    }

    isLastRound(): boolean {
        return this._currentRound === this._rounds;
    }
}

export const roundsService = new RoundsService(0);