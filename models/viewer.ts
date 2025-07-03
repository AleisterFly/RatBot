import {List} from "immutable";

export class Viewer {
    nickname: string;
    telegramName: string;
    firstName: string;
    lastName: string;
    chatId: number;

    seriaVoting: Map<string, List<string>>;
    tourVoting: Map<string, List<string>>;

    constructor(nickname = "", chatId = -1, telegramName = "", firstName = "", lastName = "") {
        this.nickname = nickname;
        this.chatId = chatId;
        this.telegramName = telegramName;
        this.firstName = firstName;
        this.lastName = lastName;
        this.seriaVoting = new Map<string, List<string>>();
        this.tourVoting = new Map<string, List<string>>();
    }

    static createViewer(nickname: string, chatId: number, telegramName: string, firstName: string, lastName: string): Viewer {
        return new Viewer(nickname, chatId, telegramName, firstName, lastName);
    }
}