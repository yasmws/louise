import { brailleMap } from "../helpers/brailleMap";

export class BrailleService {
   

    translate(text: string): string[] {
        const uppercaseText = text.toUpperCase();
        return uppercaseText.split('').map(char => {
            if (char === '_') return '_'; // mantém o sublinhado sem traduzir
            return brailleMap[char] || char; // traduz normalmente
        });
    }
}

export const brailleService = new BrailleService();