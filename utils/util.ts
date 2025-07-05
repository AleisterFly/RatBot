import {List} from "immutable";

export function formatInColumns(items: List<string>, columns: number): string {
    const rows = Math.ceil(items.size / columns);
    let output = "";
    for (let row = 0; row < rows; row++) {
        let line = "";
        for (let col = 0; col < columns; col++) {
            const index = col * rows + row;
            const value = items.get(index) || "";
            line += value.padEnd(20);
        }
        output += line.trimEnd() + "\n";
    }
    return output;
}

export function chunk<T>(arr: T[], size: number): T[][] {
    const result: T[][] = [];
    for (let i = 0; i < arr.length; i += size) {
        result.push(arr.slice(i, i + size));
    }
    return result;
}

export function isSpecialNickname(nickname: string): boolean {
    return nickname == "_СУПЕР АДМИН" || nickname == "_АДМИН" || nickname == "_КРЫСА" || nickname == "_ЗРИТЕЛЬ";
}