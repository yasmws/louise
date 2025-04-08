import { Riddle } from "./../gameinfo/info";
import { readFileSync } from "fs";
import _ from "lodash";

export class RiddleService {
    private riddles: Riddle[];

    constructor() {
        const riddles_json = String(
            readFileSync("src/services/riddles/riddle-list.json")
        );

        const riddles: Array<any> = JSON.parse(riddles_json).riddles;

        this.riddles = riddles;
    }

    public sortRiddles(quantity: number) {
        return _.sampleSize(this.riddles, quantity);
    }
}
