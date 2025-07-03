import {Viewer} from "../models/viewer";
import {List} from "immutable";
import {dbManager} from "../di/ratProvider";

export interface IViewerRepository {
    createViewer(nickname: string, chatId: number, telegramName: string, firstName: string, lastName: string): void;

    getByNickname(nickname: string): Viewer | undefined;
    getAllNicknames(): List<string>;

    addVoteToSeria(nickname: string, seriaId: string, voteNicknames: List<string>): void;

    removeVoteToSeria(nickname: string, seriaId: string, voteNicknames: List<string>): void;
}

export class LocalViewerRepository implements IViewerRepository {
    private readonly viewers: Map<string, Viewer> = new Map();

    createViewer(nickname: string, chatId: number, telegramName: string, firstName: string, lastName: string): void {
        const viewer = Viewer.createViewer(nickname, chatId, telegramName, firstName, lastName);
        dbManager.addViewer(viewer);
        this.viewers.set(nickname, viewer);
    }

    getByNickname(nickname: string): Viewer | undefined {
        return this.viewers.get(nickname);
    }

    getAllNicknames(): List<string> {
        return List(Array.from(this.viewers.keys()));
    }

    addVoteToSeria(nickname: string, seriaId: string, voteNicknames: List<string>): void {
        const viewer = this.viewers.get(nickname);
        if (viewer) {
            viewer.seriaVoting.set(seriaId, voteNicknames);
        }
    }

    removeVoteToSeria(nickname: string, seriaId: string, voteNicknames: List<string>): void {
        const viewer = this.viewers.get(nickname);
        if (viewer) {
            viewer.seriaVoting.delete(seriaId);
        }
    }
}