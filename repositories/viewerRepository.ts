import {Viewer} from "../models/viewer";
import {List} from "immutable";

export interface IViewerRepository {
    createViewer(nickname: string): void;

    getByNickname(nickname: string): Viewer | undefined;
    getAllNicknames(): List<string>;

    addVoteToSeria(nickname: string, seriaId: string, voteNicknames: List<string>): void;

    removeVoteToSeria(nickname: string, seriaId: string, voteNicknames: List<string>): void;
}

export class LocalViewerRepository implements IViewerRepository {
    private readonly viewers: Map<string, Viewer> = new Map();

    createViewer(nickname: string): void {
        const viewer = Viewer.createViewer(nickname);
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