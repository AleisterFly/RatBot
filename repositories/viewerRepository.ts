import {Viewer} from "../models/viewer";
import {List} from "immutable";
import { viewerDB } from "../di/ratProvider";

export interface IViewerRepository {
    updateViewer(viewer: Viewer): void;

    createViewer(nickname: string): void;

    getByNickname(nickname: string): Viewer | undefined;
    getAllNicknames(): List<string>;

    addVoteToSeria(nickname: string, seriaDate: string, voteNicknames: List<string>): void;

    removeVoteToSeria(nickname: string, seriaDate: string): void;
}

export class DBViewerRepository implements IViewerRepository {

    updateViewer(viewer: Viewer): void {
        viewerDB.updateViewer(viewer);
    }

    createViewer(nickname: string): void {
        const viewer = Viewer.createViewer(nickname);
        viewerDB.addViewer(viewer.nickname);
    }

    getByNickname(nickname: string): Viewer | undefined {
        return viewerDB.getViewer(nickname);
    }

    getAllNicknames(): List<string> {
        return viewerDB.getAllNicknames();
    }

    addVoteToSeria(nickname: string, seriaDate: string, voteNicknames: List<string>): void {
        const viewer = this.getByNickname(nickname);
        if (viewer) {
            viewer.seriaVoting = viewer.seriaVoting.set(seriaDate, voteNicknames);
            this.updateViewer(viewer);
        }
    }

    removeVoteToSeria(nickname: string, seriaDate: string): void {
        const viewer = this.getByNickname(nickname);
        if (viewer) {
            viewer.seriaVoting = viewer.seriaVoting.delete(seriaDate);
            this.updateViewer(viewer);
        }
    }
}